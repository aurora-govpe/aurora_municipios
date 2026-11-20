// www/js/ficha.js

/* ==========================================================================
   ESTILO BASE DE MAPAS (Livre de Marca d'água e API Key)
   ========================================================================== */
window.obterEstiloBaseMapa = function () {
    return {
        version: 8,
        sources: {
            'esri-gray': {
                type: 'raster',
                tiles: [
                    'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: '&copy; Esri'
            }
        },
        layers: [
            {
                id: 'background',
                type: 'background',
                paint: { 'background-color': '#f8fafc' }
            },
            {
                id: 'esri-gray-layer',
                type: 'raster',
                source: 'esri-gray',
                minzoom: 0,
                maxzoom: 18
            }
        ]
    };
};

/* ==========================================================================
   1. ESTADO GLOBAL E INSTÂNCIAS
   ========================================================================== */
var mapFicha = null;
var mapDemografiaFicha = null;
var mapSociaisFicha = null;
var mapEducacaoFicha = null;
var mapSaudeFicha = null;
var mapCadUnicoFicha = null;
var mapSaneamentoFicha = null;
// var mapTransfFicha = null;
var mapInovacaoFicha = null;
var mapComercioFicha = null;
var mapConectividadeFicha = null;
var mapTrabalhoFicha = null;

var dadosBrutosFicha = [];
var dtFichaIniciativas = null;
var dtFichaConvenios = null;
var dtFichaEmendas = null;
var dtMetadados = null;

window.dadosMetadados = [];
window.diagnosticoRegional = null;
window.fontesReferenciaRegional = null;


let dataTableHabitacao = null;
let dataTableRegularizacao = null;
window.municipioHabitacaoFiltro = null;

// Dicionário canônico de classificação populacional de todos os 185 municípios de PE (estimativa 2026)
window.popRanks = {
    "recife": 1, "jaboatão dos guararapes": 2, "petrolina": 3, "caruaru": 4, "paulista": 5, "olinda": 6, "cabo de santo agostinho": 7, "camaragibe": 8, "garanhuns": 9, "vitória de santo antão": 10, "igarassu": 11, "são lourenço da mata": 12, "ipojuca": 13, "santa cruz do capibaribe": 14, "abreu e lima": 15, "serra talhada": 16, "gravatá": 17, "araripina": 18, "goiana": 19, "belo jardim": 20, "carpina": 21, "arcoverde": 22, "ouricuri": 23, "surubim": 24, "salgueiro": 25, "pesqueira": 26, "bezerros": 27, "escada": 28, "paudalho": 29, "limoeiro": 30, "moreno": 31, "palmares": 32, "buíque": 33, "brejo da madre de deus": 34, "são bento do una": 35, "timbaúba": 36, "bom conselho": 37, "toritama": 38, "águas belas": 39, "afogados da ingazeira": 40, "santa maria da boa vista": 41, "lajedo": 42, "barreiros": 43, "custódia": 44, "são caetano": 45, "bom jardim": 46, "bonito": 47, "sirinhaém": 48, "aliança": 49, "são josé do belmonte": 50, "itambé": 51, "petrolândia": 52, "bodocó": 53, "itaíba": 54, "sertânia": 55, "exu": 56, "ribeirão": 57, "catende": 58, "são josé do egito": 59, "trindade": 60, "nazaré da mata": 61, "cabrobó": 62, "floresta": 63, "ipubi": 64, "caetés": 65, "glória do goitá": 66, "tupanatinga": 67, "itapissuma": 68, "passira": 69, "pombos": 70, "tabira": 71, "joão alfredo": 72, "ibimirim": 73, "inajá": 74, "água preta": 75, "vicência": 76, "manari": 77, "ilha de itamaracá": 78, "taquaritinga do norte": 79, "condado": 80, "canhotinho": 81, "lagoa grande": 82, "são joão": 83, "tacaratu": 84, "tamandaré": 85, "agrestina": 86, "macaparana": 87, "cupira": 88, "pedra": 89, "vertentes": 90, "panelas": 91, "orobó": 92, "feira nova": 93, "riacho das almas": 94, "chã grande": 95, "altinho": 96, "cachoeirinha": 97, "flores": 98, "são joaquim do monte": 99, "rio formoso": 100, "araçoiaba": 101, "lagoa de itaenga": 102, "carnaíba": 103, "são josé da coroa grande": 104, "afrânio": 105, "parnamirim": 106, "lagoa do carro": 107, "capoeiras": 108, "serrita": 109, "sanharó": 110, "belém do são francisco": 111, "amaraji": 112, "camocim de são félix": 113, "dormentes": 114, "correntes": 115, "venturosa": 116, "iati": 117, "quipapá": 118, "gameleira": 119, "são vicente férrer": 120, "itaquitinga": 121, "jataúba": 122, "cumaru": 123, "ferreiros": 124, "jupi": 125, "triunfo": 126, "santa maria do cambucá": 127, "mirandiba": 128, "jatobá": 129, "tracunhaém": 130, "alagoinha": 131, "primavera": 132, "tacaimbó": 133, "santa cruz": 134, "lagoa dos gatos": 135, "itapetim": 136, "orocó": 137, "saloá": 138, "frei miguelinho": 139, "jurema": 140, "buenos aires": 141, "chã de alegria": 142, "casinhas": 143, "são benedito do sul": 144, "joaquim nabuco": 145, "paranatama": 146, "carnaubeira da penha": 147, "barra de guabiraba": 148, "lagoa do ouro": 149, "santa filomena": 150, "jucati": 151, "betânia": 152, "santa cruz da baixa verde": 153, "xexéu": 154, "calçado": 155, "iguaracy": 156, "machados": 157, "sairé": 158, "cedro": 159, "moreilândia": 160, "poção": 161, "belém de maria": 162, "angelim": 163, "santa terezinha": 164, "jaqueira": 165, "cortês": 166, "verdejante": 167, "brejão": 168, "terra nova": 169, "maraial": 170, "tuparetama": 171, "brejinho": 172, "camutanga": 173, "vertente do lério": 174, "ibirajuba": 175, "granito": 176, "palmeirina": 177, "terezinha": 178, "quixaba": 179, "solidão": 180, "salgadinho": 181, "calumbi": 182, "ingazeira": 183, "itacuruba": 184, "fernando de noronha": 185
};

window.obterRankPopulacao = function(nomeMun) {
    if (!nomeMun) return '-';
    const norm = String(nomeMun).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const k in window.popRanks) {
        const kNorm = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (kNorm === norm) return window.popRanks[k];
    }
    return '-';
};

function configurarStickyNavbarMetrics() {
    // Revertido a pedido: métricas de pop e pib não poluem mais a navbar
}

// Cores oficiais do CAPAG (conforme Modelo Objeto 1)
const CAPAG_CORES = {
    'A': '#92D050',
    'A+': '#70AD47',
    'B': '#00A8A8',
    'B+': '#00B0B9',
    'C': '#C55A11',
    'D': '#843C0C',
    'N.D.': '#595959',
    'N.E.': '#404040'
};

function obterCorCapag(nota) {
    if (!nota) return '#595959';
    const n = String(nota).trim().toUpperCase();
    if (CAPAG_CORES[n]) return CAPAG_CORES[n];
    if (n.startsWith('A+')) return CAPAG_CORES['A+'];
    if (n.startsWith('A')) return CAPAG_CORES['A'];
    if (n.startsWith('B+')) return CAPAG_CORES['B+'];
    if (n.startsWith('B')) return CAPAG_CORES['B'];
    if (n.startsWith('C')) return CAPAG_CORES['C'];
    if (n.startsWith('D')) return CAPAG_CORES['D'];
    if (n.includes('E')) return CAPAG_CORES['N.E.'];
    return CAPAG_CORES['N.D.'];
}

var cacheSociaisRD = {
    geojsonRD: null,
    demografiaRD: [],
    indicadoresRD: [],
    iniciativasRD: [],
    pcpRD: [],
    nomeMun: ''
};

var metricaDemografiaAtiva = 'rd_pop';
var metricaSocialAtiva = 'mvi_abs';
var metricaEducacaoAtiva = 'ideb_5ano';
var metricaSaudeAtiva = 'pre_natal';
var metricaCadUnicoAtiva = 'cad_pessoas';
var metricaSaneamentoAtiva = 'pct_agua_rede';
var metricaTrabalhoAtiva = '';
// var metricaTransfAtiva = 'maes_qtd';
var metricaInovacaoAtiva = '';
var metricaComercioAtiva = '';
var metricaConectividadeAtiva = '';

// Helper universal no ficha.js para parsear GeoJSON com segurança
function obterGeoJSONSeguro(geoInput) {
    if (!geoInput) return null;
    if (typeof geoInput === 'object') return geoInput;
    try {
        return JSON.parse(geoInput);
    } catch (e) {
        console.error("Erro ao parsear GeoJSON:", e);
        return null;
    }
}

window.renderizarBadgeDataAtualizacao = function (txtAtualizacao) {
    var texto = Array.isArray(txtAtualizacao) ? txtAtualizacao[0] : txtAtualizacao;
    if (!texto) return;

    // Atualiza apenas o texto mantendo o card sempre visível na tela
    $('#ficha_data_atualizacao_txt').text(texto);
    $('#landing_data_atualizacao_txt').text(texto);
};

/* ==========================================================================
   2. FUNÇÕES HELPERS E UTILITÁRIOS
   ========================================================================== */
function eCoordenadaContinental(coord) {
    if (!Array.isArray(coord) || coord.length < 2) return false;
    return coord[0] < -34.0 && coord[1] < -7.0;
}

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

function iniciarDraggableNav() {
    // Mantido por compatibilidade funcional (Menu integrado na navbar)
    return;
}

function obterTextoPolaridade(sigla) {
    if (!sigla || !window.dadosMetadados) return '<span class="text-slate-400 font-medium">-</span>';
    
    const normKey = (str) => String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const siglaNorm = normKey(sigla);

    const meta = window.dadosMetadados.find(m => 
        normKey(m.cd_indicador) === siglaNorm || normKey(m.nm_indicador) === siglaNorm
    );
    
    if (!meta || !meta.referencia_analise) return '<span class="text-slate-400 font-medium">-</span>';
    
    const dirRaw = String(
        meta.referencia_analise.direcao_desejavel || 
        meta.direcao_desejavel || ''
    ).trim();

    const dir = dirRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!dir || dir === '-' || dir === 'n/a') return '<span class="text-slate-400 font-medium">-</span>';

    // 1. Contextual / Estrutural / Acompanhamento
    if (dir.includes('acompanhamento') || dir.includes('vocacao') || dir.includes('estabilidade') || dir.includes('faixa') || dir.includes('manter') || dir.includes('informativo') || dir.includes('contextual') || dir.includes('neutro')) {
        return `<span class="kpi-txt-pol kpi-pol-neutra" title="Indicador Estrutural / Contextual: ${dirRaw}"><i class="fas fa-circle-info me-1"></i>Contextual</span>`;
    } 
    // 2. Maior melhor (Aumento)
    else if (dir.includes('aumento') || dir.includes('maior') || dir.includes('crescimento')) {
        return `<span class="kpi-txt-pol kpi-pol-alta" title="Direção desejável: Quanto maior, melhor"><i class="fas fa-arrow-trend-up me-1"></i>Maior melhor</span>`;
    } 
    // 3. Menor melhor (Redução)
    else if (dir.includes('reducao') || dir.includes('menor') || dir.includes('queda')) {
        return `<span class="kpi-txt-pol kpi-pol-baixa" title="Direção desejável: Quanto menor, melhor"><i class="fas fa-arrow-trend-down me-1"></i>Menor melhor</span>`;
    }

    return `<span class="kpi-txt-pol kpi-pol-neutra" title="Indicador Contextual: ${dirRaw}"><i class="fas fa-circle-info me-1"></i>Contextual</span>`;
}

window.obterBadgePolaridade = obterTextoPolaridade;
window.obterTextoPolaridade = obterTextoPolaridade;

window.getRankTexto = function(rank) {
    if (!rank || rank === '-' || rank === 'n/a' || isNaN(Number(rank))) {
        return '<span class="text-slate-400 font-medium">-</span>';
    }
    return `<span class="kpi-txt-rank" title="Posição relativa em Pernambuco">${rank}º em PE</span>`;
};

window.getRankBadge = window.getRankTexto;

window.montarRodapeKPI = function(grandeza, refAno, rank, siglaPolaridade) {
    const grandezaLimpa = (grandeza && grandeza !== '-' && grandeza !== 'n.d.') ? String(grandeza).trim() : '';
    const grandezaHtml = grandezaLimpa 
        ? `<span class="kpi-txt-grandeza truncate" title="${grandezaLimpa}">${grandezaLimpa}</span>` 
        : '<span class="text-slate-400 font-medium">-</span>';

    const refAnoLimpo = (refAno && refAno !== '-' && refAno !== 'n.d.') ? String(refAno).trim() : '';
    const refHtml = refAnoLimpo 
        ? `<span class="kpi-txt-ref">REF: ${refAnoLimpo}</span>` 
        : '<span class="text-slate-400 font-medium">-</span>';

    const rankHtml = window.getRankTexto(rank);
    const polHtml = window.obterTextoPolaridade(siglaPolaridade);

    return `
        <div class="kpi-footer-grid">
            <div class="kpi-footer-cell-left">
                ${grandezaHtml}
            </div>
            <div class="kpi-footer-cell-right">
                ${refHtml}
            </div>
            <div class="kpi-footer-cell-left">
                ${rankHtml}
            </div>
            <div class="kpi-footer-cell-right">
                ${polHtml}
            </div>
        </div>
    `;
};

/* ==========================================================================
   3. CONTROLES DE INTERFACE E ALTERNÂNCIA DE MÉTRICAS (MAPAS)
   ========================================================================== */

/* ==========================================================================
   NOVO: NAVEGAÇÃO POR ATALHOS DA FICHA MUNICIPAL
   ========================================================================== */
window.rolarParaSecaoFicha = function(secaoId) {
    try {
        const el = document.getElementById(secaoId);
        if (!el) {
            console.warn("[Atalhos] Seção não encontrada:", secaoId);
            return;
        }

        // Se o bloco detalhado estiver oculto e o alvo estiver dentro dele, exibe-o
        const $detalhadas = $('#ficha_bloco_secoes_detalhadas');
        if ($detalhadas.length && ($detalhadas.is(':hidden') || $detalhadas.hasClass('d-none')) && $(el).closest('#ficha_bloco_secoes_detalhadas').length) {
            $detalhadas.removeClass('d-none').show();
            $('#btn_toggle_secoes_detalhadas').text('Ocultar Seções Detalhadas');
        }

        // Suporte robusto para scroll em containers internos (como .aurora-content-area) e no window
        const contentArea = document.querySelector('.aurora-content-area');
        if (contentArea) {
            const elRect = el.getBoundingClientRect();
            const parentRect = contentArea.getBoundingClientRect();
            const targetScrollTop = contentArea.scrollTop + (elRect.top - parentRect.top) - 75;
            contentArea.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                window.scrollBy({ top: -75, behavior: 'smooth' });
            }, 50);
        }

        // Destaque visual suave temporário
        $(el).addClass('ring-2 ring-orange-400 ring-offset-2 transition-all');
        setTimeout(() => {
            $(el).removeClass('ring-2 ring-orange-400 ring-offset-2');
        }, 1800);
    } catch(e) {
        console.error("[Atalhos] Erro ao rolar para seção:", e);
    }
};

/* ==========================================================================
   NOVO: CATÁLOGO MULTIDIMENSIONAL (DIMENSÕES -> SUBDIMENSÕES -> INDICADORES)
   ========================================================================== */
window.CATALOGO_MAPA_MULTIDIMENSIONAL = {
    "demografia": {
        nome: "Demografia & Dinâmica Populacional",
        icone: "fa-users",
        subdimensoes: {
            "estrutura_etaria": {
                nome: "Estrutura Etária & Dependência",
                indicadores: [
                    { sigla: "rd_pop", nome: "Razão de Dependência Total", tipo: "índice", pol: "negativa" },
                    { sigla: "rd_jovem", nome: "Razão de Dependência Jovem", tipo: "índice", pol: "negativa" },
                    { sigla: "rd_idosa", nome: "Razão de Dependência Idosa", tipo: "índice", pol: "negativa" },
                    { sigla: "pct_pia", nome: "Peso da Pop. em Idade Ativa (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "ind_envelhecimento", nome: "Índice de Envelhecimento", tipo: "índice", pol: "negativa" },
                    { sigla: "pct_longevidade", nome: "Taxa de Superlongevidade (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "ind_ir_pia", nome: "Índice de Renovação da PIA", tipo: "índice", pol: "positiva" },
                    { sigla: "pct_jovem", nome: "Peso Relativo da Juventude (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "ind_renov_trabalho", nome: "Razão de Renovação do Trabalho", tipo: "índice", pol: "positiva" }
                ]
            },
            "populacao_territorio": {
                nome: "Dinâmica Territorial & Povos Tradicionais",
                indicadores: [
                    { sigla: "densidade_demografica", nome: "Densidade Demográfica (hab/km²)", tipo: "absoluto", pol: "neutra" },
                    { sigla: "pop_quilombola", nome: "População Quilombola", tipo: "absoluto", pol: "positiva" },
                    { sigla: "pop_indigena", nome: "População Indígena", tipo: "absoluto", pol: "positiva" },
                    { sigla: "perc_pop_urb", nome: "Taxa de Urbanização (%)", tipo: "percentual", pol: "neutra" },
                    { sigla: "perc_pop_rur", nome: "População Rural (%)", tipo: "percentual", pol: "neutra" }
                ]
            }
        }
    },
    "sociais": {
        nome: "Indicadores Sociais",
        icone: "fa-shield-halved",
        subdimensoes: {
            "seguranca": {
                nome: "Segurança Pública",
                indicadores: [
                    { sigla: "mvi_taxa", nome: "Taxa de MVI (por 100k hab.)", tipo: "taxa", pol: "negativa" },
                    { sigla: "mvi", nome: "Mortes Violentas Intencionais (Absoluto)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "cvp_taxa", nome: "Taxa de CVP (por 100k hab.)", tipo: "taxa", pol: "negativa" },
                    { sigla: "cvp", nome: "Crimes Violentos contra o Patrimônio (Abs.)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "feminicidio", nome: "Feminicídios", tipo: "absoluto", pol: "negativa" },
                    { sigla: "tent_mvi", nome: "Tentativas de MVI", tipo: "absoluto", pol: "negativa" },
                    { sigla: "rfv", nome: "Resolução Funcional Violenta (RFV)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "vcm_ameaca", nome: "Violência contra Mulher - Ameaças", tipo: "absoluto", pol: "negativa" },
                    { sigla: "vcm_lesao", nome: "Violência contra Mulher - Lesões", tipo: "absoluto", pol: "negativa" },
                    { sigla: "vcm_vs", nome: "Violência contra Mulher - Sexual", tipo: "absoluto", pol: "negativa" }
                ]
            },
            "educacao": {
                nome: "Educação Básica",
                indicadores: [
                    { sigla: "ideb_5ano", nome: "IDEB - Anos Iniciais (5º ano)", tipo: "índice", pol: "positiva" },
                    { sigla: "ideb_9ano", nome: "IDEB - Anos Finais (9º ano)", tipo: "índice", pol: "positiva" },
                    { sigla: "tdi_5ano", nome: "Distorção Idade-Série - 5º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "tdi_9ano", nome: "Distorção Idade-Série - 9º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "apr_5ano", nome: "Taxa de Aprovação - 5º ano (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "apr_9ano", nome: "Taxa de Aprovação - 9º ano (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "rep_5ano", nome: "Taxa de Reprovação - 5º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "rep_9ano", nome: "Taxa de Reprovação - 9º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "aba_5ano", nome: "Taxa de Abandono - 5º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "aba_9ano", nome: "Taxa de Abandono - 9º ano (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "mat_6_10", nome: "Matrículas (6 a 10 anos)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "mat_11_14", nome: "Matrículas (11 a 14 anos)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "perc_mat_int", nome: "Matrículas em Tempo Integral (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "perc_alfabetizacao", nome: "Alfabetização na Idade Certa (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "atliq_creche", nome: "Atendimento Líquido em Creche (%)", tipo: "percentual", pol: "positiva" }
                ]
            },
            "saude": {
                nome: "Saúde Pública",
                indicadores: [
                    { sigla: "pre_natal", nome: "Cobertura de Pré-Natal (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "razao_mm", nome: "Razão de Mortalidade Materna", tipo: "taxa", pol: "negativa" },
                    { sigla: "tx_att", nome: "Taxa de Acidentes de Trânsito (ATT)", tipo: "taxa", pol: "negativa" },
                    { sigla: "tx_dcnt", nome: "Mortalidade DCNT", tipo: "taxa", pol: "negativa" },
                    { sigla: "tx_evitaveis", nome: "Mortalidade Causas Evitáveis", tipo: "taxa", pol: "negativa" },
                    { sigla: "tx_infancia", nome: "Mortalidade na Infância", tipo: "taxa", pol: "negativa" },
                    { sigla: "tx_infantil", nome: "Mortalidade Infantil", tipo: "taxa", pol: "negativa" }
                ]
            }
        }
    },
    "vulnerabilidade_saneamento": {
        nome: "Vulnerabilidade & Saneamento",
        icone: "fa-faucet-droplet",
        subdimensoes: {
            "vulnerabilidade": {
                nome: "CadÚnico & Transferência de Renda",
                indicadores: [
                    { sigla: "indice_gini", nome: "Índice de Gini", tipo: "índice", pol: "negativa" },
                    { sigla: "cad_pessoas", nome: "População no CadÚnico (Pessoas)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "tx_cad_pessoas", nome: "Taxa de População no CadÚnico (%)", tipo: "percentual", pol: "negativa" },
                    { sigla: "ivcad", nome: "Índice de Vulnerabilidade (IVCAD)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_nc", nome: "IVCAD - Necessidade de Cuidados (NC)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_dpi", nome: "IVCAD - Desenv. Primeira Infância (DPI)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_dca", nome: "IVCAD - Desenv. Crianças/Adolescentes (DCA)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_tqa", nome: "IVCAD - Trabalho Infantil (TQA)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_dr", nome: "IVCAD - Desproteção de Renda (DR)", tipo: "índice", pol: "negativa" },
                    { sigla: "ivcad_ch", nome: "IVCAD - Condições Habitacionais (CH)", tipo: "índice", pol: "negativa" },
                    { sigla: "maes_qtd", nome: "Beneficiárias Mães de Pernambuco", tipo: "absoluto", pol: "positiva" },
                    { sigla: "pcp_qtd", nome: "Beneficiários Chapéu de Palha", tipo: "absoluto", pol: "positiva" }
                ]
            },
            "saneamento": {
                nome: "Saneamento Básico & Água",
                indicadores: [
                    { sigla: "pct_agua_rede", nome: "Abastecimento de Água da Rede Geral (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "pct_esgoto_rede", nome: "Esgotamento Sanitário em Rede (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "agua_rede", nome: "Domicílios com Água da Rede (Abs.)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "agua_poco", nome: "Domicílios com Água de Poço", tipo: "absoluto", pol: "neutra" },
                    { sigla: "agua_cisterna", nome: "Domicílios com Cisterna", tipo: "absoluto", pol: "neutra" }
                ]
            }
        }
    },
    "economia_trabalho": {
        nome: "Economia, Trabalho & Tecnologia",
        icone: "fa-briefcase",
        subdimensoes: {
            "macroeconomia": {
                nome: "Macroeconomia & VAB",
                indicadores: [
                    { sigla: "pib_1000", nome: "PIB Total (R$ 1.000)", tipo: "moeda", pol: "positiva" },
                    { sigla: "pibpc", nome: "PIB per capita (R$)", tipo: "moeda", pol: "positiva" },
                    { sigla: "pib_pct", nome: "Participação no PIB Estadual (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "idhm", nome: "IDHM", tipo: "índice", pol: "positiva" },
                    { sigla: "vab_agro", nome: "VAB Agropecuária (% do VAB)", tipo: "percentual", pol: "neutra" },
                    { sigla: "vab_ind", nome: "VAB Indústria (% do VAB)", tipo: "percentual", pol: "neutra" },
                    { sigla: "vab_serv", nome: "VAB Serviços (% do VAB)", tipo: "percentual", pol: "neutra" },
                    { sigla: "vab_adm", nome: "VAB Administração Pública (% do VAB)", tipo: "percentual", pol: "neutra" }
                ]
            },
            "trabalho": {
                nome: "Mercado de Trabalho Formal",
                indicadores: [
                    { sigla: "estab_total", nome: "Estabelecimentos Formais (Total)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_total", nome: "Empregados Formais (Total)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "estab_agro", nome: "Estabelecimentos Agropecuários", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_agro", nome: "Empregos no Setor Agropecuário", tipo: "absoluto", pol: "positiva" },
                    { sigla: "estab_ind", nome: "Estabelecimentos Industriais", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_ind", nome: "Empregos no Setor Industrial", tipo: "absoluto", pol: "positiva" },
                    { sigla: "estab_serv", nome: "Estabelecimentos de Serviços", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_serv", nome: "Empregos no Setor de Serviços", tipo: "absoluto", pol: "positiva" }
                ]
            },
            "conectividade": {
                nome: "Conectividade & Telecomunicações",
                indicadores: [
                    { sigla: "ibc_anatel", nome: "Índice de Conectividade Anatel (IBC)", tipo: "índice", pol: "positiva" },
                    { sigla: "cob_pop_4g5g", nome: "Cobertura 4G/5G da População (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "cob_fibra", nome: "Cobertura de Fibra Óptica (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "dens_scm", nome: "Densidade de Banda Larga Fixa", tipo: "taxa", pol: "positiva" },
                    { sigla: "dens_smp", nome: "Densidade Móvel (SMP)", tipo: "taxa", pol: "positiva" },
                    { sigla: "adens_estacoes", nome: "Adensamento de Antenas/ERBs", tipo: "taxa", pol: "positiva" }
                ]
            },
            "inovacao": {
                nome: "Economia da Inovação",
                indicadores: [
                    { sigla: "estab_alta_tec", nome: "Estabelecimentos de Alta-Tech", tipo: "absoluto", pol: "positiva" },
                    { sigla: "pct_emp_alta_tec", nome: "Empregados em Alta-Tech (%)", tipo: "percentual", pol: "positiva" },
                    { sigla: "emp_me_do", nome: "Empregados Mestres e Doutores", tipo: "absoluto", pol: "positiva" },
                    { sigla: "sal_avg_sup", nome: "Média Salarial (Superior)", tipo: "moeda", pol: "positiva" },
                    { sigla: "sal_avg_me_do", nome: "Média Salarial (Mestres/Doutores)", tipo: "moeda", pol: "positiva" },
                    { sigla: "pct_emp_infocom", nome: "Empregados em TI/InfoCom (%)", tipo: "percentual", pol: "positiva" }
                ]
            },
            "comex": {
                nome: "Comércio Exterior",
                indicadores: [
                    { sigla: "exp_total", nome: "Exportações Totais (US$ FOB)", tipo: "moeda", pol: "positiva" },
                    { sigla: "imp_total", nome: "Importações Totais (US$ FOB)", tipo: "moeda", pol: "positiva" },
                    { sigla: "exp_alta_tec", nome: "Exportações de Alta-Tech (US$ FOB)", tipo: "moeda", pol: "positiva" },
                    { sigla: "pct_exp_alta_tec", nome: "Exportações de Alta-Tech (%)", tipo: "percentual", pol: "positiva" }
                ]
            },
            "dinamica_empresarial": {
                nome: "Dinâmica das Empresas (SEPLAG)",
                indicadores: [
                    { sigla: "emp_empresas_por_mil_hab", nome: "Densidade Empresarial (Empresas / 1.000 hab.)", tipo: "taxa", pol: "positiva" },
                    { sigla: "emp_taxa_meizacao", nome: "Taxa de MEIzação (%)", tipo: "percentual", pol: "neutra" },
                    { sigla: "emp_saldo_12m", nome: "Saldo de Empresas nos Últimos 12 Meses", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_total_ativas", nome: "Total de Estabelecimentos Ativos", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_total_mei", nome: "Total de MEIs Ativos", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_aberturas_12m", nome: "Novas Empresas Abertas (12 Meses)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "emp_fechamentos_12m", nome: "Empresas Fechadas (12 Meses)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "emp_idade_media_ativas", nome: "Idade Média do Parque Empresarial (Anos)", tipo: "taxa", pol: "positiva" },
                    { sigla: "emp_capital_social_total", nome: "Capital Social Total (R$)", tipo: "moeda", pol: "positiva" }
                ]
            },
            "agricultura_estiagem": {
                nome: "Agricultura & Estiagem (IBGE PAM)",
                indicadores: [
                    { sigla: "agri_valor_producao", nome: "Valor da Produção Agrícola (R$ mil)", tipo: "moeda", pol: "positiva" },
                    { sigla: "agri_area_colhida", nome: "Área Agrícola Colhida (ha)", tipo: "absoluto", pol: "positiva" }
                ]
            }
        }
    },
    "fiscal": {
        nome: "Gestão Fiscal & Governança (CAPAG)",
        icone: "fa-building-columns",
        subdimensoes: {
            "capag": {
                nome: "Capacidade de Pagamento (STN)",
                indicadores: [
                    { sigla: "capag", nome: "Classificação CAPAG (Nota Final)", tipo: "ordinal", pol: "positiva" },
                    { sigla: "capag_indicador_1", nome: "CAPAG - Indicador 1 (Endividamento)", tipo: "absoluto", pol: "negativa" },
                    { sigla: "capag_nota_1", nome: "CAPAG - Nota 1 (Endividamento)", tipo: "ordinal", pol: "positiva" },
                    { sigla: "capag_indicador_2", nome: "CAPAG - Indicador 2 (Poupança)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "capag_nota_2", nome: "CAPAG - Nota 2 (Poupança)", tipo: "ordinal", pol: "positiva" },
                    { sigla: "capag_indicador_3", nome: "CAPAG - Indicador 3 (Liquidez)", tipo: "absoluto", pol: "positiva" },
                    { sigla: "capag_nota_3", nome: "CAPAG - Nota 3 (Liquidez)", tipo: "ordinal", pol: "positiva" }
                ]
            }
        }
    }
};

/* ==========================================================================
   NOVO: CONTROLADOR DO MAPA MULTIDIMENSIONAL UNIFICADO (184 MUNICÍPIOS)
   ========================================================================== */
let mapaMultiInstance = null;
let popupMultiInstance = null;
let mapaMultiDimensaoAtiva = "demografia";
let mapaMultiSubdimensaoAtiva = "estrutura_etaria";
let mapaMultiIndicadorAtivo = "rd_pop";
let cacheMapaIndicador = {};
let geoJSONEstadualPE = null;
let municipioEmTelaAtual = "";
let rdEmTelaAtual = "";
let cacheDadosIndicadorAtual = null;

window.inicializarControlesMapaMulti = function() {
    const $selDim = $('#mapa_multi_f_dimensao');
    if (!$selDim.length || $selDim.find('option').length > 0) return;

    $selDim.empty();
    Object.keys(window.CATALOGO_MAPA_MULTIDIMENSIONAL).forEach(kDim => {
        const item = window.CATALOGO_MAPA_MULTIDIMENSIONAL[kDim];
        $selDim.append(`<option value="${kDim}">${item.nome}</option>`);
    });

    $selDim.val(mapaMultiDimensaoAtiva);
    window.mapaMultiMudarDimensao(mapaMultiDimensaoAtiva, false);
};

window.mapaMultiMudarDimensao = function(kDim, dispararCarregamento = true) {
    mapaMultiDimensaoAtiva = kDim;
    const dimObj = window.CATALOGO_MAPA_MULTIDIMENSIONAL[kDim];
    if (!dimObj) return;

    const $selDim = $('#mapa_multi_f_dimensao');
    if ($selDim.length && $selDim.val() !== kDim) {
        $selDim.val(kDim);
    }

    const $selSub = $('#mapa_multi_f_subdimensao');
    $selSub.empty();

    const subChaves = Object.keys(dimObj.subdimensoes);
    subChaves.forEach(kSub => {
        $selSub.append(`<option value="${kSub}">${dimObj.subdimensoes[kSub].nome}</option>`);
    });

    mapaMultiSubdimensaoAtiva = subChaves[0];
    $selSub.val(mapaMultiSubdimensaoAtiva);
    window.mapaMultiMudarSubdimensao(mapaMultiSubdimensaoAtiva, dispararCarregamento);
};

window.mapaMultiMudarSubdimensao = function(kSub, dispararCarregamento = true) {
    mapaMultiSubdimensaoAtiva = kSub;
    const dimObj = window.CATALOGO_MAPA_MULTIDIMENSIONAL[mapaMultiDimensaoAtiva];
    if (!dimObj || !dimObj.subdimensoes[kSub]) return;

    const $selSub = $('#mapa_multi_f_subdimensao');
    if ($selSub.length && $selSub.val() !== kSub) {
        $selSub.val(kSub);
    }

    const subObj = dimObj.subdimensoes[kSub];
    const $selInd = $('#mapa_multi_f_indicador');
    $selInd.empty();

    (subObj.indicadores || []).forEach(ind => {
        $selInd.append(`<option value="${ind.sigla}">${ind.nome}</option>`);
    });

    if (subObj.indicadores && subObj.indicadores.length > 0) {
        mapaMultiIndicadorAtivo = subObj.indicadores[0].sigla;
        $selInd.val(mapaMultiIndicadorAtivo);
    }

    if (dispararCarregamento) {
        window.carregarERenderizarMapaMulti();
    }
};

window.mapaMultiMudarIndicador = function(sigla) {
    mapaMultiIndicadorAtivo = sigla;
    const $selInd = $('#mapa_multi_f_indicador');
    if ($selInd.length && $selInd.val() !== sigla) {
        $selInd.val(sigla);
    }
    window.carregarERenderizarMapaMulti();
};

window.selecionarIndicadorNoMapa = function(sigla) {
    if (!sigla) return;
    const sLower = String(sigla).trim().toLowerCase();
    
    // Procura em CATALOGO_MAPA_MULTIDIMENSIONAL
    for (const kDim of Object.keys(window.CATALOGO_MAPA_MULTIDIMENSIONAL)) {
        const dimObj = window.CATALOGO_MAPA_MULTIDIMENSIONAL[kDim];
        for (const kSub of Object.keys(dimObj.subdimensoes)) {
            const subObj = dimObj.subdimensoes[kSub];
            const found = (subObj.indicadores || []).find(i => String(i.sigla).toLowerCase() === sLower);
            if (found) {
                mapaMultiDimensaoAtiva = kDim;
                $('#mapa_multi_f_dimensao').val(kDim);
                
                const $selSub = $('#mapa_multi_f_subdimensao');
                $selSub.empty();
                Object.keys(dimObj.subdimensoes).forEach(ks => {
                    $selSub.append(`<option value="${ks}">${dimObj.subdimensoes[ks].nome}</option>`);
                });
                mapaMultiSubdimensaoAtiva = kSub;
                $selSub.val(kSub);
                
                const $selInd = $('#mapa_multi_f_indicador');
                $selInd.empty();
                (subObj.indicadores || []).forEach(ind => {
                    $selInd.append(`<option value="${ind.sigla}">${ind.nome}</option>`);
                });
                mapaMultiIndicadorAtivo = found.sigla;
                $selInd.val(found.sigla);
                
                window.carregarERenderizarMapaMulti();
                return;
            }
        }
    }
    // Fallback caso não esteja no catálogo
    mapaMultiIndicadorAtivo = sigla;
    window.carregarERenderizarMapaMulti();
};

window.carregarERenderizarMapaMulti = async function() {
    const sigla = mapaMultiIndicadorAtivo;
    if (!sigla) return;

    $('#mapa_multi_spinner').removeClass('d-none');

    try {
        let data = cacheMapaIndicador[sigla];
        if (!data) {
            const needGeo = !geoJSONEstadualPE ? '1' : '0';
            const url = `${window.basePath || ''}/api/ficha/mapa_indicador?sigla=${encodeURIComponent(sigla)}&com_geojson=${needGeo}`.replace(/\/+/g, '/');
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erro ao consultar dados estaduais do indicador");
            data = await res.json();
            cacheMapaIndicador[sigla] = data;
        }

        if (data.geojson && !geoJSONEstadualPE) {
            geoJSONEstadualPE = typeof data.geojson === 'string' ? JSON.parse(data.geojson) : data.geojson;
        }

        cacheDadosIndicadorAtual = data;
        renderizarMapaMultiComDados(data);
    } catch(err) {
        console.error("[Mapa Multi] Falha:", err);
    } finally {
        $('#mapa_multi_spinner').addClass('d-none');
    }
};

function renderizarMapaMultiComDados(data) {
    if (!data) return;

    // 1. Atualizar badges superiores do mapa
    $('#mapa_multi_badge_ano').text(`Ano: ${data.ano || 2024}`);
    const $badgePol = $('#mapa_multi_badge_polaridade');
    if (String(data.polaridade).toLowerCase() === 'negativa') {
        $badgePol.text('Menor é Melhor').removeClass('bg-emerald-50 text-emerald-700 border-emerald-200').addClass('bg-rose-50 text-rose-700 border-rose-200');
    } else if (String(data.polaridade).toLowerCase() === 'positiva') {
        $badgePol.text('Maior é Melhor').removeClass('bg-rose-50 text-rose-700 border-rose-200').addClass('bg-emerald-50 text-emerald-700 border-emerald-200');
    } else {
        $badgePol.text('Referência Territorial').removeClass('bg-rose-50 text-rose-700 border-rose-200 bg-emerald-50 text-emerald-700 border-emerald-200').addClass('bg-slate-100 text-slate-700 border-slate-200');
    }

    // 2. Atualizar Legenda Coroplética
    $('#mapa_multi_legenda_titulo').text(data.nm_indicador || data.sigla);
    const fmtDec = (val) => {
        if (val === null || val === undefined || isNaN(val)) return '-';
        if (String(data.tipo).includes('percent')) return val.toFixed(1) + '%';
        if (String(data.tipo).includes('moeda')) {
            if (val >= 1000000) return 'R$ ' + (val/1000000).toFixed(1) + 'M';
            if (val >= 1000) return 'R$ ' + (val/1000).toFixed(0) + 'k';
            return 'R$ ' + val.toFixed(0);
        }
        return val.toFixed(1);
    };

    $('#mapa_multi_legenda_min').text(`Mín: ${fmtDec(data.min_pe)}`);
    $('#mapa_multi_legenda_med').text(`Média: ${fmtDec(data.media_pe)}`);
    $('#mapa_multi_legenda_max').text(`Máx: ${fmtDec(data.max_pe)}`);

    // 3. Atualizar Card do Município em Tela
    atualizarCardMunicipioEmTelaMulti(data);

    // 4. Inicializar ou Atualizar MapLibre GL
    const mapDom = document.getElementById('ficha_mapa_multidimensional_container');
    if (!mapDom || !geoJSONEstadualPE) return;

    const norm = (str) => String(str || '').normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
    const munAlvoNorm = norm(municipioEmTelaAtual);
    const rdAlvoNorm = norm(rdEmTelaAtual);

    // Enriquece as features com o valor atual e os status
    (geoJSONEstadualPE.features || []).forEach(f => {
        const props = f.properties || {};
        const nomeM = props.municipio || props.name || props.nome || '';
        const ibge6 = String(props.ibge6 || props.cod_ibge || '').substring(0, 6);
        const mNorm = norm(nomeM);
        const itemMun = (data.municipios && (data.municipios[mNorm] || data.municipios[nomeM] || data.municipios[ibge6])) || {};

        const isSemDado = itemMun.valor === null || itemMun.valor === undefined || 
                          itemMun.val_str === "n.d." || itemMun.val_str === "NA" || itemMun.val_str === "" ||
                          itemMun.valor_fmt === "-" || itemMun.valor_fmt === "n.d.";
        props.sem_dado = isSemDado;
        props.val_num = (!isSemDado && itemMun.valor !== null && !isNaN(itemMun.valor)) ? Number(itemMun.valor) : null;
        props.val_fmt = isSemDado ? "Sem dado" : (itemMun.valor_fmt || '-');
        props.rank_pe = itemMun.rank_pe || 0;
        props.total_pe = itemMun.total_pe || data.total_validos || 184;
        props.rank_rd = itemMun.rank_rd || 0;
        props.total_rd = itemMun.total_rd || 0;
        props.rd_nome = itemMun.rd || props.regiao_de_desenvolvimento || '';

        const rNorm = norm(props.rd_nome);

        props.is_selected = munAlvoNorm !== '' && (mNorm === munAlvoNorm);
        props.is_rd = rdAlvoNorm !== '' && (rNorm === rdAlvoNorm);
    });

    if (!mapaMultiInstance) {
        mapaMultiInstance = new maplibregl.Map({
            container: 'ficha_mapa_multidimensional_container',
            style: window.obterEstiloBaseMapa(),
            center: [-37.8, -8.3],
            zoom: 6.8,
            preserveDrawingBuffer: true
        });

        mapaMultiInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        mapaMultiInstance.on('load', () => {
            aplicarCamadasMapLibreMulti(data);
            mapaMultiInstance.resize();
        });
    } else {
        if (mapaMultiInstance.loaded()) {
            if (mapaMultiInstance.getSource('pe_muns_source')) {
                mapaMultiInstance.getSource('pe_muns_source').setData(geoJSONEstadualPE);
                atualizarCoresCamadaMulti(data);
            } else {
                aplicarCamadasMapLibreMulti(data);
            }
            mapaMultiInstance.resize();
        } else {
            mapaMultiInstance.once('load', () => {
                aplicarCamadasMapLibreMulti(data);
                mapaMultiInstance.resize();
            });
        }
    }
}

function aplicarCamadasMapLibreMulti(data) {
    if (!mapaMultiInstance || !geoJSONEstadualPE) return;

    if (!mapaMultiInstance.getSource('pe_muns_source')) {
        mapaMultiInstance.addSource('pe_muns_source', {
            type: 'geojson',
            data: geoJSONEstadualPE
        });
    }

    // Camada 1: Preenchimento Coroplético
    if (!mapaMultiInstance.getLayer('pe_mun_fill')) {
        mapaMultiInstance.addLayer({
            id: 'pe_mun_fill',
            type: 'fill',
            source: 'pe_muns_source',
            paint: {
                'fill-color': calcularExpressaoCorMulti(data),
                'fill-opacity': 0.82
            }
        });
    }

    // Camada 2: Bordas Sutis dos Municípios
    if (!mapaMultiInstance.getLayer('pe_mun_borders')) {
        mapaMultiInstance.addLayer({
            id: 'pe_mun_borders',
            type: 'line',
            source: 'pe_muns_source',
            paint: {
                'line-color': '#cbd5e1',
                'line-width': 0.75
            }
        });
    }

    // Camada 3: Demarcação da RD do Município em Tela
    if (!mapaMultiInstance.getLayer('pe_rd_highlight')) {
        mapaMultiInstance.addLayer({
            id: 'pe_rd_highlight',
            type: 'line',
            source: 'pe_muns_source',
            filter: ['==', ['get', 'is_rd'], true],
            paint: {
                'line-color': '#0284c7',
                'line-width': 2.2,
                'line-opacity': 0.9
            }
        });
    }

    // Camada 4: Destaque Forte do Município Selecionado em Tela
    if (!mapaMultiInstance.getLayer('pe_mun_selected_highlight')) {
        mapaMultiInstance.addLayer({
            id: 'pe_mun_selected_highlight',
            type: 'line',
            source: 'pe_muns_source',
            filter: ['==', ['get', 'is_selected'], true],
            paint: {
                'line-color': '#ff5a26',
                'line-width': 3.8,
                'line-opacity': 1.0
            }
        });
    }

    // Eventos de Interação
    if (!popupMultiInstance && typeof maplibregl !== 'undefined') {
        popupMultiInstance = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
    }

    mapaMultiInstance.on('mousemove', 'pe_mun_fill', (e) => {
        if (!e.features || !e.features.length) return;
        mapaMultiInstance.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties || {};
        atualizarHoverPainelMulti(props);

        if (popupMultiInstance) {
            const munNome = props.municipio || props.name || props.nome || '-';
            const valExib = (props.sem_dado || props.val_num === null || props.val_fmt === '-' || props.val_fmt === 'Sem dado') ? 'Sem dado' : props.val_fmt;
            const rankTxt = (props.rank_pe && Number(props.rank_pe) > 0) ? ` &bull; ${props.rank_pe}º PE` : '';
            popupMultiInstance.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: inherit; font-size: 11px; padding: 3px 5px; min-width: 90px; text-align: center;">
                    <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${munNome}</div>
                    <div style="font-weight: 800; color: ${valExib === 'Sem dado' ? '#64748b' : '#ff5a26'};">${valExib}</div>
                    ${rankTxt ? `<div style="font-size: 9px; color: #64748b;">${rankTxt}</div>` : ''}
                </div>
            `).addTo(mapaMultiInstance);
        }
    });

    mapaMultiInstance.on('mouseleave', 'pe_mun_fill', () => {
        mapaMultiInstance.getCanvas().style.cursor = '';
        if (popupMultiInstance) {
            popupMultiInstance.remove();
        }
        resetarHoverPainelMulti();
    });

    mapaMultiInstance.on('click', 'pe_mun_fill', (e) => {
        if (!e.features || !e.features.length) return;
        const props = e.features[0].properties || {};
        const munNome = props.municipio || props.name || props.nome;
        if (munNome && typeof window.selecionarMunicipio === 'function') {
            window.selecionarMunicipio(munNome);
        } else if (munNome && $('#ficha_f_municipio').length) {
            $('#ficha_f_municipio').val(munNome).trigger('change');
        }
    });

    atualizarCoresCamadaMulti(data);
}

function calcularExpressaoCorMulti(data) {
    const minVal = Number(data.min_pe) || 0;
    const maxVal = Number(data.max_pe) || 0;
    const isNeg = String(data.polaridade).toLowerCase() === 'negativa';
    const isCapag = String(data.sigla || '').toLowerCase().startsWith('capag');

    if (isCapag) {
        // Notas CAPAG: A+ (4.5), A (4.0), B (3.0), C (2.0), D (1.0)
        return [
            'case',
            ['==', ['get', 'val_num'], null], '#e2e8f0',
            ['>=', ['get', 'val_num'], 3.8], '#10b981', // A / A+ (Verde)
            ['>=', ['get', 'val_num'], 2.8], '#0ea5e9', // B (Azul)
            ['>=', ['get', 'val_num'], 1.8], '#f59e0b', // C (Âmbar)
            ['>=', ['get', 'val_num'], 0.8], '#ef4444', // D (Vermelho)
            '#e2e8f0'
        ];
    }

    // Paleta de cores moderna (azuis suaves a profundos, ou tons ajustados)
    const paleta = isNeg
        ? ['#fef2f2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'] // alerta para negativa
        : ['#eff6ff', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']; // progressão azul

    const diff = maxVal - minVal;
    // Se todos os municípios têm o mesmo valor ou se não há dados válidos, renderiza cor neutra sem quebrar
    if (diff <= 0.00001 || !data.total_validos || data.total_validos === 0) {
        return [
            'case',
            ['==', ['get', 'val_num'], null], '#e2e8f0',
            paleta[2]
        ];
    }

    const step = diff / 4.0;
    const q1 = minVal + step;
    const q2 = minVal + step * 2;
    const q3 = minVal + step * 3;

    return [
        'case',
        ['==', ['get', 'val_num'], null], '#e2e8f0',
        ['<', ['get', 'val_num'], q1], paleta[0],
        ['<', ['get', 'val_num'], q2], paleta[1],
        ['<', ['get', 'val_num'], q3], paleta[2],
        ['<', ['get', 'val_num'], maxVal], paleta[3],
        paleta[4]
    ];
}

function atualizarCoresCamadaMulti(data) {
    if (!mapaMultiInstance) return;
    try {
        if (mapaMultiInstance.getLayer('pe_mun_fill')) {
            mapaMultiInstance.setPaintProperty('pe_mun_fill', 'fill-color', calcularExpressaoCorMulti(data));
        }
        if (mapaMultiInstance.getLayer('pe_rd_highlight')) {
            mapaMultiInstance.setFilter('pe_rd_highlight', ['==', ['get', 'is_rd'], true]);
        }
        if (mapaMultiInstance.getLayer('pe_mun_selected_highlight')) {
            mapaMultiInstance.setFilter('pe_mun_selected_highlight', ['==', ['get', 'is_selected'], true]);
        }
    } catch(e) {
        console.warn("[Mapa Multi] Falha ao atualizar pintura de camadas:", e);
    }
}

function atualizarCardMunicipioEmTelaMulti(data) {
    if (!data || !municipioEmTelaAtual) return;

    $('#mapa_multi_card_mun_nome').text(municipioEmTelaAtual);
    $('#mapa_multi_card_mun_rd').text(rdEmTelaAtual ? `RD ${rdEmTelaAtual}` : 'Pernambuco');

    const norm = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const munNorm = norm(municipioEmTelaAtual);
    const item = (data.municipios && (data.municipios[munNorm] || data.municipios[municipioEmTelaAtual] || data.municipios[window.codIbgeMunAtual])) || {};

    $('#mapa_multi_card_mun_valor').text(item.valor_fmt || '-');
    $('#mapa_multi_card_mun_tipo').text(data.nm_indicador || '');

    if (item.rank_pe && item.rank_pe > 0) {
        $('#mapa_multi_card_mun_rank_pe').html(`<span class="text-orange-600 font-black">${item.rank_pe}º</span> de ${item.total_pe || 184}`);
    } else {
        $('#mapa_multi_card_mun_rank_pe').text('Sem ranking');
    }

    if (item.rank_rd && item.rank_rd > 0) {
        $('#mapa_multi_card_mun_rank_rd').html(`<span class="text-blue-600 font-black">${item.rank_rd}º</span> de ${item.total_rd || '-'} na RD`);
    } else {
        $('#mapa_multi_card_mun_rank_rd').text('Sem ranking');
    }
}

function atualizarHoverPainelMulti(props) {
    const nomeM = props.municipio || props.name || props.nome || '-';
    const rdM = props.rd_nome || '-';
    const valFmt = props.val_fmt || '-';
    const rPE = Number(props.rank_pe) || 0;
    const totPE = Number(props.total_pe) || 184;
    const rRD = Number(props.rank_rd) || 0;
    const totRD = Number(props.total_rd) || 0;

    $('#mapa_multi_hover_mun_nome').text(nomeM);
    $('#mapa_multi_hover_rd').text(rdM !== '-' ? `RD ${rdM}` : 'Pernambuco');
    $('#mapa_multi_hover_valor').text(valFmt);
    $('#mapa_multi_hover_tipo').text(cacheDadosIndicadorAtual ? cacheDadosIndicadorAtual.nm_indicador : '');

    if (rPE > 0) {
        $('#mapa_multi_hover_rank_pe').html(`<span class="text-blue-600">${rPE}º</span> de ${totPE} em PE`);
    } else {
        $('#mapa_multi_hover_rank_pe').text('-');
    }

    if (rRD > 0) {
        $('#mapa_multi_hover_rank_rd').html(`<span class="text-blue-600">${rRD}º</span> de ${totRD}`);
    } else {
        $('#mapa_multi_hover_rank_rd').text('-');
    }

    if (cacheDadosIndicadorAtual && cacheDadosIndicadorAtual.media_pe && props.val_num !== null && !isNaN(props.val_num)) {
        const media = cacheDadosIndicadorAtual.media_pe;
        const diff = props.val_num - media;
        const pctDiff = media !== 0 ? (diff / media) * 100 : 0;
        const sinal = diff >= 0 ? '+' : '';
        const cor = diff >= 0 ? 'text-emerald-600' : 'text-rose-600';
        $('#mapa_multi_hover_comp_media').html(`<span class="${cor} font-black">${sinal}${pctDiff.toFixed(1)}%</span> vs. média PE`);
    } else {
        $('#mapa_multi_hover_comp_media').text('-');
    }
}

function resetarHoverPainelMulti() {
    $('#mapa_multi_hover_mun_nome').text('Selecione no mapa');
    $('#mapa_multi_hover_rd').text('Passe o cursor');
    $('#mapa_multi_hover_valor').text('-');
    $('#mapa_multi_hover_tipo').text('');
    $('#mapa_multi_hover_rank_pe').text('-');
    $('#mapa_multi_hover_rank_rd').text('-');
    $('#mapa_multi_hover_comp_media').text('-');
}

window.mapaMultiResetZoom = function(tipo) {
    if (!mapaMultiInstance || !geoJSONEstadualPE) return;

    try {
        const norm = (str) => String(str || '').normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
        const bounds = new maplibregl.LngLatBounds();

        if (tipo === 'estado') {
            mapaMultiInstance.flyTo({ center: [-37.8, -8.3], zoom: 6.8, duration: 800 });
            return;
        }

        const munAlvoNorm = norm(municipioEmTelaAtual);
        const rdAlvoNorm = norm(rdEmTelaAtual);

        let achou = false;
        (geoJSONEstadualPE.features || []).forEach(f => {
            const props = f.properties || {};
            const mNorm = norm(props.municipio || props.name || props.nome || '');
            const rNorm = norm(props.rd_nome || props.regiao_de_desenvolvimento || '');

            if (tipo === 'mun' && mNorm === munAlvoNorm) {
                estenderBoundsComGeom(bounds, f.geometry);
                achou = true;
            } else if (tipo === 'rd' && rNorm === rdAlvoNorm) {
                estenderBoundsComGeom(bounds, f.geometry);
                achou = true;
            }
        });

        if (achou && !bounds.isEmpty()) {
            mapaMultiInstance.fitBounds(bounds, { padding: 40, maxZoom: tipo === 'mun' ? 11 : 8.5, duration: 800 });
        } else {
            mapaMultiInstance.flyTo({ center: [-37.8, -8.3], zoom: 6.8, duration: 800 });
        }
    } catch(e) {
        console.warn("[Mapa Multi] Erro ao resetar zoom:", e);
    }
};

function estenderBoundsComGeom(bounds, geom) {
    if (!geom || !geom.coordinates) return;
    const processCoord = (c) => {
        if (typeof c[0] === 'number' && typeof c[1] === 'number') {
            bounds.extend(c);
        } else if (Array.isArray(c)) {
            c.forEach(processCoord);
        }
    };
    processCoord(geom.coordinates);
}

window.atualizarMunicipioEmTelaMulti = function(nomeMun, rdNome) {
    municipioEmTelaAtual = nomeMun || "";
    rdEmTelaAtual = rdNome || "";

    window.inicializarControlesMapaMulti();

    if (cacheDadosIndicadorAtual) {
        renderizarMapaMultiComDados(cacheDadosIndicadorAtual);
    } else {
        window.carregarERenderizarMapaMulti();
    }
};

window.alternarMetricaDemografia = function (metrica) {
    metricaDemografiaAtiva = metrica;
    const btns = ['rd_pop', 'rd_jovem', 'rd_idosa', 'pct_pia', 'ind_envelhecimento', 'pct_longevidade', 'ind_ir_pia', 'pct_jovem', 'ind_renov_trabalho'];
    btns.forEach(m => {
        $(`#btn_demo_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaDemografiaRD();
};

window.alternarMetricaSociais = function (metrica) {
    metricaSocialAtiva = metrica;
    const btns = ['mvi_abs', 'mvi_taxa', 'cvp_abs', 'cvp_taxa', 'feminicidio', 'tent_mvi', 'rfv', 'vcm_ameaca', 'vcm_lesao', 'vcm_vs'];
    btns.forEach(m => {
        $(`#btn_soc_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaSociaisRD();
};

window.alternarMetricaEducacao = function (metrica) {
    metricaEducacaoAtiva = metrica;
    const btns = ['ideb_5ano', 'tdi_5ano', 'aba_5ano', 'apr_5ano', 'rep_5ano', 'ideb_9ano', 'tdi_9ano', 'aba_9ano', 'apr_9ano', 'rep_9ano', 'mat_6_10', 'mat_11_14', 'perc_mat_int', 'perc_alfabetizacao', 'atliq_creche'];
    btns.forEach(m => {
        $(`#btn_edu_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaEducacaoRD();
};

window.alternarMetricaSaude = function (metrica) {
    metricaSaudeAtiva = metrica;
    const btns = ['pre_natal', 'razao_mm', 'tx_att', 'tx_dcnt', 'tx_evitaveis', 'tx_infancia', 'tx_infantil'];
    btns.forEach(m => {
        $(`#btn_sau_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaSaudeRD();
};

window.alternarMetricaCadUnico = function (metrica) {
    metricaCadUnicoAtiva = metrica;
    const btns = ['cad_pessoas', 'tx_cad_pessoas', 'indice_gini', 'ivcad', 'ivcad_nc', 'ivcad_dpi', 'ivcad_dca', 'ivcad_tqa', 'ivcad_dr', 'ivcad_ch', 'maes_qtd', 'maes_val', 'pcp_qtd', 'pcp_val'];
    btns.forEach(m => {
        $(`#btn_cad_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaCadUnicoRD();
};

window.alternarMetricaSaneamento = function (metrica) {
    metricaSaneamentoAtiva = metrica;
    const btns = ['pct_agua_rede', 'pct_esgoto_rede'];
    btns.forEach(m => {
        $(`#btn_san_${m}`).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaSaneamentoRD();
};

window.alternarMetricaInovacao = function (metrica) {
    metricaInovacaoAtiva = metrica;
    $('#ficha_btns_metrica_inovacao button').each(function () {
        const m = $(this).attr('data-metrica');
        $(this).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaInovacaoRD();
};

window.alternarMetricaComercio = function (metrica) {
    metricaComercioAtiva = metrica;
    $('#ficha_btns_metrica_comercio button').each(function () {
        const m = $(this).attr('data-metrica');
        $(this).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaComercioRD();
};

window.alternarMetricaConectividade = function (metrica) {
    metricaConectividadeAtiva = metrica;
    $('#ficha_btns_metrica_conectividade button').each(function () {
        const m = $(this).attr('data-metrica');
        $(this).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaConectividadeRD();
};

window.alternarMetricaTrabalho = function (metrica) {
    metricaTrabalhoAtiva = metrica;
    $('#ficha_btns_metrica_trabalho button').each(function () {
        const m = $(this).attr('data-metrica');
        $(this).toggleClass('btn-primary active', m === metrica).toggleClass('btn-outline-primary', m !== metrica);
    });
    if (cacheSociaisRD.geojsonRD) renderizarMapaTrabalhoRD();
};

/* ==========================================================================
   3.5 RENDERIZADORES: RESUMO EXECUTIVO (5 DIMENSÕES) E DIAGNÓSTICO REGIONAL
   ========================================================================== */

function renderizarResumoExecutivo(nomeMun, demo, ind, fiscais, vocacoes, diagMun, rankPop, pibValMil, rankPib, pibFormatado) {
    try {
        const $container = $('#ficha_container_resumo_executivo');
        if (!$container.length) return;
        $container.empty();

        const safeNum = (v, fallback = 0) => {
            if (v === null || v === undefined || v === '') return fallback;
            const n = parseFloat(String(v).replace(',', '.'));
            return isNaN(n) ? fallback : n;
        };

        const safeFmt = (v, dec = 1, fallback = '-') => {
            if (v === null || v === undefined || v === '') return fallback;
            const n = parseFloat(String(v).replace(',', '.'));
            if (isNaN(n)) return fallback;
            return n.toFixed(dec);
        };

        const extrairValor = (obj, key, fallback) => (obj && obj[key] && obj[key][0] !== undefined) ? obj[key][0] : fallback;
        const extrairIndRecente = (sigla) => {
            const itens = (ind || []).filter(i => String(i.sigla_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
            if (!itens.length) return null;
            itens.sort((a, b) => b.ano - a.ano);
            return itens[0];
        };
        const extrairNumInd = (sigla, fallback = 0) => {
            const it = extrairIndRecente(sigla);
            if (!it) return fallback;
            const val = parseFloat(String(it.indicador).replace(',', '.'));
            return isNaN(val) ? fallback : val;
        };

        const formatarMoedaCompacta = (v) => {
            const num = safeNum(v, 0);
            if (num === 0) return 'R$ 0';
            const abs = Math.abs(num);
            const sinal = num < 0 ? '-' : '';
            if (abs >= 1e9) return `${sinal}R$ ${(abs / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
            if (abs >= 1e6) return `${sinal}R$ ${(abs / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
            if (abs >= 1e3) return `${sinal}R$ ${(abs / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
            return `${sinal}R$ ${abs.toLocaleString('pt-BR')}`;
        };

        // 1. DIMENSÃO DEMOGRAFIA
        const popVal = safeNum(extrairValor(demo, 'pop_2026', 0), 0);
        const areaVal = safeNum(extrairValor(demo, 'area_km2', 0), 0);
        const densidade = (areaVal > 0 && popVal > 0) ? (popVal / areaVal).toFixed(1) : '-';
        const pctUrb = extrairNumInd('perc_pop_urb', 0);
        const pctPia = extrairNumInd('pct_pia', 0);
        const indEnvelhecimento = extrairNumInd('ind_envelhecimento', 0);

        let perfilUrbano = 'equilibrado entre campo e cidade';
        if (pctUrb >= 80) perfilUrbano = 'fortemente urbanizado';
        else if (pctUrb >= 50) perfilUrbano = 'predominantemente urbano';
        else perfilUrbano = 'com expressiva presença rural';

        let estagioDemografico = 'bônus demográfico em maturação';
        if (indEnvelhecimento > 70) estagioDemografico = 'transição demográfica acelerada com envelhecimento populacional';
        else if (pctPia > 65) estagioDemografico = 'janela de oportunidade demográfica favorável (alta PIA)';

        const textoDemografia = `Com população estimada em <strong>${popVal.toLocaleString('pt-BR')} habitantes</strong> (${rankPop || '-'}º maior contingente de Pernambuco) e densidade de <strong>${densidade} hab/km²</strong>, o município apresenta perfil <em>${perfilUrbano}</em> (${safeFmt(pctUrb, 1, '0.0')}% urbana). Sua estrutura etária revela <strong>${safeFmt(pctPia, 1, '0.0')}%</strong> da população em idade produtiva (PIA) e índice de envelhecimento de <strong>${safeFmt(indEnvelhecimento, 1, '0.0')}</strong>, caracterizando ${estagioDemografico}.`;

        // 2. DIMENSÃO ECONOMIA
        const pibpcVal = extrairNumInd('pibpc', 0);
        const pibPctVal = extrairNumInd('pib_pct', 0);
        const rankPibpc = extrairIndRecente('pibpc')?.rank_pe || '-';

        const vabAgro = extrairNumInd('vab_agro', 0);
        const vabInd = extrairNumInd('vab_ind', 0);
        const vabServ = extrairNumInd('vab_serv', 0);
        const vabAdm = extrairNumInd('vab_adm', 0);
        const totalVab = (vabAgro + vabInd + vabServ + vabAdm) || 1;
        const pctVabAgro = safeFmt((vabAgro / totalVab) * 100, 1, '0.0');
        const pctVabInd = safeFmt((vabInd / totalVab) * 100, 1, '0.0');
        const pctVabServ = safeFmt((vabServ / totalVab) * 100, 1, '0.0');
        const pctVabAdm = safeFmt((vabAdm / totalVab) * 100, 1, '0.0');

        let setorLider = 'Serviços';
        let maxVab = vabServ;
        if (vabInd > maxVab) { setorLider = 'Indústria'; maxVab = vabInd; }
        if (vabAgro > maxVab) { setorLider = 'Agropecuária'; maxVab = vabAgro; }
        if (vabAdm > maxVab) { setorLider = 'Administração Pública'; maxVab = vabAdm; }

        const vocacoesTexto = (vocacoes && vocacoes.length > 0)
            ? vocacoes.slice(0, 3).map(v => v.nm_vocacao || v.nm_cnae_divisao).filter(Boolean).join(', ')
            : (extrairValor(demo, 'arranjos_produtivos_locais', '') || 'Comércio e serviços');

        // Quociente Locacional da Indústria (QL Ind padrão - média PE = 10.672%)
        const qlIndVal = (safeNum(pctVabInd, 0) / 10.672);
        const qlIndFmt = isNaN(qlIndVal) ? '-' : qlIndVal.toFixed(2);
        const isQLEspecializado = !isNaN(qlIndVal) && qlIndVal >= 1.0;

        // Qualificação do tipo de serviços (Infocom / alto valor vs Varejo / consumo vs Adm Pública)
        const cnaesInfocom = [62, 63, 64, 72];
        const temInfocomVoc = (vocacoes || []).some(v => cnaesInfocom.includes(Number(v.cnae_divisao)));
        const numEmpTi = (diagMun && diagMun.empresas_ti_infocom !== undefined) ? diagMun.empresas_ti_infocom : extrairNumInd('total_emp_infocom', 0);
        
        let perfilServico = '';
        let rotuloServico = 'Comércio / Varejo';
        if (numEmpTi > 15 || temInfocomVoc) {
            rotuloServico = 'Infocom / Conhecimento';
            perfilServico = `serviços especializados e intensivos em tecnologia (Infocom, pesquisa e serviços corporativos, contando com ${numEmpTi > 0 ? numEmpTi + ' estabelecimentos do segmento' : 'polo regional ativo'})`;
        } else if (parseFloat(pctVabAdm) > 45) {
            rotuloServico = 'Adm. Pública';
            perfilServico = `terciário dependente do setor público (Administração Pública respondendo por expressivos ${pctVabAdm}% do VAB), com comércio e serviços locais de menor valor agregado`;
        } else {
            rotuloServico = 'Comércio / Varejo';
            perfilServico = `comércio varejista tradicional e serviços locais voltados ao abastecimento imediato e consumo das famílias`;
        }

        const textoEconomia = `A economia municipal movimenta um PIB de <strong>${pibFormatado || '-'}</strong> (${rankPib || '-'}º no ranking estadual), correspondendo a <strong>${safeFmt(pibPctVal, 2, '0.00')}%</strong> da riqueza de Pernambuco, com PIB per capita de <strong>R$ ${pibpcVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (${rankPibpc}º em PE). O Valor Adicionado Bruto tem liderança de <strong>${setorLider}</strong> (Serviços: ${pctVabServ}%, Adm. Pública: ${pctVabAdm}%, Indústria: ${pctVabInd}%, Agropecuária: ${pctVabAgro}%). Na indústria, apresenta Quociente Locacional de <strong>QL Ind. = ${qlIndFmt}</strong> (${isQLEspecializado ? 'especialização acima da média do Estado' : 'sem especialização industrial relativa'}). No setor terciário, diferencia-se por <em>${perfilServico}</em>, com vocações locais em: <em>${vocacoesTexto}</em>.`;

        // 3. DIMENSÃO SOCIAL
        const idhmVal = extrairNumInd('idhm', 0);
        const rankIdhm = extrairIndRecente('idhm')?.rank_pe || '-';
        let faixaIdhm = 'Médio';
        if (idhmVal >= 0.8) faixaIdhm = 'Muito Alto';
        else if (idhmVal >= 0.7) faixaIdhm = 'Alto';
        else if (idhmVal >= 0.6) faixaIdhm = 'Médio';
        else if (idhmVal > 0) faixaIdhm = 'Baixo';

        // Taxa de pessoas no CadÚnico e dependência de recursos (IVCAD-DR)
        const itemTxCad = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'tx_cad_pessoas');
        let txCadVal = itemTxCad ? parseFloat(String(itemTxCad.indicador).replace(',', '.')) : 0;
        if (isNaN(txCadVal) || txCadVal === 0) {
            const itemPessoas = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'cad_pessoas');
            if (itemPessoas && popVal > 0) {
                const valPess = parseFloat(String(itemPessoas.indicador).replace(',', '.'));
                if (!isNaN(valPess)) txCadVal = (valPess / popVal) * 100;
            }
        }

        const itemDr = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'ivcad_dr');
        let drVal = itemDr ? parseFloat(String(itemDr.indicador).replace(',', '.')) : 0;
        if (isNaN(drVal) || drVal === 0) {
            drVal = extrairNumInd('ivcad_taxa', 0);
        }
        const drPctStr = drVal > 1 ? safeFmt(drVal, 1) + '%' : safeFmt(drVal * 100, 1) + '%';

        const idebVal = extrairNumInd('ideb_5ano', 0);
        const aguaVal = extrairNumInd('pct_agua_rede', 0);

        let textoSocial = `O Índice de Desenvolvimento Humano Municipal (IDHM) registra <strong>${safeFmt(idhmVal, 3, '-')}</strong> (Faixa ${faixaIdhm}, ${rankIdhm}º em PE). `;
        if (txCadVal > 0) {
            textoSocial += `No panorama de vulnerabilidade social, <strong>${safeFmt(txCadVal, 1)}% da população</strong> encontra-se cadastrada no CadÚnico. `;
        }
        if (drVal > 0) {
            textoSocial += `A dimensão de Disponibilidade de Recursos (IVCAD-DR) situa-se em <strong>${drPctStr}</strong>, evidenciando expressiva necessidade de recursos e forte dependência de transferências de renda governamentais (como Bolsa Família, Mães de Pernambuco e BPC) para manutenção do poder de compra e subsistência das famílias. `;
        }
        if (aguaVal > 0) {
            textoSocial += `O abastecimento de água pela rede geral atende <strong>${safeFmt(aguaVal, 1)}%</strong> dos domicílios. `;
        }
        if (idebVal > 0) {
            textoSocial += `Na educação básica, a proficiência no IDEB (Anos Iniciais) alcança nota <strong>${safeFmt(idebVal, 1)}</strong>.`;
        }

        // 4. DIMENSÃO FISCAL
        let capagNota = '-';
        const itemCapag = (ind || []).find(i => {
            const s = String(i.sigla_indicador || '').toLowerCase().trim();
            const nm = String(i.nm_indicador || '').toLowerCase().trim();
            return s === 'capag' || nm === 'capag';
        });
        if (itemCapag && itemCapag.indicador && String(itemCapag.indicador).trim() !== '' && String(itemCapag.indicador).trim() !== 'NA') {
            capagNota = String(itemCapag.indicador).trim().toUpperCase();
        } else if (demo && (demo.capag || demo.CAPAG) && String(demo.capag || demo.CAPAG).trim() !== 'n.d.') {
            capagNota = String(demo.capag || demo.CAPAG).trim().toUpperCase();
        } else if (diagMun && diagMun.capacidade_fiscal_capag) {
            capagNota = String(diagMun.capacidade_fiscal_capag).trim().toUpperCase();
        }

        let maxExFisc = 0;
        (fiscais || []).forEach(f => {
            const ex = parseInt(f.exercicio) || 0;
            if (ex > maxExFisc) maxExFisc = ex;
        });
        const fiscaisRecentes = (fiscais || []).filter(f => parseInt(f.exercicio) === maxExFisc);

        const obterValorFiscal = (nomeInd) => {
            const itens = fiscaisRecentes.filter(f => String(f.indicador || '').toLowerCase().trim() === nomeInd.toLowerCase().trim());
            if (!itens.length) return 0;
            itens.sort((a, b) => (parseInt(b.periodo) || 0) - (parseInt(a.periodo) || 0));
            return parseFloat(itens[0].valor) || 0;
        };

        const amortizacao = obterValorFiscal('Amortização da Dívida - Liq.');
        const jurosDivida = obterValorFiscal('Juros e Encargos - Liq.');
        const totalDespesaDivida = amortizacao + jurosDivida;
        const despInvestimento = obterValorFiscal('Investimentos - Liq.') || obterValorFiscal('Despesas de Capital - Emp.');
        const recInvestimento = obterValorFiscal('Receitas de Capital');

        const dividaFmt = formatarMoedaCompacta(totalDespesaDivida);
        const despInvestFmt = formatarMoedaCompacta(despInvestimento);
        const recInvestFmt = formatarMoedaCompacta(recInvestimento);

        let textoFiscal = `A gestão fiscal do município apresenta classificação <strong>CAPAG ${capagNota}</strong> junto à Secretaria do Tesouro Nacional (STN)`;
        if (capagNota.startsWith('A') || capagNota.startsWith('B')) {
            textoFiscal += `, indicando boa capacidade de pagamento, saúde financeira equilibrada e aptidão para operações de crédito com garantia da União. `;
        } else if (capagNota.startsWith('C') || capagNota.startsWith('D')) {
            textoFiscal += `, sinalizando restrições na liquidez e endividamento, demandando rigor no custeio e foco na ampliação de receitas próprias. `;
        } else {
            textoFiscal += `, exigindo acompanhamento contínuo dos indicadores da LRF, resultado primário e transferências constitucionais. `;
        }
        if (maxExFisc > 0 && (despInvestimento > 0 || recInvestimento > 0 || totalDespesaDivida > 0)) {
            textoFiscal += `No exercício recente (${maxExFisc}), registrou <strong>${despInvestFmt}</strong> em investimentos liquidados e <strong>${recInvestFmt}</strong> em receitas de capital, destinando <strong>${dividaFmt}</strong> ao serviço da dívida (amortização e encargos).`;
        }

        // 5. DIMENSÃO TECNOLOGIA & INOVAÇÃO
        const fibraVal = extrairNumInd('cob_fibra', 0);
        const fibraPct = fibraVal <= 1 && fibraVal > 0 ? safeFmt(fibraVal * 100, 1) : safeFmt(fibraVal, 1);

        const pctVabInfocomServ = extrairNumInd('pct_vab_infocom_serv', 0);
        const pctEstabInfocomServ = extrairNumInd('pct_estab_infocom_serv', 0);
        const pctEmpInfocomServ = extrairNumInd('pct_emp_infocom_serv', 0);
        const qlInfocomServ = extrairNumInd('ql_infocom_serv', 0);
        const estabInfocomTot = extrairNumInd('estab_infocom', 0);
        const empInfocomTot = extrairNumInd('emp_infocom', 0);
        const rankVabInfocom = extrairIndRecente('pct_vab_infocom_serv')?.rank_pe || '-';
        const isQlInfocomEspec = qlInfocomServ >= 1.0;

        let empresasTi = estabInfocomTot;
        if (empresasTi === 0 && diagMun && diagMun.empresas_ti_infocom !== undefined) {
            empresasTi = diagMun.empresas_ti_infocom;
        }

        let textoTech = `No eixo de inovação, as atividades de Informação e Comunicação (InfoCom) representam <strong>${safeFmt(pctVabInfocomServ, 2, '0.00')}% do VAB de Serviços</strong> (${rankVabInfocom}º em PE), concentrando <strong>${safeFmt(pctEstabInfocomServ, 2, '0.00')}% dos estabelecimentos</strong> (${empresasTi} empresas) e <strong>${safeFmt(pctEmpInfocomServ, 2, '0.00')}% dos empregados formais</strong> (${empInfocomTot} vínculos) do setor terciário, com Quociente Locacional de <strong>QL = ${safeFmt(qlInfocomServ, 2, '0.00')}</strong> (${isQlInfocomEspec ? 'especialização acima da média estadual' : 'sem especialização relativa em PE'}). Cobertura por fibra óptica em <strong>${fibraPct}%</strong>.`;

        // Extração de dados de PIB per capita e IVCAD para a Síntese Executiva
        const ivcadVal = extrairNumInd('ivcad', 0);
        const rankIvcad = extrairIndRecente('ivcad')?.rank_pe || '-';
        const pibpcFmt = pibpcVal > 0 ? `R$ ${pibpcVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
        const ivcadFmt = ivcadVal > 0 ? safeFmt(ivcadVal, 3) : '-';

        const htmlResumo = `
            <div class="resumo-exec-banner mb-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-white text-orange-950 font-black px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs shadow-xs">
                            <i class="fas fa-file-signature me-1 text-[#ff5a26]"></i> Síntese Estratégica Executiva
                        </span>
                        <span class="text-orange-100 font-semibold text-xs">${nomeMun} &bull; Região de Desenvolvimento ${extrairValor(demo, 'regiao_de_desenvolvimento', '-')}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-users me-1 text-cyan-300"></i> Pop: ${popVal.toLocaleString('pt-BR')} (${rankPop || '-'}º PE)
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-sack-dollar me-1 text-emerald-300"></i> PIB: ${pibFormatado || '-'} (${rankPib || '-'}º PE)
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-user-tag me-1 text-amber-300"></i> PIB pc: ${pibpcFmt} (${rankPibpc}º PE)
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-shield-heart me-1 text-purple-300"></i> IVCAD: ${ivcadFmt} (${rankIvcad}º PE)
                        </span>
                    </div>
                </div>
                <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                    ${nomeMun} consolida-se como a <strong>${rankPop || '-'}ª maior população</strong> e o <strong>${rankPib || '-'}º maior PIB</strong> de Pernambuco, com PIB per capita de <strong>${pibpcFmt}</strong> (${rankPibpc}º no Estado) e forte inserção na RD ${extrairValor(demo, 'regiao_de_desenvolvimento', '-')}. Apresenta matriz produtiva com liderança de <strong>${setorLider}</strong>, IDHM de <strong>${safeFmt(idhmVal, 3, '-')}</strong> (${faixaIdhm}), vulnerabilidade social aferida pelo IVCAD em <strong>${ivcadFmt}</strong> (${rankIvcad}º em PE), capacidade fiscal classificada como <strong>CAPAG ${capagNota}</strong> e taxa de cobertura por fibra de <strong>${fibraPct}%</strong>.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <!-- 1. DEMOGRAFIA -->
                <div class="resumo-dim-card" style="border-top: 4px solid #3B82F6;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-users text-blue-500 me-1.5"></i> Demografia</span>
                        <span class="badge bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-pill px-2">${rankPop || '-'}º em PE</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Pop. 2026:</span> <strong class="text-slate-800">${popVal.toLocaleString('pt-BR')}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Densidade:</span> <strong class="text-slate-800">${densidade} hab/km²</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Urbanização:</span> <strong class="text-slate-800">${safeFmt(pctUrb, 1, '0.0')}%</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">PIA (15-64):</span> <strong class="text-slate-800">${safeFmt(pctPia, 1, '0.0')}%</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoDemografia}
                    </div>
                </div>

                <!-- 2. ECONOMIA -->
                <div class="resumo-dim-card" style="border-top: 4px solid #10B981;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-chart-line text-emerald-500 me-1.5"></i> Economia</span>
                        <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-pill px-2">${rankPib || '-'}º em PE</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">PIB Total:</span> <strong class="text-slate-800">${pibFormatado || '-'}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">PIB per Capita:</span> <strong class="text-slate-800">R$ ${pibpcVal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">QL Indústria:</span> <strong class="text-slate-800">${qlIndFmt} <span class="text-[10px] ${isQLEspecializado ? 'text-emerald-600 font-bold' : 'text-slate-400'}">(${isQLEspecializado ? 'Espec. >1' : '< 1'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Tipo Terciário:</span> <strong class="text-slate-800" title="${perfilServico}">${rotuloServico}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEconomia}
                    </div>
                </div>

                <!-- 3. SOCIAL -->
                <div class="resumo-dim-card" style="border-top: 4px solid #F59E0B;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-hand-holding-heart text-amber-500 me-1.5"></i> Social</span>
                        <span class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2">IDHM: ${safeFmt(idhmVal, 3, '-')}</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">IDHM:</span> <strong class="text-slate-800">${safeFmt(idhmVal, 3, '-')} (${faixaIdhm})</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Pop. no CadÚnico:</span> <strong class="text-slate-800">${txCadVal > 0 ? safeFmt(txCadVal, 1) + '%' : '-'}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Dep. Recursos (DR):</span> <strong class="text-slate-800">${drVal > 0 ? drPctStr : '-'}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Água Tratada:</span> <strong class="text-slate-800">${aguaVal > 0 ? safeFmt(aguaVal, 1) + '%' : '-'}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoSocial}
                    </div>
                </div>

                <!-- 4. FISCAL -->
                <div class="resumo-dim-card" style="border-top: 4px solid #8B5CF6;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-landmark text-purple-500 me-1.5"></i> Fiscal</span>
                        <span class="badge text-white text-[10px] font-bold rounded-pill px-2.5 py-1" style="background-color: ${obterCorCapag(capagNota)};">CAPAG: ${capagNota}</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">CAPAG STN:</span> <strong class="badge text-white px-2 py-0.5 rounded-pill" style="background-color: ${obterCorCapag(capagNota)}; font-size: 11px;">${capagNota}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Investimento:</span> <strong class="text-slate-800">${despInvestFmt}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Rec. Investimento:</span> <strong class="text-slate-800">${recInvestFmt}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Despesa c/ Dívida:</span> <strong class="text-slate-800">${dividaFmt}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoFiscal}
                    </div>
                </div>

                <!-- 5. TECNOLOGIA & INOVAÇÃO -->
                <div class="resumo-dim-card" style="border-top: 4px solid #06B6D4;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-microchip text-cyan-500 me-1.5"></i> Inovação &amp; TI</span>
                        <span class="badge ${isQlInfocomEspec ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'} border text-[10px] font-bold rounded-pill px-2">QL InfoCom: ${safeFmt(qlInfocomServ, 2, '0.00')}</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500" title="Participação de InfoCom em relação a Serviços no VAB">% InfoCom / Serv (VAB):</span> <strong class="text-slate-800">${safeFmt(pctVabInfocomServ, 2, '0.00')}%</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500" title="Participação de InfoCom nos Estabelecimentos de Serviços">% InfoCom / Serv (Estab.):</span> <strong class="text-slate-800">${safeFmt(pctEstabInfocomServ, 2, '0.00')}% <span class="text-[10px] text-slate-400">(${empresasTi})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500" title="Participação de InfoCom nos Empregados de Serviços">% InfoCom / Serv (Empreg.):</span> <strong class="text-slate-800">${safeFmt(pctEmpInfocomServ, 2, '0.00')}% <span class="text-[10px] text-slate-400">(${empInfocomTot})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500" title="Quociente Locacional específico de InfoCom em relação a Serviços">QL InfoCom / Serviços:</span> <strong class="text-slate-800">${safeFmt(qlInfocomServ, 2, '0.00')} <span class="text-[10px] ${isQlInfocomEspec ? 'text-emerald-600 font-bold' : 'text-slate-400'}">(${isQlInfocomEspec ? 'Espec. ≥1' : '< 1'})</span></strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoTech}
                    </div>
                </div>
            </div>
        `;

        $container.html(htmlResumo);
    } catch (errResumo) {
        console.error("[Ficha] Erro ao renderizar Resumo Executivo:", errResumo);
    }
}
function renderizarDiagnosticoRegional(nomeMun, diagMun, fontesRef) {
    const $container = $('#ficha_container_diagnostico_regional');
    const $headerBadges = $('#ficha_diag_badges_header');
    if (!$container.length) return;
    $container.empty();
    if ($headerBadges.length) $headerBadges.empty();

    if (!diagMun || !diagMun.diretrizes || !diagMun.diretrizes.length) {
        $container.html(`
            <div class="col-span-full bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                <i class="fas fa-info-circle me-1"></i> Diagnóstico de desenvolvimento regional em processamento para este município.
            </div>
        `);
        return;
    }

    if ($headerBadges.length) {
        const semiaridoTxt = diagMun.semiarido ? 'Semiárido (SUDENE)' : 'Zona Úmida / Litoral';
        const semiaridoCor = diagMun.semiarido ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200';
        $headerBadges.html(`
            <span class="badge bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-pill font-bold text-xs"><i class="fas fa-layer-group me-1 text-blue-600"></i> ${diagMun.rd_pe || 'RD'}</span>
            <span class="badge bg-purple-100 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-pill font-bold text-xs"><i class="fas fa-city me-1 text-purple-600"></i> REGIC: ${diagMun.tipologia_regic || '-'}</span>
            <span class="badge bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-pill font-bold text-xs"><i class="fas fa-route me-1 text-emerald-600"></i> Eixo: ${diagMun.eixo_rodoviario || '-'}</span>
            <span class="badge ${semiaridoCor} border px-3 py-1.5 rounded-pill font-bold text-xs"><i class="fas fa-sun me-1"></i> ${semiaridoTxt}</span>
        `);
    }

    const iconePorEixo = {
        'industrialização': { icone: 'fa-industry', cor: '#0C2856', bgIcon: 'bg-blue-100 text-blue-900' },
        'industrializacao': { icone: 'fa-industry', cor: '#0C2856', bgIcon: 'bg-blue-100 text-blue-900' },
        'tecnologia & infocom': { icone: 'fa-microchip', cor: '#4F46E5', bgIcon: 'bg-indigo-100 text-indigo-900' },
        'tecnologia': { icone: 'fa-microchip', cor: '#4F46E5', bgIcon: 'bg-indigo-100 text-indigo-900' },
        'logística e redes': { icone: 'fa-network-wired', cor: '#059669', bgIcon: 'bg-emerald-100 text-emerald-900' },
        'logistica e redes': { icone: 'fa-network-wired', cor: '#059669', bgIcon: 'bg-emerald-100 text-emerald-900' },
        'segurança e clima': { icone: 'fa-shield-halved', cor: '#D97706', bgIcon: 'bg-amber-100 text-amber-900' },
        'seguranca e clima': { icone: 'fa-shield-halved', cor: '#D97706', bgIcon: 'bg-amber-100 text-amber-900' }
    };

    diagMun.diretrizes.forEach(d => {
        const eixoNorm = String(d.eixo_estruturante || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const infoEixo = iconePorEixo[eixoNorm] || { icone: 'fa-compass', cor: '#0C2856', bgIcon: 'bg-slate-100 text-slate-800' };

        const badgesFontes = (d.referencias_fontes || []).map(sigla => {
            return `<button type="button" class="diag-fonte-badge" onclick="window.abrirModalFonteReferencia('${sigla}')" title="Clique para ver detalhes da fonte ${sigla}"><i class="fas fa-book-bookmark text-blue-600"></i> ${sigla}</button>`;
        }).join(' ');

        const cardHtml = `
            <div class="diag-card" style="border-top: 5px solid ${infoEixo.cor};">
                <div class="d-flex align-items-center justify-content-between mb-3 border-b border-slate-100 pb-2.5">
                    <div class="d-flex align-items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl ${infoEixo.bgIcon} d-flex align-items-center justify-content-center shadow-xs">
                            <i class="fas ${infoEixo.icone} text-sm"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest d-block">Eixo Estruturante</span>
                            <h5 class="font-black text-slate-800 text-sm mb-0 uppercase">${d.eixo_estruturante}</h5>
                        </div>
                    </div>
                    <span class="badge bg-slate-100 text-slate-600 border border-slate-200 rounded-pill text-[10px] px-2.5 py-1">Diretriz PPA / PE 2050</span>
                </div>

                <!-- PARADIGMA TRADICIONAL A SUPERAR -->
                <div class="diag-box-paradigma">
                    <div class="d-flex align-items-center gap-1.5 mb-1">
                        <i class="fas fa-arrow-down-left-and-up-right-to-center text-amber-600 text-xs"></i>
                        <span class="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">Paradigma Tradicional a Superar:</span>
                    </div>
                    <p class="text-xs text-amber-950/80 mb-0 leading-relaxed font-medium" style="text-align: justify;">
                        ${d.paradigma_tradicional}
                    </p>
                </div>

                <!-- REORIENTAÇÃO TÉCNICA -->
                <div class="diag-box-reorientacao">
                    <div class="d-flex align-items-center gap-1.5 mb-1.5">
                        <i class="fas fa-circle-check text-emerald-600 text-xs"></i>
                        <span class="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">Reorientação Técnica Estrutural:</span>
                    </div>
                    <p class="text-xs text-slate-800 mb-0 leading-relaxed font-semibold" style="text-align: justify;">
                        ${d.reorientacao_tecnica}
                    </p>
                </div>

                <!-- FONTES E EVIDÊNCIAS -->
                <div class="mt-auto pt-2.5 border-t border-slate-100 d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"><i class="fas fa-graduation-cap me-1"></i> Corpus Bibliográfico:</span>
                    <div class="d-flex flex-wrap gap-1">
                        ${badgesFontes}
                    </div>
                </div>
            </div>
        `;
        $container.append(cardHtml);
    });
}

window.abrirModalFonteReferencia = function (sigla) {
    if (!sigla) return;
    const fontes = window.fontesReferenciaRegional || {};
    let fonte = null;
    for (const k in fontes) {
        if (fontes[k].sigla === sigla) {
            fonte = fontes[k];
            break;
        }
    }
    if (!fonte) {
        const defaultFontes = {
            "MATRIZ-PE": { titulo: "Matriz de Indicadores de Desenvolvimento Regional de Pernambuco", orgao: "Governo de Pernambuco / IBGE / RAIS / SNIS", tipo: "Base de Dados Operacional Municipal", arquivo: "matriz_desenvolvimento_regional.parquet" },
            "PLP-MET": { titulo: "Planejamento Regional de Longo Prazo: Dimensões e Indicadores Operacionais", orgao: "SEPLAG / Condepe-Fidem", tipo: "Marco Metodológico de Planejamento", arquivo: "Planejamento Regional de Longo Prazo(1).html" },
            "REGIC": { titulo: "Regiões de Influência das Cidades (REGIC) & Arranjos Populacionais", orgao: "IBGE - Instituto Brasileiro de Geografia e Estatística", tipo: "Estudo de Rede Urbana e Centralidades", arquivo: "REGIC - Livro.pdf / REGIC - NM - Metodologia.pdf" },
            "PE-2050": { titulo: "Pernambuco em Perspectiva: Estratégias e Cenários de Desenvolvimento de Longo Prazo", orgao: "Revista Algo Mais / Ceplan Consultoria", tipo: "Planejamento Estratégico Estadual", arquivo: "Pernambuco em Perspectiva - Algo Mais.pdf" },
            "ROTAS-BM": { titulo: "Rotas para o Nordeste: Oportunidades para o Desenvolvimento Produtivo", orgao: "Banco Mundial (World Bank Group)", tipo: "Relatório de Competitividade e Produtividade", arquivo: "RotasParaoNordeste_BancoMundial.pdf" },
            "INFRA-LOG": { titulo: "Diretrizes de Infraestrutura de Transportes, Malha Rodoviária e Logística Multimodal", orgao: "DNIT / DER-PE / ANTT", tipo: "Planejamento Setorial de Transportes", arquivo: "skill_planejamento_des_regional-1.pdf" },
            "MEM-AUDIT": { titulo: "Memorial Técnico-Metodológico de Auditoria e Parametrização PPA Estadual / PE 2050", orgao: "SEPLAG / PPA Estadual", tipo: "Protocolo Algorítmico de Auditoria", arquivo: "Memorial_Metodologico_Auditoria.md" },
            "PRDNE-NIB": { titulo: "Plano Regional de Desenvolvimento do Nordeste (PRDNE 2024-2027) & Nova Indústria Brasil (NIB)", orgao: "SUDENE / Ministério do Desenvolvimento, Indústria, Comércio e Serviços (MDIC)", tipo: "Plano Regional e Política Industrial Nacional", arquivo: "Plano Regional de Desenvolvimento do Nordeste para o período 2024-2027-1.pdf" }
        };
        fonte = defaultFontes[sigla];
    }
    if (fonte) {
        $('#modalFonteSigla').text(sigla);
        $('#modalFonteTitulo').text(fonte.titulo);
        $('#modalFonteOrgao').text(fonte.orgao);
        $('#modalFonteTipo').text(fonte.tipo);
        $('#modalFonteArquivo').text(fonte.arquivo);
        const modalEl = document.getElementById('modalFonteReferencia');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            bsModal.show();
        } else {
            $('#modalFonteReferencia').modal('show');
        }
    }
};

/* ==========================================================================
   4. CICLO DE VIDA E CARREGAMENTO DE DADOS (API)
   ========================================================================== */
window.iniciarModuloFicha = async function () {
    if (typeof window.mostrarCarregamento === 'function') window.mostrarCarregamento("Carregando Painel...");

    // Limpar imediatamente quaisquer dropdowns órfãos gerados no body
    $('.bs-container').remove();
    $('body > .dropdown-menu').remove();

window.dadosMetadadosMapa = window.dadosMetadadosMapa || {};

    try {
        let resMeta = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/metadados`.replace(/\/+/g, '/'));
        if (!resMeta || !resMeta.ok) {
            resMeta = await window.fetchSeguro(`${window.basePath || ''}/data/json/metadados_indicadores_mun.json`.replace(/\/+/g, '/'));
        }
        if (resMeta && resMeta.ok) {
            const j = await resMeta.json();
            if (Array.isArray(j.indicadores_dicionario)) {
                window.dadosMetadados = j.indicadores_dicionario;
                window.dadosMetadadosMapa = j.indicadores_mapa || {};
            } else if (j && typeof j === 'object' && !Array.isArray(j)) {
                // Caso tenha lido direto o arquivo estático metadados_indicadores_mun.json
                window.dadosMetadadosMapa = j;
                const vistos = new Set();
                window.dadosMetadados = Object.values(j).filter(item => {
                    const id = item.cd_indicador || item.nm_indicador;
                    if (!id || vistos.has(id)) return false;
                    vistos.add(id);
                    return true;
                });
            }
        } else {
            console.warn("Falha ao carregar os metadados da API.");
        }
        if (typeof window.renderizarAbaMetadados === 'function') window.renderizarAbaMetadados();
    } catch (e) {
        console.warn("Erro ao carregar metadados unificados:", e);
    }

    try {
        const resDiag = await window.fetchSeguro(`${window.basePath || ''}/data/diagnostico_desenvolvimento_regional.json`.replace(/\/+/g, '/'));
        if (resDiag && resDiag.ok) {
            const jDiag = await resDiag.json();
            window.fontesReferenciaRegional = jDiag.metadados?.fontes_referencia || {};
            window.diagnosticoRegional = {};
            (jDiag.municipios || []).forEach(m => {
                if (m.municipio) {
                    window.diagnosticoRegional[m.municipio.trim().toLowerCase()] = m;
                }
            });
        }
    } catch (e) {
        console.warn("Diagnóstico regional será obtido via API individual:", e);
    }

    try {
        iniciarDraggableNav();
        configurarStickyNavbarMetrics();
        if (typeof window.inicializarControlesMapaMulti === 'function') {
            window.inicializarControlesMapaMulti();
        }

        const $select = $('#ficha_f_municipio');

        // Se os filtros já foram inicializados e contêm todos os municípios, reaproveitar e evitar recriação
        if (window.fichaFiltrosCarregados && $select.length && $select.find('option').length >= 180) {
            let targetMun = $select.val() || 'Recife';
            if (window.municipioAlvoBusca) {
                const alvoNorm = String(window.municipioAlvoBusca).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const optFound = $select.find('option').filter(function() {
                    return $(this).text().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === alvoNorm;
                }).val();
                if (optFound) targetMun = optFound;
                window.municipioAlvoBusca = null;
            }
            $select.val(targetMun);
            if (typeof $select.selectpicker === 'function') {
                try { $select.selectpicker('val', targetMun); $select.selectpicker('refresh'); } catch(e) {}
            }
            window.sincronizarBotaoFiltroMunicipio(targetMun);
            if (!window.dadosFichaCarregados || window.municipioAtualFicha !== targetMun) {
                await window.carregarDadosFicha(targetMun);
            }
            return;
        }

        const res = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/filtros`.replace(/\/+/g, '/'));
        if (!res.ok) throw new Error("Erro ao buscar filtros da API");

        const json = await res.json();

        if ($select.length && json.municipios && json.municipios.length > 0) {
            if ($select.data('selectpicker')) {
                try { $select.selectpicker('destroy'); } catch (e) {}
            }
            
            let defaultMun = "Recife";
            if (window.municipioAlvoBusca) {
                const alvoNorm = String(window.municipioAlvoBusca).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const encontrado = json.municipios.find(m => String(m).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === alvoNorm || String(m).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(alvoNorm));
                if (encontrado) defaultMun = encontrado;
                window.municipioAlvoBusca = null;
            } else if (json.municipios.includes("Recife")) {
                defaultMun = "Recife";
            } else {
                defaultMun = json.municipios[0];
            }
            
            // Elimina qualquer duplicata na lista da API garantindo unicidade rigorosa
            const munsUnicos = Array.from(new Set(json.municipios));
            $select.empty().html(munsUnicos.map(m => `<option value="${m}" ${m === defaultMun ? 'selected' : ''}>${m}</option>`).join(''));
            $select.val(defaultMun);

            if (typeof $select.selectpicker === 'function') {
                try {
                    $select.selectpicker({
                        liveSearch: true,
                        liveSearchNormalize: true,
                        liveSearchPlaceholder: "Buscar município...",
                        noneResultsText: "Nenhum município encontrado",
                        size: 10,
                        style: 'btn-sm btn-light fw-bold text-slate-700 border-0 bg-transparent py-0 px-1 shadow-none',
                        width: '230px'
                    });
                    $select.selectpicker('val', defaultMun);
                    $select.selectpicker('refresh');
                } catch (eSel) {
                    console.warn("[Ficha] Erro ao inicializar selectpicker:", eSel);
                    $select.val(defaultMun);
                }
            } else {
                $select.val(defaultMun);
            }

            window.fichaFiltrosCarregados = true;
            window.sincronizarBotaoFiltroMunicipio(defaultMun);

            $select.off('change').on('change', function () { 
                const val = $(this).val();
                window.sincronizarBotaoFiltroMunicipio(val);
                window.carregarDadosFicha(val); 
            });
            await window.carregarDadosFicha(defaultMun);
        }
    } catch (e) {
        console.error("[Ficha] Erro na inicialização:", e);
    } finally {
        if (typeof window.ocultarCarregamento === 'function') window.ocultarCarregamento();
    }
};
window.iniciarModuloMunicipios = window.iniciarModuloFicha;

window.sincronizarBotaoFiltroMunicipio = function(nomeMun) {
    if (!nomeMun) return;
    const $select = $('#ficha_f_municipio');
    if (!$select.length) return;

    if ($select.val() !== nomeMun) {
        $select.val(nomeMun);
    }
    if (typeof $select.selectpicker === 'function' && $select.data('selectpicker')) {
        try {
            $select.selectpicker('val', nomeMun);
            $select.selectpicker('refresh');
        } catch(e) {}
    }
    
    // Atualização visual direta no elemento do botão do Bootstrap-Select
    const $btnWrapper = $select.closest('.bootstrap-select');
    if ($btnWrapper.length) {
        $btnWrapper.find('.filter-option-inner-inner').text(nomeMun);
        $btnWrapper.find('button.dropdown-toggle').attr('title', nomeMun);
    }
    $('#controles_ficha_municipal .bootstrap-select .filter-option-inner-inner').text(nomeMun);
    $('#controles_ficha_municipal .bootstrap-select button.dropdown-toggle').attr('title', nomeMun);
};

window.carregarDadosFicha = async function (munParam) {
    const $select = $('#ficha_f_municipio');
    if (munParam && $select.val() !== munParam) {
        if (typeof $select.selectpicker === 'function') {
            try { $select.selectpicker('val', munParam); } catch (e) { $select.val(munParam); }
        } else {
            $select.val(munParam);
        }
    }
    const municipio = $select.val();
    if (!municipio) return;

    if (typeof window.mostrarCarregamento === 'function') window.mostrarCarregamento("CARREGANDO ANÁLISE...");

    try {
        const res = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/data`.replace(/\/+/g, '/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ municipio: municipio })
        });

        const json = await res.json();
        if (json.error) throw new Error(json.details || json.error);

        // Atualiza a badge com a data retornada pela rota
        if (json.data_atualizacao) {
            window.renderizarBadgeDataAtualizacao(json.data_atualizacao);
        }

        dadosBrutosFicha = json.indicadores || [];
        if (json.geojson_pe && !geoJSONEstadualPE) {
            geoJSONEstadualPE = typeof json.geojson_pe === 'string' ? JSON.parse(json.geojson_pe) : json.geojson_pe;
        }
        cacheSociaisRD = {
            geojsonRD: json.geojson_rd,
            demografiaRD: json.demografia_rd || [],
            indicadoresRD: json.indicadores_rd || [],
            iniciativasRD: json.iniciativas_rd || [],
            pcpRD: json.pcp_rd || [],
            nomeMun: municipio
        };

        renderizarFicha(
            municipio, 
            json.demografia, 
            json.indicadores, 
            json.geojson, 
            json.iniciativas, 
            json.emendas, 
            json.fiscais, 
            json.pcp, 
            json.vocacoes,
            json.diagnostico,
            json.fontes_referencia,
            json.empresas_resumo,
            json.empresas_saldo_mensal,
            json.empresas_setor,
            json.empresas_faixa_etaria,
            json.empresas_bairros,
            json.empresas_pe_resumo,
            json.agricultura_pam,
            json.agricultura_lspa
        );
    } catch (e) {
        console.error("[Ficha] Erro ao buscar dados:", e);
    } finally {
        if (typeof window.ocultarCarregamento === 'function') window.ocultarCarregamento();
    }
};

/* ==========================================================================
   5. RENDERIZADOR PRINCIPAL (FICHA MUNICIPAL)
   ========================================================================== */
function renderizarFicha(nomeMun, demo, ind, geojsonStr, iniciativas, emendas, fiscais, pcp, vocacoes, diagApi, fontesApi, empresasResumo, empresasSaldo, empresasSetor, empresasFaixa, empresasBairros, empresasPe, agriPam, agriLspa) {
    // Garante sincronização imediata do seletor e do label do botão na navbar
    window.sincronizarBotaoFiltroMunicipio(nomeMun);

    const extrairValor = (obj, key, fallback) => (obj && obj[key] && obj[key][0] !== undefined) ? obj[key][0] : fallback;
    const getRankBadge = (rank) => window.getRankTexto(rank);

    // --- 5.1 TÍTULOS E CABEÇALHO ---
    document.getElementById('ficha_nome_municipio').innerText = nomeMun;
    const elCapaNome = document.getElementById('capa_nome_municipio');
    if (elCapaNome) elCapaNome.innerText = nomeMun;

    $('#topbar_nome_municipio').text(nomeMun);
    $('#topbar_mun_badge').removeClass('d-none').show();

    const rdNome = extrairValor(demo, 'regiao_de_desenvolvimento', extrairValor(demo, 'Região de Desenvolvimento', '-'));
    $('#ficha_rd_subtitle').text(rdNome);

    // Atualiza município e RD em tela para o Mapa Multidimensional
    if (typeof window.atualizarMunicipioEmTelaMulti === 'function') {
        window.atualizarMunicipioEmTelaMulti(nomeMun, rdNome);
    }
    $('#ficha_apl_subtitle').text(extrairValor(demo, 'arranjos_produtivos_locais', 'Sem APL'));

    const popVal = parseFloat(extrairValor(demo, 'pop_2026', 0)) || 0;
    const areaVal = parseFloat(extrairValor(demo, 'area_km2', 0)) || 0;
    const rankPop = extrairValor(demo, 'rank_pop', null) || window.obterRankPopulacao(nomeMun);

    // Identificação do PIB Total para Navbar e Resumo
    const itensPib = (ind || []).filter(i => String(i.sigla_indicador || '').trim().toLowerCase() === 'pib_1000');
    let pibValMil = 0;
    let rankPib = '-';
    if (itensPib.length > 0) {
        itensPib.sort((a, b) => b.ano - a.ano);
        pibValMil = parseFloat(String(itensPib[0].indicador).replace(',', '.')) || 0;
        rankPib = itensPib[0].rank_pe || '-';
    }

    let pibFormatado = '-';
    if (pibValMil >= 1000000) {
        pibFormatado = `R$ ${(pibValMil / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
    } else if (pibValMil >= 1000) {
        pibFormatado = `R$ ${(pibValMil / 1e3).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
    } else if (pibValMil > 0) {
        pibFormatado = `R$ ${pibValMil.toLocaleString('pt-BR')} mil`;
    }

    const popFormatada = popVal > 0 ? `${popVal.toLocaleString('pt-BR')} hab.` : '-';

        // --- 5.1b PREFEITO, ANIVERSÁRIO E POVOS TRADICIONAIS ---
    const itemPrefeito = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'nome_prefeito');
    const itemPartido = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'partido_prefeito');
    const nomePrefeito = (itemPrefeito && itemPrefeito.indicador && itemPrefeito.indicador !== '-') ? String(itemPrefeito.indicador).trim() : '-';
    const partidoPrefeito = (itemPartido && itemPartido.indicador && itemPartido.indicador !== '-') ? String(itemPartido.indicador).trim() : '';
    const txtPrefeito = nomePrefeito !== '-' ? (partidoPrefeito ? `${nomePrefeito} (${partidoPrefeito})` : nomePrefeito) : '-';
    $('#ficha_prefeito_subtitle').text(`Prefeito(a): ${txtPrefeito}`);

    const itemAniversario = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'aniversario_municipio');
    const dataAniversario = (itemAniversario && itemAniversario.indicador && itemAniversario.indicador !== '-') ? String(itemAniversario.indicador).trim() : '-';
    $('#ficha_aniversario_subtitle').text(`Aniversário: ${dataAniversario}`);

    const itemQuilombola = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'pop_quilombola');
    let valQuilombola = (itemQuilombola && itemQuilombola.indicador !== undefined && itemQuilombola.indicador !== null && itemQuilombola.indicador !== '-') ? parseFloat(String(itemQuilombola.indicador).replace(',', '.')) : null;
    const rankQuilombola = (itemQuilombola && itemQuilombola.rank_pe) ? ` (${itemQuilombola.rank_pe}º em PE)` : '';
    const txtQuilombola = (valQuilombola !== null && !isNaN(valQuilombola)) ? `${valQuilombola.toLocaleString('pt-BR')} hab.${rankQuilombola}` : '0 hab.';
    $('#ficha_pop_quilombola_subtitle').text(`Pop. Quilombola: ${txtQuilombola}`);

    const itemIndigena = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'pop_indigena');
    let valIndigena = (itemIndigena && itemIndigena.indicador !== undefined && itemIndigena.indicador !== null && itemIndigena.indicador !== '-') ? parseFloat(String(itemIndigena.indicador).replace(',', '.')) : null;
    const rankIndigena = (itemIndigena && itemIndigena.rank_pe) ? ` (${itemIndigena.rank_pe}º em PE)` : '';
    const txtIndigena = (valIndigena !== null && !isNaN(valIndigena)) ? `${valIndigena.toLocaleString('pt-BR')} hab.${rankIndigena}` : '0 hab.';
    $('#ficha_pop_indigena_subtitle').text(`Pop. Indígena: ${txtIndigena}`);

    $('#ficha_pop_subtitle').text(popVal > 0 ? `${popVal.toLocaleString('pt-BR')} hab. (${rankPop}º em PE - estimativa IBGE 2026)` : 'Pop: -');
    $('#ficha_area_subtitle').text(areaVal > 0 ? `${areaVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} km²` : 'Área: -');

    const obterPctPop = (sigla) => {
        const item = (ind || []).find(i => String(i.sigla_indicador).trim().toLowerCase() === sigla.toLowerCase());
        if (!item || item.indicador === undefined || item.indicador === null || item.indicador === '-') return '-';
        let val = parseFloat(String(item.indicador).replace(',', '.'));
        if (isNaN(val)) return '-';
        if (val <= 1 && val > 0) val = val * 100;
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
    };

    $('#ficha_pop_urb_subtitle').text(obterPctPop('perc_pop_urb') !== '-' ? `Pop. Urbana: ${obterPctPop('perc_pop_urb')} (Censo IBGE 2022)` : 'Pop. Urbana: -');
    $('#ficha_pop_rur_subtitle').text(obterPctPop('perc_pop_rur') !== '-' ? `Pop. Rural: ${obterPctPop('perc_pop_rur')} (Censo IBGE 2022)` : 'Pop. Rural: -');

    // Badges de cabeçalho e barras proporcionais
    $('#ficha_rd_badge').text(rdNome ? (rdNome.toLowerCase().startsWith('rd') ? rdNome : `RD ${rdNome}`) : 'RD');
    $('#ficha_rank_pop_badge').text(`${rankPop}º em PE`);

    const rawPctUrb = (ind || []).find(i => String(i.sigla_indicador).trim().toLowerCase() === 'perc_pop_urb');
    let valUrbNum = rawPctUrb ? parseFloat(String(rawPctUrb.indicador).replace(',', '.')) : 0;
    if (valUrbNum <= 1 && valUrbNum > 0) valUrbNum *= 100;
    let valRurNum = valUrbNum > 0 ? (100 - valUrbNum) : 0;
    if (valUrbNum > 0) {
        $('#ficha_bar_pop_urb').css('width', `${valUrbNum.toFixed(1)}%`);
        $('#ficha_bar_pop_rur').css('width', `${valRurNum.toFixed(1)}%`);
    }

    // --- 5.2 TAG DE FIBRA ÓTICA ---
    const itensFibra = (ind || []).filter(i => String(i.sigla_indicador).trim().toLowerCase() === 'cob_fibra');
    const $badgeCont = $('#badge_fibra_container');
    const $iconFibra = $('#icon_fibra');
    const $txtFibra = $('#ficha_fibra_subtitle');

    $badgeCont.removeClass('text-dark text-danger text-warning text-primary text-info text-success border-danger-subtle border-warning-subtle border-primary-subtle border-info-subtle border-success-subtle');
    $iconFibra.removeClass('text-secondary text-danger text-warning text-primary text-info text-success');

    if (!itensFibra.length) {
        $txtFibra.text("Fibra: S/ Info");
        $badgeCont.addClass('text-dark');
        $iconFibra.addClass('text-secondary');
    } else {
        itensFibra.sort((a, b) => b.ano - a.ano);
        let valFibra = parseFloat(String(itensFibra[0].indicador).replace(',', '.'));

        if (isNaN(valFibra) || valFibra === 0) {
            $txtFibra.text("Sem Fibra Ótica");
            $badgeCont.addClass('text-danger border-danger-subtle');
            $iconFibra.addClass('text-danger');
        } else {
            let pct = (valFibra <= 1 && valFibra > 0) ? valFibra * 100 : valFibra;
            let classe = "Alta", corClasse = "text-success", corBorda = "border-success-subtle";

            if (pct <= 20) { classe = "Muito Baixa"; corClasse = "text-danger"; corBorda = "border-danger-subtle"; }
            else if (pct <= 40) { classe = "Baixa"; corClasse = "text-warning"; corBorda = "border-warning-subtle"; }
            else if (pct <= 60) { classe = "Média"; corClasse = "text-primary"; corBorda = "border-primary-subtle"; }
            else if (pct <= 80) { classe = "Média Alta"; corClasse = "text-info"; corBorda = "border-info-subtle"; }

            $txtFibra.text(`Fibra: ${classe} (${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)`);
            $badgeCont.addClass(`${corClasse} ${corBorda}`);
            $iconFibra.addClass(corClasse);
        }
    }

    if ($badgeCont.find('.icon-metadado-fibra').length === 0) {
        const metaFibra = window.dadosMetadados.find(m => String(m.cd_indicador || '').trim().toLowerCase() === 'cob_fibra');
        if (metaFibra) {
            $badgeCont.append(` <i class="fas fa-info-circle icon-metadado-fibra text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="event.stopPropagation(); window.abrirModalMetadado('cob_fibra')" title="Ver Metadados"></i>`);
        }
    }

    // --- 5.3 KPIS DE CARACTERIZAÇÃO ---
    const aplicarKPI = (sigla, elemBase, unidadeTag) => {
        const itens = (ind || []).filter(i => String(i.sigla_indicador).trim().toLowerCase() === String(sigla).toLowerCase());
        if (!itens.length) {
            $(`#ficha_kpi_${elemBase}`).text("-");
            $(`#ficha_ano_${elemBase}`).html(`${unidadeTag} &bull; <span style="opacity: 0.6;">Sem dados</span>`);
            return;
        }
        itens.sort((a, b) => b.ano - a.ano);
        const itemRecente = itens[0];
        const tipoNorm = String(itemRecente.tipo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        let val = parseFloat(String(itemRecente.indicador).replace(',', '.'));
        let textoValor = "-";

        if (!isNaN(val)) {
            if (tipoNorm === 'percentual') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) + "%";
            else if (tipoNorm === 'moeda') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            else if (tipoNorm === 'absoluto') textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            else if (tipoNorm === 'indice') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
            else textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        } else {
            textoValor = itemRecente.indicador;
        }

        $(`#ficha_kpi_${elemBase}`).text(textoValor);
        $(`#ficha_ano_${elemBase}`).html(window.montarRodapeKPI(unidadeTag, itemRecente.ano, itemRecente.rank_pe, sigla));

        const meta = window.dadosMetadados.find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        window.configurarBotoesKPI(elemBase, sigla, meta ? meta.nm_indicador : null, 'socio');
    };

    const aplicarKPIVab = () => {
        const getVal = (sigla) => {
            const itens = (ind || []).filter(i => String(i.sigla_indicador).trim().toLowerCase() === sigla.toLowerCase());
            if (!itens.length) return null;
            itens.sort((a, b) => b.ano - a.ano);
            return itens[0];
        };

        const itemAgro = getVal("vab_agro"), itemInd = getVal("vab_ind"), itemServ = getVal("vab_serv"), itemAdm = getVal("vab_adm");
        const valAgro = itemAgro ? parseFloat(String(itemAgro.indicador).replace(',', '.')) || 0 : 0;
        const valInd = itemInd ? parseFloat(String(itemInd.indicador).replace(',', '.')) || 0 : 0;
        const valServ = itemServ ? parseFloat(String(itemServ.indicador).replace(',', '.')) || 0 : 0;
        const valAdm = itemAdm ? parseFloat(String(itemAdm.indicador).replace(',', '.')) || 0 : 0;
        const totalVab = valAgro + valInd + valServ + valAdm;

        const qlMediaPE = {
            vab_agro: 12.886,
            vab_ind: 10.672,
            vab_serv: 31.900,
            vab_adm: 44.543
        };

        const renderVab = (item, val, elemBase, sigla) => {
            if (!item || totalVab === 0) {
                $(`#ficha_kpi_${elemBase}`).text("-");
                $(`#ficha_ano_${elemBase}`).html(`% do VAB &bull; <span style="opacity: 0.6;">Sem dados</span>`);
                $(`#ficha_ql_box_${elemBase}`).html(`<div class="d-flex justify-content-between align-items-center w-100"><span class="text-slate-400" style="font-size: 0.72rem;">QL Setorial:</span> <span class="text-slate-400" style="font-size: 0.75rem;">-</span></div>`);
                return;
            }
            const pct = (val / totalVab) * 100;
            $(`#ficha_kpi_${elemBase}`).text(pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%");
            $(`#ficha_ano_${elemBase}`).html(window.montarRodapeKPI("% do VAB", item.ano, item.rank_pe, sigla));

            // Cálculo e renderização do Quociente Locacional (QL)
            const refMedia = qlMediaPE[sigla.toLowerCase()] || 0;
            if (refMedia > 0) {
                const qlVal = pct / refMedia;
                const isEspec = qlVal >= 1.0;
                const badgeHtml = isEspec
                    ? `<span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-pill font-bold px-1.5 py-0.5" style="font-size: 0.65rem;" title="QL ≥ 1.0: Especialização relativa acima da média de Pernambuco">Espec.</span>`
                    : `<span class="badge bg-slate-100 text-slate-500 border border-slate-200 rounded-pill font-medium px-1.5 py-0.5" style="font-size: 0.65rem;" title="QL < 1.0: Sem especialização relativa">&lt; 1</span>`;

                $(`#ficha_ql_box_${elemBase}`).html(`
                    <div class="d-flex align-items-center justify-content-between w-100">
                        <span class="text-slate-500 fw-semibold" style="font-size: 0.72rem;" title="Quociente Locacional: razão entre a participação do setor no município e a média de Pernambuco">QL Setorial:</span>
                        <div class="d-flex align-items-center gap-1">
                            <strong class="text-slate-800" style="font-size: 0.78rem;">${qlVal.toFixed(2)}</strong>
                            ${badgeHtml}
                        </div>
                    </div>
                `);
            } else {
                $(`#ficha_ql_box_${elemBase}`).html(`<div class="d-flex justify-content-between align-items-center w-100"><span class="text-slate-400" style="font-size: 0.72rem;">QL Setorial:</span> <span class="text-slate-400" style="font-size: 0.75rem;">-</span></div>`);
            }

            const metaVab = window.dadosMetadados.find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
            window.configurarBotoesKPI(elemBase, sigla, metaVab ? metaVab.nm_indicador : null, 'socio');
        };

        renderVab(itemAgro, valAgro, "vab_agro", "vab_agro");
        renderVab(itemInd, valInd, "vab_ind", "vab_ind");
        renderVab(itemServ, valServ, "vab_serv", "vab_serv");
        renderVab(itemAdm, valAdm, "vab_adm", "vab_adm");

        // Atualizar barra segmentada de 100% do VAB Setorial
        if (totalVab > 0) {
            const pAgro = (valAgro / totalVab) * 100;
            const pInd = (valInd / totalVab) * 100;
            const pServ = (valServ / totalVab) * 100;
            const pAdm = (valAdm / totalVab) * 100;
            $('#vab_bar_agro').css('width', `${pAgro}%`).attr('title', `Agropecuária: ${pAgro.toFixed(1)}%`);
            $('#vab_bar_ind').css('width', `${pInd}%`).attr('title', `Indústria: ${pInd.toFixed(1)}%`);
            $('#vab_bar_serv').css('width', `${pServ}%`).attr('title', `Serviços: ${pServ.toFixed(1)}%`);
            $('#vab_bar_adm').css('width', `${pAdm}%`).attr('title', `Administração Pública: ${pAdm.toFixed(1)}%`);
        }
    };

    aplicarKPI("pibpc", "pibpc", "R$");
    aplicarKPI("pib_pct", "pib_pct", "%");
    aplicarKPI("pib_1000", "pib_1000", "R$ 1.000");
    aplicarKPI("idhm", "idhm", "ÍNDICE");
    aplicarKPIVab();

    // --- 5.4 MAPA DE CARACTERIZAÇÃO ---
    const mapDom = document.getElementById('ficha_map_container');
    if (mapDom && geojsonStr) {
        const geoData = obterGeoJSONSeguro(geojsonStr);
        if (geoData) {
            const fitBoundsToFeature = (mapInst) => {
                try {
                    const bounds = new maplibregl.LngLatBounds();
                    const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
                    let coords = null;
                    let geomType = null;
                    if (geoData.features && geoData.features.length > 0 && geoData.features[0].geometry) {
                        coords = geoData.features[0].geometry.coordinates;
                        geomType = geoData.features[0].geometry.type;
                    } else if (geoData.geometry) {
                        coords = geoData.geometry.coordinates;
                        geomType = geoData.geometry.type;
                    }
                    if (coords) {
                        if (geomType === 'Polygon') coords[0].forEach(processCoord);
                        else if (geomType === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
                    }

                    if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 30, animate: false });
                } catch (e) {
                    console.warn("[Ficha] Erro ao calcular limites do mapa principal:", e);
                }
            };

            if (mapFicha && mapFicha.loaded && mapFicha.loaded() && mapFicha.getSource('mun_source')) {
                mapFicha.getSource('mun_source').setData(geoData);
                fitBoundsToFeature(mapFicha);
                mapFicha.resize();
            } else {
                if (mapFicha) {
                    try { mapFicha.remove(); } catch(e) {}
                }
                mapFicha = new maplibregl.Map({
                    container: 'ficha_map_container',
                    style: window.obterEstiloBaseMapa(),
                    center: [parseFloat(extrairValor(demo, 'longitude', -37.8)), parseFloat(extrairValor(demo, 'latitude', -8.3))],
                    zoom: 8, preserveDrawingBuffer: true
                });
                mapFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
                mapFicha.on('load', () => {
                    mapFicha.resize();
                    mapFicha.addSource('mun_source', { type: 'geojson', data: geoData });
                    mapFicha.addLayer({ id: 'mun_fill', type: 'fill', source: 'mun_source', paint: { 'fill-color': '#0066FF', 'fill-opacity': 0.3 } });
                    mapFicha.addLayer({ id: 'mun_line', type: 'line', source: 'mun_source', paint: { 'line-color': '#0C2856', 'line-width': 2 } });
                    fitBoundsToFeature(mapFicha);
                });
            }
        }
    }

    // --- 5.5 CHAMADA DOS DEMAIS RENDERIZADORES ---
    const munKey = String(nomeMun || '').trim().toLowerCase();
    const diagMun = diagApi || (window.diagnosticoRegional ? window.diagnosticoRegional[munKey] : null);
    const fontesRef = fontesApi || window.fontesReferenciaRegional || {};

    try { renderizarResumoExecutivo(nomeMun, demo, ind, fiscais, vocacoes, diagMun, rankPop, pibValMil, rankPib, pibFormatado); } catch(e) { console.error("[Ficha] Erro em renderizarResumoExecutivo:", e); }
    try { renderizarDiagnosticoRegional(nomeMun, diagMun, fontesRef); } catch(e) { console.error("[Ficha] Erro em renderizarDiagnosticoRegional:", e); }

    try { renderizarIndicadoresSociais(demo, ind); } catch(e) { console.error("[Ficha] Erro em renderizarIndicadoresSociais:", e); }
    try { renderizarVocacoes(vocacoes || []); } catch(e) { console.error("[Ficha] Erro em renderizarVocacoes:", e); }
    try { renderizarIndicadoresTrabalho(ind, demo); } catch(e) { console.error("[Ficha] Erro em renderizarIndicadoresTrabalho:", e); }
    try { renderizarIndicadoresConectividade(ind, demo); } catch(e) { console.error("[Ficha] Erro em renderizarIndicadoresConectividade:", e); }
    try { renderizarIndicadoresInovacao(ind, demo); } catch(e) { console.error("[Ficha] Erro em renderizarIndicadoresInovacao:", e); }
    try { renderizarIndicadoresComercio(ind, demo); } catch(e) { console.error("[Ficha] Erro em renderizarIndicadoresComercio:", e); }
    try { renderizarDinamicaEmpresas(empresasResumo, empresasSaldo, empresasSetor, empresasFaixa, empresasBairros, empresasPe, nomeMun); } catch(e) { console.error("[Ficha] Erro em renderizarDinamicaEmpresas:", e); }
    try { renderizarAgriculturaEstiagem(agriPam, agriLspa, nomeMun, demo); } catch(e) { console.error("[Ficha] Erro em renderizarAgriculturaEstiagem:", e); }
    
    window.dadosFiscaisMun = fiscais || [];
    try { renderizarDadosFiscais(fiscais || [], ind || [], demo || {}); } catch(e) { console.error("[Ficha] Erro em renderizarDadosFiscais:", e); }

   // try { renderizarTransferenciasRenda(iniciativas || [], pcp || []); } catch(e) { console.error("[Ficha] Erro em renderizarTransferenciasRenda:", e); }
   try { renderizarTransferenciasRenda(iniciativas || [], pcp || [], nomeMun, demo); } catch(e) { console.error("[Ficha] Erro em renderizarTransferenciasRenda:", e); }
    try { renderizarIniciativasFicha(iniciativas || [], demo || {}); } catch(e) { console.error("[Ficha] Erro em renderizarIniciativasFicha:", e); }
    try { renderizarEmendasFicha(emendas || []); } catch(e) { console.error("[Ficha] Erro em renderizarEmendasFicha:", e); }
    try {
        const codIbgeMun = (demo && (demo.cod_ibge || demo.ibge7 || demo.ibge6)) ? (demo.cod_ibge || demo.ibge7 || demo.ibge6) : '';
        if (typeof window.atualizarKpisProgramasMunicipais === 'function') {
            window.atualizarKpisProgramasMunicipais(nomeMun, codIbgeMun);
        }
    } catch(e) { console.error("[Ficha] Erro em atualizarKpisProgramasMunicipais:", e); }
    if (typeof window.garantirBotoesTodosKPIs === 'function') {
        window.garantirBotoesTodosKPIs();
    }
}

/* ==========================================================================
   6. SUBSEÇÕES DE RENDERIZAÇÃO E MAPAS REGIONAIS
   ========================================================================== */

function renderizarMapaTrabalhoRD() {
    const mapDom = document.getElementById('ficha_map_trabalho_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD || !metricaTrabalhoAtiva) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
            const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || '').substring(0, 6) === ibgeCode;
            const matchName = normText(i.nm_municipio).includes(normName);
            return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === metricaTrabalhoAtiva.toLowerCase().trim();
        }).sort((a, b) => b.ano - a.ano);

        let vAtiva = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
        ft.properties.val_ativa = vAtiva;
        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);

        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E1F5FE', maxVal, '#0277BD'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapTrabalhoFicha && mapTrabalhoFicha.getSource('rd_trabalho_source')) {
        mapTrabalhoFicha.getSource('rd_trabalho_source').setData(geoData);
        mapTrabalhoFicha.setPaintProperty('rd_trabalho_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapTrabalhoFicha);
        mapTrabalhoFicha.resize();
        return;
    }

    if (mapTrabalhoFicha) mapTrabalhoFicha.remove();
    mapTrabalhoFicha = new maplibregl.Map({
        container: 'ficha_map_trabalho_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapTrabalhoFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapTrabalhoFicha.on('load', () => {
        mapTrabalhoFicha.resize();
        mapTrabalhoFicha.addSource('rd_trabalho_source', { type: 'geojson', data: geoData });
        mapTrabalhoFicha.addLayer({ id: 'rd_trabalho_fill', type: 'fill', source: 'rd_trabalho_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapTrabalhoFicha.addLayer({ id: 'rd_trabalho_line', type: 'line', source: 'rd_trabalho_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapTrabalhoFicha.on('mousemove', 'rd_trabalho_fill', (e) => {
            mapTrabalhoFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>Valor:</b> <span style="color:#0277BD; font-weight:800;">${Number(p.val_ativa || 0).toLocaleString('pt-BR')}</span></div>
                </div>
            `).addTo(mapTrabalhoFicha);
        });
        mapTrabalhoFicha.on('mouseleave', 'rd_trabalho_fill', () => { mapTrabalhoFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapTrabalhoFicha);
    });
}

/* --- 6.1 DEMOGRAFIA --- */
function renderizarMapaDemografiaRD() {
    const mapDom = document.getElementById('ficha_map_demografia_container');
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!mapDom || !geoData || !geoData.features) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    let minVal = Infinity, maxVal = -Infinity;

    const siglasDemografia = ['rd_pop', 'rd_jovem', 'rd_idosa', 'pct_pia', 'ind_envelhecimento', 'pct_longevidade', 'ind_ir_pia', 'pct_jovem', 'ind_renov_trabalho'];

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');

        siglasDemografia.forEach(sig => {
            const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => normText(i.nm_municipio).includes(normName) && String(i.sigla_indicador).toLowerCase() === sig);
            indArr.sort((a, b) => b.ano - a.ano);

            let v = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
            const isPerc = ['pct_pia', 'pct_longevidade', 'pct_jovem'].includes(sig);
            if (isPerc && v <= 1 && v > 0) v = v * 100;

            ft.properties[sig] = v;
            ft.properties[`${sig}_tipo`] = indArr.length && indArr[0].tipo ? String(indArr[0].tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : (isPerc ? 'percentual' : 'indice');
        });

        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);
        let vAtiva = ft.properties[metricaDemografiaAtiva] || 0;
        ft.properties.val_ativa = vAtiva;

        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E3F2FD', maxVal, '#1565C0'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapDemografiaFicha && mapDemografiaFicha.getSource('rd_demografia_source')) {
        mapDemografiaFicha.getSource('rd_demografia_source').setData(geoData);
        mapDemografiaFicha.setPaintProperty('rd_demografia_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapDemografiaFicha);
        mapDemografiaFicha.resize();
        return;
    }

    if (mapDemografiaFicha) mapDemografiaFicha.remove();
    mapDemografiaFicha = new maplibregl.Map({
        container: 'ficha_map_demografia_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapDemografiaFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapDemografiaFicha.on('load', () => {
        mapDemografiaFicha.resize();
        mapDemografiaFicha.addSource('rd_demografia_source', { type: 'geojson', data: geoData });
        mapDemografiaFicha.addLayer({ id: 'rd_demografia_fill', type: 'fill', source: 'rd_demografia_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapDemografiaFicha.addLayer({ id: 'rd_demografia_line', type: 'line', source: 'rd_demografia_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapDemografiaFicha.on('mousemove', 'rd_demografia_fill', (e) => {
            mapDemografiaFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = {
                'rd_pop': 'Razão de Dependência Total', 'rd_jovem': 'Razão de Dependência Jovem', 'rd_idosa': 'Razão de Dependência Idosa',
                'pct_pia': 'Pop. em Idade Ativa (PIA) %', 'ind_envelhecimento': 'Índice de Envelhecimento', 'pct_longevidade': 'Superlongevidade %',
                'ind_ir_pia': 'Renovação da PIA', 'pct_jovem': 'Peso Relativo da Juventude %', 'ind_renov_trabalho': 'Renovação do Trabalho'
            };
            const tipo = p[`${metricaDemografiaAtiva}_tipo`];
            let valFmt = (tipo === 'percentual') ? Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%' : Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>${labels[metricaDemografiaAtiva]}:</b> <span style="color:#1565C0; font-weight:800;">${valFmt}</span></div>
                </div>
            `).addTo(mapDemografiaFicha);
        });
        mapDemografiaFicha.on('mouseleave', 'rd_demografia_fill', () => { mapDemografiaFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapDemografiaFicha);
    });
}

/* --- 6.2 INDICADORES SOCIAIS (SEGURANÇA, EDUCAÇÃO, SAÚDE) --- */
function renderizarIndicadoresSociais(demo, ind) {
    const extrairValor = (obj, key, fallback) => (obj && obj[key] && obj[key][0] !== undefined) ? obj[key][0] : fallback;
    const pop2025 = parseFloat(extrairValor(demo, 'pop_2026', 0)) || 0;

    const obterIndicador = (sigla) => {
        const sNorm = String(sigla).trim().toLowerCase();
        const itens = (ind || []).filter(i => String(i.sigla_indicador).trim().toLowerCase() === sNorm);
        if (itens.length > 0) {
            itens.sort((a, b) => b.ano - a.ano);
            const rawStr = String(itens[0].indicador).trim();
            const val = parseFloat(rawStr.replace(',', '.'));
            const tipoRaw = itens[0].tipo ? String(itens[0].tipo) : 'absoluto';
            return {
                val: isNaN(val) ? 0 : val,
                str: rawStr,
                ano: itens[0].ano || '-',
                mes: itens[0].mes_referencia || '',
                rank: itens[0].rank_pe || null,
                tipo: tipoRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            };
        }

        // Fallback robusto para variáveis nativas do cadastro demográfico
        const valDemo = extrairValor(demo, sNorm, null) || extrairValor(demo, sigla, null);
        if (valDemo !== null && valDemo !== undefined && String(valDemo).trim() !== '' && String(valDemo).trim() !== 'n.d.') {
            const rawStr = String(valDemo).trim();
            const val = parseFloat(rawStr.replace(',', '.'));
            let t = 'absoluto';
            if (sNorm.includes('pct') || sNorm.includes('perc') || sNorm.includes('peso_')) t = 'percentual';
            else if (sNorm.includes('ind') || sNorm.includes('rd_')) t = 'indice';
            return {
                val: isNaN(val) ? 0 : val,
                str: rawStr,
                ano: 2026,
                mes: '',
                rank: null,
                tipo: t
            };
        }

        return { val: 0, str: '-', ano: '-', mes: '', rank: null, tipo: 'absoluto' };
    };

    const getRankBadge = (rank) => window.getRankTexto(rank);

    // Segurança
    const mviData = obterIndicador('mvi'), cvpData = obterIndicador('cvp'), txMviData = obterIndicador('tx_mvi'), txCvpData = obterIndicador('tx_cvp');
    const mviTaxa = pop2025 > 0 ? (mviData.val / pop2025) * 100000 : 0;
    const cvpTaxa = pop2025 > 0 ? (cvpData.val / pop2025) * 100000 : 0;
    const refMviFmt = (mviData.mes && mviData.mes !== '-') ? `${mviData.mes}/${mviData.ano}` : mviData.ano;

    $('#ficha_kpi_mvi_abs').text(mviData.val.toLocaleString('pt-BR'));
    $('#ficha_ano_mvi_abs').html(window.montarRodapeKPI('Casos', refMviFmt, mviData.rank, 'mvi'));
    $('#ficha_kpi_mvi_taxa').text(mviTaxa.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    $('#ficha_ano_mvi_taxa').html(window.montarRodapeKPI('/ 100k hab.', refMviFmt, txMviData.rank || mviData.rank, 'tx_mvi'));
    $('#ficha_kpi_cvp_abs').text(cvpData.val.toLocaleString('pt-BR'));
    $('#ficha_ano_cvp_abs').html(window.montarRodapeKPI('Ocorrências', refMviFmt, cvpData.rank, 'cvp'));
    $('#ficha_kpi_cvp_taxa').text(cvpTaxa.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    $('#ficha_ano_cvp_taxa').html(window.montarRodapeKPI('/ 100k hab.', refMviFmt, txCvpData.rank || cvpData.rank, 'tx_cvp'));

    // Formatador Universal
    const aplicarKPI_Universal = (sigla, elemBase, sufixo) => {
        const item = obterIndicador(sigla);
        let valFmt = item.str;

        if (item.str !== '-') {
            if (item.tipo === 'percentual') valFmt = item.val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
            else if (item.tipo === 'absoluto') valFmt = item.val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            else if (item.tipo === 'indice') {
                let casas = (sigla.startsWith('ivcad')) ? 3 : (['rd_pop', 'rd_jovem', 'rd_idosa', 'ind_envelhecimento', 'ind_ir_pia', 'ind_renov_trabalho', 'indice_gini'].includes(sigla) ? 2 : 1);
                valFmt = item.val.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
            } else valFmt = item.val.toLocaleString('pt-BR');
        }

        $(`#ficha_kpi_${elemBase}`).text(valFmt);
        $(`#ficha_ano_${elemBase}`).html(window.montarRodapeKPI(sufixo, item.ano, item.rank, sigla));

        const metaSub = window.dadosMetadados.find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        window.configurarBotoesKPI(elemBase, sigla, metaSub ? metaSub.nm_indicador : null, 'socio');
    };

    // Aplicação dos KPIs
    ['feminicidio', 'tent_mvi', 'rfv', 'vcm_ameaca', 'vcm_lesao', 'vcm_vs'].forEach(s => aplicarKPI_Universal(s, s, s === 'feminicidio' ? 'Casos' : 'Ocorrências'));
    ['rd_pop', 'rd_jovem', 'rd_idosa', 'pct_pia', 'ind_envelhecimento', 'pct_longevidade', 'ind_ir_pia', 'pct_jovem', 'ind_renov_trabalho'].forEach(s => aplicarKPI_Universal(s, s, s.includes('pct') ? '%' : 'Índice'));
    ['ideb_5ano', 'tdi_5ano', 'aba_5ano', 'apr_5ano', 'rep_5ano', 'ideb_9ano', 'tdi_9ano', 'aba_9ano', 'apr_9ano', 'rep_9ano', 'mat_6_10', 'mat_11_14', 'perc_mat_int', 'perc_alfabetizacao', 'atliq_creche'].forEach(s => aplicarKPI_Universal(s, s, s.includes('mat_') ? 'Alunos' : (s.includes('ideb') ? 'Índice' : '%')));
    ['pre_natal', 'razao_mm', 'tx_att', 'tx_dcnt', 'tx_evitaveis', 'tx_infancia', 'tx_infantil'].forEach(s => aplicarKPI_Universal(s, s, s === 'pre_natal' ? '%' : 'Taxa'));
    ['cad_pessoas', 'tx_cad_pessoas', 'indice_gini', 'ivcad', 'ivcad_nc', 'ivcad_dpi', 'ivcad_dca', 'ivcad_tqa', 'ivcad_dr', 'ivcad_ch'].forEach(s => aplicarKPI_Universal(s, s, s === 'cad_pessoas' ? 'Pessoas' : (s === 'tx_cad_pessoas' ? '%' : 'Índice')));
    ['pct_agua_rede', 'pct_esgoto_rede'].forEach(s => aplicarKPI_Universal(s, s, '% Domicílios'));

    const rdNome = extrairValor(demo, 'regiao_de_desenvolvimento', extrairValor(demo, 'Região de Desenvolvimento', '-'));
    $('#ficha_demografia_rd_titulo, #ficha_sociais_rd_titulo, #ficha_educacao_rd_titulo, #ficha_saude_rd_titulo, #ficha_cad_unico_rd_titulo, #ficha_saneamento_rd_titulo').text(`Municípios da RD ${rdNome}`);

    renderizarMapaDemografiaRD();
    renderizarMapaSociaisRD();
    renderizarMapaEducacaoRD();
    renderizarMapaSaudeRD();
    renderizarMapaCadUnicoRD();
    renderizarMapaSaneamentoRD();
    setTimeout(() => {
        if (typeof window.redimensionarMapasFicha === 'function') {
            window.redimensionarMapasFicha();
        }
    }, 350);
}

function renderizarMapaSociaisRD() {
    const mapDom = document.getElementById('ficha_map_sociais_container');
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!mapDom || !geoData || !geoData.features) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        let pop = 0;
        if (Array.isArray(cacheSociaisRD.demografiaRD)) {
            const matchDemo = cacheSociaisRD.demografiaRD.find(d => normText(d.municipio) === normName);
            if (matchDemo) pop = parseFloat(matchDemo.pop_2026) || 0;
        }

        const getIndVal = (sigla) => {
            const arr = (cacheSociaisRD.indicadoresRD || []).filter(i => normText(i.nm_municipio).includes(normName) && String(i.sigla_indicador).toLowerCase() === sigla).sort((a, b) => b.ano - a.ano);
            return arr.length ? (parseFloat(String(arr[0].indicador).replace(',', '.')) || 0) : 0;
        };

        const mviAbs = getIndVal('mvi');
        const cvpAbs = getIndVal('cvp');

        ft.properties.mvi_abs = mviAbs;
        ft.properties.mvi_taxa = parseFloat((pop > 0 ? (mviAbs / pop) * 100000 : 0).toFixed(1));
        ft.properties.cvp_abs = cvpAbs;
        ft.properties.cvp_taxa = parseFloat((pop > 0 ? (cvpAbs / pop) * 100000 : 0).toFixed(1));
        ft.properties.feminicidio = getIndVal('feminicidio');
        ft.properties.tent_mvi = getIndVal('tent_mvi');
        ft.properties.rfv = getIndVal('rfv');
        ft.properties.vcm_ameaca = getIndVal('vcm_ameaca');
        ft.properties.vcm_lesao = getIndVal('vcm_lesao');
        ft.properties.vcm_vs = getIndVal('vcm_vs');
        ft.properties.pop_2026 = pop;
        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);

        let vAtiva = ft.properties[metricaSocialAtiva] || 0;
        ft.properties.val_ativa = vAtiva;
        if (vAtiva < minVal) minVal = vAtiva;
        if (vAtiva > maxVal) maxVal = vAtiva;
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#FEF0D9', maxVal, '#C0392B'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapSociaisFicha && mapSociaisFicha.getSource('rd_sociais_source')) {
        mapSociaisFicha.getSource('rd_sociais_source').setData(geoData);
        mapSociaisFicha.setPaintProperty('rd_sociais_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapSociaisFicha);
        mapSociaisFicha.resize();
        return;
    }

    if (mapSociaisFicha) mapSociaisFicha.remove();
    mapSociaisFicha = new maplibregl.Map({
        container: 'ficha_map_sociais_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapSociaisFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapSociaisFicha.on('load', () => {
        mapSociaisFicha.resize();
        mapSociaisFicha.addSource('rd_sociais_source', { type: 'geojson', data: geoData });
        mapSociaisFicha.addLayer({ id: 'rd_sociais_fill', type: 'fill', source: 'rd_sociais_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.8 } });
        mapSociaisFicha.addLayer({ id: 'rd_sociais_line', type: 'line', source: 'rd_sociais_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapSociaisFicha.on('mousemove', 'rd_sociais_fill', (e) => {
            mapSociaisFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = { 
                'mvi_abs': 'MVI (Casos)', 
                'mvi_taxa': 'Taxa MVI (/100k)', 
                'cvp_abs': 'CVP (Ocorrências)', 
                'cvp_taxa': 'Taxa CVP (/100k)',
                'feminicidio': 'Feminicídio (Casos)',
                'tent_mvi': 'Tentativa de MVI (Casos)',
                'rfv': 'RFV (Ocorrências)',
                'vcm_ameaca': 'VCM Ameaça (Ocorrências)',
                'vcm_lesao': 'VCM Lesão Corporal (Ocorrências)',
                'vcm_vs': 'VCM Violência Sexual (Ocorrências)'
            };
            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>População:</b> ${Number(p.pop_2026 || 0).toLocaleString('pt-BR')}</div>
                  <div style="font-size: 11px;"><b>${labels[metricaSocialAtiva]}:</b> <span style="color:#C0392B; font-weight:800;">${Number(p.val_ativa || 0).toLocaleString('pt-BR')}</span></div>
                </div>
            `).addTo(mapSociaisFicha);
        });
        mapSociaisFicha.on('mouseleave', 'rd_sociais_fill', () => { mapSociaisFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapSociaisFicha);
    });
}

function renderizarMapaEducacaoRD() {
    const mapDom = document.getElementById('ficha_map_educacao_container');
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!mapDom || !geoData || !geoData.features) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    let minVal = Infinity, maxVal = -Infinity;
    const siglasEducacao = ['ideb_5ano', 'tdi_5ano', 'aba_5ano', 'apr_5ano', 'rep_5ano', 'ideb_9ano', 'tdi_9ano', 'aba_9ano', 'apr_9ano', 'rep_9ano', 'mat_6_10', 'mat_11_14', 'perc_mat_int', 'perc_alfabetizacao', 'atliq_creche'];

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');

        siglasEducacao.forEach(sig => {
            const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => normText(i.nm_municipio).includes(normName) && String(i.sigla_indicador).toLowerCase() === sig).sort((a, b) => b.ano - a.ano);
            ft.properties[sig] = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
            ft.properties[`${sig}_tipo`] = indArr.length && indArr[0].tipo ? String(indArr[0].tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'absoluto';
        });

        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);
        let vAtiva = ft.properties[metricaEducacaoAtiva] || 0;
        ft.properties.val_ativa = vAtiva;
        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E8F5E9', maxVal, '#1B5E20'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapEducacaoFicha && mapEducacaoFicha.getSource('rd_educacao_source')) {
        mapEducacaoFicha.getSource('rd_educacao_source').setData(geoData);
        mapEducacaoFicha.setPaintProperty('rd_educacao_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapEducacaoFicha);
        mapEducacaoFicha.resize();
        return;
    }

    if (mapEducacaoFicha) mapEducacaoFicha.remove();
    mapEducacaoFicha = new maplibregl.Map({
        container: 'ficha_map_educacao_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapEducacaoFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapEducacaoFicha.on('load', () => {
        mapEducacaoFicha.resize();
        mapEducacaoFicha.addSource('rd_educacao_source', { type: 'geojson', data: geoData });
        mapEducacaoFicha.addLayer({ id: 'rd_educacao_fill', type: 'fill', source: 'rd_educacao_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapEducacaoFicha.addLayer({ id: 'rd_educacao_line', type: 'line', source: 'rd_educacao_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapEducacaoFicha.on('mousemove', 'rd_educacao_fill', (e) => {
            mapEducacaoFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = {
                'ideb_5ano': 'IDEB (5º)', 'tdi_5ano': 'TDI (5º) %', 'aba_5ano': 'Abandono (5º) %', 'apr_5ano': 'Aprovação (5º) %', 'rep_5ano': 'Reprovação (5º) %',
                'ideb_9ano': 'IDEB (9º)', 'tdi_9ano': 'TDI (9º) %', 'aba_9ano': 'Abandono (9º) %', 'apr_9ano': 'Aprovação (9º) %', 'rep_9ano': 'Reprovação (9º) %',
                'mat_6_10': 'Matrículas 6 a 10', 'mat_11_14': 'Matrículas 11 a 14', 'perc_mat_int': 'Matrículas Integrais %', 'perc_alfabetizacao': 'Alfabetização %', 'atliq_creche': 'Atend. Creche %'
            };
            const tipo = p[`${metricaEducacaoAtiva}_tipo`];
            let valFmt = (tipo === 'percentual') ? Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : Number(p.val_ativa || 0).toLocaleString('pt-BR');

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>${labels[metricaEducacaoAtiva]}:</b> <span style="color:#27AE60; font-weight:800;">${valFmt}</span></div>
                </div>
            `).addTo(mapEducacaoFicha);
        });
        mapEducacaoFicha.on('mouseleave', 'rd_educacao_fill', () => { mapEducacaoFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapEducacaoFicha);
    });
}

function renderizarMapaSaudeRD() {
    const mapDom = document.getElementById('ficha_map_saude_container');
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!mapDom || !geoData || !geoData.features) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    let minVal = Infinity, maxVal = -Infinity;
    const siglasSaude = ['pre_natal', 'razao_mm', 'tx_att', 'tx_dcnt', 'tx_evitaveis', 'tx_infancia', 'tx_infantil'];

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');

        siglasSaude.forEach(sig => {
            const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => normText(i.nm_municipio).includes(normName) && String(i.sigla_indicador).toLowerCase() === sig).sort((a, b) => b.ano - a.ano);
            ft.properties[sig] = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
            ft.properties[`${sig}_tipo`] = indArr.length && indArr[0].tipo ? String(indArr[0].tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'absoluto';
        });

        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);
        let vAtiva = ft.properties[metricaSaudeAtiva] || 0;
        ft.properties.val_ativa = vAtiva;
        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E0F2F1', maxVal, '#00695C'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapSaudeFicha && mapSaudeFicha.getSource('rd_saude_source')) {
        mapSaudeFicha.getSource('rd_saude_source').setData(geoData);
        mapSaudeFicha.setPaintProperty('rd_saude_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapSaudeFicha);
        mapSaudeFicha.resize();
        return;
    }

    if (mapSaudeFicha) mapSaudeFicha.remove();
    mapSaudeFicha = new maplibregl.Map({
        container: 'ficha_map_saude_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapSaudeFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapSaudeFicha.on('load', () => {
        mapSaudeFicha.resize();
        mapSaudeFicha.addSource('rd_saude_source', { type: 'geojson', data: geoData });
        mapSaudeFicha.addLayer({ id: 'rd_saude_fill', type: 'fill', source: 'rd_saude_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapSaudeFicha.addLayer({ id: 'rd_saude_line', type: 'line', source: 'rd_saude_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapSaudeFicha.on('mousemove', 'rd_saude_fill', (e) => {
            mapSaudeFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = { 'pre_natal': 'Pré-Natal Cobertura (%)', 'razao_mm': 'Razão Mort. Materna (/100k)', 'tx_att': 'Taxa ATT', 'tx_dcnt': 'Mort. DCNT', 'tx_evitaveis': 'Causas Evitáveis', 'tx_infancia': 'Mort. Infância (/1k)', 'tx_infantil': 'Mort. Infantil (/1k)' };
            const tipo = p[`${metricaSaudeAtiva}_tipo`];
            let valFmt = (tipo === 'percentual') ? Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : Number(p.val_ativa || 0).toLocaleString('pt-BR');

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>${labels[metricaSaudeAtiva]}:</b> <span style="color:#00695C; font-weight:800;">${valFmt}</span></div>
                </div>
            `).addTo(mapSaudeFicha);
        });
        mapSaudeFicha.on('mouseleave', 'rd_saude_fill', () => { mapSaudeFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapSaudeFicha);
    });
}

/* --- 6.3 VULNERABILIDADE SOCIAL E CONDIÇÕES HABITACIONAIS --- */
function renderizarMapaCadUnicoRD() {
    const mapDom = document.getElementById('ficha_map_cad_unico_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;
    const siglasCadUnico = ['cad_pessoas', 'tx_cad_pessoas', 'indice_gini', 'ivcad', 'ivcad_nc', 'ivcad_dpi', 'ivcad_dca', 'ivcad_tqa', 'ivcad_dr', 'ivcad_ch'];

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        // 1. Processar dados IVCAD
        siglasCadUnico.forEach(sig => {
            const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
                const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || i.cod_ibge || '').substring(0, 6) === ibgeCode;
                const matchName = normText(i.nm_municipio).includes(normName);
                return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === sig;
            }).sort((a, b) => b.ano - a.ano);

            ft.properties[sig] = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
            ft.properties[`${sig}_tipo`] = indArr.length && indArr[0].tipo ? String(indArr[0].tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : (sig === 'tx_cad_pessoas' ? 'percentual' : 'absoluto');
        });

        // 2. Processar dados Transferência de Renda
        let mQtd = 0, mVal = 0;
        (cacheSociaisRD.iniciativasRD || []).forEach(d => {
            if (normText(d.municipio) === normName && d.iniciativa_estrategica && String(d.iniciativa_estrategica).trim().toUpperCase() === "MÃES DE PERNAMBUCO") {
                mQtd += Number(d.indicador) || 0;
                mVal += Number(d.valor_total) || 0;
            }
        });

        let pQtd = 0, pVal = 0;
        (cacheSociaisRD.pcpRD || []).forEach(p => {
            if ((ibgeCode && String(p.ibge6 || p.cod_ibge) === ibgeCode) || (p.municipio && normText(p.municipio) === normName)) {
                pQtd += Number(p.numero_de_beneficiarios) || 0;
                pVal += Number(p.valor_investido_no_municipio) || 0;
            }
        });

        ft.properties.maes_qtd = mQtd;
        ft.properties.maes_val = mVal;
        ft.properties.pcp_qtd = pQtd;
        ft.properties.pcp_val = pVal;

        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);
        
        let vAtiva = parseFloat(ft.properties[metricaCadUnicoAtiva]) || 0;
        ft.properties.val_ativa = vAtiva;
        if (vAtiva < minVal) minVal = vAtiva;
        if (vAtiva > maxVal) maxVal = vAtiva;
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal <= minVal) maxVal = minVal + 1;

    // Paleta de cor dinâmica consoante o tipo de indicador escolhido
    let fillColorExpression;
    if (['maes_qtd', 'maes_val', 'pcp_qtd', 'pcp_val'].includes(metricaCadUnicoAtiva)) {
        fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#FCE4EC', maxVal, '#880E4F']; // Cor rosa/vinho
    } else {
        fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#F3E5F5', maxVal, '#4A148C']; // Cor roxa do IVCAD
    }

    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    try {
        if (mapCadUnicoFicha && mapCadUnicoFicha.loaded && mapCadUnicoFicha.loaded() && mapCadUnicoFicha.getSource('rd_cad_unico_source')) {
            mapCadUnicoFicha.getSource('rd_cad_unico_source').setData(geoData);
            mapCadUnicoFicha.setPaintProperty('rd_cad_unico_fill', 'fill-color', fillColorExpression);
            fitMapBounds(mapCadUnicoFicha);
            mapCadUnicoFicha.resize();
            return;
        }
    } catch (e) {
        console.warn("Recriando mapCadUnicoFicha...", e);
    }

    if (mapCadUnicoFicha) {
        try { mapCadUnicoFicha.remove(); } catch (e) {}
    }

    mapCadUnicoFicha = new maplibregl.Map({
        container: 'ficha_map_cad_unico_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapCadUnicoFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapCadUnicoFicha.on('load', () => {
        mapCadUnicoFicha.resize();
        mapCadUnicoFicha.addSource('rd_cad_unico_source', { type: 'geojson', data: geoData });
        mapCadUnicoFicha.addLayer({ id: 'rd_cad_unico_fill', type: 'fill', source: 'rd_cad_unico_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapCadUnicoFicha.addLayer({ id: 'rd_cad_unico_line', type: 'line', source: 'rd_cad_unico_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapCadUnicoFicha.on('mousemove', 'rd_cad_unico_fill', (e) => {
            mapCadUnicoFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = { 
                'cad_pessoas': 'Total Pessoas', 'tx_cad_pessoas': 'Tx. Pessoas %', 'indice_gini': 'Índice de Gini', 'ivcad': 'IVCAD', 'ivcad_nc': 'NC', 'ivcad_dpi': 'DPI', 'ivcad_dca': 'DCA', 'ivcad_tqa': 'TQA', 'ivcad_dr': 'DR', 'ivcad_ch': 'CH',
                'maes_qtd': 'Mães de PE (Qtd)', 'maes_val': 'Mães de PE (R$)', 'pcp_qtd': 'Chapéu de Palha (Qtd)', 'pcp_val': 'Chapéu de Palha (R$)'
            };
            
            const isTransfRenda = ['maes_qtd', 'maes_val', 'pcp_qtd', 'pcp_val'].includes(metricaCadUnicoAtiva);
            const colorHex = isTransfRenda ? '#880E4F' : '#4A148C';
            const tipo = p[`${metricaCadUnicoAtiva}_tipo`];
            
            let valFmt = "";
            if (metricaCadUnicoAtiva === 'maes_val' || metricaCadUnicoAtiva === 'pcp_val') {
                valFmt = "R$ " + Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (metricaCadUnicoAtiva === 'indice_gini') {
                valFmt = Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (tipo === 'percentual' || metricaCadUnicoAtiva === 'tx_cad_pessoas') {
                valFmt = Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
            } else {
                valFmt = Number(p.val_ativa || 0).toLocaleString('pt-BR');
            }

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>${labels[metricaCadUnicoAtiva] || metricaCadUnicoAtiva}:</b> <span style="color:${colorHex}; font-weight:800;">${valFmt}</span></div>
                </div>
            `).addTo(mapCadUnicoFicha);
        });
        mapCadUnicoFicha.on('mouseleave', 'rd_cad_unico_fill', () => { mapCadUnicoFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapCadUnicoFicha);
        setTimeout(() => { if (mapCadUnicoFicha) mapCadUnicoFicha.resize(); }, 150);
        setTimeout(() => { if (mapCadUnicoFicha) mapCadUnicoFicha.resize(); }, 500);
    });
}

function renderizarMapaSaneamentoRD() {
    const mapDom = document.getElementById('ficha_map_saneamento_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;
    const siglasSaneamento = ['pct_agua_rede', 'pct_esgoto_rede'];

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        siglasSaneamento.forEach(sig => {
            const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
                const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || i.cod_ibge || '').substring(0, 6) === ibgeCode;
                const matchName = normText(i.nm_municipio).includes(normName);
                return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === sig;
            }).sort((a, b) => b.ano - a.ano);

            ft.properties[sig] = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
            ft.properties[`${sig}_tipo`] = indArr.length && indArr[0].tipo ? String(indArr[0].tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'percentual';
        });

        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);
        let vAtiva = parseFloat(ft.properties[metricaSaneamentoAtiva]) || 0;
        ft.properties.val_ativa = vAtiva;
        if (vAtiva < minVal) minVal = vAtiva;
        if (vAtiva > maxVal) maxVal = vAtiva;
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal <= minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E0F7FA', maxVal, '#006064'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    try {
        if (mapSaneamentoFicha && mapSaneamentoFicha.loaded && mapSaneamentoFicha.loaded() && mapSaneamentoFicha.getSource('rd_saneamento_source')) {
            mapSaneamentoFicha.getSource('rd_saneamento_source').setData(geoData);
            mapSaneamentoFicha.setPaintProperty('rd_saneamento_fill', 'fill-color', fillColorExpression);
            fitMapBounds(mapSaneamentoFicha);
            mapSaneamentoFicha.resize();
            return;
        }
    } catch (e) {
        console.warn("Recriando mapSaneamentoFicha...", e);
    }

    if (mapSaneamentoFicha) {
        try { mapSaneamentoFicha.remove(); } catch (e) {}
    }

    mapSaneamentoFicha = new maplibregl.Map({
        container: 'ficha_map_saneamento_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapSaneamentoFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapSaneamentoFicha.on('load', () => {
        mapSaneamentoFicha.resize();
        mapSaneamentoFicha.addSource('rd_saneamento_source', { type: 'geojson', data: geoData });
        mapSaneamentoFicha.addLayer({ id: 'rd_saneamento_fill', type: 'fill', source: 'rd_saneamento_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapSaneamentoFicha.addLayer({ id: 'rd_saneamento_line', type: 'line', source: 'rd_saneamento_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapSaneamentoFicha.on('mousemove', 'rd_saneamento_fill', (e) => {
            mapSaneamentoFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            const labels = { 'pct_agua_rede': 'Água (Rede Geral)', 'pct_esgoto_rede': 'Esgoto (Rede Geral)' };
            const tipo = p[`${metricaSaneamentoAtiva}_tipo`];
            let valFmt = (tipo === 'percentual' || metricaSaneamentoAtiva.startsWith('pct_')) ? Number(p.val_ativa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%' : Number(p.val_ativa || 0).toLocaleString('pt-BR');

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>${labels[metricaSaneamentoAtiva] || metricaSaneamentoAtiva}:</b> <span style="color:#006064; font-weight:800;">${valFmt}</span></div>
                </div>
            `).addTo(mapSaneamentoFicha);
        });
        mapSaneamentoFicha.on('mouseleave', 'rd_saneamento_fill', () => { mapSaneamentoFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapSaneamentoFicha);
        setTimeout(() => { if (mapSaneamentoFicha) mapSaneamentoFicha.resize(); }, 150);
        setTimeout(() => { if (mapSaneamentoFicha) mapSaneamentoFicha.resize(); }, 500);
    });
}

window.cacheDfPcpJson = null;

async function carregarBasePcpJson() {
    // 1. Reaproveita cache se já foi carregado anteriormente
    if (Array.isArray(window.cacheDfPcpJson) && window.cacheDfPcpJson.length > 0) {
        return window.cacheDfPcpJson;
    }
    if (window.cacheResumoCozinhas && Array.isArray(window.cacheResumoCozinhas.pcp) && window.cacheResumoCozinhas.pcp.length > 0) {
        window.cacheDfPcpJson = window.cacheResumoCozinhas.pcp;
        return window.cacheDfPcpJson;
    }

    const base = window.basePath || '';

    // 2. Busca direto da rota do Go que já serve o df_pcp (sem risco de 404)
    try {
        const resResumo = await fetch(`${base}/municipios/resumo/cozinhas`.replace(/\/+/g, '/'));
        if (resResumo && resResumo.ok) {
            const jsonResumo = await resResumo.json();
            if (jsonResumo && Array.isArray(jsonResumo.pcp) && jsonResumo.pcp.length > 0) {
                window.cacheResumoCozinhas = jsonResumo;
                window.cacheDfPcpJson = jsonResumo.pcp;
                return window.cacheDfPcpJson;
            }
        }
    } catch (e) {
        console.warn("[Ficha] Falha ao buscar pcp via /municipios/resumo/cozinhas:", e);
    }

    // 3. Fallback caso você também libere o arquivo estático no Go
    const caminhos = [
        `${base}/data/df_pcp.json`.replace(/\/+/g, '/'),
        `${base}/data/json/df_pcp.json`.replace(/\/+/g, '/')
    ];

    for (const url of caminhos) {
        try {
            const res = await fetch(url);
            if (res && res.ok) {
                const dados = await res.json();
                window.cacheDfPcpJson = Array.isArray(dados) ? dados : [];
                return window.cacheDfPcpJson;
            }
        } catch (e) {}
    }

    return [];
}

async function renderizarTransferenciasRenda(iniciativas, pcpFallback, nomeMun, demo) {
    let maesQtd = 0, maesVal = 0;
    (iniciativas || []).forEach(d => {
        if (d.iniciativa_estrategica && String(d.iniciativa_estrategica).trim().toUpperCase() === "MÃES DE PERNAMBUCO") {
            maesQtd += (Number(d.indicador) || 0);
            maesVal += (Number(d.valor_total) || 0);
        }
    });

    // Busca na base /data/json/df_pcp.json (com fallback para pcpFallback caso necessário)
    const basePcp = await carregarBasePcpJson();
    const listaPcp = basePcp.length > 0 ? basePcp : (pcpFallback || []);

    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const extrairVal = (obj, key) => (obj && obj[key] !== undefined) ? (Array.isArray(obj[key]) ? obj[key][0] : obj[key]) : '';

    const alvoNome = norm(nomeMun || $('#ficha_f_municipio').val());
    const rawIbge = String(extrairVal(demo, 'ibge7') || extrairVal(demo, 'cod_ibge') || extrairVal(demo, 'ibge6') || '').trim();
    const alvoIbge7 = rawIbge.length >= 7 ? rawIbge.substring(0, 7) : '';
    const alvoIbge6 = rawIbge.length >= 6 ? rawIbge.substring(0, 6) : '';

    let pcpQtd = 0, pcpVal = 0;
    listaPcp.forEach(p => {
        const pIbge7 = p.ibge7 ? String(p.ibge7).trim() : '';
        const pCodIbge = p.cod_ibge ? String(p.cod_ibge).trim() : '';
        const pMun = norm(p.municipio);

        const matchIbge = (alvoIbge7 && (pIbge7 === alvoIbge7 || pCodIbge === alvoIbge7)) ||
                          (alvoIbge6 && (pCodIbge === alvoIbge6 || pIbge7.startsWith(alvoIbge6)));
        const matchNome = alvoNome && pMun && pMun === alvoNome;

        if (matchIbge || matchNome) {
            pcpQtd += Number(p.numero_de_beneficiarios) || 0;
            pcpVal += Number(p.valor_investido_no_municipio) || 0;
        }
    });

    const formataBi = (v) => (v === 0)
        ? "R$ 0"
        : ((v >= 1e9)
            ? "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi"
            : ((v >= 1e6)
                ? "R$ " + (v / 1e6).toFixed(2).replace('.', ',') + " Mi"
                : "R$ " + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })));

    // Atualiza os Valores
    $('#ficha_kpi_maes_qtd').text(maesQtd > 0 ? maesQtd.toLocaleString('pt-BR') : "-");
    $('#ficha_kpi_maes_val').text(maesVal > 0 ? formataBi(maesVal) : "-");
    $('#ficha_kpi_pcp_qtd').text(pcpQtd > 0 ? pcpQtd.toLocaleString('pt-BR') : "-");
    $('#ficha_kpi_pcp_val').text(pcpVal > 0 ? formataBi(pcpVal) : "-");

    // LÓGICA DE METADADOS E POLARIDADE
    const configurarMetadados = (elemBase, sigla, sufixo) => {
        $(`#ficha_ano_${elemBase}`).html(window.montarRodapeKPI(sufixo, '2024', null, sigla));
        window.configurarBotoesKPI(elemBase, sigla, sufixo, 'programa');
    };

    configurarMetadados('maes_qtd', 'maes_qtd', 'Mulheres Atendidas');
    configurarMetadados('maes_val', 'maes_val', 'Investimento');
    configurarMetadados('pcp_qtd', 'pcp_qtd', 'Pessoas Atendidas');
    configurarMetadados('pcp_val', 'pcp_val', 'Investimento');
}

/* --- 6.5 INDICADORES ECONÔMICOS (INOVAÇÃO, COMÉRCIO EXTERIOR, CONECTIVIDADE) --- */

// INOVAÇÃO
function renderizarIndicadoresInovacao(ind, demo) {
    const $containerInfocomServ = $('#ficha_container_kpis_infocom_serv');
    const $containerKpis = $('#ficha_container_kpis_inovacao');
    const $containerBtns = $('#ficha_btns_metrica_inovacao');
    $containerInfocomServ.empty();
    $containerKpis.empty();
    $containerBtns.empty();

    const normText = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Filtra indicadores do grupo economia da inovação ou correlatos (exclui comex que fica em Comércio Exterior)
    const itensInovacao = (ind || []).filter(i => {
        const g = normText(i.grupo);
        const s = String(i.sigla_indicador || '').toLowerCase().trim();
        return (g.includes('inova') || s.includes('infocom')) && !g.includes('comex') && !g.includes('comercio') && !s.startsWith('exp_') && !s.startsWith('imp_') && !s.includes('corrente_comercio') && !s.includes('saldo_comercial');
    });

    if (!itensInovacao.length) {
        $containerInfocomServ.html('<div class="col-12 text-slate-400 text-xs italic">Sem indicadores de InfoCom registrados.</div>');
        $containerKpis.html('<div class="col-12 text-slate-400 text-xs italic">Sem indicadores de economia da inovação registrados.</div>');
        $('#ficha_map_inovacao_container').closest('.bg-white').hide();
        return;
    } else {
        $('#ficha_map_inovacao_container').closest('.bg-white').show();
    }

    const getLatestItem = (sigla) => {
        const arr = itensInovacao.filter(i => String(i.sigla_indicador || '').toLowerCase().trim() === sigla.toLowerCase());
        return arr.length ? arr.sort((a, b) => b.ano - a.ano)[0] : null;
    };

    const estabInfocomItem = getLatestItem('estab_infocom');
    const empInfocomItem = getLatestItem('emp_infocom');
    const valEstabInfocom = estabInfocomItem ? parseFloat(String(estabInfocomItem.indicador).replace(',', '.')) : NaN;
    const valEmpInfocom = empInfocomItem ? parseFloat(String(empInfocomItem.indicador).replace(',', '.')) : NaN;

    // 1. Destaque: 4 Indicadores de Participação de InfoCom em relação a Serviços
    const configInfocomServ = [
        {
            sigla: 'pct_vab_infocom_serv',
            titulo: '% InfoCom em Serviços (VAB / Massa Salarial)',
            icone: 'fa-chart-pie',
            cor: '#2563EB',
            isPercent: true,
            subExtra: 'Proxy VAB (Massa Salarial RAIS)'
        },
        {
            sigla: 'pct_estab_infocom_serv',
            titulo: '% InfoCom em Serviços (Estabelecimentos)',
            icone: 'fa-building',
            cor: '#0284C7',
            isPercent: true,
            subExtra: !isNaN(valEstabInfocom) ? `${valEstabInfocom.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} estab. InfoCom` : ''
        },
        {
            sigla: 'pct_emp_infocom_serv',
            titulo: '% InfoCom em Serviços (Empregados)',
            icone: 'fa-users-cog',
            cor: '#0D9488',
            isPercent: true,
            subExtra: !isNaN(valEmpInfocom) ? `${valEmpInfocom.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} vínculos InfoCom` : ''
        },
        {
            sigla: 'ql_infocom_serv',
            titulo: 'QL InfoCom em relação a Serviços',
            icone: 'fa-project-diagram',
            cor: '#4F46E5',
            isPercent: false,
            isQL: true
        }
    ];

    const siglasInfocomServ = configInfocomServ.map(c => c.sigla);
    const siglasAuxiliaresOcultas = ['estab_infocom', 'emp_infocom'];

    configInfocomServ.forEach(cfg => {
        const item = getLatestItem(cfg.sigla);
        if (!item) return;

        const val = parseFloat(String(item.indicador).replace(',', '.'));
        let valFmt = '-';
        if (!isNaN(val)) {
            valFmt = cfg.isPercent
                ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
                : val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        const rankBadge = item.rank_pe ? `<span class="badge bg-slate-100 text-slate-700 border ms-1" style="font-size:0.65rem; padding: 2px 6px;">${item.rank_pe}º em PE</span>` : '';
        const meta = (window.dadosMetadados || []).find(m => String(m.cd_indicador || '').trim().toLowerCase() === cfg.sigla);
        const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-400 hover:text-blue-600 cursor-pointer ms-1 transition-colors" onclick="window.abrirModalMetadado('${cfg.sigla}')" title="Ver Metadados"></i>` : '';

        let extraBadge = '';
        if (cfg.isQL && !isNaN(val)) {
            extraBadge = val >= 1
                ? `<span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 ms-1" style="font-size:0.62rem;">Especializado (≥1)</span>`
                : `<span class="badge bg-slate-50 text-slate-500 border border-slate-200 ms-1" style="font-size:0.62rem;">Não Espec. (&lt;1)</span>`;
        } else if (cfg.subExtra) {
            extraBadge = `<div class="text-[10px] text-slate-500 font-semibold mt-0.5 normal-case"><i class="fas fa-angle-right text-blue-500 me-1"></i>${cfg.subExtra}</div>`;
        }

        $containerInfocomServ.append(`
            <div class="kpi-modern-card bg-white shadow-xs" style="border-left: 4px solid ${cfg.cor};">
              <div class="kpi-modern-header text-uppercase leading-tight mb-1" style="font-size: 0.72rem; min-height: 2.2em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #1E293B; font-weight: 800;" title="${item.nm_indicador}">${cfg.titulo}${iconInfo}</div>
              <div class="kpi-modern-body"><i class="fas ${cfg.icone} kpi-modern-icon" style="color: ${cfg.cor};"></i><span class="kpi-modern-number" id="ficha_kpi_${cfg.sigla}">${valFmt}</span></div>
              <div class="kpi-modern-footer">${window.montarRodapeKPI(cfg.isPercent ? '%' : (cfg.isQL ? 'QL' : ''), item.ano, item.rank_pe, cfg.sigla)}${extraBadge}</div>
            </div>
        `);
    });

    // 2. Demais indicadores de Economia da Inovação + Botões do Mapa
    const todasSiglasUnicas = [...new Set(itensInovacao.map(i => i.sigla_indicador))].filter(s => !siglasAuxiliaresOcultas.includes(String(s).toLowerCase()));
    // Ordena para que os 4 indicadores de InfoCom/Serviços fiquem primeiro nos botões do mapa
    const siglasOrdenadas = [
        ...siglasInfocomServ.filter(s => todasSiglasUnicas.includes(s)),
        ...todasSiglasUnicas.filter(s => !siglasInfocomServ.includes(s))
    ];

    if (!metricaInovacaoAtiva && siglasOrdenadas.length > 0) metricaInovacaoAtiva = siglasOrdenadas[0];

    siglasOrdenadas.forEach((sigla) => {
        const item = itensInovacao.filter(i => i.sigla_indicador === sigla).sort((a, b) => b.ano - a.ano)[0];
        if (!item) return;

        // Adiciona botão no seletor do mapa regional para todos os indicadores (incluindo os 4 de InfoCom/Serviços)
        $containerBtns.append(`<button type="button" class="btn ${sigla === metricaInovacaoAtiva ? 'btn-primary active' : 'btn-outline-primary'} font-bold text-xs px-2" data-metrica="${sigla}" onclick="window.alternarMetricaInovacao('${sigla}')">${item.nm_indicador}</button>`);

        // Se já foi renderizado no bloco superior de InfoCom/Serviços, não duplica no grid inferior
        if (siglasInfocomServ.includes(sigla)) return;

        const tipoNorm = item.tipo ? String(item.tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
        let val = parseFloat(String(item.indicador).replace(',', '.')), valFmt = item.indicador;

        if (!isNaN(val)) {
            if (tipoNorm === 'moeda' || String(item.nm_indicador).toLowerCase().includes('salarial')) {
                valFmt = 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (tipoNorm === 'percentual' || String(item.nm_indicador).includes('%')) {
                valFmt = val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
            } else if (tipoNorm === 'absoluto') {
                valFmt = val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            } else {
                valFmt = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
            }
        }

        const rankBadge = item.rank_pe ? `<span class="badge bg-slate-100 text-slate-700 border ms-1" style="font-size:0.65rem; padding: 2px 6px;">${item.rank_pe}º em PE</span>` : '';
        const meta = (window.dadosMetadados || []).find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="window.abrirModalMetadado('${sigla}')" title="Ver Metadados"></i>` : '';

        $containerKpis.append(`
            <div class="kpi-modern-card" style="border-left-color: #00B7FF;">
              <div class="kpi-modern-header text-uppercase leading-tight mb-1" style="font-size: 0.72rem; min-height: 2.2em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${item.nm_indicador}">${item.nm_indicador}${iconInfo}</div>
              <div class="kpi-modern-body"><i class="fas fa-laptop-code kpi-modern-icon" style="color: #00B7FF;"></i><span class="kpi-modern-number" id="ficha_kpi_${sigla}">${valFmt}</span></div>
              <div class="kpi-modern-footer">${window.montarRodapeKPI(tipoNorm === 'moeda' ? 'R$' : (tipoNorm === 'percentual' ? '%' : (tipoNorm === 'absoluto' ? 'Vínculos' : '')), item.ano, item.rank_pe, sigla)}</div>
            </div>
        `);
    });

    const rdNome = demo?.regiao_de_desenvolvimento || demo?.['Região de Desenvolvimento'] || '-';
    $('#ficha_inovacao_rd_titulo').text(`Municípios da RD ${rdNome}`);
    renderizarMapaInovacaoRD();
}

function renderizarMapaInovacaoRD() {
    const mapDom = document.getElementById('ficha_map_inovacao_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD || !metricaInovacaoAtiva) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
            const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || '').substring(0, 6) === ibgeCode;
            const matchName = normText(i.nm_municipio).includes(normName);
            return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === metricaInovacaoAtiva.toLowerCase().trim();
        }).sort((a, b) => b.ano - a.ano);

        let vAtiva = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
        ft.properties.val_ativa = vAtiva;
        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);

        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E0F7FA', maxVal, '#00838F'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapInovacaoFicha && mapInovacaoFicha.getSource('rd_inovacao_source')) {
        mapInovacaoFicha.getSource('rd_inovacao_source').setData(geoData);
        mapInovacaoFicha.setPaintProperty('rd_inovacao_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapInovacaoFicha);
        mapInovacaoFicha.resize();
        return;
    }

    if (mapInovacaoFicha) mapInovacaoFicha.remove();
    mapInovacaoFicha = new maplibregl.Map({
        container: 'ficha_map_inovacao_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapInovacaoFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapInovacaoFicha.on('load', () => {
        mapInovacaoFicha.resize();
        mapInovacaoFicha.addSource('rd_inovacao_source', { type: 'geojson', data: geoData });
        mapInovacaoFicha.addLayer({ id: 'rd_inovacao_fill', type: 'fill', source: 'rd_inovacao_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapInovacaoFicha.addLayer({ id: 'rd_inovacao_line', type: 'line', source: 'rd_inovacao_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapInovacaoFicha.on('mousemove', 'rd_inovacao_fill', (e) => {
            mapInovacaoFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>Valor:</b> <span style="color:#00838F; font-weight:800;">${Number(p.val_ativa || 0).toLocaleString('pt-BR')}</span></div>
                </div>
            `).addTo(mapInovacaoFicha);
        });
        mapInovacaoFicha.on('mouseleave', 'rd_inovacao_fill', () => { mapInovacaoFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapInovacaoFicha);
    });
}

// COMÉRCIO EXTERIOR
function renderizarIndicadoresComercio(ind, demo) {
    const $containerKpis =$('#ficha_container_kpis_comercio'), $containerBtns =$('#ficha_btns_metrica_comercio');
    $containerKpis.empty();$containerBtns.empty();

    const itensComercio = (ind || []).filter(i => {
        const g = String(i.grupo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return g === 'comex e tecnologia' || g === 'comercio exterior' || g === 'comércio exterior';
    });

    if (!itensComercio.length) {
        $containerKpis.html('<div class="col-12 text-slate-400 text-xs italic">Sem indicadores de Comércio Exterior registrados.</div>');
        $('#ficha_map_comercio_container').closest('.bg-white').hide();
        return;
    } else {
        $('#ficha_map_comercio_container').closest('.bg-white').show();
    }

    const siglasUnicas = [...new Set(itensComercio.map(i => i.sigla_indicador))];
    if (!metricaComercioAtiva && siglasUnicas.length > 0) metricaComercioAtiva = siglasUnicas[0];

    siglasUnicas.forEach((sigla) => {
        const item = itensComercio.filter(i => i.sigla_indicador === sigla).sort((a, b) => b.ano - a.ano)[0];
        const tipoRaw = item.tipo ? String(item.tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : '';
        const siglaLow = String(item.sigla_indicador || '').toLowerCase();
        const nomeLow = String(item.nm_indicador || '').toLowerCase();
        let val = parseFloat(String(item.indicador).replace(',', '.')), valFmt = item.indicador;

        if (!isNaN(val)) {
            if (tipoRaw === 'moeda' || nomeLow.includes('exporta') || nomeLow.includes('importa') || siglaLow.includes('valor')) {
                valFmt = 'US$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            } else if (tipoRaw === 'percentual') {
                valFmt = val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
            } else if (tipoRaw === 'indice') {
                valFmt = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
            } else {
                valFmt = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
            }
        }

        const rankBadge = item.rank_pe ? `<span class="badge bg-slate-100 text-slate-700 border ms-1" style="font-size:0.65rem; padding: 2px 6px;">${item.rank_pe}º em PE</span>` : '';
        
        // Ícone de Metadado / Modal
        const meta = (window.dadosMetadados || []).find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="window.abrirModalMetadado('${sigla}')" title="Ver Metadados"></i>` : '';

        $containerKpis.append(`
            <div class="kpi-modern-card" style="border-left-color: #E67E22;">
              <div class="kpi-modern-header text-uppercase leading-tight mb-1" style="font-size: 0.72rem; min-height: 2.2em;" title="${item.nm_indicador}">${item.nm_indicador}${iconInfo}</div>
              <div class="kpi-modern-body"><i class="fas fa-globe kpi-modern-icon" style="color: #E67E22;"></i><span class="kpi-modern-number" id="ficha_kpi_${sigla}">${valFmt}</span></div>
              <div class="kpi-modern-footer">${window.montarRodapeKPI(tipoRaw === 'moeda' || nomeLow.includes('exporta') || nomeLow.includes('importa') || siglaLow.includes('valor') ? 'US$' : (tipoRaw === 'percentual' ? '%' : ''), item.ano, item.rank_pe, sigla)}</div>
            </div>
        `);

        $containerBtns.append(`<button type="button" class="btn ${sigla === metricaComercioAtiva ? 'btn-primary active' : 'btn-outline-primary'} font-bold text-xs px-2" data-metrica="${sigla}" onclick="window.alternarMetricaComercio('${sigla}')">${item.nm_indicador}</button>`);
    });

    const rdNome = demo?.regiao_de_desenvolvimento || demo?.['Região de Desenvolvimento'] || '-';
    $('#ficha_comercio_rd_titulo').text(`Municípios da RD ${rdNome}`);
    renderizarMapaComercioRD();
}

function renderizarMapaComercioRD() {
    const mapDom = document.getElementById('ficha_map_comercio_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD || !metricaComercioAtiva) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
            const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || '').substring(0, 6) === ibgeCode;
            const matchName = normText(i.nm_municipio).includes(normName);
            return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === metricaComercioAtiva.toLowerCase().trim();
        }).sort((a, b) => b.ano - a.ano);

        let vAtiva = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
        ft.properties.val_ativa = vAtiva;
        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);

        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#FDF2E9', maxVal, '#BA4A00'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapComercioFicha && mapComercioFicha.getSource('rd_comercio_source')) {
        mapComercioFicha.getSource('rd_comercio_source').setData(geoData);
        mapComercioFicha.setPaintProperty('rd_comercio_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapComercioFicha);
        mapComercioFicha.resize();
        return;
    }

    if (mapComercioFicha) mapComercioFicha.remove();
    mapComercioFicha = new maplibregl.Map({
        container: 'ficha_map_comercio_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapComercioFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapComercioFicha.on('load', () => {
        mapComercioFicha.resize();
        mapComercioFicha.addSource('rd_comercio_source', { type: 'geojson', data: geoData });
        mapComercioFicha.addLayer({ id: 'rd_comercio_fill', type: 'fill', source: 'rd_comercio_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapComercioFicha.addLayer({ id: 'rd_comercio_line', type: 'line', source: 'rd_comercio_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapComercioFicha.on('mousemove', 'rd_comercio_fill', (e) => {
            mapComercioFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;
            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>Valor:</b> <span style="color:#BA4A00; font-weight:800;">${Number(p.val_ativa || 0).toLocaleString('pt-BR')}</span></div>
                </div>
            `).addTo(mapComercioFicha);
        });
        mapComercioFicha.on('mouseleave', 'rd_comercio_fill', () => { mapComercioFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapComercioFicha);
    });
}

// CONECTIVIDADE
function renderizarIndicadoresConectividade(ind, demo) {
    const $containerKpis =$('#ficha_container_kpis_conectividade'), $containerBtns =$('#ficha_btns_metrica_conectividade');
    $containerKpis.empty();$containerBtns.empty();

    const itensConect = (ind || []).filter(i => String(i.grupo || '').toLowerCase().trim() === 'conectividade');

    if (!itensConect.length) {
        $containerKpis.html('<div class="col-12 text-slate-400 text-xs italic">Sem indicadores de Conectividade registrados.</div>');
        $('#ficha_map_conectividade_container').closest('.bg-white').hide();
        return;
    } else {
        $('#ficha_map_conectividade_container').closest('.bg-white').show();
    }

    const siglasUnicas = [...new Set(itensConect.map(i => i.sigla_indicador))];
    if (!metricaConectividadeAtiva && siglasUnicas.length > 0) metricaConectividadeAtiva = siglasUnicas[0];

    siglasUnicas.forEach((sigla) => {
        const item = itensConect.filter(i => i.sigla_indicador === sigla).sort((a, b) => b.ano - a.ano)[0];
        const tipoNorm = item.tipo ? String(item.tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
        let val = parseFloat(String(item.indicador).replace(',', '.')), textoValor = "-";

        if (!isNaN(val)) {
            if (tipoNorm === 'percentual') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) + "%";
            else if (tipoNorm === 'moeda') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            else if (tipoNorm === 'absoluto') textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            else if (tipoNorm === 'indice') textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
            else textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        } else {
            textoValor = item.indicador;
        }

        const rankBadge = item.rank_pe ? `<span class="badge bg-slate-100 text-slate-700 border ms-1" style="font-size:0.65rem; padding: 2px 6px;">${item.rank_pe}º em PE</span>` : '';
        
        // Ícone de Metadado / Modal
        const meta = (window.dadosMetadados || []).find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="window.abrirModalMetadado('${sigla}')" title="Ver Metadados"></i>` : '';

        $containerKpis.append(`
            <div class="kpi-modern-card" style="border-left-color: #3F51B5;">
              <div class="kpi-modern-header text-uppercase leading-tight mb-1" style="font-size: 0.72rem; min-height: 2.2em;" title="${item.nm_indicador}">${item.nm_indicador}${iconInfo}</div>
              <div class="kpi-modern-body"><i class="fas fa-wifi kpi-modern-icon" style="color: #3F51B5;"></i><span class="kpi-modern-number" id="ficha_kpi_${sigla}">${textoValor}</span></div>
              <div class="kpi-modern-footer">${window.montarRodapeKPI(tipoNorm === 'percentual' ? '%' : (tipoNorm === 'absoluto' ? 'Acessos' : ''), item.ano, item.rank_pe, sigla)}</div>
            </div>
        `);

        $containerBtns.append(`<button type="button" class="btn ${sigla === metricaConectividadeAtiva ? 'btn-primary active' : 'btn-outline-primary'} font-bold text-xs px-2" data-metrica="${sigla}" onclick="window.alternarMetricaConectividade('${sigla}')">${item.nm_indicador}</button>`);
    });

    const rdNome = demo?.regiao_de_desenvolvimento || demo?.['Região de Desenvolvimento'] || '-';
    $('#ficha_conectividade_rd_titulo').text(`Municípios da RD ${rdNome}`);
    renderizarMapaConectividadeRD();
}

function renderizarMapaConectividadeRD() {
    const mapDom = document.getElementById('ficha_map_conectividade_container');
    if (!mapDom || !cacheSociaisRD.geojsonRD || !metricaConectividadeAtiva) return;

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const geoData = obterGeoJSONSeguro(cacheSociaisRD.geojsonRD);
    if (!geoData || !geoData.features) return;
    let minVal = Infinity, maxVal = -Infinity;

    geoData.features.forEach(ft => {
        const normName = normText(ft.properties.municipio || ft.properties.Município || ft.properties.name || '');
        const ibgeCode = String(ft.properties.ibge6 || ft.properties.ibge7 || ft.properties.cod_ibge || '').substring(0, 6);

        const indArr = (cacheSociaisRD.indicadoresRD || []).filter(i => {
            const matchIbge = ibgeCode && String(i.ibge6 || i.ibge7 || '').substring(0, 6) === ibgeCode;
            const matchName = normText(i.nm_municipio).includes(normName);
            return (matchIbge || matchName) && String(i.sigla_indicador || '').toLowerCase().trim() === metricaConectividadeAtiva.toLowerCase().trim();
        }).sort((a, b) => b.ano - a.ano);

        let vAtiva = indArr.length ? (parseFloat(String(indArr[0].indicador).replace(',', '.')) || 0) : 0;
        ft.properties.val_ativa = vAtiva;
        ft.properties.is_selected = normName === normText(cacheSociaisRD.nomeMun);

        if (vAtiva > 0) {
            if (vAtiva < minVal) minVal = vAtiva;
            if (vAtiva > maxVal) maxVal = vAtiva;
        }
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity || maxVal === minVal) maxVal = minVal + 1;

    const fillColorExpression = ['interpolate', ['linear'], ['get', 'val_ativa'], minVal, '#E8EAF6', maxVal, '#283593'];
    const fitMapBounds = (mapInst) => {
        try {
            const bounds = new maplibregl.LngLatBounds();
            const processCoord = (c) => { if (eCoordenadaContinental(c)) bounds.extend(c); };
            geoData.features.forEach(ft => {
                const coords = ft.geometry.coordinates;
                if (ft.geometry.type === 'Polygon') coords[0].forEach(processCoord);
                else if (ft.geometry.type === 'MultiPolygon') coords.forEach(poly => poly[0].forEach(processCoord));
            });
            if (!bounds.isEmpty()) mapInst.fitBounds(bounds, { padding: 40, animate: false });
        } catch (e) {}
    };

    if (mapConectividadeFicha && mapConectividadeFicha.getSource('rd_conectividade_source')) {
        mapConectividadeFicha.getSource('rd_conectividade_source').setData(geoData);
        mapConectividadeFicha.setPaintProperty('rd_conectividade_fill', 'fill-color', fillColorExpression);
        fitMapBounds(mapConectividadeFicha);
        mapConectividadeFicha.resize();
        return;
    }

    if (mapConectividadeFicha) mapConectividadeFicha.remove();
    mapConectividadeFicha = new maplibregl.Map({
        container: 'ficha_map_conectividade_container',
        style: window.obterEstiloBaseMapa(),
        center: [-37.8, -8.3], zoom: 7, preserveDrawingBuffer: true
    });

    mapConectividadeFicha.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapConectividadeFicha.on('load', () => {
        mapConectividadeFicha.resize();
        mapConectividadeFicha.addSource('rd_conectividade_source', { type: 'geojson', data: geoData });
        mapConectividadeFicha.addLayer({ id: 'rd_conectividade_fill', type: 'fill', source: 'rd_conectividade_source', paint: { 'fill-color': fillColorExpression, 'fill-opacity': 0.85 } });
        mapConectividadeFicha.addLayer({ id: 'rd_conectividade_line', type: 'line', source: 'rd_conectividade_source', paint: { 'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff'], 'line-width': ['case', ['boolean', ['get', 'is_selected'], false], 3, 1] } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapConectividadeFicha.on('mousemove', 'rd_conectividade_fill', (e) => {
            mapConectividadeFicha.getCanvas().style.cursor = 'pointer';
            if (!e.features.length) return;
            const p = e.features[0].properties;

            popup.setLngLat(e.lngLat).setHTML(`
                <div style="font-family: Jost, sans-serif; padding: 4px;">
                  <div style="font-weight: 800; color: #0C2856; border-bottom: 1px solid #eee; padding-bottom: 2px;">${p.municipio || p.name}</div>
                  <div style="font-size: 11px; margin-top: 4px;"><b>Valor:</b> <span style="color:#283593; font-weight:800;">${Number(p.val_ativa || 0).toLocaleString('pt-BR')}</span></div>
                </div>
            `).addTo(mapConectividadeFicha);
        });
        mapConectividadeFicha.on('mouseleave', 'rd_conectividade_fill', () => { mapConectividadeFicha.getCanvas().style.cursor = ''; popup.remove(); });
        fitMapBounds(mapConectividadeFicha);
    });
}

function renderizarVocacoes(vocacoes) {
    const $container =$('#ficha_container_vocacoes').empty();
    const $subtitle =$('#ficha_vocacoes_subtitle');

    if (!vocacoes || !vocacoes.length || !Array.isArray(vocacoes)) {
        $subtitle.text("Vocações: Sem registro");
        $container.html('<div class="col-12 text-slate-400 text-xs italic">Sem vocações econômicas registradas para este município.</div>');
        return;
    }

    // Helper universal para conversão numérica com suporte a decodificação int64 do R
    const parseNum = (val) => {
        if (val === undefined || val === null || val === '-' || val === '') return null;
        let s = String(val).trim();
        let num = parseFloat(s.replace(',', '.'));
        if (isNaN(num)) return null;

        // Trata floats microscópicos gerados por integer64 do R quando não convertido
        if (s.includes('e-3') && num > 0 && num < 1e-300) {
            try {
                let buffer = new ArrayBuffer(8);
                let view = new DataView(buffer);
                view.setFloat64(0, num, true);
                let decoded = Number(view.getBigInt64(0, true));
                if (!isNaN(decoded) && decoded >= 0) return decoded;
            } catch (e) {}
        }

        return num;
    };

    const formatMoeda = (val) => {
        if (val === null || val === 0) return '-';
        if (Math.abs(val) >= 1e6) {
            return "R$ " + (val / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi";
        }
        return "R$ " + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatInt = (val) => (val === null ? '-' : val.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));

    // FILTRO 1: Remove vocações fantasma (zeradas em todos os indicadores)
    const vocacoesValidas = vocacoes.filter(v => {
        const estab = parseNum(v.estab_cnae);
        const emp = parseNum(v.emp_cnae);
        const massa = parseNum(v.massa_salarial_cnae);
        const sal = parseNum(v.sal_avg_cnae);
        return (estab !== null && estab > 0) || 
               (emp !== null && emp > 0) || 
               (massa !== null && massa > 0) || 
               (sal !== null && sal > 0);
    });

    if (!vocacoesValidas.length) {
        $subtitle.text("Vocações: Sem registro relevante");
        $container.html('<div class="col-12 text-slate-400 text-xs italic">Nenhuma vocação com atividade econômica ativa encontrada.</div>');
        return;
    }

    // Atualiza a badge resumo da Caracterização no topo da página
    const titulos = vocacoesValidas.map(v => v.nm_cnae_divisao || v.nm_vocacao).filter(Boolean);
    $subtitle.text(titulos.length > 0 ? `Vocações: ${titulos.slice(0, 2).join(', ')}` : "Vocações: -");

    vocacoesValidas.forEach(v => {
        const titulo = v.nm_vocacao || v.nm_cnae_divisao || 'Vocação Econômica';
        const tag = (v.tag_vocacao && v.tag_vocacao !== '-') ? v.tag_vocacao : 'Destaque Econômico';
        
        const estab = parseNum(v.estab_cnae);
        const emp = parseNum(v.emp_cnae);
        const salAvg = parseNum(v.sal_avg_cnae);
        const massaSal = parseNum(v.massa_salarial_cnae);
        const diffEmp = parseNum(v.diff_emp_trienio);
        let cagr = parseNum(v.cagr_emp_trienio);

        // BADGE DE CRESCIMENTO LIMPA (Apenas %, posicionado abaixo da tag)
        let badgeSobedesce = '';
        if (cagr !== null || diffEmp !== null) {
            let pctVal = cagr !== null ? (Math.abs(cagr) <= 1 && cagr !== 0 ? cagr * 100 : cagr) : null;
            let ehPositivo = (pctVal !== null ? pctVal >= 0 : (diffEmp !== null ? diffEmp >= 0 : true));
            
            let corClasse = ehPositivo ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200';
            let icone = ehPositivo ? '<i class="fas fa-arrow-trend-up me-1"></i>' : '<i class="fas fa-arrow-trend-down me-1"></i>';
            
            if (pctVal !== null) {
                let sinal = ehPositivo ? '+' : '';
                badgeSobedesce = `<span class="badge border rounded-pill px-2.5 py-1 text-xs font-bold ${corClasse}">${icone}${sinal}${pctVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% no triênio</span>`;
            }
        }

        $container.append(`
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between">
                <div class="mb-3">
                    <div class="mb-1.5">
                        <span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs font-bold uppercase tracking-wider">${tag}</span>
                    </div>
                    ${badgeSobedesce ? `<div class="mb-2">${badgeSobedesce}</div>` : ''}
                    <h6 class="font-black text-slate-800 text-base leading-tight mb-0" title="${titulo}">${titulo}</h6>
                </div>
                
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div class="bg-slate-50 p-2 rounded-xl">
                        <span class="text-slate-400 font-bold uppercase block text-[0.65rem]">Estabelecimentos</span>
                        <strong class="text-slate-800 text-sm font-black">${formatInt(estab)}</strong>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-xl">
                        <span class="text-slate-400 font-bold uppercase block text-[0.65rem]">Empregos Formais</span>
                        <strong class="text-slate-800 text-sm font-black">${formatInt(emp)}</strong>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-xl">
                        <span class="text-slate-400 font-bold uppercase block text-[0.65rem]">Média Salarial</span>
                        <strong class="text-slate-800 text-sm font-black">${formatMoeda(salAvg)}</strong>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-xl">
                        <span class="text-slate-400 font-bold uppercase block text-[0.65rem]">Massa Salarial</span>
                        <strong class="text-slate-800 text-sm font-black">${formatMoeda(massaSal)}</strong>
                    </div>
                </div>
            </div>
        `);
    });
}

function renderizarIndicadoresTrabalho(ind, demo) {
    const $containerKpis =$('#ficha_container_kpis_trabalho');
    const $containerBtns =$('#ficha_btns_metrica_trabalho');
    $containerKpis.empty();$containerBtns.empty();

    // Ordem canônica desejada para exibição organizada dos cards
    const ordemDesejada = [
        'estab_total', 'emp_total', 'sal_avg', 'sal_med',
        'estab_agro', 'emp_agro', 'sal_avg_agro', 'pct_estab_agro', 'pct_emp_agro',
        'estab_ind', 'emp_ind', 'sal_avg_ind', 'pct_estab_ind', 'pct_emp_ind', 'emp_me_do_ind', 'pct_emp_me_do_ind',
        'estab_serv', 'emp_serv', 'sal_avg_serv', 'pct_estab_serv', 'pct_emp_serv'
    ];

    const normText = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Filtra exclusivamente o grupo "mercado de trabalho"
    let itensTrabalho = (ind || []).filter(i => normText(i.grupo) === 'mercado de trabalho');

    if (!itensTrabalho.length) {
        $containerKpis.html('<div class="col-12 text-slate-400 text-xs italic">Sem indicadores de mercado de trabalho registrados.</div>');
        $('#ficha_map_trabalho_container').closest('.bg-white').hide();
        return;
    } else {
        $('#ficha_map_trabalho_container').closest('.bg-white').show();
    }

    // Ordenação lógica (Geral -> Agro -> Indústria -> Serviços)
    itensTrabalho.sort((a, b) => {
        let posA = ordemDesejada.indexOf(String(a.sigla_indicador).toLowerCase());
        let posB = ordemDesejada.indexOf(String(b.sigla_indicador).toLowerCase());
        return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB);
    });

    const siglasUnicas = [...new Set(itensTrabalho.map(i => i.sigla_indicador))];
    if (!metricaTrabalhoAtiva && siglasUnicas.length > 0) metricaTrabalhoAtiva = siglasUnicas[0];

    siglasUnicas.forEach((sigla) => {
        const item = itensTrabalho.filter(i => i.sigla_indicador === sigla).sort((a, b) => b.ano - a.ano)[0];
        const tipoNorm = item.tipo ? String(item.tipo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
        let val = parseFloat(String(item.indicador).replace(',', '.')), textoValor = "-";

        if (!isNaN(val)) {
            if (tipoNorm === 'percentual' || String(item.nm_indicador).includes('%')) {
                textoValor = val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + "%";
            } else if (tipoNorm === 'moeda' || String(item.nm_indicador).toLowerCase().includes('salarial')) {
                textoValor = 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (tipoNorm === 'absoluto') {
                textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            } else {
                textoValor = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
            }
        } else {
            textoValor = item.indicador;
        }

        // Escolha do ícone e cor por setor
        let iconeSetor = 'fa-user-tie';
        let corSetor = '#059669'; // Verde padrão
        const siglaLow = sigla.toLowerCase();

        if (siglaLow.includes('agro')) { iconeSetor = 'fa-tractor'; corSetor = '#1ABC9C'; }
        else if (siglaLow.includes('ind')) { iconeSetor = 'fa-industry'; corSetor = '#34495E'; }
        else if (siglaLow.includes('serv')) { iconeSetor = 'fa-store'; corSetor = '#2980B9'; }
        else if (siglaLow.includes('total') || siglaLow === 'sal_avg' || siglaLow === 'sal_med') { iconeSetor = 'fa-briefcase'; corSetor = '#0C2856'; }

        const rankBadge = item.rank_pe ? `<span class="badge bg-slate-100 text-slate-700 border ms-1" style="font-size:0.65rem; padding: 2px 6px;">${item.rank_pe}º em PE</span>` : '';
        const meta = window.dadosMetadados.find(m => String(m.cd_indicador || '').trim().toLowerCase() === String(sigla || '').trim().toLowerCase());
        const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="window.abrirModalMetadado('${sigla}')" title="Ver Metadados"></i>` : '';

        $containerKpis.append(`
            <div class="kpi-modern-card" style="border-left-color: ${corSetor};">
              <div class="kpi-modern-header text-uppercase leading-tight mb-1" style="font-size: 0.72rem; min-height: 2.2em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${item.nm_indicador}">${item.nm_indicador}${iconInfo}</div>
              <div class="kpi-modern-body"><i class="fas ${iconeSetor} kpi-modern-icon" style="color: ${corSetor};"></i><span class="kpi-modern-number" id="ficha_kpi_${sigla}">${textoValor}</span></div>
              <div class="kpi-modern-footer">${window.montarRodapeKPI(siglaLow.includes('sal') ? 'R$' : (tipoNorm === 'percentual' ? '%' : (tipoNorm === 'absoluto' || siglaLow.includes('emp_') ? 'Vínculos' : '')), item.ano, item.rank_pe, sigla)}</div>
            </div>
        `);

        $containerBtns.append(`<button type="button" class="btn ${sigla === metricaTrabalhoAtiva ? 'btn-primary active' : 'btn-outline-primary'} font-bold text-xs px-2" data-metrica="${sigla}" onclick="window.alternarMetricaTrabalho('${sigla}')">${item.nm_indicador}</button>`);
    });

    const rdNome = demo?.regiao_de_desenvolvimento || demo?.['Região de Desenvolvimento'] || '-';
    $('#ficha_trabalho_rd_titulo').text(`Municípios da RD ${rdNome}`);
    renderizarMapaTrabalhoRD();
}

/* --- 6.6 DADOS FISCAIS --- */
function renderizarDadosFiscais(fiscais, ind, demo) {
    const itemCapag = (ind || []).filter(i => {
        const s = String(i.sigla_indicador || '').trim().toLowerCase();
        const nm = String(i.nm_indicador || '').trim().toLowerCase();
        return s === 'capag' || nm === 'capag';
    });
    let valCapag = '-', anoCapag = '', rankCapag = '';

    if (itemCapag.length) {
        itemCapag.sort((a, b) => b.ano - a.ano);
        valCapag = String(itemCapag[0].indicador).trim().toUpperCase();
        anoCapag = itemCapag[0].ano ? ` (${itemCapag[0].ano})` : '';
    } else if (demo && (demo.capag || demo.CAPAG) && String(demo.capag || demo.CAPAG).trim() !== 'n.d.') {
        valCapag = String(demo.capag || demo.CAPAG).trim().toUpperCase();
    }

    const $badge =$('#ficha_badge_capag');
    $badge.html(`CAPAG: ${valCapag}${anoCapag}${rankCapag}`);
    $badge.removeClass('bg-success bg-warning bg-danger bg-secondary text-dark text-white');

    const corCapag = obterCorCapag(valCapag);
    $badge.attr('style', `background-color: ${corCapag} !important; color: #ffffff !important; font-size: 0.75rem; letter-spacing: 0.05em;`);

    if (!fiscais || !fiscais.length) {
        ['ficha_container_fiscal_despesas_tipo', 'ficha_container_fiscal_despesas_tema', 'ficha_container_fiscal_receitas', 'ficha_container_fiscal_resultados'].forEach(id => {
            $(`#${id}`).html('<div class="col-12 text-slate-400 text-xs italic">Sem dados fiscais registrados.</div>');
        });
        return;
    }

    const anosDisponiveis = fiscais.map(f => parseFloat(f.exercicio)).filter(a => !isNaN(a));
    const anoAlvo = Math.max(...anosDisponiveis) - 1;
    const fiscaisAnoAlvo = fiscais.filter(f => parseFloat(f.exercicio) === anoAlvo);
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    // Termos de classificação para divisão das despesas
    const termosTema = ["EDUCACAO", "SAUDE", "SEGURANCA", "URBANISMO", "TRANSPORTE", "HABITACAO", "CIENCIA", "TECNOLOGIA"];
    
    // Filtro estrito para os 6 tipos de despesa
    const termosTipo = ["AMORTIZACAO DA DIVIDA", "JUROS E ENCARGOS", "DESPESAS CORRENTES", "DESPESAS DE PESSOAL", "INVERSOES", "INVESTIMENTOS"];

    const mapeamentoGrupos = {
        'Despesas_Tipo': {
            target: 'ficha_container_fiscal_despesas_tipo',
            filtroGrupo: (g) => normText(g).includes("DESPESA"),
            ordem: ["DESPESAS CORRENTES", "DESPESAS DE PESSOAL", "INVESTIMENTOS", "INVERSOES", "AMORTIZACAO DA DIVIDA", "JUROS E ENCARGOS"],
            filtroIndicador: (indNome) => termosTipo.some(t => normText(indNome).includes(t))
        },
        'Despesas_Tema': {
            target: 'ficha_container_fiscal_despesas_tema',
            filtroGrupo: (g) => normText(g).includes("DESPESA"),
            ordem: ["EDUCACAO", "HABITACAO", "SAUDE", "SEGURANCA", "URBANISMO", "TRANSPORTE", "CIENCIA"],
            filtroIndicador: (indNome) => termosTema.some(t => normText(indNome).includes(t))
        },
        'Receitas': {
            target: 'ficha_container_fiscal_receitas',
            filtroGrupo: (g) => normText(g).includes("RECEITA"),
            ordem: ["REC REALIZADAS", "REC DE IMPOSTOS", "REC DE TRANS CORR (UNIAO)", "REC DE TRANS CORR (ESTADO)", "OP DE CREDITO", "REC DE CAP TRANSF (UNIAO)", "REC DE CAP TRANSF (ESTADO)", "RCL"]
        },
        'Resultados': {
            target: 'ficha_container_fiscal_resultados',
            filtroGrupo: (g) => normText(g).includes("RESULTADO") || normText(g).includes("GESTÃO") || normText(g).includes("EQUILÍBRIO") || normText(g).includes("DÍVIDA"),
            ordem: ["EDUCACAO", "SAUDE", "RESULTADO ORCAMENTARIO", "PRIMARIO", "NOMINAL", "DIVIDA CONSOLIDADA LIQUIDA/RCL (PERCENTUAL)"],
            excluir: ["RESULTADO FISCAL", "RESULTADO ORCAMENTARIO RELATIVO", "RESULTADO ORCAMENTARIO PER CAPITA"]
        }
    };

    const iconesFiscais = {
        'Despesas_Tipo': 'fa-wallet',
        'Despesas_Tema': 'fa-layer-group',
        'Receitas': 'fa-piggy-bank',
        'Resultados': 'fa-chart-pie'
    };

    const coresFiscais = ['#3498DB', '#27AE60', '#8E44AD', '#F39C12', '#1ABC9C', '#34495E', '#E74C3C', '#16A085', '#D35400', '#2980B9'];

    Object.keys(mapeamentoGrupos).forEach(chaveGrp => {
        const config = mapeamentoGrupos[chaveGrp];
        const $container =$(`#${config.target}`).empty();
        
        // Filtra os dados pelo grupo
        let dadosGrp = fiscaisAnoAlvo.filter(f => config.filtroGrupo(f.grupo || ''));

        // Subfiltra se houver regra de indicador (Tipo vs Tema)
        if (config.filtroIndicador) {
            dadosGrp = dadosGrp.filter(d => config.filtroIndicador(d.indicador));
        }

        if (config.excluir) {
            dadosGrp = dadosGrp.filter(d => !config.excluir.some(ex => normText(d.indicador).includes(normText(ex))));
        }

        if (!dadosGrp.length) {
            $container.html(`<div class="col-12 text-slate-400 text-xs italic">Sem dados registrados para ${anoAlvo}.</div>`);
            return;
        }

        const indUnicos = {};
        dadosGrp.forEach(d => {
            const indNome = String(d.indicador).trim();
            const mes = parseFloat(d.mes_referencia) || 0;
            if (!indUnicos[indNome] || mes > indUnicos[indNome].mes) {
                indUnicos[indNome] = { indicador: indNome, valor: parseFloat(d.valor), ex: d.exercicio, mes: mes, rank: d.rank_pe || null };
            }
        });

        let lista = Object.values(indUnicos);

        if (chaveGrp === 'Despesas_Tipo') {
            // Juntar Serviço da Dívida (Juros + Amortizações)
            let itemAmort = null;
            let itemJuros = null;
            const novaLista = [];

            lista.forEach(it => {
                const n = normText(it.indicador);
                if (n.includes('AMORTIZACAO')) {
                    itemAmort = it;
                } else if (n.includes('JUROS')) {
                    itemJuros = it;
                } else {
                    novaLista.push(it);
                }
            });

            if (itemAmort || itemJuros) {
                const valAmort = (itemAmort && !isNaN(itemAmort.valor)) ? itemAmort.valor : 0;
                const valJuros = (itemJuros && !isNaN(itemJuros.valor)) ? itemJuros.valor : 0;
                const totalServico = valAmort + valJuros;
                const anoServ = (itemAmort?.ex || itemJuros?.ex || anoAlvo);

                novaLista.push({
                    indicador: 'Serviço da Dívida (Juros + Amortizações)',
                    valor: totalServico,
                    ex: anoServ,
                    mes: Math.max(itemAmort?.mes || 0, itemJuros?.mes || 0),
                    rank: null,
                    isServicoDivida: true
                });
            }

            lista = novaLista;
        }

        lista.sort((a, b) => {
            const ordemNorm = ["DESPESAS CORRENTES", "CUSTEIO", "DESPESAS DE PESSOAL", "PESSOAL", "INVESTIMENTOS", "INVERSOES", "SERVICO DA DIVIDA", "AMORTIZACAO DA DIVIDA", "JUROS E ENCARGOS"];
            const posA = (chaveGrp === 'Despesas_Tipo' ? ordemNorm : config.ordem).findIndex(o => normText(a.indicador).includes(normText(o)));
            const posB = (chaveGrp === 'Despesas_Tipo' ? ordemNorm : config.ordem).findIndex(o => normText(b.indicador).includes(normText(o)));
            return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB);
        });

        lista.forEach((item, idx) => {
            const corBarra = coresFiscais[idx % coresFiscais.length];
            const isPercent = item.indicador.includes('%') || item.indicador.includes('DTP') || item.indicador.includes('Vinculação') || item.indicador.includes('Relativo');
            let valFmt = "-";

            if (!isNaN(item.valor)) {
                if (isPercent) {
                    valFmt = item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + "%";
                } else {
                    const absVal = Math.abs(item.valor);
                    if (absVal >= 1e9) {
                        valFmt = "R$ " + (item.valor / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Bi";
                    } else if (absVal >= 1e6) {
                        valFmt = "R$ " + (item.valor / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Mi";
                    } else {
                        valFmt = "R$ " + item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                    }
                }
            }

            // BUSCA METADADOS E POLARIDADE DO INDICADOR FISCAL
            const normKey = (str) => String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const itemNorm = normKey(item.indicador);

            const meta = window.dadosMetadados.find(m => 
                normKey(m.cd_indicador) === itemNorm || normKey(m.nm_indicador) === itemNorm
            );

            const cdMeta = meta ? (meta.cd_indicador || meta.nm_indicador) : item.indicador;
            const iconInfo = meta ? ` <i class="fas fa-info-circle icon-metadado text-slate-300 hover:text-blue-500 cursor-pointer ms-1 transition-colors" onclick="event.stopPropagation(); window.abrirModalMetadado('${cdMeta}')" title="Ver Metadados"></i>` : '';
            const badgePolaridade = meta ? obterBadgePolaridade(cdMeta) : '';

            let nomeIndicadorExib = item.indicador;
            const nIndNorm = normText(nomeIndicadorExib);

            // a) Trocar "Despesas Correntes" por "Custeio – Outras Despesas Correntes"
            if (nIndNorm.includes('DESPESAS CORRENTES') && !nIndNorm.includes('PESSOAL')) {
                nomeIndicadorExib = 'Custeio – Outras Despesas Correntes';
            }

            // b) Trocar DTC / RCL ou DTP / RCL por "Pessoal"
            if (nIndNorm === 'DTP/RCL' || nIndNorm === 'DTC/RCL' || nIndNorm.includes('DTP') || nIndNorm.includes('DTC') || (nIndNorm.includes('PESSOAL') && nIndNorm.includes('RCL'))) {
                nomeIndicadorExib = 'Pessoal';
            }
            const cdMetaEscaped = String(cdMeta || '').replace(/'/g, "\\'");
            const nomeExibEscaped = String(nomeIndicadorExib || '').replace(/'/g, "\\'");

            $container.append(`
                <div class="kpi-modern-card" style="border-left-color: ${corBarra};">
                  <div class="kpi-modern-header d-flex justify-content-between align-items-start gap-1.5" style="white-space: normal; line-height: 1.25; min-height: 2.5rem; word-break: break-word;" title="${nomeIndicadorExib}">
                    <span class="kpi-header-title" title="${nomeIndicadorExib}">${nomeIndicadorExib}</span>
                    <div class="kpi-actions-container d-flex gap-1 align-items-center flex-shrink-0 d-print-none">
                      <button type="button" class="btn btn-light bg-white border border-slate-200 shadow-2xs d-flex justify-content-center align-items-center" 
                              onclick="event.stopPropagation(); window.abrirModalMetadado('${cdMetaEscaped}')" 
                              style="width: 24px; height: 24px; border-radius: 6px; padding: 0; min-width: 24px;" title="Ver Metadados e Informações">
                        <i class="fas fa-info text-slate-400" style="font-size: 0.65rem;"></i>
                      </button>
                      <button type="button" class="btn btn-light bg-white border border-slate-200 shadow-2xs d-flex justify-content-center align-items-center" 
                              onclick="event.stopPropagation(); window.abrirModalSerieHistoricaMun('${cdMetaEscaped}', '${nomeExibEscaped}', 'fiscal')" 
                              style="width: 24px; height: 24px; border-radius: 6px; padding: 0; min-width: 24px;" title="Ver Série Histórica e Comparativo">
                        <i class="fas fa-arrow-right" style="color: #0C2856; font-size: 0.65rem;"></i>
                      </button>
                    </div>
                  </div>
                  <div class="kpi-modern-body"><i class="fas ${iconesFiscais[chaveGrp]} kpi-modern-icon" style="color: ${corBarra};"></i><span class="kpi-modern-number" style="font-size: 1.4rem;">${valFmt}</span></div>
                  <div class="kpi-modern-footer">${window.montarRodapeKPI(valFmt.includes('%') ? '%' : (valFmt.includes('R$') ? 'R$' : ''), item.ex || '-', item.rank, cdMeta)}</div>
                </div>
            `);
        });
    });
}

/* --- 6.7 INICIATIVAS REGIONAIS E CONVÊNIOS --- */
function renderizarIniciativasFicha(dados, demo) {
    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const eConvenio = (d) => normText(d.tipologia).includes("CONVENIOS COM MUNICIPIOS") || normText(d.iniciativa_estrategica).includes("CONVENIOS COM MUNICIPIOS");

    const dadosAcoes = dados.filter(d => !eConvenio(d));
    const dadosConvenios = dados.filter(d => eConvenio(d));

    const formataBi = (v) => (v >= 1e9) ? "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi" : ((v >= 1e6) ? "R$ " + (v / 1e6).toFixed(2).replace('.', ',') + " Mi" : "R$ " + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
    const formatarData = (iso) => (!iso || iso === "-") ? "-" : String(iso).substring(0, 10).split('-').reverse().join('/');

    let vTotalAcoes = 0, vPagoAcoes = 0, execAcoes = 0, secCountAcoes = {}, secValAcoes = {}, statusCountAcoes = {};

    dadosAcoes.forEach(d => {
        let tot = parseFloat(d.valor_total) || 0, pag = parseFloat(d.valor_pago) || 0;
        vTotalAcoes += tot; vPagoAcoes += pag;

        let st = (d.status && d.status !== "-") ? d.status.trim() : 'Não Informado';
        if (st.toUpperCase() === 'EM EXECUÇÃO') execAcoes++;
        statusCountAcoes[st] = (statusCountAcoes[st] || 0) + 1;

        let sec = (d.secretaria && d.secretaria !== "-") ? d.secretaria.trim() : 'N/I';
        secCountAcoes[sec] = (secCountAcoes[sec] || 0) + 1;
        secValAcoes[sec] = (secValAcoes[sec] || 0) + tot;
    });

    $('#ficha_kpi_ini_total').text(dadosAcoes.length);
    $('#ficha_kpi_ini_execucao').text(execAcoes);
    $('#ficha_kpi_ini_val_tot').text(formataBi(vTotalAcoes));
    $('#ficha_kpi_ini_val_pag').text(formataBi(vPagoAcoes));
    if (typeof window.atualizarKpiCozinhasMunicipio === 'function') {
        const munNome = (demo && demo.municipio) ? demo.municipio : (window.municipioAtualFicha || '');
        const munIbge = (demo && (demo.cod_ibge || demo.ibge7 || demo.ibge6)) ? (demo.cod_ibge || demo.ibge7 || demo.ibge6) : '';
        window.atualizarKpiCozinhasMunicipio(munNome, munIbge);
    }

    let outStatusAcoes = Object.entries(statusCountAcoes).filter(k => k[0].toUpperCase() !== 'EM EXECUÇÃO').sort((a, b) => b[1] - a[1]).slice(0, 2).map(k => `${k[1]} ${k[0]}`).join(' | ');
    $('#ficha_kpi_ini_top_status').text(outStatusAcoes || "Nenhum outro status");

    const renderBarChart = (id, dict, prefix) => {
        const dom = document.getElementById(id);
        if (!dom) return;
        let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        let arr = Object.entries(dict).sort((a, b) => a[1] - b[1]).slice(-5);
        const maxVal = Math.max(...arr.map(x => x[1]), 0);

        chart.setOption({
            grid: { left: '3%', right: '22%', bottom: '8%', top: '5%', containLabel: true },
            xAxis: { type: 'value', max: maxVal > 0 ? maxVal * 1.3 : 'dataMax', axisLabel: { formatter: (val) => (prefix === 'R$' && val >= 1e6) ? (val / 1e6).toFixed(1) + ' Mi' : val, fontSize: 9 }, splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: arr.map(x => x[0]), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 9, width: 70, overflow: 'truncate' } },
            series: [{ type: 'bar', data: arr.map(x => x[1]), itemStyle: { color: '#ff5a26', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', formatter: (p) => prefix === 'R$' ? formataBi(p.value) : p.value, fontSize: 9, color: '#333333' } }],
            tooltip: { trigger: 'axis', formatter: (p) => `<b>${p[0].name}</b><br/>${prefix} ${p[0].value.toLocaleString('pt-BR')}` }
        }, true);
        chart.resize();
        window.addEventListener('resize', () => chart.resize());
    };

    renderBarChart('ficha_chart_iniciativas_sec', secCountAcoes, '');
    renderBarChart('ficha_chart_valor_sec', secValAcoes, 'R$');

    // DataTables Ações
    if ($('#ficha_tabela_iniciativas').length && $.fn.DataTable.isDataTable('#ficha_tabela_iniciativas') && dtFichaIniciativas) {
        dtFichaIniciativas.clear().rows.add(dadosAcoes).draw(false);

    } else {
        if ($('#ficha_tabela_iniciativas').length) dtFichaIniciativas = $('#ficha_tabela_iniciativas').DataTable({
            data: dadosAcoes, deferRender: true, language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" }, pageLength: 5, scrollX: true,
            columns: [
                { title: "Órgão", data: null, className: "align-middle", width: "110px", render: (d, t, r) => t !== 'display' ? r.secretaria : `<div class="dt-cell-card d-flex align-items-center justify-content-center"><span class="badge bg-black text-white rounded-pill px-3 py-2 shadow-sm" style="font-size:11px;">${(r.secretaria || "").trim() || '-'}</span></div>` },
                { title: "Iniciativa", data: null, className: "align-middle", width: "270px", render: (d, t, r) => t !== 'display' ? r.iniciativa_estrategica : `<div class="dt-cell-card" style="white-space: normal;">${(r.no_contrato && r.no_contrato !== "-") ? `<div class="mb-1"><span class="badge bg-light border text-dark">${r.no_contrato}</span></div>` : ''}<div class="fw-bold mb-1" style="font-size:0.85rem; color:#1a3c6e;">${r.iniciativa_estrategica || '-'}</div><div class="text-muted" style="font-size:0.75rem;">${r.produto || '-'}</div></div>` },
                { title: "Tipologia", data: "tipologia", defaultContent: "-", className: "align-middle small fw-bold", render: (d, t) => t !== 'display' ? d : `<div class="dt-cell-card align-items-start justify-content-center" style="font-size:0.8rem; color:#444;">${d || '-'}</div>` },
                { title: "Execução", data: null, className: "align-middle", width: "135px", render: (d, t, r) => t !== 'display' ? r.status : `<div class="dt-cell-card"><div class="d-flex align-items-center gap-1 mb-1 text-truncate"><span style="font-size:0.75rem; font-weight:800; color:#F39C12;">●</span> <span style="font-size:0.75rem; font-weight:700; color:#444;">${r.status || "-"}</span></div><div class="d-flex align-items-center gap-2"><div class="progress w-100" style="height:6px; background-color: #e9ecef;"><div class="progress-bar bg-warning" style="width:${Number(r.percent_execucao) || 0}%"></div></div><small class="text-muted fw-bold" style="font-size:0.7rem;">${Number(r.percent_execucao) || 0}%</small></div></div>` },
                { 
    title: "Financeiro", 
    data: null, 
    className: "align-middle", 
    width: "155px", 
    render: (d, t, r) => {
        if (t !== 'display') return r.valor_total;
        const tot = Number(r.valor_total) || 0;
        const pag = Number(r.valor_pago) || 0;
        const pct = tot > 0 ? Math.round((pag / tot) * 100) : 0;

        return `<div class="dt-cell-card">
            <div class="fw-bold" style="color:#1a3c6e; font-size: 0.8rem;">Tot: <span class="text-dark">${tot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span></div>
            <div class="text-success fw-bold" style="font-size: 0.75rem;">Pag: ${pag.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} <span class="text-muted font-normal">(${pct}% pago)</span></div>
            <div class="d-flex align-items-center gap-2 mt-1">
                <div class="progress w-100" style="height:5px; background-color:#e9ecef;">
                    <div class="progress-bar bg-info" style="width:${Math.min(pct, 100)}%"></div>
                </div>
            </div>
        </div>`;
    } 
},
                { title: "Período", data: null, className: "align-middle text-center", width: "110px", render: (d, t, r) => t !== 'display' ? r.data_de_inicio : `<div class="dt-cell-card align-items-center justify-content-center"><span class="text-muted fw-bold" style="font-size:0.75rem; text-align:center;">${formatarData(r.data_de_inicio)}<br><span style="font-weight:normal; font-size:0.65rem;">a</span><br>${formatarData(r.data_de_termino)}</span></div>` }
            ]
        });
    }

    // Convênios
    let vTotalConv = 0, vPagoConv = 0, execConv = 0, statusCountConv = {};
    dadosConvenios.forEach(d => {
        let tot = parseFloat(d.valor_total) || 0, pag = parseFloat(d.valor_pago) || 0;
        vTotalConv += tot; vPagoConv += pag;

        let st = (d.status && d.status !== "-") ? d.status.trim() : 'Não Informado';
        if (st.toUpperCase() === 'EM EXECUÇÃO') execConv++;
        statusCountConv[st] = (statusCountConv[st] || 0) + 1;
    });

    $('#ficha_kpi_conv_total').text(dadosConvenios.length);
    $('#ficha_kpi_conv_execucao').text(execConv);
    $('#ficha_kpi_conv_val_tot').text(formataBi(vTotalConv));
    $('#ficha_kpi_conv_val_pag').text(formataBi(vPagoConv));

    let outStatusConv = Object.entries(statusCountConv).filter(k => k[0].toUpperCase() !== 'EM EXECUÇÃO').sort((a, b) => b[1] - a[1]).slice(0, 2).map(k => `${k[1]} ${k[0]}`).join(' | ');
    $('#ficha_kpi_conv_top_status').text(outStatusConv || "Nenhum outro status");

    if ($('#ficha_tabela_convenios').length && $.fn.DataTable.isDataTable('#ficha_tabela_convenios') && dtFichaConvenios) {
        dtFichaConvenios.clear().rows.add(dadosConvenios).draw(false);
    } else {
        if ($('#ficha_tabela_convenios').length) dtFichaConvenios = $('#ficha_tabela_convenios').DataTable({
            data: dadosConvenios, deferRender: true, language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" }, pageLength: 5, scrollX: true,
            columns: [
                { title: "Órgão", data: null, className: "align-middle", width: "110px", render: (d, t, r) => t !== 'display' ? r.secretaria : `<div class="dt-cell-card d-flex align-items-center justify-content-center"><span class="badge bg-black text-white rounded-pill px-3 py-2 shadow-sm" style="font-size:11px;">${(r.secretaria || "").trim() || '-'}</span></div>` },
                { title: "Objeto do Convênio", data: null, className: "align-middle", width: "270px", render: (d, t, r) => t !== 'display' ? (r.produto || r.iniciativa_estrategica) : `<div class="dt-cell-card" style="white-space: normal;">${(r.no_contrato && r.no_contrato !== "-") ? `<div class="mb-1"><span class="badge bg-light border text-dark">${r.no_contrato}</span></div>` : ''}<div class="fw-bold mb-1" style="font-size:0.85rem; color:#1a3c6e;">${r.produto || r.iniciativa_estrategica || '-'}</div></div>` },
                { title: "Execução", data: null, className: "align-middle", width: "135px", render: (d, t, r) => t !== 'display' ? r.status : `<div class="dt-cell-card"><div class="d-flex align-items-center gap-1 mb-1 text-truncate"><span style="font-size:0.75rem; font-weight:800; color:#F39C12;">●</span> <span style="font-size:0.75rem; font-weight:700; color:#444;">${r.status || "-"}</span></div><div class="d-flex align-items-center gap-2"><div class="progress w-100" style="height:6px; background-color: #e9ecef;"><div class="progress-bar bg-warning" style="width:${Number(r.percent_execucao) || 0}%"></div></div><small class="text-muted fw-bold" style="font-size:0.7rem;">${Number(r.percent_execucao) || 0}%</small></div></div>` },
                { 
    title: "Financeiro", 
    data: null, 
    className: "align-middle", 
    width: "155px", 
    render: (d, t, r) => {
        if (t !== 'display') return r.valor_total;
        const tot = Number(r.valor_total) || 0;
        const pag = Number(r.valor_pago) || 0;
        const pct = tot > 0 ? Math.round((pag / tot) * 100) : 0;

        return `<div class="dt-cell-card">
            <div class="fw-bold" style="color:#1a3c6e; font-size: 0.8rem;">Tot: <span class="text-dark">${tot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span></div>
            <div class="text-success fw-bold" style="font-size: 0.75rem;">Pag: ${pag.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} <span class="text-muted font-normal">(${pct}% pago)</span></div>
            <div class="d-flex align-items-center gap-2 mt-1">
                <div class="progress w-100" style="height:5px; background-color:#e9ecef;">
                    <div class="progress-bar bg-info" style="width:${Math.min(pct, 100)}%"></div>
                </div>
            </div>
        </div>`;
    } 
},
                { title: "Período", data: null, className: "align-middle text-center", width: "110px", render: (d, t, r) => t !== 'display' ? r.data_de_inicio : `<div class="dt-cell-card align-items-center justify-content-center"><span class="text-muted fw-bold" style="font-size:0.75rem; text-align:center;">${formatarData(r.data_de_inicio)}<br><span style="font-weight:normal; font-size:0.65rem;">a</span><br>${formatarData(r.data_de_termino)}</span></div>` }
            ]
        });
    }
}

/* --- 6.8 EMENDAS PARLAMENTARES --- */
function renderizarEmendasFicha(dados) {
    dados = dados || [];
    let vTotal = 0, vPago = 0;
    if (dados.length > 0) {
        let anosEmendas = dados.map(d => parseFloat(d.ano)).filter(a => !isNaN(a));
        $('#sec_emendas_parlamentares h4').text(anosEmendas.length > 0 ? `Emendas Parlamentares (${Math.max(...anosEmendas)})` : 'Emendas Parlamentares');
    } else {
        $('#sec_emendas_parlamentares h4').text('Emendas Parlamentares');
    }

    const normText = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

    let tipoDespesaGroup = { 
        "APLICACAO DIRETA": { count: 0, val: 0, domSuffix: "aplicacao" }, 
        "ENTIDADE": { count: 0, val: 0, domSuffix: "entidade" }, 
        "MUNICIPIO": { count: 0, val: 0, domSuffix: "municipio" }, 
        "UNIAO": { count: 0, val: 0, domSuffix: "uniao" } 
    };
    let parlGroup = {}, partidoGroup = {}, temaGroup = {};

    dados.forEach(d => {
        let val = parseFloat(d.valor || d.vlr_emenda || d.vl_emenda || 0) || 0;
        let pag = parseFloat(d.pago || d.vlr_pago || d.vl_pago || 0) || 0;
        vTotal += val; 
        vPago += pag;

        let tipoNorm = normText(d.tipo_de_despesa);
        if (tipoNorm.includes("APLIC") || tipoNorm.includes("DIRETA")) {
            tipoDespesaGroup["APLICACAO DIRETA"].count += 1;
            tipoDespesaGroup["APLICACAO DIRETA"].val += val;
        } else if (tipoNorm.includes("ENTIDADE")) {
            tipoDespesaGroup["ENTIDADE"].count += 1;
            tipoDespesaGroup["ENTIDADE"].val += val;
        } else if (tipoNorm.includes("MUNIC")) {
            tipoDespesaGroup["MUNICIPIO"].count += 1;
            tipoDespesaGroup["MUNICIPIO"].val += val;
        } else if (tipoNorm.includes("UNI")) {
            tipoDespesaGroup["UNIAO"].count += 1;
            tipoDespesaGroup["UNIAO"].val += val;
        }

        let parl = (d.parlamentar && d.parlamentar !== "-") ? d.parlamentar.trim() : 'N/I';
        parlGroup[parl] = (parlGroup[parl] || 0) + val;

        let partido = (d.partido && d.partido !== "-") ? d.partido.trim() : 'N/I';
        partidoGroup[partido] = (partidoGroup[partido] || 0) + val;

        let tema = (d.tema && d.tema !== "-") ? d.tema.trim() : 'OUTROS';
        temaGroup[tema] = (temaGroup[tema] || 0) + val;
    });

    const formataBi = (v) => (v >= 1e9) ? "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi" : ((v >= 1e6) ? "R$ " + (v / 1e6).toFixed(2).replace('.', ',') + " Mi" : "R$ " + (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));

    $('#ficha_kpi_eme_total').text(dados.length.toLocaleString('pt-BR'));
    $('#ficha_kpi_eme_val_tot').text(formataBi(vTotal));
    $('#ficha_kpi_eme_val_pag').text(formataBi(vPago));

    Object.values(tipoDespesaGroup).forEach(info => {
        let pct = vTotal > 0 ? ((info.val / vTotal) * 100).toFixed(1) : "0,0";
        $(`#ficha_kpi_eme_td_${info.domSuffix}_qtd`).text(info.count.toLocaleString('pt-BR'));
        $(`#ficha_kpi_eme_td_${info.domSuffix}_sub`).text(`${formataBi(info.val)} (${pct}%)`);
    });

    const renderBarChartEme = (id, dict, cor) => {
        const dom = document.getElementById(id);
        if (!dom) return;
        let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        let arr = Object.entries(dict).filter(x => x[1] > 0).sort((a, b) => a[1] - b[1]).slice(-5);
        if (arr.length === 0) {
            arr = Object.entries(dict).sort((a, b) => a[1] - b[1]).slice(-5);
        }
        const maxVal = Math.max(...arr.map(x => x[1]), 0);

        chart.setOption({
            grid: { left: '3%', right: '22%', bottom: '8%', top: '5%', containLabel: true },
            xAxis: { 
                type: 'value', 
                max: maxVal > 0 ? maxVal * 1.3 : 'dataMax', 
                axisLabel: { 
                    formatter: (val) => (val >= 1e6) ? (val / 1e6).toFixed(1) + ' Mi' : ((val >= 1e3) ? (val / 1e3).toFixed(0) + ' mil' : val), 
                    fontSize: 9 
                }, 
                splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } 
            },
            yAxis: { 
                type: 'category', 
                data: arr.map(x => x[0]), 
                axisLine: { show: false }, 
                axisTick: { show: false }, 
                axisLabel: { fontSize: 9, width: 85, overflow: 'truncate' } 
            },
            series: [{ 
                type: 'bar', 
                data: arr.map(x => x[1]), 
                itemStyle: { color: cor, borderRadius: [0, 4, 4, 0] }, 
                label: { show: true, position: 'right', formatter: (p) => formataBi(p.value), fontSize: 9, color: '#333333' } 
            }],
            tooltip: { 
                trigger: 'axis', 
                formatter: (p) => `<b>${p[0].name}</b><br/>R$ ${(Number(p[0].value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            }
        }, true);
        chart.resize();
        window.addEventListener('resize', () => chart.resize());
    };

    renderBarChartEme('ficha_chart_eme_parlamentares', parlGroup, '#E67E22');
    renderBarChartEme('ficha_chart_eme_partidos', partidoGroup, '#16A085');
    renderBarChartEme('ficha_chart_eme_temas', temaGroup, '#8E44AD');

    if ($('#ficha_tabela_emendas').length) {
        if ($.fn.DataTable.isDataTable('#ficha_tabela_emendas')) {
            dtFichaEmendas = $('#ficha_tabela_emendas').DataTable();
            dtFichaEmendas.clear().rows.add(dados).draw(false);
        } else {
            dtFichaEmendas = $('#ficha_tabela_emendas').DataTable({
            data: dados, 
            deferRender: true, 
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" }, 
            pageLength: 5, 
            scrollX: true,
            columns: [
                { 
                    title: "Parlamentar", 
                    data: null, 
                    className: "align-middle", 
                    width: "140px", 
                    render: (d, t, r) => t !== 'display' ? (r.parlamentar || '') : `
                        <div class="dt-cell-card">
                            <div class="fw-bold text-dark text-truncate" style="font-size:0.85rem;" title="${r.parlamentar || '-'}">
                                ${r.parlamentar || '-'}${(r.partido && r.partido !== "-") ? `<span class="badge bg-secondary ms-1">${r.partido}</span>` : ''}
                            </div>
                            <div class="d-flex align-items-center gap-1 mt-1 flex-wrap">
                                <span class="badge bg-primary px-1.5 py-0.5" style="font-size:0.65rem;">Ano ${r.ano || '-'}</span>
                                <span class="text-muted fw-bold text-truncate" style="font-size:0.65rem;" title="${r.municipio || r.nm_municipio || '-'}">${r.municipio || r.nm_municipio || '-'}</span>
                            </div>
                        </div>` 
                },
                { 
                    title: "Ação / Objeto", 
                    data: null, 
                    className: "align-middle", 
                    width: "420px", 
                    render: (d, t, r) => t !== 'display' ? (r.acao_nome || '') : `
                        <div class="dt-cell-card" style="white-space: normal;">
                            <div class="fw-bold mb-1" style="font-size:0.85rem; color:#1a3c6e;">${r.acao_nome || '-'}</div>
                            <div class="text-muted" style="font-size:0.75rem;">${r.objeto || '-'}</div>
                        </div>` 
                },
                { 
                    title: "Tema", 
                    data: null, 
                    className: "align-middle", 
                    width: "130px", 
                    render: (d, t, r) => t !== 'display' ? (r.tema || '') : `
                        <div class="dt-cell-card">
                            <div class="fw-bold text-dark" style="font-size:0.8rem;">${r.tema || '-'}</div>
                            <div class="text-muted" style="font-size:0.75rem;">${r.tipo_de_despesa || '-'}</div>
                            <div class="text-muted" style="font-size:0.7rem;">UO: ${r.uo_sigla || '-'}</div>
                        </div>` 
                },
                { 
                    title: "Status / Situação", 
                    data: null, 
                    className: "align-middle", 
                    width: "150px", 
                    render: (d, t, r) => t !== 'display' ? (r.status || r.status_documental_fisico || '') : `
                        <div class="dt-cell-card">
                            <div class="mb-1">
                                <span class="badge bg-light border text-dark fw-bold text-truncate" style="font-size:0.75rem; max-width: 100%;" title="${(r.status && r.status !== "-") ? r.status.trim() : 'N/I'}">
                                    ${(r.status && r.status !== "-") ? r.status.trim() : 'N/I'}
                                </span>
                            </div>
                            ${(r.status_documental_fisico && r.status_documental_fisico !== "-") ? `<div class="text-muted" style="font-size:0.7rem; line-height:1.2;">${r.status_documental_fisico.trim()}</div>` : ''}
                        </div>` 
                },
                { 
                    title: "Financeiro", 
                    data: null, 
                    className: "align-middle", 
                    width: "130px", 
                    render: (d, t, r) => {
                        const val = Number(r.valor || r.vlr_emenda || r.vl_emenda || 0) || 0;
                        const pag = Number(r.pago || r.vlr_pago || r.vl_pago || 0) || 0;
                        if (t !== 'display') return val;
                        const pct = val > 0 ? Math.round((pag / val) * 100) : 0;

                        return `
                            <div class="dt-cell-card">
                                <div class="fw-bold" style="color:#1a3c6e; font-size: 0.8rem;">Ind: ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</div>
                                <div class="text-success fw-bold" style="font-size: 0.75rem;">Pag: ${pag.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} <span class="text-muted font-normal">(${pct}% pago)</span></div>
                                <div class="d-flex align-items-center gap-2 mt-1">
                                    <div class="progress w-100" style="height:5px; background-color:#e9ecef;">
                                        <div class="progress-bar bg-success" style="width:${Math.min(pct, 100)}%"></div>
                                    </div>
                                </div>
                            </div>`;
                    } 
                }
            ]
        });
        }
    }
}

/* ==========================================================================
   NOVO: DINÂMICA DAS EMPRESAS (SEPLAG - 1,93 MILHÃO DE REGISTROS)
   ========================================================================== */
let chartEmpresasSaldoMensal = null;
let chartEmpresasSetorPorte = null;
let chartEmpresasRecifeBairros = null;
let modoGraficoEmpresasAtivo = 'setor';
let cacheDadosEmpresasFicha = {
    resumo: null,
    saldo: [],
    setor: [],
    faixa: [],
    bairros: [],
    peResumo: null,
    nomeMun: ''
};

window.alternarGraficoEmpresas = function(modo) {
    modoGraficoEmpresasAtivo = modo;
    $('#btn_toggle_emp_setor').toggleClass('btn-primary active', modo === 'setor').toggleClass('btn-outline-primary', modo !== 'setor');
    $('#btn_toggle_emp_porte').toggleClass('btn-primary active', modo === 'porte').toggleClass('btn-outline-primary', modo !== 'porte');
    renderizarGraficoSetorPorte(cacheDadosEmpresasFicha.setor, cacheDadosEmpresasFicha.resumo);
};

function renderizarDinamicaEmpresas(resumo, saldo, setor, faixa, bairros, peResumo, nomeMun) {
    cacheDadosEmpresasFicha = {
        resumo: (resumo && resumo[0]) || resumo || {},
        saldo: saldo || [],
        setor: setor || [],
        faixa: faixa || [],
        bairros: bairros || [],
        peResumo: (peResumo && peResumo[0]) || peResumo || {},
        nomeMun: nomeMun || ''
    };

    const r = cacheDadosEmpresasFicha.resumo;
    const pe = cacheDadosEmpresasFicha.peResumo;

    // 1. KPIs
    const totalAtivas = parseFloat(r.total_ativas) || 0;
    const totalMei = parseFloat(r.total_mei) || 0;
    const densidade = parseFloat(r.empresas_por_mil_hab) || 0;
    const taxaMei = parseFloat(r.taxa_meizacao) || (totalAtivas > 0 ? (totalMei / totalAtivas) * 100 : 0);
    const idadeMedia = parseFloat(r.idade_media_ativas) || 0;
    const saldo12m = parseFloat(r.saldo_12m) || 0;
    const aberturas12m = parseFloat(r.aberturas_12m) || 0;
    const fechamentos12m = parseFloat(r.fechamentos_12m) || 0;
    const densidadePe = parseFloat(pe.densidade_media_pe) || 64.2;

    // Card 1
    $('#ficha_kpi_emp_total_ativas').text(totalAtivas > 0 ? totalAtivas.toLocaleString('pt-BR') : '-');
    $('#ficha_kpi_emp_densidade').text(densidade > 0 ? densidade.toFixed(1) + ' / 1k hab.' : '-');
    $('#ficha_kpi_emp_densidade_pe').text(densidadePe.toFixed(1) + ' / 1k hab.');

    // Card 2
    $('#ficha_kpi_emp_taxa_meizacao').text(taxaMei > 0 ? taxaMei.toFixed(1) + '%' : '-');
    $('#ficha_kpi_emp_total_mei').text(totalMei > 0 ? totalMei.toLocaleString('pt-BR') + ' MEIs' : '-');
    $('#ficha_kpi_emp_idade_media').text(idadeMedia > 0 ? idadeMedia.toFixed(1) + ' anos' : '-');

    // Card 3
    const sinalSaldo = saldo12m > 0 ? '+' : '';
    $('#ficha_kpi_emp_saldo_12m').text(saldo12m !== 0 ? (sinalSaldo + saldo12m.toLocaleString('pt-BR')) : '0');
    
    const $badgeTend = $('#ficha_badge_emp_saldo_tendencia');
    if (saldo12m > 0) {
        $badgeTend.attr('class', 'badge rounded-pill px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300')
                  .html('<i class="fas fa-arrow-trend-up me-1"></i>Expansão (+)');
    } else if (saldo12m < 0) {
        $badgeTend.attr('class', 'badge rounded-pill px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300')
                  .html('<i class="fas fa-arrow-trend-down me-1"></i>Contração (-)');
    } else {
        $badgeTend.attr('class', 'badge rounded-pill px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300')
                  .html('<i class="fas fa-minus me-1"></i>Neutro');
    }

    $('#ficha_kpi_emp_aberturas_12m').text(aberturas12m > 0 ? aberturas12m.toLocaleString('pt-BR') + ' empresas' : '-');
    $('#ficha_kpi_emp_fechamentos_12m').text(fechamentos12m > 0 ? fechamentos12m.toLocaleString('pt-BR') + ' baixas' : '-');

    // 2. Gráfico 1: Aberturas vs Fechamentos e Saldo Mensal
    renderizarGraficoSaldoMensal(cacheDadosEmpresasFicha.saldo);

    // 3. Gráfico 2: Composição Setorial e Porte
    renderizarGraficoSetorPorte(cacheDadosEmpresasFicha.setor, cacheDadosEmpresasFicha.resumo);

    // 4. Se for Recife, drill-down de bairros
    const isRecife = String(nomeMun).toLowerCase().trim() === 'recife';
    if (isRecife && cacheDadosEmpresasFicha.bairros && cacheDadosEmpresasFicha.bairros.length > 0) {
        $('#ficha_box_empresas_recife').removeClass('d-none');
        renderizarGraficoBairrosRecife(cacheDadosEmpresasFicha.bairros);
    } else {
        $('#ficha_box_empresas_recife').addClass('d-none');
    }
}

function renderizarGraficoSaldoMensal(saldoArr) {
    const dom = document.getElementById('ficha_chart_empresas_saldo_mensal');
    if (!dom || typeof echarts === 'undefined') return;

    if (chartEmpresasSaldoMensal) {
        chartEmpresasSaldoMensal.dispose();
    }
    chartEmpresasSaldoMensal = echarts.init(dom);

    if (!saldoArr || !saldoArr.length) {
        chartEmpresasSaldoMensal.setOption({
            title: { text: 'Sem histórico mensal de empresas para este município', left: 'center', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } }
        });
        return;
    }

    const meses = saldoArr.map(d => d.ano_mes);
    const aberturas = saldoArr.map(d => parseInt(d.aberturas) || 0);
    const fechamentos = saldoArr.map(d => parseInt(d.fechamentos) || 0);
    const saldos = saldoArr.map(d => parseInt(d.saldo) || 0);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1 text-slate-800">${params[0].name}</div>`;
                params.forEach(p => {
                    out += `<div class="d-flex justify-content-between gap-3 text-xs">
                        <span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span>
                        <strong>${(p.value >= 0 && p.seriesName === 'Saldo Líquido' ? '+' : '') + p.value.toLocaleString('pt-BR')}</strong>
                    </div>`;
                });
                return out;
            }
        },
        legend: {
            data: ['Aberturas', 'Fechamentos', 'Saldo Líquido'],
            top: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold', color: '#475569' }
        },
        grid: {
            top: 45,
            left: '3%',
            right: '4%',
            bottom: 50,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: meses,
            axisPointer: { type: 'shadow' },
            axisLabel: {
                fontSize: 10,
                color: '#64748b',
                formatter: function(val) {
                    return val ? val.substring(2) : '';
                }
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Volume',
                splitLine: { lineStyle: { type: 'dashed', stroke: '#f1f5f9' } },
                axisLabel: { fontSize: 10, color: '#64748b' }
            },
            {
                type: 'value',
                name: 'Saldo Líquido',
                splitLine: { show: false },
                axisLabel: { fontSize: 10, color: '#ff5a26' }
            }
        ],
        dataZoom: [
            { type: 'inside', start: 60, end: 100 },
            { type: 'slider', bottom: 5, height: 20, start: 60, end: 100, borderColor: '#e2e8f0' }
        ],
        series: [
            {
                name: 'Aberturas',
                type: 'bar',
                data: aberturas,
                itemStyle: { color: '#10b981', borderRadius: [3, 3, 0, 0] }
            },
            {
                name: 'Fechamentos',
                type: 'bar',
                data: fechamentos,
                itemStyle: { color: '#f43f5e', borderRadius: [3, 3, 0, 0] }
            },
            {
                name: 'Saldo Líquido',
                type: 'line',
                yAxisIndex: 1,
                data: saldos,
                smooth: true,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { width: 3, color: '#ff5a26' },
                itemStyle: { color: '#ff5a26' }
            }
        ]
    };

    chartEmpresasSaldoMensal.setOption(option);
}

function renderizarGraficoSetorPorte(setorArr, resumoObj) {
    const dom = document.getElementById('ficha_chart_empresas_setor_porte');
    if (!dom || typeof echarts === 'undefined') return;

    if (chartEmpresasSetorPorte) {
        chartEmpresasSetorPorte.dispose();
    }
    chartEmpresasSetorPorte = echarts.init(dom);

    if (modoGraficoEmpresasAtivo === 'porte') {
        const totalMei = parseInt(resumoObj.total_mei) || 0;
        const totalMe = parseInt(resumoObj.total_me) || 0;
        const totalEpp = parseInt(resumoObj.total_epp) || 0;
        const totalOutros = parseInt(resumoObj.total_outros_portes) || 0;

        const dataPorte = [
            { value: totalMei, name: 'MEI (Individual)', itemStyle: { color: '#f59e0b' } },
            { value: totalMe, name: 'Microempresa (ME)', itemStyle: { color: '#3b82f6' } },
            { value: totalEpp, name: 'Pequeno Porte (EPP)', itemStyle: { color: '#10b981' } },
            { value: totalOutros, name: 'Demais Portes', itemStyle: { color: '#8b5cf6' } }
        ].filter(d => d.value > 0);

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: <strong>{c}</strong> ({d}%)'
            },
            legend: {
                bottom: 5,
                left: 'center',
                textStyle: { fontSize: 10, fontWeight: 'bold' }
            },
            series: [
                {
                    name: 'Porte Empresarial',
                    type: 'pie',
                    radius: ['45%', '72%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: {
                        label: { show: true, fontSize: 13, fontWeight: 'bold' }
                    },
                    data: dataPorte
                }
            ]
        };
        chartEmpresasSetorPorte.setOption(option);
    } else {
        const topSetores = (setorArr || [])
            .map(s => ({
                setor: s.grande_setor || 'Outros',
                ativas: parseInt(s.total_ativas) || 0,
                mei: parseInt(s.total_mei_ativas) || 0
            }))
            .filter(s => s.ativas > 0)
            .sort((a, b) => a.ativas - b.ativas);

        if (!topSetores.length) {
            chartEmpresasSetorPorte.setOption({
                title: { text: 'Sem dados setoriais disponíveis', left: 'center', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } }
            });
            return;
        }

        const nomesSetores = topSetores.map(s => s.setor);
        const valsAtivas = topSetores.map(s => s.ativas);
        const valsMei = topSetores.map(s => s.mei);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                confine: true,
                formatter: function(params) {
                    let out = `<div class="font-bold text-xs mb-1">${params[0].name}</div>`;
                    params.forEach(p => {
                        out += `<div class="d-flex justify-content-between gap-3 text-xs"><span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span> <strong>${p.value.toLocaleString('pt-BR')}</strong></div>`;
                    });
                    return out;
                }
            },
            legend: {
                data: ['Total Ativas', 'Desses: MEI'],
                bottom: 0,
                textStyle: { fontSize: 10, fontWeight: 'bold' }
            },
            grid: {
                top: 15,
                left: '3%',
                right: '12%',
                bottom: 35,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                splitLine: { lineStyle: { stroke: '#f1f5f9' } },
                axisLabel: { fontSize: 10 }
            },
            yAxis: {
                type: 'category',
                data: nomesSetores,
                axisLabel: {
                    fontSize: 10,
                    width: 110,
                    overflow: 'truncate',
                    fontWeight: 'bold',
                    color: '#334155'
                }
            },
            series: [
                {
                    name: 'Total Ativas',
                    type: 'bar',
                    data: valsAtivas,
                    itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
                    label: { show: true, position: 'right', fontSize: 10, fontWeight: 'bold', formatter: '{c}' }
                },
                {
                    name: 'Desses: MEI',
                    type: 'bar',
                    data: valsMei,
                    itemStyle: { color: '#f59e0b', borderRadius: [0, 4, 4, 0] }
                }
            ]
        };
        chartEmpresasSetorPorte.setOption(option);
    }
}

function renderizarGraficoBairrosRecife(bairrosArr) {
    const dom = document.getElementById('ficha_chart_empresas_recife_bairros');
    if (!dom || typeof echarts === 'undefined') return;

    if (chartEmpresasRecifeBairros) chartEmpresasRecifeBairros.dispose();
    chartEmpresasRecifeBairros = echarts.init(dom);

    const top10 = (bairrosArr || []).slice(0, 10).reverse();
    const nomes = top10.map(b => b.bairro_norm);
    const ativas = top10.map(b => parseInt(b.total_ativas) || 0);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const b = top10[params[0].dataIndex];
                return `<div class="font-bold text-xs">${b.bairro_norm}</div>
                        <div class="text-xs">Ativas: <strong>${(parseInt(b.total_ativas)||0).toLocaleString('pt-BR')}</strong></div>
                        <div class="text-xs">MEIs: <strong>${(parseInt(b.total_mei)||0).toLocaleString('pt-BR')}</strong></div>
                        <div class="text-xs">Taxa MEI: <strong>${parseFloat(b.taxa_meizacao||0).toFixed(1)}%</strong></div>`;
            }
        },
        grid: { top: 10, left: '3%', right: '10%', bottom: '5%', containLabel: true },
        xAxis: { type: 'value', splitLine: { lineStyle: { stroke: '#f1f5f9' } }, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'category', data: nomes, axisLabel: { fontSize: 10, fontWeight: 'bold' } },
        series: [{
            type: 'bar',
            data: ativas,
            itemStyle: { color: '#ff5a26', borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', fontSize: 10, fontWeight: 'bold', formatter: '{c}' }
        }]
    };
    chartEmpresasRecifeBairros.setOption(option);
}

window.addEventListener('resize', () => {
    if (chartEmpresasSaldoMensal && typeof chartEmpresasSaldoMensal.resize === 'function') chartEmpresasSaldoMensal.resize();
    if (chartEmpresasSetorPorte && typeof chartEmpresasSetorPorte.resize === 'function') chartEmpresasSetorPorte.resize();
    if (chartEmpresasRecifeBairros && typeof chartEmpresasRecifeBairros.resize === 'function') chartEmpresasRecifeBairros.resize();
    if (chartAgriLspaMensal && typeof chartAgriLspaMensal.resize === 'function') chartAgriLspaMensal.resize();
    if (chartAgriPamHistorico && typeof chartAgriPamHistorico.resize === 'function') chartAgriPamHistorico.resize();
});

/* ==========================================================================
   6b. AGRICULTURA & ESTIAGEM (PAM E LSPA - IBGE)
   ========================================================================== */
let chartAgriLspaMensal = null;
let chartAgriPamHistorico = null;
let modoGraficoLspaAtivo = 'total';
let cacheDadosAgriFicha = {
    pam: [],
    lspa: [],
    nomeMun: ''
};

window.alternarGraficoLspa = function(modo) {
    modoGraficoLspaAtivo = modo;
    $('#btn_toggle_lspa_total').toggleClass('btn-primary active', modo === 'total').toggleClass('btn-outline-primary', modo !== 'total');
    $('#btn_toggle_lspa_cereais').toggleClass('btn-primary active', modo === 'cereais').toggleClass('btn-outline-primary', modo !== 'cereais');
    renderizarGraficoLspaMensal(cacheDadosAgriFicha.lspa);
};

function renderizarAgriculturaEstiagem(pamArr, lspaArr, nomeMun, demo) {
    cacheDadosAgriFicha = {
        pam: pamArr || [],
        lspa: lspaArr || [],
        nomeMun: nomeMun || ''
    };

    const pamDados = (pamArr || []).map(p => ({
        ano: parseInt(p.ano) || 0,
        valor_producao: parseFloat(p.valor_da_producao) || 0,
        area_colhida: parseFloat(p.area_colhida) || 0,
        qtd_produzida: parseFloat(p.quantidade_produzida) || 0
    })).sort((a, b) => a.ano - b.ano);

    // 1. CARDS KPI
    // KPI 1: Valor da Produção Agrícola
    const pamRecente = pamDados.length ? pamDados[pamDados.length - 1] : null;
    const anoRecente = pamRecente ? pamRecente.ano : 2025;
    $('#ficha_kpi_agri_ano_valor').text(`PAM ${anoRecente}`);
    $('#ficha_kpi_agri_ano_area').text(`PAM ${anoRecente}`);

    const fmtMoedaKpi = (valMil) => {
        const valReais = (Number(valMil) || 0) * 1000;
        if (valReais === 0) return 'R$ 0';
        if (valReais >= 1e9) {
            return `R$ ${(valReais / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
        }
        if (valReais >= 1e6) {
            return `R$ ${(valReais / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mi`;
        }
        return `R$ ${valReais.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
    };

    if (pamRecente && pamRecente.valor_producao > 0) {
        $('#ficha_kpi_agri_valor_producao').text(fmtMoedaKpi(pamRecente.valor_producao));
    } else {
        $('#ficha_kpi_agri_valor_producao').text('R$ 0');
    }

    // Busca ranking estadual via mapa se disponível
    const cacheMapaValor = window.cacheMapaIndicador && window.cacheMapaIndicador['agri_valor_producao'];
    if (cacheMapaValor && cacheMapaValor.municipios && cacheMapaValor.municipios[nomeMun]) {
        const itemM = cacheMapaValor.municipios[nomeMun];
        $('#ficha_kpi_agri_rank_pe').html(`Ranking PE: <strong>${itemM.rank_pe}º</strong> (${itemM.total_pe} muns)`);
        $('#ficha_kpi_agri_rank_rd').html(`Na RD: <strong>${itemM.rank_rd}º</strong> (${itemM.total_rd})`);
    } else {
        $('#ficha_kpi_agri_rank_pe').text('Produção Municipal');
        $('#ficha_kpi_agri_rank_rd').text('Agropecuária');
    }

    // KPI 2: Área Agrícola Colhida
    if (pamRecente && pamRecente.area_colhida > 0) {
        $('#ficha_kpi_agri_area_colhida').text(pamRecente.area_colhida.toLocaleString('pt-BR'));
        
        // Variação em relação ao primeiro ano da série
        if (pamDados.length > 1 && pamDados[0].area_colhida > 0) {
            const diffArea = pamRecente.area_colhida - pamDados[0].area_colhida;
            const pctVar = (diffArea / pamDados[0].area_colhida) * 100;
            const sinal = pctVar >= 0 ? '+' : '';
            const corClass = pctVar >= 0 ? 'text-emerald-600' : 'text-rose-600';
            $('#ficha_kpi_agri_area_var').html(`Var. 5 anos: <strong class="${corClass}">${sinal}${pctVar.toFixed(1)}%</strong>`);
        } else {
            $('#ficha_kpi_agri_area_var').text('Série Histórica (PAM)');
        }
    } else {
        $('#ficha_kpi_agri_area_colhida').text('0');
        $('#ficha_kpi_agri_area_var').text('Sem lavouras registradas');
    }

    // KPI 3: Monitor de Estiagem / Quebra de Safra (LSPA)
    const lspaTotal = (lspaArr || []).filter(l => l.produto === 'Total' && l.area_plantada !== null && l.area_plantada !== undefined && l.area_plantada !== '');
    if (lspaTotal.length) {
        const lspaUltimo = lspaTotal[lspaTotal.length - 1];
        const taxaPerda = parseFloat(lspaUltimo.taxa_perda_pct) || 0;
        const areaPerdida = parseFloat(lspaUltimo.area_perdida_ha) || 0;
        const mesAnoStr = lspaUltimo.mes_ano || 'Recente';

        $('#ficha_kpi_agri_mes_lspa').text(mesAnoStr);
        $('#ficha_kpi_agri_taxa_perda').text(`${taxaPerda.toFixed(1)}%`);
        $('#ficha_kpi_agri_area_perdida_pe').html(`Perda em PE: <strong>${Math.round(areaPerdida).toLocaleString('pt-BR')} ha</strong>`);

        const $statusEstiagem = $('#ficha_kpi_agri_status_estiagem');
        if (taxaPerda > 30) {
            $statusEstiagem.text('Estiagem Severa').removeClass('bg-emerald-50 text-emerald-700 bg-amber-50 text-amber-700').addClass('bg-rose-50 text-rose-700 border-rose-200');
        } else if (taxaPerda > 15) {
            $statusEstiagem.text('Quebra Moderada').removeClass('bg-emerald-50 text-emerald-700 bg-rose-50 text-rose-700').addClass('bg-amber-50 text-amber-700 border-amber-200');
        } else {
            $statusEstiagem.text('Safra Normal').removeClass('bg-rose-50 text-rose-700 bg-amber-50 text-amber-700').addClass('bg-emerald-50 text-emerald-700 border-emerald-200');
        }
    } else {
        $('#ficha_kpi_agri_taxa_perda').text('-');
        $('#ficha_kpi_agri_area_perdida_pe').text('Sem registros recentes');
    }

    // 2. RENDERIZAÇÃO DOS GRÁFICOS
    renderizarGraficoLspaMensal(lspaArr);
    renderizarGraficoPamHistorico(pamDados);
}

function renderizarGraficoLspaMensal(lspaArr) {
    const dom = document.getElementById('ficha_chart_agri_lspa_mensal');
    if (!dom || typeof echarts === 'undefined') return;

    if (chartAgriLspaMensal) {
        chartAgriLspaMensal.dispose();
    }
    chartAgriLspaMensal = echarts.init(dom);

    const prodAlvo = modoGraficoLspaAtivo === 'cereais' ? '1 Cereais, leguminosas e oleaginosas' : 'Total';
    const dadosProd = (lspaArr || [])
        .filter(l => l.produto === prodAlvo && l.area_plantada !== null && l.area_plantada !== undefined && l.area_plantada !== '')
        .sort((a, b) => String(a.cod_periodo).localeCompare(String(b.cod_periodo)));

    if (!dadosProd.length) {
        chartAgriLspaMensal.setOption({
            title: { text: 'Sem dados do LSPA disponíveis para o período', left: 'center', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } }
        });
        return;
    }

    const meses = dadosProd.map(d => {
        const p = String(d.cod_periodo);
        if (p.length === 6) {
            return `${p.substring(4, 6)}/${p.substring(0, 4)}`;
        }
        return d.mes_ano || p;
    });

    const areaColhida = dadosProd.map(d => parseFloat(d.area_colhida) || 0);
    const areaPerdida = dadosProd.map(d => parseFloat(d.area_perdida_ha) || 0);
    const taxaPerda = dadosProd.map(d => parseFloat(d.taxa_perda_pct) || 0);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
            formatter: (params) => {
                const idx = params[0].dataIndex;
                const d = dadosProd[idx];
                return `
                    <div class="font-bold text-xs mb-1">${d.mes_ano || meses[idx]} (${prodAlvo})</div>
                    <div class="text-xs text-emerald-600">Área Colhida: <strong>${Math.round(areaColhida[idx]).toLocaleString('pt-BR')} ha</strong></div>
                    <div class="text-xs text-rose-500">Área Perdida: <strong>${Math.round(areaPerdida[idx]).toLocaleString('pt-BR')} ha</strong></div>
                    <div class="text-xs text-slate-700">Área Plantada: <strong>${Math.round(parseFloat(d.area_plantada)||0).toLocaleString('pt-BR')} ha</strong></div>
                    <div class="text-xs font-bold text-amber-600 mt-1">Taxa de Quebra: ${taxaPerda[idx].toFixed(1)}%</div>
                `;
            }
        },
        legend: {
            data: ['Área Colhida (ha)', 'Área Perdida / Estiagem (ha)', 'Taxa de Quebra (%)'],
            top: 5,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 45,
            left: '3%',
            right: '4%',
            bottom: 60,
            containLabel: true
        },
        dataZoom: [
            { type: 'inside', start: Math.max(0, 100 - (18 / meses.length) * 100), end: 100 },
            { type: 'slider', bottom: 10, height: 20, handleSize: '75%' }
        ],
        xAxis: {
            type: 'category',
            data: meses,
            axisLabel: { fontSize: 10, rotate: 30, color: '#64748b' }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Hectares (ha)',
                nameTextStyle: { fontSize: 10, color: '#64748b' },
                splitLine: { lineStyle: { stroke: '#f1f5f9' } },
                axisLabel: {
                    fontSize: 10,
                    formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v
                }
            },
            {
                type: 'value',
                name: 'Quebra (%)',
                nameTextStyle: { fontSize: 10, color: '#ea580c' },
                min: 0,
                max: 100,
                splitLine: { show: false },
                axisLabel: { fontSize: 10, formatter: '{value}%', color: '#ea580c' }
            }
        ],
        series: [
            {
                name: 'Área Colhida (ha)',
                type: 'bar',
                stack: 'area',
                itemStyle: { color: '#10b981' },
                data: areaColhida
            },
            {
                name: 'Área Perdida / Estiagem (ha)',
                type: 'bar',
                stack: 'area',
                itemStyle: { color: '#f87171' },
                data: areaPerdida
            },
            {
                name: 'Taxa de Quebra (%)',
                type: 'line',
                yAxisIndex: 1,
                itemStyle: { color: '#ea580c' },
                lineStyle: { width: 3 },
                symbol: 'circle',
                symbolSize: 6,
                data: taxaPerda
            }
        ]
    };

    chartAgriLspaMensal.setOption(option);
}

function renderizarGraficoPamHistorico(pamDados) {
    const dom = document.getElementById('ficha_chart_agri_pam_historico');
    if (!dom || typeof echarts === 'undefined') return;

    if (chartAgriPamHistorico) {
        chartAgriPamHistorico.dispose();
    }
    chartAgriPamHistorico = echarts.init(dom);

    if (!pamDados || !pamDados.length) {
        chartAgriPamHistorico.setOption({
            title: { text: 'Sem histórico do PAM para este município', left: 'center', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } }
        });
        return;
    }

    const anos = pamDados.map(p => String(p.ano));
    const valoresProdMil = pamDados.map(p => (p.valor_producao || 0));
    const areasColhidas = pamDados.map(p => (p.area_colhida || 0));

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params) => {
                const idx = params[0].dataIndex;
                const vMil = valoresProdMil[idx];
                const a = areasColhidas[idx];
                const vReais = vMil * 1000;
                let vStr = `R$ ${vReais.toLocaleString('pt-BR')}`;
                if (vReais >= 1e6) vStr = `R$ ${(vReais/1e6).toFixed(2)} Mi`;
                return `
                    <div class="font-bold text-xs mb-1">Ano: ${anos[idx]}</div>
                    <div class="text-xs text-emerald-600">Valor da Produção: <strong>${vStr}</strong></div>
                    <div class="text-xs text-blue-600">Área Colhida: <strong>${a.toLocaleString('pt-BR')} ha</strong></div>
                `;
            }
        },
        legend: {
            data: ['Valor da Produção (R$ mil)', 'Área Colhida (ha)'],
            top: 0,
            textStyle: { fontSize: 10, fontWeight: 'bold' }
        },
        grid: {
            top: 35,
            left: '3%',
            right: '4%',
            bottom: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: anos,
            axisLabel: { fontSize: 11, fontWeight: 'bold' }
        },
        yAxis: [
            {
                type: 'value',
                name: 'R$ mil',
                splitLine: { lineStyle: { stroke: '#f1f5f9' } },
                axisLabel: {
                    fontSize: 10,
                    formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(0)}M` : v
                }
            },
            {
                type: 'value',
                name: 'ha',
                splitLine: { show: false },
                axisLabel: { fontSize: 10 }
            }
        ],
        series: [
            {
                name: 'Valor da Produção (R$ mil)',
                type: 'bar',
                itemStyle: { color: '#059669', borderRadius: [4, 4, 0, 0] },
                data: valoresProdMil
            },
            {
                name: 'Área Colhida (ha)',
                type: 'line',
                yAxisIndex: 1,
                itemStyle: { color: '#2563eb' },
                lineStyle: { width: 3 },
                symbol: 'diamond',
                symbolSize: 8,
                data: areasColhidas
            }
        ]
    };

    chartAgriPamHistorico.setOption(option);
}

/* ==========================================================================
   7. METADADOS (MODAL E TABELA)
   ========================================================================== */
window.abrirModalMetadado = function (sigla) {
    if (!sigla) return;
    const normKey = (str) => String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const siglaNorm = normKey(sigla);

    // 1. Busca direta no mapa O(1)
    let meta = (window.dadosMetadadosMapa && window.dadosMetadadosMapa[sigla]) || null;

    // 2. Busca normalizada na lista unificada
    if (!meta) {
        meta = (window.dadosMetadados || []).find(m => {
            const cd = normKey(m.cd_indicador);
            const nm = normKey(m.nm_indicador);
            const nf = normKey(m.nm_fantasia);
            return cd === siglaNorm || nm === siglaNorm || nf === siglaNorm ||
                   (cd && siglaNorm && (cd.includes(siglaNorm) || siglaNorm.includes(cd)));
        });
    }

    if (!meta) return;

    const ref = meta.referencia_analise || {};

    $('#modalMetadadoTitle').text(meta.nm_indicador || meta.nm_fantasia || sigla);
    $('#modalMetadadoBadge').text(meta.natureza || 'Indicador Municipal');

    const unidadeStr = meta.unidade || meta.natureza || '';
    const txtUnidade = unidadeStr
        ? `<div class="mt-1 text-xs text-slate-500 font-semibold"><i class="fas fa-ruler-combined text-blue-500 me-1"></i>Natureza / Unidade: ${unidadeStr}</div>`
        : '';

    const interpretacao = ref.interpretacao || meta.interpretacao || 'Sem descrição cadastrada.';
    $('#modalMetadadoDesc').html(interpretacao + txtUnidade);
    $('#modalMetadadoImpacto').text(ref.impacto_planejamento || meta.impacto_planejamento || '-');
    $('#modalMetadadoLimiar').text(ref.limiar_corte || meta.limiar_corte || '-');
    $('#modalMetadadoDirecao').text(ref.direcao_desejavel || meta.direcao_desejavel || '-');

    const formulaEl = document.getElementById('modalMetadadoFormula');
    if (formulaEl) {
        if (meta.formula_katex && typeof katex !== 'undefined') {
            try {
                katex.render(meta.formula_katex, formulaEl, { displayMode: true, throwOnError: false });
            } catch (e) {
                formulaEl.innerText = meta.formula_katex;
            }
        } else {
            formulaEl.innerText = meta.formula_katex || 'Fórmula não disponível.';
        }
    }

    // Renderização de Fonte e Hiperlink
    const fonte = meta.fonte || 'Bases Oficiais / Órgão Setorial';
    const link  = meta.hiperlink || '';

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

    const modal = new bootstrap.Modal(document.getElementById('modalMetadado'));
    modal.show();
};


window.renderizarAbaMetadados = async function () {
    if (!window.dadosMetadados || !Array.isArray(window.dadosMetadados) || window.dadosMetadados.length === 0) {
        try {
            const resMeta = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/metadados`.replace(/\/+/g, '/'));
            if (resMeta && resMeta.ok) {
                const j = await resMeta.json();
                window.dadosMetadados = j.indicadores_dicionario || (Array.isArray(j) ? j : []);
            }
        } catch (e) {
            console.warn("Erro ao buscar metadados para a aba:", e);
        }
    }
    if (!window.dadosMetadados || !Array.isArray(window.dadosMetadados)) {
        window.dadosMetadados = [];
    }

    // Atualiza contador de indicadores no badge do topo
    if (document.getElementById('metadados_contador_badge')) {
        document.getElementById('metadados_contador_badge').innerText = `${window.dadosMetadados.length} Indicadores Cadastrados`;
    }

    if ($.fn.DataTable.isDataTable('#tabela_metadados') && dtMetadados) {
        dtMetadados.clear().rows.add(window.dadosMetadados).draw(false);
    } else {
        dtMetadados = $('#tabela_metadados').DataTable({
            data: window.dadosMetadados,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
            pageLength: 15,
            order: [[0, 'asc'], [1, 'asc']],
columns: [
                { 
                    title: "Subdimensão", 
                    data: "subdimensao", 
                    className: "align-middle", 
                    defaultContent: "-",
                    render: d => `<span class="badge rounded-pill bg-slate-100 text-slate-700 font-bold px-2.5 py-1 text-xs uppercase tracking-wide border border-slate-200">${d || '-'}</span>`
                },
                { 
                    title: "Indicador", 
                    data: "nm_indicador", 
                    className: "align-middle", 
                    defaultContent: "-", 
                    render: (d, t, r) => `
                        <div class="fw-bold cursor-pointer d-flex align-items-center gap-2 group" onclick="window.abrirModalMetadado('${r.cd_indicador}')">
                            <span class="text-slate-900 group-hover:text-[#ff5a26] transition-colors font-bold">${d || '-'}</span>
                            <i class="fas fa-arrow-up-right-from-square text-[11px] text-slate-400 group-hover:text-[#ff5a26] transition-colors"></i>
                        </div>` 
                },
                { 
                    title: "Sigla", 
                    data: "cd_indicador", 
                    className: "align-middle", 
                    defaultContent: "-", 
                    render: d => `<span class="badge rounded-md bg-orange-50 text-[#c2410c] border border-orange-200 font-mono text-xs px-2 py-0.5">${d || '-'}</span>` 
                },
                { 
                    title: "Natureza", 
                    data: "natureza", 
                    className: "align-middle", 
                    defaultContent: "-",
                    render: d => {
                        const norm = String(d || '').toLowerCase();
                        let bg = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (norm.includes('percentual') || norm.includes('taxa')) bg = 'bg-blue-50 text-blue-700 border-blue-200';
                        else if (norm.includes('moeda') || norm.includes('brl') || norm.includes('usd')) bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        else if (norm.includes('indice')) bg = 'bg-purple-50 text-purple-700 border-purple-200';
                        else if (norm.includes('absoluto')) bg = 'bg-amber-50 text-amber-700 border-amber-200';
                        return `<span class="badge rounded-pill ${bg} border px-2.5 py-1 text-xs font-semibold">${d || '-'}</span>`;
                    }
                },
                { 
                    title: "Fonte", 
                    data: "fonte", 
                    className: "align-middle text-xs", 
                    defaultContent: "-",
                    render: (d, t, r) => {
                        const txt = d || '-';
                        if (r.hiperlink) {
                            return `<a href="${r.hiperlink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold" title="Abrir fonte oficial">${txt} <i class="fas fa-external-link-alt text-[10px] ms-0.5"></i></a>`;
                        }
                        return `<span class="text-slate-600 font-medium">${txt}</span>`;
                    }
                },
                { 
                    title: "Limiar / Corte", 
                    data: "referencia_analise.limiar_corte", 
                    className: "align-middle text-sm", 
                    defaultContent: "-",
                    render: d => `<span class="text-xs text-slate-600 font-medium">${d || '<span class="text-slate-400 italic">Não especificado</span>'}</span>`
                }
            ]
            });
    }
};

/* ==========================================================================
   8. EXPORTAÇÃO E EVENTOS DE IMPRESSÃO (PDF)
   ========================================================================== */
window.baixarDadosCompletosFicha = function () {
    if (!dadosBrutosFicha || dadosBrutosFicha.length === 0) return alert("Não há dados para baixar.");
    let csvContent = "Ano,Indicador,Sigla,Valor\n";
    dadosBrutosFicha.forEach(row => {
        csvContent += `${row.ano},"${row.nm_indicador}","${row.sigla_indicador}","${String(row.indicador).replace('.', ',')}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Dados_Completos_${$('#ficha_f_municipio').val()}.csv`;
    link.click();
};

window.imprimirResumoExecutivo = function () {
    $('body').addClass('print-resumo-executivo');
    $('#capa_tipo_relatorio').text('RESUMO EXECUTIVO INTEGRADO & DIAGNÓSTICO REGIONAL');
    setTimeout(() => {
        window.print();
    }, 150);
};

window.imprimirRelatorioCompleto = function () {
    $('body').removeClass('print-resumo-executivo');
    $('#capa_tipo_relatorio').text('RELATÓRIO EXECUTIVO COMPLETO');
    setTimeout(() => {
        window.print();
    }, 150);
};

window.addEventListener('beforeprint', function () {
    ['ficha_chart_iniciativas_sec', 'ficha_chart_valor_sec', 'ficha_chart_eme_parlamentares', 'ficha_chart_eme_partidos', 'ficha_chart_eme_temas'].forEach(id => {
        const dom = document.getElementById(id);
        if (dom) { const chart = echarts.getInstanceByDom(dom); if (chart) chart.resize(); }
    });

    if (dtFichaIniciativas) dtFichaIniciativas.page.len(-1).draw(false);
    if (dtFichaConvenios) dtFichaConvenios.page.len(-1).draw(false);
    if (dtFichaEmendas) dtFichaEmendas.page.len(-1).draw(false);
});

window.addEventListener('afterprint', function () {
    $('body').removeClass('print-resumo-executivo');
    $('#capa_tipo_relatorio').text('RELATÓRIO EXECUTIVO');

    ['ficha_chart_iniciativas_sec', 'ficha_chart_valor_sec', 'ficha_chart_eme_parlamentares', 'ficha_chart_eme_partidos', 'ficha_chart_eme_temas'].forEach(id => {
        const dom = document.getElementById(id);
        if (dom) { const chart = echarts.getInstanceByDom(dom); if (chart) chart.resize(); }
    });

    if (dtFichaIniciativas) dtFichaIniciativas.page.len(5).draw(false);
    if (dtFichaConvenios) dtFichaConvenios.page.len(5).draw(false);
    if (dtFichaEmendas) dtFichaEmendas.page.len(5).draw(false);
});

window.redimensionarMapasFicha = function () {
    const mapas = [
        mapaMultiInstance,
        mapFicha, mapDemografiaFicha, mapSociaisFicha, mapEducacaoFicha,
        mapSaudeFicha, mapCadUnicoFicha, mapSaneamentoFicha, mapInovacaoFicha,
        mapComercioFicha, mapConectividadeFicha, mapTrabalhoFicha
    ];
    mapas.forEach(m => {
        if (m && typeof m.resize === 'function') {
            try { m.resize(); } catch (e) {}
        }
    });

    if (typeof echarts === 'object' && echarts.getInstanceByDom) {
        document.querySelectorAll('#aba_ficha [id^="ficha_chart_"], #aba_ficha .echarts-container').forEach(el => {
            const inst = echarts.getInstanceByDom(el);
            if (inst && typeof inst.resize === 'function') {
                try { inst.resize(); } catch (e) {}
            }
        });
    }
};

/* ==========================================================================
   SUBABAS DO MÓDULO MUNICÍPIOS: FICHA MUNICIPAL & RESUMOS MUNICIPAIS
   ========================================================================== */

window.alternarSubabaMunicipios = function (subaba, elemento) {
    const btnFicha = document.getElementById('subtab_btn_ficha');
    const btnResumos = document.getElementById('subtab_btn_resumos');
    const subFicha = document.getElementById('subaba_ficha_municipal');
    const subResumos = document.getElementById('subaba_resumos_municipais');
    const legenda = document.getElementById('subaba_municipios_legenda');
    const controlesFicha = document.getElementById('controles_ficha_municipal');

    if (subaba === 'ficha') {
        if (btnFicha) {
            btnFicha.classList.add('active', 'btn-primary', 'shadow-sm');
            btnFicha.classList.remove('text-slate-600');
        }
        if (btnResumos) {
            btnResumos.classList.remove('active', 'btn-primary', 'shadow-sm');
            btnResumos.classList.add('text-slate-600');
        }
        if (subFicha) subFicha.classList.remove('d-none');
        if (subResumos) subResumos.classList.add('d-none');
        if (legenda) legenda.innerText = "Visão detalhada e indicadores por município";

        if (controlesFicha) {
            const selectContainer = controlesFicha.querySelector('.form-select-municipio')?.closest('.d-flex');
            const navContainer = document.getElementById('ficha_navbar_nav');
            if (selectContainer) selectContainer.classList.remove('d-none');
            if (navContainer) navContainer.classList.remove('d-none');
        }

        setTimeout(() => {
            if (typeof window.redimensionarMapasFicha === 'function') {
                window.redimensionarMapasFicha();
            }
        }, 60);
    } else if (subaba === 'resumos') {
        if (btnResumos) {
            btnResumos.classList.add('active', 'btn-primary', 'shadow-sm');
            btnResumos.classList.remove('text-slate-600');
        }
        if (btnFicha) {
            btnFicha.classList.remove('active', 'btn-primary', 'shadow-sm');
            btnFicha.classList.add('text-slate-600');
        }
        if (subFicha) subFicha.classList.add('d-none');
        if (subResumos) subResumos.classList.remove('d-none');
        if (legenda) legenda.innerText = "Visão consolidada estadual e diagnósticos temáticos";

        if (controlesFicha) {
            const selectContainer = controlesFicha.querySelector('.form-select-municipio')?.closest('.d-flex');
            const navContainer = document.getElementById('ficha_navbar_nav');
            if (selectContainer) selectContainer.classList.add('d-none');
            if (navContainer) navContainer.classList.add('d-none');
        }

        if (typeof window.alternarPautaResumos === 'function') {
            window.alternarPautaResumos(window.pautaResumoAtiva || 'capag');
        } else if (typeof window.renderizarResumoCapag === 'function') {
            window.renderizarResumoCapag();
        }
    }
};

let mapResumoCapag = null;
window.cacheResumoCapag = null;
let cacheResumoCapag = null;

window.renderizarResumoCapag = function () {
    const container = document.getElementById('resumo_capag_map');
    if (!container) return;

    if (mapResumoCapag) {
        setTimeout(() => {
            if (mapResumoCapag && typeof mapResumoCapag.resize === 'function') {
                mapResumoCapag.resize();
            }
        }, 100);
        return;
    }

    $('#resumo_capag_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/capag`.replace(/\/+/g, '/');
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error("Erro na requisição CAPAG");
            return res.json();
        })
        .then(data => {
            cacheResumoCapag = data;
            window.cacheResumoCapag = data;
            $('#resumo_capag_spinner').addClass('d-none');

            // 1. Atualizar Tabela 8 com contagens reais
            const c = data.contagens || {};
            $('#capag_count_A').text(c['A'] ?? 0);
            $('#capag_count_Aplus').text(c['A+'] ?? 0);
            $('#capag_count_B').text(c['B'] ?? 0);
            $('#capag_count_Bplus').text(c['B+'] ?? 0);
            $('#capag_count_C').text(c['C'] ?? 0);
            $('#capag_count_D').text(c['D'] ?? 0);
            $('#capag_count_nd').text(c['n.d.'] ?? 0);
            $('#capag_count_ne').text(c['n.e.'] ?? 0);

            // 2. Montar GeoJSON
            const geoData = obterGeoJSONSeguro(data.geojson);
            if (!geoData || !geoData.features) {
                console.warn("[Resumo CAPAG] GeoJSON não disponível.");
                return;
            }

            const capagMap = data.capag_map || {};
            geoData.features.forEach(feat => {
                const props = feat.properties || {};
                const ibge6 = String(props.ibge6 || props.cod_ibge || '').substring(0, 6);
                feat.properties.capag = capagMap[ibge6] || 'n.d.';
            });

            // 3. Inicializar MapLibre GL
            mapResumoCapag = new maplibregl.Map({
                container: 'resumo_capag_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapResumoCapag.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapResumoCapag.on('load', () => {
                mapResumoCapag.resize();

                // Enquadrar limites de Pernambuco
                try {
                    const bounds = new maplibregl.LngLatBounds();
                    geoData.features.forEach(feature => {
                        const geom = feature.geometry;
                        if (!geom) return;
                        const coords = geom.coordinates;
                        const expand = (c) => {
                            if (typeof c[0] === 'number') bounds.extend(c);
                            else c.forEach(expand);
                        };
                        expand(coords);
                    });
                    if (!bounds.isEmpty()) {
                        mapResumoCapag.fitBounds(bounds, { padding: 30, animate: false });
                    }
                } catch (e) {
                    console.warn("[Resumo CAPAG] Erro ao ajustar limites:", e);
                }

                mapResumoCapag.addSource('resumo_capag_source', {
                    type: 'geojson',
                    data: geoData
                });

                // Layer de preenchimento com cores fiéis ao Objeto 1
                mapResumoCapag.addLayer({
                    id: 'resumo_capag_fill',
                    type: 'fill',
                    source: 'resumo_capag_source',
                    paint: {
                        'fill-color': [
                            'match',
                            ['get', 'capag'],
                            'A', '#92D050',
                            'A+', '#70AD47',
                            'B', '#00A8A8',
                            'B+', '#00B0B9',
                            'C', '#C55A11',
                            'D', '#843C0C',
                            'n.d.', '#595959',
                            'n.e.', '#404040',
                            '#64748B' // fallback
                        ],
                        'fill-opacity': 0.92
                    }
                });

                // Layer de contorno branco sutil
                mapResumoCapag.addLayer({
                    id: 'resumo_capag_line',
                    type: 'line',
                    source: 'resumo_capag_source',
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': 0.8
                    }
                });

                // Layer de destaque no hover
                mapResumoCapag.addLayer({
                    id: 'resumo_capag_hover',
                    type: 'line',
                    source: 'resumo_capag_source',
                    paint: {
                        'line-color': '#0F172A',
                        'line-width': 2.5
                    },
                    filter: ['==', 'ibge6', '']
                });

                // Tooltip / Popup customizado
                const popup = new maplibregl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: 12
                });

                mapResumoCapag.on('mousemove', 'resumo_capag_fill', (e) => {
                    mapResumoCapag.getCanvas().style.cursor = 'pointer';
                    if (!e.features.length) return;
                    const f = e.features[0];
                    const props = f.properties || {};
                    const munNome = props.municipio || props.NM_MUN || 'Município';
                    const rdNome = props.regiao_de_desenvolvimento || '-';
                    const capagVal = props.capag || 'n.d.';
                    const badgeCor = obterCorCapag(capagVal);

                    const ibge6 = String(props.ibge6 || props.cod_ibge || '').substring(0, 6);
                    mapResumoCapag.setFilter('resumo_capag_hover', ['==', 'ibge6', ibge6]);

                    popup.setLngLat(e.lngLat)
                        .setHTML(`
                            <div style="font-family: inherit; font-size: 12px; padding: 4px;">
                                <div style="font-weight: 800; color: #0F172A; text-transform: uppercase; margin-bottom: 2px;">${munNome}</div>
                                <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">RD ${rdNome}</div>
                                <div style="display: inline-block; padding: 3px 10px; border-radius: 9999px; background: ${badgeCor}; color: #ffffff; font-weight: 800; font-size: 11px; letter-spacing: 0.03em;">
                                    CAPAG: ${capagVal}
                                </div>
                                <div style="margin-top: 5px; font-size: 10px; color: #94A3B8; font-style: italic;">
                                    Clique para abrir a Ficha Municipal
                                </div>
                            </div>
                        `)
                        .addTo(mapResumoCapag);
                });

                mapResumoCapag.on('mouseleave', 'resumo_capag_fill', () => {
                    mapResumoCapag.getCanvas().style.cursor = '';
                    mapResumoCapag.setFilter('resumo_capag_hover', ['==', 'ibge6', '']);
                    popup.remove();
                });

                // Clique no município leva diretamente para a Ficha Municipal daquele município
                mapResumoCapag.on('click', 'resumo_capag_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties || {};
                    const munNome = props.municipio || props.NM_MUN;
                    if (munNome) {
                        popup.remove();
                        const $select = $('#ficha_f_municipio');
                        if ($select.length) {
                            $select.val(munNome);
                            if ($select.data('selectpicker')) {
                                $select.selectpicker('refresh');
                            }
                            $select.trigger('change');
                        }
                        window.alternarSubabaMunicipios('ficha');
                    }
                });
            });
        })
        .catch(err => {
            console.error('[Resumo CAPAG] Erro ao carregar dados:', err);
            $('#resumo_capag_spinner').addClass('d-none');
        });
};

/* ==========================================================================
   RESUMOS MUNICIPAIS - PAUTA 2: ÁGUAS DE PERNAMBUCO (COMPESA / SRHS)
   ========================================================================== */
window.pautaResumoAtiva = 'capag';

window.alternarPautaResumos = function (pauta, btn) {
    window.pautaResumoAtiva = pauta || 'cozinhas';
    const p = window.pautaResumoAtiva;

    // 1. Sincroniza botões no Topbar
    const topCapag = document.getElementById('topbar_btn_pauta_capag');
    const topAguas = document.getElementById('topbar_btn_pauta_aguas');
    const topCozinhas = document.getElementById('topbar_btn_pauta_cozinhas');
    const topEstradas = document.getElementById('topbar_btn_pauta_estradas');
    const topHabitacao = document.getElementById('topbar_btn_pauta_habitacao');
    const topObras = document.getElementById('topbar_btn_pauta_obras');
    const topCreches = document.getElementById('topbar_btn_pauta_creches');
    const topEducacao = document.getElementById('topbar_btn_pauta_educacao');
    const topIlumina = document.getElementById('topbar_btn_pauta_iluminacao');
    
// No loop de desativação:
[topCapag, topAguas, topCozinhas, topEstradas, topHabitacao, topObras, topCreches, topEducacao, topIlumina].forEach(b => {
    if (b) { b.classList.remove('btn-primary', 'text-white', 'shadow-xs'); b.classList.add('text-slate-600', 'bg-transparent', 'border-0'); }
});

if (p === 'capag' && topCapag) {
        topCapag.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        topCapag.classList.add('btn-primary', 'text-white', 'shadow-xs');
    } else if (p === 'aguas' && topAguas) {
        topAguas.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        topAguas.classList.add('btn-primary', 'text-white', 'shadow-xs');
    } else if (p === 'cozinhas' && topCozinhas) {
        topCozinhas.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        topCozinhas.classList.add('btn-primary', 'text-white', 'shadow-xs');
    } else if (p === 'estradas' && topEstradas) {
        topEstradas.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        topEstradas.classList.add('btn-primary', 'text-white', 'shadow-xs');
    } else if (p === 'habitacao' && topHabitacao) {
        topHabitacao.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        topHabitacao.classList.add('btn-primary', 'text-white', 'shadow-xs');
    } else if (p === 'educacao') {
        if (topEducacao) { topEducacao.classList.remove('text-slate-600', 'bg-transparent', 'border-0'); topEducacao.classList.add('btn-primary', 'text-white', 'shadow-xs'); }
    } else if (p === 'iluminacao') {
        if (topIlumina) { topIlumina.classList.remove('text-slate-600', 'bg-transparent', 'border-0'); topIlumina.classList.add('btn-primary', 'text-white', 'shadow-xs'); }
    }

    // 2. Sincroniza botões e blocos na página interna
    const btnCapag = document.getElementById('btn_pauta_resumo_capag');
    const btnAguas = document.getElementById('btn_pauta_resumo_aguas');
    const btnCozinhas = document.getElementById('btn_pauta_resumo_cozinhas');
    const btnEstradas = document.getElementById('btn_pauta_resumo_estradas');
    const btnHabitacao = document.getElementById('btn_pauta_resumo_habitacao');
    const btnObras = document.getElementById('btn_pauta_resumo_obras');
    const btnCreches = document.getElementById('btn_pauta_resumo_creches');
    const btnEducacao = document.getElementById('btn_pauta_resumo_educacao');
    const btnIlumina = document.getElementById('btn_pauta_resumo_iluminacao');

    const blocoCapag = document.getElementById('resumo_pauta_capag');
    const blocoAguas = document.getElementById('resumo_pauta_aguas');
    const blocoCozinhas = document.getElementById('resumo_pauta_cozinhas');
    const blocoEstradas = document.getElementById('resumo_pauta_estradas');
    const blocoHabitacao = document.getElementById('resumo_pauta_habitacao');
    const blocoObras = document.getElementById('resumo_pauta_obras');
    const blocoCreches = document.getElementById('resumo_pauta_creches');
    const blocoEducacao = document.getElementById('resumo_pauta_educacao');
    const blocoIlumina = document.getElementById('resumo_pauta_iluminacao');
    
    [btnCapag, btnAguas, btnCozinhas, btnEstradas, btnHabitacao, btnObras, btnCreches, btnEducacao, btnIlumina].forEach(b => {
        if (b) {
            b.classList.remove('btn-primary', 'text-white', 'shadow-sm');
            b.classList.add('btn-light', 'text-slate-600');
        }
    });
    
    [blocoCapag, blocoAguas, blocoCozinhas, blocoEstradas, blocoHabitacao, blocoObras, blocoCreches, blocoEducacao, blocoIlumina].forEach(bl => {
        if (bl) bl.classList.add('d-none');
    });

    if (p === 'capag') {
        if (btnCapag) {
            btnCapag.classList.remove('btn-light', 'text-slate-600');
            btnCapag.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (blocoCapag) blocoCapag.classList.remove('d-none');
        if (typeof window.renderizarResumoCapag === 'function') window.renderizarResumoCapag();
    } else if (p === 'aguas') {
        if (btnAguas) {
            btnAguas.classList.remove('btn-light', 'text-slate-600');
            btnAguas.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (blocoAguas) blocoAguas.classList.remove('d-none');
        if (typeof window.renderizarResumoAguas === 'function') window.renderizarResumoAguas();
    } else if (p === 'cozinhas') {
        if (btnCozinhas) {
            btnCozinhas.classList.remove('btn-light', 'text-slate-600');
            btnCozinhas.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (blocoCozinhas) blocoCozinhas.classList.remove('d-none');
        if (typeof window.renderizarResumoCozinhas === 'function') window.renderizarResumoCozinhas();
    } else if (p === 'estradas') {
        if (btnEstradas) {
            btnEstradas.classList.remove('btn-light', 'text-slate-600');
            btnEstradas.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (blocoEstradas) blocoEstradas.classList.remove('d-none');
        if (typeof window.renderizarResumoEstradas === 'function') window.renderizarResumoEstradas();
    } else if (p === 'habitacao') {
        if (btnHabitacao) {
            btnHabitacao.classList.remove('btn-light', 'text-slate-600');
            btnHabitacao.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (blocoHabitacao) blocoHabitacao.classList.remove('d-none');
        if (typeof window.renderizarResumoHabitacao === 'function') window.renderizarResumoHabitacao();
    } else if (p === 'obras') {
      if (topObras) { topObras.classList.remove('text-slate-600', 'bg-transparent', 'border-0'); topObras.classList.add('btn-primary', 'text-white', 'shadow-xs'); }
    if (btnObras) { btnObras.classList.remove('btn-light', 'text-slate-600'); btnObras.classList.add('btn-primary', 'text-white', 'shadow-sm'); }
    if (blocoObras) blocoObras.classList.remove('d-none');
    if (typeof window.renderizarResumoObras === 'function') window.renderizarResumoObras();
} else if (p === 'creches') {
        if (topCreches) { topCreches.classList.remove('text-slate-600', 'bg-transparent', 'border-0'); topCreches.classList.add('btn-primary', 'text-white', 'shadow-xs'); }
        if (btnCreches) { btnCreches.classList.remove('btn-light', 'text-slate-600'); btnCreches.classList.add('btn-primary', 'text-white', 'shadow-sm'); }
        if (blocoCreches) blocoCreches.classList.remove('d-none');
        if (typeof window.renderizarResumoCreches === 'function') window.renderizarResumoCreches();
    } else if (p === 'educacao') {
        if (btnEducacao) { btnEducacao.classList.remove('btn-light', 'text-slate-600'); btnEducacao.classList.add('btn-primary', 'text-white', 'shadow-sm'); }
        if (blocoEducacao) blocoEducacao.classList.remove('d-none');
        if (typeof window.renderizarResumoEducacao === 'function') window.renderizarResumoEducacao();
    } else if (p === 'iluminacao') {
        if (btnIlumina) { btnIlumina.classList.remove('btn-light', 'text-slate-600'); btnIlumina.classList.add('btn-primary', 'text-white', 'shadow-sm'); }
        if (blocoIlumina) blocoIlumina.classList.remove('d-none');
        if (typeof window.renderizarResumoIluminacao === 'function') window.renderizarResumoIluminacao();
    }
    
};

let mapResumoAguas = null;
window.cacheResumoAguas = null;
let cacheResumoAguas = null;
let dtResumoAguas = null;
let dtApacMananciais = null;
let camadaAtivaAguas = 'Rodízio atual';
let compesaGeoData = null;
let compesaPlanoData = null;
let apacResGeo = null;
let apacBaciasGeo = null;
let apacResumo = null;
window.cacheApacReservatorios = null;
window.cacheApacData = null;

let chartAguasDesembolso = null;
let chartAguasStatus = null;
let chartAguasTopMuns = null;
let chartAguasRodizioComp = null;
let chartAguasSituacaoC2 = null;
let chartAguasRecursosFonte = null;
let chartAguasRecursosStatus = null;
let chartAguasDeficitBndes = null;
let chartAguasIniciativasSrhs = null;
let chartApacBaciasVolume = null;
let chartApacFaixasCapacidade = null;
let filtroMunAguasAtivo = null;

function resizeGraficosAguas() {
    if (chartAguasDesembolso) chartAguasDesembolso.resize();
    if (chartAguasStatus) chartAguasStatus.resize();
    if (chartAguasTopMuns) chartAguasTopMuns.resize();
    if (chartAguasRodizioComp) chartAguasRodizioComp.resize();
    if (chartAguasSituacaoC2) chartAguasSituacaoC2.resize();
    if (chartAguasRecursosFonte) chartAguasRecursosFonte.resize();
    if (chartAguasRecursosStatus) chartAguasRecursosStatus.resize();
    if (chartAguasDeficitBndes) chartAguasDeficitBndes.resize();
    if (chartAguasIniciativasSrhs) chartAguasIniciativasSrhs.resize();
    if (chartApacBaciasVolume) chartApacBaciasVolume.resize();
    if (chartApacFaixasCapacidade) chartApacFaixasCapacidade.resize();
}

window.renderizarResumoAguas = function () {
    const container = document.getElementById('resumo_aguas_map');
    if (!container) return;

    if (cacheResumoAguas) {
        setTimeout(() => {
            if (mapResumoAguas && typeof mapResumoAguas.resize === 'function') {
                mapResumoAguas.resize();
            }
            resizeGraficosAguas();
        }, 100);
        return;
    }

    $('#resumo_aguas_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/aguas`.replace(/\/+/g, '/');
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error("Erro na requisição Águas de Pernambuco");
            return res.json();
        })
        .then(async data => {
            // Fallback resiliente caso plano ou geojson não venham na resposta direta
            if (!data.plano) {
                try {
                    const rPlano = await fetch(`${window.basePath || ''}/data/compesa_plano_investimentos.json`.replace(/\/+/g, '/'));
                    if (rPlano.ok) data.plano = await rPlano.json();
                } catch (e) {}
            }
            if (!data.geojson) {
                try {
                    const rGeo = await fetch(`${window.basePath || ''}/data/mapa_compesa_todas_camadas.geojson`.replace(/\/+/g, '/'));
                    if (rGeo.ok) data.geojson = await rGeo.json();
                } catch (e) {}
            }

            // APAC Data (Reservatórios e Bacias)
            apacResGeo = data.apac_reservatorios;
            apacBaciasGeo = data.apac_bacias;
            apacResumo = data.apac_resumo;

            if (!apacResGeo || !apacResGeo.features) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/apac_reservatorios.geojson`.replace(/\/+/g, '/'));
                    if (r.ok) apacResGeo = await r.json();
                } catch (e) {}
            }
            if (!apacBaciasGeo || !apacBaciasGeo.features) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/apac_bacias_hidrograficas.geojson`.replace(/\/+/g, '/'));
                    if (r.ok) apacBaciasGeo = await r.json();
                } catch (e) {}
            }
            if (!apacResumo || !apacResumo.total_reservatorios) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/apac_resumo_estadual.json`.replace(/\/+/g, '/'));
                    if (r.ok) apacResumo = await r.json();
                } catch (e) {}
            }

            if (!window.cacheApacReservatorios) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/apac_reservatorios.json`.replace(/\/+/g, '/'));
                    if (r.ok) window.cacheApacReservatorios = await r.json();
                } catch (e) {}
            }
            window.cacheApacData = { reservatorios: window.cacheApacReservatorios, bacias: apacBaciasGeo, resumo: apacResumo };

            cacheResumoAguas = data;
            window.cacheResumoAguas = data;
            compesaPlanoData = data.plano;
            $('#resumo_aguas_spinner').addClass('d-none');

            const projetos = data.projetos || (data.plano && data.plano.portfolio_projetos) || [];
            const desembolso = data.desembolso || [];
            const municipios = data.municipios || [];

            // 1. MACRO KPIS EXECUTIVOS
            let totInvestimento = 0;
            let totPopulacao = 0;
            const munsSet = new Set();

            projetos.forEach(p => {
                totInvestimento += Number(p.valor_total_m || p['Valor LOA (R$ M)']) || 0;
                totPopulacao += Number(p.populacao_beneficiada || p['População Beneficiada']) || 0;
                const mNome = p.municipio || p['Municípios Atendidos'];
                if (mNome && mNome !== '-') {
                    munsSet.add(mNome.trim().toLowerCase());
                }
            });

            municipios.forEach(m => {
                if (m.municipio) munsSet.add(m.municipio.trim().toLowerCase());
            });

            let totDesembolso = 0;
            desembolso.forEach(d => {
                totDesembolso += Number(d.valor_desembolso_m) || 0;
            });
            if (totDesembolso === 0 && data.plano && data.plano.necessidade_recursos) {
                data.plano.necessidade_recursos.filter(r => !r.is_total_agrupado).forEach(r => {
                    totDesembolso += Number(r['Total Geral (R$)']) || 0;
                });
            }

            const elKpiInv = document.getElementById('aguas_kpi_investimento');
            if (elKpiInv) {
                const bi = totInvestimento > 1000 ? totInvestimento / 1000 : (totInvestimento > 0 ? totInvestimento : 14.83);
                elKpiInv.innerText = `R$ ${bi.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
            }

            const elKpiProj = document.getElementById('aguas_kpi_projetos');
            if (elKpiProj) {
                elKpiProj.innerText = `${projetos.length || 560} Projetos`;
            }

            const elKpiPop = document.getElementById('aguas_kpi_populacao');
            if (elKpiPop) {
                elKpiPop.innerText = "9,5 Mi hab.";
            }

            const elKpiMuns = document.getElementById('aguas_kpi_municipios');
            if (elKpiMuns) {
                elKpiMuns.innerText = "185 Municípios";
            }

            const elKpiDesemb = document.getElementById('aguas_kpi_desembolso');
            if (elKpiDesemb) {
                const biDesemb = totDesembolso > 1e8 ? totDesembolso / 1e9 : (totDesembolso / 1000 || 12.53);
                elKpiDesemb.innerText = `R$ ${biDesemb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
            }

            // 2. INICIALIZAR MAPLIBRE GL COM TODAS AS CAMADAS COMPESA E APAC
            const geoData = obterGeoJSONSeguro(data.geojson);
            compesaGeoData = geoData;

            if (geoData && geoData.features) {
                mapResumoAguas = new maplibregl.Map({
                    container: 'resumo_aguas_map',
                    style: window.obterEstiloBaseMapa(),
                    center: [-37.8, -8.3],
                    zoom: 7,
                    preserveDrawingBuffer: true
                });

                mapResumoAguas.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

                mapResumoAguas.on('load', () => {
                    mapResumoAguas.resize();

                    try {
                        const bounds = new maplibregl.LngLatBounds();
                        geoData.features.forEach(feature => {
                            if (!feature.geometry || !feature.geometry.type.includes('Polygon')) return;
                            const coords = feature.geometry.coordinates;
                            const expand = (c) => {
                                if (typeof c[0] === 'number') bounds.extend(c);
                                else c.forEach(expand);
                            };
                            expand(coords);
                        });
                        if (!bounds.isEmpty()) {
                            mapResumoAguas.fitBounds(bounds, { padding: 30, animate: false });
                        }
                    } catch (e) {
                        console.warn("[Resumo Águas] Erro ao ajustar limites:", e);
                    }

                    // Fonte unificada COMPESA
                    mapResumoAguas.addSource('resumo_aguas_source', {
                        type: 'geojson',
                        data: geoData
                    });

                    // Camada de Polígonos Municipais: Estilização por Hexadecimal da Propriedade <X> (Cor)
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_fill',
                        type: 'fill',
                        source: 'resumo_aguas_source',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'fill-color': [
                                'coalesce',
                                ['get', camadaAtivaAguas + ' (Cor)'],
                                ['get', camadaAtivaAguas],
                                '#CBD5E1'
                            ],
                            'fill-opacity': 0.88
                        }
                    });

                    // Contorno sutil branco entre municípios
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_line',
                        type: 'line',
                        source: 'resumo_aguas_source',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 0.8
                        }
                    });

                    // Linha de realce no hover do município
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_hover',
                        type: 'line',
                        source: 'resumo_aguas_source',
                        paint: {
                            'line-color': '#0f172a',
                            'line-width': 2.2
                        },
                        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'codarea', '']]
                    });

                    // -------------------------------------------------------------
                    // CAMADA APAC: BACIAS HIDROGRÁFICAS (29 UPs)
                    // -------------------------------------------------------------
                    if (apacBaciasGeo && apacBaciasGeo.features && apacBaciasGeo.features.length > 0) {
                        mapResumoAguas.addSource('apac_bacias_source', {
                            type: 'geojson',
                            data: apacBaciasGeo
                        });

                        mapResumoAguas.addLayer({
                            id: 'resumo_aguas_bacias_fill',
                            type: 'fill',
                            source: 'apac_bacias_source',
                            layout: { 'visibility': 'none' },
                            paint: {
                                'fill-color': ['get', 'cor_bacia'],
                                'fill-opacity': 0.32
                            }
                        });

                        mapResumoAguas.addLayer({
                            id: 'resumo_aguas_bacias_line',
                            type: 'line',
                            source: 'apac_bacias_source',
                            layout: { 'visibility': 'none' },
                            paint: {
                                'line-color': '#4338ca',
                                'line-width': 1.6,
                                'line-dasharray': [3, 2]
                            }
                        });
                    }

                    // Camada de Linhas Sobrepostas (Sistemas Produtores COMPESA / Adutoras)
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_linhas_layer',
                        type: 'line',
                        source: 'resumo_aguas_source',
                        filter: ['==', '$type', 'LineString'],
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round',
                            'visibility': 'visible'
                        },
                        paint: {
                            'line-color': '#0284c7',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 2.0,
                                9, 3.6,
                                12, 5.2
                            ],
                            'line-opacity': 0.88
                        }
                    });

                    // Linha transparente de hit-test para captura imediata do mouse em linhas
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_linhas_hit',
                        type: 'line',
                        source: 'resumo_aguas_source',
                        filter: ['==', '$type', 'LineString'],
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round',
                            'visibility': 'visible'
                        },
                        paint: {
                            'line-color': '#000000',
                            'line-opacity': 0.001,
                            'line-width': 16
                        }
                    });

                    // Criação e Registro do Ícone de Pino de Obra para a SRHS
                    if (!mapResumoAguas.hasImage('pin-obra-srhs')) {
                        try {
                            const cObra = document.createElement('canvas');
                            cObra.width = 36;
                            cObra.height = 46;
                            const ctxO = cObra.getContext('2d');

                            ctxO.shadowColor = 'rgba(15, 23, 42, 0.45)';
                            ctxO.shadowBlur = 4;
                            ctxO.shadowOffsetY = 2;

                            // Gota do pino
                            ctxO.beginPath();
                            ctxO.arc(18, 16, 14, Math.PI * 0.8, Math.PI * 0.2, false);
                            ctxO.lineTo(18, 43);
                            ctxO.closePath();
                            ctxO.fillStyle = '#f59e0b'; // Âmbar de Obra
                            ctxO.fill();
                            ctxO.lineWidth = 2.5;
                            ctxO.strokeStyle = '#ffffff';
                            ctxO.stroke();

                            ctxO.shadowColor = 'transparent';

                            // Círculo branco interno
                            ctxO.beginPath();
                            ctxO.arc(18, 16, 8.5, 0, Math.PI * 2);
                            ctxO.fillStyle = '#ffffff';
                            ctxO.fill();

                            // Capacete de Obra
                            ctxO.fillStyle = '#b45309';
                            ctxO.beginPath();
                            ctxO.arc(18, 15, 5, Math.PI, 0, false);
                            ctxO.fill();
                            ctxO.fillRect(12, 15, 12, 2.5);
                            ctxO.fillRect(17, 9, 2, 3);

                            const imgDataO = ctxO.getImageData(0, 0, 36, 46);
                            mapResumoAguas.addImage('pin-obra-srhs', imgDataO);
                        } catch(errIcon) {
                            console.warn("[Águas] Erro ao registrar pin-obra-srhs:", errIcon);
                        }
                    }

                    // Camada de Pontos Sobrepostos com Pino de Obra (Iniciativas SRHS)
                    mapResumoAguas.addLayer({
                        id: 'resumo_aguas_pontos_layer',
                        type: 'symbol',
                        source: 'resumo_aguas_source',
                        filter: ['==', '$type', 'Point'],
                        layout: {
                            'visibility': 'visible',
                            'icon-image': 'pin-obra-srhs',
                            'icon-size': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 0.65,
                                9, 0.85,
                                12, 1.15
                            ],
                            'icon-allow-overlap': true,
                            'icon-anchor': 'bottom'
                        }
                    });

                    // -------------------------------------------------------------
                    // CAMADA APAC: MANANCIAIS / RESERVATÓRIOS MONITORADOS (SIRH)
                    // -------------------------------------------------------------
                    if (apacResGeo && apacResGeo.features && apacResGeo.features.length > 0) {
                        mapResumoAguas.addSource('apac_mananciais_source', {
                            type: 'geojson',
                            data: apacResGeo
                        });

                        mapResumoAguas.addLayer({
                            id: 'resumo_aguas_mananciais_layer',
                            type: 'circle',
                            source: 'apac_mananciais_source',
                            layout: { 'visibility': 'visible' },
                            paint: {
                                'circle-radius': [
                                    'interpolate', ['linear'], ['zoom'],
                                    6, [
                                        'interpolate', ['linear'], ['get', 'capacidade_m'],
                                        1, 4.0,
                                        50, 6.5,
                                        300, 9.5
                                    ],
                                    9, [
                                        'interpolate', ['linear'], ['get', 'capacidade_m'],
                                        1, 5.5,
                                        50, 9.5,
                                        300, 14.0
                                    ],
                                    12, [
                                        'interpolate', ['linear'], ['get', 'capacidade_m'],
                                        1, 7.5,
                                        50, 13.0,
                                        300, 19.0
                                    ]
                                ],
                                'circle-color': ['get', 'faixa_cor'],
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#ffffff',
                                'circle-opacity': 0.95
                            }
                        });
                    }

                    // Popups de interatividade
                    const popupLinhasPontos = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 12
                    });
                    const popupMun = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 12
                    });

                    let hoveringSobreposta = false;

                    // Hover em Mananciais APAC
                    if (mapResumoAguas.getLayer('resumo_aguas_mananciais_layer')) {
                        mapResumoAguas.on('mousemove', 'resumo_aguas_mananciais_layer', (e) => {
                            if (!e.features.length) return;
                            hoveringSobreposta = true;
                            popupMun.remove();
                            mapResumoAguas.getCanvas().style.cursor = 'pointer';
                            const props = e.features[0].properties || {};
                            const detalhe = props.detalhe_tooltip || 'Manancial Monitorado';

                            popupLinhasPontos.setLngLat(e.lngLat)
                                .setHTML(`
                                    <div style="font-family: inherit; font-size: 12px; min-width: 220px; max-width: 300px; padding: 4px;">
                                        <div style="font-size: 10px; color: #0284c7; font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">
                                            <i class="fas fa-faucet text-cyan-600"></i> Manancial Monitorado (APAC)
                                        </div>
                                        <div style="font-size: 12px; color: #0f172a; line-height: 1.4;">
                                            ${detalhe}
                                        </div>
                                    </div>
                                `)
                                .addTo(mapResumoAguas);
                        });

                        mapResumoAguas.on('mouseleave', 'resumo_aguas_mananciais_layer', () => {
                            hoveringSobreposta = false;
                            mapResumoAguas.getCanvas().style.cursor = '';
                            popupLinhasPontos.remove();
                        });
                    }

                    // Hover em Bacias Hidrográficas
                    if (mapResumoAguas.getLayer('resumo_aguas_bacias_fill')) {
                        mapResumoAguas.on('mousemove', 'resumo_aguas_bacias_fill', (e) => {
                            if (mapResumoAguas.getLayoutProperty('resumo_aguas_bacias_fill', 'visibility') === 'none') return;
                            if (hoveringSobreposta) return;
                            if (!e.features.length) return;
                            const props = e.features[0].properties || {};
                            const detalhe = props.detalhe_tooltip || 'Bacia Hidrográfica';

                            popupLinhasPontos.setLngLat(e.lngLat)
                                .setHTML(`
                                    <div style="font-family: inherit; font-size: 12px; min-width: 210px; max-width: 290px; padding: 4px;">
                                        <div style="font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">
                                            <i class="fas fa-draw-polygon"></i> Unidade de Planejamento (APAC)
                                        </div>
                                        <div style="font-size: 12px; color: #0f172a; line-height: 1.4;">
                                            ${detalhe}
                                        </div>
                                    </div>
                                `)
                                .addTo(mapResumoAguas);
                        });

                        mapResumoAguas.on('mouseleave', 'resumo_aguas_bacias_fill', () => {
                            popupLinhasPontos.remove();
                        });
                    }

                    const handleLinhasHover = (e) => {
                        if (!e.features.length) return;
                        hoveringSobreposta = true;
                        popupMun.remove();
                        mapResumoAguas.getCanvas().style.cursor = 'pointer';
                        const props = e.features[0].properties || {};
                        const origem = props.camada_origem || 'Sistemas Produtores COMPESA';
                        const detalhe = props.detalhe_tooltip || 'Infraestrutura Hídrica Linear';

                        popupLinhasPontos.setLngLat(e.lngLat)
                            .setHTML(`
                                <div style="font-family: inherit; font-size: 12px; min-width: 210px; max-width: 290px; padding: 4px;">
                                    <div style="font-size: 10px; color: #0284c7; font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">
                                        <i class="fas fa-water"></i> ${origem}
                                    </div>
                                    <div style="font-weight: 600; font-size: 12px; color: #0f172a; line-height: 1.4;">
                                        ${detalhe}
                                    </div>
                                </div>
                            `)
                            .addTo(mapResumoAguas);
                    };

                    mapResumoAguas.on('mousemove', 'resumo_aguas_linhas_hit', handleLinhasHover);
                    mapResumoAguas.on('mousemove', 'resumo_aguas_linhas_layer', handleLinhasHover);

                    const handleLinhasLeave = () => {
                        hoveringSobreposta = false;
                        mapResumoAguas.getCanvas().style.cursor = '';
                        popupLinhasPontos.remove();
                    };
                    mapResumoAguas.on('mouseleave', 'resumo_aguas_linhas_hit', handleLinhasLeave);
                    mapResumoAguas.on('mouseleave', 'resumo_aguas_linhas_layer', handleLinhasLeave);

                    // Hover e clique em pontos SRHS
                    mapResumoAguas.on('mousemove', 'resumo_aguas_pontos_layer', (e) => {
                        if (!e.features.length) return;
                        hoveringSobreposta = true;
                        popupMun.remove();
                        mapResumoAguas.getCanvas().style.cursor = 'pointer';
                        const props = e.features[0].properties || {};
                        const origem = props.camada_origem || 'Iniciativas SRHS';
                        const detalhe = props.detalhe_tooltip || 'Ação Prioritária SRHS';

                        popupLinhasPontos.setLngLat(e.lngLat)
                            .setHTML(`
                                <div style="font-family: inherit; font-size: 12px; min-width: 210px; max-width: 290px; padding: 4px;">
                                    <div style="font-size: 10px; color: #e11d48; font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">
                                        <i class="fas fa-location-dot"></i> ${origem}
                                    </div>
                                    <div style="font-weight: 600; font-size: 12px; color: #0f172a; line-height: 1.4;">
                                        ${detalhe}
                                    </div>
                                </div>
                            `)
                            .addTo(mapResumoAguas);
                    });

                    mapResumoAguas.on('mouseleave', 'resumo_aguas_pontos_layer', () => {
                        hoveringSobreposta = false;
                        mapResumoAguas.getCanvas().style.cursor = '';
                        popupLinhasPontos.remove();
                    });

                    // Hover e clique em Polígonos de Municípios
                    mapResumoAguas.on('mousemove', 'resumo_aguas_fill', (e) => {
                        if (hoveringSobreposta) return;
                        if (!e.features.length) return;
                        mapResumoAguas.getCanvas().style.cursor = 'pointer';
                        const feat = e.features[0];
                        const props = feat.properties || {};
                        const cod = props.codarea || '';
                        mapResumoAguas.setFilter('resumo_aguas_hover', ['all', ['==', '$type', 'Polygon'], ['==', 'codarea', cod]]);

                        const munNome = props.municipio || props.NM_MUN || 'Município';
                        const valCamada = props[camadaAtivaAguas] || 'Sem dados';
                        const corCamada = props[camadaAtivaAguas + ' (Cor)'] || '#CBD5E1';
                        const detalhe = props[camadaAtivaAguas + ' (Detalhe)'] || '';

                        popupMun.setLngLat(e.lngLat)
                            .setHTML(`
                                <div style="font-family: inherit; font-size: 12px; min-width: 180px; max-width: 270px; padding: 4px;">
                                    <div style="font-weight: 800; font-size: 13px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                                        ${munNome}
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${corCamada}; flex-shrink:0;"></span>
                                        <span style="font-weight: 700; color: #334155;">${valCamada}</span>
                                    </div>
                                    ${detalhe ? `<div style="font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 6px; margin-top: 5px; line-height: 1.35;">${detalhe}</div>` : ''}
                                    <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">
                                        Clique para filtrar a tabela de projetos
                                    </div>
                                </div>
                            `)
                            .addTo(mapResumoAguas);
                    });

                    mapResumoAguas.on('mouseleave', 'resumo_aguas_fill', () => {
                        mapResumoAguas.getCanvas().style.cursor = '';
                        mapResumoAguas.setFilter('resumo_aguas_hover', ['all', ['==', '$type', 'Polygon'], ['==', 'codarea', '']]);
                        popupMun.remove();
                    });

                    mapResumoAguas.on('click', 'resumo_aguas_fill', (e) => {
                        if (!e.features.length) return;
                        const props = e.features[0].properties || {};
                        const munNome = props.municipio || props.NM_MUN;
                        if (munNome) {
                            window.filtrarTabelaProjetosPorMunicipio(munNome);
                        }
                    });

                    // Monta a legenda dinâmica inicial
                    atualizarLegendaCompesa(camadaAtivaAguas);
                });
            }

            // 3. RENDERIZAR GRÁFICOS ANALÍTICOS (PORTFÓLIO, ABASTECIMENTO, RODÍZIO, RECURSOS E DÉFICIT)
            renderizarGraficosAguas(desembolso, projetos, municipios);
            renderizarNovosGraficosCompesa(data.plano, geoData);
            renderizarGraficosApac(data.apac_resumo || apacResumo, window.cacheApacReservatorios);

            // 4. RENDERIZAR TABELA DE PROJETOS COM DATATABLES
            renderizarTabelaProjetosAguas(projetos);
        })
        .catch(err => {
            console.error('[Resumo Águas] Erro ao carregar dados:', err);
            $('#resumo_aguas_spinner').addClass('d-none');
        });
};

window.alternarCamadaTematicaCompesa = function (camada) {
    camadaAtivaAguas = camada;
    const lbl = document.getElementById('aguas_camada_ativa_label');
    if (lbl) lbl.innerText = `Camada Ativa: ${camada}`;
    if (mapResumoAguas && mapResumoAguas.getLayer('resumo_aguas_fill')) {
        mapResumoAguas.setPaintProperty('resumo_aguas_fill', 'fill-color', [
            'coalesce',
            ['get', camada + ' (Cor)'],
            ['get', camada],
            '#CBD5E1'
        ]);
    }
    atualizarLegendaCompesa(camada);
};

window.trocarCamadaMapaAguas = window.alternarCamadaTematicaCompesa;

window.toggleCamadaSobrepostaCompesa = function (tipo, ativo) {
    if (!mapResumoAguas) return;
    const vis = ativo ? 'visible' : 'none';
    if (tipo === 'linhas') {
        if (mapResumoAguas.getLayer('resumo_aguas_linhas_layer')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_linhas_layer', 'visibility', vis);
        }
        if (mapResumoAguas.getLayer('resumo_aguas_linhas_hit')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_linhas_hit', 'visibility', vis);
        }
        if (mapResumoAguas.getLayer('resumo_aguas_adutoras_lines')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_adutoras_lines', 'visibility', vis);
        }
        if (mapResumoAguas.getLayer('resumo_aguas_adutoras_hit')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_adutoras_hit', 'visibility', vis);
        }
        const elLeg = document.getElementById('resumo_aguas_legenda_adutoras');
        if (elLeg) {
            if (ativo) elLeg.classList.remove('d-none');
            else elLeg.classList.add('d-none');
        }
    } else if (tipo === 'pontos') {
        if (mapResumoAguas.getLayer('resumo_aguas_pontos_layer')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_pontos_layer', 'visibility', vis);
        }
        const elLegPontos = document.getElementById('resumo_aguas_legenda_pontos');
        if (elLegPontos) {
            if (ativo) elLegPontos.classList.remove('d-none');
            else elLegPontos.classList.add('d-none');
        }
    } else if (tipo === 'mananciais') {
        if (mapResumoAguas.getLayer('resumo_aguas_mananciais_layer')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_mananciais_layer', 'visibility', vis);
        }
    } else if (tipo === 'bacias') {
        if (mapResumoAguas.getLayer('resumo_aguas_bacias_fill')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_bacias_fill', 'visibility', vis);
        }
        if (mapResumoAguas.getLayer('resumo_aguas_bacias_line')) {
            mapResumoAguas.setLayoutProperty('resumo_aguas_bacias_line', 'visibility', vis);
        }
    }
};

window.toggleCamadaAdutoras = function (ativo) {
    window.toggleCamadaSobrepostaCompesa('linhas', ativo);
};

function atualizarLegendaCompesa(camada) {
    const elCont = document.getElementById('resumo_aguas_legenda_itens');
    const elTit = document.getElementById('resumo_aguas_legenda_titulo');
    if (elTit) elTit.innerText = `Legenda: ${camada}`;
    if (!elCont || !compesaGeoData || !compesaGeoData.features) return;

    const contagem = {};
    const cores = {};

    compesaGeoData.features.forEach(f => {
        if (!f.geometry || !f.geometry.type.includes('Polygon')) return;
        const p = f.properties || {};
        const rotulo = p[camada] || 'Sem dados';
        const cor = p[camada + ' (Cor)'] || '#CBD5E1';
        contagem[rotulo] = (contagem[rotulo] || 0) + 1;
        if (!cores[rotulo]) cores[rotulo] = cor;
    });

    const itensOrdenados = Object.entries(contagem).sort((a, b) => b[1] - a[1]);

    let html = '';
    itensOrdenados.forEach(([rotulo, count]) => {
        const cor = cores[rotulo] || '#CBD5E1';
        html += `
            <div class="d-flex align-items-center justify-content-between py-1 border-b border-slate-100 last:border-0" style="font-size: 11px;">
                <div class="d-flex align-items-center gap-2 text-truncate" style="max-width: 82%;">
                    <span style="display:inline-block; width:11px; height:11px; border-radius:3px; background:${cor}; flex-shrink:0; border: 1px solid rgba(0,0,0,0.1);"></span>
                    <span class="text-slate-700 font-medium text-truncate" title="${rotulo}">${rotulo}</span>
                </div>
                <span class="badge bg-slate-100 text-slate-700 rounded-pill font-bold" style="font-size: 10px;">${count}</span>
            </div>
        `;
    });

    elCont.innerHTML = html;
}

function renderizarNovosGraficosCompesa(plano, geoData) {
    if (typeof echarts === 'undefined') return;

    // 1. CARDS MICRO-KPIS DE IMPACTO DO RODÍZIO
    const kpiAtual = document.getElementById('aguas_kpi_rodizio_atual_diario');
    if (kpiAtual) kpiAtual.innerText = '26';
    const kpiPos = document.getElementById('aguas_kpi_rodizio_pos_diario');
    if (kpiPos) kpiPos.innerText = '68';
    const kpiC2Sem = document.getElementById('aguas_kpi_c2_sem_deficit');
    if (kpiC2Sem) kpiC2Sem.innerText = '86';
    const kpiC2Sol = document.getElementById('aguas_kpi_c2_solucionado');
    if (kpiC2Sol) kpiC2Sol.innerText = '51';

    // 2. COMPARATIVO DE IMPACTO NO RODÍZIO (ATUAL VS PÓS-OBRAS)
    const elChartRodComp = document.getElementById('resumo_aguas_chart_rodizio_comp');
    if (elChartRodComp) {
        if (chartAguasRodizioComp) chartAguasRodizioComp.dispose();
        chartAguasRodizioComp = echarts.init(elChartRodComp);

        const catsRodizio = [
            'Não Operado',
            'Sem Dados / Avaliação',
            'Rodízio Crítico',
            'Rodízio Severo',
            'Rodízio Intermediário',
            'Rodízio Moderado',
            'Diário c/ Ajuste',
            'Diário (Universalizado)'
        ];
        const valsAtual = [12, 60, 25, 15, 16, 22, 9, 26];
        const valsPos   = [12, 2,  23, 18, 16, 27, 19, 68];

        chartAguasRodizioComp.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const cat = params[0].name;
                    const v1 = params[0].value;
                    const v2 = params[1] ? params[1].value : 0;
                    const diff = v2 - v1;
                    const diffTxt = diff > 0 ? `<b style="color:#10b981;">+${diff}</b>` : (diff < 0 ? `<b style="color:#e11d48;">${diff}</b>` : '<b>=</b>');
                    return `<b>${cat}</b><br/>
                            ${params[0].marker} Rodízio Atual: <b>${v1} municípios</b><br/>
                            ${params[1].marker} Pós-Obras: <b>${v2} municípios</b><br/>
                            Variação: ${diffTxt}`;
                }
            },
            legend: {
                top: 0,
                right: 10,
                textStyle: { fontSize: 11, color: '#475569', fontWeight: 'bold' }
            },
            grid: { top: 32, right: 30, bottom: 20, left: 165 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b' }
            },
            yAxis: {
                type: 'category',
                data: catsRodizio,
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#334155', fontWeight: 'bold', fontSize: 11 }
            },
            series: [
                {
                    name: 'Rodízio Atual',
                    type: 'bar',
                    barWidth: 9,
                    data: valsAtual,
                    itemStyle: {
                        borderRadius: [0, 4, 4, 0],
                        color: '#64748b'
                    }
                },
                {
                    name: 'Rodízio Pós-Obras',
                    type: 'bar',
                    barWidth: 9,
                    data: valsPos,
                    itemStyle: {
                        borderRadius: [0, 4, 4, 0],
                        color: '#10b981'
                    }
                }
            ]
        });
    }

    // 3. DISTRIBUIÇÃO SITUAÇÃO C2 E CATEGORIA MUNICIPAL
    const elChartSitC2 = document.getElementById('resumo_aguas_chart_situacao_c2');
    if (elChartSitC2) {
        if (chartAguasSituacaoC2) chartAguasSituacaoC2.dispose();
        chartAguasSituacaoC2 = echarts.init(elChartSitC2);

        chartAguasSituacaoC2.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a}<br/><b>{b}</b>: {c} municípios ({d}%)'
            },
            title: [
                { text: 'Situação C2 (Obras)', left: '26%', top: '4%', textAlign: 'center', textStyle: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' } },
                { text: 'Categoria / Porte', left: '74%', top: '4%', textAlign: 'center', textStyle: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' } }
            ],
            series: [
                {
                    name: 'Situação C2',
                    type: 'pie',
                    radius: ['26%', '46%'],
                    center: ['26%', '58%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
                    data: [
                        { value: 86, name: 'Sem Déficit (Atendido)', itemStyle: { color: '#1d9e75' } },
                        { value: 51, name: 'Solucionado c/ Obras', itemStyle: { color: '#ef9f27' } },
                        { value: 36, name: 'Déficit Persistente', itemStyle: { color: '#e24b4a' } },
                        { value: 12, name: 'Não Operado', itemStyle: { color: '#b8b6ae' } }
                    ]
                },
                {
                    name: 'Categoria Municipal',
                    type: 'pie',
                    radius: ['26%', '46%'],
                    center: ['74%', '58%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
                    data: [
                        { value: 24, name: 'Cat A (Grande Porte)', itemStyle: { color: '#185fa5' } },
                        { value: 28, name: 'Cat B (Médio Porte)', itemStyle: { color: '#ef9f27' } },
                        { value: 121, name: 'Cat C (Pequeno Porte)', itemStyle: { color: '#888780' } },
                        { value: 12, name: 'Não Operado', itemStyle: { color: '#b8b6ae' } }
                    ]
                }
            ]
        });
    }

    // 4. NECESSIDADE DE RECURSOS POR FONTE AGRUPADORA (FILTRANDO !is_total_agrupado)
    const elChartRecFonte = document.getElementById('resumo_aguas_chart_recursos_fonte');
    if (elChartRecFonte) {
        if (chartAguasRecursosFonte) chartAguasRecursosFonte.dispose();
        chartAguasRecursosFonte = echarts.init(elChartRecFonte);

        const necRows = (plano && plano.necessidade_recursos) ? plano.necessidade_recursos.filter(r => !r.is_total_agrupado) : [];
        const fontesMap = {};
        necRows.forEach(r => {
            const f = (r['FONTE AGRUPADORA'] || 'Outras').trim();
            fontesMap[f] = (fontesMap[f] || 0) + (Number(r['Total Geral (R$)']) || 0);
        });

        const topFontes = Object.entries(fontesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .reverse();

        chartAguasRecursosFonte.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const p = params[0];
                    const bi = p.value / 1e9;
                    return `<b>${p.name}</b><br/>Necessidade: <b>R$ ${bi.toFixed(2).replace('.', ',')} Bi</b>`;
                }
            },
            grid: { top: 20, right: 80, bottom: 20, left: 165 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 10,
                    formatter: v => v === 0 ? '0' : `R$ ${(v / 1e9).toFixed(1)} Bi`
                }
            },
            yAxis: {
                type: 'category',
                data: topFontes.map(t => t[0]),
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: {
                    color: '#334155',
                    fontWeight: 'bold',
                    fontSize: 10,
                    width: 150,
                    overflow: 'truncate',
                    formatter: v => v.length > 22 ? v.substring(0, 20) + '...' : v
                }
            },
            series: [{
                name: 'Recursos',
                type: 'bar',
                barWidth: 14,
                data: topFontes.map(t => t[1]),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#7c3aed' },
                        { offset: 1, color: '#c084fc' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                    fontSize: 10,
                    formatter: params => `R$ ${(params.value / 1e9).toFixed(2).replace('.', ',')} Bi`
                }
            }]
        });
    }

    // 5. NECESSIDADE DE RECURSOS POR STATUS DA AÇÃO
    const elChartRecStatus = document.getElementById('resumo_aguas_chart_recursos_status');
    if (elChartRecStatus) {
        if (chartAguasRecursosStatus) chartAguasRecursosStatus.dispose();
        chartAguasRecursosStatus = echarts.init(elChartRecStatus);

        const necRows = (plano && plano.necessidade_recursos) ? plano.necessidade_recursos.filter(r => !r.is_total_agrupado) : [];
        const statusMap = {};
        necRows.forEach(r => {
            let s = (r['Status'] || 'Outros').trim();
            if (s.toLowerCase().includes('conclu')) s = 'Concluído';
            else if (s.toLowerCase().includes('andamento')) s = 'Em Andamento';
            else if (s.toLowerCase().includes('a licitar')) s = 'A Licitar';
            else if (s.toLowerCase().includes('em licita')) s = 'Em Licitação';
            else if (s.toLowerCase().includes('a fazer')) s = 'A Fazer';
            else if (s.toLowerCase().includes('a iniciar')) s = 'A Iniciar';
            else if (s.toLowerCase().includes('elabora')) s = 'Em Elaboração';
            else s = 'Outros';

            statusMap[s] = (statusMap[s] || 0) + (Number(r['Total Geral (R$)']) || 0);
        });

        const statusData = Object.entries(statusMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const coresRecStatus = {
            'A Licitar': '#f59e0b',
            'A Fazer': '#8b5cf6',
            'Em Andamento': '#0284c7',
            'Em Licitação': '#38bdf8',
            'A Iniciar': '#06b6d4',
            'Em Elaboração': '#ec4899',
            'Concluído': '#10b981',
            'Outros': '#94a3b8'
        };

        chartAguasRecursosStatus.setOption({
            tooltip: {
                trigger: 'item',
                formatter: params => {
                    const bi = params.value / 1e9;
                    return `<b>${params.name}</b><br/>Total: <b>R$ ${bi.toFixed(2).replace('.', ',')} Bi</b> (${params.percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'middle',
                textStyle: { fontSize: 11, color: '#475569' }
            },
            series: [{
                name: 'Status da Ação',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['36%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2,
                    color: params => coresRecStatus[params.name] || '#94a3b8'
                },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
                data: statusData
            }]
        });
    }

    // 6. DÉFICIT BNDES (40 MUNICÍPIOS CRÍTICOS POR INTERVENÇÃO)
    const elChartDefBndes = document.getElementById('resumo_aguas_chart_deficit_bndes');
    if (elChartDefBndes) {
        if (chartAguasDeficitBndes) chartAguasDeficitBndes.dispose();
        chartAguasDeficitBndes = echarts.init(elChartDefBndes);

        const bndesList = (plano && plano.municipios_deficit_bndes) || [];
        const intervMap = {};
        bndesList.forEach(b => {
            let interv = (b['Intervenção'] || 'Outras').trim();
            if (interv.toLowerCase().includes('ajustes operacionais') || interv.toLowerCase().includes('ajuste operacionais')) {
                interv = 'Ajustes Operacionais';
            }
            intervMap[interv] = (intervMap[interv] || 0) + 1;
        });

        const topInterv = Object.entries(intervMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .reverse();

        chartAguasDeficitBndes.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const p = params[0];
                    return `<b>${p.name}</b><br/>Municípios atendidos: <b>${p.value}</b>`;
                }
            },
            grid: { top: 20, right: 35, bottom: 20, left: 190 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b' }
            },
            yAxis: {
                type: 'category',
                data: topInterv.map(t => t[0]),
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#334155', fontWeight: 'bold', fontSize: 10 }
            },
            series: [{
                name: 'Municípios',
                type: 'bar',
                barWidth: 13,
                data: topInterv.map(t => t[1]),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#f97316' },
                        { offset: 1, color: '#fdba74' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#c2410c',
                    fontWeight: 'bold',
                    fontSize: 10,
                    formatter: '{c} muns'
                }
            }]
        });
    }

    // 7. INICIATIVAS ESTRUTURANTES DA SRHS (POR FONTE)
    const elChartSrhs = document.getElementById('resumo_aguas_chart_iniciativas_srhs');
    if (elChartSrhs) {
        if (chartAguasIniciativasSrhs) chartAguasIniciativasSrhs.dispose();
        chartAguasIniciativasSrhs = echarts.init(elChartSrhs);

        const srhsList = (plano && plano.iniciativas_srhs) || [];
        const fontesSrhs = {};
        srhsList.forEach(s => {
            const f = (s['Fonte'] || 'Outras').trim();
            fontesSrhs[f] = (fontesSrhs[f] || 0) + (Number(s['Valor']) || 0);
        });

        const topFontesSrhs = Object.entries(fontesSrhs)
            .sort((a, b) => b[1] - a[1])
            .reverse();

        chartAguasIniciativasSrhs.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const p = params[0];
                    return `<b>${p.name}</b><br/>Investimento: <b>R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M</b>`;
                }
            },
            grid: { top: 20, right: 80, bottom: 20, left: 165 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 10,
                    formatter: v => v === 0 ? '0' : (v >= 1000 ? `R$ ${(v / 1000).toFixed(1)} Bi` : `R$ ${Math.round(v)} M`)
                }
            },
            yAxis: {
                type: 'category',
                data: topFontesSrhs.map(t => t[0]),
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: {
                    color: '#334155',
                    fontWeight: 'bold',
                    fontSize: 10,
                    width: 150,
                    overflow: 'truncate',
                    formatter: v => v.length > 22 ? v.substring(0, 20) + '...' : v
                }
            },
            series: [{
                name: 'Investimento SRHS',
                type: 'bar',
                barWidth: 13,
                data: topFontesSrhs.map(t => Math.round(t[1] * 10) / 10),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#0d9488' },
                        { offset: 1, color: '#2dd4bf' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#0f766e',
                    fontWeight: 'bold',
                    fontSize: 10,
                    formatter: params => `R$ ${params.value}M`
                }
            }]
        });
    }
}

function renderizarGraficosApac(apacResumo, reservatoriosLista) {
    if (typeof echarts === 'undefined') return;

    // 1. CARDS MACRO DA APAC
    if (apacResumo) {
        const elPct = document.getElementById('apac_kpi_volume_percent');
        if (elPct && apacResumo.percentual_geral !== undefined) {
            elPct.innerText = `${apacResumo.percentual_geral.toLocaleString('pt-BR')}%`;
        }
        const elCol = document.getElementById('apac_kpi_colapso_count');
        if (elCol && apacResumo.colapso_count !== undefined) {
            elCol.innerText = apacResumo.colapso_count;
        }
        const elCrit = document.getElementById('apac_kpi_critico_count');
        if (elCrit && apacResumo.critico_count !== undefined) {
            elCrit.innerText = apacResumo.critico_count;
        }
        const elSeg = document.getElementById('apac_kpi_seguro_count');
        if (elSeg && apacResumo.cheio_count !== undefined) {
            elSeg.innerText = apacResumo.cheio_count;
        }
    }

    const resList = reservatoriosLista || window.cacheApacReservatorios || [];
    if (!resList.length) return;

    // 2. GRÁFICO 1: VOLUME ARMAZENADO E CAPACIDADE POR BACIA HIDROGRÁFICA
    const elChartBacias = document.getElementById('resumo_aguas_chart_bacias_volume');
    if (elChartBacias) {
        if (chartApacBaciasVolume) chartApacBaciasVolume.dispose();
        chartApacBaciasVolume = echarts.init(elChartBacias);

        const baciasAgreg = {};
        resList.forEach(r => {
            const b = (r.baciahidrografica || 'Outra').trim();
            if (!baciasAgreg[b]) {
                baciasAgreg[b] = { cap: 0, vol: 0 };
            }
            baciasAgreg[b].cap += Number(r.capacidade_m) || 0;
            baciasAgreg[b].vol += Number(r.volumeatual_m) || 0;
        });

        // Top 8 Bacias por Capacidade
        const topBacias = Object.entries(baciasAgreg)
            .sort((a, b) => b[1].cap - a[1].cap)
            .slice(0, 8)
            .reverse();

        const catNames = topBacias.map(t => t[0]);
        const dataCap = topBacias.map(t => Math.round(t[1].cap * 10) / 10);
        const dataVol = topBacias.map(t => Math.round(t[1].vol * 10) / 10);

        chartApacBaciasVolume.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const bacia = params[0].name;
                    const c = params[0].value;
                    const v = params[1] ? params[1].value : 0;
                    const pct = c > 0 ? ((v / c) * 100).toFixed(1) : '0';
                    return `<b>Bacia: ${bacia}</b><br/>` +
                           `${params[0].marker} Capacidade Máxima: <b>${c.toLocaleString('pt-BR')} Mi m³</b><br/>` +
                           `${params[1].marker} Volume Armazenado: <b>${v.toLocaleString('pt-BR')} Mi m³</b><br/>` +
                           `Armazenamento: <b style="color:#0284c7;">${pct}%</b>`;
                }
            },
            legend: {
                top: 0,
                right: 10,
                textStyle: { fontSize: 11, color: '#475569', fontWeight: 'bold' }
            },
            grid: { top: 32, right: 30, bottom: 20, left: 130 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b', formatter: '{value}M m³' }
            },
            yAxis: {
                type: 'category',
                data: catNames,
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#334155', fontWeight: 'bold', fontSize: 11 }
            },
            series: [
                {
                    name: 'Capacidade de Projeto',
                    type: 'bar',
                    barWidth: 10,
                    data: dataCap,
                    itemStyle: {
                        borderRadius: [0, 4, 4, 0],
                        color: '#cbd5e1'
                    }
                },
                {
                    name: 'Volume Atual (APAC)',
                    type: 'bar',
                    barWidth: 10,
                    data: dataVol,
                    itemStyle: {
                        borderRadius: [0, 4, 4, 0],
                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                            { offset: 0, color: '#0284c7' },
                            { offset: 1, color: '#38bdf8' }
                        ])
                    }
                }
            ]
        });
    }

    // 3. GRÁFICO 2: DISTRIBUIÇÃO DA CAPACIDADE POR FAIXA OPERACIONAL
    const elChartFaixas = document.getElementById('resumo_aguas_chart_faixas_capacidade');
    if (elChartFaixas) {
        if (chartApacFaixasCapacidade) chartApacFaixasCapacidade.dispose();
        chartApacFaixasCapacidade = echarts.init(elChartFaixas);

        const faixasMap = {
            'COLAPSO': { nome: 'Colapso (< 10%)', val: 0, count: 0, cor: '#ef4444' },
            'ENTRE 10% e 30%': { nome: 'Alerta Severo (10% a 30%)', val: 0, count: 0, cor: '#f97316' },
            'ENTRE 30% e 80%': { nome: 'Moderado (30% a 80%)', val: 0, count: 0, cor: '#f59e0b' },
            'ENTRE 80% e 100%': { nome: 'Cheio (80% a 100%)', val: 0, count: 0, cor: '#10b981' },
            'VERTENDO': { nome: 'Vertendo (> 100%)', val: 0, count: 0, cor: '#0ea5e9' }
        };

        resList.forEach(r => {
            const f = (r.faixa || 'COLAPSO').trim();
            const target = faixasMap[f] || faixasMap['COLAPSO'];
            target.val += Number(r.capacidade_m) || 0;
            target.count += 1;
        });

        const faixasData = Object.values(faixasMap).map(f => ({
            name: f.nome,
            value: Math.round(f.val * 10) / 10,
            count: f.count,
            itemStyle: { color: f.cor }
        }));

        chartApacFaixasCapacidade.setOption({
            tooltip: {
                trigger: 'item',
                formatter: params => {
                    const c = params.data.count;
                    return `<b>${params.name}</b><br/>Capacidade: <b>${params.value.toLocaleString('pt-BR')} Mi m³</b> (${params.percent}%)<br/>Reservatórios: <b>${c}</b>`;
                }
            },
            legend: {
                orient: 'horizontal',
                bottom: 4,
                left: 'center',
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { fontSize: 10, color: '#475569' }
            },
            series: [{
                name: 'Faixa Operacional',
                type: 'pie',
                radius: ['38%', '62%'],
                center: ['50%', '42%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
                data: faixasData
            }]
        });
    }

    // 4. TABELA DE MANANCIAIS COM DATATABLES
    renderizarTabelaMananciaisApac(resList);
}

function renderizarTabelaMananciaisApac(reservatorios) {
    if ($.fn.DataTable.isDataTable('#resumo_aguas_tabela_mananciais')) {
        dtApacMananciais = $('#resumo_aguas_tabela_mananciais').DataTable();
        dtApacMananciais.clear().rows.add(reservatorios).draw(false);
        return;
    }

    dtApacMananciais = $('#resumo_aguas_tabela_mananciais').DataTable({
        data: reservatorios,
        deferRender: true,
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        pageLength: 10,
        scrollX: true,
        order: [[3, 'desc']], // ordenar por capacidade
        columns: [
            {
                title: "Manancial / Reservatório",
                data: "nome_reservatorio",
                className: "align-middle fw-bold text-slate-800",
                width: "220px",
                render: (d, t, r) => `<div>${d}</div><div class="text-[11px] text-slate-400 font-normal">Tipo: ${r.tipobarragem || 'Barragem'}</div>`
            },
            {
                title: "Município",
                data: "nome_municipio",
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-pill">${d || '-'}</span>`
            },
            {
                title: "Bacia Hidrográfica",
                data: "baciahidrografica",
                className: "align-middle",
                width: "120px",
                render: d => `<span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-pill text-[10px]">${d || '-'}</span>`
            },
            {
                title: "Capacidade (Mi m³)",
                data: "capacidade_m",
                className: "align-middle text-end font-mono fw-bold text-slate-700",
                width: "120px",
                render: d => (Number(d) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            },
            {
                title: "Volume Atual (Mi m³)",
                data: "volumeatual_m",
                className: "align-middle text-end font-mono fw-bold text-blue-700",
                width: "120px",
                render: d => (Number(d) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            },
            {
                title: "Nível (%)",
                data: "per_volume",
                className: "align-middle",
                width: "130px",
                render: (d, t, r) => {
                    const num = Number(d) || 0;
                    const cor = r.faixa_cor || '#0284c7';
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px; background-color: #e2e8f0;">
                                <div class="progress-bar" style="width: ${Math.min(num, 100)}%; background-color: ${cor};"></div>
                            </div>
                            <span class="text-xs fw-bold font-mono" style="color: ${cor};">${num.toFixed(1)}%</span>
                        </div>
                    `;
                }
            },
            {
                title: "Situação / Faixa",
                data: "faixa_rotulo",
                className: "align-middle",
                width: "140px",
                render: (d, t, r) => {
                    const cor = r.faixa_cor || '#64748b';
                    return `<span class="badge rounded-pill px-2.5 py-1 text-xs font-bold" style="background-color: ${cor}18; color: ${cor}; border: 1px solid ${cor}50;">${d || r.faixa}</span>`;
                }
            },
            {
                title: "Finalidade",
                data: "usoprincipal",
                className: "align-middle text-slate-600 text-xs",
                width: "130px"
            },
            {
                title: "Data Leitura",
                data: "data_cota",
                className: "align-middle text-center text-slate-400 text-xs font-mono",
                width: "90px"
            }
        ]
    });
}


function renderizarGraficosAguas(desembolso, projetos, municipios) {
    if (typeof echarts === 'undefined') return;

    // Gráfico 1: Necessidades de Desembolso Plurianual (2026-2030)
    const elChartDesemb = document.getElementById('resumo_aguas_chart_desembolso') || document.getElementById('chart_aguas_desembolso');
    if (elChartDesemb) {
        if (chartAguasDesembolso) chartAguasDesembolso.dispose();
        chartAguasDesembolso = echarts.init(elChartDesemb);

        const anos = [2026, 2027, 2028, 2029, 2030];
        const valoresPorAno = {};
        anos.forEach(a => { valoresPorAno[a] = 0; });

        desembolso.forEach(d => {
            const ano = Number(d.ano_desembolso);
            if (valoresPorAno[ano] !== undefined) {
                valoresPorAno[ano] += Number(d.valor_desembolso_m) || 0;
            }
        });

        const seriesVals = anos.map(a => Math.round(valoresPorAno[a] * 10) / 10);

        chartAguasDesembolso.setOption({
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    const p = params[0];
                    return `<b>Ano ${p.name}</b><br/>Previsão: R$ ${p.value.toLocaleString('pt-BR')} M`;
                }
            },
            grid: { top: 30, right: 20, bottom: 30, left: 55 },
            xAxis: {
                type: 'category',
                data: anos.map(String),
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#64748b', fontWeight: 'bold' }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisLabel: { color: '#64748b', formatter: 'R$ {value}M' },
                splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
            },
            series: [{
                name: 'Desembolso',
                type: 'bar',
                barWidth: '42%',
                data: seriesVals,
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#0284c7' },
                        { offset: 1, color: '#38bdf8' }
                    ])
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#0369a1',
                    fontWeight: 'bold',
                    formatter: params => `R$ ${params.value}M`
                }
            }]
        });
    }

    // Gráfico 2: Distribuição por Status de Intervenção
    const elChartStatus = document.getElementById('resumo_aguas_chart_status') || document.getElementById('chart_aguas_status');
    if (elChartStatus) {
        if (chartAguasStatus) chartAguasStatus.dispose();
        chartAguasStatus = echarts.init(elChartStatus);

        const statusMap = {};
        projetos.forEach(p => {
            let s = (p.status || 'Outro').trim();
            if (s.toLowerCase().includes('conclu')) s = 'Concluído';
            else if (s.toLowerCase().includes('andamento')) s = 'Em Andamento';
            else if (s.toLowerCase().includes('a licitar')) s = 'A Licitar';
            else if (s.toLowerCase().includes('em licita')) s = 'Em Licitação';
            else if (s.toLowerCase().includes('a iniciar') || s.toLowerCase().includes('a fazer')) s = 'A Iniciar / A Fazer';
            else if (s.toLowerCase().includes('elabora')) s = 'Em Elaboração';
            else s = 'Outros';

            statusMap[s] = (statusMap[s] || 0) + 1;
        });

        const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        const coresStatus = {
            'Concluído': '#10b981',
            'Em Andamento': '#0284c7',
            'A Licitar': '#f59e0b',
            'Em Licitação': '#8b5cf6',
            'A Iniciar / A Fazer': '#06b6d4',
            'Em Elaboração': '#ec4899',
            'Outros': '#94a3b8'
        };

        chartAguasStatus.setOption({
            tooltip: { trigger: 'item', formatter: '{b}: <b>{c} projetos</b> ({d}%)' },
            legend: { orient: 'vertical', right: 10, top: 'middle', textStyle: { fontSize: 11, color: '#475569' } },
            series: [{
                name: 'Status',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['38%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2,
                    color: params => coresStatus[params.name] || '#94a3b8'
                },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
                data: statusData
            }]
        });
    }

    // Gráfico 3: Top 15 Municípios por Investimento (R$ Milhões)
    const elChartTop = document.getElementById('resumo_aguas_chart_top_muns') || document.getElementById('chart_aguas_top_muns');
    if (elChartTop) {
        if (chartAguasTopMuns) chartAguasTopMuns.dispose();
        chartAguasTopMuns = echarts.init(elChartTop);

        const munsInv = {};
        municipios.forEach(m => {
            const nome = (m.municipio || '').trim();
            if (nome && nome !== '-') {
                munsInv[nome] = (munsInv[nome] || 0) + (Number(m.valor_rateado_m) || Number(m.investimento_total) || 0);
            }
        });

        // Caso municipios_rel não tenha valores agregados suficientes, agrega dos projetos
        if (Object.keys(munsInv).length === 0) {
            projetos.forEach(p => {
                const nome = (p.municipio || '').trim();
                if (nome && nome !== '-') {
                    munsInv[nome] = (munsInv[nome] || 0) + (Number(p.valor_total_m) || 0);
                }
            });
        }

        const top15 = Object.entries(munsInv)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .reverse();

        chartAguasTopMuns.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: params => {
                    const p = params[0];
                    return `<b>${p.name}</b><br/>Investimento Total: R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
                }
            },
            grid: { top: 20, right: 30, bottom: 20, left: 130 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b', formatter: 'R$ {value}M' }
            },
            yAxis: {
                type: 'category',
                data: top15.map(t => t[0]),
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#334155', fontWeight: 'bold', fontSize: 11 }
            },
            series: [{
                name: 'Investimento',
                type: 'bar',
                data: top15.map(t => Math.round(t[1] * 10) / 10),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#059669' },
                        { offset: 1, color: '#34d399' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#065f46',
                    fontWeight: 'bold',
                    fontSize: 10,
                    formatter: params => `R$ ${params.value}M`
                }
            }]
        });

        // Clique no gráfico também filtra a tabela
        chartAguasTopMuns.on('click', params => {
            if (params.name) {
                window.filtrarTabelaProjetosPorMunicipio(params.name);
            }
        });
    }
}

function renderizarTabelaProjetosAguas(projetos) {
    if ($.fn.DataTable.isDataTable('#resumo_aguas_tabela_projetos')) {
        dtResumoAguas = $('#resumo_aguas_tabela_projetos').DataTable();
        dtResumoAguas.clear().rows.add(projetos).draw(false);
        return;
    }

    dtResumoAguas = $('#resumo_aguas_tabela_projetos').DataTable({
        data: projetos,
        deferRender: true,
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        pageLength: 10,
        scrollX: true,
        order: [[5, 'desc']], // ordenar por valor de investimento
        columns: [
            { 
                title: "ID", 
                data: "id_projeto", 
                className: "align-middle text-center", 
                width: "60px",
                render: d => `<span class="badge bg-slate-100 text-slate-700 font-mono border">#${d || '-'}</span>`
            },
            { 
                title: "Nome do Projeto / Intervenção", 
                data: "nome_do_projeto", 
                className: "align-middle", 
                width: "280px",
                render: (d, t, r) => {
                    const obj = r.objetivo ? `<div class="text-xs text-slate-500 mt-0.5">${r.objetivo}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${d || '-'}</div>${obj}`;
                }
            },
            { 
                title: "Município(s)", 
                data: "municipio", 
                className: "align-middle", 
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill">${d || 'Estadual'}</span>`
            },
            { 
                title: "Diretoria", 
                data: "diretoria", 
                className: "align-middle text-center", 
                width: "90px",
                render: d => `<span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs">${d || 'COMPESA'}</span>`
            },
            { 
                title: "Status", 
                data: "status", 
                className: "align-middle", 
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu')) badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    else if (s.toLowerCase().includes('andamento')) badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    else if (s.toLowerCase().includes('licita')) badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    else if (s.toLowerCase().includes('iniciar') || s.toLowerCase().includes('fazer')) badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            { 
                title: "Investimento (R$)", 
                data: "valor_total_m", 
                className: "align-middle text-end fw-bold text-slate-800", 
                width: "130px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
                }
            },
            { 
                title: "Pop. Beneficiada", 
                data: "populacao_beneficiada", 
                className: "align-middle text-end", 
                width: "120px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return num > 0 ? num.toLocaleString('pt-BR') : '-';
                }
            },
            { 
                title: "Execução (%)", 
                data: "percentual_executado", 
                className: "align-middle", 
                width: "110px",
                render: (d, t) => {
                    let num = Number(d) || 0;
                    if (num <= 1 && num > 0) num = Math.round(num * 100);
                    else num = Math.round(num);
                    if (t !== 'display') return num;
                    const barColor = num >= 100 ? 'bg-emerald-500' : (num >= 50 ? 'bg-sky-500' : 'bg-amber-500');
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar ${barColor}" style="width: ${Math.min(num, 100)}%;"></div>
                            </div>
                            <span class="text-xs fw-bold text-slate-700">${num}%</span>
                        </div>
                    `;
                }
            },
            { 
                title: "Fonte de Recursos", 
                data: "fonte_de_recursos", 
                className: "align-middle text-xs text-slate-600", 
                width: "160px",
                render: d => d || '-'
            }
        ]
    });
}

window.filtrarTabelaProjetosPorMunicipio = function (nomeMun) {
    if (!nomeMun) return;
    filtroMunAguasAtivo = nomeMun;
    if (dtResumoAguas) {
        dtResumoAguas.column(2).search(nomeMun).draw();
    }
    const badgeContainer = document.getElementById('aguas_filtro_municipio_ativo');
    const badgeText = document.getElementById('aguas_filtro_municipio_badge');
    if (badgeContainer && badgeText) {
        badgeText.innerText = `Filtro: ${nomeMun}`;
        badgeContainer.classList.remove('d-none');
        badgeContainer.classList.add('d-flex');
    }
    const elTabela = document.getElementById('resumo_aguas_tabela_projetos');
    if (elTabela) {
        elTabela.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

window.limparFiltroMunTabelaAguas = function () {
    filtroMunAguasAtivo = null;
    if (dtResumoAguas) {
        dtResumoAguas.column(2).search('').draw();
    }
    const badgeContainer = document.getElementById('aguas_filtro_municipio_ativo');
    if (badgeContainer) {
        badgeContainer.classList.add('d-none');
        badgeContainer.classList.remove('d-flex');
    }
};


/* ==========================================================================
   MODAL DE SÉRIE HISTÓRICA E RANKING / COMPARATIVO REGIONAL (MUNICÍPIOS)
   ========================================================================== */

var chartModalFichaSerie = null;
var chartModalFichaRanking = null;

window.configurarBotoesKPI = function(elemBase, sigla, titulo, tipo) {
    const $card = $(`#ficha_kpi_${elemBase}`).closest('.kpi-modern-card');
    if (!$card.length) return;
    const headerEl = $card.find('.kpi-modern-header');
    if (!headerEl.length) return;

    if (headerEl.find('.kpi-actions-container').length > 0) return;

    let txtTitulo = titulo;
    if (!txtTitulo) {
        const clone = headerEl.clone();
        clone.find('button, i').remove();
        txtTitulo = clone.text().trim();
    }
    if (txtTitulo === 'DTP/RCL' || String(sigla).toLowerCase().includes('dtp')) {
        txtTitulo = 'Pessoal';
    }
    const tituloEscaped = txtTitulo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const siglaEscaped = String(sigla || elemBase || '').trim().replace(/'/g, "\\'");
    const tipoEscaped = (tipo || 'socio').replace(/'/g, "\\'");

    headerEl.addClass('d-flex justify-content-between align-items-start gap-1.5');
    headerEl.html(`
        <span class="kpi-header-title" title="${tituloEscaped}">${txtTitulo}</span>
        <div class="kpi-actions-container d-flex gap-1 align-items-center flex-shrink-0 d-print-none">
            <button type="button" class="btn btn-light bg-white border border-slate-200 shadow-2xs d-flex justify-content-center align-items-center" 
                    onclick="event.stopPropagation(); window.abrirModalMetadado('${siglaEscaped}')" 
                    style="width: 24px; height: 24px; border-radius: 6px; padding: 0; min-width: 24px;" title="Ver Metadados e Informações">
                <i class="fas fa-info text-slate-400 hover:text-blue-600" style="font-size: 0.65rem;"></i>
            </button>
            <button type="button" class="btn btn-light bg-white border border-slate-200 shadow-2xs d-flex justify-content-center align-items-center" 
                    onclick="event.stopPropagation(); window.abrirModalSerieHistoricaMun('${siglaEscaped}', '${tituloEscaped}', '${tipoEscaped}')" 
                    style="width: 24px; height: 24px; border-radius: 6px; padding: 0; min-width: 24px;" title="Ver Série Histórica e Comparativo">
                <i class="fas fa-arrow-right" style="color: #0C2856; font-size: 0.65rem;"></i>
            </button>
        </div>
    `);
};

window.garantirBotoesTodosKPIs = function() {
    // 1. Configurar os 8 KPIs da caracterização inicial
    window.configurarBotoesKPI('pibpc', 'pibpc', 'PIB per Capita', 'socio');
    window.configurarBotoesKPI('pib_pct', 'pib_pct', 'Participação PIB Estadual', 'socio');
    window.configurarBotoesKPI('pib_1000', 'pib', 'PIB Total', 'socio');
    window.configurarBotoesKPI('idhm', 'idhm', 'IDHM', 'socio');
    window.configurarBotoesKPI('vab_agro', 'vab_agro', 'VAB Agropecuária', 'socio');
    window.configurarBotoesKPI('vab_ind', 'vab_ind', 'VAB Indústria', 'socio');
    window.configurarBotoesKPI('vab_serv', 'vab_serv', 'VAB Serviços', 'socio');
    window.configurarBotoesKPI('vab_adm', 'vab_adm', 'VAB Adm Pública', 'socio');

    // 2. Varrer todos os .kpi-modern-card que ainda não possuam botões de ação
    $('#aba_ficha .kpi-modern-card').each(function() {
        const $card = $(this);
        if ($card.find('.kpi-actions-container').length > 0) return;

        const numEl = $card.find('[id^="ficha_kpi_"]');
        if (!numEl.length) return;

        const idNum = numEl.attr('id') || '';
        const elemBase = idNum.replace('ficha_kpi_', '');
        const clone = $card.find('.kpi-modern-header').clone();
        clone.find('button, i').remove();
        let titulo = clone.text().trim();
        if (titulo === 'DTP/RCL' || elemBase.includes('dtp')) titulo = 'Pessoal';

        const tipo = elemBase.includes('fisc') ? 'fiscal' : 'socio';
        window.configurarBotoesKPI(elemBase, elemBase, titulo, tipo);
    });
};

window.abrirModalSerieHistoricaMun = async function (sigla, titulo, tipo) {
    const mun = $('#ficha_f_municipio').val() || 'Município';
    const siglaNorm = String(sigla || '').trim().toLowerCase();
    let nomeExib = titulo || sigla;
    if (nomeExib === 'DTP/RCL' || siglaNorm.includes('dtp')) nomeExib = 'Pessoal';

    const modalTitle = document.getElementById('modal_ficha_kpi_titulo');
    if (modalTitle) {
        modalTitle.innerText = `${nomeExib} — Evolução Histórica e Comparativo (${mun})`;
    }

    const badgeTipo = document.getElementById('modal_ficha_kpi_badge_tipo');
    if (badgeTipo) {
        badgeTipo.innerText = tipo === 'fiscal' ? 'GESTÃO FISCAL' : 'INDICADOR MUNICIPAL';
    }

    const modalEl = document.getElementById('modal_ficha_kpi_serie');
    if (!modalEl) {
        console.error('[Ficha] Modal #modal_ficha_kpi_serie não encontrado no DOM!');
        return;
    }

    let bsModal = null;
    if (window.bootstrap && window.bootstrap.Modal) {
        bsModal = window.bootstrap.Modal.getOrCreateInstance 
            ? window.bootstrap.Modal.getOrCreateInstance(modalEl) 
            : new window.bootstrap.Modal(modalEl);
    } else if (typeof $(modalEl).modal === 'function') {
        $(modalEl).modal('show');
    }
    if (bsModal) {
        bsModal.show();
    }

    renderizarModalConteudoMun(siglaNorm, nomeExib, mun, tipo);
    $(modalEl).one('shown.bs.modal', function () {
        if (chartModalFichaSerie) chartModalFichaSerie.resize();
        if (chartModalFichaRanking) chartModalFichaRanking.resize();
    });
};

function renderizarModalConteudoMun(siglaNorm, nomeExib, mun, tipo) {
    const normKey = (str) => String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const siglaKey = normKey(siglaNorm);
    const meta = (window.dadosMetadados || []).find(m => {
        const cd = normKey(m.cd_indicador);
        const nm = normKey(m.nm_indicador);
        return cd === siglaKey || nm === siglaKey || (cd && siglaKey && (cd.includes(siglaKey) || siglaKey.includes(cd)));
    });
    const unidade = meta ? (meta.unidade || '') : '';
    const natureza = meta ? (meta.natureza || '') : '';
    const natNorm = normKey(natureza);
    const isPct = unidade.includes('%') || nomeExib.includes('%') || natNorm.includes('percent') || natNorm.includes('taxa') || siglaNorm.includes('pct') || siglaNorm.includes('perc') || siglaNorm.includes('tx_') || siglaNorm.includes('dtp') || siglaNorm.includes('pessoal');
    const isMoeda = unidade.includes('R$') || nomeExib.includes('R$') || natNorm.includes('moeda') || natNorm.includes('monetario') || siglaNorm.includes('pib') || siglaNorm.includes('val');
    const isIndice = unidade.toLowerCase().includes('índice') || natNorm.includes('indice') || natNorm.includes('razao') || siglaNorm.includes('idhm') || siglaNorm.includes('ideb') || siglaNorm.includes('ivcad') || siglaNorm.includes('ql');

    let anos = [];
    let valores = [];
    let serieMun = [];

    if (tipo === 'fiscal' || siglaNorm.includes('dtp') || siglaNorm.includes('fisc') || siglaNorm.includes('pessoal')) {
        const fiscais = window.dadosFiscaisMun || [];
        const matches = fiscais.filter(f => {
            const indNorm = normKey(f.indicador);
            return indNorm === siglaKey || (siglaKey === 'pessoal' && (indNorm.includes('dtp') || indNorm.includes('pessoal')));
        });
        const porAno = {};
        matches.forEach(m => {
            const ex = Number(m.exercicio);
            if (!isNaN(ex) && ex > 0) {
                porAno[ex] = parseFloat(m.valor) || 0;
            }
        });
        const anosOrd = Object.keys(porAno).map(Number).sort((a, b) => a - b);
        anos = anosOrd.map(String);
        valores = anosOrd.map(a => porAno[a]);
    } else {
        const indicadores = dadosBrutosFicha || [];
        serieMun = indicadores.filter(i => {
            const s = normKey(i.sigla_indicador);
            return s === siglaKey || (meta && normKey(i.nm_indicador) === normKey(meta.nm_indicador));
        });

        serieMun.sort((a, b) => (Number(a.ano) || 0) - (Number(b.ano) || 0));
        anos = serieMun.map(d => String(d.ano));
        valores = serieMun.map(d => {
            const valStr = String(d.indicador || '').replace(',', '.').replace('%', '').trim();
            return parseFloat(valStr) || 0;
        });
    }

    const indRD = cacheSociaisRD.indicadoresRD || [];
    const rdNome = cacheSociaisRD.demografiaRD?.[0]?.regiao_de_desenvolvimento || '';
    const anoMaisRecente = anos.length ? Math.max(...anos.map(Number)) : 0;
    
    let rankingArr = [];
    if (indRD.length > 0 && anoMaisRecente > 0) {
        const itensRD = indRD.filter(d => {
            const s = normKey(d.sigla_indicador);
            return (s === siglaKey || (meta && normKey(d.nm_indicador) === normKey(meta.nm_indicador))) && Number(d.ano) === anoMaisRecente;
        });

        rankingArr = itensRD.map(d => ({
            municipio: d.nm_municipio || d.municipio,
            valor: parseFloat(String(d.indicador || '').replace(',', '.').replace('%', '').trim()) || 0,
            rank_pe: d.rank_pe || null
        }));
    }

    if (rankingArr.length === 0 && valores.length > 0) {
        rankingArr.push({
            municipio: mun,
            valor: valores[valores.length - 1],
            rank_pe: serieMun.length ? serieMun[serieMun.length - 1].rank_pe : null
        });
    }

    rankingArr.sort((a, b) => b.valor - a.valor);

    renderStorytellingModalMun(nomeExib, mun, anos, valores, rankingArr, unidade, isPct, isMoeda, isIndice, meta);
    renderGraficoLinhaModalMun(anos, valores, nomeExib, mun, isPct, isMoeda, isIndice);
    renderGraficoBarrasModalMun(rankingArr, mun, nomeExib, rdNome, isPct, isMoeda, isIndice, anoMaisRecente);
}

function renderStorytellingModalMun(nomeExib, mun, anos, valores, rankingArr, unidade, isPct, isMoeda, isIndice, meta) {
    const $story = $('#modal_ficha_kpi_storytelling');
    if (!$story.length) return;

    if (!valores.length) {
        $story.html(`<div class="text-slate-500 italic">Série histórica em consolidação para este município.</div>`);
        return;
    }

    const ultimoVal = valores[valores.length - 1];
    const ultimoAno = anos[anos.length - 1];
    
    const formatarValor = (v) => {
        if (isNaN(v)) return '-';
        if (isPct) return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
        if (isMoeda) return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (isIndice) return v.toFixed(3);
        return v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    };

    let textoVar = '';
    if (valores.length >= 2) {
        const penultimoVal = valores[valores.length - 2];
        const penultimoAno = anos[anos.length - 2];
        const varAbs = ultimoVal - penultimoVal;
        const varPct = penultimoVal !== 0 ? (varAbs / Math.abs(penultimoVal)) * 100 : 0;
        const sinal = varPct >= 0 ? '+' : '';
        const cor = varPct >= 0 ? '#10B981' : '#EF4444';
        textoVar = ` Em relação a <strong>${penultimoAno}</strong> (${formatarValor(penultimoVal)}), registrou variação de <strong style="color: ${cor};">${sinal}${varPct.toFixed(1)}%</strong>.`;
    }

    let textoRank = '';
    const normTextMun = (s) => String(s || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const munItem = rankingArr.find(r => normTextMun(r.municipio) === normTextMun(mun));
    if (munItem && munItem.rank_pe) {
        textoRank = ` No ranking estadual, <strong>${mun}</strong> posiciona-se no <strong>${munItem.rank_pe}º lugar</strong> entre os 184 municípios de Pernambuco.`;
    }

    let refTexto = '';
    if (meta && meta.referencia_analise) {
        const ref = typeof meta.referencia_analise === 'object' ? meta.referencia_analise : {};
        if (ref.interpretacao) {
            refTexto = `<div class="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100"><i class="fas fa-lightbulb text-amber-500 me-1"></i><strong>Interpretação Estratégica:</strong> ${ref.interpretacao}</div>`;
        }
    }

    $story.html(`
        <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-pill text-xs">DIAGNÓSTICO EXECUTIVO</span>
            <span class="text-xs text-slate-500 font-semibold">${mun} &bull; Ano-base ${ultimoAno}</span>
        </div>
        <p class="mb-0 text-slate-700 leading-relaxed text-sm">
            No ano mais recente disponível (<strong>${ultimoAno}</strong>), o indicador <strong>${nomeExib}</strong> de <strong>${mun}</strong> atingiu a marca de <strong>${formatarValor(ultimoVal)}</strong>.${textoVar}${textoRank}
        </p>
        ${refTexto}
    `);
}

function renderGraficoLinhaModalMun(anos, valores, nomeExib, mun, isPct, isMoeda, isIndice) {
    const dom = document.getElementById('modal_ficha_chart_serie');
    if (!dom) return;

    if (chartModalFichaSerie) chartModalFichaSerie.dispose();
    chartModalFichaSerie = echarts.init(dom);

    if (!anos.length) {
        chartModalFichaSerie.clear();
        return;
    }

    const formatarEixo = (val) => {
        if (isPct) return val + '%';
        if (isMoeda) {
            if (val >= 1e6) return 'R$ ' + (val / 1e6).toFixed(1) + 'M';
            if (val >= 1e3) return 'R$ ' + (val / 1e3).toFixed(0) + 'k';
            return 'R$ ' + val;
        }
        return val;
    };

    chartModalFichaSerie.setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const item = params[0];
                let v = Number(item.value);
                let vFmt = isPct ? v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%' 
                         : (isMoeda ? 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                         : (isIndice ? v.toFixed(3) : v.toLocaleString('pt-BR')));
                return `<strong>${mun} (${item.name})</strong><br/>${nomeExib}: <strong>${vFmt}</strong>`;
            }
        },
        grid: { left: '3%', right: '5%', bottom: '10%', top: '15%', containLabel: true },
        xAxis: { type: 'category', data: anos, boundaryGap: false, axisLabel: { fontWeight: 'bold' } },
        yAxis: { type: 'value', axisLabel: { formatter: formatarEixo } },
        series: [{
            name: nomeExib,
            type: 'line',
            data: valores,
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 3.5, color: '#ff5a26' },
            itemStyle: { color: '#ff5a26' },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(12, 40, 86, 0.35)' },
                    { offset: 1, color: 'rgba(12, 40, 86, 0.02)' }
                ])
            }
        }]
    });
}

function renderGraficoBarrasModalMun(rankingArr, munAlvo, nomeExib, rdNome, isPct, isMoeda, isIndice, ano) {
    const dom = document.getElementById('modal_ficha_chart_ranking');
    if (!dom) return;

    if (chartModalFichaRanking) chartModalFichaRanking.dispose();
    chartModalFichaRanking = echarts.init(dom);

    const tituloEl = document.getElementById('modal_ficha_ranking_titulo');
    if (tituloEl) {
        tituloEl.innerHTML = `<i class="fas fa-chart-bar text-purple-600"></i> Comparativo Regional ${rdNome ? '— RD ' + rdNome : ''} ${ano ? '(' + ano + ')' : ''}`;
    }

    if (!rankingArr || rankingArr.length === 0) {
        chartModalFichaRanking.clear();
        return;
    }

    const normTextMun = (s) => String(s || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const dadosReversos = [...rankingArr].reverse();
    const categorias = dadosReversos.map(d => d.municipio);
    const valores = dadosReversos.map(d => {
        const isAlvo = normTextMun(d.municipio) === normTextMun(munAlvo);
        const cor = isAlvo ? '#ff5a26' : '#94A3B8';
        return {
            value: d.valor,
            itemStyle: {
                color: cor,
                borderRadius: [0, 4, 4, 0]
            }
        };
    });

    const formatarEixo = (val) => {
        if (isPct) return val + '%';
        if (isMoeda) {
            if (val >= 1e6) return 'R$ ' + (val / 1e6).toFixed(1) + 'M';
            if (val >= 1e3) return 'R$ ' + (val / 1e3).toFixed(0) + 'k';
            return 'R$ ' + val;
        }
        return val;
    };

    chartModalFichaRanking.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params) {
                const item = params[0];
                let v = Number(item.value);
                let vFmt = isPct ? v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%' 
                         : (isMoeda ? 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                         : (isIndice ? v.toFixed(3) : v.toLocaleString('pt-BR')));
                return `<strong>${item.name}</strong><br/>${nomeExib}: <strong>${vFmt}</strong>`;
            }
        },
        grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
        xAxis: { type: 'value', axisLabel: { formatter: formatarEixo } },
        yAxis: { type: 'category', data: categorias, axisLabel: { fontSize: 11, fontWeight: 'bold' } },
        series: [{
            type: 'bar',
            data: valores,
            barMaxWidth: 24
        }]
    });
}



/* ==========================================================================
   ANÁLISES TEMÁTICAS - PAUTA 1: PERNAMBUCO SEM FOME (COZINHAS, MÃES & COFINANCIAMENTO)
   ========================================================================== */

let cozinhasPorMunCache = null;

window.atualizarKpisProgramasMunicipais = async function(nomeMun, codIbge) {
    if (!nomeMun) return;
    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const targetMun = norm(nomeMun);
    const targetIbge = String(codIbge || '').trim();

    const formataBi = (v) => {
        if (!v || v === 0) return "R$ 0";
        if (v >= 1e9) return "R$ " + (v / 1e9).toFixed(2).replace('.', ',') + " Bi";
        if (v >= 1e6) return "R$ " + (v / 1e6).toFixed(2).replace('.', ',') + " Mi";
        return "R$ " + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    };

    const fetchJson = async (endpoint) => {
        try {
            const res = await fetch(`${window.basePath || ''}/${endpoint}`.replace(/\/+/g, '/'));
            if (res.ok) return await res.json();
        } catch(e) {}
        return null;
    };

    // 1. ÁGUAS (COMPESA & APAC)
    if (!window.cacheResumoAguas) {
        window.cacheResumoAguas = await fetchJson('municipios/resumo/aguas');
    }
    let totAguaVal = 0, totAguaQtd = 0;
    if (window.cacheResumoAguas) {
        if (window.cacheResumoAguas.municipios) {
            const filtrados = window.cacheResumoAguas.municipios.filter(m => norm(m.municipio) === targetMun);
            filtrados.forEach(f => {
                totAguaVal += (Number(f.valor_rateado_m) || 0) * 1e6;
                totAguaQtd++;
            });
        }

        // Buscar indicadores do Plano de Investimentos COMPESA por Município
        const plano = window.cacheResumoAguas.plano;
        let munCompesa = null;

        if (plano && plano.mapa_municipios_camadas) {
            munCompesa = plano.mapa_municipios_camadas.find(m => {
                const mIbge = String(m.ibge6 || m.codarea || '').trim();
                const mNome = norm(m.municipio || '');
                return (targetIbge && mIbge && (mIbge === targetIbge || mIbge.startsWith(targetIbge) || targetIbge.startsWith(mIbge))) ||
                       (targetMun && mNome && mNome === targetMun);
            });
        }
        if (!munCompesa && window.cacheResumoAguas.geojson && window.cacheResumoAguas.geojson.features) {
            const feat = window.cacheResumoAguas.geojson.features.find(f => {
                if (!f.geometry || !f.geometry.type.includes('Polygon')) return false;
                const p = f.properties || {};
                const mIbge = String(p.ibge6 || p.codarea || '').trim();
                const mNome = norm(p.municipio || '');
                return (targetIbge && mIbge && (mIbge === targetIbge || mIbge.startsWith(targetIbge) || targetIbge.startsWith(mIbge))) ||
                       (targetMun && mNome && mNome === targetMun);
            });
            if (feat) munCompesa = feat.properties;
        }

        if (munCompesa) {
            // Badges Executivos da Ficha Municipal
            const bAtual = document.getElementById('ficha_compesa_badge_rodizio_atual');
            if (bAtual) {
                const val = munCompesa['Rodízio atual'] || '-';
                const cor = munCompesa['Rodízio atual (Cor)'] || '#475569';
                bAtual.innerText = val;
                bAtual.setAttribute('style', `background-color: ${cor}18 !important; color: ${cor} !important; border: 1.5px solid ${cor}55 !important; font-weight: 800;`);
            }

            const bPos = document.getElementById('ficha_compesa_badge_rodizio_pos');
            if (bPos) {
                const val = munCompesa['Rodízio pós obras'] || '-';
                const cor = munCompesa['Rodízio pós obras (Cor)'] || '#10b981';
                bPos.innerText = val;
                bPos.setAttribute('style', `background-color: ${cor}18 !important; color: ${cor} !important; border: 1.5px solid ${cor}55 !important; font-weight: 800;`);
            }

            const bSitC2 = document.getElementById('ficha_compesa_badge_sit_c2');
            if (bSitC2) {
                const val = munCompesa['Situação C2 (com obras)'] || '-';
                const cor = munCompesa['Situação C2 (com obras) (Cor)'] || '#0284c7';
                bSitC2.innerText = val;
                bSitC2.setAttribute('style', `background-color: ${cor}18 !important; color: ${cor} !important; border: 1.5px solid ${cor}55 !important; font-weight: 800;`);
            }

            const bCatConc = document.getElementById('ficha_compesa_badge_cat_concessao');
            if (bCatConc) {
                const cat = munCompesa['Categoria (A/B/C)'] || '-';
                const conc = munCompesa['Concessão'] || '-';
                bCatConc.innerText = `${cat} · ${conc}`;
            }

            // Alerta de Déficit BNDES
            const contBndes = document.getElementById('ficha_compesa_container_bndes');
            const txtBndes = document.getElementById('ficha_compesa_txt_bndes');
            const bndesItem = plano && plano.municipios_deficit_bndes 
                ? plano.municipios_deficit_bndes.find(b => norm(b['Município']) === targetMun)
                : null;

            if (contBndes && txtBndes) {
                if (bndesItem) {
                    contBndes.classList.remove('d-none');
                    const defTxt = bndesItem['Maior déficit (Original)'] || `${bndesItem['Maior déficit']} L/s`;
                    const anoTxt = bndesItem['1º ano'] || '2026';
                    const intervTxt = bndesItem['Intervenção'] || 'Ajustes operacionais';
                    txtBndes.innerHTML = `Município prioritário na carteira BNDES com déficit hídrico persistente de <b>${defTxt}</b> previsto a partir de <b>${anoTxt}</b>. Intervenção proposta: <b>${intervTxt}</b>.`;
                } else {
                    contBndes.classList.add('d-none');
                }
            }

            // Intervenções do Portfólio COMPESA no Município
            const countProjs = document.getElementById('ficha_compesa_count_projetos');
            const listaProjs = document.getElementById('ficha_compesa_lista_projetos');

            const allProjs = (plano && plano.portfolio_projetos) || (window.cacheResumoAguas && window.cacheResumoAguas.projetos) || [];
            const projsMun = allProjs.filter(p => {
                const mAtend = norm(p['Municípios Atendidos'] || p.municipio || p.municipios_atendidos || '');
                return mAtend.includes(targetMun);
            });

            if (totAguaQtd === 0 && projsMun.length > 0) {
                totAguaQtd = projsMun.length;
                projsMun.forEach(p => {
                    const val = (Number(p['Valor LOA (R$ M)'] || p.valor_total_m || p.valor_loa_r_m || 0)) * 1e6;
                    totAguaVal += val;
                });
            }

            if (listaProjs) {
                if (countProjs) {
                    countProjs.innerText = `${projsMun.length} intervenç${projsMun.length === 1 ? 'ão' : 'ões'}`;
                }

                if (projsMun.length > 0) {
                    let pHtml = '';
                    projsMun.slice(0, 8).forEach(p => {
                        const nome = p['Nome do Projeto'] || p.nome_do_projeto || 'Projeto';
                        const status = p['Status'] || p.status || '-';
                        const val = Number(p['Valor LOA (R$ M)'] || p.valor_total_m) || 0;
                        const exec = Number(p['Executado (%)'] || p.percentual_executado) || 0;
                        let badgeCls = 'bg-slate-100 text-slate-700';
                        if (status.toLowerCase().includes('conclu')) badgeCls = 'bg-emerald-100 text-emerald-800';
                        else if (status.toLowerCase().includes('andamento')) badgeCls = 'bg-sky-100 text-sky-800';
                        else if (status.toLowerCase().includes('licita')) badgeCls = 'bg-amber-100 text-amber-800';
                        else if (status.toLowerCase().includes('fazer') || status.toLowerCase().includes('iniciar')) badgeCls = 'bg-indigo-100 text-indigo-800';

                        pHtml += `
                            <div class="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs hover:border-blue-300 transition-all">
                                <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                                    <div class="font-bold text-slate-800 text-xs leading-tight">${nome}</div>
                                    <span class="badge ${badgeCls} rounded-pill text-[10px] font-bold px-2 py-0.5 flex-shrink-0">${status}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center text-[11px] text-slate-500 mt-1">
                                    <span>Valor LOA: <b class="text-slate-700">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M</b></span>
                                    <span>Execução: <b class="text-slate-700">${Math.round(exec)}%</b></span>
                                </div>
                            </div>
                        `;
                    });
                    if (projsMun.length > 8) {
                        pHtml += `<div class="text-center text-[11px] text-slate-400 mt-1 font-bold">+ ${projsMun.length - 8} outros projetos regionais</div>`;
                    }
                    listaProjs.innerHTML = pHtml;
                } else {
                    listaProjs.innerHTML = `
                        <div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-slate-400 italic text-xs">
                            Nenhuma obra direta individual mapeada no município (atendimento via sistemas adutores regionais).
                        </div>
                    `;
                }
            }
        }

        // 1.1 MANANCIAIS / RESERVATÓRIOS APAC NO MUNICÍPIO E NA BACIA
        const apacCont = document.getElementById('ficha_container_apac_manancial');
        if (apacCont) {
            try {
                if (!window.cacheApacReservatorios) {
                    const r = await fetch(`${window.basePath || ''}/data/apac_reservatorios.json`.replace(/\/+/g, '/'));
                    if (r.ok) window.cacheApacReservatorios = await r.json();
                }
                if (!window.cacheApacMunicipioBacia) {
                    const r = await fetch(`${window.basePath || ''}/data/apac_municipio_bacia.json`.replace(/\/+/g, '/'));
                    if (r.ok) window.cacheApacMunicipioBacia = await r.json();
                }
                if (!window.cacheApacBaciasResumo) {
                    const r = await fetch(`${window.basePath || ''}/data/apac_bacias_resumo.json`.replace(/\/+/g, '/'));
                    if (r.ok) window.cacheApacBaciasResumo = await r.json();
                }
            } catch (e) {
                console.warn("[APAC Ficha] Erro ao carregar dados:", e);
            }

            try {
                const apacBadge = document.getElementById('ficha_apac_badge_status');
                const apacBaciaNome = document.getElementById('ficha_apac_bacia_nome');
                const apacBaciaStatus = document.getElementById('ficha_apac_bacia_status');
                const apacBaciaAcumulacao = document.getElementById('ficha_apac_bacia_acumulacao');
                const apacBaciaFaixa = document.getElementById('ficha_apac_bacia_faixa');
                const apacMunCount = document.getElementById('ficha_apac_mun_reservatorios_count');
                const apacTxt = document.getElementById('ficha_apac_txt_detalhes');

                // Identificar bacia do município
                let baciaNome = null;
                if (window.cacheApacMunicipioBacia) {
                    if (window.cacheApacMunicipioBacia[nomeMun]) {
                        baciaNome = window.cacheApacMunicipioBacia[nomeMun];
                    } else {
                        const kFound = Object.keys(window.cacheApacMunicipioBacia).find(k => norm(k) === targetMun);
                        if (kFound) baciaNome = window.cacheApacMunicipioBacia[kFound];
                    }
                }

                let resMunList = [];
                if (window.cacheApacReservatorios && Array.isArray(window.cacheApacReservatorios)) {
                    resMunList = window.cacheApacReservatorios.filter(r => norm(r.nome_municipio) === targetMun);
                    if (!baciaNome && resMunList.length > 0 && resMunList[0].baciahidrografica) {
                        baciaNome = resMunList[0].baciahidrografica;
                    }
                }

                // Localizar dados da bacia
                let baciaInfo = null;
                if (baciaNome && window.cacheApacBaciasResumo && Array.isArray(window.cacheApacBaciasResumo)) {
                    const bNorm = norm(baciaNome);
                    baciaInfo = window.cacheApacBaciasResumo.find(b => norm(b.nome_bacia) === bNorm || norm(b.up || '').includes(bNorm));
                }

                if (apacBaciaNome) {
                    apacBaciaNome.innerText = baciaNome ? `Bacia do ${baciaNome}` : 'Rede Hidrográfica Regional';
                }
                if (apacBaciaStatus) {
                    apacBaciaStatus.innerText = baciaInfo ? `${baciaInfo.total_reservatorios} mananciais monitorados` : 'Monitoramento APAC';
                }

                if (apacBaciaAcumulacao) {
                    if (baciaInfo && baciaInfo.percentual_armazenado !== null && !isNaN(baciaInfo.percentual_armazenado)) {
                        apacBaciaAcumulacao.innerText = `${baciaInfo.percentual_armazenado.toFixed(1)}%`;
                        apacBaciaAcumulacao.style.color = baciaInfo.cor_bacia || '#0284c7';
                    } else {
                        apacBaciaAcumulacao.innerText = '27,8%'; // média estadual de referência
                        apacBaciaAcumulacao.style.color = '#f59e0b';
                    }
                }
                if (apacBaciaFaixa) {
                    apacBaciaFaixa.innerText = baciaInfo ? (baciaInfo.status_bacia || 'Volume Operacional') : 'Média Geral PE (27,8%)';
                }

                if (apacMunCount) {
                    apacMunCount.innerText = `${resMunList.length} manancial(is)`;
                }

                if (apacBadge) {
                    if (resMunList.length > 0) {
                        const prim = resMunList[0];
                        apacBadge.innerText = prim.faixa_rotulo || 'Manancial no Território';
                        apacBadge.setAttribute('style', `background-color: ${prim.faixa_cor || '#0284c7'}18 !important; color: ${prim.faixa_cor || '#0284c7'} !important; border: 1.5px solid ${prim.faixa_cor || '#0284c7'}55 !important; font-weight: 800;`);
                    } else if (baciaInfo && baciaInfo.status_bacia) {
                        apacBadge.innerText = baciaInfo.status_bacia;
                        apacBadge.setAttribute('style', `background-color: ${baciaInfo.cor_bacia || '#0284c7'}18 !important; color: ${baciaInfo.cor_bacia || '#0284c7'} !important; border: 1.5px solid ${baciaInfo.cor_bacia || '#0284c7'}55 !important; font-weight: 800;`);
                    } else {
                        apacBadge.innerText = 'Rede Integrada APAC';
                        apacBadge.setAttribute('style', 'background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; font-weight: 800;');
                    }
                }

                if (apacTxt) {
                    let htmlDesc = '';
                    if (resMunList.length > 0) {
                        htmlDesc = `<b>Manancial(is) no Território:</b><br/>`;
                        resMunList.forEach(r => {
                            htmlDesc += `• <b>${r.nome_reservatorio}</b>: Armazenando <b>${r.per_volume}%</b> (${r.volumeatual_m.toLocaleString('pt-BR')} de ${r.capacidade_m.toLocaleString('pt-BR')} Mi m³) — <span style="color:${r.faixa_cor};font-weight:bold;">${r.faixa_rotulo}</span>. Finalidade: ${r.usoprincipal}.<br/>`;
                        });
                    } else if (baciaInfo) {
                        htmlDesc = `<b>Abastecimento e Recursos Hídricos Regionais:</b><br/>O município integra a <b>Bacia Hidrográfica do ${baciaNome}</b>, que opera com <b>${baciaInfo.percentual_armazenado !== null ? baciaInfo.percentual_armazenado.toFixed(1) + '%' : 'dados regionais'}</b> de sua capacidade acumulada (${baciaInfo.volume_total_m.toFixed(1)} de ${baciaInfo.capacidade_total_m.toFixed(1)} Mi m³). O atendimento municipal é suportado pelos sistemas integrados adutores e mananciais estratégicos monitorados pela APAC na bacia.`;
                    } else {
                        htmlDesc = `<b>Monitoramento Hídrico Geral (APAC):</b><br/>Pernambuco acumula atualmente cerca de <b>27,8%</b> de sua capacidade máxima nos 99 reservatórios estratégicos monitorados pela APAC (911,7 Mi m³ outorgados), sob regimes diferenciados de operação e contingência do plano hídrico.`;
                    }
                    apacTxt.innerHTML = htmlDesc;
                }
            } catch (errApacRender) {
                console.error("[APAC Ficha] Erro ao renderizar blocos APAC:", errApacRender);
                const apacBadge = document.getElementById('ficha_apac_badge_status');
                if (apacBadge) {
                    apacBadge.innerText = 'Rede Integrada APAC';
                    apacBadge.setAttribute('style', 'background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; font-weight: 800;');
                }
            }
        }
    }

    // 2. COZINHAS & COFINANCIAMENTO
    if (!window.cacheResumoCozinhas) {
        window.cacheResumoCozinhas = await fetchJson('municipios/resumo/cozinhas');
    }
    let totCoz = 0, funcCoz = 0, totCofinVal = 0;
    if (window.cacheResumoCozinhas) {
        const cozList = window.cacheResumoCozinhas.cozinhas || [];
        cozList.forEach(c => {
            const cMun = norm(c.municipio);
            const cIbge = String(c.cod_ibge || '').trim();
            if ((targetIbge && cIbge && (cIbge === targetIbge || cIbge.startsWith(targetIbge) || targetIbge.startsWith(cIbge))) ||
                (targetMun && cMun && (cMun === targetMun || cMun.includes(targetMun) || targetMun.includes(cMun)))) {
                totCoz++;
                if ((c.status_funcionamento || '').includes('Funcionamento')) funcCoz++;
            }
        });

        const cofinList = window.cacheResumoCozinhas.cofinanciamento_muns || [];
        const itemCofin = cofinList.find(c => {
            const cMun = norm(c.municipio);
            return cMun === targetMun || cMun.includes(targetMun) || targetMun.includes(cMun);
        });
        if (itemCofin) {
            totCofinVal = Number(itemCofin.valor_validado) || Number(itemCofin.valor_pago) || 0;
        }
    }

    // 3. ESTRADAS DE PE
    if (!window.cacheResumoEstradas) {
        window.cacheResumoEstradas = await fetchJson('municipios/resumo/estradas');
    }
    let totEstradasQtd = 0;
    if (window.cacheResumoEstradas && window.cacheResumoEstradas.obras) {
        totEstradasQtd = window.cacheResumoEstradas.obras.filter(o => norm(o.municipio) === targetMun).length;
    }

    // A. VULNERABILIDADE SOCIAL
    $('#ficha_kpi_vuln_cozinhas').text(totCoz > 0 ? totCoz.toLocaleString('pt-BR') : "-");
    $('#ficha_ano_vuln_cozinhas').html(window.montarRodapeKPI('Unidades', '2024', null, 'cozinhas'));
    $('#ficha_kpi_vuln_cofin').text(totCofinVal > 0 ? formataBi(totCofinVal) : "-");
    $('#ficha_ano_vuln_cofin').html(window.montarRodapeKPI('Investimento', '2024', null, 'cofinanciamento'));

    // B. CONDIÇÕES HABITACIONAIS (ÁGUAS)
    $('#ficha_kpi_hab_aguas_val').text(totAguaVal > 0 ? formataBi(totAguaVal) : "-");
    $('#ficha_ano_hab_aguas_val').html(window.montarRodapeKPI('Investimento Compesa', '2024', null, 'investimento_agua'));
    $('#ficha_kpi_hab_aguas_qtd').text(totAguaQtd > 0 ? totAguaQtd.toLocaleString('pt-BR') : "-");
    $('#ficha_ano_hab_aguas_qtd').html(window.montarRodapeKPI('Intervenções Hídricas', '2024', null, 'obras_agua'));

    // C. INICIATIVAS DE DESENVOLVIMENTO REGIONAL
    $('#ficha_kpi_ini_aguas_val').text(totAguaVal > 0 ? formataBi(totAguaVal) : "-");
    $('#ficha_kpi_ini_aguas_qtd').text(totAguaQtd > 0 ? totAguaQtd.toLocaleString('pt-BR') : "-");
    $('#ficha_kpi_ini_cofin_val').text(totCofinVal > 0 ? formataBi(totCofinVal) : "-");
    $('#ficha_kpi_ini_estradas_qtd').text(totEstradasQtd > 0 ? totEstradasQtd.toLocaleString('pt-BR') : "-");
    $('#ficha_kpi_ini_cozinhas').text(totCoz > 0 ? totCoz.toLocaleString('pt-BR') : "0");
    $('#ficha_kpi_ini_cozinhas_sub').text(totCoz > 0 ? `${funcCoz} em funcionamento` : 'Segurança Alimentar');
};

window.atualizarKpiCozinhasMunicipio = function(nomeMun, codIbge) {
    window.atualizarKpisProgramasMunicipais(nomeMun, codIbge);
};

let mapResumoCozinhas = null;
window.cacheResumoCozinhas = null;
let cacheResumoCozinhas = null;
let chartResumoCozinhasMuns = null;
let chartCofinSerieHistorica = null;
let chartCofinPorMun = null;
window.visaoSemFomeAtiva = 'cozinhas';

// Variável de controle do município travado/fixo
window.municipioFixoSemFome = null;

// Função para destravar/fechar o município fixo
window.desafixarMunicipioSemFome = function() {
    window.municipioFixoSemFome = null;
    atualizarHoverBoxSemFome(null, null, true);
};

function atualizarHoverBoxSemFome(tipo, props, forcarAtualizacao = false) {
    // Se estiver fixado e não for uma ação forçada (clique ou botão fechar), ignora os hovers
    if (window.municipioFixoSemFome && !forcarAtualizacao) {
        return;
    }

    const boxDefault = document.getElementById('sem_fome_box_content_default');
    const boxActive = document.getElementById('sem_fome_box_content_active');
    if (!boxActive || !boxDefault) return;

    if (!tipo || !props) {
        boxActive.classList.add('d-none');
        boxActive.classList.remove('d-flex');
        boxDefault.classList.remove('d-none');
        return;
    }

    boxDefault.classList.add('d-none');
    boxActive.classList.remove('d-none');
    boxActive.classList.add('d-flex');

    if (tipo === 'municipio') {
        const valMaesFmt = props.valor_maes ? `R$ ${(Number(props.valor_maes) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
        const valCofinPagoFmt = props.valor_cofin_pago ? `R$ ${(Number(props.valor_cofin_pago) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
        const valCofinValFmt = props.valor_cofin_validado ? `R$ ${(Number(props.valor_cofin_validado) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
        const pctCofin = (props.pct_cofin !== undefined && props.pct_cofin !== null) ? Number(props.pct_cofin).toFixed(1) + '%' : '-';

        const ivcadFmt = props.ivcad ? Number(props.ivcad).toFixed(3).replace('.', ',') : '-';
        const ivcadNcFmt = props.ivcad_nc ? Number(props.ivcad_nc).toFixed(3).replace('.', ',') : '-';
        const ivcadPondFmt = (props.ivcad_nc_ponderado !== undefined && props.ivcad_nc_ponderado !== null) 
            ? Number(props.ivcad_nc_ponderado).toFixed(3).replace('.', ',') : '-';
        const taxaMaesFmt = props.taxa_maes 
            ? Number(props.taxa_maes).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-';
        const cadPessoasFmt = props.cad_pessoas ? Number(props.cad_pessoas).toLocaleString('pt-BR') : '-';

        const isFixo = Boolean(window.municipioFixoSemFome);

        boxActive.innerHTML = `
            <div class="border-b border-slate-200 pb-2 mb-2">
                <div class="d-flex justify-content-between align-items-center mb-0.5">
                    <span class="badge ${isFixo ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'} text-[10px] font-bold rounded-pill px-2 py-0.5">
                        <i class="fas ${isFixo ? 'fa-thumbtack text-amber-600' : 'fa-location-dot text-primary'} me-1"></i> ${isFixo ? 'MUNICÍPIO FIXADO' : (props.regiao_de_desenvolvimento || 'Pernambuco')}
                    </span>
                    ${isFixo ? `
                        <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2 text-[10px] font-bold" onclick="window.desafixarMunicipioSemFome()" title="Liberar e voltar ao modo hover">
                            <i class="fas fa-xmark me-1"></i>Desafixar
                        </button>
                    ` : `
                        <span class="text-[10px] text-slate-400 font-semibold">Clique para fixar</span>
                    `}
                </div>
                <h4 class="font-black text-slate-800 text-base mb-0 tracking-tight leading-tight">${props.municipio}</h4>
            </div>

            <div class="space-y-2 flex-1 overflow-y-auto pr-1" style="max-height: 480px;">
                <!-- CARD 1: VULNERABILIDADE A CUIDADOS & IVCAD -->
                <div class="bg-gradient-to-br from-indigo-50/90 to-purple-50/70 border border-indigo-200 rounded-xl p-2.5 shadow-xs">
                    <div class="d-flex justify-content-between align-items-center mb-1.5">
                        <span class="text-xs font-bold text-indigo-900">
                            <i class="fas fa-shield-heart text-indigo-600 me-1"></i> Vulnerabilidade a Cuidados
                        </span>
                        <span class="badge bg-indigo-600 text-white font-black text-xs px-2 py-0.5 rounded-pill shadow-xs" title="Posição relativa: 1º menor vulnerabilidade corrigida">
                            ${props.rank_ivcad_nc_ponderado ? props.rank_ivcad_nc_ponderado + 'º de 185' : '-'}
                        </span>
                    </div>

                    <div class="bg-white/90 rounded-lg p-2 border border-indigo-100 mb-1.5">
                        <div class="d-flex justify-content-between align-items-baseline">
                            <span class="text-[11px] font-medium text-slate-600">Índice Ponderado (Corrigido):</span>
                            <span class="text-sm font-black text-indigo-700">${ivcadPondFmt}</span>
                        </div>
                        <div class="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            IVCAD NC original: <b>${ivcadNcFmt}</b> (${props.rank_ivcad_nc || '-'}º) mitigado por Mães de PE.
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-1 border-t border-indigo-100/80 text-[11px]">
                        <span class="text-slate-600">IVCAD Geral:</span>
                        <span class="font-bold text-slate-800">${ivcadFmt} <span class="badge bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.5 ml-1">${props.rank_ivcad ? props.rank_ivcad + 'º' : '-'}</span></span>
                    </div>
                </div>

                <!-- CARD 2: MÃES DE PERNAMBUCO & TAXA POR CADÚNICO -->
                <div class="bg-pink-50/70 border border-pink-200 rounded-xl p-2.5">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-xs font-bold text-pink-800"><i class="fas fa-person-breastfeeding me-1"></i> Mães de Pernambuco</span>
                        <span class="badge bg-pink-600 text-white font-black text-xs">${(Number(props.qtd_maes) || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center text-[11px] text-pink-900/90 mb-1">
                        <span>Investimento:</span>
                        <strong>${valMaesFmt}</strong>
                    </div>
                    <div class="bg-white/85 rounded-lg p-1.5 border border-pink-100 text-[11px]">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-slate-600 font-medium">Taxa p/ 100k CadÚnico:</span>
                            <span class="badge bg-pink-100 text-pink-800 font-bold">${props.rank_taxa_maes ? props.rank_taxa_maes + 'º lugar' : '-'}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-baseline mt-0.5">
                            <span class="font-bold text-pink-700">${taxaMaesFmt} <span class="text-[10px] text-slate-400 font-normal">/ 100k</span></span>
                            <span class="text-[10px] text-slate-500">${cadPessoasFmt} no CadÚnico</span>
                        </div>
                    </div>
                </div>

                <!-- CARD 3: COZINHAS COMUNITÁRIAS -->
                <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-xs font-bold text-amber-800"><i class="fas fa-utensils me-1"></i> Cozinhas Comunitárias</span>
                        <span class="badge bg-amber-600 text-white font-black text-xs">${props.qtd_cozinhas || 0}</span>
                    </div>
                    <div class="text-[11px] text-amber-900/90">
                        ${props.qtd_cozinhas > 0 ? `<strong>${props.qtd_cozinhas_func || 0}</strong> em funcionamento` : 'Nenhuma unidade implantada'}
                    </div>
                </div>

                <!-- CARD 4: COFINANCIAMENTO SAS -->
                <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-xs font-bold text-blue-800"><i class="fas fa-hand-holding-dollar me-1"></i> Cofinanciamento SAS</span>
                        <span class="badge bg-blue-600 text-white font-bold text-[10px]">${pctCofin} pago</span>
                    </div>
                    <div class="text-[11px] text-blue-900/90 mb-0.5">
                        Pago: <strong>${valCofinPagoFmt}</strong>
                    </div>
                    <div class="text-[10px] text-slate-500">
                        Validado: ${valCofinValFmt}
                    </div>
                </div>
                
                <!-- CARD 5: PROGRAMA CHAPÉU DE PALHA -->
                <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-xs font-bold text-amber-800"><i class="fas fa-wheat-awn me-1"></i> Chapéu de Palha</span>
                        <span class="badge bg-amber-600 text-white font-black text-xs">${(Number(props.pcp_beneficiarios) || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="text-[11px] text-amber-900/90">
                        Pago: <strong>R$ ${(Number(props.pcp_valor_pago) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                </div>
            </div>

            <div class="pt-2 border-t border-slate-200 text-slate-400 text-[10px] text-center mt-2">
                ${isFixo ? 'Clique em outro município ou em "Desafixar" para liberar o painel' : 'Passe o cursor sobre os municípios ou clique em um para fixar'}
            </div>
        `;
    } else if (tipo === 'cozinha') {
        let badgeColor = 'bg-slate-100 text-slate-700';
        const sf = props.status_funcionamento || '';
        if (sf.includes('Funcionamento')) badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (sf.includes('Implanta')) badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (sf.includes('Pactua')) badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
        else if (sf.includes('aderiu')) badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';

        boxActive.innerHTML = `
            <div class="border-b border-slate-200 pb-2 mb-2.5">
                <span class="badge border ${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-pill mb-1 d-inline-block">
                    ● ${props.status_funcionamento}
                </span>
                <h5 class="font-black text-slate-800 text-base mb-0 leading-tight">${props.nome_equipamento}</h5>
            </div>

            <div class="space-y-2 flex-1 overflow-y-auto pr-1">
                <div class="bg-white border border-slate-200 rounded-xl p-2.5">
                    <div class="text-xs text-slate-700 mb-1">
                        <i class="fas fa-map-marker-alt text-amber-500 me-1"></i><strong>${props.municipio}</strong>
                        ${props.regiao_de_desenvolvimento ? ` • <span class="text-slate-400">${props.regiao_de_desenvolvimento}</span>` : ''}
                    </div>
                    ${props.endereco ? `<div class="text-xs text-slate-500 border-t border-slate-100 pt-1 mt-1"><i class="fas fa-location-dot me-1 text-slate-400"></i>${props.endereco}</div>` : ''}
                </div>

                <div class="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 leading-relaxed">
                    <span class="font-bold block text-amber-950 mb-1"><i class="fas fa-utensils me-1"></i> Equipamento de Segurança Alimentar</span>
                    Unidade de preparo e distribuição gratuita de refeições nutricionais para famílias em vulnerabilidade social.
                </div>
            </div>

            <div class="pt-2 border-t border-slate-200 text-slate-400 text-[10px] text-center mt-2">
                Passe o cursor sobre outro ponto ou município
            </div>
        `;
    }
}
window.alternarVisaoSemFome = function (visao, btn) {
    window.visaoSemFomeAtiva = visao || 'cozinhas';

    const btnCozinhas = document.getElementById('btn_visao_sem_fome_cozinhas');
    const btnMaes = document.getElementById('btn_visao_sem_fome_maes');
    const btnPcp      = document.getElementById('btn_visao_sem_fome_pcp');
    const btnCofin = document.getElementById('btn_visao_sem_fome_cofin');
    const btnIvcad = document.getElementById('btn_visao_sem_fome_ivcad');

    const legCozinhas = document.getElementById('legenda_visao_cozinhas');
    const legMaes = document.getElementById('legenda_visao_maes');
    const legPcp      = document.getElementById('legenda_visao_pcp');
    const legCofin = document.getElementById('legenda_visao_cofin');
    const legIvcad = document.getElementById('legenda_visao_ivcad');
    const lblCamada = document.getElementById('sem_fome_camada_label');

    // Reseta botões
    [btnCozinhas, btnMaes, btnPcp, btnCofin, btnIvcad].forEach(b => {
        if (b) {
            b.classList.remove('btn-primary', 'text-white', 'shadow-sm');
            b.classList.add('btn-light', 'text-slate-600');
        }
    });

    // Reseta legendas
    [legCozinhas, legMaes, legPcp, legCofin, legIvcad].forEach(l => {
        if (l) l.classList.add('d-none');
    });

    if (window.visaoSemFomeAtiva === 'cozinhas') {
        if (btnCozinhas) {
            btnCozinhas.classList.remove('btn-light', 'text-slate-600');
            btnCozinhas.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (legCozinhas) legCozinhas.classList.remove('d-none');
        if (lblCamada) lblCamada.textContent = "Exibindo: Localização das Cozinhas Comunitárias";

        // Ajusta camadas no mapa
        if (mapResumoCozinhas && mapResumoCozinhas.isStyleLoaded()) {
            try {
                if (mapResumoCozinhas.getLayer('cozinhas_clusters')) mapResumoCozinhas.setLayoutProperty('cozinhas_clusters', 'visibility', 'visible');
                if (mapResumoCozinhas.getLayer('cozinhas_cluster_count')) mapResumoCozinhas.setLayoutProperty('cozinhas_cluster_count', 'visibility', 'visible');
                if (mapResumoCozinhas.getLayer('cozinhas_points')) mapResumoCozinhas.setLayoutProperty('cozinhas_points', 'visibility', 'visible');
                if (mapResumoCozinhas.getLayer('mun_choropleth_fill')) {
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-opacity', 0.05);
                }
            } catch(e) {}
        }
        atualizarGraficoSemFome('cozinhas');
    } else if (window.visaoSemFomeAtiva === 'maes') {
        if (btnMaes) {
            btnMaes.classList.remove('btn-light', 'text-slate-600');
            btnMaes.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (legMaes) legMaes.classList.remove('d-none');
        if (lblCamada) lblCamada.textContent = "Exibindo: Programa Mães de Pernambuco (Beneficiárias por Município)";

        // Ajusta camadas no mapa
        if (mapResumoCozinhas && mapResumoCozinhas.isStyleLoaded()) {
            try {
                if (mapResumoCozinhas.getLayer('cozinhas_clusters')) mapResumoCozinhas.setLayoutProperty('cozinhas_clusters', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_cluster_count')) mapResumoCozinhas.setLayoutProperty('cozinhas_cluster_count', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_points')) mapResumoCozinhas.setLayoutProperty('cozinhas_points', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('mun_choropleth_fill')) {
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-color', [
                        'step',
                        ['get', 'qtd_maes'],
                        '#fce7f3',
                        400, '#f472b6',
                        800, '#db2777',
                        1500, '#831843'
                    ]);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-opacity', 0.75);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_line', 'line-color', '#be185d');
                }
            } catch(e) {}
        }
        atualizarGraficoSemFome('maes');
    // =========================================================================
    // VISÃO: CHAPÉU DE PALHA
    // =========================================================================
    } else if (window.visaoSemFomeAtiva === 'pcp') {
        if (btnPcp) {
            btnPcp.classList.remove('btn-light', 'text-slate-600');
            btnPcp.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (legPcp) legPcp.classList.remove('d-none');
        if (lblCamada) lblCamada.textContent = "Exibindo: Programa Chapéu de Palha (Beneficiários por Município)";

        if (mapResumoCozinhas && mapResumoCozinhas.isStyleLoaded()) {
            try {
                if (mapResumoCozinhas.getLayer('cozinhas_clusters')) mapResumoCozinhas.setLayoutProperty('cozinhas_clusters', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_cluster_count')) mapResumoCozinhas.setLayoutProperty('cozinhas_cluster_count', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_points')) mapResumoCozinhas.setLayoutProperty('cozinhas_points', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('mun_choropleth_fill')) {
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-color', [
                        'step',
                        ['get', 'pcp_beneficiarios'],
                        '#f8fafc',    // 0 beneficiários (cinza claro neutro)
                        1, '#fef3c7',  // 1 - 100
                        100, '#f59e0b',// 100 - 500
                        500, '#d97706',// 500 - 1500
                        1500, '#78350f'// > 1500
                    ]);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-opacity', 0.80);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_line', 'line-color', '#b45309');
                }
            } catch(e) {}
        }
        atualizarGraficoSemFome('pcp');
    } else if (window.visaoSemFomeAtiva === 'cofin') {
        if (btnCofin) {
            btnCofin.classList.remove('btn-light', 'text-slate-600');
            btnCofin.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (legCofin) legCofin.classList.remove('d-none');
        if (lblCamada) lblCamada.textContent = "Exibindo: Cofinanciamento Estadual da Assistência Social (Valores Pagos)";

        // Ajusta camadas no mapa
        if (mapResumoCozinhas && mapResumoCozinhas.isStyleLoaded()) {
            try {
                if (mapResumoCozinhas.getLayer('cozinhas_clusters')) mapResumoCozinhas.setLayoutProperty('cozinhas_clusters', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_cluster_count')) mapResumoCozinhas.setLayoutProperty('cozinhas_cluster_count', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_points')) mapResumoCozinhas.setLayoutProperty('cozinhas_points', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('mun_choropleth_fill')) {
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-color', [
                        'step',
                        ['get', 'valor_cofin_pago'],
                        '#dbeafe',
                        10000000, '#60a5fa',
                        20000000, '#2563eb',
                        40000000, '#1e3a8a'
                    ]);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-opacity', 0.75);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_line', 'line-color', '#1d4ed8');
                }
            } catch(e) {}
        }
        atualizarGraficoSemFome('cofin');
    } else if (window.visaoSemFomeAtiva === 'ivcad') {
        if (btnIvcad) {
            btnIvcad.classList.remove('btn-light', 'text-slate-600');
            btnIvcad.classList.add('btn-primary', 'text-white', 'shadow-sm');
        }
        if (legIvcad) legIvcad.classList.remove('d-none');
        if (lblCamada) lblCamada.textContent = "Exibindo: Vulnerabilidade a Cuidados Corrigida (IVCAD NC Ponderado por Mães de PE)";

        // Ajusta camadas no mapa
        if (mapResumoCozinhas && mapResumoCozinhas.isStyleLoaded()) {
            try {
                if (mapResumoCozinhas.getLayer('cozinhas_clusters')) mapResumoCozinhas.setLayoutProperty('cozinhas_clusters', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_cluster_count')) mapResumoCozinhas.setLayoutProperty('cozinhas_cluster_count', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('cozinhas_points')) mapResumoCozinhas.setLayoutProperty('cozinhas_points', 'visibility', 'none');
                if (mapResumoCozinhas.getLayer('mun_choropleth_fill')) {
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-color', [
                        'step',
                        ['get', 'ivcad_nc_ponderado'],
                        '#e0e7ff',
                        0.10, '#818cf8',
                        0.18, '#4f46e5',
                        0.28, '#312e81'
                    ]);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_fill', 'fill-opacity', 0.75);
                    mapResumoCozinhas.setPaintProperty('mun_choropleth_line', 'line-color', '#3730a3');
                }
            } catch(e) {}
        }
        atualizarGraficoSemFome('ivcad');
    }
};

function atualizarGraficoSemFome(visao) {
    if (!cacheResumoCozinhas) return;
    const chartDom = document.getElementById('resumo_cozinhas_chart_muns');
    if (!chartDom || typeof echarts === 'undefined') return;

    const elTitle = document.getElementById('sem_fome_chart_title');
    const elSub = document.getElementById('sem_fome_chart_subtitle');
    const elBadge = document.getElementById('cozinhas_badge_total_muns');

    if (chartResumoCozinhasMuns) {
        try { chartResumoCozinhasMuns.dispose(); } catch(e) {}
    }
    chartResumoCozinhasMuns = echarts.init(chartDom);

    if (visao === 'cozinhas') {
        if (elTitle) elTitle.textContent = "Cozinhas Comunitárias por Município";
        if (elSub) elSub.textContent = "Top municípios com maior número de unidades do programa";
        if (elBadge) elBadge.innerHTML = `<i class="fas fa-utensils text-amber-500 me-1"></i> ${(cacheResumoCozinhas.kpis?.municipios_cobertos || 185)} Municípios Mapeados`;

        const munsCount = {};
        (cacheResumoCozinhas.cozinhas || []).forEach(c => {
            const m = c.municipio ? c.municipio.trim() : 'Não informado';
            munsCount[m] = (munsCount[m] || 0) + 1;
        });

        const sortedMuns = Object.entries(munsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 25)
            .reverse();

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    return `<strong>${p.name}</strong><br/>Cozinhas Comunitárias: <b>${p.value}</b>`;
                }
            },
            grid: { top: 20, bottom: 25, left: '4%', right: '8%', containLabel: true },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLabel: { color: '#64748b', fontSize: 11 },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: sortedMuns.map(item => item[0]),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 11 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Cozinhas',
                type: 'bar',
                data: sortedMuns.map(item => item[1]),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#f59e0b' },
                        { offset: 1, color: '#d97706' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 11,
                    color: '#78350f'
                }
            }]
        };
        chartResumoCozinhasMuns.setOption(option);
    } else if (visao === 'maes') {
        if (elTitle) elTitle.textContent = "Mães de Pernambuco por Município";
        if (elSub) elSub.textContent = "Top municípios com maior número de mães beneficiadas no programa";
        if (elBadge) elBadge.innerHTML = `<i class="fas fa-person-breastfeeding text-pink-500 me-1"></i> ${(cacheResumoCozinhas.kpis_maes?.total_municipios || 185)} Municípios Beneficiados`;

        const maesList = (cacheResumoCozinhas.maes || []).slice();
        const sortedMaes = maesList
            .sort((a, b) => (b.qtd_beneficiarias_total || 0) - (a.qtd_beneficiarias_total || 0))
            .slice(0, 25)
            .reverse();

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    const rawItem = sortedMaes.find(m => m.municipio === p.name);
                    const valInvest = rawItem ? `R$ ${(rawItem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
                    return `<strong>${p.name}</strong><br/>Mães Beneficiadas: <b>${p.value.toLocaleString('pt-BR')}</b><br/>Investimento Total: <b>${valInvest}</b>`;
                }
            },
            grid: { top: 20, bottom: 25, left: '4%', right: '10%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (v) => v >= 1e3 ? (v/1e3).toFixed(0) + 'k' : v
                },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: sortedMaes.map(item => item.municipio),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 11 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Mães Beneficiadas',
                type: 'bar',
                data: sortedMaes.map(item => item.qtd_beneficiarias_total),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#f472b6' },
                        { offset: 1, color: '#be185d' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 11,
                    color: '#831843',
                    formatter: (params) => Number(params.value).toLocaleString('pt-BR')
                }
            }]
        };
        chartResumoCozinhasMuns.setOption(option);
    } else if (visao === 'pcp') {
        if (elTitle) elTitle.textContent = "Chapéu de Palha por Município";
        if (elSub) elSub.textContent = "Top municípios com maior número de trabalhadores beneficiados no programa";
        if (elBadge) elBadge.innerHTML = `<i class="fas fa-wheat-awn text-amber-600 me-1"></i> ${(cacheResumoCozinhas.kpis_pcp?.municipios_cobertos || 0)} Municípios Atendidos`;

        // Agrupa beneficiários por município a partir de cacheResumoCozinhas.pcp
        const pcpMunTotals = {};
        (cacheResumoCozinhas.pcp || []).forEach(p => {
            const m = p.municipio ? p.municipio.trim() : '';
            if (!m) return;
            if (!pcpMunTotals[m]) pcpMunTotals[m] = { beneficiarios: 0, valor_pago: 0 };
            pcpMunTotals[m].beneficiarios += Number(p.numero_de_beneficiarios) || 0;
            pcpMunTotals[m].valor_pago += Number(p.valor_pago_no_municipio) || Number(p.valor_investido_no_municipio) || 0;
        });

        const sortedPcp = Object.entries(pcpMunTotals)
            .map(([mun, d]) => ({ municipio: mun, beneficiarios: d.beneficiarios, valor_pago: d.valor_pago }))
            .sort((a, b) => b.beneficiarios - a.beneficiarios)
            .slice(0, 25)
            .reverse();

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    const rawItem = sortedPcp.find(m => m.municipio === p.name);
                    const valInvest = rawItem ? `R$ ${(rawItem.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
                    return `<strong>${p.name}</strong><br/>Beneficiários: <b>${Number(p.value).toLocaleString('pt-BR')}</b><br/>Recurso Pago: <b>${valInvest}</b>`;
                }
            },
            grid: { top: 20, bottom: 25, left: '4%', right: '10%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (v) => v >= 1e3 ? (v/1e3).toFixed(0) + 'k' : v
                },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: sortedPcp.map(item => item.municipio),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 11 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Beneficiários',
                type: 'bar',
                data: sortedPcp.map(item => item.beneficiarios),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#f59e0b' },
                        { offset: 1, color: '#b45309' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 11,
                    color: '#78350f',
                    formatter: (params) => Number(params.value).toLocaleString('pt-BR')
                }
            }]
        };
        chartResumoCozinhasMuns.setOption(option);
        
    } else if (visao === 'cofin') {
        if (elTitle) elTitle.textContent = "Cofinanciamento SAS por Município";
        if (elSub) elSub.textContent = "Top municípios com maior volume financeiro pago pelo Fundo Estadual de Assistência Social";
        if (elBadge) elBadge.innerHTML = `<i class="fas fa-hand-holding-dollar text-blue-500 me-1"></i> ${(cacheResumoCozinhas.kpis_cofinanciamento?.total_municipios || 185)} Municípios Beneficiados`;

        const cofinList = (cacheResumoCozinhas.cofinanciamento_muns || []).slice(0, 25).reverse();

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    const rawItem = cofinList.find(m => m.municipio === p.name);
                    const valVal = rawItem ? `R$ ${(rawItem.valor_validado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
                    const pct = rawItem ? `${rawItem.percentual_pago.toFixed(1)}%` : '-';
                    return `<strong>${p.name}</strong><br/>Valor Pago: <b>R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b><br/>Validado: <b>${valVal}</b> (${pct} pago)`;
                }
            },
            grid: { top: 20, bottom: 25, left: '4%', right: '12%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (v) => v >= 1e6 ? 'R$ ' + (v/1e6).toFixed(0) + 'M' : v
                },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: cofinList.map(item => item.municipio),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 11 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Valor Pago',
                type: 'bar',
                data: cofinList.map(item => item.valor_pago),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#3b82f6' },
                        { offset: 1, color: '#1d4ed8' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 10,
                    color: '#1e3a8a',
                    formatter: (params) => {
                        const v = Number(params.value);
                        return v >= 1e6 ? 'R$ ' + (v/1e6).toFixed(1).replace('.', ',') + 'M' : 'R$ ' + v.toLocaleString('pt-BR');
                    }
                }
            }]
        };
        chartResumoCozinhasMuns.setOption(option);
    } else if (visao === 'ivcad') {
        if (elTitle) elTitle.textContent = "Vulnerabilidade a Cuidados (IVCAD NC Ponderado)";
        if (elSub) elSub.textContent = "Municípios com menor índice residual de vulnerabilidade a cuidados após a cobertura de Mães de PE";
        if (elBadge) elBadge.innerHTML = `<i class="fas fa-shield-heart text-indigo-500 me-1"></i> 185 Municípios Avaliados`;

        const vulnList = (cacheResumoCozinhas.vulnerabilidade_muns || []).slice();
        const sortedVuln = vulnList
            .sort((a, b) => (a.ivcad_nc_ponderado || 0) - (b.ivcad_nc_ponderado || 0))
            .slice(0, 25)
            .reverse();

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    const item = sortedVuln.find(m => m.municipio === p.name);
                    const ncOrig = item ? item.ivcad_nc.toFixed(3).replace('.', ',') : '-';
                    const txMaes = item ? item.taxa_maes.toFixed(1).replace('.', ',') : '-';
                    return `<strong>${p.name}</strong><br/>` +
                           `Posição Geral: <b>${item ? item.rank_ivcad_nc_ponderado + 'º de 185' : '-'}</b><br/>` +
                           `Vulnerab. Ponderada: <b>${Number(p.value).toFixed(3).replace('.', ',')}</b><br/>` +
                           `IVCAD NC Original: <b>${ncOrig}</b><br/>` +
                           `Taxa Mães: <b>${txMaes} / 100k CadÚnico</b>`;
                }
            },
            grid: { top: 20, bottom: 25, left: '4%', right: '12%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: { color: '#64748b', fontSize: 11 },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: sortedVuln.map(item => item.municipio),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 11 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Vulnerabilidade Ponderada',
                type: 'bar',
                data: sortedVuln.map(item => item.ivcad_nc_ponderado),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#818cf8' },
                        { offset: 1, color: '#4f46e5' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 10,
                    color: '#312e81',
                    formatter: (params) => Number(params.value).toFixed(3).replace('.', ',')
                }
            }]
        };
        chartResumoCozinhasMuns.setOption(option);
    }
}

// Renderização dos Gráficos Exclusivos de Cofinanciamento
function renderizarGraficosCofinanciamento(data) {
    if (!data) return;

    // 1. Gráfico Série Histórica (2024 - 2026) - Estilo Lollipop / Dumbbell Chart
    const domSerie = document.getElementById('chart_cofin_serie_historica');
    if (domSerie && typeof echarts !== 'undefined') {
        if (chartCofinSerieHistorica) {
            try { chartCofinSerieHistorica.dispose(); } catch(e) {}
        }
        chartCofinSerieHistorica = echarts.init(domSerie);

        const anos = data.cofinanciamento_anos || [];
        const categoriasAnos = anos.map(a => String(a.ano));
        const badges = anos.map(a => {
            const pct = a.valor_validado > 0 ? (a.valor_pago / a.valor_validado) * 100 : 0;
            const pctFmt = pct.toFixed(1).replace('.', ',');
            return (a.ano === 2026 || pct < 90)
                ? `▼ ${pctFmt}% pago (em curso)`
                : `● ${pctFmt}% executado`;
        });
        const badgesColors = anos.map(a => {
            const pct = a.valor_validado > 0 ? (a.valor_pago / a.valor_validado) * 100 : 0;
            return (a.ano === 2026 || pct < 90) ? '#2563eb' : '#16a34a';
        });

        const optionSerie = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { color: '#94a3b8' } },
                formatter: function (params) {
                    if (!params || !params.length) return '';
                    const idx = params[0].dataIndex;
                    const a = anos[idx];
                    if (!a) return '';
                    const pct = a.valor_validado > 0 ? ((a.valor_pago / a.valor_validado) * 100).toFixed(1).replace('.', ',') : '0,0';
                    const saldo = (a.valor_validado || 0) - (a.valor_pago || 0);
                    const valValFmt = a.valor_validado >= 1e9 
                        ? `R$ ${(a.valor_validado/1e9).toFixed(2).replace('.', ',')} Bi` 
                        : `R$ ${(a.valor_validado/1e6).toFixed(1).replace('.', ',')} Mi`;
                    const valPagoFmt = a.valor_pago >= 1e9 
                        ? `R$ ${(a.valor_pago/1e9).toFixed(2).replace('.', ',')} Bi` 
                        : `R$ ${(a.valor_pago/1e6).toFixed(1).replace('.', ',')} Mi`;
                    const saldoFmt = saldo >= 1e9
                        ? `R$ ${(saldo/1e9).toFixed(2).replace('.', ',')} Bi`
                        : `R$ ${(saldo/1e6).toFixed(1).replace('.', ',')} Mi`;

                    return `
                        <div style="font-size: 12px; font-family: sans-serif; line-height: 1.5;">
                            <strong style="color: #0f172a; font-size: 13px;">Exercício ${a.ano}</strong><br/>
                            <div style="margin-top: 4px;">
                                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;border:2px solid #6366f1;background:#fff;margin-right:6px;"></span>Valor Validado: <b>${valValFmt}</b><br/>
                                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#2563eb;margin-right:6px;"></span>Valor Pago: <b>${valPagoFmt}</b>
                            </div>
                            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; color: #475569;">
                                Taxa de Execução: <b style="color: #0f172a;">${pct}%</b><br/>
                                Saldo a Pagar: <b style="color: #0f172a;">${saldoFmt}</b>
                            </div>
                        </div>
                    `;
                }
            },
            legend: {
                top: 0,
                left: 0,
                itemWidth: 14,
                itemHeight: 14,
                data: [
                    { name: 'Valor Validado', icon: 'emptyCircle', itemStyle: { borderColor: '#6366f1', borderWidth: 2.5 } },
                    { name: 'Valor Pago', icon: 'circle', itemStyle: { color: '#2563eb' } }
                ],
                textStyle: { color: '#475569', fontWeight: 600, fontSize: 11 }
            },
            grid: {
                top: 45,
                bottom: 25,
                left: '6%',
                right: '28%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (v) => v >= 1e9 ? 'R$ ' + (v / 1e9).toFixed(1).replace('.', ',') + ' Bi' : (v >= 1e6 ? 'R$ ' + (v / 1e6).toFixed(0) + ' Mi' : 'R$ ' + v)
                },
                splitLine: {
                    lineStyle: {
                        color: '#f1f5f9'
                    }
                }
            },
            yAxis: [
                {
                    type: 'category',
                    inverse: true,
                    data: categoriasAnos,
                    axisLabel: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: '#1e293b'
                    },
                    axisLine: { show: false },
                    axisTick: { show: false }
                },
                {
                    type: 'category',
                    inverse: true,
                    data: badges,
                    position: 'right',
                    axisLabel: {
                        fontSize: 10,
                        fontWeight: 'bold',
                        backgroundColor: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: [4, 8],
                        color: function(value, index) {
                            return badgesColors[index] || '#16a34a';
                        }
                    },
                    axisLine: { show: false },
                    axisTick: { show: false }
                }
            ],
            series: [
                {
                    name: 'Conexão',
                    type: 'custom',
                    renderItem: function (params, api) {
                        const y = api.coord([0, api.value(2)])[1];
                        const x1 = api.coord([api.value(0), 0])[0];
                        const x2 = api.coord([api.value(1), 0])[0];
                        return {
                            type: 'group',
                            children: [
                                {
                                    type: 'line',
                                    shape: {
                                        x1: api.coord([0, 0])[0],
                                        y1: y,
                                        x2: Math.min(x1, x2),
                                        y2: y
                                    },
                                    style: {
                                        stroke: '#e2e8f0',
                                        lineWidth: 1.5,
                                        lineDash: [3, 3]
                                    }
                                },
                                {
                                    type: 'line',
                                    shape: {
                                        x1: Math.min(x1, x2),
                                        y1: y,
                                        x2: Math.max(x1, x2),
                                        y2: y
                                    },
                                    style: {
                                        stroke: '#c7d2fe',
                                        lineWidth: 5,
                                        lineCap: 'round'
                                    }
                                }
                            ]
                        };
                    },
                    data: anos.map((a, idx) => [a.valor_pago, a.valor_validado, idx]),
                    silent: true,
                    z: 2
                },
                {
                    name: 'Valor Validado',
                    type: 'scatter',
                    data: anos.map((a, idx) => [a.valor_validado, idx]),
                    symbol: 'circle',
                    symbolSize: 13,
                    itemStyle: {
                        color: '#ffffff',
                        borderColor: '#6366f1',
                        borderWidth: 2.5
                    },
                    label: {
                        show: true,
                        position: 'top',
                        offset: [0, -2],
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: '#4f46e5',
                        formatter: function (p) {
                            const v = p.value[0];
                            return v >= 1e9 ? 'R$ ' + (v / 1e9).toFixed(2).replace('.', ',') + ' Bi' : 'R$ ' + (v / 1e6).toFixed(0) + ' Mi';
                        }
                    },
                    z: 4
                },
                {
                    name: 'Valor Pago',
                    type: 'scatter',
                    data: anos.map((a, idx) => [a.valor_pago, idx]),
                    symbol: 'circle',
                    symbolSize: 15,
                    itemStyle: {
                        color: '#2563eb',
                        shadowColor: 'rgba(37, 99, 235, 0.35)',
                        shadowBlur: 6
                    },
                    label: {
                        show: true,
                        position: 'bottom',
                        offset: [0, 2],
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: '#1e40af',
                        formatter: function (p) {
                            const v = p.value[0];
                            return v >= 1e9 ? 'R$ ' + (v / 1e9).toFixed(2).replace('.', ',') + ' Bi' : 'R$ ' + (v / 1e6).toFixed(0) + ' Mi';
                        }
                    },
                    z: 5
                }
            ]
        };
        chartCofinSerieHistorica.setOption(optionSerie);
    }

    // 2. Gráfico Cofinanciamento por Município (Top 20)
    const domMun = document.getElementById('chart_cofin_por_mun');
    if (domMun && typeof echarts !== 'undefined') {
        if (chartCofinPorMun) {
            try { chartCofinPorMun.dispose(); } catch(e) {}
        }
        chartCofinPorMun = echarts.init(domMun);

        const muns = (data.cofinanciamento_muns || []).slice(0, 20).reverse();

        const optionMun = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    const p = params[0];
                    const rawItem = muns.find(m => m.municipio === p.name);
                    const valVal = rawItem ? `R$ ${(rawItem.valor_validado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-';
                    const pct = rawItem ? `${rawItem.percentual_pago.toFixed(1)}%` : '-';
                    return `<strong>${p.name}</strong><br/>Total Pago: <b>R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b><br/>Validado: <b>${valVal}</b> (${pct} executado)`;
                }
            },
            grid: { top: 15, bottom: 20, left: '3%', right: '12%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: (v) => v >= 1e6 ? 'R$ ' + (v/1e6).toFixed(0) + 'M' : v
                },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: muns.map(item => item.municipio),
                axisLabel: { color: '#334155', fontWeight: 600, fontSize: 10 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Valor Pago',
                type: 'bar',
                data: muns.map(item => item.valor_pago),
                barMaxWidth: 16,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#38bdf8' },
                        { offset: 1, color: '#0284c7' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 10,
                    color: '#0369a1',
                    formatter: (params) => {
                        const v = Number(params.value);
                        return (v/1e6).toFixed(1).replace('.', ',') + 'M';
                    }
                }
            }]
        };
        chartCofinPorMun.setOption(optionMun);
    }
}

window.renderizarResumoCozinhas = function () {
    const container = document.getElementById('resumo_cozinhas_map');
    if (!container) return;

    if (cacheResumoCozinhas) {
        setTimeout(() => {
            if (mapResumoCozinhas && typeof mapResumoCozinhas.resize === 'function') {
                mapResumoCozinhas.resize();
            }
            if (chartResumoCozinhasMuns && typeof chartResumoCozinhasMuns.resize === 'function') {
                chartResumoCozinhasMuns.resize();
            }
            if (chartCofinSerieHistorica && typeof chartCofinSerieHistorica.resize === 'function') {
                chartCofinSerieHistorica.resize();
            }
            if (chartCofinPorMun && typeof chartCofinPorMun.resize === 'function') {
                chartCofinPorMun.resize();
            }
        }, 100);
        return;
    }

    $('#resumo_cozinhas_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/cozinhas`.replace(/\/+/g, '/');
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error("Erro ao carregar dados consolidados do Pernambuco sem Fome");
            return res.json();
        })
        .then(data => {
            cacheResumoCozinhas = data;
            window.cacheResumoCozinhas = data;
            $('#resumo_cozinhas_spinner').addClass('d-none');
            
            const kpisPCP = data.kpis_pcp || {};
            
            const elPcpBenef = document.getElementById('pcp_kpi_beneficiarios');
            const elPcpPago = document.getElementById('pcp_kpi_valor_pago');
            const elPcpMun = document.getElementById('pcp_kpi_municipios');
            const elPcpRds = document.getElementById('pcp_kpi_rds');
            const elPcpCana = document.getElementById('pcp_kpi_cana');
            const elPcpFrutaPesca = document.getElementById('pcp_kpi_fruta_pesca');
            const elPcpFrutaPescaDesc = document.getElementById('pcp_kpi_fruta_pesca_desc');

            const cozinhas = data.cozinhas || [];
            const kpis = data.kpis || {};
            const maes = data.maes || [];
            const kpisMaes = data.kpis_maes || {};
            const kpisCofin = data.kpis_cofinanciamento || {};
            const cofinMuns = data.cofinanciamento_muns || [];

            // 1. Preencher KPIs de Cozinhas no DOM
            const elTotal = document.getElementById('cozinhas_kpi_total');
            const elFunc = document.getElementById('cozinhas_kpi_funcionamento');
            const elImp = document.getElementById('cozinhas_kpi_implantacao');
            const elPact = document.getElementById('cozinhas_kpi_pactuacao');
            const elNao = document.getElementById('cozinhas_kpi_nao_aderiu');
            
            if (elPcpBenef) {
                elPcpBenef.textContent = (kpisPCP.total_beneficiarios || 0).toLocaleString('pt-BR');
            }
            
            if (elPcpPago) {
                const pago = kpisPCP.valor_pago || 0;
                elPcpPago.textContent = pago >= 1e6
                    ? `R$ ${(pago / 1e6).toFixed(2).replace('.', ',')} Mi`
                    : `R$ ${pago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            
            if (elPcpMun) {
                elPcpMun.textContent = (kpisPCP.municipios_cobertos || 0).toLocaleString('pt-BR');
            }
            
            if (elPcpRds) {
                elPcpRds.textContent = `${kpisPCP.rds_cobertas || 0} Regiões de Desenv.`;
            }
            
            if (elPcpCana) {
                elPcpCana.textContent = (kpisPCP.beneficiarios_cana || 0).toLocaleString('pt-BR');
            }
            
            if (elPcpFrutaPesca) {
                const somaFrutaPesca = (kpisPCP.beneficiarios_fruta || 0) + (kpisPCP.beneficiarios_pesca || 0);
                elPcpFrutaPesca.textContent = somaFrutaPesca.toLocaleString('pt-BR');
            }
            
            if (elPcpFrutaPescaDesc) {
                elPcpFrutaPescaDesc.textContent = `${(kpisPCP.beneficiarios_fruta || 0).toLocaleString('pt-BR')} Fruta | ${(kpisPCP.beneficiarios_pesca || 0).toLocaleString('pt-BR')} Pesca`;
            }


            if (elTotal) elTotal.textContent = (kpis.total || cozinhas.length).toLocaleString('pt-BR');
            if (elFunc) elFunc.textContent = (kpis.funcionamento || 0).toLocaleString('pt-BR');
            if (elImp) elImp.textContent = (kpis.implantacao || 0).toLocaleString('pt-BR');
            if (elPact) elPact.textContent = (kpis.pactuacao || 0).toLocaleString('pt-BR');
            if (elNao) elNao.textContent = (kpis.nao_aderiu || 0).toLocaleString('pt-BR');

            // 2. Preencher KPIs de Mães de Pernambuco
            const elMaesTot = document.getElementById('maes_kpi_total');
            const elMaesInv = document.getElementById('maes_kpi_investimento');
            const elMaesMun = document.getElementById('maes_kpi_municipios');

            if (elMaesTot) elMaesTot.textContent = (kpisMaes.total_beneficiarias || 0).toLocaleString('pt-BR');
            if (elMaesInv) {
                const inv = kpisMaes.total_investido || 0;
                elMaesInv.textContent = inv >= 1e6 ? `R$ ${(inv/1e6).toFixed(1).replace('.', ',')} Mi` : `R$ ${inv.toLocaleString('pt-BR')}`;
            }
            if (elMaesMun) elMaesMun.textContent = (kpisMaes.total_municipios || 185).toLocaleString('pt-BR');

            // 3. Preencher KPIs de Cofinanciamento
            const elCofinPago = document.getElementById('cofin_kpi_pago');
            const elCofinVal = document.getElementById('cofin_kpi_validado');
            const elCofinPct = document.getElementById('cofin_kpi_percentual');
            const elCofinAPagar = document.getElementById('cofin_kpi_a_pagar');
            const elCofinMun = document.getElementById('cofin_kpi_municipios');

            const fmtBiMi = (v) => v >= 1e9 ? `R$ ${(v/1e9).toFixed(2).replace('.', ',')} Bi` : (v >= 1e6 ? `R$ ${(v/1e6).toFixed(1).replace('.', ',')} Mi` : `R$ ${v.toLocaleString('pt-BR')}`);

            if (elCofinPago) elCofinPago.textContent = fmtBiMi(kpisCofin.total_pago || 0);
            if (elCofinVal) elCofinVal.textContent = fmtBiMi(kpisCofin.total_validado || 0);
            if (elCofinPct) elCofinPct.textContent = `${(kpisCofin.percentual_pago || 0).toFixed(1)}%`;
            if (elCofinAPagar) elCofinAPagar.textContent = fmtBiMi(kpisCofin.total_a_pagar || 0);
            if (elCofinMun) elCofinMun.textContent = (kpisCofin.total_municipios || 185).toLocaleString('pt-BR');

            // Mapas de lookup por município
            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const maesByMun = {};
            maes.forEach(m => {
                if (m.municipio) maesByMun[norm(m.municipio)] = m;
                if (m.ibge7) maesByMun[m.ibge7] = m;
            });

            const cofinByMun = {};
            cofinMuns.forEach(m => {
                if (m.municipio) cofinByMun[norm(m.municipio)] = m;
            });

            const cozinhasCountByMun = {};
            const cozinhasFuncByMun = {};
            cozinhas.forEach(c => {
                const k = norm(c.municipio);
                cozinhasCountByMun[k] = (cozinhasCountByMun[k] || 0) + 1;
                if ((c.status_funcionamento || '').includes('Funcionamento')) {
                    cozinhasFuncByMun[k] = (cozinhasFuncByMun[k] || 0) + 1;
                }
            });

            // 4. Preparar GeoJSON municipal enriquecido
            let geoMun = data.geojson_municipios;
            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            const vulnByMun = {};
            const vulnByIbge = {};
            (data.vulnerabilidade_muns || []).forEach(v => {
                if (v.cod_ibge) vulnByIbge[String(v.cod_ibge)] = v;
                if (v.municipio) vulnByMun[norm(v.municipio)] = v;
            });
            
            // Mapas de lookup do Chapéu de Palha por IBGE (7 e 6 dígitos) e por Nome
            const pcpByIbge = {};
            const pcpByMun = {};
            
            (data.pcp || []).forEach(p => {
                const kMun = norm(p.municipio);
                const rawIbge = p.ibge7 ? String(p.ibge7).trim() : (p.cod_ibge ? String(p.cod_ibge).trim() : '');
                const ibge7 = rawIbge;
                const ibge6 = rawIbge.length >= 6 ? rawIbge.substring(0, 6) : '';
                
                const benef = Number(p.numero_de_beneficiarios) || 0;
                const pago = Number(p.valor_pago_no_municipio) || Number(p.valor_investido_no_municipio) || 0;
            
                // Indexa por IBGE 7 dígitos
                if (ibge7) {
                    if (!pcpByIbge[ibge7]) pcpByIbge[ibge7] = { beneficiarios: 0, valor_pago: 0 };
                    pcpByIbge[ibge7].beneficiarios += benef;
                    pcpByIbge[ibge7].valor_pago += pago;
                }
                // Indexa por IBGE 6 dígitos (para compatibilidade caso o GeoJSON use 6 dígitos)
                if (ibge6) {
                    if (!pcpByIbge[ibge6]) pcpByIbge[ibge6] = { beneficiarios: 0, valor_pago: 0 };
                    pcpByIbge[ibge6].beneficiarios += benef;
                    pcpByIbge[ibge6].valor_pago += pago;
                }
                // Indexa por Nome normalizado
                if (kMun) {
                    if (!pcpByMun[kMun]) pcpByMun[kMun] = { beneficiarios: 0, valor_pago: 0 };
                    pcpByMun[kMun].beneficiarios += benef;
                    pcpByMun[kMun].valor_pago += pago;
                }
            });

            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.municipio);
                    const kIbge = String(props.ibge7 || props.cod_ibge || '');
                    const mData = maesByMun[kIbge] || maesByMun[kMun] || {};
                    const cData = cofinByMun[kMun] || {};
                    const vData = vulnByIbge[kIbge] || vulnByMun[kMun] || {};

                    props.qtd_maes = Number(mData.qtd_beneficiarias_total) || 0;
                    props.valor_maes = Number(mData.valor_total) || 0;
                    props.qtd_cozinhas = cozinhasCountByMun[kMun] || 0;
                    props.qtd_cozinhas_func = cozinhasFuncByMun[kMun] || 0;

                    props.valor_cofin_pago = Number(cData.valor_pago) || 0;
                    props.valor_cofin_validado = Number(cData.valor_validado) || 0;
                    props.pct_cofin = Number(cData.percentual_pago) || 0;
                    
                    // Resgata o código IBGE do polígono (seja 7 ou 6 dígitos)
                    const rawCodMun = String(props.ibge7 || props.cod_ibge || props.codarea || props.ibge6 || '').trim();
                    const cod7 = rawCodMun.length >= 7 ? rawCodMun.substring(0, 7) : rawCodMun;
                    const cod6 = rawCodMun.length >= 6 ? rawCodMun.substring(0, 6) : '';
                    
                    // Busca por IBGE7 -> fallback IBGE6 -> fallback Nome
                    const pcpData = pcpByIbge[cod7] || pcpByIbge[cod6] || pcpByMun[kMun] || {};
                    
                    props.pcp_beneficiarios = Number(pcpData.beneficiarios) || 0;
                    props.pcp_valor_pago = Number(pcpData.valor_pago) || 0;

                    props.ivcad = Number(vData.ivcad) || 0;
                    props.rank_ivcad = Number(vData.rank_ivcad) || 0;
                    props.ivcad_nc = Number(vData.ivcad_nc) || 0;
                    props.rank_ivcad_nc = Number(vData.rank_ivcad_nc) || 0;
                    props.cad_pessoas = Number(vData.cad_pessoas) || 0;
                    props.taxa_maes = Number(vData.taxa_maes) || 0;
                    props.taxa_maes_norm = Number(vData.taxa_maes_norm) || 0;
                    props.rank_taxa_maes = Number(vData.rank_taxa_maes) || 0;
                    props.ivcad_nc_ponderado = Number(vData.ivcad_nc_ponderado) || 0;
                    props.rank_ivcad_nc_ponderado = Number(vData.rank_ivcad_nc_ponderado) || 0;
                });
            }

            // 5. Preparar GeoJSON de pontos de cozinhas
            const featuresCozinhas = cozinhas
                .filter(c => c.lat && c.long && !isNaN(c.lat) && !isNaN(c.long))
                .map(c => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [Number(c.long), Number(c.lat)]
                    },
                    properties: {
                        cod_ibge: c.cod_ibge,
                        nome_equipamento: c.nome_equipamento || 'Cozinha Comunitária',
                        status_funcionamento: c.status_funcionamento || 'Não informado',
                        endereco: c.endereco || '',
                        municipio: c.municipio || '',
                        regiao_de_desenvolvimento: c.regiao_de_desenvolvimento || ''
                    }
                }));

            const geoCozinhas = {
                type: 'FeatureCollection',
                features: featuresCozinhas
            };

            // 6. Inicializar MapLibre GL
            if (mapResumoCozinhas) {
                try { mapResumoCozinhas.remove(); } catch(e) {}
            }

            mapResumoCozinhas = new maplibregl.Map({
                container: 'resumo_cozinhas_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapResumoCozinhas.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapResumoCozinhas.on('load', () => {
                mapResumoCozinhas.resize();

                // Enquadrar bounds
                try {
                    const bounds = new maplibregl.LngLatBounds();
                    featuresCozinhas.forEach(f => bounds.extend(f.geometry.coordinates));
                    if (!bounds.isEmpty()) {
                        mapResumoCozinhas.fitBounds(bounds, { padding: 35, maxZoom: 12, duration: 800 });
                    }
                } catch(e) {}

                // Adicionar Polígonos de Municípios
                if (geoMun && geoMun.features) {
                    mapResumoCozinhas.addSource('mun_source', {
                        type: 'geojson',
                        data: geoMun
                    });

                    // Camada de Preenchimento (Coroplético dinâmico)
                    mapResumoCozinhas.addLayer({
                        id: 'mun_choropleth_fill',
                        type: 'fill',
                        source: 'mun_source',
                        paint: {
                            'fill-color': [
                                'step',
                                ['get', 'qtd_maes'],
                                '#fce7f3',
                                400, '#f472b6',
                                800, '#db2777',
                                1500, '#831843'
                            ],
                            'fill-opacity': window.visaoSemFomeAtiva === 'cozinhas' ? 0.05 : 0.75
                        }
                    });

                    // Linha de contorno dos municípios
                    mapResumoCozinhas.addLayer({
                        id: 'mun_choropleth_line',
                        type: 'line',
                        source: 'mun_source',
                        paint: {
                            'line-color': '#94a3b8',
                            'line-width': 0.8,
                            'line-opacity': 0.5
                        }
                    });
                }

                // Adicionar Pontos de Cozinhas com Cluster
                mapResumoCozinhas.addSource('cozinhas_source', {
                    type: 'geojson',
                    data: geoCozinhas,
                    cluster: true,
                    clusterMaxZoom: 10,
                    clusterRadius: 35
                });

                // Clusters
                mapResumoCozinhas.addLayer({
                    id: 'cozinhas_clusters',
                    type: 'circle',
                    source: 'cozinhas_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoSemFomeAtiva === 'cozinhas' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': '#f59e0b',
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            16,
                            5, 20,
                            15, 26
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': 0.85
                    }
                });

                mapResumoCozinhas.addLayer({
                    id: 'cozinhas_cluster_count',
                    type: 'symbol',
                    source: 'cozinhas_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoSemFomeAtiva === 'cozinhas' ? 'visible' : 'none',
                        'text-field': '{point_count_abbreviated}',
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    },
                    paint: { 'text-color': '#ffffff' }
                });

                // Pontos individuais
                mapResumoCozinhas.addLayer({
                    id: 'cozinhas_points',
                    type: 'circle',
                    source: 'cozinhas_source',
                    filter: ['!', ['has', 'point_count']],
                    layout: {
                        'visibility': window.visaoSemFomeAtiva === 'cozinhas' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': [
                            'case',
                            ['in', 'Funcionamento', ['get', 'status_funcionamento']], '#10b981',
                            ['in', 'Implanta', ['get', 'status_funcionamento']], '#f59e0b',
                            ['in', 'Pactua', ['get', 'status_funcionamento']], '#3b82f6',
                            ['in', 'aderiu', ['get', 'status_funcionamento']], '#ef4444',
                            '#64748b'
                        ],
                        'circle-radius': 7,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // --- HOVER BOX INTERATIVO ---
                mapResumoCozinhas.on('mousemove', 'mun_choropleth_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    // Passa false no 3º argumento para indicar que é hover e respeitar a trava
                    atualizarHoverBoxSemFome('municipio', props, false);
                });
                
                mapResumoCozinhas.on('mousemove', 'cozinhas_points', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    atualizarHoverBoxSemFome('cozinha', props, false);
                });
                
                mapResumoCozinhas.on('mouseleave', 'mun_choropleth_fill', () => {
                    // Só esconde no mouseleave se NÃO estiver fixado
                    if (!window.municipioFixoSemFome) {
                        atualizarHoverBoxSemFome(null, null, false);
                    }
                });
                
                mapResumoCozinhas.on('mouseleave', 'cozinhas_points', () => {
                    if (!window.municipioFixoSemFome) {
                        atualizarHoverBoxSemFome(null, null, false);
                    }
                });
                
                // =========================================================================
                // NOVO: CLIQUE PARA FIXAR O MUNICÍPIO
                // =========================================================================
                mapResumoCozinhas.on('click', 'mun_choropleth_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    
                    // Se clicou no mesmo que já estava fixado, desafixa (toggle); se clicou em outro, fixa o novo
                    if (window.municipioFixoSemFome === props.municipio) {
                        window.desafixarMunicipioSemFome();
                    } else {
                        window.municipioFixoSemFome = props.municipio;
                        // Força a renderização imediata com o estado de travado ativo
                        atualizarHoverBoxSemFome('municipio', props, true);
                    }
                });


                // Cluster click para zoom
                mapResumoCozinhas.on('click', 'cozinhas_clusters', (e) => {
                    const clFeatures = mapResumoCozinhas.queryRenderedFeatures(e.point, { layers: ['cozinhas_clusters'] });
                    if (!clFeatures.length) return;
                    const clusterId = clFeatures[0].properties.cluster_id;
                    mapResumoCozinhas.getSource('cozinhas_source').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        mapResumoCozinhas.easeTo({
                            center: clFeatures[0].geometry.coordinates,
                            zoom: zoom
                        });
                    });
                });

                // Cursors
                ['cozinhas_points', 'cozinhas_clusters', 'mun_choropleth_fill'].forEach(layer => {
                    mapResumoCozinhas.on('mouseenter', layer, () => { mapResumoCozinhas.getCanvas().style.cursor = 'pointer'; });
                    mapResumoCozinhas.on('mouseleave', layer, () => { mapResumoCozinhas.getCanvas().style.cursor = ''; });
                });
            });

            // 7. Renderizar Gráficos de Cofinanciamento
            renderizarGraficosCofinanciamento(data);

            // 8. Renderizar Gráfico de Barras com a visão inicial
            atualizarGraficoSemFome(window.visaoSemFomeAtiva || 'cozinhas');

            window.addEventListener('resize', () => {
                if (mapResumoCozinhas && typeof mapResumoCozinhas.resize === 'function') mapResumoCozinhas.resize();
                if (chartResumoCozinhasMuns && typeof chartResumoCozinhasMuns.resize === 'function') chartResumoCozinhasMuns.resize();
                if (chartCofinSerieHistorica && typeof chartCofinSerieHistorica.resize === 'function') chartCofinSerieHistorica.resize();
                if (chartCofinPorMun && typeof chartCofinPorMun.resize === 'function') chartCofinPorMun.resize();
            });
        })
        .catch(err => {
            console.error("Erro ao renderizar Pernambuco sem Fome:", err);
            $('#resumo_cozinhas_spinner').addClass('d-none');
        });
};


/* ==========================================================================
   RESUMOS TEMÁTICOS - PAUTA 4: ESTRADAS DE PERNAMBUCO (DER-PE / SEINFRA)
   ========================================================================== */
let mapResumoEstradas = null;
window.cacheResumoEstradas = null;
let cacheResumoEstradas = null;
let dtResumoEstradas = null;
let filtroStatusEstradas = 'todos';
let filtroRodoviaEstradas = '';

window.renderizarResumoEstradas = function () {
    const container = document.getElementById('estradas_map_container');
    if (!container) return;

    if (cacheResumoEstradas) {
        setTimeout(() => {
            if (mapResumoEstradas && typeof mapResumoEstradas.resize === 'function') {
                mapResumoEstradas.resize();
            }
            if (dtResumoEstradas && typeof dtResumoEstradas.columns.adjust === 'function') {
                dtResumoEstradas.columns.adjust();
            }
        }, 100);
        return;
    }

    const spinner = document.getElementById('estradas_map_spinner');
    if (spinner) spinner.classList.remove('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/estradas`.replace(/\/+/g, '/');
    const fallbackUrl = `${window.basePath || ''}/data/estradas_pe.json`.replace(/\/+/g, '/');

    fetch(apiUrl)
        .then(res => {
            if (res.ok) return res.json();
            return fetch(fallbackUrl).then(r2 => {
                if (!r2.ok) throw new Error("Erro ao carregar dados de Estradas PE");
                return r2.json();
            });
        })
        .then(data => {
            cacheResumoEstradas = data;
            window.cacheResumoEstradas = data;
            if (spinner) spinner.classList.add('d-none');

            // 1. Atualizar KPIs no DOM
            if (data.kpis) {
                const k = data.kpis;
                const elTot = document.getElementById('estradas_kpi_total');
                if (elTot) elTot.innerText = k.total_obras.toLocaleString('pt-BR');

                const elRods = document.getElementById('estradas_kpi_rodovias');
                if (elRods) elRods.innerText = k.total_rodovias.toLocaleString('pt-BR');

                const elInv = document.getElementById('estradas_kpi_investimento');
                if (elInv) elInv.innerText = `R$ ${k.valor_total_bi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bi`;

                const elConc = document.getElementById('estradas_kpi_concluidas');
                if (elConc) elConc.innerText = k.concluidas.toLocaleString('pt-BR');

                const elExec = document.getElementById('estradas_kpi_execucao');
                if (elExec) elExec.innerText = k.em_execucao.toLocaleString('pt-BR');
            }

            // 2. Preencher Select de Rodovias
            const selRod = document.getElementById('select_filtro_rodovia');
            if (selRod && data.rodovias_unicas) {
                selRod.innerHTML = '<option value="">Todas Rodovias</option>';
                data.rodovias_unicas.forEach(rod => {
                    const opt = document.createElement('option');
                    opt.value = rod;
                    opt.textContent = rod;
                    selRod.appendChild(opt);
                });
            }

            // 3. Inicializar Mapa MapLibre
            if (!mapResumoEstradas) {
                mapResumoEstradas = new maplibregl.Map({
                    container: 'estradas_map_container',
                    style: window.obterEstiloBaseMapa(),
                    center: [-37.8, -8.3],
                    zoom: 7,
                    preserveDrawingBuffer: true
                });

                mapResumoEstradas.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

                mapResumoEstradas.on('load', () => {
                    mapResumoEstradas.resize();

                    // Ajustar bounds
                    try {
                        const bounds = new maplibregl.LngLatBounds();
                        data.geojson.features.forEach(f => {
                            const geom = f.geometry;
                            if (!geom) return;
                            const coords = geom.coordinates;
                            const expand = (c) => {
                                if (typeof c[0] === 'number') bounds.extend(c);
                                else c.forEach(expand);
                            };
                            expand(coords);
                        });
                        if (!bounds.isEmpty()) {
                            mapResumoEstradas.fitBounds(bounds, { padding: 40, animate: false });
                        }
                    } catch (errBounds) {
                        console.warn("[Estradas PE] Erro ao ajustar bounds:", errBounds);
                    }

                    // Source
                    mapResumoEstradas.addSource('estradas_source', {
                        type: 'geojson',
                        data: data.geojson
                    });

                    // Camada de borda/brilho branco de fundo para destaque
                    mapResumoEstradas.addLayer({
                        id: 'estradas_casing',
                        type: 'line',
                        source: 'estradas_source',
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 3.5,
                                10, 6,
                                14, 9
                            ],
                            'line-opacity': 0.85
                        }
                    });

                    // Camada principal com cores de status
                    mapResumoEstradas.addLayer({
                        id: 'estradas_lines',
                        type: 'line',
                        source: 'estradas_source',
                        paint: {
                            'line-color': ['get', 'cor_status'],
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 2.5,
                                10, 4.5,
                                14, 7
                            ],
                            'line-opacity': 0.95
                        }
                    });

                    // Camada de hover/selecao
                    mapResumoEstradas.addLayer({
                        id: 'estradas_hover',
                        type: 'line',
                        source: 'estradas_source',
                        paint: {
                            'line-color': '#0f172a',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 4.5,
                                10, 7.5,
                                14, 11
                            ],
                            'line-opacity': 0.9
                        },
                        filter: ['==', 'rodovia', '']
                    });

                    // Popups interativos
                    const popup = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 12
                    });

                    mapResumoEstradas.on('mousemove', 'estradas_lines', (e) => {
                        mapResumoEstradas.getCanvas().style.cursor = 'pointer';
                        if (!e.features || !e.features.length) return;
                        const feat = e.features[0];
                        const props = feat.properties || {};
                        const rod = props.rodovia || 'Rodovia';

                        mapResumoEstradas.setFilter('estradas_hover', ['==', 'rodovia', rod]);

                        let corStatus = props.cor_status || '#64748B';
                        let html = `
                            <div style="font-family: inherit; font-size: 12px; min-width: 190px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;">
                                    <span style="font-weight: 900; font-size: 13px; color: #0F172A;">${rod}</span>
                                    <span style="font-size: 10px; font-weight: 700; background: ${corStatus}15; color: ${corStatus}; border: 1px solid ${corStatus}40; padding: 1px 6px; border-radius: 9999px;">
                                        ${props.status_predominante || 'Em Andamento'}
                                    </span>
                                </div>
                                <div style="color: #475569; display: flex; flex-direction: column; gap: 3px;">
                                    <div><strong>Obras DER:</strong> ${props.total_obras || 0}</div>
                                    <div><strong>Investimento:</strong> ${props.valor_total_fmt || 'R$ 0,00'}</div>
                                    <div><strong>Avanço Médio:</strong> ${props.avanco_medio || 0}%</div>
                                    ${props.municipios ? `<div style="font-size: 10px; color: #64748B; margin-top: 2px;"><strong>Cidades:</strong> ${props.municipios}</div>` : ''}
                                </div>
                                <div style="margin-top: 6px; font-size: 9px; color: #94A3B8; text-transform: uppercase; font-weight: bold;">
                                    Clique para filtrar na tabela
                                </div>
                            </div>
                        `;

                        popup.setLngLat(e.lngLat).setHTML(html).addTo(mapResumoEstradas);
                    });

                    mapResumoEstradas.on('mouseleave', 'estradas_lines', () => {
                        mapResumoEstradas.getCanvas().style.cursor = '';
                        mapResumoEstradas.setFilter('estradas_hover', ['==', 'rodovia', '']);
                        popup.remove();
                    });

                    mapResumoEstradas.on('click', 'estradas_lines', (e) => {
                        if (e.features && e.features.length) {
                            const rod = e.features[0].properties.rodovia;
                            if (rod) {
                                window.selecionarRodoviaFiltro(rod);
                            }
                        }
                    });
                });
            }

            // 4. Inicializar Tabela DataTable
            window.inicializarTabelaEstradas(data.obras);
        })
        .catch(err => {
            console.error("[Estradas PE] Erro ao carregar dados:", err);
            if (spinner) spinner.classList.add('d-none');
        });
};

window.inicializarTabelaEstradas = function (obras) {
    if ($.fn.DataTable.isDataTable('#tabela_estradas_pe')) {
        $('#tabela_estradas_pe').DataTable().destroy();
        $('#tabela_estradas_pe').empty();
    }

    dtResumoEstradas = $('#tabela_estradas_pe').DataTable({
        data: obras,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
        },
        order: [[5, 'desc']], // Ordenar por investimento decrescente
        columns: [
            {
                title: "Município",
                data: "municipio",
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioEstradas ? window.filtrarTabelaPorMunicipioEstradas('${d || ''}') : null">${d || 'Estadual'}</span>`
            },
            {
                title: "Rodovia / Intervenção",
                data: "iniciativa",
                className: "align-middle",
                width: "280px",
                render: (d, t, r) => {
                    const titulo = d || 'Intervenção Rodoviária';
                    const rodBadge = r.local ? `<span class="badge bg-slate-800 text-white rounded-pill px-2 py-0.5 text-[10px] me-1 cursor-pointer" onclick="window.selecionarRodoviaFiltro('${r.local}')">${r.local}</span>` : '';
                    const rdTexto = r.rd ? `<span class="text-slate-400">Região: ${r.rd}</span>` : '';
                    const sub = (rodBadge || rdTexto) ? `<div class="text-xs text-slate-500 mt-0.5 d-flex align-items-center gap-1">${rodBadge}${rdTexto}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            {
                title: "Rodovia",
                data: "local",
                className: "align-middle text-center",
                width: "90px",
                render: d => `<span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs cursor-pointer" onclick="window.selecionarRodoviaFiltro('${d}')">${d || 'DER-PE'}</span>`
            },
            {
                title: "Status",
                data: "status",
                className: "align-middle",
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) {
                        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    } else if (s.toLowerCase().includes('execu') || s.toLowerCase().includes('andamento')) {
                        badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    } else if (s.toLowerCase().includes('licita') || s.toLowerCase().includes('planej') || s.toLowerCase().includes('iniciar')) {
                        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    } else if (s.toLowerCase().includes('paralis')) {
                        badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                    }
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            {
                title: "Avanço Físico",
                data: "percent_execucao",
                className: "align-middle",
                width: "120px",
                render: (d, t) => {
                    let num = Number(d) || 0;
                    if (num <= 1 && num > 0) num = Math.round(num * 100);
                    else num = Math.min(Math.round(num), 100);

                    if (t !== 'display') return num;

                    const barColor = num >= 100 ? 'bg-emerald-500' : (num >= 50 ? 'bg-sky-500' : 'bg-amber-500');
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar ${barColor}" style="width: ${num}%;"></div>
                            </div>
                            <span class="text-xs fw-bold text-slate-700">${num}%</span>
                        </div>
                    `;
                }
            },
            {
                title: "Investimento (R$)",
                data: "valor_total",
                className: "align-middle text-end fw-bold text-slate-800",
                width: "140px",
                render: (d, t, r) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return r.valor_total_fmt || `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        ]
    });
};

window.filtrarEstradasStatus = function (status, btn) {
    filtroStatusEstradas = status;

    // Sincronizar botoes de status
    const ids = ['filtro_estradas_todos', 'filtro_estradas_concluida', 'filtro_estradas_execucao', 'filtro_estradas_paralisada'];
    ids.forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.classList.remove('btn-primary', 'text-white');
            b.classList.add('text-slate-600', 'bg-transparent', 'border-0');
        }
    });

    if (btn) {
        btn.classList.remove('text-slate-600', 'bg-transparent', 'border-0');
        btn.classList.add('btn-primary', 'text-white');
    }

    window.aplicarFiltrosEstradas();
};

window.selecionarRodoviaFiltro = function (rodovia) {
    filtroRodoviaEstradas = rodovia || '';
    const sel = document.getElementById('select_filtro_rodovia');
    if (sel) sel.value = filtroRodoviaEstradas;

    window.aplicarFiltrosEstradas();

    // Se selecionou uma rodovia, focar no mapa
    if (filtroRodoviaEstradas && mapResumoEstradas && cacheResumoEstradas) {
        try {
            const bounds = new maplibregl.LngLatBounds();
            cacheResumoEstradas.geojson.features.forEach(f => {
                if (String(f.properties.rodovia).trim().toUpperCase() === filtroRodoviaEstradas.trim().toUpperCase()) {
                    const coords = f.geometry.coordinates;
                    const expand = (c) => {
                        if (typeof c[0] === 'number') bounds.extend(c);
                        else c.forEach(expand);
                    };
                    expand(coords);
                }
            });
            if (!bounds.isEmpty()) {
                mapResumoEstradas.fitBounds(bounds, { padding: 80, maxZoom: 12, animate: true });
                mapResumoEstradas.setFilter('estradas_hover', ['==', 'rodovia', filtroRodoviaEstradas]);
            }
        } catch (errZoom) {
            console.warn("[Estradas PE] Erro ao focar rodovia:", errZoom);
        }
    } else if (mapResumoEstradas) {
        mapResumoEstradas.setFilter('estradas_hover', ['==', 'rodovia', '']);
    }
};

window.aplicarFiltrosEstradas = function () {
    // 1. Filtro na Tabela DataTable
    if (dtResumoEstradas) {
        // Coluna 4 = Status, Coluna 0 = Rodovia
        let statusRegex = '';
        if (filtroStatusEstradas !== 'todos') {
            statusRegex = '^' + filtroStatusEstradas + '$';
        }
        dtResumoEstradas.column(4).search(statusRegex, true, false);

        let rodoviaRegex = '';
        if (filtroRodoviaEstradas) {
            rodoviaRegex = '^' + filtroRodoviaEstradas + '$';
        }
        dtResumoEstradas.column(0).search(rodoviaRegex, true, false);

        dtResumoEstradas.draw();
    }

    // 2. Filtro no Mapa
    if (mapResumoEstradas && mapResumoEstradas.getLayer('estradas_lines')) {
        let filters = ['all'];

        if (filtroStatusEstradas !== 'todos') {
            filters.push(['==', 'status_predominante', filtroStatusEstradas]);
        }
        if (filtroRodoviaEstradas) {
            filters.push(['==', 'rodovia', filtroRodoviaEstradas]);
        }

        if (filters.length > 1) {
            mapResumoEstradas.setFilter('estradas_lines', filters);
            mapResumoEstradas.setFilter('estradas_casing', filters);
        } else {
            mapResumoEstradas.setFilter('estradas_lines', null);
            mapResumoEstradas.setFilter('estradas_casing', null);
        }
    }

    // 3. Atualizar Badge de Filtro Ativo
    const badgeContainer = document.getElementById('estradas_filtro_ativo_badge_container');
    const badgeText = document.getElementById('estradas_filtro_ativo_badge');

    if (badgeContainer && badgeText) {
        const filtrosAtivos = [];
        if (filtroStatusEstradas !== 'todos') filtrosAtivos.push(`Status: ${filtroStatusEstradas}`);
        if (filtroRodoviaEstradas) filtrosAtivos.push(`Rodovia: ${filtroRodoviaEstradas}`);

        if (filtrosAtivos.length > 0) {
            badgeText.innerText = `Filtros: ${filtrosAtivos.join(' | ')}`;
            badgeContainer.classList.remove('d-none');
            badgeContainer.classList.add('d-flex');
        } else {
            badgeContainer.classList.remove('d-flex');
            badgeContainer.classList.add('d-none');
        }
    }
};

window.limparFiltroEstradas = function () {
    filtroStatusEstradas = 'todos';
    filtroRodoviaEstradas = '';

    const btnTodos = document.getElementById('filtro_estradas_todos');
    window.filtrarEstradasStatus('todos', btnTodos);

    const sel = document.getElementById('select_filtro_rodovia');
    if (sel) sel.value = '';

    window.aplicarFiltrosEstradas();

    if (mapResumoEstradas && cacheResumoEstradas) {
        try {
            const bounds = new maplibregl.LngLatBounds();
            cacheResumoEstradas.geojson.features.forEach(f => {
                const geom = f.geometry;
                if (!geom) return;
                const coords = geom.coordinates;
                const expand = (c) => {
                    if (typeof c[0] === 'number') bounds.extend(c);
                    else c.forEach(expand);
                };
                expand(coords);
            });
            if (!bounds.isEmpty()) {
                mapResumoEstradas.fitBounds(bounds, { padding: 40, animate: true });
                mapResumoEstradas.setFilter('estradas_hover', ['==', 'rodovia', '']);
            }
        } catch (e) {}
    }
};


/* ==========================================================================
   7. MÓDULO DE COMPARAÇÃO MUNICIPAL (BENCHMARKING 2 A 3 MUNICÍPIOS)
   ========================================================================== */
window.cacheComparacaoMunicipios = window.cacheComparacaoMunicipios || {};
window.chartsComparacao = {
    radar: null,
    lollipopGeral: null,
    lollipopFiscal: null,
    vab: null,
    empSaldo: null,
    empSetor: null,
    agriBarras: null
};

window.trocarSubabaMunicipios = function(subaba) {
    if (subaba === 'comparacao') {
        $('#subaba_ficha_municipal').addClass('d-none');
        $('#subaba_comparacao_municipal').removeClass('d-none');

        // Botões de navegação
        $('#btn_subaba_ficha, #nav_btn_subaba_ficha').removeClass('btn-primary text-white shadow-xs').addClass('text-slate-600 bg-transparent border-0');
        $('#btn_subaba_comparacao, #nav_btn_subaba_comparacao').removeClass('text-slate-600 bg-transparent border-0').addClass('btn-primary text-white shadow-xs');

        // Ajuste no navbar
        $('#box_filtro_municipio_individual').addClass('d-none');
        $('#ficha_navbar_nav').addClass('d-none');

        window.iniciarModuloComparacaoMunicipal();

        setTimeout(() => {
            Object.values(window.chartsComparacao).forEach(c => {
                if (c && typeof c.resize === 'function') c.resize();
            });
        }, 150);
    } else {
        $('#subaba_comparacao_municipal').addClass('d-none');
        $('#subaba_ficha_municipal').removeClass('d-none');

        $('#btn_subaba_comparacao, #nav_btn_subaba_comparacao').removeClass('btn-primary text-white shadow-xs').addClass('text-slate-600 bg-transparent border-0');
        $('#btn_subaba_ficha, #nav_btn_subaba_ficha').removeClass('text-slate-600 bg-transparent border-0').addClass('btn-primary text-white shadow-xs');

        $('#box_filtro_municipio_individual').removeClass('d-none');
        $('#ficha_navbar_nav').removeClass('d-none');

        setTimeout(() => {
            if (mapFicha && typeof mapFicha.resize === 'function') mapFicha.resize();
        }, 150);
    }
};

window.iniciarModuloComparacaoMunicipal = async function() {
    const $sel1 = $('#comp_select_mun1');
    const $sel2 = $('#comp_select_mun2');
    const $sel3 = $('#comp_select_mun3');

    // Se já foram preenchidos com options, atualiza os dados
    if ($sel1.find('option').length >= 180) {
        await window.atualizarComparacaoMunicipal();
        return;
    }

    // Carrega a lista completa de municípios
    let listaMuns = [];
    const $selectOriginal = $('#ficha_f_municipio');
    if ($selectOriginal.length && $selectOriginal.find('option').length >= 180) {
        $selectOriginal.find('option').each(function() {
            const v = $(this).val();
            if (v) listaMuns.push(v);
        });
    } else {
        try {
            const res = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/filtros`.replace(/\/+/g, '/'));
            if (res && res.ok) {
                const j = await res.json();
                listaMuns = j.municipios || [];
            }
        } catch(e) {}
    }

    if (!listaMuns.length) return;

    // Valores padrão inteligentes: Mun 1 atual da Ficha, Mun 2 Caruaru, Mun 3 Petrolina
    const currentMunFicha = $('#ficha_f_municipio').val() || 'Recife';
    const defMun1 = currentMunFicha;
    const defMun2 = listaMuns.includes('Caruaru') && defMun1 !== 'Caruaru' ? 'Caruaru' : (listaMuns.find(m => m !== defMun1) || 'Olinda');
    const defMun3 = listaMuns.includes('Petrolina') && defMun1 !== 'Petrolina' && defMun2 !== 'Petrolina' ? 'Petrolina' : '';

    const optsHtml1 = listaMuns.map(m => `<option value="${m}" ${m === defMun1 ? 'selected' : ''}>${m}</option>`).join('');
    const optsHtml2 = listaMuns.map(m => `<option value="${m}" ${m === defMun2 ? 'selected' : ''}>${m}</option>`).join('');
    const optsHtml3 = `<option value="">(Nenhum - Comparar apenas 2)</option>` + listaMuns.map(m => `<option value="${m}" ${m === defMun3 ? 'selected' : ''}>${m}</option>`).join('');

    $sel1.html(optsHtml1).val(defMun1);
    $sel2.html(optsHtml2).val(defMun2);
    $sel3.html(optsHtml3).val(defMun3);

    await window.atualizarComparacaoMunicipal();
};

window.aoMudarMunicipioComparacao = function(num) {
    window.atualizarComparacaoMunicipal();
};

window.trocarOrdemMunicipiosComparacao = function() {
    const val1 = $('#comp_select_mun1').val();
    const val2 = $('#comp_select_mun2').val();
    $('#comp_select_mun1').val(val2);
    $('#comp_select_mun2').val(val1);
    window.atualizarComparacaoMunicipal();
};

window.obterDadosMunicipioComparacao = async function(nomeMun) {
    if (!nomeMun) return null;
    if (window.cacheComparacaoMunicipios[nomeMun]) {
        return window.cacheComparacaoMunicipios[nomeMun];
    }

    try {
        const res = await window.fetchSeguro(`${window.basePath || ''}/api/ficha/data`.replace(/\/+/g, '/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ municipio: nomeMun })
        });
        if (res && res.ok) {
            const data = await res.json();
            window.cacheComparacaoMunicipios[nomeMun] = data;
            return data;
        }
    } catch(e) {
        console.error(`[Comparação] Erro ao carregar dados de ${nomeMun}:`, e);
    }
    return null;
};

window.atualizarComparacaoMunicipal = async function() {
    const mun1 = $('#comp_select_mun1').val();
    const mun2 = $('#comp_select_mun2').val();
    const mun3 = $('#comp_select_mun3').val();

    if (!mun1 || !mun2) return;

    if (typeof window.mostrarCarregamento === 'function') window.mostrarCarregamento("CARREGANDO COMPARATIVO MUNICIPAL...");

    try {
        const [d1, d2, d3] = await Promise.all([
            window.obterDadosMunicipioComparacao(mun1),
            window.obterDadosMunicipioComparacao(mun2),
            mun3 ? window.obterDadosMunicipioComparacao(mun3) : Promise.resolve(null)
        ]);

        if (d1 && d2) {
            renderizarPainelComparativo(mun1, d1, mun2, d2, mun3, d3);
        }
    } catch(err) {
        console.error("[Comparação] Erro ao renderizar comparativo:", err);
    } finally {
        if (typeof window.ocultarCarregamento === 'function') window.ocultarCarregamento();
    }
};

function extrairMetricasComparacao(nomeMun, rawData) {
    if (!rawData) return null;
    const demo = rawData.demografia || {};
    const ind = rawData.indicadores || [];
    const fiscais = rawData.fiscais || [];
    const vocacoes = rawData.vocacoes || [];

    const extrairValDemo = (k, fb = 0) => (demo && demo[k] && demo[k][0] !== undefined) ? demo[k][0] : fb;
    const extrairInd = (sigla, fb = 0) => {
        const itens = ind.filter(i => String(i.sigla_indicador || '').toLowerCase().trim() === String(sigla).toLowerCase().trim());
        if (!itens.length) return fb;
        itens.sort((a, b) => b.ano - a.ano);
        const val = parseFloat(String(itens[0].indicador).replace(',', '.'));
        return isNaN(val) ? fb : val;
    };
    const extrairIndRecenteObj = (sigla) => {
        const itens = ind.filter(i => String(i.sigla_indicador || '').toLowerCase().trim() === String(sigla).toLowerCase().trim());
        if (!itens.length) return null;
        itens.sort((a, b) => b.ano - a.ano);
        return itens[0];
    };

    // 1. Demografia
    const pop = parseFloat(extrairValDemo('pop_2026', 0)) || 0;
    const area = parseFloat(extrairValDemo('area_km2', 0)) || 0;
    const densidade = (area > 0 && pop > 0) ? (pop / area) : 0;
    const pctUrb = extrairInd('perc_pop_urb', 0);
    const pctPia = extrairInd('pct_pia', 0);
    const indEnvelhecimento = extrairInd('ind_envelhecimento', 0);
    const rd = extrairValDemo('regiao_de_desenvolvimento', '-');
    const popQuilombola = extrairInd('pop_quilombola', 0);
    const popIndigena = extrairInd('pop_indigena', 0);
    const itemPrefeito = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'nome_prefeito');
    const itemPartido = (ind || []).find(i => String(i.sigla_indicador || '').toLowerCase().trim() === 'partido_prefeito');
    const nomePrefeito = (itemPrefeito && itemPrefeito.indicador && itemPrefeito.indicador !== '-') ? String(itemPrefeito.indicador).trim() : '-';
    const partidoPrefeito = (itemPartido && itemPartido.indicador && itemPartido.indicador !== '-') ? String(itemPartido.indicador).trim() : '';
    const prefeitoCompleto = nomePrefeito !== '-' ? (partidoPrefeito ? `${nomePrefeito} (${partidoPrefeito})` : nomePrefeito) : '-';

    // 2. Economia
    const pibpc = extrairInd('pibpc', 0);
    const pibTotalMil = extrairInd('pib_1000', 0);
    const pibPct = extrairInd('pib_pct', 0);
    const vabAgro = extrairInd('vab_agro', 0);
    const vabInd = extrairInd('vab_ind', 0);
    const vabServ = extrairInd('vab_serv', 0);
    const vabAdm = extrairInd('vab_adm', 0);
    const totalVab = (vabAgro + vabInd + vabServ + vabAdm) || 1;
    const pctVabAgro = (vabAgro / totalVab) * 100;
    const pctVabInd = (vabInd / totalVab) * 100;
    const pctVabServ = (vabServ / totalVab) * 100;
    const pctVabAdm = (vabAdm / totalVab) * 100;
    const qlInd = pctVabInd / 10.672;

    // 3. Social
    const idhm = extrairInd('idhm', 0);
    const gini = extrairInd('indice_gini', 0);
    let txCad = extrairInd('tx_cad_pessoas', 0);
    if (txCad === 0 && pop > 0) {
        const cadPessoas = extrairInd('cad_pessoas', 0);
        if (cadPessoas > 0) txCad = (cadPessoas / pop) * 100;
    }
    const ivcadDr = extrairInd('ivcad_dr', extrairInd('ivcad_taxa', 0));
    const agua = extrairInd('pct_agua_rede', 0);
    const ideb = extrairInd('ideb_5ano', 0);

    // 4. Fiscal
    let capag = '-';
    const itemCapag = ind.find(i => String(i.sigla_indicador || i.nm_indicador || '').toLowerCase().trim() === 'capag');
    if (itemCapag && itemCapag.indicador && String(itemCapag.indicador).trim() !== 'NA') {
        capag = String(itemCapag.indicador).trim().toUpperCase();
    } else if (demo && (demo.capag || demo.CAPAG)) {
        capag = String(demo.capag || demo.CAPAG).trim().toUpperCase();
    }

    let maxEx = 0;
    fiscais.forEach(f => {
        const ex = parseInt(f.exercicio) || 0;
        if (ex > maxEx) maxEx = ex;
    });
    const fiscaisRecentes = fiscais.filter(f => parseInt(f.exercicio) === maxEx);
    const getFisc = (term) => {
        const matches = fiscaisRecentes.filter(f => String(f.indicador || '').toLowerCase().includes(term.toLowerCase()));
        if (!matches.length) return 0;
        matches.sort((a, b) => (parseInt(b.periodo) || 0) - (parseInt(a.periodo) || 0));
        return parseFloat(matches[0].valor) || 0;
    };

    const custeio = getFisc('Despesas Correntes') || getFisc('Custeio');
    const pessoal = getFisc('Pessoal') || getFisc('DTP');
    const investimentos = getFisc('Investimentos') || getFisc('Despesas de Capital');
    const amortizacao = getFisc('Amortização');
    const juros = getFisc('Juros');
    const servicoDivida = amortizacao + juros;
    const recCapital = getFisc('Receitas de Capital');

    // 5. Inovação & Fibra
    const fibraVal = extrairInd('cob_fibra', 0);
    const fibraPct = fibraVal <= 1 && fibraVal > 0 ? (fibraVal * 100) : fibraVal;
    const pctVabInfocom = extrairInd('pct_vab_infocom_serv', 0);
    const qlInfocom = extrairInd('ql_infocom_serv', 0);
    const estabInfocom = extrairInd('estab_infocom', 0);

    // 6. Dinâmica das Empresas (SEPLAG)
    const empRes = (rawData.empresas_resumo && rawData.empresas_resumo[0]) || rawData.empresas_resumo || {};
    const empAtivas = parseFloat(empRes.total_ativas) || 0;
    const empMei = parseFloat(empRes.total_mei) || 0;
    const empMe = parseFloat(empRes.total_me) || 0;
    const empEpp = parseFloat(empRes.total_epp) || 0;
    const empDensidade = parseFloat(empRes.empresas_por_mil_hab) || (pop > 0 ? (empAtivas / pop) * 1000 : 0);
    const empTaxaMei = parseFloat(empRes.taxa_meizacao) || (empAtivas > 0 ? (empMei / empAtivas) * 100 : 0);
    const empSaldo12m = parseFloat(empRes.saldo_12m) || 0;
    const empAberturas12m = parseFloat(empRes.aberturas_12m) || 0;
    const empFechamentos12m = parseFloat(empRes.fechamentos_12m) || 0;
    const empIdadeMedia = parseFloat(empRes.idade_media_ativas) || 0;
    const empTempoSobrevivencia = parseFloat(empRes.tempo_medio_vida_inativas) || 0;
    const empCapitalTotal = parseFloat(empRes.capital_social_total) || 0;
    const empCapitalMediano = parseFloat(empRes.capital_social_mediano) || 0;
    const empSaldoMensal = rawData.empresas_saldo_mensal || [];
    const empSetor = rawData.empresas_setor || [];

    // 7. Agricultura (PAM IBGE)
    const pamDados = rawData.agricultura_pam || [];
    let agriValorProducao = 0;
    let agriAreaColhida = 0;
    if (pamDados.length > 0) {
        const pamOrdenado = [...pamDados].sort((a, b) => (parseInt(b.ano) || 0) - (parseInt(a.ano) || 0));
        const maisRecente = pamOrdenado[0];
        agriValorProducao = parseFloat(maisRecente.valor_da_producao) || 0;
        agriAreaColhida = parseFloat(maisRecente.area_colhida) || 0;
    }

    return {
        nome: nomeMun,
        rd,
        pop,
        area,
        densidade,
        pctUrb,
        pctPia,
        indEnvelhecimento,
        pibpc,
        pibTotalMil,
        pibPct,
        pctVabAgro,
        pctVabInd,
        pctVabServ,
        pctVabAdm,
        qlInd,
        idhm,
        txCad,
        ivcadDr,
        agua,
        ideb,
        capag,
        custeio,
        pessoal,
        investimentos,
        servicoDivida,
        recCapital,
        fibraPct,
        pctVabInfocom,
        qlInfocom,
        estabInfocom,
        popQuilombola,
        popIndigena,
        prefeitoCompleto,
        gini,
        empAtivas,
        empMei,
        empMe,
        empEpp,
        empDensidade,
        empTaxaMei,
        empSaldo12m,
        empAberturas12m,
        empFechamentos12m,
        empIdadeMedia,
        empTempoSobrevivencia,
        empCapitalTotal,
        empCapitalMediano,
        empSaldoMensal,
        empSetor,
        agriValorProducao,
        agriAreaColhida,
        agriPamDados: pamDados
    };
}

function renderizarPainelComparativo(m1Nome, d1Raw, m2Nome, d2Raw, m3Nome, d3Raw) {
    const m1 = extrairMetricasComparacao(m1Nome, d1Raw);
    const m2 = extrairMetricasComparacao(m2Nome, d2Raw);
    const m3 = m3Nome ? extrairMetricasComparacao(m3Nome, d3Raw) : null;

    if (!m1 || !m2) return;

    // Atualiza badges e metadados nos 3 cards do topo
    $('#comp_badge_rd_mun1').text(m1.rd);
    $('#comp_pop_mun1').text(m1.pop > 0 ? m1.pop.toLocaleString('pt-BR') + ' hab.' : '-');
    $('#comp_pibpc_mun1').text(m1.pibpc > 0 ? 'R$ ' + m1.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-');

    $('#comp_badge_rd_mun2').text(m2.rd);
    $('#comp_pop_mun2').text(m2.pop > 0 ? m2.pop.toLocaleString('pt-BR') + ' hab.' : '-');
    $('#comp_pibpc_mun2').text(m2.pibpc > 0 ? 'R$ ' + m2.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-');

    if (m3) {
        $('#comp_badge_rd_mun3').text(m3.rd).removeClass('d-none');
        $('#comp_pop_mun3').text(m3.pop > 0 ? m3.pop.toLocaleString('pt-BR') + ' hab.' : '-');
        $('#comp_pibpc_mun3').text(m3.pibpc > 0 ? 'R$ ' + m3.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-');
        $('#comp_th_mun3').text(m3.nome).removeClass('d-none');
    } else {
        $('#comp_badge_rd_mun3').text('-').addClass('d-none');
        $('#comp_pop_mun3').text('-');
        $('#comp_pibpc_mun3').text('-');
        $('#comp_th_mun3').text('Município 3 (Desativado)').addClass('d-none');
    }

    $('#comp_th_mun1').text(m1.nome);
    $('#comp_th_mun2').text(m2.nome);

    // 1. Resumo Executivo Multidimensional Comparativo
    renderizarResumoExecutivoComparativo(m1, m2, m3);

    // 2. Gráfico Radial / Radar das 5 Dimensões
    renderizarRadarComparativo(m1, m2, m3);

    // 3. Gráfico de Pirulito (Lollipop) Estratégico
    renderizarLollipopSocioeconomico(m1, m2, m3);

    // 4. Gráfico de VAB Setorial
    renderizarVabComparativo(m1, m2, m3);

    // 5. Gráfico de Pirulito (Lollipop) Fiscal
    renderizarLollipopFiscal(m1, m2, m3);

    // 5b. Dinâmica das Empresas Comparativo
    renderizarEmpresasComparativo(m1, m2, m3);

    // 5c. Agricultura Comparativo (PAM IBGE)
    renderizarAgriculturaComparativo(m1, m2, m3);

    // 6. Matriz de Confronto Direto por Dimensões
    renderizarTabelaConfronto(m1, m2, m3);
}

function renderizarResumoExecutivoComparativo(m1, m2, m3) {
    const $container = $('#comp_container_resumo_executivo');
    if (!$container.length) return;

    const lista = [m1, m2, m3].filter(Boolean);
    const liderPibpc = [...lista].sort((a, b) => b.pibpc - a.pibpc)[0];
    const liderIdhm = [...lista].sort((a, b) => b.idhm - a.idhm)[0];
    const liderPop = [...lista].sort((a, b) => b.pop - a.pop)[0];
    const liderFibra = [...lista].sort((a, b) => b.fibraPct - a.fibraPct)[0];

    const badgesHtml = lista.map((m, idx) => {
        const cores = ['#ff5a26', '#059669', '#7c3aed'];
        const cor = cores[idx % cores.length];
        return `
            <span class="badge rounded-pill px-3 py-1.5 text-xs font-bold text-white shadow-2xs" style="background-color: ${cor};">
                <i class="fas fa-city me-1"></i> ${m.nome} (Pop: ${m.pop.toLocaleString('pt-BR')} &bull; PIB pc: R$ ${m.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
            </span>
        `;
    }).join('');

    const html = `
        <div class="resumo-exec-banner mb-2">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-white text-orange-950 font-black px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs shadow-xs">
                        <i class="fas fa-balance-scale me-1 text-[#ff5a26]"></i> Síntese Estratégica Comparativa
                    </span>
                    <span class="text-orange-100 font-semibold text-xs">Confronto Multidimensional de Indicadores Oficiais</span>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    ${badgesHtml}
                </div>
            </div>
            <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                No confronto direto entre <strong>${lista.map(m => m.nome).join(', ')}</strong>, 
                o município de <strong>${liderPibpc.nome}</strong> destaca-se com o maior PIB per capita (<strong>R$ ${liderPibpc.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>), 
                enquanto <strong>${liderIdhm.nome}</strong> lidera o Índice de Desenvolvimento Humano (<strong>IDHM ${liderIdhm.idhm.toFixed(3)}</strong>). 
                Em escala demográfica, <strong>${liderPop.nome}</strong> concentra o maior contingente populacional (<strong>${liderPop.pop.toLocaleString('pt-BR')} habitantes</strong>). 
                Na infraestrutura digital, <strong>${liderFibra.nome}</strong> atinge a maior cobertura de fibra óptica (<strong>${liderFibra.fibraPct.toFixed(1)}%</strong>). 
                A análise das 5 dimensões evidencia perfis complementares em estrutura produtiva, capacidade fiscal e bem-estar social.
            </p>
        </div>
    `;

    $container.html(html);
}

function calcularScoreDimensao(m, dim) {
    if (!m) return 0;
    if (dim === 'demografia') {
        const scorePop = Math.min(100, (Math.log10(Math.max(1000, m.pop)) / Math.log10(1700000)) * 100);
        const scoreUrb = Math.min(100, m.pctUrb);
        return Math.round((scorePop * 0.5) + (scoreUrb * 0.5));
    }
    if (dim === 'economia') {
        const scorePibpc = Math.min(100, (m.pibpc / 60000) * 100);
        const scoreQl = Math.min(100, (m.qlInd / 2.5) * 100);
        return Math.round((scorePibpc * 0.6) + (scoreQl * 0.4));
    }
    if (dim === 'social') {
        const scoreIdhm = Math.min(100, (m.idhm / 0.85) * 100);
        const scoreIdeb = Math.min(100, (m.ideb / 7.5) * 100);
        return Math.round((scoreIdhm * 0.6) + (scoreIdeb * 0.4));
    }
    if (dim === 'fiscal') {
        const capScore = m.capag.startsWith('A') ? 95 : m.capag.startsWith('B') ? 80 : m.capag.startsWith('C') ? 55 : m.capag.startsWith('D') ? 35 : 60;
        return capScore;
    }
    if (dim === 'inovacao') {
        const scoreFibra = Math.min(100, m.fibraPct);
        const scoreVabInfo = Math.min(100, (m.pctVabInfocom / 15) * 100);
        return Math.round((scoreFibra * 0.6) + (scoreVabInfo * 0.4));
    }
    return 50;
}

function renderizarRadarComparativo(m1, m2, m3) {
    const dom = document.getElementById('comp_chart_radar_dimensoes');
    if (!dom || typeof echarts === 'undefined') return;

    if (window.chartsComparacao.radar) {
        window.chartsComparacao.radar.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.radar = chart;

    const lista = [
        { mun: m1, cor: '#ff5a26' },
        { mun: m2, cor: '#059669' },
        m3 ? { mun: m3, cor: '#7c3aed' } : null
    ].filter(Boolean);

    const dims = ['demografia', 'economia', 'social', 'fiscal', 'inovacao'];
    const seriesData = lista.map(it => {
        const vals = dims.map(d => calcularScoreDimensao(it.mun, d));
        return {
            name: it.mun.nome,
            value: vals,
            itemStyle: { color: it.cor },
            lineStyle: { width: 3, color: it.cor },
            areaStyle: { opacity: 0.22, color: it.cor }
        };
    });

    const option = {
        tooltip: {
            trigger: 'item',
            confine: true,
            formatter: function(params) {
                const names = ['1. Demografia & Escala', '2. Economia & Riqueza', '3. Social & IDHM', '4. Gestão Fiscal', '5. Inovação & Fibra'];
                let out = `<div class="font-bold text-xs mb-1" style="color: ${params.color};">${params.name}</div>`;
                params.value.forEach((v, idx) => {
                    out += `<div class="d-flex justify-content-between gap-3 text-xs"><span>${names[idx]}:</span> <strong>${v}/100</strong></div>`;
                });
                return out;
            }
        },
        legend: {
            bottom: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        radar: {
            indicator: [
                { name: '1. Demografia', max: 100 },
                { name: '2. Economia', max: 100 },
                { name: '3. Social', max: 100 },
                { name: '4. Fiscal', max: 100 },
                { name: '5. Inovação', max: 100 }
            ],
            splitNumber: 4,
            radius: '68%',
            axisName: {
                color: '#334155',
                fontWeight: 'bold',
                fontSize: 11
            },
            splitArea: {
                areaStyle: {
                    color: ['#f8fafc', '#ffffff', '#f1f5f9', '#ffffff']
                }
            }
        },
        series: [{
            type: 'radar',
            data: seriesData
        }]
    };

    chart.setOption(option);
}

function renderizarLollipopSocioeconomico(m1, m2, m3) {
    const dom = document.getElementById('comp_chart_lollipop_principais');
    if (!dom || typeof echarts === 'undefined') return;

    if (window.chartsComparacao.lollipopGeral) {
        window.chartsComparacao.lollipopGeral.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.lollipopGeral = chart;

    const lista = [
        { mun: m1, cor: '#ff5a26' },
        { mun: m2, cor: '#059669' },
        m3 ? { mun: m3, cor: '#7c3aed' } : null
    ].filter(Boolean);

    const categories = [
        'IDEB Anos Iniciais (x10)',
        'QL Indústria (x10)',
        'PIA Produtiva (%)',
        'Taxa Urbanização (%)',
        'Cob. Fibra Óptica (%)',
        'IDHM (x100)'
    ];

    const extrairValoresLollipop = (m) => [
        Math.round(m.ideb * 10),
        Math.round(m.qlInd * 10),
        Math.round(m.pctPia),
        Math.round(m.pctUrb),
        Math.round(m.fibraPct),
        Math.round(m.idhm * 100)
    ];

    const series = lista.map(it => {
        const vals = extrairValoresLollipop(it.mun);
        return {
            name: it.mun.nome,
            type: 'bar',
            barWidth: 4,
            barGap: '40%',
            itemStyle: { color: it.cor, borderRadius: [0, 4, 4, 0] },
            data: vals,
            markPoint: {
                symbol: 'circle',
                symbolSize: 13,
                itemStyle: { color: it.cor },
                label: { show: false },
                data: vals.map((v, i) => ({ coord: [v, i], value: v }))
            }
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            confine: true
        },
        legend: {
            bottom: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 20,
            left: '3%',
            right: '4%',
            bottom: 45,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: { fontSize: 10 }
        },
        yAxis: {
            type: 'category',
            data: categories,
            axisLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' }
        },
        series: series
    };

    chart.setOption(option);
}

function renderizarLollipopFiscal(m1, m2, m3) {
    const dom = document.getElementById('comp_chart_lollipop_fiscal');
    if (!dom || typeof echarts === 'undefined') return;

    if (window.chartsComparacao.lollipopFiscal) {
        window.chartsComparacao.lollipopFiscal.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.lollipopFiscal = chart;

    const lista = [
        { mun: m1, cor: '#ff5a26' },
        { mun: m2, cor: '#059669' },
        m3 ? { mun: m3, cor: '#7c3aed' } : null
    ].filter(Boolean);

    const categories = [
        'Rec. Capital (R$ Mi)',
        'Serviço Dívida (R$ Mi)',
        'Investimentos (R$ Mi)',
        'Pessoal (R$ Mi)',
        'Custeio (R$ Mi)'
    ];

    const toMi = (val) => Math.round((val / 1e6) * 10) / 10;

    const series = lista.map(it => {
        const vals = [
            toMi(it.mun.recCapital),
            toMi(it.mun.servicoDivida),
            toMi(it.mun.investimentos),
            toMi(it.mun.pessoal),
            toMi(it.mun.custeio)
        ];
        return {
            name: it.mun.nome,
            type: 'bar',
            barWidth: 4,
            barGap: '40%',
            itemStyle: { color: it.cor, borderRadius: [0, 4, 4, 0] },
            data: vals,
            markPoint: {
                symbol: 'circle',
                symbolSize: 13,
                itemStyle: { color: it.cor },
                label: { show: false },
                data: vals.map((v, i) => ({ coord: [v, i], value: v }))
            }
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1">${params[0].name}</div>`;
                params.forEach(p => {
                    out += `<div class="d-flex justify-content-between gap-3 text-xs"><span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span> <strong>R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} Mi</strong></div>`;
                });
                return out;
            }
        },
        legend: {
            bottom: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 20,
            left: '3%',
            right: '4%',
            bottom: 45,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: {
                fontSize: 10,
                formatter: 'R$ {value}M'
            }
        },
        yAxis: {
            type: 'category',
            data: categories,
            axisLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' }
        },
        series: series
    };

    chart.setOption(option);
}

function renderizarVabComparativo(m1, m2, m3) {
    const dom = document.getElementById('comp_chart_vab_setorial');
    if (!dom || typeof echarts === 'undefined') return;

    if (window.chartsComparacao.vab) {
        window.chartsComparacao.vab.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.vab = chart;

    const lista = [
        { mun: m1, cor: '#ff5a26' },
        { mun: m2, cor: '#059669' },
        m3 ? { mun: m3, cor: '#7c3aed' } : null
    ].filter(Boolean);

    const categories = ['Agropecuária', 'Indústria', 'Serviços', 'Adm. Pública'];

    const series = lista.map(it => {
        const vals = [
            Math.round(it.mun.pctVabAgro * 10) / 10,
            Math.round(it.mun.pctVabInd * 10) / 10,
            Math.round(it.mun.pctVabServ * 10) / 10,
            Math.round(it.mun.pctVabAdm * 10) / 10
        ];
        return {
            name: it.mun.nome,
            type: 'bar',
            itemStyle: { color: it.cor, borderRadius: [4, 4, 0, 0] },
            data: vals,
            label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
                fontSize: 10,
                fontWeight: 'bold',
                color: '#334155'
            }
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1">${params[0].name} (% do VAB)</div>`;
                params.forEach(p => {
                    out += `<div class="d-flex justify-content-between gap-3 text-xs"><span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span> <strong>${p.value.toFixed(1)}%</strong></div>`;
                });
                return out;
            }
        },
        legend: {
            bottom: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 30,
            left: '3%',
            right: '4%',
            bottom: 45,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' }
        },
        yAxis: {
            type: 'value',
            max: 100,
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: {
                formatter: '{value}%',
                fontSize: 10
            }
        },
        series: series
    };

    chart.setOption(option);
}

function renderizarEmpresasComparativo(m1, m2, m3) {
    const lista = [m1, m2, m3].filter(Boolean);
    const cores = ['#2563eb', '#059669', '#7c3aed'];

    // 1. Cards de Confronto de KPIs
    const $containerKpis = $('#comp_container_kpis_empresas');
    if ($containerKpis.length) {
        $containerKpis.empty();

        const buildMunRow = (nome, valFmt, subFmt, idx) => {
            const cor = cores[idx % cores.length];
            return `
                <div class="d-flex justify-content-between align-items-center py-1 border-b border-slate-100 last:border-0 text-xs">
                    <span class="font-bold d-flex align-items-center gap-1.5" style="color: ${cor};">
                        <span class="w-2 h-2 rounded-circle" style="background-color: ${cor};"></span>
                        ${nome}
                    </span>
                    <div class="text-end">
                        <strong class="text-slate-800">${valFmt}</strong>
                        ${subFmt ? `<span class="text-[10px] text-slate-500 block">${subFmt}</span>` : ''}
                    </div>
                </div>
            `;
        };

        // Card 1: Empresas Ativas e Densidade
        let rowsCard1 = '';
        lista.forEach((m, idx) => {
            rowsCard1 += buildMunRow(
                m.nome, 
                m.empAtivas.toLocaleString('pt-BR') + ' ativas', 
                m.empDensidade.toFixed(1) + ' / 1k hab.', 
                idx
            );
        });

        // Card 2: MEIzação e Idade Média
        let rowsCard2 = '';
        lista.forEach((m, idx) => {
            rowsCard2 += buildMunRow(
                m.nome, 
                m.empTaxaMei.toFixed(1) + '% MEIs', 
                m.empIdadeMedia > 0 ? (m.empIdadeMedia.toFixed(1) + ' anos idade média') : 'Idade n.d.', 
                idx
            );
        });

        // Card 3: Saldo Líquido 12m & Tendência
        let rowsCard3 = '';
        lista.forEach((m, idx) => {
            const sinal = m.empSaldo12m > 0 ? '+' : '';
            const tendBadge = m.empSaldo12m > 0 
                ? '<span class="text-emerald-700 font-bold">▲ Expansão</span>' 
                : (m.empSaldo12m < 0 ? '<span class="text-rose-700 font-bold">▼ Queda</span>' : '<span class="text-slate-500">Estável</span>');
            rowsCard3 += buildMunRow(
                m.nome, 
                sinal + m.empSaldo12m.toLocaleString('pt-BR'), 
                tendBadge, 
                idx
            );
        });

        $containerKpis.append(`
            <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
                <div class="d-flex align-items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <i class="fas fa-building text-blue-600 text-xs"></i>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Parque Empresarial &amp; Densidade</span>
                </div>
                ${rowsCard1}
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
                <div class="d-flex align-items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <i class="fas fa-id-badge text-amber-600 text-xs"></i>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider">MEIzação &amp; Maturidade</span>
                </div>
                ${rowsCard2}
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
                <div class="d-flex align-items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <i class="fas fa-arrow-trend-up text-emerald-600 text-xs"></i>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Saldo Líquido 12m &amp; Ritmo</span>
                </div>
                ${rowsCard3}
            </div>
        `);
    }

    // 2. Gráfico de Linhas: Evolução do Saldo Líquido Mensal
    renderizarLinhasSaldoComparativo(lista);

    // 3. Gráfico de Barras: Composição por Grande Setor
    renderizarSetoresComparativo(lista);
}

function renderizarLinhasSaldoComparativo(lista) {
    const dom = document.getElementById('comp_chart_empresas_saldo_linhas');
    if (!dom || typeof echarts === 'undefined') return;

    window.chartsComparacao = window.chartsComparacao || {};
    if (window.chartsComparacao.empSaldo) {
        window.chartsComparacao.empSaldo.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.empSaldo = chart;

    const cores = ['#2563eb', '#059669', '#7c3aed'];

    // Coletar todos os meses a partir de 2020
    const mesesSet = new Set();
    lista.forEach(m => {
        (m.empSaldoMensal || []).forEach(d => {
            if (d.ano >= 2020 && d.ano_mes) mesesSet.add(d.ano_mes);
        });
    });
    const meses = Array.from(mesesSet).sort();

    if (!meses.length) {
        chart.setOption({
            title: { text: 'Sem histórico mensal disponível', left: 'center', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } }
        });
        return;
    }

    const series = lista.map((m, idx) => {
        const mapaSaldo = {};
        (m.empSaldoMensal || []).forEach(d => {
            mapaSaldo[d.ano_mes] = parseInt(d.saldo) || 0;
        });
        const dataVals = meses.map(mes => mapaSaldo[mes] !== undefined ? mapaSaldo[mes] : null);

        return {
            name: m.nome,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbolSize: 4,
            itemStyle: { color: cores[idx % cores.length] },
            lineStyle: { width: 2.5 },
            data: dataVals
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1">${params[0].name} (Saldo Líquido)</div>`;
                params.forEach(p => {
                    const sinal = p.value > 0 ? '+' : '';
                    out += `<div class="d-flex justify-content-between gap-3 text-xs">
                        <span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span>
                        <strong>${p.value !== null ? (sinal + p.value.toLocaleString('pt-BR')) : '-'}</strong>
                    </div>`;
                });
                return out;
            }
        },
        legend: {
            top: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 35,
            left: '3%',
            right: '4%',
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: meses,
            axisLabel: {
                fontSize: 10,
                color: '#64748b',
                formatter: (val) => val ? val.substring(2) : ''
            }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: { fontSize: 10, color: '#64748b' }
        },
        dataZoom: [
            { type: 'inside', start: 40, end: 100 },
            { type: 'slider', bottom: 5, height: 18, start: 40, end: 100, borderColor: '#e2e8f0' }
        ],
        series: series
    };

    chart.setOption(option);
}

function renderizarSetoresComparativo(lista) {
    const dom = document.getElementById('comp_chart_empresas_setor_barras');
    if (!dom || typeof echarts === 'undefined') return;

    window.chartsComparacao = window.chartsComparacao || {};
    if (window.chartsComparacao.empSetor) {
        window.chartsComparacao.empSetor.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.empSetor = chart;

    const cores = ['#2563eb', '#059669', '#7c3aed'];

    // Obter todos os setores presentes
    const setoresSet = new Set();
    lista.forEach(m => {
        (m.empSetor || []).forEach(s => {
            if (s.grande_setor) setoresSet.add(s.grande_setor);
        });
    });
    const setores = Array.from(setoresSet);

    // Ordenar os setores pelo total somado
    setores.sort((a, b) => {
        const sumA = lista.reduce((acc, m) => {
            const item = (m.empSetor || []).find(s => s.grande_setor === a);
            return acc + (item ? (parseInt(item.total_ativas) || 0) : 0);
        }, 0);
        const sumB = lista.reduce((acc, m) => {
            const item = (m.empSetor || []).find(s => s.grande_setor === b);
            return acc + (item ? (parseInt(item.total_ativas) || 0) : 0);
        }, 0);
        return sumB - sumA;
    });

    const topSetores = setores.slice(0, 7);

    const series = lista.map((m, idx) => {
        const mapa = {};
        (m.empSetor || []).forEach(s => {
            mapa[s.grande_setor] = parseInt(s.total_ativas) || 0;
        });
        const vals = topSetores.map(s => mapa[s] || 0);

        return {
            name: m.nome,
            type: 'bar',
            itemStyle: { color: cores[idx % cores.length], borderRadius: [3, 3, 0, 0] },
            data: vals
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1">${params[0].name} (Empresas Ativas)</div>`;
                params.forEach(p => {
                    out += `<div class="d-flex justify-content-between gap-3 text-xs">
                        <span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span>
                        <strong>${p.value.toLocaleString('pt-BR')}</strong>
                    </div>`;
                });
                return out;
            }
        },
        legend: {
            top: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 35,
            left: '3%',
            right: '4%',
            bottom: 45,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: topSetores,
            axisLabel: {
                fontSize: 10,
                fontWeight: 'bold',
                color: '#334155',
                interval: 0,
                width: 75,
                overflow: 'truncate'
            }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: { fontSize: 10, color: '#64748b' }
        },
        series: series
    };

    chart.setOption(option);
}

function renderizarAgriculturaComparativo(m1, m2, m3) {
    const lista = [m1, m2, m3].filter(Boolean);
    const cores = ['#2563eb', '#059669', '#7c3aed'];

    // 1. Cards de Confronto de KPIs
    const $containerKpis = $('#comp_container_kpis_agricultura');
    if ($containerKpis.length) {
        $containerKpis.empty();

        const buildMunRow = (nome, valFmt, subFmt, idx) => {
            const cor = cores[idx % cores.length];
            return `
                <div class="d-flex justify-content-between align-items-center py-1 border-b border-slate-100 last:border-0 text-xs">
                    <span class="font-bold d-flex align-items-center gap-1.5" style="color: ${cor};">
                        <span class="w-2 h-2 rounded-circle" style="background-color: ${cor};"></span>
                        ${nome}
                    </span>
                    <div class="text-end">
                        <strong class="text-slate-800">${valFmt}</strong>
                        ${subFmt ? `<span class="text-[10px] text-slate-500 block">${subFmt}</span>` : ''}
                    </div>
                </div>
            `;
        };

        // Card 1: Valor da Produção Agrícola (PAM 2025)
        let rowsCard1 = '';
        lista.forEach((m, idx) => {
            const val = m.agriValorProducao * 1000;
            const valFmt = val >= 1e6 ? `R$ ${(val / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi` : `R$ ${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
            rowsCard1 += buildMunRow(
                m.nome,
                valFmt,
                'Safra 2025 (IBGE/PAM)',
                idx
            );
        });

        // Card 2: Área Colhida (PAM 2025)
        let rowsCard2 = '';
        lista.forEach((m, idx) => {
            rowsCard2 += buildMunRow(
                m.nome,
                m.agriAreaColhida.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha',
                'Área total colhida',
                idx
            );
        });

        $containerKpis.append(`
            <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
                <div class="d-flex align-items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <i class="fas fa-wheat-awn text-emerald-600 text-xs"></i>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Valor da Produção Agrícola (2025)</span>
                </div>
                ${rowsCard1}
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
                <div class="d-flex align-items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <i class="fas fa-vector-square text-amber-600 text-xs"></i>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Área Colhida (2025)</span>
                </div>
                ${rowsCard2}
            </div>
        `);
    }

    // 2. Gráfico de Barras: Evolução do Valor da Produção (2021-2025)
    const dom = document.getElementById('comp_chart_agricultura_barras');
    if (!dom || typeof echarts === 'undefined') return;

    window.chartsComparacao = window.chartsComparacao || {};
    if (window.chartsComparacao.agriBarras) {
        window.chartsComparacao.agriBarras.dispose();
    }
    const chart = echarts.init(dom);
    window.chartsComparacao.agriBarras = chart;

    const anos = ['2021', '2022', '2023', '2024', '2025'];

    const series = lista.map((m, idx) => {
        const mapaAno = {};
        (m.agriPamDados || []).forEach(d => {
            mapaAno[String(d.ano)] = (parseFloat(d.valor_da_producao) || 0) * 1000;
        });
        const dataVals = anos.map(ano => mapaAno[ano] !== undefined ? mapaAno[ano] : 0);

        return {
            name: m.nome,
            type: 'bar',
            itemStyle: { color: cores[idx % cores.length], borderRadius: [4, 4, 0, 0] },
            data: dataVals
        };
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            confine: true,
            formatter: function(params) {
                let out = `<div class="font-bold text-xs mb-1">Safra ${params[0].name} (Valor da Produção)</div>`;
                params.forEach(p => {
                    const v = p.value || 0;
                    const valFmt = v >= 1e6 ? `R$ ${(v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mi` : `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
                    out += `<div class="d-flex justify-content-between gap-3 text-xs">
                        <span style="color:${p.color}; font-weight:bold;">${p.seriesName}:</span>
                        <strong>${valFmt}</strong>
                    </div>`;
                });
                return out;
            }
        },
        legend: {
            top: 0,
            textStyle: { fontSize: 11, fontWeight: 'bold' }
        },
        grid: {
            top: 35,
            left: '3%',
            right: '4%',
            bottom: 30,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: anos,
            axisLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { stroke: '#f1f5f9' } },
            axisLabel: {
                fontSize: 10,
                color: '#64748b',
                formatter: function(val) {
                    if (val >= 1e6) return 'R$ ' + (val / 1e6).toFixed(0) + 'M';
                    if (val >= 1e3) return 'R$ ' + (val / 1e3).toFixed(0) + 'k';
                    return val;
                }
            }
        },
        series: series
    };

    chart.setOption(option);
}

function renderizarTabelaConfronto(m1, m2, m3) {
    const $tbody = $('#comp_tbody_confronto');
    if (!$tbody.length) return;
    $tbody.empty();

    const temM3 = Boolean(m3);

const fmtMoeda = (val) => {
    const v = Number(val) || 0;
    if (v === 0) return "R$ 0";
    if (v >= 1e9) {
        return `R$ ${(v / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bi`;
    }
    if (v >= 1e6) {
        return `R$ ${(v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mi`;
    }
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

    const metricas = [
        // 1. DEMOGRAFIA
        { dim: 'Demografia', nome: 'População Estimada (2026)', u1: m1.pop.toLocaleString('pt-BR') + ' hab.', u2: m2.pop.toLocaleString('pt-BR') + ' hab.', u3: temM3 ? m3.pop.toLocaleString('pt-BR') + ' hab.' : '-', v1: m1.pop, v2: m2.pop, v3: temM3 ? m3.pop : -1 },
        { dim: 'Demografia', nome: 'População Quilombola', u1: m1.popQuilombola.toLocaleString('pt-BR') + ' hab.', u2: m2.popQuilombola.toLocaleString('pt-BR') + ' hab.', u3: temM3 ? m3.popQuilombola.toLocaleString('pt-BR') + ' hab.' : '-', v1: m1.popQuilombola, v2: m2.popQuilombola, v3: temM3 ? m3.popQuilombola : -1 },
        { dim: 'Demografia', nome: 'População Indígena', u1: m1.popIndigena.toLocaleString('pt-BR') + ' hab.', u2: m2.popIndigena.toLocaleString('pt-BR') + ' hab.', u3: temM3 ? m3.popIndigena.toLocaleString('pt-BR') + ' hab.' : '-', v1: m1.popIndigena, v2: m2.popIndigena, v3: temM3 ? m3.popIndigena : -1 },
        { dim: 'Demografia', nome: 'Densidade Demográfica', u1: m1.densidade.toFixed(1) + ' hab/km²', u2: m2.densidade.toFixed(1) + ' hab/km²', u3: temM3 ? m3.densidade.toFixed(1) + ' hab/km²' : '-', v1: m1.densidade, v2: m2.densidade, v3: temM3 ? m3.densidade : -1 },
        { dim: 'Demografia', nome: 'Taxa de Urbanização', u1: m1.pctUrb.toFixed(1) + '%', u2: m2.pctUrb.toFixed(1) + '%', u3: temM3 ? m3.pctUrb.toFixed(1) + '%' : '-', v1: m1.pctUrb, v2: m2.pctUrb, v3: temM3 ? m3.pctUrb : -1 },
        { dim: 'Demografia', nome: 'Pop. Idade Produtiva (PIA)', u1: m1.pctPia.toFixed(1) + '%', u2: m2.pctPia.toFixed(1) + '%', u3: temM3 ? m3.pctPia.toFixed(1) + '%' : '-', v1: m1.pctPia, v2: m2.pctPia, v3: temM3 ? m3.pctPia : -1 },
        { dim: 'Demografia', nome: 'Índice de Envelhecimento', u1: m1.indEnvelhecimento.toFixed(1), u2: m2.indEnvelhecimento.toFixed(1), u3: temM3 ? m3.indEnvelhecimento.toFixed(1) : '-', v1: m1.indEnvelhecimento, v2: m2.indEnvelhecimento, v3: temM3 ? m3.indEnvelhecimento : -1 },

        // 2. ECONOMIA
        { dim: 'Economia', nome: 'PIB Total', u1: fmtMoeda(m1.pibTotalMil * 1000), u2: fmtMoeda(m2.pibTotalMil * 1000), u3: temM3 ? fmtMoeda(m3.pibTotalMil * 1000) : '-', v1: m1.pibTotalMil, v2: m2.pibTotalMil, v3: temM3 ? m3.pibTotalMil : -1 },
        { dim: 'Economia', nome: 'PIB per Capita', u1: 'R$ ' + m1.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), u2: 'R$ ' + m2.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), u3: temM3 ? 'R$ ' + m3.pibpc.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-', v1: m1.pibpc, v2: m2.pibpc, v3: temM3 ? m3.pibpc : -1 },
        { dim: 'Economia', nome: 'Participação no PIB Estadual', u1: m1.pibPct.toFixed(2) + '%', u2: m2.pibPct.toFixed(2) + '%', u3: temM3 ? m3.pibPct.toFixed(2) + '%' : '-', v1: m1.pibPct, v2: m2.pibPct, v3: temM3 ? m3.pibPct : -1 },
        { dim: 'Economia', nome: 'Quociente Locacional Indústria (QL)', u1: m1.qlInd.toFixed(2), u2: m2.qlInd.toFixed(2), u3: temM3 ? m3.qlInd.toFixed(2) : '-', v1: m1.qlInd, v2: m2.qlInd, v3: temM3 ? m3.qlInd : -1 },

        // 3. SOCIAL
        { dim: 'Social', nome: 'IDHM (Desenvolvimento Humano)', u1: m1.idhm.toFixed(3), u2: m2.idhm.toFixed(3), u3: temM3 ? m3.idhm.toFixed(3) : '-', v1: m1.idhm, v2: m2.idhm, v3: temM3 ? m3.idhm : -1 },
        { dim: 'Social', nome: 'Índice de Gini (Desigualdade)', u1: m1.gini > 0 ? m1.gini.toFixed(2) : '-', u2: m2.gini > 0 ? m2.gini.toFixed(2) : '-', u3: temM3 ? (m3.gini > 0 ? m3.gini.toFixed(2) : '-') : '-', v1: m1.gini, v2: m2.gini, v3: temM3 ? m3.gini : -1, lowerIsBetter: true },
        { dim: 'Social', nome: 'População no CadÚnico (%)', u1: m1.txCad.toFixed(1) + '%', u2: m2.txCad.toFixed(1) + '%', u3: temM3 ? m3.txCad.toFixed(1) + '%' : '-', v1: m1.txCad, v2: m2.txCad, v3: temM3 ? m3.txCad : -1, lowerIsBetter: true },
        { dim: 'Social', nome: 'Dep. Recursos Transferência (IVCAD-DR)', u1: (m1.ivcadDr > 1 ? m1.ivcadDr.toFixed(1) + '%' : (m1.ivcadDr * 100).toFixed(1) + '%'), u2: (m2.ivcadDr > 1 ? m2.ivcadDr.toFixed(1) + '%' : (m2.ivcadDr * 100).toFixed(1) + '%'), u3: temM3 ? (m3.ivcadDr > 1 ? m3.ivcadDr.toFixed(1) + '%' : (m3.ivcadDr * 100).toFixed(1) + '%') : '-', v1: m1.ivcadDr, v2: m2.ivcadDr, v3: temM3 ? m3.ivcadDr : -1, lowerIsBetter: true },
        { dim: 'Social', nome: 'Água pela Rede Geral (%)', u1: m1.agua.toFixed(1) + '%', u2: m2.agua.toFixed(1) + '%', u3: temM3 ? m3.agua.toFixed(1) + '%' : '-', v1: m1.agua, v2: m2.agua, v3: temM3 ? m3.agua : -1 },
        { dim: 'Social', nome: 'IDEB (Anos Iniciais)', u1: m1.ideb.toFixed(1), u2: m2.ideb.toFixed(1), u3: temM3 ? m3.ideb.toFixed(1) : '-', v1: m1.ideb, v2: m2.ideb, v3: temM3 ? m3.ideb : -1 },

        // 4. FISCAL
        { dim: 'Fiscal', nome: 'CAPAG STN (Solvência Fiscal)', u1: m1.capag, u2: m2.capag, u3: temM3 ? m3.capag : '-', isCapag: true },
        { dim: 'Fiscal', nome: 'Custeio – Outras Despesas Correntes', u1: fmtMoeda(m1.custeio), u2: fmtMoeda(m2.custeio), u3: temM3 ? fmtMoeda(m3.custeio) : '-', v1: m1.custeio, v2: m2.custeio, v3: temM3 ? m3.custeio : -1 },
        { dim: 'Fiscal', nome: 'Pessoal (Despesa / Folha)', u1: fmtMoeda(m1.pessoal), u2: fmtMoeda(m2.pessoal), u3: temM3 ? fmtMoeda(m3.pessoal) : '-', v1: m1.pessoal, v2: m2.pessoal, v3: temM3 ? m3.pessoal : -1 },
        { dim: 'Fiscal', nome: 'Investimentos Liquidados', u1: fmtMoeda(m1.investimentos), u2: fmtMoeda(m2.investimentos), u3: temM3 ? fmtMoeda(m3.investimentos) : '-', v1: m1.investimentos, v2: m2.investimentos, v3: temM3 ? m3.investimentos : -1 },
        { dim: 'Fiscal', nome: 'Serviço da Dívida (Juros + Amortizações)', u1: fmtMoeda(m1.servicoDivida), u2: fmtMoeda(m2.servicoDivida), u3: temM3 ? fmtMoeda(m3.servicoDivida) : '-', v1: m1.servicoDivida, v2: m2.servicoDivida, v3: temM3 ? m3.servicoDivida : -1 },

        // 5. INOVAÇÃO & FIBRA
        { dim: 'Inovação', nome: 'Cobertura por Fibra Óptica (%)', u1: m1.fibraPct.toFixed(1) + '%', u2: m2.fibraPct.toFixed(1) + '%', u3: temM3 ? m3.fibraPct.toFixed(1) + '%' : '-', v1: m1.fibraPct, v2: m2.fibraPct, v3: temM3 ? m3.fibraPct : -1 },
        { dim: 'Inovação', nome: 'Participação InfoCom no VAB Serv. (%)', u1: m1.pctVabInfocom.toFixed(2) + '%', u2: m2.pctVabInfocom.toFixed(2) + '%', u3: temM3 ? m3.pctVabInfocom.toFixed(2) + '%' : '-', v1: m1.pctVabInfocom, v2: m2.pctVabInfocom, v3: temM3 ? m3.pctVabInfocom : -1 },
        { dim: 'Inovação', nome: 'Quociente Locacional InfoCom (QL)', u1: m1.qlInfocom.toFixed(2), u2: m2.qlInfocom.toFixed(2), u3: temM3 ? m3.qlInfocom.toFixed(2) : '-', v1: m1.qlInfocom, v2: m2.qlInfocom, v3: temM3 ? m3.qlInfocom : -1 },
        { dim: 'Inovação', nome: 'Empresas / Estabelecimentos TI', u1: m1.estabInfocom.toLocaleString('pt-BR'), u2: m2.estabInfocom.toLocaleString('pt-BR'), u3: temM3 ? m3.estabInfocom.toLocaleString('pt-BR') : '-', v1: m1.estabInfocom, v2: m2.estabInfocom, v3: temM3 ? m3.estabInfocom : -1 },

        // 6. DINÂMICA DAS EMPRESAS (SEPLAG)
        { dim: 'Dinâmica das Empresas', nome: 'Total de Estabelecimentos Ativos', u1: m1.empAtivas.toLocaleString('pt-BR'), u2: m2.empAtivas.toLocaleString('pt-BR'), u3: temM3 ? m3.empAtivas.toLocaleString('pt-BR') : '-', v1: m1.empAtivas, v2: m2.empAtivas, v3: temM3 ? m3.empAtivas : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Densidade Empresarial (Empresas / 1k hab.)', u1: m1.empDensidade.toFixed(1), u2: m2.empDensidade.toFixed(1), u3: temM3 ? m3.empDensidade.toFixed(1) : '-', v1: m1.empDensidade, v2: m2.empDensidade, v3: temM3 ? m3.empDensidade : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Total de MEIs Ativos', u1: m1.empMei.toLocaleString('pt-BR'), u2: m2.empMei.toLocaleString('pt-BR'), u3: temM3 ? m3.empMei.toLocaleString('pt-BR') : '-', v1: m1.empMei, v2: m2.empMei, v3: temM3 ? m3.empMei : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Taxa de MEIzação (%)', u1: m1.empTaxaMei.toFixed(1) + '%', u2: m2.empTaxaMei.toFixed(1) + '%', u3: temM3 ? m3.empTaxaMei.toFixed(1) + '%' : '-', v1: m1.empTaxaMei, v2: m2.empTaxaMei, v3: temM3 ? m3.empTaxaMei : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Saldo Líquido Empresarial (12 Meses)', u1: (m1.empSaldo12m >= 0 ? '+' : '') + m1.empSaldo12m.toLocaleString('pt-BR'), u2: (m2.empSaldo12m >= 0 ? '+' : '') + m2.empSaldo12m.toLocaleString('pt-BR'), u3: temM3 ? (m3.empSaldo12m >= 0 ? '+' : '') + m3.empSaldo12m.toLocaleString('pt-BR') : '-', v1: m1.empSaldo12m, v2: m2.empSaldo12m, v3: temM3 ? m3.empSaldo12m : -999999 },
        { dim: 'Dinâmica das Empresas', nome: 'Novas Empresas Abertas (12 Meses)', u1: m1.empAberturas12m.toLocaleString('pt-BR'), u2: m2.empAberturas12m.toLocaleString('pt-BR'), u3: temM3 ? m3.empAberturas12m.toLocaleString('pt-BR') : '-', v1: m1.empAberturas12m, v2: m2.empAberturas12m, v3: temM3 ? m3.empAberturas12m : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Empresas Fechadas (12 Meses)', u1: m1.empFechamentos12m.toLocaleString('pt-BR'), u2: m2.empFechamentos12m.toLocaleString('pt-BR'), u3: temM3 ? m3.empFechamentos12m.toLocaleString('pt-BR') : '-', v1: m1.empFechamentos12m, v2: m2.empFechamentos12m, v3: temM3 ? m3.empFechamentos12m : -1, lowerIsBetter: true },
        { dim: 'Dinâmica das Empresas', nome: 'Idade Média do Parque (Anos)', u1: m1.empIdadeMedia.toFixed(1) + ' anos', u2: m2.empIdadeMedia.toFixed(1) + ' anos', u3: temM3 ? m3.empIdadeMedia.toFixed(1) + ' anos' : '-', v1: m1.empIdadeMedia, v2: m2.empIdadeMedia, v3: temM3 ? m3.empIdadeMedia : -1 },
        { dim: 'Dinâmica das Empresas', nome: 'Capital Social Total Acumulado', u1: fmtMoeda(m1.empCapitalTotal), u2: fmtMoeda(m2.empCapitalTotal), u3: temM3 ? fmtMoeda(m3.empCapitalTotal) : '-', v1: m1.empCapitalTotal, v2: m2.empCapitalTotal, v3: temM3 ? m3.empCapitalTotal : -1 },

        // 7. AGRICULTURA & ESTIAGEM (IBGE: PAM)
        { dim: 'Agricultura & Estiagem', nome: 'Valor da Produção Agrícola (2025)', u1: fmtMoeda(m1.agriValorProducao * 1000), u2: fmtMoeda(m2.agriValorProducao * 1000), u3: temM3 ? fmtMoeda(m3.agriValorProducao * 1000) : '-', v1: m1.agriValorProducao, v2: m2.agriValorProducao, v3: temM3 ? m3.agriValorProducao : -1 },
        { dim: 'Agricultura & Estiagem', nome: 'Área Agrícola Colhida (2025)', u1: m1.agriAreaColhida.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha', u2: m2.agriAreaColhida.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha', u3: temM3 ? m3.agriAreaColhida.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha' : '-', v1: m1.agriAreaColhida, v2: m2.agriAreaColhida, v3: temM3 ? m3.agriAreaColhida : -1 }
    ];

    let ultDim = '';

    metricas.forEach(row => {
        if (row.dim !== ultDim) {
            ultDim = row.dim;
            const coresDim = {
                'Demografia': '#3B82F6',
                'Economia': '#10B981',
                'Social': '#F59E0B',
                'Fiscal': '#8B5CF6',
                'Inovação': '#06B6D4',
                'Dinâmica das Empresas': '#D97706',
                'Agricultura & Estiagem': '#059669'
            };
            const cor = coresDim[row.dim] || '#64748B';
            $tbody.append(`
                <tr class="bg-slate-100/70 border-top-2 border-slate-300">
                    <td colspan="${temM3 ? 5 : 4}" class="fw-black text-xs text-uppercase tracking-wider py-2" style="color: ${cor};">
                        <i class="fas fa-folder-open me-1.5"></i> Dimensão: ${row.dim}
                    </td>
                </tr>
            `);
        }

        // Determinar o líder
        let liderNome = '-';
        let liderCor = 'slate';
        if (!row.isCapag && row.v1 !== undefined && row.v2 !== undefined) {
            const vals = [
                { nome: m1.nome, val: row.v1, cor: '#2563EB' },
                { nome: m2.nome, val: row.v2, cor: '#10B981' }
            ];
            if (temM3 && row.v3 >= 0) {
                vals.push({ nome: m3.nome, val: row.v3, cor: '#8B5CF6' });
            }
            if (row.lowerIsBetter) {
                vals.sort((a, b) => a.val - b.val);
            } else {
                vals.sort((a, b) => b.val - a.val);
            }
            if (vals[0].val > 0) {
                liderNome = vals[0].nome;
                liderCor = vals[0].cor;
            }
        } else if (row.isCapag) {
            const rankCap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
            const r1 = rankCap[m1.capag] || 0;
            const r2 = rankCap[m2.capag] || 0;
            const r3 = temM3 ? (rankCap[m3.capag] || 0) : 0;
            const maxR = Math.max(r1, r2, r3);
            if (maxR > 0) {
                if (r1 === maxR && r2 < maxR && r3 < maxR) { liderNome = m1.nome; liderCor = '#2563EB'; }
                else if (r2 === maxR && r1 < maxR && r3 < maxR) { liderNome = m2.nome; liderCor = '#10B981'; }
                else if (r3 === maxR && r1 < maxR && r2 < maxR) { liderNome = m3.nome; liderCor = '#8B5CF6'; }
                else { liderNome = 'Empate'; liderCor = '#64748B'; }
            }
        }

        const badgeLider = liderNome !== '-' && liderNome !== 'Empate'
            ? `<span class="badge rounded-pill text-[10px] font-bold text-white px-2 py-0.5" style="background-color: ${liderCor};">${liderNome}</span>`
            : (liderNome === 'Empate' ? `<span class="badge bg-slate-200 text-slate-700 text-[10px] font-semibold">Empate</span>` : '-');

        const col3Html = temM3 ? `<td class="text-center font-bold text-purple-900">${row.u3}</td>` : '';

        $tbody.append(`
            <tr>
                <td class="font-semibold text-slate-800 text-xs">${row.nome}</td>
                <td class="text-center font-bold text-blue-900">${row.u1}</td>
                <td class="text-center font-bold text-emerald-900">${row.u2}</td>
                ${col3Html}
                <td class="text-center">${badgeLider}</td>
            </tr>
        `);
    });
}

/* ==========================================================================
   RESUMOS TEMÁTICOS - PAUTA 5: HABITAÇÃO, MODALIDADES E REGULARIZAÇÃO (REURB)
   ========================================================================== */
let mapResumoHabitacao = null;
window.cacheResumoHabitacao = null;
let cacheHabitacaoData = null;
let mapHabitacao = null;
window.visaoHabitacaoAtiva = 'todos';

// Instâncias dos Gráficos ECharts
let chartHabitacaoStatus = null;
let chartHabitacaoPorMun = null;

window.renderizarResumoHabitacao = function () {
    const container = document.getElementById('resumo_habitacao_map');
    if (!container) return;

    // Se já estiver em cache na memória, apenas redimensiona os elementos
    if (cacheHabitacaoData) {
        setTimeout(() => {
            if (mapHabitacao && typeof mapHabitacao.resize === 'function') mapHabitacao.resize();
            if (chartHabitacaoStatus && typeof chartHabitacaoStatus.resize === 'function') chartHabitacaoStatus.resize();
            if (chartHabitacaoPorMun && typeof chartHabitacaoPorMun.resize === 'function') chartHabitacaoPorMun.resize();
        }, 120);
        return;
    }

    $('#resumo_habitacao_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/habitacao`.replace(/\/+/g, '/');
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error("Erro na rota de Habitação");
            return res.json();
        })
        .then(data => {
            cacheHabitacaoData = data;
            window.cacheResumoHabitacao = data;
            $('#resumo_habitacao_spinner').addClass('d-none');

            const fmtMoedaBiMi = (val) => {
                if (!val || isNaN(val) || val === 0) return "R$ 0";
                const abs = Math.abs(val);
                if (abs >= 1e9) return `R$ ${(val / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
                if (abs >= 1e6) return `R$ ${(val / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
                if (abs >= 1e3) return `R$ ${(val / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
                return `R$ ${val.toLocaleString('pt-BR')}`;
            };

            const fmtInt = (val) => (val !== undefined && val !== null && !isNaN(val)) ? Number(val).toLocaleString('pt-BR') : '-';

            // =========================================================================
            // 1. KPIS PRINCIPAIS DO MORAR BEM PE & MODALIDADES
            // =========================================================================
            const k = data.kpis || {};
            $('#morar_bem_kpi_total').text(fmtInt(k.total_uh));
            $('#morar_bem_kpi_entregues').text(fmtInt(k.entregues_uh));
            $('#morar_bem_kpi_obras').text(fmtInt(k.construcao_uh));
            $('#morar_bem_kpi_investimento').text(fmtMoedaBiMi(k.investimento_total));
            $('#morar_bem_kpi_contrapartida').text(fmtMoedaBiMi(k.contrapartida_total));
            $('#morar_bem_kpi_municipios').text(fmtInt(k.municipios_cobertos));

            const rnl = data.kpis_reforma_no_lar || {};
            $('#rnl_kpi_cadastrados').text(fmtInt(rnl.cadastrados));
            $('#rnl_kpi_concluidas').text(fmtInt(rnl.reformas_realizadas));
            $('#rnl_kpi_valor_contratual').text(fmtMoedaBiMi(rnl.valor_contratual));
            $('#rnl_kpi_valor_medido').text(fmtMoedaBiMi(rnl.valor_total_medido));
            $('#rnl_kpi_municipios').text(fmtInt(rnl.municipios_atendidos));

            const ent = data.kpis_entrada_garantida || {};
            $('#ent_kpi_uh').text(fmtInt(ent.total_uh));
            $('#ent_kpi_empreendimentos').text(fmtInt(ent.quantidade_empreendimento));
            $('#ent_kpi_valor_total').text(fmtMoedaBiMi(ent.valor_total));
            $('#ent_kpi_municipios').text(fmtInt(ent.municipios_atendidos));

            const far = data.kpis_far || {};
            $('#far_kpi_uh').text(fmtInt(far.total_uh));
            $('#far_kpi_empreendimentos').text(fmtInt(far.quantidade_empreendimento));
            $('#far_kpi_recurso_federal').text(fmtMoedaBiMi(far.recurso_federal));
            $('#far_kpi_contrapartida_obras').text(fmtMoedaBiMi(far.contrapartida_obras));
            $('#far_kpi_contrapartida_terrenos').text(fmtMoedaBiMi(far.contrapartida_terrenos));

            const fds = data.kpis_fds || {};
            $('#fds_kpi_uh').text(fmtInt(fds.total_uh));
            $('#fds_kpi_empreendimentos').text(fmtInt(fds.quantidade_empreendimento));
            $('#fds_kpi_contrapartida').text(fmtMoedaBiMi(fds.contrapartida_obras));

            const sub50 = data.kpis_sub50 || {};
            $('#sub50_kpi_uh').text(fmtInt(sub50.total_uh));
            $('#sub50_kpi_empreendimentos').text(fmtInt(sub50.quantidade_empreendimento));
            $('#sub50_kpi_licitacao').text(fmtMoedaBiMi(sub50.valor_total_licitacao));
            $('#sub50_kpi_contrapartida').text(fmtMoedaBiMi(sub50.contrapartida_obras));

            const ret = data.kpis_retomadas || {};
            $('#retomadas_kpi_uh').text(fmtInt(ret.total_uh));
            $('#retomadas_kpi_empreendimentos').text(fmtInt(ret.quantidade_empreendimento));
            $('#retomadas_kpi_recurso_federal').text(fmtMoedaBiMi(ret.recurso_federal));
            $('#retomadas_kpi_contrapartida').text(fmtMoedaBiMi(ret.contrapartida_obras));

            const r = data.kpis_reurb || {};
            $('#reurb_kpi_previstos').text(fmtInt(r.titulos_previstos));
            $('#reurb_kpi_entregues').text(fmtInt(r.titulos_entregues));
            $('#reurb_kpi_andamento').text(fmtInt(r.titulos_andamento));
            $('#reurb_kpi_mulheres').text(fmtInt(r.total_mulheres));
            $('#reurb_kpi_mulheres_pct').text(`${(r.percent_mulheres || 0).toFixed(1)}% do total`);
            $('#reurb_kpi_nucleos').text(fmtInt(r.total_nucleos));
            $('#reurb_kpi_municipios').text(fmtInt(r.total_municipios));

            const setMetricaClassif = (idNum, idDesc, m) => {
                if (!m) return;
                $(`#${idNum}`).text(fmtInt(m.entregues));
                $(`#${idDesc}`).text(`${fmtInt(m.previstos)} previstos (${(m.percent || 0).toFixed(1)}%)`);
            };
            setMetricaClassif('reurb_kpi_classif_regmel', 'reurb_kpi_classif_regmel_desc', r.classif_regmel);
            setMetricaClassif('reurb_kpi_classif_fundiaria', 'reurb_kpi_classif_fundiaria_desc', r.classif_fundiaria);
            setMetricaClassif('reurb_kpi_classif_reurb', 'reurb_kpi_classif_reurb_desc', r.classif_reurb);
            setMetricaClassif('reurb_kpi_classif_imobiliaria', 'reurb_kpi_classif_imobiliaria_desc', r.classif_imobiliaria);

            // =========================================================================
            // 2. PARSE DO GEOJSON E MAPA DE CENTRÓIDES
            // =========================================================================
            let geoMun = data.geojson || data.geojson_municipios;
            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const munsMap = {};
            const munCentroids = {};

            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const nomeMun = norm(f.properties.name || f.properties.NM_MUN || f.properties.municipio);
                    try {
                        let flatCoords = [];
                        const collect = (c) => {
                            if (typeof c[0] === 'number') flatCoords.push(c);
                            else c.forEach(collect);
                        };
                        collect(f.geometry.coordinates);
                        if (flatCoords.length > 0) {
                            const sum = flatCoords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
                            munCentroids[nomeMun] = [sum[0] / flatCoords.length, sum[1] / flatCoords.length];
                        }
                    } catch(e) {}
                });
            }

            // =========================================================================
            // 3. PROCESSAMENTO DOS EMPREENDIMENTOS E PONTOS
            // =========================================================================
            const featuresEmpreendimentos = [];
            const projetos = data.projetos || [];

            projetos.forEach((p, idx) => {
                const m = norm(p.municipio);
                const uh = Number(p.uh) || 0;
                const inv = Number(p.valor_global_orcado3 || p.valor_total || 0);

                if (m) {
                    if (!munsMap[m]) munsMap[m] = { uh: 0, obras: 0, inv: 0, entregues: 0, titulos: 0, titulos_entregues: 0, qtd_empreendimentos: 0 };
                    munsMap[m].uh += uh;
                    munsMap[m].qtd_empreendimentos += 1;
                    munsMap[m].inv += inv;

                    const statusNorm = String(p.status || '').toLowerCase();
                    if (statusNorm.includes('conclu') || statusNorm.includes('entregue')) {
                        munsMap[m].entregues += uh;
                    } else {
                        munsMap[m].obras += uh;
                    }
                }

                let lat = Number(p.lat);
                let lng = Number(p.long);

                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    if (m && munCentroids[m]) {
                        const jitterX = ((idx % 7) - 3) * 0.008;
                        const jitterY = (((idx * 3) % 7) - 3) * 0.008;
                        lng = munCentroids[m][0] + jitterX;
                        lat = munCentroids[m][1] + jitterY;
                    }
                }

                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    featuresEmpreendimentos.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        properties: {
                            nome_empreendimento: p.empreendimento || p.nome_empreendimento || 'Empreendimento Habitacional',
                            municipio: p.municipio || '',
                            status: p.status || 'Em Construção',
                            uh: uh,
                            programa: p.programa || p.financiamento || 'Morar Bem PE',
                            valor: inv
                        }
                    });
                }
            });

            (data.regularizacoes || []).forEach(rg => {
                const m = norm(rg.municipio || rg.cidade);
                if (!m) return;
                if (!munsMap[m]) munsMap[m] = { uh: 0, obras: 0, inv: 0, entregues: 0, titulos: 0, titulos_entregues: 0, qtd_empreendimentos: 0 };
                const t = Number(rg.regularizacoes) || 0;
                munsMap[m].titulos += t;
                const sit = String(rg.situacao || '').toLowerCase();
                if (sit.includes('realizado') || sit.includes('conclu') || sit.includes('entregue')) {
                    munsMap[m].titulos_entregues += t;
                }
            });

            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.name || props.NM_MUN || props.municipio);
                    const info = munsMap[kMun] || { uh: 0, obras: 0, inv: 0, entregues: 0, titulos: 0, titulos_entregues: 0, qtd_empreendimentos: 0 };

                    props.hab_uh = info.uh;
                    props.hab_obras = info.obras;
                    props.hab_inv = info.inv;
                    props.hab_titulos = info.titulos;
                    props.hab_titulos_entregues = info.titulos_entregues;
                    props.hab_qtd_empreendimentos = info.qtd_empreendimentos;
                });
            }

            const geoEmpreendimentos = {
                type: 'FeatureCollection',
                features: featuresEmpreendimentos
            };

            // =========================================================================
            // 4. MAPLIBRE GL
            // =========================================================================
            if (mapHabitacao) {
                try { mapHabitacao.remove(); } catch(e) {}
            }

            mapHabitacao = new maplibregl.Map({
                container: 'resumo_habitacao_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapHabitacao.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapHabitacao.on('load', () => {
                mapHabitacao.resize();

                try {
                    const bounds = new maplibregl.LngLatBounds();
                    if (featuresEmpreendimentos.length > 0) {
                        featuresEmpreendimentos.forEach(f => bounds.extend(f.geometry.coordinates));
                    }
                    if (!bounds.isEmpty()) {
                        mapHabitacao.fitBounds(bounds, { padding: 35, maxZoom: 12, duration: 800 });
                    }
                } catch(e) {}

                if (geoMun && geoMun.features) {
                    mapHabitacao.addSource('hab_mun_source', {
                        type: 'geojson',
                        data: geoMun
                    });

                    mapHabitacao.addLayer({
                        id: 'hab_muns_fill',
                        type: 'fill',
                        source: 'hab_mun_source',
                        paint: {
                            'fill-color': '#f8fafc',
                            'fill-opacity': window.visaoHabitacaoAtiva === 'todos' ? 0.08 : 0.75
                        }
                    });

                    mapHabitacao.addLayer({
                        id: 'hab_muns_line',
                        type: 'line',
                        source: 'hab_mun_source',
                        paint: {
                            'line-color': '#94a3b8',
                            'line-width': 0.8,
                            'line-opacity': 0.5
                        }
                    });

                    mapHabitacao.addLayer({
                        id: 'hab_muns_hover',
                        type: 'line',
                        source: 'hab_mun_source',
                        paint: { 'line-color': '#0f172a', 'line-width': 2.4 },
                        filter: ['==', 'name', '']
                    });
                }

                mapHabitacao.addSource('hab_empreendimentos_source', {
                    type: 'geojson',
                    data: geoEmpreendimentos,
                    cluster: true,
                    clusterMaxZoom: 10,
                    clusterRadius: 35
                });

                mapHabitacao.addLayer({
                    id: 'hab_clusters',
                    type: 'circle',
                    source: 'hab_empreendimentos_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoHabitacaoAtiva === 'todos' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': '#f59e0b',
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            16,
                            5, 20,
                            15, 26
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': 0.85
                    }
                });

                mapHabitacao.addLayer({
                    id: 'hab_cluster_count',
                    type: 'symbol',
                    source: 'hab_empreendimentos_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoHabitacaoAtiva === 'todos' ? 'visible' : 'none',
                        'text-field': '{point_count_abbreviated}',
                        'text-size': 12
                    },
                    paint: { 'text-color': '#ffffff' }
                });

                mapHabitacao.addLayer({
                    id: 'hab_points',
                    type: 'circle',
                    source: 'hab_empreendimentos_source',
                    filter: ['!', ['has', 'point_count']],
                    layout: {
                        'visibility': window.visaoHabitacaoAtiva === 'todos' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': [
                            'case',
                            ['in', 'conclu', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'entreg', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'obras', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'constru', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'planej', ['downcase', ['get', 'status']]], '#3b82f6',
                            '#64748b'
                        ],
                        'circle-radius': 7,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                mapHabitacao.on('click', 'hab_clusters', (e) => {
                    const clFeatures = mapHabitacao.queryRenderedFeatures(e.point, { layers: ['hab_clusters'] });
                    if (!clFeatures.length) return;
                    const clusterId = clFeatures[0].properties.cluster_id;
                    mapHabitacao.getSource('hab_empreendimentos_source').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        mapHabitacao.easeTo({
                            center: clFeatures[0].geometry.coordinates,
                            zoom: zoom
                        });
                    });
                });

                // Hover sobre os Municípios
                mapHabitacao.on('mousemove', 'hab_muns_fill', (e) => {
                    if (!e.features.length) return;
                    mapHabitacao.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    const nomeMun = props.name || props.NM_MUN || props.municipio;
                    mapHabitacao.setFilter('hab_muns_hover', ['==', 'name', props.name || '']);

                    $('#habitacao_box_content_default').addClass('d-none');
                    $('#habitacao_box_content_active').removeClass('d-none').html(`
                        <div class="h-100 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="badge bg-teal-100 text-teal-800 border border-teal-300 font-bold px-2 py-1 text-xs rounded-pill">MUNICÍPIO</span>
                                    <span class="text-xs text-slate-400 font-semibold">Detalhamento</span>
                                </div>
                                <h4 class="font-black text-slate-800 text-base mb-1">${nomeMun}</h4>
                                <hr class="my-2 border-slate-200">
                                <div class="space-y-2 mt-3 text-xs">
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Empreendimentos:</span>
                                        <strong class="text-amber-600 font-black">${(props.hab_qtd_empreendimentos || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Unidades Previstas:</span>
                                        <strong class="text-teal-700 font-black">${(props.hab_uh || 0).toLocaleString('pt-BR')} UH</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Em Construção:</span>
                                        <strong class="text-amber-600 font-black">${(props.hab_obras || 0).toLocaleString('pt-BR')} UH</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Títulos REURB Entregues:</span>
                                        <strong class="text-blue-700 font-black">${(props.hab_titulos_entregues || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Investimento Previsto:</span>
                                        <strong class="text-purple-700 font-black">${fmtMoedaBiMi(props.hab_inv)}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-3 border-t border-slate-200/80 text-center">
                                <span class="text-[11px] text-slate-400 italic">Passe o cursor sobre outros municípios</span>
                            </div>
                        </div>
                    `);
                });

                // Hover sobre os Pontos
                mapHabitacao.on('mousemove', 'hab_points', (e) => {
                    if (!e.features.length) return;
                    mapHabitacao.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;

                    $('#habitacao_box_content_default').addClass('d-none');
                    $('#habitacao_box_content_active').removeClass('d-none').html(`
                        <div class="h-100 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="badge bg-orange-100 text-orange-800 border border-orange-300 font-bold px-2 py-1 text-xs rounded-pill">EMPREENDIMENTO</span>
                                    <span class="text-xs text-slate-400 font-semibold">${props.municipio}</span>
                                </div>
                                <h4 class="font-black text-slate-800 text-base mb-1">${props.nome_empreendimento}</h4>
                                <hr class="my-2 border-slate-200">
                                <div class="space-y-2 mt-3 text-xs">
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Status:</span>
                                        <strong class="text-slate-800 font-bold">${props.status}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Unidades (UH):</span>
                                        <strong class="text-teal-700 font-black">${(props.uh || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Programa:</span>
                                        <strong class="text-slate-700 font-bold">${props.programa}</strong>
                                    </div>
                                    ${props.valor ? `
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Investimento:</span>
                                        <strong class="text-purple-700 font-black">${fmtMoedaBiMi(props.valor)}</strong>
                                    </div>` : ''}
                                </div>
                            </div>
                            <div class="pt-3 border-t border-slate-200/80 text-center">
                                <span class="text-[11px] text-slate-400 italic">Passe o cursor sobre outros equipamentos</span>
                            </div>
                        </div>
                    `);
                });

                    // Clique no município: filtra a tabela pelo município clicado
                    mapHabitacao.on('click', 'hab_muns_fill', (e) => {
                        if (!e.features.length) return;
                        const props = e.features[0].properties;
                        const nomeMun = props.name || props.NM_MUN || props.municipio;
                        if (nomeMun) {
                            window.filtrarTabelaPorMunicipioHabitacao(nomeMun);
                        }
                    });
                    
                    // Clique no ponto do empreendimento: filtra pelo município do empreendimento
                    mapHabitacao.on('click', 'hab_points', (e) => {
                        if (!e.features.length) return;
                        const props = e.features[0].properties;
                        const nomeMun = props.municipio;
                        if (nomeMun) {
                            window.filtrarTabelaPorMunicipioHabitacao(nomeMun);
                        }
                    });
                

                ['hab_points', 'hab_clusters', 'hab_muns_fill'].forEach(layer => {
                    mapHabitacao.on('mouseenter', layer, () => { mapHabitacao.getCanvas().style.cursor = 'pointer'; });
                    mapHabitacao.on('mouseleave', layer, () => { mapHabitacao.getCanvas().style.cursor = ''; });
                });

                window.alternarVisaoHabitacao(window.visaoHabitacaoAtiva || 'todos', document.getElementById('btn_visao_hab_todos'));
            });

            // =========================================================================
            // 5. RENDERIZAÇÃO DOS GRÁFICOS ANALÍTICOS (ECHARTS)
            // =========================================================================
                renderizarGraficosHabitacao(data);
                window.renderizarTabelasHabitacaoEReurb(data);
})
        .catch(err => {
            console.error('[Resumo Habitação] Erro:', err);
            $('#resumo_habitacao_spinner').addClass('d-none');
        });
};


// =========================================================================
// 5. ALTERNÂNCIA DE VISÕES DA ABA HABITAÇÃO
// =========================================================================
window.alternarVisaoHabitacao = function (visao, btn) {
    window.visaoHabitacaoAtiva = visao;

    $('#btn_visao_hab_todos, #btn_visao_hab_morarbem, #btn_visao_hab_reurb, #btn_visao_hab_pontos')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_hab_cluster, #legenda_hab_uh, #legenda_hab_reurb, #legenda_hab_empreendimentos').addClass('d-none');

    if (!mapHabitacao || !mapHabitacao.getLayer('hab_muns_fill')) return;

    if (visao === 'todos') {
        // VISÃO GERAL: Clusters e Pontos Visíveis com Municípios transparentes
        $('#legenda_hab_cluster').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'visible');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'visible');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'visible');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', '#f8fafc');
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.08);

        $('#habitacao_camada_label').text("Exibindo: Localização e Clusters de Empreendimentos");

    } else if (visao === 'morarbem') {
        // MORAR BEM: Coroplético de Obras (UH)
        $('#legenda_hab_uh').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.75);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_obras'],
            '#f0fdfa',
            1, '#99f6e4',
            100, '#2dd4bf',
            500, '#0f766e'
        ]);
        $('#habitacao_camada_label').text("Exibindo: Unidades Habitacionais em Obras");

    } else if (visao === 'reurb') {
        // REGULARIZAÇÃO: Coroplético de Títulos Concluídos
        $('#legenda_hab_reurb').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.75);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_titulos_entregues'],
            '#eff6ff',
            1, '#93c5fd',
            200, '#3b82f6',
            1000, '#1d4ed8'
        ]);
        $('#habitacao_camada_label').text("Exibindo: Títulos de Regularização Fundiária Concluídos");

    } else if (visao === 'pontos') {
        // EMPREENDIMENTOS: Coroplético por Quantidade de Empreendimentos
        $('#legenda_hab_empreendimentos').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.75);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_qtd_empreendimentos'],
            '#fff7ed',   // 0
            1, '#fdba74', // 1 a 2
            3, '#fb923c', // 3 a 5
            6, '#c2410c'  // > 5
        ]);
        $('#habitacao_camada_label').text("Exibindo: Quantidade de Empreendimentos por Município");
    }
};


// =========================================================================
// 5. ALTERNÂNCIA DE VISÕES DA ABA HABITAÇÃO
// =========================================================================
window.alternarVisaoHabitacao = function (visao, btn) {
    window.visaoHabitacaoAtiva = visao;

    $('#btn_visao_hab_todos, #btn_visao_hab_morarbem, #btn_visao_hab_reurb, #btn_visao_hab_pontos')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_hab_cluster, #legenda_hab_uh, #legenda_hab_reurb, #legenda_hab_empreendimentos').addClass('d-none');

    if (!mapHabitacao || !mapHabitacao.getLayer('hab_muns_fill')) return;

    if (visao === 'todos') {
        // VISÃO GERAL: Clusters e Pontos Visíveis, Fundo Municipal Transparente/Neutro
        $('#legenda_hab_cluster').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'visible');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'visible');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'visible');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', '#f8fafc');
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.15);

        $('#habitacao_camada_label').text("Exibindo: Localização e Clusters de Empreendimentos");

    } else if (visao === 'morarbem') {
        // MORAR BEM: Coroplético de Obras (UH)
        $('#legenda_hab_uh').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.85);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_obras'],
            '#f0fdfa',
            1, '#99f6e4',
            100, '#2dd4bf',
            500, '#0f766e'
        ]);
        $('#habitacao_camada_label').text("Exibindo: Unidades Habitacionais em Obras");

    } else if (visao === 'reurb') {
        // REGULARIZAÇÃO: Coroplético de Títulos Concluídos
        $('#legenda_hab_reurb').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.85);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_titulos_entregues'],
            '#eff6ff',
            1, '#93c5fd',
            200, '#3b82f6',
            1000, '#1d4ed8'
        ]);
        $('#habitacao_camada_label').text("Exibindo: Títulos de Regularização Fundiária Concluídos");

    } else if (visao === 'pontos') {
        // EMPREENDIMENTOS: Coroplético pela Quantidade de Empreendimentos por Município
        $('#legenda_hab_empreendimentos').removeClass('d-none');
        mapHabitacao.setLayoutProperty('hab_clusters', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_cluster_count', 'visibility', 'none');
        mapHabitacao.setLayoutProperty('hab_points', 'visibility', 'none');

        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-opacity', 0.85);
        mapHabitacao.setPaintProperty('hab_muns_fill', 'fill-color', [
            'step',
            ['get', 'hab_qtd_empreendimentos'],
            '#fff7ed',   // 0
            1, '#fdba74', // 1 a 2
            3, '#fb923c', // 3 a 5
            6, '#c2410c'  // > 5
        ]);
        $('#habitacao_camada_label').text("Exibindo: Quantidade de Empreendimentos por Município");
    }
};

// Função do botão retrátil
window.toggleDetalhesHabitacao = function () {
    const $bloco = $('#bloco_habitacao_detalhes_extras');
    const $txt = $('#txt_toggle_habitacao');
    const $icon = $('#icon_toggle_habitacao');

    if ($bloco.hasClass('d-none')) {
        $bloco.removeClass('d-none');
        $txt.text('Ocultar Programas e Modalidades Habitacionais Detalhadas');
        $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    } else {
        $bloco.addClass('d-none');
        $txt.text('Exibir Programas e Modalidades Habitacionais Detalhadas');
        $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    }
};


/* ==========================================================================
   GRÁFICOS ANALÍTICOS: HABITAÇÃO (STATUS DE OBRAS & TOP 20 MUNICÍPIOS)
   ========================================================================== */
function renderizarGraficosHabitacao(data) {
    if (typeof echarts === 'undefined') return;

    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    // =========================================================================
    // 1. GRÁFICO 1: STATUS DAS OBRAS (chart_habitacao_status) - Donut Chart
    // =========================================================================
    const elStatus = document.getElementById('chart_habitacao_status');
    if (elStatus) {
        if (chartHabitacaoStatus) {
            chartHabitacaoStatus.dispose();
        }
        chartHabitacaoStatus = echarts.init(elStatus);

        const statusMap = {
            'Concluído': 0,
            'Em Construção': 0,
            'Em Planejamento': 0
        };

        (data.projetos || []).forEach(p => {
            const uh = Number(p.uh) || 0;
            const s = String(p.status || '').toLowerCase();

            if (s.includes('conclu') || s.includes('entreg')) {
                statusMap['Concluído'] += uh;
            } else if (s.includes('planej') || s.includes('projeto') || s.includes('licita')) {
                statusMap['Em Planejamento'] += uh;
            } else {
                statusMap['Em Construção'] += uh;
            }
        });

        const statusData = [
            { value: statusMap['Concluído'], name: 'Concluído / Entregue', itemStyle: { color: '#10b981' } },
            { value: statusMap['Em Construção'], name: 'Em Construção', itemStyle: { color: '#f59e0b' } },
            { value: statusMap['Em Planejamento'], name: 'Em Planejamento / Projeto', itemStyle: { color: '#3b82f6' } }
        ].filter(item => item.value > 0);

        const totalUH = statusData.reduce((acc, curr) => acc + curr.value, 0);

        const optionStatus = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const pct = totalUH > 0 ? ((params.value / totalUH) * 100).toFixed(1) : 0;
                    return `<strong>${params.name}</strong><br/>` +
                           `Unidades (UH): <b>${Number(params.value).toLocaleString('pt-BR')}</b> (${pct}%)`;
                }
            },
            legend: {
                orient: 'horizontal',
                bottom: '0%',
                left: 'center',
                textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 },
                itemWidth: 12,
                itemHeight: 12
            },
            series: [
                {
                    name: 'Status das Obras',
                    type: 'pie',
                    radius: ['45%', '72%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: 'bold',
                            formatter: (params) => `${Number(params.value).toLocaleString('pt-BR')}\nUH`
                        }
                    },
                    labelLine: { show: false },
                    data: statusData
                }
            ]
        };

        chartHabitacaoStatus.setOption(optionStatus);
    }

    // =========================================================================
    // 2. GRÁFICO 2: TOP 20 MUNICÍPIOS (chart_habitacao_por_mun) - Barras Empilhadas
    // =========================================================================
    const elMun = document.getElementById('chart_habitacao_por_mun');
    if (elMun) {
        if (chartHabitacaoPorMun) {
            chartHabitacaoPorMun.dispose();
        }
        chartHabitacaoPorMun = echarts.init(elMun);

        // Agrupamento municipal
        const munTotals = {};

        (data.projetos || []).forEach(p => {
            const m = String(p.municipio || '').trim();
            if (!m || m === '-') return;
            const k = norm(m);
            if (!munTotals[k]) munTotals[k] = { nome: m, uh: 0, titulos: 0 };
            munTotals[k].uh += Number(p.uh) || 0;
        });

        (data.regularizacoes || []).forEach(rg => {
            const m = String(rg.municipio || rg.cidade || '').trim();
            if (!m || m === '-') return;
            const k = norm(m);
            if (!munTotals[k]) munTotals[k] = { nome: m, uh: 0, titulos: 0 };
            munTotals[k].titulos += Number(rg.regularizacoes) || 0;
        });

        // Top 20 ordenados pelo volume total (UH + Títulos)
        const top20 = Object.values(munTotals)
            .map(item => ({
                ...item,
                total: item.uh + item.titulos
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 20)
            .reverse(); // Inverte para o maior ficar no topo do eixo Y vertical

        const categories = top20.map(item => item.nome);
        const seriesUH = top20.map(item => item.uh);
        const seriesTitulos = top20.map(item => item.titulos);

        const optionMun = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    let text = `<strong>${params[0].name}</strong><br/>`;
                    params.forEach(p => {
                        text += `${p.marker} ${p.seriesName}: <b>${Number(p.value).toLocaleString('pt-BR')}</b><br/>`;
                    });
                    return text;
                }
            },
            legend: {
                orient: 'horizontal',
                bottom: '0%',
                left: 'center',
                textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 },
                itemWidth: 12,
                itemHeight: 12
            },
            grid: {
                top: '5%',
                left: '3%',
                right: '4%',
                bottom: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: '#64748b',
                    fontSize: 10,
                    formatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: categories,
                axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [
                {
                    name: 'Unidades Habitacionais (UH)',
                    type: 'bar',
                    stack: 'total',
                    data: seriesUH,
                    itemStyle: { color: '#0d9488' } // Teal institucional
                },
                {
                    name: 'Títulos de Regularização',
                    type: 'bar',
                    stack: 'total',
                    data: seriesTitulos,
                    itemStyle: { color: '#2563eb' } // Azul REURB
                }
            ]
        };

        chartHabitacaoPorMun.setOption(optionMun);
    }
}

/* ==========================================================================
   RESUMOS TEMÁTICOS - PAUTA 6: OBRAS E EQUIPAMENTOS PÚBLICOS (SEDUH / CEHAB)
   ========================================================================== */
let mapResumoObras = null;
window.cacheResumoObras = null;
let cacheObrasData = null;
let mapObras = null;
window.visaoObrasAtiva = 'todos';

// Instâncias dos Gráficos ECharts
let chartObrasStatus = null;
let chartObrasPorMun = null;
let dataTableObras = null;
let municipioObrasFiltro = null;

window.renderizarResumoObras = function () {
    const container = document.getElementById('resumo_obras_map');
    if (!container) return;

    if (cacheObrasData) {
        setTimeout(() => {
            if (mapObras && typeof mapObras.resize === 'function') mapObras.resize();
            if (chartObrasStatus && typeof chartObrasStatus.resize === 'function') chartObrasStatus.resize();
            if (chartObrasPorMun && typeof chartObrasPorMun.resize === 'function') chartObrasPorMun.resize();
            if (dataTableObras && typeof dataTableObras.columns.adjust === 'function') dataTableObras.columns.adjust();
        }, 120);
        return;
    }

    $('#resumo_obras_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/obras`.replace(/\/+/g, '/');
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error("Erro ao carregar dados de Obras");
            return res.json();
        })
        .then(data => {
            cacheObrasData = data;
            window.cacheResumoObras = data;
            $('#resumo_obras_spinner').addClass('d-none');

            const fmtMoedaBiMi = (val) => {
                if (!val || isNaN(val) || val === 0) return "R$ 0";
                const abs = Math.abs(val);
                if (abs >= 1e9) return `R$ ${(val / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
                if (abs >= 1e6) return `R$ ${(val / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
                if (abs >= 1e3) return `R$ ${(val / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
                return `R$ ${val.toLocaleString('pt-BR')}`;
            };

            const fmtInt = (val) => (val !== undefined && val !== null && !isNaN(val)) ? Number(val).toLocaleString('pt-BR') : '-';

            // 1. ATUALIZAÇÃO DOS KPIS PRINCIPAIS
            const k = data.kpis || {};
            $('#obras_kpi_total').text(fmtInt(k.total_obras));
            $('#obras_kpi_execucao').text(fmtInt(k.em_execucao));
            $('#obras_kpi_concluidas').text(fmtInt(k.concluidas));
            $('#obras_kpi_investimento').text(fmtMoedaBiMi(k.investimento_total));
            $('#obras_kpi_exec_media').text(`${(k.media_exec_fisica || 0).toFixed(1)}%`);
            $('#obras_kpi_municipios').text(fmtInt(k.municipios_cobertos));

            $('#obras_box_stat_muns').text(fmtInt(k.municipios_cobertos));
            $('#obras_box_stat_ativas').text(fmtInt(k.em_execucao));
            $('#obras_box_stat_concluidas').text(fmtInt(k.concluidas));
            $('#obras_box_stat_investimento').text(fmtMoedaBiMi(k.investimento_total));

            // 2. PARSE DO GEOJSON E CÁLCULO DE CENTRÓIDES MUNICIPAIS
            let geoMun = data.geojson;
            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const munsMap = {};
            const munCentroids = {};

            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const nomeMun = norm(f.properties.name || f.properties.NM_MUN || f.properties.municipio);
                    try {
                        let flatCoords = [];
                        const collect = (c) => {
                            if (typeof c[0] === 'number') flatCoords.push(c);
                            else c.forEach(collect);
                        };
                        collect(f.geometry.coordinates);
                        if (flatCoords.length > 0) {
                            const sum = flatCoords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
                            munCentroids[nomeMun] = [sum[0] / flatCoords.length, sum[1] / flatCoords.length];
                        }
                    } catch(e) {}
                });
            }

            // 3. PROCESSAMENTO DOS PONTOS DE OBRAS E POLÍGONOS
            const featuresObras = [];
            const obras = data.obras || [];

            obras.forEach((o, idx) => {
                const m = norm(o.municipio);
                const inv = Number(o.valor_total) || 0;
                const execFisica = Number(o.percent_execucao_fisica) || Number(o.percent_execucao) || 0;
                const statusStr = String(o.status || '').trim();
                const stNorm = statusStr.toLowerCase();

                if (m) {
                    if (!munsMap[m]) {
                        munsMap[m] = { total: 0, em_execucao: 0, concluidas: 0, inv: 0, soma_exec: 0 };
                    }
                    munsMap[m].total += 1;
                    munsMap[m].inv += inv;
                    munsMap[m].soma_exec += (execFisica <= 1.0 && execFisica > 0 ? execFisica * 100 : execFisica);

                    if (stNorm.includes('execu') || stNorm.includes('andamento')) {
                        munsMap[m].em_execucao += 1;
                    } else if (stNorm.includes('conclu') || stNorm.includes('finaliz') || stNorm.includes('entreg')) {
                        munsMap[m].concluidas += 1;
                    }
                }

                let lat = Number(o.latitude);
                let lng = Number(o.longitude);

                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    if (m && munCentroids[m]) {
                        const jitterX = ((idx % 7) - 3) * 0.008;
                        const jitterY = (((idx * 3) % 7) - 3) * 0.008;
                        lng = munCentroids[m][0] + jitterX;
                        lat = munCentroids[m][1] + jitterY;
                    }
                }

                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    featuresObras.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        properties: {
                            iniciativa: o.iniciativa_estrategica || o.iniciativa_resumida || o.produto || 'Obra Pública',
                            produto: o.produto || '',
                            municipio: o.municipio || '',
                            status: statusStr || 'Em Execução',
                            diretoria: o.diretoria || 'DIF',
                            secretaria: o.secretaria || 'SEDUH',
                            empresa: o.empresa || '',
                            contrato: o.numero_do_contrato || '',
                            valor: inv,
                            exec_fisica: execFisica <= 1.0 && execFisica > 0 ? execFisica * 100 : execFisica
                        }
                    });
                }
            });

            // Enriquecer propriedades dos municípios para coropléticos
            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.name || props.NM_MUN || props.municipio);
                    const info = munsMap[kMun] || { total: 0, em_execucao: 0, concluidas: 0, inv: 0, soma_exec: 0 };

                    props.name = props.name || props.municipio || '';
                    props.obras_total = info.total;
                    props.obras_execucao = info.em_execucao;
                    props.obras_concluidas = info.concluidas;
                    props.obras_investimento = info.inv;
                    props.obras_media_exec = info.total > 0 ? (info.soma_exec / info.total) : 0;
                });
            }

            const geoObras = {
                type: 'FeatureCollection',
                features: featuresObras
            };

            // 4. INICIALIZAÇÃO DO MAPA MAPLIBRE
            if (mapObras) {
                try { mapObras.remove(); } catch(e) {}
            }

            mapObras = new maplibregl.Map({
                container: 'resumo_obras_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapObras.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapObras.on('load', () => {
                mapObras.resize();

                try {
                    const bounds = new maplibregl.LngLatBounds();
                    if (featuresObras.length > 0) {
                        featuresObras.forEach(f => bounds.extend(f.geometry.coordinates));
                    }
                    if (!bounds.isEmpty()) {
                        mapObras.fitBounds(bounds, { padding: 35, maxZoom: 12, duration: 800 });
                    }
                } catch(e) {}

                if (geoMun && geoMun.features) {
                    mapObras.addSource('obras_mun_source', {
                        type: 'geojson',
                        data: geoMun
                    });

                    mapObras.addLayer({
                        id: 'obras_muns_fill',
                        type: 'fill',
                        source: 'obras_mun_source',
                        paint: {
                            'fill-color': '#f8fafc',
                            'fill-opacity': window.visaoObrasAtiva === 'todos' ? 0.08 : 0.75
                        }
                    });

                    mapObras.addLayer({
                        id: 'obras_muns_line',
                        type: 'line',
                        source: 'obras_mun_source',
                        paint: {
                            'line-color': '#94a3b8',
                            'line-width': 0.8,
                            'line-opacity': 0.5
                        }
                    });

                    mapObras.addLayer({
                        id: 'obras_muns_hover',
                        type: 'line',
                        source: 'obras_mun_source',
                        paint: { 'line-color': '#0f172a', 'line-width': 2.4 },
                        filter: ['==', 'name', '']
                    });
                }

                mapObras.addSource('obras_points_source', {
                    type: 'geojson',
                    data: geoObras,
                    cluster: true,
                    clusterMaxZoom: 10,
                    clusterRadius: 35
                });

                mapObras.addLayer({
                    id: 'obras_clusters',
                    type: 'circle',
                    source: 'obras_points_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoObrasAtiva === 'todos' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': '#f59e0b',
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            16,
                            5, 20,
                            15, 26
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': 0.85
                    }
                });

                mapObras.addLayer({
                    id: 'obras_cluster_count',
                    type: 'symbol',
                    source: 'obras_points_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoObrasAtiva === 'todos' ? 'visible' : 'none',
                        'text-field': '{point_count_abbreviated}',
                        'text-size': 12
                    },
                    paint: { 'text-color': '#ffffff' }
                });

                mapObras.addLayer({
                    id: 'obras_points',
                    type: 'circle',
                    source: 'obras_points_source',
                    filter: ['!', ['has', 'point_count']],
                    layout: {
                        'visibility': window.visaoObrasAtiva === 'todos' ? 'visible' : 'none'
                    },
                    paint: {
                        'circle-color': [
                            'case',
                            ['in', 'conclu', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'entreg', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'execu', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'andamento', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'paralis', ['downcase', ['get', 'status']]], '#ef4444',
                            '#3b82f6'
                        ],
                        'circle-radius': 7,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                mapObras.on('click', 'obras_clusters', (e) => {
                    const clFeatures = mapObras.queryRenderedFeatures(e.point, { layers: ['obras_clusters'] });
                    if (!clFeatures.length) return;
                    const clusterId = clFeatures[0].properties.cluster_id;
                    mapObras.getSource('obras_points_source').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        mapObras.easeTo({
                            center: clFeatures[0].geometry.coordinates,
                            zoom: zoom
                        });
                    });
                });

                // Hover sobre Municípios
                mapObras.on('mousemove', 'obras_muns_fill', (e) => {
                    if (!e.features.length) return;
                    mapObras.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    const nomeMun = props.name || props.NM_MUN || props.municipio;
                    mapObras.setFilter('obras_muns_hover', ['==', 'name', props.name || '']);

                    $('#obras_box_content_default').addClass('d-none');
                    $('#obras_box_content_active').removeClass('d-none').html(`
                        <div class="h-100 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="badge bg-orange-100 text-[#c2410c] border border-orange-300 font-bold px-2 py-1 text-xs rounded-pill">MUNICÍPIO</span>
                                    <span class="text-xs text-slate-400 font-semibold">Detalhamento</span>
                                </div>
                                <h4 class="font-black text-slate-800 text-base mb-1">${nomeMun}</h4>
                                <hr class="my-2 border-slate-200">
                                <div class="space-y-2 mt-3 text-xs">
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Total de Obras:</span>
                                        <strong class="text-slate-800 font-black">${(props.obras_total || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Em Execução:</span>
                                        <strong class="text-amber-600 font-black">${(props.obras_execucao || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Concluídas:</span>
                                        <strong class="text-emerald-700 font-black">${(props.obras_concluidas || 0).toLocaleString('pt-BR')}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Investimento Total:</span>
                                        <strong class="text-blue-700 font-black">${fmtMoedaBiMi(props.obras_investimento)}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Avanço Físico Médio:</span>
                                        <strong class="text-purple-700 font-black">${(props.obras_media_exec || 0).toFixed(1)}%</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-3 border-t border-slate-200/80 text-center">
                                <span class="text-[11px] text-slate-400 italic">Clique para filtrar a tabela por este município</span>
                            </div>
                        </div>
                    `);
                });

                // Hover sobre os Pontos de Canteiros
                mapObras.on('mousemove', 'obras_points', (e) => {
                    if (!e.features.length) return;
                    mapObras.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;

                    $('#obras_box_content_default').addClass('d-none');
                    $('#obras_box_content_active').removeClass('d-none').html(`
                        <div class="h-100 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="badge bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-1 text-xs rounded-pill">CANTEIRO DE OBRA</span>
                                    <span class="text-xs text-slate-400 font-semibold">${props.municipio}</span>
                                </div>
                                <h4 class="font-black text-slate-800 text-base mb-1">${props.iniciativa}</h4>
                                <div class="text-xs text-slate-500 mb-2">${props.produto || ''}</div>
                                <hr class="my-2 border-slate-200">
                                <div class="space-y-2 mt-3 text-xs">
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Status:</span>
                                        <strong class="text-slate-800 font-bold">${props.status}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Diretoria:</span>
                                        <strong class="text-blue-700 font-bold">${props.diretoria}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Avanço Físico:</span>
                                        <strong class="text-amber-600 font-black">${(props.exec_fisica || 0).toFixed(1)}%</strong>
                                    </div>
                                    ${props.valor ? `
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Investimento:</span>
                                        <strong class="text-emerald-700 font-black">${fmtMoedaBiMi(props.valor)}</strong>
                                    </div>` : ''}
                                    ${props.empresa ? `
                                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                                        <span class="text-slate-500 font-bold">Contratada:</span>
                                        <span class="text-slate-700 text-truncate font-semibold" style="max-width: 140px;" title="${props.empresa}">${props.empresa}</span>
                                    </div>` : ''}
                                </div>
                            </div>
                            <div class="pt-3 border-t border-slate-200/80 text-center">
                                <span class="text-[11px] text-slate-400 italic">Passe o cursor sobre outros canteiros</span>
                            </div>
                        </div>
                    `);
                });

                // Cliques no mapa: filtram a tabela pelo município
                mapObras.on('click', 'obras_muns_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    const nomeMun = props.name || props.NM_MUN || props.municipio;
                    if (nomeMun) window.filtrarTabelaPorMunicipioObras(nomeMun);
                });

                mapObras.on('click', 'obras_points', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    const nomeMun = props.municipio;
                    if (nomeMun) window.filtrarTabelaPorMunicipioObras(nomeMun);
                });

                mapObras.on('mouseleave', 'obras_muns_fill', () => {
                    mapObras.getCanvas().style.cursor = '';
                    mapObras.setFilter('obras_muns_hover', ['==', 'name', '']);
                });

                ['obras_points', 'obras_clusters', 'obras_muns_fill'].forEach(layer => {
                    mapObras.on('mouseenter', layer, () => { mapObras.getCanvas().style.cursor = 'pointer'; });
                    mapObras.on('mouseleave', layer, () => { mapObras.getCanvas().style.cursor = ''; });
                });

                window.alternarVisaoObras(window.visaoObrasAtiva || 'todos', document.getElementById('btn_visao_obras_todos'));
            });

            // 5. RENDERIZAÇÃO DOS GRÁFICOS E TABELA
            renderizarGraficosObras(data);
            renderizarTabelaObras(data);
        })
        .catch(err => {
            console.error('[Resumo Obras] Erro:', err);
            $('#resumo_obras_spinner').addClass('d-none');
        });
};

// Alternância de camadas/visões do mapa
window.alternarVisaoObras = function (visao, btn) {
    window.visaoObrasAtiva = visao;

    $('#btn_visao_obras_todos, #btn_visao_obras_andamento, #btn_visao_obras_investimento, #btn_visao_obras_pontos')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_obras_cluster, #legenda_obras_andamento, #legenda_obras_investimento, #legenda_obras_pontos').addClass('d-none');

    if (!mapObras || !mapObras.getLayer('obras_muns_fill')) return;

    if (visao === 'todos') {
        $('#legenda_obras_cluster').removeClass('d-none');
        mapObras.setLayoutProperty('obras_clusters', 'visibility', 'visible');
        mapObras.setLayoutProperty('obras_cluster_count', 'visibility', 'visible');
        mapObras.setLayoutProperty('obras_points', 'visibility', 'visible');

        mapObras.setPaintProperty('obras_muns_fill', 'fill-color', '#f8fafc');
        mapObras.setPaintProperty('obras_muns_fill', 'fill-opacity', 0.15);
        $('#obras_camada_label').text("Exibindo: Localização e Clusters de Canteiros de Obras");

    } else if (visao === 'andamento') {
        $('#legenda_obras_andamento').removeClass('d-none');
        mapObras.setLayoutProperty('obras_clusters', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_cluster_count', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_points', 'visibility', 'none');

        mapObras.setPaintProperty('obras_muns_fill', 'fill-opacity', 0.82);
        mapObras.setPaintProperty('obras_muns_fill', 'fill-color', [
            'step',
            ['get', 'obras_execucao'],
            '#fffbeb',
            1, '#fde68a',
            5, '#f59e0b',
            20, '#b45309'
        ]);
        $('#obras_camada_label').text("Exibindo: Municípios por Volume de Obras em Execução");

    } else if (visao === 'investimento') {
        $('#legenda_obras_investimento').removeClass('d-none');
        mapObras.setLayoutProperty('obras_clusters', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_cluster_count', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_points', 'visibility', 'none');

        mapObras.setPaintProperty('obras_muns_fill', 'fill-opacity', 0.82);
        mapObras.setPaintProperty('obras_muns_fill', 'fill-color', [
            'step',
            ['get', 'obras_investimento'],
            '#f0fdf4',
            1, '#86efac',
            5000000, '#22c55e',
            20000000, '#15803d'
        ]);
        $('#obras_camada_label').text("Exibindo: Volume Financeiro de Investimento Contratado (R$)");

    } else if (visao === 'pontos') {
        $('#legenda_obras_pontos').removeClass('d-none');
        mapObras.setLayoutProperty('obras_clusters', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_cluster_count', 'visibility', 'none');
        mapObras.setLayoutProperty('obras_points', 'visibility', 'none');

        mapObras.setPaintProperty('obras_muns_fill', 'fill-opacity', 0.82);
        mapObras.setPaintProperty('obras_muns_fill', 'fill-color', [
            'step',
            ['get', 'obras_total'],
            '#eff6ff',
            1, '#93c5fd',
            4, '#3b82f6',
            11, '#1d4ed8'
        ]);
        $('#obras_camada_label').text("Exibindo: Total de Obras Contratadas por Município");
    }
};

// Renderização dos gráficos analíticos (Donut Status + Top 20 Municípios)
function renderizarGraficosObras(data) {
    if (typeof echarts === 'undefined') return;

    const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    // 1. STATUS DAS OBRAS (Donut)
    const elStatus = document.getElementById('chart_obras_status');
    if (elStatus) {
        if (chartObrasStatus) chartObrasStatus.dispose();
        chartObrasStatus = echarts.init(elStatus);

        const statusMap = { 'Em Execução': 0, 'Concluída': 0, 'Em Planejamento / Outros': 0 };

        (data.obras || []).forEach(o => {
            const s = String(o.status || '').toLowerCase();
            if (s.includes('conclu') || s.includes('finaliz') || s.includes('entreg')) {
                statusMap['Concluída'] += 1;
            } else if (s.includes('execu') || s.includes('andamento')) {
                statusMap['Em Execução'] += 1;
            } else {
                statusMap['Em Planejamento / Outros'] += 1;
            }
        });

        const statusData = [
            { value: statusMap['Concluída'], name: 'Concluída / Entregue', itemStyle: { color: '#10b981' } },
            { value: statusMap['Em Execução'], name: 'Em Execução', itemStyle: { color: '#f59e0b' } },
            { value: statusMap['Em Planejamento / Outros'], name: 'Planejamento / Outros', itemStyle: { color: '#3b82f6' } }
        ].filter(item => item.value > 0);

        const totalObras = statusData.reduce((acc, curr) => acc + curr.value, 0);

        chartObrasStatus.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const pct = totalObras > 0 ? ((params.value / totalObras) * 100).toFixed(1) : 0;
                    return `<strong>${params.name}</strong><br/>Obras: <b>${Number(params.value).toLocaleString('pt-BR')}</b> (${pct}%)`;
                }
            },
            legend: {
                orient: 'horizontal',
                bottom: '0%',
                left: 'center',
                textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 },
                itemWidth: 12,
                itemHeight: 12
            },
            series: [{
                name: 'Status das Obras',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#ffffff',
                    borderWidth: 2
                },
                label: { show: false },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 15,
                        fontWeight: 'bold',
                        formatter: (params) => `${Number(params.value).toLocaleString('pt-BR')}\nObras`
                    }
                },
                data: statusData
            }]
        });
    }

    // 2. TOP 20 MUNICÍPIOS POR VOLUME E INVESTIMENTO (Barras)
    const elMun = document.getElementById('chart_obras_por_mun');
    if (elMun) {
        if (chartObrasPorMun) chartObrasPorMun.dispose();
        chartObrasPorMun = echarts.init(elMun);

        const munTotals = {};
        (data.obras || []).forEach(o => {
            const m = String(o.municipio || '').trim();
            if (!m || m === '-' || m === 'NA') return;
            const k = norm(m);
            if (!munTotals[k]) munTotals[k] = { nome: m, qtd: 0, inv: 0 };
            munTotals[k].qtd += 1;
            munTotals[k].inv += (Number(o.valor_total) || 0);
        });

        const top20 = Object.values(munTotals)
            .sort((a, b) => b.qtd - a.qtd)
            .slice(0, 20)
            .reverse();

        const categories = top20.map(item => item.nome);
        const seriesQtd = top20.map(item => item.qtd);

        chartObrasPorMun.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const item = top20.find(t => t.nome === params[0].name);
                    const invFmt = item ? (item.inv >= 1e6 ? `R$ ${(item.inv / 1e6).toFixed(1)} Mi` : `R$ ${item.inv.toLocaleString('pt-BR')}`) : '-';
                    return `<strong>${params[0].name}</strong><br/>Total de Obras: <b>${params[0].value}</b><br/>Investimento Total: <b>${invFmt}</b>`;
                }
            },
            grid: { top: '5%', left: '3%', right: '6%', bottom: '8%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLabel: { color: '#64748b', fontSize: 10 },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: categories,
                axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 },
                axisLine: { lineStyle: { color: '#cbd5e1' } }
            },
            series: [{
                name: 'Quantidade de Obras',
                type: 'bar',
                data: seriesQtd,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#fb923c' },
                        { offset: 1, color: '#ea580c' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 10,
                    color: '#9a3412'
                }
            }]
        });
    }
}

// Renderização da tabela DataTables
function renderizarTabelaObras(data) {
    const elTable = document.getElementById('resumo_obras_tabela');
    if (!elTable || typeof $.fn.DataTable === 'undefined') return;

    if ($.fn.DataTable.isDataTable('#resumo_obras_tabela')) {
        $('#resumo_obras_tabela').DataTable().destroy();
        $('#resumo_obras_tabela').empty();
    }

    const obras = data.obras || [];

    dataTableObras = $('#resumo_obras_tabela').DataTable({
        data: obras,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[6, 'desc']], // Ordenar por investimento
        columns: [
            {
                title: "Município",
                data: "municipio",
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioObras('${d || ''}')">${d || 'Estadual'}</span>`
            },
            {
                title: "Obra / Intervenção",
                data: "iniciativa_estrategica",
                className: "align-middle",
                width: "280px",
                render: (d, t, r) => {
                    const titulo = d || r.iniciativa_resumida || r.produto || 'Obra Pública';
                    const sub = r.produto && r.produto !== titulo ? `<div class="text-xs text-slate-500 mt-0.5">${r.produto}</div>` : (r.empresa ? `<div class="text-xs text-slate-400 mt-0.5">Contratada: ${r.empresa}</div>` : '');
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            {
                title: "Diretoria",
                data: "diretoria",
                className: "align-middle text-center",
                width: "90px",
                render: (d, t, r) => `<span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs">${d || r.secretaria || 'SEDUH'}</span>`
            },
            {
                title: "Contrato",
                data: "numero_do_contrato",
                className: "align-middle text-center",
                width: "110px",
                render: d => `<span class="badge bg-slate-100 text-slate-700 font-mono border">${d && d !== '-' ? d : 'N/I'}</span>`
            },
            {
                title: "Status",
                data: "status",
                className: "align-middle",
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    else if (s.toLowerCase().includes('execu') || s.toLowerCase().includes('andamento')) badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    else if (s.toLowerCase().includes('licita') || s.toLowerCase().includes('planej')) badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    else if (s.toLowerCase().includes('paralis')) badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            {
                title: "Execução (%)",
                data: "percent_execucao_fisica",
                className: "align-middle",
                width: "120px",
                render: (d, t, r) => {
                    let num = Number(d) || Number(r.percent_execucao) || 0;
                    if (num <= 1 && num > 0) num = Math.round(num * 100);
                    else num = Math.round(num);
                    if (t !== 'display') return num;
                    const barColor = num >= 100 ? 'bg-emerald-500' : (num >= 50 ? 'bg-sky-500' : 'bg-amber-500');
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar ${barColor}" style="width: ${Math.min(num, 100)}%;"></div>
                            </div>
                            <span class="text-xs fw-bold text-slate-700">${num}%</span>
                        </div>
                    `;
                }
            },
            {
                title: "Investimento (R$)",
                data: "valor_total",
                className: "align-middle text-end fw-bold text-slate-800",
                width: "140px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        ]
    });
}

// Filtro municipal da tabela
window.filtrarTabelaPorMunicipioObras = function (nomeMun) {
    if (!nomeMun) return;
    municipioObrasFiltro = nomeMun;

    $('#obras_filtro_ativo_badge').text(`Município: ${nomeMun}`);
    $('#obras_filtro_ativo_badge_container').removeClass('d-none').addClass('d-flex');

    if (dataTableObras) {
        dataTableObras.column(0).search(`^${nomeMun}$`, true, false).draw();
    }

    const el = document.getElementById('obras_filtro_ativo_badge_container');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

window.addEventListener('resize', () => {
    if (mapObras && typeof mapObras.resize === 'function') mapObras.resize();
    if (chartObrasStatus && typeof chartObrasStatus.resize === 'function') chartObrasStatus.resize();
    if (chartObrasPorMun && typeof chartObrasPorMun.resize === 'function') chartObrasPorMun.resize();
    if (dataTableObras && typeof dataTableObras.columns.adjust === 'function') dataTableObras.columns.adjust();
});

window.limparFiltroObras = function () {
    municipioObrasFiltro = null;
    $('#obras_filtro_ativo_badge_container').removeClass('d-flex').addClass('d-none');
    $('#obras_filtro_ativo_badge').text('Filtro Ativo');

    if (dataTableObras) {
        dataTableObras.column(0).search('').draw();
    }

    if (mapObras && mapObras.getLayer('obras_muns_hover')) {
        mapObras.setFilter('obras_muns_hover', ['==', 'name', '']);
    }
};

window.renderizarTabelasHabitacaoEReurb = function(data) {
    const projetos = data.projetos || [];
    const regularizacoes = data.regularizacoes || [];

    // 1. TABELA DE EMPREENDIMENTOS HABITACIONAIS (MORAR BEM PE)
    if ($.fn.DataTable.isDataTable('#tabela_tematicas_habitacao')) {
        $('#tabela_tematicas_habitacao').DataTable().destroy();
        $('#tabela_tematicas_habitacao').empty();
    }

    dataTableHabitacao = $('#tabela_tematicas_habitacao').DataTable({
        data: projetos,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[3, 'desc']], // Ordena por quantidade de UH decrescente
        columns: [
            { 
                title: "Município", 
                data: "municipio", 
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioHabitacao('${d || ''}')">${d || 'Estadual'}</span>` 
            },
            { 
                title: "Empreendimento Habitacional", 
                data: "empreendimento", 
                className: "align-middle",
                width: "280px",
                render: (d, t, r) => {
                    const titulo = d || r.nome_empreendimento || 'Empreendimento Habitacional';
                    const sub = r.localizacao || r.endereco ? `<div class="text-xs text-slate-500 mt-0.5">${r.localizacao || r.endereco}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            { 
                title: "Linha / Financiamento", 
                data: "financiamento",
                className: "align-middle text-center",
                width: "110px",
                render: (d, t, r) => `<span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs">${d || r.programa || 'Morar Bem PE'}</span>` 
            },
            { 
                title: "Unidades (UH)", 
                data: "uh", 
                className: "align-middle text-end fw-black text-teal-700", 
                width: "100px",
                render: (d, t) => {
                    const n = Number(d || 0);
                    if (t !== 'display') return n;
                    return n.toLocaleString('pt-BR');
                }
            },
            { 
                title: "Status", 
                data: "status",
                className: "align-middle",
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) {
                        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    } else if (s.toLowerCase().includes('execu') || s.toLowerCase().includes('constru') || s.toLowerCase().includes('obras') || s.toLowerCase().includes('andamento')) {
                        badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    } else if (s.toLowerCase().includes('licita') || s.toLowerCase().includes('planej')) {
                        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    } else if (s.toLowerCase().includes('paralis')) {
                        badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                    }
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            { 
                title: "Valor Global Orçado", 
                data: "valor_global_orcado3", 
                className: "align-middle text-end fw-bold text-slate-800",
                width: "140px",
                render: (d, t, r) => {
                    const raw = d !== undefined && d !== null ? d : r.valor_total;
                    const num = parseFloat(String(raw || '0').replace(',', '.')) || 0;
                    if (t !== 'display') return num;
                    return num > 0 ? `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
                }
            }
        ]
    });

    // 2. TABELA DE REGULARIZAÇÃO FUNDIÁRIA (REURB)
    if ($.fn.DataTable.isDataTable('#tabela_tematicas_regularizacao')) {
        $('#tabela_tematicas_regularizacao').DataTable().destroy();
        $('#tabela_tematicas_regularizacao').empty();
    }

    dataTableRegularizacao = $('#tabela_tematicas_regularizacao').DataTable({
        data: regularizacoes,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[2, 'desc']], // Ordena por títulos previstos decrescente
        columns: [
            { 
                title: "Município", 
                data: "municipio", 
                className: "align-middle",
                width: "140px",
                render: (d, t, r) => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioHabitacao('${d || r.cidade || ''}')">${d || r.cidade || 'Estadual'}</span>`
            },
            { 
                title: "Núcleo Urbano / Comunidade", 
                data: "nc", 
                className: "align-middle",
                width: "260px",
                render: (d, t, r) => {
                    const titulo = d || r.local || 'Poligonal Consolidada';
                    const sub = r.processo ? `<div class="text-xs text-slate-500 mt-0.5">Processo: ${r.processo}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            { 
                title: "Classificação", 
                data: "classificacao", 
                className: "align-middle text-center",
                width: "90px",
                render: d => `<span class="badge bg-slate-800 text-white rounded-pill px-2.5 py-1 text-xs">${d || 'REURB-S'}</span>` 
            },
            { 
                title: "Títulos Previstos", 
                data: "regularizacoes", 
                className: "align-middle text-end fw-bold text-slate-800", 
                width: "110px",
                render: (d, t) => {
                    const n = Number(d || 0);
                    if (t !== 'display') return n;
                    return n > 0 ? n.toLocaleString('pt-BR') : '-';
                }
            },
            { 
                title: "Mulheres Tituladas", 
                data: "mulheres", 
                className: "align-middle text-end fw-bold text-rose-600", 
                width: "120px",
                render: (d, t) => {
                    const n = Number(d || 0);
                    if (t !== 'display') return n;
                    return n > 0 ? n.toLocaleString('pt-BR') : '-';
                }
            },
            { 
                title: "Situação / Execução", 
                data: "situacao",
                className: "align-middle",
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('realizado') || s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) {
                        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    } else if (s.toLowerCase().includes('andamento') || s.toLowerCase().includes('execu')) {
                        badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    } else if (s.toLowerCase().includes('etapa') || s.toLowerCase().includes('fase')) {
                        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    }
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || 'Em Andamento'}</span>`;
                }
            }
        ]
    });
};

window.filtrarTabelaPorMunicipioHabitacao = function (nomeMun) {
    if (!nomeMun) return;
    window.municipioHabitacaoFiltro = nomeMun;

    $('#hab_filtro_ativo_badge').text(`Município: ${nomeMun}`);
    $('#hab_filtro_ativo_badge_container').removeClass('d-none').addClass('d-flex');

    if (dataTableHabitacao) {
        dataTableHabitacao.column(0).search(`^${nomeMun}$`, true, false).draw();
    }
    if (dataTableRegularizacao) {
        dataTableRegularizacao.column(0).search(nomeMun, false, true).draw();
    }

    const el = document.getElementById('tabela_tematicas_habitacao');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.limparFiltroHabitacao = function () {
    window.municipioHabitacaoFiltro = null;
    $('#hab_filtro_ativo_badge_container').removeClass('d-flex').addClass('d-none');
    $('#hab_filtro_ativo_badge').text('Filtro Ativo');

    if (dataTableHabitacao) {
        dataTableHabitacao.column(0).search('').draw();
    }
    if (dataTableRegularizacao) {
        dataTableRegularizacao.column(0).search('').draw();
    }
    if (mapHabitacao && mapHabitacao.getLayer('hab_muns_hover')) {
        mapHabitacao.setFilter('hab_muns_hover', ['==', 'name', '']);
    }
};

/* ==========================================================================
   RESUMOS TEMÁTICOS - PAUTA CRECHES: 60 MIL VAGAS EM CRECHES E PRÉ-ESCOLA
   ========================================================================== */
let mapCreches = null;
let cacheCrechesData = null;
let chartCrechesStatus = null;
let chartCrechesPorMun = null;
let dataTableCreches = null;
window.visaoCrechesAtiva = 'todos';
window.municipioCrechesFiltro = null;
window.municipioFixoCreches = null;

window.desafixarMunicipioCreches = function() {
    window.municipioFixoCreches = null;
    atualizarHoverBoxCreches(null, null, true);
};

function atualizarHoverBoxCreches(tipo, props, forcar = false) {
    if (window.municipioFixoCreches && !forcar) return;

    const boxDefault = document.getElementById('creches_box_content_default');
    const boxActive = document.getElementById('creches_box_content_active');
    if (!boxActive || !boxDefault) return;

    if (!tipo || !props) {
        boxActive.classList.add('d-none');
        boxActive.classList.remove('d-flex');
        boxDefault.classList.remove('d-none');
        return;
    }

    boxDefault.classList.add('d-none');
    boxActive.classList.remove('d-none');
    boxActive.classList.add('d-flex');

    const fmtMoeda = (v) => {
        const n = Number(v) || 0;
        if (n >= 1e6) return `R$ ${(n / 1e6).toFixed(2).replace('.', ',')} Mi`;
        return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    const isFixo = Boolean(window.municipioFixoCreches);

    if (tipo === 'municipio') {
        const nomeMun = props.name || props.municipio || 'Município';
        boxActive.innerHTML = `
            <div class="h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge ${isFixo ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300'} font-bold px-2 py-1 text-xs rounded-pill">
                            <i class="fas ${isFixo ? 'fa-thumbtack text-amber-600' : 'fa-school text-rose-600'} me-1"></i> ${isFixo ? 'MUNICÍPIO FIXADO' : 'MUNICÍPIO'}
                        </span>
                        ${isFixo ? `
                            <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2 text-[10px] font-bold" onclick="window.desafixarMunicipioCreches()">
                                <i class="fas fa-xmark me-1"></i>Desafixar
                            </button>
                        ` : '<span class="text-xs text-slate-400 font-semibold">Clique para fixar</span>'}
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1">${nomeMun}</h4>
                    <hr class="my-2 border-slate-200">
                    <div class="space-y-2 mt-3 text-xs">
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Total de Creches:</span>
                            <strong class="text-slate-800 font-black">${(props.creches_total || 0).toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Em Execução:</span>
                            <strong class="text-amber-600 font-black">${(props.creches_execucao || 0).toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Concluídas:</span>
                            <strong class="text-emerald-700 font-black">${(props.creches_concluidas || 0).toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Investimento Total:</span>
                            <strong class="text-rose-700 font-black">${fmtMoeda(props.creches_investimento)}</strong>
                        </div>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-200/80 text-center">
                    <span class="text-[11px] text-slate-400 italic">Clique para filtrar a tabela por este município</span>
                </div>
            </div>
        `;
    } else if (tipo === 'creche') {
        boxActive.innerHTML = `
            <div class="h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-1 text-xs rounded-pill">CANTEIRO DE CRECHE</span>
                        <span class="text-xs text-slate-400 font-semibold">${props.municipio}</span>
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1">${props.iniciativa}</h4>
                    <div class="text-xs text-slate-500 mb-2">${props.produto || ''}</div>
                    <hr class="my-2 border-slate-200">
                    <div class="space-y-2 mt-3 text-xs">
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Status:</span>
                            <strong class="text-slate-800 font-bold">${props.status}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Avanço Físico:</span>
                            <strong class="text-amber-600 font-black">${(props.exec_fisica || 0).toFixed(1)}%</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Investimento:</span>
                            <strong class="text-rose-700 font-black">${fmtMoeda(props.valor)}</strong>
                        </div>
                        ${props.empresa ? `
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Contratada:</span>
                            <span class="text-slate-700 text-truncate font-semibold" style="max-width: 140px;" title="${props.empresa}">${props.empresa}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-200/80 text-center">
                    <span class="text-[11px] text-slate-400 italic">Passe o cursor sobre outros canteiros</span>
                </div>
            </div>
        `;
    }
}

window.renderizarResumoCreches = function() {
    const container = document.getElementById('resumo_creches_map');
    if (!container) return;

    if (cacheCrechesData) {
        setTimeout(() => {
            if (mapCreches && typeof mapCreches.resize === 'function') mapCreches.resize();
            if (chartCrechesStatus && typeof chartCrechesStatus.resize === 'function') chartCrechesStatus.resize();
            if (chartCrechesPorMun && typeof chartCrechesPorMun.resize === 'function') chartCrechesPorMun.resize();
            if (dataTableCreches && typeof dataTableCreches.columns.adjust === 'function') dataTableCreches.columns.adjust();
        }, 120);
        return;
    }

    $('#resumo_creches_spinner').removeClass('d-none');

    const obterDadosBase = () => {
        if (window.cacheResumoObras && window.cacheResumoObras.obras) {
            return Promise.resolve(window.cacheResumoObras);
        }
        const apiUrl = `${window.basePath || ''}/municipios/resumo/obras`.replace(/\/+/g, '/');
        return fetch(apiUrl).then(r => r.json());
    };

    obterDadosBase()
        .then(data => {
            $('#resumo_creches_spinner').addClass('d-none');

            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

            // FILTRO DE CRECHES: iniciativa_estrategica contendo 60 MIL VAGAS / CRECHES
            const todasObras = data.obras || [];
            const crechesObras = todasObras.filter(o => {
                const ini = norm(o.iniciativa_estrategica || o.iniciativa_resumida || '');
                const prod = norm(o.produto || '');
                return ini.includes('60 mil') || ini.includes('creche') || prod.includes('creche') || prod.includes('pre-escola');
            });

            // Estrutura de KPIs de Creches
            let totalCreches = crechesObras.length;
            let emExecucao = 0;
            let concluidas = 0;
            let investTotal = 0;
            const munsSet = new Set();
            const munsMap = {};

            crechesObras.forEach(o => {
                const m = norm(o.municipio);
                if (m) munsSet.add(m);

                const inv = Number(o.valor_total) || 0;
                investTotal += inv;

                const stNorm = String(o.status || '').toLowerCase();
                let statusGrupo = 'Em Execução';
                if (stNorm.includes('conclu') || stNorm.includes('finaliz') || stNorm.includes('entreg')) {
                    concluidas++;
                    statusGrupo = 'Concluída';
                } else if (stNorm.includes('execu') || stNorm.includes('andamento')) {
                    emExecucao++;
                    statusGrupo = 'Em Execução';
                }

                if (m) {
                    if (!munsMap[m]) munsMap[m] = { total: 0, execucao: 0, concluidas: 0, inv: 0 };
                    munsMap[m].total++;
                    munsMap[m].inv += inv;
                    if (statusGrupo === 'Concluída') munsMap[m].concluidas++;
                    else if (statusGrupo === 'Em Execução') munsMap[m].execucao++;
                }
            });

            const fmtMoedaBiMi = (val) => {
                if (!val || val === 0) return "R$ 0";
                if (val >= 1e9) return `R$ ${(val / 1e9).toFixed(2).replace('.', ',')} Bi`;
                if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1).replace('.', ',')} Mi`;
                return `R$ ${val.toLocaleString('pt-BR')}`;
            };

            // Atualiza KPIs no DOM
            $('#creches_kpi_total').text(totalCreches.toLocaleString('pt-BR'));
            $('#creches_kpi_execucao').text(emExecucao.toLocaleString('pt-BR'));
            $('#creches_kpi_concluidas').text(concluidas.toLocaleString('pt-BR'));
            $('#creches_kpi_investimento').text(fmtMoedaBiMi(investTotal));
            $('#creches_kpi_municipios').text(munsSet.size.toLocaleString('pt-BR'));

            $('#creches_box_stat_muns').text(munsSet.size.toLocaleString('pt-BR'));
            $('#creches_box_stat_ativas').text(emExecucao.toLocaleString('pt-BR'));
            $('#creches_box_stat_concluidas').text(concluidas.toLocaleString('pt-BR'));
            $('#creches_box_stat_investimento').text(fmtMoedaBiMi(investTotal));

            // GeoJSON enriquecido
            let geoMun = data.geojson;
            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            const munCentroids = {};
            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const nomeMun = norm(f.properties.name || f.properties.NM_MUN || f.properties.municipio);
                    try {
                        let flatCoords = [];
                        const collect = (c) => {
                            if (typeof c[0] === 'number') flatCoords.push(c);
                            else c.forEach(collect);
                        };
                        collect(f.geometry.coordinates);
                        if (flatCoords.length > 0) {
                            const sum = flatCoords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
                            munCentroids[nomeMun] = [sum[0] / flatCoords.length, sum[1] / flatCoords.length];
                        }
                    } catch(e) {}
                });

                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.name || props.NM_MUN || props.municipio);
                    const info = munsMap[kMun] || { total: 0, execucao: 0, concluidas: 0, inv: 0 };
                    props.creches_total = info.total;
                    props.creches_execucao = info.execucao;
                    props.creches_concluidas = info.concluidas;
                    props.creches_investimento = info.inv;
                });
            }

            // Features pontuais de creches
            const featuresCreches = [];
            crechesObras.forEach((o, idx) => {
                const m = norm(o.municipio);
                let lat = Number(o.latitude);
                let lng = Number(o.longitude);

                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    if (m && munCentroids[m]) {
                        const jitterX = ((idx % 7) - 3) * 0.008;
                        const jitterY = (((idx * 3) % 7) - 3) * 0.008;
                        lng = munCentroids[m][0] + jitterX;
                        lat = munCentroids[m][1] + jitterY;
                    }
                }

                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    const exec = Number(o.percent_execucao_fisica) || Number(o.percent_execucao) || 0;
                    featuresCreches.push({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [lng, lat] },
                        properties: {
                            iniciativa: o.iniciativa_estrategica || o.iniciativa_resumida || o.produto || 'Creche',
                            produto: o.produto || '',
                            municipio: o.municipio || '',
                            status: o.status || 'Em Execução',
                            empresa: o.empresa || '',
                            valor: Number(o.valor_total) || 0,
                            exec_fisica: exec <= 1.0 && exec > 0 ? exec * 100 : exec
                        }
                    });
                }
            });

            cacheCrechesData = {
                obras: crechesObras,
                geoMun: geoMun,
                geoCreches: { type: 'FeatureCollection', features: featuresCreches }
            };

            // Inicialização do Mapa
            if (mapCreches) {
                try { mapCreches.remove(); } catch(e) {}
            }

            mapCreches = new maplibregl.Map({
                container: 'resumo_creches_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapCreches.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapCreches.on('load', () => {
                mapCreches.resize();

                try {
                    const bounds = new maplibregl.LngLatBounds();
                    featuresCreches.forEach(f => bounds.extend(f.geometry.coordinates));
                    if (!bounds.isEmpty()) {
                        mapCreches.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 800 });
                    }
                } catch(e) {}

                if (geoMun && geoMun.features) {
                    mapCreches.addSource('creches_mun_source', { type: 'geojson', data: geoMun });

                    mapCreches.addLayer({
                        id: 'creches_muns_fill',
                        type: 'fill',
                        source: 'creches_mun_source',
                        paint: {
                            'fill-color': '#f8fafc',
                            'fill-opacity': window.visaoCrechesAtiva === 'todos' ? 0.08 : 0.75
                        }
                    });

                    mapCreches.addLayer({
                        id: 'creches_muns_line',
                        type: 'line',
                        source: 'creches_mun_source',
                        paint: { 'line-color': '#94a3b8', 'line-width': 0.8, 'line-opacity': 0.5 }
                    });

                    mapCreches.addLayer({
                        id: 'creches_muns_hover',
                        type: 'line',
                        source: 'creches_mun_source',
                        paint: { 'line-color': '#e11d48', 'line-width': 2.4 },
                        filter: ['==', 'name', '']
                    });
                }

                mapCreches.addSource('creches_points_source', {
                    type: 'geojson',
                    data: cacheCrechesData.geoCreches,
                    cluster: true,
                    clusterMaxZoom: 10,
                    clusterRadius: 35
                });

                mapCreches.addLayer({
                    id: 'creches_clusters',
                    type: 'circle',
                    source: 'creches_points_source',
                    filter: ['has', 'point_count'],
                    layout: { 'visibility': window.visaoCrechesAtiva === 'todos' ? 'visible' : 'none' },
                    paint: {
                        'circle-color': '#f43f5e',
                        'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 15, 26],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': 0.85
                    }
                });

                mapCreches.addLayer({
                    id: 'creches_cluster_count',
                    type: 'symbol',
                    source: 'creches_points_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoCrechesAtiva === 'todos' ? 'visible' : 'none',
                        'text-field': '{point_count_abbreviated}',
                        'text-size': 12
                    },
                    paint: { 'text-color': '#ffffff' }
                });

                mapCreches.addLayer({
                    id: 'creches_points',
                    type: 'circle',
                    source: 'creches_points_source',
                    filter: ['!', ['has', 'point_count']],
                    layout: { 'visibility': window.visaoCrechesAtiva === 'todos' ? 'visible' : 'none' },
                    paint: {
                        'circle-color': [
                            'case',
                            ['in', 'conclu', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'entreg', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'execu', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'andamento', ['downcase', ['get', 'status']]], '#f59e0b',
                            '#f43f5e'
                        ],
                        'circle-radius': 7,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                mapCreches.on('click', 'creches_clusters', (e) => {
                    const clFeatures = mapCreches.queryRenderedFeatures(e.point, { layers: ['creches_clusters'] });
                    if (!clFeatures.length) return;
                    const clusterId = clFeatures[0].properties.cluster_id;
                    mapCreches.getSource('creches_points_source').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        mapCreches.easeTo({ center: clFeatures[0].geometry.coordinates, zoom: zoom });
                    });
                });

                mapCreches.on('mousemove', 'creches_muns_fill', (e) => {
                    if (!e.features.length) return;
                    mapCreches.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    mapCreches.setFilter('creches_muns_hover', ['==', 'name', props.name || '']);
                    atualizarHoverBoxCreches('municipio', props, false);
                });

                mapCreches.on('mousemove', 'creches_points', (e) => {
                    if (!e.features.length) return;
                    mapCreches.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    atualizarHoverBoxCreches('creche', props, false);
                });

                mapCreches.on('mouseleave', 'creches_muns_fill', () => {
                    mapCreches.getCanvas().style.cursor = '';
                    mapCreches.setFilter('creches_muns_hover', ['==', 'name', '']);
                    if (!window.municipioFixoCreches) atualizarHoverBoxCreches(null, null, false);
                });

                mapCreches.on('mouseleave', 'creches_points', () => {
                    if (!window.municipioFixoCreches) atualizarHoverBoxCreches(null, null, false);
                });

                mapCreches.on('click', 'creches_muns_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    const nomeMun = props.name || props.NM_MUN || props.municipio;
                    if (window.municipioFixoCreches === nomeMun) {
                        window.desafixarMunicipioCreches();
                    } else {
                        window.municipioFixoCreches = nomeMun;
                        atualizarHoverBoxCreches('municipio', props, true);
                    }
                    if (nomeMun) window.filtrarTabelaPorMunicipioCreches(nomeMun);
                });

                window.alternarVisaoCreches(window.visaoCrechesAtiva || 'todos', document.getElementById('btn_visao_creches_todos'));
            });

            // Gráficos e Tabela
            renderizarGraficosCreches(crechesObras);
            renderizarTabelaCreches(crechesObras);
        })
        .catch(err => {
            console.error('[Resumo Creches] Erro:', err);
            $('#resumo_creches_spinner').addClass('d-none');
        });
};

window.alternarVisaoCreches = function (visao, btn) {
    window.visaoCrechesAtiva = visao;

    $('#btn_visao_creches_todos, #btn_visao_creches_andamento, #btn_visao_creches_pontos')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_creches_cluster, #legenda_creches_andamento, #legenda_creches_pontos').addClass('d-none');

    if (!mapCreches || !mapCreches.getLayer('creches_muns_fill')) return;

    if (visao === 'todos') {
        $('#legenda_creches_cluster').removeClass('d-none');
        mapCreches.setLayoutProperty('creches_clusters', 'visibility', 'visible');
        mapCreches.setLayoutProperty('creches_cluster_count', 'visibility', 'visible');
        mapCreches.setLayoutProperty('creches_points', 'visibility', 'visible');
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-color', '#f8fafc');
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-opacity', 0.15);
        $('#creches_camada_label').text("Exibindo: Localização e Clusters de Creches");
    } else if (visao === 'andamento') {
        $('#legenda_creches_andamento').removeClass('d-none');
        mapCreches.setLayoutProperty('creches_clusters', 'visibility', 'none');
        mapCreches.setLayoutProperty('creches_cluster_count', 'visibility', 'none');
        mapCreches.setLayoutProperty('creches_points', 'visibility', 'none');
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-opacity', 0.82);
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-color', [
            'step',
            ['get', 'creches_execucao'],
            '#fff1f2',
            1, '#fda4af',
            2, '#f43f5e',
            5, '#9f1239'
        ]);
        $('#creches_camada_label').text("Exibindo: Municípios por Volume de Creches em Execução");
    } else if (visao === 'pontos') {
        $('#legenda_creches_pontos').removeClass('d-none');
        mapCreches.setLayoutProperty('creches_clusters', 'visibility', 'none');
        mapCreches.setLayoutProperty('creches_cluster_count', 'visibility', 'none');
        mapCreches.setLayoutProperty('creches_points', 'visibility', 'none');
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-opacity', 0.82);
        mapCreches.setPaintProperty('creches_muns_fill', 'fill-color', [
            'step',
            ['get', 'creches_total'],
            '#fff1f2',
            1, '#fecdd3',
            3, '#f43f5e',
            6, '#881337'
        ]);
        $('#creches_camada_label').text("Exibindo: Total de Creches Pactuadas por Município");
    }
};

function renderizarGraficosCreches(crechesObras) {
    if (typeof echarts === 'undefined') return;

    // 1. Donut de Status
    const elStatus = document.getElementById('chart_creches_status');
    if (elStatus) {
        if (chartCrechesStatus) chartCrechesStatus.dispose();
        chartCrechesStatus = echarts.init(elStatus);

        const statusMap = { 'Em Execução': 0, 'Concluída': 0, 'Em Planejamento / Outros': 0 };
        crechesObras.forEach(o => {
            const s = String(o.status || '').toLowerCase();
            if (s.includes('conclu') || s.includes('finaliz') || s.includes('entreg')) statusMap['Concluída']++;
            else if (s.includes('execu') || s.includes('andamento')) statusMap['Em Execução']++;
            else statusMap['Em Planejamento / Outros']++;
        });

        const statusData = [
            { value: statusMap['Concluída'], name: 'Concluída / Entregue', itemStyle: { color: '#10b981' } },
            { value: statusMap['Em Execução'], name: 'Em Execução', itemStyle: { color: '#f59e0b' } },
            { value: statusMap['Em Planejamento / Outros'], name: 'Planejamento / Outros', itemStyle: { color: '#3b82f6' } }
        ].filter(item => item.value > 0);

        const total = statusData.reduce((acc, curr) => acc + curr.value, 0);

        chartCrechesStatus.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (p) => `<strong>${p.name}</strong><br/>Creches: <b>${p.value}</b> (${total > 0 ? ((p.value/total)*100).toFixed(1) : 0}%)`
            },
            legend: { orient: 'horizontal', bottom: '0%', left: 'center', textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 } },
            series: [{
                name: 'Status das Creches',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
                data: statusData
            }]
        });
    }

    // 2. Top 20 Municípios
    const elMun = document.getElementById('chart_creches_por_mun');
    if (elMun) {
        if (chartCrechesPorMun) chartCrechesPorMun.dispose();
        chartCrechesPorMun = echarts.init(elMun);

        const munTotals = {};
        crechesObras.forEach(o => {
            const m = String(o.municipio || '').trim();
            if (!m || m === '-' || m === 'NA') return;
            if (!munTotals[m]) munTotals[m] = { nome: m, qtd: 0, inv: 0 };
            munTotals[m].qtd++;
            munTotals[m].inv += (Number(o.valor_total) || 0);
        });

        const top20 = Object.values(munTotals).sort((a, b) => b.qtd - a.qtd).slice(0, 20).reverse();

        chartCrechesPorMun.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const item = top20.find(t => t.nome === params[0].name);
                    const invFmt = item ? (item.inv >= 1e6 ? `R$ ${(item.inv / 1e6).toFixed(1)} Mi` : `R$ ${item.inv.toLocaleString('pt-BR')}`) : '-';
                    return `<strong>${params[0].name}</strong><br/>Creches: <b>${params[0].value}</b><br/>Investimento Total: <b>${invFmt}</b>`;
                }
            },
            grid: { top: '5%', left: '3%', right: '6%', bottom: '8%', containLabel: true },
            xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: top20.map(t => t.nome), axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 } },
            series: [{
                name: 'Qtd. de Creches',
                type: 'bar',
                data: top20.map(t => t.qtd),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#fda4af' },
                        { offset: 1, color: '#e11d48' }
                    ])
                },
                label: { show: true, position: 'right', fontWeight: 'bold', fontSize: 10, color: '#881337' }
            }]
        });
    }
}

function renderizarTabelaCreches(crechesObras) {
    const elTable = document.getElementById('resumo_creches_tabela');
    if (!elTable || typeof $.fn.DataTable === 'undefined') return;

    if ($.fn.DataTable.isDataTable('#resumo_creches_tabela')) {
        $('#resumo_creches_tabela').DataTable().destroy();
        $('#resumo_creches_tabela').empty();
    }

    dataTableCreches = $('#resumo_creches_tabela').DataTable({
        data: crechesObras,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[5, 'desc']], // Ordenar por investimento
        columns: [
            {
                title: "Município",
                data: "municipio",
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioCreches('${d || ''}')">${d || 'Estadual'}</span>`
            },
            {
                title: "Unidade / Empreendimento",
                data: "produto",
                className: "align-middle",
                width: "280px",
                render: (d, t, r) => {
                    const titulo = d || r.iniciativa_estrategica || 'Creche e Pré-Escola';
                    const sub = r.empresa ? `<div class="text-xs text-slate-400 mt-0.5">Contratada: ${r.empresa}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            {
                title: "Contrato",
                data: "numero_do_contrato",
                className: "align-middle text-center",
                width: "110px",
                render: d => `<span class="badge bg-slate-100 text-slate-700 font-mono border">${d && d !== '-' ? d : 'N/I'}</span>`
            },
            {
                title: "Status",
                data: "status",
                className: "align-middle",
                width: "140px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    else if (s.toLowerCase().includes('execu') || s.toLowerCase().includes('andamento')) badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    else if (s.toLowerCase().includes('licita') || s.toLowerCase().includes('planej')) badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            {
                title: "Execução (%)",
                data: "percent_execucao_fisica",
                className: "align-middle",
                width: "120px",
                render: (d, t, r) => {
                    let num = Number(d) || Number(r.percent_execucao) || 0;
                    if (num <= 1 && num > 0) num = Math.round(num * 100);
                    else num = Math.round(num);
                    if (t !== 'display') return num;
                    const barColor = num >= 100 ? 'bg-emerald-500' : (num >= 50 ? 'bg-sky-500' : 'bg-amber-500');
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar ${barColor}" style="width: ${Math.min(num, 100)}%;"></div>
                            </div>
                            <span class="text-xs fw-bold text-slate-700">${num}%</span>
                        </div>
                    `;
                }
            },
            {
                title: "Investimento (R$)",
                data: "valor_total",
                className: "align-middle text-end fw-bold text-slate-800",
                width: "140px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        ]
    });
}

window.filtrarTabelaPorMunicipioCreches = function (nomeMun) {
    if (!nomeMun) return;
    window.municipioCrechesFiltro = nomeMun;
    $('#creches_filtro_ativo_badge').text(`Município: ${nomeMun}`);
    $('#creches_filtro_ativo_badge_container').removeClass('d-none').addClass('d-flex');

    if (dataTableCreches) {
        dataTableCreches.column(0).search(`^${nomeMun}$`, true, false).draw();
    }
    const el = document.getElementById('creches_filtro_ativo_badge_container');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.limparFiltroCreches = function () {
    window.municipioCrechesFiltro = null;
    $('#creches_filtro_ativo_badge_container').removeClass('d-flex').addClass('d-none');
    $('#creches_filtro_ativo_badge').text('Filtro Ativo');

    if (dataTableCreches) {
        dataTableCreches.column(0).search('').draw();
    }
    if (mapCreches && mapCreches.getLayer('creches_muns_hover')) {
        mapCreches.setFilter('creches_muns_hover', ['==', 'name', '']);
    }
};

window.addEventListener('resize', () => {
    if (mapCreches && typeof mapCreches.resize === 'function') mapCreches.resize();
    if (chartCrechesStatus && typeof chartCrechesStatus.resize === 'function') chartCrechesStatus.resize();
    if (chartCrechesPorMun && typeof chartCrechesPorMun.resize === 'function') chartCrechesPorMun.resize();
    if (dataTableCreches && typeof dataTableCreches.columns.adjust === 'function') dataTableCreches.columns.adjust();
});


/* ==========================================================================
   RESUMOS TEMÁTICOS - PAUTA EDUCAÇÃO: TRANSPORTE ESCOLAR (ÔNIBUS E VANS)
   ========================================================================== */
let mapEducacao = null;
let cacheEducacaoData = null;
let chartEducacaoComposicao = null;
let chartEducacaoPorMun = null;
let dataTableEducacao = null;
window.visaoEducacaoAtiva = 'total';
window.municipioFixoEducacao = null;

window.desafixarMunicipioEducacao = function() {
    window.municipioFixoEducacao = null;
    atualizarHoverBoxEducacao(null, null, true);
};

function atualizarHoverBoxEducacao(tipo, props, forcar = false) {
    if (window.municipioFixoEducacao && !forcar) return;

    const boxDefault = document.getElementById('educacao_box_content_default');
    const boxActive = document.getElementById('educacao_box_content_active');
    if (!boxActive || !boxDefault) return;

    if (!tipo || !props) {
        boxActive.classList.add('d-none');
        boxActive.classList.remove('d-flex');
        boxDefault.classList.remove('d-none');
        return;
    }

    boxDefault.classList.add('d-none');
    boxActive.classList.remove('d-none');
    boxActive.classList.add('d-flex');

    const fmtMoeda = (v) => {
        const n = Number(v) || 0;
        if (n >= 1e6) return `R$ ${(n / 1e6).toFixed(2).replace('.', ',')} Mi`;
        return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    const isFixo = Boolean(window.municipioFixoEducacao);
    const nomeMun = props.municipio || props.name || props.NM_MUN || 'Município';
    const totalVeiculos = (Number(props.transp_onibus) || 0) + (Number(props.transp_vans) || 0);

    boxActive.innerHTML = `
        <div class="h-100 d-flex flex-column justify-content-between">
            <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge ${isFixo ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'} font-bold px-2 py-1 text-xs rounded-pill">
                        <i class="fas ${isFixo ? 'fa-thumbtack text-amber-600' : 'fa-bus text-amber-600'} me-1"></i> ${isFixo ? 'MUNICÍPIO FIXADO' : (props.regiao_de_desenvolvimento || 'Pernambuco')}
                    </span>
                    ${isFixo ? `
                        <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2 text-[10px] font-bold" onclick="window.desafixarMunicipioEducacao()">
                            <i class="fas fa-xmark me-1"></i>Desafixar
                        </button>
                    ` : '<span class="text-xs text-slate-400 font-semibold">Clique para fixar</span>'}
                </div>
                <h4 class="font-black text-slate-800 text-base mb-1">${nomeMun}</h4>
                <div class="text-xs text-slate-500 mb-2">${props.produto || (totalVeiculos + ' veículos entregues')}</div>
                <hr class="my-2 border-slate-200">
                <div class="space-y-2 mt-3 text-xs">
                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                        <span class="text-slate-500 font-bold">Total de Veículos:</span>
                        <strong class="text-amber-700 font-black">${totalVeiculos.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                        <span class="text-slate-500 font-bold">Ônibus Escolares:</span>
                        <strong class="text-yellow-700 font-black">${(Number(props.transp_onibus) || 0).toLocaleString('pt-BR')}</strong>
                    </div>
                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                        <span class="text-slate-500 font-bold">Vans Escolares:</span>
                        <strong class="text-sky-700 font-black">${(Number(props.transp_vans) || 0).toLocaleString('pt-BR')}</strong>
                    </div>
                    <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                        <span class="text-slate-500 font-bold">Investimento na Frota:</span>
                        <strong class="text-emerald-700 font-black">${fmtMoeda(props.transp_valor)}</strong>
                    </div>
                </div>
            </div>
            <div class="pt-3 border-t border-slate-200/80 text-center">
                <span class="text-[11px] text-slate-400 italic">Clique para filtrar a tabela por este município</span>
            </div>
        </div>
    `;
}

window.renderizarResumoEducacao = function() {
    const container = document.getElementById('resumo_educacao_map');
    if (!container) return;

    if (cacheEducacaoData) {
        setTimeout(() => {
            if (mapEducacao && typeof mapEducacao.resize === 'function') mapEducacao.resize();
            if (chartEducacaoComposicao && typeof chartEducacaoComposicao.resize === 'function') chartEducacaoComposicao.resize();
            if (chartEducacaoPorMun && typeof chartEducacaoPorMun.resize === 'function') chartEducacaoPorMun.resize();
            if (dataTableEducacao && typeof dataTableEducacao.columns.adjust === 'function') dataTableEducacao.columns.adjust();
        }, 120);
        return;
    }

    $('#resumo_educacao_spinner').removeClass('d-none');

    // Busca da API consolidada de cozinhas ou do json direto
    const apiUrl = `${window.basePath || ''}/municipios/resumo/cozinhas`.replace(/\/+/g, '/');
    const fallbackUrl = `${window.basePath || ''}/data/json/df_transporte.json`.replace(/\/+/g, '/');

    fetch(apiUrl)
        .then(res => res.json())
        .then(async data => {
            let transporte = data.transporte || [];
            let geoMun = data.geojson_municipios;

            // Fallback caso a rota principal não contenha transporte
            if (!transporte.length) {
                try {
                    const r2 = await fetch(fallbackUrl);
                    if (r2.ok) transporte = await r2.json();
                } catch(e) {}
            }

            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            $('#resumo_educacao_spinner').addClass('d-none');

            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

            let totOnibus = 0, totVans = 0, totInvest = 0;
            const munsMap = {};
            const munsIbgeMap = {};

            transporte.forEach(t => {
                const onibus = Number(t.qtd_onibus) || 0;
                const vans = Number(t.qtd_vans) || 0;
                
                let vFloat = 0;
                if (typeof t.valor_total === 'number') {
                    vFloat = t.valor_total;
                } else if (typeof t.valor_total === 'string') {
                    vFloat = parseFloat(t.valor_total.replace(',', '.')) || 0;
                }

                totOnibus += onibus;
                totVans += vans;
                totInvest += vFloat;

                const kMun = norm(t.municipio);
                const rawIbge = t.ibge7 ? String(t.ibge7).trim() : (t.cod_ibge ? String(t.cod_ibge).trim() : '');
                const ibge6 = rawIbge.length >= 6 ? rawIbge.substring(0, 6) : '';

                const obj = {
                    municipio: t.municipio,
                    onibus: onibus,
                    vans: vans,
                    total: onibus + vans,
                    valor: vFloat,
                    produto: t.produto || `${onibus + vans} veículos`,
                    rd: t.regiao_de_desenvolvimento || ''
                };

                if (kMun) munsMap[kMun] = obj;
                if (rawIbge) munsIbgeMap[rawIbge] = obj;
                if (ibge6) munsIbgeMap[ibge6] = obj;
            });

            const totFrota = totOnibus + totVans;

            const fmtMoedaBiMi = (val) => {
                if (!val || val === 0) return "R$ 0";
                if (val >= 1e9) return `R$ ${(val / 1e9).toFixed(2).replace('.', ',')} Bi`;
                if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1).replace('.', ',')} Mi`;
                return `R$ ${val.toLocaleString('pt-BR')}`;
            };

            // Atualiza KPIs
            $('#transp_kpi_total').text(totFrota.toLocaleString('pt-BR'));
            $('#transp_kpi_onibus').text(totOnibus.toLocaleString('pt-BR'));
            $('#transp_kpi_vans').text(totVans.toLocaleString('pt-BR'));
            $('#transp_kpi_investimento').text(fmtMoedaBiMi(totInvest));
            $('#transp_kpi_municipios').text(Object.keys(munsMap).length.toLocaleString('pt-BR'));

            $('#educacao_box_stat_onibus').text(totOnibus.toLocaleString('pt-BR'));
            $('#educacao_box_stat_vans').text(totVans.toLocaleString('pt-BR'));
            $('#educacao_box_stat_investimento').text(fmtMoedaBiMi(totInvest));

            // Enriquecer GeoJSON
            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.municipio || props.name || props.NM_MUN);
                    const rawCod = String(props.ibge7 || props.cod_ibge || props.codarea || props.ibge6 || '').trim();
                    const kIbge6 = rawCod.length >= 6 ? rawCod.substring(0, 6) : '';

                    const info = munsIbgeMap[rawCod] || munsIbgeMap[kIbge6] || munsMap[kMun] || { onibus: 0, vans: 0, total: 0, valor: 0 };
                    props.transp_onibus = info.onibus;
                    props.transp_vans = info.vans;
                    props.transp_total = info.total;
                    props.transp_valor = info.valor;
                    props.municipio = info.municipio || props.municipio || props.name;
                    props.produto = info.produto || '';
                });
            }

            cacheEducacaoData = {
                transporte: transporte,
                geoMun: geoMun
            };

            // Inicialização do Mapa MapLibre
            if (mapEducacao) {
                try { mapEducacao.remove(); } catch(e) {}
            }

            mapEducacao = new maplibregl.Map({
                container: 'resumo_educacao_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapEducacao.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapEducacao.on('load', () => {
                mapEducacao.resize();

                if (geoMun && geoMun.features) {
                    try {
                        const bounds = new maplibregl.LngLatBounds();
                        geoMun.features.forEach(feature => {
                            const geom = feature.geometry;
                            if (!geom) return;
                            const expand = (c) => {
                                if (typeof c[0] === 'number') bounds.extend(c);
                                else c.forEach(expand);
                            };
                            expand(geom.coordinates);
                        });
                        if (!bounds.isEmpty()) {
                            mapEducacao.fitBounds(bounds, { padding: 30, animate: false });
                        }
                    } catch (e) {}

                    mapEducacao.addSource('educacao_mun_source', { type: 'geojson', data: geoMun });

                    mapEducacao.addLayer({
                        id: 'educacao_muns_fill',
                        type: 'fill',
                        source: 'educacao_mun_source',
                        paint: {
                            'fill-color': [
                                'step',
                                ['get', 'transp_total'],
                                '#fef3c7',
                                5, '#f59e0b',
                                10, '#d97706',
                                20, '#78350f'
                            ],
                            'fill-opacity': 0.85
                        }
                    });

                    mapEducacao.addLayer({
                        id: 'educacao_muns_line',
                        type: 'line',
                        source: 'educacao_mun_source',
                        paint: { 'line-color': '#ffffff', 'line-width': 0.8 }
                    });

                    mapEducacao.addLayer({
                        id: 'educacao_muns_hover',
                        type: 'line',
                        source: 'educacao_mun_source',
                        paint: { 'line-color': '#0f172a', 'line-width': 2.4 },
                        filter: ['==', 'municipio', '']
                    });

                    mapEducacao.on('mousemove', 'educacao_muns_fill', (e) => {
                        if (!e.features.length) return;
                        mapEducacao.getCanvas().style.cursor = 'pointer';
                        const props = e.features[0].properties;
                        mapEducacao.setFilter('educacao_muns_hover', ['==', 'municipio', props.municipio || '']);
                        atualizarHoverBoxEducacao('municipio', props, false);
                    });

                    mapEducacao.on('mouseleave', 'educacao_muns_fill', () => {
                        mapEducacao.getCanvas().style.cursor = '';
                        mapEducacao.setFilter('educacao_muns_hover', ['==', 'municipio', '']);
                        if (!window.municipioFixoEducacao) atualizarHoverBoxEducacao(null, null, false);
                    });

                    mapEducacao.on('click', 'educacao_muns_fill', (e) => {
                        if (!e.features.length) return;
                        const props = e.features[0].properties;
                        const nomeMun = props.municipio;
                        if (window.municipioFixoEducacao === nomeMun) {
                            window.desafixarMunicipioEducacao();
                        } else {
                            window.municipioFixoEducacao = nomeMun;
                            atualizarHoverBoxEducacao('municipio', props, true);
                        }
                        if (nomeMun) window.filtrarTabelaPorMunicipioEducacao(nomeMun);
                    });
                }
            });

            // Gráficos e Tabela
            renderizarGraficosEducacao(transporte, totOnibus, totVans);
            renderizarTabelaEducacao(transporte);
        })
        .catch(err => {
            console.error('[Resumo Educação] Erro:', err);
            $('#resumo_educacao_spinner').addClass('d-none');
        });
};

window.alternarVisaoEducacao = function (visao, btn) {
    window.visaoEducacaoAtiva = visao;

    $('#btn_visao_transp_total, #btn_visao_transp_onibus, #btn_visao_transp_vans')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_transp_total, #legenda_transp_onibus, #legenda_transp_vans').addClass('d-none');

    if (!mapEducacao || !mapEducacao.getLayer('educacao_muns_fill')) return;

    if (visao === 'total') {
        $('#legenda_transp_total').removeClass('d-none');
        mapEducacao.setPaintProperty('educacao_muns_fill', 'fill-color', [
            'step',
            ['get', 'transp_total'],
            '#fef3c7',
            5, '#f59e0b',
            10, '#d97706',
            20, '#78350f'
        ]);
        $('#educacao_camada_label').text("Exibindo: Total de Veículos Entregues (Ônibus + Vans)");
    } else if (visao === 'onibus') {
        $('#legenda_transp_onibus').removeClass('d-none');
        mapEducacao.setPaintProperty('educacao_muns_fill', 'fill-color', [
            'step',
            ['get', 'transp_onibus'],
            '#fef9c3',
            5, '#eab308',
            10, '#ca8a04',
            15, '#713f12'
        ]);
        $('#educacao_camada_label').text("Exibindo: Apenas Ônibus Escolares Entregues");
    } else if (visao === 'vans') {
        $('#legenda_transp_vans').removeClass('d-none');
        mapEducacao.setPaintProperty('educacao_muns_fill', 'fill-color', [
            'step',
            ['get', 'transp_vans'],
            '#f0f9ff',
            1, '#38bdf8',
            2, '#0284c7',
            4, '#0c4a6e'
        ]);
        $('#educacao_camada_label').text("Exibindo: Apenas Vans Escolares Entregues");
    }
};

function renderizarGraficosEducacao(transporte, totOnibus, totVans) {
    if (typeof echarts === 'undefined') return;

    // 1. Donut de Composição
    const elComp = document.getElementById('chart_educacao_composicao');
    if (elComp) {
        if (chartEducacaoComposicao) chartEducacaoComposicao.dispose();
        chartEducacaoComposicao = echarts.init(elComp);

        const dataComp = [
            { value: totOnibus, name: 'Ônibus Escolares', itemStyle: { color: '#eab308' } },
            { value: totVans, name: 'Vans Escolares', itemStyle: { color: '#0284c7' } }
        ];

        const total = totOnibus + totVans;

        chartEducacaoComposicao.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (p) => `<strong>${p.name}</strong><br/>Veículos: <b>${p.value}</b> (${total > 0 ? ((p.value/total)*100).toFixed(1) : 0}%)`
            },
            legend: { orient: 'horizontal', bottom: '0%', left: 'center', textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 } },
            series: [{
                name: 'Composição da Frota',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
                data: dataComp
            }]
        });
    }

    // 2. Top 20 Municípios
    const elMun = document.getElementById('chart_educacao_por_mun');
    if (elMun) {
        if (chartEducacaoPorMun) chartEducacaoPorMun.dispose();
        chartEducacaoPorMun = echarts.init(elMun);

        const top20 = transporte
            .map(t => ({
                nome: t.municipio,
                onibus: Number(t.qtd_onibus) || 0,
                vans: Number(t.qtd_vans) || 0,
                total: (Number(t.qtd_onibus) || 0) + (Number(t.qtd_vans) || 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 20)
            .reverse();

        chartEducacaoPorMun.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    let out = `<strong>${params[0].name}</strong><br/>`;
                    params.forEach(p => {
                        out += `${p.marker} ${p.seriesName}: <b>${p.value}</b><br/>`;
                    });
                    return out;
                }
            },
            legend: { orient: 'horizontal', bottom: '0%', left: 'center', textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 } },
            grid: { top: '5%', left: '3%', right: '6%', bottom: '10%', containLabel: true },
            xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: top20.map(t => t.nome), axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 } },
            series: [
                {
                    name: 'Ônibus',
                    type: 'bar',
                    stack: 'frota',
                    data: top20.map(t => t.onibus),
                    itemStyle: { color: '#eab308' }
                },
                {
                    name: 'Vans',
                    type: 'bar',
                    stack: 'frota',
                    data: top20.map(t => t.vans),
                    itemStyle: { color: '#0284c7' }
                }
            ]
        });
    }
}

function renderizarTabelaEducacao(transporte) {
    const elTable = document.getElementById('resumo_educacao_tabela');
    if (!elTable || typeof $.fn.DataTable === 'undefined') return;

    if ($.fn.DataTable.isDataTable('#resumo_educacao_tabela')) {
        $('#resumo_educacao_tabela').DataTable().destroy();
        $('#resumo_educacao_tabela').empty();
    }

    dataTableEducacao = $('#resumo_educacao_tabela').DataTable({
        data: transporte,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[4, 'desc']], // Ordenar por total de veículos
        columns: [
            {
                title: "Município",
                data: "municipio",
                className: "align-middle",
                width: "160px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioEducacao('${d || ''}')">${d || 'Estadual'}</span>`
            },
            {
                title: "Região (RD)",
                data: "regiao_de_desenvolvimento",
                className: "align-middle text-center",
                width: "140px",
                render: d => `<span class="badge bg-slate-100 text-slate-700 border text-xs">${d || '-'}</span>`
            },
            {
                title: "Ônibus",
                data: "qtd_onibus",
                className: "align-middle text-center fw-bold",
                width: "90px",
                render: (d, t) => {
                    const n = Number(d) || 0;
                    if (t !== 'display') return n;
                    return n > 0 ? `<span class="badge bg-yellow-50 text-yellow-800 border border-yellow-300 font-black px-2.5 py-1 text-xs rounded-pill">${n}</span>` : `<span class="text-slate-300">-</span>`;
                }
            },
            {
                title: "Vans",
                data: "qtd_vans",
                className: "align-middle text-center fw-bold",
                width: "90px",
                render: (d, t) => {
                    const n = Number(d) || 0;
                    if (t !== 'display') return n;
                    return n > 0 ? `<span class="badge bg-sky-50 text-sky-800 border border-sky-300 font-black px-2.5 py-1 text-xs rounded-pill">${n}</span>` : `<span class="text-slate-300">-</span>`;
                }
            },
            {
                title: "Total de Veículos",
                data: null,
                className: "align-middle text-center fw-black",
                width: "120px",
                render: (d, t, r) => {
                    const total = (Number(r.qtd_onibus) || 0) + (Number(r.qtd_vans) || 0);
                    if (t !== 'display') return total;
                    return `<span class="badge bg-amber-100 text-amber-900 border border-amber-300 font-black px-3 py-1 text-xs rounded-pill">${total} veículos</span>`;
                }
            },
            {
                title: "Status",
                data: "status",
                className: "align-middle",
                width: "120px",
                render: d => `<span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-pill px-2.5 py-1 text-xs font-bold">${d || 'CONCLUÍDA'}</span>`
            },
            {
                title: "Investimento (R$)",
                data: "valor_total",
                className: "align-middle text-end fw-bold text-slate-800",
                width: "150px",
                render: (d, t) => {
                    let num = 0;
                    if (typeof d === 'number') num = d;
                    else if (typeof d === 'string') num = parseFloat(d.replace(',', '.')) || 0;
                    if (t !== 'display') return num;
                    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        ]
    });
}
window.filtrarTabelaPorMunicipioEducacao = function(nomeMun) {
    if (!nomeMun) return;
    $('#educacao_filtro_ativo_badge').text(`Município: ${nomeMun}`);
    $('#educacao_filtro_ativo_badge_container').removeClass('d-none').addClass('d-flex');

    if (dataTableEducacao) {
        dataTableEducacao.column(0).search(`^${nomeMun}$`, true, false).draw();
    }
    const el = document.getElementById('educacao_filtro_ativo_badge_container');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.limparFiltroEducacao = function() {
    $('#educacao_filtro_ativo_badge_container').removeClass('d-flex').addClass('d-none');
    $('#educacao_filtro_ativo_badge').text('Filtro Ativo');

    if (dataTableEducacao) {
        dataTableEducacao.column(0).search('').draw();
    }
    if (mapEducacao && mapEducacao.getLayer('educacao_muns_hover')) {
        mapEducacao.setFilter('educacao_muns_hover', ['==', 'municipio', '']);
    }
};

window.addEventListener('resize', () => {
    if (mapEducacao && typeof mapEducacao.resize === 'function') mapEducacao.resize();
    if (chartEducacaoComposicao && typeof chartEducacaoComposicao.resize === 'function') chartEducacaoComposicao.resize();
    if (chartEducacaoPorMun && typeof chartEducacaoPorMun.resize === 'function') chartEducacaoPorMun.resize();
    if (dataTableEducacao && typeof dataTableEducacao.columns.adjust === 'function') dataTableEducacao.columns.adjust();
});

/* ==========================================================================
   RESUMOS TEMÁTICOS - EFICIÊNCIA ENERGÉTICA E SUSTENTABILIDADE (ILUMINA PE)
   ========================================================================== */
let mapIluminacao = null;
let cacheIluminacaoData = null;
let chartIluminacaoStatus = null;
let chartIluminacaoPorMun = null;
let dataTableIluminacao = null;
window.visaoIluminacaoAtiva = 'todos';
window.municipioFixoIluminacao = null;

window.desafixarMunicipioIluminacao = function() {
    window.municipioFixoIluminacao = null;
    atualizarHoverBoxIluminacao(null, null, true);
};

function atualizarHoverBoxIluminacao(tipo, props, forcar = false) {
    if (window.municipioFixoIluminacao && !forcar) return;

    const boxDefault = document.getElementById('iluminacao_box_content_default');
    const boxActive = document.getElementById('iluminacao_box_content_active');
    if (!boxActive || !boxDefault) return;

    if (!tipo || !props) {
        boxActive.classList.add('d-none');
        boxActive.classList.remove('d-flex');
        boxDefault.classList.remove('d-none');
        return;
    }

    boxDefault.classList.add('d-none');
    boxActive.classList.remove('d-none');
    boxActive.classList.add('d-flex');

    const fmtMoeda = (v) => {
        const n = Number(v) || 0;
        if (n >= 1e6) return `R$ ${(n / 1e6).toFixed(2).replace('.', ',')} Mi`;
        return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    const isFixo = Boolean(window.municipioFixoIluminacao);

    if (tipo === 'municipio') {
        const nomeMun = props.municipio || props.name || props.NM_MUN || 'Município';
        const pExec = Number(props.ilumina_pontos_exec) || 0;
        const pPrev = Number(props.ilumina_pontos_prev) || 0;
        const tx = pPrev > 0 ? ((pExec / pPrev) * 100).toFixed(1) : (pExec > 0 ? '100.0' : '0.0');

        boxActive.innerHTML = `
            <div class="h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge ${isFixo ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'} font-bold px-2 py-1 text-xs rounded-pill">
                            <i class="fas ${isFixo ? 'fa-thumbtack text-amber-600' : 'fa-lightbulb text-emerald-600'} me-1"></i> ${isFixo ? 'MUNICÍPIO FIXADO' : (props.rd || 'Pernambuco')}
                        </span>
                        ${isFixo ? `
                            <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2 text-[10px] font-bold" onclick="window.desafixarMunicipioIluminacao()">
                                <i class="fas fa-xmark me-1"></i>Desafixar
                            </button>
                        ` : '<span class="text-xs text-slate-400 font-semibold">Clique para fixar</span>'}
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1">${nomeMun}</h4>
                    <div class="text-xs text-slate-500 mb-2">${props.contratos_count || 1} intervenção(ões) do Ilumina PE</div>
                    <hr class="my-2 border-slate-200">
                    <div class="space-y-2 mt-3 text-xs">
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Pontos Executados:</span>
                            <strong class="text-emerald-700 font-black">${pExec.toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Pontos Previstos:</span>
                            <strong class="text-slate-700 font-bold">${pPrev.toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Avanço Físico:</span>
                            <strong class="text-teal-700 font-black">${tx}%</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Investimento Total:</span>
                            <strong class="text-blue-700 font-black">${fmtMoeda(props.ilumina_valor_total)}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Recurso Pago:</span>
                            <strong class="text-emerald-700 font-black">${fmtMoeda(props.ilumina_valor_pago)}</strong>
                        </div>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-200/80 text-center">
                    <span class="text-[11px] text-slate-400 italic">Clique para filtrar a tabela por este município</span>
                </div>
            </div>
        `;
    } else if (tipo === 'ponto') {
        boxActive.innerHTML = `
            <div class="h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 text-xs rounded-pill">CANTEIRO ILUMINA PE</span>
                        <span class="text-xs text-slate-400 font-semibold">${props.municipio}</span>
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1">${props.produto || 'Modernização LED'}</h4>
                    <div class="text-xs text-slate-500 mb-2">Contrato: <b>${props.no_contrato || '-'}</b> ${props.grupo_ilumina ? `(${props.grupo_ilumina})` : ''}</div>
                    <hr class="my-2 border-slate-200">
                    <div class="space-y-2 mt-3 text-xs">
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Status:</span>
                            <strong class="text-slate-800 font-bold">${props.status}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Pontos Executados:</span>
                            <strong class="text-emerald-700 font-black">${(Number(props.indicador) || 0).toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Pontos Previstos:</span>
                            <strong class="text-slate-700 font-bold">${(Number(props.indicador_secundario) || 0).toLocaleString('pt-BR')}</strong>
                        </div>
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Investimento:</span>
                            <strong class="text-blue-700 font-black">${fmtMoeda(props.valor_total)}</strong>
                        </div>
                        ${props.empresa_contratada ? `
                        <div class="d-flex justify-content-between p-2 rounded-lg bg-white border border-slate-200">
                            <span class="text-slate-500 font-bold">Contratada:</span>
                            <span class="text-slate-700 text-truncate font-semibold" style="max-width: 140px;" title="${props.empresa_contratada}">${props.empresa_contratada}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-200/80 text-center">
                    <span class="text-[11px] text-slate-400 italic">Passe o cursor sobre outros pontos</span>
                </div>
            </div>
        `;
    }
}

window.renderizarResumoIluminacao = function() {
    const container = document.getElementById('resumo_iluminacao_map');
    if (!container) return;

    if (cacheIluminacaoData) {
        setTimeout(() => {
            if (mapIluminacao && typeof mapIluminacao.resize === 'function') mapIluminacao.resize();
            if (chartIluminacaoStatus && typeof chartIluminacaoStatus.resize === 'function') chartIluminacaoStatus.resize();
            if (chartIluminacaoPorMun && typeof chartIluminacaoPorMun.resize === 'function') chartIluminacaoPorMun.resize();
            if (dataTableIluminacao && typeof dataTableIluminacao.columns.adjust === 'function') dataTableIluminacao.columns.adjust();
        }, 120);
        return;
    }

    $('#resumo_iluminacao_spinner').removeClass('d-none');

    const apiUrl = `${window.basePath || ''}/municipios/resumo/cozinhas`.replace(/\/+/g, '/');
    const fallbackUrl = `${window.basePath || ''}/data/json/df_iluminacao.json`.replace(/\/+/g, '/');

    fetch(apiUrl)
        .then(res => res.json())
        .then(async data => {
            let iluminacao = data.iluminacao || [];
            let geoMun = data.geojson_municipios;

            if (!iluminacao.length) {
                try {
                    const r2 = await fetch(fallbackUrl);
                    if (r2.ok) iluminacao = await r2.json();
                } catch(e) {}
            }

            if (typeof geoMun === 'string') {
                try { geoMun = JSON.parse(geoMun); } catch(e) {}
            }

            $('#resumo_iluminacao_spinner').addClass('d-none');

            const norm = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

            let totPontosExec = 0, totPontosPrev = 0, totInvest = 0, totPago = 0;
            const munsMap = {};
            const munsIbgeMap = {};

            iluminacao.forEach(item => {
                const pExec = Number(item.indicador) || 0;
                const pPrev = Number(item.indicador_secundario) || 0;
                const vTot = parseFloat(String(item.valor_total || '0').replace(',', '.')) || 0;
                const vPag = parseFloat(String(item.valor_pago || '0').replace(',', '.')) || 0;

                totPontosExec += pExec;
                totPontosPrev += pPrev;
                totInvest += vTot;
                totPago += vPag;

                const kMun = norm(item.municipio);
                const rawIbge = item.ibge7 ? String(item.ibge7).trim() : '';
                const ibge6 = rawIbge.length >= 6 ? rawIbge.substring(0, 6) : '';

                if (!munsMap[kMun]) {
                    munsMap[kMun] = { municipio: item.municipio, rd: item.rd, pontos_exec: 0, pontos_prev: 0, valor_total: 0, valor_pago: 0, contratos: 0 };
                }
                munsMap[kMun].pontos_exec += pExec;
                munsMap[kMun].pontos_prev += pPrev;
                munsMap[kMun].valor_total += vTot;
                munsMap[kMun].valor_pago += vPag;
                munsMap[kMun].contratos++;

                if (rawIbge) munsIbgeMap[rawIbge] = munsMap[kMun];
                if (ibge6) munsIbgeMap[ibge6] = munsMap[kMun];
            });

            const taxaGlobal = totPontosPrev > 0 ? ((totPontosExec / totPontosPrev) * 100).toFixed(1) : '100.0';

            const fmtMoedaBiMi = (val) => {
                if (!val || val === 0) return "R$ 0";
                if (val >= 1e9) return `R$ ${(val / 1e9).toFixed(2).replace('.', ',')} Bi`;
                if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1).replace('.', ',')} Mi`;
                return `R$ ${val.toLocaleString('pt-BR')}`;
            };

            // Atualiza KPIs
            $('#ilumina_kpi_pontos_exec').text(totPontosExec.toLocaleString('pt-BR'));
            $('#ilumina_kpi_pontos_prev').text(totPontosPrev.toLocaleString('pt-BR'));
            $('#ilumina_kpi_taxa_exec').text(`${taxaGlobal}%`);
            $('#ilumina_kpi_investimento').text(fmtMoedaBiMi(totInvest));
            $('#ilumina_kpi_pago_sub').text(`Pago: ${fmtMoedaBiMi(totPago)}`);
            $('#ilumina_kpi_municipios').text(Object.keys(munsMap).length.toLocaleString('pt-BR'));

            $('#ilumina_box_stat_muns').text(Object.keys(munsMap).length.toLocaleString('pt-BR'));
            $('#ilumina_box_stat_exec').text(totPontosExec.toLocaleString('pt-BR'));
            $('#ilumina_box_stat_prev').text(totPontosPrev.toLocaleString('pt-BR'));
            $('#ilumina_box_stat_investimento').text(fmtMoedaBiMi(totInvest));

            // Centróides para dispersão se lat/long faltarem
            const munCentroids = {};
            if (geoMun && geoMun.features) {
                geoMun.features.forEach(f => {
                    const nomeMun = norm(f.properties.name || f.properties.NM_MUN || f.properties.municipio);
                    try {
                        let flatCoords = [];
                        const collect = (c) => {
                            if (typeof c[0] === 'number') flatCoords.push(c);
                            else c.forEach(collect);
                        };
                        collect(f.geometry.coordinates);
                        if (flatCoords.length > 0) {
                            const sum = flatCoords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
                            munCentroids[nomeMun] = [sum[0] / flatCoords.length, sum[1] / flatCoords.length];
                        }
                    } catch(e) {}
                });

                // Enriquecimento dos municípios
                geoMun.features.forEach(f => {
                    const props = f.properties || {};
                    const kMun = norm(props.municipio || props.name || props.NM_MUN);
                    const rawCod = String(props.ibge7 || props.cod_ibge || props.codarea || props.ibge6 || '').trim();
                    const kIbge6 = rawCod.length >= 6 ? rawCod.substring(0, 6) : '';

                    const info = munsIbgeMap[rawCod] || munsIbgeMap[kIbge6] || munsMap[kMun] || { pontos_exec: 0, pontos_prev: 0, valor_total: 0, valor_pago: 0, contratos: 0 };
                    props.ilumina_pontos_exec = info.pontos_exec;
                    props.ilumina_pontos_prev = info.pontos_prev;
                    props.ilumina_valor_total = info.valor_total;
                    props.ilumina_valor_pago = info.valor_pago;
                    props.contratos_count = info.contratos;
                    props.municipio = info.municipio || props.municipio || props.name;
                    props.rd = info.rd || props.regiao_de_desenvolvimento || '';
                });
            }

            // Features pontuais georreferenciadas
            const featuresIlumina = [];
            iluminacao.forEach((item, idx) => {
                const m = norm(item.municipio);
                let lat = parseFloat(item.latitude);
                let lng = parseFloat(item.longitude);

                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    if (m && munCentroids[m]) {
                        const jitterX = ((idx % 7) - 3) * 0.008;
                        const jitterY = (((idx * 3) % 7) - 3) * 0.008;
                        lng = munCentroids[m][0] + jitterX;
                        lat = munCentroids[m][1] + jitterY;
                    }
                }

                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    featuresIlumina.push({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [lng, lat] },
                        properties: {
                            no_contrato: item.no_contrato || '',
                            produto: item.produto || 'Modernização LED',
                            status: item.status || 'CONCLUÍDA',
                            indicador: Number(item.indicador) || 0,
                            indicador_secundario: Number(item.indicador_secundario) || 0,
                            valor_total: parseFloat(String(item.valor_total || '0').replace(',', '.')) || 0,
                            valor_pago: parseFloat(String(item.valor_pago || '0').replace(',', '.')) || 0,
                            empresa_contratada: item.empresa_contratada || '',
                            municipio: item.municipio || '',
                            grupo_ilumina: item.grupo_ilumina || ''
                        }
                    });
                }
            });

            cacheIluminacaoData = {
                iluminacao: iluminacao,
                geoMun: geoMun,
                geoPontos: { type: 'FeatureCollection', features: featuresIlumina }
            };

            // Inicialização do Mapa
            if (mapIluminacao) {
                try { mapIluminacao.remove(); } catch(e) {}
            }

            mapIluminacao = new maplibregl.Map({
                container: 'resumo_iluminacao_map',
                style: window.obterEstiloBaseMapa(),
                center: [-37.8, -8.3],
                zoom: 7,
                preserveDrawingBuffer: true
            });

            mapIluminacao.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

            mapIluminacao.on('load', () => {
                mapIluminacao.resize();

                try {
                    const bounds = new maplibregl.LngLatBounds();
                    featuresIlumina.forEach(f => bounds.extend(f.geometry.coordinates));
                    if (!bounds.isEmpty()) {
                        mapIluminacao.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 800 });
                    }
                } catch(e) {}

                if (geoMun && geoMun.features) {
                    mapIluminacao.addSource('ilumina_mun_source', { type: 'geojson', data: geoMun });

                    mapIluminacao.addLayer({
                        id: 'ilumina_muns_fill',
                        type: 'fill',
                        source: 'ilumina_mun_source',
                        paint: {
                            'fill-color': '#f8fafc',
                            'fill-opacity': window.visaoIluminacaoAtiva === 'todos' ? 0.08 : 0.75
                        }
                    });

                    mapIluminacao.addLayer({
                        id: 'ilumina_muns_line',
                        type: 'line',
                        source: 'ilumina_mun_source',
                        paint: { 'line-color': '#94a3b8', 'line-width': 0.8, 'line-opacity': 0.5 }
                    });

                    mapIluminacao.addLayer({
                        id: 'ilumina_muns_hover',
                        type: 'line',
                        source: 'ilumina_mun_source',
                        paint: { 'line-color': '#059669', 'line-width': 2.4 },
                        filter: ['==', 'municipio', '']
                    });
                }

                mapIluminacao.addSource('ilumina_points_source', {
                    type: 'geojson',
                    data: cacheIluminacaoData.geoPontos,
                    cluster: true,
                    clusterMaxZoom: 10,
                    clusterRadius: 35
                });

                mapIluminacao.addLayer({
                    id: 'ilumina_clusters',
                    type: 'circle',
                    source: 'ilumina_points_source',
                    filter: ['has', 'point_count'],
                    layout: { 'visibility': window.visaoIluminacaoAtiva === 'todos' ? 'visible' : 'none' },
                    paint: {
                        'circle-color': '#10b981',
                        'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 15, 26],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': 0.85
                    }
                });

                mapIluminacao.addLayer({
                    id: 'ilumina_cluster_count',
                    type: 'symbol',
                    source: 'ilumina_points_source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'visibility': window.visaoIluminacaoAtiva === 'todos' ? 'visible' : 'none',
                        'text-field': '{point_count_abbreviated}',
                        'text-size': 12
                    },
                    paint: { 'text-color': '#ffffff' }
                });

                mapIluminacao.addLayer({
                    id: 'ilumina_points',
                    type: 'circle',
                    source: 'ilumina_points_source',
                    filter: ['!', ['has', 'point_count']],
                    layout: { 'visibility': window.visaoIluminacaoAtiva === 'todos' ? 'visible' : 'none' },
                    paint: {
                        'circle-color': [
                            'case',
                            ['in', 'conclu', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'entreg', ['downcase', ['get', 'status']]], '#10b981',
                            ['in', 'execu', ['downcase', ['get', 'status']]], '#f59e0b',
                            ['in', 'andamento', ['downcase', ['get', 'status']]], '#f59e0b',
                            '#3b82f6'
                        ],
                        'circle-radius': 7,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                mapIluminacao.on('click', 'ilumina_clusters', (e) => {
                    const clFeatures = mapIluminacao.queryRenderedFeatures(e.point, { layers: ['ilumina_clusters'] });
                    if (!clFeatures.length) return;
                    const clusterId = clFeatures[0].properties.cluster_id;
                    mapIluminacao.getSource('ilumina_points_source').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        mapIluminacao.easeTo({ center: clFeatures[0].geometry.coordinates, zoom: zoom });
                    });
                });

                mapIluminacao.on('mousemove', 'ilumina_muns_fill', (e) => {
                    if (!e.features.length) return;
                    mapIluminacao.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    mapIluminacao.setFilter('ilumina_muns_hover', ['==', 'municipio', props.municipio || '']);
                    atualizarHoverBoxIluminacao('municipio', props, false);
                });

                mapIluminacao.on('mousemove', 'ilumina_points', (e) => {
                    if (!e.features.length) return;
                    mapIluminacao.getCanvas().style.cursor = 'pointer';
                    const props = e.features[0].properties;
                    atualizarHoverBoxIluminacao('ponto', props, false);
                });

                mapIluminacao.on('mouseleave', 'ilumina_muns_fill', () => {
                    mapIluminacao.getCanvas().style.cursor = '';
                    mapIluminacao.setFilter('ilumina_muns_hover', ['==', 'municipio', '']);
                    if (!window.municipioFixoIluminacao) atualizarHoverBoxIluminacao(null, null, false);
                });

                mapIluminacao.on('mouseleave', 'ilumina_points', () => {
                    if (!window.municipioFixoIluminacao) atualizarHoverBoxIluminacao(null, null, false);
                });

                mapIluminacao.on('click', 'ilumina_muns_fill', (e) => {
                    if (!e.features.length) return;
                    const props = e.features[0].properties;
                    const nomeMun = props.municipio;
                    if (window.municipioFixoIluminacao === nomeMun) {
                        window.desafixarMunicipioIluminacao();
                    } else {
                        window.municipioFixoIluminacao = nomeMun;
                        atualizarHoverBoxIluminacao('municipio', props, true);
                    }
                    if (nomeMun) window.filtrarTabelaPorMunicipioIluminacao(nomeMun);
                });

                window.alternarVisaoIluminacao(window.visaoIluminacaoAtiva || 'todos', document.getElementById('btn_visao_ilumina_todos'));
            });

            // Gráficos e Tabela
            renderizarGraficosIluminacao(iluminacao);
            renderizarTabelaIluminacao(iluminacao);
        })
        .catch(err => {
            console.error('[Resumo Iluminação] Erro:', err);
            $('#resumo_iluminacao_spinner').addClass('d-none');
        });
};

window.alternarVisaoIluminacao = function (visao, btn) {
    window.visaoIluminacaoAtiva = visao;

    $('#btn_visao_ilumina_todos, #btn_visao_ilumina_pontos_exec, #btn_visao_ilumina_investimento')
        .removeClass('btn-primary shadow-sm')
        .addClass('btn-light text-slate-600');
    if (btn) $(btn).removeClass('btn-light text-slate-600').addClass('btn-primary shadow-sm');

    $('#legenda_ilumina_cluster, #legenda_ilumina_pontos_exec, #legenda_ilumina_investimento').addClass('d-none');

    if (!mapIluminacao || !mapIluminacao.getLayer('ilumina_muns_fill')) return;

    if (visao === 'todos') {
        $('#legenda_ilumina_cluster').removeClass('d-none');
        mapIluminacao.setLayoutProperty('ilumina_clusters', 'visibility', 'visible');
        mapIluminacao.setLayoutProperty('ilumina_cluster_count', 'visibility', 'visible');
        mapIluminacao.setLayoutProperty('ilumina_points', 'visibility', 'visible');
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-color', '#f8fafc');
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-opacity', 0.15);
        $('#iluminacao_camada_label').text("Exibindo: Localização e Clusters de Contratos de Iluminação");
    } else if (visao === 'pontos_exec') {
        $('#legenda_ilumina_pontos_exec').removeClass('d-none');
        mapIluminacao.setLayoutProperty('ilumina_clusters', 'visibility', 'none');
        mapIluminacao.setLayoutProperty('ilumina_cluster_count', 'visibility', 'none');
        mapIluminacao.setLayoutProperty('ilumina_points', 'visibility', 'none');
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-opacity', 0.82);
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-color', [
            'step',
            ['get', 'ilumina_pontos_exec'],
            '#f0fdf4',
            1, '#86efac',
            300, '#22c55e',
            800, '#15803d'
        ]);
        $('#iluminacao_camada_label').text("Exibindo: Municípios por Quantidade de Pontos LED Instalados");
    } else if (visao === 'investimento') {
        $('#legenda_ilumina_investimento').removeClass('d-none');
        mapIluminacao.setLayoutProperty('ilumina_clusters', 'visibility', 'none');
        mapIluminacao.setLayoutProperty('ilumina_cluster_count', 'visibility', 'none');
        mapIluminacao.setLayoutProperty('ilumina_points', 'visibility', 'none');
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-opacity', 0.82);
        mapIluminacao.setPaintProperty('ilumina_muns_fill', 'fill-color', [
            'step',
            ['get', 'ilumina_valor_total'],
            '#eff6ff',
            1, '#93c5fd',
            300000, '#3b82f6',
            700000, '#1d4ed8'
        ]);
        $('#iluminacao_camada_label').text("Exibindo: Volume Financeiro Contratado no Ilumina PE (R$)");
    }
};

function renderizarGraficosIluminacao(iluminacao) {
    if (typeof echarts === 'undefined') return;

    // 1. Donut de Status das Etapas
    const elStatus = document.getElementById('chart_iluminacao_status');
    if (elStatus) {
        if (chartIluminacaoStatus) chartIluminacaoStatus.dispose();
        chartIluminacaoStatus = echarts.init(elStatus);

        const statusMap = { 'Concluída': 0, 'Em Execução': 0, 'Em Planejamento': 0 };
        iluminacao.forEach(item => {
            const s = String(item.status || '').toLowerCase();
            if (s.includes('conclu') || s.includes('finaliz') || s.includes('entreg')) statusMap['Concluída']++;
            else if (s.includes('execu') || s.includes('andamento')) statusMap['Em Execução']++;
            else statusMap['Em Planejamento']++;
        });

        const statusData = [
            { value: statusMap['Concluída'], name: 'Concluída', itemStyle: { color: '#10b981' } },
            { value: statusMap['Em Execução'], name: 'Em Execução', itemStyle: { color: '#f59e0b' } },
            { value: statusMap['Em Planejamento'], name: 'Em Planejamento', itemStyle: { color: '#3b82f6' } }
        ].filter(item => item.value > 0);

        const total = statusData.reduce((acc, curr) => acc + curr.value, 0);

        chartIluminacaoStatus.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (p) => `<strong>${p.name}</strong><br/>Etapas: <b>${p.value}</b> (${total > 0 ? ((p.value/total)*100).toFixed(1) : 0}%)`
            },
            legend: { orient: 'horizontal', bottom: '0%', left: 'center', textStyle: { fontSize: 11, color: '#475569', fontWeight: 600 } },
            series: [{
                name: 'Status das Etapas',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
                data: statusData
            }]
        });
    }

    // 2. Top 20 Municípios por Pontos LED Executados
    const elMun = document.getElementById('chart_iluminacao_por_mun');
    if (elMun) {
        if (chartIluminacaoPorMun) chartIluminacaoPorMun.dispose();
        chartIluminacaoPorMun = echarts.init(elMun);

        const munTotals = {};
        iluminacao.forEach(item => {
            const m = String(item.municipio || '').trim();
            if (!m || m === '-' || m === 'NA') return;
            if (!munTotals[m]) munTotals[m] = { nome: m, exec: 0, prev: 0, inv: 0 };
            munTotals[m].exec += Number(item.indicador) || 0;
            munTotals[m].prev += Number(item.indicador_secundario) || 0;
            munTotals[m].inv += (parseFloat(String(item.valor_total || '0').replace(',', '.')) || 0);
        });

        const top20 = Object.values(munTotals).sort((a, b) => b.exec - a.exec).slice(0, 20).reverse();

        chartIluminacaoPorMun.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const item = top20.find(t => t.nome === params[0].name);
                    const invFmt = item ? (item.inv >= 1e6 ? `R$ ${(item.inv / 1e6).toFixed(1)} Mi` : `R$ ${item.inv.toLocaleString('pt-BR')}`) : '-';
                    return `<strong>${params[0].name}</strong><br/>Pontos Executados: <b>${params[0].value.toLocaleString('pt-BR')}</b><br/>Meta Prevista: <b>${(item ? item.prev : 0).toLocaleString('pt-BR')}</b><br/>Investimento Total: <b>${invFmt}</b>`;
                }
            },
            grid: { top: '5%', left: '3%', right: '6%', bottom: '8%', containLabel: true },
            xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: top20.map(t => t.nome), axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 } },
            series: [{
                name: 'Pontos LED Executados',
                type: 'bar',
                data: top20.map(t => t.exec),
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#6ee7b7' },
                        { offset: 1, color: '#059669' }
                    ])
                },
                label: { show: true, position: 'right', fontWeight: 'bold', fontSize: 10, color: '#065f46' }
            }]
        });
    }
}

function renderizarTabelaIluminacao(iluminacao) {
    const elTable = document.getElementById('resumo_iluminacao_tabela');
    if (!elTable || typeof $.fn.DataTable === 'undefined') return;

    if ($.fn.DataTable.isDataTable('#resumo_iluminacao_tabela')) {
        $('#resumo_iluminacao_tabela').DataTable().destroy();
        $('#resumo_iluminacao_tabela').empty();
    }

    dataTableIluminacao = $('#resumo_iluminacao_tabela').DataTable({
        data: iluminacao,
        deferRender: true,
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json" },
        order: [[7, 'desc']], // Ordenar por investimento
        columns: [
            {
                title: "Município",
                data: "municipio",
                className: "align-middle",
                width: "140px",
                render: d => `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 fw-bold px-2 py-1 rounded-pill cursor-pointer" onclick="window.filtrarTabelaPorMunicipioIluminacao('${d || ''}')">${d || 'Estadual'}</span>`
            },
            {
                title: "Etapa / Intervenção",
                data: "produto",
                className: "align-middle",
                width: "260px",
                render: (d, t, r) => {
                    const titulo = d || r.iniciativa_estrategica || 'Modernização Ilumina PE';
                    const sub = r.empresa_contratada ? `<div class="text-xs text-slate-400 mt-0.5">${r.empresa_contratada}</div>` : '';
                    return `<div class="fw-bold text-slate-800 text-sm leading-tight">${titulo}</div>${sub}`;
                }
            },
            {
                title: "Contrato",
                data: "no_contrato",
                className: "align-middle text-center",
                width: "100px",
                render: (d, t, r) => `<span class="badge bg-slate-100 text-slate-700 font-mono border">${d || '-'}</span>`
            },
            {
                title: "Pontos Exec.",
                data: "indicador",
                className: "align-middle text-center fw-bold",
                width: "100px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return `<span class="badge bg-emerald-50 text-emerald-800 border border-emerald-300 font-black px-2.5 py-1 text-xs rounded-pill">${num.toLocaleString('pt-BR')}</span>`;
                }
            },
            {
                title: "Pontos Prev.",
                data: "indicador_secundario",
                className: "align-middle text-center fw-bold",
                width: "100px",
                render: (d, t) => {
                    const num = Number(d) || 0;
                    if (t !== 'display') return num;
                    return `<span class="badge bg-slate-100 text-slate-700 border font-bold px-2.5 py-1 text-xs rounded-pill">${num.toLocaleString('pt-BR')}</span>`;
                }
            },
            {
                title: "Status",
                data: "status",
                className: "align-middle",
                width: "130px",
                render: d => {
                    const s = String(d || '').trim();
                    let badgeClass = 'bg-slate-100 text-slate-700 border';
                    if (s.toLowerCase().includes('conclu') || s.toLowerCase().includes('entreg')) badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    else if (s.toLowerCase().includes('execu') || s.toLowerCase().includes('andamento')) badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                    else if (s.toLowerCase().includes('planej')) badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    return `<span class="badge ${badgeClass} rounded-pill px-2.5 py-1 text-xs font-bold">${s || '-'}</span>`;
                }
            },
            {
                title: "Avanço Físico",
                data: null,
                className: "align-middle",
                width: "120px",
                render: (d, t, r) => {
                    const pExec = Number(r.indicador) || 0;
                    const pPrev = Number(r.indicador_secundario) || 0;
                    const num = pPrev > 0 ? Math.min(Math.round((pExec / pPrev) * 100), 100) : (pExec > 0 ? 100 : 0);
                    if (t !== 'display') return num;
                    const barColor = num >= 100 ? 'bg-emerald-500' : (num >= 50 ? 'bg-teal-500' : 'bg-amber-500');
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar ${barColor}" style="width: ${num}%;"></div>
                            </div>
                            <span class="text-xs fw-bold text-slate-700">${num}%</span>
                        </div>
                    `;
                }
            },
            {
                title: "Investimento (R$)",
                data: "valor_total",
                className: "align-middle text-end fw-bold text-slate-800",
                width: "140px",
                render: (d, t) => {
                    const num = parseFloat(String(d || '0').replace(',', '.')) || 0;
                    if (t !== 'display') return num;
                    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        ]
    });
}
window.filtrarTabelaPorMunicipioIluminacao = function (nomeMun) {
    if (!nomeMun) return;
    $('#iluminacao_filtro_ativo_badge').text(`Município: ${nomeMun}`);
    $('#iluminacao_filtro_ativo_badge_container').removeClass('d-none').addClass('d-flex');

    if (dataTableIluminacao) {
        dataTableIluminacao.column(0).search(`^${nomeMun}$`, true, false).draw();
    }
    const el = document.getElementById('iluminacao_filtro_ativo_badge_container');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.limparFiltroIluminacao = function () {
    $('#iluminacao_filtro_ativo_badge_container').removeClass('d-flex').addClass('d-none');
    $('#iluminacao_filtro_ativo_badge').text('Filtro Ativo');

    if (dataTableIluminacao) {
        dataTableIluminacao.column(0).search('').draw();
    }
    if (mapIluminacao && mapIluminacao.getLayer('ilumina_muns_hover')) {
        mapIluminacao.setFilter('ilumina_muns_hover', ['==', 'municipio', '']);
    }
};

window.addEventListener('resize', () => {
    if (mapIluminacao && typeof mapIluminacao.resize === 'function') mapIluminacao.resize();
    if (chartIluminacaoStatus && typeof chartIluminacaoStatus.resize === 'function') chartIluminacaoStatus.resize();
    if (chartIluminacaoPorMun && typeof chartIluminacaoPorMun.resize === 'function') chartIluminacaoPorMun.resize();
    if (dataTableIluminacao && typeof dataTableIluminacao.columns.adjust === 'function') dataTableIluminacao.columns.adjust();
});

window.addEventListener('resize', () => {
    // ...
    if (dataTableHabitacao && typeof dataTableHabitacao.columns.adjust === 'function') dataTableHabitacao.columns.adjust();
    if (dataTableRegularizacao && typeof dataTableRegularizacao.columns.adjust === 'function') dataTableRegularizacao.columns.adjust();
    if (window.chartsComparacao) {
        Object.values(window.chartsComparacao).forEach(c => {
            if (c && typeof c.resize === 'function') c.resize();
        });
    }
});



