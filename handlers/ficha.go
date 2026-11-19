package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	cacheFichaMetaMutex sync.RWMutex
	cacheFichaMetaMap   map[string]map[string]interface{}
	cacheFichaMetaList  []map[string]interface{}

	cachePcpMutex     sync.RWMutex
	cachePcpPorIbge   map[string][]map[string]string
	cachePcpCarregado bool
)

var (
	CaminhoMetadadosMunJSON = filepath.Join("data", "json", "metadados_indicadores_mun.json")
	CaminhoPcpJSON          = filepath.Join("data", "json", "df_pcp.json")
)

// InvalidarCacheFichaMetadados limpa o cache em RAM caso o ETL atualize o JSON
func InvalidarCacheFichaMetadados() {
	cacheFichaMetaMutex.Lock()
	defer cacheFichaMetaMutex.Unlock()
	cacheFichaMetaMap = nil
	cacheFichaMetaList = nil
}

// InvalidarCachePcpJSON limpa o cache em RAM caso o ETL atualize o df_pcp.json
func InvalidarCachePcpJSON() {
	cachePcpMutex.Lock()
	defer cachePcpMutex.Unlock()
	cachePcpPorIbge = nil
	cachePcpCarregado = false
}

// normalizarRegistroPcp converte um objeto JSON genérico em map[string]string (compatível com QueryToMaps)
func normalizarRegistroPcp(rawObj map[string]interface{}) (string, map[string]string) {
	ibge6 := ""
	if v, ok := rawObj["ibge6_clean"]; ok && v != nil {
		ibge6 = strings.TrimSpace(fmt.Sprintf("%v", v))
	} else if v, ok := rawObj["ibge6"]; ok && v != nil {
		ibge6 = strings.TrimSpace(fmt.Sprintf("%v", v))
	}
	if len(ibge6) > 6 {
		ibge6 = ibge6[:6]
	}

	rowStr := make(map[string]string, len(rawObj))
	for k, v := range rawObj {
		if k == "ibge6_clean" {
			continue // Replica o comportamento de SELECT * EXCLUDE (ibge6_clean)
		}
		if v == nil {
			rowStr[k] = ""
			continue
		}
		switch val := v.(type) {
		case string:
			rowStr[k] = val
		case float64:
			if math.Mod(val, 1.0) == 0 {
				rowStr[k] = fmt.Sprintf("%.0f", val)
			} else {
				rowStr[k] = strconv.FormatFloat(val, 'f', -1, 64)
			}
		default:
			rowStr[k] = fmt.Sprintf("%v", val)
		}
	}
	return ibge6, rowStr
}

// carregarPcpJSON lê df_pcp.json para a RAM indexado por ibge6_clean
func carregarPcpJSON() (map[string][]map[string]string, error) {
	cachePcpMutex.RLock()
	if cachePcpCarregado && cachePcpPorIbge != nil {
		dados := cachePcpPorIbge
		cachePcpMutex.RUnlock()
		return dados, nil
	}
	cachePcpMutex.RUnlock()

	caminhos := []string{
		CaminhoPcpJSON,
		filepath.Join("data", "df_pcp.json"),
		filepath.Join("etl", "data", "json", "df_pcp.json"),
		filepath.Join("..", "data", "json", "df_pcp.json"),
	}

	var raw []byte
	var err error
	for _, p := range caminhos {
		raw, err = os.ReadFile(p)
		if err == nil && len(raw) > 0 {
			break
		}
	}
	if err != nil || len(raw) == 0 {
		return nil, fmt.Errorf("arquivo df_pcp.json não encontrado")
	}

	indexado := make(map[string][]map[string]string)

	// Formato 1: Array de registros [{"ibge6_clean": "261160", ...}, ...]
	var lista []map[string]interface{}
	if errList := json.Unmarshal(raw, &lista); errList == nil {
		for _, item := range lista {
			ibge6, rowStr := normalizarRegistroPcp(item)
			if ibge6 != "" {
				indexado[ibge6] = append(indexado[ibge6], rowStr)
			}
		}
	} else {
		// Formato 2: Mapa indexado por ibge6 {"261160": [{...}, ...]}
		var mapa map[string][]map[string]interface{}
		if errMap := json.Unmarshal(raw, &mapa); errMap != nil {
			return nil, fmt.Errorf("erro ao decodificar df_pcp.json: %w", errMap)
		}
		for k, itens := range mapa {
			ibgeKey := strings.TrimSpace(k)
			if len(ibgeKey) > 6 {
				ibgeKey = ibgeKey[:6]
			}
			for _, item := range itens {
				ibge6, rowStr := normalizarRegistroPcp(item)
				if ibge6 == "" {
					ibge6 = ibgeKey
				}
				if ibge6 != "" {
					indexado[ibge6] = append(indexado[ibge6], rowStr)
				}
			}
		}
	}

	cachePcpMutex.Lock()
	cachePcpPorIbge = indexado
	cachePcpCarregado = true
	cachePcpMutex.Unlock()

	return indexado, nil
}

// obterPcpPorIbge6 retorna os registros de PCP para uma ou mais chaves ibge6_clean
func obterPcpPorIbge6(ibges ...string) []map[string]string {
	resultado := make([]map[string]string, 0)
	dados, err := carregarPcpJSON()
	if err != nil {
		log.Printf("[PCP] Aviso ao ler df_pcp.json: %v", err)
		return resultado
	}
	for _, ibge := range ibges {
		if regs, ok := dados[ibge]; ok {
			resultado = append(resultado, regs...)
		}
	}
	return resultado
}

