package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

// FlexNumber converte números enviados como float, int ou string ("R$ 10.647.582,98", "10647582.98", "150", "")
type FlexNumber float64

func (fn *FlexNumber) UnmarshalJSON(b []byte) error {
	var raw interface{}
	if err := json.Unmarshal(b, &raw); err != nil {
		return err
	}

	switch v := raw.(type) {
	case float64:
		*fn = FlexNumber(v)
	case int:
		*fn = FlexNumber(v)
	case string:
		v = strings.TrimSpace(v)
		if v == "" || v == "-" || v == "NA" || v == "null" || v == "NaN" {
			*fn = 0
			return nil
		}

		v = strings.ReplaceAll(v, "R$", "")
		v = strings.ReplaceAll(v, "\u00a0", "")
		v = strings.ReplaceAll(v, " ", "")
		v = strings.TrimSpace(v)

		if strings.Contains(v, ",") && strings.Contains(v, ".") {
			v = strings.ReplaceAll(v, ".", "")
			v = strings.ReplaceAll(v, ",", ".")
		} else if strings.Contains(v, ",") {
			v = strings.ReplaceAll(v, ",", ".")
		} else if strings.Count(v, ".") > 1 {
			v = strings.ReplaceAll(v, ".", "")
		}

		f, err := strconv.ParseFloat(v, 64)
		if err != nil {
			*fn = 0
			return nil
		}
		*fn = FlexNumber(f)
	case nil:
		*fn = 0
	default:
		return fmt.Errorf("tipo incompatível para FlexNumber: %T", v)
	}
	return nil
}



// ItemRegularizacao mapeia as colunas de df_regularizacoes.json
type ItemRegularizacao struct {
	Municipio       string     `json:"municipio"`
	Cidade          string     `json:"cidade"`
	NC              string     `json:"nc"`
	MunicipioNC     string     `json:"municipio_nc"`
	Local           string     `json:"local"`
	Regularizacoes  FlexNumber `json:"regularizacoes"`
	Mulheres        FlexNumber `json:"mulheres"`
	Status          string     `json:"status"`
	Situacao        string     `json:"situacao"`
	Classificacao   string     `json:"classificacao"`
	StatusDetalhado string     `json:"status_detalhado"`
	PercentExecucao FlexNumber `json:"percent_execucao"`
	Lat             string     `json:"lat"`
	Long            string     `json:"long"`
}

// ClassifMetrica armazena os valores de previstos, entregues e %
type ClassifMetrica struct {
	Previstos int     `json:"previstos"`
	Entregues int     `json:"entregues"`
	Percent   float64 `json:"percent"`
}

// KPIsReurb consolidado com as métricas detalhadas
type KPIsReurb struct {
	TitulosPrevistos   int            `json:"titulos_previstos"`
	TitulosEntregues   int            `json:"titulos_entregues"`
	TitulosAndamento   int            `json:"titulos_andamento"`
	TotalMulheres      int            `json:"total_mulheres"`
	PercentMulheres    float64        `json:"percent_mulheres"`
	TotalNucleos       int            `json:"total_nucleos"`
	TotalMunicipios    int            `json:"total_municipios"`
	ClassifRegmel      ClassifMetrica `json:"classif_regmel"`
	ClassifFundiaria   ClassifMetrica `json:"classif_fundiaria"`
	ClassifReurb       ClassifMetrica `json:"classif_reurb"`
	ClassifImobiliaria ClassifMetrica `json:"classif_imobiliaria"`
}

