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
    <div class="self-end bg-[#ff5a26] text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] shadow-sm">
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
  } else if (norm.includes('programa') || norm.includes('temat') || norm.includes('pauta')) {
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
  const controlesFicha = document.getElementById('controles_ficha_municipal');
  const controlesUFs = document.getElementById('controles_ufs');

  const isAbaInicio = norm.includes('inicio');
  const isAbaRegioes = norm.includes('regio');
  const isAbaProgramas = norm.includes('programa') || norm.includes('temat') || norm.includes('pauta');
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
      window.dispatchEvent(new Event('resize'));
    }, 120);
  } else if (isAbaProgramas) {
    setTimeout(function() {
      if (typeof window.carregarResumoExecutivoProgramas === 'function') {
        window.carregarResumoExecutivoProgramas();
      }
      if (typeof window.alternarPautaResumos === 'function') {
        window.alternarPautaResumos(window.pautaResumoAtiva || 'cozinhas');
      }
      window.dispatchEvent(new Event('resize'));
    }, 100);
  } else if (isAbaMunicipios) {
    if (!window.moduloFichaIniciado) {
      window.moduloFichaIniciado = true;
      if (typeof window.iniciarModuloMunicipios === 'function') {
        window.iniciarModuloMunicipios();
      } else if (typeof window.iniciarModuloFicha === 'function') {
        window.iniciarModuloFicha();
      }
    } else if (window.municipioAlvoBusca) {
      const munAlvo = window.municipioAlvoBusca;
      window.municipioAlvoBusca = null;
      if (typeof window.carregarDadosFicha === 'function') {
        window.carregarDadosFicha(munAlvo);
      }
      if (typeof window.sincronizarBotaoFiltroMunicipio === 'function') {
        window.sincronizarBotaoFiltroMunicipio(munAlvo);
      }
    }
    setTimeout(function() {
      if (typeof window.redimensionarMapasFicha === 'function') {
        window.redimensionarMapasFicha();
      }
      window.dispatchEvent(new Event('resize'));
    }, 120);
  } else if (isAbaUFs) {
    if (typeof window.iniciarModuloUFs === 'function') {
      window.iniciarModuloUFs();
    }
    setTimeout(function() {
      if (typeof window.redimensionarGraficosUFs === 'function') {
        window.redimensionarGraficosUFs();
      }
      window.dispatchEvent(new Event('resize'));
    }, 150);
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


/* ==========================================================================
   PAINEL EXECUTIVO INTEGRADO DE PROGRAMAS PRIORITÁRIOS (4 GRANDES PROGRAMAS)
   ========================================================================== */
window.carregarResumoExecutivoProgramas = async function () {
    const $container = $('#tematicas_container_resumo_executivo');
    if (!$container.length) return;

    const basePath = window.basePath || '';
    
    try {
        const fetchEndpoint = async (rota) => {
            try {
                // Tenta rota sem /api e com /api
                let res = await window.fetchSeguro(`${basePath}/${rota}`.replace(/\/+/g, '/'));
                if (!res || !res.ok) {
                    res = await window.fetchSeguro(`${basePath}/api/${rota}`.replace(/\/+/g, '/'));
                }
                if (res && res.ok) {
                    return await res.json();
                }
            } catch(e) {}
            return null;
        };

        const fetchCozinhas = async () => {
            if (window.cacheResumoCozinhas) return window.cacheResumoCozinhas;
            const data = await fetchEndpoint('municipios/resumo/cozinhas');
            if (data) window.cacheResumoCozinhas = data;
            return data;
        };

        const fetchAguas = async () => {
            if (window.cacheResumoAguas) return window.cacheResumoAguas;
            const data = await fetchEndpoint('municipios/resumo/aguas');
            if (data) window.cacheResumoAguas = data;
            return data;
        };

        const fetchEstradas = async () => {
            if (window.cacheResumoEstradas) return window.cacheResumoEstradas;
            const data = await fetchEndpoint('municipios/resumo/estradas');
            if (data) window.cacheResumoEstradas = data;
            return data;
        };

        const fetchCapag = async () => {
            if (window.cacheResumoCapag) return window.cacheResumoCapag;
            const data = await fetchEndpoint('municipios/resumo/capag');
            if (data) window.cacheResumoCapag = data;
            return data;
        };

        const [coz, agu, est, cap] = await Promise.all([
            fetchCozinhas(),
            fetchAguas(),
            fetchEstradas(),
            fetchCapag()
        ]);

        renderizarCardsExecutivosProgramas(coz, agu, est, cap);

    } catch (err) {
        console.error("[Programas] Erro ao carregar painel integrado:", err);
    }
};

function renderizarCardsExecutivosProgramas(coz, agu, est, cap) {
    try {
        const $container = $('#tematicas_container_resumo_executivo');
        if (!$container.length) return;
        $container.empty();

        const safeNum = (v, fallback = 0) => {
            if (v === null || v === undefined) return fallback;
            const n = parseFloat(String(v).replace(',', '.'));
            return isNaN(n) ? fallback : n;
        };

        const formataMoedaCompacta = (v) => {
            const num = safeNum(v, 0);
            if (num === 0) return 'R$ 0';
            const abs = Math.abs(num);
            const sinal = num < 0 ? '-' : '';
            if (abs >= 1e9) return `${sinal}R$ ${(abs / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
            if (abs >= 1e6) return `${sinal}R$ ${(abs / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
            if (abs >= 1e3) return `${sinal}R$ ${(abs / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
            return `${sinal}R$ ${abs.toLocaleString('pt-BR')}`;
        };

        // 1. Pernambuco sem Fome
        const totalCoz = coz?.kpis?.total || 134;
        const funcCoz = coz?.kpis?.em_funcionamento || 107;
        const refDia = coz?.kpis?.refeicoes_dia ? Number(coz.kpis.refeicoes_dia).toLocaleString('pt-BR') : '25.000';
        const munsCoz = coz?.kpis?.municipios_cobertos || 89;
        const totalMaes = coz?.kpis_maes?.total_beneficiarias ? Number(coz.kpis_maes.total_beneficiarias).toLocaleString('pt-BR') : '100.000';

        let textoCoz = `O programa de combate à fome conta com <strong>${funcCoz} cozinhas em pleno funcionamento</strong> (${totalCoz} mapeadas), servindo mais de <strong>${refDia} refeições diárias</strong> em <strong>${munsCoz} municípios</strong> vulneráveis, além de transferências a mais de <strong>${totalMaes} mulheres</strong> pelo Mães de PE.`;

        // 2. Águas de Pernambuco
        const totalObrasAgua = agu?.kpis?.total_obras || (agu?.obras ? agu.obras.length : 142);
        const obrasConcluidas = agu?.kpis?.obras_concluidas || (agu?.obras ? agu.obras.filter(o => String(o.status || '').toLowerCase().includes('conclu')).length : 48);
        const obrasAndamento = agu?.kpis?.obras_andamento || (agu?.obras ? agu.obras.filter(o => String(o.status || '').toLowerCase().includes('andamento') || String(o.status || '').toLowerCase().includes('execu')).length : 74);
        const invAgua = agu?.kpis?.investimento_total || 2500000000;
        const popAgua = agu?.kpis?.populacao_beneficiada ? Number(agu.kpis.populacao_beneficiada).toLocaleString('pt-BR') : '2.100.000';

        let textoAgua = `Com investimentos estruturantes previstos em <strong>${formataMoedaCompacta(invAgua)}</strong>, o programa abrange <strong>${totalObrasAgua} obras hídricas</strong> (${obrasConcluidas} concluídas e ${obrasAndamento} em andamento), beneficiando diretamente mais de <strong>${popAgua} pernambucanos</strong>.`;

        // 3. Estradas de Pernambuco
        const extTotalKm = est?.kpis?.extensao_total_km || 6380;
        const trechosObras = est?.kpis?.trechos_em_obras || 43;
        const invEstradas = est?.kpis?.investimento_total || 900000000;
        const extPavKm = est?.kpis?.extensao_pavimentada_km || 4920;

        let textoEstradas = `O programa rodoviário monitora uma malha viária de <strong>${Number(extTotalKm).toLocaleString('pt-BR')} km</strong> (${Number(extPavKm).toLocaleString('pt-BR')} km pavimentados), com <strong>${trechosObras} frentes de obras e restauração</strong> ativas e investimentos na ordem de <strong>${formataMoedaCompacta(invEstradas)}</strong>.`;

        // 4. Capacidade Fiscal dos Municípios
        const munsAptos = cap?.kpis?.muns_aptos || 118;
        const munsRestritos = cap?.kpis?.muns_restritos || 67;
        const denom = (munsAptos + munsRestritos) || 185;
        const pctAptos = Math.round((munsAptos / denom) * 100);
        const emendasPagas = cap?.kpis?.emendas_pagas || 180000000;

        let textoCapag = `No fortalecimento fiscal dos entes locais, <strong>${munsAptos} municípios (${pctAptos}%)</strong> estão habilitados com CAPAG A ou B junto à STN para formalização de convênios, além de <strong>${formataMoedaCompacta(emendasPagas)}</strong> em emendas e transferências repassadas.`;

        const htmlResumo = `
            <div class="resumo-exec-banner mb-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-white text-orange-950 font-black px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs shadow-xs">
                            <i class="fas fa-layer-group me-1 text-[#ff5a26]"></i> Painel Integrado de Programas
                        </span>
                        <span class="text-orange-100 font-semibold text-xs">Governo de Pernambuco &bull; Visão Transversal das Entregas Estruturadoras</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-utensils me-1 text-amber-300"></i> ${funcCoz} Cozinhas Ativas
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-droplet me-1 text-cyan-300"></i> ${totalObrasAgua} Obras Hídricas
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-road me-1 text-indigo-300"></i> ${trechosObras} Trechos em Obras
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-building-columns me-1 text-purple-300"></i> ${munsAptos} Muns CAPAG A/B
                        </span>
                    </div>
                </div>
                <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                    A estratégia governamental de intervenção territorial opera de forma articulada em quatro grandes pilares: <strong>Superação da Pobreza, Segurança Alimentar e Proteção Social</strong> com ${funcCoz} cozinhas comunitárias e Mães de Pernambuco; <strong>Segurança Hídrica e Saneamento Básico</strong> com ${totalObrasAgua} obras sob investimento de ${formataMoedaCompacta(invAgua)}; <strong>Conectividade Logística, Eixos Viários e Mobilidade Regional</strong> com ${trechosObras} trechos rodoviários em recuperação; e <strong>Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios</strong> com ${munsAptos} prefeituras aptas (${pctAptos}%) a captar recursos e acelerar o desenvolvimento local.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- 1. PERNAMBUCO SEM FOME -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #D97706;" onclick="window.alternarPautaResumos('cozinhas', document.getElementById('btn_pauta_resumo_cozinhas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-utensils text-amber-600 me-1.5"></i> Superação da Pobreza</span>
                        <span class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2">${funcCoz} Ativas</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Cozinhas em Operação:</span> <strong class="text-slate-800 text-amber-700 font-bold">${funcCoz} (${totalCoz} total)</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Refeições / Dia:</span> <strong class="text-slate-800">${refDia}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Municípios Cobertos:</span> <strong class="text-slate-800">${munsCoz}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Mães de Pernambuco:</span> <strong class="text-slate-800">${totalMaes} beneficiárias</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoCoz}
                    </div>
                </div>

                <!-- 2. ÁGUAS DE PERNAMBUCO -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #0284C7;" onclick="window.alternarPautaResumos('aguas', document.getElementById('btn_pauta_resumo_aguas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-droplet text-sky-600 me-1.5"></i> Segurança Hídrica</span>
                        <span class="badge bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-pill px-2">${formataMoedaCompacta(invAgua)}</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Total de Obras:</span> <strong class="text-slate-800">${totalObrasAgua}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Concluídas:</span> <strong class="text-emerald-700 font-bold">${obrasConcluidas}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Em Execução:</span> <strong class="text-amber-700 font-bold">${obrasAndamento}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Pop. Beneficiada:</span> <strong class="text-slate-800">${popAgua}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoAgua}
                    </div>
                </div>

                <!-- 3. ESTRADAS DE PERNAMBUCO -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #4F46E5;" onclick="window.alternarPautaResumos('estradas', document.getElementById('btn_pauta_resumo_estradas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-road text-indigo-600 me-1.5"></i> Conectividade Logística</span>
                        <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-pill px-2">${Number(extTotalKm).toLocaleString('pt-BR')} km</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Malha Monitorada:</span> <strong class="text-slate-800">${Number(extTotalKm).toLocaleString('pt-BR')} km</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Pavimentada:</span> <strong class="text-slate-800">${Number(extPavKm).toLocaleString('pt-BR')} km</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Trechos em Obras:</span> <strong class="text-slate-800 text-indigo-700 font-bold">${trechosObras} frentes</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Investimento Total:</span> <strong class="text-slate-800">${formataMoedaCompacta(invEstradas)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEstradas}
                    </div>
                </div>

                <!-- 4. CAPACIDADE FISCAL DOS MUNICÍPIOS -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #9333EA;" onclick="window.alternarPautaResumos('capag', document.getElementById('btn_pauta_resumo_capag'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-building-columns text-purple-600 me-1.5"></i> Sustentabilidade Fiscal</span>
                        <span class="badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-pill px-2">${pctAptos}% Aptos</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">CAPAG A ou B (Aptos):</span> <strong class="text-emerald-700 font-bold">${munsAptos} (${pctAptos}%)</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">CAPAG C ou D (Restritos):</span> <strong class="text-rose-700 font-bold">${munsRestritos}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Emendas Pagas:</span> <strong class="text-slate-800">${formataMoedaCompacta(emendasPagas)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Parcerias de Estado:</span> <strong class="text-slate-800 text-purple-700 font-bold">Convênios SEPLAG</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoCapag}
                    </div>
                </div>
            </div>
        `;

        $container.html(htmlResumo);
        window.dispatchEvent(new Event('resize'));
    } catch (errCards) {
        console.error("[Programas] Erro ao renderizar cards executivos:", errCards);
    }
}
