// www/js/app.js

window.onload = function() { 
  window.iniciarApp(); 
};

window.iniciarApp = function() {
  console.log("[MASTER] Iniciando App Aurora...");
  document.body.classList.add('logado');
};

// ==========================================
// LÓGICA DO CHAT AURORA
// ==========================================

window.toggleAuroraChat = function() {
  const container = document.getElementById("aurora-chat-container");
  if (!container) return;
  if (container.classList.contains("scale-0")) {
    container.classList.remove("scale-0");
    container.classList.add("scale-100");
  } else {
    container.classList.remove("scale-100");
    container.classList.add("scale-0");
  }
};

window.enviarMensagemAurora = async function() {
  const inputEl = document.getElementById("aurora-chat-input");
  const msgArea = document.getElementById("aurora-chat-messages");
  const mensagem = inputEl.value.trim();
  
  if (!mensagem) return;

  msgArea.insertAdjacentHTML('beforeend', `
    <div class="self-end bg-[#0C2856] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
      ${mensagem}
    </div>
  `);
  inputEl.value = "";
  msgArea.scrollTop = msgArea.scrollHeight;

  const typingId = "typing-" + Date.now();
  msgArea.insertAdjacentHTML('beforeend', `
    <div id="${typingId}" class="self-start bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm flex items-center gap-2">
      <i class="fas fa-circle-notch fa-spin"></i> Aurora está pensando...
    </div>
  `);
  msgArea.scrollTop = msgArea.scrollHeight;

  try {
    const res = await window.fetchSeguro(`${window.basePath || ''}/api/aurora/perguntar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: mensagem })
    });
    
    if (!res.ok) throw new Error(`Erro na API (Status ${res.status})`);
    
    const data = await res.json();
    
    const typEl = document.getElementById(typingId);
    if (typEl) typEl.remove();

    const htmlResposta = (typeof marked !== 'undefined' && marked.parse)
      ? marked.parse(data.resposta || "")
      : (data.resposta || "").replace(/\n/g, '<br>');

    msgArea.insertAdjacentHTML('beforeend', `
      <div class="aurora-markdown self-start bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm" style="font-size: 0.9rem;">
        ${htmlResposta}
      </div>
    `);
    msgArea.scrollTop = msgArea.scrollHeight;
    
  } catch (e) {
    const typEl = document.getElementById(typingId);
    if (typEl) typEl.remove();
    
    msgArea.insertAdjacentHTML('beforeend', `
      <div class="self-start bg-red-100 text-red-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
        Ocorreu um erro ao comunicar com a Aurora: ${e.message || e}.
      </div>
    `);
    msgArea.scrollTop = msgArea.scrollHeight;
  }
};

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("aurora-chat-input")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") window.enviarMensagemAurora();
  });
});

window.usarPerguntaPronta = function(texto) {
    const inputEl = document.getElementById("aurora-chat-input");
    if (!inputEl) return;
    
    const container = document.getElementById("aurora-chat-container");
    if (container && container.classList.contains("scale-0")) {
        window.toggleAuroraChat();
    }
    
    inputEl.value = texto;
    window.enviarMensagemAurora();
};

window.moduloFichaIniciado = false;
window.moduloRegioesIniciado = false;
window.moduloUFsIniciado = false;

window.scrollToSection = function (id) {
  if (id === 'aba_inicio' || id === 'aba_ficha' || id === 'aba_regioes' || id === 'aba_ufs' || id === 'aba_tematicas' || id === 'topo') {
    const container = document.querySelector('.aurora-content-area');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function normalizarAba(str) {
  if (!str) return "";
  return String(str).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

window.mudarAbaAurora = function(nomeAba, elemento) {
  const norm = normalizarAba(nomeAba);
  console.log("[Navegação] Mudando para aba:", nomeAba, "-> normalizado:", norm);

  // 1. Oculta todos os tab-panes
  document.querySelectorAll('.tab-pane').forEach(function(el) { 
    el.classList.remove('active', 'show'); 
  });

  // 2. Determina qual o ID alvo
  let alvo = null;
  if (norm.includes('inicio')) {
    alvo = document.getElementById('aba_inicio');
  } else if (norm.includes('regio')) {
    alvo = document.getElementById('aba_regioes');
  } else if (norm.includes('temat') || norm.includes('pauta')) {
    alvo = document.getElementById('aba_tematicas');
  } else if (norm.includes('municip') || norm.includes('ficha')) {
    alvo = document.getElementById('aba_ficha');
  } else if (norm.includes('uf') || norm.includes('comparativ') || norm.includes('bench')) {
    alvo = document.getElementById('aba_ufs');
  } else if (norm.includes('meta')) {
    alvo = document.getElementById('aba_metadados');
  }

  // Fallback por data-value
  if (!alvo) {
    document.querySelectorAll('.tab-pane').forEach(function(pane) {
      if (normalizarAba(pane.getAttribute('data-value')) === norm) {
        alvo = pane;
      }
    });
  }

  if (alvo) {
    alvo.classList.add('active', 'show');
  }

  // 3. Rola o container para o topo
  const mainContent = document.querySelector('.aurora-content-area');
  if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });

  // 4. Sincroniza estilo ativo no botão do Topbar
  let botaoAtivar = elemento;
  if (!botaoAtivar) {
    document.querySelectorAll('.aurora-topbar-tabs button').forEach(function(btn) {
      const btnNorm = normalizarAba(btn.textContent);
      if (btnNorm.includes(norm) || norm.includes(btnNorm)) {
        botaoAtivar = btn;
      }
    });
  }

  if (botaoAtivar) {
    const parentContainer = botaoAtivar.closest('.aurora-topbar-tabs') || botaoAtivar.parentElement;
    if (parentContainer) {
      parentContainer.querySelectorAll('button').forEach(function(btn) {
        btn.classList.remove('btn-primary', 'shadow-sm');
        btn.classList.add('btn-light', 'text-slate-700');
      });
      botaoAtivar.classList.remove('btn-light', 'text-slate-700');
      botaoAtivar.classList.add('btn-primary', 'shadow-sm');
    }
  }

  // 5. Exibição estrita dos Filtros contextuais na Topbar
  const controlesRegional = document.getElementById('controles_regioes');
  const controlesTematicas = document.getElementById('controles_tematicas');
  const controlesFicha = document.getElementById('controles_ficha_municipal');
  const controlesUFs = document.getElementById('controles_ufs');
  const badgeData = document.getElementById('ficha_data_atualizacao_header');

  const isAbaInicio = norm.includes('inicio');
  const isAbaRegioes = norm.includes('regio');
  const isAbaTematicas = norm.includes('temat') || norm.includes('pauta');
  const isAbaMunicipios = norm.includes('municip') || norm.includes('ficha');
  const isAbaUFs = norm.includes('uf') || norm.includes('comparativ') || norm.includes('bench');
  const isAbaMetadados = norm.includes('meta');

  if (controlesRegional) {
    if (isAbaRegioes) {
      controlesRegional.classList.remove('d-none');
      controlesRegional.classList.add('d-flex');
    } else {
      controlesRegional.classList.remove('d-flex');
      controlesRegional.classList.add('d-none');
    }
  }

  if (controlesTematicas) {
    if (isAbaTematicas) {
      controlesTematicas.classList.remove('d-none');
      controlesTematicas.classList.add('d-flex');
    } else {
      controlesTematicas.classList.remove('d-flex');
      controlesTematicas.classList.add('d-none');
    }
  }

  if (controlesFicha) {
    if (isAbaMunicipios) {
      controlesFicha.classList.remove('d-none');
      controlesFicha.classList.add('d-flex');
    } else {
      controlesFicha.classList.remove('d-flex');
      controlesFicha.classList.add('d-none');
    }
  }

  if (controlesUFs) {
    if (isAbaUFs) {
      controlesUFs.classList.remove('d-none');
      controlesUFs.classList.add('d-flex');
    } else {
      controlesUFs.classList.remove('d-flex');
      controlesUFs.classList.add('d-none');
    }
  }

  if (badgeData) {
    if (isAbaMunicipios) {
      badgeData.classList.remove('d-none');
      badgeData.classList.add('d-inline-flex');
    } else {
      badgeData.classList.remove('d-inline-flex');
      badgeData.classList.add('d-none');
    }
  }

  // 6. Inicialização de Ciclo de Vida e Resize
  if (isAbaRegioes) {
    if (!window.moduloRegioesIniciado) {
      window.moduloRegioesIniciado = true;
      if (typeof window.iniciarModuloRegioes === 'function') {
        window.iniciarModuloRegioes();
      }
    }
    setTimeout(function() {
      if (typeof mapasRD === 'object' && mapasRD) {
        Object.values(mapasRD).forEach(function(m) { if (m && typeof m.resize === 'function') m.resize(); });
      }
      if (typeof chartsRD === 'object' && chartsRD) {
        Object.values(chartsRD).forEach(function(c) { if (c && typeof c.resize === 'function') c.resize(); });
      }
      if (typeof histChartsRD === 'object' && histChartsRD) {
        Object.values(histChartsRD).forEach(function(h) { if (h && typeof h.resize === 'function') h.resize(); });
      }
    }, 100);
  } else if (isAbaTematicas) {
    setTimeout(function() {
      if (typeof window.alternarPautaResumos === 'function') {
        window.alternarPautaResumos(window.pautaResumoAtiva || 'cozinhas');
      }
    }, 80);
  } else if (isAbaMunicipios) {
    if (!window.moduloFichaIniciado) {
      window.moduloFichaIniciado = true;
      if (typeof window.iniciarModuloMunicipios === 'function') {
        window.iniciarModuloMunicipios();
      } else if (typeof window.iniciarModuloFicha === 'function') {
        window.iniciarModuloFicha();
      }
    }
    setTimeout(function() {
      if (typeof window.redimensionarMapasFicha === 'function') {
        window.redimensionarMapasFicha();
      }
    }, 100);
  } else if (isAbaUFs) {
    if (!window.moduloUFsIniciado) {
      window.moduloUFsIniciado = true;
      if (typeof window.iniciarModuloUFs === 'function') {
        window.iniciarModuloUFs();
      }
    }
    setTimeout(function() {
      if (typeof window.redimensionarGraficosUFs === 'function') {
        window.redimensionarGraficosUFs();
      }
    }, 100);
  } else if (isAbaMetadados) {
    if (typeof window.renderizarAbaMetadados === 'function') {
      window.renderizarAbaMetadados();
    }
  }
};

window.toggleSidebar = function() {
  const sidebar = document.getElementById('aurora-sidebar');
  if(!sidebar) return;
  if(window.innerWidth > 768) sidebar.classList.toggle('collapsed');
  else sidebar.classList.toggle('mobile-open');
};

window.addEventListener('DOMContentLoaded', function() {
  const primeiraAba = document.querySelector('.aurora-default-tab');
  if(primeiraAba) primeiraAba.click();
});
