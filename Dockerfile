# 1. Build Stage (Debian Bookworm com Go para CGO e DuckDB)
FROM golang:bookworm AS builder

ENV CGO_ENABLED=1 \
    GOOS=linux \
    GOTOOLCHAIN=auto

# Instala ferramentas essenciais de compilação C/C++
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache e download das dependências Go
COPY go.mod go.sum ./
RUN go mod download

# Copia o código fonte do projeto
COPY . .

# Compila o binário otimizado para produção
RUN go build -ldflags="-w -s" -o server main.go

# 2. Runtime Stage (Debian bookworm-slim leve com glibc)
FROM debian:bookworm-slim

# Instala certificados CA e fuso horário Recife
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV TZ="America/Recife"
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Copia o binário compilado, dados parquet/sqlite e arquivos estáticos (UI www)
COPY --from=builder /app/server /app/server
RUN mkdir -p /app/data
COPY www /app/www
COPY templates /app/templates

# Configuração da porta da aplicação
ENV PORT=8000
EXPOSE 8000

CMD ["/app/server"]

# docker build -t juliabarretocp/aurora_municipios-api:latest .
# docker push juliabarretocp/aurora_municipios-api:latest

# --- Comandos Úteis ---
# Build da imagem:
# docker build -t hugoavmedeiros/aurora_municipios-api:latest .
# docker push hugoavmedeiros/aurora_municipios-api:latest
# docker pull hugoavmedeiros/aurora_municipios-api:latest
#
# Executar container localmente:
# docker run --rm -d -p 8000:8000 --name teste_aurora_municipios hugoavmedeiros/aurora_municipios-api:latest
#
# Executar montando volume de dados:
# docker run --rm -d -p 8000:8000 -v C:\Users\hugo.vasconcelos\Documents\projetos\segpr_ndgr\auroraprime\app_aurora_municipios\data:/app/data --name teste_aurora_municipios hugoavmedeiros/aurora_municipios-api:latest