# ui_modules/ui_landing.R
library(htmltools)

ui_modulo_landing <- function() {
  tags$div(
    class = "tab-pane active show relative",
    `data-value` = "Início",
    id = "aba_inicio",
    
    tags$div(
      class = "container-fluid mt-3 px-4 pb-5",
      
      # =========================================================================
      # 1. HERO SECTION INSTITUCIONAL & BUSCA UNIVERSAL
      # =========================================================================
      tags$div(
        class = "relative rounded-3xl p-6 md:p-10 mb-5 overflow-hidden shadow-xl text-white",
        style = "background: linear-gradient(135deg, #0C2856 0%, #153e7e 60%, #081c3d 100%); border: 1px solid rgba(255, 255, 255, 0.12);",
        
        # Elemento decorativo de fundo
        tags$div(
          class = "absolute -right-12 -bottom-16 w-80 h-80 rounded-full opacity-10 pointer-events-none",
          style = "background: radial-gradient(circle, #00B7FF 0%, transparent 70%); filter: blur(25px);"
        ),
        
        # Badge Institucional
        tags$div(
          class = "d-flex align-items-center gap-2 mb-3 flex-wrap",
          tags$span(
            class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-white shadow-sm",
            style = "background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.25);",
            tags$i(class = "fas fa-landmark me-1.5 text-amber-300"),
            "Governo de Pernambuco • SEPLAG"
          ),
          tags$span(
            class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-blue-200 shadow-sm",
            style = "background: rgba(0, 183, 255, 0.15); border: 1px solid rgba(0, 183, 255, 0.3);",
            tags$i(class = "fas fa-shield-halved me-1.5 text-blue-300"),
            "Secretaria Executiva de Desenvolvimento Regional e Captação"
          )
        ),
        
        # Título e Subtítulo
        tags$div(
          class = "row align-items-center mb-4",
          tags$div(
            class = "col-lg-9",
            tags$h1(
              class = "text-3xl md:text-5xl font-black tracking-tight mb-3 text-white leading-tight",
              "Aurora Municípios & Territórios"
            ),
            tags$p(
              class = "text-sm md:text-base text-blue-100 max-w-3xl leading-relaxed mb-0 font-medium",
              "A plataforma estratégica de inteligência de dados e apoio ao planejamento governamental do Estado de Pernambuco. ",
              "Monitore indicadores socioeconômicos, avalie a convergência inter e intra-regional e acesse o diagnóstico dos 184 municípios e 12 Regiões de Desenvolvimento."
            )
          ),
          tags$div(
            class = "col-lg-3 d-none d-lg-flex justify-content-end",
            tags$img(
              src = "images/brasao_gov_pe.png",
              alt = "Brasão Governo de Pernambuco",
              class = "opacity-85 filter drop-shadow-lg",
              style = "max-height: 110px; object-fit: contain;"
            )
          )
        ),
        
        # Barra de Busca Rápida de Município ou Região
        tags$div(
          class = "mt-4 pt-3 border-t border-white/10",
          tags$div(
            class = "row g-2 align-items-center",
            tags$div(
              class = "col-md-7 col-lg-8",
              tags$div(
                class = "relative flex items-center",
                tags$i(class = "fas fa-search absolute left-4 text-slate-400 text-sm pointer-events-none"),
                tags$input(
                  id = "landing_search_input",
                  type = "text",
                  class = "w-full bg-white text-slate-800 placeholder-slate-400 pl-11 pr-28 py-3 rounded-2xl text-sm font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00B7FF] border-0 transition-all",
                  placeholder = "Buscar município (ex: Caruaru, Petrolina, Serra Talhada) ou Região (ex: Agreste Central)...",
                  onkeydown = "if(event.key==='Enter') window.executarBuscaLanding();"
                ),
                tags$button(
                  type = "button",
                  class = "absolute right-2 btn btn-primary btn-sm rounded-xl px-3.5 py-1.5 font-bold text-xs shadow-sm",
                  onclick = "window.executarBuscaLanding()",
                  "Acessar"
                )
              )
            ),
            tags$div(
              class = "col-md-5 col-lg-4 d-flex align-items-center gap-1.5 flex-wrap",
              tags$span(class = "text-xs font-bold text-blue-200 uppercase tracking-wider me-1", "Acesso Rápido:"),
              tags$button(type = "button", class = "btn btn-xs rounded-pill bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-2.5 py-1 transition-all", onclick = "window.irParaMunicipio('Recife')", "Recife"),
              tags$button(type = "button", class = "btn btn-xs rounded-pill bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-2.5 py-1 transition-all", onclick = "window.irParaMunicipio('Caruaru')", "Caruaru"),
              tags$button(type = "button", class = "btn btn-xs rounded-pill bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-2.5 py-1 transition-all", onclick = "window.irParaMunicipio('Petrolina')", "Petrolina"),
              tags$button(type = "button", class = "btn btn-xs rounded-pill bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-2.5 py-1 transition-all", onclick = "window.irParaMunicipio('Garanhuns')", "Garanhuns")
            )
          )
        )
      ),
      
      # =========================================================================
      # 2. GRANDES NÚMEROS DE PERNAMBUCO
      # =========================================================================
      tags$div(
        class = "mb-5",
        tags$div(
          class = "d-flex justify-content-between align-items-center border-b-2 border-slate-200 pb-2 mb-3",
          tags$div(
            tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-chart-line text-primary me-2"), "Grandes Números de Pernambuco"),
            tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Panorama consolidado do território pernambucano com base em dados oficiais")
          ),
          tags$span(class = "badge bg-slate-100 text-slate-600 border border-slate-200 rounded-pill px-3 py-1 text-xs font-bold", "Base Atualizada")
        ),
        
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3",
          
          # Card 1: Cobertura Territorial
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-2",
              tags$span(class = "text-xs font-black text-slate-500 uppercase tracking-wider", "Malha Territorial"),
              tags$div(class = "w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm", tags$i(class = "fas fa-map-location-dot"))
            ),
            tags$div(
              tags$span(class = "text-2xl font-black text-slate-800 tracking-tight block", "184 + 1"),
              tags$span(class = "text-xs font-bold text-slate-500 block", "Municípios e Fernando de Noronha")
            ),
            tags$div(
              class = "mt-3 pt-2 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "badge bg-blue-100 text-blue-800 rounded-pill text-[10px] font-bold px-2 py-0.5", "12 Regiões (RDs)"),
              tags$span(class = "text-[11px] text-slate-400 font-semibold", "100% de Cobertura")
            )
          ),
          
          # Card 2: População
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-2",
              tags$span(class = "text-xs font-black text-slate-500 uppercase tracking-wider", "População Estimada"),
              tags$div(class = "w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm", tags$i(class = "fas fa-users"))
            ),
            tags$div(
              tags$span(class = "text-2xl font-black text-slate-800 tracking-tight block", "9.058.931"),
              tags$span(class = "text-xs font-bold text-slate-500 block", "Habitantes Estimados (2026)")
            ),
            tags$div(
              class = "mt-3 pt-2 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "badge bg-emerald-100 text-emerald-800 rounded-pill text-[10px] font-bold px-2 py-0.5", "7º no Brasil"),
              tags$span(class = "text-[11px] text-slate-400 font-semibold", "2º no Nordeste")
            )
          ),
          
          # Card 3: PIB Estadual
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-2",
              tags$span(class = "text-xs font-black text-slate-500 uppercase tracking-wider", "PIB Consolidado"),
              tags$div(class = "w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm", tags$i(class = "fas fa-sack-dollar"))
            ),
            tags$div(
              tags$span(class = "text-2xl font-black text-slate-800 tracking-tight block", "R$ 254+ Bi"),
              tags$span(class = "text-xs font-bold text-slate-500 block", "Soma dos PIBs Municipais")
            ),
            tags$div(
              class = "mt-3 pt-2 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "badge bg-amber-100 text-amber-800 rounded-pill text-[10px] font-bold px-2 py-0.5", "Economia Polo"),
              tags$span(class = "text-[11px] text-slate-400 font-semibold", "Agro, Indústria & Serv.")
            )
          ),
          
          # Card 4: Saúde Fiscal
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-2",
              tags$span(class = "text-xs font-black text-slate-500 uppercase tracking-wider", "Gestão Fiscal (CAPAG)"),
              tags$div(class = "w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm", tags$i(class = "fas fa-building-columns"))
            ),
            tags$div(
              tags$span(class = "text-2xl font-black text-slate-800 tracking-tight block", "184 Municípios"),
              tags$span(class = "text-xs font-bold text-slate-500 block", "Capacidade de Pagamento STN")
            ),
            tags$div(
              class = "mt-3 pt-2 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "badge bg-purple-100 text-purple-800 rounded-pill text-[10px] font-bold px-2 py-0.5", "Notas A, B, C e D"),
              tags$span(class = "text-[11px] text-slate-400 font-semibold", "Aptidão a Crédito")
            )
          ),
          
          # Card 5: Pautas Prioritárias
          tags$div(
            class = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
            tags$div(
              class = "d-flex justify-content-between align-items-center mb-2",
              tags$span(class = "text-xs font-black text-slate-500 uppercase tracking-wider", "Programas Prioritários"),
              tags$div(class = "w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-sm", tags$i(class = "fas fa-hand-holding-heart"))
            ),
            tags$div(
              tags$span(class = "text-2xl font-black text-slate-800 tracking-tight block", "Fome & Águas"),
              tags$span(class = "text-xs font-bold text-slate-500 block", "Cozinhas & Segurança Hídrica")
            ),
            tags$div(
              class = "mt-3 pt-2 border-t border-slate-100 d-flex align-items-center justify-content-between",
              tags$span(class = "badge bg-rose-100 text-rose-800 rounded-pill text-[10px] font-bold px-2 py-0.5", "Monitoramento Ativo"),
              tags$span(class = "text-[11px] text-slate-400 font-semibold", "Ações Estruturantes")
            )
          )
        )
      ),
      
      # =========================================================================
      # 3. MAPA DA PLATAFORMA (O QUE TEM NO APP)
      # =========================================================================
      tags$div(
        class = "mb-5",
        tags$div(
          class = "border-b-2 border-slate-200 pb-2 mb-4",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-0", tags$i(class = "fas fa-sitemap text-primary me-2"), "O Que Você Encontra no Aurora"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Navegue diretamente pelos módulos de análise conforme sua necessidade de informação")
        ),
        
        tags$div(
          class = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          
          # Módulo 1: Regiões de Desenvolvimento
          tags$div(
            class = "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center text-xl mb-4",
                tags$i(class = "fas fa-map-location-dot")
              ),
              tags$span(class = "badge bg-blue-50 text-blue-700 border border-blue-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Escala Regional"),
              tags$h4(class = "font-black text-slate-800 text-lg mb-2", "Regiões de Desenvolvimento (RDs)"),
              tags$p(class = "text-slate-600 text-sm leading-relaxed mb-4", 
                     "Diagnóstico territorial consolidado das 12 RDs e Consórcios Intermunicipais. Analise clusters de desenvolvimento, redes de influência (REGIC), fluxos pendulares e recursos estaduais alocados.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-primary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2 shadow-sm",
              onclick = "window.mudarAbaAurora('Regiões', null)",
              tags$i(class = "fas fa-arrow-right"), "Explorar Regiões"
            )
          ),
          
          # Módulo 2: Análises Temáticas
          tags$div(
            class = "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-4",
                tags$i(class = "fas fa-layer-group")
              ),
              tags$span(class = "badge bg-amber-50 text-amber-800 border border-amber-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Pautas Estruturadoras"),
              tags$h4(class = "font-black text-slate-800 text-lg mb-2", "Análises Temáticas"),
              tags$p(class = "text-slate-600 text-sm leading-relaxed mb-4", 
                     "Acompanhamento em profundidade dos programas centrais do Governo de Pernambuco: Pernambuco sem Fome (Cozinhas Comunitárias e Mães de PE), Águas de Pernambuco (Compesa e Adutoras) e Saúde Fiscal (CAPAG).")
            ),
            tags$button(
              type = "button",
              class = "btn btn-outline-primary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2",
              onclick = "window.mudarAbaAurora('Análises Temáticas', null)",
              tags$i(class = "fas fa-arrow-right"), "Ver Programas Prioritários"
            )
          ),
          
          # Módulo 3: Fichas Municipais
          tags$div(
            class = "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4",
                tags$i(class = "fas fa-city")
              ),
              tags$span(class = "badge bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Escala Local (184 Municípios)"),
              tags$h4(class = "font-black text-slate-800 text-lg mb-2", "Fichas Municipais"),
              tags$p(class = "text-slate-600 text-sm leading-relaxed mb-4", 
                     "Raio-X de cada um dos 184 municípios em 11 dimensões detalhadas: Demografia, Indicadores Sociais, Econômicos, Ciência e Tecnologia, Meio Ambiente, Finanças, Iniciativas e Emendas Parlamentares.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-outline-primary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2",
              onclick = "window.mudarAbaAurora('Municípios', null)",
              tags$i(class = "fas fa-arrow-right"), "Consultar Municípios"
            )
          ),
          
          # Módulo 4: Comparativo UFs
          tags$div(
            class = "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl mb-4",
                tags$i(class = "fas fa-chart-column")
              ),
              tags$span(class = "badge bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Escala Inter-Regional / Nacional"),
              tags$h4(class = "font-black text-slate-800 text-lg mb-2", "Comparativo UFs (Benchmarking)"),
              tags$p(class = "text-slate-600 text-sm leading-relaxed mb-4", 
                     "Benchmarking das 27 Unidades da Federação estruturado em 5 Eixos Estratégicos: Conhecimento e Inovação (IDEB), Segurança e Cidadania, Saúde e Qualidade de Vida, Desenvolvimento Sustentável e Gestão Fiscal.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-outline-primary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2",
              onclick = "window.mudarAbaAurora('Comparativo UFs', null)",
              tags$i(class = "fas fa-arrow-right"), "Abrir Comparativo Nacional"
            )
          ),
          
          # Módulo 5: Metadados
          tags$div(
            class = "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl mb-4",
                tags$i(class = "fas fa-book")
              ),
              tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-300 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Transparência & Governança"),
              tags$h4(class = "font-black text-slate-800 text-lg mb-2", "Dicionário de Metadados"),
              tags$p(class = "text-slate-600 text-sm leading-relaxed mb-4", 
                     "Documentação rigorosa com as fórmulas de cálculo, limiares de corte, direções desejáveis, periodicidade e impacto no planejamento para cada indicador presente no sistema.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-outline-secondary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2",
              onclick = "window.mudarAbaAurora('Metadados', null)",
              tags$i(class = "fas fa-arrow-right"), "Ver Metadados"
            )
          ),
          
          # Módulo 6: Assistente IA Aurora
          tags$div(
            class = "bg-gradient-to-br from-[#0C2856] to-[#153e7e] rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-white",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center text-xl mb-4 border border-white/20",
                tags$i(class = "fas fa-robot")
              ),
              tags$span(class = "badge bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Inteligência Artificial"),
              tags$h4(class = "font-black text-white text-lg mb-2", "Assistente de Dados Aurora"),
              tags$p(class = "text-blue-100 text-sm leading-relaxed mb-4", 
                     "Converse diretamente com os dados de Pernambuco em linguagem natural. Obtenha comparativos imediatos, sínteses territoriais e respostas rápidas sobre qualquer município ou região.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-light rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2 text-slate-900 shadow-sm",
              onclick = "window.toggleAuroraChat()",
              tags$i(class = "fas fa-comments text-primary"), "Conversar com a Aurora"
            )
          )
        )
      ),
      
      # =========================================================================
      # 4. FLUXOS DE USO GUIADOS (JORNADAS POR PERFIL)
      # =========================================================================
      tags$div(
        class = "bg-slate-100 rounded-3xl p-6 md:p-8 border border-slate-200",
        tags$div(
          class = "border-b border-slate-200 pb-3 mb-4",
          tags$h3(class = "text-xl font-black text-slate-800 uppercase tracking-tight mb-1", tags$i(class = "fas fa-compass text-primary me-2"), "Como Usar o Aurora (Fluxos Recomendados)"),
          tags$p(class = "text-xs font-bold text-slate-500 mb-0", "Escolha a jornada que melhor atende aos seus objetivos de planejamento e tomada de decisão")
        ),
        
        tags$div(
          class = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
          
          # Jornada 1: Gestão Municipal
          tags$div(
            class = "bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between",
            tags$div(
              tags$div(class = "text-emerald-600 font-black text-sm mb-1 d-flex align-items-center gap-1.5", tags$i(class = "fas fa-building"), "Gestores Municipais"),
              tags$h5(class = "font-black text-slate-800 text-sm mb-2", "Panorama e Monitoramento Local"),
              tags$p(class = "text-xs text-slate-600 leading-relaxed mb-3", 
                     "Acesse a ficha da sua cidade para analisar as 11 dimensões sociais e econômicas, verificar a nota CAPAG e acompanhar convênios e emendas parlamentares em execução.")
            ),
            tags$button(class = "btn btn-xs btn-outline-emerald border-emerald-500 text-emerald-700 font-bold rounded-lg py-1.5 px-3 w-full hover:bg-emerald-50", onclick = "window.mudarAbaAurora('Municípios', null)", "Ir para Municípios")
          ),
          
          # Jornada 2: Planejamento Regional
          tags$div(
            class = "bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between",
            tags$div(
              tags$div(class = "text-blue-600 font-black text-sm mb-1 d-flex align-items-center gap-1.5", tags$i(class = "fas fa-map"), "Planejamento Territorial"),
              tags$h5(class = "font-black text-slate-800 text-sm mb-2", "Articulação de RDs e Consórcios"),
              tags$p(class = "text-xs text-slate-600 leading-relaxed mb-3", 
                     "Identifique disparidades inter-regionais entre as 12 RDs, analise bacias de emprego e conectividade territorial para orientar investimentos descentralizados.")
            ),
            tags$button(class = "btn btn-xs btn-outline-primary font-bold rounded-lg py-1.5 px-3 w-full hover:bg-blue-50", onclick = "window.mudarAbaAurora('Regiões', null)", "Ir para Regiões")
          ),
          
          # Jornada 3: Monitoramento de Programas
          tags$div(
            class = "bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between",
            tags$div(
              tags$div(class = "text-amber-600 font-black text-sm mb-1 d-flex align-items-center gap-1.5", tags$i(class = "fas fa-utensils"), "Programas de Governo"),
              tags$h5(class = "font-black text-slate-800 text-sm mb-2", "Ações Estruturantes de Estado"),
              tags$p(class = "text-xs text-slate-600 leading-relaxed mb-3", 
                     "Consulte o mapa de cozinhas comunitárias do Pernambuco sem Fome, a malha de adutoras e municípios atendidos pela Compesa e o diagnóstico fiscal.")
            ),
            tags$button(class = "btn btn-xs btn-outline-amber border-amber-500 text-amber-700 font-bold rounded-lg py-1.5 px-3 w-full hover:bg-amber-50", onclick = "window.mudarAbaAurora('Análises Temáticas', null)", "Ir para Temáticas")
          ),
          
          # Jornada 4: Benchmarking Federativo
          tags$div(
            class = "bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between",
            tags$div(
              tags$div(class = "text-indigo-600 font-black text-sm mb-1 d-flex align-items-center gap-1.5", tags$i(class = "fas fa-chart-pie"), "Analistas Estratégicos"),
              tags$h5(class = "font-black text-slate-800 text-sm mb-2", "Benchmarking Interestadual"),
              tags$p(class = "text-xs text-slate-600 leading-relaxed mb-3", 
                     "Compare Pernambuco frente aos outros estados do Nordeste e do Brasil em segurança pública, educação básica (IDEB), investimentos em C&T e equilíbrio fiscal.")
            ),
            tags$button(class = "btn btn-xs btn-outline-indigo border-indigo-500 text-indigo-700 font-bold rounded-lg py-1.5 px-3 w-full hover:bg-indigo-50", onclick = "window.mudarAbaAurora('Comparativo UFs', null)", "Ir para Comparativo UFs")
          )
        )
      )
    )
  )
}
