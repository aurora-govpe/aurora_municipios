package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

var (
	DuckDB     *sql.DB
	SQLiteDB   *sql.DB
	GeminiKey           string
	GeoJSONPE           json.RawMessage
	DfRegicPE           []map[string]string
	DfFluxosPE          []map[string]string
	DiagnosticoRegional map[string]interface{}
	FontesReferencia    map[string]interface{}
	BasePainelJSON      []byte
)

func SetDatabases(duck *sql.DB, sqlite *sql.DB) {
	DuckDB = duck
	SQLiteDB = sqlite
}

// LoadConfig carrega a chave do Gemini de tokens.yml, config.yml ou variável de ambiente
func LoadConfig() {
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		GeminiKey = key
		log.Println("🔑 Chave do Gemini carregada da variável de ambiente GEMINI_API_KEY.")
		return
	}

	loadYamlKey := func(filePath string) string {
		data, err := os.ReadFile(filePath)
		if err != nil {
			return ""
		}
		var cfg map[string]interface{}
		if err := yaml.Unmarshal(data, &cfg); err != nil {
			return ""
		}
		if def, ok := cfg["default"].(map[string]interface{}); ok {
			if k, ok := def["gemini_api_key"].(string); ok && k != "" {
				return k
			}
			if k, ok := def["GEMINI_API_KEY"].(string); ok && k != "" {
				return k
			}
		}
		if k, ok := cfg["gemini_api_key"].(string); ok && k != "" {
			return k
		}
		if k, ok := cfg["GEMINI_API_KEY"].(string); ok && k != "" {
			return k
		}
		return ""
	}

	candidatos := []string{
		"data/tokens.yml",
		"app_aurora_municipios/data/tokens.yml",
		"../data/tokens.yml",
		"data/config.yml",
		"app_aurora_municipios/data/config.yml",
		"../data/config.yml",
	}

	for _, c := range candidatos {
		if k := loadYamlKey(c); k != "" {
			GeminiKey = k
			log.Printf("🔑 Chave do Gemini carregada com sucesso de %s.", c)
			return
		}
	}

	log.Println("⚠️ Aviso: Chave do Gemini não encontrada em tokens.yml nem config.yml!")
}

