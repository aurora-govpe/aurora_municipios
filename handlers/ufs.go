package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	cacheUFsMutex        sync.RWMutex
	cacheUFsData         = make(map[string]gin.H)
	cacheMetadadosUFsRaw []byte
)

// Caminho padrão onde o ETL R salva o JSON
var CaminhoMetadadosUFsJSON = filepath.Join("data", "json", "metadados_indicadores_ufs.json")

// InvalidarCacheUFs limpa a RAM caso o ETL atualize os arquivos em disco
func InvalidarCacheUFs() {
	cacheUFsMutex.Lock()
	defer cacheUFsMutex.Unlock()
	cacheUFsData = make(map[string]gin.H)
	cacheMetadadosUFsRaw = nil
}

// GetUFsMetadados serve o arquivo metadados_indicadores_ufs.json direto da RAM
func GetUFsMetadados(c *gin.Context) {
	c.Header("Content-Type", "application/json; charset=utf-8")

	cacheUFsMutex.RLock()
	if len(cacheMetadadosUFsRaw) > 0 {
		data := cacheMetadadosUFsRaw
		cacheUFsMutex.RUnlock()
		c.Writer.Write(data)
		return
	}
	cacheUFsMutex.RUnlock()

	// Busca em caminhos candidatos caso o binário rode da raiz ou de subpasta
	caminhosCandidatos := []string{
		CaminhoMetadadosUFsJSON,
		filepath.Join("etl", "data", "json", "metadados_indicadores_ufs.json"),
		filepath.Join("..", "data", "json", "metadados_indicadores_ufs.json"),
	}

	var conteudo []byte
	var err error
	for _, p := range caminhosCandidatos {
		conteudo, err = os.ReadFile(p)
		if err == nil && len(conteudo) > 0 {
			break
		}
	}

	if err != nil || len(conteudo) == 0 {
		log.Printf("⚠️ Metadados UFs JSON não encontrado (%v). Retornando objeto vazio.", err)
		c.JSON(http.StatusOK, gin.H{})
		return
	}

	cacheUFsMutex.Lock()
	cacheMetadadosUFsRaw = conteudo
	cacheUFsMutex.Unlock()

	c.Writer.Write(conteudo)
}

var ListaUFsPadrao = []string{
	"AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
	"MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
	"RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
}

// GetUFsFiscal retorna o JSON fiscal diretamente da memória RAM
func GetUFsFiscal(c *gin.Context) {
	c.Header("Content-Type", "application/json; charset=utf-8")
	if len(BasePainelJSON) == 0 {
		c.JSON(http.StatusOK, gin.H{"dados": []interface{}{}, "filtros": gin.H{}})
		return
	}
	c.Writer.Write(BasePainelJSON)
}

// GetUFsFiltros retorna os filtros e metadados para a aba UFs
func GetUFsFiltros(c *gin.Context) {
	ufs := ListaUFsPadrao

	// Consulta UFs distintas da tabela parquet
	rows, err := DuckDB.Query("SELECT DISTINCT sg_uf FROM v_indicadores_ufs WHERE sg_uf IS NOT NULL AND sg_uf != '' ORDER BY sg_uf ASC")
	if err == nil {
		defer rows.Close()
		var ufsDb []string
		for rows.Next() {
			var u string
			if err := rows.Scan(&u); err == nil && u != "" {
				ufsDb = append(ufsDb, u)
			}
		}
		if len(ufsDb) > 0 {
			ufs = ufsDb
		}
	}

	// Consulta anos disponíveis
	var anos []int
	rowsAnos, err := DuckDB.Query("SELECT DISTINCT CAST(ano AS INT) AS a FROM v_indicadores_ufs WHERE ano IS NOT NULL ORDER BY a DESC")
	if err == nil {
		defer rowsAnos.Close()
		for rowsAnos.Next() {
			var a int
			if err := rowsAnos.Scan(&a); err == nil {
				anos = append(anos, a)
			}
		}
	}

	// Indicadores disponíveis agrupados
	indicadoresQuery := `
		SELECT DISTINCT sigla_indicador, nm_indicador, grupo, tipo 
		FROM v_indicadores_ufs 
		ORDER BY grupo, nm_indicador
	`
	inds, _ := QueryToMaps(DuckDB, indicadoresQuery)

	c.JSON(http.StatusOK, gin.H{
		"ufs":         ufs,
		"anos":        anos,
		"indicadores": inds,
		"default_uf":  "PE",
	})
}

