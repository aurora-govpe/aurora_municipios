# aurora_municipios

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24279684.svg)](https://doi.org/10.5281/zenodo.24279684)
[![Release](https://img.shields.io/github/v/release/aurora-govpe/aurora_municipios)](https://github.com/aurora-govpe/aurora_municipios/releases/latest)
[![Go](https://img.shields.io/github/go-mod/go-version/aurora-govpe/aurora_municipios)](go.mod)
[![Citation](https://img.shields.io/badge/cite-CITATION.cff-blue)](CITATION.cff)

Backend moderno de alta performance em **Go** para a plataforma **Aurora Municípios**, utilizando motor analítico **DuckDB** em memória (para consultas rápidas em Parquet) e **SQLite** (para cache, auditoria e usuários).

## 1. Arquitetura

- **Servidor HTTP**: Go com framework `gin` e compressão GZIP nativa.
- **Motor Analítico**: `DuckDB` integrado lendo diretamente os arquivos Parquet de `data/parquet/`.
- **Persistência de Sistema**: `aurora_system.sqlite` para cache de IA e auditoria.
- **Frontend**: Servido estaticamente pelo Go a partir do diretório `www/`.
- **Armazenamento de Dados**: Desacoplado do repositório:
  - **Local (Windows)**: Directory Junction `data/` apontando para `C:\dados\aurora`.
  - **Produção (Docker)**: Montado como volume externo em `/app/data`.

## 2. Como Executar Localmente

### Pré-requisitos
- Go 1.21+ (com CGO habilitado para DuckDB)
- Dados presentes em `C:\dados\aurora` (conectados via Junction `data/`)

### Execução
```bash
go run main.go
```
O servidor inicializará o DuckDB em RAM e estará disponível em:
👉 `http://localhost:8000`

## 3. Build e Execução com Docker

### Construir a Imagem
```bash
docker build -t hugoavmedeiros/aurora_municipios-api:latest .
```

### Executar com Volume de Dados
- **No Windows**:
  ```bash
  docker run --rm -d -p 8000:8000 -v C:\dados\aurora:/app/data --name aurora_municipios hugoavmedeiros/aurora_municipios-api:latest
  ```
- **No Servidor Linux (Produção)**:
  ```bash
  docker run --rm -d -p 8000:8000 -v /srv/dados/aurora:/app/data --name aurora_municipios hugoavmedeiros/aurora_municipios-api:latest
  ```

## 4. Estrutura do Repositório

```text
aurora_municipios/
├── main.go            # Entry point do servidor Go e registro de rotas
├── go.mod / go.sum    # Módulos e dependências Go
├── handlers/          # Controladores HTTP e lógica analítica DuckDB/SQLite
│   ├── base.go        # Inicialização do DuckDB e índices em RAM
│   ├── ficha.go       # Endpoints da Ficha Municipal
│   ├── regioes.go     # Endpoints das Regiões de Desenvolvimento
│   ├── ufs.go         # Endpoints de Benchmarking entre Estados
│   ├── aguas.go       # Endpoints e mapas da Compesa e Adutoras
│   └── aurora.go      # Integração com assistente inteligente
├── www/               # Frontend estático (HTML, CSS, JS, mapas)
├── data/              # Junction para C:\dados\aurora (ignorado no Git)
└── Dockerfile         # Multi-stage build otimizado para produção
```

## 5. Como citar

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24279684.svg)](https://doi.org/10.5281/zenodo.24279684)

> Leite, A., Wasiliew, M., Vasconcelos, H., Amorim, C., Bezerra, D., Nascimento Barreto, J., & Cunha Albuquerque, C. M. da. *aurora_municipios: backend da plataforma Aurora Municípios*. Zenodo. https://doi.org/10.5281/zenodo.24279684

Os dados de citação estão em [`CITATION.cff`](CITATION.cff); no GitHub, use o
botão "Cite this repository". O DOI acima aponta sempre para a versão mais
recente arquivada no Zenodo; cada release tem também um DOI próprio.