// InitData inicializa as tabelas em RAM do DuckDB e pré-carrega o GeoJSON e REGIC de Pernambuco
func InitData() error {
	// Determina o caminho de emendas (prioriza dados_emendas_atual.parquet para usar apenas o último ano)
	caminhoEmendas := "data/parquet/dados_emendas.parquet"
	for _, p := range []string{
		"data/parquet/dados_emendas_atual.parquet",
		"data/dados_emendas_atual.parquet",
		"app_aurora_municipios/data/parquet/dados_emendas_atual.parquet",
		"app_aurora_municipios/data/dados_emendas_atual.parquet",
		"C:/dados/aurora/parquet/dados_emendas_atual.parquet",
		"C:/dados/aurora/dados_emendas_atual.parquet",
	} {
		if _, err := os.Stat(p); err == nil {
			caminhoEmendas = p
			log.Printf("📌 [Emendas] Utilizando base do último ano: %s", p)
			break
		}
	}

	cleanEmendas := "SUBSTR(CAST(COALESCE(NULLIF(CAST(ibge6 AS VARCHAR), ''), NULLIF(CAST(cod_ibge AS VARCHAR), '')) AS VARCHAR), 1, 6)"

	tables := []struct {
		name  string
		path  string
		clean string
	}{
		{"v_indicadores", "data/parquet/df_indicadores.parquet", "SUBSTR(CAST(ibge6 AS VARCHAR), 1, 6)"},
		{"v_iniciativas", "data/parquet/df_iniciativas.parquet", "SUBSTR(CAST(ibge6 AS VARCHAR), 1, 6)"},
		{"v_emendas", caminhoEmendas, cleanEmendas},
		{"v_pcp", "data/parquet/df_pcp.parquet", "SUBSTR(CAST(ibge6 AS VARCHAR), 1, 6)"},
		{"v_fiscais", "data/parquet/dados_fiscais.parquet", "SUBSTR(CAST(ibge6 AS VARCHAR), 1, 6)"},
		{"v_vocacoes", "data/parquet/df_rais_vocacoes.parquet", "SUBSTR(CAST(id_municipio AS VARCHAR), 1, 6)"},
		{"v_demografia", "data/parquet/df_demografia_pe.parquet", "SUBSTR(CAST(ibge6 AS VARCHAR), 1, 6)"},
		{"v_regic", "data/parquet/regic_pe_main.parquet", ""},
		{"v_arranjos", "data/parquet/arranjos_populacionais_pe.parquet", ""},
		{"v_fluxos", "data/parquet/regic_pe_fluxos.parquet", ""},
		{"v_indicadores_ufs", "data/parquet/df_indicadores_ufs.parquet", ""},
		{"v_indicadores_regioes", "data/parquet/df_indicadores_regioes.parquet", ""},
	}

	for _, t := range tables {
		var query string
		if t.name == "v_demografia" {
			query = fmt.Sprintf("CREATE TABLE %s AS SELECT *, DENSE_RANK() OVER (ORDER BY TRY_CAST(pop_2026 AS DOUBLE) DESC) AS rank_pop, TRY_CAST(pop_2026 AS DOUBLE) AS pop_clean, %s AS ibge6_clean FROM read_parquet('%s')", t.name, t.clean, filepath.ToSlash(t.path))
		} else if t.name == "v_indicadores" {
			query = fmt.Sprintf("CREATE TABLE %s AS SELECT *, %s AS ibge6_clean, LOWER(TRIM(CAST(sigla_indicador AS VARCHAR))) AS sigla_clean, TRY_CAST(REPLACE(CAST(indicador AS VARCHAR), ',', '.') AS DOUBLE) AS val_clean, TRY_CAST(ano AS INTEGER) AS ano_clean FROM read_parquet('%s')", t.name, t.clean, filepath.ToSlash(t.path))
		} else if t.clean != "" {
			query = fmt.Sprintf("CREATE TABLE %s AS SELECT *, %s AS ibge6_clean FROM read_parquet('%s')", t.name, t.clean, filepath.ToSlash(t.path))
		} else {
			query = fmt.Sprintf("CREATE TABLE %s AS SELECT * FROM read_parquet('%s')", t.name, filepath.ToSlash(t.path))
		}
		if _, err := DuckDB.Exec(query); err != nil {
			log.Printf("⚠️ Erro ao criar tabela %s a partir de %s: %v", t.name, t.path, err)
		} else {
			log.Printf("✅ Tabela %s carregada com sucesso.", t.name)
		}
	}

	// Criar índices em RAM para aceleração das buscas por ibge6 e UFs
	indexedTables := []string{"v_indicadores", "v_demografia", "v_iniciativas", "v_emendas", "v_fiscais", "v_pcp", "v_vocacoes"}
	for _, it := range indexedTables {
		idxQuery := fmt.Sprintf("CREATE INDEX IF NOT EXISTS idx_%s_ibge ON %s (ibge6_clean)", it, it)
		if _, err := DuckDB.Exec(idxQuery); err != nil {
			log.Printf("Aviso ao criar índice em %s: %v", it, err)
		}
	}

	// Carrega dados fiscais de base_painel.json diretamente na memória RAM
	var errBasePainel error
	BasePainelJSON, errBasePainel = os.ReadFile("data/base_painel.json")
	if errBasePainel != nil {
		log.Printf("⚠️ Aviso: Falha ao carregar data/base_painel.json: %v", errBasePainel)
		BasePainelJSON = []byte("{}")
	} else {
		log.Printf("✅ data/base_painel.json carregado em RAM (%d bytes).", len(BasePainelJSON))
	}

	// Pré-computar GeoJSON completo de Pernambuco (todos os municípios) para a Dimensão 0
	log.Println("⚡ Pré-computando GeoJSON estadual completo...")
	rows, err := DuckDB.Query("SELECT geojson_feature FROM v_demografia WHERE geojson_feature IS NOT NULL AND geojson_feature != ''")
	if err == nil {
		defer rows.Close()
		var features []string
		for rows.Next() {
			var feat string
			if err := rows.Scan(&feat); err == nil && feat != "" {
				features = append(features, feat)
			}
		}
		fcStr := fmt.Sprintf(`{"type":"FeatureCollection","features":[%s]}`, strings.Join(features, ","))
		GeoJSONPE = json.RawMessage(fcStr)
		log.Printf("✅ GeoJSON estadual pré-computado com %d features.", len(features))
	} else {
		log.Printf("⚠️ Erro ao pré-computar GeoJSON PE: %v", err)
	}

	// Pré-computar REGIC e Arranjos Populacionais do estado (Dimensão 0)
	log.Println("⚡ Pré-computando REGIC estadual completo...")
	queryRegic := `
		WITH muns_base AS (
			SELECT municipio, ibge6_clean, regiao_de_desenvolvimento
			FROM v_demografia
		),
		arranjos_base AS (
			SELECT SUBSTR(CAST(cod_ibge AS VARCHAR), 1, 6) AS ibge6_str,
			       SUBSTR(CAST(cod_arranjo AS VARCHAR), 1, 6) AS arranjo_str,
			       nome_arranjo
			FROM v_arranjos
		),
		muns_regic AS (
			SELECT m.municipio, m.ibge6_clean, m.regiao_de_desenvolvimento,
			       COALESCE(a.arranjo_str, m.ibge6_clean) AS codigo_match,
			       COALESCE(a.nome_arranjo, '-') AS nome_arranjo
			FROM muns_base m
			LEFT JOIN arranjos_base a ON m.ibge6_clean = a.ibge6_str
		)
		SELECT mr.*, r.* EXCLUDE (name)
		FROM muns_regic mr
		LEFT JOIN v_regic r ON mr.codigo_match = SUBSTR(CAST(r.name AS VARCHAR), 1, 6)
	`
	dfRegic, err := QueryToMaps(DuckDB, queryRegic)
	if err == nil {
		DfRegicPE = dfRegic
		log.Printf("✅ REGIC pré-computado com %d registros.", len(dfRegic))
	} else {
		log.Printf("⚠️ Erro ao pré-computar REGIC: %v", err)
	}

	// Pré-computar Fluxos REGIC do estado (Dimensão 0 - Rotas)
	log.Println("⚡ Pré-computando Fluxos REGIC estaduais...")
	queryFluxos := `
		SELECT 
			f.*,
			COALESCE(CAST(dem_orig.latitude AS VARCHAR), '') AS origem_lat,
			COALESCE(CAST(dem_orig.longitude AS VARCHAR), '') AS origem_lon,
			COALESCE(dem_orig.regiao_de_desenvolvimento, '') AS origem_rd,
			COALESCE(CAST(dem_dest.latitude AS VARCHAR), '') AS destino_lat,
			COALESCE(CAST(dem_dest.longitude AS VARCHAR), '') AS destino_lon,
			COALESCE(dem_dest.regiao_de_desenvolvimento, '') AS destino_rd
		FROM v_fluxos f
		LEFT JOIN v_demografia dem_orig ON SUBSTR(CAST(f.origem AS VARCHAR), 1, 6) = dem_orig.ibge6_clean
		LEFT JOIN v_demografia dem_dest ON SUBSTR(CAST(f.destino AS VARCHAR), 1, 6) = dem_dest.ibge6_clean
	`
	dfFluxos, err := QueryToMaps(DuckDB, queryFluxos)
	if err == nil {
		DfFluxosPE = dfFluxos
		log.Printf("✅ Fluxos REGIC pré-computados com %d registros.", len(dfFluxos))
	} else {
		log.Printf("⚠️ Erro ao pré-computar Fluxos REGIC: %v", err)
	}

	// Pré-carregar Diagnóstico de Desenvolvimento Regional
	log.Println("⚡ Carregando Diagnóstico de Desenvolvimento Regional...")
	diagPath := "data/diagnostico_desenvolvimento_regional.json"
	diagData, err := os.ReadFile(diagPath)
	if err == nil {
		var dj struct {
			Metadados struct {
				FontesReferencia map[string]interface{} `json:"fontes_referencia"`
			} `json:"metadados"`
			Municipios []map[string]interface{} `json:"municipios"`
		}
		if err := json.Unmarshal(diagData, &dj); err == nil {
			FontesReferencia = dj.Metadados.FontesReferencia
			DiagnosticoRegional = make(map[string]interface{})
			for _, m := range dj.Municipios {
				if nome, ok := m["municipio"].(string); ok {
					DiagnosticoRegional[strings.ToLower(strings.TrimSpace(nome))] = m
				}
			}
			log.Printf("✅ Diagnóstico Regional carregado com sucesso para %d municípios.", len(DiagnosticoRegional))
		} else {
			log.Printf("⚠️ Erro ao decodificar %s: %v", diagPath, err)
		}
	} else {
		log.Printf("⚠️ Aviso: Arquivo %s não encontrado: %v", diagPath, err)
	}

	return nil
}

