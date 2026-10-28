package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

type CozinhaItem struct {
	CodIBGE                 int     `json:"cod_ibge"`
	CodServico              int     `json:"cod_servico"`
	NomeEquipamento         string  `json:"nome_equipamento"`
	StatusFuncionamento     string  `json:"status_funcionamento"`
	Endereco                string  `json:"endereco"`
	Municipio               string  `json:"municipio"`
	RegiaoDesenvolvimento   string  `json:"regiao_de_desenvolvimento"`
	Lat                     float64 `json:"lat"`
	Long                    float64 `json:"long"`
	CoordValidaMunicipio    bool    `json:"coord_valida_municipio"`
}

type CozinhasKPIs struct {
	Total               int `json:"total"`
	Funcionamento       int `json:"funcionamento"`
	Implantacao         int `json:"implantacao"`
	Pactuacao           int `json:"pactuacao"`
	NaoAderiu           int `json:"nao_aderiu"`
	MunicipiosCobertos  int `json:"municipios_cobertos"`
}

type MaeItem struct {
	IBGE7                 string  `json:"ibge7"`
	Municipio             string  `json:"municipio"`
	QtdBeneficiariasTotal int     `json:"qtd_beneficiarias_total"`
	ValorTotal            float64 `json:"valor_total"`
	QtdBeneficiariasPagas int     `json:"qtd_beneficiarias_pagas"`
	ValorPago             float64 `json:"valor_pago"`
}

type MaesKPIs struct {
	TotalBeneficiarias int     `json:"total_beneficiarias"`
	TotalInvestido     float64 `json:"total_investido"`
	TotalMunicipios    int     `json:"total_municipios"`
}

type CozinhasResponse struct {
	Cozinhas         []CozinhaItem   `json:"cozinhas"`
	KPIs             CozinhasKPIs    `json:"kpis"`
	Maes             []MaeItem       `json:"maes"`
	KPIsMaes         MaesKPIs        `json:"kpis_maes"`
	GeoJSONMun       json.RawMessage `json:"geojson_municipios,omitempty"`
}

var (
	cozinhasCacheOnce sync.Once
	cozinhasPayload   []byte
	cozinhasErr       error
)

// GetCozinhasResumo entrega os dados consolidados do programa Pernambuco sem Fome (Cozinhas Comunitárias & Mães de Pernambuco)
func GetCozinhasResumo(c *gin.Context) {
	cozinhasCacheOnce.Do(func() {
		log.Println("⚡ [Pernambuco sem Fome] Carregando bases de cozinhas comunitárias e Mães de PE em memória...")

		// 1. Carrega cozinhas
		rawCozinhas, err := readFileFromPaths(
			"data/df_cozinhas.json",
			"app_aurora_municipios/data/df_cozinhas.json",
			"C:/dados/aurora/df_cozinhas.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar df_cozinhas.json: %v", err)
			cozinhasErr = err
			return
		}

		var cozinhas []CozinhaItem
		if err := json.Unmarshal(rawCozinhas, &cozinhas); err != nil {
			log.Printf("⚠️ Erro ao decodificar df_cozinhas.json: %v", err)
			cozinhasErr = err
			return
		}

		// Calcula os KPIs de cozinhas
		kpis := CozinhasKPIs{
			Total: len(cozinhas),
		}

		munsMap := make(map[string]bool)
		for _, item := range cozinhas {
			if item.Municipio != "" {
				munsMap[item.Municipio] = true
			}

			s := item.StatusFuncionamento
			if strings.Contains(s, "Funcionamento") {
				kpis.Funcionamento++
			} else if strings.Contains(s, "Implanta") {
				kpis.Implantacao++
			} else if strings.Contains(s, "Pactua") {
				kpis.Pactuacao++
			} else if strings.Contains(s, "aderiu") {
				kpis.NaoAderiu++
			}
		}
		kpis.MunicipiosCobertos = len(munsMap)

		// 2. Carrega Mães de Pernambuco
		var maes []MaeItem
		rawMaes, errMaes := readFileFromPaths(
			"data/df_maes.json",
			"app_aurora_municipios/data/df_maes.json",
			"C:/dados/aurora/df_maes.json",
		)
		kpisMaes := MaesKPIs{}
		if errMaes == nil {
			if err := json.Unmarshal(rawMaes, &maes); err == nil {
				kpisMaes.TotalMunicipios = len(maes)
				for _, m := range maes {
					kpisMaes.TotalBeneficiarias += m.QtdBeneficiariasTotal
					kpisMaes.TotalInvestido += m.ValorTotal
				}
				log.Printf("✅ [Pernambuco sem Fome] %d municípios carregados para Mães de PE (%d beneficiárias).", len(maes), kpisMaes.TotalBeneficiarias)
			} else {
				log.Printf("⚠️ Erro ao decodificar df_maes.json: %v", err)
			}
		} else {
			log.Printf("⚠️ Aviso: df_maes.json não encontrado: %v", errMaes)
		}

		// 3. Carrega GeoJSON dos municípios de PE
		var rawGeo json.RawMessage
		rawGeoBytes, errGeo := readFileFromPaths(
			"data/geojson/pernambuco_municipios.geojson",
			"geojson/pernambuco_municipios.geojson",
			"app_aurora_municipios/data/geojson/pernambuco_municipios.geojson",
			"C:/dados/aurora/geojson/pernambuco_municipios.geojson",
		)
		if errGeo == nil {
			rawGeo = json.RawMessage(rawGeoBytes)
			log.Printf("✅ [Pernambuco sem Fome] GeoJSON de municípios carregado (%d bytes).", len(rawGeoBytes))
		} else {
			log.Printf("⚠️ Aviso: GeoJSON pernambuco_municipios.geojson não encontrado: %v", errGeo)
		}

		resp := CozinhasResponse{
			Cozinhas:   cozinhas,
			KPIs:       kpis,
			Maes:       maes,
			KPIsMaes:   kpisMaes,
			GeoJSONMun: rawGeo,
		}

		cozinhasPayload, cozinhasErr = json.Marshal(resp)
		if cozinhasErr != nil {
			log.Printf("⚠️ Erro ao serializar dados de Cozinhas & Mães: %v", cozinhasErr)
		} else {
			log.Printf("✅ [Pernambuco sem Fome] Dados consolidados com sucesso! (%d cozinhas, %d mães)", len(cozinhas), kpisMaes.TotalBeneficiarias)
		}
	})

	if cozinhasErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados de Cozinhas Comunitárias e Mães de PE",
			"details": cozinhasErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", cozinhasPayload)
}

// Ensure os import is used if necessary
var _ = os.PathSeparator
