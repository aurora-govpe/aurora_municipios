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

		// 1. GeoJSON com todas as 9 camadas / cenários consolidados
		rawGeo, err := readFileFromPaths(
			"data/mapa_compesa_todas_camadas.geojson",
			"app_aurora_municipios/data/mapa_compesa_todas_camadas.geojson",
			"data/compesa/mapa_compesa_todas_camadas.geojson",
			"data/mapa_compesa_consolidado.geojson",
			"app_aurora_municipios/data/mapa_compesa_consolidado.geojson",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar mapa_compesa_todas_camadas.geojson: %v", err)
			aguasErr = err
			return
		}

		// 2. Projetos limpos
		rawProjetos, err := readFileFromPaths(
			"data/compesa_projetos_clean.json",
			"app_aurora_municipios/data/compesa_projetos_clean.json",
			"data/compesa/compesa_projetos_clean.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_projetos_clean.json: %v", err)
			aguasErr = err
			return
		}

		// 3. Desembolso plurianual
		rawDesembolso, err := readFileFromPaths(
			"data/compesa_desembolso_rel.json",
			"app_aurora_municipios/data/compesa_desembolso_rel.json",
			"data/compesa/compesa_desembolso_rel.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_desembolso_rel.json: %v", err)
			aguasErr = err
			return
		}

		// 4. Rateio por município
		rawMuns, err := readFileFromPaths(
			"data/compesa_municipios_rel.json",
			"app_aurora_municipios/data/compesa_municipios_rel.json",
			"data/compesa/compesa_municipios_rel.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar compesa_municipios_rel.json: %v", err)
			aguasErr = err
			return
		}

		// 5. Adutoras de Pernambuco (Infraestrutura Hídrica Linear)
		rawAdutoras, errAdutoras := readFileFromPaths(
			"data/adutoras_pernambuco.geojson",
			"app_aurora_municipios/data/adutoras_pernambuco.geojson",
		)
		if errAdutoras != nil {
			log.Printf("⚠️ Aviso: adutoras_pernambuco.geojson não encontrado: %v", errAdutoras)
			rawAdutoras = []byte(`{"type":"FeatureCollection","features":[]}`)
		} else {
			log.Printf("✅ [Águas de PE] adutoras_pernambuco.geojson carregado (%d bytes).", len(rawAdutoras))
		}

		resp := map[string]json.RawMessage{
			"geojson":    json.RawMessage(rawGeo),
			"projetos":   json.RawMessage(rawProjetos),
			"desembolso": json.RawMessage(rawDesembolso),
			"municipios": json.RawMessage(rawMuns),
			"adutoras":   json.RawMessage(rawAdutoras),
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
