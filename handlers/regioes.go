package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	cacheRegioesMutex sync.RWMutex
	cacheRegioesData  = make(map[string]gin.H)

	consorciosPEOnce sync.Once
	consorciosPEList []ConsorcioItem
)

type ConsorcioItem struct {
	Consorcio            string `json:"consorcio"`
	SiglaConsorcio       string `json:"sigla_consorcio"`
	MunicipioConsorciado string `json:"municipio_consorciado"`
	CodMunicipioIBGE     int64  `json:"cod_municipio_ibge"`
	Descricao            string `json:"descricao"`
}

type RegioesDataRequest struct {
	RD        string `json:"rd"`
	Tipo      string `json:"tipo"`      // "rd" ou "consorcio"
	Consorcio string `json:"consorcio"` // nome do consórcio
}

var RegioesPadraoPE = []string{
	"Agreste Central",
	"Agreste Meridional",
	"Agreste Setentrional",
	"Araripe",
	"Itaparica",
	"Mata Norte",
	"Mata Sul",
	"Metropolitana",
	"Pajeú",
	"Sertão Central",
	"Sertão do Moxotó",
	"Sertão do São Francisco",
}

func carregarConsorciosPE() []ConsorcioItem {
	consorciosPEOnce.Do(func() {
		raw, err := readFileFromPaths(
			"data/consorcios_pe.json",
			"app_aurora_municipios/data/consorcios_pe.json",
		)
		if err == nil {
			_ = json.Unmarshal(raw, &consorciosPEList)
		} else {
			log.Printf("⚠️ Erro ao carregar consorcios_pe.json: %v", err)
		}
	})
	return consorciosPEList
}

// GetRegioesFiltros retorna a lista de Regiões de Desenvolvimento (RD) e Consórcios Intermunicipais
func GetRegioesFiltros(c *gin.Context) {
	rows, err := DuckDB.Query("SELECT DISTINCT regiao_de_desenvolvimento FROM v_demografia WHERE regiao_de_desenvolvimento IS NOT NULL AND regiao_de_desenvolvimento != '' ORDER BY regiao_de_desenvolvimento ASC")
	var rds []string
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var r string
			if err := rows.Scan(&r); err == nil && r != "" {
				rds = append(rds, r)
			}
		}
	}
	if len(rds) == 0 {
		rds = RegioesPadraoPE
	}

	// Consórcios únicos
	consorciosData := carregarConsorciosPE()
	consorciosMap := make(map[string]bool)
	var consorciosLista []string
	for _, it := range consorciosData {
		nome := strings.TrimSpace(it.Consorcio)
		if nome != "" && !consorciosMap[nome] {
			consorciosMap[nome] = true
			consorciosLista = append(consorciosLista, nome)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"regioes":    rds,
		"consorcios": consorciosLista,
	})
}

