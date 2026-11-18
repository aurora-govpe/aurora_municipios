// ==========================================================================
// MÓDULO: BENCHMARKING DE UFs (5 EIXOS ESTRATÉGICOS E DADOS FISCAIS)
// ==========================================================================

var dadosMasterFiscalUFs = [];
var dadosSocioAmbientaisUFs = {}; // Cache por UF
var benchmarksRegiaoUFs = [];
var fatoresIPCAUFs = {};
var dicionarioPeriodosUFs = {};
window.usarValoresReaisUFs = false;
window.moduloUFsIniciado = false;
var chartModalUFsSerie = null;
var chartModalUFsRanking = null;

// Dicionário Unificado de Metadados para Indicadores das UFs (carregado via API/JSON)
var dicionarioMetadadosUFs = {};

// Lista oficial das UFs do Nordeste
const UFS_NORDESTE = ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"];

// Nomes curtos dos meses para formatação
const MESES_CURTOS_UFS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ==========================================================================
// HELPERS TEMPORAIS (SUPORTE A SÉRIES ANUAIS E MENSAIS)
// ==========================================================================

function extrairInfoTemporalSocio(row) {
    let ano = 0;
    let mes = 0;

    // 1. Tenta extrair mês explícito de colunas comuns
    const rawMes = row.mes ?? row.nr_mes ?? row.mes_referencia ?? row.periodo ?? null;
    if (rawMes !== null && rawMes !== undefined && rawMes !== '') {
        const mStr = String(rawMes).trim();
        if (/^\d{4}-\d{1,2}/.test(mStr)) {
            const parts = mStr.split('-');
            ano = parseInt(parts[0], 10);
            mes = parseInt(parts[1], 10);
        } else {
            mes = parseInt(mStr, 10) || 0;
        }
    }

    // 2. Extrai ano (ou formato YYYY-MM / MM/YYYY embutido em ano/data)
    if (!ano && row.ano !== undefined && row.ano !== null) {
        const aStr = String(row.ano).trim();
        if (/^\d{4}-\d{1,2}/.test(aStr)) {
            const parts = aStr.split('-');
            ano = parseInt(parts[0], 10);
            if (!mes) mes = parseInt(parts[1], 10);
        } else if (/^\d{1,2}\/\d{4}$/.test(aStr)) {
            const parts = aStr.split('/');
            if (!mes) mes = parseInt(parts[0], 10);
            ano = parseInt(parts[1], 10);
        } else {
            ano = parseInt(aStr, 10) || 0;
        }
    }

    // 3. Fallback caso venha em campo data/competencia
    if ((!ano || !mes) && (row.data || row.competencia)) {
        const dStr = String(row.data || row.competencia).trim();
        if (/^\d{4}-\d{1,2}/.test(dStr)) {
            const parts = dStr.split('-');
            if (!ano) ano = parseInt(parts[0], 10);
            if (!mes) mes = parseInt(parts[1], 10);
        } else if (/^\d{1,2}\/\d{4}$/.test(dStr)) {
            const parts = dStr.split('/');
            if (!mes) mes = parseInt(parts[0], 10);
            if (!ano) ano = parseInt(parts[1], 10);
        }
    }

    const isMensal = mes >= 1 && mes <= 12;
    const sortKey = ano * 100 + (isMensal ? mes : 0);
    const label = isMensal
        ? `${MESES_CURTOS_UFS[mes - 1]}/${String(ano).slice(-2)}`
        : String(ano);
    const labelCompleto = isMensal
        ? `${MESES_CURTOS_UFS[mes - 1]}/${ano}`
        : String(ano);

    return { ano, mes: isMensal ? mes : 0, isMensal, sortKey, label, labelCompleto };
}

// Helper que garante a presença de Nordeste (NE) e Brasil (BR) em qualquer ranking
function garantirBenchmarksRegionais(rankingArr, config) {
    if (!rankingArr || rankingArr.length === 0) return rankingArr;

    // Define se a agregação automática deve ser média (taxas, %, índices, R$/ha) ou soma (absolutos, R$ totais)
    const usarMedia = config.isPct || config.isIndice || config.isPerCapita || config.isMoedaUnit;

    const temNE = rankingArr.some(d => d.uf === 'Nordeste (NE)');
    const temBR = rankingArr.some(d => d.uf === 'Brasil (BR)');

    // Filtra apenas as UFs reais (exclui benchmarks já existentes)
    const apenasUFs = rankingArr.filter(d => !d.isBenchmark && d.uf.length === 2);

    if (!temNE && apenasUFs.length > 0) {
        const ufsNE = apenasUFs.filter(d => UFS_NORDESTE.includes(d.uf.toUpperCase()));
        if (ufsNE.length > 0) {
            const somaNE = ufsNE.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
            const valNE = usarMedia ? (somaNE / ufsNE.length) : somaNE;
            rankingArr.push({
                uf: 'Nordeste (NE)',
                valor: valNE,
                isBenchmark: true
            });
        }
    }

    if (!temBR && apenasUFs.length > 0) {
        const somaBR = apenasUFs.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
        const valBR = usarMedia ? (somaBR / apenasUFs.length) : somaBR;
        rankingArr.push({
            uf: 'Brasil (BR)',
            valor: valBR,
            isBenchmark: true
        });
    }

    return rankingArr;
}


