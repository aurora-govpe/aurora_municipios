library(htmltools)

source("ui_modules/ui_landing.R")
source("ui_modules/ui_ficha.R")
source("ui_modules/ui_metadados.R")
source("ui_modules/ui_regioes.R")
source("ui_modules/ui_tematicas.R")
source("ui_modules/ui_ufs.R")

build_ui <- function() {
  
  html_head <- tags$head(
    tags$meta(charset = "utf-8"),
    tags$meta(name = "viewport", content = "width=device-width, initial-scale=1.0"),
    tags$title("Painel Aurora | Regiões de Pernambuco"),
    
    tags$script(src = "https://cdn.tailwindcss.com"),
    tags$link(rel = "stylesheet", href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"),
    tags$link(rel = "stylesheet", href = "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap"),
    tags$link(rel = "stylesheet", href = "style.css"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js", defer = NA),
    tags$script(src = "https://code.jquery.com/jquery-3.6.0.min.js"),
    tags$link(rel = "stylesheet", href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"),
    tags$link(rel = "stylesheet", href = "https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css"),
    tags$script(src = "https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"),
    tags$script(src = "https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"),
    tags$link(rel = "stylesheet", href = "https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/css/bootstrap-select.min.css"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/js/bootstrap-select.min.js"),
    tags$link(rel = "stylesheet", href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css"),
    tags$script(src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"),
    
    tags$link(rel = "stylesheet", href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js", defer = NA),
    
    tags$script(src = paste0("js/core.js?v=", as.numeric(Sys.time()))),
    tags$script(src = paste0("js/landing.js?v=", as.numeric(Sys.time()))),
    tags$script(src = paste0("js/ufs.js?v=", as.numeric(Sys.time()))),
    tags$script(src = paste0("js/ficha.js?v=", as.numeric(Sys.time()))),
    tags$script(src = paste0("js/regioes.js?v=", as.numeric(Sys.time()))),
    tags$script(src = paste0("js/app.js?v=", as.numeric(Sys.time())))
  )
  
  sidebar <- tags$nav(id = "aurora-sidebar", class = "d-none")
  
  topbar <- tags$header(
    class = "aurora-topbar d-flex justify-content-between align-items-center gap-2 px-3 py-2", style = "flex-wrap: nowrap; min-height: 54px;",
    
    tags$div(
      class = "d-flex align-items-center gap-3 flex-wrap",
      tags$div(
        class = "d-flex align-items-center gap-2 cursor-pointer select-none",
        onclick = "window.mudarAbaAurora('Início', null)",
        title = "Ir para o Início",
        tags$img(src = "images/aurora.png", class = "w-8 h-8 rounded-full border border-slate-200 shadow-xs object-cover"),
        tags$div(
          class = "d-none d-lg-flex flex-column",
          tags$span(class = "fw-black text-slate-800 leading-tight tracking-tight", style = "font-size: 0.95rem;", "Aurora"),
          tags$span(class = "text-[10px] text-slate-500 font-bold uppercase tracking-wider", "Pernambuco")
        )
      ),
      tags$div(class = "d-none d-lg-block vr my-1 bg-slate-300", style = "width: 1px; height: 24px;"),
      tags$div(
        class = "d-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1 d-print-none aurora-topbar-tabs",
        tags$button(
          class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm aurora-default-tab",
          onclick = "mudarAbaAurora('Início', this)",
          tags$i(class = "fas fa-house me-1"), "Início"
        ),
        tags$button(
          class = "btn btn-sm btn-light text-slate-700 rounded-pill px-3 py-1 font-bold text-xs border-0",
          onclick = "mudarAbaAurora('Regiões', this)",
          tags$i(class = "fas fa-map-location-dot me-1"), "Regiões"
        ),
        tags$button(
          class = "btn btn-sm btn-light text-slate-700 rounded-pill px-3 py-1 font-bold text-xs border-0",
          onclick = "mudarAbaAurora('Temáticas', this)",
          tags$i(class = "fas fa-layer-group me-1"), "Temáticas"
        ),
        tags$button(
          class = "btn btn-sm btn-light text-slate-700 rounded-pill px-3 py-1 font-bold text-xs border-0",
          onclick = "mudarAbaAurora('Municípios', this)",
          tags$i(class = "fas fa-city me-1"), "Municípios"
        ),
        tags$button(
          class = "btn btn-sm btn-light text-slate-700 rounded-pill px-3 py-1 font-bold text-xs border-0",
          onclick = "mudarAbaAurora('Comparativo UFs', this)",
          tags$i(class = "fas fa-chart-column me-1"), "Comparativo UFs"
        ),
        tags$button(
          class = "btn btn-sm btn-light text-slate-700 rounded-pill px-3 py-1 font-bold text-xs border-0",
          onclick = "mudarAbaAurora('Metadados', this)",
          tags$i(class = "fas fa-book me-1"), "Metadados"
        )
      )
    ),
    
    tags$div(
      class = "d-flex align-items-center gap-2 flex-nowrap d-print-none",
      
      # CONTROLES DA ABA UFs (Benchmarking)
      tags$div(
        id = "controles_ufs",
        class = "d-none align-items-center gap-2 flex-nowrap",
        tags$div(
          class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200",
          tags$i(class = "fas fa-flag text-primary"),
          tags$select(
            id = "ufs_f_uf", 
            class = "form-select form-select-sm fw-bold text-slate-700 bg-transparent border-0 shadow-none cursor-pointer focus:ring-0",
            style = "max-width: 170px; font-size: 0.85rem; outline: none; box-shadow: none;"
          )
        ),
        tags$div(
          class = "dropdown d-none d-md-block",
          tags$button(
            class = "btn btn-sm btn-white bg-white border border-slate-200 text-slate-700 fw-bold rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 shadow-sm",
            type = "button",
            `data-bs-toggle` = "dropdown",
            `aria-expanded` = "false",
            title = "Navegar pelos 5 Eixos do Benchmarking",
            style = "font-size: 0.8rem; height: 32px;",
            tags$i(class = "fas fa-compass text-primary", style = "font-size: 0.85rem;"),
            tags$span("Eixos"),
            tags$i(class = "fas fa-chevron-down text-slate-400 ms-1", style = "font-size: 0.65rem;")
          ),
          tags$ul(
            class = "dropdown-menu dropdown-menu-end shadow-xl border border-slate-200 py-2 text-xs rounded-2xl",
            style = "min-width: 250px; z-index: 1060;",
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_conhecimento')", tags$i(class = "fas fa-lightbulb text-warning w-4 text-center"), "1. Conhecimento e Inovação")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_seguranca')", tags$i(class = "fas fa-shield-halved text-danger w-4 text-center"), "2. Segurança e Cidadania")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_saude')", tags$i(class = "fas fa-heartbeat text-primary w-4 text-center"), "3. Saúde e Qualidade de Vida")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_sustentabilidade')", tags$i(class = "fas fa-tree text-success w-4 text-center"), "4. Desenvolvimento Sustentável")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_ufs_gestao')", tags$i(class = "fas fa-scale-balanced text-purple-700 w-4 text-center"), "5. Gestão e Transparência"))
          )
        )
      ),
      
      # CONTROLES DA ABA TEMÁTICAS (SELETOR DE PAUTA NO TOPBAR)
      tags$div(
        id = "controles_tematicas",
        class = "d-none align-items-center gap-2 flex-nowrap",
        tags$span(class = "text-xs font-bold text-slate-500 uppercase tracking-wider d-none d-sm-inline", "Pauta:"),
        tags$div(
          class = "d-inline-flex bg-slate-100 p-0.5 rounded-pill border border-slate-200",
          tags$button(
            id = "topbar_btn_pauta_cozinhas",
            type = "button",
            class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs btn-primary text-white shadow-xs",
            onclick = "window.alternarPautaResumos('cozinhas', this)",
            tags$i(class = "fas fa-utensils me-1 text-amber-500"), "PE sem Fome"
          ),
          tags$button(
            id = "topbar_btn_pauta_aguas",
            type = "button",
            class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
            onclick = "window.alternarPautaResumos('aguas', this)",
            tags$i(class = "fas fa-droplet me-1 text-blue-500"), "Águas"
          ),
          tags$button(
            id = "topbar_btn_pauta_capag",
            type = "button",
            class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
            onclick = "window.alternarPautaResumos('capag', this)",
            tags$i(class = "fas fa-building-columns me-1 text-purple-600"), "CAPAG"
          )
        )
      ),
      
      tags$div(
        id = "controles_regioes",
        class = "d-none align-items-center gap-2 flex-nowrap",
        # Pílula seletora do Tipo de Regionalização: RD vs Consórcios
        tags$div(
          class = "d-inline-flex bg-slate-100 p-0.5 rounded-pill border border-slate-200",
          tags$button(
            id = "regioes_btn_tipo_rd",
            type = "button",
            class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs shadow-xs btn-primary text-white",
            onclick = "window.trocarTipoAgrupamentoRegioes('rd')",
            title = "Filtrar por Região de Desenvolvimento",
            tags$i(class = "fas fa-layer-group me-1"), "RD"
          ),
          tags$button(
            id = "regioes_btn_tipo_consorcio",
            type = "button",
            class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs text-slate-600 bg-transparent border-0",
            onclick = "window.trocarTipoAgrupamentoRegioes('consorcio')",
            title = "Filtrar por Consórcios Intermunicipais",
            tags$i(class = "fas fa-handshake me-1"), "Consórcios"
          )
        ),
        # Seletor dinâmico de RD / Consórcio
        tags$div(
          class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200",
          tags$i(id = "regioes_filtro_icone", class = "fas fa-location-dot text-primary"),
          tags$select(
            id = "regioes_f_rd", 
            class = "form-select form-select-sm fw-bold text-slate-700 bg-transparent border-0 shadow-none cursor-pointer focus:ring-0",
            style = "max-width: 250px; font-size: 0.8rem; outline: none; box-shadow: none;"
          )
        ),
        tags$div(
          class = "d-none d-md-flex align-items-center gap-1 bg-slate-100 p-1 rounded-pill border border-slate-200",
          tags$button(class = "btn-nav-topbar", onclick = "window.scrollToSection('aba_regioes')", title = "Topo da Página", tags$i(class = "fas fa-arrow-up"))
        )
      ),
      
      tags$div(
        id = "controles_ficha_municipal",
        class = "d-none align-items-center gap-2 flex-nowrap",
        tags$div(
          class = "d-flex align-items-center gap-2 bg-slate-100 rounded-pill px-3 py-1 border border-slate-200",
          tags$i(class = "fas fa-location-dot text-primary"),
          tags$select(
            id = "ficha_f_municipio", 
            class = "form-select-municipio",
            `data-live-search` = "true",
            `data-live-search-normalize` = "true",
            `data-live-search-placeholder` = "Buscar município...",
            `data-none-results-text` = "Nenhum município encontrado",
            `data-size` = "10",
            `data-container` = "body",
            `data-style` = "btn-sm btn-light fw-bold text-slate-700 border-0 bg-transparent py-0 px-1 shadow-none",
            `data-width` = "230px"
          )
        ),
        tags$div(
          id = "ficha_navbar_nav",
        class = "d-none d-md-flex align-items-center gap-1 bg-slate-100 p-1 rounded-pill border border-slate-200 shadow-sm",
        tags$button(class = "btn-nav-topbar", onclick = "window.scrollToSection('aba_ficha')", title = "Voltar ao início", tags$i(class = "fas fa-arrow-up")),
        tags$div(class = "vr my-1 bg-slate-300", style = "width: 1px; height: 18px;"),
        tags$div(
          class = "dropdown",
          tags$button(
            class = "btn btn-sm btn-white bg-white border border-slate-200 text-slate-700 fw-bold rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 shadow-sm",
            type = "button",
            `data-bs-toggle` = "dropdown",
            `aria-expanded` = "false",
            title = "Navegar pelas Seções da Ficha",
            style = "font-size: 0.8rem; height: 32px; transition: all 0.2s;",
            tags$i(class = "fas fa-compass text-primary", style = "font-size: 0.85rem;"),
            tags$span("Seções"),
            tags$i(class = "fas fa-chevron-down text-slate-400 ms-1", style = "font-size: 0.65rem;")
          ),
          tags$ul(
            class = "dropdown-menu dropdown-menu-end shadow-xl border border-slate-200 py-2 text-xs rounded-2xl",
            style = "min-width: 280px; z-index: 1060;",
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_caracterizacao')", tags$i(class = "fas fa-city text-primary w-4 text-center"), "1. Caracterização")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_resumo_executivo')", tags$i(class = "fas fa-file-lines text-primary w-4 text-center"), "2. Resumo Executivo (5 Dimensões)")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_diagnostico_regional')", tags$i(class = "fas fa-compass text-purple-600 w-4 text-center"), "3. Diagnóstico de Des. Regional")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_demografia')", tags$i(class = "fas fa-users text-blue-500 w-4 text-center"), "4. Demografia")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_indicadores_sociais')", tags$i(class = "fas fa-shield-halved text-emerald-600 w-4 text-center"), "5. Indicadores Sociais")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_indicadores_economicos')", tags$i(class = "fas fa-lightbulb text-amber-500 w-4 text-center"), "6. Indicadores Econômicos")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_tecnologia_inovacao')", tags$i(class = "fas fa-microchip text-indigo-500 w-4 text-center"), "7. Tecnologia e Inovação")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_meio_ambiente')", tags$i(class = "fas fa-tree text-green-600 w-4 text-center"), "8. Meio Ambiente")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_fiscal')", tags$i(class = "fas fa-calculator text-cyan-600 w-4 text-center"), "9. Fiscal")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_iniciativas_regionais')", tags$i(class = "fas fa-tasks text-teal-600 w-4 text-center"), "10. Ações Governamentais e Convênios")),
            tags$li(tags$a(class = "dropdown-item py-1.5 px-3 fw-bold text-slate-700 d-flex align-items-center gap-2", href = "javascript:void(0)", onclick = "window.scrollToSection('sec_emendas_parlamentares')", tags$i(class = "fas fa-coins text-warning w-4 text-center"), "11. Emendas Parlamentares"))
          )
        )
      ),
      
      # --- BADGE DA DATA COM FLEX-SHRINK: 0 E ALINHAMENTO FIXO ---
        tags$div(
          id = "ficha_data_atualizacao_header",
          class = "bg-slate-100 rounded-pill px-3 py-1 border border-slate-200 d-none align-items-center ms-1", # Removeu d-none
          style = "white-space: nowrap; flex-shrink: 0;",
          tags$i(class = "fas fa-clock me-1.5 text-primary", style = "font-size: 0.8rem;"),
          tags$span(
            id = "ficha_data_atualizacao_txt",
            class = "fw-bold text-slate-700 uppercase tracking-tight",
            style = "font-size: 0.72rem; letter-spacing: 0.02em;",
            "Atualizado em: -" # Texto padrão enquanto carrega
          )
        )
        )
    )
  )
  
  main_content <- tags$main(
    class = "aurora-content-area",
        tags$div(
      class = "tab-content", 
      ui_modulo_landing(),
      ui_modulo_regioes(),
      ui_modulo_tematicas(),
      ui_modulo_ficha(),
      ui_modulo_ufs(),
      ui_metadados()
    )
  )
  
  chat_widget <- tags$div(
    id = "aurora-chat-container",
    class = "fixed bottom-24 right-6 w-[580px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 transform scale-0 origin-bottom-right z-[9999]",
    style = "height: 520px; max-height: 82vh;",
    
    tags$div(
      class = "bg-[#0C2856] text-white p-3 px-4 flex justify-between items-center flex-shrink-0",
      tags$div(
        class = "flex items-center gap-3",
        tags$img(src = "images/aurora.png", class = "w-10 h-10 rounded-full border-2 border-white object-cover"),
        tags$div(
          tags$h4(class = "font-bold m-0 text-sm", "Aurora"),
          tags$span(class = "text-xs text-blue-200", "Assistente de Dados")
        )
      ),
      tags$button(onclick = "toggleAuroraChat()", class = "text-white hover:text-red-400 p-1", tags$i(class = "fas fa-times"))
    ),
    
    tags$div(id = "aurora-chat-messages", class = "flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 text-sm"),
    
    tags$div(
      class = "p-3 bg-slate-100/90 border-t border-slate-200 flex flex-wrap gap-1.5 text-xs flex-shrink-0",
      tags$button(onclick = "usarPerguntaPronta('Quais os municípios com melhores resultados?')", class = "bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer", "Quais os municípios com melhores resultados?"),
      tags$button(onclick = "usarPerguntaPronta('Quem mais cresceu nos últimos anos?')", class = "bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer", "Quem mais cresceu nos últimos anos?"),
      tags$button(onclick = "usarPerguntaPronta('Como está meu município?')", class = "bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer", "Como está meu município?"),
      tags$button(onclick = "usarPerguntaPronta('Como está minha RD?')", class = "bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer", "Como está minha RD?")
    ),
    
    tags$div(
      class = "p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0",
      tags$input(id = "aurora-chat-input", type = "text", class = "flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#00B7FF]", placeholder = "Pergunte aos dados..."),
      tags$button(onclick = "enviarMensagemAurora()", class = "bg-[#00B7FF] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#0066FF] transition-colors flex-shrink-0", tags$i(class = "fas fa-paper-plane"))
    )
  )
  
  chat_button <- tags$button(
    onclick = "toggleAuroraChat()",
    class = "fixed bottom-6 right-6 w-14 h-14 bg-[#0C2856] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0066FF] transition-all z-[9998]",
    tags$img(src = "images/aurora.png", class = "w-14 h-14 rounded-full border-2 border-[#0C2856] object-cover hover:scale-110 transition-transform")
  )
  
  ui <- tags$html(
    lang = "pt-br",
    html_head,
    tags$body(
      class = "bg-slate-50 antialiased overflow-hidden m-0 p-0",
      tags$div(class = "aurora-app-container p-0", sidebar, tags$div(class = "aurora-main-wrapper", topbar, main_content)),
      chat_widget,
      chat_button
    )
  )
  
  htmltools::save_html(ui, "www/index.html")
  cli::cli_alert_success("Interface atualizada (index.html) gerada com sucesso!")
}

build_ui()