package handlers

import (
	"bytes"
	"os"
	"testing"
)

func TestPatchCozinhasGo(t *testing.T) {
	data, err := os.ReadFile("cozinhas.go")
	if err != nil {
		t.Fatalf("erro ao ler cozinhas.go: %v", err)
	}

	structsPCP := []byte(`type ItemPCP struct {
	IBGE7                   interface{} ` + "`json:\"ibge7\"`" + `
	Segmento                string      ` + "`json:\"segmento\"`" + `
	Municipio               string      ` + "`json:\"municipio\"`" + `
	ValorInvestido          float64     ` + "`json:\"valor_investido_no_municipio\"`" + `
	ValorPago               float64     ` + "`json:\"valor_pago_no_municipio\"`" + `
	PercentExecucao         float64     ` + "`json:\"percent_execucao\"`" + `
	NumeroBeneficiarios     int         ` + "`json:\"numero_de_beneficiarios\"`" + `
	PercentDoValorTotal     float64     ` + "`json:\"percent_do_valor_total\"`" + `
	ProporcaoDoTotalDeCasos float64     ` + "`json:\"proporcao_do_total_de_casos\"`" + `
	CodIBGE                 string      ` + "`json:\"cod_ibge\"`" + `
	RD                      string      ` + "`json:\"rd\"`" + `
	Status                  string      ` + "`json:\"status\"`" + `
}

type ChapeuDePalhaKPIs struct {
	TotalBeneficiarios int     ` + "`json:\"total_beneficiarios\"`" + `
	ValorInvestido     float64 ` + "`json:\"valor_investido\"`" + `
	ValorPago          float64 ` + "`json:\"valor_pago\"`" + `
	MunicipiosCobertos int     ` + "`json:\"municipios_cobertos\"`" + `
	RDsCobertas        int     ` + "`json:\"rds_cobertas\"`" + `
	BeneficiariosCana  int     ` + "`json:\"beneficiarios_cana\"`" + `
	BeneficiariosFruta int     ` + "`json:\"beneficiarios_fruta\"`" + `
	BeneficiariosPesca int     ` + "`json:\"beneficiarios_pesca\"`" + `
}

type CozinhasResponse struct {`)

	data = bytes.Replace(data, []byte("type CozinhasResponse struct {"), structsPCP, 1)

	oldResp := []byte("\tGeoJSONMun          json.RawMessage      `json:\"geojson_municipios,omitempty\"`")
	newResp := []byte("\tGeoJSONMun          json.RawMessage      `json:\"geojson_municipios,omitempty\"`\n\tKPIsPCP             ChapeuDePalhaKPIs    `json:\"kpis_pcp\"`\n\tPCP                 []ItemPCP            `json:\"pcp,omitempty\"`")
	data = bytes.Replace(data, oldResp, newResp, 1)

	logicPCP := []byte(`		// 6. Carrega Chapéu de Palha (df_pcp.json)
		kpisPCP := ChapeuDePalhaKPIs{}
		var pcpItems []ItemPCP
		rawPCP, errPCP := readFileFromPaths(
			"data/json/df_pcp.json",
			"data/df_pcp.json",
			"app_aurora_municipios/data/json/df_pcp.json",
			"C:/dados/aurora/json/df_pcp.json",
			"C:/dados/aurora/df_pcp.json",
		)
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
					} else if strings.Contains(seg, "FRUTA") {
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

		resp := CozinhasResponse{`)

	data = bytes.Replace(data, []byte("\t\tresp := CozinhasResponse{"), logicPCP, 1)

	oldRespInst := []byte("\t\t\tGeoJSONMun:          rawGeo,")
	newRespInst := []byte("\t\t\tGeoJSONMun:          rawGeo,\n\t\t\tKPIsPCP:             kpisPCP,\n\t\t\tPCP:                 pcpItems,")
	data = bytes.Replace(data, oldRespInst, newRespInst, 1)

	if err := os.WriteFile("cozinhas.go", data, 0644); err != nil {
		t.Fatalf("erro ao salvar: %v", err)
	}
	t.Log("Sucesso ao atualizar cozinhas.go")
}
