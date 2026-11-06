ui_modulo_tematicas <- function() {
  tags$div(
    class = "tab-pane relative",
    `data-value` = "Programas",
    id = "aba_tematicas",
    
    tags$div(
      class = "container-fluid mt-3 px-4 pb-5",
      
      # CABEÇALHO DA ABA ANÁLISES TEMÁTICAS
      tags$div(
        class = "border-b-2 border-slate-200 pb-3 mb-4 mt-2",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Programas Prioritários"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Programas Prioritários, Investimentos Estruturadores e Visão Territorial do Estado")
      ),
      
      # =========================================================================
      # SEÇÃO: PAINEL EXECUTIVO INTEGRADO (COM BOTÃO DE RECOLHER)
      # =========================================================================
      tags$div(
        id = "sec_tematicas_resumo_executivo",
        class = "border-b-2 border-slate-200 pb-2 mb-3 mt-2 d-flex justify-content-between align-items-center flex-wrap gap-2",
        tags$div(
          tags$h3(class = "text-lg font-black text-slate-800 uppercase tracking-tight mb-0", "Painel Executivo de Programas"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Visão Transversal Integrada das Entregas e Investimentos Estruturadores no Estado")
        ),
        tags$button(
          id = "btn_toggle_painel_executivo_programas",
          type = "button",
          class = "btn btn-outline-dark btn-sm rounded-pill font-bold px-3 py-1 text-xs shadow-2xs transition-all",
          onclick = "window.togglePainelExecutivoProgramas()",
          tags$i(id = "icon_toggle_painel_programas", class = "fas fa-chevron-up me-1"),
          tags$span(id = "txt_toggle_painel_programas", "Recolher Painel")
        )
      ),
      
      tags$div(
        id = "tematicas_container_resumo_executivo",
        class = "mb-4"
      ),
      
      # =========================================================================
      # SELETOR DE PAUTA TEMÁTICA
      # =========================================================================
      tags$div(
        class = "bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2",
        tags$div(
          class = "d-flex align-items-center gap-2",
          tags$i(class = "fas fa-sliders text-[#ff5a26] text-sm"),
          tags$span(class = "text-xs font-black text-slate-700 uppercase tracking-wider", "Selecionar Pauta Prioritária:")
        ),
        tags$div(
          class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1 flex-wrap",
          tags$button(
            id = "btn_pauta_resumo_cozinhas",
            class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-xs transition-all",
            onclick = "window.alternarPautaResumos('cozinhas', this)",
            tags$i(class = "fas fa-utensils me-1.5 text-slate-900"), "Superação da Pobreza, Segurança Alimentar e Proteção Social"
          ),
          tags$button(
            id = "btn_pauta_resumo_habitacao",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('habitacao', this)",
            tags$i(class = "fas fa-house-chimney me-1.5 text-slate-900"), "Habitação e Regularização Fundiária"
          ),
          tags$button(
            id = "btn_pauta_resumo_aguas",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('aguas', this)",
            tags$i(class = "fas fa-droplet me-1.5 text-slate-900"), "Segurança Hídrica e Saneamento Básico"
          ),
          tags$button(
            id = "btn_pauta_resumo_capag",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('capag', this)",
            tags$i(class = "fas fa-building-columns me-1.5 text-slate-900"), "Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios"
          ),
          tags$button(
            id = "btn_pauta_resumo_estradas",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('estradas', this)",
            tags$i(class = "fas fa-road me-1.5 text-slate-900"), "Conectividade Logística, Eixos Viários e Mobilidade Regional"
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA: SEGURANÇA ALIMENTAR (COZINHAS)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_cozinhas",
        class = "resumo-pauta-bloco",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-amber-50 text-amber-700 border border-amber-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "SEGURANÇA ALIMENTAR & ASSISTÊNCIA SOCIAL"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Superação da Pobreza, Segurança Alimentar e Proteção Social")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-shield-heart text-amber-600 me-1"), "SAS / Governo de Pernambuco"
            )
          ),
          
          # KPIS: COZINHAS
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-utensils text-slate-900"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Rede de Cozinhas Comunitárias")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total de Cozinhas"), tags$div(class = "aurora-kpi-icon", tags$i(class = "fas fa-utensils text-slate-500"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cozinhas_kpi_total", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Mapeadas no Estado")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Funcionamento"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-check-circle"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cozinhas_kpi_funcionamento", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Servindo Refeições")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Implantação"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-clock"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cozinhas_kpi_implantacao", class = "aurora-kpi-number text-amber-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Em Preparação")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Aguard. Pactuação"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-file-signature"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cozinhas_kpi_pactuacao", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Fase de Adesão")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Não Aderiu"), tags$div(class = "aurora-kpi-icon text-rose-600 bg-rose-50", tags$i(class = "fas fa-circle-xmark"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cozinhas_kpi_nao_aderiu", class = "aurora-kpi-number text-rose-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Sem Adesão")
            )
          ),
          
          # KPIS: MÃES DE PERNAMBUCO
          tags$div(class = "d-flex align-items-center gap-2 mb-2 mt-4",
                   tags$i(class = "fas fa-person-breastfeeding text-pink-500"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Programa Mães de Pernambuco (Transferência de Renda)")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Mães Beneficiadas"), tags$div(class = "aurora-kpi-icon text-pink-600 bg-pink-50", tags$i(class = "fas fa-person-breastfeeding"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "maes_kpi_total", class = "aurora-kpi-number text-pink-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Mães e Crianças")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Acumulado"), tags$div(class = "aurora-kpi-icon text-slate-900 bg-purple-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "maes_kpi_investimento", class = "aurora-kpi-number text-purple-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Recursos Pagos")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "maes_kpi_municipios", class = "aurora-kpi-number", "185")),
              tags$div(class = "aurora-kpi-footer", "100% de Cobertura Estadual")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Benefício Mensal"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-money-bill-transfer"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "maes_kpi_auxilio", class = "aurora-kpi-number text-emerald-700", "R$ 300 / mãe")),
              tags$div(class = "aurora-kpi-footer", "Transferência Direta")
            )
          ),
          
          # KPIS: COFINANCIAMENTO SAS
          tags$div(class = "d-flex align-items-center gap-2 mb-2 mt-4",
                   tags$i(class = "fas fa-hand-holding-dollar text-blue-500"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Cofinanciamento da Assistência Social (SAS / FEAS)")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-5",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total Pago"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-check-double"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cofin_kpi_pago", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Transferência Concluída")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total Validado"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-clipboard-check"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cofin_kpi_validado", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Pactuado em PE")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("% Executado / Pago"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-chart-pie"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cofin_kpi_percentual", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Execução Orçamentária")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Saldo a Pagar"), tags$div(class = "aurora-kpi-icon text-slate-900 bg-purple-50", tags$i(class = "fas fa-hourglass-half"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cofin_kpi_a_pagar", class = "aurora-kpi-number text-purple-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Parcelas Futuras")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-city"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "cofin_kpi_municipios", class = "aurora-kpi-number", "185")),
              tags$div(class = "aurora-kpi-footer", "Cobertura em Todo PE")
            )
          ),
          
          # CABEÇALHO E CONTROLES DO MAPA
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Cobertura Territorial e Equipamentos"),
              tags$span(id = "sem_fome_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Localização das Cozinhas Comunitárias")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_sem_fome_cozinhas",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoSemFome('cozinhas', this)",
                  tags$i(class = "fas fa-utensils me-1.5"), "Cozinhas Comunitárias"
                ),
                tags$button(
                  id = "btn_visao_sem_fome_maes",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoSemFome('maes', this)",
                  tags$i(class = "fas fa-person-breastfeeding me-1.5 text-pink-500"), "Mães de Pernambuco"
                ),
                tags$button(
                  id = "btn_visao_sem_fome_cofin",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoSemFome('cofin', this)",
                  tags$i(class = "fas fa-hand-holding-dollar me-1.5 text-blue-500"), "Cofinanciamento"
                ),
                tags$button(
                  id = "btn_visao_sem_fome_ivcad",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoSemFome('ivcad', this)",
                  tags$i(class = "fas fa-shield-heart me-1.5 text-slate-900"), "Vulnerabilidade (IVCAD)"
                )
              ),
              # LEGENDAS
              tags$div(
                id = "legenda_visao_cozinhas",
                class = "d-flex align-items-center gap-1.5 flex-wrap",
                tags$span(class = "badge bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs", "● Funcionando"),
                tags$span(class = "badge bg-amber-100 text-amber-800 border border-amber-300 text-xs", "● Implantação"),
                tags$span(class = "badge bg-blue-100 text-blue-800 border border-blue-300 text-xs", "● Pactuação"),
                tags$span(class = "badge bg-rose-100 text-rose-800 border border-rose-300 text-xs", "● Não Aderiu")
              ),
              tags$div(
                id = "legenda_visao_maes",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Beneficiárias:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fce7f3; color: #831843;", "< 400"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f472b6;", "400 - 800"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #db2777;", "800 - 1.500"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #831843;", "> 1.500")
              ),
              tags$div(
                id = "legenda_visao_cofin",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Repasse Pago:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #dbeafe; color: #1e40af;", "< R$ 10M"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #60a5fa;", "R$ 10M - 20M"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #2563eb;", "R$ 20M - 40M"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #1e3a8a;", "> R$ 40M")
              ),
              tags$div(
                id = "legenda_visao_ivcad",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Vulnerab. Cuidados (Ponderada):"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #e0e7ff; color: #3730a3;", "< 0,10 (Baixa)"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #818cf8;", "0,10 - 0,18"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #4f46e5;", "0,18 - 0,28"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #312e81;", "> 0,28 (Alta)")
              )
            )
          ),
          
          # GRID DO MAPA COM BOX LATERAL DIREITO
          tags$div(
            class = "row g-3 mb-5",
            tags$div(
              class = "col-lg-8 col-xl-8",
              tags$div(
                class = "position-relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-100",
                style = "min-height: 520px;",
                tags$div(
                  id = "resumo_cozinhas_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_cozinhas_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "sem_fome_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                tags$div(
                  id = "sem_fome_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-map-location-dot")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento Territorial"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou cozinhas no mapa para inspecionar os indicadores locais em tempo real."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(class = "text-sm font-black text-slate-700", "185")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Cozinhas"),
                             tags$span(class = "text-sm font-black text-amber-600", "402")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Mães de PE"),
                             tags$span(class = "text-sm font-black text-pink-600", "157.196")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Cofinanciamento"),
                             tags$span(class = "text-sm font-black text-blue-600", "R$ 3,0 Bi")
                    )
                  )
                ),
                tags$div(
                  id = "sem_fome_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # GRÁFICOS COFINANCIAMENTO
          tags$div(
            class = "mt-4 pt-4 border-t border-slate-100",
            tags$div(
              class = "row g-4 mb-5",
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Série Histórica do Cofinanciamento"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Valores Validados vs. Pagos por ano de competência (2024-2026)")
                    ),
                    tags$span(class = "badge bg-blue-100 text-blue-800 text-xs font-bold rounded-pill px-2.5 py-1", "Evolução Anual")
                  ),
                  tags$div(id = "chart_cofin_serie_historica", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Cofinanciamento por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top municípios com maior volume financeiro recebido")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_cofin_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # GRÁFICO POR MUNICÍPIO
          tags$div(
            class = "mt-2 pt-4 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(id = "sem_fome_chart_title", class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Cozinhas Comunitárias por Município"),
                tags$span(id = "sem_fome_chart_subtitle", class = "text-xs text-slate-400 font-semibold", "Top municípios com maior número de unidades do programa")
              ),
              tags$span(
                id = "cozinhas_badge_total_muns",
                class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs rounded-pill font-bold",
                tags$i(class = "fas fa-map-pin text-slate-900 me-1"), "185 Municípios Mapeados"
              )
            ),
            tags$div(
              id = "resumo_cozinhas_chart_muns",
              style = "width: 100%; height: 460px;"
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA 1: CAPACIDADE DE PAGAMENTO (CAPAG)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_capag",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-purple-50 text-purple-700 border border-purple-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "GESTÃO FISCAL & CRÉDITO"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-building-columns text-primary me-1"), "Secretaria do Tesouro Nacional (STN)"
            )
          ),
          
          tags$div(
            class = "text-center mb-3",
            tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-1", "CAPAG por Município")
          ),
          
          tags$div(
            id = "resumo_capag_map_container",
            class = "map-clean-container rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner mx-auto",
            style = "height: 520px; width: 100%; max-width: 1100px; background-color: #f8fafc; position: relative;",
            
            tags$div(
              id = "resumo_capag_spinner",
              class = "d-none position-absolute top-50 start-50 translate-middle text-center bg-white/90 p-4 rounded-2xl shadow-lg border border-slate-200 z-10",
              tags$div(class = "spinner-border text-primary mb-2", role = "status"),
              tags$div(class = "text-xs font-bold text-slate-700", "Carregando dados da CAPAG...")
            ),
            tags$div(id = "resumo_capag_map", style = "width: 100%; height: 100%;")
          ),
          
          tags$div(
            class = "mt-5 d-flex flex-column align-items-center",
            tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-3 text-center", "Quantidade de municípios de Pernambuco por nota final na CAPAG"),
            
            tags$div(
              class = "table-responsive w-100 d-flex justify-content-center",
              tags$table(
                class = "table table-bordered text-center align-middle shadow-sm rounded-xl overflow-hidden mb-2",
                style = "max-width: 860px; border: 1.5px solid #205090;",
                tags$thead(
                  tags$tr(
                    style = "background-color: #205090; color: #ffffff; font-weight: 800; font-size: 0.8rem; border-color: #1a4278;",
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nota"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nº de municípios"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nota"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nº de municípios"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nota"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nº de municípios"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nota"),
                    tags$th(style = "width: 12.5%; background-color: #205090; color: #ffffff; padding: 10px 4px;", "Nº de municípios")
                  )
                ),
                tags$tbody(
                  tags$tr(
                    style = "font-size: 0.88rem;",
                    tags$td(style = "background-color: #92D050; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "A"),
                    tags$td(id = "capag_count_A", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-"),
                    tags$td(style = "background-color: #00A8A8; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "B"),
                    tags$td(id = "capag_count_B", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-"),
                    tags$td(style = "background-color: #C55A11; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "C"),
                    tags$td(id = "capag_count_C", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-"),
                    tags$td(style = "background-color: #595959; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "n.d."),
                    tags$td(id = "capag_count_nd", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-")
                  ),
                  tags$tr(
                    style = "font-size: 0.88rem;",
                    tags$td(style = "background-color: #70AD47; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "A+"),
                    tags$td(id = "capag_count_Aplus", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-"),
                    tags$td(style = "background-color: #00B0B9; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "B+"),
                    tags$td(id = "capag_count_Bplus", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-"),
                    tags$td(style = "background-color: #843C0C; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "D"),
                    tags$td(id = "capag_count_D", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "0"),
                    tags$td(style = "background-color: #404040; color: #ffffff; font-weight: 900; border-color: #e2e8f0; padding: 8px 4px;", "n.e."),
                    tags$td(id = "capag_count_ne", class = "bg-white text-slate-800 fw-black", style = "border-color: #e2e8f0; font-size: 0.95rem;", "-")
                  )
                )
              )
            ),
            tags$div(
              class = "text-center text-slate-400 text-xs mt-2",
              "Fonte: Secretaria do Tesouro Nacional (STN). Classificação da Capacidade de Pagamento (CAPAG). n.d. = Não Disponível; n.e. = Não Elegível."
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA 2: ÁGUAS DE PERNAMBUCO (COMPESA / SRHS)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_aguas",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-blue-50 text-blue-700 border border-blue-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "SANEAMENTO & RECURSOS HÍDRICOS"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Segurança Hídrica e Saneamento Básico")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-water text-primary me-1"), "COMPESA / SRHS"
            )
          ),
          
          # MICRO-KPIS CONSOLIDADOS
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-5",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-faucet-drip"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "aguas_kpi_investimento", class = "aurora-kpi-number text-blue-700", "R$ 14,8 Bi")),
              tags$div(class = "aurora-kpi-footer", "Plano Plurianual")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Projetos / Obras"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-trowel-bricks"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "aguas_kpi_projetos", class = "aurora-kpi-number", "560")),
              tags$div(class = "aurora-kpi-footer", "Intervenções Mapeadas")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "aguas_kpi_municipios", class = "aurora-kpi-number", "185")),
              tags$div(class = "aurora-kpi-footer", "100% dos Territórios")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Pop. Beneficiada"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-users"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "aguas_kpi_populacao", class = "aurora-kpi-number text-emerald-700", "9,5 Mi")),
              tags$div(class = "aurora-kpi-footer", "Alcance Estimado")
            ),
            tags$div(
              class = "aurora-kpi-card col-span-2 md:col-span-1",
              tags$div(class = "aurora-kpi-header", tags$span("Desembolso Futuro"), tags$div(class = "aurora-kpi-icon text-slate-900 bg-purple-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "aguas_kpi_desembolso", class = "aurora-kpi-number text-purple-700", "R$ 7,7 Bi")),
              tags$div(class = "aurora-kpi-footer", "Contratos em Andamento")
            )
          ),
          
          # CONTROLES DO MAPA
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Infraestrutura Hídrica e Cobertura Municipal"),
              tags$span(id = "aguas_camada_ativa_label", class = "text-xs text-slate-400 font-semibold", "Camada Base: Visão Geral de Municípios")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-flex align-items-center gap-2 bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-pill shadow-xs",
                tags$div(
                  class = "form-check form-switch mb-0 d-flex align-items-center gap-1.5 ps-0",
                  tags$input(
                    class = "form-check-input ms-0 cursor-pointer",
                    type = "checkbox",
                    role = "switch",
                    id = "aguas_toggle_adutoras",
                    checked = "checked",
                    style = "cursor: pointer;",
                    onchange = "window.toggleCamadaAdutoras(this.checked)"
                  ),
                  tags$label(
                    class = "form-check-label text-xs font-bold text-blue-900 cursor-pointer mb-0 select-none",
                    `for` = "aguas_toggle_adutoras",
                    tags$i(class = "fas fa-water text-blue-600 me-1"),
                    "Rede de Adutoras"
                  )
                )
              ),
              tags$div(
                class = "d-flex align-items-center gap-2",
                tags$label(class = "text-xs font-bold text-slate-400 mb-0", "Cenário / Camada:"),
                tags$select(
                  id = "aguas_select_camada",
                  class = "form-select form-select-sm fw-bold text-slate-400 bg-slate-100 border-slate-200 rounded-pill shadow-none",
                  style = "width: 210px; font-size: 0.82rem; cursor: not-allowed; opacity: 0.75;",
                  disabled = "disabled",
                  title = "Filtro inativo até a inclusão de nova camada de polígonos",
                  tags$option(value = "Cenario: Geral", selected = "selected", "Visão Geral Consolidada")
                )
              )
            )
          ),
          
          # MAPA CONTAINER
          tags$div(
            id = "resumo_aguas_map_container",
            class = "map-clean-container rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner mx-auto mb-4",
            style = "height: 520px; width: 100%; background-color: #f8fafc; position: relative;",
            
            tags$div(
              id = "resumo_aguas_spinner",
              class = "d-none position-absolute top-50 start-50 translate-middle text-center bg-white/90 p-4 rounded-2xl shadow-lg border border-slate-200 z-10",
              tags$div(class = "spinner-border text-primary mb-2", role = "status"),
              tags$div(class = "text-xs font-bold text-slate-700", "Carregando mapa de Águas de Pernambuco...")
            ),
            
            tags$div(id = "resumo_aguas_map", style = "width: 100%; height: 100%;"),
            
            tags$div(
              id = "resumo_aguas_legenda",
              class = "bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-md position-absolute bottom-4 left-4 z-10 text-xs",
              tags$div(class = "fw-bold text-slate-800 mb-1.5", style = "font-size: 0.75rem;", "Situação Municipal"),
              tags$div(
                class = "d-flex flex-column gap-1 mb-2 pb-2 border-bottom border-slate-200",
                tags$div(class = "d-flex align-items-center gap-2",
                         tags$span(style = "width: 12px; height: 12px; border-radius: 3px; background-color: #1D9E75; display: inline-block;"),
                         tags$span(class = "text-slate-700 font-semibold", "Atendido / Concluído / Positivo")
                ),
                tags$div(class = "d-flex align-items-center gap-2",
                         tags$span(style = "width: 12px; height: 12px; border-radius: 3px; background-color: #EF9F27; display: inline-block;"),
                         tags$span(class = "text-slate-700 font-semibold", "Em Andamento / Em Atenção")
                ),
                tags$div(class = "d-flex align-items-center gap-2",
                         tags$span(style = "width: 12px; height: 12px; border-radius: 3px; background-color: #E24B4A; display: inline-block;"),
                         tags$span(class = "text-slate-700 font-semibold", "Crítico / Déficit / Não Iniciado")
                ),
                tags$div(class = "d-flex align-items-center gap-2",
                         tags$span(style = "width: 12px; height: 12px; border-radius: 3px; background-color: #B8B6AE; display: inline-block;"),
                         tags$span(class = "text-slate-700 font-semibold", "Sem Intervenção / Não Aplicável")
                )
              ),
              tags$div(
                id = "resumo_aguas_legenda_adutoras",
                tags$div(class = "fw-bold text-blue-900 mb-1.5", style = "font-size: 0.75rem;", 
                         tags$i(class = "fas fa-water text-blue-600 me-1"), "Rede de Adutoras"
                ),
                tags$div(
                  class = "d-flex flex-column gap-1",
                  tags$div(class = "d-flex align-items-center gap-2",
                           tags$span(style = "width: 16px; height: 3.5px; border-radius: 2px; background-color: #0284c7; display: inline-block;"),
                           tags$span(class = "text-slate-700 font-semibold", "Sistema Existente")
                  ),
                  tags$div(class = "d-flex align-items-center gap-2",
                           tags$span(style = "width: 16px; height: 3.5px; border-radius: 2px; background-color: #f59e0b; display: inline-block;"),
                           tags$span(class = "text-slate-700 font-semibold", "Sistema em Obras")
                  ),
                  tags$div(class = "d-flex align-items-center gap-2",
                           tags$span(style = "width: 16px; height: 2px; border-top: 2px dashed #8b5cf6; display: inline-block;"),
                           tags$span(class = "text-slate-700 font-semibold", "Sistema Planejado")
                  )
                )
              )
            )
          ),
          
          # GRÁFICOS ANALÍTICOS
          tags$div(
            class = "row g-4 mb-5",
            tags$div(
              class = "col-lg-6",
              tags$div(
                class = "bg-slate-50 p-4 rounded-2xl border border-slate-100 h-100",
                tags$h6(class = "font-extrabold text-slate-700 text-sm mb-1", "Cronograma Plurianual de Desembolso Financeiro"),
                tags$p(class = "text-xs text-slate-400 mb-3", "Necessidade de recursos projetada por ano (em R$ Milhões)"),
                tags$div(id = "resumo_aguas_chart_desembolso", style = "width: 100%; height: 320px;")
              )
            ),
            tags$div(
              class = "col-lg-6",
              tags$div(
                class = "bg-slate-50 p-4 rounded-2xl border border-slate-100 h-100",
                tags$h6(class = "font-extrabold text-slate-700 text-sm mb-1", "Carteira de Projetos por Situação"),
                tags$p(class = "text-xs text-slate-400 mb-3", "Distribuição do número de projetos por status de execução"),
                tags$div(id = "resumo_aguas_chart_status", style = "width: 100%; height: 320px;")
              )
            ),
            tags$div(
              class = "col-12",
              tags$div(
                class = "bg-slate-50 p-4 rounded-2xl border border-slate-100",
                tags$h6(class = "font-extrabold text-slate-700 text-sm mb-1", "Top 15 Municípios com Maior Volume de Recursos Rateados"),
                tags$p(class = "text-xs text-slate-400 mb-3", "Soma dos valores rateados das obras e intervenções hídricas (em R$ Milhões)"),
                tags$div(id = "resumo_aguas_chart_top_muns", style = "width: 100%; height: 380px;")
              )
            )
          ),
          
          # TABELA
          tags$div(
            class = "mt-4",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-bold text-slate-800 text-base mb-0", "Portfólio Detalhado de Projetos e Obras da Compesa"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Listagem consolidada de todas as intervenções com diretoria, orçamento e execução")
              ),
              tags$div(
                id = "aguas_filtro_municipio_ativo",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-pill", id = "aguas_filtro_municipio_badge", "Filtro: Todos"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroMunTabelaAguas()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "resumo_aguas_tabela_projetos", class = "table table-hover w-100 text-sm")
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA 4: ESTRADAS DE PERNAMBUCO (DER-PE / SEINFRA)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_estradas",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "INFRAESTRUTURA RODOVIÁRIA & LOGÍSTICA"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Conectividade Logística, Eixos Viários e Mobilidade Regional")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-road text-indigo-600 me-1"), "DER-PE / SEINFRA • Governo de Pernambuco"
            )
          ),
          
          # KPIS ESTRADAS
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-chart-pie text-slate-900"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Panorama Geral das Obras Rodoviárias")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total de Obras"), tags$div(class = "aurora-kpi-icon", tags$i(class = "fas fa-trowel-bricks text-slate-500"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "estradas_kpi_total", class = "aurora-kpi-number", "193")),
              tags$div(class = "aurora-kpi-footer", "Contratos DER-PE")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Rodovias"), tags$div(class = "aurora-kpi-icon text-indigo-600 bg-indigo-50", tags$i(class = "fas fa-road"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "estradas_kpi_rodovias", class = "aurora-kpi-number text-indigo-700", "81")),
              tags$div(class = "aurora-kpi-footer", "Trechos Mapeados")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-sack-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "estradas_kpi_investimento", class = "aurora-kpi-number text-emerald-700", "R$ 4,72 Bi")),
              tags$div(class = "aurora-kpi-footer", "Total Previsto")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Concluídas"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-circle-check"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "estradas_kpi_concluidas", class = "aurora-kpi-number text-teal-700", "129")),
              tags$div(class = "aurora-kpi-footer", "Entregues à População")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Execução"), tags$div(class = "aurora-kpi-icon text-sky-600 bg-sky-50", tags$i(class = "fas fa-person-digging"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "estradas_kpi_execucao", class = "aurora-kpi-number text-sky-700", "59")),
              tags$div(class = "aurora-kpi-footer", "Obras Ativas")
            )
          ),
          
          # ÁREA DO MAPA INTERATIVO E FILTROS
          tags$div(
            class = "bg-slate-50 border border-slate-200 rounded-3xl p-3 p-md-4 mb-4",
            tags$div(
              class = "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3",
              tags$div(
                tags$h6(class = "font-black text-slate-800 text-sm mb-0 uppercase tracking-wider",
                        tags$i(class = "fas fa-map-location-dot text-indigo-600 me-1.5"), "Mapa Territorial da Malha Rodoviária"
                ),
                tags$p(class = "text-xs text-slate-500 mb-0", "Traçados georreferenciados coloridos pelo status da intervenção")
              ),
              tags$div(
                class = "d-flex align-items-center gap-2 flex-wrap",
                tags$div(
                  class = "d-inline-flex bg-white p-1 rounded-pill border border-slate-200 gap-1",
                  tags$button(
                    id = "filtro_estradas_todos",
                    class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs btn-primary text-white",
                    onclick = "window.filtrarEstradasStatus('todos', this)",
                    "Todos"
                  ),
                  tags$button(
                    id = "filtro_estradas_concluida",
                    class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
                    onclick = "window.filtrarEstradasStatus('Concluída', this)",
                    "Concluídas"
                  ),
                  tags$button(
                    id = "filtro_estradas_execucao",
                    class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
                    onclick = "window.filtrarEstradasStatus('Em Execução', this)",
                    "Em Execução"
                  ),
                  tags$button(
                    id = "filtro_estradas_paralisada",
                    class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
                    onclick = "window.filtrarEstradasStatus('Paralisada', this)",
                    "Paralisadas"
                  )
                ),
                tags$div(
                  class = "d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-1 border border-slate-200 shadow-xs",
                  tags$i(class = "fas fa-road text-slate-900 text-xs"),
                  tags$select(
                    id = "select_filtro_rodovia",
                    class = "form-select form-select-sm fw-bold text-slate-700 bg-transparent border-0 shadow-none cursor-pointer",
                    style = "max-width: 170px; font-size: 0.8rem; outline: none; box-shadow: none;",
                    onchange = "window.selecionarRodoviaFiltro(this.value)",
                    tags$option(value = "", "Todas Rodovias")
                  )
                )
              )
            ),
            
            tags$div(
              class = "position-relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100",
              style = "height: 480px;",
              tags$div(id = "estradas_map_container", style = "width: 100%; height: 100%;"),
              tags$div(
                id = "estradas_map_spinner",
                class = "position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-10 d-none",
                tags$div(class = "spinner-border text-primary", role = "status")
              ),
              tags$div(
                class = "position-absolute bottom-3 start-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-xs z-10",
                tags$span(class = "font-extrabold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider", "Legenda das Rodovias:"),
                tags$div(class = "d-flex flex-column gap-1",
                         tags$div(class = "d-flex align-items-center gap-2",
                                  tags$span(class = "w-3 h-3 rounded-full bg-emerald-500 d-inline-block"),
                                  tags$span(class = "text-slate-600 font-bold text-[11px]", "Concluída")
                         ),
                         tags$div(class = "d-flex align-items-center gap-2",
                                  tags$span(class = "w-3 h-3 rounded-full bg-sky-600 d-inline-block"),
                                  tags$span(class = "text-slate-600 font-bold text-[11px]", "Em Execução")
                         ),
                         tags$div(class = "d-flex align-items-center gap-2",
                                  tags$span(class = "w-3 h-3 rounded-full bg-rose-500 d-inline-block"),
                                  tags$span(class = "text-slate-600 font-bold text-[11px]", "Paralisada")
                         )
                )
              )
            )
          ),
          
          # TABELA ESTRADAS
          tags$div(
            class = "mt-4",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Portfólio de Obras e Intervenções Rodoviárias"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Listagem completa dos contratos do DER-PE com status e avanço físico")
              ),
              tags$div(
                id = "estradas_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-indigo-100 text-indigo-800 font-bold px-3 py-1.5 rounded-pill", id = "estradas_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroEstradas()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "tabela_estradas_pe", class = "table table-hover w-100 text-sm")
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA 5: HABITAÇÃO E REGULARIZAÇÃO FUNDIÁRIA (PADRONIZADO)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_habitacao",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          # Título do Bloco
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-teal-50 text-teal-700 border border-teal-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "HABITAÇÃO & DESENVOLVIMENTO URBANO"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Habitação de Interesse Social e Regularização Fundiária")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-house-chimney text-teal-600 me-1"), "SEDUH / SEHAB e PERPART"
            )
          ),
          
          # =========================================================================
          # HIERARQUIA 1: PROGRAMA MORAR BEM PE (PANORAMA GERAL) - SEMPRE VISÍVEL
          # =========================================================================
          tags$div(
            class = "d-flex align-items-center gap-2 mb-2",
            tags$i(class = "fas fa-house-chimney text-teal-600"),
            tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Programa Morar Bem PE (Produção Habitacional)")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-6 gap-3 mb-3",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total Previsto"), tags$div(class = "aurora-kpi-icon text-slate-500", tags$i(class = "fas fa-city"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_total", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Entregues"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-key"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_entregues", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Unidades Concluídas")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Construção"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-trowel-bricks"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_obras", class = "aurora-kpi-number text-amber-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Canteiros Ativos")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-slate-900 bg-purple-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_investimento", class = "aurora-kpi-number text-purple-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Valor Global Orçado")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Geral"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-coins"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_contrapartida", class = "aurora-kpi-number text-teal-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Aporte Estadual")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "morar_bem_kpi_municipios", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Cobertura Territorial")
            )
          ),
          
          # =========================================================================
          # BOTÃO RETRÁTIL POSICIONADO ABAIXO DOS KPIS DE MORADIA
          # =========================================================================
          tags$div(
            class = "d-flex justify-content-center my-3 pt-2 border-t border-slate-100",
            tags$button(
              id = "btn_toggle_habitacao_detalhes",
              type = "button",
              class = "btn btn-sm rounded-pill font-bold px-4 py-2 text-xs shadow-xs transition-all d-flex align-items-center gap-2",
              style = "background-color: #ff5a26; color: #ffffff; border: 1px solid #ff5a26;",
              onmouseover = "this.style.backgroundColor='#e04a1b'; this.style.borderColor='#e04a1b';",
              onmouseout = "this.style.backgroundColor='#ff5a26'; this.style.borderColor='#ff5a26';",
              onclick = "window.toggleDetalhesHabitacao()",
              tags$span(id = "txt_toggle_habitacao", "Exibir Programas e Modalidades Habitacionais Detalhadas"),
              tags$i(id = "icon_toggle_habitacao", class = "fas fa-chevron-down transition-transform")
            )
          ),
          
          # =========================================================================
          # CONTEÚDO EXPANSÍVEL: MODALIDADES HABITACIONAIS (ABRE AQUI)
          # =========================================================================
          tags$div(
            id = "bloco_habitacao_detalhes_extras",
            class = "d-none transition-all mb-4",
            
            # HIERARQUIA 2: PROGRAMA MORAR BEM PE — REFORMA NO LAR (RNL)
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-2",
              tags$i(class = "fas fa-hammer text-orange-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — Reforma no Lar (Melhorias Habitacionais)")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº de Cadastrados"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-clipboard-user"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "rnl_kpi_cadastrados", class = "aurora-kpi-number text-slate-800", "-")),
                tags$div(class = "aurora-kpi-footer", "Famílias Inscritas")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Reformas Realizadas"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-circle-check"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "rnl_kpi_concluidas", class = "aurora-kpi-number text-emerald-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Entregues")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Valor Contratual"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-file-contract"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "rnl_kpi_valor_contratual", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Total Contratado")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Valor Total Medido"), tags$div(class = "aurora-kpi-icon text-purple-600 bg-purple-50", tags$i(class = "fas fa-ruler-combined"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "rnl_kpi_valor_medido", class = "aurora-kpi-number text-purple-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Execução Medida")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-orange-600 bg-orange-50", tags$i(class = "fas fa-city"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "rnl_kpi_municipios", class = "aurora-kpi-number text-orange-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Com Ações RNL")
              )
            ),
            
            # HIERARQUIA 3: PROGRAMA MORAR BEM PE — ENTRADA GARANTIDA (ENT)
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-4",
              tags$i(class = "fas fa-handshake-angle text-indigo-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — Entrada Garantida (Subsídio para Aquisição)")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Quantidade de UH"), tags$div(class = "aurora-kpi-icon text-indigo-600 bg-indigo-50", tags$i(class = "fas fa-door-open"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "ent_kpi_uh", class = "aurora-kpi-number text-indigo-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº Empreendimentos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-building"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "ent_kpi_empreendimentos", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Empreendimentos Atendidos")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Valor Total"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-sack-dollar"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "ent_kpi_valor_total", class = "aurora-kpi-number text-emerald-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Aporte Global Previsto")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-purple-600 bg-purple-50", tags$i(class = "fas fa-map-location-dot"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "ent_kpi_municipios", class = "aurora-kpi-number text-purple-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Municípios Beneficiados")
              )
            ),
            
            # HIERARQUIA 4: PROGRAMA MORAR BEM PE — FAR
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-4",
              tags$i(class = "fas fa-landmark text-sky-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — FAR (Fundo de Arrendamento Residencial)")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Quantidade de UH"), tags$div(class = "aurora-kpi-icon text-sky-600 bg-sky-50", tags$i(class = "fas fa-door-open"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "far_kpi_uh", class = "aurora-kpi-number text-sky-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº Empreendimentos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-building"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "far_kpi_empreendimentos", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Empreendimentos Mapeados")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Recurso Federal"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-landmark-flag"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "far_kpi_recurso_federal", class = "aurora-kpi-number text-emerald-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Aporte Federal Global")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Obras"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-trowel-bricks"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "far_kpi_contrapartida_obras", class = "aurora-kpi-number text-amber-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Não Incidentes")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Terrenos"), tags$div(class = "aurora-kpi-icon text-purple-600 bg-purple-50", tags$i(class = "fas fa-map-pin"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "far_kpi_contrapartida_terrenos", class = "aurora-kpi-number text-purple-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Terrenos Doados")
              )
            ),
            
            # HIERARQUIA 5: PROGRAMA MORAR BEM PE — FDS
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-4",
              tags$i(class = "fas fa-users-rays text-emerald-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — FDS (Fundo de Desenvolvimento Social)")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-3 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Quantidade de UH"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-door-open"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "fds_kpi_uh", class = "aurora-kpi-number text-emerald-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº Empreendimentos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-building"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "fds_kpi_empreendimentos", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Empreendimentos Atendidos")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Obras"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-coins"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "fds_kpi_contrapartida", class = "aurora-kpi-number text-teal-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Não Incidentes")
              )
            ),
            
            # HIERARQUIA 6: PROGRAMA MORAR BEM PE — SUB-50
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-4",
              tags$i(class = "fas fa-city text-cyan-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — SUB-50 (Municípios até 50 mil habitantes)")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Quantidade de UH"), tags$div(class = "aurora-kpi-icon text-cyan-600 bg-cyan-50", tags$i(class = "fas fa-door-open"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "sub50_kpi_uh", class = "aurora-kpi-number text-cyan-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº Empreendimentos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-building"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "sub50_kpi_empreendimentos", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Empreendimentos Atendidos")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Valor Total Licitação"), tags$div(class = "aurora-kpi-icon text-purple-600 bg-purple-50", tags$i(class = "fas fa-file-invoice-dollar"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "sub50_kpi_licitacao", class = "aurora-kpi-number text-purple-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Orçamento Licitado")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Obras"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-coins"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "sub50_kpi_contrapartida", class = "aurora-kpi-number text-teal-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Não Incidentes")
              )
            ),
            
            # HIERARQUIA 7: PROGRAMA MORAR BEM PE — RETOMADAS
            tags$div(
              class = "d-flex align-items-center gap-2 mb-2 mt-4",
              tags$i(class = "fas fa-arrows-rotate text-rose-600"),
              tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Morar Bem PE — Retomadas de Obras Paralisadas")
            ),
            tags$div(
              class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Quantidade de UH"), tags$div(class = "aurora-kpi-icon text-rose-600 bg-rose-50", tags$i(class = "fas fa-door-open"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "retomadas_kpi_uh", class = "aurora-kpi-number text-rose-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Unidades Habitacionais")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Nº Empreendimentos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-building"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "retomadas_kpi_empreendimentos", class = "aurora-kpi-number text-blue-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Reiniciadas")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Recurso Federal"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-landmark-flag"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "retomadas_kpi_recurso_federal", class = "aurora-kpi-number text-emerald-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Repasse da União")
              ),
              tags$div(
                class = "aurora-kpi-card",
                tags$div(class = "aurora-kpi-header", tags$span("Contrapartida Obras"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-coins"))),
                tags$div(class = "aurora-kpi-body", tags$span(id = "retomadas_kpi_contrapartida", class = "aurora-kpi-number text-amber-700", "-")),
                tags$div(class = "aurora-kpi-footer", "Obras Não Incidentes")
              )
            )
          ),
          
          # =========================================================================
          # HIERARQUIA 8: REGULARIZAÇÃO FUNDIÁRIA (REURB / PERPART) - SEMPRE VISÍVEL
          # =========================================================================
          tags$div(
            class = "d-flex align-items-center gap-2 mb-2 mt-4 pt-2 border-t border-slate-100",
            tags$i(class = "fas fa-file-signature text-blue-600"),
            tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Regularização Fundiária e Títulos de Propriedade (PERPART / REURB)")
          ),
          
          # Grid Principal de Regularização
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-6 gap-3 mb-3",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Títulos Previstos"), tags$div(class = "aurora-kpi-icon text-slate-600 bg-slate-50", tags$i(class = "fas fa-folder-open"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_previstos", class = "aurora-kpi-number text-slate-800", "-")),
              tags$div(class = "aurora-kpi-footer", "Meta Total Planejada")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Títulos Entregues"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-certificate"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_entregues", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Situação: Realizados")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Andamento"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-clock-rotate-left"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_andamento", class = "aurora-kpi-number text-amber-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Processos em Tramitação")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Titularidade Feminina"), tags$div(class = "aurora-kpi-icon text-pink-600 bg-pink-50", tags$i(class = "fas fa-person-dress"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_mulheres", class = "aurora-kpi-number text-pink-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "reurb_kpi_mulheres_pct", "0% do total"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Núcleos Urbanos (NC)"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-pin"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_nucleos", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Comunidades / Poligonais")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-city"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_municipios", class = "aurora-kpi-number text-teal-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Cobertura Territorial")
            )
          ),
          
          # Grid Secundário: Tipos de Classificação da Regularização
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-4 gap-3 mb-5",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("REGMEL"), tags$div(class = "aurora-kpi-icon text-indigo-600 bg-indigo-50", tags$i(class = "fas fa-house-user"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_classif_regmel", class = "aurora-kpi-number text-indigo-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "reurb_kpi_classif_regmel_desc", "Previstos / Entregues (0%)"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Regularização Fundiária"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_classif_fundiaria", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "reurb_kpi_classif_fundiaria_desc", "Previstos / Entregues (0%)"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("REURB"), tags$div(class = "aurora-kpi-icon text-purple-600 bg-purple-50", tags$i(class = "fas fa-file-shield"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_classif_reurb", class = "aurora-kpi-number text-purple-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "reurb_kpi_classif_reurb_desc", "Previstos / Entregues (0%)"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Imobiliária"), tags$div(class = "aurora-kpi-icon text-cyan-600 bg-cyan-50", tags$i(class = "fas fa-building-circle-check"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "reurb_kpi_classif_imobiliaria", class = "aurora-kpi-number text-cyan-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "reurb_kpi_classif_imobiliaria_desc", "Previstos / Entregues (0%)"))
            )
          ),
          
          # CABEÇALHO DO MAPA, CONTROLES E LEGENDAS
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Cobertura Territorial e Empreendimentos"),
              tags$span(id = "habitacao_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Todos os Empreendimentos e Ações de REURB")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_hab_todos",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.filtrarHabitacaoTipo('todos', this)",
                  tags$i(class = "fas fa-border-all me-1.5"), "Visão Geral"
                ),
                tags$button(
                  id = "btn_visao_hab_construcao",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.filtrarHabitacaoTipo('construcao', this)",
                  tags$i(class = "fas fa-house-chimney me-1.5 text-teal-600"), "Morar Bem PE"
                ),
                tags$button(
                  id = "btn_visao_hab_reg",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.filtrarHabitacaoTipo('regularizacao', this)",
                  tags$i(class = "fas fa-file-signature me-1.5 text-blue-600"), "Regularização (REURB)"
                )
              ),
              tags$div(
                id = "legenda_visao_habitacao",
                class = "d-flex align-items-center gap-1.5 flex-wrap",
                tags$span(class = "badge bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs", "● Entregue / Titulado"),
                tags$span(class = "badge bg-amber-100 text-amber-800 border border-amber-300 text-xs", "● Em Obras / Processamento"),
                tags$span(class = "badge bg-blue-100 text-blue-800 border border-blue-300 text-xs", "● Em Planejamento / Projeto")
              )
            )
          ),
          
          # GRID DO MAPA COM BOX LATERAL DIREITO (HOVER DINÂMICO)
          tags$div(
            class = "row g-3 mb-5",
            tags$div(
              class = "col-lg-8 col-xl-8",
              tags$div(
                class = "position-relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-100",
                style = "min-height: 520px;",
                tags$div(
                  id = "resumo_habitacao_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10 d-none",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_habitacao_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "habitacao_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                
                tags$div(
                  id = "habitacao_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-map-location-dot")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento Territorial"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou empreendimentos habitacionais no mapa para visualizar os indicadores locais."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(id = "hab_box_stat_muns", class = "text-sm font-black text-slate-700", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Unidades"),
                             tags$span(id = "hab_box_stat_unidades", class = "text-sm font-black text-teal-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Títulos REURB"),
                             tags$span(id = "hab_box_stat_titulos", class = "text-sm font-black text-blue-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Investimento"),
                             tags$span(id = "hab_box_stat_investimento", class = "text-sm font-black text-purple-600", "-")
                    )
                  )
                ),
                tags$div(
                  id = "habitacao_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # SEÇÃO DE GRÁFICOS ANALÍTICOS PADRONIZADOS
          tags$div(
            class = "mt-4 pt-4 border-t border-slate-100",
            tags$div(
              class = "row g-4 mb-5",
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Status das Obras Habitacionais"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Distribuição das unidades habitacionais por estágio de execução")
                    ),
                    tags$span(class = "badge bg-teal-100 text-teal-800 text-xs font-bold rounded-pill px-2.5 py-1", "Morar Bem PE")
                  ),
                  tags$div(id = "chart_habitacao_status", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Habitação e REURB por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top municípios com maior volume de unidades e títulos")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_habitacao_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # TABELA DETALHADA COM CONTROLES DE FILTRO
          tags$div(
            class = "mt-4 pt-3 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Portfólio de Projetos e Empreendimentos de Habitação"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Relação de conjuntos habitacionais, convênios de regularização e municípios atendidos")
              ),
              tags$div(
                id = "habitacao_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-pill", id = "habitacao_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroHabitacao()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "tabela_habitacao_pe", class = "table table-hover w-100 text-sm")
            )
          )
        )
      ) # Fim do resumo_pauta_habitacao

    ) # Fim container-fluid
  ) # Fim tab-pane
}