// GetUFsData retorna os indicadores de uma UF específica e os benchmarks de Regiões (NE e BR)
func GetUFsData(c *gin.Context) {
	uf := strings.ToUpper(strings.TrimSpace(c.DefaultQuery("uf", "PE")))
	if uf == "" {
		uf = "PE"
	}

	cacheKey := uf
	cacheUFsMutex.RLock()
	if cached, ok := cacheUFsData[cacheKey]; ok {
		cacheUFsMutex.RUnlock()
		c.JSON(http.StatusOK, cached)
		return
	}
	cacheUFsMutex.RUnlock()

	// 1. Indicadores da UF selecionada com ranking nacional computado (particionado também por mes_referencia)
	queryUF := `
WITH ranking_calc AS (
    SELECT 
        cod_uf, sg_uf, nm_uf, CAST(ano AS INT) as ano, 
        nm_indicador, sigla_indicador, grupo, tipo, 
        COALESCE(LOWER(TRIM(polaridade)), '') as polaridade,
        TRY_CAST(indicador AS DOUBLE) as valor,
        COALESCE(CAST(mes_referencia AS VARCHAR), '') as mes_referencia,
        RANK() OVER (
            PARTITION BY sigla_indicador, CAST(ano AS INT), COALESCE(CAST(mes_referencia AS VARCHAR), '')
            ORDER BY 
                CASE WHEN (sigla_indicador LIKE 'aba_em%' OR sigla_indicador LIKE 'tdi_em%' OR sigla_indicador = 'deficit_hab') 
                     THEN TRY_CAST(indicador AS DOUBLE) END ASC,
                CASE WHEN NOT (sigla_indicador LIKE 'aba_em%' OR sigla_indicador LIKE 'tdi_em%' OR sigla_indicador = 'deficit_hab') 
                     THEN TRY_CAST(indicador AS DOUBLE) END DESC
        ) as rank_br,
        CASE WHEN UPPER(sg_uf) IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN
            DENSE_RANK() OVER (
                PARTITION BY sigla_indicador, CAST(ano AS INT), COALESCE(CAST(mes_referencia AS VARCHAR), '')
                ORDER BY 
                    CASE WHEN UPPER(sg_uf) IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 1 ELSE 2 END,
                    CASE WHEN (sigla_indicador LIKE 'aba_em%' OR sigla_indicador LIKE 'tdi_em%' OR sigla_indicador = 'deficit_hab') 
                         THEN TRY_CAST(indicador AS DOUBLE) END ASC,
                    CASE WHEN NOT (sigla_indicador LIKE 'aba_em%' OR sigla_indicador LIKE 'tdi_em%' OR sigla_indicador = 'deficit_hab') 
                         THEN TRY_CAST(indicador AS DOUBLE) END DESC
            )
        ELSE NULL END as rank_ne
    FROM v_indicadores_ufs
    WHERE TRY_CAST(indicador AS DOUBLE) IS NOT NULL
)
SELECT 
    cod_uf, sg_uf, nm_uf, ano, 
    nm_indicador, sigla_indicador, grupo, tipo, polaridade,
    valor, mes_referencia, rank_br, rank_ne
FROM ranking_calc
WHERE UPPER(sg_uf) = ?
ORDER BY ano DESC, mes_referencia DESC, nm_indicador ASC
`
	rowsUF, errUF := DuckDB.Query(queryUF, uf)
	var indicadoresUF []map[string]interface{}
	if errUF == nil {
		defer rowsUF.Close()
		for rowsUF.Next() {
			var codUf, sgUf, nmUf, nmInd, siglaInd, grupo, tipo, polaridade, mesRef string
			var ano int
			var valor *float64
			var rankBr, rankNe *int
			if err := rowsUF.Scan(&codUf, &sgUf, &nmUf, &ano, &nmInd, &siglaInd, &grupo, &tipo, &polaridade, &valor, &mesRef, &rankBr, &rankNe); err == nil {
				item := map[string]interface{}{
					"cod_uf":          codUf,
					"sg_uf":           sgUf,
					"nm_uf":           nmUf,
					"ano":             ano,
					"nm_indicador":    nmInd,
					"sigla_indicador": siglaInd,
					"grupo":           grupo,
					"tipo":            tipo,
					"polaridade":      polaridade,
					"mes_referencia":  mesRef,
					"valor":           valor,
					"rank_br":         rankBr,
					"rank_ne":         rankNe,
				}
				indicadoresUF = append(indicadoresUF, item)
			}
		}
	} else {
		log.Printf("⚠️ Erro ao consultar v_indicadores_ufs para UF %s: %v", uf, errUF)
	}

	// 2. Benchmarks Regionais (Nordeste e Brasil)
	queryReg := `
		SELECT 
			cod_regiao, sg_regiao, nm_regiao, CAST(ano AS INT) as ano, 
			nm_indicador, sigla_indicador, grupo, tipo, 
			TRY_CAST(indicador AS DOUBLE) as valor,
			COALESCE(CAST(mes_referencia AS VARCHAR), '') as mes_referencia
		FROM v_indicadores_regioes
		WHERE sg_regiao IN ('NE', 'BR')
		ORDER BY ano DESC, mes_referencia DESC, sg_regiao ASC, nm_indicador ASC
	`
	rowsReg, errReg := DuckDB.Query(queryReg)
	var benchmarksReg []map[string]interface{}
	if errReg == nil {
		defer rowsReg.Close()
		for rowsReg.Next() {
			var codReg, sgReg, nmReg, nmInd, siglaInd, grupo, tipo, mesRef string
			var ano int
			var valor *float64
			if err := rowsReg.Scan(&codReg, &sgReg, &nmReg, &ano, &nmInd, &siglaInd, &grupo, &tipo, &valor, &mesRef); err == nil {
				item := map[string]interface{}{
					"cod_regiao":      codReg,
					"sg_regiao":       sgReg,
					"nm_regiao":       nmReg,
					"ano":             ano,
					"nm_indicador":    nmInd,
					"sigla_indicador": siglaInd,
					"grupo":           grupo,
					"tipo":            tipo,
					"mes_referencia":  mesRef,
					"valor":           valor,
				}
				benchmarksReg = append(benchmarksReg, item)
			}
		}
	}

	resp := gin.H{
		"uf":                uf,
		"indicadores":       indicadoresUF,
		"benchmarks_regiao": benchmarksReg,
	}

	cacheUFsMutex.Lock()
	cacheUFsData[cacheKey] = resp
	cacheUFsMutex.Unlock()

	c.JSON(http.StatusOK, resp)
}