// HabitacaoItem mapeia os campos do df_habitacao.json
type HabitacaoItem struct {
	CodIBGE                     interface{} `json:"cod_ibge"`
	Municipio                   string      `json:"municipio"`
	Empreendimento              string      `json:"empreendimento"`
	Status                      string      `json:"status"`
	UH                          FlexNumber  `json:"uh"`
	ValorGlobalOrcado2          FlexNumber  `json:"valor_global_orcado3"`
	ValorContrapartida          FlexNumber  `json:"valor_contrapartida"`
	ValorTerrenosDoados2        FlexNumber  `json:"valor_terrenos_doados2"`
	Financiamento               string      `json:"financiamento"`
	Cadastrados                 FlexNumber  `json:"cadastrados"`
	Concluido                   FlexNumber  `json:"concluido"`
	ValorTotal                  FlexNumber  `json:"valor_total"`
	QuantidadeDeEmpreendimentos FlexNumber  `json:"quantidade_de_empreendimentos"`
	Programa                    string      `json:"programa"`
	Lat                         float64     `json:"lat"`
	Long                        float64     `json:"long"`
}

type HabitacaoKPIs struct {
	TotalUH            int     `json:"total_uh"`
	EntreguesUH        int     `json:"entregues_uh"`
	ConstrucaoUH       int     `json:"construcao_uh"`
	InvestimentoTotal  float64 `json:"investimento_total"`
	ContrapartidaTotal float64 `json:"contrapartida_total"`
	MunicipiosCobertos int     `json:"municipios_cobertos"`
}

type ReformaNoLarKPIs struct {
	Cadastrados         int     `json:"cadastrados"`
	ReformasRealizadas  int     `json:"reformas_realizadas"`
	ValorContratual     float64 `json:"valor_contratual"`
	ValorTotalMedido    float64 `json:"valor_total_medido"`
	MunicipiosAtendidos int     `json:"municipios_atendidos"`
}

type EntradaGarantidaKPIs struct {
	TotalUH                  int     `json:"total_uh"`
	QuantidadeEmpreendimento int     `json:"quantidade_empreendimento"`
	ValorTotal               float64 `json:"valor_total"`
	MunicipiosAtendidos      int     `json:"municipios_atendidos"`
}

type FarkPIs struct {
	TotalUH                  int     `json:"total_uh"`
	QuantidadeEmpreendimento int     `json:"quantidade_empreendimento"`
	RecursoFederal           float64 `json:"recurso_federal"`
	ContrapartidaObras       float64 `json:"contrapartida_obras"`
	ContrapartidaTerrenos    float64 `json:"contrapartida_terrenos"`
	MunicipiosAtendidos      int     `json:"municipios_atendidos"`
}

type FdsKPIs struct {
	TotalUH                  int     `json:"total_uh"`
	QuantidadeEmpreendimento int     `json:"quantidade_empreendimento"`
	ContrapartidaObras       float64 `json:"contrapartida_obras"`
	MunicipiosAtendidos      int     `json:"municipios_atendidos"`
}

type Sub50KPIs struct {
	TotalUH                  int     `json:"total_uh"`
	QuantidadeEmpreendimento int     `json:"quantidade_empreendimento"`
	ValorTotalLicitacao      float64 `json:"valor_total_licitacao"`
	ContrapartidaObras       float64 `json:"contrapartida_obras"`
	MunicipiosAtendidos      int     `json:"municipios_atendidos"`
}

type RetomadasKPIs struct {
	TotalUH                  int     `json:"total_uh"`
	QuantidadeEmpreendimento int     `json:"quantidade_empreendimento"`
	RecursoFederal           float64 `json:"recurso_federal"`
	ContrapartidaObras       float64 `json:"contrapartida_obras"`
	MunicipiosAtendidos      int     `json:"municipios_atendidos"`
}

type HabitacaoResponse struct {
	Projetos          []HabitacaoItem      `json:"projetos"`
	KPIs              HabitacaoKPIs        `json:"kpis"`
	KPIsReformaLar    ReformaNoLarKPIs     `json:"kpis_reforma_no_lar"`
	KPIsEntradaGarant EntradaGarantidaKPIs `json:"kpis_entrada_garantida"`
	KPIsFAR           FarkPIs              `json:"kpis_far"`
	KPIsFDS           FdsKPIs              `json:"kpis_fds"`
	KPIsSub50         Sub50KPIs            `json:"kpis_sub50"`
	KPIsRetomadas     RetomadasKPIs        `json:"kpis_retomadas"`
	Regularizacoes    []ItemRegularizacao  `json:"regularizacoes"`
	KPIsReurb         KPIsReurb            `json:"kpis_reurb"`
}

