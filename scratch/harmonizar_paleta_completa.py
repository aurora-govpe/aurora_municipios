# -*- coding: utf-8 -*-
import re

print("--- Harmonizacao Visual Completa - Paleta Aurora ---")

# =========================================================================
# 1. ATUALIZAR www/js/ficha.js
# =========================================================================
with open('www/js/ficha.js', 'r', encoding='utf-8') as f:
    ficha = f.read()

# Substituir cor do alvo no modal de série histórica de azul escuro para Laranja Aurora
ficha = ficha.replace("lineStyle: { width: 3.5, color: '#0C2856' }", "lineStyle: { width: 3.5, color: '#ff5a26' }")
ficha = ficha.replace("itemStyle: { color: '#0C2856' }", "itemStyle: { color: '#ff5a26' }")
ficha = ficha.replace("const cor = isAlvo ? '#0C2856' : '#94A3B8';", "const cor = isAlvo ? '#ff5a26' : '#cbd5e1';")

# Substituir cor de referência (REF: ...) nos rodapés dos micro-KPIs
ficha = ficha.replace("color: #0C2856; font-weight: 800;", "color: #c2410c; font-weight: 800;")
ficha = ficha.replace('color: #0C2856;', 'color: #c2410c;')

# Gráfico de barras de iniciativas por secretaria
ficha = ficha.replace("itemStyle: { color: '#0066FF'", "itemStyle: { color: '#ff5a26'")

# Contorno do mapa de município
ficha = ficha.replace("'line-color': '#0C2856'", "'line-color': '#ff5a26'")

# Setas indicativas
ficha = ficha.replace('style="color: #0C2856; font-size: 0.65rem;"', 'style="color: #ff5a26; font-size: 0.65rem;"')

with open('www/js/ficha.js', 'w', encoding='utf-8') as f:
    f.write(ficha)
print("1. www/js/ficha.js harmonizado!")

# =========================================================================
# 2. ATUALIZAR www/js/regioes.js
# =========================================================================
with open('www/js/regioes.js', 'r', encoding='utf-8') as f:
    reg = f.read()

# Substituir cor de destaque da RD selecionada
reg = reg.replace("style=\"color:#0C2856; font-weight:800;\"", "style=\"color:#c2410c; font-weight:800;\"")
reg = reg.replace("style=\"background:#0C2856; color:#fff;", "style=\"background:#ff5a26; color:#fff;")
reg = reg.replace("['boolean', ['get', 'pertence_rd'], false], '#0C2856',", "['boolean', ['get', 'pertence_rd'], false], '#ff5a26',")
reg = reg.replace("] : '#0C2856',", "] : '#ff5a26',")
reg = reg.replace("color: '#0C2856'", "color: '#ff5a26'")
reg = reg.replace("color: #0C2856;", "color: #1c1917;")

with open('www/js/regioes.js', 'w', encoding='utf-8') as f:
    f.write(reg)
print("2. www/js/regioes.js harmonizado!")

# =========================================================================
# 3. ATUALIZAR www/css/core.css
# =========================================================================
with open('www/css/core.css', 'r', encoding='utf-8') as f:
    core = f.read()

# Trocar hover de linhas de tabela de azul (#D6EAF8) para creme Aurora suave (#fff7ed)
core = core.replace("table.dataTable tbody tr:hover {\n  background-color: #D6EAF8 !important;\n}", "table.dataTable tbody tr:hover {\n  background-color: #fff7ed !important;\n}")
core = core.replace("table.dataTable tbody tr:hover {\r\n  background-color: #D6EAF8 !important;\r\n}", "table.dataTable tbody tr:hover {\r\n  background-color: #fff7ed !important;\r\n}")

# Trocar ícones de KPI card padronizados para Laranja Aurora
core = core.replace("color: #0284c7 !important;", "color: #ea580c !important;")
core = core.replace("background-color: #f1f5f9 !important;\n  color: #ea580c !important;", "background-color: #fff7ed !important;\n  color: #ea580c !important;")
core = core.replace("background-color: #f1f5f9 !important;\r\n  color: #ea580c !important;", "background-color: #fff7ed !important;\r\n  color: #ea580c !important;")

with open('www/css/core.css', 'w', encoding='utf-8') as f:
    f.write(core)
print("3. www/css/core.css harmonizado!")

# =========================================================================
# 4. ATUALIZAR ui_modules/ui_landing.R
# =========================================================================
with open('ui_modules/ui_landing.R', 'r', encoding='utf-8') as f:
    landing = f.read()

