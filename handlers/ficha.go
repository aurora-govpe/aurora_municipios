package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type FichaDataRequest struct {
	Municipio string `json:"municipio"`
}

// GetFichaFiltros retorna a lista de municípios para o select
func GetFichaFiltros(c *gin.Context) {
	rows, err := DuckDB.Query("SELECT DISTINCT municipio FROM v_demografia WHERE municipio IS NOT NULL AND municipio != '' ORDER BY municipio ASC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar municípios", "details": err.Error()})
		return
	}
	defer rows.Close()

	var lista []string
	for rows.Next() {
		var m string
		if err := rows.Scan(&m); err == nil && m != "" {
			lista = append(lista, m)
		}
	}

	c.JSON(http.StatusOK, gin.H{"municipios": lista})
}

// GetFichaMetadados retorna o dicionário unificado de metadados a partir do SQLite
func GetFichaMetadados(c *gin.Context) {
	if SQLiteDB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Banco SQLite não disponível"})
		return
	}

	query := `
		SELECT cd_indicador, nm_indicador, subdimensao, natureza, unidade, formula_katex, referencia_analise, escala_municipal 
		FROM metadados
	`
	rows, err := SQLiteDB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar metadados", "details": err.Error()})
		return
	}
	defer rows.Close()

	var metaList []map[string]interface{}
	for rows.Next() {
		var cd, nm, sub, nat, uni, form, ref, esc sql.NullString
		if err := rows.Scan(&cd, &nm, &sub, &nat, &uni, &form, &ref, &esc); err != nil {
			continue
		}

		item := map[string]interface{}{
			"cd_indicador":     cd.String,
			"nm_indicador":     nm.String,
			"subdimensao":      sub.String,
			"natureza":         nat.String,
			"unidade":          uni.String,
			"formula_katex":    form.String,
			"escala_municipal": esc.String,
		}

		if ref.Valid && ref.String != "" && ref.String != "null" && ref.String != "{}" {
			var refObj interface{}
			if err := json.Unmarshal([]byte(ref.String), &refObj); err == nil {
				item["referencia_analise"] = refObj
			} else {
				item["referencia_analise"] = nil
			}
		} else {
			item["referencia_analise"] = nil
		}

		metaList = append(metaList, item)
	}

	c.JSON(http.StatusOK, gin.H{"indicadores_dicionario": metaList})
}

