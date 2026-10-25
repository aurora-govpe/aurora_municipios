package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type AuroraPerguntarRequest struct {
	Mensagem string `json:"mensagem"`
}

var spaceRegex = regexp.MustCompile(`\s+`)

const auroraSystemPrompt = `Você é a Aurora, inteligência analítica de dados oficial do Governo de Pernambuco.

VOCÊ TEM ACESSO DIRETO A TODOS OS DADOS DA PLATAFORMA AURORA:
1. Indicadores Socioeconômicos (IBGE, DataSUS, Inep, Anatel): Demografia, Saúde, Educação (IDEB), Segurança (MVI), Economia (PIB, VAB), Inovação & TI (InfoCom), Saneamento e Vulnerabilidade (IVCAD).
2. Finanças Públicas & CAPAG (STN): Receita Corrente Líquida (RCL), Despesa de Pessoal (DTP/RCL), Investimentos, e Classificação da Capacidade de Pagamento (CAPAG A, B, C, D).
3. Emendas Parlamentares: Valores pagos, deputados/senadores autores e funções orçamentárias destinadas aos municípios.
4. Iniciativas & Obras do Governo: Portfólio de projetos do Estado, eixos estratégicos, secretarias/órgãos e status de execução.
5. Vocações Produtivas & Mercado de Trabalho (RAIS/CNAE): Vínculos formais, setores líderes e massa salarial.
6. Dinâmica Regional & Redes (REGIC/IBGE): As 12 Regiões de Desenvolvimento (RDs), hierarquia urbana, polos de atração e fluxos territoriais.
7. Consórcios Públicos Intermunicipais: Os 13 consórcios de Pernambuco (CONIAPE, AMESG, CISAPE, COMAGSUL, CONSEG, etc.) e seus municípios membros.
8. Águas de Pernambuco (COMPESA / SRHS): R$ 14,8 Bi em investimentos, 560 projetos, cronograma plurianual de desembolso 2026-2030 (R$ 7,7 Bi).
9. Rede de Adutoras de Pernambuco: 124 traçados adutores e sistemas (Existentes, Em Obras e Planejados).
10. Comparativo Nacional (UFs): Pernambuco frente aos outros 26 estados e ao Brasil em PIB, mercado de trabalho e indicadores sociais.

DIRETRIZES DE RESPOSTA:
- Sempre que houver informações na seção [DADOS DA PLATAFORMA AURORA], fundamente sua resposta rigorosamente nesses dados reais e cite números exatos.
- Se o usuário perguntar sobre um município específico, monte uma visão analítica completa integrando demografia, finanças/CAPAG, emendas, obras e destaques socioeconômicos.
- Se o usuário perguntar sobre rankings, liste os municípios com os respectivos valores e posições.
- Se o usuário perguntar sobre águas, saneamento ou adutoras, utilize os dados da Compesa e da rede de adutoras.
- Formate suas respostas em Markdown limpo, usando tópicos, tabelas comparativas quando pertinente e números destacados em negrito.
- Seja direta, analítica e fundamentada em dados públicos e oficiais de Pernambuco.`

// PostAuroraPerguntar responde perguntas analíticas sobre os municípios e indicadores de Pernambuco
func PostAuroraPerguntar(c *gin.Context) {
	var req AuroraPerguntarRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Mensagem) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"resposta": "Mensagem inválida ou vazia."})
		return
	}

	msgLimpa := strings.TrimSpace(req.Mensagem)
	chaveCache := strings.ToLower(strings.TrimSpace(spaceRegex.ReplaceAllString(msgLimpa, " ")))

	// 1. CONSULTA AO CACHE SQLITE
	if SQLiteDB != nil {
		var respCache string
		err := SQLiteDB.QueryRow("SELECT resposta FROM cache_aurora WHERE chave = ? LIMIT 1", chaveCache).Scan(&respCache)
		if err == nil && respCache != "" {
			log.Println("[Aurora] ⚡ Resposta recuperada do CACHE SQLite!")
			c.JSON(http.StatusOK, gin.H{"resposta": respCache})
			return
		}
	}

	if GeminiKey == "" {
		c.JSON(http.StatusOK, gin.H{"resposta": "⚠️ Erro: Chave da API do Gemini não foi carregada pelo servidor."})
		return
	}

	// 2. ENRIQUECIMENTO DE CONTEXTO COM TODA A BASE DE DADOS
	contextoExtra := buscarContextoDados(msgLimpa)

	// 3. CHAMADA À API DO GEMINI
	respostaIA, err := chamarGeminiAPI(msgLimpa, contextoExtra)
	if err != nil {
		log.Printf("⚠️ Erro na chamada Gemini API: %v", err)
		c.JSON(http.StatusOK, gin.H{"resposta": fmt.Sprintf("⚠️ Erro ao consultar assistente inteligente: %v", err)})
		return
	}

	// 4. SALVAR NO CACHE SQLITE
	salvarCache(chaveCache, respostaIA)

	c.JSON(http.StatusOK, gin.H{"resposta": respostaIA})
}

