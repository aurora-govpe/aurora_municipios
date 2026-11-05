import os
import re

print("=== INICIANDO HARMONIZAÇÃO VISUAL AURORA ===")

base_dir = r"C:\Users\hugo.vasconcelos\Documents\projetos\aurora\aurora_municipios"

# =========================================================================
# 1. ATUALIZAR build_ui.R (Navbar com SVG Aurora idêntico ao Ruscker, Chat Aurora Dark/Orange)
# =========================================================================
build_ui_path = os.path.join(base_dir, "build_ui.R")
with open(build_ui_path, "r", encoding="utf-8") as f:
    content_build = f.read()

# Substituir o bloco da logo na Topbar
svg_ruscker_bloco = '''      tags$div(
        class = "d-flex align-items-center gap-2.5 cursor-pointer select-none",
        onclick = "window.mudarAbaAurora('Início', null)",
        title = "Ir para o Início",
        tags$div(
          class = "rounded-full d-flex align-items-center justify-content-center shadow-xs flex-shrink-0",
          style = "width: 38px; height: 38px; background: linear-gradient(135deg, #f59e0b, #ff5a26); padding: 6px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,0,0,0.15);",
          tags$div(
            style = "width: 100%; height: 100%;",
            HTML('<svg viewBox="0 0 100 100" style="width: 100%; height: 100%; fill: #231b18;"><circle cx="50" cy="45" r="28" fill="#ffaa00" /><path d="M50 8 L50 2M22 22 L17 17M8 50 L2 50M78 22 L83 17M92 50 L98 50" stroke="#ffaa00" stroke-width="4" stroke-linecap="round"/><path d="M10 75 Q 35 60, 60 75 T 100 70 L 100 90 Z" fill="#231b18"/><path d="M28 75 V 52 Q 28 50 30 50 Q 32 50 32 52 V 75 M25 60 H 35 M25 60 V 55 M35 60 V 57" stroke="#231b18" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M72 75 V 46 Q 72 44 74 44 Q 76 44 76 46 V 75 M68 56 H 80 M68 56 V 51 M80 56 V 53" stroke="#231b18" stroke-width="3" stroke-linecap="round" fill="none"/></svg>')
          )
        ),
        tags$div(
          class = "d-none d-md-flex flex-column justify-content-center",
          tags$div(
            class = "d-flex align-items-center leading-none",
            tags$span(class = "fw-black text-slate-900 tracking-tight", style = "font-size: 1.15rem; letter-spacing: -0.3px;", "Plataforma"),
            tags$span(class = "fw-black ms-1.5 tracking-tight", style = "font-size: 1.15rem; letter-spacing: -0.3px; color: #ff5a26;", "Aurora")
          ),
          tags$span(class = "font-black text-slate-500 uppercase", style = "font-size: 0.62rem; letter-spacing: 0.12em; margin-top: 2px;", "INTELIGÊNCIA GOVERNAMENTAL")
        )
      ),'''

# Procurar o bloco tags$div( class = "d-flex align-items-center gap-2.5 cursor-pointer select-none", ... até tags$div(class = "d-none d-md-block vr
pattern_logo = re.compile(r'tags\$div\(\s*class = "d-flex align-items-center gap-2\.5 cursor-pointer select-none".*?tags\$span\(class = "font-black text-slate-500 uppercase"[^\)]*\)\s*\)\s*\),', re.DOTALL)
if pattern_logo.search(content_build):
    content_build = pattern_logo.sub(svg_ruscker_bloco, content_build)
    print("-> build_ui.R: Logo da Topbar substituída pelo SVG oficial com sucesso.")
else:
    print("!! build_ui.R: Bloco da logo não encontrado via regex.")

# Ajustar Chat Widget e Chat Button para o tema Aurora
content_build = content_build.replace('class = "bg-[#0C2856] text-white p-3 px-4 flex justify-between items-center flex-shrink-0"', 'class = "text-white p-3 px-4 flex justify-between items-center flex-shrink-0" style = "background: linear-gradient(135deg, #1c1917 0%, #292524 60%, #431407 100%); border-bottom: 2px solid #ff5a26;"')
content_build = content_build.replace('focus:border-[#00B7FF]', 'focus:border-[#ff5a26]')
content_build = content_build.replace('class = "bg-[#00B7FF] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#0066FF] transition-colors flex-shrink-0"', 'class = "bg-[#ff5a26] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e04010] shadow-sm transition-all flex-shrink-0"')
content_build = content_build.replace('class = "fixed bottom-6 right-6 w-14 h-14 bg-[#0C2856] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0066FF] transition-all z-[9998]"', 'class = "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all z-[9998] hover:scale-105" style = "background: linear-gradient(135deg, #ff5a26 0%, #ea580c 100%); box-shadow: 0 8px 24px rgba(255, 90, 38, 0.45); border: 2px solid #ffffff;"')
content_build = content_build.replace('border-2 border-[#0C2856]', 'border-0')

