# -*- coding: utf-8 -*-
import re

print("--- Iniciando Atualizacao Aurora ---")

# =========================================================================
# 1. ATUALIZAR build_ui.R
# =========================================================================
with open('build_ui.R', 'r', encoding='utf-8') as f:
    bui = f.read()

# Substituir a logo da robô para o símbolo oficial do Aurora (aurora_simbolo.svg)
bui = bui.replace('tags$img(src = "images/aurora.png"', 'tags$img(src = "images/aurora_simbolo.svg"')

# Remover o botão do Hub Digital da navbar
padrao_hub = re.compile(
    r'tags\$a\(\s*href\s*=\s*"https://digital\.seplag\.pe\.gov\.br/".*?tags\$i\(class\s*=\s*"fas fa-external-link-alt text-\[9px\] text-amber-500"\)\s*\),\s*',
    re.DOTALL
)
bui = padrao_hub.sub('', bui)

with open('build_ui.R', 'w', encoding='utf-8') as f:
    f.write(bui)
print("1. build_ui.R atualizado!")

# =========================================================================
# 2. ATUALIZAR ui_modules/ui_landing.R
# =========================================================================
with open('ui_modules/ui_landing.R', 'r', encoding='utf-8') as f:
    land = f.read()

# A. Trocar background do Hero Banner de azul para Laranja Aurora
land = land.replace(
    'style = "background: linear-gradient(135deg, #0C2856 0%, #153e7e 60%, #081c3d 100%); border: 1px solid rgba(255, 255, 255, 0.12);"',
    'style = "background: linear-gradient(135deg, #ff5a26 0%, #ea580c 55%, #c2410c 100%); border: 1px solid rgba(255, 255, 255, 0.25); box-shadow: 0 16px 36px -8px rgba(255, 90, 38, 0.35);"'
)

# B. Elemento decorativo de fundo: radial âmbar/laranja
land = land.replace(
    'style = "background: radial-gradient(circle, #00B7FF 0%, transparent 70%); filter: blur(25px);"',
    'style = "background: radial-gradient(circle, #fbbf24 0%, transparent 70%); filter: blur(30px); opacity: 0.18;"'
)

# C. Badge SEPLAG no topo do hero: tirar o azul e harmonizar
land = land.replace(
    'class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-blue-200 shadow-sm",\n              style = "background: rgba(0, 183, 255, 0.15); border: 1px solid rgba(0, 183, 255, 0.3);",\n              tags$i(class = "fas fa-shield-halved me-1.5 text-blue-300"),',
    'class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-white shadow-sm",\n              style = "background: rgba(0, 0, 0, 0.22); border: 1px solid rgba(255, 255, 255, 0.25);",\n              tags$i(class = "fas fa-shield-halved me-1.5 text-amber-200"),'
)
# Variante CRLF para garantir:
land = land.replace(
    'text-blue-200 shadow-sm",\r\n              style = "background: rgba(0, 183, 255, 0.15); border: 1px solid rgba(0, 183, 255, 0.3);",\r\n              tags$i(class = "fas fa-shield-halved me-1.5 text-blue-300"),',
    'text-white shadow-sm",\r\n              style = "background: rgba(0, 0, 0, 0.22); border: 1px solid rgba(255, 255, 255, 0.25);",\r\n              tags$i(class = "fas fa-shield-halved me-1.5 text-amber-200"),'
)

# D. Botão do Hub Digital no Hero: fundo branco de alto destaque sobre o banner laranja
land = land.replace(
    'style = "background: linear-gradient(135deg, #ff5a26 0%, #e04010 100%); border: 1px solid rgba(255, 255, 255, 0.35); box-shadow: 0 4px 14px rgba(255, 90, 38, 0.45); text-decoration: none;"',
    'style = "background: #ffffff; color: #c2410c; border: 1px solid #ffffff; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15); text-decoration: none;"'
)
land = land.replace('class = "btn btn-sm rounded-pill px-4 py-2 font-black text-xs text-white d-inline-flex', 'class = "btn btn-sm rounded-pill px-4 py-2 font-black text-xs text-orange-950 d-inline-flex')
land = land.replace('tags$i(class = "fas fa-arrow-left"),', 'tags$i(class = "fas fa-arrow-left text-[#ff5a26]"),')
land = land.replace('tags$i(class = "fas fa-external-link-alt text-[10px] opacity-80 ms-0.5")', 'tags$i(class = "fas fa-external-link-alt text-[10px] text-amber-600 opacity-90 ms-0.5")')

