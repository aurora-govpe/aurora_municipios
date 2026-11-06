const fs = require('fs');

let ui = fs.readFileSync('ui_modules/ui_ficha.R', 'utf8');

const target_old = `        tags$div(
          tags$div(
            class = "d-flex align-items-center gap-2 mb-1 flex-wrap",
            tags$span(class = "badge bg-orange-100 text-[#c2410c] border border-orange-200 font-bold px-2.5 py-1 text-xs uppercase tracking-wider rounded-md", id = "ficha_rd_badge", "RD -"),
            tags$span(class = "badge bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2.5 py-1 text-xs uppercase tracking-wider rounded-md", id = "ficha_rank_pop_badge", "-º em PE")
          ),
          tags$h1(id = "ficha_nome_municipio", class = "display-5 fw-black text-slate-900 mb-0 text-uppercase tracking-tight", "MUNICÍPIO")
        ),`;

const replacement_new = `        tags$div(
          tags$h1(id = "ficha_nome_municipio", class = "display-5 fw-black text-slate-900 mb-0 text-uppercase tracking-tight", "MUNICÍPIO")
        ),`;

const norm = s => s.replace(/\r\n/g, '\n');
if (norm(ui).includes(norm(target_old))) {
  ui = norm(ui).replace(norm(target_old), norm(replacement_new));
  fs.writeFileSync('ui_modules/ui_ficha.R', ui, 'utf8');
  console.log('SUCCESS: Item 3 aplicado em ui_ficha.R!');
} else {
  console.log('FAIL: target_old não encontrado!');
}