with open(build_ui_path, "w", encoding="utf-8") as f:
    f.write(content_build)
print("-> build_ui.R salvo com sucesso.")


# =========================================================================
# 2. ATUALIZAR ui_modules/ui_landing.R (Card Assistente IA Aurora e Badges)
# =========================================================================
landing_path = os.path.join(base_dir, "ui_modules", "ui_landing.R")
with open(landing_path, "r", encoding="utf-8") as f:
    content_landing = f.read()

# Substituir Card Módulo 6 Assistente IA
card_ia_antigo = '''          # Módulo 6: Assistente IA Aurora
          tags$div(
            class = "bg-gradient-to-br from-[#0C2856] to-[#153e7e] rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-white",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center text-xl mb-4 border border-white/20",
                tags$i(class = "fas fa-robot")
              ),
              tags$span(class = "badge bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1", "Inteligência Artificial"),
              tags$h4(class = "font-black text-white text-lg mb-2", "Assistente de Dados Aurora"),
              tags$p(class = "text-blue-100 text-sm leading-relaxed mb-4", 
                     "Converse diretamente com os dados de Pernambuco em linguagem natural. Obtenha comparativos imediatos, sínteses territoriais e respostas rápidas sobre qualquer município ou região.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-light rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2 text-slate-900 shadow-sm",
              onclick = "window.toggleAuroraChat()",
              tags$i(class = "fas fa-comments text-primary"), "Conversar com a Aurora"
            )
          )'''

card_ia_novo = '''          # Módulo 6: Assistente IA Aurora (Tema Aurora Dark Oficial)
          tags$div(
            class = "rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between text-white",
            style = "background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #431407 100%); border: 1px solid rgba(255, 90, 38, 0.35); box-shadow: 0 10px 25px -5px rgba(28, 25, 23, 0.3);",
            tags$div(
              tags$div(
                class = "w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-xs",
                style = "background: rgba(255, 90, 38, 0.15); color: #ff5a26; border: 1px solid rgba(255, 90, 38, 0.3);",
                tags$i(class = "fas fa-robot")
              ),
              tags$span(
                class = "badge rounded-pill text-xs font-bold mb-2 uppercase px-2.5 py-1",
                style = "background: rgba(255, 90, 38, 0.15); color: #fdba74; border: 1px solid rgba(255, 90, 38, 0.3);",
                "Inteligência Artificial"
              ),
              tags$h4(class = "font-black text-white text-lg mb-2", "Assistente de Dados Aurora"),
              tags$p(class = "text-stone-300 text-sm leading-relaxed mb-4", 
                     "Converse diretamente com os dados de Pernambuco em linguagem natural. Obtenha comparativos imediatos, sínteses territoriais e respostas rápidas sobre qualquer município ou região.")
            ),
            tags$button(
              type = "button",
              class = "btn btn-primary rounded-xl font-bold text-xs py-2.5 px-4 w-full d-flex align-items-center justify-content-center gap-2 shadow-sm text-white",
              onclick = "window.toggleAuroraChat()",
              tags$i(class = "fas fa-comments text-white"), "Conversar com a Aurora"
            )
          )'''

if card_ia_antigo in content_landing:
    content_landing = content_landing.replace(card_ia_antigo, card_ia_novo)
    print("-> ui_landing.R: Card do Assistente IA atualizado com tema Aurora Dark.")
else:
    # Caso haja variações de quebras de linha
    content_landing = re.sub(r'# Módulo 6: Assistente IA Aurora.*?tags\$i\(class = "fas fa-comments text-primary"\),\s*"Conversar com a Aurora"\s*\)\s*\)', card_ia_novo, content_landing, flags=re.DOTALL)
    print("-> ui_landing.R: Card do Assistente IA substituído via regex.")

with open(landing_path, "w", encoding="utf-8") as f:
    f.write(content_landing)


# =========================================================================
# 3. ATUALIZAR ui_modules/ui_regioes.R (Bordas de Macro-KPIs)
# =========================================================================
regioes_ui_path = os.path.join(base_dir, "ui_modules", "ui_regioes.R")
with open(regioes_ui_path, "r", encoding="utf-8") as f:
    content_regioes_ui = f.read()

