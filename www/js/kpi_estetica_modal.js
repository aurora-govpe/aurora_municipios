// www/js/kpi_estetica_e_modal.js
/* ==========================================================================
   MÓDULO DE ESTÉTICA DE KPIS (PADRÃO UFs/AURORA) E MODAL DE SÉRIE HISTÓRICA
   (Comparativo Estadual PE e Região de Desenvolvimento - RD)
   ========================================================================== */

(function (window, document) {
    'use strict';

    /* ----------------------------------------------------------------------
       1. HELPERS BASE DE METADADOS E FORMATAÇÃO VISUAL
       ---------------------------------------------------------------------- */

    window.normKeyMun = window.normKeyMun || function (str) {
        return String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    window.buscarMetadadoMun = window.buscarMetadadoMun || function (siglaOrKey) {
        if (!siglaOrKey) return null;

        if (window.dadosMetadadosMapa && window.dadosMetadadosMapa[siglaOrKey]) {
            return window.dadosMetadadosMapa[siglaOrKey];
        }

        const sNorm = window.normKeyMun(siglaOrKey);
        if (window.dadosMetadadosMapa) {
            for (const k in window.dadosMetadadosMapa) {
                if (window.normKeyMun(k) === sNorm) {
                    return window.dadosMetadadosMapa[k];
                }
            }
        }

        if (Array.isArray(window.dadosMetadados)) {
            const found = window.dadosMetadados.find(m =>
                window.normKeyMun(m.cd_indicador) === sNorm ||
                window.normKeyMun(m.nm_indicador) === sNorm ||
                window.normKeyMun(m.nm_fantasia) === sNorm
            );
            if (found) return found;
        }

        return null;
    };

    // Identidade visual (cor e ícone) por sigla ou dimensão
    window.obterConfigKPI_Mun = function (siglaOrKey, meta) {
        const s = window.normKeyMun(siglaOrKey);
        const dim = window.normKeyMun(meta?.dimensao || meta?.grupo || '');

        if (s.includes('mvi') || s.includes('feminicidio') || s.includes('rfv') || s.includes('vcm') || s.includes('cvp')) {
            return { color: '#C0392B', icon: 'fas fa-shield-halved' };
        }
        if (s.includes('ideb') || s.includes('idepe') || s.includes('alfabetizacao')) {
            return { color: '#2E86C1', icon: 'fas fa-graduation-cap' };
        }
        if (s.includes('tdi') || s.includes('aba_') || s.includes('rep_')) {
            return { color: '#D35400', icon: 'fas fa-clock-rotate-left' };
        }
        if (s.includes('apr_') || s.includes('mat_') || s.includes('creche')) {
            return { color: '#16A085', icon: 'fas fa-children' };
        }
        if (s.includes('pre_natal') || s.includes('razao_mm') || s.includes('infantil') || s.includes('infancia') || s.includes('dcnt') || s.includes('evitaveis') || s.includes('att')) {
            return { color: '#8E44AD', icon: 'fas fa-heartbeat' };
        }
        if (s.includes('agua') || s.includes('esgoto')) {
            return { color: '#0284C7', icon: s.includes('esgoto') ? 'fas fa-faucet-drip' : 'fas fa-droplet' };
        }
        if (s.includes('cad_') || s.includes('ivcad') || s.includes('gini')) {
            return { color: '#7C3AED', icon: 'fas fa-hand-holding-heart' };
        }
        if (s.includes('maes') || s.includes('cozinha')) {
            return { color: '#DB2777', icon: 'fas fa-utensils' };
        }
        if (s.includes('pcp') || s.includes('cofin')) {
            return { color: '#D97706', icon: 'fas fa-hand-holding-dollar' };
        }
        if (s.includes('pib') || s.includes('vab') || s.includes('idhm')) {
            return { color: '#16A085', icon: 'fas fa-chart-line' };
        }
        if (s.includes('fibra') || s.includes('4g') || s.includes('anatel') || s.includes('alta_tec') || s.includes('infocom')) {
            return { color: '#0EA5E9', icon: 'fas fa-microchip' };
        }
        if (s.includes('exp_') || s.includes('imp_')) {
            return { color: '#2563EB', icon: 'fas fa-ship' };
        }
        if (s.includes('rd_') || s.includes('pia') || s.includes('envelhecimento') || s.includes('longevidade') || s.includes('jovem') || s.includes('renov')) {
            return { color: '#2980B9', icon: 'fas fa-users' };
        }
        if (dim.includes('fiscal')) return { color: '#F39C12', icon: 'fas fa-scale-balanced' };
        if (dim.includes('social')) return { color: '#E67E22', icon: 'fas fa-hands-holding-child' };
        return { color: '#1a3c6e', icon: 'fas fa-chart-column' };
    };

    // Formatação numérica padronizada para exibição nos KPIs e tooltips
    window.formatarValorKPIMun = function (v, tipoNorm, sigla = '') {
        if (v === null || v === undefined || isNaN(v)) return '-';
        const sLow = String(sigla || '').toLowerCase();
        const meta = window.buscarMetadadoMun(sigla) || {};
        const tLow = window.normKeyMun(tipoNorm || meta.tipo || meta.natureza || '');

        if (tLow.includes('percent') || sLow.startsWith('pct_') || sLow.startsWith('perc_') || sLow.startsWith('tx_cad')) {
            return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
        }
        if (tLow.includes('indice') || sLow === 'idhm' || sLow === 'indice_gini' || sLow.startsWith('ideb') || sLow.startsWith('idepe') || sLow.startsWith('ivcad') || sLow.startsWith('ql_') || sLow.startsWith('rd_') || sLow.startsWith('ind_')) {
            const casas = (sLow === 'idhm' || sLow.startsWith('ivcad')) ? 3 : 2;
            return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
        }
        if (tLow.includes('taxa') || sLow.startsWith('tx_') || sLow === 'razao_mm') {
            return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
        }
        if (tLow.includes('moeda') || sLow.includes('valor') || sLow.includes('pib') || sLow.includes('sal_') || sLow.includes('credito') || sLow.includes('custeio') || sLow.includes('investimento') || sLow.includes('cofin') || sLow.startsWith('exp_') || sLow.startsWith('imp_')) {
            const sinal = v < 0 ? '-' : '';
            const valReais = (sLow === 'pib_1000') ? v * 1000 : v;
            const absR = Math.abs(valReais);
            if (absR >= 1e9) return `${sinal}R$ ${(absR / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bi`;
            if (absR >= 1e6) return `${sinal}R$ ${(absR / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`;
            return `${sinal}R$ ${absR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return Math.round(v).toLocaleString('pt-BR');
    };

    // Badge de polaridade (Maior melhor / Menor melhor / Contextual)
    function obterTextoPolaridade(sigla) {
        const meta = window.buscarMetadadoMun(sigla);
        if (!meta) {
            return `<span class="badge-polaridade badge-polaridade-neutra" title="Indicador de perfil estrutural / contextual">
                        <i class="fas fa-circle-info"></i> Contextual
                    </span>`;
        }

        const pol = window.normKeyMun(meta.polaridade || '');
        if (pol === 'positiva') {
            return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: Quanto maior, melhor">
                        <i class="fas fa-arrow-trend-up"></i> Maior melhor
                    </span>`;
        }
        if (pol === 'negativa') {
            return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                        <i class="fas fa-arrow-trend-down"></i> Menor melhor
                    </span>`;
        }

        const dirRaw = String(meta?.referencia_analise?.direcao_desejavel || meta?.direcao_desejavel || '').trim();
        const dir = window.normKeyMun(dirRaw);

        if (dir.includes('aumento') || dir.includes('maior') || dir.includes('crescimento')) {
            return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: ${dirRaw}">
                        <i class="fas fa-arrow-trend-up"></i> Maior melhor
                    </span>`;
        }
        if (dir.includes('reducao') || dir.includes('menor') || dir.includes('queda')) {
            return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: ${dirRaw}">
                        <i class="fas fa-arrow-trend-down"></i> Menor melhor
                    </span>`;
        }

        return `<span class="badge-polaridade badge-polaridade-neutra" title="Indicador de perfil estrutural / contextual">
                    <i class="fas fa-circle-info"></i> Contextual
                </span>`;
    }
    window.obterBadgePolaridade = obterTextoPolaridade;
    window.obterTextoPolaridade = obterTextoPolaridade;

    window.getRankTexto = function (rank) {
        if (!rank || rank === '-' || rank === 'n/a' || isNaN(Number(rank))) {
            return '<span class="text-slate-400 font-medium">-</span>';
        }
        return `<span class="kpi-txt-rank" title="Posição relativa em Pernambuco">${rank}º em PE</span>`;
    };
    window.getRankBadge = window.getRankTexto;

    window.montarRodapeKPI = function (grandeza, refAno, rank, siglaPolaridade) {
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
                <div class="kpi-footer-cell-left">${grandezaHtml}</div>
                <div class="kpi-footer-cell-right">${refHtml}</div>
                <div class="kpi-footer-cell-left">${rankHtml}</div>
                <div class="kpi-footer-cell-right">${polHtml}</div>
            </div>
        `;
    };

    /* ----------------------------------------------------------------------
       2. DISPOSIÇÃO E ESTÉTICA DOS CARDS DE KPI (PADRÃO UFs / AURORA)
       ---------------------------------------------------------------------- */

    function injetarEstilosCardKPI() {
        if (document.getElementById('estilo-kpi-card-aurora')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'estilo-kpi-card-aurora';
        styleEl.textContent = `
            .kpi-card-aurora {
                border: 1px solid #cbd5e1 !important;
                border-radius: 14px !important;
                background-color: #ffffff !important;
                box-shadow: 0 3px 8px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04) !important;
                transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease !important;
            }
            .kpi-card-aurora:hover {
                transform: translateY(-4px);
                border-color: #94a3b8 !important;
                box-shadow: 0 12px 22px -6px rgba(15, 23, 42, 0.13), 0 4px 10px -3px rgba(15, 23, 42, 0.07) !important;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Gerador completo do Card de KPI com layout padronizado
    window.gerarHTMLCardMunicipio = function (titulo, dadosSerie, config = {}, siglaOrKey = '', tipoDado = 'socio', usaColGrid = true, extraHtml = '') {
        injetarEstilosCardKPI();

        const meta = window.buscarMetadadoMun(siglaOrKey) || {};
        const cfgAuto = window.obterConfigKPI_Mun(siglaOrKey, meta);

        const tipoNorm = meta.tipo || dadosSerie.tipo || config.tipo || '';
        const strAtual = dadosSerie.valAtual !== null && dadosSerie.valAtual !== undefined
            ? (dadosSerie.strAtualFmt || window.formatarValorKPIMun(dadosSerie.valAtual, tipoNorm, siglaOrKey))
            : (dadosSerie.strAtual || '-');
        const strAnt = dadosSerie.valAnt !== null && dadosSerie.valAnt !== undefined
            ? (dadosSerie.strAntFmt || window.formatarValorKPIMun(dadosSerie.valAnt, tipoNorm, siglaOrKey))
            : '-';

        const polJson = window.normKeyMun(meta.polaridade || dadosSerie.polaridade || '');
        const isLowerBetter = polJson === 'negativa' || config.isLowerBetter === true;
        const isPositivo = (dadosSerie.varPct || 0) >= 0;

        let corVar = isPositivo ? '#27AE60' : '#E74C3C';
        let iconeVar = isPositivo ? 'fa-arrow-up' : 'fa-arrow-down';
        if (isLowerBetter) {
            corVar = isPositivo ? '#E74C3C' : '#27AE60';
        }

        const strVar = (dadosSerie.valAnt !== null && dadosSerie.valAnt !== undefined && dadosSerie.valAnt !== 0)
            ? `<i class="fas ${iconeVar} me-1"></i>${Math.abs(dadosSerie.varPct).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
            : '-';

        const badgeRankHtml = (dadosSerie.rank && Number(dadosSerie.rank) > 0)
            ? `<span class="badge bg-slate-100 text-slate-700 border" style="font-size: 0.65rem; padding: 2px 6px; font-weight: 700; border-radius: 6px;"><i class="fas fa-trophy text-amber-500 me-0.5"></i> ${dadosSerie.rank}º em PE</span>`
            : '';

        const badgePolaridadeHtml = obterTextoPolaridade(siglaOrKey);

        const refAnoHtml = (dadosSerie.anoAtual && dadosSerie.anoAtual !== '-')
            ? `<div class="mt-1"><span class="badge bg-white text-slate-500 border" style="font-size: 0.62rem; padding: 2px 6px;"><i class="far fa-calendar-alt me-1 text-slate-400"></i>Ref: ${dadosSerie.anoAtual}</span></div>`
            : '';

        const isClp = window.normKeyMun(meta.clp) === 'sim';
        const logoClpHtml = isClp
            ? `<img src="images/logo_clp_ranking.png" alt="Indicador CLP" title="Indicador do Ranking de Competitividade (CLP)" style="height: 32px; width: auto; max-width: 75px; object-fit: contain;">`
            : '';

        const cor = config.color || cfgAuto.color;
        const icone = config.icon || cfgAuto.icon;
        const tituloFinal = meta.nm_indicador || titulo || dadosSerie.nome || siglaOrKey;
        const tituloEsc = String(tituloFinal).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const siglaEsc = String(siglaOrKey).replace(/'/g, "\\'");

        const cardInner = `
            <div class="card h-100 kpi-card-aurora" data-uf-style="1">
                <div class="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex gap-2 align-items-center" style="min-width: 0; flex: 1;">
                                <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                                     style="width: 40px; height: 40px; background-color: ${cor}18; color: ${cor};">
                                    <i class="${icone}" style="font-size: 1.05rem;"></i>
                                </div>
                                <div style="min-width: 0; flex: 1; padding-right: 4px;">
                                    <div class="fw-bold text-dark text-truncate" style="font-size: 1.15rem; letter-spacing: -0.5px; line-height: 1.2;">${strAtual}</div>
                                    <div class="text-muted fw-semibold" style="font-size: 0.74rem; line-height: 1.25; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; max-height: 2.5em; word-break: break-word;" title="${tituloEsc}">${tituloFinal}</div>
                                </div>
                            </div>
                            <div class="d-flex gap-1 align-items-center flex-shrink-0 d-print-none">
                                <button type="button" class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center"
                                        onclick="event.stopPropagation(); window.abrirModalMetadado('${siglaEsc}')"
                                        style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Metadados e Informações">
                                    <i class="fas fa-info text-slate-500" style="font-size: 0.75rem;"></i>
                                </button>
                                <button type="button" class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center"
                                        onclick="event.stopPropagation(); window.abrirModalSerieHistoricaMun('${siglaEsc}', '${tituloEsc}', '${tipoDado}')"
                                        style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Série Histórica e Ranking Estadual">
                                    <i class="fas fa-arrow-right" style="color: #1a3c6e; font-size: 0.75rem;"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Linha 1: Ranking (troféu) + Polaridade -->
                        <div class="d-flex flex-wrap align-items-center gap-1 pt-1" style="min-height: 22px;">
                            ${badgeRankHtml}
                            ${badgePolaridadeHtml}
                        </div>
                        <!-- Linha 2: Referência do Ano logo abaixo do Ranking -->
                        <div class="mb-2">
                            ${refAnoHtml}
                        </div>
                        ${extraHtml}
                    </div>

                    <hr class="my-2" style="opacity: 0.08; border-top: 1.5px solid #000;">

                    <div class="d-flex justify-content-between align-items-end pt-1 gap-2">
                        <div style="min-width: 0; flex: 1;">
                            <span class="d-block text-muted text-truncate" style="font-size: 0.68rem; font-weight: 600;">
                                Período Anterior ${dadosSerie.anoAnt && dadosSerie.anoAnt !== '-' ? `(${dadosSerie.anoAnt})` : ''}
                            </span>
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
        `;

        return usaColGrid
            ? `<div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-2" style="page-break-inside: avoid;">${cardInner}</div>`
            : cardInner;
    };

    // Substitui cards HTML estáticos in-place pelo padrão visual UFs
    window.aplicarEsteticaUFsNoCardStatico = function (elemBase, siglaOrKey, dadosSerie, config = {}, tipoDado = 'socio', extraHtml = '') {
        const kpiEl = document.getElementById(`ficha_kpi_${elemBase}`);
        if (!kpiEl) return;

const cardEl = kpiEl.closest('.kpi-card-aurora') || kpiEl.closest('.card') || kpiEl.closest('.kpi-modern-card') || kpiEl.closest('[class*="rounded"]') || kpiEl.parentElement?.parentElement;

if (!cardEl) return;

        let tituloOriginal = cardEl.getAttribute('data-orig-title') || '';
        if (!tituloOriginal) {
            const titleCandidate = cardEl.querySelector('.kpi-modern-header, .text-uppercase, .kpi-title, h6, small');
            if (titleCandidate && titleCandidate.id !== `ficha_kpi_${elemBase}` && titleCandidate.id !== `ficha_ano_${elemBase}`) {
                const clone = titleCandidate.cloneNode(true);
                clone.querySelectorAll('button, i').forEach(n => n.remove());
                tituloOriginal = clone.textContent.trim();
            }
        }

        const htmlPadraoUFs = window.gerarHTMLCardMunicipio(tituloOriginal, dadosSerie, config, siglaOrKey, tipoDado, false, extraHtml);
        const tempWrap = document.createElement('div');
        tempWrap.innerHTML = htmlPadraoUFs.trim();
        const novoCard = tempWrap.firstElementChild;

        if (novoCard) {
            if (tituloOriginal) novoCard.setAttribute('data-orig-title', tituloOriginal);
            const hiddenRefs = document.createElement('div');
            hiddenRefs.style.display = 'none';
            hiddenRefs.innerHTML = `<span id="ficha_kpi_${elemBase}">${dadosSerie.strAtualFmt || dadosSerie.strAtual || '-'}</span><span id="ficha_ano_${elemBase}"></span>`;
            novoCard.appendChild(hiddenRefs);

            cardEl.replaceWith(novoCard);
        }
    };

    // Varre cards remanescentes (.kpi-modern-card) e aplica a estética padronizada
    window.garantirBotoesTodosKPIs = function () {
        const listaFonte = window.dadosBrutosFicha || [];
        document.querySelectorAll('#aba_ficha .kpi-modern-card').forEach(card => {
            if (card.getAttribute('data-uf-style') === '1') return;
            const numEl = card.querySelector('[id^="ficha_kpi_"]');
            if (!numEl) return;

            const elemBase = numEl.id.replace('ficha_kpi_', '');
            const valTexto = numEl.textContent.trim();

            const serie = typeof window.extrairSerieIndicadorMun === 'function'
                ? window.extrairSerieIndicadorMun(listaFonte, elemBase)
                : { existe: false, valAtual: null, valAnt: null, strAtual: '-', varPct: 0, anoAtual: '-', anoAnt: '-' };

            if (!serie.existe && valTexto && valTexto !== '-') {
                serie.existe = true;
                serie.strAtual = valTexto;
                serie.strAtualFmt = valTexto;
            }

            window.aplicarEsteticaUFsNoCardStatico(elemBase, elemBase, serie, {}, 'socio');
        });
    };

    /* ----------------------------------------------------------------------
       3. MODAL DE SÉRIE HISTÓRICA E COMPARAÇÃO (ESTADO PE E RD)
       ---------------------------------------------------------------------- */

    window.chartModalMunSerie = null;
    window.chartModalMunRanking = null;
    window.cacheModalMapaMun = window.cacheModalMapaMun || {};

    function obterOuCriarModalSerieMun() {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

        // 1. Reutiliza o modal #modal_ufs_kpi_serie se já existir no HTML
        let modalEl = document.getElementById('modal_ufs_kpi_serie');
        if (modalEl) {
            if (modalEl.parentElement !== document.body) {
                document.body.appendChild(modalEl);
            }

            const headerEl = modalEl.querySelector('.modal-header');
            if (headerEl) {
                let badgeMun = headerEl.querySelector('#modal_mun_serie_badge');
                const titleEl = headerEl.querySelector('#modal_ufs_kpi_titulo') || headerEl.querySelector('.modal-title');
                if (!badgeMun && titleEl) {
                    badgeMun = document.createElement('span');
                    badgeMun.id = 'modal_mun_serie_badge';
                    badgeMun.className = 'badge bg-white/15 text-amber-300 border border-white/25 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 d-inline-block';
                    badgeMun.textContent = 'Indicador Municipal';
                    titleEl.parentElement.insertBefore(badgeMun, titleEl);
                    titleEl.parentElement.classList.remove('align-items-center');
                    titleEl.parentElement.classList.add('flex-column', 'align-items-start');
                } else if (badgeMun) {
                    badgeMun.textContent = 'Indicador Municipal';
                    badgeMun.style.display = 'inline-block';
                }
            }

            const walker = document.createTreeWalker(modalEl, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                if (node.nodeValue && node.nodeValue.includes('Ranking Nacional')) {
                    node.nodeValue = node.nodeValue.replace(/Ranking Nacional\s*\(27 UFs \+ NE e Brasil\)|Ranking Nacional/gi, 'Ranking Estadual');
                }
            }

            return {
                modalEl,
                titleId: 'modal_ufs_kpi_titulo',
                serieDomId: 'modal_ufs_chart_serie',
                rankingDomId: 'modal_ufs_chart_ranking',
                storyId: 'modal_ufs_kpi_storytelling'
            };
        }

        // 2. Fallback: cria o modal completo diretamente no <body>
        modalEl = document.getElementById('modal_mun_kpi_serie');
        if (!modalEl) {
            const htmlModal = `
            <div class="modal fade" id="modal_mun_kpi_serie" tabindex="-1" aria-hidden="true" style="z-index: 1080;">
                <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
                        <div class="modal-header border-0 py-3 px-4" style="background: linear-gradient(135deg, #0c2856 0%, #1a3c6e 100%); color: #ffffff;">
                            <div class="d-flex flex-column align-items-start">
                                <span id="modal_mun_serie_badge" class="badge bg-white/15 text-amber-300 border border-white/25 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1">Indicador Municipal</span>
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fas fa-chart-line text-warning fs-5"></i>
                                    <h5 class="modal-title fw-bold mb-0 text-white" id="modal_mun_kpi_titulo" style="font-size: 1.05rem;">Histórico e Comparativo Estadual</h5>
                                </div>
                            </div>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <div class="row g-3">
                                <div class="col-lg-6">
                                    <div class="card border-0 shadow-sm h-100" style="border-radius: 14px;">
                                        <div class="card-body p-3">
                                            <h6 class="fw-bold text-slate-700 mb-2" style="font-size: 0.85rem;">
                                                <i class="fas fa-clock-rotate-left text-primary me-1"></i> Série Histórica Municipal
                                            </h6>
                                            <div id="modal_mun_chart_serie" style="width: 100%; height: 370px;"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="card border-0 shadow-sm h-100" style="border-radius: 14px;">
                                        <div class="card-body p-3">
                                            <h6 class="fw-bold text-slate-700 mb-2" style="font-size: 0.85rem;">
                                                <i class="fas fa-trophy text-warning me-1"></i> Ranking Estadual
                                            </h6>
                                            <div id="modal_mun_chart_ranking" style="width: 100%; height: 370px;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="modal_mun_kpi_storytelling" class="mt-3 p-3 bg-white rounded-3 border shadow-2xs" style="font-size: 0.85rem; color: #334155;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', htmlModal);
            modalEl = document.getElementById('modal_mun_kpi_serie');
        }

        return {
            modalEl,
            titleId: 'modal_mun_kpi_titulo',
            serieDomId: 'modal_mun_chart_serie',
            rankingDomId: 'modal_mun_chart_ranking',
            storyId: 'modal_mun_kpi_storytelling'
        };
    }

    // Abre o Modal de Série Histórica e Comparação (PE / RD)
    window.abrirModalSerieHistoricaMun = function (siglaOrKey, titulo, tipoDado) {
        try {
            const mun = window.municipioAtualFicha
                || (typeof $ !== 'undefined' && $('#ficha_f_municipio').val())
                || (typeof $ !== 'undefined' && $('#ficha_nome_municipio').text().trim())
                || 'Recife';

            const meta = window.buscarMetadadoMun(siglaOrKey) || {};
            const nomeExib = meta.nm_indicador || titulo || siglaOrKey;

            const refs = obterOuCriarModalSerieMun();
            if (!refs || !refs.modalEl) {
                console.error('[Modal Mun] Elemento do modal não encontrado.');
                return;
            }

            refs.modalEl.style.zIndex = '1080';

            const modalTitle = document.getElementById(refs.titleId);
            if (modalTitle) {
                modalTitle.innerText = `${nomeExib} — Histórico e Comparativo Estadual (${mun})`;
            }

            const boxStory = document.getElementById(refs.storyId);
            if (boxStory) {
                boxStory.innerHTML = `<div class="text-muted"><i class="fas fa-spinner fa-spin me-2 text-primary"></i>Carregando série histórica e comparativo estadual de <strong>${nomeExib}</strong>...</div>`;
            }

            if (window.chartModalMunSerie) {
                try { window.chartModalMunSerie.dispose(); } catch (e) {}
                window.chartModalMunSerie = null;
            }
            if (window.chartModalMunRanking) {
                try { window.chartModalMunRanking.dispose(); } catch (e) {}
                window.chartModalMunRanking = null;
            }

            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getOrCreateInstance(refs.modalEl);
                bsModal.show();
            } else if (typeof $ !== 'undefined' && typeof $(refs.modalEl).modal === 'function') {
                $(refs.modalEl).modal('show');
            } else {
                refs.modalEl.classList.add('show');
                refs.modalEl.style.display = 'block';
            }

            let jaRenderizou = false;
            const dispararRender = () => {
                if (jaRenderizou) return;
                jaRenderizou = true;
                renderizarModalSerieERankingMun(siglaOrKey, nomeExib, mun, meta, refs);
            };

            refs.modalEl.addEventListener('shown.bs.modal', dispararRender, { once: true });
            setTimeout(dispararRender, 300);
        } catch (err) {
            console.error('[Modal Mun] Erro ao abrir modal:', err);
        }
    };
    window.abrirModalHistoricoKPI = window.abrirModalSerieHistoricaMun;

    async function renderizarModalSerieERankingMun(sigla, nomeExib, mun, meta, refs) {
        try {
            const normStr = (s) => String(s || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normUpper = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
            const sNorm = String(sigla || '').trim().toLowerCase();
            const cfgAuto = window.obterConfigKPI_Mun(sigla, meta);

            const tipoNorm = normStr(meta.tipo || meta.natureza || '');
            const isVabSetorial = ['vab_agro', 'vab_ind', 'vab_serv', 'vab_adm'].includes(sNorm);
            const isPct = !isVabSetorial && (tipoNorm.includes('percent') || sNorm.startsWith('pct_') || sNorm.startsWith('perc_') || sNorm.startsWith('tx_cad'));
            const isMoeda = isVabSetorial || tipoNorm.includes('moeda') || sNorm.includes('valor') || sNorm.includes('pib') || sNorm.includes('sal_') || sNorm.includes('credito') || sNorm.includes('custeio') || sNorm.includes('investimento') || sNorm.includes('cofin') || sNorm.startsWith('exp_') || sNorm.startsWith('imp_');
            const isLowerBetter = normStr(meta.polaridade || '') === 'negativa';

            let escopoComparativo = 'PE';
            let pontoAtualSelecionado = null;

            const badgeEl = document.getElementById('modal_mun_serie_badge');
            if (badgeEl) {
                const natExib = isVabSetorial ? 'Valor Bruto (R$)' : meta.natureza;
                badgeEl.textContent = natExib ? `Indicador Municipal • ${natExib}` : 'Indicador Municipal';
            }

            const domRank = document.getElementById(refs.rankingDomId);
            const MESES_CURTOS_MUN = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const listaBruta = Array.isArray(window.dadosBrutosFicha) ? window.dadosBrutosFicha : [];
            const base = window.basePath || '';

            const ajustarValorBruto = (val) => {
                if (val === null || val === undefined || isNaN(Number(val))) return null;
                const n = Number(val);
                if (isVabSetorial && Math.abs(n) > 0 && Math.abs(n) < 1e8) {
                    return n * 1000;
                }
                return n;
            };

            const isCvpTaxa = (sNorm === 'tx_cvp');
            const siglaApiMapa = isCvpTaxa ? 'tx_cvp' : sigla;

            const buscarMapaSigla = async (sig, anoRef = 0) => {
                const cacheKey = anoRef > 0 ? `${sig}_${anoRef}` : sig;
                if (window.cacheModalMapaMun[cacheKey]) return window.cacheModalMapaMun[cacheKey];
                try {
                    const queryAno = anoRef > 0 ? `&ano=${anoRef}` : '';
                    const url = `${base}/api/ficha/mapa_indicador?sigla=${encodeURIComponent(sig)}&com_geojson=0${queryAno}`.replace(/\/+/g, '/');
                    const res = await fetch(url);
                    if (res && res.ok) {
                        const json = await res.json();
                        window.cacheModalMapaMun[cacheKey] = json;
                        return json;
                    }
                } catch (e) {
                    console.warn(`[Modal Mun] Erro ao buscar mapa para ${sig}:`, e);
                }
                return null;
            };

            // 1. Extrai série histórica completa do município
            const siglaSerieOrigem = isCvpTaxa ? 'cvp' : sNorm;
            const popMunAtual = (() => {
                const txtPop = (typeof $ !== 'undefined' && $('#ficha_pop_subtitle').text()) || '';
                const m = txtPop.match(/([\d.]+)\s*hab/i);
                return m ? (parseFloat(m[1].replace(/\./g, '')) || 0) : 0;
            })();

            const mapaPorPeriodo = new Map();
            listaBruta
                .filter(i => String(i.sigla_indicador || '').trim().toLowerCase() === siglaSerieOrigem && i.indicador !== null && i.indicador !== undefined && i.indicador !== '-')
                .forEach(i => {
                    const vRaw = parseFloat(String(i.indicador).replace(',', '.'));
                    if (isNaN(vRaw)) return;

                    let v = ajustarValorBruto(vRaw);
                    if (isCvpTaxa) {
                        v = popMunAtual > 0 ? (vRaw / popMunAtual) * 100000 : null;
                    }
                    if (v === null) return;

                    const ano = parseInt(i.ano, 10) || 0;
                    const mesNum = parseInt(String(i.mes_referencia || '').trim(), 10) || 0;
                    const isMensal = mesNum >= 1 && mesNum <= 12;
                    const sortKey = ano * 100 + (isMensal ? mesNum : 0);
                    const label = isMensal ? `${MESES_CURTOS_MUN[mesNum - 1]}/${String(ano).slice(-2)}` : String(ano);
                    const labelCompleto = isMensal ? `${MESES_CURTOS_MUN[mesNum - 1]}/${ano}` : String(ano);

                    if (!mapaPorPeriodo.has(sortKey)) {
                        mapaPorPeriodo.set(sortKey, { ano, mes: isMensal ? mesNum : 0, isMensal, sortKey, label, labelCompleto, valor: v });
                    }
                });

            let serieRows = Array.from(mapaPorPeriodo.values()).sort((a, b) => a.sortKey - b.sortKey);

            // 2. Carrega lista estadual de municípios para comparação PE e RD
            const carregarListaMunsAno = async (anoRef = 0) => {
                const dataMapa = await buscarMapaSigla(siglaApiMapa, anoRef);
                const lista = [];

                if (dataMapa && dataMapa.municipios) {
                    const vistosIbge = new Set();
                    Object.values(dataMapa.municipios).forEach(m => {
                        if (!m || !m.ibge6 || vistosIbge.has(m.ibge6)) return;
                        vistosIbge.add(m.ibge6);
                        if (m.valor !== null && m.valor !== undefined && !isNaN(Number(m.valor))) {
                            lista.push({
                                municipio: m.municipio,
                                rd: m.rd,
                                valor: ajustarValorBruto(Number(m.valor))
                            });
                        }
                    });
                }

                return { dataMapa, lista };
            };

            const anoInicial = serieRows.length > 0 ? serieRows[serieRows.length - 1].ano : 0;
            const inicialRes = await carregarListaMunsAno(anoInicial);

            if (serieRows.length === 0 && inicialRes.lista.length > 0) {
                const itemM = inicialRes.lista.find(m => normUpper(m.municipio) === normUpper(mun));
                if (itemM) {
                    const a = (inicialRes.dataMapa && inicialRes.dataMapa.ano) || 2024;
                    serieRows.push({
                        ano: a,
                        mes: 0,
                        isMensal: false,
                        sortKey: a * 100,
                        label: String(a),
                        labelCompleto: String(a),
                        valor: itemM.valor
                    });
                }
            }

            const formatarValModal = (v) => {
                const tipoFmt = isPct ? 'percentual' : (isMoeda ? 'moeda' : tipoNorm);
                return window.formatarValorKPIMun(v, tipoFmt, sigla);
            };

            const formatarEixoX = (val) => {
                if (isPct) return `${val}%`;
                if (isMoeda) {
                    if (Math.abs(val) >= 1e9) return `R$ ${(val / 1e9).toFixed(1)}B`;
                    if (Math.abs(val) >= 1e6) return `R$ ${(val / 1e6).toFixed(0)}M`;
                    if (Math.abs(val) >= 1e3) return `R$ ${(val / 1e3).toFixed(0)}k`;
                    return `R$ ${val}`;
                }
                if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
                if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}k`;
                return val;
            };

            // Botões de alternância de escopo: Estado (PE) vs Região de Desenvolvimento (RD)
            const configurarCabecalhoRanking = (rdNome = '') => {
                if (!domRank) return;
                const rdEfetiva = (rdNome && rdNome !== '-')
                    ? rdNome
                    : ((typeof $ !== 'undefined' && $('#ficha_rd_subtitle').text().trim()) || '');

                const cardContainer = domRank.closest('.card-body') || domRank.closest('.card') || domRank.parentElement;
                if (!cardContainer) return;

                let tituloEl = cardContainer.querySelector('#modal_mun_ranking_titulo_txt');
                if (!tituloEl) {
                    const candidatos = Array.from(cardContainer.querySelectorAll('h1, h2, h3, h4, h5, h6, div, span, p'))
                        .filter(el => el !== domRank && !domRank.contains(el) && el.children.length <= 2);

                    tituloEl = candidatos.find(el => {
                        const txt = (el.textContent || '').trim();
                        return txt.includes('Ranking Estadual') || txt.includes('Ranking Nacional') || txt.includes('Comparativo');
                    });
                }

                let headerFlex = cardContainer.querySelector('#modal_mun_ranking_header_flex');
                if (!headerFlex) {
                    headerFlex = document.createElement('div');
                    headerFlex.id = 'modal_mun_ranking_header_flex';
                    headerFlex.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; width: 100%;';

                    if (tituloEl && tituloEl.parentNode) {
                        tituloEl.id = 'modal_mun_ranking_titulo_txt';
                        tituloEl.style.marginBottom = '0';
                        tituloEl.parentNode.insertBefore(headerFlex, tituloEl);
                        headerFlex.appendChild(tituloEl);
                    } else {
                        tituloEl = document.createElement('div');
                        tituloEl.id = 'modal_mun_ranking_titulo_txt';
                        tituloEl.style.cssText = 'font-weight: 700; font-size: 0.85rem; color: #334155;';
                        headerFlex.appendChild(tituloEl);
                        domRank.parentNode.insertBefore(headerFlex, domRank);
                    }
                }

                let btnGroup = headerFlex.querySelector('#modal_mun_ranking_toggle_escopo');
                if (!btnGroup) {
                    btnGroup = document.createElement('div');
                    btnGroup.id = 'modal_mun_ranking_toggle_escopo';
                    btnGroup.style.cssText = 'display: inline-flex; align-items: center; border-radius: 8px; overflow: hidden; border: 1px solid #1a3c6e; flex-shrink: 0; z-index: 5;';
                    btnGroup.innerHTML = `
                        <button type="button" data-escopo="PE" style="border: none; padding: 3px 10px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.15s;">
                            <i class="fas fa-map me-1"></i>PE
                        </button>
                        <button type="button" data-escopo="RD" style="border: none; border-left: 1px solid #1a3c6e; padding: 3px 10px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.15s;">
                            <i class="fas fa-layer-group me-1"></i>RD
                        </button>
                    `;
                    headerFlex.appendChild(btnGroup);
                }

                const btnPE = btnGroup.querySelector('[data-escopo="PE"]');
                const btnRD = btnGroup.querySelector('[data-escopo="RD"]');

                if (btnRD) {
                    if (rdEfetiva && rdEfetiva !== '-') {
                        btnRD.style.display = 'inline-flex';
                        btnRD.style.alignItems = 'center';
                        btnRD.title = `Comparar entre municípios da RD ${rdEfetiva}`;
                        btnRD.innerHTML = `<i class="fas fa-layer-group me-1"></i>RD ${rdEfetiva}`;
                    } else {
                        btnRD.style.display = 'none';
                    }
                }

                const atualizarEstiloBotoes = () => {
                    if (btnPE) {
                        btnPE.style.backgroundColor = escopoComparativo === 'PE' ? '#1a3c6e' : '#ffffff';
                        btnPE.style.color = escopoComparativo === 'PE' ? '#ffffff' : '#1a3c6e';
                    }
                    if (btnRD) {
                        btnRD.style.backgroundColor = escopoComparativo === 'RD' ? '#1a3c6e' : '#ffffff';
                        btnRD.style.color = escopoComparativo === 'RD' ? '#ffffff' : '#1a3c6e';
                    }
                    if (tituloEl) {
                        tituloEl.innerHTML = (escopoComparativo === 'RD' && rdEfetiva && rdEfetiva !== '-')
                            ? `<i class="fas fa-layer-group text-primary me-1"></i> Ranking na RD ${rdEfetiva}`
                            : `<i class="fas fa-trophy text-warning me-1"></i> Ranking Estadual`;
                    }
                };

                atualizarEstiloBotoes();

                btnGroup.querySelectorAll('button').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        const novoEscopo = btn.getAttribute('data-escopo');
                        if (novoEscopo === escopoComparativo) return;
                        escopoComparativo = novoEscopo;
                        atualizarEstiloBotoes();
                        atualizarRankingEStorytellingMun(pontoAtualSelecionado);
                    };
                });
            };

            if (domRank && typeof echarts !== 'undefined') {
                if (window.chartModalMunRanking) {
                    try { window.chartModalMunRanking.dispose(); } catch (e) {}
                }
                window.chartModalMunRanking = echarts.init(domRank);
            }

            // Atualiza gráfico de ranking (PE ou RD) e Diagnóstico Executivo
            const atualizarRankingEStorytellingMun = async (pontoRef) => {
                pontoAtualSelecionado = pontoRef;
                const boxStory = document.getElementById(refs.storyId);
                if (!window.chartModalMunRanking) return;

                const anoTarget = pontoRef ? pontoRef.ano : anoInicial;
                const { dataMapa, lista: todosMunsBase } = await carregarListaMunsAno(anoTarget);

                if (!todosMunsBase.length) {
                    window.chartModalMunRanking.clear();
                    if (boxStory) {
                        boxStory.innerHTML = `<div class="text-slate-500 italic">Série histórica em consolidação para este município.</div>`;
                    }
                    return;
                }

                const periodoLabel = pontoRef ? pontoRef.labelCompleto : String((dataMapa && dataMapa.ano) || '');
                const munAlvoNorm = normUpper(mun);

                const todosMuns = todosMunsBase.map(m => {
                    if (normUpper(m.municipio) === munAlvoNorm && pontoRef && pontoRef.valor !== null && pontoRef.valor !== undefined) {
                        return { ...m, valor: Number(pontoRef.valor) };
                    }
                    return { ...m };
                });

                todosMuns.sort((a, b) => b.valor - a.valor);
                todosMuns.forEach((m, idx) => { m.rankPE = idx + 1; });

                const idxAlvoPE = todosMuns.findIndex(m => normUpper(m.municipio) === munAlvoNorm);
                const itemAlvo = idxAlvoPE !== -1 ? todosMuns[idxAlvoPE] : null;
                const rdNome = itemAlvo ? (itemAlvo.rd || '') : '';

                const munsDaRD = rdNome
                    ? todosMuns.filter(m => normUpper(m.rd) === normUpper(rdNome))
                    : [];
                munsDaRD.sort((a, b) => b.valor - a.valor);
                munsDaRD.forEach((m, idx) => { m.rankRD = idx + 1; });
                const rankRdCalc = itemAlvo ? (itemAlvo.rankRD || 0) : 0;
                const totalMunsRD = munsDaRD.length;

                configurarCabecalhoRanking(rdNome);

                const listaEscopo = (escopoComparativo === 'RD' && munsDaRD.length > 0) ? munsDaRD : todosMuns;
                const idxAlvoEscopo = listaEscopo.findIndex(m => normUpper(m.municipio) === munAlvoNorm);

                const rankingArr = listaEscopo.slice(0, 15).map(m => ({
                    nome: m.municipio,
                    rank: escopoComparativo === 'RD' ? m.rankRD : m.rankPE,
                    valor: m.valor,
                    isAlvo: normUpper(m.municipio) === munAlvoNorm,
                    isBenchmark: false
                }));

                if (itemAlvo && idxAlvoEscopo >= 15) {
                    rankingArr.push({
                        nome: itemAlvo.municipio,
                        rank: escopoComparativo === 'RD' ? itemAlvo.rankRD : itemAlvo.rankPE,
                        valor: itemAlvo.valor,
                        isAlvo: true,
                        isBenchmark: false
                    });
                }

                rankingArr.sort((a, b) => b.valor - a.valor);

                const dadosReversos = [...rankingArr].reverse();
                const categorias = dadosReversos.map(d => d.nome);
                const valores = dadosReversos.map(d => ({
                    value: d.valor,
                    rankPos: d.rank,
                    itemStyle: {
                        color: d.isAlvo ? '#1a3c6e' : (d.isBenchmark ? '#F39C12' : '#BDC3C7'),
                        borderRadius: [0, 4, 4, 0]
                    }
                }));

                const sufixoEscopoTooltip = (escopoComparativo === 'RD' && rdNome) ? `na RD ${rdNome}` : 'em PE';

                window.chartModalMunRanking.setOption({
                    animation: true,
                    animationDuration: 550,
                    animationEasing: 'cubicOut',
                    animationDurationUpdate: 600,
                    animationEasingUpdate: 'cubicOut',
                    title: periodoLabel ? {
                        text: `Referência: ${periodoLabel}`,
                        right: '4%',
                        top: 0,
                        textStyle: { fontSize: 11, fontWeight: 'bold', color: '#475569' }
                    } : undefined,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        formatter: function (params) {
                            const item = params[0];
                            const vFmt = formatarValModal(Number(item.value));
                            const perStr = periodoLabel ? ` (${periodoLabel})` : '';
                            const rankInfo = item.data && item.data.rankPos ? ` &bull; ${item.data.rankPos}º ${sufixoEscopoTooltip}` : '';
                            return `<strong>${item.name}${perStr}</strong>${rankInfo}<br/>${nomeExib}: <strong>${vFmt}</strong>`;
                        }
                    },
                    grid: { left: '3%', right: '8%', bottom: '5%', top: periodoLabel ? '10%' : '5%', containLabel: true },
                    xAxis: {
                        type: 'value',
                        axisLabel: { formatter: formatarEixoX }
                    },
                    yAxis: {
                        type: 'category',
                        data: categorias,
                        axisLabel: { fontSize: 11, fontWeight: 'bold' }
                    },
                    series: [{
                        id: 'ranking_barras_mun',
                        type: 'bar',
                        data: valores,
                        barMaxWidth: 16,
                        universalTransition: true
                    }]
                }, { notMerge: true });

                if (boxStory) {
                    const idxPonto = pontoRef
                        ? serieRows.findIndex(r => r.sortKey === pontoRef.sortKey)
                        : serieRows.length - 1;

                    const valRef = itemAlvo ? itemAlvo.valor : (pontoRef ? pontoRef.valor : null);
                    const labelRef = periodoLabel || '-';

                    let textoVar = '';
                    if (idxPonto >= 1 && valRef !== null) {
                        const antPonto = serieRows[idxPonto - 1];
                        if (antPonto && antPonto.valor !== null && antPonto.valor !== 0) {
                            const varPct = ((valRef - antPonto.valor) / Math.abs(antPonto.valor)) * 100;
                            const sinal = varPct >= 0 ? '+' : '';
                            const bomQuandoSobe = !isLowerBetter;
                            const ehFavoravel = bomQuandoSobe ? varPct >= 0 : varPct <= 0;
                            const cor = ehFavoravel ? '#10B981' : '#EF4444';
                            textoVar = ` Em relação a <strong>${antPonto.labelCompleto}</strong> (${formatarValModal(antPonto.valor)}), registrou variação de <strong style="color: ${cor};">${sinal}${varPct.toFixed(1)}%</strong>.`;
                        }
                    }

                    let textoRank = '';
                    if (itemAlvo && itemAlvo.rankPE > 0) {
                        const infoRD = (rankRdCalc > 0 && rdNome)
                            ? ` e ocupa a <strong>${rankRdCalc}ª posição</strong> entre os ${totalMunsRD} municípios da <strong>RD ${rdNome}</strong>`
                            : '';
                        textoRank = ` No ranking estadual, <strong>${mun}</strong> posiciona-se no <strong>${itemAlvo.rankPE}º lugar</strong> entre os ${todosMuns.length} municípios de Pernambuco${infoRD}.`;
                    }

                    let refTexto = '';
                    const refObj = (meta && typeof meta.referencia_analise === 'object') ? meta.referencia_analise : {};
                    const textoInterpretacao = refObj.interpretacao || meta.interpretacao || '';
                    if (textoInterpretacao) {
                        refTexto = `<div class="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100"><i class="fas fa-lightbulb text-amber-500 me-1"></i><strong>Interpretação Estratégica:</strong> ${textoInterpretacao}</div>`;
                    }

                    const siglasSaude = ['pre_natal', 'razao_mm', 'tx_att', 'tx_dcnt', 'tx_evitaveis', 'tx_infancia', 'tx_infantil'];
                    const siglasSeguranca = ['mvi', 'tx_mvi', 'cvp', 'tx_cvp', 'feminicidio', 'tent_mvi', 'rfv', 'vcm_ameaca', 'vcm_lesao', 'vcm_vs'];
                    const subdimNorm = normStr(meta?.subdimensao || meta?.grupo || '');

                    const isIndicadorSaude = siglasSaude.includes(sNorm) || subdimNorm.includes('saude');
                    const isIndicadorSeguranca = siglasSeguranca.includes(sNorm) || subdimNorm.includes('seguranca');
                    const anoCorrenteStr = String(new Date().getFullYear());
                    const isAnoCorrenteParcial = (isIndicadorSaude || isIndicadorSeguranca) && String(labelRef).includes(anoCorrenteStr);

                    let avisoParcialModalHtml = '';
                    if (isAnoCorrenteParcial) {
                        const areaAviso = isIndicadorSaude ? 'Saúde' : 'Segurança Pública';
                        avisoParcialModalHtml = `
                            <div class="mt-2 p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-900">
                                <i class="fas fa-triangle-exclamation text-amber-600 me-1"></i>
                                <strong>Dados Parciais de ${areaAviso} (${anoCorrenteStr}):</strong> Os registros referentes ao ano corrente são preliminares e encontram-se em apuração contínua. Por se tratar de taxas e indicadores calculados ao longo do exercício, os valores sofrem ajustes mensais e só são consolidados definitivamente após o encerramento anual das bases oficiais.
                            </div>
                        `;
                    }

                    const isUltimoPeriodo = idxPonto === serieRows.length - 1;
                    const prefixoPeriodo = isUltimoPeriodo
                        ? `No período mais recente disponível (<strong>${labelRef}</strong>)`
                        : `No período selecionado (<strong>${labelRef}</strong>)`;

                    const dicaInterativa = serieRows.length > 1
                        ? `<div class="mt-1.5 text-[11px] text-slate-400"><i class="fas fa-mouse-pointer text-primary me-1"></i> <em>Dica: clique em qualquer ponto no gráfico da série histórica para comparar outro ano ou alterne entre PE e RD acima.</em></div>`
                        : '';

                    boxStory.innerHTML = `
                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1.5">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-pill text-xs">DIAGNÓSTICO EXECUTIVO</span>
                                <span class="badge bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded-pill text-[11px]">Indicador Municipal</span>
                                ${rankRdCalc > 0 && rdNome ? `<span class="badge bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-pill text-[11px]"><i class="fas fa-layer-group me-1"></i>${rankRdCalc}º na RD ${rdNome}</span>` : ''}
                            </div>
                            <span class="text-xs text-slate-500 font-semibold">${mun} &bull; Ano-base ${labelRef}</span>
                        </div>
                        <p class="mb-0 text-slate-700 leading-relaxed text-sm">
                            ${prefixoPeriodo}, o indicador <strong>${nomeExib}</strong> de <strong>${mun}</strong> atingiu a marca de <strong>${valRef !== null ? formatarValModal(valRef) : '-'}</strong>.${textoVar}${textoRank}
                        </p>
                        ${refTexto}
                        ${avisoParcialModalHtml}
                        ${dicaInterativa}
                    `;
                }
            };

            // 3. Renderiza Gráfico de Linha da Série Histórica Municipal
            const domSerie = document.getElementById(refs.serieDomId);
            if (domSerie && typeof echarts !== 'undefined') {
                if (window.chartModalMunSerie) {
                    try { window.chartModalMunSerie.dispose(); } catch (e) {}
                }
                window.chartModalMunSerie = echarts.init(domSerie);

                if (serieRows.length === 0) {
                    window.chartModalMunSerie.clear();
                } else {
                    const categorias = serieRows.map(r => r.label);
                    const valores = serieRows.map(r => r.valor);
                    const isMensal = serieRows.some(r => r.isMensal);
                    let idxSelecionado = categorias.length - 1;

                    const montarDadosSerie = (idxAtivo) => {
                        return valores.map((v, idx) => {
                            if (idx === idxAtivo) {
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

                    window.chartModalMunSerie.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                const item = params[0];
                                const idx = item.dataIndex;
                                const tituloPeriodo = serieRows[idx] ? serieRows[idx].labelCompleto : item.name;
                                const vFmt = formatarValModal(Number(item.value));
                                const dicaClique = `<br/><span style="font-size:11px;color:#64748b;"><i class="fas fa-hand-pointer"></i> Clique para destacar este ${isMensal ? 'mês' : 'ano'}</span>`;
                                return `<strong>${mun} (${tituloPeriodo})</strong><br/>${nomeExib}: <strong>${vFmt}</strong>${dicaClique}`;
                            }
                        },
                        grid: { left: '3%', right: '4%', bottom: isMensal ? '14%' : '8%', top: '15%', containLabel: true },
                        xAxis: {
                            type: 'category',
                            data: categorias,
                            boundaryGap: serieRows.length === 1,
                            axisLabel: {
                                interval: isMensal ? 'auto' : 0,
                                rotate: isMensal ? 30 : 0,
                                fontSize: 11
                            }
                        },
                        yAxis: {
                            type: 'value',
                            scale: true,
                            axisLabel: { formatter: formatarEixoX }
                        },
                        series: [{
                            name: nomeExib,
                            type: 'line',
                            data: montarDadosSerie(idxSelecionado),
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: isMensal ? 6 : 8,
                            lineStyle: { width: 3, color: cfgAuto.color },
                            itemStyle: { color: cfgAuto.color },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: cfgAuto.color + '66' },
                                    { offset: 1, color: cfgAuto.color + '05' }
                                ])
                            }
                        }]
                    });

                    window.chartModalMunSerie.resize();

                    window.chartModalMunSerie.off('click');
                    window.chartModalMunSerie.on('click', function (params) {
                        const idx = params.dataIndex;
                        const ponto = serieRows[idx];
                        if (!ponto) return;

                        idxSelecionado = idx;
                        window.chartModalMunSerie.setOption({
                            series: [{ data: montarDadosSerie(idxSelecionado) }]
                        });

                        atualizarRankingEStorytellingMun(ponto);
                    });
                }
            }

            // 4. Renderização inicial com o período mais recente
            const ultimoPonto = serieRows.length > 0 ? serieRows[serieRows.length - 1] : null;
            await atualizarRankingEStorytellingMun(ultimoPonto);
            if (window.chartModalMunRanking) window.chartModalMunRanking.resize();
        } catch (errRender) {
            console.error('[Modal Mun] Erro ao renderizar gráficos:', errRender);
            const boxStory = document.getElementById(refs.storyId);
            if (boxStory) {
                boxStory.innerHTML = `<span class="text-danger">Não foi possível carregar o comparativo para <strong>${nomeExib}</strong>.</span>`;
            }
        }
    }

    // Responsividade automática dos gráficos do modal
    window.addEventListener('resize', function () {
        if (window.chartModalMunSerie) window.chartModalMunSerie.resize();
        if (window.chartModalMunRanking) window.chartModalMunRanking.resize();
    });

})(window, document);