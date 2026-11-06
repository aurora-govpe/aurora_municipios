const fs = require('fs');

let ui = fs.readFileSync('ui_modules/ui_ficha.R', 'utf8');
const norm = s => s.replace(/\r\n/g, '\n');

// 1. Item 6: Segurança Pública grid-cols-4
const target_sec_seg = 'class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5",';
const repl_sec_seg = 'class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5",';

if (norm(ui).includes(norm(target_sec_seg))) {
  ui = norm(ui).replace(norm(target_sec_seg), norm(repl_sec_seg));
  console.log("SUCCESS: Item 6 aplicado (Segurança 4 colunas)");
} else {
  console.log("FAIL: Item 6 target não encontrado");
}

// 2. Item 7: Vulnerabilidade Social (títulos Mães e Chapéu, e novos cards de Cozinhas e Cofinanciamento)
const target_old_vuln_cards = `          tags$div(class = "kpi-modern-card", style = "border-left-color: #E91E63;", tags$div(class = "kpi-modern-header", "MÃES DE PE (BENEFICIÁRIAS)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-female kpi-modern-icon", style = "color: #E91E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_qtd", "Mulheres Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "MÃES DE PE (VALOR)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_val", "Investimento")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA (BENEFICIÁRIOS)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hat-cowboy kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_qtd", "Pessoas Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA (VALOR)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_val", "Investimento pago"))`;

const repl_new_vuln_cards = `          tags$div(class = "kpi-modern-card", style = "border-left-color: #E91E63;", tags$div(class = "kpi-modern-header", "MÃES DE PERNAMBUCO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-female kpi-modern-icon", style = "color: #E91E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_qtd", "Mulheres Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #C0392B;", tags$div(class = "kpi-modern-header", "MÃES DE PERNAMBUCO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #C0392B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_maes_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_maes_val", "Investimento")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F1C40F;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hat-cowboy kpi-modern-icon", style = "color: #F1C40F;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_qtd", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_qtd", "Pessoas Atendidas")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #D35400;", tags$div(class = "kpi-modern-header", "CHAPÉU DE PALHA"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #D35400;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pcp_val", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pcp_val", "Investimento")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #F59E0B;", tags$div(class = "kpi-modern-header", "COZINHAS COMUNITÁRIAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-utensils kpi-modern-icon", style = "color: #F59E0B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vuln_cozinhas", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vuln_cozinhas", "Unidades")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #3B82F6;", tags$div(class = "kpi-modern-header", "COFINANCIAMENTO SOCIAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-dollar kpi-modern-icon", style = "color: #3B82F6;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_vuln_cofin", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_vuln_cofin", "Investimento Estadual"))`;

if (norm(ui).includes(norm(target_old_vuln_cards))) {
  ui = norm(ui).replace(norm(target_old_vuln_cards), norm(repl_new_vuln_cards));
  console.log("SUCCESS: Item 7 aplicado (Vulnerabilidade Social)");
} else {
  console.log("FAIL: Item 7 target não encontrado");
}

// 3. Item 8: Condições Habitacionais (aviso IVCAD e grandes números de água)
const target_old_hab = `      # 2.5.2 CONDIÇÕES HABITACIONAIS
      tags$div(
        class = "subsecao-print-break",
        tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base mt-6", "Condições Habitacionais"),
        tags$div(
          class = "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5",
          tags$div(class = "kpi-modern-card", style = "border-left-color: #00BCD4;", tags$div(class = "kpi-modern-header", "ÁGUA (REDE GERAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-faucet kpi-modern-icon", style = "color: #00BCD4;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_agua_rede", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_agua_rede", "% de Domicílios")),
          tags$div(class = "kpi-modern-card", style = "border-left-color: #8D6E63;", tags$div(class = "kpi-modern-header", "ESGOTO (REDE GERAL)"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-toilet kpi-modern-icon", style = "color: #8D6E63;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_pct_esgoto_rede", "-")), tags$div(class = "kpi-modern-footer text-uppercase", id = "ficha_ano_pct_esgoto_rede", "% de Domicílios"))
        ),`;

const repl_new_hab = `      # 2.5.2 CONDIÇÕES HABITACIONAIS
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
        ),`;

