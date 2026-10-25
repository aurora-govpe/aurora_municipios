// ==========================================================================
// 1. NÚCLEO UNIVERSAL (BOILERPLATE) - DESACOPLADO (SEM AUTH)
// ==========================================================================

window.basePath = window.location.pathname.replace(/\/index\.html.*$/, "").replace(/\/$/, "");

window.fetchSeguro = async function(url, options = {}) {
    // Retiramos a obrigatoriedade de enviar credenciais/cookies
    const res = await fetch(url, options);
    
    if (!res.ok) {
        console.warn(`[FRONTEND] Erro na requisição para ${url}: ${res.status}`);
    }
    
    return res;
};

// ==========================================================================
// 2. FUNÇÕES GLOBAIS DE CARREGAMENTO (OVERLAY)
// ==========================================================================
window.mostrarCarregamento = function(msg) {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="loading-overlay">
        <div class="spinner-ring"></div>
        <div class="loading-title" id="loading-msg">${msg || 'CARREGANDO ANÁLISE...'}</div>
        <div class="loading-subtitle">Por favor, aguarde. Não feche a página.</div>
      </div>
    `);
    overlay = document.getElementById('loading-overlay');
  } else {
    const msgEl = document.getElementById('loading-msg');
    if (msgEl) msgEl.innerText = msg || 'CARREGANDO ANÁLISE...';
  }
  overlay.classList.add('show');
};

window.ocultarCarregamento = function() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('show');
};