// Helper de Normalização de String para Busca de Metadados
function normKeyUFs(str) {
    return String(str || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca Metadados do Indicador (Dicionário Local UFs ou Metadados Globais da Ficha)
function buscarMetadadoUFs(siglaOrKey) {
    if (!siglaOrKey) return null;

    // 1. Busca exata no dicionário UFs
    if (dicionarioMetadadosUFs[siglaOrKey]) {
        return dicionarioMetadadosUFs[siglaOrKey];
    }

    // 2. Busca normalizada no dicionário UFs
    const sNorm = normKeyUFs(siglaOrKey);
    for (const k in dicionarioMetadadosUFs) {
        if (normKeyUFs(k) === sNorm) {
            return dicionarioMetadadosUFs[k];
        }
    }

    // 3. Busca no dicionário global de metadados da Ficha
    if (window.dadosMetadados && Array.isArray(window.dadosMetadados)) {
        const found = window.dadosMetadados.find(m => 
            normKeyUFs(m.cd_indicador) === sNorm || normKeyUFs(m.nm_indicador) === sNorm
        );
        if (found) return found;
    }

    return null;
}

// Abre o Modal de Metadados (reutiliza o modal unificado #modalMetadado)
window.abrirModalMetadadoUFs = function(siglaOrKey, tipoDado) {
    const meta = buscarMetadadoUFs(siglaOrKey) || {};
    const ref = meta.referencia_analise || {};

    const titulo   = meta.nm_indicador || meta.nm_fantasia || siglaOrKey;
    const badge    = meta.natureza || (tipoDado === 'fiscal' ? 'Contábil / Fiscal' : 'Socioambiental');
    const desc     = ref.interpretacao || meta.interpretacao || 'Indicador estratégico de acompanhamento federativo e benchmarking das UFs.';
    const impacto  = ref.impacto_planejamento || meta.impacto_planejamento || 'Subsidia a análise comparativa de eficiência e alocação de recursos públicos entre os Estados.';
    const limiar   = ref.limiar_corte || meta.limiar_corte || '-';
    const direcao  = ref.direcao_desejavel || meta.direcao_desejavel || '-';
    const fonte    = meta.fonte || 'Bases Oficiais / Órgão Setorial';
    const link     = meta.hiperlink || '';

    $('#modalMetadadoTitle').text(titulo);
    $('#modalMetadadoBadge').text(badge);
    $('#modalMetadadoDesc').text(desc);
    $('#modalMetadadoImpacto').text(impacto);
    $('#modalMetadadoLimiar').text(limiar);
    $('#modalMetadadoDirecao').text(direcao);

    // Renderização da Fórmula KaTeX
    const formulaEl = document.getElementById('modalMetadadoFormula');
    if (formulaEl) {
        if (meta.formula_katex && typeof katex !== 'undefined') {
            try {
                katex.render(meta.formula_katex, formulaEl, { displayMode: true, throwOnError: false });
            } catch (e) {
                formulaEl.innerText = meta.formula_katex;
            }
        } else {
            formulaEl.innerText = meta.formula_katex || 'Fórmula sob apuração contábil / metodológica do órgão de origem.';
        }
    }

    // Renderização de Fonte e Hiperlink (cria o bloco dinamicamente no modal se não existir no HTML)
    let fonteBox = document.getElementById('modalMetadadoFonteContainer');
    if (!fonteBox) {
        const modalBody = document.querySelector('#modalMetadado .modal-body');
        if (modalBody) {
            fonteBox = document.createElement('div');
            fonteBox.id = 'modalMetadadoFonteContainer';
            fonteBox.className = 'mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2';
            modalBody.appendChild(fonteBox);
        }
    }

    if (fonteBox) {
        const botaoLinkHtml = link
            ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                   <i class="fas fa-arrow-up-right-from-square me-1"></i> Acessar Fonte Oficial
               </a>`
            : '';

        fonteBox.innerHTML = `
            <div class="text-muted small">
                <i class="fas fa-database text-primary me-1"></i>
                <strong>Fonte:</strong> <span id="modalMetadadoFonteTexto">${fonte}</span>
            </div>
            ${botaoLinkHtml}
        `;
    }

    const modalEl = document.getElementById('modalMetadado');
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
};

// Retorna o Badge de Polaridade / Sinalização no padrão de Municípios
function obterBadgePolaridadeUFs(siglaOrKey, tipoDado, config, polaridadeDb) {
    // 1. Prioridade absoluta: coluna polaridade do banco de dados ('positiva' ou 'negativa')
    if (polaridadeDb) {
        const pol = String(polaridadeDb).toLowerCase();
        if (pol === 'positiva') {
            return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: Quanto maior, melhor">
                        <i class="fas fa-arrow-trend-up"></i> Maior melhor
                    </span>`;
        } else if (pol === 'negativa') {
            return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                        <i class="fas fa-arrow-trend-down"></i> Menor melhor
                    </span>`;
        }
    }

    // 2. Busca no dicionário de metadados
    const meta = buscarMetadadoUFs(siglaOrKey);
    let dirRaw = meta?.referencia_analise?.direcao_desejavel || '';
    if (dirRaw) {
        const dir = normKeyUFs(dirRaw);
        if (dir.includes('maior') || dir.includes('aumento')) {
            return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: Quanto maior, melhor">
                        <i class="fas fa-arrow-trend-up"></i> Maior melhor
                    </span>`;
        } else if (dir.includes('menor') || dir.includes('reducao')) {
            return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                        <i class="fas fa-arrow-trend-down"></i> Menor melhor
                    </span>`;
        }
    }

    // 3. Fallback pela configuração de isLowerBetter
    if (config && config.isLowerBetter) {
        return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                    <i class="fas fa-arrow-trend-down"></i> Menor melhor
                </span>`;
    }

    return `<span class="badge-polaridade badge-polaridade-neutra" title="Indicador de perfil estrutural / contextual">
                <i class="fas fa-circle-info"></i> Contextual
            </span>`;
}

// Inicialização Lazy do Módulo
window.iniciarModuloUFs = async function() {
    if (window.moduloUFsIniciado) {
        if (typeof window.filtrarUFsLocal === 'function') window.filtrarUFsLocal();
        return;
    }

    try {
        console.log("⚡ [UFs] Inicializando Módulo de Benchmarking das UFs...");
        const basePath = window.basePath || '';
        
        // 0. Carrega dicionário unificado de metadados gerado pelo ETL
        try {
            let resMetaUFs = await window.fetchSeguro(`${basePath}/api/ufs/metadados`);
            if (!resMetaUFs.ok) {
                resMetaUFs = await window.fetchSeguro(`${basePath}/data/json/metadados_indicadores_ufs.json`);
            }
            if (resMetaUFs.ok) {
                dicionarioMetadadosUFs = await resMetaUFs.json();
            }
        } catch (errMeta) {
            console.warn("[UFs] Aviso ao carregar JSON de metadados:", errMeta);
        }

        // Carrega metadados globais se ainda não carregados
        if (!window.dadosMetadados || !Array.isArray(window.dadosMetadados) || window.dadosMetadados.length === 0) {
            try {
                const resMeta = await window.fetchSeguro(`${basePath}/api/ficha/metadados`);
                if (resMeta.ok) {
                    const jMeta = await resMeta.json();
                    window.dadosMetadados = jMeta.indicadores_dicionario || (Array.isArray(jMeta) ? jMeta : []);
                }
            } catch (e) {
                console.warn("[UFs] Falha ao carregar metadados da ficha:", e);
            }
        }

        // 1. Carrega dados fiscais
        let resFiscal = await window.fetchSeguro(`${basePath}/api/ufs/fiscal`);
        if (!resFiscal.ok) {
            resFiscal = await window.fetchSeguro(`${basePath}/data/json/base_painel.json`);
        }

        if (resFiscal.ok) {
            const jsonFiscal = await resFiscal.json();
            dadosMasterFiscalUFs = jsonFiscal.dados || jsonFiscal.data || [];
            if (jsonFiscal.ipca) fatoresIPCAUFs = jsonFiscal.ipca;
            if (jsonFiscal.filtros && jsonFiscal.filtros.periodos_por_ano) {
                dicionarioPeriodosUFs = jsonFiscal.filtros.periodos_por_ano;
            }
        }

        // 2. Carrega filtros e dados iniciais da UF default (PE)
        await carregarDadosUF('PE');

        // 3. Preenche dropdowns de controle
        preencherDropdownsUFs();

        window.moduloUFsIniciado = true;
        console.log("✅ [UFs] Módulo carregado com sucesso!");

    } catch (e) {
        console.error("Erro ao inicializar módulo UFs:", e);
    }
};

// Carrega os indicadores socioambientais de uma UF (via API Go com fallback)
async function carregarDadosUF(uf) {
    if (dadosSocioAmbientaisUFs[uf]) return;

    const basePath = window.basePath || '';
    try {
        const res = await window.fetchSeguro(`${basePath}/api/ufs/data?uf=${encodeURIComponent(uf)}`);
        if (res.ok) {
            const json = await res.json();
            dadosSocioAmbientaisUFs[uf] = json.indicadores || [];
            if (json.benchmarks_regiao && benchmarksRegiaoUFs.length === 0) {
                benchmarksRegiaoUFs = json.benchmarks_regiao;
            }
        }
    } catch (e) {
        console.warn(`[UFs] Aviso ao buscar dados socioambientais para ${uf}:`, e);
        dadosSocioAmbientaisUFs[uf] = [];
    }
}

// Preenche os selects da topbar
const NOMES_UFS_COMPLETOS = {
    "AC": "Acre", "AL": "Alagoas", "AM": "Amazonas", "AP": "Amapá", "BA": "Bahia",
    "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo", "GO": "Goiás",
    "MA": "Maranhão", "MG": "Minas Gerais", "MS": "Mato Grosso do Sul", "MT": "Mato Grosso",
    "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco", "PI": "Piauí", "PR": "Paraná",
    "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RO": "Rondônia", "RR": "Roraima",
    "RS": "Rio Grande do Sul", "SC": "Santa Catarina", "SE": "Sergipe", "SP": "São Paulo", "TO": "Tocantins"
};

function preencherDropdownsUFs() {
    const listaUFs = [
        "PE", "AL", "BA", "CE", "MA", "PB", "PI", "RN", "SE",
        "AC", "AM", "AP", "DF", "ES", "GO", "MG", "MS", "MT",
        "PA", "PR", "RJ", "RO", "RR", "RS", "SC", "SP", "TO"
    ];

    const $uf = $('#ufs_f_uf');
    $uf.empty();
    listaUFs.forEach(u => {
        const nomeCompleto = NOMES_UFS_COMPLETOS[u] || u;
        $uf.append($('<option></option>').attr('value', u).text(`${u} — ${nomeCompleto}`));
    });
    $uf.val('PE');

    $uf.off('change').on('change', async function() {
        const selUf = $(this).val();
        await carregarDadosUF(selUf);
        window.filtrarUFsLocal();
    });

    window.filtrarUFsLocal();
}

// Alterna valores nominais vs corrigidos pelo IPCA
window.toggleIPCAUFs = function() {
    window.usarValoresReaisUFs = !window.usarValoresReaisUFs;
    const btn = document.getElementById('ufs_btn_ipca');
    const lbl = document.getElementById('ufs_btn_ipca_label');

    if (window.usarValoresReaisUFs) {
        if (btn) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
        }
        if (lbl) lbl.innerText = "Valores Reais (IPCA)";
    } else {
        if (btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        }
        if (lbl) lbl.innerText = "Valores Nominais";
    }

    window.filtrarUFsLocal();
};

// Aplica fator de correção de inflação IPCA
function aplicarIPCAUFs(valor, exercicio, isPct) {
    if (!window.usarValoresReaisUFs || isPct) return valor;
    const fator = fatoresIPCAUFs[String(exercicio)];
    if (fator && !isNaN(fator)) {
        return valor * Number(fator);
    }
    return valor;
}

// Filtra e renderiza os dados da UF selecionada
window.filtrarUFsLocal = function() {
    const uf = $('#ufs_f_uf').val() || 'PE';

    // Atualiza cabeçalho visual e bandeira oficial do estado selecionado
    const flagEl = document.getElementById('ufs_img_bandeira') || document.getElementById('ufs_header_flag');
    if (flagEl) {
        flagEl.src = `images/bandeiras/${uf.toUpperCase()}.png`;
        flagEl.alt = `Bandeira ${uf.toUpperCase()} (${NOMES_UFS_COMPLETOS[uf.toUpperCase()] || uf})`;
        flagEl.style.display = 'inline-block';
    }

    const titleEl = document.getElementById('ufs_header_titulo');
    if (titleEl) {
        let textoIPCA = window.usarValoresReaisUFs ? " (Valores Reais / IPCA)" : "";
        const nomeExtenso = NOMES_UFS_COMPLETOS[uf.toUpperCase()] ? `${NOMES_UFS_COMPLETOS[uf.toUpperCase()]} (${uf.toUpperCase()})` : uf;
        titleEl.innerText = `BENCHMARKING DAS UFs — ${nomeExtenso}${textoIPCA}`;
    }

    const capaUfEl = document.getElementById('capa_nome_uf');
    if (capaUfEl) capaUfEl.innerText = uf;

    // Dados socioambientais da UF
    const baseSocio = dadosSocioAmbientaisUFs[uf] || [];

    // Renderiza o Resumo Executivo das UFs (5 Eixos Estratégicos)
    try {
        renderizarResumoExecutivoUFs(uf, baseSocio);
    } catch (eResumo) {
        console.error("[UFs] Erro nao fatal no resumo executivo:", eResumo);
    }

    renderizarEixoConhecimento(baseSocio, uf);
    renderizarEixoSeguranca(baseSocio, uf);
    renderizarEixoSaude(baseSocio, uf);
    renderizarEixoSustentabilidade(baseSocio, uf);
    renderizarEixoGestaoFiscal(uf);
};

// Formatação padrão de valores
function formatarValorUFs(v, config) {
    if (v === null || v === undefined || isNaN(v) || v === 0) return '-';
    
    // Percentuais e Índices
    if (config.isPct) return v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2}) + '%';
    if (config.isIndice) return v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
    
    // Potência em kW
    if (config.isPotencia) {
        return Math.round(v).toLocaleString('pt-BR') + ' kW';
    }
    
    // Carga em Toneladas
    if (config.isToneladas) {
        return Math.round(v).toLocaleString('pt-BR') + ' t';
    }
    
    // Valores monetários por unidade (R$/ha ou tarifas R$)
    if (config.isMoedaUnit) {
        const suf = config.suffix ? ` ${config.suffix}` : '';
        return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + suf;
    }
    
    if (config.isAbs) return Math.round(v).toLocaleString('pt-BR');
    
    if (config.isPerCapita) {
        if (v > 1e6) {
            return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' mi';
        }
        return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // Despesas e receitas orçamentárias gerais (Bilhões / Milhões)
    if (v >= 1e9) {
        return 'R$ ' + (v / 1e9).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' bi';
    }
    if (v >= 1e6) {
        return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' mi';
    }
    return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Gerador de Cards de KPIs com Ranking, Sinalização, Modal de Metadados, Logo CLP e Título em 2 Linhas
function gerarHTMLCardUFs(titulo, valAtual, valAnt, varPct, config, siglaOrKey, tipoDado, rank, polaridadeDb) {
    let strAtual = formatarValorUFs(valAtual, config);
    let strAnt = formatarValorUFs(valAnt, config);

    // Se for polaridade negativa do DB ou isLowerBetter, menor é melhor
    let isLowerBetter = (polaridadeDb === 'negativa') || (config && config.isLowerBetter) || false;
    let isPositivo = varPct >= 0;
    
    let corVar = isPositivo ? '#27AE60' : '#E74C3C';
    let iconeVar = isPositivo ? 'fa-arrow-up' : 'fa-arrow-down';

    if (isLowerBetter) {
        corVar = isPositivo ? '#E74C3C' : '#27AE60';
    }

    let strVar = (valAnt && valAnt !== 0) 
        ? `<i class="fas ${iconeVar} me-1"></i>${Math.abs(varPct).toLocaleString('pt-BR', {maximumFractionDigits: 1})}%` 
        : '-';

    let badgeRankHtml = (rank && rank > 0)
        ? `<span class="badge bg-slate-100 text-slate-700 border" style="font-size: 0.65rem; padding: 2px 6px; font-weight: 700; border-radius: 6px;"><i class="fas fa-trophy text-amber-500 me-0.5"></i> ${rank}º no Brasil</span>`
        : '';

    let badgePolaridadeHtml = obterBadgePolaridadeUFs(siglaOrKey, tipoDado, config, polaridadeDb);

    // Verifica nos metadados se o indicador pertence ao CLP ("Sim")
    const meta = buscarMetadadoUFs(siglaOrKey) || {};
    const isClp = normKeyUFs(meta.clp) === 'sim';
    
    // Define o caminho da logo (ajuste o diretório caso o SVG não esteja em images/)
    const logoClpHtml = isClp 
        ? `<img src="images/logo_clp_ranking.png" alt="Indicador CLP" title="Indicador do Ranking de Competitividade dos Estados (CLP)" style="height: 32px; width: auto; max-width: 75px; object-fit: contain;">` 
        : '';

    return `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-2" style="page-break-inside: avoid;">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 14px; background-color: #fafbfc; transition: transform 0.2s;">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
                
                <!-- Linha 1: Ícone, Valor Atual, Título (até 2 linhas) e Botões de Ação -->
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="d-flex gap-2 align-items-center" style="min-width: 0; flex: 1;">
                            <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" 
                                 style="width: 40px; height: 40px; background-color: ${config.color}18; color: ${config.color};">
                                <i class="${config.icon}" style="font-size: 1.05rem;"></i>
                            </div>
                            <div style="min-width: 0; flex: 1; padding-right: 4px;">
                                <div class="fw-bold text-dark text-truncate" style="font-size: 1.15rem; letter-spacing: -0.5px; line-height: 1.2;">${strAtual}</div>
                                <div class="text-muted fw-semibold" style="font-size: 0.74rem; line-height: 1.25; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; max-height: 2.5em; word-break: break-word;" title="${(titulo === 'DTP/RCL' || siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : titulo}">${(titulo === 'DTP/RCL' || siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : titulo}</div>
                            </div>
                        </div>
                        <div class="d-flex gap-1 align-items-center flex-shrink-0 d-print-none">
                            <button class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center" 
                                    onclick="window.abrirModalMetadadoUFs('${siglaOrKey}', '${tipoDado}')" 
                                    style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Metadados e Informações">
                                <i class="fas fa-info text-slate-500" style="font-size: 0.75rem;"></i>
                            </button>
                            <button class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center" 
                                    onclick="window.abrirModalUFs('${siglaOrKey}', '${tipoDado}')" 
                                    style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Série Histórica e Ranking">
                                <i class="fas fa-arrow-right" style="color: #1a3c6e; font-size: 0.75rem;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Badges de Ranking Nacional e Polaridade / Sinalização -->
                    <div class="d-flex flex-wrap align-items-center gap-1 mb-2 pt-1" style="min-height: 24px;">
                        ${badgeRankHtml}
                        ${badgePolaridadeHtml}
                    </div>
                </div>
                
                <hr class="my-2" style="opacity: 0.08; border-top: 1.5px solid #000;">
                
                <!-- Linha 2: Período Anterior + Variação (à esquerda) e Logo CLP (à direita) -->
                <div class="d-flex justify-content-between align-items-end pt-1 gap-2">
                    <div style="min-width: 0; flex: 1;">
                        <span class="d-block text-muted text-truncate" style="font-size: 0.68rem; font-weight: 600;">Período Anterior</span>
                        <div class="d-flex align-items-baseline gap-2 flex-wrap">
                            <span class="fw-bold text-secondary" style="font-size: 0.82rem;">${strAnt}</span>
                            <span class="fw-bold" style="font-size: 0.76rem; color: ${corVar};" title="Variação em relação ao período anterior">${strVar}</span>
                        </div>
                    </div>
                    <div class="flex-shrink-0 d-flex align-items-center">
                        ${logoClpHtml}
                    </div>
                </div>

            </div>
        </div>
    </div>
    `;
}
function obterConfigUFs(nomeOuSigla) {
    const s = (nomeOuSigla || "").toLowerCase();

    // Taxas de Segurança (por 100 mil hab) -> formatação decimal
    if (s === 'tx_cvp' || s === 'tx_rfcelular' || s === 'tx_feminicidio' || s === 'tx_mvi' || s.startsWith('taxa de')) {
        let icone = "fas fa-person-falling-burst";
        if (s.includes('feminicidio')) icone = "fas fa-person-dress";
        if (s.includes('mvi') || s.includes('morte')) icone = "fas fa-skull-crossbones";
        if (s.includes('cvp') || s.includes('patrimonio')) icone = "fas fa-shield-halved";
        if (s.includes('celular')) icone = "fas fa-mobile-screen-button";
        return { color: "#C0392B", icon: icone, isIndice: true, isLowerBetter: true };
    }

    // Ocorrências e Contagens Absolutas de Segurança
    if (s === 'feminicidio') return { color: "#9B59B6", icon: "fas fa-person-dress", isAbs: true, isLowerBetter: true };
    if (s === 'mvi') return { color: "#B91C1C", icon: "fas fa-skull-crossbones", isAbs: true, isLowerBetter: true };
    if (s === 'n_ab_cvp') return { color: "#D97706", icon: "fas fa-shield-halved", isAbs: true, isLowerBetter: true };
    if (s === 'rf_celular') return { color: "#EA580C", icon: "fas fa-mobile-screen-button", isAbs: true, isLowerBetter: true };
    if (s === 'pop_carceraria') return { color: "#475569", icon: "fas fa-building-shield", isAbs: true, isLowerBetter: true };
    if (s === 'pop_socioeducanda') return { color: "#0284C7", icon: "fas fa-user-group", isAbs: true, isLowerBetter: true };

    // 1. Energia Solar e Eólica (kW)
    if (s === 'qtd_energia_solar' || s.includes('energia solar')) {
        return { color: "#F59E0B", icon: "fas fa-solar-panel", isPotencia: true, suffix: " kW" };
    }
    if (s === 'qtd_energia_eolica' || s.includes('energia eólica') || s.includes('energia eolica')) {
        return { color: "#10B981", icon: "fas fa-wind", isPotencia: true, suffix: " kW" };
    }

    // 2. Carga Bruta de Suape (Toneladas) e Movimentação Aeroportuária (Passageiros)
    if (s === 'carga_bruta_suape' || s.includes('suape')) {
        return { color: "#2563EB", icon: "fas fa-ship", isToneladas: true, suffix: " t" };
    }
    if (s === 'movimentacao_aero' || s.includes('passageiros embarcados')) {
        return { color: "#0284C7", icon: "fas fa-plane-departure", isAbs: true };
    }

    // Déficit Habitacional (Contagem absoluta - Menor é melhor)
    if (s === 'deficit_hab' || s.includes('déficit habitacional') || s.includes('deficit habitacional')) {
        return { color: "#D97706", icon: "fas fa-house-circle-exclamation", isAbs: true, isLowerBetter: true };
    }

    // 3. Valor da Produção por Hectare (R$/ha)
    if (s === 'valor_producao_hec_colhido' || s.includes('por hectare')) {
        return { color: "#059669", icon: "fas fa-wheat-awn", isMoedaUnit: true, suffix: "/ha" };
    }

    // Custos, Tarifas e Perdas (Menor é melhor)
    if (s.includes('custo_medio') || s.includes('tarifa_media')) {
        return { color: "#D97706", icon: "fas fa-file-invoice-dollar", isPerCapita: true, isLowerBetter: true };
    }
    if (s === 'perdas_distribuicao_agua') {
        return { color: "#EF4444", icon: "fas fa-triangle-exclamation", isPct: true, isLowerBetter: true };
    }
    if (s === 'consumo_total_medio_agua') {
        return { color: "#3B82F6", icon: "fas fa-glass-water", isIndice: true };
    }

    // Atendimento de Água e Esgoto (Percentuais)
    if (s.startsWith('abastecimento_') || s.startsWith('esgoto_tratado_')) {
        let icon = s.includes('esgoto') ? "fas fa-faucet-drip" : "fas fa-droplet";
        return { color: "#0284C7", icon: icon, isPct: true };
    }

    // 5. Tarifas e Custos Médios de Água e Esgoto (R$)
    if (s.includes('tarifa_media') || s.includes('custo_medio') || s.includes('receita direta média') || s.includes('despesa média de')) {
        return { color: "#D97706", icon: "fas fa-file-invoice-dollar", isMoedaUnit: true, isLowerBetter: true };
    }

    // Mercado de Trabalho & Demografia
    if (s.includes('desocupação') || s.includes('taxa_desocupacao')) {
        return { color: "#C0392B", icon: "fas fa-user-slash", isPct: true, isLowerBetter: true };
    }
    if (s.includes('ocupada') && !s.includes('pib')) {
        return { color: "#27AE60", icon: "fas fa-user-tie", isAbs: true };
    }
    if (s.includes('população') || s.includes('populacao') || s.includes('pia_media')) {
        return { color: "#2980B9", icon: "fas fa-users", isAbs: true };
    }
    if (s.includes('trimestres')) {
        return { color: "#64748B", icon: "fas fa-calendar-check", isAbs: true };
    }

    // Economia, Produtividade & Turismo
    if (s.includes('pib per capita') || s.includes('pib_per_capita')) {
        return { color: "#16A085", icon: "fas fa-wallet", isPerCapita: true };
    }
    if (s.includes('pib por população ocupada') || s.includes('pib_por_pop_ocupada') || s.includes('produtividade')) {
        return { color: "#0D9488", icon: "fas fa-briefcase", isPerCapita: true };
    }
    if (s.includes('pib total') || s.includes('pib_total')) {
        return { color: "#2563EB", icon: "fas fa-chart-line" };
    }
    if (s === 'iatur_volume_idx' || s === 'iatur_receita_idx' || s.startsWith('iatur_')) {
        const icone = s.includes('receita') ? "fas fa-sack-dollar" : "fas fa-suitcase-rolling";
        return { color: "#0EA5E9", icon: icone, isIndice: true };
    }

    // Educação
    if (s.includes('ideb')) return { color: "#2E86C1", icon: "fas fa-graduation-cap", isIndice: true };
    if (s.includes('abandono') || s.includes('aba_em')) return { color: "#C0392B", icon: "fas fa-user-xmark", isPct: true, isLowerBetter: true };
    if (s.includes('distorção') || s.includes('tdi_em')) return { color: "#D35400", icon: "fas fa-clock-rotate-left", isPct: true, isLowerBetter: true };
    if (s.includes('creche') || s.includes('pre_escola')) {
        let isPct = s.includes('pct') || s.includes('%') || (!s.includes('abs') && !s.includes('absoluto'));
        return { color: "#16A085", icon: "fas fa-children", isPct: isPct, isAbs: !isPct };
    }

    // Meio Ambiente
    if (s.includes('área protegida') || s.includes('area_uc')) return { color: "#27AE60", icon: "fas fa-tree", isAbs: true };
    if (s.includes('unidades de conservação') || s.includes('qtd_uc')) return { color: "#059669", icon: "fas fa-mountain-sun", isAbs: true };

    // Fiscais
    if (s.includes('dtp') || s.includes('pessoal')) return { color: "#F39C12", icon: "fas fa-balance-scale", isPct: true, isLowerBetter: true };
    if (s.includes('dívida')) return { color: "#C0392B", icon: "fas fa-file-invoice-dollar", isPct: true, isLowerBetter: true };
    if (s.includes('vinculação')) return { color: "#8E44AD", icon: "fas fa-certificate", isPct: true };
    if (s.includes('resultado fiscal') || s.includes('resultado orçamentário relativo')) return { color: "#3498DB", icon: "fas fa-chart-pie", isPct: true };
    if (s.includes('per capita')) return { color: "#20C997", icon: "fas fa-users", isPerCapita: true };
    if (s.includes('resultado')) return { color: "#27AE60", icon: "fas fa-coins" };
    if (s.includes('receita')) return { color: "#2980B9", icon: "fas fa-money-bill-wave" };
    if (s.includes('segurança')) return { color: "#D35400", icon: "fas fa-shield-alt" };
    if (s.includes('saúde')) return { color: "#8E44AD", icon: "fas fa-heartbeat" };
    if (s.includes('ciência')) return { color: "#9B59B6", icon: "fas fa-microchip" };
    if (s.includes('educação')) return { color: "#E67E22", icon: "fas fa-book-reader" };
    if (s.includes('ambiental')) return { color: "#059669", icon: "fas fa-leaf" };
    if (s.includes('transporte')) return { color: "#7F8C8D", icon: "fas fa-bus" };
    if (s.includes('urbanismo') || s.includes('habitação')) return { color: "#34495E", icon: "fas fa-city" };

    return { color: "#1a3c6e", icon: "fas fa-chart-column" };
}

function extrairSocio(baseSocio, sigla) {
    const rows = baseSocio.filter(d => (d.sigla_indicador === sigla || d.nm_indicador === sigla) && d.valor !== null && !isNaN(d.valor));
    if (rows.length === 0) return { valAtual: 0, valAnt: 0, varPct: 0, ano: '-', mes: 0, rank: 0, polaridade: '' };

    // Ordenação temporal completa (considera ano e mês, se houver)
    rows.sort((a, b) => extrairInfoTemporalSocio(b).sortKey - extrairInfoTemporalSocio(a).sortKey);
    const atual = rows[0];
    const infoAtual = extrairInfoTemporalSocio(atual);

    // Se for mensal, compara com o mês imediatamente anterior (ou mesmo mês do ano anterior se desejar)
    const anterior = rows[1];

    let valAtual = Number(atual.valor) || 0;
    let valAnt = anterior ? Number(anterior.valor) || 0 : 0;
    let varPct = valAnt !== 0 ? ((valAtual - valAnt) / Math.abs(valAnt)) * 100 : 0;

    return { 
        valAtual, 
        valAnt, 
        varPct, 
        ano: infoAtual.labelCompleto, 
        mes: infoAtual.mes,
        nome: atual.nm_indicador || sigla,
        rank: atual.rank_br || 0,
        polaridade: atual.polaridade ? String(atual.polaridade).trim().toLowerCase() : ''
    };
}

// Extrai o valor mais recente, o anterior e o ranking nacional de um indicador fiscal
function extrairFiscal(uf, nomeInd) {
    const config = obterConfigUFs(nomeInd);
    const rows = dadosMasterFiscalUFs.filter(d => d.uf === uf && String(d.indicador).trim() === nomeInd && d.valor !== null && !isNaN(d.valor));
    if (rows.length === 0) return { valAtual: 0, valAnt: 0, varPct: 0, exercicio: '-', periodo: '-', rank: 0 };

    // Ordena do mais recente para o mais antigo: exercicio desc, periodo desc
    rows.sort((a, b) => {
        let diffAno = Number(b.exercicio) - Number(a.exercicio);
        if (diffAno !== 0) return diffAno;
        return Number(b.periodo) - Number(a.periodo);
    });

    const recAtual = rows[0];
    const anoAtual = Number(recAtual.exercicio);
    const periodoAtual = Number(recAtual.periodo);
    const periodicidadeAtual = recAtual.periodicidade;

    // Tentar encontrar mesmo período no ano anterior
    let recAnt = rows.find(d => Number(d.exercicio) === (anoAtual - 1) && Number(d.periodo) === periodoAtual);
    if (!recAnt && rows.length > 1) {
        recAnt = rows[1];
    }

    let valAtual = Number(recAtual.valor) || 0;
    let anoAnt = recAnt ? Number(recAnt.exercicio) : (anoAtual - 1);
    let valAnt = recAnt ? Number(recAnt.valor) || 0 : 0;

    valAtual = aplicarIPCAUFs(valAtual, anoAtual, config.isPct);
    valAnt = aplicarIPCAUFs(valAnt, anoAnt, config.isPct);

    let varPct = valAnt !== 0 ? ((valAtual - valAnt) / Math.abs(valAnt)) * 100 : 0;

    // Cálculo do ranking nacional da UF no período mais recente
    let rank = 0;
    const basePeriodoUFs = dadosMasterFiscalUFs.filter(d => 
        String(d.indicador).trim() === nomeInd &&
        Number(d.exercicio) === anoAtual &&
        Number(d.periodo) === periodoAtual &&
        d.periodicidade === periodicidadeAtual &&
        d.valor !== null && !isNaN(d.valor)
    );

    if (basePeriodoUFs.length > 0) {
        let isLowerBetter = config.isLowerBetter || false;
        const sortedUfs = [...basePeriodoUFs].sort((a, b) => {
            let va = Number(a.valor) || 0;
            let vb = Number(b.valor) || 0;
            return isLowerBetter ? (va - vb) : (vb - va);
        });
        const idx = sortedUfs.findIndex(d => d.uf === uf);
        if (idx !== -1) {
            rank = idx + 1;
        }
    }

    return { 
        valAtual, 
        valAnt, 
        varPct, 
        exercicio: anoAtual, 
        periodo: periodoAtual, 
        periodicidade: periodicidadeAtual,
        rank: rank 
    };
}

// =========================================================================
// RENDERIZAÇÃO DOS 5 EIXOS ESTRATÉGICOS
// =========================================================================

function renderizarEixoConhecimento(baseSocio, uf) {
    const listaItens = [];

    const listaSocio = [
        // IDEB
        { sigla: "ideb_5ano_estadual", label: "IDEB Anos Iniciais (5º) - Estadual" },
        { sigla: "ideb_5ano_publica", label: "IDEB Anos Iniciais (5º) - Pública" },
        { sigla: "ideb_5ano_privada", label: "IDEB Anos Iniciais (5º) - Privada" },
        { sigla: "ideb_5ano_total", label: "IDEB Anos Iniciais (5º) - Total" },
        { sigla: "ideb_9ano_estadual", label: "IDEB Anos Finais (9º) - Estadual" },
        { sigla: "ideb_9ano_publica", label: "IDEB Anos Finais (9º) - Pública" },
        { sigla: "ideb_9ano_privada", label: "IDEB Anos Finais (9º) - Privada" },
        { sigla: "ideb_9ano_total", label: "IDEB Anos Finais (9º) - Total" },
        { sigla: "ideb_3ano_estadual", label: "IDEB Ensino Médio (3º) - Estadual" },
        { sigla: "ideb_3ano_privada", label: "IDEB Ensino Médio (3º) - Privada" },
        { sigla: "ideb_3ano_total", label: "IDEB Ensino Médio (3º) - Total" },
        // Fluxo
        { sigla: "aba_em_estadual", label: "Taxa de Abandono - E. Médio (Estadual)" },
        { sigla: "aba_em_publica", label: "Taxa de Abandono - E. Médio (Pública)" },
        { sigla: "aba_em_privada", label: "Taxa de Abandono - E. Médio (Privada)" },
        { sigla: "aba_em_federal", label: "Taxa de Abandono - E. Médio (Federal)" },
        { sigla: "aba_em_municipal", label: "Taxa de Abandono - E. Médio (Municipal)" },
        { sigla: "aba_em_total", label: "Taxa de Abandono - E. Médio (Total)" },
        { sigla: "tdi_em_estadual", label: "Distorção Idade-Série - E. Médio (Estadual)" },
        { sigla: "tdi_em_publica", label: "Distorção Idade-Série - E. Médio (Pública)" },
        { sigla: "tdi_em_privada", label: "Distorção Idade-Série - E. Médio (Privada)" },
        { sigla: "tdi_em_federal", label: "Distorção Idade-Série - E. Médio (Federal)" },
        { sigla: "tdi_em_municipal", label: "Distorção Idade-Série - E. Médio (Municipal)" },
        { sigla: "tdi_em_total", label: "Distorção Idade-Série - E. Médio (Total)" },
        // Infantil
        { sigla: "tx_creche_pct", label: "Taxa Bruta de Creche (%)" },
        { sigla: "tx_liq_creche_pct", label: "Taxa Líquida de Creche (%)" },
        { sigla: "tx_creche_abs", label: "Matrículas em Creche (Abs.)" },
        { sigla: "tx_liq_creche_abs", label: "Matrículas Líquidas em Creche (Abs.)" },
        { sigla: "tx_pre_escola_pct", label: "Taxa Bruta de Pré-escola (%)" },
        { sigla: "tx_liq_pre_escola_pct", label: "Taxa Líquida de Pré-escola (%)" },
        { sigla: "tx_pre_escola_abs", label: "Matrículas em Pré-escola (Abs.)" },
        { sigla: "tx_liq_pre_escola_abs", label: "Matrículas Líquidas em Pré-escola (Abs.)" }
    ];

    listaSocio.forEach(item => {
        const dados = extrairSocio(baseSocio, item.sigla);
        const config = obterConfigUFs(item.sigla);
        listaItens.push({
            siglaOrKey: item.sigla,
            cardHtml: gerarHTMLCardUFs(item.label, dados.valAtual, dados.valAnt, dados.varPct, config, item.sigla, 'socio', dados.rank)
        });
    });

    const fiscais = ["Educação", "Ciência e Tecnologia", "Vinculação - Educação"];
    fiscais.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        listaItens.push({
            siglaOrKey: nomeInd,
            cardHtml: gerarHTMLCardUFs(nomeInd.startsWith("Vinculação") ? nomeInd : `Despesa com ${nomeInd}`, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(nomeInd), nomeInd, 'fiscal', d.rank)
        });
    });

    renderizarGridComSubdimensoes('grid_ufs_conhecimento', listaItens);
}

