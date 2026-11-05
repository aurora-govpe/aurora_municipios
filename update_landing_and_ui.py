# update_landing_and_ui.py

# 1. ATUALIZAR build_ui.R
print("--- Atualizando build_ui.R ---")
with open("build_ui.R", "r", encoding="utf-8") as f:
    bui = f.read()

bui_norm = bui.replace("\r\n", "\n")

# Substituir o logo e nome da navbar pelo padrão modelo_nome_logo_navbar_aurora.png
target_brand = """      tags$div(
        class = "d-flex align-items-center gap-2 cursor-pointer select-none",
        onclick = "window.mudarAbaAurora('Início', null)",
        title = "Ir para o Início",
        tags$img(src = "images/aurora.png", class = "w-8 h-8 rounded-full border border-slate-200 shadow-xs object-cover"),
        tags$div(
          class = "d-none d-lg-flex flex-column",
          tags$span(class = "fw-black text-slate-800 leading-tight tracking-tight", style = "font-size: 0.95rem;", "Aurora"),
          tags$span(class = "text-[10px] text-slate-500 font-bold uppercase tracking-wider", "Pernambuco")
        )
      ),
      tags$div(class = "d-none d-lg-block vr my-1 bg-slate-300", style = "width: 1px; height: 24px;"),"""

replacement_brand = """      tags$div(
        class = "d-flex align-items-center gap-2.5 cursor-pointer select-none",
        onclick = "window.mudarAbaAurora('Início', null)",
        title = "Ir para o Início",
        tags$img(src = "images/aurora.png", class = "w-9 h-9 rounded-full shadow-xs object-cover flex-shrink-0", alt = "Aurora"),
        tags$div(
          class = "d-none d-md-flex flex-column justify-content-center",
          tags$div(
            class = "d-flex align-items-center leading-none",
            tags$span(class = "fw-black text-slate-900 tracking-tight", style = "font-size: 1.15rem; letter-spacing: -0.3px;", "Plataforma"),
            tags$span(class = "fw-black ms-1.5 tracking-tight", style = "font-size: 1.15rem; letter-spacing: -0.3px; color: #ff5a26;", "Aurora")
          ),
          tags$span(class = "font-black text-slate-500 uppercase", style = "font-size: 0.62rem; letter-spacing: 0.12em; margin-top: 2px;", "INTELIGÊNCIA GOVERNAMENTAL")
        )
      ),
      tags$div(class = "d-none d-md-block vr my-1 bg-slate-300 ms-1 me-1", style = "width: 1px; height: 26px; opacity: 0.45;"),"""

assert target_brand in bui_norm, "target_brand não encontrado em build_ui.R"
bui_norm = bui_norm.replace(target_brand, replacement_brand, 1)

# Adicionar link do Hub SEPLAG Digital no canto direito da navbar
target_nav_end = """    tags$div(
      class = "d-flex align-items-center gap-2 flex-nowrap flex-shrink-0 d-print-none","""

replacement_nav_end = """    tags$div(
      class = "d-flex align-items-center gap-2 flex-nowrap flex-shrink-0 d-print-none",
      tags$a(
        href = "https://digital.seplag.pe.gov.br/",
        target = "_blank",
        rel = "noopener noreferrer",
        class = "btn btn-xs rounded-pill px-2.5 py-1 font-bold text-xs d-none d-xl-inline-flex align-items-center gap-1.5 transition-all me-1",
        style = "background-color: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; text-decoration: none;",
        title = "Acessar Hub Geral SEPLAG Digital",
        tags$i(class = "fas fa-cubes text-[#ff5a26]"),
        tags$span("Hub Digital"),
        tags$i(class = "fas fa-external-link-alt text-[9px] text-amber-500")
      ),"""

assert target_nav_end in bui_norm, "target_nav_end não encontrado em build_ui.R"
bui_norm = bui_norm.replace(target_nav_end, replacement_nav_end, 1)

with open("build_ui.R", "w", encoding="utf-8") as f:
    f.write(bui_norm)
print("build_ui.R salvo com sucesso!")


# 2. ATUALIZAR ui_modules/ui_landing.R (Adicionar botão Hub SEPLAG Digital no Hero)
print("\n--- Atualizando ui_modules/ui_landing.R ---")
with open("ui_modules/ui_landing.R", "r", encoding="utf-8") as f:
    lan = f.read()