// PostFichaData retorna os dados completos da ficha municipal de um município
func PostFichaData(c *gin.Context) {
	var req FichaDataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Municipio = "Recife"
	}
	if strings.TrimSpace(req.Municipio) == "" {
		req.Municipio = "Recife"
	}

	log.Printf("[Ficha] Solicitado município: '%s'", req.Municipio)

	// 1. Demografia do Município
	var munReal, ibge6, rdTarget, geojsonFeature string
	row := DuckDB.QueryRow(`
		SELECT municipio, ibge6_clean, COALESCE(regiao_de_desenvolvimento, ''), COALESCE(geojson_feature, '')
		FROM v_demografia 
		WHERE LOWER(municipio) = LOWER(?)
		LIMIT 1
	`, req.Municipio)

	err := row.Scan(&munReal, &ibge6, &rdTarget, &geojsonFeature)
	if err != nil {
		// Fallback para Recife
		log.Printf("[Ficha] Município '%s' não encontrado. Aplicando fallback 'Recife'", req.Municipio)
		req.Municipio = "Recife"
		rowRecife := DuckDB.QueryRow(`
			SELECT municipio, ibge6_clean, COALESCE(regiao_de_desenvolvimento, ''), COALESCE(geojson_feature, '')
			FROM v_demografia 
			WHERE LOWER(municipio) = 'recife'
			LIMIT 1
		`)
		_ = rowRecife.Scan(&munReal, &ibge6, &rdTarget, &geojsonFeature)
	}

	// Consulta demografia no formato map[string][]string com CAPAG incorporada
	demoMap, _ := QueryToSingleRowColumns(DuckDB, `
		SELECT d.* EXCLUDE (geojson_feature, ibge6_clean),
		       COALESCE(c.indicador, 'n.d.') AS capag
		FROM v_demografia d
		LEFT JOIN (
			SELECT ibge6_clean, indicador 
			FROM v_indicadores 
			WHERE sigla_indicador = 'capag' OR LOWER(nm_indicador) = 'capag'
		) c ON d.ibge6_clean = c.ibge6_clean
		WHERE LOWER(d.municipio) = LOWER(?)
		LIMIT 1
	`, munReal)

	var geoJSONMun interface{} = nil
	if geojsonFeature != "" {
		geoJSONMun = json.RawMessage(geojsonFeature)
	}

	// 1b. Demografia e GeoJSON da RD
	var geoJSONRD interface{} = nil
	dfDemoRD := make([]map[string]string, 0)
	var munsRDIbge6 []string

	if rdTarget != "" && rdTarget != "-" {
		rowsRD, err := DuckDB.Query(`
			SELECT ibge6_clean, COALESCE(geojson_feature, '')
			FROM v_demografia
			WHERE regiao_de_desenvolvimento = ?
		`, rdTarget)
		if err == nil {
			var featuresRD []string
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

			if len(featuresRD) > 0 {
				fcRD := fmt.Sprintf(`{"type":"FeatureCollection","features":[%s]}`, strings.Join(featuresRD, ","))
				geoJSONRD = json.RawMessage(fcRD)
			}
		}

		dfDemoRD, _ = QueryToMaps(DuckDB, `
			SELECT * EXCLUDE (geojson_feature, ibge6_clean)
			FROM v_demografia
			WHERE regiao_de_desenvolvimento = ?
		`, rdTarget)
	}

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

	// 2. Indicadores Sociais
	dfInd, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_indicadores
		WHERE ibge6_clean = ?
	`, ibge6)

	dfIndRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryIndRD := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_indicadores
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfIndRD, _ = QueryToMaps(DuckDB, queryIndRD, makeArgs(munsRDIbge6)...)
	}

	// 3. Iniciativas
	dfIni, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_iniciativas
		WHERE ibge6_clean = ?
	`, ibge6)

	dfIniRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryIniRD := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_iniciativas
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfIniRD, _ = QueryToMaps(DuckDB, queryIniRD, makeArgs(munsRDIbge6)...)
	}

	// 4. Emendas Parlamentares
	dfEme, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_emendas
		WHERE ibge6_clean = ?
	`, ibge6)

	// 5. Dados Fiscais
	dfFisc, _ := QueryToMaps(DuckDB, `
		SELECT f.* EXCLUDE (ibge6_clean), COALESCE(d.municipio, '') AS municipio
		FROM v_fiscais f
		LEFT JOIN (SELECT DISTINCT ibge6_clean, municipio FROM v_demografia) d ON f.ibge6_clean = d.ibge6_clean
		WHERE f.ibge6_clean = ?
	`, ibge6)

	// 6. Chapéu de Palha (PCP)
	dfPcpMun, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_pcp
		WHERE ibge6_clean = ?
	`, ibge6)

	dfPcpRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		queryPcpRD := fmt.Sprintf(`
			SELECT * EXCLUDE (ibge6_clean) FROM v_pcp
			WHERE ibge6_clean IN (%s)
		`, makePlaceholders(len(munsRDIbge6)))
		dfPcpRD, _ = QueryToMaps(DuckDB, queryPcpRD, makeArgs(munsRDIbge6)...)
	}

	// 7. Vocações Municipais
	dfVocMun, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_vocacoes
		WHERE ibge6_clean = ?
	`, ibge6)

	// 8. Diagnóstico de Desenvolvimento Regional
	var diagMun interface{} = nil
	if DiagnosticoRegional != nil {
		if d, ok := DiagnosticoRegional[strings.ToLower(munReal)]; ok {
			diagMun = d
		}
	}

	// 9. Data de Atualização via arquivo RDS / Parquet
	txtAtualizacao := "Atualizado em: -"
	for _, pPath := range []string{"data/df_pcp.rds", "data/parquet/df_pcp.parquet", "data/parquet/df_indicadores.parquet"} {
		if info, err := os.Stat(pPath); err == nil {
			loc, errLoc := time.LoadLocation("America/Recife")
			tMod := info.ModTime()
			if errLoc == nil {
				tMod = tMod.In(loc)
			}
			txtAtualizacao = fmt.Sprintf("Atualizado em: %s", tMod.Format("02/01/2006 às 15:04"))
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data_atualizacao":  txtAtualizacao,
		"demografia":        demoMap,
		"indicadores":       dfInd,
		"indicadores_rd":    dfIndRD,
		"demografia_rd":     dfDemoRD,
		"iniciativas":       dfIni,
		"iniciativas_rd":    dfIniRD,
		"emendas":           dfEme,
		"fiscais":           dfFisc,
		"pcp":               dfPcpMun,
		"pcp_rd":            dfPcpRD,
		"vocacoes":          dfVocMun,
		"geojson":           geoJSONMun,
		"geojson_rd":        geoJSONRD,
		"diagnostico":       diagMun,
		"fontes_referencia": FontesReferencia,
	})
}

// Aliases para semântica atualizada: Módulo Municípios
var (
	GetMunicipiosFiltros   = GetFichaFiltros
	GetMunicipiosMetadados = GetFichaMetadados
	PostMunicipiosData     = PostFichaData
)

// GetCapagResumo retorna dados consolidados da CAPAG de todos os municípios e GeoJSON de Pernambuco
func GetCapagResumo(c *gin.Context) {
	query := `
		SELECT 
			d.ibge6_clean,
			d.municipio,
			d.regiao_de_desenvolvimento,
			COALESCE(i.indicador, 'n.d.') AS capag,
			COALESCE(i.ano, 2026) AS ano
		FROM v_demografia d
		LEFT JOIN (
			SELECT ibge6_clean, indicador, ano
			FROM v_indicadores
			WHERE LOWER(nm_indicador) = 'capag' OR LOWER(sigla_indicador) = 'capag'
		) i ON d.ibge6_clean = i.ibge6_clean
		ORDER BY d.municipio ASC
	`
	rows, err := DuckDB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar CAPAG estadual", "details": err.Error()})
		return
	}
	defer rows.Close()

	type CapagItem struct {
		Ibge6     string `json:"ibge6"`
		Municipio string `json:"municipio"`
		RD        string `json:"rd"`
		Capag     string `json:"capag"`
		Ano       int    `json:"ano"`
	}

	var lista []CapagItem
	contagens := map[string]int{
		"A": 0, "A+": 0, "B": 0, "B+": 0, "C": 0, "D": 0, "n.d.": 0, "n.e.": 0,
	}
	capagMap := make(map[string]string)

	for rows.Next() {
		var ibge6, mun, rd, capag string
		var ano int
		if err := rows.Scan(&ibge6, &mun, &rd, &capag, &ano); err == nil {
			capag = strings.TrimSpace(capag)
			if capag == "" || capag == "NA" {
				capag = "n.d."
			}
			upperC := strings.ToUpper(capag)
			normCapag := capag
			switch upperC {
			case "A":
				normCapag = "A"
			case "A+":
				normCapag = "A+"
			case "B":
				normCapag = "B"
			case "B+":
				normCapag = "B+"
			case "C":
				normCapag = "C"
			case "D":
				normCapag = "D"
			default:
				if strings.Contains(strings.ToLower(capag), "n.e") || strings.Contains(strings.ToLower(capag), "ne") {
					normCapag = "n.e."
				} else {
					normCapag = "n.d."
				}
			}

			// Se for Fernando de Noronha (Distrito Estadual, não elegível)
			if strings.EqualFold(strings.TrimSpace(mun), "Fernando de Noronha") {
				normCapag = "n.e."
			}

			if _, exists := contagens[normCapag]; exists {
				contagens[normCapag]++
			} else {
				contagens["n.d."]++
			}

			lista = append(lista, CapagItem{
				Ibge6:     ibge6,
				Municipio: mun,
				RD:        rd,
				Capag:     normCapag,
				Ano:       ano,
			})
			capagMap[ibge6] = normCapag
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"geojson":   GeoJSONPE,
		"dados":     lista,
		"capag_map": capagMap,
		"contagens": contagens,
	})
}