// carregarMetadadosMunJSON lê o arquivo metadados_indicadores_mun.json para a RAM (mapa e lista deduplicada)
func carregarMetadadosMunJSON() (map[string]map[string]interface{}, []map[string]interface{}, error) {
	cacheFichaMetaMutex.RLock()
	if cacheFichaMetaMap != nil && len(cacheFichaMetaList) > 0 {
		m, l := cacheFichaMetaMap, cacheFichaMetaList
		cacheFichaMetaMutex.RUnlock()
		return m, l, nil
	}
	cacheFichaMetaMutex.RUnlock()

	caminhos := []string{
		CaminhoMetadadosMunJSON,
		filepath.Join("etl", "data", "json", "metadados_indicadores_mun.json"),
		filepath.Join("..", "data", "json", "metadados_indicadores_mun.json"),
	}

	var raw []byte
	var err error
	for _, p := range caminhos {
		raw, err = os.ReadFile(p)
		if err == nil && len(raw) > 0 {
			break
		}
	}
	if err != nil || len(raw) == 0 {
		return nil, nil, fmt.Errorf("arquivo metadados_indicadores_mun.json não encontrado")
	}

	var parsedMap map[string]map[string]interface{}
	if err := json.Unmarshal(raw, &parsedMap); err != nil {
		return nil, nil, err
	}

	// Deduplica entradas (pois o JSON indexa por sigla, nm_indicador e nm_fantasia)
	vistos := make(map[string]bool)
	var listaUnica []map[string]interface{}
	for k, item := range parsedMap {
		cd, _ := item["cd_indicador"].(string)
		if cd == "" {
			cd = k
		}
		if !vistos[cd] {
			vistos[cd] = true
			listaUnica = append(listaUnica, item)
		}
	}

	cacheFichaMetaMutex.Lock()
	cacheFichaMetaMap = parsedMap
	cacheFichaMetaList = listaUnica
	cacheFichaMetaMutex.Unlock()

	return parsedMap, listaUnica, nil
}

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