content_regioes_ui = content_regioes_ui.replace('style = "border-left-color: #0C2856;"', 'style = "border-left-color: #ff5a26;"')
content_regioes_ui = content_regioes_ui.replace('style = "color: #0C2856;"', 'style = "color: #ff5a26;"')
content_regioes_ui = content_regioes_ui.replace('style = "border-left-color: #3498DB;"', 'style = "border-left-color: #f59e0b;"')
content_regioes_ui = content_regioes_ui.replace('style = "color: #3498DB;"', 'style = "color: #f59e0b;"')

with open(regioes_ui_path, "w", encoding="utf-8") as f:
    f.write(content_regioes_ui)
print("-> ui_regioes.R atualizado.")


# =========================================================================
# 4. ATUALIZAR ui_modules/ui_ficha.R (Cores da Comparação Municipal & Rodapé de Cozinhas)
# =========================================================================
ficha_ui_path = os.path.join(base_dir, "ui_modules", "ui_ficha.R")
with open(ficha_ui_path, "r", encoding="utf-8") as f:
    content_ficha_ui = f.read()

# Rodapé de cozinhas
content_ficha_ui = content_ficha_ui.replace('id = "ficha_kpi_ini_cozinhas_sub", "Pernambuco sem Fome"', 'id = "ficha_kpi_ini_cozinhas_sub", "Superação da Pobreza, Segurança Alimentar e Proteção Social"')

# Badges do topo da ficha
content_ficha_ui = content_ficha_ui.replace('badge bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-pill px-3 py-1', 'badge bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold rounded-pill px-3 py-1')
content_ficha_ui = content_ficha_ui.replace('text-blue-500"), "Módulo de Municípios"', 'text-[#ff5a26]"), "Módulo de Municípios"')

# Badges da comparação municipal
content_ficha_ui = content_ficha_ui.replace('badge bg-blue-100 text-blue-900 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block', 'badge bg-orange-100 text-orange-950 font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs mb-1 d-inline-block')
content_ficha_ui = content_ficha_ui.replace('text-blue-600"), "Benchmarking Municipal"', 'text-[#ff5a26]"), "Benchmarking Municipal"')

# Card do Município 1 na Comparação (de Azul para Laranja Aurora)
content_ficha_ui = content_ficha_ui.replace('border-blue-500 bg-blue-50/40', 'border-[#ff5a26] bg-orange-50/40')
content_ficha_ui = content_ficha_ui.replace('badge bg-blue-600 text-white rounded-pill px-2.5 py-1 text-xs font-bold", "Município 1 (Base)"', 'badge bg-[#ff5a26] text-white rounded-pill px-2.5 py-1 text-xs font-bold", "Município 1 (Base)"')
content_ficha_ui = content_ficha_ui.replace('badge bg-blue-100 text-blue-800 text-[11px] font-semibold', 'badge bg-orange-100 text-orange-900 text-[11px] font-semibold')
content_ficha_ui = content_ficha_ui.replace('border-blue-200 text-blue-900', 'border-orange-200 text-orange-950')
content_ficha_ui = content_ficha_ui.replace('border-blue-200/60 d-flex justify-content-between text-xs text-blue-950', 'border-orange-200/60 d-flex justify-content-between text-xs text-orange-950')

with open(ficha_ui_path, "w", encoding="utf-8") as f:
    f.write(content_ficha_ui)
print("-> ui_ficha.R atualizado.")


# =========================================================================
# 5. ATUALIZAR CSS (core.css, regioes.css, style.css)
# =========================================================================
core_css_path = os.path.join(base_dir, "www", "css", "core.css")
with open(core_css_path, "r", encoding="utf-8") as f:
    content_core = f.read()

# Trocar ícones de micro-kpi azuis por laranja âmbar suave
content_core = content_core.replace('color: #0284c7 !important;\n  flex-shrink: 0 !important;\n  margin: 0 !important;\n}', 'color: #ea580c !important;\n  background-color: #fff7ed !important;\n  flex-shrink: 0 !important;\n  margin: 0 !important;\n}')
content_core = content_core.replace('color: #0284c7 !important;', 'color: #ea580c !important;')
# Trocar hover de tabela de azul bebê para tom creme/laranja claríssimo
content_core = content_core.replace('table.dataTable tbody tr:hover {\n  background-color: #D6EAF8 !important;\n}', 'table.dataTable tbody tr:hover {\n  background-color: #fff7ed !important;\n}')

with open(core_css_path, "w", encoding="utf-8") as f:
    f.write(content_core)
print("-> core.css atualizado.")

# regioes.css
reg_css_path = os.path.join(base_dir, "www", "css", "regioes.css")
with open(reg_css_path, "r", encoding="utf-8") as f:
    content_reg_css = f.read()
content_reg_css = content_reg_css.replace('color: #0066FF !important;', 'color: #ff5a26 !important;')
with open(reg_css_path, "w", encoding="utf-8") as f:
    f.write(content_reg_css)
