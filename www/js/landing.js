// www/js/landing.js
// LÃ³gica de interaÃ§Ã£o da Landing Page do Aurora

window.rdsPernambuco = [
    "Agreste Central",
    "Agreste Setentrional",
    "Mata Centro",
    "Mata Norte",
    "Mata Sul",
    "Metropolitana",
    "SertÃ£o Central",
    "SertÃ£o do Araripe",
    "SertÃ£o de Itaparica",
    "SertÃ£o do MoxotÃ³",
    "SertÃ£o do PajeÃº",
    "SertÃ£o do SÃ£o Francisco"
];

function normalizarTexto(txt) {
    if (!txt) return "";
    return String(txt).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// NavegaÃ§Ã£o direta para um MunicÃ­pio
window.irParaMunicipio = function(nomeMun) {
    if (!nomeMun) return;
    
    // 1. Muda para a aba MunicÃ­pios
    window.mudarAbaAurora('MunicÃ­pios', null);
    
    // 2. Aguarda a inicializaÃ§Ã£o do mÃ³dulo ou aplica diretamente se jÃ¡ iniciado
    const aplicarSelecao = function() {
        const $select = $('#ficha_f_municipio');
        if (!$select.length) {
            setTimeout(aplicarSelecao, 100);
            return;
        }

        const normBuscada = normalizarTexto(nomeMun);
        let valorEncontrado = null;

        // Procura opÃ§Ã£o correspondente
        $select.find('option').each(function() {
            const v = $(this).val();
            if (normalizarTexto(v) === normBuscada) {
                valorEncontrado = v;
                return false;
            }
        });

        if (valorEncontrado) {
            $select.val(valorEncontrado);
            if (typeof $select.selectpicker === 'function' && $select.data('selectpicker')) {
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

// NavegaÃ§Ã£o direta para uma RegiÃ£o de Desenvolvimento (RD)
window.irParaRD = function(nomeRD) {
    if (!nomeRD) return;

    window.mudarAbaAurora('RegiÃµes', null);

    const aplicarSelecaoRD = function() {
        const $select = $('#regioes_f_rd');
        if (!$select.length) {
            setTimeout(aplicarSelecaoRD, 100);
            return;
        }

        const normBuscada = normalizarTexto(nomeRD);
        let valorEncontrado = null;

        $select.find('option').each(function() {
            const v = $(this).val();
            if (normalizarTexto(v) === normBuscada || normalizarTexto(v).includes(normBuscada)) {
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

// ExecuÃ§Ã£o da busca a partir do input da Landing Page
window.executarBuscaLanding = function() {
    const input = document.getElementById("landing_search_input");
    if (!input) return;
    const termo = input.value.trim();
    if (!termo) return;

    const termoNorm = normalizarTexto(termo);

    // 1. Testa se Ã© uma RegiÃ£o de Desenvolvimento
    for (const rd of window.rdsPernambuco) {
        if (normalizarTexto(rd).includes(termoNorm) || termoNorm.includes(normalizarTexto(rd))) {
            window.irParaRD(rd);
            return;
        }
    }

    // 2. Testa nos municÃ­pios da lista popRanks (se disponÃ­vel)
    if (window.popRanks) {
        for (const mun in window.popRanks) {
            if (normalizarTexto(mun).includes(termoNorm) || termoNorm.includes(normalizarTexto(mun))) {
                // FormataÃ§Ã£o capitalizada do nome encontrado
                const formatado = mun.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                window.irParaMunicipio(formatado);
                return;
            }
        }
    }

    // 3. Fallback: assume municÃ­pio e tenta carregar
    window.irParaMunicipio(termo);
};