// GetFichaMetadados retorna o dicionário unificado de metadados a partir do JSON gerado pelo ETL (com fallback para SQLite)
func GetFichaMetadados(c *gin.Context) {
	if metaMap, metaList, err := carregarMetadadosMunJSON(); err == nil && len(metaList) > 0 {
		c.JSON(http.StatusOK, gin.H{
			"indicadores_dicionario": metaList,
			"indicadores_mapa":       metaMap,
		})
		return
	}

	// Fallback para SQLite caso o JSON ainda não exista
	if SQLiteDB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Metadados JSON indisponíveis e banco SQLite não conectado"})
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

	// 6. Chapéu de Palha (PCP) — leitura direta de df_pcp.json em RAM
	dfPcpMun := obterPcpPorIbge6(ibge6)

	dfPcpRD := make([]map[string]string, 0)
	if len(munsRDIbge6) > 0 {
		dfPcpRD = obterPcpPorIbge6(munsRDIbge6...)
	}

	// 7. Vocações Municipais
	dfVocMun, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_vocacoes
		WHERE ibge6_clean = ?
	`, ibge6)

	// 7b. Dinâmica das Empresas (SEPLAG)
	dfEmpresasResumo, _ := QueryToMaps(DuckDB, `
		SELECT * EXCLUDE (ibge6_clean) FROM v_empresas_resumo
		WHERE ibge6_clean = ?
	`, ibge6)

	dfEmpresasSaldo, _ := QueryToMaps(DuckDB, `
		SELECT ano_mes, aberturas, fechamentos, saldo, ano 
		FROM v_empresas_saldo_mensal_muni
		WHERE ibge6_clean = ?
		ORDER BY ano_mes ASC
	`, ibge6)

	dfEmpresasSetor, _ := QueryToMaps(DuckDB, `
		SELECT 
			grande_setor,
			CAST(ROUND(SUM(total_ativas)) AS BIGINT) as total_ativas,
			CAST(ROUND(SUM(total_mei_ativas)) AS BIGINT) as total_mei_ativas,
			CAST(ROUND(SUM(capital_social_total), 2) AS DOUBLE) as capital_social_total,
			CAST(ROUND(SUM(total_inativas)) AS BIGINT) as total_inativas
		FROM v_empresas_cnae_setor
		WHERE ibge6_clean = ?
		GROUP BY grande_setor
		ORDER BY total_ativas DESC
	`, ibge6)

	dfEmpresasFaixaEtaria, _ := QueryToMaps(DuckDB, `
		SELECT 
			faixa_etaria,
			CAST(ROUND(SUM(qtd_ativas)) AS BIGINT) as qtd_ativas,
			CAST(ROUND(SUM(qtd_inativas)) AS BIGINT) as qtd_inativas
		FROM v_empresas_faixa_etaria
		WHERE ibge6_clean = ?
		GROUP BY faixa_etaria
		ORDER BY faixa_etaria ASC
	`, ibge6)

	dfEmpresasBairros := make([]map[string]string, 0)
	if ibge6 == "261160" {
		dfEmpresasBairros, _ = QueryToMaps(DuckDB, `
			SELECT bairro_norm, total_ativas, total_mei, taxa_meizacao, idade_media, capital_social_total
			FROM v_empresas_bairros_recife
			ORDER BY total_ativas DESC
			LIMIT 30
		`)
	}

	dfEmpresasEstadual, _ := QueryToMaps(DuckDB, `
		SELECT 
			CAST(SUM(total_ativas) AS BIGINT) as total_ativas_pe,
			CAST(SUM(total_mei) AS BIGINT) as total_mei_pe,
			ROUND(AVG(empresas_por_mil_hab), 1) as densidade_media_pe,
			ROUND(SUM(total_mei)*100.0/NULLIF(SUM(total_ativas),0), 1) as taxa_meizacao_pe,
			CAST(SUM(saldo_12m) AS BIGINT) as saldo_12m_pe,
			ROUND(AVG(idade_media_ativas), 1) as idade_media_pe
		FROM v_empresas_resumo
	`)

	// 8. Diagnóstico de Desenvolvimento Regional
	var diagMun interface{} = nil
	if DiagnosticoRegional != nil {
		if d, ok := DiagnosticoRegional[strings.ToLower(munReal)]; ok {
			diagMun = d
		}
	}

	// 9. Data de Atualização via arquivo JSON / RDS / Parquet
	txtAtualizacao := "Atualizado em: -"
	for _, pPath := range []string{CaminhoPcpJSON, "data/df_pcp.json", "data/df_pcp.rds", "data/parquet/df_pcp.parquet", "data/parquet/df_indicadores.parquet"} {
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
		"data_atualizacao":      txtAtualizacao,
		"demografia":            demoMap,
		"indicadores":           dfInd,
		"indicadores_rd":        dfIndRD,
		"demografia_rd":         dfDemoRD,
		"iniciativas":           dfIni,
		"iniciativas_rd":        dfIniRD,
		"emendas":               dfEme,
		"fiscais":               dfFisc,
		"pcp":                   dfPcpMun,
		"pcp_rd":                dfPcpRD,
		"vocacoes":              dfVocMun,
		"empresas_resumo":       dfEmpresasResumo,
		"empresas_saldo_mensal": dfEmpresasSaldo,
		"empresas_setor":        dfEmpresasSetor,
		"empresas_faixa_etaria": dfEmpresasFaixaEtaria,
		"empresas_bairros":      dfEmpresasBairros,
		"empresas_pe_resumo":    dfEmpresasEstadual,
		"geojson":               geoJSONMun,
		"geojson_rd":            geoJSONRD,
		"geojson_pe":            GeoJSONPE,
		"diagnostico":           diagMun,
		"fontes_referencia":     FontesReferencia,
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

// ItemMapaIndicador representa os dados consolidados de um município para o mapa unificado
type ItemMapaIndicador struct {
	Ibge6        string   `json:"ibge6"`
	Municipio    string   `json:"municipio"`
	RD           string   `json:"rd"`
	Valor        *float64 `json:"valor"`
	ValorFmt     string   `json:"valor_fmt"`
	ValStr       string   `json:"val_str"`
	Ano          int      `json:"ano"`
	RankPE       int      `json:"rank_pe"`
	TotalPE      int      `json:"total_pe"`
	RankRD       int      `json:"rank_rd"`
	TotalRD      int      `json:"total_rd"`
	PercEstadual float64  `json:"perc_estadual"`
}

// RespostaMapaIndicador é a resposta do endpoint do mapa multidimensional
type RespostaMapaIndicador struct {
	Sigla        string                       `json:"sigla"`
	NmIndicador  string                       `json:"nm_indicador"`
	Tipo         string                       `json:"tipo"`
	Polaridade   string                       `json:"polaridade"`
	Ano          int                          `json:"ano"`
	TotalValidos int                          `json:"total_validos"`
	MediaPE      float64                      `json:"media_pe"`
	MinPE        float64                      `json:"min_pe"`
	MaxPE        float64                      `json:"max_pe"`
	MedianaPE    float64                      `json:"mediana_pe"`
	Municipios   map[string]ItemMapaIndicador `json:"municipios"`
	GeoJSON      interface{}                  `json:"geojson,omitempty"`
}

// ParseFloatBR converte strings ou valores numéricos no formato brasileiro ou padrão
// (como 1.234,56, R$ 1.234,56, 15,4%, 123.45) para float64 com segurança.
func ParseFloatBR(val interface{}) (float64, bool) {
	if val == nil {
		return 0, false
	}
	var s string
	switch v := val.(type) {
	case float64:
		if math.IsNaN(v) || math.IsInf(v, 0) {
			return 0, false
		}
		return v, true
	case float32:
		f := float64(v)
		if math.IsNaN(f) || math.IsInf(f, 0) {
			return 0, false
		}
		return f, true
	case int:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case string:
		s = v
	default:
		s = fmt.Sprintf("%v", v)
	}

	s = strings.TrimSpace(s)
	if s == "" || strings.EqualFold(s, "n.d.") || strings.EqualFold(s, "na") || strings.EqualFold(s, "null") || s == "-" {
		return 0, false
	}

	// Remove símbolos e unidades comuns: R$, $, %, e espaços não separáveis
	s = strings.ReplaceAll(s, "R$", "")
	s = strings.ReplaceAll(s, "r$", "")
	s = strings.ReplaceAll(s, "$", "")
	s = strings.ReplaceAll(s, "%", "")
	s = strings.ReplaceAll(s, "\u00a0", "")
	s = strings.TrimSpace(s)

	if s == "" {
		return 0, false
	}

	hasComma := strings.Contains(s, ",")
	hasDot := strings.Contains(s, ".")

	if hasComma && hasDot {
		// Formato BR: ex 1.234.567,89 -> remove pontos de milhar e substitui vírgula por ponto
		s = strings.ReplaceAll(s, ".", "")
		s = strings.ReplaceAll(s, ",", ".")
	} else if hasComma {
		// Formato BR: ex 1234,56 -> substitui vírgula por ponto
		s = strings.ReplaceAll(s, ",", ".")
	}

	// Extrai somente caracteres numéricos, ponto e sinal negativo inicial
	var sb strings.Builder
	for i, r := range s {
		if (r >= '0' && r <= '9') || r == '.' || (r == '-' && i == 0) {
			sb.WriteRune(r)
		}
	}
	clean := sb.String()
	if clean == "" || clean == "." || clean == "-" {
		return 0, false
	}

	f, err := strconv.ParseFloat(clean, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
		return 0, false
	}
	return f, true
}

func normalizarNomeMun(s string) string {
	s = strings.ToUpper(strings.TrimSpace(s))
	repl := strings.NewReplacer(
		"Á", "A", "À", "A", "Ã", "A", "Â", "A", "Ä", "A",
		"É", "E", "È", "E", "Ê", "E", "Ë", "E",
		"Í", "I", "Ì", "I", "Î", "I", "Ï", "I",
		"Ó", "O", "Ò", "O", "Õ", "O", "Ô", "O", "Ö", "O",
		"Ú", "U", "Ù", "U", "Û", "U", "Ü", "U",
		"Ç", "C",
	)
	return repl.Replace(s)
}

// GetMapaIndicador retorna os dados de qualquer indicador para os 184 municípios com ranking estadual e na RD
func GetMapaIndicador(c *gin.Context) {
	sigla := strings.TrimSpace(c.Query("sigla"))
	if sigla == "" {
		sigla = strings.TrimSpace(c.PostForm("sigla"))
	}
	if sigla == "" {
		var req struct {
			Sigla      string `json:"sigla"`
			Municipio  string `json:"municipio"`
			ComGeojson bool   `json:"com_geojson"`
		}
		if err := c.ShouldBindJSON(&req); err == nil && req.Sigla != "" {
			sigla = req.Sigla
		}
	}
	if sigla == "" {
		sigla = "mvi_taxa"
	}

	incluirGeoJSON := c.Query("com_geojson") == "1" || c.Query("com_geojson") == "true"

	siglaLower := strings.ToLower(sigla)
	if siglaLower == "pop_urbana_2022" {
		sigla = "perc_pop_urb"
		siglaLower = "perc_pop_urb"
	} else if siglaLower == "pop_rural_2022" {
		sigla = "perc_pop_rur"
		siglaLower = "perc_pop_rur"
	}

	// Mapa de colunas nativas exclusivas de v_demografia (as demais métricas demográficas residem em v_indicadores)
	demografiaCols := map[string]struct {
		col        string
		nome       string
		tipo       string
		polaridade string
	}{
		"pop_2026":         {"d.pop_2026", "População Estimada (2026)", "absoluto", "positiva"},
		"area_territorial": {"COALESCE(d.area_km2, 0)", "Área Territorial (km²)", "absoluto", "neutra"},
		"area_km2":         {"COALESCE(d.area_km2, 0)", "Área Territorial (km²)", "absoluto", "neutra"},
	}

	// Mapa de colunas de dinâmica empresarial em v_empresas_resumo
	empresasCols := map[string]struct {
		col        string
		nome       string
		tipo       string
		polaridade string
	}{
		"emp_empresas_por_mil_hab":   {"COALESCE(e.empresas_por_mil_hab, 0)", "Densidade Empresarial (Empresas / 1.000 hab.)", "taxa", "positiva"},
		"emp_taxa_meizacao":          {"COALESCE(e.taxa_meizacao, 0)", "Taxa de MEIzação (%)", "percentual", "neutra"},
		"emp_saldo_12m":              {"COALESCE(e.saldo_12m, 0)", "Saldo de Empresas nos Últimos 12 Meses", "absoluto", "positiva"},
		"emp_total_ativas":           {"COALESCE(e.total_ativas, 0)", "Total de Estabelecimentos Ativos", "absoluto", "positiva"},
		"emp_total_mei":              {"COALESCE(e.total_mei, 0)", "Total de MEIs Ativos", "absoluto", "positiva"},
		"emp_aberturas_12m":          {"COALESCE(e.aberturas_12m, 0)", "Novas Empresas Abertas (12 Meses)", "absoluto", "positiva"},
		"emp_fechamentos_12m":        {"COALESCE(e.fechamentos_12m, 0)", "Empresas Fechadas (12 Meses)", "absoluto", "negativa"},
		"emp_idade_media_ativas":     {"COALESCE(e.idade_media_ativas, 0)", "Idade Média do Parque Empresarial (Anos)", "taxa", "positiva"},
		"emp_tempo_medio_inativas":   {"COALESCE(e.tempo_medio_vida_inativas, 0)", "Tempo Médio de Sobrevivência (Anos)", "taxa", "positiva"},
		"emp_capital_social_total":   {"COALESCE(e.capital_social_total, 0)", "Capital Social Total (R$)", "moeda", "positiva"},
		"emp_capital_social_mediano": {"COALESCE(e.capital_social_mediano, 0)", "Capital Social Mediano (R$)", "moeda", "positiva"},
	}

	type MunRaw struct {
		Ibge6      string
		Municipio  string
		RD         string
		ValStr     string
		Ano        int
		NmInd      string
		Tipo       string
		Polaridade string
	}

	var rawList []MunRaw
	nmIndicadorFinal := ""
	tipoFinal := "taxa"
	polaridadeFinal := "positiva"
	anoFinal := 2024

	if infoDemo, isDemo := demografiaCols[siglaLower]; isDemo {
		nmIndicadorFinal = infoDemo.nome
		tipoFinal = infoDemo.tipo
		polaridadeFinal = infoDemo.polaridade
		anoFinal = 2026

		query := fmt.Sprintf(`
			SELECT 
				d.ibge6_clean,
				d.municipio,
				d.regiao_de_desenvolvimento,
				COALESCE(CAST(%s AS VARCHAR), 'n.d.') AS val_str
			FROM v_demografia d
			ORDER BY d.municipio ASC
		`, infoDemo.col)

		rows, err := DuckDB.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar demografia", "details": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var ibge6, mun, rd, valStr string
			if err := rows.Scan(&ibge6, &mun, &rd, &valStr); err == nil {
				rawList = append(rawList, MunRaw{
					Ibge6:      ibge6,
					Municipio:  mun,
					RD:         rd,
					ValStr:     valStr,
					Ano:        anoFinal,
					NmInd:      nmIndicadorFinal,
					Tipo:       tipoFinal,
					Polaridade: polaridadeFinal,
				})
			}
		}
	} else if infoEmp, isEmp := empresasCols[siglaLower]; isEmp {
		nmIndicadorFinal = infoEmp.nome
		tipoFinal = infoEmp.tipo
		polaridadeFinal = infoEmp.polaridade
		anoFinal = 2024

		query := fmt.Sprintf(`
			SELECT 
				d.ibge6_clean,
				d.municipio,
				d.regiao_de_desenvolvimento,
				COALESCE(CAST(%s AS VARCHAR), '0') AS val_str
			FROM v_demografia d
			LEFT JOIN v_empresas_resumo e ON d.ibge6_clean = e.ibge6_clean
			ORDER BY d.municipio ASC
		`, infoEmp.col)

		rows, err := DuckDB.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar empresas", "details": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var ibge6, mun, rd, valStr string
			if err := rows.Scan(&ibge6, &mun, &rd, &valStr); err == nil {
				rawList = append(rawList, MunRaw{
					Ibge6:      ibge6,
					Municipio:  mun,
					RD:         rd,
					ValStr:     valStr,
					Ano:        anoFinal,
					NmInd:      nmIndicadorFinal,
					Tipo:       tipoFinal,
					Polaridade: polaridadeFinal,
				})
			}
		}
	} else if siglaLower == "mvi_taxa" || siglaLower == "cvp_taxa" {
		nmBase := "mvi"
		nmIndice := "Taxa de MVI (por 100k hab.)"
		if siglaLower == "cvp_taxa" {
			nmBase = "cvp"
			nmIndice = "Taxa de CVP (por 100k hab.)"
		}
		nmIndicadorFinal = nmIndice
		tipoFinal = "taxa"
		polaridadeFinal = "negativa"
		anoFinal = 2024

		query := fmt.Sprintf(`
			WITH crime_recente AS (
				SELECT 
					ibge6_clean,
					TRY_CAST(REPLACE(indicador, ',', '.') AS DOUBLE) as qtd_crime,
					ano,
					ROW_NUMBER() OVER (PARTITION BY ibge6_clean ORDER BY ano DESC) as rn
				FROM v_indicadores
				WHERE LOWER(sigla_indicador) = '%s'
			)
			SELECT 
				d.ibge6_clean,
				d.municipio,
				d.regiao_de_desenvolvimento,
				COALESCE(CAST(ROUND((c.qtd_crime / NULLIF(TRY_CAST(d.pop_2026 AS DOUBLE), 0)) * 100000.0, 1) AS VARCHAR), '0.0') AS val_str,
				COALESCE(c.ano, 2024) AS ano
			FROM v_demografia d
			LEFT JOIN crime_recente c ON d.ibge6_clean = c.ibge6_clean AND c.rn = 1
			ORDER BY d.municipio ASC
		`, nmBase)

		rows, err := DuckDB.Query(query)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var ibge6, mun, rd, valStr string
				var ano int
				if err := rows.Scan(&ibge6, &mun, &rd, &valStr, &ano); err == nil {
					rawList = append(rawList, MunRaw{
						Ibge6:      ibge6,
						Municipio:  mun,
						RD:         rd,
						ValStr:     valStr,
						Ano:        ano,
						NmInd:      nmIndicadorFinal,
						Tipo:       tipoFinal,
						Polaridade: polaridadeFinal,
					})
				}
			}
		}
	} else if siglaLower == "estab_total" || siglaLower == "emp_total" {
		isEstab := siglaLower == "estab_total"
		if isEstab {
			nmIndicadorFinal = "Estabelecimentos Formais (Total)"
		} else {
			nmIndicadorFinal = "Empregados Formais (Total)"
		}
		tipoFinal = "absoluto"
		polaridadeFinal = "positiva"
		anoFinal = 2023

		inClause := "'estab_agro', 'estab_ind', 'estab_serv'"
		if !isEstab {
			inClause = "'emp_agro', 'emp_ind', 'emp_serv'"
		}

		query := fmt.Sprintf(`
			SELECT 
				d.ibge6_clean,
				d.municipio,
				d.regiao_de_desenvolvimento,
				COALESCE(CAST(SUM(TRY_CAST(REPLACE(i.indicador, ',', '.') AS BIGINT)) AS VARCHAR), '0') as val_str,
				2023 as ano
			FROM v_demografia d
			LEFT JOIN v_indicadores i ON d.ibge6_clean = i.ibge6_clean 
				AND LOWER(i.sigla_indicador) IN (%s)
				AND i.ano = 2023
			GROUP BY d.ibge6_clean, d.municipio, d.regiao_de_desenvolvimento
			ORDER BY d.municipio ASC
		`, inClause)

		rows, err := DuckDB.Query(query)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var ibge6, mun, rd, valStr string
				var ano int
				if err := rows.Scan(&ibge6, &mun, &rd, &valStr, &ano); err == nil {
					rawList = append(rawList, MunRaw{
						Ibge6:      ibge6,
						Municipio:  mun,
						RD:         rd,
						ValStr:     valStr,
						Ano:        ano,
						NmInd:      nmIndicadorFinal,
						Tipo:       tipoFinal,
						Polaridade: polaridadeFinal,
					})
				}
			}
		}
	} else if siglaLower == "pcp_qtd" {
		nmIndicadorFinal = "Beneficiários Chapéu de Palha"
		tipoFinal = "absoluto"
		polaridadeFinal = "positiva"
		anoFinal = 2024

		pcpIndexado, errJSON := carregarPcpJSON()
		if errJSON != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler df_pcp.json", "details": errJSON.Error()})
			return
		}

		// Soma total de beneficiários por ibge6_clean em memória
		somaPorMun := make(map[string]int64, len(pcpIndexado))
		for ibge, registros := range pcpIndexado {
			var total int64
			for _, r := range registros {
				if v, ok := ParseFloatBR(r["numero_de_beneficiarios"]); ok {
					total += int64(math.Round(v))
				}
			}
			somaPorMun[ibge] = total
		}

		query := `
			SELECT 
				ibge6_clean,
				municipio,
				regiao_de_desenvolvimento
			FROM v_demografia
			ORDER BY municipio ASC
		`
		rows, err := DuckDB.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar municípios para Chapéu de Palha", "details": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var ibge6, mun, rd string
			if err := rows.Scan(&ibge6, &mun, &rd); err == nil {
				valStr := strconv.FormatInt(somaPorMun[ibge6], 10)
				rawList = append(rawList, MunRaw{
					Ibge6:      ibge6,
					Municipio:  mun,
					RD:         rd,
					ValStr:     valStr,
					Ano:        2024,
					NmInd:      nmIndicadorFinal,
					Tipo:       tipoFinal,
					Polaridade: polaridadeFinal,
				})
			}
		}
	} else {
		// 1. Tentar buscar metadados no JSON em RAM (gerado pelo ETL)
		if metaMap, _, errJSON := carregarMetadadosMunJSON(); errJSON == nil {
			var metaItem map[string]interface{}
			if m, ok := metaMap[sigla]; ok {
				metaItem = m
			} else {
				for k, m := range metaMap {
					if strings.EqualFold(k, sigla) {
						metaItem = m
						break
					}
				}
			}
			if metaItem != nil {
				if nm, ok := metaItem["nm_indicador"].(string); ok && nm != "" {
					nmIndicadorFinal = nm
				}
				if tp, ok := metaItem["tipo"].(string); ok && tp != "" {
					tipoFinal = tp
				} else if nat, ok := metaItem["natureza"].(string); ok && nat != "" {
					natLower := strings.ToLower(nat)
					switch {
					case strings.Contains(natLower, "percent"):
						tipoFinal = "percentual"
					case strings.Contains(natLower, "índice") || strings.Contains(natLower, "indice") || strings.Contains(natLower, "razão") || strings.Contains(natLower, "razao"):
						tipoFinal = "índice"
					case strings.Contains(natLower, "taxa"):
						tipoFinal = "taxa"
					case strings.Contains(natLower, "monetário") || strings.Contains(natLower, "monetario") || strings.Contains(natLower, "r$"):
						tipoFinal = "moeda"
					case strings.Contains(natLower, "absoluto") || strings.Contains(natLower, "quantitativo"):
						tipoFinal = "absoluto"
					}
				}
				if pol, ok := metaItem["polaridade"].(string); ok && pol != "" {
					polaridadeFinal = strings.ToLower(pol)
				}
			}
		}

		// 1b. Fallback: buscar metadados no SQLite por cd_indicador ou nm_indicador para enriquecer
		if nmIndicadorFinal == "" && SQLiteDB != nil {
			var nmMeta, uniMeta, natMeta sql.NullString
			rowMeta := SQLiteDB.QueryRow(`
				SELECT nm_indicador, unidade, natureza 
				FROM metadados 
				WHERE LOWER(cd_indicador) = LOWER(?) OR LOWER(nm_indicador) = LOWER(?)
				LIMIT 1
			`, sigla, sigla)
			if errMeta := rowMeta.Scan(&nmMeta, &uniMeta, &natMeta); errMeta == nil {
				if nmMeta.Valid && nmMeta.String != "" {
					nmIndicadorFinal = nmMeta.String
				}
				if natMeta.Valid && natMeta.String != "" {
					natLower := strings.ToLower(natMeta.String)
					switch {
					case strings.Contains(natLower, "percent"):
						tipoFinal = "percentual"
					case strings.Contains(natLower, "índice") || strings.Contains(natLower, "indice") || strings.Contains(natLower, "razão") || strings.Contains(natLower, "razao"):
						tipoFinal = "índice"
					case strings.Contains(natLower, "taxa"):
						tipoFinal = "taxa"
					case strings.Contains(natLower, "monetário") || strings.Contains(natLower, "monetario") || strings.Contains(natLower, "r$"):
						tipoFinal = "moeda"
					case strings.Contains(natLower, "absoluto") || strings.Contains(natLower, "quantitativo"):
						tipoFinal = "absoluto"
					}
				}
			}
		}

		// 2. Consulta v_indicadores (por sigla_indicador ou nm_indicador)
		query := `
			WITH ranked AS (
				SELECT 
					ibge6_clean,
					indicador,
					ano,
					nm_indicador,
					COALESCE(tipo, '') AS tipo,
					COALESCE(polaridade, '') AS polaridade,
					ROW_NUMBER() OVER (PARTITION BY ibge6_clean ORDER BY ano DESC) as rn
				FROM v_indicadores
				WHERE LOWER(sigla_indicador) = LOWER(?) OR LOWER(nm_indicador) = LOWER(?)
			)
			SELECT 
				d.ibge6_clean,
				d.municipio,
				d.regiao_de_desenvolvimento,
				COALESCE(r.indicador, 'n.d.') AS val_str,
				COALESCE(r.ano, 2024) AS ano,
				COALESCE(r.nm_indicador, '') AS nm_ind,
				COALESCE(r.tipo, 'taxa') AS tipo,
				COALESCE(r.polaridade, 'positiva') AS polaridade
			FROM v_demografia d
			LEFT JOIN ranked r ON d.ibge6_clean = r.ibge6_clean AND r.rn = 1
			ORDER BY d.municipio ASC
		`

		rows, err := DuckDB.Query(query, sigla, sigla)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar indicador", "details": err.Error()})
			return
		}
		defer rows.Close()

		temValoresValidos := false
		for rows.Next() {
			var ibge6, mun, rd, valStr, nmInd, tipo, pol string
			var ano int
			if err := rows.Scan(&ibge6, &mun, &rd, &valStr, &ano, &nmInd, &tipo, &pol); err == nil {
				if nmIndicadorFinal == "" && nmInd != "" {
					nmIndicadorFinal = nmInd
				}
				if tipo != "" && tipoFinal == "taxa" {
					tipoFinal = tipo
				}
				if pol != "" {
					polaridadeFinal = pol
				}
				if ano > anoFinal {
					anoFinal = ano
				}
				if valStr != "" && valStr != "n.d." && valStr != "NA" {
					temValoresValidos = true
				}
				rawList = append(rawList, MunRaw{
					Ibge6:      ibge6,
					Municipio:  mun,
					RD:         rd,
					ValStr:     valStr,
					Ano:        ano,
					NmInd:      nmInd,
					Tipo:       tipo,
					Polaridade: pol,
				})
			}
		}

		// 3. Fallback para tabela v_fiscais caso v_indicadores não tenha retornado registros válidos
		if !temValoresValidos {
			queryFiscais := `
				WITH ranked_fisc AS (
					SELECT 
						ibge6_clean,
						valor,
						CAST(COALESCE(exercicio, 2024) AS INTEGER) AS ano,
						indicador,
						ROW_NUMBER() OVER (PARTITION BY ibge6_clean ORDER BY exercicio DESC) as rn
					FROM v_fiscais
					WHERE LOWER(indicador) = LOWER(?) OR LOWER(indicador) LIKE LOWER(?)
				)
				SELECT 
					d.ibge6_clean,
					d.municipio,
					d.regiao_de_desenvolvimento,
					COALESCE(CAST(r.valor AS VARCHAR), 'n.d.') AS val_str,
					COALESCE(r.ano, 2024) AS ano,
					COALESCE(r.indicador, '') AS nm_ind
				FROM v_demografia d
				LEFT JOIN ranked_fisc r ON d.ibge6_clean = r.ibge6_clean AND r.rn = 1
				ORDER BY d.municipio ASC
			`
			rowsFisc, errFisc := DuckDB.Query(queryFiscais, sigla, "%"+sigla+"%")
			if errFisc == nil {
				defer rowsFisc.Close()
				var rawListFisc []MunRaw
				temValFisc := false
				for rowsFisc.Next() {
					var ibge6, mun, rd, valStr, nmInd string
					var ano int
					if errScan := rowsFisc.Scan(&ibge6, &mun, &rd, &valStr, &ano, &nmInd); errScan == nil {
						if nmInd != "" && (nmIndicadorFinal == "" || nmIndicadorFinal == sigla) {
							nmIndicadorFinal = nmInd
						}
						if ano > anoFinal {
							anoFinal = ano
						}
						if valStr != "" && valStr != "n.d." && valStr != "NA" {
							temValFisc = true
						}
						rawListFisc = append(rawListFisc, MunRaw{
							Ibge6:      ibge6,
							Municipio:  mun,
							RD:         rd,
							ValStr:     valStr,
							Ano:        ano,
							NmInd:      nmIndicadorFinal,
							Tipo:       "moeda",
							Polaridade: "positiva",
						})
					}
				}
				if temValFisc && len(rawListFisc) > 0 {
					rawList = rawListFisc
					tipoFinal = "moeda"
				}
			}
		}
	}

	if nmIndicadorFinal == "" {
		nmIndicadorFinal = sigla
	}

	// Normaliza tipo
	tipoFinalNorm := strings.ToLower(strings.TrimSpace(tipoFinal))

	// Estruturas para ranking
	type ParseItem struct {
		Index     int
		Municipio string
		RD        string
		Valor     float64
		Valido    bool
	}

	var parsed []ParseItem
	valoresValidos := make([]float64, 0, len(rawList))
	rdGrupos := make(map[string][]int) // RD -> índices em parsed

	for idx, item := range rawList {
		vFloat, valido := ParseFloatBR(item.ValStr)

		// Mapeamento especial de notas CAPAG para pontuação contínua
		if strings.HasPrefix(strings.ToLower(sigla), "capag") {
			vCleanUpper := strings.ToUpper(strings.TrimSpace(item.ValStr))
			score := 0.0
			switch {
			case strings.Contains(vCleanUpper, "A+"):
				score = 4.5
			case strings.Contains(vCleanUpper, "A"):
				score = 4.0
			case strings.Contains(vCleanUpper, "B"):
				score = 3.0
			case strings.Contains(vCleanUpper, "C"):
				score = 2.0
			case strings.Contains(vCleanUpper, "D"):
				score = 1.0
			}
			if score > 0 {
				vFloat = score
				valido = true
			}
		}

		// Ajuste de percentual em escala 0-1
		if valido && (strings.Contains(tipoFinalNorm, "percent") || strings.HasPrefix(sigla, "pct_")) && vFloat <= 1.0 && vFloat > 0 {
			vFloat = vFloat * 100.0
		}

		if valido {
			valoresValidos = append(valoresValidos, vFloat)
		}

		parsed = append(parsed, ParseItem{
			Index:     idx,
			Municipio: item.Municipio,
			RD:        item.RD,
			Valor:     vFloat,
			Valido:    valido,
		})

		rdGrupos[item.RD] = append(rdGrupos[item.RD], idx)
	}

	// Ordena para ranking estadual (PE)
	// Polaridade positiva: maior valor = 1º; Polaridade negativa: menor valor = 1º
	sort.Slice(parsed, func(i, j int) bool {
		if parsed[i].Valido && !parsed[j].Valido {
			return true
		}
		if !parsed[i].Valido && parsed[j].Valido {
			return false
		}
		if !parsed[i].Valido && !parsed[j].Valido {
			return parsed[i].Municipio < parsed[j].Municipio
		}
		if strings.ToLower(polaridadeFinal) == "negativa" {
			return parsed[i].Valor < parsed[j].Valor
		}
		return parsed[i].Valor > parsed[j].Valor
	})

	rankPEMap := make(map[int]int)
	totalValidosPE := len(valoresValidos)
	for rank, p := range parsed {
		if p.Valido {
			rankPEMap[p.Index] = rank + 1
		} else {
			rankPEMap[p.Index] = 0
		}
	}

	// Ordena dentro de cada RD
	rankRDMap := make(map[int]int)
	totalRDMap := make(map[string]int)

	for rdName, indices := range rdGrupos {
		var rdItems []ParseItem
		for _, idx := range indices {
			p := ParseItem{
				Index:     idx,
				Municipio: rawList[idx].Municipio,
				RD:        rdName,
				Valor:     0,
				Valido:    false,
			}
			for _, itemP := range parsed {
				if itemP.Index == idx {
					p = itemP
					break
				}
			}
			rdItems = append(rdItems, p)
		}

		sort.Slice(rdItems, func(i, j int) bool {
			if rdItems[i].Valido && !rdItems[j].Valido {
				return true
			}
			if !rdItems[i].Valido && rdItems[j].Valido {
				return false
			}
			if !rdItems[i].Valido && !rdItems[j].Valido {
				return rdItems[i].Municipio < rdItems[j].Municipio
			}
			if strings.ToLower(polaridadeFinal) == "negativa" {
				return rdItems[i].Valor < rdItems[j].Valor
			}
			return rdItems[i].Valor > rdItems[j].Valor
		})

		totValRD := 0
		for _, it := range rdItems {
			if it.Valido {
				totValRD++
			}
		}
		totalRDMap[rdName] = totValRD

		for r, it := range rdItems {
			if it.Valido {
				rankRDMap[it.Index] = r + 1
			} else {
				rankRDMap[it.Index] = 0
			}
		}
	}

	// Estatísticas estaduais
	minPE := 0.0
	maxPE := 0.0
	mediaPE := 0.0
	medianaPE := 0.0

	if len(valoresValidos) > 0 {
		sortedVals := make([]float64, len(valoresValidos))
		copy(sortedVals, valoresValidos)
		sort.Float64s(sortedVals)

		minPE = sortedVals[0]
		maxPE = sortedVals[len(sortedVals)-1]

		soma := 0.0
		for _, v := range sortedVals {
			soma += v
		}
		mediaPE = soma / float64(len(sortedVals))

		mid := len(sortedVals) / 2
		if len(sortedVals)%2 == 0 {
			medianaPE = (sortedVals[mid-1] + sortedVals[mid]) / 2.0
		} else {
			medianaPE = sortedVals[mid]
		}
	}

	// Montagem do mapa de municípios
	municipiosMap := make(map[string]ItemMapaIndicador)

	for idx, item := range rawList {
		var valPtr *float64 = nil
		vFloat, valido := ParseFloatBR(item.ValStr)

		if strings.HasPrefix(strings.ToLower(sigla), "capag") {
			vCleanUpper := strings.ToUpper(strings.TrimSpace(item.ValStr))
			score := 0.0
			switch {
			case strings.Contains(vCleanUpper, "A+"):
				score = 4.5
			case strings.Contains(vCleanUpper, "A"):
				score = 4.0
			case strings.Contains(vCleanUpper, "B"):
				score = 3.0
			case strings.Contains(vCleanUpper, "C"):
				score = 2.0
			case strings.Contains(vCleanUpper, "D"):
				score = 1.0
			}
			if score > 0 {
				vFloat = score
				valido = true
			}
		}

		if valido && (strings.Contains(tipoFinalNorm, "percent") || strings.HasPrefix(sigla, "pct_")) && vFloat <= 1.0 && vFloat > 0 {
			vFloat = vFloat * 100.0
		}

		vFmt := "-"
		if valido {
			valPtr = &vFloat
			if strings.HasPrefix(strings.ToLower(sigla), "capag") {
				vFmt = "Nota " + strings.ToUpper(strings.TrimSpace(item.ValStr))
			} else if strings.Contains(tipoFinalNorm, "percent") || strings.HasPrefix(sigla, "pct_") {
				vFmt = fmt.Sprintf("%.1f%%", vFloat)
			} else if strings.Contains(tipoFinalNorm, "moeda") {
				if vFloat >= 1000000 {
					vFmt = fmt.Sprintf("R$ %.2f M", vFloat/1000000.0)
				} else if vFloat >= 1000 {
					vFmt = fmt.Sprintf("R$ %.1f mil", vFloat/1000.0)
				} else {
					vFmt = fmt.Sprintf("R$ %.2f", vFloat)
				}
			} else if strings.Contains(tipoFinalNorm, "índice") || strings.Contains(tipoFinalNorm, "indice") || strings.Contains(tipoFinalNorm, "taxa") {
				vFmt = fmt.Sprintf("%.2f", vFloat)
			} else {
				if math.Mod(vFloat, 1.0) == 0 {
					vFmt = fmt.Sprintf("%.0f", vFloat)
				} else {
					vFmt = fmt.Sprintf("%.1f", vFloat)
				}
			}
		} else {
			if item.ValStr != "" && item.ValStr != "n.d." && item.ValStr != "NA" {
				vFmt = item.ValStr
			}
		}

		rPE := rankPEMap[idx]
		rRD := rankRDMap[idx]
		totRD := totalRDMap[item.RD]
		if totRD == 0 {
			totRD = len(rdGrupos[item.RD])
		}

		percEst := 0.0
		if totalValidosPE > 1 && rPE > 0 {
			// Percentil de posição: 100% no topo, 0% na base
			percEst = math.Round(((float64(totalValidosPE-rPE+1))/float64(totalValidosPE))*1000) / 10.0
		}

		itemRet := ItemMapaIndicador{
			Ibge6:        item.Ibge6,
			Municipio:    item.Municipio,
			RD:           item.RD,
			Valor:        valPtr,
			ValorFmt:     vFmt,
			ValStr:       item.ValStr,
			Ano:          item.Ano,
			RankPE:       rPE,
			TotalPE:      totalValidosPE,
			RankRD:       rRD,
			TotalRD:      totRD,
			PercEstadual: percEst,
		}

		municipiosMap[item.Municipio] = itemRet
		municipiosMap[item.Ibge6] = itemRet
		municipiosMap[normalizarNomeMun(item.Municipio)] = itemRet
	}

	resp := RespostaMapaIndicador{
		Sigla:        sigla,
		NmIndicador:  nmIndicadorFinal,
		Tipo:         tipoFinalNorm,
		Polaridade:   polaridadeFinal,
		Ano:          anoFinal,
		TotalValidos: totalValidosPE,
		MediaPE:      mediaPE,
		MinPE:        minPE,
		MaxPE:        maxPE,
		MedianaPE:    medianaPE,
		Municipios:   municipiosMap,
	}

	if incluirGeoJSON || c.Query("com_geojson") == "1" || c.Query("com_geojson") == "" {
		resp.GeoJSON = GeoJSONPE
	}

	c.JSON(http.StatusOK, resp)
}

// Aliases para semântica
var (
	GetMunicipiosMapaIndicador = GetMapaIndicador
)