if (norm(ui).includes(norm(target_old_hab))) {
  ui = norm(ui).replace(norm(target_old_hab), norm(repl_new_hab));
  console.log("SUCCESS: Item 8 aplicado (Condições Habitacionais e Águas)");
} else {
  console.log("FAIL: Item 8 target não encontrado");
}

// 4. Item 9: Indicadores Econômicos (Fonte: RAIS)
const target_old_econ = `      # SEÇÃO 2.7: INDICADORES ECONÔMICOS
      tags$div(
        id = "sec_indicadores_economicos",
        class = "border-b-2 border-slate-200 pb-2 mb-4 mt-8",
        tags$h2(class = "text-2xl font-black text-slate-800 uppercase tracking-tight mb-0", "Indicadores Econômicos"),
        tags$p(class = "text-sm font-bold text-slate-500 mb-0", "Vocações, Mercado de Trabalho, Inovação e Comércio Exterior")
      ),`;

const repl_new_econ = `      # SEÇÃO 2.7: INDICADORES ECONÔMICOS
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
      ),`;

if (norm(ui).includes(norm(target_old_econ))) {
  ui = norm(ui).replace(norm(target_old_econ), norm(repl_new_econ));
  console.log("SUCCESS: Item 9 aplicado (Indicadores Econômicos RAIS)");
} else {
  console.log("FAIL: Item 9 target não encontrado");
}

// 5. Item 11: Iniciativas de Desenvolvimento Regional (remover Total Pago, trazer água, estradas, cofinanciamento)
const target_old_ini = `      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Ações e Programas Governamentais"),
      tags$div(
        class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-5",
        tags$div(class = "kpi-modern-card", style = "border-left-color: #34495E;", tags$div(class = "kpi-modern-header", "TOTAL INICIATIVAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-lightbulb kpi-modern-icon", style = "color: #34495E;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_total", "0")), tags$div(class = "kpi-modern-footer", "Projetos e Ações")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #27AE60;", tags$div(class = "kpi-modern-header", "EM EXECUÇÃO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-tools kpi-modern-icon", style = "color: #27AE60;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_execucao", "0")), tags$div(class = "kpi-modern-footer text-truncate", id="ficha_kpi_ini_top_status", "Outros status...")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #2980B9;", tags$div(class = "kpi-modern-header", "VALOR TOTAL"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-sack-dollar kpi-modern-icon", style = "color: #2980B9;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_val_tot", "R$ 0")), tags$div(class = "kpi-modern-footer", "Estimativa de Investimento")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #8E44AD;", tags$div(class = "kpi-modern-header", "TOTAL PAGO"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-hand-holding-usd kpi-modern-icon", style = "color: #8E44AD;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_val_pag", "R$ 0")), tags$div(class = "kpi-modern-footer", "Desembolso Financeiro")),
        tags$div(class = "kpi-modern-card", style = "border-left-color: #F59E0B;", tags$div(class = "kpi-modern-header", "COZINHAS COMUNITÁRIAS"), tags$div(class = "kpi-modern-body", tags$i(class = "fas fa-utensils kpi-modern-icon", style = "color: #F59E0B;"), tags$span(class = "kpi-modern-number", id = "ficha_kpi_ini_cozinhas", "0")), tags$div(class = "kpi-modern-footer text-truncate", id = "ficha_kpi_ini_cozinhas_sub", "Superação da Pobreza, Segurança Alimentar e Proteção Social"))
      ),`;

const repl_new_ini = `      tags$h5(class = "font-black text-slate-700 uppercase tracking-tight mb-3 text-base", "Ações e Programas Governamentais no Território"),
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
      ),`;

if (norm(ui).includes(norm(target_old_ini))) {
  ui = norm(ui).replace(norm(target_old_ini), norm(repl_new_ini));
  console.log("SUCCESS: Item 11 aplicado (Iniciativas de Desenvolvimento Regional)");
} else {
  console.log("FAIL: Item 11 target não encontrado");
}

fs.writeFileSync('ui_modules/ui_ficha.R', ui, 'utf8');
console.log('Finished updating ui_modules/ui_ficha.R');