# E. Texto do Hero: tirar text-blue-100 para text-white
land = land.replace('class = "text-sm md:text-base text-blue-100 max-w-3xl leading-relaxed mb-0 font-medium"', 'class = "text-sm md:text-base text-white max-w-3xl leading-relaxed mb-0 font-medium"')

# F. Input de busca: tirar focus:ring-[#00B7FF]
land = land.replace('focus:ring-[#00B7FF]', 'focus:ring-[#ff5a26]')

# G. Texto "Acesso Rápido:": tirar text-blue-200
land = land.replace('class = "text-xs font-bold text-blue-200 uppercase tracking-wider me-1"', 'class = "text-xs font-bold text-white uppercase tracking-wider me-1 opacity-90"')

# H. Atualizar nomes dos programas nas descrições de Landing
land = land.replace('Pernambuco sem Fome (Cozinhas Comunitárias e Mães de PE), Águas de Pernambuco (Compesa e Adutoras) e Saúde Fiscal (CAPAG)', 'Superação da Pobreza, Segurança Alimentar e Proteção Social (Cozinhas e Mães de PE), Segurança Hídrica e Saneamento Básico (Compesa e Adutoras), Governança e Sustentabilidade Fiscal (CAPAG) e Conectividade Logística, Eixos Viários e Mobilidade Regional')
land = land.replace('Pernambuco sem Fome, a malha de adutoras e municípios atendidos pela Compesa e o diagnóstico fiscal', 'Superação da Pobreza e Segurança Alimentar, a malha de adutoras de Segurança Hídrica, os eixos de Conectividade Logística e a Sustentabilidade Fiscal dos municípios')

with open('ui_modules/ui_landing.R', 'w', encoding='utf-8') as f:
    f.write(land)
print("2. ui_modules/ui_landing.R atualizado!")

# =========================================================================
# 3. ATUALIZAR ui_modules/ui_tematicas.R
# =========================================================================
with open('ui_modules/ui_tematicas.R', 'r', encoding='utf-8') as f:
    tem = f.read()

# A. Botões de pauta no topo da aba Programas
tem = tem.replace(
    'tags$i(class = "fas fa-utensils me-1.5 text-amber-500"), "Pernambuco sem Fome"',
    'tags$i(class = "fas fa-utensils me-1.5 text-amber-500"), "Superação da Pobreza, Segurança Alimentar e Proteção Social"'
)
tem = tem.replace(
    'tags$i(class = "fas fa-droplet me-1.5 text-blue-500"), "Águas de Pernambuco"',
    'tags$i(class = "fas fa-droplet me-1.5 text-sky-500"), "Segurança Hídrica e Saneamento Básico"'
)
tem = tem.replace(
    'tags$i(class = "fas fa-building-columns me-1.5 text-purple-600"), "Capacidade de Pagamento"',
    'tags$i(class = "fas fa-building-columns me-1.5 text-purple-600"), "Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios"'
)
tem = tem.replace(
    'tags$i(class = "fas fa-road me-1.5 text-indigo-500"), "Estradas de PE"',
    'tags$i(class = "fas fa-road me-1.5 text-indigo-500"), "Conectividade Logística, Eixos Viários e Mobilidade Regional"'
)

# B. Títulos dos blocos internos
tem = tem.replace(
    'Pernambuco sem Fome — Cozinhas, Mães de Pernambuco & Cofinanciamento',
    'Superação da Pobreza, Segurança Alimentar e Proteção Social'
)
tem = tem.replace(
    'Águas de Pernambuco — Investimentos e Obras Estruturantes',
    'Segurança Hídrica e Saneamento Básico'
)
tem = tem.replace(
    'Capacidade de Pagamento dos Municípios (CAPAG)',
    'Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios'
)
tem = tem.replace(
    'Estradas de Pernambuco — Obras Rodoviárias e Conectividade Territorial',
    'Conectividade Logística, Eixos Viários e Mobilidade Regional'
)

