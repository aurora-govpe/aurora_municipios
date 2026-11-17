// www/js/landing.js
// Lógica de interação da Landing Page do Aurora Desenvolvimento Regional

window.rdsPernambuco = [
    "Agreste Central",
    "Agreste Setentrional",
    "Mata Centro",
    "Mata Norte",
    "Mata Sul",
    "Metropolitana",
    "Sertão Central",
    "Sertão do Araripe",
    "Sertão de Itaparica",
    "Sertão do Moxotó",
    "Sertão do Pajeú",
    "Sertão do São Francisco"
];

window.municipiosPernambuco = ["Abreu e Lima", "Afogados da Ingazeira", "Afrânio", "Agrestina", "Água Preta", "Águas Belas", "Alagoinha", "Aliança", "Altinho", "Amaraji", "Angelim", "Araçoiaba", "Araripina", "Arcoverde", "Barra de Guabiraba", "Barreiros", "Belém de Maria", "Belém do São Francisco", "Belo Jardim", "Betânia", "Bezerros", "Bodocó", "Bom Conselho", "Bom Jardim", "Bonito", "Brejão", "Brejinho", "Brejo da Madre de Deus", "Buenos Aires", "Buíque", "Cabo de Santo Agostinho", "Cabrobó", "Cachoeirinha", "Caetés", "Calçado", "Calumbi", "Camaragibe", "Camocim de São Félix", "Camutanga", "Canhotinho", "Capoeiras", "Carnaíba", "Carnaubeira da Penha", "Carpina", "Caruaru", "Casinhas", "Catende", "Cedro", "Chã de Alegria", "Chã Grande", "Condado", "Correntes", "Cortês", "Cumaru", "Cupira", "Custódia", "Dormentes", "Escada", "Exu", "Feira Nova", "Fernando de Noronha", "Ferreiros", "Flores", "Floresta", "Frei Miguelinho", "Gameleira", "Garanhuns", "Glória do Goitá", "Goiana", "Granito", "Gravatá", "Iati", "Ibimirim", "Ibirajuba", "Igarassu", "Iguaracy", "Inajá", "Ingazeira", "Ipojuca", "Ipubi", "Itacuruba", "Itaíba", "Ilha de Itamaracá", "Itambé", "Itapetim", "Itapissuma", "Itaquitinga", "Jaboatão dos Guararapes", "Jaqueira", "Jataúba", "Jatobá", "João Alfredo", "Joaquim Nabuco", "Jucati", "Jupi", "Jurema", "Lagoa do Carro", "Lagoa de Itaenga", "Lagoa do Ouro", "Lagoa dos Gatos", "Lagoa Grande", "Lajedo", "Limoeiro", "Macaparana", "Machados", "Manari", "Maraial", "Mirandiba", "Moreno", "Nazaré da Mata", "Olinda", "Orobó", "Orocó", "Ouricuri", "Palmares", "Palmeirina", "Panelas", "Paranatama", "Parnamirim", "Passira", "Paudalho", "Paulista", "Pedra", "Pesqueira", "Petrolândia", "Petrolina", "Poção", "Pombos", "Primavera", "Quipapá", "Quixaba", "Recife", "Riacho das Almas", "Ribeirão", "Rio Formoso", "Sairé", "Salgadinho", "Salgueiro", "Saloá", "Sanharó", "Santa Cruz", "Santa Cruz da Baixa Verde", "Santa Cruz do Capibaribe", "Santa Filomena", "Santa Maria da Boa Vista", "Santa Maria do Cambucá", "Santa Terezinha", "São Benedito do Sul", "São Bento do Una", "São Caetano", "São João", "São Joaquim do Monte", "São José da Coroa Grande", "São José do Belmonte", "São José do Egito", "São Lourenço da Mata", "São Vicente Férrer", "Serra Talhada", "Serrita", "Sertânia", "Sirinhaém", "Moreilândia", "Solidão", "Surubim", "Tabira", "Tacaimbó", "Tacaratu", "Tamandaré", "Taquaritinga do Norte", "Terezinha", "Terra Nova", "Timbaúba", "Toritama", "Tracunhaém", "Trindade", "Triunfo", "Tupanatinga", "Tuparetama", "Venturosa", "Verdejante", "Vertente do Lério", "Vertentes", "Vicência", "Vitória de Santo Antão", "Xexéu"];