func salvarCache(chave, resposta string) {
	if SQLiteDB == nil {
		return
	}
	_, err := SQLiteDB.Exec("INSERT OR REPLACE INTO cache_aurora (chave, resposta) VALUES (?, ?)", chave, resposta)
	if err != nil {
		log.Printf("⚠️ Erro ao salvar cache SQLite: %v", err)
	}
}

// buscarContextoDados realiza busca multidimensional nos dados da plataforma para alimentar o Gemini
func buscarContextoDados(mensagem string) string {
	if DuckDB == nil {
		return ""
	}

	var sb strings.Builder
	msgLower := strings.ToLower(mensagem)

	sb.WriteString("[DADOS DA PLATAFORMA AURORA DISPONÍVEIS PARA ESTA CONSULTA]:\n")

	// -------------------------------------------------------------
	// 1. DETECÇÃO E DADOS DE MUNICÍPIOS ESPECÍFICOS
	// -------------------------------------------------------------
	munsEncontrados := detectarMunicipiosNaMensagem(msgLower)
	if len(munsEncontrados) > 0 {
		for _, mun := range munsEncontrados {
			sb.WriteString(fmt.Sprintf("\n--- MUNICÍPIO: %s ---\n", strings.ToUpper(mun)))

			// Demografia e CAPAG
			demo, err := QueryToMaps(DuckDB, `
				SELECT d.municipio, d.regiao_de_desenvolvimento, d.pop_2026, d.area_km2, d.rank_pop,
				       COALESCE(c.indicador, 'n.d.') AS capag
				FROM v_demografia d
				LEFT JOIN (
					SELECT ibge6_clean, indicador 
					FROM v_indicadores 
					WHERE LOWER(sigla_indicador) = 'capag' OR LOWER(nm_indicador) = 'capag'
				) c ON d.ibge6_clean = c.ibge6_clean
				WHERE LOWER(d.municipio) = LOWER(?) LIMIT 1
			`, mun)
			if err == nil && len(demo) > 0 {
				d := demo[0]
				sb.WriteString(fmt.Sprintf("• Demografia & Perfil: População Estimada 2026 = %s hab. (Rank Estadual: %sº) | RD: %s | Área: %s km² | Nota CAPAG (STN): %s\n",
					d["pop_2026"], d["rank_pop"], d["regiao_de_desenvolvimento"], d["area_km2"], d["capag"]))
			}

			// Indicadores Socioeconômicos (Saúde, Educação, Segurança, Economia, TI, etc.)
			ind, err := QueryToMaps(DuckDB, `
				SELECT grupo, nm_indicador, sigla_indicador, indicador, ano, rank_pe
				FROM v_indicadores
				WHERE LOWER(nm_municipio) = LOWER(?)
				QUALIFY ROW_NUMBER() OVER (PARTITION BY nm_indicador ORDER BY ano DESC) = 1
				ORDER BY grupo, nm_indicador
				LIMIT 25
			`, mun)
			if err == nil && len(ind) > 0 {
				sb.WriteString("• Indicadores Socioeconômicos Recentes:\n")
				for _, item := range ind {
					sb.WriteString(fmt.Sprintf("  - [%s] %s: %s (Ano %s, Posição PE: %sº)\n",
						item["grupo"], item["nm_indicador"], item["indicador"], item["ano"], item["rank_pe"]))
				}
			}

			// Finanças Públicas
			fisc, err := QueryToMaps(DuckDB, `
				SELECT grupo, indicador, valor, exercicio, rank_pe
				FROM v_fiscais
				WHERE LOWER(ente) = LOWER(?) OR LOWER(ente) = LOWER(?)
				ORDER BY exercicio DESC, indicador ASC
				LIMIT 8
			`, mun, "Município de "+mun)
			if err == nil && len(fisc) > 0 {
				sb.WriteString("• Finanças Públicas (Siconfi/STN):\n")
				for _, f := range fisc {
					sb.WriteString(fmt.Sprintf("  - %s: %s (Exercício %s, Rank PE: %sº)\n",
						f["indicador"], f["valor"], f["exercicio"], f["rank_pe"]))
				}
			}

			// Emendas Parlamentares
			eme, err := QueryToMaps(DuckDB, `
				SELECT autor, funcao, valor_pago, ano, objeto
				FROM v_emendas
				WHERE LOWER(nm_municipio) = LOWER(?)
				ORDER BY valor_pago DESC
				LIMIT 5
			`, mun)
			if err == nil && len(eme) > 0 {
				sb.WriteString("• Principais Emendas Parlamentares Recebidas:\n")
				for _, e := range eme {
					sb.WriteString(fmt.Sprintf("  - R$ %s destinada por %s (%s, Ano %s)\n",
						e["valor_pago"], e["autor"], e["funcao"], e["ano"]))
				}
			}

			// Iniciativas do Governo do Estado
			ini, err := QueryToMaps(DuckDB, `
				SELECT nome_iniciativa, orgao, status, valor_investimento
				FROM v_iniciativas
				WHERE LOWER(municipio) = LOWER(?)
				LIMIT 4
			`, mun)
			if err == nil && len(ini) > 0 {
				sb.WriteString("• Ações & Obras Governamentais no Município:\n")
				for _, i := range ini {
					sb.WriteString(fmt.Sprintf("  - %s | Órgão: %s | Status: %s | Investimento: R$ %s\n",
						i["nome_iniciativa"], i["orgao"], i["status"], i["valor_investimento"]))
				}
			}

			// Vocações Econômicas / RAIS
			voc, err := QueryToMaps(DuckDB, `
				SELECT descricao_divisao, qtd_vinculos, massa_salarial
				FROM v_vocacoes
				WHERE LOWER(municipio) = LOWER(?)
				ORDER BY TRY_CAST(qtd_vinculos AS BIGINT) DESC
				LIMIT 3
			`, mun)
			if err == nil && len(voc) > 0 {
				sb.WriteString("• Vocações Econômicas Principais (RAIS):\n")
				for _, v := range voc {
					sb.WriteString(fmt.Sprintf("  - %s: %s vínculos formais (Massa Salarial: R$ %s)\n",
						v["descricao_divisao"], v["qtd_vinculos"], v["massa_salarial"]))
				}
			}

			// Consórcios aos quais pertence
			consorciosPE := carregarConsorciosPE()
			var consDoMun []string
			for _, c := range consorciosPE {
				if strings.EqualFold(c.MunicipioConsorciado, mun) {
					consDoMun = append(consDoMun, c.Consorcio)
				}
			}
			if len(consDoMun) > 0 {
				sb.WriteString(fmt.Sprintf("• Consórcios Públicos Integrados: %s\n", strings.Join(consDoMun, "; ")))
			}
		}
	}

	// -------------------------------------------------------------
	// 2. DETECÇÃO DE REGIÕES DE DESENVOLVIMENTO (RDs)
	// -------------------------------------------------------------
	rdsDetectadas := detectarRDsNaMensagem(msgLower)
	if len(rdsDetectadas) > 0 {
		for _, rd := range rdsDetectadas {
			sb.WriteString(fmt.Sprintf("\n--- REGIÃO DE DESENVOLVIMENTO: %s ---\n", strings.ToUpper(rd)))
			resRD, err := QueryToMaps(DuckDB, `
				SELECT COUNT(*) AS total_muns,
				       SUM(TRY_CAST(pop_2026 AS BIGINT)) AS pop_total_rd,
				       SUM(TRY_CAST(area_km2 AS DOUBLE)) AS area_total_rd
				FROM v_demografia
				WHERE LOWER(regiao_de_desenvolvimento) = LOWER(?)
			`, rd)
			if err == nil && len(resRD) > 0 {
				r := resRD[0]
				sb.WriteString(fmt.Sprintf("• Total de Municípios: %s | População Estimada da RD: %s hab. | Área Total: %s km²\n",
					r["total_muns"], r["pop_total_rd"], r["area_total_rd"]))
			}

			// Lista dos municípios da RD
			munsList, err := QueryToMaps(DuckDB, `
				SELECT municipio, pop_2026 FROM v_demografia
				WHERE LOWER(regiao_de_desenvolvimento) = LOWER(?)
				ORDER BY TRY_CAST(pop_2026 AS BIGINT) DESC
			`, rd)
			if err == nil && len(munsList) > 0 {
				var nomes []string
				for _, ml := range munsList {
					nomes = append(nomes, fmt.Sprintf("%s (%s hab)", ml["municipio"], ml["pop_2026"]))
				}
				sb.WriteString(fmt.Sprintf("• Municípios da RD: %s\n", strings.Join(nomes, ", ")))
			}
		}
	}

	// -------------------------------------------------------------
	// 3. CAPAG & SITUAÇÃO FISCAL GERAL
	// -------------------------------------------------------------
	if strings.Contains(msgLower, "capag") || strings.Contains(msgLower, "capacidade de pagamento") || strings.Contains(msgLower, "fiscal") {
		sb.WriteString("\n--- CAPACIDADE DE PAGAMENTO (CAPAG / STN) EM PERNAMBUCO ---\n")
		sb.WriteString("• Regra STN: A CAPAG mede a saúde fiscal dos entes públicos. Notas A e B indicam situação fiscal sólida e elegibilidade para garantia da União em operações de crédito. Notas C e D indicam vulnerabilidade fiscal e incapacidade de obter aval federal.\n")
		
		// Distribuição de notas
		resCapag, err := QueryToMaps(DuckDB, `
			SELECT COALESCE(c.indicador, 'n.d.') AS nota, COUNT(*) AS qtd
			FROM v_demografia d
			LEFT JOIN (
				SELECT ibge6_clean, indicador 
				FROM v_indicadores 
				WHERE LOWER(sigla_indicador) = 'capag' OR LOWER(nm_indicador) = 'capag'
			) c ON d.ibge6_clean = c.ibge6_clean
			GROUP BY nota
			ORDER BY nota ASC
		`)
		if err == nil && len(resCapag) > 0 {
			var dist []string
			for _, rc := range resCapag {
				dist = append(dist, fmt.Sprintf("Nota %s: %s municípios", rc["nota"], rc["qtd"]))
			}
			sb.WriteString(fmt.Sprintf("• Distribuição das Notas em PE: %s\n", strings.Join(dist, " | ")))
		}

		// Exemplos de municípios com CAPAG A/A+
		munsA, err := QueryToMaps(DuckDB, `
			SELECT d.municipio, c.indicador AS nota
			FROM v_demografia d
			JOIN (
				SELECT ibge6_clean, indicador 
				FROM v_indicadores 
				WHERE (LOWER(sigla_indicador) = 'capag' OR LOWER(nm_indicador) = 'capag') AND (indicador = 'A' OR indicador = 'A+')
			) c ON d.ibge6_clean = c.ibge6_clean
			ORDER BY d.municipio ASC
			LIMIT 12
		`)
		if err == nil && len(munsA) > 0 {
			var nomesA []string
			for _, ma := range munsA {
				nomesA = append(nomesA, fmt.Sprintf("%s (%s)", ma["municipio"], ma["nota"]))
			}
			sb.WriteString(fmt.Sprintf("• Municípios com Grau A/A+ (Exemplos): %s\n", strings.Join(nomesA, ", ")))
		}
	}

	// -------------------------------------------------------------
	// 4. ÁGUAS DE PERNAMBUCO & COMPESA & REDE DE ADUTORAS
	// -------------------------------------------------------------
	if strings.Contains(msgLower, "agua") || strings.Contains(msgLower, "água") ||
		strings.Contains(msgLower, "compesa") || strings.Contains(msgLower, "adutora") ||
		strings.Contains(msgLower, "saneamento") || strings.Contains(msgLower, "hídric") || strings.Contains(msgLower, "hidric") {
		sb.WriteString("\n--- PROGRAMA ÁGUAS DE PERNAMBUCO & COMPESA ---\n")
		sb.WriteString("• Investimento Total Previsto: R$ 14,83 Bilhões em 560 projetos e intervenções estruturantes.\n")
		sb.WriteString("• Cobertura: Atendimento aos 185 municípios de Pernambuco e cerca de 9,5 Milhões de beneficiados.\n")
		sb.WriteString("• Cronograma de Desembolso Financeiro (2026-2030): R$ 7,74 Bi no total (2026: R$ 1,48 Bi | 2027: R$ 1,95 Bi | 2028: R$ 1,84 Bi | 2029: R$ 1,43 Bi | 2030: R$ 1,04 Bi).\n")
		sb.WriteString("• Carteira de Projetos por Situação: Em Andamento (220 obras físicas), Concluído (40 intervenções), Em Licitação (85 editais), A Licitar (95 TRs), Em Elaboração de Projeto (120).\n")
		sb.WriteString("• Rede de Adutoras de Pernambuco: 124 traçados cadastrados no Estado, distribuídos em Sistemas Existentes (ex: SIN - Jatobá, SIN - Salgueiro, SIN - Sirigi, SIN - Prata), Sistemas em Obras (ex: SIN - Agreste e ampliações) e Sistemas Planejados.\n")
	}

	// -------------------------------------------------------------
	// 5. CONSÓRCIOS PÚBLICOS INTERMUNICIPAIS
	// -------------------------------------------------------------
	if strings.Contains(msgLower, "consorcio") || strings.Contains(msgLower, "consórcio") ||
		strings.Contains(msgLower, "coniape") || strings.Contains(msgLower, "comagsul") ||
		strings.Contains(msgLower, "amesg") || strings.Contains(msgLower, "cisape") ||
		strings.Contains(msgLower, "conseg") {
		sb.WriteString("\n--- CONSÓRCIOS PÚBLICOS INTERMUNICIPAIS DE PERNAMBUCO ---\n")
		sb.WriteString("• Os consórcios viabilizam gestão compartilhada de políticas públicas (saúde, compras públicas, segurança, iluminação e desenvolvimento regional).\n")
		consorciosList := carregarConsorciosPE()
		consorciosMunsMap := make(map[string][]string)
		for _, item := range consorciosList {
			consorciosMunsMap[item.Consorcio] = append(consorciosMunsMap[item.Consorcio], item.MunicipioConsorciado)
		}
		for nomeCons, munsCons := range consorciosMunsMap {
			if strings.Contains(msgLower, strings.ToLower(nomeCons)) || strings.Contains(msgLower, "todos") || len(consorciosMunsMap) <= 13 {
				sb.WriteString(fmt.Sprintf("• %s: %d municípios consorciados (Exemplos: %s)\n",
					nomeCons, len(munsCons), strings.Join(munsCons[:min(5, len(munsCons))], ", ")))
			}
		}
	}

	// -------------------------------------------------------------
	// 6. RANKINGS ESTADUAIS & EXTREMOS (TOP / MAIORES / MENORES)
	// -------------------------------------------------------------
	if strings.Contains(msgLower, "maior") || strings.Contains(msgLower, "melhor") ||
		strings.Contains(msgLower, "menor") || strings.Contains(msgLower, "pior") ||
		strings.Contains(msgLower, "ranking") || strings.Contains(msgLower, "top") {
		
		// Ranking Populacional
		if strings.Contains(msgLower, "popula") || strings.Contains(msgLower, "habitante") || strings.Contains(msgLower, "morador") {
			topPop, err := QueryToMaps(DuckDB, `
				SELECT municipio, pop_2026, rank_pop 
				FROM v_demografia 
				ORDER BY rank_pop ASC 
				LIMIT 10
			`)
			if err == nil && len(topPop) > 0 {
				sb.WriteString("\n• Top 10 Municípios Mais Populosos de PE (Estimativa 2026):\n")
				for _, tp := range topPop {
					sb.WriteString(fmt.Sprintf("  %sº %s: %s hab.\n", tp["rank_pop"], tp["municipio"], tp["pop_2026"]))
				}
			}
		}

		// Ranking de PIB e PIB per capita
		if strings.Contains(msgLower, "pib") || strings.Contains(msgLower, "economia") || strings.Contains(msgLower, "rico") {
			topPib, err := QueryToMaps(DuckDB, `
				SELECT nm_municipio, indicador, rank_pe 
				FROM v_indicadores 
				WHERE LOWER(sigla_indicador) = 'pibpc' 
				QUALIFY ROW_NUMBER() OVER (PARTITION BY nm_municipio ORDER BY ano DESC) = 1
				ORDER BY TRY_CAST(REPLACE(indicador, ',', '.') AS DOUBLE) DESC 
				LIMIT 10
			`)
			if err == nil && len(topPib) > 0 {
				sb.WriteString("\n• Top 10 Municípios com Maior PIB Per Capita de PE:\n")
				for i, tp := range topPib {
					sb.WriteString(fmt.Sprintf("  %dº %s: R$ %s\n", i+1, tp["nm_municipio"], tp["indicador"]))
				}
			}
		}

		// Ranking de Educação / IDEB
		if strings.Contains(msgLower, "ideb") || strings.Contains(msgLower, "educa") || strings.Contains(msgLower, "escola") {
			topIdeb, err := QueryToMaps(DuckDB, `
				SELECT nm_municipio, indicador, rank_pe 
				FROM v_indicadores 
				WHERE LOWER(sigla_indicador) = 'ideb_5ano' 
				QUALIFY ROW_NUMBER() OVER (PARTITION BY nm_municipio ORDER BY ano DESC) = 1
				ORDER BY TRY_CAST(REPLACE(indicador, ',', '.') AS DOUBLE) DESC 
				LIMIT 10
			`)
			if err == nil && len(topIdeb) > 0 {
				sb.WriteString("\n• Top 10 Municípios com Maior IDEB (Anos Iniciais) de PE:\n")
				for i, ti := range topIdeb {
					sb.WriteString(fmt.Sprintf("  %dº %s: Nota %s\n", i+1, ti["nm_municipio"], ti["indicador"]))
				}
			}
		}

		// Ranking de Emendas Parlamentares
		if strings.Contains(msgLower, "emenda") || strings.Contains(msgLower, "recurso parlamentar") {
			topEme, err := QueryToMaps(DuckDB, `
				SELECT nm_municipio, SUM(TRY_CAST(valor_pago AS DOUBLE)) AS total_pago
				FROM v_emendas
				GROUP BY nm_municipio
				ORDER BY total_pago DESC
				LIMIT 10
			`)
			if err == nil && len(topEme) > 0 {
				sb.WriteString("\n• Top 10 Municípios com Maior Volume de Emendas Pagas:\n")
				for i, te := range topEme {
					sb.WriteString(fmt.Sprintf("  %dº %s: R$ %s\n", i+1, te["nm_municipio"], te["total_pago"]))
				}
			}
		}
	}

	// -------------------------------------------------------------
	// 7. COMPARATIVO NACIONAL / UFs
	// -------------------------------------------------------------
	if strings.Contains(msgLower, "uf") || strings.Contains(msgLower, "brasil") ||
		strings.Contains(msgLower, "nacional") || strings.Contains(msgLower, "nordeste") ||
		strings.Contains(msgLower, "estado") {
		resUFs, err := QueryToMaps(DuckDB, `
			SELECT nome_uf, pib, pib_per_capita, taxa_desocupacao_media
			FROM v_indicadores_ufs
			WHERE uf = 'PE' OR uf = 'BR' OR uf = 'BA' OR uf = 'CE' OR uf = 'SP'
			ORDER BY uf DESC
			LIMIT 6
		`)
		if err == nil && len(resUFs) > 0 {
			sb.WriteString("\n--- COMPARATIVO NACIONAL (UFs / BRASIL) ---\n")
			for _, u := range resUFs {
				sb.WriteString(fmt.Sprintf("• %s: PIB = R$ %s | PIBpc = R$ %s | Taxa de Desocupação = %s%%\n",
					u["nome_uf"], u["pib"], u["pib_per_capita"], u["taxa_desocupacao_media"]))
			}
		}
	}

	return sb.String()
}

