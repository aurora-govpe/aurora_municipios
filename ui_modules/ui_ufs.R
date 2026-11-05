# ui_modules/ui_ufs.R
library(htmltools)

ui_modulo_ufs <- function() {
  tags$div(
    class = "tab-pane relative",
    `data-value` = "UFs",
    id = "aba_ufs",
    
    tags$div(
      class = "container-fluid mt-3 px-4",
      
      # CAPA DE IMPRESSÃO
      tags$div(
        class = "capa-relatorio d-none d-print-flex flex-column justify-content-center align-items-center text-center",
        style = "display: none;",
        tags$img(src = "images/brasao_gov_pe.png", style = "width: 120px; margin-bottom: 20px;"),
        tags$h5("GOVERNO DO ESTADO DE PERNAMBUCO", class = "fw-bold text-dark"),
        tags$h6("Secretaria de Planejamento, Gestão e Desenvolvimento Regional — SEPLAG", class = "fw-bold text-dark"),
        tags$p("Painel Comparativo de Unidades da Federação (Benchmarking Nacional)", class = "text-muted mb-5"),
        tags$span(class = "badge bg-dark rounded-pill px-3 py-2 mb-3", "PAINEL AURORA"),
        tags$h1("BENCHMARKING ESTADUAL (UFs)", class = "display-4 fw-black text-primary"),
        tags$h2(id = "capa_nome_uf", class = "fw-bold text-secondary mb-5", "PERNAMBUCO"),
        tags$h4("RELATÓRIO COMPARATIVO NACIONAL", class = "fw-bold text-secondary mt-4")
      ),
      
            # CABEÇALHO PRINCIPAL COM CONTROLES INTEGRADOS NO TOPO & BANDEIRA OFICIAL
      tags$div(
        class = "d-flex justify-content-between align-items-center border-b-2 border-slate-200 pb-3 mb-4 flex-wrap gap-3",
        tags$div(
          class = "d-flex align-items-center gap-3",
          tags$img(
            id = "ufs_img_bandeira",
            src = "images/bandeiras/PE.png",
            alt = "Bandeira Pernambuco",
            class = "rounded-lg shadow-sm border border-slate-200 object-cover flex-shrink-0 transition-all",
            style = "width: 52px; height: 36px;"
          ),
          tags$div(
            tags$h2(id = "ufs_header_titulo", class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "BENCHMARKING DAS UFs — PERNAMBUCO (PE)"),
            tags$p(id = "ufs_header_subtitulo", class = "text-sm font-bold text-slate-500 mb-0", "Comparativo Socioeconômico, Ambiental e Fiscal entre os 26 Estados e o DF")
          )
        ),
        tags$div(
          id = "controles_ufs",
          class = "d-flex align-items-center gap-2 d-print-none flex-wrap",
          # Seletor de UF com Bandeiras
          tags$div(
            class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200 shadow-2xs",
            tags$i(class = "fas fa-flag text-[#ff5a26]"),
            tags$select(
              id = "ufs_f_uf", 
              class = "form-select form-select-sm fw-bold text-slate-800 bg-transparent border-0 shadow-none cursor-pointer focus:ring-0",
              style = "max-width: 190px; font-size: 0.85rem; outline: none; box-shadow: none;"
            )
          ),
          # Dropdown de Navegação Rápida pelos 5 Eixos
          tags$div(
            class = "dropdown",
            tags$button(
              class = "btn btn-sm btn-white bg-white border border-slate-200 text-slate-700 fw-bold rounded-pill d-flex align-items-center gap-1.5 px-3 py-1.5 shadow-2xs",
              type = "button",
              `data-bs-toggle` = "dropdown",
              `data-bs-display` = "static",
              `aria-expanded` = "false",
              title = "Navegar pelos 5 Eixos do Benchmarking",
              style = "font-size: 0.8rem; height: 34px;",
              tags$i(class = "fas fa-compass text-[#ff5a26]", style = "font-size: 0.85rem;"),
              tags$span("Eixos"),
              tags$i(class = "fas fa-chevron-down text-slate-400 ms-1", style = "font-size: 0.65rem;")
            ),
            tags$ul(
              class = "dropdown-menu dropdown-menu-end shadow-xl border border-slate-200 py-2 text-xs rounded-2xl",
              style = "min-width: 260px; z-index: 1060;",
              tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_conhecimento')", tags$i(class = "fas fa-lightbulb text-warning w-4 text-center"), "1. Conhecimento e Inovação")),
              tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_seguranca')", tags$i(class = "fas fa-shield-halved text-danger w-4 text-center"), "2. Segurança e Cidadania")),
              tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_saude')", tags$i(class = "fas fa-heartbeat text-primary w-4 text-center"), "3. Saúde e Qualidade de Vida")),
              tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_sustentabilidade')", tags$i(class = "fas fa-tree text-success w-4 text-center"), "4. Desenvolvimento Sustentável")),
              tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_gestao')", tags$i(class = "fas fa-scale-balanced text-purple-700 w-4 text-center"), "5. Gestão e Transparência"))
            )
          ),
          # Alternador de IPCA
          tags$button(
            id = "ufs_btn_ipca",
            class = "btn btn-outline-dark btn-sm rounded-pill font-bold text-xs d-flex align-items-center gap-1.5 px-3 py-1.5 shadow-none",
            onclick = "window.toggleIPCAUFs()",
            tags$i(class = "fas fa-coins text-amber-500"),
            tags$span(id = "ufs_btn_ipca_label", "Valores Nominais")
          ),
          # Botão Salvar PDF
          tags$button(
            class = "btn btn-outline-dark btn-sm fw-bold shadow-sm rounded-pill px-3",
            onclick = "window.print()",
            tags$i(class = "fas fa-file-pdf me-1 text-danger"), "Salvar PDF"
          )
        )
      ),

      
      # =========================================================================
      # SEÇÃO: RESUMO EXECUTIVO DAS UFs (5 EIXOS ESTRATÉGICOS)
      # =========================================================================
      tags$div(
        id = "sec_ufs_resumo_executivo",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-2",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Resumo Executivo de Benchmarking"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Síntese Estratégica Comparativa pelos 5 Eixos do Planejamento Governamental")
      ),
      
      tags$div(
        id = "ufs_container_resumo_executivo",
        class = "mb-5"
      ),
      
      # =========================================================================
      # EIXO 1: CONHECIMENTO E INOVAÇÃO
      # =========================================================================
      tags$div(
        id = "sec_ufs_conhecimento",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-lightbulb text-warning me-2"), "Eixo 1: Conhecimento e Inovação"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Desempenho Educacional (IDEB, Abandono, Distorção, Creches e Pré-escola) e Investimentos em C&T e Educação")
        ),
        tags$div(
          class = "bg-amber-50/60 border border-amber-200 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-amber-600 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Síntese Estratégica"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Educação & Ciência e Tecnologia")
          ),
          tags$p(id = "ufs_sintese_conhecimento", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Indicadores educacionais oficiais por rede de ensino (Estadual, Pública e Total) integrados às despesas orçamentárias executadas em Educação e Ciência & Tecnologia.")
        ),
        tags$div(
          id = "grid_ufs_conhecimento",
          class = "row g-3 mb-4"
        )
      ),
      
      # =========================================================================
      # EIXO 2: SEGURANÇA E CIDADANIA
      # =========================================================================
      tags$div(
        id = "sec_ufs_seguranca",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-shield-halved text-danger me-2"), "Eixo 2: Segurança e Cidadania"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Alocação Orçamentária em Segurança Pública, Direitos da Cidadania, Judiciária e Legislativa")
        ),
        tags$div(
          class = "bg-rose-50/60 border border-rose-200 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-rose-600 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Proteção Social & Cidadania"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Recursos Executados em Segurança e Garantia de Direitos")
          ),
          tags$p(id = "ufs_sintese_seguranca", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Demonstrativo dos recursos empenhados/liquidados pelo Estado nas funções de Segurança Pública e Direitos da Cidadania, com comparações relativas aos demais estados.")
        ),
        tags$div(
          id = "grid_ufs_seguranca",
          class = "row g-3 mb-4"
        )
      ),
      
      # =========================================================================
      # EIXO 3: SAÚDE E QUALIDADE DE VIDA
      # =========================================================================
      tags$div(
        id = "sec_ufs_saude",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-heartbeat text-primary me-2"), "Eixo 3: Saúde e Qualidade de Vida"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Mercado de Trabalho, Demografia, Saúde Pública, Vinculação Constitucional, Saneamento, Habitação e Assistência Social")
        ),
        tags$div(
          class = "bg-blue-50/60 border border-blue-200 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-blue-600 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Qualidade de Vida"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Investimentos Sociais e Infraestrutura Urbana")
          ),
          tags$p(id = "ufs_sintese_saude", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Acompanhamento dos recursos destinados à atenção à saúde (incluindo o percentual obrigatório de vinculação da receita de impostos), habitação digna, urbanismo e previdência.")
        ),
        tags$div(
          id = "grid_ufs_saude",
          class = "row g-3 mb-4"
        )
      ),
      
      # =========================================================================
      # EIXO 4: DESENVOLVIMENTO SUSTENTÁVEL
      # =========================================================================
      tags$div(
        id = "sec_ufs_sustentabilidade",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-tree text-emerald-600 me-2"), "Eixo 4: Desenvolvimento Sustentável"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "PIB, Produtividade do Trabalho, Unidades de Conservação e Despesas com Gestão Ambiental, Agricultura e Transporte")
        ),
        tags$div(
          class = "bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-emerald-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Meio Ambiente & Sustentabilidade"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Conservação Ambiental e Desenvolvimento Verde")
          ),
          tags$p(id = "ufs_sintese_sustentabilidade", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Preservação do patrimônio natural (hectares protegidos e unidades sob gestão estadual, federal e municipal) conjugada ao financiamento da gestão ambiental e logística.")
        ),
        tags$div(
          id = "grid_ufs_sustentabilidade",
          class = "row g-3 mb-4"
        )
      ),
      
      # =========================================================================
      # EIXO 5: GESTÃO, TRANSPARÊNCIA E PARTICIPAÇÃO (DADOS FISCAIS)
      # =========================================================================
      tags$div(
        id = "sec_ufs_gestao",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-scale-balanced text-purple-700 me-2"), "Eixo 5: Gestão, Transparência e Participação"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Painel Fiscal Consolidado — Resultados Orçamentários, Primário, Nominal, Dívida, Receitas e Despesas de Capital")
        ),
        tags$div(
          class = "bg-purple-50/60 border border-purple-200 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-purple-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Responsabilidade Fiscal"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Equilíbrio Fiscal e Gestão Orçamentária")
          ),
          tags$p(id = "ufs_sintese_gestao", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Métricas de solvência fiscal, cumprimento dos limites da LRF (Pessoal e DCL), arrecadação própria (impostos), transferências da União e execução de investimentos públicos.")
        ),
        
        # Sub-bloco 5.1: Resultados Fiscais e Endividamento
        tags$h5(class = "fw-black text-slate-700 text-sm uppercase tracking-wider mb-2", tags$i(class = "fas fa-chart-pie me-1 text-primary"), "Resultados Fiscais e Limites da LRF"),
        tags$div(id = "grid_ufs_fiscal_resultados", class = "row g-3 mb-4"),
        
        # Sub-bloco 5.2: Arrecadação e Receitas
        tags$h5(class = "fw-black text-slate-700 text-sm uppercase tracking-wider mb-2", tags$i(class = "fas fa-coins me-1 text-success"), "Receitas Realizadas e Transferências"),
        tags$div(id = "grid_ufs_fiscal_receitas", class = "row g-3 mb-4"),
        
        # Sub-bloco 5.3: Despesas e Investimentos
        tags$h5(class = "fw-black text-slate-700 text-sm uppercase tracking-wider mb-2", tags$i(class = "fas fa-hand-holding-dollar me-1 text-danger"), "Despesas de Gestão e Investimentos"),
        tags$div(id = "grid_ufs_fiscal_despesas", class = "row g-3 mb-4")
      ),
      
      # =========================================================================
      # MODAL DE SÉRIE HISTÓRICA E RANKING NACIONAL
      # =========================================================================
      tags$div(
        class = "modal fade",
        id = "modal_ufs_kpi_serie",
        tabindex = "-1",
        `aria-labelledby` = "modal_ufs_kpi_titulo",
        `aria-hidden` = "true",
        tags$div(
          class = "modal-dialog modal-xl modal-dialog-centered",
          tags$div(
            class = "modal-content border-0 shadow-lg",
            style = "border-radius: 18px; overflow: hidden;",
            tags$div(
              class = "modal-header bg-slate-900 text-white px-4 py-3 border-0",
              tags$h5(id = "modal_ufs_kpi_titulo", class = "modal-title fw-black tracking-tight", "Série Histórica e Ranking Nacional"),
              tags$button(type = "button", class = "btn-close btn-close-white", `data-bs-dismiss` = "modal", `aria-label` = "Fechar")
            ),
            tags$div(
              class = "modal-body p-4 bg-slate-50",
              
              # Storytelling do indicador no Modal
              tags$div(
                id = "modal_ufs_kpi_storytelling",
                class = "alert bg-white border border-slate-200 shadow-sm rounded-xl p-3 mb-4 text-sm text-slate-700",
                "Carregando informações..."
              ),
              
              # Linha dos dois gráficos: Série Histórica da UF + Comparativo Nacional de todas as UFs
              tags$div(
                class = "row g-4",
                tags$div(
                  class = "col-lg-6",
                  tags$div(
                    class = "bg-white p-3 rounded-2xl border border-slate-200 shadow-sm h-100",
                    tags$h6(class = "fw-black text-slate-800 text-sm mb-3 d-flex align-items-center gap-1.5",
                            tags$i(class = "fas fa-chart-line text-primary"), "Evolução Histórica"),
                    tags$div(id = "modal_ufs_chart_serie", style = "width: 100%; height: 350px;")
                  )
                ),
                tags$div(
                  class = "col-lg-6",
                  tags$div(
                    class = "bg-white p-3 rounded-2xl border border-slate-200 shadow-sm h-100",
                    tags$h6(class = "fw-black text-slate-800 text-sm mb-3 d-flex align-items-center gap-1.5",
                            tags$i(class = "fas fa-chart-simple text-purple-700"), "Ranking Nacional (27 UFs + NE e Brasil)"),
                    tags$div(id = "modal_ufs_chart_ranking", style = "width: 100%; height: 350px;")
                  )
                )
              )
            ),
            tags$div(
              class = "modal-footer bg-white border-top border-slate-200 px-4 py-2",
              tags$button(type = "button", class = "btn btn-secondary btn-sm rounded-pill px-4 fw-bold", `data-bs-dismiss` = "modal", "Fechar")
            )
          )
        )
      )
      
    )
  )
}