// Eixo 2: Segurança e Cidadania (Com hierarquia visual automática)
function renderizarEixoSeguranca(baseSocio, uf) {
    const listaItens = [];

    // 1. Indicadores de Segurança e Custódia
    const listaSeguranca = [
        // Ostensivo / Letal
        { sigla: "tx_mvi", label: "Taxa de Mortes Violentas Intencionais" },
        { sigla: "mvi", label: "Mortes Violentas Intencionais" },
        // Ostensivo / Patrimonial
        { sigla: "tx_cvp", label: "Taxa de Crimes Violentos Contra o Patrimônio" },
        { sigla: "n_ab_cvp", label: "Crimes Violentos Contra o Patrimônio" },
        { sigla: "tx_rfcelular", label: "Taxa de Roubo e Furto de Celulares" },
        { sigla: "rf_celular", label: "Roubo e Furto de Celulares" },
        // Prevenção / Violência de Gênero
        { sigla: "tx_feminicidio", label: "Taxa de Feminicídio" },
        { sigla: "feminicidio", label: "Feminicídio" },
        // Custódia e Ressocialização
        { sigla: "pop_carceraria", label: "População Carcerária" },
        { sigla: "pop_socioeducanda", label: "População Socioeducanda" }
    ];

    listaSeguranca.forEach(item => {
        const dados = extrairSocio(baseSocio, item.sigla);
        const config = obterConfigUFs(item.sigla);
        const cardHtml = gerarHTMLCardUFs(item.label, dados.valAtual, dados.valAnt, dados.varPct, config, item.sigla, 'socio', dados.rank);
        listaItens.push({
            siglaOrKey: item.sigla,
            cardHtml: cardHtml
        });
    });

    // 2. Despesas Orçamentárias da Função
    const indsFiscais = ["Segurança Pública", "Direitos da Cidadania", "Judiciária", "Legislativa"];
    indsFiscais.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        const cfg = obterConfigUFs(nomeInd);
        const cardHtml = gerarHTMLCardUFs(`Despesa com ${nomeInd}`, d.valAtual, d.valAnt, d.varPct, cfg, nomeInd, 'fiscal', d.rank);
        listaItens.push({
            siglaOrKey: nomeInd,
            cardHtml: cardHtml
        });
    });

    // Renderiza com agrupamento e pills automáticos
    renderizarGridComSubdimensoes('grid_ufs_seguranca', listaItens);
}