// detectarMunicipiosNaMensagem encontra nomes de municípios citados no texto
func detectarMunicipiosNaMensagem(msgLower string) []string {
	if DuckDB == nil {
		return nil
	}
	rows, err := DuckDB.Query("SELECT DISTINCT municipio FROM v_demografia ORDER BY LENGTH(municipio) DESC")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var encontrados []string
	for rows.Next() {
		var m string
		if err := rows.Scan(&m); err == nil && m != "" {
			mLower := strings.ToLower(m)
			// Evita falsos positivos com preposições ou palavras curtas
			if len(mLower) >= 4 && strings.Contains(msgLower, mLower) {
				encontrados = append(encontrados, m)
				if len(encontrados) >= 4 {
					break
				}
			}
		}
	}
	return encontrados
}

// detectarRDsNaMensagem encontra menções às 12 Regiões de Desenvolvimento
func detectarRDsNaMensagem(msgLower string) []string {
	var rds = []string{
		"Agreste Central", "Agreste Meridional", "Agreste Setentrional",
		"Araripe", "Itaparica", "Mata Norte", "Mata Sul",
		"Metropolitana", "Pajeú", "Sertão Central", "Sertão do Moxotó", "Sertão do São Francisco",
	}
	var encontradas []string
	for _, rd := range rds {
		if strings.Contains(msgLower, strings.ToLower(rd)) {
			encontradas = append(encontradas, rd)
		}
	}
	return encontradas
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []geminiPart `json:"parts"`
}

