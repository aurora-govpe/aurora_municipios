package handlers

import (
	"encoding/json"
	//"fmt"
	"log"
	"net/http"
	//"strconv"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

// ItemObra mapeia os 39 campos de df_obras.json
type ItemObra struct {
	IBGE7                     interface{} `json:"ibge7"`
	UID                       string      `json:"uid"`
	UIDDiretoria              string      `json:"uid_diretoria"`
	EixoEstrategico           string      `json:"eixo_estrategico"`
	IniciativaEstrategica     string      `json:"iniciativa_estrategica"`
	IniciativaResumida        string      `json:"iniciativa_resumida"`
	Produto                   string      `json:"produto"`
	Status                    string      `json:"status"`
	DataDeInicio              string      `json:"data_de_inicio"`
	DataDeTermino             string      `json:"data_de_termino"`
	PercentExecucaoFisica     FlexNumber  `json:"percent_execucao_fisica"`
	PercentExecucaoFinanceira FlexNumber  `json:"percent_execucao_financeira"`
	ValorTotal                FlexNumber  `json:"valor_total"`
	Municipio                 string      `json:"municipio"`
	Latitude                  FlexNumber  `json:"latitude"`
	Longitude                 FlexNumber  `json:"longitude"`
	Observacoes               string      `json:"observacoes"`
	EnderecoTarget            string      `json:"endereco_target"`
	Regiao                    string      `json:"regiao"`
	NumeroDoContrato          string      `json:"numero_do_contrato"`
	Empresa                   string      `json:"empresa"`
	Diretoria                 string      `json:"diretoria"`
	Autoria                   string      `json:"autoria"`
	PrazoDeExecucaoContratual string      `json:"prazo_de_execucao_contratual"`
	DataPublicacaoLicitacao   string      `json:"data_publicacao_licitacao"`
	DataAberturaLicitacao     string      `json:"data_abertura_licitacao"`
	RegimeLicitacao           string      `json:"regime_licitacao"`
	ComissaoLicitacao         string      `json:"comissao_licitacao"`
	SEI                       string      `json:"sei"`
	Diretor                   string      `json:"diretor"`
	UnidadesDisponibilizadas  FlexNumber  `json:"unidades_disponibilizadas_uh"`
	ExtensaoM                 FlexNumber  `json:"extensao_m"`
	Tipologia                 string      `json:"tipologia"`
	EfetivoContratado         FlexNumber  `json:"efetivo_contratado"`
	FamiliasBeneficiadas      FlexNumber  `json:"familias_beneficiadas"`
	Secretaria                string      `json:"secretaria"`
	Fonte                     string      `json:"fonte"`
	SecretariaUnidade         string      `json:"secretaria_unidade"`
	PercentExecucao           FlexNumber  `json:"percent_execucao"`
}

type ObrasKPIs struct {
	TotalObras         int     `json:"total_obras"`
	EmExecucao         int     `json:"em_execucao"`
	Concluidas         int     `json:"concluidas"`
	InvestimentoTotal  float64 `json:"investimento_total"`
	MediaExecFisica    float64 `json:"media_exec_fisica"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
	TotalEfetivo       int     `json:"total_efetivo"`
}

type ObrasResponse struct {
	Obras      []ItemObra  `json:"obras"`
	KPIs       ObrasKPIs   `json:"kpis"`
	Municipios []string    `json:"municipios"`
	Diretorias []string    `json:"diretorias"`
	GeoJSON    interface{} `json:"geojson"`
}

var (
	obrasCacheOnce sync.Once
	obrasPayload   []byte
	obrasErr       error
)

func GetObrasResumo(c *gin.Context) {
	obrasCacheOnce.Do(func() {
		log.Println("⚡ [Obras] Carregando df_obras.json em memória...")

		rawObras, err := readFileFromPaths(
			"data/json/df_obras.json",
			"app_aurora_municipios/data/json/df_obras.json",
			"C:/dados/aurora/json/df_obras.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar df_obras.json: %v", err)
			obrasErr = err
			return
		}

		var itens []ItemObra
		if err := json.Unmarshal(rawObras, &itens); err != nil {
			log.Printf("⚠️ Erro ao decodificar df_obras.json: %v", err)
			obrasErr = err
			return
		}

		// GeoJSON dos municípios (reaproveita a mesma base)
		rawGeo, _ := readFileFromPaths(
			"data/geojson/pernambuco_municipios.geojson",
			"app_aurora_municipios/data/geojson/pernambuco_municipios.geojson",
			"C:/dados/aurora/geojson/pernambuco_municipios.geojson",
		)
		var geojsonParsed interface{}
		if len(rawGeo) > 0 {
			_ = json.Unmarshal(rawGeo, &geojsonParsed)
		}

		kpis := ObrasKPIs{TotalObras: len(itens)}
		munsMap := make(map[string]bool)
		diretoriasMap := make(map[string]bool)
		var somaExecFisica float64

		for i := range itens {
			vTot := float64(itens[i].ValorTotal)
			kpis.InvestimentoTotal += vTot
			kpis.TotalEfetivo += int(itens[i].EfetivoContratado)

			execFis := float64(itens[i].PercentExecucaoFisica)
			if execFis == 0 && itens[i].PercentExecucao > 0 {
				execFis = float64(itens[i].PercentExecucao)
				itens[i].PercentExecucaoFisica = itens[i].PercentExecucao
			}
			if execFis <= 1.0 && execFis > 0 {
				execFis *= 100.0
			}
			somaExecFisica += execFis

			munNorm := strings.ToUpper(strings.TrimSpace(itens[i].Municipio))
			if munNorm != "" && munNorm != "-" && munNorm != "NA" {
				munsMap[munNorm] = true
			}

			dirNorm := strings.ToUpper(strings.TrimSpace(itens[i].Diretoria))
			if dirNorm != "" && dirNorm != "-" && dirNorm != "NA" {
				diretoriasMap[dirNorm] = true
			}

			st := strings.ToUpper(strings.TrimSpace(itens[i].Status))
			if strings.Contains(st, "EXECU") || strings.Contains(st, "ANDAMENTO") {
				kpis.EmExecucao++
			} else if strings.Contains(st, "CONCLU") || strings.Contains(st, "FINALIZ") || strings.Contains(st, "ENTREG") {
				kpis.Concluidas++
			}
		}

		if kpis.TotalObras > 0 {
			kpis.MediaExecFisica = somaExecFisica / float64(kpis.TotalObras)
		}
		kpis.MunicipiosCobertos = len(munsMap)

		var munsList, dirsList []string
		for m := range munsMap {
			munsList = append(munsList, m)
		}
		for d := range diretoriasMap {
			dirsList = append(dirsList, d)
		}

		resp := ObrasResponse{
			Obras:      itens,
			KPIs:       kpis,
			Municipios: munsList,
			Diretorias: dirsList,
			GeoJSON:    geojsonParsed,
		}

		obrasPayload, obrasErr = json.Marshal(resp)
	})

	if obrasErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados de Obras",
			"details": obrasErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", obrasPayload)
}