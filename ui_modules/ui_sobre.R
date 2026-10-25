# ==========================================
# ui_modules/ui_sobre.R
# Módulo "Sobre / Nosso Time" refatorado para Tailwind CSS + htmltools
# ==========================================

ui_sobre <- function() {
  
  # Função auxiliar para renderizar cada card de membro da equipe com Tailwind CSS
  card_membro <- function(nome, cargo, email, cor_tema = "var(--azul-medio)", foto_url = NULL) {
    
    if (is.null(foto_url)) {
      nome_url <- gsub(" ", "+", nome)
      foto_url <- paste0("https://ui-avatars.com/api/?name=", nome_url, "&background=F2F2F2&color=0C2856&size=150&font-family=Jost")
    }
    
    tags$div(
      class = "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 h-full",
      style = paste0("border-bottom: 4px solid ", cor_tema, " !important;"),
      
      # Avatar + Ponto de destaque de cor
      tags$div(
        class = "relative mb-4",
        tags$img(
          src = foto_url, 
          class = "w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm"
        ),
        tags$span(
          class = "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white",
          style = paste0("background-color: ", cor_tema, ";")
        )
      ),
      
      # Nome e Cargo
      tags$h3(class = "font-bold text-slate-800 text-lg mb-1", nome),
      tags$p(class = "text-slate-500 text-xs font-medium leading-relaxed mb-4 flex-grow", cargo),
      
      # Badge do E-mail
      tags$a(
        href = paste0("mailto:", email),
        class = "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-800 hover:text-white px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors duration-200 mt-auto",
        tags$i(class = "fas fa-envelope text-blue-500"),
        email
      )
    )
  }
  
  # Container da Aba compatível com window.mudarAbaAurora('Nosso Time', this)
  tags$div(
    class = "tab-pane",
    `data-value` = "Nosso Time",
    id = "aba_sobre",
    
    tags$div(
      class = "container-fluid mt-3 px-4",
      
      # Cabeçalho da Seção
      tags$div(
        class = "border-b-2 border-slate-200 pb-3 mb-6",
        tags$h2(class = "text-2xl font-bold text-slate-900 tracking-tight", "Equipe Aurora")
      ),
      
      # Grid Responsivo Tailwind (1 col no celular, 2 em tablets, 3 e 4 em monitores maiores)
      tags$div(
        class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8",
        
        card_membro(
          nome = "Fabrício Marques",
          cargo = "Secretário de Planejamento, Gestão e Desenvolvimento Regional (SEPLAG)",
          email = "fabricio.marques@gd.seplag.pe.gov.br",
          cor_tema = "var(--amarelo)",
          foto_url = "images/fotos/sec_seplag.png"
        ),
        
        card_membro(
          nome = "Hugo Medeiros",
          cargo = "Gestor Governamental (SEPLAG) | Gerente Geral de Dados para Resultados (SEPLAG)",
          email = "hugo.vasconcelos@gd.seplag.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/hugo_medeiros.png"
        ),
        
        card_membro(
          nome = "Júlia Barreto",
          cargo = "Gestora de Análise de Dados (SEPLAG)",
          email = "juliabarreto@gd.seplag.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/julia_barreto.png"
        ),
        
        card_membro(
          nome = "Maria Fernanda Ribeiro",
          cargo = "Gestora Governamental (SEPLAG) | Secretária executiva de Desenvolvimento Regional e Captação (SEPLAG)",
          email = "fernanda.ribeiro@gd.seplag.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/maria_fernanda_ribeiro.png"
        ),
        
        card_membro(
          nome = "Paula Guedes",
          cargo = "Gestora Governamental (SEPLAG) | Gerente Geral de Articulação Regional (SEPLAG)",
          email = "paula.melo@gd.seplag.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/paula_guedes.png"
        ),
        
        card_membro(
          nome = "Diogo Bezerra",
          cargo = "Diretor Presidente da Agência Estadual de Planejamento e Pesquisas de Pernambuco (CONDEPE/FIDEM)",
          email = "diogo.bezerra@condepefidem.pe.gov.br",
          cor_tema = "var(--amarelo)",
          foto_url = "images/fotos/diogo_bezerra.png"
        ),
        
        card_membro(
          nome = "Carlos Alberto Gomes",
          cargo = "Diretor de Governança Metropolitana Interfederativa (CONDEPE/FIDEM)",
          email = "carlos.agaf@condepefidem.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = 'images/fotos/carlos_alberto_gomes.png'
        ),
        
        card_membro(
          nome = "André Leite",
          cargo = "Assessor Especial (SEPE)",
          email = "andre.leite@sepe.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/andre_leite.png"
        ),
        
        card_membro(
          nome = "Marcos Eberli Wasiliew",
          cargo = "Assessor Especial (SEPE)",
          email = "marcos.wasiliew@sepe.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = 'images/fotos/marcos.wasiliew.png'
        ),
        
        card_membro(
          nome = "Karina Lago Falcão",
          cargo = "Gestora Governamental (SEPLAG) | Chefe de Gabinete (SEDUH)",
          email = "karina.falcao@seduh.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = 'images/fotos/karina_falcao.png'
        ),
        
        card_membro(
          nome = "João Salles",
          cargo = "Secretário da Assessoria Especial à Governadora e Relações Internacionais (SAESPRI)",
          email = "gabinete@assessoriaespecial.pe.gov.br",
          cor_tema = "var(--amarelo)",
          foto_url = "images/fotos/sec_saespri.png"
        ),
        
        card_membro(
          nome = "Rafael Amorim",
          cargo = "Secretário Executivo de Informações Estratégicas (SAESPRI)",
          email = "rafael.gomes@assessoriaespecial.pe.gov.br",
          cor_tema = "var(--azul-claro)",
          foto_url = "images/fotos/rafael_amorim.png"
        )
      )
    )
  )
}