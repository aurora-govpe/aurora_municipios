const fs = require('fs');

let ui = fs.readFileSync('ui_modules/ui_tematicas.R', 'utf8');

// 1. Substituir o topo: Cabeçalho superior fica limpo (apenas título da aba),
// e o Painel Executivo ganha o botão de toggle.
// O seletor de pauta é movido para logo após o painel executivo.

const target_old_header = `      # CABEÇALHO DA ABA ANÁLISES TEMÁTICAS
      tags$div(
        class = "border-b-2 border-slate-200 pb-3 mb-4 mt-2 d-flex justify-content-between align-items-center flex-wrap gap-3",
        tags$div(
          tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Programas Prioritários"),
          tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Programas Prioritários, Investimentos Estruturadores e Visão Territorial do Estado")
        ),
        
        # SELETOR DE PAUTA TEMÁTICA
        tags$div(
          class = "d-flex align-items-center gap-2 flex-wrap",
          tags$span(class = "text-xs font-bold text-slate-500 uppercase tracking-wider", "Pauta:"),
          tags$div(
            class = "d-inline-flex bg-slate-100 p-1 rounded-pill border border-slate-200 gap-1",
            tags$button(
              id = "btn_pauta_resumo_cozinhas",
              class = "btn btn-sm btn-primary rounded-pill px-3 py-1 font-bold text-xs shadow-sm transition-all",
              onclick = "window.alternarPautaResumos('cozinhas', this)",
              tags$i(class = "fas fa-utensils me-1.5 text-slate-900"), "Superação da Pobreza, Segurança Alimentar e Proteção Social"
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
        )
      ),
      
            # BLOCO PAUTA 1: PERNAMBUCO SEM FOME (COZINHAS, MÃES DE PE & COFINANCIAMENTO)
      # =========================================================================
      # SEÇÃO: RESUMO EXECUTIVO INTEGRADO (PROGRAMAS PRIORITÁRIOS)
      # =========================================================================
      tags$div(
        id = "sec_tematicas_resumo_executivo",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-2",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Painel Executivo de Programas"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Visão Transversal Integrada das Entregas e Investimentos Estruturadores no Estado")
      ),
      
      tags$div(
        id = "tematicas_container_resumo_executivo",
        class = "mb-5"
      ),`;

const replacement_new_header = `      # CABEÇALHO DA ABA ANÁLISES TEMÁTICAS
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
      # SELETOR DE PAUTA TEMÁTICA (POSICIONADO ABAIXO DO PAINEL EXECUTIVO)
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
      ),`;

const norm = s => s.replace(/\r\n/g, '\n');
if (norm(ui).includes(norm(target_old_header))) {
    ui = norm(ui).replace(norm(target_old_header), norm(replacement_new_header));
    fs.writeFileSync('ui_modules/ui_tematicas.R', ui, 'utf8');
    console.log('SUCCESS: ui_modules/ui_tematicas.R atualizado!');
} else {
    console.log('FAIL: target_old_header nao encontrado!');
}