// PostRegioesData retorna os dados agregados por Região de Desenvolvimento (RD) ou por Consórcio
func PostRegioesData(c *gin.Context) {
	var req RegioesDataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.RD = "Agreste Central"
	}

	isConsorcio := strings.ToLower(strings.TrimSpace(req.Tipo)) == "consorcio"
	nomeAgrupamento := strings.TrimSpace(req.RD)
	if isConsorcio && strings.TrimSpace(req.Consorcio) != "" {
		nomeAgrupamento = strings.TrimSpace(req.Consorcio)
	}
	if nomeAgrupamento == "" {
		if isConsorcio {
			nomeAgrupamento = "CONIAPE – Consórcio Público Intermunicipal do Agreste Pernambucano e Fronteiras"
		} else {
			nomeAgrupamento = "Agreste Central"
		}
	}

	cacheKey := fmt.Sprintf("%s:%s", req.Tipo, nomeAgrupamento)
	log.Printf("[Regiões] Solicitado tipo='%s', agrupamento='%s'", req.Tipo, nomeAgrupamento)

	// Verifica cache em memória
	cacheRegioesMutex.RLock()
	if cached, ok := cacheRegioesData[cacheKey]; ok {
		cacheRegioesMutex.RUnlock()
		c.JSON(http.StatusOK, cached)
		return
	}
	cacheRegioesMutex.RUnlock()

	var munsRDIbge6 []string
	var featuresRD []string

	// Helper para IN clause
	makePlaceholders := func(n int) string {
		if n <= 0 {
			return "''"
		}
		ph := make([]string, n)
		for i := 0; i < n; i++ {
			ph[i] = "?"
		}
		return strings.Join(ph, ", ")
	}

	makeArgs := func(list []string) []interface{} {
		args := make([]interface{}, len(list))
		for i, v := range list {
			args[i] = v
		}
		return args
	}

	if isConsorcio {
		// Busca municípios consorciados
		consorciosData := carregarConsorciosPE()
		var ibgesConsorcio []string
		for _, it := range consorciosData {
			if strings.EqualFold(it.Consorcio, nomeAgrupamento) ||
				(it.SiglaConsorcio != "" && strings.EqualFold(it.SiglaConsorcio, nomeAgrupamento)) ||
				strings.Contains(strings.ToLower(it.Consorcio), strings.ToLower(nomeAgrupamento)) {
				ibgeStr := fmt.Sprintf("%d", it.CodMunicipioIBGE)
				if len(ibgeStr) >= 6 {
					ibgesConsorcio = append(ibgesConsorcio, ibgeStr[:6])
				}
			}
		}

		if len(ibgesConsorcio) > 0 {
			queryMun := fmt.Sprintf(`
				SELECT ibge6_clean, COALESCE(geojson_feature, '')
				FROM v_demografia
				WHERE ibge6_clean IN (%s)
			`, makePlaceholders(len(ibgesConsorcio)))

			rowsRD, err := DuckDB.Query(queryMun, makeArgs(ibgesConsorcio)...)
			if err == nil {
				for rowsRD.Next() {
					var ibge, feat string
					if err := rowsRD.Scan(&ibge, &feat); err == nil {
						if ibge != "" {
							munsRDIbge6 = append(munsRDIbge6, ibge)
						}
						if feat != "" {
							featuresRD = append(featuresRD, feat)
						}
					}
				}
				rowsRD.Close()
			}
		}
	} else {
		// 1. Demografia dos municípios da RD
		rowsRD, err := DuckDB.Query(`
			SELECT ibge6_clean, COALESCE(geojson_feature, '')
			FROM v_demografia
			WHERE regiao_de_desenvolvimento = ?
		`, nomeAgrupamento)

		if err == nil {
			for rowsRD.Next() {
				var ibge, feat string
				if err := rowsRD.Scan(&ibge, &feat); err == nil {
					if ibge != "" {
						munsRDIbge6 = append(munsRDIbge6, ibge)
					}
					if feat != "" {
						featuresRD = append(featuresRD, feat)
					}
				}
			}
			rowsRD.Close()
		}
	}

	// Fallback para Agreste Central se não encontrou municípios
	if len(munsRDIbge6) == 0 {
		log.Printf("[Regiões] Agrupamento '%s' não encontrado. Aplicando fallback 'Agreste Central'", nomeAgrupamento)
		nomeAgrupamento = "Agreste Central"
		isConsorcio = false
		rowsFallback, err := DuckDB.Query(`
			SELECT ibge6_clean, COALESCE(geojson_feature, '')
			FROM v_demografia
			WHERE regiao_de_desenvolvimento = 'Agreste Central'
		`)
		if err == nil {
			for rowsFallback.Next() {
				var ibge, feat string
				if err := rowsFallback.Scan(&ibge, &feat); err == nil {
					if ibge != "" {
						munsRDIbge6 = append(munsRDIbge6, ibge)
					}
					if feat != "" {
						featuresRD = append(featuresRD, feat)
					}
				}
			}
			rowsFallback.Close()
		}
	}

	// Montagem do GeoJSON local da Região / Consórcio
	var geoJSONRD interface{} = nil
	if len(featuresRD) > 0 {
		fcRD := fmt.Sprintf(`{"type":"FeatureCollection","features":[%s]}`, strings.Join(featuresRD, ","))
		geoJSONRD = json.RawMessage(fcRD)
	}

	// Demografia da RD / Consórcio em tabela limpa com CAPAG anexada
	var dfDemoRD []map[string]string
	if len(munsRDIbge6) > 0 {
		queryDemo := fmt.Sprintf(`
			SELECT d.* EXCLUDE (geojson_feature, ibge6_clean),
			       COALESCE(c.indicador, 'n.d.') AS capag
			FROM v_demografia d
			LEFT JOIN (
				SELECT ibge6_clean, indicador 
				FROM v_indicadores 
				WHERE LOWER(nm_indicador) = 'capag' OR LOWER(sigla_indicador) = 'capag'
			) c ON d.ibge6_clean = c.ibge6_clean
			WHERE d.ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfDemoRD, _ = QueryToMaps(DuckDB, queryDemo, makeArgs(munsRDIbge6)...)
	}

	// 2. Indicadores Sociais da RD
	dfIndRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryInd := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_indicadores
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfIndRD, _ = QueryToMaps(DuckDB, queryInd, makeArgs(munsRDIbge6)...)
	}

	// 3. Iniciativas da RD
	dfIniRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryIni := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_iniciativas
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfIniRD, _ = QueryToMaps(DuckDB, queryIni, makeArgs(munsRDIbge6)...)
	}

	// 4. Emendas da RD
	dfEmeRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryEme := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_emendas
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfEmeRD, _ = QueryToMaps(DuckDB, queryEme, makeArgs(munsRDIbge6)...)
	}

	// 5. Dados Fiscais da RD
	dfFiscRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryFisc := fmt.Sprintf(`
			SELECT f.* EXCLUDE (ibge6_clean), COALESCE(d.municipio, '') AS municipio
			FROM v_fiscais f
			LEFT JOIN (SELECT DISTINCT ibge6_clean, municipio FROM v_demografia) d ON f.ibge6_clean = d.ibge6_clean
			WHERE f.ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfFiscRD, _ = QueryToMaps(DuckDB, queryFisc, makeArgs(munsRDIbge6)...)
	}

	// 6. Chapéu de Palha (PCP) da RD
	dfPcpRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryPcp := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_pcp
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfPcpRD, _ = QueryToMaps(DuckDB, queryPcp, makeArgs(munsRDIbge6)...)
	}

	result := gin.H{
		"rd":             nomeAgrupamento,
		"tipo":           req.Tipo,
		"is_consorcio":   isConsorcio,
		"consorcio":      nomeAgrupamento,
		"demografia_rd":  dfDemoRD,
		"indicadores_rd": dfIndRD,
		"iniciativas_rd": dfIniRD,
		"emendas_rd":     dfEmeRD,
		"fiscais_rd":     dfFiscRD,
		"pcp_rd":         dfPcpRD,
		"regic_rd":       DfRegicPE,
		"fluxos_pe":      DfFluxosPE,
		"geojson_rd":     geoJSONRD,
		"geojson_pe":     GeoJSONPE,
	}

	cacheRegioesMutex.Lock()
	cacheRegioesData[cacheKey] = result
	cacheRegioesMutex.Unlock()

	c.JSON(http.StatusOK, result)
}
