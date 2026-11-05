# ui_modules/ui_regioes.R
library(htmltools)

ui_modulo_regioes <- function() {
  tags$div(
    class = "tab-pane relative",
    `data-value` = "Regiões",
    id = "aba_regioes",
    
    tags$div(
      class = "container-fluid mt-3 px-4",
      
      # CAPA DE IMPRESSÃO
      tags$div(
        class = "capa-relatorio d-none d-print-flex flex-column justify-content-center align-items-center text-center",
        style = "display: none;",
        tags$img(src = "images/brasao_gov_pe.png", style = "width: 120px; margin-bottom: 20px;"),

        tags$h5("GOVERNO DO ESTADO DE PERNAMBUCO", class = "fw-bold text-dark"),
        tags$h6("Secretaria de Planejamento, Gestão e Desenvolvimento Regional — SEPLAG", class = "fw-bold text-dark"),
        tags$p("Relatório de Diagnóstico Territorial das Regiões de Desenvolvimento", class = "text-muted mb-5"),
        tags$span(class = "badge bg-dark rounded-pill px-3 py-2 mb-3", "PAINEL AURORA"),
        tags$h1("DIAGNÓSTICO REGIONAL", class = "display-4 fw-black text-primary"),
        tags$h2(id = "capa_nome_rd", class = "fw-bold text-secondary mb-5", "REGIÃO DE DESENVOLVIMENTO"),
        tags$h4("RELATÓRIO EXECUTIVO", class = "fw-bold text-secondary mt-4")
      ),
      
      # CABEÇALHO PRINCIPAL COM CONTROLES INTEGRADOS NO TOPO
      tags$div(
        class = "d-flex justify-content-between align-items-center border-b-2 border-slate-200 pb-3 mb-4 flex-wrap gap-3",
        tags$div(
          tags$h2(id = "regional_titulo_rd", class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "REGIÃO DE DESENVOLVIMENTO"),
          tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Relatório de Diagnóstico Territorial — Arquitetura por Clusters Tipológicos")
        ),
        tags$div(
          id = "controles_regioes",
          class = "d-flex align-items-center gap-2 flex-wrap d-print-none",
          # Alternador RD vs Consórcio
          tags$div(
            class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 shadow-2xs",
            tags$button(
              id = "regioes_btn_tipo_rd",
              type = "button",
              class = "btn btn-xs rounded-pill px-3 py-1 font-bold text-xs shadow-xs btn-primary text-white",
              onclick = "window.trocarTipoAgrupamentoRegioes('rd')",
              title = "Filtrar por Região de Desenvolvimento",
              tags$i(class = "fas fa-layer-group me-1"), "RD"
            ),
            tags$button(
              id = "regioes_btn_tipo_consorcio",
              type = "button",
              class = "btn btn-xs rounded-pill px-3 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
              onclick = "window.trocarTipoAgrupamentoRegioes('consorcio')",
              title = "Filtrar por Consórcios Intermunicipais",
              tags$i(class = "fas fa-handshake me-1"), "Consórcios"
            )
          ),
          # Seletor de Região / Consórcio
          tags$div(
            class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200 shadow-2xs",
            tags$i(id = "regioes_filtro_icone", class = "fas fa-location-dot text-[#ff5a26]"),
            tags$select(
              id = "regioes_f_rd", 
              class = "form-select form-select-sm fw-bold text-slate-800 bg-transparent border-0 shadow-none cursor-pointer focus:ring-0",
              style = "max-width: 260px; font-size: 0.85rem; outline: none; box-shadow: none;"
            )
          ),
          # Botão Salvar PDF
          tags$button(
            class = "btn btn-outline-dark btn-sm fw-bold shadow-sm rounded-pill px-3 transition-all",
            onclick = "window.print()",
            tags$i(class = "fas fa-file-pdf me-1 text-danger"), "Salvar PDF"
          )
        )
      ),
      
      # BLOCO DE KPIS MACRO DA RD
      tags$div(
        class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
        tags$div(
          class = "kpi-modern-card", style = "border-left-color: #ff5a26;",
          tags$div(class = "kpi-modern-header", "MUNICÍPIOS NA RD"),
          tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-city kpi-modern-icon", style = "color: #ff5a26;"), tags$span(class = "kpi-modern-number", id = "rd_kpi_qtd_muns", "0")),
          tags$div(class = "kpi-modern-footer text-uppercase", "Municípios Integrantes")
        ),
        tags$div(
          class = "kpi-modern-card", style = "border-left-color: #f59e0b;",
          tags$div(class = "kpi-modern-header", "POPULAÇÃO REGIONAL"),
          tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-users kpi-modern-icon", style = "color: #f59e0b;"), tags$span(class = "kpi-modern-number", id = "rd_kpi_pop_total", "0")),
          tags$div(class = "kpi-modern-footer text-uppercase", "Habitantes Estimados (2026)")
        ),
        tags$div(
          class = "kpi-modern-card", style = "border-left-color: #27AE60;",
          tags$div(class = "kpi-modern-header", "PIB REGIONAL CONSOLIDADO"),
          tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "rd_kpi_pib_total", "R$ 0")),
          tags$div(class = "kpi-modern-footer text-uppercase", "Soma dos PIB Municipais")
        ),
        tags$div(
          class = "kpi-modern-card", style = "border-left-color: #8E44AD;",
          tags$div(class = "kpi-modern-header", "AÇÕES E INVESTIMENTOS ESTADUAIS"),
          tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "rd_kpi_investimento_total", "R$ 0")),
          tags$div(class = "kpi-modern-footer text-uppercase", "Recursos Alocados na RD")
        )
      ),
      
      # =================================================
      # SEÇÃO: RESUMO EXECUTIVO REGIONAL (6 DIMENSÕES)
      # =================================================
      tags$div(
        id = "sec_rd_resumo_executivo",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-2",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Resumo Executivo Integrado"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Síntese Estratégica Multidimensional: Redes Urbanas, Demografia, Economia, Capital Humano, Vulnerabilidade e Fiscal")
      ),
      
      tags$div(
        id = "rd_container_resumo_executivo",
        class = "mb-5"
      ),
      
      # CLUSTER 0: DESENVOLVIMENTO REGIONAL E REDES URBANAS
      tags$div(
        id = "sec_cluster0",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Dimensão 0: Desenvolvimento Regional e Redes Urbanas"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Análise de Polos (REGIC), Arranjos Populacionais, Acessibilidade e Fluxos")
        ),
        tags$div(
          class = "bg-purple-50/60 border border-purple-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-purple-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Visão de Rede (REGIC)"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Integração e Centralidade")
          ),
          tags$p(id = "rd_sintese_cluster0", class = "text-sm text-slate-700 leading-relaxed mb-0", 
                 "Dimensão basilar (Dimensão 0) focada nas lógicas de integração territorial: Acessibilidade de busca/escoamento, índices de atração e gargalos da rede de transportes. Mede a força da hierarquia urbana e a polarização da Região.")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada de Rede e Interação"),
              tags$span(id = "rd_map_cluster0_var_label", class = "text-sm font-black text-slate-800", "Acessibilidade (Busca/Escoamento)")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2 flex-wrap",
              tags$button(
                id = "rd_btn_toggle_rotas0",
                class = "btn btn-outline-primary btn-sm rounded-pill font-bold text-xs d-flex align-items-center gap-1.5 px-3 py-1.5 shadow-none",
                style = "border: 1.5px solid #7c3aed; color: #7c3aed; background: transparent;",
                onclick = "window.toggleModoRotasCluster0()",
                tags$i(class = "fas fa-route"),
                tags$span(id = "rd_btn_rotas_label", "Ver Rotas / Fluxos")
              ),
              tags$div(
                class = "d-flex align-items-center gap-2",
                tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador:"),
                tags$select(id = "rd_select_cluster0", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 270px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(0, this.value)")
              )
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster0", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster0", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster0", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster0", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster0", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # CLUSTER 1: TRANSIÇÃO DEMOGRÁFICA
      tags$div(
        id = "sec_cluster1",
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Cluster 1: Transição Demográfica & Perfil Populacional"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Mapeamento da dinâmica populacional, grau de urbanização e ritmo de envelhecimento")
        ),
        tags$div(
          class = "bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-primary text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Bloco A — Síntese do Cluster"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Diagnóstico Demográfico Territorial")
          ),
          tags$p(id = "rd_sintese_cluster1", class = "text-sm text-slate-700 leading-relaxed mb-0", "Carregando análise...")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada Visual e Comparativo"),
              tags$span(id = "rd_map_cluster1_var_label", class = "text-sm font-black text-slate-800", "Razão de Dependência Total")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador Exibido:"),
              tags$select(id = "rd_select_cluster1", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 260px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(1, this.value)")
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster1", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster1", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster1", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster1", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster1", class = "w-full h-full")
                     )
            )
          ),
          tags$div(
            class = "row mt-3",
            tags$div(class = "col-12",
                     tags$div(class = "bg-white rounded-xl border border-slate-200 shadow-sm w-full h-[260px] p-2 relative",
                              tags$div(id = "rd_spinner_hist_cluster1", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando série histórica...")
                              ),
                              tags$div(id = "rd_chart_hist_cluster1", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # CLUSTER 2: POLOS DE CTI
      tags$div(
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Cluster 2: Polos Regionais de CTI & Serviços Avançados"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Densidade tecnológica, infraestrutura digital, comércio exterior e capital humano de alto valor")
        ),
        tags$div(
          class = "bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-emerald-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Bloco A — Síntese do Cluster"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Diagnóstico de Inovação & Tecnologia")
          ),
          tags$p(id = "rd_sintese_cluster2", class = "text-sm text-slate-700 leading-relaxed mb-0", "Carregando análise...")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada Visual e Comparativo"),
              tags$span(id = "rd_map_cluster2_var_label", class = "text-sm font-black text-slate-800", "Cobertura de Fibra Óptica")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador Exibido:"),
              tags$select(id = "rd_select_cluster2", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 260px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(2, this.value)")
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster2", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster2", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster2", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster2", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster2", class = "w-full h-full")
                     )
            )
          ),
          tags$div(
            class = "row mt-3",
            tags$div(class = "col-12",
                     tags$div(class = "bg-white rounded-xl border border-slate-200 shadow-sm w-full h-[260px] p-2 relative",
                              tags$div(id = "rd_spinner_hist_cluster2", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando série histórica...")
                              ),
                              tags$div(id = "rd_chart_hist_cluster2", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # CLUSTER 3: VOCAÇÕES ECONÔMICAS & LOGÍSTICA
      tags$div(
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Cluster 3: Vocações Econômicas & Produtivas, Logística e Centralidade Regional"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Base produtiva, estrutura setorial do emprego, PIB per capita e conectividade")
        ),
        tags$div(
          class = "bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-amber-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Bloco A — Síntese do Cluster"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Diagnóstico Econômico & Produtivo")
          ),
          tags$p(id = "rd_sintese_cluster3", class = "text-sm text-slate-700 leading-relaxed mb-0", "Carregando análise...")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada Visual e Comparativo"),
              tags$span(id = "rd_map_cluster3_var_label", class = "text-sm font-black text-slate-800", "PIB per Capita")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador Exibido:"),
              tags$select(id = "rd_select_cluster3", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 260px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(3, this.value)")
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster3", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster3", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster3", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster3", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster3", class = "w-full h-full")
                     )
            )
          ),
          tags$div(
            class = "row mt-3",
            tags$div(class = "col-12",
                     tags$div(class = "bg-white rounded-xl border border-slate-200 shadow-sm w-full h-[260px] p-2 relative",
                              tags$div(id = "rd_spinner_hist_cluster3", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando série histórica...")
                              ),
                              tags$div(id = "rd_chart_hist_cluster3", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # CLUSTER 4: VULNERABILIDADE SOCIAL & HABITAÇÃO
      tags$div(
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Cluster 4: Vulnerabilidade Social Crítica, Habitação e Serviços Básicos"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Privações sociais (IVCAD), saneamento básico, indicadores de aprendizagem, saúde e segurança pública")
        ),
        tags$div(
          class = "bg-purple-50/60 border border-purple-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-purple-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Bloco A — Síntese do Cluster"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Diagnóstico de Vulnerabilidade Social & Infraestrutura Básica")
          ),
          tags$p(id = "rd_sintese_cluster4", class = "text-sm text-slate-700 leading-relaxed mb-0", "Carregando análise...")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada Visual e Comparativo"),
              tags$span(id = "rd_map_cluster4_var_label", class = "text-sm font-black text-slate-800", "Índice de Vulnerabilidade Social (IVCAD)")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador Exibido:"),
              tags$select(id = "rd_select_cluster4", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 260px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(4, this.value)")
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster4", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster4", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster4", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster4", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster4", class = "w-full h-full")
                     )
            )
          ),
          tags$div(
            class = "row mt-3",
            tags$div(class = "col-12",
                     tags$div(class = "bg-white rounded-xl border border-slate-200 shadow-sm w-full h-[260px] p-2 relative",
                              tags$div(id = "rd_spinner_hist_cluster4", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando série histórica...")
                              ),
                              tags$div(id = "rd_chart_hist_cluster4", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # CLUSTER 5: CAPACIDADE E GESTÃO FISCAL
      tags$div(
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Dimensão 5: Capacidade e Gestão Fiscal"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Composição de receitas, esforço de investimento em infraestrutura, equilíbrio orçamentário e classificação CAPAG")
        ),
        tags$div(
          class = "bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-4",
          tags$div(class = "d-flex align-items-center gap-2 mb-1",
                   tags$span(class = "badge bg-emerald-700 text-white text-xs uppercase px-2.5 py-1 rounded-pill", "Bloco A — Diagnóstico Fiscal Territorial"),
                   tags$h6(class = "font-black text-slate-800 text-sm mb-0", "Finanças Públicas e Capacidade de Investimento")
          ),
          tags$p(id = "rd_sintese_cluster5", class = "text-sm text-slate-700 leading-relaxed mb-0", "Carregando análise fiscal...")
        ),
        # Micro-KPIs Fiscais da RD
        tags$div(
          class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
          tags$div(
            class = "bg-white p-3 rounded-xl border border-slate-200 shadow-sm",
            tags$span(class = "text-xs font-bold text-slate-400 uppercase block", "RCL Consolidada (RD)"),
            tags$span(id = "rd_fisc_kpi_rcl", class = "text-base font-black text-slate-800", "R$ -")
          ),
          tags$div(
            class = "bg-white p-3 rounded-xl border border-slate-200 shadow-sm",
            tags$span(class = "text-xs font-bold text-slate-400 uppercase block", "Investimento Total"),
            tags$span(id = "rd_fisc_kpi_invest", class = "text-base font-black text-emerald-700", "R$ -")
          ),
          tags$div(
            class = "bg-white p-3 rounded-xl border border-slate-200 shadow-sm",
            tags$span(class = "text-xs font-bold text-slate-400 uppercase block", "Dependência Repasses"),
            tags$span(id = "rd_fisc_kpi_dep", class = "text-base font-black text-slate-800", "-%")
          ),
          tags$div(
            class = "bg-white p-3 rounded-xl border border-slate-200 shadow-sm",
            tags$span(class = "text-xs font-bold text-slate-400 uppercase block", "CAPAG Predominante"),
            tags$span(id = "rd_fisc_kpi_capag", class = "text-base font-black text-blue-700", "-")
          )
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative",
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-b border-slate-100 pb-3",
            tags$div(
              tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider block", "Camada Visual e Comparativo"),
              tags$span(id = "rd_map_cluster5_var_label", class = "text-sm font-black text-slate-800", "Receita Corrente Líquida (RCL)")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$label(class = "text-xs font-bold text-slate-500 mb-0", "Indicador Exibido:"),
              tags$select(id = "rd_select_cluster5", class = "form-select form-select-sm fw-bold text-slate-700", style = "width: 280px; font-size: 0.8rem;", onchange = "window.atualizarVariavelCluster(5, this.value)")
            )
          ),
          tags$div(
            class = "row g-4",
            tags$div(class = "col-lg-7",
                     tags$div(class = "map-clean-container w-full h-[400px] relative rounded-xl overflow-hidden",
                              tags$div(id = "rd_spinner_map_cluster5", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando mapa regional...")
                              ),
                              tags$div(id = "rd_map_cluster5", class = "w-full h-full"),
                              tags$div(id = "rd_legenda_cluster5", class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs")
                     )
            ),
            tags$div(class = "col-lg-5",
                     tags$div(class = "bg-slate-50 rounded-xl border border-slate-100 w-full h-[400px] p-2 relative",
                              tags$div(id = "rd_spinner_chart_cluster5", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando ranking...")
                              ),
                              tags$div(id = "rd_chart_cluster5", class = "w-full h-full")
                     )
            )
          ),
          tags$div(
            class = "row mt-3",
            tags$div(class = "col-12",
                     tags$div(class = "bg-white rounded-xl border border-slate-200 shadow-sm w-full h-[260px] p-2 relative",
                              tags$div(id = "rd_spinner_hist_cluster5", class = "rd-cluster-spinner",
                                       tags$div(class = "spinner-border text-primary", role = "status"),
                                       tags$span(class = "rd-cluster-spinner-text", "Carregando série histórica...")
                              ),
                              tags$div(id = "rd_chart_hist_cluster5", class = "w-full h-full")
                     )
            )
          )
        )
      ),
      
      # MATRIZ DIAGNÓSTICA COMPLETA DA RD
      tags$div(
        class = "subsecao-print-break mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-3",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", "Matriz Diagnóstica dos Municípios da RD"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Bloco D — Visão analítica item a item comparando todos os municípios pertencentes à Região de Desenvolvimento")
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative min-h-[220px]",
          tags$div(id = "rd_spinner_matriz", class = "rd-cluster-spinner",
                   tags$div(class = "spinner-border text-primary", role = "status"),
                   tags$span(class = "rd-cluster-spinner-text", "Carregando matriz dos municípios...")
          ),
          tags$table(id = "rd_tabela_matriz_municipios", class = "table w-100")
        )
      )
    )
  )
}
