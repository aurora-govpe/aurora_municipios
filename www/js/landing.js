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