# Card do Assistente IA Aurora: mudar de azul para preto/carvão sofisticado Aurora
landing = landing.replace(
    'class = "bg-gradient-to-br from-[#0C2856] to-[#153e7e] rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-white"',
    'class = "rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-white",\n            style = "background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #431407 100%); border: 1px solid rgba(255, 90, 38, 0.25);"'
)
landing = landing.replace(
    'class = "w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center text-xl mb-4 border border-white/20"',
    'class = "w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center text-xl mb-4 border border-white/20"'
)
landing = landing.replace(
    'class = "badge bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1"',
    'class = "badge bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1"'
)
landing = landing.replace(
    'class = "text-blue-100 text-sm leading-relaxed mb-4"',
    'class = "text-stone-300 text-sm leading-relaxed mb-4"'
)

# Ícone do card Regiões na Landing
landing = landing.replace(
    'class = "w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center text-xl mb-4"',
    'class = "w-12 h-12 rounded-2xl bg-orange-100 text-[#ff5a26] flex items-center justify-center text-xl mb-4"'
)
landing = landing.replace(
    'class = "badge bg-blue-50 text-blue-700 border border-blue-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1"',
    'class = "badge bg-orange-50 text-orange-800 border border-orange-200 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1"'
)

with open('ui_modules/ui_landing.R', 'w', encoding='utf-8') as f:
    f.write(landing)
print("4. ui_modules/ui_landing.R harmonizado!")

# =========================================================================
# 5. ATUALIZAR ui_modules/ui_regioes.R
# =========================================================================
with open('ui_modules/ui_regioes.R', 'r', encoding='utf-8') as f:
    reg_ui = f.read()

# Substituir cores antigas azul/marinho nos cards de macro-KPI da RD
reg_ui = reg_ui.replace('border-left-color: #0C2856;', 'border-left-color: #ff5a26;')
reg_ui = reg_ui.replace('color: #0C2856;', 'color: #ff5a26;')
reg_ui = reg_ui.replace('border-left-color: #3498DB;', 'border-left-color: #f59e0b;')
reg_ui = reg_ui.replace('color: #3498DB;', 'color: #f59e0b;')

with open('ui_modules/ui_regioes.R', 'w', encoding='utf-8') as f:
    f.write(reg_ui)
print("5. ui_modules/ui_regioes.R harmonizado!")

# =========================================================================
# 6. ATUALIZAR ui_modules/ui_ficha.R
# =========================================================================
with open('ui_modules/ui_ficha.R', 'r', encoding='utf-8') as f:
    fich_ui = f.read()

# Badge de topo do módulo de municípios
fich_ui = fich_ui.replace(
    'class = "badge bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-pill px-3 py-1",\n            tags$i(class = "fas fa-compass me-1 text-blue-500"), "Módulo de Municípios"',
    'class = "badge bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold rounded-pill px-3 py-1",\n            tags$i(class = "fas fa-compass me-1 text-[#ff5a26]"), "Módulo de Municípios"'
)
fich_ui = fich_ui.replace(
    'class = "badge bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-pill px-3 py-1",\r\n            tags$i(class = "fas fa-compass me-1 text-blue-500"), "Módulo de Municípios"',
    'class = "badge bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold rounded-pill px-3 py-1",\r\n            tags$i(class = "fas fa-compass me-1 text-[#ff5a26]"), "Módulo de Municípios"'
)

# Badge de topo da subaba Comparativo Municipal
fich_ui = fich_ui.replace(
    'class = "badge bg-blue-100 text-blue-900 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block",\n                          tags$i(class = "fas fa-code-compare me-1 text-blue-600"),',
    'class = "badge bg-orange-100 text-orange-950 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block",\n                          tags$i(class = "fas fa-code-compare me-1 text-[#ff5a26]"),'
)
fich_ui = fich_ui.replace(
    'class = "badge bg-blue-100 text-blue-900 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block",\r\n                          tags$i(class = "fas fa-code-compare me-1 text-blue-600"),',
    'class = "badge bg-orange-100 text-orange-950 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block",\r\n                          tags$i(class = "fas fa-code-compare me-1 text-[#ff5a26]"),'
)

with open('ui_modules/ui_ficha.R', 'w', encoding='utf-8') as f:
    f.write(fich_ui)
print("6. ui_modules/ui_ficha.R harmonizado!")

print("--- Harmonizacao Visual Concluida com Sucesso! ---")
