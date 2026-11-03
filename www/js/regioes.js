// www/js/regioes.js

var mapasRD = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null };
var chartsRD = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null };
var histChartsRD = { 1: null, 2: null, 3: null, 4: null, 5: null }; // A Dimensão 0 (REGIC) não possui evolução temporal
var varAtivaCluster = { 0: 'indice_acessibilidade_from', 1: 'pop_2026', 2: 'cob_fibra', 3: 'pibpc', 4: 'ivcad', 5: 'fisc_rcl' };
var dtMatrizRD = null;
var dadosBrutosRD = null;
var clusterRenderizado = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false };
var matrizRenderizada = false;
var regioesObserver = null;
var modoRotasCluster0 = false;

function ocultarSpinnerRD(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
}

function mostrarSpinnerRD(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('d-none');
}

function mostrarTodosSpinnersRD() {
    $('.rd-cluster-spinner').removeClass('d-none');
}

const INDICADORES_CLUSTER0_PADRAO = [
    'indice_acessibilidade_from', 'indice_acessibilidade_to', 'cgt', 'ia', 'indice_centralidade_interm_tempo', 'indice_centralidade_interm_dist'
];

const INDICADORES_CLUSTER0_FLUXOS = [
    'peso_geral', 'peso_saude_alta', 'peso_saude_baixa_media', 'peso_ensino_superior',
    'peso_vestuario_calcados', 'peso_moveis_eletro', 'peso_transporte_publico',
    'peso_aeroportos', 'peso_ativ_culturais', 'peso_ativ_esportivas', 'peso_jornais'
];