function normalizarTexto(txt) {
    if (!txt) return "";
    return String(txt).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Navegação direta para um Município
window.irParaMunicipio = function(nomeMun) {
    if (!nomeMun) return;
    
    // Normaliza e busca correspondência na lista oficial
    const normBuscada = normalizarTexto(nomeMun);
    let munOficial = null;

    for (let i = 0; i < window.municipiosPernambuco.length; i++) {
        const m = window.municipiosPernambuco[i];
        const mNorm = normalizarTexto(m);
        if (mNorm === normBuscada) {
            munOficial = m;
            break;
        }
    }
    if (!munOficial) {
        for (let i = 0; i < window.municipiosPernambuco.length; i++) {
            const m = window.municipiosPernambuco[i];
            const mNorm = normalizarTexto(m);
            if (mNorm.includes(normBuscada) || normBuscada.includes(mNorm)) {
                munOficial = m;
                break;
            }
        }
    }
    if (!munOficial) munOficial = nomeMun;

    console.log("[Landing] Redirecionando para município:", munOficial);

    // Registra alvo pendente para inicialização caso o módulo de ficha ainda não esteja carregado
    window.municipioAlvoBusca = munOficial;

    // 1. Muda para a aba Municípios
    window.mudarAbaAurora('Municípios', null);

    // 2. Tenta selecionar se o módulo já estiver com o dropdown preenchido
    let tentativas = 0;
    const aplicarSelecao = function() {
        tentativas++;
        const $select = $('#ficha_f_municipio');
        if (!$select.length || $select.find('option').length <= 1) {
            if (tentativas < 40) {
                setTimeout(aplicarSelecao, 100);
            }
            return;
        }

        let valorEncontrado = null;
        const normAlvo = normalizarTexto(munOficial);
        $select.find('option').each(function() {
            const v = $(this).val();
            if (normalizarTexto(v) === normAlvo) {
                valorEncontrado = v;
                return false;
            }
        });

        if (valorEncontrado) {
            $select.val(valorEncontrado);
            if (typeof $select.selectpicker === 'function') {
                try {
                    $select.selectpicker('val', valorEncontrado);
                    $select.selectpicker('refresh');
                } catch(e) {}
            }
            if (typeof window.sincronizarBotaoFiltroMunicipio === 'function') {
                window.sincronizarBotaoFiltroMunicipio(valorEncontrado);
            }
            if (typeof window.carregarDadosFicha === 'function') {
                window.carregarDadosFicha(valorEncontrado);
            }
        }
    };

    setTimeout(aplicarSelecao, 150);
};

// Navegação direta para uma Região de Desenvolvimento (RD)
window.irParaRD = function(nomeRD) {
    if (!nomeRD) return;

    const normBuscada = normalizarTexto(nomeRD);
    let rdOficial = null;

    for (let i = 0; i < window.rdsPernambuco.length; i++) {
        const rd = window.rdsPernambuco[i];
        const rdNorm = normalizarTexto(rd);
        if (rdNorm === normBuscada || rdNorm.includes(normBuscada) || normBuscada.includes(rdNorm)) {
            rdOficial = rd;
            break;
        }
    }
    if (!rdOficial) rdOficial = nomeRD;

    console.log("[Landing] Redirecionando para RD:", rdOficial);
    window.rdAlvoBusca = rdOficial;

    window.mudarAbaAurora('Regiões', null);

    let tentativas = 0;
    const aplicarSelecaoRD = function() {
        tentativas++;
        const $select = $('#regioes_f_rd');
        if (!$select.length || $select.find('option').length <= 1) {
            if (tentativas < 40) {
                setTimeout(aplicarSelecaoRD, 100);
            }
            return;
        }

        const normAlvo = normalizarTexto(rdOficial);
        let valorEncontrado = null;

        $select.find('option').each(function() {
            const v = $(this).val();
            if (normalizarTexto(v) === normAlvo || normalizarTexto(v).includes(normAlvo) || normAlvo.includes(normalizarTexto(v))) {
                valorEncontrado = v;
                return false;
            }
        });

        if (valorEncontrado) {
            $select.val(valorEncontrado).trigger('change');
        }
    };

    setTimeout(aplicarSelecaoRD, 150);
};

// Execução da busca a partir do input da Landing Page
window.executarBuscaLanding = function() {
    const input = document.getElementById("landing_search_input");
    if (!input) return;
    const termo = input.value.trim();
    if (!termo) {
        input.focus();
        return;
    }

    const termoNorm = normalizarTexto(termo);

    // 1. Testa se é uma Região de Desenvolvimento
    for (let i = 0; i < window.rdsPernambuco.length; i++) {
        const rd = window.rdsPernambuco[i];
        const rdNorm = normalizarTexto(rd);
        if (rdNorm === termoNorm || rdNorm.includes(termoNorm) || termoNorm.includes(rdNorm)) {
            window.irParaRD(rd);
            return;
        }
    }

    // 2. Testa na lista de 185 municípios de Pernambuco
    for (let i = 0; i < window.municipiosPernambuco.length; i++) {
        const mun = window.municipiosPernambuco[i];
        const munNorm = normalizarTexto(mun);
        if (munNorm === termoNorm || munNorm.startsWith(termoNorm) || munNorm.includes(termoNorm)) {
            window.irParaMunicipio(mun);
            return;
        }
    }

    // 3. Fallback: tenta buscar como município
    window.irParaMunicipio(termo);
};

// ==========================================================================
// CARREGAMENTO DINÂMICO DE MACROINDICADORES (df_indicadores_ufs)
// ==========================================================================
window.carregarDadosLanding = async function() {
    const basePath = window.basePath || '';

    // 1. Obtém os dados de indicadores da UF 'PE'
    let listaIndicadores = null;
    if (window.dadosSocioAmbientaisUFs && Array.isArray(window.dadosSocioAmbientaisUFs['PE']) && window.dadosSocioAmbientaisUFs['PE'].length > 0) {
        listaIndicadores = window.dadosSocioAmbientaisUFs['PE'];
    } else {
        try {
            const res = await window.fetchSeguro(`${basePath}/api/ufs/data?uf=PE`);
            if (res && res.ok) {
                const json = await res.json();
                if (json && json.indicadores) {
                    listaIndicadores = json.indicadores;
                    if (!window.dadosSocioAmbientaisUFs) window.dadosSocioAmbientaisUFs = {};
                    window.dadosSocioAmbientaisUFs['PE'] = json.indicadores;
                    if (json.benchmarks_regiao && (!window.benchmarksRegiaoUFs || window.benchmarksRegiaoUFs.length === 0)) {
                        window.benchmarksRegiaoUFs = json.benchmarks_regiao;
                    }
                }
            }
        } catch (e) {
            console.warn("[Landing] Aviso ao buscar dados de df_indicadores_ufs para a Landing Page:", e);
        }
    }

    if (!listaIndicadores || !Array.isArray(listaIndicadores) || listaIndicadores.length === 0) {
        return; // Mantém os fallbacks estáticos já presentes no HTML caso a API não responda
    }

    // Helper para buscar o registro mais recente de um indicador
    const buscarMaisRecente = function(siglas) {
        const siglasArr = Array.isArray(siglas) ? siglas : [siglas];
        const rows = listaIndicadores.filter(d => 
            siglasArr.includes(d.sigla_indicador) && 
            d.valor !== null && 
            d.valor !== undefined && 
            !isNaN(Number(d.valor))
        );
        if (rows.length === 0) return null;
        rows.sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0));
        return rows[0];
    };

    // Helper para formatar números no padrão brasileiro
    const fmtNum = (val, maxDec = 0) => {
        const n = Number(val);
        if (isNaN(n)) return String(val);
        return n.toLocaleString('pt-BR', { maximumFractionDigits: maxDec, minimumFractionDigits: maxDec });
    };

    // 1. População Total
    const itemPop = buscarMaisRecente(['populacao_total', 'populacao']);
    if (itemPop) {
        const elVal = document.getElementById('landing_populacao_val');
        const elSub = document.getElementById('landing_populacao_sub');
        const elRankBr = document.getElementById('landing_populacao_rank_br');
        const elRankNe = document.getElementById('landing_populacao_rank_ne');

        if (elVal) elVal.textContent = fmtNum(itemPop.valor, 0);
        if (elSub && itemPop.ano) elSub.textContent = `Habitantes Estimados (${itemPop.ano})`;
        if (elRankBr && itemPop.rank_br) elRankBr.textContent = `${itemPop.rank_br}º no Brasil`;
        if (elRankNe && itemPop.rank_ne) elRankNe.textContent = `${itemPop.rank_ne}º no Nordeste`;
    }

    // 2. PIB Estadual
    const itemPibTot = buscarMaisRecente(['pib_total_reais', 'pib_total', 'pib']);
    if (itemPibTot) {
        const elVal = document.getElementById('landing_pib_total_val');
        const elSub = document.getElementById('landing_pib_total_sub');
        const elRankNe = document.getElementById('landing_pib_total_rank_ne');
        const elDesc = document.getElementById('landing_pib_total_desc');

        const valBi = Number(itemPibTot.valor) / 1e9;
        if (elVal) elVal.textContent = `R$ ${valBi.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Bi`;
        if (elSub && itemPibTot.ano) elSub.textContent = `Soma das Economias Municipais (${itemPibTot.ano})`;
        if (elRankNe && itemPibTot.rank_ne) {
            elRankNe.textContent = `${itemPibTot.rank_ne}º Maior do NE`;
        } else if (elRankNe && itemPibTot.rank_br) {
            elRankNe.textContent = `${itemPibTot.rank_br}º no Brasil`;
        }
    }

    // 3. PIB per Capita
    const itemPibCap = buscarMaisRecente(['pib_per_capita', 'pib_percapita']);
    if (itemPibCap) {
        const elVal = document.getElementById('landing_pib_per_capita_val');
        const elSub = document.getElementById('landing_pib_per_capita_sub');
        const elBadge = document.getElementById('landing_pib_per_capita_badge');
        const elDesc = document.getElementById('landing_pib_per_capita_desc');

        if (elVal) elVal.textContent = `R$ ${fmtNum(Math.round(itemPibCap.valor), 0)}`;
        if (elSub && itemPibCap.ano) elSub.textContent = `Renda Econômica Média Anual (${itemPibCap.ano})`;
        if (elBadge && itemPibCap.rank_ne) {
            elBadge.textContent = `${itemPibCap.rank_ne}º no Nordeste`;
        }
    }

    // 4. Área Territorial
    const itemArea = buscarMaisRecente(['area_total_ha', 'area_km2', 'area_territorial']);
    if (itemArea) {
        const elVal = document.getElementById('landing_area_territorial_val');
        const elSub = document.getElementById('landing_area_territorial_sub');

        let valKm2 = Number(itemArea.valor);
        if (itemArea.sigla_indicador === 'area_total_ha') {
            valKm2 = valKm2 / 100;
        }
        if (elVal) elVal.textContent = `${fmtNum(Math.round(valKm2), 0)} km²`;
        if (elSub && itemArea.ano) elSub.textContent = `Extensão Territorial de PE (${itemArea.ano})`;
    }

    // 5. Total de Municípios e RDs (sincronizados dinamicamente)
    if (window.municipiosPernambuco && window.municipiosPernambuco.length > 0) {
        const elMuns = document.getElementById('landing_total_municipios');
        const elMunsBadge = document.getElementById('landing_total_muns_badge');
        const totalMuns = window.municipiosPernambuco.filter(m => !m.toLowerCase().includes('noronha')).length;
        if (elMuns) elMuns.textContent = totalMuns;
        if (elMunsBadge) elMunsBadge.textContent = totalMuns;
    }
    if (window.rdsPernambuco && window.rdsPernambuco.length > 0) {
        const elRds = document.getElementById('landing_total_rds');
        const elRdsBadge = document.getElementById('landing_total_rds_badge');
        if (elRds) elRds.textContent = window.rdsPernambuco.length;
        if (elRdsBadge) elRdsBadge.textContent = window.rdsPernambuco.length;
    }

    // 6. Atualização dos Dados (tag de data no topo)
    const elAtualizacao = document.getElementById('landing_data_atualizacao_txt');
    if (elAtualizacao) {
        let anos = [itemPop, itemPibTot, itemPibCap, itemArea].filter(Boolean).map(it => Number(it.ano) || 0);
        let anoRecente = anos.length > 0 ? Math.max(...anos) : 2026;
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const mesAtual = meses[new Date().getMonth()];
        elAtualizacao.textContent = `Atualizado em: ${mesAtual}/${anoRecente}`;
    }

    console.log("✅ [Landing] Grandes Números de Pernambuco atualizados a partir de df_indicadores_ufs!");
};

// Inicialização automática ao carregar o script ou DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.carregarDadosLanding === 'function') {
            window.carregarDadosLanding();
        }
    });
} else {
    if (typeof window.carregarDadosLanding === 'function') {
        window.carregarDadosLanding();
    }
}
