// www/js/app.js

window.onload = function() { 
  window.iniciarApp(); 
};

window.iniciarApp = function() {
  console.log("[MASTER] Iniciando App Aurora...");
  document.body.classList.add('logado');
  
  // Inicialização do módulo ativo inicial (UFs)
  if (typeof window.iniciarModuloUFs === 'function') {
    window.iniciarModuloUFs();
  } else if (typeof window.iniciarModuloRegioes === 'function') {
    window.iniciarModuloRegioes();
  }

  // O módulo Municípios agora é LAZY e será carregado somente quando sua aba for ativada
};

// ==========================================
// LÓGICA DO CHAT AURORA
// ==========================================

window.toggleAuroraChat = function() {
  const container = document.getElementById("aurora-chat-container");
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

  // 1. Adiciona a mensagem do usuário na tela de forma segura
  msgArea.insertAdjacentHTML('beforeend', `
    <div class="self-end bg-[#0C2856] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
      ${mensagem}
    </div>
  `);
  inputEl.value = "";
  msgArea.scrollTop = msgArea.scrollHeight;

  // 2. Adiciona indicador de "digitando..."
  const typingId = "typing-" + Date.now();
  msgArea.insertAdjacentHTML('beforeend', `
    <div id="${typingId}" class="self-start bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm flex items-center gap-2">
      <i class="fas fa-circle-notch fa-spin"></i> Aurora está pensando...
    </div>
  `);
  msgArea.scrollTop = msgArea.scrollHeight;

  try {
    // 3. Envia para a API Plumber
    const res = await window.fetchSeguro(`${window.basePath || ''}/api/aurora/perguntar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: mensagem })
    });
    
    if (!res.ok) throw new Error(`Erro na API (Status ${res.status})`);
    
    const data = await res.json();
    
    // 4. Remove "digitando..."
    const typEl = document.getElementById(typingId);
    if (typEl) typEl.remove();

    // 5. Converte o Markdown da IA para HTML nativo
    const htmlResposta = (typeof marked !== 'undefined' && marked.parse)
      ? marked.parse(data.resposta || "")
      : (data.resposta || "").replace(/\n/g, '<br>');

    // 6. Insere a resposta formatada
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

// Permite enviar a mensagem pressionando Enter
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("aurora-chat-input")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") window.enviarMensagemAurora();
  });
});

window.usarPerguntaPronta = function(texto) {
    const inputEl = document.getElementById("aurora-chat-input");
    if (!inputEl) return;
    
    // Se o chat estiver fechado, abre automaticamente
    const container = document.getElementById("aurora-chat-container");
    if (container && container.classList.contains("scale-0")) {
        window.toggleAuroraChat();
    }
    
    inputEl.value = texto;
    window.enviarMensagemAurora();
};

window.moduloFichaIniciado = false;

window.scrollToSection = function (id) {
  if (id === 'aba_ficha' || id === 'aba_regioes' || id === 'topo') {
    const container = document.querySelector('.aurora-content-area');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.mudarAbaAurora = function(nomeAba, elemento) {
  document.querySelectorAll('.tab-pane').forEach(function(el) { el.classList.remove('active', 'show'); });
  let alvo = document.querySelector(".tab-pane[data-value='" + nomeAba + "']");
  if (!alvo && (nomeAba === 'Municípios' || nomeAba === 'Ficha Municipal')) {
    alvo = document.getElementById('aba_ficha');
  }
  if(alvo) alvo.classList.add('active', 'show');

  const container = elemento ? elemento.closest('.d-flex') : null;
  if (container) {
    container.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('btn-primary', 'shadow-sm');
      btn.classList.add('btn-light', 'text-slate-700');
    });
    elemento.classList.remove('btn-light', 'text-slate-700');
    elemento.classList.add('btn-primary', 'shadow-sm');
  }

  const controlesFicha = document.getElementById('controles_ficha_municipal');
  const controlesRegional = document.getElementById('controles_regioes');
  const controlesUFs = document.getElementById('controles_ufs');
  const isAbaMunicipios = (nomeAba === 'Municípios' || nomeAba === 'Ficha Municipal');
  const isAbaUFs = (nomeAba === 'UFs');

  if (controlesUFs) {
    if (isAbaUFs) {
      controlesUFs.classList.remove('d-none');
      controlesUFs.classList.add('d-flex');
    } else {
      controlesUFs.classList.remove('d-flex');
      controlesUFs.classList.add('d-none');
    }
  }

  if (controlesFicha) {
    if (isAbaMunicipios) {
      controlesFicha.classList.remove('d-none');
      controlesFicha.classList.add('d-flex');
      
      const subResumos = document.getElementById('subaba_resumos_municipais');
      const isSubResumos = subResumos && !subResumos.classList.contains('d-none');
      const selectContainer = controlesFicha.querySelector('.form-select-municipio')?.closest('.d-flex');
      const navContainer = document.getElementById('ficha_navbar_nav');
      if (selectContainer) {
        if (isSubResumos) selectContainer.classList.add('d-none');
        else selectContainer.classList.remove('d-none');
      }
      if (navContainer) {
        if (isSubResumos) navContainer.classList.add('d-none');
        else navContainer.classList.remove('d-none');
      }
    } else {
      controlesFicha.classList.remove('d-flex');
      controlesFicha.classList.add('d-none');
    }
  }

  if (controlesRegional) {
    if (nomeAba === 'Regiões') {
      controlesRegional.classList.remove('d-none');
      controlesRegional.classList.add('d-flex');
    } else {
      controlesRegional.classList.remove('d-flex');
      controlesRegional.classList.add('d-none');
    }
  }

  // --- CONTROLE DE CICLO DE VIDA (LAZY LOADING E RESIZE) ---
  if (isAbaUFs) {
    if (!window.moduloUFsIniciado) {
      if (typeof window.iniciarModuloUFs === 'function') {
        window.iniciarModuloUFs();
      }
    } else {
      setTimeout(function() {
        if (typeof window.redimensionarGraficosUFs === 'function') {
          window.redimensionarGraficosUFs();
        }
      }, 80);
    }
  } else if (isAbaMunicipios) {
    if (!window.moduloFichaIniciado) {
      window.moduloFichaIniciado = true;
      if (typeof window.iniciarModuloMunicipios === 'function') {
        window.iniciarModuloMunicipios();
      } else if (typeof window.iniciarModuloFicha === 'function') {
        window.iniciarModuloFicha();
      }
    } else {
      setTimeout(function() {
        if (typeof window.redimensionarMapasFicha === 'function') {
          window.redimensionarMapasFicha();
        }
      }, 80);
    }
  } else if (nomeAba === 'Regiões') {
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
    }, 80);
  } else if (nomeAba === 'Metadados') {
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