var (
	habitacaoCacheOnce sync.Once
	habitacaoPayload   []byte
	habitacaoErr       error
)

func GetHabitacaoResumo(c *gin.Context) {
	habitacaoCacheOnce.Do(func() {
		log.Println("⚡ [Habitação] Carregando df_habitacao.json e df_regularizacoes.json em memória...")

		// 1. Habitação
		rawHab, err := readFileFromPaths(
			"data/df_habitacao.json",
			"data/df_habitação.json",
			"app_aurora_municipios/data/df_habitacao.json",
			"C:/dados/aurora/df_habitacao.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar df_habitacao.json: %v", err)
			habitacaoErr = err
			return
		}

		var itens []HabitacaoItem
		if err := json.Unmarshal(rawHab, &itens); err != nil {
			log.Printf("⚠️ Erro ao decodificar df_habitacao.json: %v", err)
			habitacaoErr = err
			return
		}

		// 2. Regularizações
		var regularizacoes []ItemRegularizacao
		rawReurb, errReurb := readFileFromPaths(
			"data/df_regularizacoes.json",
			"data/df_regularizações.json",
			"app_aurora_municipios/data/df_regularizacoes.json",
			"C:/dados/aurora/df_regularizacoes.json",
		)
		if errReurb != nil {
			log.Printf("⚠️ Aviso: df_regularizacoes.json não encontrado: %v", errReurb)
		} else {
			if err := json.Unmarshal(rawReurb, &regularizacoes); err != nil {
				log.Printf("⚠️ Erro ao decodificar df_regularizacoes.json: %v", err)
			}
		}

		kpis := HabitacaoKPIs{}
		kpisRNL := ReformaNoLarKPIs{}
		kpisENT := EntradaGarantidaKPIs{}
		kpisFAR := FarkPIs{}
		kpisFDS := FdsKPIs{}
		kpisSub50 := Sub50KPIs{}
		kpisRetomadas := RetomadasKPIs{}

		munsGeralMap := make(map[string]bool)
		munsRNLMap := make(map[string]bool)
		munsENTMap := make(map[string]bool)
		munsFARMap := make(map[string]bool)
		munsFDSMap := make(map[string]bool)
		munsSub50Map := make(map[string]bool)
		munsRetomadasMap := make(map[string]bool)

		for i := range itens {
			munLimpo := strings.ToLower(strings.TrimSpace(itens[i].Municipio))
			qtdUH := int(itens[i].UH)
			qtdEmp := int(itens[i].QuantidadeDeEmpreendimentos)
			if qtdEmp <= 0 {
				qtdEmp = 1
			}

			kpis.TotalUH += qtdUH
			kpis.InvestimentoTotal += float64(itens[i].ValorGlobalOrcado2)
			kpis.ContrapartidaTotal += float64(itens[i].ValorContrapartida)

			if munLimpo != "" && munLimpo != "-" {
				munsGeralMap[munLimpo] = true
			}

			s := strings.ToLower(strings.TrimSpace(itens[i].Status))
			if strings.Contains(s, "conclu") || strings.Contains(s, "entregue") {
				kpis.EntreguesUH += qtdUH
				itens[i].Status = "Concluído"
			} else {
				kpis.ConstrucaoUH += qtdUH
				itens[i].Status = "Em Construção"
			}

			fin := strings.ToUpper(strings.TrimSpace(itens[i].Financiamento))

			// RNL
			if strings.Contains(fin, "RNL") {
				kpisRNL.Cadastrados += int(itens[i].Cadastrados)
				kpisRNL.ReformasRealizadas += int(itens[i].Concluido)
				kpisRNL.ValorContratual += float64(itens[i].ValorContrapartida)
				kpisRNL.ValorTotalMedido += float64(itens[i].ValorTotal)
				if munLimpo != "" && munLimpo != "-" {
					munsRNLMap[munLimpo] = true
				}
			}

			// ENT
			if strings.Contains(fin, "ENT") {
				kpisENT.TotalUH += qtdUH
				kpisENT.QuantidadeEmpreendimento += qtdEmp
				kpisENT.ValorTotal += float64(itens[i].ValorGlobalOrcado2)
				if munLimpo != "" && munLimpo != "-" {
					munsENTMap[munLimpo] = true
				}
			}

			// FAR
			if strings.Contains(fin, "FAR") {
				kpisFAR.TotalUH += qtdUH
				kpisFAR.QuantidadeEmpreendimento += qtdEmp
				kpisFAR.RecursoFederal += float64(itens[i].ValorGlobalOrcado2)
				kpisFAR.ContrapartidaObras += float64(itens[i].ValorContrapartida)
				kpisFAR.ContrapartidaTerrenos += float64(itens[i].ValorTerrenosDoados2)
				if munLimpo != "" && munLimpo != "-" {
					munsFARMap[munLimpo] = true
				}
			}

			// FDS
			if strings.Contains(fin, "FDS") {
				kpisFDS.TotalUH += qtdUH
				kpisFDS.QuantidadeEmpreendimento += qtdEmp
				kpisFDS.ContrapartidaObras += float64(itens[i].ValorContrapartida)
				if munLimpo != "" && munLimpo != "-" {
					munsFDSMap[munLimpo] = true
				}
			}

			// SUB-50
			if strings.Contains(fin, "SUB") || strings.Contains(fin, "50") {
				kpisSub50.TotalUH += qtdUH
				kpisSub50.QuantidadeEmpreendimento += qtdEmp
				kpisSub50.ValorTotalLicitacao += float64(itens[i].ValorGlobalOrcado2)
				kpisSub50.ContrapartidaObras += float64(itens[i].ValorContrapartida)
				if munLimpo != "" && munLimpo != "-" {
					munsSub50Map[munLimpo] = true
				}
			}

			// RETOMADAS
			if strings.Contains(fin, "RET") {
				kpisRetomadas.TotalUH += qtdUH
				kpisRetomadas.QuantidadeEmpreendimento++
				kpisRetomadas.RecursoFederal += float64(itens[i].ValorTotal)
				kpisRetomadas.ContrapartidaObras += float64(itens[i].ValorContrapartida)
				if munLimpo != "" && munLimpo != "-" {
					munsRetomadasMap[munLimpo] = true
				}
			}
		}

		kpis.MunicipiosCobertos = len(munsGeralMap)
		kpisRNL.MunicipiosAtendidos = len(munsRNLMap)
		kpisENT.MunicipiosAtendidos = len(munsENTMap)
		kpisFAR.MunicipiosAtendidos = len(munsFARMap)
		kpisFDS.MunicipiosAtendidos = len(munsFDSMap)
		kpisSub50.MunicipiosAtendidos = len(munsSub50Map)
		kpisRetomadas.MunicipiosAtendidos = len(munsRetomadasMap)

		// 3. Processamento dos KPIs de REURB com regras requisitadas
		kpisReurb := KPIsReurb{}
		munsReurbMap := make(map[string]bool)
		nucleosMap := make(map[string]bool)

for _, reg := range regularizacoes {
			titulos := int(reg.Regularizacoes)
			mulheres := int(reg.Mulheres)

			kpisReurb.TitulosPrevistos += titulos
			kpisReurb.TotalMulheres += mulheres

			// Município
			munNome := strings.TrimSpace(reg.Municipio)
			if munNome == "" {
				munNome = strings.TrimSpace(reg.Cidade)
			}
			if munNome != "" && munNome != "-" {
				munsReurbMap[strings.ToLower(munNome)] = true
			}

			// Núcleo
			ncNome := strings.TrimSpace(reg.NC)
			if ncNome == "" {
				ncNome = strings.TrimSpace(reg.MunicipioNC)
			}
			if ncNome == "" {
				ncNome = strings.TrimSpace(reg.Local)
			}
			if ncNome != "" && ncNome != "-" {
				nucleosMap[strings.ToLower(ncNome)] = true
			}

			sit := strings.ToLower(strings.TrimSpace(reg.Situacao))
			isEntregue := strings.Contains(sit, "realizado") || strings.Contains(sit, "conclu") || strings.Contains(sit, "entregue")

			if isEntregue {
				kpisReurb.TitulosEntregues += titulos
			} else if strings.Contains(sit, "andamento") || strings.Contains(sit, "execu") {
				kpisReurb.TitulosAndamento += titulos
			}

			// Agrupamento por Classificação (Previstos e Entregues)
			cls := strings.ToUpper(strings.TrimSpace(reg.Classificacao))
			if strings.Contains(cls, "REGMEL") {
				kpisReurb.ClassifRegmel.Previstos += titulos
				if isEntregue {
					kpisReurb.ClassifRegmel.Entregues += titulos
				}
			} else if strings.Contains(cls, "REURB") {
				kpisReurb.ClassifReurb.Previstos += titulos
				if isEntregue {
					kpisReurb.ClassifReurb.Entregues += titulos
				}
			} else if strings.Contains(cls, "IMOBILI") {
				kpisReurb.ClassifImobiliaria.Previstos += titulos
				if isEntregue {
					kpisReurb.ClassifImobiliaria.Entregues += titulos
				}
			} else if strings.Contains(cls, "FUNDI") {
				kpisReurb.ClassifFundiaria.Previstos += titulos
				if isEntregue {
					kpisReurb.ClassifFundiaria.Entregues += titulos
				}
			}
		}

		// Cálculo dos percentuais de cada classificação
		calcPct := func(m *ClassifMetrica) {
			if m.Previstos > 0 {
				m.Percent = (float64(m.Entregues) / float64(m.Previstos)) * 100.0
			}
		}
		calcPct(&kpisReurb.ClassifRegmel)
		calcPct(&kpisReurb.ClassifFundiaria)
		calcPct(&kpisReurb.ClassifReurb)
		calcPct(&kpisReurb.ClassifImobiliaria)

		kpisReurb.TotalMunicipios = len(munsReurbMap)
		kpisReurb.TotalNucleos = len(nucleosMap)
		if kpisReurb.TitulosPrevistos > 0 {
			kpisReurb.PercentMulheres = (float64(kpisReurb.TotalMulheres) / float64(kpisReurb.TitulosPrevistos)) * 100.0
		}
		
		kpisReurb.TotalMunicipios = len(munsReurbMap)
		kpisReurb.TotalNucleos = len(nucleosMap)
		if kpisReurb.TitulosPrevistos > 0 {
			kpisReurb.PercentMulheres = (float64(kpisReurb.TotalMulheres) / float64(kpisReurb.TitulosPrevistos)) * 100.0
		}

		resp := HabitacaoResponse{
			Projetos:          itens,
			KPIs:              kpis,
			KPIsReformaLar:    kpisRNL,
			KPIsEntradaGarant: kpisENT,
			KPIsFAR:           kpisFAR,
			KPIsFDS:           kpisFDS,
			KPIsSub50:         kpisSub50,
			KPIsRetomadas:     kpisRetomadas,
			Regularizacoes:    regularizacoes,
			KPIsReurb:         kpisReurb,
		}

		habitacaoPayload, habitacaoErr = json.Marshal(resp)
		if habitacaoErr != nil {
			log.Printf("⚠️ Erro ao serializar HabitacaoResponse: %v", habitacaoErr)
		} else {
			log.Printf("✅ [Habitação & REURB] Sucesso: %d títulos previstos (%d entregues, %d em andamento) | Mulheres: %d",
				kpisReurb.TitulosPrevistos, kpisReurb.TitulosEntregues, kpisReurb.TitulosAndamento, kpisReurb.TotalMulheres)
		}
	})

	if habitacaoErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados de Habitação",
			"details": habitacaoErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", habitacaoPayload)
}