lan_norm = lan.replace("\r\n", "\n")

target_hero_badges = """        # Badges Institucionais
        tags$div(
          class = "d-flex align-items-center gap-2 mb-3 flex-wrap",
          tags$span(
            class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-white shadow-sm",
            style = "background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.25);",
            tags$i(class = "fas fa-landmark me-1.5 text-amber-300"),
            "Governo de Pernambuco"
          ),
          tags$span(
            class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-blue-200 shadow-sm",
            style = "background: rgba(0, 183, 255, 0.15); border: 1px solid rgba(0, 183, 255, 0.3);",
            tags$i(class = "fas fa-shield-halved me-1.5 text-blue-300"),
            "Secretaria de Planejamento, Gestão e Desenvolvimento Regional"
          )
        ),"""

replacement_hero_badges = """        # Badges Institucionais e Botão de Retorno ao Hub Digital SEPLAG
        tags$div(
          class = "d-flex align-items-center justify-content-between gap-3 mb-3 flex-wrap",
          tags$div(
            class = "d-flex align-items-center gap-2 flex-wrap",
            tags$span(
              class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-white shadow-sm",
              style = "background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.25);",
              tags$i(class = "fas fa-landmark me-1.5 text-amber-300"),
              "Governo de Pernambuco"
            ),
            tags$span(
              class = "badge rounded-pill px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-blue-200 shadow-sm",
              style = "background: rgba(0, 183, 255, 0.15); border: 1px solid rgba(0, 183, 255, 0.3);",
              tags$i(class = "fas fa-shield-halved me-1.5 text-blue-300"),
              "Secretaria de Planejamento, Gestão e Desenvolvimento Regional"
            )
          ),
          tags$a(
            href = "https://digital.seplag.pe.gov.br/",
            target = "_blank",
            rel = "noopener noreferrer",
            class = "btn btn-sm rounded-pill px-4 py-2 font-black text-xs text-white d-inline-flex align-items-center gap-2 shadow-md transition-all hover:scale-105",
            style = "background: linear-gradient(135deg, #ff5a26 0%, #e04010 100%); border: 1px solid rgba(255, 255, 255, 0.35); box-shadow: 0 4px 14px rgba(255, 90, 38, 0.45); text-decoration: none;",
            title = "Acessar o Hub Geral de Aplicativos SEPLAG Digital",
            tags$i(class = "fas fa-arrow-left"),
            tags$span("Hub SEPLAG Digital"),
            tags$i(class = "fas fa-external-link-alt text-[10px] opacity-80 ms-0.5")
          )
        ),"""

assert target_hero_badges in lan_norm, "target_hero_badges não encontrado em ui_landing.R"
lan_norm = lan_norm.replace(target_hero_badges, replacement_hero_badges, 1)

with open("ui_modules/ui_landing.R", "w", encoding="utf-8") as f:
    f.write(lan_norm)
print("ui_landing.R salvo com sucesso!")


# 3. ATUALIZAR ui_modules/ui_ficha.R (Remover tabelas da seção Iniciativas de Desenvolvimento Regional)
print("\n--- Atualizando ui_modules/ui_ficha.R ---")
with open("ui_modules/ui_ficha.R", "r", encoding="utf-8") as f:
    fic = f.read()

fic_norm = fic.replace("\r\n", "\n")

target_tab1 = 'tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5", tags$table(id = "ficha_tabela_iniciativas", class = "table w-100")),'
target_tab2 = 'tags$div(class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5", tags$table(id = "ficha_tabela_convenios", class = "table w-100")),'

assert target_tab1 in fic_norm, "target_tab1 não encontrado em ui_ficha.R"
assert target_tab2 in fic_norm, "target_tab2 não encontrado em ui_ficha.R"

fic_norm = fic_norm.replace(target_tab1 + "\n", "")
fic_norm = fic_norm.replace(target_tab2 + "\n", "")

with open("ui_modules/ui_ficha.R", "w", encoding="utf-8") as f:
    f.write(fic_norm)
print("ui_ficha.R atualizado (tabelas removidas com sucesso)!")
