# ui_modules/ui_metadados.R

ui_metadados <- function() {
  tagList(
    # ==========================================
    # NOVA ABA: METADADOS
    # ==========================================
    tags$div(
      class = "tab-pane relative", `data-value` = "Metadados", id = "aba_metadados",
      tags$div(
        class = "container-fluid mt-4 px-4",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-4", "Dicionário de Indicadores"),
        tags$div(
          class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4",
          tags$table(id = "tabela_metadados", class = "table w-100")
        )
      )
    ),
    
    # ==========================================
    # MODAL DE DETALHES DO METADADO
    # ==========================================
    HTML('
    <div class="modal fade" id="modalMetadado" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-3xl overflow-hidden">
          <div class="modal-header border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <span class="badge bg-primary rounded-pill mb-2" id="modalMetadadoBadge">Natureza</span>
              <h5 class="modal-title font-black text-slate-800 text-xl" id="modalMetadadoTitle">Título</h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-5">
            <p class="text-slate-600 mb-4" id="modalMetadadoDesc"></p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <span class="text-xs text-blue-500 font-bold uppercase tracking-wider block mb-1">Limiar de Corte</span>
                <strong class="text-blue-900 text-lg" id="modalMetadadoLimiar"></strong>
              </div>
              <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider block mb-1">Direção Desejável</span>
                <strong class="text-emerald-900 text-lg" id="modalMetadadoDirecao"></strong>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 text-center overflow-x-auto">
              <span class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Fórmula de Cálculo</span>
              <div id="modalMetadadoFormula" class="py-2 text-lg"></div>
            </div>

            <div class="border-t border-slate-100 pt-4 mt-2">
              <span class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Impacto no Planejamento</span>
              <p class="text-sm text-slate-700 italic" id="modalMetadadoImpacto"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ')
  )
}