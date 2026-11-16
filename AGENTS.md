# Diretrizes para Agentes de IA - aurora_municipios

Este repositório contém o backend Go de alta performance do projeto Aurora Municípios. Ao desenvolver ou manter este projeto, você deve seguir estritamente as regras de arquitetura e DevOps abaixo:

1. **ETLs são feitos exclusivamente em R no repositório `aurora-etl`**:
   - Nenhum script de extração, transformação ou carga de dados (ETL) em Python, R ou qualquer outra linguagem deve residir na raiz ou no repositório `aurora_municipios`.
   - Toda rotina e pipeline de ETL pertence unicamente ao repositório `aurora-etl` e deve ser escrita em R.

2. **Nenhum executável solto na raiz; usar sempre a pasta `bin/`**:
   - Binários compilados (como `server`, `server.exe`, `aurora-municipios.exe` ou ferramentas auxiliares) nunca devem ser gerados ou versionados na raiz do projeto.
   - Qualquer compilação local deve ter como destino exclusivo a pasta `bin/` (exemplo: `go build -o bin/server.exe main.go`).

3. **Proibido hardcoding de caminhos locais ou listas estáticas de metadados**:
   - Nunca use caminhos absolutos locais do sistema de arquivos (ex: `C:\Users\...`).
   - Use caminhos relativos ao executável/projeto ou obtenha caminhos e configurações dinamicamente via variáveis de ambiente (`os.Getenv`).
   - Não inclua listas estáticas de metadados hardcoded no código; carregue-as a partir dos arquivos de configuração, banco de dados ou schemas dinâmicos.