// Eixo 3: Saúde e Qualidade de Vida (Saúde, Saneamento, Habitação, Urbanismo, Assistência Social)
function renderizarEixoSaude(baseSocio, uf) {
    const elGrid = document.getElementById('grid_ufs_saude');
    if (!elGrid) return;

    let html = '';

    // Despesas de Saúde, Assistência e Bem-Estar Social
    const inds = [
        "Saúde", "Vinculação - Saúde", "Saneamento", 
        "Habitação", "Urbanismo", "Assistência Social", 
        "Previdência Social", "Trabalho"
    ];

    inds.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        const cfg = obterConfigUFs(nomeInd);
        let label = nomeInd.startsWith("Vinculação") ? nomeInd : `Despesa com ${nomeInd}`;
        html += gerarHTMLCardUFs(label, d.valAtual, d.valAnt, d.varPct, cfg, nomeInd, 'fiscal', d.rank);
    });

    elGrid.innerHTML = html;
}

function renderizarEixoSustentabilidade(baseSocio, uf) {
    const listaItens = [];

    // Helper para extrair e montar card padronizado
    const adicionarItem = (sigla, label, subdim) => {
        const dados = extrairSocio(baseSocio, sigla);
        const config = obterConfigUFs(sigla);
        const cardHtml = gerarHTMLCardUFs(
            label, dados.valAtual, dados.valAnt, dados.varPct, 
            config, sigla, 'socio', dados.rank, dados.polaridade
        );
        listaItens.push({
            siglaOrKey: sigla,
            subdimensaoFallback: subdim,
            cardHtml: cardHtml
        });
    };

    // 1. Transição Energética e Energia Renovável
    adicionarItem("qtd_energia_solar", "Capacidade em Operação - Energia Solar", "Transição Energética e Renováveis");
    adicionarItem("qtd_energia_eolica", "Capacidade em Operação - Energia Eólica", "Transição Energética e Renováveis");

    // 2. Abastecimento de Água e Eficiência Hídrica
    adicionarItem("abastecimento_pop_agua_pct", "Atendimento Total da População com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("abastecimento_pop_urbana_agua_pct", "Atendimento da População Urbana com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("abastecimento_pop_rural_agua_pct", "Atendimento da População Rural com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("abastecimento_dom_agua_pct", "Domicílios Totais com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("abastecimento_dom_urbana_agua_pct", "Domicílios Urbanos com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("abastecimento_dom_rural_agua_pct", "Domicílios Rurais com Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("perdas_distribuicao_agua", "Perdas Totais de Água na Distribuição", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("consumo_total_medio_agua", "Consumo Médio per capita de Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("tarifa_media_agua", "Receita Direta Média - Água", "Abastecimento de Água e Eficiência Hídrica");
    adicionarItem("custo_medio_agua", "Despesa Média de Água (c/ tributos)", "Abastecimento de Água e Eficiência Hídrica");

    // 3. Saneamento e Esgotamento Sanitário
    adicionarItem("abastecimento_pop_esgoto_pct", "Atendimento Total da População com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("abastecimento_pop_urbana_esgoto_pct", "Atendimento da População Urbana com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("abastecimento_pop_rural_esgoto_pct", "Atendimento da População Rural com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("abastecimento_dom_esgoto_pct", "Domicílios Totais com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("abastecimento_dom_urbana_esgoto_pct", "Domicílios Urbanos com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("abastecimento_dom_rural_esgoto_pct", "Domicílios Rurais com Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("esgoto_tratado_coletado", "Esgoto Tratado / Coletado", "Saneamento e Esgotamento Sanitário");
    adicionarItem("esgoto_tratado_agua_consumida", "Esgoto Tratado / Água Consumida", "Saneamento e Esgotamento Sanitário");
    adicionarItem("tarifa_media_esgoto", "Receita Direta Média - Esgoto", "Saneamento e Esgotamento Sanitário");
    adicionarItem("custo_medio_esgoto", "Despesa Média de Esgoto (c/ tributos)", "Saneamento e Esgotamento Sanitário");

    // 4. Atividade Econômica, Logística e Agropecuária
    adicionarItem("pib_total_reais", "PIB Total", "Atividade Econômica, Logística e Agro");
    adicionarItem("pib_per_capita", "PIB per capita", "Atividade Econômica, Logística e Agro");
    adicionarItem("pib_por_pop_ocupada", "PIB por População Ocupada", "Atividade Econômica, Logística e Agro");
    adicionarItem("carga_bruta_suape", "Porto de Suape - Carga Bruta Total", "Atividade Econômica, Logística e Agro");
    adicionarItem("movimentacao_aero", "Movimentação Aeroportuária (Passageiros)", "Atividade Econômica, Logística e Agro");
    adicionarItem("iatur_volume_idx", "Índice de Volume das Atividades Turísticas (c/ Ajuste Sazonal)", "Atividade Econômica, Logística e Agro");
    adicionarItem("iatur_receita_idx", "Índice de Receita das Atividades Turísticas (c/ Ajuste Sazonal)", "Atividade Econômica, Logística e Agro");
    adicionarItem("valor_producao_hec_colhido", "Valor da Produção por Hectare Colhido", "Atividade Econômica, Logística e Agro");

    // 5. Dinâmica Demográfica, Mercado de Trabalho e Habitação
    adicionarItem("taxa_desocupacao_media", "Taxa de Desocupação Média (%)", "Mercado de Trabalho e Demografia");
    adicionarItem("pop_ocupada_media", "População Ocupada (Média)", "Mercado de Trabalho e Demografia");
    adicionarItem("populacao_total", "População Total (hab.)", "Mercado de Trabalho e Demografia");
    adicionarItem("pia_media", "População em Idade Ativa (PIA)", "Mercado de Trabalho e Demografia");
    adicionarItem("deficit_hab", "Déficit Habitacional (Domicílios)", "Habitação e Desenvolvimento Urbano");

    // 6. Áreas Protegidas e Unidades de Conservação (SNUC)
    const listaUCs = [
        { sigla: "area_uc_total", label: "Área Total Protegida em UCs (ha)" },
        { sigla: "area_uc_est", label: "Área Protegida em UCs Estaduais (ha)" },
        { sigla: "area_uc_fed", label: "Área Protegida em UCs Federais (ha)" },
        { sigla: "area_uc_mun", label: "Área Protegida em UCs Municipais (ha)" },
        { sigla: "area_uc_pi", label: "Área em Proteção Integral (ha)" },
        { sigla: "area_uc_us", label: "Área em Uso Sustentável (ha)" },
        { sigla: "qtd_uc_total", label: "Total de Unidades de Conservação" },
        { sigla: "qtd_uc_est", label: "Unidades de Conservação Estaduais" },
        { sigla: "qtd_uc_fed", label: "Unidades de Conservação Federais" },
        { sigla: "qtd_uc_mun", label: "Unidades de Conservação Municipais" },
        { sigla: "qtd_uc_pi", label: "Unidades de Conservação em Proteção Integral" },
        { sigla: "qtd_uc_us", label: "Unidades de Conservação em Uso Sustentável" }
    ];
    listaUCs.forEach(u => adicionarItem(u.sigla, u.label, "Unidades de Conservação e Áreas Protegidas"));

    // 7. Despesas Orçamentárias Executadas
    const fiscais = ["Gestão Ambiental", "Transporte", "Agricultura"];
    fiscais.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        const cfg = obterConfigUFs(nomeInd);
        const cardHtml = gerarHTMLCardUFs(`Despesa com ${nomeInd}`, d.valAtual, d.valAnt, d.varPct, cfg, nomeInd, 'fiscal', d.rank);
        listaItens.push({
            siglaOrKey: nomeInd,
            subdimensaoFallback: "Alocação Orçamentária e Infraestrutura",
            cardHtml: cardHtml
        });
    });

    // Renderiza tudo no grid com pills navegáveis e cabeçalhos automáticos
    renderizarGridComSubdimensoes('grid_ufs_sustentabilidade', listaItens);
}

// Eixo 5: Gestão, Transparência e Participação (Resultados Fiscais, Receitas e Despesas)
function renderizarEixoGestaoFiscal(uf) {
    const elResultados = document.getElementById('grid_ufs_fiscal_resultados');
    const elReceitas = document.getElementById('grid_ufs_fiscal_receitas');
    const elDespesas = document.getElementById('grid_ufs_fiscal_despesas');

    if (!elResultados || !elReceitas || !elDespesas) return;

    // Sub-bloco Resultados
    const indsResultados = [
        "DTP/RCL", "Dívida Consolidada Líquida", "Resultado Fiscal",
        "Resultado Primário", "Resultado Nominal", "Resultado Orçamentário",
        "Resultado Orçamentário per capita", "Resultado Orçamentário Relativo"
    ];
    let htmlRes = '';
    indsResultados.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlRes += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elResultados.innerHTML = htmlRes;

    // Sub-bloco Receitas
    const indsReceitas = [
        "Receita Corrente Líquida", "Receitas Realizadas", "Receitas de Impostos",
        "Receitas de Capital", "Transf. União (Corrente)", "Transf. União (Capital)"
    ];
    let htmlRec = '';
    indsReceitas.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlRec += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elReceitas.innerHTML = htmlRec;

    // Sub-bloco Despesas
    const indsDespesas = ["Administração", "Despesas de Capital - Emp."];
    let htmlDesp = '';
    indsDespesas.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlDesp += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elDespesas.innerHTML = htmlDesp;
}

// =========================================================================
// MODAL DE SÉRIE HISTÓRICA E RANKING NACIONAL
// =========================================================================

window.abrirModalUFs = async function(siglaOrKey, tipoDado) {
    const uf = $('#ufs_f_uf').val() || 'PE';

    const modalTitle = document.getElementById('modal_ufs_kpi_titulo');
    const nomeExib = (siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : siglaOrKey;
    if (modalTitle) {
        modalTitle.innerText = `${nomeExib} — Histórico e Comparativo Nacional (${uf})`;
    }

    const modalEl = document.getElementById('modal_ufs_kpi_serie');
    if (!modalEl) return;
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('shown.bs.modal', async function () {
        if (tipoDado === 'fiscal') {
            await renderizarModalFiscal(siglaOrKey, uf);
        } else {
            await renderizarModalSocio(siglaOrKey, uf);
        }
    }, { once: true });
};

// Renderização do Modal para Dados Fiscais
async function renderizarModalFiscal(indicador, uf) {
    const config = obterConfigUFs(indicador);
    const isPct = config.isPct;

    // Identifica o período e exercício mais recentes disponíveis para este indicador
    const rowsInd = dadosMasterFiscalUFs
        .filter(d => String(d.indicador).trim() === indicador && d.valor !== null && !isNaN(d.valor))
        .sort((a, b) => {
            let diffAno = Number(b.exercicio) - Number(a.exercicio);
            if (diffAno !== 0) return diffAno;
            return Number(b.periodo) - Number(a.periodo);
        });

    if (rowsInd.length === 0) return;

    const recMaisRecente = rowsInd[0];
    const anoMaisRecente = Number(recMaisRecente.exercicio);
    const bim = Number(recMaisRecente.periodo);
    const periodicidade = recMaisRecente.periodicidade;

    // 1. Série Plurianual Completa da UF (mesmo período sazonal em todos os anos)
    const baseSerie = dadosMasterFiscalUFs
        .filter(d => d.uf === uf && String(d.indicador).trim() === indicador && d.periodicidade === periodicidade && Number(d.periodo) === bim)
        .sort((a, b) => parseInt(a.exercicio) - parseInt(b.exercicio));

    const anos = baseSerie.map(d => String(d.exercicio));
    const valores = baseSerie.map(d => {
        let v = Number(d.valor) || 0;
        v = aplicarIPCAUFs(v, d.exercicio, isPct);
        return (isPct || config.isPerCapita) ? v : v / 1e9;
    });

    const metadadosPontos = baseSerie.map(d => ({
        ano: Number(d.exercicio),
        mes: 0,
        isMensal: false,
        label: String(d.exercicio),
        labelCompleto: `${bim}º ${periodicidade === 'Quadrimestral' ? 'Quadrimestre' : 'Bimestre'} de ${d.exercicio}`
    }));

    // Helper interno para atualizar o ranking fiscal para um ano específico
    const atualizarRankingFiscalPorAno = (anoAlvo) => {
        const baseAnoUFs = dadosMasterFiscalUFs.filter(d => {
            if (String(d.indicador).trim() !== indicador) return false;
            if (parseInt(d.exercicio) !== Number(anoAlvo)) return false;
            if (d.periodicidade !== periodicidade) return false;
            if (Number(d.periodo) !== bim) return false;
            return true;
        });

        const isLowerBetter = config.isLowerBetter || false;
        const rankingArr = baseAnoUFs.map(d => {
            let v = Number(d.valor) || 0;
            v = aplicarIPCAUFs(v, anoAlvo, isPct);
            return {
                uf: d.uf,
                valor: (isPct || config.isPerCapita) ? v : v / 1e9
            };
        });

        garantirBenchmarksRegionais(rankingArr, config);
        rankingArr.sort((a, b) => isLowerBetter ? (a.valor - b.valor) : (b.valor - a.valor));

        const descPeriodo = `${bim}º ${periodicidade === 'Quadrimestral' ? 'Quadrimestre' : 'Bimestre'} de ${anoAlvo}`;
        renderGraficoBarrasRanking(rankingArr, uf, indicador, config, descPeriodo);
        renderStorytellingModal(indicador, uf, rankingArr, config, descPeriodo, false);
    };

    // Renderiza o gráfico de linha com clique habilitado para trocar o ano do ranking
    renderGraficoLinhaModal(
        anos,
        valores,
        indicador,
        uf,
        config,
        metadadosPontos,
        function(pontoSelecionado) {
            atualizarRankingFiscalPorAno(pontoSelecionado.ano);
        }
    );

    // 2. Ranking Nacional inicial para o último exercício disponível
    atualizarRankingFiscalPorAno(anoMaisRecente);
}

// Helper para buscar e renderizar o ranking de um período específico (ano + mes opcional) no modal socioambiental
async function atualizarRankingSocioPorPeriodo(sigla, uf, nomeExibicao, config, anoAlvo, mesAlvo) {
    const basePath = window.basePath || '';
    let rankingData = [];
    let benchmarks = [];

    try {
        let url = `${basePath}/api/ufs/ranking?sigla_indicador=${encodeURIComponent(sigla)}`;
        if (anoAlvo) url += `&ano=${encodeURIComponent(anoAlvo)}`;
        if (mesAlvo && mesAlvo > 0) url += `&mes=${encodeURIComponent(mesAlvo)}`;

        const res = await window.fetchSeguro(url);
        if (res.ok) {
            const json = await res.json();
            rankingData = json.ranking || [];
            benchmarks = json.benchmarks || [];
        }
    } catch (e) {
        console.warn("[UFs] Erro ao buscar ranking por período:", e);
    }

    // Fallback no cache local caso a API não filtre por mês ou não retorne dados
    if (rankingData.length === 0) {
        Object.keys(dadosSocioAmbientaisUFs).forEach(sgUf => {
            const lista = dadosSocioAmbientaisUFs[sgUf] || [];
            const encontrado = lista.find(d => {
                if (d.sigla_indicador !== sigla || d.valor === null || isNaN(d.valor)) return false;
                const info = extrairInfoTemporalSocio(d);
                if (anoAlvo && info.ano !== Number(anoAlvo)) return false;
                if (mesAlvo && mesAlvo > 0 && info.mes !== Number(mesAlvo)) return false;
                return true;
            });
            if (encontrado) {
                rankingData.push({ sg_uf: sgUf, valor: Number(encontrado.valor) });
            }
        });
    }

    const rankingArr = rankingData.map(r => ({
        uf: r.sg_uf,
        valor: Number(r.valor) || 0
    }));

    // Adiciona referências regionais (NE e BR) se vierem do banco
    benchmarks.forEach(b => {
        rankingArr.push({
            uf: b.sg_regiao === 'NE' ? 'Nordeste (NE)' : 'Brasil (BR)',
            valor: Number(b.valor) || 0,
            isBenchmark: true
        });
    });

    // Garante NE e BR mesmo se a view regional não tiver o indicador
    garantirBenchmarksRegionais(rankingArr, config);

    // Ordenação respeitando polaridade (menor no topo se isLowerBetter)
    const isLowerBetter = config.isLowerBetter || false;
    rankingArr.sort((a, b) => isLowerBetter ? (a.valor - b.valor) : (b.valor - a.valor));

    const labelPeriodo = (mesAlvo && mesAlvo > 0)
        ? `${MESES_CURTOS_UFS[mesAlvo - 1]}/${anoAlvo}`
        : String(anoAlvo || '');

    renderGraficoBarrasRanking(rankingArr, uf, nomeExibicao, config, labelPeriodo);
    renderStorytellingModal(nomeExibicao, uf, rankingArr, config, labelPeriodo, mesAlvo > 0);
}

// Renderização do Modal para Dados Socioambientais
async function renderizarModalSocio(sigla, uf) {
    const config = obterConfigUFs(sigla);

    // 1. Série histórica completa da UF com parse temporal (ano + mês)
    const baseUF = dadosSocioAmbientaisUFs[uf] || [];
    let serieUF = baseUF
        .filter(d => d.sigla_indicador === sigla && d.valor !== null && !isNaN(d.valor))
        .map(d => ({
            raw: d,
            valor: Number(d.valor),
            tempo: extrairInfoTemporalSocio(d)
        }))
        .sort((a, b) => a.tempo.sortKey - b.tempo.sortKey);

    if (serieUF.length === 0) return;

    const isSerieMensal = serieUF.some(item => item.tempo.isMensal);

    // Se a série for mensal (ex: iatur_volume_idx, iatur_receita_idx), recorta os últimos 10 anos
    if (isSerieMensal) {
        const maisRecente = serieUF[serieUF.length - 1].tempo;
        const sortKeyCorte = (maisRecente.ano - 10) * 100 + maisRecente.mes;
        serieUF = serieUF.filter(item => item.tempo.sortKey >= sortKeyCorte);
    }

    const labelsEixoX = serieUF.map(item => item.tempo.label);
    const valores = serieUF.map(item => item.valor);
    const metadadosPontos = serieUF.map(item => item.tempo);

    const nomeExibicao = serieUF[serieUF.length - 1].raw.nm_indicador || sigla;
    const ultimoPonto = metadadosPontos[metadadosPontos.length - 1];

    // 2. Renderiza gráfico de linha com suporte a clique para atualizar o ranking
    renderGraficoLinhaModal(
        labelsEixoX,
        valores,
        nomeExibicao,
        uf,
        config,
        metadadosPontos,
        async function(pontoSelecionado) {
            await atualizarRankingSocioPorPeriodo(
                sigla,
                uf,
                nomeExibicao,
                config,
                pontoSelecionado.ano,
                pontoSelecionado.mes
            );
        }
    );

    // 3. Carrega o ranking inicial usando o período mais recente como padrão
    await atualizarRankingSocioPorPeriodo(
        sigla,
        uf,
        nomeExibicao,
        config,
        ultimoPonto.ano,
        ultimoPonto.mes
    );
}

// Helper unificado de sufixo para os eixos dos gráficos
function obterSufixoGrafico(config) {
    if (config.isPct) return '%';
    if (config.isIndice) return '';
    if (config.isPotencia) return ' kW';
    if (config.isToneladas) return ' t';
    if (config.isMoedaUnit) return config.suffix ? ` R$${config.suffix}` : ' R$';
    if (config.isAbs) return '';
    if (config.isPerCapita) return ' R$';
    return ' R$ bi';
}

// Gráfico de Linha Plurianual / Mensal (ECharts) com clique interativo para todos os indicadores
function renderGraficoLinhaModal(categorias, valores, indicador, uf, config, metadadosPontos = null, onClickPonto = null) {
    const dom = document.getElementById('modal_ufs_chart_serie');
    if (!dom) return;

    if (chartModalUFsSerie) chartModalUFsSerie.dispose();
    chartModalUFsSerie = echarts.init(dom);

    if (categorias.length === 0) {
        chartModalUFsSerie.clear();
        return;
    }

    const suf = obterSufixoGrafico(config);
    const isMensal = Array.isArray(metadadosPontos) && metadadosPontos.some(p => p.isMensal);
    const podeClicar = typeof onClickPonto === 'function' && Array.isArray(metadadosPontos);

    // Índice selecionado por padrão: o ponto mais recente
    let idxSelecionado = categorias.length - 1;

    const montarDadosSerie = (idxAtivo) => {
        return valores.map((v, idx) => {
            if (podeClicar && idx === idxAtivo) {
                return {
                    value: v,
                    symbolSize: 12,
                    itemStyle: {
                        color: '#ff5a26',
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }
                };
            }
            return v;
        });
    };

    chartModalUFsSerie.setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const item = params[0];
                const idx = item.dataIndex;
                const tituloPeriodo = (metadadosPontos && metadadosPontos[idx])
                    ? metadadosPontos[idx].labelCompleto
                    : item.name;
                const v = Number(item.value).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
                const dicaClique = podeClicar
                    ? `<br/><span style="font-size:11px;color:#64748b;"><i class="fas fa-hand-pointer"></i> Clique para comparar as UFs neste ${isMensal ? 'mês' : 'ano'}</span>`
                    : '';
                return `<strong>${uf} (${tituloPeriodo})</strong><br/>${indicador}: <strong>${v}${suf}</strong>${dicaClique}`;
            }
        },
        grid: { left: '3%', right: '4%', bottom: isMensal ? '14%' : '8%', top: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: categorias,
            boundaryGap: false,
            axisLabel: {
                interval: isMensal ? 'auto' : 0,
                rotate: isMensal ? 30 : 0,
                fontSize: 11
            }
        },
        yAxis: {
            type: 'value',
            scale: isMensal,
            axisLabel: { formatter: '{value}' + suf }
        },
        series: [{
            name: indicador,
            type: 'line',
            data: montarDadosSerie(idxSelecionado),
            smooth: true,
            symbol: 'circle',
            symbolSize: isMensal ? 6 : 8,
            lineStyle: { width: 3, color: config.color },
            itemStyle: { color: config.color },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: config.color + '66' },
                    { offset: 1, color: config.color + '05' }
                ])
            }
        }]
    });

    // Evento de clique em qualquer ponto (mês ou ano) para atualizar o ranking comparativo
    if (podeClicar) {
        chartModalUFsSerie.off('click');
        chartModalUFsSerie.on('click', function(params) {
            const idx = params.dataIndex;
            const ponto = metadadosPontos[idx];
            if (!ponto) return;

            idxSelecionado = idx;
            chartModalUFsSerie.setOption({
                series: [{
                    data: montarDadosSerie(idxSelecionado)
                }]
            });

            onClickPonto(ponto);
        });
    }
}

