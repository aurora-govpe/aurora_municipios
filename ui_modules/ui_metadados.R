# ui_modules/ui_metadados.R
library(htmltools)

ui_metadados <- function() {
  tagList(
    # ==========================================
    # ABA METADADOS REESTILIZADA (DESIGN SYSTEM AURORA)
    # ==========================================
    tags$div(
      class = "tab-pane relative", `data-value` = "Metadados", id = "aba_metadados",
      tags$div(
        class = "container-fluid mt-3 px-4 pb-5",
        
        # CABEÇALHO PRINCIPAL
        tags$div(
          class = "d-flex justify-content-between align-items-center border-b-2 border-slate-200 pb-3 mb-4 flex-wrap gap-2",
          tags$div(
            tags$div(
              class = "d-flex align-items-center gap-2 mb-1",
              tags$span(class = "badge rounded-pill bg-orange-100 text-orange-950 font-bold px-3 py-1 text-xs", "Governança & Transparência"),
              tags$span(id = "metadados_contador_badge", class = "badge rounded-pill bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 text-xs", "Dicionário Oficial")
            ),
            tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Dicionário de Indicadores"),
            tags$p(class = "text-sm font-medium text-slate-500 mb-0", "Metodologia, fórmulas de cálculo, limiares de corte e impacto no planejamento estadual")
          ),
          tags$div(
            class = "d-flex align-items-center gap-2",
            tags$button(
              class = "btn btn-outline-dark btn-sm fw-bold shadow-sm rounded-pill px-3 transition-all",
              onclick = "window.print()",
              tags$i(class = "fas fa-file-pdf me-1 text-danger"), "Salvar PDF"
            )
          )
        ),
        
        # CONTAINER DA TABELA MODERNA
        tags$div(
          class = "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 p-md-5",
          tags$div(
            class = "table-responsive",
            tags$table(
              id = "tabela_metadados", 
              class = "table table-hover align-middle w-100 text-sm",
              style = "border-collapse: separate; border-spacing: 0;"
            )
          )
        )
      )
    ),
    
    # ==========================================
    # MODAL DE DETALHES DO METADADO
    # ==========================================
    HTML('
    <div class="modal fade" id="modalMetadado" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div class="modal-header border-b border-slate-100 px-5 py-4" style="background: linear-gradient(135deg, #1c1917 0%, #292524 60%, #431407 100%);">
            <div>
              <span class="badge rounded-pill px-3 py-1 text-xs font-bold mb-1" style="background: rgba(255, 90, 38, 0.2); color: #fdba74; border: 1px solid rgba(255, 90, 38, 0.35);" id="modalMetadadoBadge">Natureza</span>
              <h5 class="modal-title font-black text-white text-xl" id="modalMetadadoTitle">Título</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-5 bg-white">
            <p class="text-slate-600 mb-4 text-sm leading-relaxed" id="modalMetadadoDesc"></p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="bg-orange-50/60 border border-orange-200 p-4 rounded-2xl">
                <span class="text-xs text-[#c2410c] font-black uppercase tracking-wider block mb-1"><i class="fas fa-ruler-combined me-1"></i> Limiar de Corte</span>
                <strong class="text-orange-950 text-base" id="modalMetadadoLimiar"></strong>
              </div>
              <div class="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl">
                <span class="text-xs text-emerald-700 font-black uppercase tracking-wider block mb-1"><i class="fas fa-arrow-trend-up me-1"></i> Direção Desejável</span>
                <strong class="text-emerald-950 text-base" id="modalMetadadoDirecao"></strong>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 text-center overflow-x-auto">
              <span class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block"><i class="fas fa-calculator me-1"></i> Fórmula de Cálculo</span>
              <div id="modalMetadadoFormula" class="py-2 text-base font-semibold text-slate-800"></div>
            </div>

            <div class="border-t border-slate-100 pt-4 mt-2">
              <span class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block"><i class="fas fa-bullseye me-1"></i> Impacto no Planejamento</span>
              <p class="text-sm text-slate-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 mb-0" id="modalMetadadoImpacto"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ')
  )
}