type geminiRequest struct {
	SystemInstruction *geminiContent  `json:"system_instruction,omitempty"`
	Contents          []geminiContent `json:"contents"`
	GenerationConfig  map[string]any  `json:"generationConfig,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func chamarGeminiAPI(pergunta, dadosContexto string) (string, error) {
	// Tentativa no modelo mais recente e estável (gemini-3.8-flash / gemini-flash-latest)
	modelos := []string{"gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-pro"}
	var ultimoErro error

	promptUsuario := pergunta
	if dadosContexto != "" {
		promptUsuario = fmt.Sprintf("%s\n\n%s", pergunta, dadosContexto)
	}

	for _, modelo := range modelos {
		apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelo, GeminiKey)

		bodyReq := geminiRequest{
			SystemInstruction: &geminiContent{
				Parts: []geminiPart{{Text: auroraSystemPrompt}},
			},
			Contents: []geminiContent{
				{
					Role:  "user",
					Parts: []geminiPart{{Text: promptUsuario}},
				},
			},
			GenerationConfig: map[string]any{
				"temperature": 0.2,
			},
		}

		jsonBytes, err := json.Marshal(bodyReq)
		if err != nil {
			return "", err
		}

		client := &http.Client{Timeout: 30 * time.Second}
		req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBytes))
		if err != nil {
			return "", err
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			ultimoErro = err
			continue
		}
		defer resp.Body.Close()

		respBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			ultimoErro = err
			continue
		}

		var gemResp geminiResponse
		if err := json.Unmarshal(respBytes, &gemResp); err != nil {
			ultimoErro = err
			continue
		}

		if gemResp.Error != nil && gemResp.Error.Message != "" {
			ultimoErro = fmt.Errorf("gemini api error: %s", gemResp.Error.Message)
			continue
		}

		if len(gemResp.Candidates) > 0 && len(gemResp.Candidates[0].Content.Parts) > 0 {
			return gemResp.Candidates[0].Content.Parts[0].Text, nil
		}
	}

	if ultimoErro != nil {
		return "", ultimoErro
	}
	return "Não foi possível obter resposta no momento.", nil
}
