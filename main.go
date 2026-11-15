package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	_ "github.com/marcboeker/go-duckdb"
	_ "modernc.org/sqlite"

	"aurora-municipios/handlers"
)

func main() {
	log.Println("⚡ Iniciando Aurora Municípios Backend em Go...")

	// 1. DuckDB em RAM
	duckDB, err := sql.Open("duckdb", "")
	if err != nil {
		log.Fatalf("❌ Erro fatal ao iniciar DuckDB: %v", err)
	}
	defer duckDB.Close()

	// 2. SQLite para metadados e cache IA
	sqliteDB, err := sql.Open("sqlite", "data/aurora_system.sqlite")
	if err != nil {
		log.Printf("⚠️ Aviso: Não foi possível abrir aurora_system.sqlite: %v", err)
	} else {
		defer sqliteDB.Close()
		_, _ = sqliteDB.Exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;")
	}

	handlers.SetDatabases(duckDB, sqliteDB)
	handlers.LoadConfig()

	log.Println("⚡ Carregando bases Parquet na memória RAM do DuckDB...")
	if err := handlers.InitData(); err != nil {
		log.Printf("⚠️ Aviso durante carga de dados: %v", err)
	}

	// 3. Gin Engine
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(gin.Logger())

	// Ativar compressão GZIP em todas as rotas
	r.Use(gzip.Gzip(gzip.DefaultCompression, gzip.WithDecompressFn(gzip.DefaultDecompressHandle)))

	// 4. Registrar rotas resilientes em /api e /
	registerRoutes := func(rg *gin.RouterGroup) {
		// Módulo Municípios (Novo padrão) & Ficha Municipal (Retrocompatibilidade)
		rg.Any("/municipios/filtros", handlers.GetMunicipiosFiltros)
		rg.Any("/municipios/metadados", handlers.GetMunicipiosMetadados)
		rg.Any("/municipios/data", handlers.PostMunicipiosData)
		rg.Any("/municipios/resumo/capag", handlers.GetCapagResumo)
		rg.Any("/municipios/resumo/aguas", handlers.GetAguasResumo)
		rg.Any("/municipios/resumo/cozinhas", handlers.GetCozinhasResumo)
		rg.Any("/municipios/resumo/estradas", handlers.GetEstradasResumo)
		rg.Any("/municipios/resumo/habitacao", handlers.GetHabitacaoResumo)
		rg.Any("/municipios/resumo/obras", handlers.GetObrasResumo)
		rg.Any("/municipios/resumo/creches", handlers.GetCrechesResumo)

    rg.Any("/ficha/filtros", handlers.GetFichaFiltros)
		rg.Any("/ficha/metadados", handlers.GetFichaMetadados)
		rg.Any("/ficha/data", handlers.PostFichaData)
		rg.Any("/ficha/resumo/capag", handlers.GetCapagResumo)
		rg.Any("/ficha/resumo/aguas", handlers.GetAguasResumo)
		rg.Any("/ficha/resumo/cozinhas", handlers.GetCozinhasResumo)
		rg.Any("/ficha/resumo/estradas", handlers.GetEstradasResumo)
		rg.Any("/ficha/resumo/habitacao", handlers.GetHabitacaoResumo)
		rg.Any("/ficha/resumo/obras", handlers.GetObrasResumo)

		// Regiões de Desenvolvimento
		rg.Any("/regioes/filtros", handlers.GetRegioesFiltros)
		rg.Any("/regioes/data", handlers.PostRegioesData)

		// Módulo UFs (Benchmarking Nacional & Fiscal)
		rg.Any("/ufs/filtros", handlers.GetUFsFiltros)
		rg.Any("/ufs/data", handlers.GetUFsData)
		rg.Any("/ufs/fiscal", handlers.GetUFsFiscal)
		rg.Any("/ufs/ranking", handlers.GetUFsRanking)
    rg.Any("/ufs/metadados", handlers.GetUFsMetadados)
    
		// Assistente Inteligente Aurora
		rg.Any("/aurora/perguntar", handlers.PostAuroraPerguntar)
	}

	registerRoutes(r.Group("/app/aurora_municipios/api"))
	registerRoutes(r.Group("/app/aurora_municipios"))
	registerRoutes(r.Group("/api"))
	registerRoutes(r.Group("/"))

	// Healthcheck
	r.Any("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "Go-Aurora-Municipios",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// 5. Servir Frontend Estático com proteção contra 405
	r.NoRoute(func(c *gin.Context) {
		if c.Request.Method != http.MethodGet && c.Request.Method != http.MethodHead {
			log.Printf("[404 Missing API Route] Method: %s, Path: %s", c.Request.Method, c.Request.URL.Path)
			c.JSON(http.StatusNotFound, gin.H{"error": "Rota não encontrada", "path": c.Request.URL.Path})
			return
		}

		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/js/") || strings.HasPrefix(path, "/css/") {
			c.Header("Cache-Control", "no-cache, must-revalidate")
		} else if strings.HasPrefix(path, "/images/") {
			c.Header("Cache-Control", "public, max-age=86400")
		}

		c.FileFromFS(path, http.Dir("./www"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Servidor Go rodando em http://0.0.0.0:%s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Erro ao iniciar servidor HTTP: %v", err)
	}
}