const DICIONARIO_INDICADORES = {
    // Cluster 0 (REGIC - Redes Urbanas e Atração Estadual)
    'cgt': { nome: 'Centralidade de Gestão (CGT)', tipo: 'indice', sufixo: '' },
    'ia': { nome: 'Índice de Atração (IA)', tipo: 'absoluto', sufixo: '' },
    'indice_acessibilidade_from': { nome: 'Acessibilidade (Busca/Escoamento)', tipo: 'indice', sufixo: '' },
    'indice_acessibilidade_to': { nome: 'Acessibilidade (Atração/Chegada)', tipo: 'indice', sufixo: '' },
    'indice_centralidade_interm_tempo': { nome: 'Centralidade por Tempo', tipo: 'indice', sufixo: '' },
    'indice_centralidade_interm_dist': { nome: 'Centralidade por Distância', tipo: 'indice', sufixo: '' },

    // Cluster 0 - Rotas de Atração e Fluxos (REGIC Fluxos)
    'peso_geral': { nome: 'Peso Geral (Atração Total)', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_saude_alta': { nome: 'Saúde (Alta Complexidade)', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_saude_baixa_media': { nome: 'Saúde (Baixa e Média Complexidade)', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_ensino_superior': { nome: 'Ensino Superior', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_vestuario_calcados': { nome: 'Vestuário e Calçados', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_moveis_eletro': { nome: 'Móveis e Eletrodomésticos', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_transporte_publico': { nome: 'Transporte Público', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_aeroportos': { nome: 'Aeroportos', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_ativ_culturais': { nome: 'Atividades Culturais', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_ativ_esportivas': { nome: 'Atividades Esportivas', tipo: 'absoluto', sufixo: 'ligações' },
    'peso_jornais': { nome: 'Jornais e Periódicos', tipo: 'absoluto', sufixo: 'ligações' },

    // Cluster 1
    'pop_2026': { nome: 'População Estimada (2026)', tipo: 'absoluto', sufixo: 'hab.' },
    'perc_pop_urb': { nome: 'População Urbana', tipo: 'percentual', sufixo: '%' },
    'perc_pop_rur': { nome: 'População Rural', tipo: 'percentual', sufixo: '%' },
    'rd_pop': { nome: 'Razão de Dependência Total', tipo: 'indice', sufixo: '' },
    'rd_jovem': { nome: 'Razão de Dependência Jovem', tipo: 'indice', sufixo: '' },
    'rd_idosa': { nome: 'Razão de Dependência Idosa', tipo: 'indice', sufixo: '' },
    'ind_envelhecimento': { nome: 'Índice de Envelhecimento', tipo: 'indice', sufixo: '' },
    'pct_longevidade': { nome: 'Taxa de Superlongevidade (80+)', tipo: 'percentual', sufixo: '%' },
    'pct_pia': { nome: 'Peso da População em Idade Ativa (PIA)', tipo: 'percentual', sufixo: '%' },
    'ind_ir_pia': { nome: 'Índice de Renovação da PIA', tipo: 'indice', sufixo: '' },
    'ind_renov_trabalho': { nome: 'Razão de Renovação do Trabalho', tipo: 'indice', sufixo: '' },
    'pct_jovem': { nome: 'Peso Relativo da Juventude', tipo: 'percentual', sufixo: '%' },

    // Cluster 2
    'ibc_anatel': { nome: 'Índice de Conectividade (IBC)', tipo: 'indice', sufixo: '' },
    'cob_fibra': { nome: 'Cobertura de Fibra Óptica', tipo: 'percentual', sufixo: '%' },
    'pct_estab_alta_tec': { nome: '% Estab. de Alta Tecnologia', tipo: 'percentual', sufixo: '%' },
    'pct_estab_infocom': { nome: '% Estab. em INFOCOM', tipo: 'percentual', sufixo: '%' },
    'pct_estab_ind_criativas': { nome: '% Estab. em Ind. Criativas', tipo: 'percentual', sufixo: '%' },
    'exp_alta_tec': { nome: 'Exportações de Alta Tecnologia', tipo: 'moeda_usd', sufixo: 'US$' },
    'imp_alta_tec': { nome: 'Importações de Alta Tecnologia', tipo: 'moeda_usd', sufixo: 'US$' },
    'sal_avg_alta_tec': { nome: 'Média Salarial (Alta Tech)', tipo: 'moeda_brl', sufixo: 'R$' },
    'sal_avg_infocom': { nome: 'Média Salarial (INFOCOM)', tipo: 'moeda_brl', sufixo: 'R$' },
    'pct_emp_me_do_alta_tec': { nome: '% Mestres e Doutores na Alta Tech', tipo: 'percentual', sufixo: '%' },

    // Cluster 3
    'pibpc': { nome: 'PIB per Capita', tipo: 'moeda_brl', sufixo: 'R$' },
    'vab_agro': { nome: 'VAB Agropecuária', tipo: 'moeda_brl_k', sufixo: 'R$' },
    'vab_ind': { nome: 'VAB Indústria', tipo: 'moeda_brl_k', sufixo: 'R$' },
    'vab_serv': { nome: 'VAB Serviços', tipo: 'moeda_brl_k', sufixo: 'R$' },
    'vab_adm': { nome: 'VAB Administração Pública', tipo: 'moeda_brl_k', sufixo: 'R$' },
    'estab_agro': { nome: 'Estabelecimentos Agro', tipo: 'absoluto', sufixo: '' },
    'estab_ind': { nome: 'Estabelecimentos Industriais', tipo: 'absoluto', sufixo: '' },
    'estab_serv': { nome: 'Estabelecimentos Serviços', tipo: 'absoluto', sufixo: '' },
    'emp_agro': { nome: 'Empregos em Agro', tipo: 'absoluto', sufixo: '' },
    'emp_ind': { nome: 'Empregos na Indústria', tipo: 'absoluto', sufixo: '' },
    'emp_serv': { nome: 'Empregos em Serviços', tipo: 'absoluto', sufixo: '' },
    'sal_avg_agro': { nome: 'Média Salarial (Agro)', tipo: 'moeda_brl', sufixo: 'R$' },
    'sal_avg_ind': { nome: 'Média Salarial (Indústria)', tipo: 'moeda_brl', sufixo: 'R$' },
    'sal_avg_serv': { nome: 'Média Salarial (Serviços)', tipo: 'moeda_brl', sufixo: 'R$' },
    'cob_area_agric': { nome: 'Cobertura Sinal Área Agrícola', tipo: 'percentual', sufixo: '%' },
    'cob_pop_4g5g': { nome: 'Cobertura 4G/5G', tipo: 'percentual', sufixo: '%' },

    // Cluster 4
    'ivcad': { nome: 'Índice de Vulnerabilidade Social (IVCAD)', tipo: 'indice', sufixo: '' },
    'ivcad_nc': { nome: 'Necessidade de Cuidados (NC)', tipo: 'indice', sufixo: '' },
    'ivcad_dpi': { nome: 'Desenv. Primeira Infância (DPI)', tipo: 'indice', sufixo: '' },
    'ivcad_dca': { nome: 'Desenv. Crianças/Adolescentes (DCA)', tipo: 'indice', sufixo: '' },
    'ivcad_tqa': { nome: 'Trabalho e Qualificação (TQA)', tipo: 'indice', sufixo: '' },
    'ivcad_dr': { nome: 'Disponibilidade de Recursos (DR)', tipo: 'indice', sufixo: '' },
    'ivcad_ch': { nome: 'Condições Habitacionais (CH)', tipo: 'indice', sufixo: '' },
    'cad_pessoas': { nome: 'Pessoas no CadÚnico', tipo: 'absoluto', sufixo: 'pessoas' },
    'tx_cad_pessoas': { nome: '% Pessoas no CadÚnico', tipo: 'percentual', sufixo: '%' },
    'pct_agua_rede': { nome: '% Água de Rede', tipo: 'percentual', sufixo: '%' },
    'pct_esgoto_rede': { nome: '% Esgoto de Rede', tipo: 'percentual', sufixo: '%' },
    'ideb_5ano': { nome: 'IDEB (Anos Iniciais)', tipo: 'indice', sufixo: '' },
    'ideb_9ano': { nome: 'IDEB (Anos Finais)', tipo: 'indice', sufixo: '' },
    'atliq_creche': { nome: 'Atendimento em Creche (Líquido)', tipo: 'percentual', sufixo: '%' },
    'pre_natal': { nome: 'Cobertura Pré-Natal', tipo: 'percentual', sufixo: '%' },
    'razao_mm': { nome: 'Mortalidade Materna', tipo: 'indice', sufixo: '' },
    'mvi': { nome: 'Mortes Violentas Intencionais (MVI)', type: 'absoluto', sufixo: 'casos' },
    'cvp': { nome: 'Crimes Contra Patrimônio (CVP)', tipo: 'absoluto', sufixo: 'casos' },
    'vcm_ameaca': { nome: 'VCM - Ameaças', tipo: 'absoluto', sufixo: 'casos' },
    'vcm_lesao': { nome: 'VCM - Lesões', tipo: 'absoluto', sufixo: 'casos' },
    'vcm_vs': { nome: 'VCM - Sexual', tipo: 'absoluto', sufixo: 'casos' },
    'rfv': { nome: 'Roubos e Furtos de Veículos (RFV)', tipo: 'absoluto', sufixo: 'casos' },
    'feminicidio': { nome: 'Feminicídio', tipo: 'absoluto', sufixo: 'casos' },
    
    // Cluster 5 (Capacidade e Gestão Fiscal)
    'fisc_rcl': { nome: 'Receita Corrente Líquida (RCL)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_rec_total': { nome: 'Receitas Realizadas Totais', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_rec_impostos': { nome: 'Receitas de Impostos (Arrecadação Própria)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_transf_uniao_corr': { nome: 'Transferências da União (Correntes)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_transf_uniao_cap': { nome: 'Transferências da União (Capital)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_investimentos': { nome: 'Despesas com Investimentos (Liq.)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_desp_correntes': { nome: 'Despesas Correntes (Liq.)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_desp_pessoal': { nome: 'Despesas com Pessoal (Liq.)', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_dtp_rcl': { nome: 'Pessoal', tipo: 'percentual', sufixo: '%' },
    'fisc_resultado_orcamentario': { nome: 'Resultado Orçamentário', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_resultado_primario': { nome: 'Resultado Primário', tipo: 'moeda_brl', sufixo: 'R$' },
    'fisc_divida_liq': { nome: 'Dívida Consolidada Líquida', tipo: 'moeda_brl', sufixo: 'R$' },
    'capag': { nome: 'Classificação CAPAG (STN)', tipo: 'texto', sufixo: '' },
    'pib_pct': { nome: 'Participação no PIB Estadual', tipo: 'percentual', sufixo: '%' },
    'pib_1000': { nome: 'PIB Total (R$ 1.000)', tipo: 'moeda_brl_k', sufixo: 'R$' }
};

const GRUPOS_CLUSTER_SELECT = {
    0: ['indice_acessibilidade_from', 'indice_acessibilidade_to', 'cgt', 'ia', 'indice_centralidade_interm_tempo', 'indice_centralidade_interm_dist'],
    1: ['pop_2026', 'perc_pop_urb', 'perc_pop_rur', 'rd_pop', 'rd_jovem', 'rd_idosa', 'ind_envelhecimento', 'pct_longevidade', 'pct_pia', 'ind_ir_pia', 'ind_renov_trabalho', 'pct_jovem'],
    2: ['ibc_anatel', 'cob_fibra', 'pct_estab_alta_tec', 'pct_estab_infocom', 'pct_estab_ind_criativas', 'exp_alta_tec', 'imp_alta_tec', 'sal_avg_alta_tec', 'sal_avg_infocom', 'pct_emp_me_do_alta_tec'],
    3: ['pibpc', 'vab_agro', 'vab_ind', 'vab_serv', 'vab_adm', 'estab_agro', 'estab_ind', 'estab_serv', 'emp_agro', 'emp_ind', 'emp_serv', 'sal_avg_agro', 'sal_avg_ind', 'sal_avg_serv', 'cob_area_agric', 'cob_pop_4g5g'],
    4: ['ivcad', 'ivcad_nc', 'ivcad_dpi', 'ivcad_dca', 'ivcad_tqa', 'ivcad_dr', 'ivcad_ch', 'cad_pessoas', 'tx_cad_pessoas', 'pct_agua_rede', 'pct_esgoto_rede', 'ideb_5ano', 'ideb_9ano', 'atliq_creche', 'pre_natal', 'razao_mm', 'mvi', 'cvp', 'vcm_ameaca', 'vcm_lesao', 'vcm_vs', 'rfv', 'feminicidio'],
    5: [
        'fisc_rcl',
        'fisc_rec_total',
        'fisc_rec_impostos',
        'fisc_transf_uniao_corr',
        'fisc_transf_uniao_cap',
        'fisc_investimentos',
        'fisc_desp_correntes',
        'fisc_desp_pessoal',
        'fisc_dtp_rcl',
        'fisc_resultado_orcamentario',
        'fisc_resultado_primario',
        'fisc_divida_liq',
        'capag'
    ]
};

// HELPER MATEMÁTICO: Percentis para Histórico
function getPercentile(arr, p) {
    if (arr.length === 0) return 0;
    if (arr.length === 1) return arr[0];
    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;
    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function getQuartiles(arr) {
    arr.sort((a, b) => a - b);
    return {
        min: arr[0],
        q1: getPercentile(arr, 0.25),
        median: getPercentile(arr, 0.5),
        q3: getPercentile(arr, 0.75),
        max: arr[arr.length - 1]
    };
}

// HELPER FISCAL: Extração padronizada de indicadores a partir de fiscais_rd
function obterAnoFiscalReferencia(fiscais) {
    if (!fiscais || !fiscais.length) return 2024;
    const anos = fiscais.map(f => parseFloat(f.exercicio)).filter(a => !isNaN(a) && a >= 2019 && a <= 2025);
    if (!anos.length) return 2024;
    const contagemPorAno = {};
    anos.forEach(a => { contagemPorAno[a] = (contagemPorAno[a] || 0) + 1; });
    const anosValidos = Object.keys(contagemPorAno).map(Number).filter(a => contagemPorAno[a] >= 5).sort((a,b) => b-a);
    return anosValidos.length ? anosValidos[0] : 2024;
}

function extrairValorFiscal(normMun, sigla, anoAlvo, fiscais, codIbge) {
    if (!fiscais || !fiscais.length) return null;
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    
    const itensMun = fiscais.filter(f => {
        if (codIbge && f.ibge6 && String(f.ibge6).slice(0, 6) === String(codIbge).slice(0, 6)) return true;
        const m = normText(f.municipio || f.ente || '');
        return m === normMun;
    });
    if (!itensMun.length) return null;

    let itensAno = itensMun;
    if (anoAlvo) {
        itensAno = itensMun.filter(f => parseFloat(f.exercicio) === parseFloat(anoAlvo));
    }
    if (!itensAno.length) {
        const anosMun = itensMun.map(f => parseFloat(f.exercicio)).filter(a => !isNaN(a) && a >= 2019 && a <= 2025);
        if (anosMun.length) {
            const maxAno = Math.max(...anosMun);
            itensAno = itensMun.filter(f => parseFloat(f.exercicio) === maxAno);
        }
    }
    if (!itensAno.length) return null;

    const matchNome = (itemInd, sig) => {
        const ind = normText(itemInd);
        if (sig === 'fisc_rcl') return ind === 'RECEITA CORRENTE LIQUIDA' || ind.includes('RCL');
        if (sig === 'fisc_rec_total') return ind === 'RECEITAS REALIZADAS';
        if (sig === 'fisc_rec_impostos') return ind.includes('RECEITAS DE IMPOSTOS') || ind === 'IMPOSTOS';
        if (sig === 'fisc_transf_uniao_corr') return ind.includes('TRANSF. UNIAO (CORRENTE)') || (ind.includes('UNIAO') && ind.includes('CORRENTE'));
        if (sig === 'fisc_transf_uniao_cap') return ind.includes('TRANSF. UNIAO (CAPITAL)') || (ind.includes('UNIAO') && ind.includes('CAPITAL'));
        if (sig === 'fisc_investimentos') return ind.includes('INVESTIMENTOS - LIQ') || ind === 'INVESTIMENTOS';
        if (sig === 'fisc_desp_correntes') return ind.includes('DESPESAS CORRENTES - LIQ') || ind === 'DESPESAS CORRENTES';
        if (sig === 'fisc_desp_pessoal') return (ind.includes('DESPESAS DE PESSOAL') || ind === 'DESPESAS DE PESSOAL - LIQ') && !ind.includes('RCL');
        if (sig === 'fisc_dtp_rcl') return ind.includes('DTP/RCL') || (ind.includes('PESSOAL') && ind.includes('RCL'));
        if (sig === 'fisc_resultado_orcamentario') return ind === 'RESULTADO ORCAMENTARIO';
        if (sig === 'fisc_resultado_primario') return ind === 'RESULTADO PRIMARIO';
        if (sig === 'fisc_divida_liq') return ind.includes('DIVIDA CONSOLIDADA LIQUIDA');
        return false;
    };

    const candidatos = itensAno.filter(i => matchNome(i.indicador, sigla));
    if (!candidatos.length) return null;

    candidatos.sort((a, b) => (parseFloat(b.mes_referencia) || parseFloat(b.periodo) || 0) - (parseFloat(a.mes_referencia) || parseFloat(a.periodo) || 0));
    
    let vRaw = candidatos[0].valor;
    if (vRaw === undefined || vRaw === null || vRaw === '' || vRaw === '-') return null;
    let vNum = parseFloat(String(vRaw).replace(',', '.'));
    return isNaN(vNum) ? null : vNum;
}

function formatarValorAmigavel(valorRaw, sigla) {
    if (valorRaw === undefined || valorRaw === null || valorRaw === '-' || valorRaw === '') return '-';
    
    const info = DICIONARIO_INDICADORES[sigla] || { tipo: 'absoluto', sufixo: '' };
    
    if (sigla === 'capag') {
        const mapCapagText = { 4: 'A', 3: 'B', 2: 'C', 1: 'D' };
        return mapCapagText[valorRaw] || String(valorRaw).trim().toUpperCase();
    }
    if (info.tipo === 'texto') return String(valorRaw).trim().toUpperCase();

    let val = parseFloat(String(valorRaw).replace(',', '.'));
    if (isNaN(val)) return valorRaw;

    if (info.tipo === 'percentual') {
        let pct = (val <= 1 && val > 0) ? val * 100 : val;
        return pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
    } else if (info.tipo === 'moeda_brl') {
        const absVal = Math.abs(val);
        if (absVal >= 1e9) return 'R$ ' + (val / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bi';
        if (absVal >= 1e6) return 'R$ ' + (val / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mi';
        return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (info.tipo === 'moeda_brl_k') {
        let vReal = val * 1000;
        if (vReal >= 1e9) return 'R$ ' + (vReal / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bi';
        if (vReal >= 1e6) return 'R$ ' + (vReal / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mi';
        return 'R$ ' + vReal.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    } else if (info.tipo === 'moeda_usd') {
        return 'US$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } else if (info.tipo === 'indice') {
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    } else if (info.tipo === 'absoluto') {
        return val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    }
    return val.toLocaleString('pt-BR');
}

function obterNomeAmigavel(sigla) {
    return DICIONARIO_INDICADORES[sigla]?.nome || String(sigla).toUpperCase();
}

const LISTA_RDS_PADRAO = [
    "Agreste Central", "Agreste Meridional", "Agreste Setentrional",
    "Araripe", "Itaparica", "Mata Norte", "Mata Sul",
    "Metropolitana", "Pajeú", "Sertão Central", "Sertão do Moxotó",
    "Sertão do São Francisco"
];

window.iniciarModuloRegioes = async function () {
    try {
        if (typeof window.mostrarCarregamento === 'function') window.mostrarCarregamento("CARREGANDO REGIONAL...");

        // Execução paralela: consulta filtros e dados de Agreste Central simultaneamente
        const pFiltros = (async () => {
            try {
                let res = await window.fetchSeguro(`${window.basePath || ''}/api/regioes/filtros`.replace(/\/+/g, '/'));
                if (!res || !res.ok) res = await window.fetchSeguro(`api/regioes/filtros`);
                if (res && res.ok) return await res.json();
            } catch (errReq) {
                console.warn("[Regiões] Falha ao consultar endpoint de filtros, aplicando RDs padrão:", errReq);
            }
            return null;
        })();

        const pDados = (async () => {
            try {
                let res = await window.fetchSeguro(`${window.basePath || ''}/api/regioes/data`.replace(/\/+/g, '/'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rd: "Agreste Central" })
                });
                if (!res || !res.ok) {
                    res = await window.fetchSeguro(`api/regioes/data`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rd: "Agreste Central" })
                    });
                }
                if (res && res.ok) return await res.json();
            } catch (errReq) {
                console.error("[Regiões] Falha ao pré-carregar dados iniciais:", errReq);
            }
            return null;
        })();

        const [jsonFiltros, jsonDados] = await Promise.all([pFiltros, pDados]);

        window.tipoAgrupamentoRegioes = 'rd';
        window.listaRDsCache = (jsonFiltros && jsonFiltros.regioes && jsonFiltros.regioes.length > 0) ? jsonFiltros.regioes : LISTA_RDS_PADRAO;
        window.listaConsorciosCache = (jsonFiltros && jsonFiltros.consorcios && jsonFiltros.consorcios.length > 0) ? jsonFiltros.consorcios : [
            "CODEAM – Consórcio Público para o Desenvolvimento do Agreste Meridional",
            "CONIAPE – Consórcio Público Intermunicipal do Agreste Pernambucano e Fronteiras",
            "CIMPAJEÚ – Consórcio de Integração dos Municípios do Pajeú",
            "COMAGSUL – Consórcio dos Municípios do Agreste e da Mata Sul",
            "COMANAS – Consórcio dos Municípios da Mata Norte e Agreste Setentrional",
            "COMSUL – Consórcio Público dos Municípios da Mata Sul Pernambucana",
            "CISAPE – Consórcio Intermunicipal do Sertão Araripe Pernambucano",
            "COMUPE – Consórcio dos Municípios Pernambucanos",
            "CONDOMAR – Consórcio Intermunicipal Dom Mariano",
            "CONSEG/PE – Consórcio Intermunicipal de Segurança Pública e Defesa Social de PE",
            "CINDESC – Consórcio Intermunicipal do Sertão",
            "COMRIO – Consórcio Intermunicipal do Submédio São Francisco",
            "PORTAL SUL – Consórcio Intermunicipal Porta da Mata Sul"
        ];

        const $select = $('#regioes_f_rd');
        if ($select.length) {
            $select.empty().html(window.listaRDsCache.map(r => `<option value="${r}">${r}</option>`).join(''));
            $select.off('change').on('change', function () { window.carregarDadosRegioes(); });
            let rdInicial = "Agreste Central";
            if (window.rdAlvoBusca) {
                const alvoNorm = String(window.rdAlvoBusca).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const encontrado = window.listaRDsCache.find(r => String(r).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(alvoNorm));
                if (encontrado) rdInicial = encontrado;
                window.rdAlvoBusca = null;
            }
            $select.val(rdInicial);
        }

        if (jsonDados && !jsonDados.error) {
            dadosBrutosRD = jsonDados;
            populaSelectsClusters();
            renderizarModuloRegional(jsonDados);
        } else {
            await window.carregarDadosRegioes();
        }
    } catch (e) {
        console.error("[Regiões] Erro na inicialização:", e);
    } finally {
        if (typeof window.ocultarCarregamento === 'function') window.ocultarCarregamento();
    }
};

window.trocarTipoAgrupamentoRegioes = function (tipo) {
    window.tipoAgrupamentoRegioes = tipo || 'rd';
    const btnRD = document.getElementById('regioes_btn_tipo_rd');
    const btnConsorcio = document.getElementById('regioes_btn_tipo_consorcio');
    const icone = document.getElementById('regioes_filtro_icone');
    const $select = $('#regioes_f_rd');

    if (window.tipoAgrupamentoRegioes === 'consorcio') {
        if (btnConsorcio) {
            btnConsorcio.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
            btnConsorcio.classList.add('btn-primary', 'text-white', 'shadow-xs');
        }
        if (btnRD) {
            btnRD.classList.remove('btn-primary', 'text-white', 'shadow-xs');
            btnRD.classList.add('text-slate-600', 'bg-transparent', 'border-0');
        }
        if (icone) {
            icone.className = 'fas fa-handshake text-primary';
        }
        if ($select.length) {
            const lista = window.listaConsorciosCache && window.listaConsorciosCache.length > 0 ? window.listaConsorciosCache : [];
            $select.empty().html(lista.map(c => `<option value="${c}">${c}</option>`).join(''));
            if (lista.length > 0) $select.val(lista[0]);
        }
    } else {
        if (btnRD) {
            btnRD.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
            btnRD.classList.add('btn-primary', 'text-white', 'shadow-xs');
        }
        if (btnConsorcio) {
            btnConsorcio.classList.remove('btn-primary', 'text-white', 'shadow-xs');
            btnConsorcio.classList.add('text-slate-600', 'bg-transparent', 'border-0');
        }
        if (icone) {
            icone.className = 'fas fa-location-dot text-primary';
        }
        if ($select.length) {
            const lista = window.listaRDsCache && window.listaRDsCache.length > 0 ? window.listaRDsCache : LISTA_RDS_PADRAO;
            $select.empty().html(lista.map(r => `<option value="${r}">${r}</option>`).join(''));
            let rdInicial = "Agreste Central";
            if (window.rdAlvoBusca) {
                const alvoNorm = String(window.rdAlvoBusca).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const encontrado = window.listaRDsCache.find(r => String(r).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(alvoNorm));
                if (encontrado) rdInicial = encontrado;
                window.rdAlvoBusca = null;
            }
            $select.val(rdInicial);
        }
    }
    window.carregarDadosRegioes();
};

window.carregarDadosRegioes = async function () {
    const agrupamento = $('#regioes_f_rd').val() || "Agreste Central";
    const tipo = window.tipoAgrupamentoRegioes || "rd";
    if (!agrupamento) return;

    if (typeof window.mostrarCarregamento === 'function') window.mostrarCarregamento("CARREGANDO REGIONAL...");

    try {
        let res = await window.fetchSeguro(`${window.basePath || ''}/api/regioes/data`.replace(/\/+/g, '/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rd: agrupamento, tipo: tipo, consorcio: agrupamento })
        });

        if (!res || !res.ok) {
            // Tenta caminho relativo se o basePath falhou
            res = await window.fetchSeguro(`api/regioes/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rd: agrupamento, tipo: tipo, consorcio: agrupamento })
            });
        }

        const json = await res.json();
        if (json.error) throw new Error(json.details || json.error);

        dadosBrutosRD = json;
        populaSelectsClusters();
        renderizarModuloRegional(json);

    } catch (e) {
        console.error("[Regiões] Erro ao carregar dados da RD:", e);
    } finally {
        if (typeof window.ocultarCarregamento === 'function') window.ocultarCarregamento();
        setTimeout(function() {
            if (typeof mapasRD === 'object' && mapasRD) Object.values(mapasRD).forEach(m => m && typeof m.resize === 'function' && m.resize());
            if (typeof chartsRD === 'object' && chartsRD) Object.values(chartsRD).forEach(c => c && typeof c.resize === 'function' && c.resize());
            if (typeof histChartsRD === 'object' && histChartsRD) Object.values(histChartsRD).forEach(h => h && typeof h.resize === 'function' && h.resize());
        }, 100);
    }
};

function populaSelectsClusters() {
    [0, 1, 2, 3, 4, 5].forEach(cNum => {
        const $sel = $(`#rd_select_cluster${cNum}`);
        if ($sel.length) {
            $sel.empty();
            let lista = GRUPOS_CLUSTER_SELECT[cNum] || [];
            if (cNum === 0) {
                lista = modoRotasCluster0 ? INDICADORES_CLUSTER0_FLUXOS : INDICADORES_CLUSTER0_PADRAO;
            }
            lista.forEach(sig => {
                const label = obterNomeAmigavel(sig);
                $sel.append(`<option value="${sig}" ${sig === varAtivaCluster[cNum] ? 'selected' : ''}>${label}</option>`);
            });
        }
    });
}

window.toggleModoRotasCluster0 = function () {
    modoRotasCluster0 = !modoRotasCluster0;
    const $btn = $('#rd_btn_toggle_rotas0');
    const $label = $('#rd_btn_rotas_label');

    if (modoRotasCluster0) {
        $btn.removeClass('btn-outline-primary').addClass('btn-primary text-white shadow-sm')
            .css({ 'background': '#7c3aed', 'color': '#ffffff', 'border': '1.5px solid #7c3aed' });
        $label.text('Rotas Ativas (Fluxos)');
        varAtivaCluster[0] = 'peso_geral';
    } else {
        $btn.removeClass('btn-primary text-white shadow-sm').addClass('btn-outline-primary')
            .css({ 'background': 'transparent', 'color': '#7c3aed', 'border': '1.5px solid #7c3aed' });
        $label.text('Ver Rotas / Fluxos');
        varAtivaCluster[0] = 'indice_acessibilidade_from';
    }

    populaSelectsClusters();
    mostrarSpinnerRD('rd_spinner_map_cluster0');
    mostrarSpinnerRD('rd_spinner_chart_cluster0');
    renderizarClusterEspecifico(0);
};

function renderizarClusterEspecifico(cNum) {
    if (!dadosBrutosRD) return;
    const data = dadosBrutosRD;
    const nomeRD = data.rd || "Região de Desenvolvimento";
    const muns = data.demografia_rd || [];
    const ind = data.indicadores_rd || [];
    const sig = varAtivaCluster[cNum];
    $(`#rd_map_cluster${cNum}_var_label`).text(obterNomeAmigavel(sig));

    // A Dimensão 0 utiliza sempre o GeoJSON de todo o Estado de Pernambuco
    const geoJsonTarget = cNum === 0 ? (data.geojson_pe || data.geojson_rd) : data.geojson_rd;

    if (cNum === 0 && modoRotasCluster0) {
        renderizarMapaRotasCluster0(
            `rd_map_cluster0`,
            `rd_legenda_cluster0`,
            sig,
            geoJsonTarget,
            data.fluxos_pe || [],
            mapasRD[0],
            (m) => mapasRD[0] = m,
            nomeRD
        );
        renderizarChartCluster0RD(sig, data.regic_rd, nomeRD);
    } else {
        renderizarMapaClusterRD(
            cNum,
            `rd_map_cluster${cNum}`,
            `rd_legenda_cluster${cNum}`,
            sig,
            geoJsonTarget,
            ind,
            muns,
            mapasRD[cNum],
            (m) => mapasRD[cNum] = m,
            GRUPOS_CLUSTER_SELECT[cNum]
        );

        if (cNum === 0) {
            renderizarChartCluster0RD(sig, data.regic_rd, nomeRD);
        } else {
            renderizarChartClusterRD(cNum, sig, ind, muns);
            renderizarChartEvolucaoRD(cNum, sig, ind);
        }
    }
    clusterRenderizado[cNum] = true;
}

window.atualizarVariavelCluster = function (clusterNum, novaSigla) {
    varAtivaCluster[clusterNum] = novaSigla;
    mostrarSpinnerRD(`rd_spinner_map_cluster${clusterNum}`);
    mostrarSpinnerRD(`rd_spinner_chart_cluster${clusterNum}`);
    if (clusterNum > 0) {
        mostrarSpinnerRD(`rd_spinner_hist_cluster${clusterNum}`);
    }
    if (dadosBrutosRD) {
        renderizarClusterEspecifico(clusterNum);
    }
};

function gerarSinteseCluster(numCluster, muns, ind, nomeRD) {
    if (numCluster === 0) {
        return `Dimensão panorâmica (Visão Estadual - Pernambuco) dedicada às dinâmicas de integração territorial: Acessibilidade de busca e escoamento, índices de atração e centralidade das redes urbanas. Contextualiza o papel estratégico da RD <b>${nomeRD}</b> no sistema de cidades do Estado.`;
    }
    
    // Motor inteligente: Calcula a mediana da região para um indicador específico
    const getMed = (sigla) => {
        let vals = [];
        muns.forEach(m => {
            const normName = String(m.municipio || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
            const items = (ind || []).filter(i => String(i.nm_municipio).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim().includes(normName) && String(i.sigla_indicador).toLowerCase() === sigla.toLowerCase()).sort((a, b) => b.ano - a.ano);
            if(items.length){
                let v = parseFloat(String(items[0].indicador).replace(',', '.'));
                if(!isNaN(v)) vals.push(v);
            }
        });
        if(!vals.length) return null;
        vals.sort((a,b)=>a-b);
        let mid = Math.floor(vals.length / 2);
        return vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
    };

    if (numCluster === 1) {
        // Demográfico e de Capital Humano
        let rdPop = getMed('rd_pop') || 0;
        let indEnv = getMed('ind_envelhecimento') || 0;
        let ideb9 = getMed('ideb_9ano') || 0;
        let tdi9 = getMed('tdi_9ano') || 0;
        
        let txtBonus = (rdPop > 50 || indEnv > 60) 
            ? `Valores elevados na região (Razão de Dependência mediana de <b>${rdPop.toFixed(1)}</b> e Índice de Envelhecimento de <b>${indEnv.toFixed(1)}</b>) indicam esgotamento do bônus demográfico, exigindo readequação na oferta de leitos, atenção primária (icsap) e controle de DCNT.` 
            : `Com Razão de Dependência mediana em <b>${rdPop.toFixed(1)}</b> e Índice de Envelhecimento em <b>${indEnv.toFixed(1)}</b>, a região usufrui do bônus demográfico, oportunidade que demanda políticas focadas na absorção dessa força de trabalho.`;
        
        let txtEdu = `Na educação, a mediana regional do IDEB (Anos Finais) é <b>${ideb9.toFixed(1)}</b> com distorção idade-série de <b>${tdi9.toFixed(1)}%</b>. ${(tdi9 > 20 || ideb9 < 4.5) ? 'Taxas altas de distorção e baixo IDEB sinalizam represamento no fluxo escolar, comprometendo a qualificação e a produtividade futura da População em Idade Ativa.' : 'Indicadores evidenciam um fluxo escolar estruturado, impulsionando a qualificação e produtividade futura do capital humano local.'}`;

        return `A dimensão avalia a transição demográfica e a qualidade da formação do capital humano na RD <b>${nomeRD}</b>. ${txtBonus} ${txtEdu}`;
        
    } else if (numCluster === 2) {
        // Infraestrutura, C&T e Conectividade
        let cobFibra = getMed('cob_fibra') || 0;
        if(cobFibra <= 1 && cobFibra > 0) cobFibra *= 100;
        let estabTec = getMed('pct_estab_alta_tec') || 0;
        if(estabTec <= 1 && estabTec > 0) estabTec *= 100;

        let txtConect = (cobFibra < 50) 
            ? `Baixos valores de acesso à fibra óptica (mediana de <b>${cobFibra.toFixed(1)}%</b>) revelam gargalos de isolamento digital, travando a atração de empresas, a inovação e o suporte tecnológico à produção no campo.` 
            : `A região apresenta boa infraestrutura de fibra óptica (mediana de <b>${cobFibra.toFixed(1)}%</b>), essencial para integrar o território às redes globais de informação e cadeias logísticas.`;
            
        let txtCti = `A especialização do ecossistema mede uma proporção mediana de <b>${estabTec.toFixed(2)}%</b> de estabelecimentos de alta tecnologia. O indicador direciona investimentos em conectividade para expandir redes.`;

        return `A dimensão avalia o adensamento digital, a infraestrutura de telecomunicações e a integração territorial da RD <b>${nomeRD}</b>. ${txtConect} ${txtCti}`;
        
    } else if (numCluster === 3) {
        // Econômico Regional e Vocações
        let pibpc = getMed('pibpc') || 0;
        let vAgro = getMed('vab_agro') || 0;
        let vInd = getMed('vab_ind') || 0;
        let vServ = getMed('vab_serv') || 0;
        let vAdm = getMed('vab_adm') || 0;
        let totalVab = vAgro + vInd + vServ + vAdm;
        let pctAdm = totalVab > 0 ? (vAdm / totalVab) * 100 : 0;

        let txtEcon = `A dimensão mapeia a dinâmica produtiva, a densidade tecnológica e a inserção externa da RD <b>${nomeRD}</b>. Analisa-se o PIB per capita, cuja mediana atual é de <b>R$ ${pibpc.toLocaleString('pt-BR', {maximumFractionDigits:0})}</b>.`;
        
        let txtVab = (pctAdm > 40) 
            ? `A alta participação do VAB da Administração Pública (mediana de <b>${pctAdm.toFixed(1)}%</b> da economia) expõe dependência fiscal e fragilidade da iniciativa privada local.` 
            : `A participação da Administração Pública (<b>${pctAdm.toFixed(1)}%</b>) atesta maior diversificação e pujança da iniciativa privada (Agro, Indústria e Serviços) na composição econômica da região.`;

        return `${txtEcon} ${txtVab}`;
        
    } else if (numCluster === 4) {
        // Vulnerabilidade, Saneamento e Segurança
        let ivcad = getMed('ivcad') || 0;
        let txCad = getMed('tx_cad_pessoas') || 0;
        if(txCad <= 1 && txCad > 0) txCad *= 100;
        let agua = getMed('pct_agua_rede') || 0;
        if(agua <= 1 && agua > 0) agua *= 100;
        let mvi = getMed('mvi') || 0;

        let txtVul = `A dimensão mensura a extensão da pobreza, os déficits de infraestrutura sanitária e a violência urbana. O Índice de Vulnerabilidade (IVCAD) mediano de <b>${ivcad.toFixed(3)}</b> e a proporção de <b>${txCad.toFixed(1)}%</b> da população no CadÚnico mapeiam a carência socioeconômica.`;
        
        let txtSan = (agua < 70) 
            ? `No saneamento, os baixos percentuais de cobertura de água (mediana de <b>${agua.toFixed(1)}%</b>) agravam as condições habitacionais e elevam internações por causas evitáveis.` 
            : `O saneamento apresenta uma cobertura mediana de água de <b>${agua.toFixed(1)}%</b>, auxiliando no controle de causas evitáveis de adoecimento.`;
            
        let txtSeg = `Na segurança pública, valores medianos de <b>${mvi.toFixed(0)}</b> Mortes Violentas Intencionais (MVI) deterioram o bem-estar social e afugentam investimentos locais. O diagnóstico orienta a alocação de recursos em áreas críticas de proteção social.`;

        return `${txtVul} ${txtSan} ${txtSeg}`;

    } else if (numCluster === 5) {
        // Dimensão 5: Capacidade e Gestão Fiscal
        const fiscais = dadosBrutosRD?.fiscais_rd || [];
        const anoRef = obterAnoFiscalReferencia(fiscais);
        const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        
        let totalRCL = 0, totalInvest = 0, totalRec = 0, totalTransf = 0, totalImpostos = 0;
        let totalResOrc = 0, totalResPrim = 0;
        let contagemCapag = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
        let listaInvestMuns = [];

        muns.forEach(m => {
            const normName = normText(m.municipio || '');
            let rcl = extrairValorFiscal(normName, 'fisc_rcl', anoRef, fiscais) || 0;
            let inv = extrairValorFiscal(normName, 'fisc_investimentos', anoRef, fiscais) || 0;
            let rec = extrairValorFiscal(normName, 'fisc_rec_total', anoRef, fiscais) || 0;
            let tu = extrairValorFiscal(normName, 'fisc_transf_uniao_corr', anoRef, fiscais) || 0;
            let imp = extrairValorFiscal(normName, 'fisc_rec_impostos', anoRef, fiscais) || 0;
            let resO = extrairValorFiscal(normName, 'fisc_resultado_orcamentario', anoRef, fiscais) || 0;
            let resP = extrairValorFiscal(normName, 'fisc_resultado_primario', anoRef, fiscais) || 0;

            totalRCL += rcl;
            totalInvest += inv;
            totalRec += rec;
            totalTransf += tu;
            totalImpostos += imp;
            totalResOrc += resO;
            totalResPrim += resP;

            if (inv > 0) listaInvestMuns.push({ nome: m.municipio, inv: inv, taxa: rcl > 0 ? (inv / rcl) * 100 : 0 });

            let cLetter = String(m.capag || m.CAPAG || '').trim().toUpperCase();
            if (!cLetter || cLetter === 'N.D.' || cLetter === 'UNDEFINED' || cLetter === '-') {
                const itemC = (ind || []).find(i => {
                    const matchMun = (m.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(m.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                    return matchMun && (String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag');
                });
                if (itemC && itemC.indicador) cLetter = String(itemC.indicador).trim().toUpperCase();
            }
            if (contagemCapag[cLetter] !== undefined) contagemCapag[cLetter]++;
        });

        listaInvestMuns.sort((a, b) => b.inv - a.inv);
        const topInvestMun = listaInvestMuns.length ? listaInvestMuns[0] : null;

        const fmtValBi = (v) => (Math.abs(v) >= 1e9) ? "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi" : (Math.abs(v) >= 1e6) ? "R$ " + (v / 1e6).toFixed(1).replace('.', ',') + " Mi" : "R$ " + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

        let pctTransf = totalRec > 0 ? (totalTransf / totalRec) * 100 : 0;
        let pctImpostos = totalRec > 0 ? (totalImpostos / totalRec) * 100 : 0;
        let taxaInvestRegional = totalRCL > 0 ? (totalInvest / totalRCL) * 100 : 0;

        let txtReceitas = `A análise das receitas consolidadas registra uma Receita Corrente Líquida (RCL) regional de <b>${fmtValBi(totalRCL)}</b> e Receitas Realizadas de <b>${fmtValBi(totalRec)}</b> (exercício ${anoRef}). As transferências correntes da União representam <b>${pctTransf.toFixed(1)}%</b> das receitas, enquanto a arrecadação própria de tributos responde por <b>${pctImpostos.toFixed(1)}%</b> (${fmtValBi(totalImpostos)}), ${pctTransf > 70 ? 'evidenciando elevada dependência de repasses constitucionais e demanda por fortalecimento da base tributária local' : 'demonstrando razoável autonomia de receitas próprias frente às despesas de custeio'}.`;

        let txtInvest = `Na despesa de capital, a região empenhou/liquidou <b>${fmtValBi(totalInvest)}</b> em investimentos públicos, o que corresponde a <b>${taxaInvestRegional.toFixed(1)}%</b> da RCL regional. ${topInvestMun ? `O município com maior volume de investimentos no exercício foi <b>${topInvestMun.nome}</b> (${fmtValBi(topInvestMun.inv)}).` : ''} ${taxaInvestRegional >= 8 ? 'O índice reflete um ritmo ativo de expansão da infraestrutura urbana e serviços públicos locais.' : 'A proporção moderada de investimentos sobre a receita aponta que os orçamentos municipais estão predominantemente absorvidos por despesas correntes de manutenção e folha de pessoal.'}`;

        let txtResultados = `Quanto aos resultados fiscais e solvência, a RD totalizou um Resultado Orçamentário de <b>${fmtValBi(totalResOrc)}</b> e Resultado Primário de <b>${fmtValBi(totalResPrim)}</b> (${totalResOrc >= 0 ? 'equilíbrio/superávit orçamentário consolidado' : 'déficit orçamentário agregado'}). Na classificação de Capacidade de Pagamento da STN (CAPAG), <b>${contagemCapag.A || 0}</b> município(s) possuem nota A, <b>${contagemCapag.B || 0}</b> possuem nota B e <b>${(contagemCapag.C || 0) + (contagemCapag.D || 0)}</b> apresentam nota C/D, balizando a aptidão da região para captar operações de crédito com garantia da União.`;

        return `A dimensão examina a saúde fiscal, a dependência de transferências e a capacidade de investimento dos municípios da RD <b>${nomeRD}</b>.<br/><br/>${txtReceitas}<br/><br/>${txtInvest}<br/><br/>${txtResultados}`;
    }
    return "";
}

function renderizarModuloRegional(data) {
    const isCons = data.is_consorcio || window.tipoAgrupamentoRegioes === 'consorcio';
    const nomeRD = data.rd || (isCons ? "Consórcio Intermunicipal" : "Região de Desenvolvimento");
    const labelTitulo = isCons ? `Consórcio: ${nomeRD}` : nomeRD;
    $('#regional_titulo_rd').text(labelTitulo);
    if (document.getElementById('capa_nome_rd')) document.getElementById('capa_nome_rd').innerText = labelTitulo;

    // Atualiza cabeçalhos e rodapés dos KPIs
    const $kpiCardMun = $('#rd_kpi_qtd_muns').closest('.kpi-modern-card');
    if ($kpiCardMun.length) {
        $kpiCardMun.find('.kpi-modern-header').text(isCons ? 'MUNICÍPIOS NO CONSÓRCIO' : 'MUNICÍPIOS NA RD');
    }
    const $kpiCardInv = $('#rd_kpi_investimento_total').closest('.kpi-modern-card');
    if ($kpiCardInv.length) {
        $kpiCardInv.find('.kpi-modern-footer').text(isCons ? 'Recursos Alocados no Consórcio' : 'Recursos Alocados na RD');
    }

    const muns = data.demografia_rd || [];
    const ind = data.indicadores_rd || [];
    const inis = data.iniciativas_rd || [];
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    $('#rd_kpi_qtd_muns').text(muns.length);

    let popTotal = 0;
    muns.forEach(m => { popTotal += parseFloat(m.pop_2026) || 0; });
    $('#rd_kpi_pop_total').text(popTotal.toLocaleString('pt-BR'));

    let pibTotal = 0;
    ind.filter(i => String(i.sigla_indicador).toLowerCase() === 'pib_1000').forEach(i => {
        pibTotal += (parseFloat(String(i.indicador).replace(',', '.')) || 0) * 1000;
    });
    
    const formataBi = (v) => (v >= 1e9) ? "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi" : "R$ " + (v / 1e6).toFixed(2).replace('.', ',') + " Mi";
    $('#rd_kpi_pib_total').text(pibTotal > 0 ? formataBi(pibTotal) : "R$ -");

    let invTotal = 0;
    inis.forEach(i => { invTotal += parseFloat(i.valor_total) || 0; });
    $('#rd_kpi_investimento_total').text(invTotal > 0 ? formataBi(invTotal) : "R$ 0");

    // Micro-KPIs Fiscais da RD (Dimensão 5)
    if (data.fiscais_rd && data.fiscais_rd.length) {
        const anoRef = obterAnoFiscalReferencia(data.fiscais_rd);
        let totalRCL = 0, totalInvest = 0, totalRec = 0, totalTransf = 0;
        let contagemCapag = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

        muns.forEach(m => {
            const normName = normText(m.municipio || '');
            let rcl = extrairValorFiscal(normName, 'fisc_rcl', anoRef, data.fiscais_rd) || 0;
            let inv = extrairValorFiscal(normName, 'fisc_investimentos', anoRef, data.fiscais_rd) || 0;
            let rec = extrairValorFiscal(normName, 'fisc_rec_total', anoRef, data.fiscais_rd) || 0;
            let tu = extrairValorFiscal(normName, 'fisc_transf_uniao_corr', anoRef, data.fiscais_rd) || 0;
            
            totalRCL += rcl;
            totalInvest += inv;
            totalRec += rec;
            totalTransf += tu;

            let cLetter = String(m.capag || m.CAPAG || '').trim().toUpperCase();
            if (!cLetter || cLetter === 'N.D.' || cLetter === 'UNDEFINED' || cLetter === '-') {
                const itemC = (ind || []).find(i => {
                    const matchMun = (m.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(m.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                    return matchMun && (String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag');
                });
                if (itemC && itemC.indicador) cLetter = String(itemC.indicador).trim().toUpperCase();
            }
            if (contagemCapag[cLetter] !== undefined) contagemCapag[cLetter]++;
        });

        $('#rd_fisc_kpi_rcl').text(totalRCL > 0 ? formataBi(totalRCL) : "R$ -");
        $('#rd_fisc_kpi_invest').text(totalInvest > 0 ? formataBi(totalInvest) : "R$ -");
        
        let pctDep = totalRec > 0 ? (totalTransf / totalRec) * 100 : 0;
        $('#rd_fisc_kpi_dep').text(pctDep > 0 ? pctDep.toFixed(1).replace('.', ',') + "%" : "-%");

        let modaCapag = 'B';
        let maxCount = -1;
        Object.keys(contagemCapag).forEach(k => {
            if (contagemCapag[k] > maxCount && contagemCapag[k] > 0) {
                maxCount = contagemCapag[k];
                modaCapag = k;
            }
        });
        $('#rd_fisc_kpi_capag').text(`Grau ${modaCapag} (${contagemCapag[modaCapag] || 0} muns)`);
    }

    [0, 1, 2, 3, 4, 5].forEach(cNum => {
        $(`#rd_sintese_cluster${cNum}`).html(gerarSinteseCluster(cNum, muns, ind, nomeRD));
    });

    // Reset dos estados de hidratação dos clusters e ativação de spinners
    clusterRenderizado = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false };
    matrizRenderizada = false;
    mostrarTodosSpinnersRD();

    if (regioesObserver) {
        regioesObserver.disconnect();
        regioesObserver = null;
    }

    const isElementInViewport = (el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        return (rect.top <= vh + 250 && rect.bottom >= -250);
    };

    const scrollContainer = document.querySelector('.aurora-content-area');

    if ('IntersectionObserver' in window) {
        regioesObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    if (id.startsWith('rd_map_cluster')) {
                        const num = parseInt(id.replace('rd_map_cluster', ''), 10);
                        if (!isNaN(num) && !clusterRenderizado[num]) {
                            renderizarClusterEspecifico(num);
                        }
                    } else if (id === 'rd_tabela_matriz_municipios') {
                        if (!matrizRenderizada && dadosBrutosRD) {
                            renderizarMatrizMunicipiosRD(dadosBrutosRD.demografia_rd || [], dadosBrutosRD.indicadores_rd || []);
                            matrizRenderizada = true;
                        }
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: scrollContainer,
            rootMargin: '250px 0px',
            threshold: 0.01
        });

        // Dimensão 0 sempre renderiza de imediato (topo da página)
        renderizarClusterEspecifico(0);

        // Clusters 1 a 5 e Matriz: se já visíveis renderiza agora; senão agenda via observer
        [1, 2, 3, 4, 5].forEach(cNum => {
            const el = document.getElementById(`rd_map_cluster${cNum}`);
            if (isElementInViewport(el)) {
                renderizarClusterEspecifico(cNum);
            } else if (el) {
                regioesObserver.observe(el);
            }
        });

        const tabEl = document.getElementById('rd_tabela_matriz_municipios');
        if (isElementInViewport(tabEl)) {
            renderizarMatrizMunicipiosRD(muns, ind);
            matrizRenderizada = true;
        } else if (tabEl) {
            regioesObserver.observe(tabEl);
        }
    } else {
        // Fallback se não suportar IntersectionObserver
        [0, 1, 2, 3, 4, 5].forEach(cNum => renderizarClusterEspecifico(cNum));
        renderizarMatrizMunicipiosRD(muns, ind);
        matrizRenderizada = true;
    }
}

// Garante hidratação de todos os elementos para impressão em PDF
window.addEventListener('beforeprint', function () {
    if (!dadosBrutosRD) return;
    [0, 1, 2, 3, 4, 5].forEach(num => {
        if (!clusterRenderizado[num]) renderizarClusterEspecifico(num);
    });
    if (!matrizRenderizada) {
        renderizarMatrizMunicipiosRD(dadosBrutosRD.demografia_rd || [], dadosBrutosRD.indicadores_rd || []);
        matrizRenderizada = true;
    }
    $('.rd-cluster-spinner').addClass('d-none');
});

// -------------------------------------------------------------
// GRAFICO CLUSTER 0 (REGIC ESTADUAL COMPLETO - COM DESTAQUE À RD / CONSÓRCIO)
// -------------------------------------------------------------
function renderizarChartCluster0RD(siglaChave, dadosRegicEstadual, nomeRD) {
    const dom = document.getElementById(`rd_chart_cluster0`);
    if (!dom) return;
    
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const rdNorm = normText(nomeRD);
    const isCons = Boolean(dadosBrutosRD && (dadosBrutosRD.is_consorcio || window.tipoAgrupamentoRegioes === 'consorcio'));

    if (modoRotasCluster0) {
        let destinosAgregados = {};
        (dadosBrutosRD?.fluxos_pe || []).forEach(f => {
            let dest = f.destino_nome && f.destino_nome !== '-' ? f.destino_nome : f.destino;
            if (!dest) return;
            let valRaw = f[siglaChave];
            if (valRaw !== null && valRaw !== undefined && valRaw !== "-") {
                let val = parseFloat(String(valRaw).replace(',', '.'));
                if (!isNaN(val) && val > 0) {
                    let pertenceRD = isCons ?
                        (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normText(dest)) :
                        normText(f.destino_rd) === rdNorm;
                    if (!destinosAgregados[dest]) {
                        destinosAgregados[dest] = { name: dest, value: 0, pertenceRD: pertenceRD };
                    }
                    destinosAgregados[dest].value += val;
                    if (pertenceRD) destinosAgregados[dest].pertenceRD = true;
                }
            }
        });

        let dataList = Object.values(destinosAgregados);
        dataList.sort((a, b) => a.value - b.value); // Crescente para exibir os maiores polos no topo

        if (dataList.length === 0) {
            chart.clear();
            return;
        }

        let startZoom = dataList.length > 15 ? 100 - (15 / dataList.length) * 100 : 0;

        let option = {
            title: { 
                text: `Destinos de Atração (${obterNomeAmigavel(siglaChave)})`, 
                textStyle: { fontSize: 13, color: '#475569', fontFamily: 'Jost' }, 
                left: 'center', 
                top: 5 
            },
            tooltip: { trigger: 'axis', formatter: (params) => {
                let p = params[0];
                let tagRD = dataList[p.dataIndex]?.pertenceRD ? `<br/><span style="color:#0C2856; font-weight:800;">● Polo Pertence ${isCons ? 'ao Consórcio' : 'à RD'} ${nomeRD}</span>` : '';
                return `<b>${p.name}</b>${tagRD}<br/>Total de Ligações Recebidas: <b>${p.value.toLocaleString('pt-BR')}</b>`;
            }},
            grid: { left: '3%', right: '15%', bottom: '5%', top: '15%', containLabel: true },
            xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, axisLabel: {fontSize: 10, fontFamily: 'Jost'} },
            yAxis: { type: 'category', data: dataList.map(d => d.name), axisLabel: { fontSize: 10, fontFamily: 'Jost', width: 110, overflow: 'truncate' }, axisLine: {show: false}, axisTick: {show:false} },
            dataZoom: [
                { type: 'slider', yAxisIndex: 0, width: 12, right: 5, start: startZoom, end: 100, showDetail: false, borderColor: 'transparent', backgroundColor: '#f8fafc', fillerColor: 'rgba(124,58,237,0.3)', handleSize: '100%' },
                { type: 'inside', yAxisIndex: 0, zoomOnMouseWheel: false, moveOnMouseWheel: true, moveOnMouseMove: true }
            ],
            series: [{
                type: 'bar',
                data: dataList.map(d => ({
                    value: d.value,
                    itemStyle: {
                        color: d.pertenceRD ? '#4A235A' : '#A78BFA',
                        borderRadius: [0, 4, 4, 0]
                    }
                })),
                label: { show: true, position: 'right', formatter: (p) => p.value.toLocaleString('pt-BR'), fontSize: 10, fontFamily:'Jost', color:'#333' }
            }]
        };
        chart.setOption(option, true);
        window.addEventListener('resize', () => chart.resize());
        chartsRD[0] = chart;
        ocultarSpinnerRD('rd_spinner_chart_cluster0');
        return;
    }

    let polosUnicos = {};
    (dadosRegicEstadual || []).forEach(d => {
        let nomePolo = d.nome_arranjo && d.nome_arranjo !== "-" ? d.nome_arranjo : (d.nome_cidade && d.nome_cidade !== "-" ? d.nome_cidade : d.municipio);
        if (!nomePolo) return;
        
        let valRaw = d[siglaChave];
        if (valRaw !== null && valRaw !== undefined && valRaw !== "-") {
            let val = parseFloat(String(valRaw).replace(',', '.'));
            let pertenceRD = isCons ?
                (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normText(d.municipio)) :
                normText(d.regiao_de_desenvolvimento) === rdNorm;

            if (!polosUnicos[nomePolo]) {
                polosUnicos[nomePolo] = { value: val, pertenceRD: pertenceRD };
            } else if (pertenceRD) {
                polosUnicos[nomePolo].pertenceRD = true;
            }
        }
    });

    let dataList = Object.keys(polosUnicos).map(k => ({ 
        name: k, 
        value: polosUnicos[k].value,
        pertenceRD: polosUnicos[k].pertenceRD 
    }));

    dataList.sort((a, b) => a.value - b.value); // Crescente para exibir os maiores polos no topo

    if (dataList.length === 0) {
        chart.clear();
        ocultarSpinnerRD('rd_spinner_chart_cluster0');
        return;
    }

    const labelFmt = (val) => {
        let tipo = DICIONARIO_INDICADORES[siglaChave]?.tipo || 'absoluto';
        if (tipo === 'percentual') return val.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits:1}) + '%';
        if (tipo.includes('moeda')) return 'R$ ' + val.toLocaleString('pt-BR', {maximumFractionDigits:0});
        if (tipo === 'indice') return val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        return val.toLocaleString('pt-BR', {maximumFractionDigits: 2});
    };

    let startZoom = dataList.length > 15 ? 100 - (15 / dataList.length) * 100 : 0;

    let option = {
        title: { text: 'Polos Estaduais de Pernambuco', textStyle: { fontSize: 13, color: '#475569', fontFamily: 'Jost' }, left: 'center', top: 5 },
        tooltip: { trigger: 'axis', formatter: (params) => {
            let p = params[0];
            let tagRD = dataList[p.dataIndex]?.pertenceRD ? `<br/><span style="color:#0C2856; font-weight:800;">● Pertence ${isCons ? 'ao Consórcio' : 'à RD'} ${nomeRD}</span>` : '';
            return `<b>${p.name}</b>${tagRD}<br/>${obterNomeAmigavel(siglaChave)}: ${labelFmt(p.value)}`;
        }},
        grid: { left: '3%', right: '15%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, axisLabel: {fontSize: 10, fontFamily: 'Jost'} },
        yAxis: { type: 'category', data: dataList.map(d => d.name), axisLabel: { fontSize: 10, fontFamily: 'Jost', width: 110, overflow: 'truncate' }, axisLine: {show: false}, axisTick: {show:false} },
        dataZoom: [
            { type: 'slider', yAxisIndex: 0, width: 12, right: 5, start: startZoom, end: 100, showDetail: false, borderColor: 'transparent', backgroundColor: '#f8fafc', fillerColor: 'rgba(142,68,173,0.3)', handleSize: '100%' },
            { type: 'inside', yAxisIndex: 0, zoomOnMouseWheel: false, moveOnMouseWheel: true, moveOnMouseMove: true }
        ],
        series: [{
            type: 'bar',
            data: dataList.map(d => ({
                value: d.value,
                itemStyle: {
                    // Roxo escuro destacado para polos da RD / Consórcio selecionado; Roxo suave para os demais do Estado
                    color: d.pertenceRD ? '#4A235A' : '#C39BD3',
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            label: { show: true, position: 'right', formatter: (p) => labelFmt(p.value), fontSize: 10, fontFamily:'Jost', color:'#333' }
        }]
    };
    chart.setOption(option, true);
    window.addEventListener('resize', () => chart.resize());
    chartsRD[0] = chart;
    ocultarSpinnerRD('rd_spinner_chart_cluster0');
}

// -------------------------------------------------------------
// GRAFICO HORIZONTAL RANKING COMPARATIVO (CLUSTERS 1 A 4)
// -------------------------------------------------------------
function renderizarChartClusterRD(cNum, siglaChave, indicadores, muns) {
    const dom = document.getElementById(`rd_chart_cluster${cNum}`);
    if (!dom) return;
    
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    
    let dataList = [];
    muns.forEach(m => {
        let valFloat = null;
        const normName = normText(m.municipio || '');
        
        if (cNum === 5) {
            if (siglaChave === 'capag') {
                let cLet = String(m.capag || m.CAPAG || '').trim().toUpperCase();
                if (!cLet || cLet === 'N.D.' || cLet === 'UNDEFINED' || cLet === '-') {
                    const itemC = (indicadores || []).find(i => {
                        const matchMun = (m.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(m.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                        return matchMun && (String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag');
                    });
                    if (itemC && itemC.indicador) cLet = String(itemC.indicador).trim().toUpperCase();
                }
                const mapC = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
                valFloat = mapC[cLet] || 0;
            } else {
                valFloat = extrairValorFiscal(normName, siglaChave, obterAnoFiscalReferencia(dadosBrutosRD?.fiscais_rd), dadosBrutosRD?.fiscais_rd, m.ibge6);
            }
        } else if (siglaChave === 'pop_2026') {
            valFloat = parseFloat(m.pop_2026);
        } else {
            const items = (indicadores || []).filter(i => {
                const matchMun = (m.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(m.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                return matchMun && String(i.sigla_indicador || '').toLowerCase().trim() === siglaChave.toLowerCase();
            }).sort((a, b) => b.ano - a.ano);
            let valRaw = items.length ? items[0].indicador : null;
            valFloat = valRaw ? parseFloat(String(valRaw).replace(',', '.')) : null;
        }
        
        if (valFloat !== null && !isNaN(valFloat)) {
            if (DICIONARIO_INDICADORES[siglaChave]?.tipo === 'percentual' && valFloat <= 1 && valFloat > 0) {
                valFloat = valFloat * 100;
            }
            dataList.push({ name: m.municipio, value: valFloat });
        }
    });
    
    if (dataList.length === 0) {
        chart.clear();
        ocultarSpinnerRD(`rd_spinner_chart_cluster${cNum}`);
        return;
    }

    dataList.sort((a, b) => a.value - b.value); // Crescente para empurrar os maiores no topo
    let startZoom = dataList.length > 15 ? 100 - (15/dataList.length)*100 : 0;
    
    const labelFmt = (val) => {
        if (siglaChave === 'capag') {
            const mapCapagText = { 4: 'A', 3: 'B', 2: 'C', 1: 'D' };
            return mapCapagText[val] || '-';
        }
        let tipo = DICIONARIO_INDICADORES[siglaChave]?.tipo || 'absoluto';
        if (tipo === 'percentual') return val.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits:1}) + '%';
        if (tipo.includes('moeda')) {
            const abs = Math.abs(val);
            if (abs >= 1e9) return 'R$ ' + (val / 1e9).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' Bi';
            if (abs >= 1e6) return 'R$ ' + (val / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' Mi';
            return 'R$ ' + val.toLocaleString('pt-BR', {maximumFractionDigits:0});
        }
        if (tipo === 'indice') return val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        return val.toLocaleString('pt-BR');
    };

    let option = {
        title: { text: 'Ranking na RD', textStyle: { fontSize: 13, color: '#475569', fontFamily: 'Jost' }, left: 'center', top: 5 },
        tooltip: { trigger: 'axis', formatter: (params) => { let p = params[0]; return `<b>${p.name}</b><br/>${obterNomeAmigavel(siglaChave)}: ${labelFmt(p.value)}`; } },
        grid: { left: '3%', right: '15%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, axisLabel: {fontSize: 10, fontFamily: 'Jost'} },
        yAxis: { type: 'category', data: dataList.map(d => d.name), axisLabel: { fontSize: 10, fontFamily: 'Jost', width: 90, overflow: 'truncate' }, axisLine: {show: false}, axisTick: {show:false} },
        dataZoom: [
            { type: 'slider', yAxisIndex: 0, width: 12, right: 5, start: startZoom, end: 100, showDetail: false, borderColor: 'transparent', backgroundColor: '#f8fafc', fillerColor: cNum === 5 ? 'rgba(17,120,100,0.2)' : 'rgba(12,40,86,0.2)', handleSize: '100%' },
            { type: 'inside', yAxisIndex: 0, zoomOnMouseWheel: false, moveOnMouseWheel: true, moveOnMouseMove: true }
        ],
        series: [{
            type: 'bar',
            data: dataList.map(d => d.value),
            itemStyle: { 
                color: cNum === 5 ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#48C9B0' },
                    { offset: 1, color: '#117864' }
                ]) : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#3498DB' },
                    { offset: 1, color: '#0C2856' }
                ]),
                borderRadius: [0, 4, 4, 0] 
            },
            label: { show: true, position: 'right', formatter: (p) => labelFmt(p.value), fontSize: 10, fontFamily: 'Jost', color: '#333' }
        }]
    };
    
    chart.setOption(option, true);
    window.addEventListener('resize', () => chart.resize());
    chartsRD[cNum] = chart;
    ocultarSpinnerRD(`rd_spinner_chart_cluster${cNum}`);
}

// -------------------------------------------------------------
// GRAFICO HISTÓRICO: DISTRIBUIÇÃO INTERQUARTIL (Q1 - MEDIANA - Q3)
// -------------------------------------------------------------
function renderizarChartEvolucaoRD(cNum, siglaChave, indicadores) {
    const dom = document.getElementById(`rd_chart_hist_cluster${cNum}`);
    if (!dom) return;
    
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    chart.clear();

    // Se for o dado estático populacional que não possui histórico via banco
    if (siglaChave === 'pop_2026') {
        chart.setOption({
            title: { text: 'Série Histórica Indisponível para Projeção Pontual do IBGE', textStyle: { fontSize: 12, color: '#94A3B8', fontFamily: 'Jost' }, left: 'center', top: 'center' }
        }, true);
        ocultarSpinnerRD(`rd_spinner_hist_cluster${cNum}`);
        return;
    }

    let dadosPorAno = {};

    if (cNum === 5) {
        if (siglaChave === 'capag') {
            chart.setOption({
                title: { text: 'Classificação Qualitativa - Sem Série Histórica Contínua', textStyle: { fontSize: 12, color: '#94A3B8', fontFamily: 'Jost' }, left: 'center', top: 'center' }
            }, true);
            ocultarSpinnerRD(`rd_spinner_hist_cluster${cNum}`);
            return;
        }

        const fiscais = dadosBrutosRD?.fiscais_rd || [];
        const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        const anosDisponiveis = [...new Set(fiscais.map(f => parseFloat(f.exercicio)).filter(a => !isNaN(a) && a >= 2019 && a <= 2025))].sort((a,b) => a-b);
        const muns = dadosBrutosRD?.demografia_rd || [];

        anosDisponiveis.forEach(ano => {
            let valoresAno = [];
            muns.forEach(m => {
                const normName = normText(m.municipio || '');
                let v = extrairValorFiscal(normName, siglaChave, ano, fiscais);
                if (v !== null && !isNaN(v)) valoresAno.push(v);
            });
            if (valoresAno.length > 0) {
                dadosPorAno[ano] = valoresAno;
            }
        });
    } else {
        const indFilter = (indicadores || []).filter(i => String(i.sigla_indicador).toLowerCase() === siglaChave.toLowerCase());
        
        if (!indFilter.length) {
            chart.setOption({
                title: { text: 'Série Histórica Indisponível', textStyle: { fontSize: 12, color: '#94A3B8', fontFamily: 'Jost' }, left: 'center', top: 'center' }
            }, true);
            ocultarSpinnerRD(`rd_spinner_hist_cluster${cNum}`);
            return;
        }

        indFilter.forEach(i => {
            const ano = parseInt(i.ano);
            if (isNaN(ano)) return;
            let valFloat = parseFloat(String(i.indicador).replace(',', '.'));
            if (!isNaN(valFloat)) {
                if (DICIONARIO_INDICADORES[siglaChave]?.tipo === 'percentual' && valFloat <= 1 && valFloat > 0) {
                    valFloat = valFloat * 100;
                }
                if (!dadosPorAno[ano]) dadosPorAno[ano] = [];
                dadosPorAno[ano].push(valFloat);
            }
        });
    }

    const anos = Object.keys(dadosPorAno).map(Number).sort((a,b) => a-b);
    
    if (anos.length < 2) {
        chart.setOption({
            title: { text: 'Série Histórica Indisponível (Apenas 1 ano registrado)', textStyle: { fontSize: 12, color: '#94A3B8', fontFamily: 'Jost' }, left: 'center', top: 'center' }
        }, true);
        ocultarSpinnerRD(`rd_spinner_hist_cluster${cNum}`);
        return;
    }

    let q1Data = [];
    let q3DiffData = []; // Diferença Q3 - Q1 para o Stack Band
    let medianData = [];

    anos.forEach(ano => {
        const stats = getQuartiles(dadosPorAno[ano]);
        q1Data.push(stats.q1);
        q3DiffData.push(stats.q3 - stats.q1);
        medianData.push(stats.median);
    });

    const labelFmt = (val) => {
        let tipo = DICIONARIO_INDICADORES[siglaChave]?.tipo || 'absoluto';
        if (tipo === 'percentual') return val.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits:1}) + '%';
        if (tipo.includes('moeda')) {
            const abs = Math.abs(val);
            if (abs >= 1e9) return 'R$ ' + (val / 1e9).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' Bi';
            if (abs >= 1e6) return 'R$ ' + (val / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' Mi';
            return 'R$ ' + val.toLocaleString('pt-BR', {maximumFractionDigits:0});
        }
        if (tipo === 'indice') return val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        return val.toLocaleString('pt-BR');
    };

    let option = {
        title: { text: 'Evolução da Distribuição Interquartil', textStyle: { fontSize: 13, color: '#475569', fontFamily: 'Jost' }, left: 'left', top: 0 },
        tooltip: { 
            trigger: 'axis', 
            formatter: function (params) {
                let ano = params[0].axisValue;
                let q1 = params[0].data;
                let q3 = q1 + params[1].data;
                let med = params[2].data;
                return `<div style="font-family: Jost;">
                            <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-bottom: 4px;">Série de ${ano}</div>
                            <span style="color:#64748b; font-size: 11px;">75º Percentil (Q3):</span> <b>${labelFmt(q3)}</b><br/>
                            <span style="color:#0C2856; font-size: 12px; font-weight:800;">Mediana: ${labelFmt(med)}</span><br/>
                            <span style="color:#64748b; font-size: 11px;">25º Percentil (Q1):</span> <b>${labelFmt(q1)}</b>
                        </div>`;
            } 
        },
        legend: { data: ['Banda de Quartis (Q1-Q3)', 'Mediana'], top: 0, right: 10, itemStyle: {opacity: 1} },
        grid: { left: '2%', right: '4%', bottom: '5%', top: '25%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: anos, 
            boundaryGap: false, 
            axisLine: { lineStyle: { color: '#cbd5e1' } }, 
            axisLabel: {fontFamily:'Jost', color: '#64748b', fontWeight: 'bold'} 
        },
        yAxis: { 
            type: 'value', 
            splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, 
            axisLabel: {
                fontFamily:'Jost', 
                color: '#64748b', 
                formatter: (v) => {
                    let tipo = DICIONARIO_INDICADORES[siglaChave]?.tipo || 'absoluto';
                    if (tipo.includes('moeda') && Math.abs(v) >= 1e9) return (v/1e9).toFixed(1) + 'Bi';
                    if (tipo.includes('moeda') && Math.abs(v) >= 1e6) return (v/1e6).toFixed(0) + 'Mi';
                    if (tipo.includes('moeda') && Math.abs(v) >= 1000) return (v/1000).toFixed(0) + 'k';
                    if (tipo === 'absoluto' && Math.abs(v) >= 1000) return (v/1000) + 'k';
                    return v;
                }
            } 
        },
        series: [
            {
                name: 'Limite Inferior (Q1)',
                type: 'line',
                data: q1Data,
                stack: 'band',
                symbol: 'none',
                lineStyle: { opacity: 0 }
            },
            {
                name: 'Banda de Quartis (Q1-Q3)',
                type: 'line',
                data: q3DiffData,
                stack: 'band',
                symbol: 'none',
                lineStyle: { opacity: 0 },
                areaStyle: { color: cNum === 5 ? 'rgba(17, 120, 100, 0.2)' : 'rgba(52, 152, 219, 0.2)' }
            },
            {
                name: 'Mediana',
                type: 'line',
                data: medianData,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: cNum === 5 ? '#117864' : '#0C2856' },
                lineStyle: { width: 3, color: cNum === 5 ? '#117864' : '#0C2856' }
            }
        ]
    };
    chart.setOption(option, true);
    window.addEventListener('resize', () => chart.resize());
    histChartsRD[cNum] = chart;
    ocultarSpinnerRD(`rd_spinner_hist_cluster${cNum}`);
}

// -------------------------------------------------------------
// HELPER: GERAÇÃO DE ARCOS / LINHAS CURVAS DIRECIONADAS
// -------------------------------------------------------------
function gerarLinhaCurva(p1, p2, numPontos = 16) {
    const lon1 = p1[0], lat1 = p1[1];
    const lon2 = p2[0], lat2 = p2[1];
    
    const midLon = (lon1 + lon2) / 2;
    const midLat = (lat1 + lat2) / 2;
    
    const dLon = lon2 - lon1;
    const dLat = lat2 - lat1;
    const dist = Math.sqrt(dLon * dLon + dLat * dLat);
    
    if (dist < 0.001) return [p1, p2];
    
    // Curvatura suave perpendicular (12% da distância euclidiana)
    const normalLon = -dLat / dist;
    const normalLat = dLon / dist;
    
    const curvatura = dist * 0.12;
    const ctrlLon = midLon + normalLon * curvatura;
    const ctrlLat = midLat + normalLat * curvatura;
    
    const coords = [];
    for (let i = 0; i <= numPontos; i++) {
        const t = i / numPontos;
        const x = (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * ctrlLon + t * t * lon2;
        const y = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
        coords.push([x, y]);
    }
    return coords;
}

// -------------------------------------------------------------
// MAPA DINÂMICO DE ROTAS E FLUXOS REGIC (DIMENSÃO 0)
// -------------------------------------------------------------
function renderizarMapaRotasCluster0(containerId, legendaId, siglaChave, geojsonEstadual, fluxos, instMapa, setInst, nomeRD) {
    const dom = document.getElementById(containerId);
    if (!dom || !geojsonEstadual) {
        ocultarSpinnerRD('rd_spinner_map_cluster0');
        return;
    }

    const isCons = Boolean(dadosBrutosRD && (dadosBrutosRD.is_consorcio || window.tipoAgrupamentoRegioes === 'consorcio'));
    const geoData = typeof geojsonEstadual === 'string' ? JSON.parse(geojsonEstadual) : JSON.parse(JSON.stringify(geojsonEstadual));
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const rdNorm = normText(nomeRD);

    // Identificar municípios da RD selecionada para contorno
    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const pertenceRD = (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normName);
        ft.properties.pertence_rd = pertenceRD;
    });

    // 1. Montagem das Rotas (LineStrings com Curvatura)
    let rotasFeatures = [];
    let hubsMap = {};

    (fluxos || []).forEach(f => {
        let valRaw = f[siglaChave];
        if (valRaw === undefined || valRaw === null || valRaw === "" || valRaw === "-") return;
        let val = parseFloat(String(valRaw).replace(',', '.'));
        if (isNaN(val) || val <= 0) return;

        let origLon = parseFloat(f.origem_lon), origLat = parseFloat(f.origem_lat);
        let destLon = parseFloat(f.destino_lon), destLat = parseFloat(f.destino_lat);
        if (isNaN(origLon) || isNaN(origLat) || isNaN(destLon) || isNaN(destLat)) return;

        let pertenceRDOrig = false;
        let pertenceRDDest = false;
        if (isCons) {
            pertenceRDOrig = (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normText(f.origem_nome));
            pertenceRDDest = (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normText(f.destino_nome));
        } else {
            pertenceRDOrig = normText(f.origem_rd) === rdNorm;
            pertenceRDDest = normText(f.destino_rd) === rdNorm;
        }

        let curva = gerarLinhaCurva([origLon, origLat], [destLon, destLat], 16);

        rotasFeatures.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: curva },
            properties: {
                origem_nome: f.origem_nome,
                origem_rd: f.origem_rd,
                destino_nome: f.destino_nome,
                destino_rd: f.destino_rd,
                valor: val,
                pertence_rd_origem: pertenceRDOrig,
                pertence_rd_destino: pertenceRDDest,
                pertence_rd_qualquer: pertenceRDOrig || pertenceRDDest
            }
        });

        let dKey = f.destino_nome && f.destino_nome !== '-' ? f.destino_nome : f.destino;
        if (!hubsMap[dKey]) {
            hubsMap[dKey] = {
                nome: dKey,
                lon: destLon,
                lat: destLat,
                total_inflow: 0,
                pertence_rd: pertenceRDDest
            };
        }
        hubsMap[dKey].total_inflow += val;
        if (pertenceRDDest) hubsMap[dKey].pertence_rd = true;
    });

    // Ordena as rotas para que as linhas da RD fiquem renderizadas no topo
    rotasFeatures.sort((a, b) => {
        if (a.properties.pertence_rd_qualquer && !b.properties.pertence_rd_qualquer) return 1;
        if (!a.properties.pertence_rd_qualquer && b.properties.pertence_rd_qualquer) return -1;
        return a.properties.valor - b.properties.valor;
    });

    const fcRotas = { type: "FeatureCollection", features: rotasFeatures };

    // 2. Montagem dos Pontos de Destino (Hubs)
    let hubFeatures = Object.values(hubsMap).map(h => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [h.lon, h.lat] },
        properties: {
            destino_nome: h.nome,
            total_inflow: h.total_inflow,
            pertence_rd: h.pertence_rd
        }
    }));
    const fcHubs = { type: "FeatureCollection", features: hubFeatures };

    // 3. Legenda Dinâmica
    const $legendaEl = $(`#${legendaId}`);
    if ($legendaEl.length) {
        const rotuloAgrup = isCons ? `Consórcio ${nomeRD}` : `RD ${nomeRD}`;
        $legendaEl.html(`
            <div class="fw-bold text-slate-800 mb-1" style="font-size: 0.75rem;">
                <i class="fas fa-route text-purple-700 me-1"></i> Rotas e Fluxos REGIC (${obterNomeAmigavel(siglaChave)})
            </div>
            <div class="d-flex flex-column gap-1 text-slate-600" style="font-size: 0.68rem;">
                <div class="d-flex align-items-center gap-1.5">
                    <span style="display:inline-block; width:18px; height:3px; background:#7c3aed; border-radius:2px;"></span>
                    <span>Saídas de <b>${rotuloAgrup}</b></span>
                </div>
                <div class="d-flex align-items-center gap-1.5">
                    <span style="display:inline-block; width:18px; height:3px; background:#0d9488; border-radius:2px;"></span>
                    <span>Entradas em <b>${rotuloAgrup}</b></span>
                </div>
                <div class="d-flex align-items-center gap-1.5">
                    <span style="display:inline-block; width:18px; height:2px; background:#cbd5e1; border-radius:2px;"></span>
                    <span>Demais fluxos estaduais</span>
                </div>
                <div class="d-flex align-items-center gap-1.5 mt-0.5">
                    <span style="display:inline-block; width:8px; height:8px; background:#4A235A; border:1.5px solid #fff; border-radius:50%;"></span>
                    <span>Polos e Arranjos de Atração (Destinos)</span>
                </div>
            </div>
        `);
    }

    const fitBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                const proc = (c) => { if (Array.isArray(c) && c[0] < -34.0 && c[1] < -7.0) bounds.extend(c); };
                if (ft.geometry.type === 'Polygon') coords[0].forEach(proc);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(p => p[0].forEach(proc));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 20, animate: false });
        } catch (e) {}
    };

    const attachOrUpdateRotasLayers = (mapa) => {
        if (mapa.getSource('rd_cluster_src_' + containerId)) {
            mapa.getSource('rd_cluster_src_' + containerId).setData(geoData);
        }
        if (mapa.getLayer('rd_cluster_fill_' + containerId)) {
            mapa.setPaintProperty('rd_cluster_fill_' + containerId, 'fill-color', '#F8FAFC');
            mapa.setPaintProperty('rd_cluster_fill_' + containerId, 'fill-opacity', 0.85);
        }
        if (mapa.getLayer('rd_cluster_line_' + containerId)) {
            mapa.setPaintProperty('rd_cluster_line_' + containerId, 'line-color', [
                'case',
                ['boolean', ['get', 'pertence_rd'], false], '#7c3aed',
                '#E2E8F0'
            ]);
            mapa.setPaintProperty('rd_cluster_line_' + containerId, 'line-width', [
                'case',
                ['boolean', ['get', 'pertence_rd'], false], 2.0,
                0.6
            ]);
        }

        // Fonte e Layer das Linhas
        if (mapa.getSource('rd_rotas_src_' + containerId)) {
            mapa.getSource('rd_rotas_src_' + containerId).setData(fcRotas);
        } else {
            mapa.addSource('rd_rotas_src_' + containerId, { type: 'geojson', data: fcRotas });
            mapa.addLayer({
                id: 'rd_rotas_line_' + containerId,
                type: 'line',
                source: 'rd_rotas_src_' + containerId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                    'visibility': 'visible'
                },
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['get', 'pertence_rd_origem'], false], '#7c3aed',
                        ['boolean', ['get', 'pertence_rd_destino'], false], '#0d9488',
                        '#94A3B8'
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['get', 'pertence_rd_qualquer'], false],
                        ['interpolate', ['linear'], ['get', 'valor'], 1, 2.0, 5, 3.8, 10, 6.0],
                        ['interpolate', ['linear'], ['get', 'valor'], 1, 1.0, 5, 2.0, 10, 3.5]
                    ],
                    'line-opacity': [
                        'case',
                        ['boolean', ['get', 'pertence_rd_qualquer'], false], 0.95,
                        0.35
                    ]
                }
            });

            const popupRota = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'hover-popup-aurora' });
            mapa.on('mousemove', 'rd_rotas_line_' + containerId, (e) => {
                mapa.getCanvas().style.cursor = 'pointer';
                if (!e.features.length) return;
                const p = e.features[0].properties;
                popupRota.setLngLat(e.lngLat).setHTML(`
                    <div style="font-family: Jost; padding: 4px; min-width: 200px;">
                        <div style="font-size: 10px; color: #7c3aed; font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">
                            <i class="fas fa-route"></i> Fluxo Territorial REGIC
                        </div>
                        <div style="font-size: 12px; font-weight: 900; color: #0C2856; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                            ${p.origem_nome} <span style="color:#7c3aed;">➔</span> ${p.destino_nome}
                        </div>
                        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 4px 8px;">
                            <span style="color:#5b21b6; font-size:11px; font-weight:700;">${obterNomeAmigavel(siglaChave)}:</span>
                            <span style="color:#4c1d95; font-size:12px; font-weight:900;">${p.valor} conexões</span>
                        </div>
                    </div>
                `).addTo(mapa);
            });
            mapa.on('mouseleave', 'rd_rotas_line_' + containerId, () => {
                mapa.getCanvas().style.cursor = '';
                popupRota.remove();
            });
        }

        if (mapa.getLayer('rd_rotas_line_' + containerId)) {
            mapa.setLayoutProperty('rd_rotas_line_' + containerId, 'visibility', 'visible');
        }

        // Fonte e Layer dos Hubs
        if (mapa.getSource('rd_hubs_src_' + containerId)) {
            mapa.getSource('rd_hubs_src_' + containerId).setData(fcHubs);
        } else {
            mapa.addSource('rd_hubs_src_' + containerId, { type: 'geojson', data: fcHubs });
            mapa.addLayer({
                id: 'rd_rotas_hubs_' + containerId,
                type: 'circle',
                source: 'rd_hubs_src_' + containerId,
                layout: { 'visibility': 'visible' },
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['get', 'total_inflow'],
                        1, 4,
                        30, 8,
                        150, 16
                    ],
                    'circle-color': [
                        'case',
                        ['boolean', ['get', 'pertence_rd'], false], '#4A235A',
                        '#8B5CF6'
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#FFFFFF'
                }
            });

            const popupHub = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'hover-popup-aurora' });
            mapa.on('mousemove', 'rd_rotas_hubs_' + containerId, (e) => {
                mapa.getCanvas().style.cursor = 'pointer';
                if (!e.features.length) return;
                const p = e.features[0].properties;
                popupHub.setLngLat(e.lngLat).setHTML(`
                    <div style="font-family: Jost; padding: 4px; min-width: 190px;">
                        <div style="font-size: 10px; color: #4A235A; font-weight: 800; text-transform: uppercase;">
                            <i class="fas fa-bullseye"></i> Polo de Atração / Destino
                        </div>
                        <div style="font-size: 13px; font-weight: 900; color: #0C2856; margin: 3px 0;">
                            ${p.destino_nome}
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 12px;">
                            <span style="color:#64748b;">Total Recebido (${obterNomeAmigavel(siglaChave)}):</span> <b style="color:#0C2856;">${p.total_inflow} conexões</b>
                        </div>
                    </div>
                `).addTo(mapa);
            });
            mapa.on('mouseleave', 'rd_rotas_hubs_' + containerId, () => {
                mapa.getCanvas().style.cursor = '';
                popupHub.remove();
            });
        }

        if (mapa.getLayer('rd_rotas_hubs_' + containerId)) {
            mapa.setLayoutProperty('rd_rotas_hubs_' + containerId, 'visibility', 'visible');
        }

        fitBounds(mapa);
        mapa.resize();
        ocultarSpinnerRD('rd_spinner_map_cluster0');
    };

    if (instMapa && instMapa.getSource('rd_cluster_src_' + containerId)) {
        attachOrUpdateRotasLayers(instMapa);
        return;
    }

    if (instMapa) instMapa.remove();
    let mapa = new maplibregl.Map({
        container: containerId,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });
    mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapa.on('load', () => {
        mapa.resize();
        mapa.addSource('rd_cluster_src_' + containerId, { type: 'geojson', data: geoData });
        mapa.addLayer({
            id: 'rd_cluster_fill_' + containerId,
            type: 'fill',
            source: 'rd_cluster_src_' + containerId,
            paint: { 'fill-color': '#F8FAFC', 'fill-opacity': 0.85 }
        });
        mapa.addLayer({
            id: 'rd_cluster_line_' + containerId,
            type: 'line',
            source: 'rd_cluster_src_' + containerId,
            paint: { 'line-color': '#CBD5E1', 'line-width': 0.6 }
        });

        attachOrUpdateRotasLayers(mapa);
    });

    setInst(mapa);
}

