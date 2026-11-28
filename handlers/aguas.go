package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	aguasCacheOnce sync.Once
	aguasPayload   []byte
	aguasErr       error
)

func readFileFromPaths(paths ...string) ([]byte, error) {
	for _, p := range paths {
		if data, err := os.ReadFile(p); err == nil && len(data) > 0 {
			return data, nil
		}
	}
	return nil, fmt.Errorf("arquivo não encontrado em nenhum dos caminhos: %v", paths)
}

// GetAguasResumo entrega os dados consolidados da Compesa / Águas de Pernambuco
func GetAguasResumo(c *gin.Context) {
	aguasCacheOnce.Do(func() {
		log.Println("⚡ [Águas de PE] Carregando e consolidando dados da Compesa em memória...")

		// 1. GeoJSON unificado com todas as camadas e sobreposições
		rawGeo, err := readFileFromPaths(
			"data/geojson/mapa_compesa_todas_camadas.geojson",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar mapa_compesa_todas_camadas.geojson: %v", err)
			aguasErr = err
			return
		}

		// 1.1 Plano de Investimentos Consolidado (Tabelas tipadas do COMPESA)
		rawPlano, errPlano := readFileFromPaths(
			"data/json/compesa_plano_investimentos.json",
		)
		if errPlano != nil {
			log.Printf("⚠️ Aviso: compesa_plano_investimentos.json não encontrado: %v", errPlano)
			rawPlano = []byte(`{}`)
		} else {
			log.Printf("✅ [Águas de PE] compesa_plano_investimentos.json carregado (%d bytes).", len(rawPlano))
		}

		// 2. Projetos limpos
		rawProjetos, err := readFileFromPaths(
			"data/json/compesa_projetos_clean.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_projetos_clean.json: %v", err)
			aguasErr = err
			return
		}

		// 3. Desembolso plurianual
		rawDesembolso, err := readFileFromPaths(
			"data/json/compesa_desembolso_rel.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_desembolso_rel.json: %v", err)
			aguasErr = err
			return
		}

		// 4. Rateio por município
		rawMuns, err := readFileFromPaths(
			"data/json/compesa_municipios_rel.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_municipios_rel.json: %v", err)
			aguasErr = err
			return
		}

		// 5. Adutoras de Pernambuco (Infraestrutura Hídrica Linear)
		rawAdutoras, errAdutoras := readFileFromPaths(
			"data/geojson/adutoras_pernambuco.geojson",
		)
		if errAdutoras != nil {
			log.Printf("⚠️ Aviso: adutoras_pernambuco.geojson não encontrado: %v", errAdutoras)
			rawAdutoras = []byte(`{"type":"FeatureCollection","features":[]}`)
		} else {
			log.Printf("✅ [Águas de PE] adutoras_pernambuco.geojson carregado (%d bytes).", len(rawAdutoras))
		}

		// 6. APAC: Reservatórios / Mananciais Monitorados (GeoJSON)
		rawApacRes, errApacRes := readFileFromPaths(
			"data/geojson/apac_reservatorios.geojson",
		)
		if errApacRes != nil {
			log.Printf("⚠️ Aviso: apac_reservatorios.geojson não encontrado: %v", errApacRes)
			rawApacRes = []byte(`{"type":"FeatureCollection","features":[]}`)
		} else {
			log.Printf("✅ [APAC] apac_reservatorios.geojson carregado (%d bytes).", len(rawApacRes))
		}

		// 6.1 APAC: Reservatórios / Mananciais Monitorados (JSON tabular)
		rawApacResJSON, errApacResJSON := readFileFromPaths(
			"data/json/apac_reservatorios.json",
		)
		if errApacResJSON != nil {
			log.Printf("⚠️ Aviso: apac_reservatorios.json não encontrado: %v", errApacResJSON)
			rawApacResJSON = []byte(`[]`)
		} else {
			log.Printf("✅ [APAC] apac_reservatorios.json carregado (%d bytes).", len(rawApacResJSON))
		}

		// 7. APAC: Bacias Hidrográficas (29 UPs)
		rawApacBacias, errApacBacias := readFileFromPaths(
			"data/geojson/apac_bacias_hidrograficas.geojson",
		)
		if errApacBacias != nil {
			log.Printf("⚠️ Aviso: apac_bacias_hidrograficas.geojson não encontrado: %v", errApacBacias)
			rawApacBacias = []byte(`{"type":"FeatureCollection","features":[]}`)
		} else {
			log.Printf("✅ [APAC] apac_bacias_hidrograficas.geojson carregado (%d bytes).", len(rawApacBacias))
		}

		// 8. APAC: Resumo Geral e Indicadores
		rawApacResumo, errApacResumo := readFileFromPaths(
			"data/json/apac_resumo_estadual.json",
		)
		if errApacResumo != nil {
			log.Printf("⚠️ Aviso: apac_resumo_estadual.json não encontrado: %v", errApacResumo)
			rawApacResumo = []byte(`{}`)
		} else {
			log.Printf("✅ [APAC] apac_resumo_estadual.json carregado (%d bytes).", len(rawApacResumo))
		}

		resp := map[string]json.RawMessage{
			"geojson":                 json.RawMessage(rawGeo),
			"plano":                   json.RawMessage(rawPlano),
			"projetos":                json.RawMessage(rawProjetos),
			"desembolso":              json.RawMessage(rawDesembolso),
			"municipios":              json.RawMessage(rawMuns),
			"adutoras":                json.RawMessage(rawAdutoras),
			"apac_reservatorios":      json.RawMessage(rawApacRes),
			"apac_reservatorios_json": json.RawMessage(rawApacResJSON),
			"apac_bacias":             json.RawMessage(rawApacBacias),
			"apac_resumo":             json.RawMessage(rawApacResumo),
		}

		aguasPayload, aguasErr = json.Marshal(resp)
		if aguasErr != nil {
			log.Printf("⚠️ Erro ao serializar dados de Águas de PE: %v", aguasErr)
		} else {
			log.Println("✅ [Águas de PE] Dados consolidados carregados com sucesso no cache!")
		}
	})

	if aguasErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Falha ao carregar dados de Águas de Pernambuco",
			"details": aguasErr.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", aguasPayload)
}