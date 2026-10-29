package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestGetCozinhasResumo(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/municipios/resumo/cozinhas", GetCozinhasResumo)

	req, _ := http.NewRequest(http.MethodGet, "/municipios/resumo/cozinhas", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Esperado status 200, recebido %d: %s", w.Code, w.Body.String())
	}

	var resp CozinhasResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Erro ao decodificar JSON de resposta: %v", err)
	}

	if resp.KPIs.Total == 0 {
		t.Errorf("KPIs.Total não deveria ser zero")
	}

	if len(resp.Cozinhas) == 0 {
		t.Errorf("Lista de cozinhas não deveria ser vazia")
	}

	if resp.KPIsMaes.TotalBeneficiarias == 0 {
		t.Errorf("KPIsMaes.TotalBeneficiarias não deveria ser zero")
	}

	if len(resp.Maes) == 0 {
		t.Errorf("Lista de mães não deveria ser vazia")
	}

	if resp.KPIsCofin.TotalPago == 0 {
		t.Errorf("KPIsCofin.TotalPago não deveria ser zero")
	}

	if len(resp.CofinAnos) == 0 {
		t.Errorf("Lista de anos de cofinanciamento não deveria ser vazia")
	}

	if len(resp.CofinMuns) == 0 {
		t.Errorf("Lista de municípios de cofinanciamento não deveria ser vazia")
	}

	if len(resp.GeoJSONMun) == 0 {
		t.Errorf("GeoJSON de municípios não deveria ser vazio")
	}

	if len(resp.VulnerabilidadeMuns) != 185 {
		t.Errorf("Esperado 185 municípios na vulnerabilidade, recebido %d", len(resp.VulnerabilidadeMuns))
	} else {
		// Valida um item de amostra
		item := resp.VulnerabilidadeMuns[0]
		if item.IVCAD == 0 || item.RankIVCAD == 0 {
			t.Errorf("Item %s possui IVCAD ou RankIVCAD zerado", item.Municipio)
		}
		if item.TaxaMaes == 0 || item.RankTaxaMaes == 0 {
			t.Errorf("Item %s possui TaxaMaes ou RankTaxaMaes zerado", item.Municipio)
		}
	}

	t.Logf("Sucesso! Cozinhas: %d, Mães: %d (R$ %.2f), Cofin Pago: R$ %.2f (%d anos, %d muns), Vuln: %d muns, GeoJSON bytes: %d",
		resp.KPIs.Total, resp.KPIsMaes.TotalBeneficiarias, resp.KPIsMaes.TotalInvestido,
		resp.KPIsCofin.TotalPago, len(resp.CofinAnos), len(resp.CofinMuns), len(resp.VulnerabilidadeMuns), len(resp.GeoJSONMun))
}
