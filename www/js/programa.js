// www/js/programa.js
// Módulo da aba Programas / Temáticas (extraído de ficha.js)
(function () {

    window.obterEstiloBaseMapa = window.obterEstiloBaseMapa || function () {
        return {
            version: 8,
            sources: {
                'esri-gray': {
                    type: 'raster',
                    tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
                    tileSize: 256,
                    attribution: '&copy; Esri'
                }
            },
            layers: [
                { id: 'background', type: 'background', paint: { 'background-color': '#f8fafc' } },
                { id: 'esri-gray-layer', type: 'raster', source: 'esri-gray', minzoom: 0, maxzoom: 18 }
            ]
        };
    };

    const obterCorCapag = function (nota) {
        if (typeof window.obterCorCapag === 'function') return window.obterCorCapag(nota);
        const n = String(nota || '').trim().toUpperCase();
        const mapa = { 'A': '#92D050', 'A+': '#70AD47', 'B': '#00A8A8', 'B+': '#00B0B9', 'C': '#C55A11', 'D': '#843C0C', 'N.D.': '#595959', 'N.E.': '#404040' };
        if (mapa[n]) return mapa[n];
        if (n.startsWith('A+')) return mapa['A+'];
        if (n.startsWith('A')) return mapa['A'];
        if (n.startsWith('B+')) return mapa['B+'];
        if (n.startsWith('B')) return mapa['B'];
        if (n.startsWith('C')) return mapa['C'];
        if (n.startsWith('D')) return mapa['D'];
        if (n.includes('E')) return mapa['N.E.'];
        return mapa['N.D.'];
    };

    const obterGeoJSONSeguro = function (geoInput) {
        if (typeof window.obterGeoJSONSeguro === 'function') return window.obterGeoJSONSeguro(geoInput);
        if (!geoInput) return null;
        if (typeof geoInput === 'object') return geoInput;
        try { return JSON.parse(geoInput); } catch (e) { return null; }
    };

    const eCoordenadaContinental = function (coord) {
        if (typeof window.eCoordenadaContinental === 'function') return window.eCoordenadaContinental(coord);
        if (!Array.isArray(coord) || coord.length < 2) return false;
        return coord[0] < -34.0 && coord[1] < -7.0;
    };

let dataTableHabitacao = null;
let dataTableRegularizacao = null;
window.municipioHabitacaoFiltro = null;

let mapResumoCapag = null;
window.cacheResumoCapag = window.cacheResumoCapag || null;
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
                        window.municipioAlvoBusca = munNome;
                        if (typeof window.mudarAbaAurora === 'function') {
                            window.mudarAbaAurora('Municípios', null);
                        }
                        const $select = $('#ficha_f_municipio');
                        if ($select.length && $select.find('option').length > 1) {
                            $select.val(munNome);
                            if ($select.data('selectpicker')) {
                                $select.selectpicker('refresh');
                            }
                            $select.trigger('change');
                        }
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
window.cacheResumoAguas = window.cacheResumoAguas || null;
let cacheResumoAguas = null;
let dtResumoAguas = null;
let dtApacMananciais = null;
let camadaAtivaAguas = 'Rodízio atual';
let compesaGeoData = null;
let compesaPlanoData = null;
let apacResGeo = null;
let apacBaciasGeo = null;
let apacResumo = null;
window.cacheApacReservatorios = window.cacheApacReservatorios || null;
window.cacheApacData = window.cacheApacData || null;

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
                    const rPlano = await fetch(`${window.basePath || ''}/data/json/compesa_plano_investimentos.json`.replace(/\/+/g, '/'));
                    if (rPlano.ok) data.plano = await rPlano.json();
                } catch (e) {}
            }
            if (!data.geojson) {
                try {
                    const rGeo = await fetch(`${window.basePath || ''}/data/geojson/mapa_compesa_todas_camadas.geojson`.replace(/\/+/g, '/'));
                    if (rGeo.ok) data.geojson = await rGeo.json();
                } catch (e) {}
            }



// APAC Data (Reservatórios GeoJSON, Reservatórios JSON tabular e Bacias)
            apacResGeo = data.apac_reservatorios;
            apacBaciasGeo = data.apac_bacias;
            apacResumo = data.apac_resumo;

            // 1. Aproveita diretamente o JSON tabular entregue pelo backend Go
            if (Array.isArray(data.apac_reservatorios_json) && data.apac_reservatorios_json.length > 0) {
                window.cacheApacReservatorios = data.apac_reservatorios_json;
            } else if (typeof data.apac_reservatorios_json === 'string' && data.apac_reservatorios_json.length > 2) {
                try {
                    window.cacheApacReservatorios = JSON.parse(data.apac_reservatorios_json);
                } catch (e) {}
            }

            // 2. Fallbacks via fetch apenas se algum dado não vier no payload do Go
            if (!apacResGeo || !apacResGeo.features) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/geojson/apac_reservatorios.geojson`.replace(/\/+/g, '/'));
                    if (r.ok) apacResGeo = await r.json();
                } catch (e) {}
            }
            if (!apacBaciasGeo || !apacBaciasGeo.features) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/geojson/apac_bacias_hidrograficas.geojson`.replace(/\/+/g, '/'));
                    if (r.ok) apacBaciasGeo = await r.json();
                } catch (e) {}
            }
            if (!apacResumo || !apacResumo.total_reservatorios) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/json/apac_resumo_estadual.json`.replace(/\/+/g, '/'));
                    if (r.ok) apacResumo = await r.json();
                } catch (e) {}
            }
            if (!window.cacheApacReservatorios || !window.cacheApacReservatorios.length) {
                try {
                    const r = await fetch(`${window.basePath || ''}/data/json/apac_reservatorios.json`.replace(/\/+/g, '/'));
                    if (r.ok) window.cacheApacReservatorios = await r.json();
                } catch (e) {}
            }

            // 3. Fallback extra: extrai a lista tabular das properties do GeoJSON caso o JSON tabular falhe
            if ((!window.cacheApacReservatorios || !window.cacheApacReservatorios.length) && apacResGeo && Array.isArray(apacResGeo.features)) {
                window.cacheApacReservatorios = apacResGeo.features.map(f => f.properties || {});
            }

            window.cacheApacData = {
                reservatorios: window.cacheApacReservatorios,
                bacias: apacBaciasGeo,
                resumo: apacResumo
            };
            
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


let mapResumoCozinhas = null;
window.cacheResumoCozinhas = window.cacheResumoCozinhas || null;
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
window.cacheResumoEstradas = window.cacheResumoEstradas || null;
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
    const fallbackUrl = `${window.basePath || ''}/data/json/estradas_pe.json`.replace(/\/+/g, '/');

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
   RESUMOS TEMÁTICOS - PAUTA 5: HABITAÇÃO, MODALIDADES E REGULARIZAÇÃO (REURB)
   ========================================================================== */
let mapResumoHabitacao = null;
window.cacheResumoHabitacao = window.cacheResumoHabitacao || null;
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
window.cacheResumoObras = window.cacheResumoObras || null;
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
    if (dataTableHabitacao && typeof dataTableHabitacao.columns.adjust === 'function') dataTableHabitacao.columns.adjust();
    if (dataTableRegularizacao && typeof dataTableRegularizacao.columns.adjust === 'function') dataTableRegularizacao.columns.adjust();
});

})();