print("-> regioes.css atualizado.")

# style.css
style_css_path = os.path.join(base_dir, "www", "style.css")
with open(style_css_path, "r", encoding="utf-8") as f:
    content_style_css = f.read()
content_style_css = content_style_css.replace('color: #0C2856;', 'color: #c2410c;')
with open(style_css_path, "w", encoding="utf-8") as f:
    f.write(content_style_css)
print("-> style.css atualizado.")


# =========================================================================
# 6. ATUALIZAR JAVASCRIPT (app.js, ficha.js, regioes.js)
# =========================================================================
app_js_path = os.path.join(base_dir, "www", "js", "app.js")
with open(app_js_path, "r", encoding="utf-8") as f:
    content_app_js = f.read()
content_app_js = content_app_js.replace('bg-[#0C2856] text-white p-3 rounded-2xl rounded-tr-none', 'bg-[#ff5a26] text-white p-3 rounded-2xl rounded-tr-none shadow-sm')
with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(content_app_js)
print("-> app.js atualizado.")

ficha_js_path = os.path.join(base_dir, "www", "js", "ficha.js")
with open(ficha_js_path, "r", encoding="utf-8") as f:
    content_ficha_js = f.read()

# Substituir cores nos footers de KPIs de #0C2856 para #c2410c
content_ficha_js = content_ficha_js.replace('style="color: #0C2856; font-weight: 800;"', 'style="color: #c2410c; font-weight: 800;"')
content_ficha_js = content_ficha_js.replace("color: '#0C2856', bgIcon: 'bg-blue-100 text-blue-900'", "color: '#ea580c', bgIcon: 'bg-orange-100 text-orange-950'")
content_ficha_js = content_ficha_js.replace("'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#0C2856', '#ffffff']", "'line-color': ['case', ['boolean', ['get', 'is_selected'], false], '#ff5a26', '#ffffff']")
content_ficha_js = content_ficha_js.replace("lineStyle: { width: 3.5, color: '#0C2856' }", "lineStyle: { width: 3.5, color: '#ff5a26' }")
content_ficha_js = content_ficha_js.replace("itemStyle: { color: '#0C2856' }", "itemStyle: { color: '#ff5a26' }")
content_ficha_js = content_ficha_js.replace("const cor = isAlvo ? '#0C2856' : '#94A3B8';", "const cor = isAlvo ? '#ff5a26' : '#94A3B8';")
content_ficha_js = content_ficha_js.replace("itemStyle: { color: '#0066FF', borderRadius: [0, 4, 4, 0] }", "itemStyle: { color: '#ff5a26', borderRadius: [0, 4, 4, 0] }")

# Cores da comparação municipal: m1 = #ff5a26 (Laranja Aurora)
content_ficha_js = content_ficha_js.replace("const cores = ['#2563EB', '#10B981', '#8B5CF6'];", "const cores = ['#ff5a26', '#059669', '#7c3aed'];")
content_ficha_js = content_ficha_js.replace("{ mun: m1, cor: '#2563EB' }", "{ mun: m1, cor: '#ff5a26' }")
content_ficha_js = content_ficha_js.replace("{ mun: m2, cor: '#10B981' }", "{ mun: m2, cor: '#059669' }")
content_ficha_js = content_ficha_js.replace("mun: m3, cor: '#8B5CF6'", "mun: m3, cor: '#7c3aed'")
content_ficha_js = content_ficha_js.replace("cores = ['#2563EB', '#10B981', '#8B5CF6'];", "cores = ['#ff5a26', '#059669', '#7c3aed'];")

with open(ficha_js_path, "w", encoding="utf-8") as f:
    f.write(content_ficha_js)
print("-> ficha.js atualizado.")

regioes_js_path = os.path.join(base_dir, "www", "js", "regioes.js")
with open(regioes_js_path, "r", encoding="utf-8") as f:
    content_reg_js = f.read()

content_reg_js = content_reg_js.replace("color: #0C2856;", "color: #ff5a26;")
content_reg_js = content_reg_js.replace("background:#0C2856;", "background:#ff5a26;")
content_reg_js = content_reg_js.replace("['boolean', ['get', 'pertence_rd'], false], '#0C2856',", "['boolean', ['get', 'pertence_rd'], false], '#ff5a26',")
content_reg_js = content_reg_js.replace("] : '#0C2856',", "] : '#ff5a26',")

with open(regioes_js_path, "w", encoding="utf-8") as f:
    f.write(content_reg_js)
print("-> regioes.js atualizado.")

print("=== HARMONIZAÇÃO VISUAL COMPLETA CONCLUÍDA ===")
