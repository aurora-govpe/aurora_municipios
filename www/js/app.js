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
  } else if (norm.includes('uf') || norm.includes('uf') || norm.includes('comparativ') || norm.includes('bench')) {
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
  const isAbaUFs = norm.includes('uf') || norm.includes('uf') || norm.includes('comparativ') || norm.includes('bench');
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
   PAINEL EXECUTIVO INTEGRADO DE PROGRAMAS PRIORITÁRIOS (TODAS AS PAUTAS)
   ========================================================================== */
window.carregarResumoExecutivoProgramas = async function () {
    const $container = $('#tematicas_container_resumo_executivo');
    if (!$container.length) return;

    const basePath = window.basePath || '';
    
    try {
        const fetchEndpoint = async (rota) => {
            try {
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

        const fetchHabitacao = async () => {
            if (window.cacheResumoHabitacao) return window.cacheResumoHabitacao;
            const data = await fetchEndpoint('municipios/resumo/habitacao');
            if (data) window.cacheResumoHabitacao = data;
            return data;
        };

        const fetchObras = async () => {
            if (window.cacheResumoObras) return window.cacheResumoObras;
            const data = await fetchEndpoint('municipios/resumo/obras');
            if (data) window.cacheResumoObras = data;
            return data;
        };

        const [coz, agu, est, cap, hab, obr] = await Promise.all([
            fetchCozinhas(),
            fetchAguas(),
            fetchEstradas(),
            fetchCapag(),
            fetchHabitacao(),
            fetchObras()
        ]);

        renderizarCardsExecutivosProgramas(coz, agu, est, cap, hab, obr);

    } catch (err) {
        console.error("[Programas] Erro ao carregar painel integrado:", err);
    }
};

function renderizarCardsExecutivosProgramas(coz, agu, est, cap, hab, obr) {
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

        // 1. Pernambuco sem Fome (Cozinhas, Mães e Chapéu de Palha)
        const totalCoz = coz?.kpis?.total || 402;
        const funcCoz = coz?.kpis?.funcionamento || coz?.kpis?.em_funcionamento || 0;
        const totalMaes = coz?.kpis_maes?.total_beneficiarias ? Number(coz.kpis_maes.total_beneficiarias).toLocaleString('pt-BR') : '-';
        const totalPcp = coz?.kpis_pcp?.total_beneficiarios ? Number(coz.kpis_pcp.total_beneficiarios).toLocaleString('pt-BR') : '-';
        const valCofinPago = coz?.kpis_cofinanciamento?.total_pago || 0;

        // 2. Obras Públicas e Equipamentos Estruturadores
        const totalObras = obr?.kpis?.total_obras || (obr?.obras ? obr.obras.length : 0);
        const obrasExec = obr?.kpis?.em_execucao || 0;
        const obrasConcl = obr?.kpis?.concluidas || 0;
        const invObras = obr?.kpis?.investimento_total || 0;

        // 3. Creches e Pré-Escola (Filtro das obras de educação infantil)
        const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const crechesList = (obr?.obras || []).filter(o => {
            const ini = norm(o.iniciativa_estrategica || o.iniciativa_resumida || '');
            const prod = norm(o.produto || '');
            return ini.includes('60 mil') || ini.includes('creche') || prod.includes('creche') || prod.includes('pre-escola');
        });
        const totalCreches = crechesList.length;
        const crechesExec = crechesList.filter(o => {
            const s = norm(o.status);
            return s.includes('execu') || s.includes('andamento');
        }).length;
        const crechesConcl = crechesList.filter(o => {
            const s = norm(o.status);
            return s.includes('conclu') || s.includes('entreg');
        }).length;
        let invCreches = 0;
        crechesList.forEach(c => { invCreches += Number(c.valor_total) || 0; });

        // 4. Educação (Transporte Escolar)
        const totalVeiculosTransp = coz?.kpis_transporte?.total_veiculos || (coz?.transporte ? coz.transporte.reduce((acc, t) => acc + (Number(t.qtd_onibus)||0) + (Number(t.qtd_vans)||0), 0) : 0);
        const totalOnibusTransp = coz?.kpis_transporte?.total_onibus || (coz?.transporte ? coz.transporte.reduce((acc, t) => acc + (Number(t.qtd_onibus)||0), 0) : 0);
        const totalVansTransp = coz?.kpis_transporte?.total_vans || (coz?.transporte ? coz.transporte.reduce((acc, t) => acc + (Number(t.qtd_vans)||0), 0) : 0);
        let invTransp = coz?.kpis_transporte?.valor_investido || 0;
        if (!invTransp && coz?.transporte) {
            coz.transporte.forEach(t => {
                invTransp += parseFloat(String(t.valor_total || '0').replace(',', '.')) || 0;
            });
        }

        // 5. Habitação e Regularização Fundiária (Morar Bem & REURB)
        const totalUh = hab?.kpis?.total_uh || 0;
        const uhConstrucao = hab?.kpis?.construcao_uh || 0;
        const uhEntregues = hab?.kpis?.entregues_uh || 0;
        const titulosReurb = hab?.kpis_reurb?.titulos_entregues || 0;
        const invHab = hab?.kpis?.investimento_total || 0;

        // 6. Eficiência Energética e Sustentabilidade (Ilumina PE)
        const pontosIluminaExec = coz?.kpis_iluminacao?.pontos_executados || (coz?.iluminacao ? coz.iluminacao.reduce((acc, i) => acc + (Number(i.indicador)||0), 0) : 0);
        const pontosIluminaPrev = coz?.kpis_iluminacao?.pontos_previstos || (coz?.iluminacao ? coz.iluminacao.reduce((acc, i) => acc + (Number(i.indicador_secundario)||0), 0) : 0);
        const contratosIlumina = coz?.kpis_iluminacao?.total_contratos || (coz?.iluminacao ? coz.iluminacao.length : 0);
        let invIlumina = coz?.kpis_iluminacao?.valor_total || 0;
        if (!invIlumina && coz?.iluminacao) {
            coz.iluminacao.forEach(i => {
                invIlumina += parseFloat(String(i.valor_total || '0').replace(',', '.')) || 0;
            });
        }

        // 7. Águas de Pernambuco
        const totalObrasAgua = agu?.projetos ? agu.projetos.length : (agu?.kpis?.total_obras || 0);
        const invAgua = (agu?.desembolso || []).reduce((acc, d) => acc + (Number(d.valor_desembolso_m) || 0) * 1e6, 0) || (agu?.kpis?.investimento_total || 14800000000);
        const popAgua = "9,5 Mi";

        // 8. Estradas de Pernambuco
        const totalObrasEstradas = est?.kpis?.total_obras || (est?.obras ? est.obras.length : 193);
        const rodoviasEstradas = est?.kpis?.total_rodovias || (est?.rodovias_unicas ? est.rodovias_unicas.length : 81);
        const invEstradas = est?.kpis?.valor_total_bi ? est.kpis.valor_total_bi * 1e9 : 4720000000;
        const concluidasEstradas = est?.kpis?.concluidas || 129;

        // 9. CAPAG / Sustentabilidade Fiscal
        const c = cap?.contagens || {};
        const munsAptos = (Number(c['A']) || 0) + (Number(c['A+']) || 0) + (Number(c['B']) || 0) + (Number(c['B+']) || 0);
        const munsRestritos = (Number(c['C']) || 0) + (Number(c['D']) || 0);

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
                            <i class="fas fa-trowel-bricks me-1 text-orange-300"></i> ${totalObras} Obras Públicas
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-shapes me-1 text-rose-300"></i> ${totalCreches} Creches
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-bus me-1 text-yellow-300"></i> ${totalVeiculosTransp} Ônibus/Vans
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-house-chimney me-1 text-teal-300"></i> ${totalUh.toLocaleString('pt-BR')} Moradias
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-lightbulb me-1 text-emerald-300"></i> ${pontosIluminaExec.toLocaleString('pt-BR')} Pontos LED
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-droplet me-1 text-cyan-300"></i> ${formataMoedaCompacta(invAgua)} em Águas
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-road me-1 text-indigo-300"></i> ${concluidasEstradas} Rodovias Entregues
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-building-columns me-1 text-purple-300"></i> ${munsAptos} Muns CAPAG A/B
                        </span>
                    </div>
                </div>
                <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                    O plano estruturador do Governo de Pernambuco atua de ponta a ponta no território estadual: na <strong>Assistência e Segurança Alimentar</strong> com ${funcCoz} cozinhas em funcionamento, ${totalMaes} mães e ${totalPcp} beneficiários do Chapéu de Palha; na <strong>Infraestrutura e Equipamentos</strong> com ${totalObras} obras públicas ativas sob ${formataMoedaCompacta(invObras)}; na <strong>Educação e Primeira Infância</strong> com ${totalCreches} novas creches e entrega de ${totalVeiculosTransp} ônibus e vans escolares; na <strong>Habitação e Regularização Fundiária</strong> com ${totalUh.toLocaleString('pt-BR')} unidades habitacionais e ${titulosReurb.toLocaleString('pt-BR')} títulos REURB; na <strong>Sustentabilidade Energética</strong> modernizando ${pontosIluminaExec.toLocaleString('pt-BR')} pontos de LED; em <strong>Saneamento e Rodovias</strong> assegurando ${formataMoedaCompacta(invAgua)} para segurança hídrica e ${totalObrasEstradas} intervenções viárias; e na <strong>Gestão Fiscal</strong> com ${munsAptos} municípios aptos com notas A e B na CAPAG STN.
                </p>
            </div>

            <!-- GRID COMPLETO COM TODOS OS PROGRAMAS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                
                <!-- 1. SUPERAÇÃO DA POBREZA E SEGURANÇA ALIMENTAR -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #D97706;" onclick="window.alternarPautaResumos('cozinhas', document.getElementById('btn_pauta_resumo_cozinhas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-utensils text-amber-600 me-1.5"></i> Superação da Pobreza</span>
                        <span class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2">${funcCoz} Cozinhas</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Cozinhas em Operação:</span> <strong class="text-amber-700 font-bold">${funcCoz} (${totalCoz} total)</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Mães de Pernambuco:</span> <strong class="text-pink-600 font-bold">${totalMaes} mães</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Chapéu de Palha:</span> <strong class="text-amber-800 font-bold">${totalPcp} atendidos</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Cofinanciamento SAS:</span> <strong class="text-blue-700 font-bold">${formataMoedaCompacta(valCofinPago)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Rede de segurança alimentar e combate à fome integrada a transferências diretas de renda e cofinanciamento estadual da assistência social.
                    </div>
                </div>

                <!-- 2. OBRAS PÚBLICAS E EQUIPAMENTOS -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #EA580C;" onclick="window.alternarPautaResumos('obras', document.getElementById('btn_pauta_resumo_obras'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-trowel-bricks text-[#ea580c] me-1.5"></i> Obras Públicas</span>
                        <span class="badge bg-orange-50 text-[#c2410c] border border-orange-200 text-[10px] font-bold rounded-pill px-2">${totalObras} Obras</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Total de Contratos:</span> <strong class="text-slate-800 font-bold">${totalObras}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Em Execução:</span> <strong class="text-amber-600 font-bold">${obrasExec} canteiros</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Obras Entregues:</span> <strong class="text-emerald-600 font-bold">${obrasConcl}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Global:</span> <strong class="text-blue-600 font-bold">${formataMoedaCompacta(invObras)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Construção, requalificação e entrega de equipamentos comunitários e estruturadores da SEDUH e CEHAB em todo o território estadual.
                    </div>
                </div>

                <!-- 3. CRECHES E EDUCAÇÃO INFANTIL -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #F43F5E;" onclick="window.alternarPautaResumos('creches', document.getElementById('btn_pauta_resumo_creches'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-shapes text-rose-500 me-1.5"></i> Creches &amp; Pré-Escola</span>
                        <span class="badge bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-pill px-2">${totalCreches} Creches</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Total de Unidades:</span> <strong class="text-slate-800 font-bold">${totalCreches}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Em Obras / Construção:</span> <strong class="text-amber-600 font-bold">${crechesExec} ativas</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Creches Entregues:</span> <strong class="text-emerald-600 font-bold">${crechesConcl}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Previsto:</span> <strong class="text-rose-700 font-bold">${formataMoedaCompacta(invCreches)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Meta prioritária do Governo de Pernambuco com abertura de 60 mil vagas em creches para ampliação do atendimento infantil e apoio às famílias.
                    </div>
                </div>

                <!-- 4. EDUCAÇÃO / TRANSPORTE ESCOLAR -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #EAB308;" onclick="window.alternarPautaResumos('educacao', document.getElementById('btn_pauta_resumo_educacao'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-bus-school text-yellow-500 me-1.5"></i> Transporte Escolar</span>
                        <span class="badge bg-yellow-50 text-yellow-800 border border-yellow-200 text-[10px] font-bold rounded-pill px-2">${totalVeiculosTransp} Veículos</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Frota Total Entregue:</span> <strong class="text-amber-700 font-bold">${totalVeiculosTransp}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Ônibus Escolares:</span> <strong class="text-yellow-700 font-bold">${totalOnibusTransp}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Vans Escolares:</span> <strong class="text-sky-700 font-bold">${totalVansTransp}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Total:</span> <strong class="text-emerald-700 font-bold">${formataMoedaCompacta(invTransp)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Renovação e expansão da frota própria escolar municipal garantindo segurança, acessibilidade e combate à evasão em todos os 185 municípios.
                    </div>
                </div>

                <!-- 5. HABITAÇÃO E REGULARIZAÇÃO FUNDIÁRIA -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #0D9488;" onclick="window.alternarPautaResumos('habitacao', document.getElementById('btn_pauta_resumo_habitacao'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-house-chimney text-teal-600 me-1.5"></i> Habitação &amp; REURB</span>
                        <span class="badge bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold rounded-pill px-2">${totalUh.toLocaleString('pt-BR')} UH</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Total Morar Bem PE:</span> <strong class="text-teal-700 font-bold">${totalUh.toLocaleString('pt-BR')} UH</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Em Construção:</span> <strong class="text-amber-600 font-bold">${uhConstrucao.toLocaleString('pt-BR')} UH</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Entregues / Concluídas:</span> <strong class="text-emerald-600 font-bold">${uhEntregues.toLocaleString('pt-BR')} UH</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Títulos REURB Entregues:</span> <strong class="text-blue-700 font-bold">${titulosReurb.toLocaleString('pt-BR')}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Programa Morar Bem integrado com modalidades FAR, FDS, Entrada Garantida e Reforma no Lar junto à segurança jurídica da regularização fundiária.
                    </div>
                </div>

                <!-- 6. EFICIÊNCIA ENERGÉTICA (ILUMINA PE) -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #10B981;" onclick="window.alternarPautaResumos('iluminacao', document.getElementById('btn_pauta_resumo_iluminacao'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-lightbulb text-emerald-500 me-1.5"></i> Eficiência Energética</span>
                        <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-pill px-2">${pontosIluminaExec.toLocaleString('pt-BR')} LED</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Pontos LED Executados:</span> <strong class="text-emerald-700 font-bold">${pontosIluminaExec.toLocaleString('pt-BR')}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Meta Prevista:</span> <strong class="text-slate-800 font-bold">${pontosIluminaPrev.toLocaleString('pt-BR')}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Contratos / Etapas:</span> <strong class="text-slate-800 font-bold">${contratosIlumina}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Ilumina PE:</span> <strong class="text-blue-700 font-bold">${formataMoedaCompacta(invIlumina)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Modernização de parques de iluminação pública com luminárias de LED de alta eficiência, reduzindo consumo de energia e custos operacionais municipais.
                    </div>
                </div>

                <!-- 7. ÁGUAS DE PERNAMBUCO -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #0284C7;" onclick="window.alternarPautaResumos('aguas', document.getElementById('btn_pauta_resumo_aguas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-droplet text-sky-600 me-1.5"></i> Segurança Hídrica</span>
                        <span class="badge bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-pill px-2">${formataMoedaCompacta(invAgua)}</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Total de Obras Hídricas:</span> <strong class="text-slate-800 font-bold">${totalObrasAgua}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">População Alcançada:</span> <strong class="text-slate-800 font-bold">${popAgua} hab.</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Rede de Adutoras:</span> <strong class="text-blue-600 font-bold">100% Mapeada</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Plurianual:</span> <strong class="text-sky-700 font-bold">${formataMoedaCompacta(invAgua)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Intervenções estruturantes de adutoras, barragens e saneamento da COMPESA/SRHS garantindo segurança hídrica e universalização do abastecimento.
                    </div>
                </div>

                <!-- 8. ESTRADAS DE PERNAMBUCO -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #4F46E5;" onclick="window.alternarPautaResumos('estradas', document.getElementById('btn_pauta_resumo_estradas'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-road text-indigo-600 me-1.5"></i> Conectividade Logística</span>
                        <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-pill px-2">${totalObrasEstradas} Obras</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Contratos DER-PE:</span> <strong class="text-slate-800 font-bold">${totalObrasEstradas}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Rodovias Mapeadas:</span> <strong class="text-indigo-700 font-bold">${rodoviasEstradas}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Obras Concluídas:</span> <strong class="text-emerald-700 font-bold">${concluidasEstradas}</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Investimento Global:</span> <strong class="text-slate-800 font-bold">${formataMoedaCompacta(invEstradas)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Programa rodoviário de restauração, duplicação e manutenção das rodovias estaduais dinamizando eixos logísticos e conectividade regional.
                    </div>
                </div>

                <!-- 9. CAPACIDADE FISCAL DOS MUNICÍPIOS -->
                <div class="resumo-dim-card cursor-pointer hover:shadow-md transition-all" style="border-top: 4px solid #9333EA;" onclick="window.alternarPautaResumos('capag', document.getElementById('btn_pauta_resumo_capag'))">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-building-columns text-purple-600 me-1.5"></i> Sustentabilidade Fiscal</span>
                        <span class="badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-pill px-2">${munsAptos} Aptos</span>
                    </div>
                    <div class="space-y-1 mb-2.5 text-xs">
                        <div class="d-flex justify-content-between"><span class="text-slate-500">CAPAG A/B (Aptos STN):</span> <strong class="text-emerald-700 font-bold">${munsAptos} municípios</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">CAPAG C/D (Restritos):</span> <strong class="text-rose-700 font-bold">${munsRestritos} municípios</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Apoio aos Municípios:</span> <strong class="text-purple-700 font-bold">185 Prefeituras</strong></div>
                        <div class="d-flex justify-content-between"><span class="text-slate-500">Parcerias e Convênios:</span> <strong class="text-slate-800 font-bold">SEPLAG / STN</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal">
                        Classificação da capacidade de pagamento dos entes municipais balizando captação de créditos com garantia da União e convênios estruturadores.
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



window.togglePainelExecutivoProgramas = function() {
  const $cont = $('#tematicas_container_resumo_executivo');
  const $icon = $('#icon_toggle_painel_programas');
  const $txt = $('#txt_toggle_painel_programas');
  if ($cont.is(':visible')) {
    $cont.slideUp(200);
    $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    $txt.text('Expandir Painel');
  } else {
    $cont.slideDown(200);
    $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    $txt.text('Recolher Painel');
  }
};
