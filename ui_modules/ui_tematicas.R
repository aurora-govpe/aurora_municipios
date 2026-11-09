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
            id = "btn_pauta_resumo_obras",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('obras', this)",
            tags$i(class = "fas fa-helmet-safety me-1.5 text-[#ff5a26]"), "Obras e Equipamentos Públicos"
          ),
          tags$button(
            id = "btn_pauta_resumo_creches",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('creches', this)",
            tags$i(class = "fas fa-shapes me-1.5 text-rose-500"), "Creches e Educação Infantil"
          ),
          # NOVO BOTÃO: EDUCAÇÃO / TRANSPORTE ESCOLAR
          tags$button(
            id = "btn_pauta_resumo_educacao",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('educacao', this)",
            tags$i(class = "fas fa-bus-school me-1.5 text-yellow-500"), "Educação (Transporte Escolar)"
          ),
          tags$button(
            id = "btn_pauta_resumo_iluminacao",
            class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
            onclick = "window.alternarPautaResumos('iluminacao', this)",
            tags$i(class = "fas fa-lightbulb me-1.5 text-emerald-500"), "Eficiência Energética e Sustentabilidade"
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
          
          # =========================================================================
          # KPIS: PROGRAMA CHAPÉU DE PALHA
          # =========================================================================
          tags$div(class = "d-flex align-items-center gap-2 mb-2 mt-4",
                   tags$i(class = "fas fa-wheat-awn text-amber-600"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Programa Chapéu de Palha (Apoio aos Trabalhadores Rurais e Pesca)")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Beneficiários Totais"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-users"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "pcp_kpi_beneficiarios", class = "aurora-kpi-number text-amber-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Trabalhadores Atendidos")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Recurso Pago"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "pcp_kpi_valor_pago", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Transferência Concluída")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "pcp_kpi_municipios", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "pcp_kpi_rds", "RDs Atendidas"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Cana-de-Açúcar"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-seedling"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "pcp_kpi_cana", class = "aurora-kpi-number text-slate-800", "-")),
              tags$div(class = "aurora-kpi-footer", "Zona da Mata")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Fruticultura e Pesca"), tags$div(class = "aurora-kpi-icon text-cyan-600 bg-cyan-50", tags$i(class = "fas fa-apple-whole"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "pcp_kpi_fruta_pesca", class = "aurora-kpi-number text-cyan-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "pcp_kpi_fruta_pesca_desc", "Fruta e Pesca Artesanal"))
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
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1 flex-wrap",
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
                # BOTÃO CHAPÉU DE PALHA AO LADO DE MÃES DE PE
                tags$button(
                  id = "btn_visao_sem_fome_pcp",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoSemFome('pcp', this)",
                  tags$i(class = "fas fa-wheat-awn me-1.5 text-amber-600"), "Chapéu de Palha"
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
              # LEGENDA CHAPÉU DE PALHA
              tags$div(
                id = "legenda_visao_pcp",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Beneficiários PCP:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fef3c7; color: #92400e;", "1 - 100"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f59e0b;", "100 - 500"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #d97706;", "500 - 1.500"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #78350f;", "> 1.500")
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
      # BLOCO PAUTA: OBRAS E EQUIPAMENTOS PÚBLICOS (ESTRUTURA COMPLETA)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_obras",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          # Título do Bloco
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-orange-50 text-[#c2410c] border border-orange-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "INFRAESTRUTURA & EQUIPAMENTOS"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Obras Públicas e Equipamentos Estruturadores")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-helmet-safety text-[#ff5a26] me-1"), "SEDUH - CEHAB • Governo de Pernambuco"
            )
          ),
          
          # 1. PANORAMA CONSOLIDADO DE OBRAS (KPIS)
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-trowel-bricks text-[#ff5a26]"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Panorama Consolidado de Obras e Equipamentos")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-6 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total de Obras"), tags$div(class = "aurora-kpi-icon text-slate-500", tags$i(class = "fas fa-trowel-bricks"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_total", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Contratos Registrados")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Execução"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-person-digging"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_execucao", class = "aurora-kpi-number text-amber-600", "-")),
              tags$div(class = "aurora-kpi-footer", "Canteiros Ativos")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Concluídas"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-circle-check"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_concluidas", class = "aurora-kpi-number text-emerald-600", "-")),
              tags$div(class = "aurora-kpi-footer", "Obras Entregues")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_investimento", class = "aurora-kpi-number text-blue-600", "-")),
              tags$div(class = "aurora-kpi-footer", "Volume Contratual Global")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Exec. Física Média"), tags$div(class = "aurora-kpi-icon text-slate-900 bg-purple-50", tags$i(class = "fas fa-chart-line"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_exec_media", class = "aurora-kpi-number text-purple-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Avanço Físico Médio")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "obras_kpi_municipios", class = "aurora-kpi-number text-teal-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Cobertura Estadual")
            )
          ),
          
          # CABEÇALHO DO MAPA, CONTROLES E LEGENDAS
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Distribuição Territorial de Obras"),
              tags$span(id = "obras_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Localização e Clusters de Canteiros")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_obras_todos",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoObras('todos', this)",
                  tags$i(class = "fas fa-circle-nodes me-1.5"), "Visão Geral (Clusters)"
                ),
                tags$button(
                  id = "btn_visao_obras_andamento",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoObras('andamento', this)",
                  tags$i(class = "fas fa-person-digging me-1.5 text-amber-600"), "Em Execução"
                ),
                tags$button(
                  id = "btn_visao_obras_investimento",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoObras('investimento', this)",
                  tags$i(class = "fas fa-sack-dollar me-1.5 text-emerald-600"), "Investimento (R$)"
                ),
                tags$button(
                  id = "btn_visao_obras_pontos",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoObras('pontos', this)",
                  tags$i(class = "fas fa-building me-1.5 text-blue-600"), "Qtd. de Obras"
                )
              ),
              
              # Legenda: Clusters (Visão Geral)
              tags$div(
                id = "legenda_obras_cluster",
                class = "d-flex align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Volume Agrupado:"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f59e0b;", "< 10"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #ea580c;", "10 - 50"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #c2410c;", "> 50")
              ),
              
              # Legenda: Obras em Andamento
              tags$div(
                id = "legenda_obras_andamento",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Obras em Execução:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fffbeb; color: #92400e;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #fde68a; color: #78350f;", "< 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f59e0b;", "5 - 20"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #b45309;", "> 20")
              ),
              
              # Legenda: Investimento
              tags$div(
                id = "legenda_obras_investimento",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Investimento Total:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #f0fdf4; color: #166534;", "R$ 0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #86efac; color: #14532d;", "< R$ 5M"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #22c55e;", "R$ 5M - 20M"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #15803d;", "> R$ 20M")
              ),
              
              # Legenda: Quantidade Total
              tags$div(
                id = "legenda_obras_pontos",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Total de Obras:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #eff6ff; color: #1e40af;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #93c5fd; color: #1e3a8a;", "1 - 3"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #3b82f6;", "4 - 10"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #1d4ed8;", "> 10")
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
                  id = "resumo_obras_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10 d-none",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_obras_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "obras_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                
                tags$div(
                  id = "obras_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-orange-100 text-[#ff5a26] flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-map-location-dot")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento Territorial"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou canteiros de obras no mapa para visualizar os indicadores locais em tempo real."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(id = "obras_box_stat_muns", class = "text-sm font-black text-slate-700", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Obras Ativas"),
                             tags$span(id = "obras_box_stat_ativas", class = "text-sm font-black text-amber-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Concluídas"),
                             tags$span(id = "obras_box_stat_concluidas", class = "text-sm font-black text-emerald-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Investimento"),
                             tags$span(id = "obras_box_stat_investimento", class = "text-sm font-black text-blue-600", "-")
                    )
                  )
                ),
                tags$div(
                  id = "obras_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # SEÇÃO DE GRÁFICOS ANALÍTICOS (DONUT DE STATUS & TOP 20 MUNICÍPIOS)
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
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Status das Obras Públicas"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Distribuição das obras por estágio de execução")
                    ),
                    tags$span(class = "badge bg-orange-100 text-[#c2410c] text-xs font-bold rounded-pill px-2.5 py-1", "Obras SEDUH/CEHAB")
                  ),
                  tags$div(id = "chart_obras_status", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Obras e Investimentos por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top municípios com maior volume de obras e investimento")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_obras_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # TABELA COMPLETA COM FILTRO DE MUNICÍPIO
          tags$div(
            class = "mt-4 pt-3 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Carteira Detalhada de Obras Públicas"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Relação de contratos, intervenções, status executivo e investimento contratado")
              ),
              tags$div(
                id = "obras_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-orange-100 text-[#c2410c] font-bold px-3 py-1.5 rounded-pill", id = "obras_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroObras()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "resumo_obras_tabela", class = "table table-hover align-middle w-100 text-sm")
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA: CRECHES E EDUCAÇÃO INFANTIL (SEDUH / CEHAB / SEE)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_creches",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          # Cabeçalho do Bloco
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-rose-50 text-rose-700 border border-rose-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "PRIMEIRA INFÂNCIA & EDUCAÇÃO"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Creches e Pré-Escola")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-shapes text-rose-500 me-1"), "SEDUH / CEHAB / SEE • Governo de Pernambuco"
            )
          ),
          
          # KPIS: CRECHES
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-child-reaching text-rose-500"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Panorama de Obras de Creches e Educação Infantil")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Total de Creches"), tags$div(class = "aurora-kpi-icon text-slate-500", tags$i(class = "fas fa-school"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "creches_kpi_total", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Unidades Contratadas")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Em Execução"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-person-digging"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "creches_kpi_execucao", class = "aurora-kpi-number text-amber-600", "-")),
              tags$div(class = "aurora-kpi-footer", "Canteiros Ativos")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Concluídas"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-circle-check"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "creches_kpi_concluidas", class = "aurora-kpi-number text-emerald-600", "-")),
              tags$div(class = "aurora-kpi-footer", "Entregues à População")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-rose-600 bg-rose-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "creches_kpi_investimento", class = "aurora-kpi-number text-rose-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Aporte Contratual Global")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "creches_kpi_municipios", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Cobertura Territorial")
            )
          ),
          
          # CABEÇALHO DO MAPA, CONTROLES E LEGENDAS
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa Territorial de Creches e Pré-Escolas"),
              tags$span(id = "creches_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Localização e Clusters de Creches")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_creches_todos",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoCreches('todos', this)",
                  tags$i(class = "fas fa-circle-nodes me-1.5"), "Visão Geral (Clusters)"
                ),
                tags$button(
                  id = "btn_visao_creches_andamento",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoCreches('andamento', this)",
                  tags$i(class = "fas fa-person-digging me-1.5 text-amber-600"), "Em Execução"
                ),
                tags$button(
                  id = "btn_visao_creches_pontos",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoCreches('pontos', this)",
                  tags$i(class = "fas fa-school me-1.5 text-rose-500"), "Qtd. por Município"
                )
              ),
              tags$div(
                id = "legenda_creches_cluster",
                class = "d-flex align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Volume Agrupado:"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f43f5e;", "< 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #e11d48;", "5 - 15"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #9f1239;", "> 15")
              ),
              tags$div(
                id = "legenda_creches_andamento",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Creches em Obras:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fff1f2; color: #9f1239;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #fda4af; color: #881337;", "1"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f43f5e;", "2 - 4"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #9f1239;", "> 4")
              ),
              tags$div(
                id = "legenda_creches_pontos",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Total de Creches:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fff1f2; color: #9f1239;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #fecdd3; color: #881337;", "1 - 2"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f43f5e;", "3 - 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #881337;", "> 5")
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
                  id = "resumo_creches_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10 d-none",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_creches_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "creches_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                
                tags$div(
                  id = "creches_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-shapes")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento de Creches"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou canteiros de creches no mapa para visualizar os indicadores."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(id = "creches_box_stat_muns", class = "text-sm font-black text-slate-700", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Em Obras"),
                             tags$span(id = "creches_box_stat_ativas", class = "text-sm font-black text-amber-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Concluídas"),
                             tags$span(id = "creches_box_stat_concluidas", class = "text-sm font-black text-emerald-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Investimento"),
                             tags$span(id = "creches_box_stat_investimento", class = "text-sm font-black text-rose-600", "-")
                    )
                  )
                ),
                tags$div(
                  id = "creches_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # GRÁFICOS: STATUS & TOP 20
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
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Status das Obras de Creches"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Distribuição das unidades por estágio de execução")
                    ),
                    tags$span(class = "badge bg-rose-100 text-rose-800 text-xs font-bold rounded-pill px-2.5 py-1", "Educação Infantil")
                  ),
                  tags$div(id = "chart_creches_status", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Creches por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top municípios com maior número de creches pactuadas")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_creches_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # TABELA COM FILTRO
          tags$div(
            class = "mt-4 pt-3 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Carteira Detalhada de Creches e Pré-Escolas"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Relação de canteiros, contratos, avanço físico e investimento")
              ),
              tags$div(
                id = "creches_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-rose-100 text-rose-800 font-bold px-3 py-1.5 rounded-pill", id = "creches_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroCreches()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "resumo_creches_tabela", class = "table table-hover align-middle w-100 text-sm")
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA: EDUCAÇÃO (TRANSPORTE ESCOLAR - ÔNIBUS E VANS)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_educacao",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          # Cabeçalho do Bloco
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-amber-50 text-amber-800 border border-amber-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "TRANSPORTE ESCOLAR & ACESSIBILIDADE"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Frota Escolar: Aquisição e Entrega de Ônibus e Vans")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-bus text-amber-500 me-1"), "SEE • Governo de Pernambuco"
            )
          ),
          
          # KPIS CONSOLIDADOS
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-bus-simple text-amber-600"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Frota Municipal de Transporte Escolar")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Frota Total"), tags$div(class = "aurora-kpi-icon text-amber-600 bg-amber-50", tags$i(class = "fas fa-bus"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "transp_kpi_total", class = "aurora-kpi-number text-amber-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Veículos Entregues")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Ônibus Escolares"), tags$div(class = "aurora-kpi-icon text-yellow-600 bg-yellow-50", tags$i(class = "fas fa-bus-simple"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "transp_kpi_onibus", class = "aurora-kpi-number text-yellow-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Ônibus Padronizados")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Vans Escolares"), tags$div(class = "aurora-kpi-icon text-sky-600 bg-sky-50", tags$i(class = "fas fa-van-shuttle"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "transp_kpi_vans", class = "aurora-kpi-number text-sky-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Transporte Complementar")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "transp_kpi_investimento", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Recurso Estadual Aplicado")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-map-location-dot"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "transp_kpi_municipios", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", "100% dos Territórios")
            )
          ),
          
          # CABEÇALHO DO MAPA, CONTROLES E LEGENDAS
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Cobertura da Frota Escolar por Município"),
              tags$span(id = "educacao_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Total de Veículos Entregues (Ônibus + Vans)")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_transp_total",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoEducacao('total', this)",
                  tags$i(class = "fas fa-bus-simple me-1.5"), "Total de Veículos"
                ),
                tags$button(
                  id = "btn_visao_transp_onibus",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoEducacao('onibus', this)",
                  tags$i(class = "fas fa-bus me-1.5 text-yellow-600"), "Apenas Ônibus"
                ),
                tags$button(
                  id = "btn_visao_transp_vans",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoEducacao('vans', this)",
                  tags$i(class = "fas fa-van-shuttle me-1.5 text-sky-600"), "Apenas Vans"
                )
              ),
              tags$div(
                id = "legenda_transp_total",
                class = "d-flex align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Veículos:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fef3c7; color: #92400e;", "< 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f59e0b;", "5 - 10"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #d97706;", "10 - 20"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #78350f;", "> 20")
              ),
              tags$div(
                id = "legenda_transp_onibus",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Ônibus:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fef9c3; color: #854d0e;", "< 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #eab308;", "5 - 10"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #ca8a04;", "10 - 15"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #713f12;", "> 15")
              ),
              tags$div(
                id = "legenda_transp_vans",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Vans:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #f0f9ff; color: #075985;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #38bdf8;", "1"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #0284c7;", "2 - 3"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #0c4a6e;", "> 3")
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
                  id = "resumo_educacao_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10 d-none",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_educacao_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "educacao_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                
                tags$div(
                  id = "educacao_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-bus-school")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento da Frota Escolar"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou clique em um para fixar as informações."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(id = "educacao_box_stat_muns", class = "text-sm font-black text-slate-700", "185")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Ônibus"),
                             tags$span(id = "educacao_box_stat_onibus", class = "text-sm font-black text-yellow-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Vans"),
                             tags$span(id = "educacao_box_stat_vans", class = "text-sm font-black text-sky-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Investimento"),
                             tags$span(id = "educacao_box_stat_investimento", class = "text-sm font-black text-emerald-600", "-")
                    )
                  )
                ),
                tags$div(
                  id = "educacao_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # GRÁFICOS: COMPOSIÇÃO DA FROTA & TOP 20 MUNICÍPIOS
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
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Composição da Frota Escolar"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Distribuição entre Ônibus e Vans Escolares")
                    ),
                    tags$span(class = "badge bg-amber-100 text-amber-800 text-xs font-bold rounded-pill px-2.5 py-1", "Frota SEE")
                  ),
                  tags$div(id = "chart_educacao_composicao", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Frota Escolar por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top 20 municípios com maior quantidade de veículos entregues")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_educacao_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # TABELA COM FILTRO
          tags$div(
            class = "mt-4 pt-3 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Detalhamento da Entrega de Ônibus e Vans por Município"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Relação de municípios, quantidades de ônibus e vans entregues e valor total investido")
              ),
              tags$div(
                id = "educacao_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-pill", id = "educacao_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroEducacao()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "resumo_educacao_tabela", class = "table table-hover align-middle w-100 text-sm")
            )
          )
        )
      ),
      
      # =========================================================================
      # BLOCO PAUTA: EFICIÊNCIA ENERGÉTICA E SUSTENTABILIDADE (ILUMINA PE)
      # =========================================================================
      tags$div(
        id = "resumo_pauta_iluminacao",
        class = "resumo-pauta-bloco d-none",
        
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5 mb-5",
          
          # Cabeçalho do Bloco
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100",
            tags$div(
              tags$span(class = "badge bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-pill px-3 py-1 text-xs font-bold mb-1", "ILUMINAÇÃO PÚBLICA & SUSTENTABILIDADE"),
              tags$h4(class = "font-black text-slate-800 text-lg md:text-xl mb-0 tracking-tight", "Programa Ilumina Pernambuco (Modernização LED e Eficiência Energética)")
            ),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs rounded-pill font-bold",
                      tags$i(class = "fas fa-lightbulb text-emerald-500 me-1"), "SEDUH - SEDU • Governo de Pernambuco"
            )
          ),
          
          # KPIS CONSOLIDADOS
          tags$div(class = "d-flex align-items-center gap-2 mb-2",
                   tags$i(class = "fas fa-bolt text-emerald-600"),
                   tags$h6(class = "font-bold text-slate-700 text-xs uppercase tracking-wider mb-0", "Panorama de Modernização do Parque de Iluminação")
          ),
          tags$div(
            class = "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Pontos Executados"), tags$div(class = "aurora-kpi-icon text-emerald-600 bg-emerald-50", tags$i(class = "fas fa-lightbulb"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "ilumina_kpi_pontos_exec", class = "aurora-kpi-number text-emerald-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Lâmpadas/Pontos em LED")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Pontos Previstos"), tags$div(class = "aurora-kpi-icon text-slate-500", tags$i(class = "fas fa-bullseye"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "ilumina_kpi_pontos_prev", class = "aurora-kpi-number", "-")),
              tags$div(class = "aurora-kpi-footer", "Meta Contratada")
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Taxa de Execução"), tags$div(class = "aurora-kpi-icon text-teal-600 bg-teal-50", tags$i(class = "fas fa-chart-pie"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "ilumina_kpi_taxa_exec", class = "aurora-kpi-number text-teal-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "ilumina_kpi_etapas", "Avanço Físico Global"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Investimento Total"), tags$div(class = "aurora-kpi-icon text-blue-600 bg-blue-50", tags$i(class = "fas fa-hand-holding-dollar"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "ilumina_kpi_investimento", class = "aurora-kpi-number text-blue-700", "-")),
              tags$div(class = "aurora-kpi-footer", tags$span(id = "ilumina_kpi_pago_sub", "Valor Contratado"))
            ),
            tags$div(
              class = "aurora-kpi-card",
              tags$div(class = "aurora-kpi-header", tags$span("Municípios Atendidos"), tags$div(class = "aurora-kpi-icon text-indigo-600 bg-indigo-50", tags$i(class = "fas fa-city"))),
              tags$div(class = "aurora-kpi-body", tags$span(id = "ilumina_kpi_municipios", class = "aurora-kpi-number text-indigo-700", "-")),
              tags$div(class = "aurora-kpi-footer", "Cobertura Territorial")
            )
          ),
          
          # CABEÇALHO DO MAPA, CONTROLES E LEGENDAS
          tags$div(
            class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pt-2 border-t border-slate-100",
            tags$div(
              tags$h5(class = "font-bold text-slate-700 text-sm md:text-base mb-0", "Mapa de Cobertura e Canteiros do Ilumina PE"),
              tags$span(id = "iluminacao_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Localização e Clusters de Contratos de Iluminação")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_ilumina_todos",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoIluminacao('todos', this)",
                  tags$i(class = "fas fa-circle-nodes me-1.5"), "Visão Geral (Clusters)"
                ),
                tags$button(
                  id = "btn_visao_ilumina_pontos_exec",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoIluminacao('pontos_exec', this)",
                  tags$i(class = "fas fa-lightbulb me-1.5 text-emerald-600"), "Pontos Instalados"
                ),
                tags$button(
                  id = "btn_visao_ilumina_investimento",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoIluminacao('investimento', this)",
                  tags$i(class = "fas fa-sack-dollar me-1.5 text-blue-600"), "Investimento (R$)"
                )
              ),
              tags$div(
                id = "legenda_ilumina_cluster",
                class = "d-flex align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Volume Agrupado:"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #10b981;", "< 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #059669;", "5 - 15"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #047857;", "> 15")
              ),
              tags$div(
                id = "legenda_ilumina_pontos_exec",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Pontos LED:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #f0fdf4; color: #166534;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #86efac; color: #14532d;", "< 300"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #22c55e;", "300 - 800"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #15803d;", "> 800")
              ),
              tags$div(
                id = "legenda_ilumina_investimento",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Investimento:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #eff6ff; color: #1e40af;", "R$ 0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #93c5fd; color: #1e3a8a;", "< R$ 300 mil"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #3b82f6;", "R$ 300k - 700k"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #1d4ed8;", "> R$ 700 mil")
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
                  id = "resumo_iluminacao_spinner",
                  class = "position-absolute top-0 start-0 w-100 h-100 bg-white/75 d-flex align-items-center justify-content-center z-10 d-none",
                  tags$div(class = "spinner-border text-primary", role = "status")
                ),
                tags$div(id = "resumo_iluminacao_map", style = "width: 100%; height: 100%; min-height: 520px; background-color: #f8fafc;")
              )
            ),
            tags$div(
              class = "col-lg-4 col-xl-4",
              tags$div(
                id = "iluminacao_hover_box",
                class = "bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-sm h-100 d-flex flex-column justify-content-between",
                style = "min-height: 520px; max-height: 520px; overflow-y: auto;",
                
                tags$div(
                  id = "iluminacao_box_content_default",
                  class = "text-center py-4 my-auto",
                  tags$div(
                    class = "w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner",
                    tags$i(class = "fas fa-lightbulb")
                  ),
                  tags$h5(class = "font-black text-slate-800 text-base mb-1", "Detalhamento de Iluminação"),
                  tags$p(class = "text-xs text-slate-500 mb-3 px-2 leading-relaxed", "Passe o cursor sobre os municípios ou canteiros no mapa para inspecionar os indicadores locais."),
                  tags$div(
                    class = "grid grid-cols-2 gap-2 text-left pt-3 border-t border-slate-200/80",
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Municípios"),
                             tags$span(id = "ilumina_box_stat_muns", class = "text-sm font-black text-slate-700", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Pontos LED"),
                             tags$span(id = "ilumina_box_stat_exec", class = "text-sm font-black text-emerald-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Previstos"),
                             tags$span(id = "ilumina_box_stat_prev", class = "text-sm font-black text-slate-600", "-")
                    ),
                    tags$div(class = "bg-white p-2.5 rounded-xl border border-slate-200 text-center",
                             tags$span(class = "text-[10px] font-bold text-slate-400 uppercase block", "Investimento"),
                             tags$span(id = "ilumina_box_stat_investimento", class = "text-sm font-black text-blue-600", "-")
                    )
                  )
                ),
                tags$div(
                  id = "iluminacao_box_content_active",
                  class = "d-none flex-column h-100"
                )
              )
            )
          ),
          
          # GRÁFICOS ANALÍTICOS (STATUS & TOP 20)
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
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Status das Obras de Iluminação"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Distribuição das etapas por estágio de execução")
                    ),
                    tags$span(class = "badge bg-emerald-100 text-emerald-800 text-xs font-bold rounded-pill px-2.5 py-1", "Ilumina PE")
                  ),
                  tags$div(id = "chart_iluminacao_status", style = "width: 100%; height: 380px;")
                )
              ),
              tags$div(
                class = "col-lg-6",
                tags$div(
                  class = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-100",
                  tags$div(
                    class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
                    tags$div(
                      tags$h5(class = "font-bold text-slate-800 text-sm md:text-base mb-0", "Pontos de LED por Município"),
                      tags$span(class = "text-xs text-slate-400 font-semibold", "Top 20 municípios com maior quantidade de pontos executados")
                    ),
                    tags$span(class = "badge bg-slate-100 text-slate-700 text-xs font-bold rounded-pill px-2.5 py-1", "Top 20 Municípios")
                  ),
                  tags$div(id = "chart_iluminacao_por_mun", style = "width: 100%; height: 380px;")
                )
              )
            )
          ),
          
          # TABELA COM FILTRO
          tags$div(
            class = "mt-4 pt-3 border-t border-slate-100",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2",
              tags$div(
                tags$h5(class = "font-black text-slate-800 text-base mb-0", "Carteira Detalhada do Ilumina Pernambuco"),
                tags$p(class = "text-xs text-slate-400 mb-0", "Relação de etapas, contratos, pontos executados vs. previstos e valores")
              ),
              tags$div(
                id = "iluminacao_filtro_ativo_badge_container",
                class = "d-none align-items-center gap-2",
                tags$span(class = "badge bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-pill", id = "iluminacao_filtro_ativo_badge", "Filtro Ativo"),
                tags$button(
                  class = "btn btn-outline-secondary btn-sm rounded-pill font-bold text-xs py-0.5 px-2",
                  onclick = "window.limparFiltroIluminacao()",
                  "Limpar Filtro"
                )
              )
            ),
            tags$div(
              class = "table-responsive",
              tags$table(id = "resumo_iluminacao_tabela", class = "table table-hover align-middle w-100 text-sm")
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
                      tags$i(class = "fas fa-house-chimney text-teal-600 me-1"), "SEDUH - SEHAB/ PERPART • Governo de Pernambuco"
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
          
          # BOTÃO RETRÁTIL POSICIONADO ABAIXO DOS KPIS DE MORADIA
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
          
          # CONTEÚDO EXPANSÍVEL: MODALIDADES HABITACIONAIS
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
              tags$span(id = "habitacao_camada_label", class = "text-xs text-slate-400 font-semibold", "Exibindo: Clusters de Empreendimentos e Obras")
            ),
            tags$div(
              class = "d-flex align-items-center gap-3 flex-wrap",
              tags$div(
                class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
                tags$button(
                  id = "btn_visao_hab_todos",
                  class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
                  onclick = "window.alternarVisaoHabitacao('todos', this)",
                  tags$i(class = "fas fa-circle-nodes me-1.5"), "Visão Geral (Clusters)"
                ),
                tags$button(
                  id = "btn_visao_hab_morarbem",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoHabitacao('morarbem', this)",
                  tags$i(class = "fas fa-house-chimney me-1.5 text-teal-600"), "Morar Bem (Obras)"
                ),
                tags$button(
                  id = "btn_visao_hab_reurb",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoHabitacao('reurb', this)",
                  tags$i(class = "fas fa-file-signature me-1.5 text-blue-600"), "Regularização (Títulos)"
                ),
                tags$button(
                  id = "btn_visao_hab_pontos",
                  class = "btn btn-sm btn-light text-slate-600 rounded-pill px-3 py-1 font-bold text-xs transition-all",
                  onclick = "window.alternarVisaoHabitacao('pontos', this)",
                  tags$i(class = "fas fa-building me-1.5 text-amber-600"), "Empreendimentos"
                )
              ),
              
              # Legenda: Clusters (Visão Geral)
              tags$div(
                id = "legenda_hab_cluster",
                class = "d-flex align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Volume Agrupado:"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #51bbd6;", "< 10"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f1f075; color: #1e293b !important;", "10 - 50"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #f28cb1;", "> 50")
              ),
              
              # Legenda: UH (Morar Bem)
              tags$div(
                id = "legenda_hab_uh",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Unidades em Obras:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #f0fdfa; color: #115e59;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #5eead4; color: #042f2e;", "< 100"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #14b8a6;", "100 - 500"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #0f766e;", "> 500")
              ),
              
              # Legenda: REURB
              tags$div(
                id = "legenda_hab_reurb",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Títulos Entregues:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #eff6ff; color: #1e3a8a;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #93c5fd; color: #1e3a8a;", "< 200"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #3b82f6;", "200 - 1.000"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #1d4ed8;", "> 1.000")
              ),
              
              # Legenda: Quantidade de Empreendimentos
              tags$div(
                id = "legenda_hab_empreendimentos",
                class = "d-none align-items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-600",
                tags$span("Qtd. de Empreendimentos:"),
                tags$span(class = "badge px-2 py-0.5", style = "background-color: #fff7ed; color: #9a3412;", "0"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #fdba74; color: #7c2d12;", "1 - 2"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #fb923c;", "3 - 5"),
                tags$span(class = "badge text-white px-2 py-0.5", style = "background-color: #c2410c;", "> 5")
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
          # =========================================================================
          # SEÇÃO: TABELAS SEPARADAS DE HABITAÇÃO E REGULARIZAÇÃO FUNDIÁRIA
          # =========================================================================
          tags$div(
            class = "row g-4 mt-2",
            
            # TABELA 1: EMPREENDIMENTOS HABITACIONAIS
            tags$div(
              class = "col-12",
              tags$div(
                class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4",
                tags$div(
                  class = "d-flex justify-content-between align-items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2",
                  tags$div(
                    tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-0 text-base",
                            tags$i(class = "fas fa-city text-primary me-2"), "Empreendimentos Habitacionais (Habitação)"),
                    tags$p(class = "text-xs text-slate-500 font-semibold mb-0", "Projetos de novas habitações, FAR, FDS, Entrada Garantida e Reforma no Lar")
                  ),
                  tags$span(class = "badge bg-orange-100 text-orange-950 font-bold px-3 py-1 rounded-pill text-xs", "df_habitacao")
                ),
                tags$div(
                  class = "table-responsive",
                  tags$table(id = "tabela_tematicas_habitacao", class = "table table-hover align-middle w-100 text-xs")
                )
              )
            ),
            
            # TABELA 2: REGULARIZAÇÕES FUNDIÁRIAS (REURB)
            tags$div(
              class = "col-12",
              tags$div(
                class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4",
                tags$div(
                  class = "d-flex justify-content-between align-items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2",
                  tags$div(
                    tags$h5(class = "font-black text-slate-800 uppercase tracking-tight mb-0 text-base",
                            tags$i(class = "fas fa-certificate text-emerald-600 me-2"), "Regularização Fundiária e Títulos de Posse (REURB)"),
                    tags$p(class = "text-xs text-slate-500 font-semibold mb-0", "Núcleos urbanos informais consolidados, titulação e beneficiárias do programa")
                  ),
                  tags$span(class = "badge bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-pill text-xs", "df_regularizacoes")
                ),
                tags$div(
                  class = "table-responsive",
                  tags$table(id = "tabela_tematicas_regularizacao", class = "table table-hover align-middle w-100 text-xs")
                )
              )
            )
          )
        )
      ) 
    ) 
  ) 
}