// GetUFsRanking retorna a comparação entre todas as 27 UFs para um determinado indicador, ano e mês (quando mensal)
func GetUFsRanking(c *gin.Context) {
	sigla := strings.TrimSpace(c.Query("sigla_indicador"))
	anoStr := strings.TrimSpace(c.Query("ano"))
	mesStr := strings.TrimSpace(c.Query("mes"))

	if sigla == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sigla_indicador é obrigatória"})
		return
	}

	var anoInt int
	if anoStr != "" {
		anoInt, _ = strconv.Atoi(anoStr)
	}

	var mesInt int
	if mesStr != "" {
		mesInt, _ = strconv.Atoi(mesStr)
	}

	orderDir := "DESC"
	if strings.HasPrefix(sigla, "aba_em") || strings.HasPrefix(sigla, "tdi_em") ||
		sigla == "perdas_distribuicao_agua" || sigla == "custo_medio_agua" ||
		sigla == "tarifa_media_agua" || sigla == "custo_medio_esgoto" ||
		sigla == "tarifa_media_esgoto" || sigla == "deficit_hab" {
		orderDir = "ASC"
	}

	// Expressão SQL para extrair o número do mês (1..12) independente se mes_referencia vier como "3", "03", "2025-03" ou vazio
	exprMesSQL := `COALESCE(
		TRY_CAST(NULLIF(TRIM(CAST(mes_referencia AS VARCHAR)), '') AS INT),
		TRY_CAST(SPLIT_PART(TRIM(CAST(mes_referencia AS VARCHAR)), '-', 2) AS INT),
		0
	)`

	// Resolve o ano e o mês alvo:
	// - Se anoInt e mesInt forem enviados e existirem, usa exatamente eles.
	// - Caso contrário, pega o (ano, mês) mais recente disponível para o indicador.
	queryPeriodo := fmt.Sprintf(`
		WITH base AS (
			SELECT 
				CAST(ano AS INT) AS a,
				%s AS m
			FROM v_indicadores_ufs
			WHERE sigla_indicador = ? AND TRY_CAST(indicador AS DOUBLE) IS NOT NULL
		)
		SELECT a, m
		FROM base
		ORDER BY 
			CASE WHEN (? > 0 AND a = ? AND (? = 0 OR m = ?)) THEN 0 ELSE 1 END ASC,
			a DESC,
			m DESC
		LIMIT 1
	`, exprMesSQL)

	var anoEscolhido, mesEscolhido int
	errPer := DuckDB.QueryRow(queryPeriodo, sigla, anoInt, anoInt, mesInt, mesInt).Scan(&anoEscolhido, &mesEscolhido)
	if errPer != nil {
		c.JSON(http.StatusOK, gin.H{
			"sigla_indicador": sigla,
			"ranking":         []map[string]interface{}{},
			"benchmarks":      []map[string]interface{}{},
		})
		return
	}

	query := fmt.Sprintf(`
		SELECT 
			u.sg_uf, u.nm_uf, CAST(u.ano AS INT) as ano, 
			COALESCE(CAST(u.mes_referencia AS VARCHAR), '') as mes_referencia,
			TRY_CAST(u.indicador AS DOUBLE) as valor,
			u.sigla_indicador, u.nm_indicador, u.tipo
		FROM v_indicadores_ufs u
		WHERE u.sigla_indicador = ?
		  AND CAST(u.ano AS INT) = ?
		  AND (%s) = ?
		  AND TRY_CAST(u.indicador AS DOUBLE) IS NOT NULL
		ORDER BY TRY_CAST(u.indicador AS DOUBLE) %s
	`, strings.ReplaceAll(exprMesSQL, "mes_referencia", "u.mes_referencia"), orderDir)

	rows, err := DuckDB.Query(query, sigla, anoEscolhido, mesEscolhido)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Erro ao consultar ranking: %v", err)})
		return
	}
	defer rows.Close()

	var ranking []map[string]interface{}
	pos := 1
	for rows.Next() {
		var sgUf, nmUf, mesRef, siglaInd, nmInd, tipo string
		var ano int
		var valor *float64
		if err := rows.Scan(&sgUf, &nmUf, &ano, &mesRef, &valor, &siglaInd, &nmInd, &tipo); err == nil {
			ranking = append(ranking, map[string]interface{}{
				"posicao":         pos,
				"sg_uf":           sgUf,
				"nm_uf":           nmUf,
				"ano":             ano,
				"mes_referencia":  mesRef,
				"valor":           valor,
				"sigla_indicador": siglaInd,
				"nm_indicador":    nmInd,
				"tipo":            tipo,
			})
			pos++
		}
	}

	// Benchmarks Regionais (NE e BR) filtrados pelo mesmo ano e mês escolhido
	exprMesRegSQL := strings.ReplaceAll(exprMesSQL, "mes_referencia", "r.mes_referencia")
	benchQuery := fmt.Sprintf(`
		WITH periodo_reg AS (
			SELECT CAST(r.ano AS INT) AS a, (%s) AS m
			FROM v_indicadores_regioes r
			WHERE r.sigla_indicador = ? 
			  AND r.sg_regiao IN ('NE', 'BR')
			  AND TRY_CAST(r.indicador AS DOUBLE) IS NOT NULL
			ORDER BY 
				CASE WHEN (CAST(r.ano AS INT) = ? AND (%s) = ?) THEN 0 ELSE 1 END ASC,
				CAST(r.ano AS INT) DESC,
				(%s) DESC
			LIMIT 1
		)
		SELECT r.sg_regiao, r.nm_regiao, CAST(r.ano AS INT) as ano, TRY_CAST(r.indicador AS DOUBLE) as valor
		FROM v_indicadores_regioes r
		JOIN periodo_reg p ON CAST(r.ano AS INT) = p.a AND (%s) = p.m
		WHERE r.sigla_indicador = ? 
		  AND r.sg_regiao IN ('NE', 'BR') 
		  AND TRY_CAST(r.indicador AS DOUBLE) IS NOT NULL
	`, exprMesRegSQL, exprMesRegSQL, exprMesRegSQL, exprMesRegSQL)

	rowsBench, errBench := DuckDB.Query(benchQuery, sigla, anoEscolhido, mesEscolhido, sigla)
	var benchmarks []map[string]interface{}
	if errBench == nil {
		defer rowsBench.Close()
		for rowsBench.Next() {
			var sgReg, nmReg string
			var a int
			var v *float64
			if err := rowsBench.Scan(&sgReg, &nmReg, &a, &v); err == nil {
				benchmarks = append(benchmarks, map[string]interface{}{
					"sg_regiao": sgReg,
					"nm_regiao": nmReg,
					"ano":       a,
					"valor":     v,
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"sigla_indicador": sigla,
		"ano":             anoEscolhido,
		"mes":             mesEscolhido,
		"ranking":         ranking,
		"benchmarks":      benchmarks,
	})
}