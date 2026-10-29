package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
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

type RawCofinItem struct {
	AnoCompetencia int     `json:"ano_competencia"`
	Municipio      string  `json:"municipio"`
	Esfera         string  `json:"esfera"`
	TipoExecucao   string  `json:"tipo_execucao"`
	TipoRecurso    string  `json:"tipo_recurso"`
	ValorValidado  float64 `json:"valor_validado"`
	ValorPago      float64 `json:"valor_pago"`
	ValorAPagar    float64 `json:"valor_a_pagar"`
	PercentualPago float64 `json:"percentual_pago"`
	ParcelasPagas  int     `json:"parcelas_pagas"`
}

type CofinanciamentoKPIs struct {
	TotalValidado   float64 `json:"total_validado"`
	TotalPago       float64 `json:"total_pago"`
	TotalAPagar     float64 `json:"total_a_pagar"`
	PercentualPago  float64 `json:"percentual_pago"`
	TotalMunicipios int     `json:"total_municipios"`
}

type CofinanciamentoAno struct {
	Ano           int     `json:"ano"`
	ValorValidado float64 `json:"valor_validado"`
	ValorPago     float64 `json:"valor_pago"`
}

type CofinanciamentoMun struct {
	Municipio      string  `json:"municipio"`
	ValorValidado  float64 `json:"valor_validado"`
	ValorPago      float64 `json:"valor_pago"`
	ValorAPagar    float64 `json:"valor_a_pagar"`
	PercentualPago float64 `json:"percentual_pago"`
}

type CozinhasResponse struct {
	Cozinhas         []CozinhaItem        `json:"cozinhas"`
	KPIs             CozinhasKPIs         `json:"kpis"`
	Maes             []MaeItem            `json:"maes"`
	KPIsMaes         MaesKPIs             `json:"kpis_maes"`
	KPIsCofin        CofinanciamentoKPIs  `json:"kpis_cofinanciamento"`
	CofinAnos        []CofinanciamentoAno `json:"cofinanciamento_anos"`
	CofinMuns        []CofinanciamentoMun `json:"cofinanciamento_muns"`
	GeoJSONMun       json.RawMessage      `json:"geojson_municipios,omitempty"`
}

var (
	cozinhasCacheOnce sync.Once
	cozinhasPayload   []byte
	cozinhasErr       error
)

// GetCozinhasResumo entrega os dados consolidados do programa Pernambuco sem Fome (Cozinhas Comunitárias, Mães de PE e Cofinanciamento)
func GetCozinhasResumo(c *gin.Context) {
	cozinhasCacheOnce.Do(func() {
		log.Println("⚡ [Pernambuco sem Fome] Carregando bases de Cozinhas, Mães de PE e Cofinanciamento em memória...")

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

		// 3. Carrega Cofinanciamento da Assistência Social
		var rawCofinList []RawCofinItem
		rawCofin, errCofin := readFileFromPaths(
			"data/ppcof_co_financiamento.json",
			"app_aurora_municipios/data/ppcof_co_financiamento.json",
			"C:/dados/aurora/ppcof_co_financiamento.json",
		)
		kpisCofin := CofinanciamentoKPIs{}
		var cofinAnos []CofinanciamentoAno
		var cofinMuns []CofinanciamentoMun

		if errCofin == nil {
			if err := json.Unmarshal(rawCofin, &rawCofinList); err == nil {
				anosMap := make(map[int]*CofinanciamentoAno)
				munsCofinMap := make(map[string]*CofinanciamentoMun)

				for _, item := range rawCofinList {
					kpisCofin.TotalValidado += item.ValorValidado
					kpisCofin.TotalPago += item.ValorPago
					kpisCofin.TotalAPagar += item.ValorAPagar

					// Agrupamento por Ano
					if item.AnoCompetencia > 0 {
						if _, exists := anosMap[item.AnoCompetencia]; !exists {
							anosMap[item.AnoCompetencia] = &CofinanciamentoAno{Ano: item.AnoCompetencia}
						}
						anosMap[item.AnoCompetencia].ValorValidado += item.ValorValidado
						anosMap[item.AnoCompetencia].ValorPago += item.ValorPago
					}

					// Agrupamento por Município
					munNome := strings.TrimSpace(item.Municipio)
					if munNome != "" {
						if _, exists := munsCofinMap[munNome]; !exists {
							munsCofinMap[munNome] = &CofinanciamentoMun{Municipio: munNome}
						}
						munsCofinMap[munNome].ValorValidado += item.ValorValidado
						munsCofinMap[munNome].ValorPago += item.ValorPago
						munsCofinMap[munNome].ValorAPagar += item.ValorAPagar
					}
				}

				if kpisCofin.TotalValidado > 0 {
					kpisCofin.PercentualPago = (kpisCofin.TotalPago / kpisCofin.TotalValidado) * 100.0
				}
				kpisCofin.TotalMunicipios = len(munsCofinMap)

				// Ordenar anos
				for _, anoObj := range anosMap {
					cofinAnos = append(cofinAnos, *anoObj)
				}
				sort.Slice(cofinAnos, func(i, j int) bool {
					return cofinAnos[i].Ano < cofinAnos[j].Ano
				})

				// Calcular percentual e montar lista de municípios ordenada por valor pago decrescente
				for _, munObj := range munsCofinMap {
					if munObj.ValorValidado > 0 {
						munObj.PercentualPago = (munObj.ValorPago / munObj.ValorValidado) * 100.0
					}
					cofinMuns = append(cofinMuns, *munObj)
				}
				sort.Slice(cofinMuns, func(i, j int) bool {
					return cofinMuns[i].ValorPago > cofinMuns[j].ValorPago
				})

				log.Printf("✅ [Pernambuco sem Fome] Cofinanciamento carregado: R$ %.2f pagos em %d municípios e %d anos.",
					kpisCofin.TotalPago, kpisCofin.TotalMunicipios, len(cofinAnos))
			} else {
				log.Printf("⚠️ Erro ao decodificar ppcof_co_financiamento.json: %v", err)
			}
		} else {
			log.Printf("⚠️ Aviso: ppcof_co_financiamento.json não encontrado: %v", errCofin)
		}

		// 4. Carrega GeoJSON dos municípios de PE
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
			KPIsCofin:  kpisCofin,
			CofinAnos:  cofinAnos,
			CofinMuns:  cofinMuns,
			GeoJSONMun: rawGeo,
		}

		cozinhasPayload, cozinhasErr = json.Marshal(resp)
		if cozinhasErr != nil {
			log.Printf("⚠️ Erro ao serializar dados consolidados: %v", cozinhasErr)
		} else {
			log.Printf("✅ [Pernambuco sem Fome] Dados consolidados com sucesso! (%d cozinhas, %d mães, %d mun cofin)",
				len(cozinhas), kpisMaes.TotalBeneficiarias, len(cofinMuns))
		}
	})

	if cozinhasErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados consolidados do Pernambuco sem Fome",
			"details": cozinhasErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", cozinhasPayload)
}

// Ensure os import is used if necessary
var _ = os.PathSeparator
