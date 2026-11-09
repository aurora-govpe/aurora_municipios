package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"strconv" // <--- Adicionar este import

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

type VulnerabilidadeMun struct {
	CodIBGE          string  `json:"cod_ibge"`
	Municipio        string  `json:"municipio"`
	CadPessoas       float64 `json:"cad_pessoas"`
	QtdMaes          float64 `json:"qtd_maes"`
	TaxaMaes         float64 `json:"taxa_maes"`
	TaxaMaesNorm     float64 `json:"taxa_maes_norm"`
	RankTaxaMaes     int     `json:"rank_taxa_maes"`
	IVCAD            float64 `json:"ivcad"`
	RankIVCAD        int     `json:"rank_ivcad"`
	IVCADNC          float64 `json:"ivcad_nc"`
	RankIVCADNC      int     `json:"rank_ivcad_nc"`
	IVCADNCPonderado float64 `json:"ivcad_nc_ponderado"`
	RankIVCADNCPond  int     `json:"rank_ivcad_nc_ponderado"`
}

type ItemPCP struct {
	IBGE7                   interface{} `json:"ibge7"`
	Segmento                string      `json:"segmento"`
	Municipio               string      `json:"municipio"`
	ValorInvestido          float64     `json:"valor_investido_no_municipio"`
	ValorPago               float64     `json:"valor_pago_no_municipio"`
	PercentExecucao         float64     `json:"percent_execucao"`
	NumeroBeneficiarios     int         `json:"numero_de_beneficiarios"`
	PercentDoValorTotal     float64     `json:"percent_do_valor_total"`
	ProporcaoDoTotalDeCasos float64     `json:"proporcao_do_total_de_casos"`
	CodIBGE                 string      `json:"cod_ibge"`
	RD                      string      `json:"rd"`
	Status                  string      `json:"status"`
}

type ChapeuDePalhaKPIs struct {
	TotalBeneficiarios int     `json:"total_beneficiarios"`
	ValorInvestido     float64 `json:"valor_investido"`
	ValorPago          float64 `json:"valor_pago"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
	RDsCobertas        int     `json:"rds_cobertas"`
	BeneficiariosCana  int     `json:"beneficiarios_cana"`
	BeneficiariosFruta int     `json:"beneficiarios_fruta"`
	BeneficiariosPesca int     `json:"beneficiarios_pesca"`
}

type CozinhasResponse struct {
	Cozinhas            []CozinhaItem        `json:"cozinhas"`
	KPIs                CozinhasKPIs         `json:"kpis"`
	Maes                []MaeItem            `json:"maes"`
	KPIsMaes            MaesKPIs             `json:"kpis_maes"`
	KPIsCofin           CofinanciamentoKPIs  `json:"kpis_cofinanciamento"`
	CofinAnos           []CofinanciamentoAno `json:"cofinanciamento_anos"`
	CofinMuns           []CofinanciamentoMun `json:"cofinanciamento_muns"`
	VulnerabilidadeMuns []VulnerabilidadeMun `json:"vulnerabilidade_muns"`
	GeoJSONMun          json.RawMessage      `json:"geojson_municipios,omitempty"`
	KPIsPCP             ChapeuDePalhaKPIs    `json:"kpis_pcp"`
	PCP                 []ItemPCP            `json:"pcp,omitempty"`
	KPIsTransporte TransporteEscolarKPIs   `json:"kpis_transporte"`
	Transporte     []ItemTransporteEscolar `json:"transporte,omitempty"`
	KPIsIluminacao IluminacaoKPIs   `json:"kpis_iluminacao"`
	Iluminacao     []ItemIluminacao `json:"iluminacao,omitempty"`
}

// Estrutura de cada linha de df_transporte.json
type ItemTransporteEscolar struct {
	IBGE7                 interface{} `json:"ibge7"`
	CodIBGE               interface{} `json:"cod_ibge"`
	QtdOnibus             int         `json:"qtd_onibus"`
	QtdVans               int         `json:"qtd_vans"`
	ValorTotal            interface{} `json:"valor_total"`
	Produto               string      `json:"produto"`
	Municipio             string      `json:"municipio"`
	RegiaoDesenvolvimento string      `json:"regiao_de_desenvolvimento"`
	EixoEstrategico       string      `json:"eixo_estrategico"`
	IniciativaEstrategica string      `json:"iniciativa_estrategica"`
	Secretaria            string      `json:"secretaria"`
	Status                string      `json:"status"`
	PercentExecucao       string      `json:"percent_execucao"`
}

type TransporteEscolarKPIs struct {
	TotalVeiculos      int     `json:"total_veiculos"`
	TotalOnibus        int     `json:"total_onibus"`
	TotalVans          int     `json:"total_vans"`
	ValorInvestido     float64 `json:"valor_investido"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
}