// Storytelling dinâmico abaixo dos gráficos do modal
function renderStorytellingModal(indicador, uf, rankingArr, config, periodoLabel, isMensal = false) {
    const box = document.getElementById('modal_ufs_kpi_storytelling');
    if (!box) return;

    // Filtra apenas as 27 UFs para calcular a posição exata no ranking estadual
    const apenasUFs = rankingArr.filter(d => !d.isBenchmark);
    const rankPos = apenasUFs.findIndex(d => d.uf === uf) + 1;
    const totalUfs = apenasUFs.length;
    const itemUF = apenasUFs.find(d => d.uf === uf);

    const dicaInterativa = isMensal
        ? `<div class="mt-1 text-muted small"><i class="fas fa-mouse-pointer text-primary me-1"></i> <em>Dica: clique em qualquer mês no gráfico da série histórica para atualizar o comparativo nacional.</em></div>`
        : `<div class="mt-1 text-muted small"><i class="fas fa-mouse-pointer text-primary me-1"></i> <em>Dica: clique em qualquer ano no gráfico da série histórica para atualizar o comparativo nacional.</em></div>`;

    if (!itemUF) {
        box.innerHTML = `
            <div>
                Dados comparativos consolidados para o indicador <strong>${indicador}</strong> em <strong>${periodoLabel}</strong>.
                ${dicaInterativa}
            </div>
        `;
        return;
    }

    const valFmt = formatarValorUFs(itemUF.valor, config);
    let textoRank = rankPos > 0 ? `ocupando a <strong>${rankPos}ª posição</strong> entre as ${totalUfs} Unidades da Federação` : '';

    box.innerHTML = `
        <div class="d-flex align-items-start gap-2">
            <i class="fas fa-circle-info text-primary fs-5 mt-0.5"></i>
            <div>
                O estado de <strong>${uf}</strong> registrou <strong>${valFmt}</strong> para o indicador <strong>${indicador}</strong> (<strong>${periodoLabel}</strong>), ${textoRank}.
                As barras em destaque (laranja) representam os parâmetros de referência do Nordeste e do Brasil.
                ${dicaInterativa}
            </div>
        </div>
    `;
}
// Gráfico de Barras Horizontais com Ranking Nacional
function renderGraficoBarrasRanking(rankingArr, ufAlvo, indicador, config, periodoLabel) {
    const dom = document.getElementById('modal_ufs_chart_ranking');
    if (!dom) return;

    if (chartModalUFsRanking) chartModalUFsRanking.dispose();
    chartModalUFsRanking = echarts.init(dom);

    if (!rankingArr || rankingArr.length === 0) {
        chartModalUFsRanking.clear();
        return;
    }

    // Inversão para que o 1º lugar do ranking fique no topo do eixo Y categórico
    const dadosReversos = [...rankingArr].reverse();
    const categorias = dadosReversos.map(d => d.uf);
    const valores = dadosReversos.map(d => {
        let isAlvo = d.uf === ufAlvo;
        let isBench = d.isBenchmark;
        let cor = isAlvo ? '#1a3c6e' : (isBench ? '#F39C12' : '#BDC3C7');
        return {
            value: d.valor,
            itemStyle: {
                color: cor,
                borderRadius: [0, 4, 4, 0]
            }
        };
    });

    const suf = obterSufixoGrafico(config);

    chartModalUFsRanking.setOption({
        title: periodoLabel ? {
            text: `Referência: ${periodoLabel}`,
            right: '4%',
            top: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold', color: '#475569' }
        } : undefined,
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const item = params[0];
                const v = Number(item.value).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
                const perStr = periodoLabel ? ` (${periodoLabel})` : '';
                return `<strong>${item.name}${perStr}</strong><br/>${indicador}: <strong>${v}${suf}</strong>`;
            }
        },
        grid: { left: '3%', right: '8%', bottom: '5%', top: periodoLabel ? '10%' : '5%', containLabel: true },
        xAxis: { type: 'value', axisLabel: { formatter: '{value}' + suf } },
        yAxis: { type: 'category', data: categorias, axisLabel: { fontSize: 11, fontWeight: 'bold' } },
        series: [{
            type: 'bar',
            data: valores,
            barMaxWidth: 16
        }]
    });
}


