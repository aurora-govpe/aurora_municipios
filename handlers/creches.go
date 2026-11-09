package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

type CrechesKPIs struct {
	TotalCreches       int     `json:"total_creches"`
	EmExecucao         int     `json:"em_execucao"`
	Concluidas         int     `json:"concluidas"`
	AIniciar           int     `json:"a_iniciar"`
	Paralisadas        int     `json:"paralisadas"`
	InvestimentoTotal  float64 `json:"investimento_total"`
	MediaExecFisica    float64 `json:"media_exec_fisica"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
	TotalVagasUH       int     `json:"total_vagas_uh"`
}

type CrechesResponse struct {
	Creches    []ItemObra  `json:"creches"`
	KPIs       CrechesKPIs `json:"kpis"`
	Municipios []string    `json:"municipios"`
	GeoJSON    interface{} `json:"geojson"`
}

var (
	crechesCacheOnce sync.Once
	crechesPayload   []byte
	crechesErr       error
)

// GetCrechesResumo processa e entrega os dados das obras do programa de creches e pré-escola
func GetCrechesResumo(c *gin.Context) {
	crechesCacheOnce.Do(func() {
		log.Println("⚡ [Creches] Carregando df_obras.json filtrado para Creches e Pré-Escola...")

		rawObras, err := readFileFromPaths(
			"data/json/df_obras.json",
			"app_aurora_municipios/data/json/df_obras.json",
			"C:/dados/aurora/json/df_obras.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar df_obras.json: %v", err)
			crechesErr = err
			return
		}

		var todasObras []ItemObra
		if err := json.Unmarshal(rawObras, &todasObras); err != nil {
			log.Printf("⚠️ Erro ao decodificar df_obras.json para creches: %v", err)
			crechesErr = err
			return
		}

      // Filtrar apenas iniciativa estratégica de Creches e Pré-escola
      var itens []ItemObra
      for _, o := range todasObras {
      	iniNorm := strings.ToUpper(strings.TrimSpace(o.IniciativaEstrategica))
      	if iniNorm == "CRIAÇÃO DE 60 MIL VAGAS EM CRECHES E PRÉ-ESCOLA" ||
      		strings.Contains(iniNorm, "60 MIL VAGAS EM CRECHES") ||
      		strings.Contains(iniNorm, "CRECHES E PRÉ-ESCOLA") {
      		itens = append(itens, o)
      	}
      }

		// GeoJSON dos municípios de PE
		rawGeo, _ := readFileFromPaths(
			"data/geojson/pernambuco_municipios.geojson",
			"app_aurora_municipios/data/geojson/pernambuco_municipios.geojson",
			"C:/dados/aurora/geojson/pernambuco_municipios.geojson",
		)
		var geojsonParsed interface{}
		if len(rawGeo) > 0 {
			_ = json.Unmarshal(rawGeo, &geojsonParsed)
		}

		kpis := CrechesKPIs{TotalCreches: len(itens)}
		munsMap := make(map[string]bool)
		var somaExecFisica float64

		for i := range itens {
			vTot := float64(itens[i].ValorTotal)
			kpis.InvestimentoTotal += vTot
			kpis.TotalVagasUH += int(itens[i].UnidadesDisponibilizadas)

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

			st := strings.ToUpper(strings.TrimSpace(itens[i].Status))
			if strings.Contains(st, "EXECU") || strings.Contains(st, "ANDAMENTO") {
				kpis.EmExecucao++
			} else if strings.Contains(st, "CONCLU") || strings.Contains(st, "FINALIZ") || strings.Contains(st, "ENTREG") {
				kpis.Concluidas++
			} else if strings.Contains(st, "INICIAR") || strings.Contains(st, "LICIT") {
				kpis.AIniciar++
			} else if strings.Contains(st, "PARALIS") {
				kpis.Paralisadas++
			}
		}

		if kpis.TotalCreches > 0 {
			kpis.MediaExecFisica = somaExecFisica / float64(kpis.TotalCreches)
		}
		kpis.MunicipiosCobertos = len(munsMap)

		var munsList []string
		for m := range munsMap {
			munsList = append(munsList, m)
		}

		resp := CrechesResponse{
			Creches:    itens,
			KPIs:       kpis,
			Municipios: munsList,
			GeoJSON:    geojsonParsed,
		}

		log.Printf("✅ [Creches] %d creches carregadas em %d municípios (R$ %.2f investidos)",
			kpis.TotalCreches, kpis.MunicipiosCobertos, kpis.InvestimentoTotal)

		crechesPayload, crechesErr = json.Marshal(resp)
	})

	if crechesErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados de Creches",
			"details": crechesErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", crechesPayload)
}