with open('ui_modules/ui_tematicas.R', 'w', encoding='utf-8') as f:
    f.write(tem)
print("3. ui_modules/ui_tematicas.R atualizado!")

# =========================================================================
# 4. ATUALIZAR www/js/app.js
# =========================================================================
with open('www/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# A. Título do banner na aba Programas
app_js = app_js.replace(
    'A estratégia governamental de intervenção territorial opera de forma articulada em quatro grandes pilares: garantia de segurança alimentar com <strong>${funcCoz} cozinhas comunitárias</strong> e auxílio ao Mães de Pernambuco; segurança hídrica com <strong>${totalObrasAgua} obras</strong> sob investimento de <strong>${formataMoedaCompacta(invAgua)}</strong>; modernização da malha viária com <strong>${trechosObras} trechos rodoviários</strong> em recuperação; e sustentabilidade fiscal com <strong>${munsAptos} prefeituras aptas (${pctAptos}%)</strong> a captar recursos e acelerar o desenvolvimento local.',
    'A estratégia governamental de intervenção territorial opera de forma articulada em quatro grandes pilares: <strong>Superação da Pobreza, Segurança Alimentar e Proteção Social</strong> com ${funcCoz} cozinhas comunitárias e Mães de Pernambuco; <strong>Segurança Hídrica e Saneamento Básico</strong> com ${totalObrasAgua} obras sob investimento de ${formataMoedaCompacta(invAgua)}; <strong>Conectividade Logística, Eixos Viários e Mobilidade Regional</strong> com ${trechosObras} trechos rodoviários em recuperação; e <strong>Governança e Sustentabilidade Fiscal, Parcerias e Apoio aos Municípios</strong> com ${munsAptos} prefeituras aptas (${pctAptos}%) a captar recursos e acelerar o desenvolvimento local.'
)

# B. Nomes nos 4 cards
app_js = app_js.replace('<i class="fas fa-utensils text-amber-600 me-1.5"></i> PE sem Fome', '<i class="fas fa-utensils text-amber-600 me-1.5"></i> Superação da Pobreza')
app_js = app_js.replace('<i class="fas fa-droplet text-sky-600 me-1.5"></i> Águas de PE', '<i class="fas fa-droplet text-sky-600 me-1.5"></i> Segurança Hídrica')
app_js = app_js.replace('<i class="fas fa-road text-indigo-600 me-1.5"></i> Estradas de PE', '<i class="fas fa-road text-indigo-600 me-1.5"></i> Conectividade Logística')
app_js = app_js.replace('<i class="fas fa-building-columns text-purple-600 me-1.5"></i> Saúde Fiscal', '<i class="fas fa-building-columns text-purple-600 me-1.5"></i> Sustentabilidade Fiscal')

with open('www/js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
print("4. www/js/app.js atualizado!")

# =========================================================================
# 5. ATUALIZAR www/js/ficha.js
# =========================================================================
with open('www/js/ficha.js', 'r', encoding='utf-8') as f:
    ficha_js = f.read()

ficha_js = ficha_js.replace('Pernambuco sem Fome — Cozinhas, Mães de Pernambuco', 'Superação da Pobreza, Segurança Alimentar e Proteção Social')
ficha_js = ficha_js.replace('Águas de Pernambuco — Investimentos e Obras', 'Segurança Hídrica e Saneamento Básico')
ficha_js = ficha_js.replace('Estradas de Pernambuco — Obras Rodoviárias', 'Conectividade Logística, Eixos Viários e Mobilidade Regional')

with open('www/js/ficha.js', 'w', encoding='utf-8') as f:
    f.write(ficha_js)
print("5. www/js/ficha.js atualizado!")

print("--- Todas as atualizacoes nos fontes concluidas com sucesso! ---")
