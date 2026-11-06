ui_modulo_ficha <- function() {
  tags$div(
    class = "tab-pane relative",
    `data-value` = "Municípios",
    id = "aba_ficha",
    
    tags$div(
      class = "container-fluid mt-3 px-4",
      
      # CAPA DO RELATÓRIO (PDF)
      tags$div(
        class = "capa-relatorio d-none d-print-flex flex-column justify-content-center align-items-center text-center",
        style = "display: none;",
        tags$img(src = "images/brasao_gov_pe.png", style = "width: 120px; margin-bottom: 20px;"),
        
        tags$h5("GOVERNO DO ESTADO DE PERNAMBUCO", class = "fw-bold text-dark"),
        tags$h6("Secretaria de Planejamento, Gestão e Desenvolvimento Regional — SEPLAG", class = "fw-bold text-dark"),
        tags$p("Secretaria de Planejamento, Gestão e Desenvolvimento Regional", class = "text-muted mb-5"),
        tags$br(), tags$br(), tags$br(),
        tags$span(class = "badge bg-dark rounded-pill px-3 py-2 mb-3", "PAINEL AURORA"),
        tags$h1("MUNICÍPIOS", class = "display-4 fw-black text-primary"),
        tags$h2(id = "capa_nome_municipio", class = "fw-bold text-secondary mb-5", "MUNICÍPIO"),
        tags$h4(id = "capa_tipo_relatorio", class = "fw-bold text-secondary mt-4", "RELATÓRIO EXECUTIVO")
      ),
      
      # CONTROLES SUPERIORES: SELETOR DE SUB-ABAS E FILTRO DE MUNICÍPIO
      tags$div(
        class = "d-flex align-items-center justify-content-between mb-3 pb-2 border-b border-slate-200 flex-wrap gap-2 d-print-none",
        tags$div(
          class = "d-flex align-items-center gap-2 flex-wrap",
          # Alternador Ficha vs Comparativo
          tags$div(
            class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 shadow-2xs",
            tags$button(
              id = "btn_subaba_ficha",
              type = "button",
              class = "btn btn-sm rounded-pill px-3 py-1 font-bold text-xs shadow-xs btn-primary text-white",
              onclick = "window.trocarSubabaMunicipios('ficha')",
              title = "Visualizar Ficha Municipal Completa",
              tags$i(class = "fas fa-file-invoice me-1.5"), "Ficha Municipal"
            ),
            tags$button(
              id = "btn_subaba_comparacao",
              type = "button",
              class = "btn btn-sm rounded-pill px-3 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
              onclick = "window.trocarSubabaMunicipios('comparacao')",
              title = "Comparar 2 ou 3 Municípios Multidimensionalmente",
              tags$i(class = "fas fa-code-compare me-1.5"), "Comparativo Municipal"
            )
          ),
          # Filtro de Município Individual no Topo
          tags$div(
            id = "box_filtro_municipio_individual",
            class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200 shadow-2xs",
            tags$i(class = "fas fa-location-dot text-[#ff5a26]"),
            tags$select(
              id = "ficha_f_municipio", 
              class = "form-select-municipio",
              `data-live-search` = "true",
              `data-live-search-normalize` = "true",
              `data-live-search-placeholder` = "Buscar município...",
              `data-none-results-text` = "Nenhum município encontrado",
              `data-size` = "10",
              `data-style` = "btn-sm btn-light fw-bold text-slate-800 border-0 bg-transparent py-0 px-1 shadow-none",
              `data-width` = "240px"
            )
          )
        ),
        tags$div(
          class = "d-flex align-items-center gap-2",
          tags$button(
            class = "btn btn-outline-dark btn-sm fw-bold shadow-sm rounded-pill px-3 transition-all",
            onclick = "window.print()",
            tags$i(class = "fas fa-file-pdf me-1 text-danger"), "Salvar PDF"
          ),
          tags$span(class = "badge bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold rounded-pill px-3 py-1",
            tags$i(class = "fas fa-compass me-1 text-[#ff5a26]"), "184 Municípios"
          )
        )
      ),

      tags$div(
        id = "subaba_ficha_municipal",
      
      # SEÇÃO 1: CARACTERIZAÇÃO REESTRUTURADA
      tags$div(
        id = "sec_caracterizacao",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-2",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Caracterização Municipal"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Identidade Institucional, Perfil Territorial e Estrutura Produtiva")
      ),
      
      # 1.1 CABEÇALHO DO MUNICÍPIO & AÇÕES DE RELATÓRIO
      tags$div(
        class = "d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3",
        tags$div(
          tags$h1(id = "ficha_nome_municipio", class = "display-5 fw-black text-slate-900 mb-0 text-uppercase tracking-tight", "MUNICÍPIO")
        ),
        tags$div(
          class = "d-flex align-items-center gap-2 d-print-none",
          tags$button(
            class = "btn btn-primary btn-sm fw-bold shadow-xs rounded-pill px-3 py-1.5 transition-all",
            onclick = "window.imprimirResumoExecutivo()",
            tags$i(class = "fas fa-file-contract me-1.5"), "Resumo Executivo"
          ),
          tags$button(
            class = "btn btn-outline-dark btn-sm fw-bold shadow-xs rounded-pill px-3 py-1.5 transition-all",
            onclick = "window.imprimirRelatorioCompleto()",
            tags$i(class = "fas fa-file-pdf me-1.5 text-danger"), "Relatório Completo"
          )
        )
      ),

      # 1.2 OS DOIS PAINÉIS PRINCIPAIS (IDENTIDADE & GESTÃO + TERRITÓRIO & DEMOGRAFIA COM MAPA)
      tags$div(
        class = "row g-4 mb-5",
        
        # PAINEL ESQUERDO: IDENTIDADE INSTITUCIONAL & ESPECIALIZAÇÃO PRODUTIVA
        tags$div(
          class = "col-lg-5",
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 shadow-xs p-4 h-100 d-flex flex-column justify-content-between",
            tags$div(
              tags$div(
                class = "d-flex align-items-center justify-content-between pb-3 mb-3 border-b border-slate-100",
                tags$span(class = "font-black text-xs uppercase tracking-wider text-slate-500",
                  tags$i(class = "fas fa-landmark me-1.5 text-[#ff5a26]"), "Identidade & Gestão Municipal"
                ),
                tags$span(
                  class = "badge bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-pill px-2.5 py-1",
                  tags$i(class = "fas fa-cake-candles me-1 text-[#ff5a26]"),
                  tags$span(id = "ficha_aniversario_subtitle", "Aniversário: -")
                )
              ),

              # Card do Prefeito(a)
              tags$div(
                class = "p-3 rounded-xl bg-orange-50/60 border border-orange-100 mb-3 d-flex align-items-center justify-content-between",
                tags$div(
                  class = "d-flex align-items-center gap-3",
                  tags$div(
                    class = "w-10 h-10 rounded-full bg-orange-100 text-[#c2410c] d-flex align-items-center justify-content-center font-bold text-lg",
                    tags$i(class = "fas fa-user-tie")
                  ),
                  tags$div(
                    tags$div(class = "text-[10px] uppercase font-bold text-slate-400 tracking-wider", "Chefe do Executivo Municipal"),
                    tags$div(id = "ficha_prefeito_subtitle", class = "text-sm font-black text-slate-900", "Prefeito(a): -")
                  )
                )
              ),

              # Especializações Produtivas & Conectividade
              tags$div(
                class = "space-y-2.5",
                tags$div(
                  class = "d-flex align-items-center justify-content-between text-xs py-1.5 border-b border-slate-50",
                  tags$span(class = "text-slate-500 font-bold", tags$i(class = "fas fa-industry text-purple-500 me-1.5"), "Arranjo Produtivo (APL):"),
                  tags$span(id = "ficha_apl_subtitle", class = "font-bold text-slate-800", "Sem APL")
                ),
                tags$div(
                  class = "d-flex align-items-center justify-content-between text-xs py-1.5 border-b border-slate-50",
                  tags$span(class = "text-slate-500 font-bold", tags$i(class = "fas fa-briefcase text-emerald-600 me-1.5"), "Vocações Econômicas:"),
                  tags$span(id = "ficha_vocacoes_subtitle", class = "font-bold text-slate-800 text-end", "-")
                ),
                tags$div(
                  class = "d-flex align-items-center justify-content-between text-xs py-1.5",
                  tags$span(class = "text-slate-500 font-bold", tags$i(class = "fas fa-wifi text-blue-500 me-1.5"), "Conectividade Digital:"),
                  tags$span(
                    id = "badge_fibra_container",
                    class = "badge bg-light text-dark border px-2.5 py-1 rounded-pill transition-colors",
                    tags$i(id = "icon_fibra", class = "fas fa-wifi me-1 text-secondary"),
                    tags$span(id = "ficha_fibra_subtitle", "Fibra: -")
                  )
                )
              )
            ),

            tags$div(
              class = "mt-4 pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "text-xs text-slate-400 font-bold", "Região de Desenvolvimento:"),
              tags$span(id = "ficha_rd_subtitle", class = "text-xs font-black text-slate-800 text-uppercase", "RD")
            )
          )
        ),

        # PAINEL DIREITO: PERFIL SOCIOTERRITORIAL & DEMOGRAFIA + MINI-MAPA INTEGRADO
        tags$div(
          class = "col-lg-7",
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 shadow-xs p-4 h-100",
            tags$div(
              class = "d-flex align-items-center justify-content-between pb-3 mb-3 border-b border-slate-100",
              tags$span(class = "font-black text-xs uppercase tracking-wider text-slate-500",
                tags$i(class = "fas fa-earth-americas me-1.5 text-blue-600"), "Perfil Territorial & Demográfico"
              ),
              tags$span(class = "text-xs font-bold text-slate-400", "Censo 2022 & IBGE 2026")
            ),

            tags$div(
              class = "row g-3 align-items-center",
              tags$div(
                class = "col-md-7",
                
                # População Destaque
                tags$div(
                  class = "mb-3",
                  tags$div(
                    class = "d-flex align-items-baseline gap-2",
                    tags$span(id = "ficha_pop_subtitle", class = "text-2xl font-black text-slate-900", "Pop: -")
                  ),
                  tags$div(class = "text-[11px] text-slate-400 font-medium mt-0.5", "Estimativa IBGE/TCU 2026")
                ),

                # Ocupação Urbana x Rural Mini Bar
                tags$div(
                  class = "p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3",
                  tags$div(
                    class = "d-flex justify-content-between text-[11px] font-bold text-slate-600 mb-1.5",
                    tags$span(tags$i(class = "fas fa-city me-1 text-slate-500"), tags$span(id = "ficha_pop_urb_subtitle", "Pop. Urbana: -")),
                    tags$span(tags$i(class = "fas fa-tree me-1 text-emerald-600"), tags$span(id = "ficha_pop_rur_subtitle", "Pop. Rural: -"))
                  ),
                  tags$div(
                    class = "w-full bg-slate-200 rounded-full h-2 d-flex overflow-hidden",
                    tags$div(id = "ficha_bar_pop_urb", class = "bg-blue-600 h-2 transition-all", style = "width: 50%;"),
                    tags$div(id = "ficha_bar_pop_rur", class = "bg-emerald-500 h-2 transition-all", style = "width: 50%;")
                  )
                ),

                # Povos Tradicionais
                tags$div(
                  class = "grid grid-cols-2 gap-2 text-xs mb-2",
                  tags$div(
                    class = "p-2 rounded-lg bg-orange-50/40 border border-orange-100",
                    tags$div(class = "text-[10px] font-bold text-slate-400 uppercase tracking-tight", tags$i(class = "fas fa-people-group me-1 text-[#ff5a26]"), "Quilombolas"),
                    tags$div(id = "ficha_pop_quilombola_subtitle", class = "font-black text-slate-800 text-xs mt-0.5", "Pop. Quilombola: -")
                  ),
                  tags$div(
                    class = "p-2 rounded-lg bg-amber-50/40 border border-amber-100",
                    tags$div(class = "text-[10px] font-bold text-slate-400 uppercase tracking-tight", tags$i(class = "fas fa-feather-pointed me-1 text-[#ff5a26]"), "Indígenas"),
                    tags$div(id = "ficha_pop_indigena_subtitle", class = "font-black text-slate-800 text-xs mt-0.5", "Pop. Indígena: -")
                  )
                ),

                tags$div(
                  class = "d-flex align-items-center justify-content-between pt-2 border-t border-slate-100 text-xs",
                  tags$span(class = "text-slate-500 font-bold", tags$i(class = "fas fa-ruler-combined text-slate-400 me-1"), "Área Territorial:"),
                  tags$span(id = "ficha_area_subtitle", class = "font-bold text-slate-800", "Área: -")
                )
              ),

              # Mini-Mapa
              tags$div(
                class = "col-md-5",
                tags$div(
                  class = "map-clean-container map-small rounded-xl overflow-hidden border border-slate-200 shadow-2xs",
                  style = "height: 240px; width: 100%;",
                  tags$div(id = "ficha_map_container", style = "width: 100%; height: 100%;")
                )
              )
            )
          )
        )
      ),

      # 1.3 BLOCO ECONÔMICO INTEGRADO (MACROECONOMIA + MATRIZ DO VAB)
      tags$div(
        class = "mb-5",
        tags$div(
          class = "d-flex align-items-center justify-content-between pb-2 mb-3 border-b border-slate-200",
          tags$div(
            tags$h3(class = "text-lg font-black text-slate-800 uppercase tracking-tight mb-0", "Estrutura Econômica & Desenvolvimento"),
            tags$p(class = "text-xs font-bold text-slate-400 mb-0", "Grandezas Macroeconômicas, Renda per Capita e Matriz Setorial do VAB")
          )
        ),

        # 4 CARDS MACROECONÔMICOS
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "PIB TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-money-bill-wave kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pib_1000", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pib_1000", "R$ 1.000")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "PIB PER CAPITA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-tag kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pibpc", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pibpc", "R$")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "PARTICIPAÇÃO PIB ESTADUAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-chart-pie kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pib_pct", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pib_pct", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F39C12;", tags$div(class = "kpi-modern-header", "IDHM"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-graduation-cap kpi-modern-icon", style = "color: #F39C12;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_idhm", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_idhm", "Índice"))
        ),

        # COMPOSIÇÃO SETORIAL DO VAB (100%)
        tags$div(
          class = "bg-white rounded-2xl border border-slate-200 shadow-xs p-4",
          tags$div(
            class = "d-flex align-items-center justify-content-between mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2",
            tags$div(
              tags$span(class = "font-black text-xs uppercase tracking-wider text-slate-700", "Composição do Valor Adicionado Bruto (VAB Setorial)"),
              tags$span(class = "text-[11px] text-slate-400 ms-2 font-medium", "Distribuição relativa e Quocientes Locacionais (QL)")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-600 border text-[11px] font-bold rounded-pill px-2.5 py-0.5", "Soma: 100% do VAB")
          ),

          # Barra segmentada proporcional
          tags$div(
            class = "w-full bg-slate-100 rounded-full h-2.5 d-flex overflow-hidden mb-4 shadow-inner",
            tags$div(id = "vab_bar_agro", class = "h-2.5 transition-all", style = "width: 25%; background-color: #1ABC9C;", title = "Agropecuária"),
            tags$div(id = "vab_bar_ind", class = "h-2.5 transition-all", style = "width: 25%; background-color: #34495E;", title = "Indústria"),
            tags$div(id = "vab_bar_serv", class = "h-2.5 transition-all", style = "width: 25%; background-color: #F1C40F;", title = "Serviços"),
            tags$div(id = "vab_bar_adm", class = "h-2.5 transition-all", style = "width: 25%; background-color: #E74C3C;", title = "Administração Pública")
          ),

          # 4 Cards Setoriais Integrados
          tags$div(
            class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3",
            tags$div(class = "kpi-modern-card", style = "border-left-color: #1ABC9C;", tags$div(class = "kpi-modern-header", "VAB AGROPECUÁRIA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-tractor kpi-modern-icon", style = "color: #1ABC9C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vab_agro", "-")), tags$div(class = "kpi-ql-badge-row", id = "ficha_ql_box_vab_agro"), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vab_agro", "% do VAB")),
            tags$div(class = "kpi-modern-card", style = "border-left-color: #34495E;", tags$div(class = "kpi-modern-header", "VAB INDÚSTRIA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-industry kpi-modern-icon", style = "color: #34495E;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vab_ind", "-")), tags$div(class = "kpi-ql-badge-row", id = "ficha_ql_box_vab_ind"), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vab_ind", "% do VAB")),
            tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "VAB SERVIÇOS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-concierge-bell kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vab_serv", "-")), tags$div(class = "kpi-ql-badge-row", id = "ficha_ql_box_vab_serv"), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vab_serv", "% do VAB")),
            tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "VAB ADM PÚBLICA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-university kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vab_adm", "-")), tags$div(class = "kpi-ql-badge-row", id = "ficha_ql_box_vab_adm"), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vab_adm", "% do VAB"))
          )
        )
      ),
      
      # =================================================
      # SEÇÃO: RESUMO EXECUTIVO MUNICIPAL (5 DIMENSÕES)
      # =================================================
      tags$div(
        id = "sec_resumo_executivo",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-6",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Resumo Executivo Integrado"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Síntese Estratégica Multidimensional: Demografia, Economia, Social, Fiscal e Tecnologia & Inovação")
      ),
      
      tags$div(
        id = "ficha_container_resumo_executivo",
        class = "mb-5"
      ),

      # =================================================
      # SEÇÃO: DIAGNÓSTICO DE DESENVOLVIMENTO REGIONAL
      # =================================================
      tags$div(
        id = "sec_diagnostico_regional",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$div(
          class = "d-flex flex-wrap justify-content-between align-items-center gap-2",
          tags$div(
            tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Diagnóstico de Desenvolvimento Regional"),
            tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Reorientação Estrutural e Diretrizes Técnicas por Eixo de Desenvolvimento (Matriz & Corpus Bibliográfico)")
          ),
          tags$div(
            id = "ficha_diag_badges_header",
            class = "d-flex flex-wrap gap-1.5"
          )
        )
      ),

      tags$div(
        id = "ficha_container_diagnostico_regional",
        class = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"
      ),
      
      # =================================================
      # BLOCO DE SEÇÕES DETALHADAS (Ocultado no Resumo Executivo)
      # =================================================
      tags$div(
        id = "ficha_bloco_secoes_detalhadas",
        class = "ficha-secoes-detalhadas",

        # =================================================
        # SEÇÃO 1.5: DEMOGRAFIA
        # =================================================
        tags$div(
          id = "sec_demografia",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Demografia"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Estrutura Etária e Dependência")
      ),
      
      tags$div(
        class = "subsecao-print-break",
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "RAZÃO DE DEPENDÊNCIA TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-users kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rd_pop", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rd_pop", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2ECC71;", tags$div(class = "kpi-modern-header", "RAZÃO DE DEPENDÊNCIA JOVEM"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-child kpi-modern-icon", style = "color: #2ECC71;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rd_jovem", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rd_jovem", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #9B59B6;", tags$div(class = "kpi-modern-header", "RAZÃO DE DEPENDÊNCIA IDOSA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-clock kpi-modern-icon", style = "color: #9B59B6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rd_idosa", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rd_idosa", "Índice")),
          
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "PESO DA POP. EM IDADE ATIVA (PIA)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-briefcase kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_pia", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_pia", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "ÍNDICE DE ENVELHECIMENTO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-blind kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ind_envelhecimento", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ind_envelhecimento", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #1ABC9C;", tags$div(class = "kpi-modern-header", "TAXA DE SUPERLONGEVIDADE"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-heartbeat kpi-modern-icon", style = "color: #1ABC9C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_longevidade", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_longevidade", "%")),
          
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "ÍNDICE DE RENOVAÇÃO DA PIA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sync kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ind_ir_pia", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ind_ir_pia", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #34495E;", tags$div(class = "kpi-modern-header", "PESO RELATIVO DA JUVENTUDE"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-graduate kpi-modern-icon", style = "color: #34495E;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_jovem", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_jovem", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "RAZÃO DE RENOVAÇÃO DO TRABALHO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-people-arrows kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ind_renov_trabalho", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ind_renov_trabalho", "Índice"))
        ),
        
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Demografia"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_demografia_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "d-flex flex-wrap gap-1",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-2 active", id = "btn_demo_rd_pop", onclick = "window.alternarMetricaDemografia('rd_pop')", "Dep. Total"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_rd_jovem", onclick = "window.alternarMetricaDemografia('rd_jovem')", "Dep. Jovem"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_rd_idosa", onclick = "window.alternarMetricaDemografia('rd_idosa')", "Dep. Idosa"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_pct_pia", onclick = "window.alternarMetricaDemografia('pct_pia')", "PIA %"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_ind_envelhecimento", onclick = "window.alternarMetricaDemografia('ind_envelhecimento')", "Envelhecimento"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_pct_longevidade", onclick = "window.alternarMetricaDemografia('pct_longevidade')", "Longevidade %"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_ind_ir_pia", onclick = "window.alternarMetricaDemografia('ind_ir_pia')", "Renov. PIA"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_pct_jovem", onclick = "window.alternarMetricaDemografia('pct_jovem')", "Juventude %"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_demo_ind_renov_trabalho", onclick = "window.alternarMetricaDemografia('ind_renov_trabalho')", "Renov. Trabalho")
            )
          ),
          tags$div(
            class = "map-clean-container map-small", style = "height: 380px; width: 100%;",
            tags$div(id = "ficha_map_demografia_container", style = "width: 100%; height: 100%;")
          )
        )
      ),
      
      # SEÇÃO 2: INDICADORES SOCIAIS
      tags$div(
        id = "sec_indicadores_sociais",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Indicadores Sociais"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Segurança Pública, Educação e Saúde")
      ),
      
      # 2.1 SEGURANÇA PÚBLICA
      tags$div(
        class = "subsecao-seguranca",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Segurança Pública"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "MVI (ABSOLUTO)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-skull-crossbones kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_mvi_abs", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_mvi_abs", "Casos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "TAXA MVI"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-chart-line kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_mvi_taxa", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_mvi_taxa", "por 100k hab.")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "CVP (ABSOLUTO)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-mask kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_cvp_abs", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_cvp_abs", "Ocorrências")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "TAXA CVP"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-percent kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_cvp_taxa", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_cvp_taxa", "por 100k hab.")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "FEMINICÍDIO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-person-dress kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_feminicidio", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_feminicidio", "Casos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #A569BD;", tags$div(class = "kpi-modern-header", "TENTATIVA DE MVI"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-ninja kpi-modern-icon", style = "color: #A569BD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tent_mvi", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tent_mvi", "Ocorrências")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E91E63;", tags$div(class = "kpi-modern-header", "RFV"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-hand kpi-modern-icon", style = "color: #E91E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rfv", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rfv", "Ocorrências")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F06292;", tags$div(class = "kpi-modern-header", "VCM (AMEAÇA)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-triangle-exclamation kpi-modern-icon", style = "color: #F06292;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vcm_ameaca", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vcm_ameaca", "Ocorrências")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C2185B;", tags$div(class = "kpi-modern-header", "VCM (LESÃO CORPORAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-injured kpi-modern-icon", style = "color: #C2185B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vcm_lesao", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vcm_lesao", "Ocorrências")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #880E4F;", tags$div(class = "kpi-modern-header", "VCM (VIOLÊNCIA SEXUAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-shield-cat kpi-modern-icon", style = "color: #880E4F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vcm_vs", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vcm_vs", "Ocorrências"))
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Segurança Pública"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_sociais_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "btn-group btn-group-sm rounded-lg overflow-hidden border border-slate-200 flex-wrap",
              role = "group",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-2 active", id = "btn_soc_mvi_abs", onclick = "window.alternarMetricaSociais('mvi_abs')", "MVI"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_mvi_taxa", onclick = "window.alternarMetricaSociais('mvi_taxa')", "Taxa MVI"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_cvp_abs", onclick = "window.alternarMetricaSociais('cvp_abs')", "CVP"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_cvp_taxa", onclick = "window.alternarMetricaSociais('cvp_taxa')", "Taxa CVP"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_feminicidio", onclick = "window.alternarMetricaSociais('feminicidio')", "Feminicídio"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_tent_mvi", onclick = "window.alternarMetricaSociais('tent_mvi')", "Tent. MVI"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_rfv", onclick = "window.alternarMetricaSociais('rfv')", "RFV"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_vcm_ameaca", onclick = "window.alternarMetricaSociais('vcm_ameaca')", "VCM Ameaça"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_vcm_lesao", onclick = "window.alternarMetricaSociais('vcm_lesao')", "VCM Lesão"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_soc_vcm_vs", onclick = "window.alternarMetricaSociais('vcm_vs')", "VCM V. Sexual")
            )
          ),
          tags$div(
            class = "map-clean-container map-small",
            style = "height: 380px; width: 100%;",
            tags$div(id = "ficha_map_sociais_container", style = "width: 100%; height: 100%;")
          )
        )
      ),
      
      # 2.2 EDUCAÇÃO
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-8", "Educação"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "IDEB ANOS INICIAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-school kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ideb_5ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ideb_5ano", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2ECC71;", tags$div(class = "kpi-modern-header", "TDI ANOS INICIAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-chart-line kpi-modern-icon", style = "color: #2ECC71;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tdi_5ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tdi_5ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "ABANDONO ANOS INICIAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-times kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_aba_5ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_aba_5ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "APROVAÇÃO ANOS INICIAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-check kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_apr_5ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_apr_5ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "REPROVAÇÃO ANOS INICIAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-minus kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rep_5ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rep_5ano", "%")),
          
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "IDEB ANOS FINAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-graduate kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ideb_9ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ideb_9ano", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "TDI ANOS FINAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-chart-line kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tdi_9ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tdi_9ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "ABANDONO ANOS FINAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-times kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_aba_9ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_aba_9ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "APROVAÇÃO ANOS FINAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-check kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_apr_9ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_apr_9ano", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "REPROVAÇÃO ANOS FINAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-minus kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_rep_9ano", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_rep_9ano", "%")),
          
          tags$div(class = "kpi-modern-card", style = "border-left-color: #9B59B6;", tags$div(class = "kpi-modern-header", "MATRÍCULAS 6 A 10"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-users kpi-modern-icon", style = "color: #9B59B6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_mat_6_10", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_mat_6_10", "Alunos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "MATRÍCULAS 11 A 14"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-users kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_mat_11_14", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_mat_11_14", "Alunos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #1ABC9C;", tags$div(class = "kpi-modern-header", "MATRÍCULAS INTEGRAIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-clock kpi-modern-icon", style = "color: #1ABC9C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_perc_mat_int", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_perc_mat_int", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "ALFABETIZAÇÃO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-spell-check kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_perc_alfabetizacao", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_perc_alfabetizacao", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #16A085;", tags$div(class = "kpi-modern-header", "ATEND. CRECHE (LÍQ)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-baby kpi-modern-icon", style = "color: #16A085;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_atliq_creche", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_atliq_creche", "%"))
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Educação"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_educacao_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "d-flex flex-wrap gap-1",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-2 active", id = "btn_edu_ideb_5ano", onclick = "window.alternarMetricaEducacao('ideb_5ano')", "IDEB 5º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_tdi_5ano", onclick = "window.alternarMetricaEducacao('tdi_5ano')", "TDI 5º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_aba_5ano", onclick = "window.alternarMetricaEducacao('aba_5ano')", "Abandono 5º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_apr_5ano", onclick = "window.alternarMetricaEducacao('apr_5ano')", "Aprovação 5º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_rep_5ano", onclick = "window.alternarMetricaEducacao('rep_5ano')", "Reprov. 5º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_ideb_9ano", onclick = "window.alternarMetricaEducacao('ideb_9ano')", "IDEB 9º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_tdi_9ano", onclick = "window.alternarMetricaEducacao('tdi_9ano')", "TDI 9º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_aba_9ano", onclick = "window.alternarMetricaEducacao('aba_9ano')", "Abandono 9º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_apr_9ano", onclick = "window.alternarMetricaEducacao('apr_9ano')", "Aprovação 9º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_rep_9ano", onclick = "window.alternarMetricaEducacao('rep_9ano')", "Reprov. 9º"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_mat_6_10", onclick = "window.alternarMetricaEducacao('mat_6_10')", "Matr. 6-10"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_mat_11_14", onclick = "window.alternarMetricaEducacao('mat_11_14')", "Matr. 11-14"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_perc_mat_int", onclick = "window.alternarMetricaEducacao('perc_mat_int')", "Integrais %"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_perc_alfabetizacao", onclick = "window.alternarMetricaEducacao('perc_alfabetizacao')", "Alfabetização"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_edu_atliq_creche", onclick = "window.alternarMetricaEducacao('atliq_creche')", "Creche (Líq)")
            )
          ),
          tags$div(class = "map-clean-container map-small", style = "height: 450px; width: 100%;", tags$div(id = "ficha_map_educacao_container", style = "width: 100%; height: 100%;"))
        )
      ),
      
      # 2.3 SAÚDE
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-8", "Saúde"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #1ABC9C;", tags$div(class = "kpi-modern-header", "PRÉ-NATAL (COBERTURA)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-baby kpi-modern-icon", style = "color: #1ABC9C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pre_natal", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pre_natal", "%")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "MORTALIDADE MATERNA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-female kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_razao_mm", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_razao_mm", "por 100k nasc. vivos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "TAXA ATT"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-stethoscope kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_att", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_att", "Taxa")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #9B59B6;", tags$div(class = "kpi-modern-header", "MORTALIDADE DCNT"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-heartbeat kpi-modern-icon", style = "color: #9B59B6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_dcnt", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_dcnt", "Taxa")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "CAUSAS EVITÁVEIS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-user-shield kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_evitaveis", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_evitaveis", "Taxa")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "MORTALIDADE INFÂNCIA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-child kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_infancia", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_infancia", "por 1k nasc. vivos")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "MORTALIDADE INFANTIL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-baby-carriage kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_infantil", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_infantil", "por 1k nasc. vivos"))
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Saúde"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_saude_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "btn-group btn-group-sm rounded-lg overflow-hidden border border-slate-200 flex-wrap",
              role = "group",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-2 active", id = "btn_sau_pre_natal", onclick = "window.alternarMetricaSaude('pre_natal')", "Pré-Natal"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_razao_mm", onclick = "window.alternarMetricaSaude('razao_mm')", "Mort. Materna"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_tx_att", onclick = "window.alternarMetricaSaude('tx_att')", "ATT"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_tx_dcnt", onclick = "window.alternarMetricaSaude('tx_dcnt')", "DCNT"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_tx_evitaveis", onclick = "window.alternarMetricaSaude('tx_evitaveis')", "Evitáveis"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_tx_infancia", onclick = "window.alternarMetricaSaude('tx_infancia')", "Mort. Infância"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_sau_tx_infantil", onclick = "window.alternarMetricaSaude('tx_infantil')", "Mort. Infantil")
            )
          ),
          tags$div(
            class = "map-clean-container map-small",
            style = "height: 380px; width: 100%;",
            tags$div(id = "ficha_map_saude_container", style = "width: 100%; height: 100%;")
          )
        )
      ),
      
      # SEÇÃO 2.5: VULNERABILIDADE SOCIAL
      tags$div(
        id = "sec_vulnerabilidade_social",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Vulnerabilidade Social"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-2", "Índice de Vulnerabilidade das Famílias do Cadastro Único (IVCAD)"),
        tags$p(
          class = "text-xs text-slate-600 mb-0",
          "O Índice de Vulnerabilidade das Famílias do Cadastro Único (IVCAD) possibilita identificar situações de vulnerabilidade social por meio das informações presentes no Cadastro Único. ",
          tags$a(
            href = "https://www.gov.br/mds/pt-br/orgaos/SAGICAD/dados-e-ferramentas-informacionais/ivcad",
            target = "_blank",
            rel = "noopener noreferrer",
            class = "text-primary font-bold hover:underline ms-1",
            "Saiba mais"
          )
        )
      ),
      
      # 2.5.1 IVCAD
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-6", "IVCAD e Transferências de Renda"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "PESSOAS NO CAD ÚNICO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-users kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_cad_pessoas", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_cad_pessoas", "Pessoas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "TX. PESSOAS NO CAD ÚNICO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-percent kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_tx_cad_pessoas", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_tx_cad_pessoas", "% da População")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #ff5a26;", tags$div(class = "kpi-modern-header", "ÍNDICE DE GINI"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-scale-unbalanced kpi-modern-icon", style = "color: #ff5a26;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_indice_gini", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_indice_gini", "Índice (Desigualdade)")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #9B59B6;", tags$div(class = "kpi-modern-header", "ÍNDICE DE VULNERABILIDADE"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-chart-bar kpi-modern-icon", style = "color: #9B59B6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3498DB;", tags$div(class = "kpi-modern-header", "NECESSIDADE DE CUIDADOS (NC)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-medical kpi-modern-icon", style = "color: #3498DB;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_nc", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_nc", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "DESENV. PRIMEIRA INFÂNCIA (DPI)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-child kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_dpi", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_dpi", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #2ECC71;", tags$div(class = "kpi-modern-header", "DESENV. CRIANÇAS E ADOL. (DCA)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-child-reaching kpi-modern-icon", style = "color: #2ECC71;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_dca", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_dca", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E74C3C;", tags$div(class = "kpi-modern-header", "TRABALHO E QUALIFICAÇÃO (TQA)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-briefcase kpi-modern-icon", style = "color: #E74C3C;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_tqa", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_tqa", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #16A085;", tags$div(class = "kpi-modern-header", "DISPONIBILIDADE DE RECURSOS (DR)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-wallet kpi-modern-icon", style = "color: #16A085;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_dr", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_dr", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #34495E;", tags$div(class = "kpi-modern-header", "CONDIÇÕES HABITACIONAIS (CH)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-home kpi-modern-icon", style = "color: #34495E;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ivcad_ch", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_ivcad_ch", "Índice")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #E91E63;", tags$div(class = "kpi-modern-header", "MÃES DE PERNAMBUCO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-female kpi-modern-icon", style = "color: #E91E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_qtd", "Mulheres Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "MÃES DE PERNAMBUCO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_val", "Investimento")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hat-cowboy kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_qtd", "Pessoas Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_val", "Investimento")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F59E0B;", tags$div(class = "kpi-modern-header", "COZINHAS COMUNITÁRIAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-utensils kpi-modern-icon", style = "color: #F59E0B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vuln_cozinhas", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vuln_cozinhas", "Unidades")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3B82F6;", tags$div(class = "kpi-modern-header", "COFINANCIAMENTO SOCIAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-dollar kpi-modern-icon", style = "color: #3B82F6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vuln_cofin", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vuln_cofin", "Investimento Estadual"))
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - IVCAD e Transf. de Renda"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_cad_unico_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "d-flex flex-wrap gap-1",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-2 active", id = "btn_cad_cad_pessoas", onclick = "window.alternarMetricaCadUnico('cad_pessoas')", "Pessoas"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_tx_cad_pessoas", onclick = "window.alternarMetricaCadUnico('tx_cad_pessoas')", "Tx. Pessoas"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_indice_gini", onclick = "window.alternarMetricaCadUnico('indice_gini')", "Gini"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad", onclick = "window.alternarMetricaCadUnico('ivcad')", "IVCAD"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_nc", onclick = "window.alternarMetricaCadUnico('ivcad_nc')", "NC"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_dpi", onclick = "window.alternarMetricaCadUnico('ivcad_dpi')", "DPI"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_dca", onclick = "window.alternarMetricaCadUnico('ivcad_dca')", "DCA"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_tqa", onclick = "window.alternarMetricaCadUnico('ivcad_tqa')", "TQA"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_dr", onclick = "window.alternarMetricaCadUnico('ivcad_dr')", "DR"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_ivcad_ch", onclick = "window.alternarMetricaCadUnico('ivcad_ch')", "CH"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_maes_qtd", onclick = "window.alternarMetricaCadUnico('maes_qtd')", "Mães (Qtd)"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_maes_val", onclick = "window.alternarMetricaCadUnico('maes_val')", "Mães (R$)"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_pcp_qtd", onclick = "window.alternarMetricaCadUnico('pcp_qtd')", "PCP (Qtd)"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-2", id = "btn_cad_pcp_val", onclick = "window.alternarMetricaCadUnico('pcp_val')", "PCP (R$)")
            )
          ),
          tags$div(
            class = "map-clean-container map-small",
            style = "height: 380px; width: 100%; position: relative;",
            tags$div(id = "ficha_map_cad_unico_container", style = "width: 100%; height: 380px; min-height: 380px;")
          )
        )
      ),
      
      # 2.5.2 CONDIÇÕES HABITACIONAIS
      tags$div(
        class = "subsecao-print-break",
        tags$div(
          class = "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-6",
          tags$div(
            tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-0 text-base", "Condições Habitacionais e Saneamento"),
            tags$p(class = "text-xs font-semibold text-slate-400 mb-0", "Indicadores baseados nas dimensões do Cadastro Único (IVCAD). Em breve complementados com dados municipais censitários gerais.")
          ),
          tags$span(class = "badge bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold rounded-pill px-2.5 py-1", "Dimensões IVCAD / Compesa")
        ),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #00BCD4;", tags$div(class = "kpi-modern-header", "ÁGUA (REDE GERAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-faucet kpi-modern-icon", style = "color: #00BCD4;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_agua_rede", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_agua_rede", "% de Domicílios")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8D6E63;", tags$div(class = "kpi-modern-header", "ESGOTO (REDE GERAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-toilet kpi-modern-icon", style = "color: #8D6E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_esgoto_rede", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_esgoto_rede", "% de Domicílios")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #0284C7;", tags$div(class = "kpi-modern-header", "INVESTIMENTO EM ÁGUA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-droplet kpi-modern-icon", style = "color: #0284C7;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_hab_aguas_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_hab_aguas_val", "Investimento Compesa")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #0EA5E9;", tags$div(class = "kpi-modern-header", "OBRAS DE ÁGUA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-faucet-drip kpi-modern-icon", style = "color: #0EA5E9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_hab_aguas_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_hab_aguas_qtd", "Intervenções Hídricas"))
        ),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Condições Habitacionais"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_saneamento_rd_titulo", "Municípios da RD")
            ),
            tags$div(
              class = "btn-group btn-group-sm rounded-lg overflow-hidden border border-slate-200",
              role = "group",
              tags$button(type = "button", class = "btn btn-primary font-bold text-xs px-3 active", id = "btn_san_pct_agua_rede", onclick = "window.alternarMetricaSaneamento('pct_agua_rede')", "Água (Rede Geral)"),
              tags$button(type = "button", class = "btn btn-outline-primary font-bold text-xs px-3", id = "btn_san_pct_esgoto_rede", onclick = "window.alternarMetricaSaneamento('pct_esgoto_rede')", "Esgoto (Rede Geral)")
            )
          ),
          tags$div(
            class = "map-clean-container map-small",
            style = "height: 380px; width: 100%; position: relative;",
            tags$div(id = "ficha_map_saneamento_container", style = "width: 100%; height: 380px; min-height: 380px;")
          )
        )
      ),
      
      # SEÇÃO 2.7: INDICADORES ECONÔMICOS
      tags$div(
        id = "sec_indicadores_economicos",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8 d-flex justify-content-between align-items-center flex-wrap gap-2",
        tags$div(
          tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Indicadores Econômicos"),
          tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Vocações, Mercado de Trabalho, Inovação e Comércio Exterior • Fonte: RAIS / Ministério do Trabalho e Emprego")
        ),
        tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-pill px-3 py-1",
          tags$i(class = "fas fa-database me-1 text-slate-500"), "Fonte: RAIS / MTE"
        )
      ),
      
      # SUBSEÇÃO 1: VOCAÇÕES
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-4", "Vocações Econômicas Locais"),
        tags$div(id = "ficha_container_vocacoes", class = "grid grid-cols-1 md:grid-cols-3 gap-4 mb-5")
      ),
      
      # SUBSEÇÃO 2: TRABALHO E EMPREGO
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-6", "Mercado de Trabalho e Estrutura Ocupacional"),
        tags$div(id = "ficha_container_kpis_trabalho", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Mercado de Trabalho"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_trabalho_rd_titulo", "Municípios da RD")
            ),
            tags$div(id = "ficha_btns_metrica_trabalho", class = "d-flex flex-wrap gap-1")
          ),
          tags$div(class = "map-clean-container map-small", style = "height: 380px; width: 100%;", tags$div(id = "ficha_map_trabalho_container", style = "width: 100%; height: 100%;"))
        )
      ),
      
      # SUBSEÇÃO: CONECTIVIDADE
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-8", "Conectividade"),
        tags$div(id = "ficha_container_kpis_conectividade", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Conectividade"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_conectividade_rd_titulo", "Municípios da RD")
            ),
            tags$div(id = "ficha_btns_metrica_conectividade", class = "d-flex flex-wrap gap-1")
          ),
          tags$div(class = "map-clean-container map-small", style = "height: 380px; width: 100%;", tags$div(id = "ficha_map_conectividade_container", style = "width: 100%; height: 100%;"))
        )
      ),
      
      # SUBSEÇÃO: INOVAÇÃO
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-4", "Trabalho, Tecnologia e Inovação"),
        # Bloco Destacado: Participação de InfoCom em relação a Serviços
        tags$div(
          class = "bg-slate-50/80 rounded-2xl border border-cyan-100 p-4 mb-4",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2",
            tags$div(
              tags$h6(class = "font-black text-slate-800 uppercase tracking-tight mb-0.5 text-sm", 
                      tags$i(class = "fas fa-network-wired text-cyan-600 me-1.5"),
                      "Participação das Atividades de Informação e Comunicação (InfoCom) em relação a Serviços"),
              tags$p(class = "text-xs font-semibold text-slate-500 mb-0", "Peso relativo do segmento de TI e Comunicação dentro do setor terciário municipal e vantagem comparativa estadual")
            )
          ),
          tags$div(
            id = "ficha_container_kpis_infocom_serv",
            class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          )
        ),

        # Container Dinâmico de Demais KPIs de Inovação
        tags$div(
          id = "ficha_container_kpis_inovacao",
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"
        ),
        
        # Comparativo Regional (Mapa)
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Inovação"),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_inovacao_rd_titulo", "Municípios da RD")
            ),
            tags$div(id = "ficha_btns_metrica_inovacao", class = "d-flex flex-wrap gap-1")
          ),
          tags$div(
            class = "map-clean-container map-small", style = "height: 380px; width: 100%; position: relative;",
            tags$div(id = "ficha_map_inovacao_container", style = "width: 100%; height: 380px; min-height: 380px;")
          )
        )
      ),
      
      # SUBSEÇÃO: COMÉRCIO EXTERIOR
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-8", "Comércio Exterior e Tecnologia"),
        tags$div(id = "ficha_container_kpis_comercio", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 border-b border-slate-100 pb-3",
            tags$div(
              tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-1 text-base", "Comparativo Regional - Comércio Exterior e Tec."),
              tags$p(class = "text-xs font-bold text-slate-500 mb-0", id = "ficha_comercio_rd_titulo", "Municípios da RD")
            ),
            tags$div(id = "ficha_btns_metrica_comercio", class = "d-flex flex-wrap gap-1")
          ),
          tags$div(class = "map-clean-container map-small", style = "height: 380px; width: 100%;", tags$div(id = "ficha_map_comercio_container", style = "width: 100%; height: 100%;"))
        )
      ),
      
      # SEÇÃO 3: FISCAL
      tags$div(
        id = "sec_fiscal",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$div(
          class = "d-flex align-items-center gap-2 mb-1",
          tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Fiscal"),
          tags$span(id = "ficha_badge_capag", class = "badge text-white px-3 py-2 text-uppercase rounded-pill fw-bold ms-2", style = "background-color: #595959; font-size: 0.75rem; letter-spacing: 0.05em;", "CAPAG: -")
        ),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Execução Orçamentária e Indicadores Fiscais")
      ),
      
      # SUBSEÇÃO DE RECEITAS
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Receitas"),
      tags$div(id = "ficha_container_fiscal_receitas", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
      
      # SUBSEÇÕES DE DESPESAS (TIPO E TEMA)
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Despesas por Tipo"),
      tags$div(id = "ficha_container_fiscal_despesas_tipo", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
      
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Despesas por Tema / Função"),
      tags$div(id = "ficha_container_fiscal_despesas_tema", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
      
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Resultados"),
      tags$div(id = "ficha_container_fiscal_resultados", class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5"),
      
      # SEÇÃO 4: INICIATIVAS REGIONAIS E CONVÊNIOS
      tags$div(
        id = "sec_iniciativas_regionais",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Iniciativas de Desenvolvimento Regional"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Programas, Ações Estaduais e Convênios de Despesa")
      ),
      
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Ações e Programas Governamentais no Território"),
      tags$div(
        class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
        tags$div(class = "kpi-modern-card", style = "border-left-color: #34495E;", tags$div(class = "kpi-modern-header", "TOTAL INICIATIVAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-lightbulb kpi-modern-icon", style = "color: #34495E;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_total", "0")), tags$div(class = "kpi-modern-footer", "Projetos e Ações")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "EM EXECUÇÃO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-tools kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_execucao", "0")), tags$div(class = "kpi-modern-footer text-truncate", id="ficha_kpi_ini_top_status", "Outros status...")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "VALOR TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_val_tot", "R$ 0")), tags$div(class = "kpi-modern-footer", "Investimento Estratégico")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #0284C7;", tags$div(class = "kpi-modern-header", "INVESTIMENTO EM ÁGUA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-droplet kpi-modern-icon", style = "color: #0284C7;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_aguas_val", "-")), tags$div(class = "kpi-modern-footer", "Obras Compesa / SRHS")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #0EA5E9;", tags$div(class = "kpi-modern-header", "OBRAS DE ÁGUA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-faucet-drip kpi-modern-icon", style = "color: #0EA5E9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_aguas_qtd", "-")), tags$div(class = "kpi-modern-footer", "Projetos Hídricos")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #3B82F6;", tags$div(class = "kpi-modern-header", "COFINANCIAMENTO SOCIAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-dollar kpi-modern-icon", style = "color: #3B82F6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_cofin_val", "-")), tags$div(class = "kpi-modern-footer", "Assistência Social")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #4F46E5;", tags$div(class = "kpi-modern-header", "RODOVIAS & EIXOS VIÁRIOS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-road kpi-modern-icon", style = "color: #4F46E5;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_estradas_qtd", "-")), tags$div(class = "kpi-modern-footer", "Estradas de PE / DER")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #F59E0B;", tags$div(class = "kpi-modern-header", "COZINHAS COMUNITÁRIAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-utensils kpi-modern-icon", style = "color: #F59E0B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_cozinhas", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_ini_cozinhas_sub", "Segurança Alimentar"))
      ),
      
      tags$div(
        class = "row g-4 mb-5",
        tags$div(class = "col-md-6", tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-100", tags$h6(class = "font-extrabold text-slate-600 uppercase text-xs tracking-wider mb-2", "Volume de Projetos por Secretaria (Top 5)"), tags$div(id = "ficha_chart_iniciativas_sec", style = "width: 100%; height: 250px;"))),
        tags$div(class = "col-md-6", tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-100 overflow-hidden", tags$h6(class = "font-extrabold text-slate-600 uppercase text-xs tracking-wider mb-2", "Volume de Recursos por Secretaria (Top 5)"), tags$div(id = "ficha_chart_valor_sec", style = "width: 100%; height: 250px;")))
      ),
      
            
      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-8", "Convênios de Despesa"),
      tags$div(
        class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",
        tags$div(class = "kpi-modern-card", style = "border-left-color: #0066FF;", tags$div(class = "kpi-modern-header", "TOTAL CONVÊNIOS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-file-contract kpi-modern-icon", style = "color: #0066FF;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_conv_total", "0")), tags$div(class = "kpi-modern-footer", "Termos Celebrados")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "EM EXECUÇÃO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-tools kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_conv_execucao", "0")), tags$div(class = "kpi-modern-footer text-truncate", id="ficha_kpi_conv_top_status", "Outros status...")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "VALOR TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_conv_val_tot", "R$ 0")), tags$div(class = "kpi-modern-footer", "Montante Conveniado")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "TOTAL PAGO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_conv_val_pag", "R$ 0")), tags$div(class = "kpi-modern-footer", "Recurso Repassado"))
      ),
      
            
      # SEÇÃO 5: EMENDAS PARLAMENTARES
      tags$div(
        id = "sec_emendas_parlamentares",
        class = "border-t-2 border-slate-100 pt-4 pb-2 mb-4 mt-8",
        tags$h4(class = "font-black text-slate-700 uppercase tracking-tight mb-1 text-lg", "Emendas Parlamentares"),
        tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Alocações e Recursos Indicados por Parlamentares")
      ),
      
      tags$div(
        class = "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
        tags$div(class = "kpi-modern-card", style = "border-left-color: #E67E22;", tags$div(class = "kpi-modern-header", "TOTAL DE EMENDAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-file-invoice-dollar kpi-modern-icon", style = "color: #E67E22;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_total", "0")), tags$div(class = "kpi-modern-footer", "Indicações Registradas")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #16A085;", tags$div(class = "kpi-modern-header", "VALOR TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-coins kpi-modern-icon", style = "color: #16A085;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_val_tot", "R$ 0")), tags$div(class = "kpi-modern-footer", "Investimento Alocado")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "VALOR PAGO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-check-circle kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_val_pag", "R$ 0")), tags$div(class = "kpi-modern-footer", "Recurso Desembolsado"))
      ),
      
      tags$div(
        class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5",
        tags$h6(class = "font-black text-slate-700 uppercase tracking-tight text-xs mb-3", "Detalhamento por Tipo de Despesa"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #0066FF;", tags$div(class = "kpi-modern-header", "APLICAÇÃO DIRETA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #0066FF;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_td_aplicacao_qtd", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_eme_td_aplicacao_sub", "R$ 0 (0%)")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "ENTIDADE (3º SETOR)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-building kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_td_entidade_qtd", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_eme_td_entidade_sub", "R$ 0 (0%)")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "MUNICÍPIO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-city kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_td_municipio_qtd", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_eme_td_municipio_sub", "R$ 0 (0%)")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F39C12;", tags$div(class = "kpi-modern-header", "UNIÃO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-landmark kpi-modern-icon", style = "color: #F39C12;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_eme_td_uniao_qtd", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_eme_td_uniao_sub", "R$ 0 (0%)"))
        )
      ),
      
      tags$div(
        class = "row g-3 mb-5",
        tags$div(class = "col-md-4", tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-100", tags$h6(class = "font-extrabold text-slate-600 uppercase text-xs tracking-wider mb-2", "Principais Parlamentares"), tags$div(id = "ficha_chart_eme_parlamentares", style = "width: 100%; height: 250px;"))),
        tags$div(class = "col-md-4", tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-100", tags$h6(class = "font-extrabold text-slate-600 uppercase text-xs tracking-wider mb-2", "Principais Partidos"), tags$div(id = "ficha_chart_eme_partidos", style = "width: 100%; height: 250px;"))),
        tags$div(class = "col-md-4", tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-100", tags$h6(class = "font-extrabold text-slate-600 uppercase text-xs tracking-wider mb-2", "Recursos por Tema"), tags$div(id = "ficha_chart_eme_temas", style = "width: 100%; height: 250px;")))
      ),
      

      ), # Fim de ficha_bloco_secoes_detalhadas
      ), # Fim de subaba_ficha_municipal
      
      # =========================================================================
      # SUB-ABA 2: COMPARATIVO MUNICIPAL (2 A 3 MUNICÍPIOS)
      # =========================================================================
      tags$div(
        id = "subaba_comparacao_municipal",
        class = "d-none",
        
        # 1. CABEÇALHO E CONTROLES DE SELEÇÃO DOS MUNICÍPIOS
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 mb-4",
          tags$div(
            class = "d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-orange-100 text-orange-950 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block",
                tags$i(class = "fas fa-code-compare me-1 text-[#ff5a26]"), "Benchmarking Municipal"
              ),
              tags$h3(class = "text-xl font-black text-slate-800 tracking-tight mb-0", "Comparativo Multidimensional de Municípios"),
              tags$p(class = "text-xs font-medium text-slate-500 mb-0", "Compare 2 ou 3 municípios de Pernambuco lado a lado pelas 5 dimensões estratégicas do Aurora.")
            ),
            tags$div(
              class = "d-flex align-items-center gap-2",
              tags$button(
                type = "button",
                class = "btn btn-sm btn-outline-secondary rounded-pill px-3 font-bold text-xs shadow-2xs",
                onclick = "window.trocarOrdemMunicipiosComparacao()",
                tags$i(class = "fas fa-arrow-right-arrow-left me-1"), "Inverter 1 & 2"
              ),
              tags$button(
                type = "button",
                class = "btn btn-sm btn-primary rounded-pill px-3.5 font-bold text-xs shadow-xs text-white",
                onclick = "window.atualizarComparacaoMunicipal()",
                tags$i(class = "fas fa-rotate me-1"), "Atualizar Comparação"
              )
            )
          ),
          
          # 3 CARDS SELETORES DE MUNICÍPIO
          tags$div(
            class = "row g-3",
            
            # Município 1 (Base - Azul #2563EB)
            tags$div(
              class = "col-md-4",
              tags$div(
                class = "p-3 rounded-2xl border-2 border-[#ff5a26] bg-orange-50/40 h-100 transition-all",
                tags$div(
                  class = "d-flex align-items-center justify-content-between mb-2",
                  tags$span(class = "badge bg-[#ff5a26] text-white rounded-pill px-2.5 py-1 text-xs font-bold", "Município 1 (Base)"),
                  tags$span(id = "comp_badge_rd_mun1", class = "badge bg-orange-100 text-orange-900 text-[11px] font-semibold", "-")
                ),
                tags$select(
                  id = "comp_select_mun1",
                  class = "form-select form-select-sm fw-bold border-orange-200 text-orange-950 rounded-xl",
                  onchange = "window.aoMudarMunicipioComparacao(1)"
                ),
                tags$div(
                  id = "comp_meta_mun1",
                  class = "mt-2.5 pt-2 border-t border-orange-200/60 d-flex justify-content-between text-xs text-orange-950",
                  tags$span("População:", tags$strong(id = "comp_pop_mun1", class = "ms-1", "-")),
                  tags$span("PIB pc:", tags$strong(id = "comp_pibpc_mun1", class = "ms-1", "-"))
                )
              )
            ),
            
            # Município 2 (Comparativo - Verde #10B981)
            tags$div(
              class = "col-md-4",
              tags$div(
                class = "p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 h-100 transition-all",
                tags$div(
                  class = "d-flex align-items-center justify-content-between mb-2",
                  tags$span(class = "badge bg-emerald-600 text-white rounded-pill px-2.5 py-1 text-xs font-bold", "Município 2"),
                  tags$span(id = "comp_badge_rd_mun2", class = "badge bg-emerald-100 text-emerald-800 text-[11px] font-semibold", "-")
                ),
                tags$select(
                  id = "comp_select_mun2",
                  class = "form-select form-select-sm fw-bold border-emerald-200 text-emerald-900 rounded-xl",
                  onchange = "window.aoMudarMunicipioComparacao(2)"
                ),
                tags$div(
                  id = "comp_meta_mun2",
                  class = "mt-2.5 pt-2 border-t border-emerald-200/60 d-flex justify-content-between text-xs text-emerald-950",
                  tags$span("População:", tags$strong(id = "comp_pop_mun2", class = "ms-1", "-")),
                  tags$span("PIB pc:", tags$strong(id = "comp_pibpc_mun2", class = "ms-1", "-"))
                )
              )
            ),
            
            # Município 3 (Opcional - Roxo #8B5CF6)
            tags$div(
              class = "col-md-4",
              tags$div(
                class = "p-3 rounded-2xl border-2 border-purple-400 bg-purple-50/40 h-100 transition-all",
                tags$div(
                  class = "d-flex align-items-center justify-content-between mb-2",
                  tags$span(class = "badge bg-purple-600 text-white rounded-pill px-2.5 py-1 text-xs font-bold", "Município 3 (Opcional)"),
                  tags$span(id = "comp_badge_rd_mun3", class = "badge bg-purple-100 text-purple-800 text-[11px] font-semibold", "-")
                ),
                tags$select(
                  id = "comp_select_mun3",
                  class = "form-select form-select-sm fw-bold border-purple-200 text-purple-900 rounded-xl",
                  onchange = "window.aoMudarMunicipioComparacao(3)"
                ),
                tags$div(
                  id = "comp_meta_mun3",
                  class = "mt-2.5 pt-2 border-t border-purple-200/60 d-flex justify-content-between text-xs text-purple-950",
                  tags$span("População:", tags$strong(id = "comp_pop_mun3", class = "ms-1", "-")),
                  tags$span("PIB pc:", tags$strong(id = "comp_pibpc_mun3", class = "ms-1", "-"))
                )
              )
            )
          )
        ),
        
        # 2. SÍNTESE EXECUTIVA MULTIDIMENSIONAL COMPARATIVA
        tags$div(id = "comp_container_resumo_executivo", class = "mb-4"),
        
        # 3. GRÁFICOS COMPLEXOS (RADIAL / RADAR E PIRULITO / LOLLIPOP)
        tags$div(
          class = "row g-4 mb-4",
          
          # GRÁFICO RADIAL / RADAR DAS 5 DIMENSÕES
          tags$div(
            class = "col-lg-6",
            tags$div(
              class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-100",
              tags$div(
                class = "d-flex align-items-center justify-content-between mb-2",
                tags$div(
                  tags$h5(class = "font-black text-slate-800 text-sm uppercase tracking-tight mb-0",
                    tags$i(class = "fas fa-hexagon-nodes text-blue-600 me-2"), "Perfil Radial Multidimensional (5 Dimensões)"
                  ),
                  tags$span(class = "text-[11px] text-slate-500 font-medium", "Escala Normalizada 0-100 (Benchmarking Estadual)")
                ),
                tags$span(class = "badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-pill px-2.5 py-1", "Radar")
              ),
              tags$p(class = "text-xs text-slate-500 mb-3", "Compara os polígonos de capacidade em Demografia, Economia, Social, Fiscal e Inovação."),
              tags$div(id = "comp_chart_radar_dimensoes", style = "width: 100%; height: 380px;")
            )
          ),
          
          # GRÁFICO DE PIRULITO (LOLLIPOP) - INDICADORES ESTRATÉGICOS
          tags$div(
            class = "col-lg-6",
            tags$div(
              class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-100",
              tags$div(
                class = "d-flex align-items-center justify-content-between mb-2",
                tags$div(
                  tags$h5(class = "font-black text-slate-800 text-sm uppercase tracking-tight mb-0",
                    tags$i(class = "fas fa-chart-column text-emerald-600 me-2"), "Gráfico de Pirulito (Lollipop): Confronto Direto"
                  ),
                  tags$span(class = "text-[11px] text-slate-500 font-medium", "Valores relativos e absolutos por indicador")
                ),
                tags$span(class = "badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-pill px-2.5 py-1", "Lollipop")
              ),
              tags$p(class = "text-xs text-slate-500 mb-3", "Visualização da distância exata entre os municípios nas principais métricas do Estado."),
              tags$div(id = "comp_chart_lollipop_principais", style = "width: 100%; height: 380px;")
            )
          )
        ),
        
        # 4. DIMENSÕES ORIENTADORAS DA FICHA (DETALHAMENTO GRÁFICO)
        tags$div(
          class = "row g-4 mb-4",
          
          # DIMENSÃO ECONOMIA: VAB SETORIAL COMPARATIVO
          tags$div(
            class = "col-lg-6",
            tags$div(
              class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-100",
              tags$div(
                class = "d-flex align-items-center justify-content-between mb-2",
                tags$h5(class = "font-black text-slate-800 text-sm uppercase tracking-tight mb-0",
                  tags$i(class = "fas fa-chart-pie text-amber-500 me-2"), "Dimensão 2 (Economia): Composição do VAB (%)"
                ),
                tags$span(class = "badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2", "Agro / Ind / Serv / Adm")
              ),
              tags$div(id = "comp_chart_vab_setorial", style = "width: 100%; height: 320px;")
            )
          ),
          
          # DIMENSÃO FISCAL: GESTÃO FISCAL, CUSTEIO, PESSOAL E INVESTIMENTOS (PIRULITO FISCAL)
          tags$div(
            class = "col-lg-6",
            tags$div(
              class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-100",
              tags$div(
                class = "d-flex align-items-center justify-content-between mb-2",
                tags$h5(class = "font-black text-slate-800 text-sm uppercase tracking-tight mb-0",
                  tags$i(class = "fas fa-landmark text-purple-600 me-2"), "Dimensão 4 (Fiscal): Custeio, Pessoal, Investimentos e Dívida"
                ),
                tags$span(class = "badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-pill px-2", "Lollipop Fiscal")
              ),
              tags$div(id = "comp_chart_lollipop_fiscal", style = "width: 100%; height: 320px;")
            )
          )
        ),
        
        # 5. QUADRO COMPARATIVO COMPLETO POR DIMENSÃO (TABELA DE CONFRONTO HEAD-TO-HEAD)
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 mb-5",
          tags$div(
            class = "d-flex align-items-center justify-content-between mb-3 pb-2 border-b border-slate-100",
            tags$div(
              tags$h5(class = "font-black text-slate-800 text-base uppercase tracking-tight mb-0",
                tags$i(class = "fas fa-table-list text-primary me-2"), "Matriz de Confronto Direto por Dimensões"
              ),
              tags$span(class = "text-xs text-slate-500", "Detalhamento de todos os indicadores das 5 dimensões estratégicas da Ficha Municipal")
            ),
            tags$span(class = "badge bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold rounded-pill px-3 py-1", "Benchmarking")
          ),
          tags$div(
            class = "table-responsive",
            tags$table(
              id = "comp_tabela_confronto",
              class = "table table-hover align-middle mb-0 text-sm w-100",
              tags$thead(
                class = "table-light text-xs text-slate-600 uppercase font-black",
                tags$tr(
                  tags$th("Dimensão & Indicador", style = "width: 32%;"),
                  tags$th(id = "comp_th_mun1", class = "text-center text-blue-700", style = "width: 20%;", "Município 1"),
                  tags$th(id = "comp_th_mun2", class = "text-center text-emerald-700", style = "width: 20%;", "Município 2"),
                  tags$th(id = "comp_th_mun3", class = "text-center text-purple-700", style = "width: 20%;", "Município 3"),
                  tags$th(class = "text-center text-slate-600", style = "width: 8%;", "Destaque")
                )
              ),
              tags$tbody(id = "comp_tbody_confronto")
            )
          )
        )
      ),
      
      # MODAL DE DETALHES DA FONTE BIBLIOGRÁFICA
      tags$div(
        class = "modal fade",
        id = "modalFonteReferencia",
        tabindex = "-1",
        `aria-hidden` = "true",
        tags$div(
          class = "modal-dialog modal-dialog-centered",
          tags$div(
            class = "modal-content rounded-2xl border-0 shadow-2xl overflow-hidden",
            tags$div(
              class = "modal-header bg-slate-900 text-white border-0 px-4 py-3",
              tags$div(
                tags$span(class = "badge bg-blue-500 text-white rounded-pill px-2.5 py-1 text-xs font-bold mb-1", id = "modalFonteSigla", "FONTE"),
                tags$h5(class = "modal-title font-black text-base text-white mb-0", id = "modalFonteTitulo", "Título da Fonte")
              ),
              tags$button(type = "button", class = "btn-close btn-close-white", `data-bs-dismiss` = "modal", `aria-label` = "Fechar")
            ),
            tags$div(
              class = "modal-body p-4 bg-slate-50",
              tags$div(class = "mb-3 bg-white p-3 rounded-xl border border-slate-200",
                tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider d-block mb-1", "Órgão / Autoria Responsável"),
                tags$div(class = "font-bold text-slate-800 text-sm", id = "modalFonteOrgao", "-")
              ),
              tags$div(class = "mb-3 bg-white p-3 rounded-xl border border-slate-200",
                tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider d-block mb-1", "Tipo de Documento / Corpus"),
                tags$div(class = "font-bold text-slate-800 text-sm", id = "modalFonteTipo", "-")
              ),
              tags$div(class = "bg-white p-3 rounded-xl border border-slate-200",
                tags$span(class = "text-xs font-bold text-slate-400 uppercase tracking-wider d-block mb-1", "Arquivo de Referência no Repositório"),
                tags$code(class = "text-xs text-blue-700 font-mono", id = "modalFonteArquivo", "-")
              )
            ),
            tags$div(
              class = "modal-footer bg-slate-100 border-0 px-4 py-2",
              tags$button(type = "button", class = "btn btn-sm btn-secondary rounded-pill px-3 font-bold", `data-bs-dismiss` = "modal", "Fechar")
            )
          )
        )
      ),
      
      # =========================================================================
      # MODAL DE SÉRIE HISTÓRICA E COMPARATIVO REGIONAL (MUNICÍPIOS)
      # =========================================================================
      tags$div(
        class = "modal fade",
        id = "modal_ficha_kpi_serie",
        tabindex = "-1",
        `aria-labelledby` = "modal_ficha_kpi_titulo",
        `aria-hidden` = "true",
        tags$div(
          class = "modal-dialog modal-xl modal-dialog-centered",
          tags$div(
            class = "modal-content border-0 shadow-2xl",
            style = "border-radius: 20px; overflow: hidden;",
            tags$div(
              class = "modal-header bg-slate-900 text-white px-4 py-3 border-0",
              tags$div(
                tags$span(class = "badge bg-blue-500 text-white rounded-pill px-2.5 py-1 text-xs font-bold mb-1", id = "modal_ficha_kpi_badge_tipo", "INDICADOR"),
                tags$h5(id = "modal_ficha_kpi_titulo", class = "modal-title font-black text-base text-white mb-0", "Série Histórica e Comparativo Regional")
              ),
              tags$button(type = "button", class = "btn-close btn-close-white", `data-bs-dismiss` = "modal", `aria-label` = "Fechar")
            ),
            tags$div(
              class = "modal-body p-4 bg-slate-50",
              
              # Storytelling do indicador no Modal
              tags$div(
                id = "modal_ficha_kpi_storytelling",
                class = "alert bg-white border border-slate-200 shadow-sm rounded-2xl p-3.5 mb-4 text-sm text-slate-700",
                "Carregando informações..."
              ),
              
              # Linha dos dois gráficos: Série Histórica do Município + Comparativo na RD
              tags$div(
                class = "row g-4",
                tags$div(
                  class = "col-lg-6",
                  tags$div(
                    class = "bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm h-100",
                    tags$h6(class = "fw-black text-slate-800 text-sm mb-3 d-flex align-items-center gap-1.5",
                            tags$i(class = "fas fa-chart-line text-primary"), "Evolução Histórica do Município"),
                    tags$div(id = "modal_ficha_chart_serie", style = "width: 100%; height: 350px;")
                  )
                ),
                tags$div(
                  class = "col-lg-6",
                  tags$div(
                    class = "bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm h-100",
                    tags$h6(id = "modal_ficha_ranking_titulo", class = "fw-black text-slate-800 text-sm mb-3 d-flex align-items-center gap-1.5",
                            tags$i(class = "fas fa-chart-bar text-purple-600"), "Comparativo Regional"),
                    tags$div(id = "modal_ficha_chart_ranking", style = "width: 100%; height: 350px;")
                  )
                )
              )
            ),
            tags$div(
              class = "modal-footer bg-slate-100 border-0 px-4 py-2.5 d-flex justify-content-between align-items-center",
              tags$span(id = "modal_ficha_kpi_fonte", class = "text-xs text-slate-500 font-medium", "Fonte: Sistema Integrado Aurora"),
              tags$button(type = "button", class = "btn btn-sm btn-secondary rounded-pill px-4 font-bold shadow-xs", `data-bs-dismiss` = "modal", "Fechar")
            )
          )
        )
      )
    )
  )
}