// Redimensionamento de Gráficos no ciclo de vida das abas
window.redimensionarGraficosUFs = function() {
    if (chartModalUFsSerie) chartModalUFsSerie.resize();
    if (chartModalUFsRanking) chartModalUFsRanking.resize();
};


/* ==========================================================================
   RESUMO EXECUTIVO DE BENCHMARKING DAS UFs (5 EIXOS ESTRATÉGICOS)
   ========================================================================== */
function renderizarResumoExecutivoUFs(uf, baseSocio) {
    try {
        const $container = $('#ufs_container_resumo_executivo');
        if (!$container.length) return;
        $container.empty();

        const mapaNomesUFs = {
            "AC": "Acre", "AL": "Alagoas", "AM": "Amazonas", "AP": "Amapá", "BA": "Bahia",
            "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo", "GO": "Goiás",
            "MA": "Maranhão", "MG": "Minas Gerais", "MS": "Mato Grosso do Sul", "MT": "Mato Grosso",
            "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco", "PI": "Piauí", "PR": "Paraná",
            "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RO": "Rondônia", "RR": "Roraima",
            "RS": "Rio Grande do Sul", "SC": "Santa Catarina", "SE": "Sergipe", "SP": "São Paulo", "TO": "Tocantins"
        };
        const nomeUF = mapaNomesUFs[String(uf || '').toUpperCase()] || uf || 'PE';

        const safeNum = (v, fallback = 0) => {
            if (v === null || v === undefined) return fallback;
            const n = parseFloat(String(v).replace(',', '.'));
            return isNaN(n) ? fallback : n;
        };

        const safeFmt = (v, dec = 1, suffix = '') => {
            const n = safeNum(v, null);
            return (n !== null && n > 0) ? (n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix) : '-';
        };

        // Helper formatador de contagem inteira
        const safeFmtInt = (v) => {
            const n = safeNum(v, null);
            return (n !== null && n > 0) ? Math.round(n).toLocaleString('pt-BR') : '-';
        };

        // Helper formatador de moeda compacta
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

        const socioArray = Array.isArray(baseSocio) ? baseSocio : [];

        // Eixo 1: Conhecimento e Inovação
        const ideb3Item = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_3ano_total') || {}) : {};
        const ideb3 = (ideb3Item.valAtual > 0) ? ideb3Item : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_3ano_estadual') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const ideb5Item = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_5ano_total') || {}) : {};
        const ideb5 = (ideb5Item.valAtual > 0) ? ideb5Item : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_5ano_publica') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const abaEMItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'aba_em_total') || {}) : {};
        const abaEM = (abaEMItem.valAtual > 0) ? abaEMItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'aba_em_estadual') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const despEdu = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Educação') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let textoEixo1 = `No desempenho educacional, registra nota no IDEB do Ensino Médio de <strong>${safeFmt(ideb3.valAtual, 1)}</strong> (${ideb3.rank > 0 ? ideb3.rank + 'º no Brasil' : 'referência estadual'}) e IDEB Anos Iniciais de <strong>${safeFmt(ideb5.valAtual, 1)}</strong> (${ideb5.rank > 0 ? ideb5.rank + 'º BR' : '-'}). A taxa de abandono escolar no Ensino Médio situa-se em <strong>${safeFmt(abaEM.valAtual, 1, '%')}</strong> e despesa orçamentária executada em Educação em <strong>${formataMoedaCompacta(despEdu.valAtual)}</strong> (${despEdu.rank > 0 ? despEdu.rank + 'º em alocação' : '-'}).`;

        // =====================================================================
        // Eixo 2: Segurança e Cidadania (Estatísticas Criminais + Orçamento)
        // =====================================================================
        const txMviItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tx_mvi') || {}) : {};
        const mviItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'mvi') || {}) : {};
        const txCvpItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tx_cvp') || {}) : {};
        const txCelItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tx_rfcelular') || {}) : {};
        const femItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tx_feminicidio') || {}) : {};
        const popCarcItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'pop_carceraria') || {}) : {};

        const despSeg = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Segurança Pública') || { valAtual: 0, rank: 0, varPct: 0, exercicio: '-' }) : { valAtual: 0, rank: 0, varPct: 0, exercicio: '-' };
        const despCid = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Direitos da Cidadania') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let textoEixo2 = `No panorama da segurança pública, a UF aponta Taxa de Mortes Violentas Intencionais (MVI) de <strong>${safeFmt(txMviItem.valAtual, 1)}</strong> por 100 mil hab. (${txMviItem.rank > 0 ? txMviItem.rank + 'ª maior taxa do país' : (safeFmtInt(mviItem.valAtual) + ' vítimas')} em ${txMviItem.ano || '-'}), taxa de crimes patrimoniais (CVP) em <strong>${safeFmt(txCvpItem.valAtual, 1)}</strong> e furto/roubo de celulares em <strong>${safeFmt(txCelItem.valAtual, 1)}</strong>. A população carcerária é de <strong>${safeFmtInt(popCarcItem.valAtual)}</strong> pessoas privadas de liberdade. Para enfrentamento, alocou <strong>${formataMoedaCompacta(despSeg.valAtual)}</strong> na função Segurança Pública (${despSeg.rank > 0 ? despSeg.rank + 'º maior orçamento' : 'orçamento executado'}) e <strong>${formataMoedaCompacta(despCid.valAtual)}</strong> em Cidadania.`;

        // Eixo 3: Saúde e Qualidade de Vida
        const despSaude = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Saúde') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despHab = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Habitação') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despUrb = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Urbanismo') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        
        const aguaItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'pct_agua_rede') || {}) : {};
        const agua = (aguaItem.valAtual > 0) ? aguaItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'atendimento_agua') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        let textoEixo3 = `O setor de saúde pública e qualidade de vida conta com execução orçamentária de <strong>${formataMoedaCompacta(despSaude.valAtual)}</strong> (${despSaude.rank > 0 ? despSaude.rank + 'º no Brasil' : '-'}), com foco no custeio e investimentos da rede assistencial do SUS. Na infraestrutura de bem-estar urbano, foram alocados <strong>${formataMoedaCompacta(despUrb.valAtual)}</strong> em urbanismo e <strong>${formataMoedaCompacta(despHab.valAtual)}</strong> em habitação social, com atendimento de água tratada em <strong>${safeFmt(agua.valAtual, 1, '%')}</strong>.`;

        // Eixo 4: Desenvolvimento Sustentável
        const pibpcItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'pib_per_capita') || {}) : {};
        const pibpc = (pibpcItem.valAtual > 0) ? pibpcItem : ((typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'PIB per Capita') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const desempItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'taxa_desocupacao_media') || {}) : {};
        const desemp = (desempItem.valAtual > 0) ? desempItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'taxa_desocupacao') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const despAmb = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Gestão Ambiental') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despAgro = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Agricultura') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let textoEixo4 = `A dinâmica econômica e ambiental da UF apresenta PIB per capita de <strong>${pibpc.valAtual > 0 ? 'R$ ' + Number(pibpc.valAtual).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'}</strong> (${pibpc.rank > 0 ? pibpc.rank + 'º no ranking nacional' : '-'}), com taxa de desocupação do trabalho em <strong>${safeFmt(desemp.valAtual, 1, '%')}</strong> (${desemp.rank > 0 ? desemp.rank + 'º menor desemprego' : '-'}). Na sustentabilidade produtiva e ambiental, executou <strong>${formataMoedaCompacta(despAgro.valAtual)}</strong> na agricultura e <strong>${formataMoedaCompacta(despAmb.valAtual)}</strong> em gestão e proteção ambiental.`;

        // Eixo 5: Gestão, Transparência & Fiscal
        const rcl = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Receita Corrente Líquida') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const dtp = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'DTP/RCL') || {}) : {};
        const dtpVal = (dtp.valAtual > 0) ? dtp : ((typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Despesa Total com Pessoal - DTP (% da RCL)') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });
        
        const invLiq = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Investimentos - Liq.') || {}) : {};
        const invest = (invLiq.valAtual > 0) ? invLiq : ((typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Despesas de Capital - Emp.') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const capagItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'capag') || {}) : {};
        let capagNota = capagItem.valAtual ? String(capagItem.valAtual).toUpperCase() : (uf === 'PE' ? 'B' : 'A');

        let textoEixo5 = `No pilar de gestão fiscal e responsabilidade governamental, a UF registra Receita Corrente Líquida (RCL) de <strong>${formataMoedaCompacta(rcl.valAtual)}</strong> e investimentos de <strong>${formataMoedaCompacta(invest.valAtual)}</strong> (${invest.rank > 0 ? invest.rank + 'º maior volume de investimentos do país' : '-'}). O comprometimento com despesa de pessoal situa-se em <strong>${safeFmt(dtpVal.valAtual, 1, '%')} da RCL</strong>, assegurando equilíbrio perante a LRF e classificação de solvência fiscal STN.`;

        const htmlResumo = `
            <div class="resumo-exec-banner mb-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-white text-orange-950 font-black px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs shadow-xs">
                            <i class="fas fa-chart-column me-1 text-[#ff5a26]"></i> Síntese Estratégica de Benchmarking
                        </span>
                        <span class="text-orange-100 font-semibold text-xs">${nomeUF} (${uf}) &bull; Benchmarking Nacional (27 UFs)</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-graduation-cap me-1 text-amber-300"></i> IDEB Médio: ${safeFmt(ideb3.valAtual, 1)} (${ideb3.rank > 0 ? ideb3.rank + 'º BR' : '-'})
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-shield-halved me-1 text-rose-300"></i> Taxa MVI: ${safeFmt(txMviItem.valAtual, 1)} (${txMviItem.rank > 0 ? txMviItem.rank + 'º BR' : '-'})
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-briefcase me-1 text-emerald-300"></i> Desocupação: ${safeFmt(desemp.valAtual, 1, '%')}
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-landmark me-1 text-cyan-300"></i> RCL: ${formataMoedaCompacta(rcl.valAtual)}
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-scale-balanced me-1 text-purple-300"></i> Pessoal: ${safeFmt(dtpVal.valAtual, 1, '%')}
                        </span>
                    </div>
                </div>
                <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                    A Unidade Federativa <strong>${nomeUF} (${uf})</strong> posiciona-se no benchmarking nacional com Taxa de MVI de <strong>${safeFmt(txMviItem.valAtual, 1)}</strong> por 100k hab. (${txMviItem.rank > 0 ? txMviItem.rank + 'º maior no Brasil' : 'referência'}), IDEB do Ensino Médio em <strong>${safeFmt(ideb3.valAtual, 1)}</strong> e taxa de desocupação de <strong>${safeFmt(desemp.valAtual, 1, '%')}</strong>. No campo orçamentário e fiscal, mobiliza uma Receita Corrente Líquida de <strong>${formataMoedaCompacta(rcl.valAtual)}</strong>, executando <strong>${formataMoedaCompacta(despSeg.valAtual)}</strong> em Segurança Pública e <strong>${formataMoedaCompacta(invest.valAtual)}</strong> em investimentos, mantendo a folha salarial em <strong>${safeFmt(dtpVal.valAtual, 1, '%')}</strong> da RCL.
                </p>
            </div>

           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <!-- EIXO 1: CONHECIMENTO E INOVAÇÃO -->
                <div class="resumo-dim-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" 
                     onclick="window.scrollToSection('sec_ufs_conhecimento')" 
                     style="border-top: 4px solid #D97706; cursor: pointer;"
                     title="Clique para ir aos indicadores de Conhecimento e Inovação">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-lightbulb text-amber-500 me-1.5"></i> Conhecimento</span>
                        <span class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2">Eixo 1</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">IDEB Médio (3º):</span> <strong class="text-slate-800">${safeFmt(ideb3.valAtual, 1)} <span class="text-[10px] text-slate-400">(${ideb3.rank > 0 ? ideb3.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">IDEB Iniciais (5º):</span> <strong class="text-slate-800">${safeFmt(ideb5.valAtual, 1)} <span class="text-[10px] text-slate-400">(${ideb5.rank > 0 ? ideb5.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Abandono Escolar:</span> <strong class="text-slate-800">${safeFmt(abaEM.valAtual, 1, '%')}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Despesa Educação:</span> <strong class="text-slate-800">${formataMoedaCompacta(despEdu.valAtual)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo1}
                    </div>
                </div>

                <!-- EIXO 2: SEGURANÇA E CIDADANIA -->
                <div class="resumo-dim-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" 
                     onclick="window.scrollToSection('sec_ufs_seguranca')" 
                     style="border-top: 4px solid #DC2626; cursor: pointer;"
                     title="Clique para ir aos indicadores de Segurança e Cidadania">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-shield-halved text-rose-600 me-1.5"></i> Segurança</span>
                        <span class="badge bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-pill px-2">Eixo 2</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Taxa MVI (/100k):</span> <strong class="text-slate-800">${safeFmt(txMviItem.valAtual, 1)} <span class="text-[10px] text-slate-400">(${txMviItem.rank > 0 ? txMviItem.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Taxa CVP:</span> <strong class="text-slate-800">${safeFmt(txCvpItem.valAtual, 1)} <span class="text-[10px] text-slate-400">(${txCvpItem.rank > 0 ? txCvpItem.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Taxa Celulares:</span> <strong class="text-slate-800">${safeFmt(txCelItem.valAtual, 1)} <span class="text-[10px] text-slate-400">(${txCelItem.rank > 0 ? txCelItem.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Pop. Carcerária:</span> <strong class="text-slate-800">${safeFmtInt(popCarcItem.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Segurança:</span> <strong class="text-slate-800">${formataMoedaCompacta(despSeg.valAtual)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo2}
                    </div>
                </div>

                <!-- EIXO 3: SAÚDE E QUALIDADE DE VIDA -->
                <div class="resumo-dim-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" 
                     onclick="window.scrollToSection('sec_ufs_saude')" 
                     style="border-top: 4px solid #2563EB; cursor: pointer;"
                     title="Clique para ir aos indicadores de Saúde e Qualidade de Vida">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-heartbeat text-blue-600 me-1.5"></i> Saúde &amp; Vida</span>
                        <span class="badge bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-pill px-2">Eixo 3</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Despesa Saúde:</span> <strong class="text-slate-800">${formataMoedaCompacta(despSaude.valAtual)} <span class="text-[10px] text-slate-400">(${despSaude.rank > 0 ? despSaude.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Urbanismo:</span> <strong class="text-slate-800">${formataMoedaCompacta(despUrb.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Habitação:</span> <strong class="text-slate-800">${formataMoedaCompacta(despHab.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Água Tratada:</span> <strong class="text-slate-800">${safeFmt(agua.valAtual, 1, '%')}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo3}
                    </div>
                </div>

                <!-- EIXO 4: DESENVOLVIMENTO SUSTENTÁVEL -->
                <div class="resumo-dim-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" 
                     onclick="window.scrollToSection('sec_ufs_sustentabilidade')" 
                     style="border-top: 4px solid #059669; cursor: pointer;"
                     title="Clique para ir aos indicadores de Desenvolvimento Sustentável">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-tree text-emerald-600 me-1.5"></i> Sustentabilidade</span>
                        <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-pill px-2">Eixo 4</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">PIB per Capita:</span> <strong class="text-slate-800">${pibpc.valAtual > 0 ? 'R$ ' + Number(pibpc.valAtual).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'} <span class="text-[10px] text-slate-400">(${pibpc.rank > 0 ? pibpc.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desocupação:</span> <strong class="text-slate-800">${safeFmt(desemp.valAtual, 1, '%')} <span class="text-[10px] text-slate-400">(${desemp.rank > 0 ? desemp.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Agricultura:</span> <strong class="text-slate-800">${formataMoedaCompacta(despAgro.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Ambiental:</span> <strong class="text-slate-800">${formataMoedaCompacta(despAmb.valAtual)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo4}
                    </div>
                </div>

                <!-- EIXO 5: GESTÃO FISCAL -->
                <div class="resumo-dim-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" 
                     onclick="window.scrollToSection('sec_ufs_gestao')" 
                     style="border-top: 4px solid #7C3AED; cursor: pointer;"
                     title="Clique para ir aos indicadores de Gestão Fiscal">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-scale-balanced text-purple-600 me-1.5"></i> Gestão Fiscal</span>
                        <span class="badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-pill px-2">Eixo 5</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">RCL do Estado:</span> <strong class="text-slate-800">${formataMoedaCompacta(rcl.valAtual)} <span class="text-[10px] text-slate-400">(${rcl.rank > 0 ? rcl.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">DTP (% da RCL):</span> <strong class="text-slate-800">${safeFmt(dtpVal.valAtual, 1, '%')}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Investimentos:</span> <strong class="text-slate-800">${formataMoedaCompacta(invest.valAtual)} <span class="text-[10px] text-slate-400">(${invest.rank > 0 ? invest.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Solvência STN:</span> <strong class="badge bg-purple-100 text-purple-800 px-2 py-0.5 rounded-pill text-[11px]">CAPAG ${capagNota}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo5}
                    </div>
                </div>
            </div>
        `;

        $container.html(htmlResumo);
    } catch (eResumo) {
        console.error("[UFs] Erro ao renderizar resumo executivo UFs:", eResumo);
    }
}

window.scrollToSection = function(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// =========================================================================
// CONTROLE DE ROLAGEM: SUBIR AO TOPO (UFs)
// =========================================================================

window.subirAoTopoUFs = function() {
    // Rola a janela principal
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Caso a rolagem esteja acontecendo dentro de um container com scroll próprio:
    const mainContainer = document.querySelector('main') || document.querySelector('.content-wrapper') || document.getElementById('aba_ufs');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
};

// Função unificada para checar a rolagem
function checarScrollTopoUFs() {
    const btn = document.getElementById('ufs_btn_subir_topo');
    if (!btn) return;

    // Detecta scroll no window, body, html ou containers internos
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const containerScroll = document.querySelector('main')?.scrollTop || document.getElementById('aba_ufs')?.scrollTop || 0;
    const scrollFinal = Math.max(scrollY, containerScroll);

    if (scrollFinal > 300) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

// Escuta rolagem na janela e com captura em containers filhos
window.addEventListener('scroll', checarScrollTopoUFs, true);


// =========================================================================
// RENDERIZADOR HIERÁRQUICO AUTOMÁTICO DE KPIS (POR SUBDIMENSÃO)
// =========================================================================

const ICONES_SUBDIMENSOES = {
    "Policiamento Ostensivo e Criminalidade Letal": "fas fa-shield-halved text-rose-600",
    "Policiamento Ostensivo e Crimes Patrimoniais": "fas fa-person-burst text-amber-600",
    "Prevenção Social e Proteção às Mulheres": "fas fa-person-dress text-purple-600",
    "Custódia, Sistema Prisional e Ressocialização": "fas fa-building-shield text-slate-600",
    "Alocação Orçamentária e Gestão da Justiça": "fas fa-hand-holding-dollar text-emerald-600",
    
    // Conhecimento e Inovação
    "Educação Básica": "fas fa-graduation-cap text-blue-600",
    "Fluxo Escolar": "fas fa-clock-rotate-left text-amber-600",
    "Educação Infantil": "fas fa-children text-teal-600",
    "Despesas Públicas": "fas fa-receipt text-indigo-600",
    "Gestão e Equilíbrio Fiscal": "fas fa-scale-balanced text-purple-600",

    // Sustentabilidade & Economia
    "Atividade Econômica e Produtividade": "fas fa-chart-line text-blue-600",
    "Atividade Econômica, Logística e Agro": "fas fa-chart-line text-blue-600",
    "Mercado de Trabalho e Dinâmica Demográfica": "fas fa-users-gear text-emerald-600",
    "Mercado de Trabalho e Demografia": "fas fa-users-gear text-emerald-600",
    "Habitação e Desenvolvimento Urbano": "fas fa-city text-amber-600",
    "Meio Ambiente e Unidades de Conservação": "fas fa-tree text-green-600",
    "Unidades de Conservação e Áreas Protegidas": "fas fa-tree text-green-600",
    "Alocação Orçamentária e Infraestrutura Sustentável": "fas fa-hand-holding-dollar text-teal-600",
    "Alocação Orçamentária e Infraestrutura": "fas fa-hand-holding-dollar text-teal-600",
    "Transição Energética e Renováveis": "fas fa-solar-panel text-amber-500",
    "Saneamento e Esgotamento Sanitário": "fas fa-faucet-drip text-cyan-600",
    "Abastecimento de Água e Eficiência Hídrica": "fas fa-droplet text-blue-500",
    "Logística e Agropecuária": "fas fa-ship text-indigo-600"
};

function renderizarGridComSubdimensoes(containerId, itensConfigurados) {
    const elContainer = document.getElementById(containerId);
    if (!elContainer) return;

    // 1. Agrupa os itens por subdimensão mantendo a ordem de aparição
    const grupos = {};
    itensConfigurados.forEach(item => {
        const meta = buscarMetadadoUFs(item.siglaOrKey) || {};
        const sub = meta.subdimensao || item.subdimensaoFallback || "Outros Indicadores";
        if (!grupos[sub]) grupos[sub] = [];
        grupos[sub].push(item);
    });

    const nomesGrupos = Object.keys(grupos);
    let html = '';

    // 2. Cria barra de navegação rápida (Sub-pills) se houver mais de 1 subdimensão
    if (nomesGrupos.length > 1) {
        html += `
            <div class="col-12 mb-3 d-print-none">
                <div class="d-flex align-items-center gap-1.5 flex-wrap p-2 bg-slate-100 rounded-2xl border border-slate-200">
                    <span class="text-xs font-black text-slate-500 uppercase px-2 me-1">
                        <i class="fas fa-filter text-[#ff5a26] me-1"></i> Sub-eixos:
                    </span>
        `;
        nomesGrupos.forEach((subNome, idx) => {
            const subId = `${containerId}_sub_${idx}`;
            const icone = ICONES_SUBDIMENSOES[subNome] || "fas fa-layer-group text-slate-500";
            html += `
                <button type="button" 
                        class="btn btn-sm btn-white bg-white border border-slate-200 rounded-pill text-xs fw-bold text-slate-700 shadow-2xs d-flex align-items-center gap-1.5 px-3 py-1 hover:border-slate-400"
                        onclick="document.getElementById('${subId}').scrollIntoView({ behavior: 'smooth', block: 'center' })">
                    <i class="${icone}" style="font-size: 0.75rem;"></i>
                    ${subNome}
                    <span class="badge bg-slate-100 text-slate-600 rounded-pill ms-1" style="font-size: 0.65rem;">${grupos[subNome].length}</span>
                </button>
            `;
        });
        html += `
                </div>
            </div>
        `;
    }

    // 3. Renderiza cada bloco com seu divisor estilizado e os cards
    nomesGrupos.forEach((subNome, idx) => {
        const subId = `${containerId}_sub_${idx}`;
        const icone = ICONES_SUBDIMENSOES[subNome] || "fas fa-layer-group text-slate-500";
        const cards = grupos[subNome];

        html += `
            <div id="${subId}" class="col-12 mt-3 mb-2" style="scroll-margin-top: 100px;">
                <div class="d-flex align-items-center justify-content-between border-b-2 border-slate-200 pb-2 mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-lg bg-slate-100 p-2 border border-slate-200 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <i class="${icone}"></i>
                        </div>
                        <h6 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-0">${subNome}</h6>
                    </div>
                    <span class="badge bg-slate-100 text-slate-600 border border-slate-200 rounded-pill text-xs px-2.5 py-1 font-bold">
                        ${cards.length} ${cards.length === 1 ? 'indicador' : 'indicadores'}
                    </span>
                </div>
            </div>
        `;

        // Insere o HTML dos cards pertencentes a esse subgrupo
        cards.forEach(c => {
            html += c.cardHtml;
        });
    });

    elContainer.innerHTML = html;
}