// QueryToMaps executa uma query SQL no DuckDB e converte em slice de mapas com strings, tratando NULLs como "-"
func QueryToMaps(db *sql.DB, query string, args ...interface{}) ([]map[string]string, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return []map[string]string{}, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return []map[string]string{}, err
	}

	results := make([]map[string]string, 0)
	count := len(cols)
	values := make([]interface{}, count)
	valuePtrs := make([]interface{}, count)

	for rows.Next() {
		for i := range cols {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return results, err
		}

		rowMap := make(map[string]string, count)
		for i, col := range cols {
			val := values[i]
			if val == nil {
				rowMap[col] = "-"
			} else {
				switch v := val.(type) {
				case []byte:
					rowMap[col] = string(v)
				case string:
					if v == "" || v == "NA" {
						rowMap[col] = "-"
					} else {
						rowMap[col] = v
					}
				default:
					rowMap[col] = fmt.Sprintf("%v", v)
				}
			}
		}
		results = append(results, rowMap)
	}

	return results, nil
}

// QueryToSingleRowColumns executa uma query e converte uma única linha em map[string][]string (formato as.list(df) do R)
func QueryToSingleRowColumns(db *sql.DB, query string, args ...interface{}) (map[string][]string, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return make(map[string][]string), err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return make(map[string][]string), err
	}

	colMap := make(map[string][]string, len(cols))
	if !rows.Next() {
		for _, col := range cols {
			colMap[col] = []string{"-"}
		}
		return colMap, nil
	}

	values := make([]interface{}, len(cols))
	valuePtrs := make([]interface{}, len(cols))
	for i := range cols {
		valuePtrs[i] = &values[i]
	}

	if err := rows.Scan(valuePtrs...); err != nil {
		return colMap, err
	}

	for i, col := range cols {
		val := values[i]
		if val == nil {
			colMap[col] = []string{"-"}
		} else {
			switch v := val.(type) {
			case []byte:
				colMap[col] = []string{string(v)}
			case string:
				if v == "" || v == "NA" {
					colMap[col] = []string{"-"}
				} else {
					colMap[col] = []string{v}
				}
			default:
				colMap[col] = []string{fmt.Sprintf("%v", v)}
			}
		}
	}

	return colMap, nil
}