// -------------------------------------------------------------
// MAPA DINÂMICO DOS CLUSTERS (Gera Cloroplético ou Bolhas)
// -------------------------------------------------------------
function renderizarMapaClusterRD(cNum, containerId, legendaId, siglaChave, geojsonStr, indicadores, demografia, instMapa, setInst, listaIndicadoresHover) {
    const dom = document.getElementById(containerId);
    if (!dom || !geojsonStr) {
        ocultarSpinnerRD(`rd_spinner_map_cluster${cNum}`);
        return;
    }

    const isCons = Boolean(dadosBrutosRD && (dadosBrutosRD.is_consorcio || window.tipoAgrupamentoRegioes === 'consorcio'));
    const geoData = typeof geojsonStr === 'string' ? JSON.parse(geojsonStr) : JSON.parse(JSON.stringify(geojsonStr));
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        let valFloat = null;
        
        // Determinar se o município pertence à RD ou Consórcio atualmente selecionado no filtro
        const pertenceRDSelecionada = (dadosBrutosRD?.demografia_rd || []).some(m => normText(m.municipio) === normName);
        ft.properties.pertence_rd = pertenceRDSelecionada;

        // Determinar o valor primário a colorir ou transformar em bolha
        if (cNum === 0) {
            const matchRegic = (dadosBrutosRD.regic_rd || []).find(d => {
                if (ft.properties.ibge6 && d.ibge6 && String(ft.properties.ibge6).slice(0, 6) === String(d.ibge6).slice(0, 6)) return true;
                return normText(d.municipio) === normName;
            });
            if (matchRegic && matchRegic[siglaChave] !== undefined && matchRegic[siglaChave] !== null && matchRegic[siglaChave] !== "-") {
                valFloat = parseFloat(String(matchRegic[siglaChave]).replace(',', '.'));
            }
        } else if (cNum === 5) {
            if (siglaChave === 'capag') {
                const matchDemo = demografia.find(d => {
                    if (ft.properties.ibge6 && d.ibge6 && String(ft.properties.ibge6).slice(0, 6) === String(d.ibge6).slice(0, 6)) return true;
                    return normText(d.municipio) === normName;
                });
                let cLet = matchDemo ? (matchDemo.capag || matchDemo.CAPAG || '') : '';
                if (!cLet || cLet === 'N.D.' || cLet === 'UNDEFINED' || cLet === '-') {
                    const itemC = (indicadores || []).find(i => {
                        const matchMun = (ft.properties.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(ft.properties.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                        return matchMun && (String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag');
                    });
                    if (itemC && itemC.indicador) cLet = String(itemC.indicador).trim().toUpperCase();
                }
                const mapC = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
                valFloat = mapC[String(cLet).toUpperCase().trim()] || 0;
            } else {
                valFloat = extrairValorFiscal(normName, siglaChave, obterAnoFiscalReferencia(dadosBrutosRD?.fiscais_rd), dadosBrutosRD?.fiscais_rd, ft.properties.ibge6);
            }
        } else if (siglaChave === 'pop_2026') {
            const matchDemo = demografia.find(d => {
                if (ft.properties.ibge6 && d.ibge6 && String(ft.properties.ibge6).slice(0, 6) === String(d.ibge6).slice(0, 6)) return true;
                return normText(d.municipio) === normName;
            });
            if (matchDemo) valFloat = parseFloat(matchDemo.pop_2026);
        } else {
            const items = (indicadores || []).filter(i => {
                const matchMun = (ft.properties.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(ft.properties.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                return matchMun && String(i.sigla_indicador || '').toLowerCase().trim() === siglaChave.toLowerCase();
            }).sort((a, b) => b.ano - a.ano);
            let valRaw = items.length ? items[0].indicador : null;
            valFloat = valRaw ? parseFloat(String(valRaw).replace(',', '.')) : null;
        }
        
        if (valFloat !== null && !isNaN(valFloat)) {
            if (DICIONARIO_INDICADORES[siglaChave]?.tipo === 'percentual' && valFloat <= 1 && valFloat > 0) {
                valFloat = valFloat * 100;
            }
            ft.properties.val_cluster = valFloat;
            if (cNum === 0 || pertenceRDSelecionada) {
                if (valFloat < minVal) minVal = valFloat;
                if (valFloat > maxVal) maxVal = valFloat;
            }
        } else {
            ft.properties.val_cluster = -9999;
        }

        // Recolher dados para o Hover/Tooltip
        const hoverData = [];
        listaIndicadoresHover.forEach(sig => {
            if (sig === siglaChave) return;
            let valFmt = '-';
            
            if (cNum === 0) {
                const matchRegic = (dadosBrutosRD.regic_rd || []).find(d => normText(d.municipio) === normName);
                if (matchRegic && matchRegic[sig] !== undefined && matchRegic[sig] !== null && matchRegic[sig] !== "-") {
                    valFmt = formatarValorAmigavel(matchRegic[sig], sig);
                }
            } else if (cNum === 5) {
                if (sig === 'capag') {
                    const matchDemo = demografia.find(d => {
                        if (ft.properties.ibge6 && d.ibge6 && String(ft.properties.ibge6).slice(0, 6) === String(d.ibge6).slice(0, 6)) return true;
                        return normText(d.municipio) === normName;
                    });
                    let cLet = matchDemo ? (matchDemo.capag || matchDemo.CAPAG || '') : '';
                    if (!cLet || cLet === 'N.D.' || cLet === 'UNDEFINED' || cLet === '-') {
                        const itemC = (indicadores || []).find(i => {
                            const matchMun = (ft.properties.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(ft.properties.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                            return matchMun && (String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag');
                        });
                        if (itemC && itemC.indicador) cLet = String(itemC.indicador).trim().toUpperCase();
                    }
                    valFmt = cLet || '-';
                } else {
                    let vF = extrairValorFiscal(normName, sig, obterAnoFiscalReferencia(dadosBrutosRD?.fiscais_rd), dadosBrutosRD?.fiscais_rd, ft.properties.ibge6);
                    valFmt = formatarValorAmigavel(vF, sig);
                }
            } else if (sig === 'pop_2026') {
                const matchDemo = demografia.find(d => {
                    if (ft.properties.ibge6 && d.ibge6 && String(ft.properties.ibge6).slice(0, 6) === String(d.ibge6).slice(0, 6)) return true;
                    return normText(d.municipio) === normName;
                });
                if (matchDemo && matchDemo.pop_2026) valFmt = formatarValorAmigavel(matchDemo.pop_2026, sig);
            } else {
                const indItem = (indicadores || []).filter(i => {
                    const matchMun = (ft.properties.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(ft.properties.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                    return matchMun && String(i.sigla_indicador || '').toLowerCase().trim() === sig.toLowerCase();
                }).sort((a, b) => b.ano - a.ano);
                if (indItem.length) valFmt = formatarValorAmigavel(indItem[0].indicador, sig);
            }
            
            hoverData.push({
                sigla: sig,
                nome: obterNomeAmigavel(sig),
                valorFmt: valFmt
            });
        });
        ft.properties.hover_data = JSON.stringify(hoverData);

        // Se for o Cluster 0, gravamos também o Nome do Arranjo para a Tooltip
        if (cNum === 0) {
            const matchRegic = (dadosBrutosRD.regic_rd || []).find(d => normText(d.municipio) === normName);
            if (matchRegic) {
                ft.properties.arranjo_nome = matchRegic.nome_arranjo && matchRegic.nome_arranjo !== "-" ? matchRegic.nome_arranjo : (matchRegic.nome_cidade && matchRegic.nome_cidade !== "-" ? matchRegic.nome_cidade : "");
                ft.properties.hierarquia = matchRegic.hierarquia && matchRegic.hierarquia !== "-" ? matchRegic.hierarquia : "N/I";
                ft.properties.rd_nome = matchRegic.regiao_de_desenvolvimento || "";
            }
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    // Definição de Cores do Mapa
    let colorMin = '#E3F2FD', colorMax = '#0D47A1';
    if (cNum === 0) { colorMin = '#F4ECF7'; colorMax = '#4A235A'; } // Roxo para a Dimensão 0 de Redes
    else if (cNum === 5) { colorMin = '#E8F8F5'; colorMax = '#117864'; } // Verde esmeralda para a Dimensão 5 Fiscal

    const fillColorExpr = (cNum === 0 && isCons) ? [
        'case',
        ['==', ['get', 'val_cluster'], -9999], '#F1F5F9',
        ['!', ['boolean', ['get', 'pertence_rd'], false]], '#E2E8F0',
        ['interpolate', ['linear'], ['get', 'val_cluster'], minVal, colorMin, maxVal, colorMax]
    ] : [
        'case',
        ['==', ['get', 'val_cluster'], -9999], '#F1F5F9',
        ['interpolate', ['linear'], ['get', 'val_cluster'], minVal, colorMin, maxVal, colorMax]
    ];

    const fillOpacityExpr = (cNum === 0 && isCons) ? [
        'case',
        ['!', ['boolean', ['get', 'pertence_rd'], false]], 0.45,
        0.88
    ] : 0.85;

    const $legendaEl = $(`#${legendaId}`);
    if ($legendaEl.length) {
        const minLegendTxt = siglaChave === 'capag' ? 'D (Vulnerável)' : `Min: ${formatarValorAmigavel(minVal, siglaChave)}`;
        const maxLegendTxt = siglaChave === 'capag' ? 'A (Forte)' : `Max: ${formatarValorAmigavel(maxVal, siglaChave)}`;
        $legendaEl.html(`
            <div class="fw-bold text-slate-800 mb-1" style="font-size: 0.75rem;">${obterNomeAmigavel(siglaChave)} (${cNum === 0 ? 'Visão Estadual' : 'Visão Regional'})</div>
            <div class="d-flex align-items-center gap-2">
                <span class="text-slate-500 font-bold" style="font-size: 0.68rem;">${minLegendTxt}</span>
                <div style="height: 10px; width: 100px; background: linear-gradient(to right, ${colorMin}, ${colorMax}); border-radius: 4px; border: 1px solid #cbd5e1;"></div>
                <span class="text-slate-800 font-black" style="font-size: 0.68rem;">${maxLegendTxt}</span>
            </div>
        `);
    }

    const fitBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                const proc = (c) => { if (Array.isArray(c) && c[0] < -34.0 && c[1] < -7.0) bounds.extend(c); };
                if (ft.geometry.type === 'Polygon') coords[0].forEach(proc);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(p => p[0].forEach(proc));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 20, animate: false });
        } catch (e) {}
    };

    if (instMapa && instMapa.getSource('rd_cluster_src_' + containerId)) {
        instMapa.getSource('rd_cluster_src_' + containerId).setData(geoData);
        
        if (instMapa.getLayer('rd_cluster_circle_' + containerId)) {
            instMapa.removeLayer('rd_cluster_circle_' + containerId);
        }
        if (instMapa.getSource('rd_cluster_pts_' + containerId)) {
            instMapa.removeSource('rd_cluster_pts_' + containerId);
        }
        if (instMapa.getLayer('rd_rotas_line_' + containerId)) {
            instMapa.setLayoutProperty('rd_rotas_line_' + containerId, 'visibility', 'none');
        }
        if (instMapa.getLayer('rd_rotas_hubs_' + containerId)) {
            instMapa.setLayoutProperty('rd_rotas_hubs_' + containerId, 'visibility', 'none');
        }
        if (instMapa.getLayer('rd_cluster_fill_' + containerId)) {
            instMapa.setLayoutProperty('rd_cluster_fill_' + containerId, 'visibility', 'visible');
            instMapa.setPaintProperty('rd_cluster_fill_' + containerId, 'fill-color', fillColorExpr);
            instMapa.setPaintProperty('rd_cluster_fill_' + containerId, 'fill-opacity', fillOpacityExpr);
        }
        if (instMapa.getLayer('rd_cluster_line_' + containerId)) {
            instMapa.setLayoutProperty('rd_cluster_line_' + containerId, 'visibility', 'visible');
            if (cNum === 0) {
                instMapa.setPaintProperty('rd_cluster_line_' + containerId, 'line-color', [
                    'case',
                    ['boolean', ['get', 'pertence_rd'], false], '#0C2856',
                    '#94A3B8'
                ]);
                instMapa.setPaintProperty('rd_cluster_line_' + containerId, 'line-width', [
                    'case',
                    ['boolean', ['get', 'pertence_rd'], false], 2.2,
                    0.6
                ]);
            }
        }

        fitBounds(instMapa);
        instMapa.resize();
        ocultarSpinnerRD(`rd_spinner_map_cluster${cNum}`);
        return;
    }

    if (instMapa) instMapa.remove();
    let mapa = new maplibregl.Map({
        container: containerId,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapa.on('load', () => {
        mapa.resize();
        mapa.addSource('rd_cluster_src_' + containerId, { type: 'geojson', data: geoData });
        
        // Layer de Polígonos
        mapa.addLayer({ 
            id: 'rd_cluster_fill_' + containerId, 
            type: 'fill', 
            source: 'rd_cluster_src_' + containerId, 
            paint: { 
                'fill-color': fillColorExpr, 
                'fill-opacity': fillOpacityExpr 
            } 
        });

        // Layer de Linhas (Contornos - Destaca a RD no mapa do Estado)
        mapa.addLayer({ 
            id: 'rd_cluster_line_' + containerId, 
            type: 'line', 
            source: 'rd_cluster_src_' + containerId, 
            paint: { 
                'line-color': cNum === 0 ? [
                    'case',
                    ['boolean', ['get', 'pertence_rd'], false], '#0C2856',
                    '#94A3B8'
                ] : '#0C2856', 
                'line-width': cNum === 0 ? [
                    'case',
                    ['boolean', ['get', 'pertence_rd'], false], 2.2,
                    0.6
                ] : 1.0 
            } 
        });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'hover-popup-aurora' });
        
        const actOnMouseMove = (e) => {
            mapa.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            
            // Caso seja modo Consórcio e o município não pertença ao consórcio selecionado
            if (isCons && !p.pertence_rd) {
                popup.setLngLat(e.lngLat).setHTML(`
                    <div style="font-family: Jost, sans-serif; padding: 4px; min-width: 170px;">
                      <div style="font-weight: 900; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase; font-size: 13px;">${p.municipio || p.name}</div>
                      <div style="display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 11px; font-weight: 700;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;"></span>
                        Não consorciado
                      </div>
                    </div>
                `).addTo(mapa);
                return;
            }

            const valChaveFmt = p.val_cluster === -9999 ? '-' : formatarValorAmigavel(p.val_cluster, siglaChave);
            let hoverRows = '';

            if (p.hover_data) {
                const arr = JSON.parse(p.hover_data);
                hoverRows = arr.slice(0, 4).map(item => `
                    <div style="font-size: 11px; margin-top: 6px;">
                      <span style="color:#64748b; font-weight:700;">${item.nome}:</span> 
                      <span style="color:#0C2856; font-weight:800;">${item.valorFmt}</span>
                    </div>
                `).join('');
            }

            let arranjoTag = '';
            if (cNum === 0 && p.arranjo_nome) {
                const badgeText = isCons ? 'Consorciado' : 'RD Selecionada';
                const badgeRD = p.pertence_rd ? `<span style="background:#0C2856; color:#fff; font-size:9px; padding:2px 6px; border-radius:10px; margin-left:4px;">${badgeText}</span>` : '';
                arranjoTag = `<div style="font-size: 10px; color: #8E44AD; font-weight: 800; margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-network-wired"></i> Polo: ${p.arranjo_nome} ${badgeRD}<br/><span style="color:#64748b;">Nível: ${p.hierarquia || 'N/I'}</span></div>`;
            }

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px; min-width: 200px;">
                  <div style="font-weight: 900; color: #0C2856; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px; text-transform: uppercase; font-size: 13px;">${p.municipio || p.name}</div>
                  ${arranjoTag}
                  <div style="background-color: #f0f9ff; padding: 6px 8px; border-radius: 6px; border: 1px solid #bae6fd;">
                    <span style="color:#0369a1; font-weight:800; font-size: 12px;">${obterNomeAmigavel(siglaChave)}:</span> 
                    <span style="color:#0c4a6e; font-weight:900; font-size: 13px;">${valChaveFmt}</span>
                  </div>
                  <div style="margin-top: 8px; padding-top: 4px;">
                    ${hoverRows}
                  </div>
                </div>
            `).addTo(mapa);
        };

        mapa.on('mousemove', 'rd_cluster_fill_' + containerId, actOnMouseMove);
        mapa.on('mouseleave', 'rd_cluster_fill_' + containerId, () => { mapa.getCanvas().style.cursor = ''; popup.remove(); });

        fitBounds(mapa);
        ocultarSpinnerRD(`rd_spinner_map_cluster${cNum}`);
    });

    setInst(mapa);
}

function renderizarMatrizMunicipiosRD(muns, ind) {
    const dadosMatriz = muns.map(m => {
        const normName = String(m.municipio || '').toUpperCase().trim();
        const getInd = (s) => {
            const arr = ind.filter(i => {
                const matchMun = (m.ibge6 && i.ibge6 && String(i.ibge6).slice(0, 6) === String(m.ibge6).slice(0, 6)) || normText(i.nm_municipio) === normName;
                if (!matchMun) return false;
                if (s === 'capag') {
                    return String(i.nm_indicador || '').toLowerCase().trim() === 'capag' || String(i.sigla_indicador || '').toLowerCase().trim() === 'capag';
                }
                return String(i.sigla_indicador || '').toLowerCase().trim() === s;
            }).sort((a, b) => b.ano - a.ano);
            if (arr.length) return arr[0].indicador;
            if (s === 'capag' && (m.capag || m.CAPAG) && String(m.capag || m.CAPAG).trim() !== 'n.d.') {
                return String(m.capag || m.CAPAG).trim().toUpperCase();
            }
            return '-';
        };

        return {
            municipio: m.municipio,
            pop: parseFloat(m.pop_2026) || 0,
            pibpc: formatarValorAmigavel(getInd('pibpc'), 'pibpc'),
            capag: getInd('capag'),
            ivcad: formatarValorAmigavel(getInd('ivcad'), 'ivcad'),
            idhm: formatarValorAmigavel(getInd('idhm'), 'idhm'),
            mvi: formatarValorAmigavel(getInd('mvi'), 'mvi'),
            ideb: formatarValorAmigavel(getInd('ideb_5ano'), 'ideb_5ano')
        };
    });

    if ($.fn.DataTable.isDataTable('#rd_tabela_matriz_municipios') && dtMatrizRD) {
        dtMatrizRD.clear().rows.add(dadosMatriz).draw(false);
    } else {
        dtMatrizRD = $('#rd_tabela_matriz_municipios').DataTable({
            data: dadosMatriz,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
            pageLength: 10,
            columns: [
                { title: "Município", data: "municipio", className: "fw-bold text-dark" },
                { title: "População (2026)", data: "pop", render: d => d.toLocaleString('pt-BR') },
                { title: "PIB Per Capita", data: "pibpc" },
                { title: "CAPAG", data: "capag", render: d => `<span class="badge ${d === 'A' ? 'bg-success' : (d === 'B' ? 'bg-warning text-dark' : 'bg-secondary')}">${d}</span>` },
                { title: "IVCAD", data: "ivcad" },
                { title: "IDHM", data: "idhm" },
                { title: "MVI (Homicídios)", data: "mvi" },
                { title: "IDEB (Anos Iniciais)", data: "ideb" }
            ]
        });
    }
    ocultarSpinnerRD('rd_spinner_matriz');
}