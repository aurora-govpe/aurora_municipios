const fs = require('fs');

let css = fs.readFileSync('www/css/ficha.css', 'utf8');
const norm = s => s.replace(/\r\n/g, '\n');

// 1. Atualizar #aba_ficha .kpi-modern-footer
const target_footer = `  #aba_ficha .kpi-modern-footer {
    text-align: left !important;
    font-size: 0.55rem !important;
    white-space: nowrap !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 3px !important;
    width: 100% !important;
  }`;

const repl_footer = `  #aba_ficha .kpi-modern-footer {
    text-align: left !important;
    font-size: 0.65rem !important;
    white-space: normal !important;
    display: block !important;
    width: 100% !important;
    margin-top: auto !important;
    padding-top: 4px !important;
    border-top: 1px solid rgba(226, 232, 240, 0.6) !important;
  }

  .kpi-footer-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 2px;
  }

  .kpi-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 0.68rem;
    line-height: 1.2;
  }`;

if (norm(css).includes(norm(target_footer))) {
  css = norm(css).replace(norm(target_footer), norm(repl_footer));
  console.log("SUCCESS: kpi-modern-footer atualizado!");
} else {
  console.log("FAIL: target_footer não encontrado");
}

// 2. Atualizar .badge-polaridade (apenas símbolo e cor, sem vazar texto)
const target_pol = `.badge-polaridade {
  display: inline-flex !important;
  align-items: center !important;
  gap: 3px !important;
  font-size: 0.58rem !important;
  font-weight: 700 !important;
  padding: 1px 6px !important;
  border-radius: 20px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.02em !important;
  margin-left: 4px !important;
}`;

const repl_pol = `.badge-polaridade {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 18px !important;
  height: 18px !important;
  font-size: 0.62rem !important;
  font-weight: 800 !important;
  padding: 0 !important;
  border-radius: 50% !important;
  margin-left: auto !important;
}`;

if (norm(css).includes(norm(target_pol))) {
  css = norm(css).replace(norm(target_pol), norm(repl_pol));
  console.log("SUCCESS: badge-polaridade atualizado!");
} else {
  console.log("FAIL: target_pol não encontrado");
}

// 3. Atualizar .diag-card e caixas com respiro amplo
const target_diag = `.diag-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.diag-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  border-color: #94a3b8;
}

.diag-box-paradigma {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 0.85rem;
}

.diag-box-reorientacao {
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
  border-left: 4px solid #16a34a;
  border-radius: 0.75rem;
  padding: 0.95rem 1.1rem;
  margin-bottom: 0.85rem;
}`;

const repl_diag = `.diag-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.6rem 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.diag-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  border-color: #cbd5e1;
}

.diag-box-paradigma {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #f59e0b;
  border-radius: 0.75rem;
  padding: 1.1rem 1.25rem;
  margin-bottom: 0.5rem;
}

.diag-box-reorientacao {
  background-color: #ffffff;
  border: 1px solid #fed7aa;
  border-left: 3px solid #ff5a26;
  border-radius: 0.75rem;
  padding: 1.15rem 1.25rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px rgba(255, 90, 38, 0.04);
}`;

if (norm(css).includes(norm(target_diag))) {
  css = norm(css).replace(norm(target_diag), norm(repl_diag));
  console.log("SUCCESS: diag-card e caixas atualizados com respiro!");
} else {
  console.log("FAIL: target_diag não encontrado");
}

fs.writeFileSync('www/css/ficha.css', css, 'utf8');
console.log('Finished updating www/css/ficha.css');