type ItemIluminacao struct {
	IBGE7                 interface{} `json:"ibge7"`
	Municipio             string      `json:"municipio"`
	RD                    string      `json:"rd"`
	NoContrato            string      `json:"no_contrato"`
	Produto               string      `json:"produto"`
	Status                string      `json:"status"`
	PercentExecucao       string      `json:"percent_execucao"`
	IndicadorExecutado    string      `json:"indicador"`            // Pontos Executados
	IndicadorPrevisto     string      `json:"indicador_secundario"` // Pontos Previstos
	ValorTotal            string      `json:"valor_total"`
	ValorPago             string      `json:"valor_pago"`
	EmpresaContratada     string      `json:"empresa_contratada"`
	Latitude              string      `json:"latitude"`
	Longitude             string      `json:"longitude"`
	GrupoIlumina          string      `json:"grupo_ilumina"`
	IniciativaEstrategica string      `json:"iniciativa_estrategica"`
	Secretaria            string      `json:"secretaria"`
}

type IluminacaoKPIs struct {
	TotalContratos     int     `json:"total_contratos"`
	PontosExecutados   int     `json:"pontos_executados"`
	PontosPrevistos    int     `json:"pontos_previstos"`
	ValorTotal         float64 `json:"valor_total"`
	ValorPago          float64 `json:"valor_pago"`
	Concluidas         int     `json:"concluidas"`
	EmExecucao         int     `json:"em_execucao"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
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
		
		// Carrega Iluminação Pública / Eficiência Energética (df_iluminacao.json)
		kpisIlumina := IluminacaoKPIs{}
		var iluminaItems []ItemIluminacao
		rawIlumina, errIlumina := readFileFromPaths(
			"data/json/df_iluminacao.json",
			"data/df_iluminacao.json",
			"app_aurora_municipios/data/json/df_iluminacao.json",
			"C:/dados/aurora/json/df_iluminacao.json",
			"C:/dados/aurora/df_iluminacao.json",
		)
		if errIlumina == nil && len(rawIlumina) > 0 {
			if err := json.Unmarshal(rawIlumina, &iluminaItems); err == nil {
				munsIlumina := make(map[string]bool)
				for _, item := range iluminaItems {
					kpisIlumina.TotalContratos++

					// Conversão de pontos
					ptExec, _ := strconv.Atoi(strings.TrimSpace(item.IndicadorExecutado))
					ptPrev, _ := strconv.Atoi(strings.TrimSpace(item.IndicadorPrevisto))
					kpisIlumina.PontosExecutados += ptExec
					kpisIlumina.PontosPrevistos += ptPrev

					// Conversão de valores financeiros
					vTot, _ := strconv.ParseFloat(strings.ReplaceAll(strings.TrimSpace(item.ValorTotal), ",", "."), 64)
					vPag, _ := strconv.ParseFloat(strings.ReplaceAll(strings.TrimSpace(item.ValorPago), ",", "."), 64)
					kpisIlumina.ValorTotal += vTot
					kpisIlumina.ValorPago += vPag

					stNorm := strings.ToUpper(strings.TrimSpace(item.Status))
					if strings.Contains(stNorm, "CONCLU") || strings.Contains(stNorm, "ENTREG") {
						kpisIlumina.Concluidas++
					} else {
						kpisIlumina.EmExecucao++
					}

					if item.Municipio != "" {
						munsIlumina[strings.ToUpper(strings.TrimSpace(item.Municipio))] = true
					}
				}
				kpisIlumina.MunicipiosCobertos = len(munsIlumina)
			}
		}


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
		
		// Carrega Transporte Escolar (df_transporte.json)
		kpisTransporte := TransporteEscolarKPIs{}
		var transporteItems []ItemTransporteEscolar
		rawTransp, errTransp := readFileFromPaths(
			"data/json/df_transporte.json",
			"data/df_transporte.json",
			"app_aurora_municipios/data/json/df_transporte.json",
			"C:/dados/aurora/json/df_transporte.json",
			"C:/dados/aurora/df_transporte.json",
		)
		if errTransp == nil && len(rawTransp) > 0 {
			if err := json.Unmarshal(rawTransp, &transporteItems); err == nil {
				munsTransp := make(map[string]bool)
				for _, item := range transporteItems {
					kpisTransporte.TotalOnibus += item.QtdOnibus
					kpisTransporte.TotalVans += item.QtdVans
					kpisTransporte.TotalVeiculos += (item.QtdOnibus + item.QtdVans)

					// Converte valor_total para float
					var vFloat float64
					switch v := item.ValorTotal.(type) {
					case float64:
						vFloat = v
					case string:
						vLimpo := strings.ReplaceAll(strings.TrimSpace(v), ",", ".")
						vFloat, _ = strconv.ParseFloat(vLimpo, 64)
					}
					kpisTransporte.ValorInvestido += vFloat

					if item.Municipio != "" {
						munsTransp[strings.ToUpper(strings.TrimSpace(item.Municipio))] = true
					}
				}
				kpisTransporte.MunicipiosCobertos = len(munsTransp)
			}
		}

		// 4. Carrega Indicadores IVCAD e calcula Vulnerabilidade a Cuidados
		var rawIVCADList []struct {
			CodIBGE    string  `json:"cod_ibge"`
			Municipio  string  `json:"municipio"`
			CadPessoas float64 `json:"cad_pessoas"`
			IVCAD      float64 `json:"ivcad"`
			IVCADNC    float64 `json:"ivcad_nc"`
		}

		rawIVCADBytes, errIVCAD := readFileFromPaths(
			"data/df_ivcad_pe.json",
			"app_aurora_municipios/data/df_ivcad_pe.json",
			"C:/dados/aurora/df_ivcad_pe.json",
		)

		if errIVCAD == nil {
			_ = json.Unmarshal(rawIVCADBytes, &rawIVCADList)
		} else if DuckDB != nil {
			// Fallback: consulta v_indicadores se o json não estiver presente
			qIVCAD := `
				SELECT 
					TRIM(CAST(cod_municipio AS VARCHAR)) AS cod_ibge, 
					TRIM(CAST(nm_municipio AS VARCHAR)) AS nm_municipio,
					MAX(CASE WHEN sigla_clean = 'ivcad' THEN val_clean END) AS ivcad,
					MAX(CASE WHEN sigla_clean = 'ivcad_nc' THEN val_clean END) AS ivcad_nc,
					MAX(CASE WHEN sigla_clean = 'cad_pessoas' THEN val_clean END) AS cad_pessoas
				FROM v_indicadores
				WHERE sigla_clean IN ('ivcad', 'ivcad_nc', 'cad_pessoas') AND ano_clean = 2026
				GROUP BY cod_municipio, nm_municipio
			`
			if rows, errQ := DuckDB.Query(qIVCAD); errQ == nil {
				defer rows.Close()
				for rows.Next() {
					var item struct {
						CodIBGE    string  `json:"cod_ibge"`
						Municipio  string  `json:"municipio"`
						CadPessoas float64 `json:"cad_pessoas"`
						IVCAD      float64 `json:"ivcad"`
						IVCADNC    float64 `json:"ivcad_nc"`
					}
					var sqlIV, sqlNC, sqlCad sql.NullFloat64
					if errS := rows.Scan(&item.CodIBGE, &item.Municipio, &sqlIV, &sqlNC, &sqlCad); errS == nil {
						item.IVCAD = sqlIV.Float64
						item.IVCADNC = sqlNC.Float64
						item.CadPessoas = sqlCad.Float64
						rawIVCADList = append(rawIVCADList, item)
					}
				}
			}
		}

		// Mapear beneficiárias de Mães de PE por IBGE7
		maesByIBGE := make(map[string]int)
		for _, m := range maes {
			if m.IBGE7 != "" {
				maesByIBGE[strings.TrimSpace(m.IBGE7)] = m.QtdBeneficiariasTotal
			}
		}

		var vulnList []VulnerabilidadeMun
		minTaxa := 1e12
		maxTaxa := -1e12

		for _, item := range rawIVCADList {
			v := VulnerabilidadeMun{
				CodIBGE:    strings.TrimSpace(item.CodIBGE),
				Municipio:  strings.TrimSpace(item.Municipio),
				CadPessoas: item.CadPessoas,
				IVCAD:      item.IVCAD,
				IVCADNC:    item.IVCADNC,
			}
			if qtd, ok := maesByIBGE[v.CodIBGE]; ok {
				v.QtdMaes = float64(qtd)
			}
			if v.CadPessoas > 0 {
				v.TaxaMaes = (100000.0 * v.QtdMaes) / v.CadPessoas
			}
			if v.TaxaMaes < minTaxa {
				minTaxa = v.TaxaMaes
			}
			if v.TaxaMaes > maxTaxa {
				maxTaxa = v.TaxaMaes
			}
			vulnList = append(vulnList, v)
		}

		// Calcular normalização (0-1) e Vulnerabilidade a Cuidados Ponderada
		diffTaxa := maxTaxa - minTaxa
		for i := range vulnList {
			if diffTaxa > 0 {
				vulnList[i].TaxaMaesNorm = (vulnList[i].TaxaMaes - minTaxa) / diffTaxa
			} else {
				vulnList[i].TaxaMaesNorm = 0
			}
			// IVCAD NC ponderado: reduz a vulnerabilidade quanto maior a taxa de mães
			vulnList[i].IVCADNCPonderado = vulnList[i].IVCADNC * (1.0 - vulnList[i].TaxaMaesNorm)
		}

		// Ranks relacionais (1 a 185)
		// 1. IVCAD Geral (menor vulnerabilidade = melhor = 1º lugar)
		sort.Slice(vulnList, func(i, j int) bool {
			return vulnList[i].IVCAD < vulnList[j].IVCAD
		})
		for i := range vulnList {
			vulnList[i].RankIVCAD = i + 1
		}

		// 2. Taxa Mães de PE (maior taxa = melhor atendimento = 1º lugar)
		sort.Slice(vulnList, func(i, j int) bool {
			return vulnList[i].TaxaMaes > vulnList[j].TaxaMaes
		})
		for i := range vulnList {
			vulnList[i].RankTaxaMaes = i + 1
		}

		// 3. IVCAD NC original (menor necessidade = melhor = 1º lugar)
		sort.Slice(vulnList, func(i, j int) bool {
			return vulnList[i].IVCADNC < vulnList[j].IVCADNC
		})
		for i := range vulnList {
			vulnList[i].RankIVCADNC = i + 1
		}

		// 4. IVCAD NC Ponderado (menor vulnerabilidade residual = melhor = 1º lugar)
		sort.Slice(vulnList, func(i, j int) bool {
			return vulnList[i].IVCADNCPonderado < vulnList[j].IVCADNCPonderado
		})
		for i := range vulnList {
			vulnList[i].RankIVCADNCPond = i + 1
		}

		// Ordena alfabeticamente por município
		sort.Slice(vulnList, func(i, j int) bool {
			return vulnList[i].Municipio < vulnList[j].Municipio
		})

		log.Printf("✅ [Pernambuco sem Fome] %d municípios processados para IVCAD e Vulnerabilidade a Cuidados.", len(vulnList))

		// 5. Carrega GeoJSON dos municípios de PE
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

		// 6. Carrega Chapéu de Palha (df_pcp.json)
		kpisPCP := ChapeuDePalhaKPIs{}
		var pcpItems []ItemPCP
		rawPCP, errPCP := readFileFromPaths(
			"data/json/df_pcp.json",
			"data/df_pcp.json",
			"app_aurora_municipios/data/json/df_pcp.json",
			"C:/dados/aurora/json/df_pcp.json",
			"C:/dados/aurora/df_pcp.json",
		)
		
		pcpByMun := make(map[string]struct{
    Beneficiarios int
    ValorPago     float64
})
for _, p := range pcpItems {
    k := strings.ToUpper(strings.TrimSpace(p.Municipio))
    cur := pcpByMun[k]
    cur.Beneficiarios += p.NumeroBeneficiarios
    cur.ValorPago += p.ValorPago
    pcpByMun[k] = cur
}
		
		if errPCP == nil && len(rawPCP) > 0 {
			if err := json.Unmarshal(rawPCP, &pcpItems); err == nil {
				munsPCP := make(map[string]bool)
				rdsPCP := make(map[string]bool)
				for _, item := range pcpItems {
					kpisPCP.TotalBeneficiarios += item.NumeroBeneficiarios
					kpisPCP.ValorInvestido += item.ValorInvestido
					kpisPCP.ValorPago += item.ValorPago
					if item.Municipio != "" {
						munsPCP[strings.ToUpper(strings.TrimSpace(item.Municipio))] = true
					}
					if item.RD != "" {
						rdsPCP[strings.ToUpper(strings.TrimSpace(item.RD))] = true
					}
					seg := strings.ToUpper(strings.TrimSpace(item.Segmento))
					if strings.Contains(seg, "CANA") {
						kpisPCP.BeneficiariosCana += item.NumeroBeneficiarios
					} else if strings.Contains(seg, "PESCA") {
						kpisPCP.BeneficiariosPesca += item.NumeroBeneficiarios
					} else if strings.Contains(seg, "FRUTI") {
						kpisPCP.BeneficiariosFruta += item.NumeroBeneficiarios
					}
				}
				kpisPCP.MunicipiosCobertos = len(munsPCP)
				kpisPCP.RDsCobertas = len(rdsPCP)
				log.Printf("✅ [Pernambuco sem Fome] Chapéu de Palha carregado com sucesso (%d beneficiários, %d municípios, R$ %.2f)",
					kpisPCP.TotalBeneficiarios, kpisPCP.MunicipiosCobertos, kpisPCP.ValorPago)
			} else {
				log.Printf("⚠️ Erro ao decodificar df_pcp.json: %v", err)
			}
		} else {
			log.Printf("⚠️ Aviso: df_pcp.json não encontrado: %v", errPCP)
		}

		resp := CozinhasResponse{
			Cozinhas:            cozinhas,
			KPIs:                kpis,
			Maes:                maes,
			KPIsMaes:            kpisMaes,
			KPIsCofin:           kpisCofin,
			CofinAnos:           cofinAnos,
			CofinMuns:           cofinMuns,
			VulnerabilidadeMuns: vulnList,
			GeoJSONMun:          rawGeo,
			KPIsPCP:             kpisPCP,
			PCP:                 pcpItems,
			KPIsTransporte:      kpisTransporte,  // <--- Incluir aqui
			Transporte:          transporteItems, // <--- ADICIONE ESTA LINHA QUE ESTAVA FALTANDO!
			KPIsIluminacao: kpisIlumina,
			Iluminacao:     iluminaItems,
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
