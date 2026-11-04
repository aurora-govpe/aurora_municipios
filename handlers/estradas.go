package handlers

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	estradasCacheOnce sync.Once
	estradasPayload   []byte
	estradasErr       error
)

// GetEstradasResumo entrega os dados consolidados do DER-PE / Estradas de Pernambuco
func GetEstradasResumo(c *gin.Context) {
	estradasCacheOnce.Do(func() {
		log.Println("⚡ [Estradas PE] Carregando dados do DER-PE em memória...")
		data, err := readFileFromPaths(
			"www/data/estradas_pe.json",
			"data/estradas_pe.json",
			"app_aurora_municipios/data/estradas_pe.json",
		)
		if err != nil {
			log.Printf("⚠️ Erro ao carregar estradas_pe.json: %v", err)
			estradasErr = err
			return
		}
		estradasPayload = data
		log.Printf("✅ [Estradas PE] Dados carregados com sucesso (%d bytes).", len(estradasPayload))
	})

	if estradasErr != nil || len(estradasPayload) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao carregar dados de Estradas de Pernambuco"})
		return
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", estradasPayload)
}
