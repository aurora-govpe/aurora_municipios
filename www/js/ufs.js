// ==========================================================================
// MÓDULO: BENCHMARKING DE UFs (5 EIXOS ESTRATÉGICOS E DADOS FISCAIS)
// ==========================================================================

var dadosMasterFiscalUFs = [];
var dadosSocioAmbientaisUFs = {}; // Cache por UF
var benchmarksRegiaoUFs = [];
var fatoresIPCAUFs = {};
var dicionarioPeriodosUFs = {};
window.usarValoresReaisUFs = false;
window.moduloUFsIniciado = false;
var chartModalUFsSerie = null;
var chartModalUFsRanking = null;

// Dicionário Unificado de Metadados para Indicadores das UFs
const dicionarioMetadadosUFs = {
    "Educação": {
        "cd_indicador": "desp_educacao",
        "nm_indicador": "Educação",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespEducação} = \\sum \\text{Empenhos liquidados na Função 12 - Educação}",
        "referencia_analise": {
            "interpretacao": "Volume total de despesas empenhadas e executadas na área de educação pública municipal no exercício.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede a capacidade de investimento e custeio na rede municipal de ensino básico, creches e infraestrutura escolar."
        }
    },
    "desp_educacao": {
        "cd_indicador": "desp_educacao",
        "nm_indicador": "Educação",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespEducação} = \\sum \\text{Empenhos liquidados na Função 12 - Educação}",
        "referencia_analise": {
            "interpretacao": "Volume total de despesas empenhadas e executadas na área de educação pública municipal no exercício.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede a capacidade de investimento e custeio na rede municipal de ensino básico, creches e infraestrutura escolar."
        }
    },
    "Saúde": {
        "cd_indicador": "desp_saude",
        "nm_indicador": "Saúde",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSaúde} = \\sum \\text{Empenhos liquidados na Função 10 - Saúde}",
        "referencia_analise": {
            "interpretacao": "Volume total de recursos alocados na rede pública de saúde (Atenção Primária, Média e Alta Complexidade).",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia o esforço orçamentário para manutenção de postos de saúde, UPAs, insumos médicos e equipes de estratégia da família."
        }
    },
    "desp_saude": {
        "cd_indicador": "desp_saude",
        "nm_indicador": "Saúde",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSaúde} = \\sum \\text{Empenhos liquidados na Função 10 - Saúde}",
        "referencia_analise": {
            "interpretacao": "Volume total de recursos alocados na rede pública de saúde (Atenção Primária, Média e Alta Complexidade).",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia o esforço orçamentário para manutenção de postos de saúde, UPAs, insumos médicos e equipes de estratégia da família."
        }
    },
    "Despesas de Capital - Emp.": {
        "cd_indicador": "desp_capital_emp",
        "nm_indicador": "Despesas de Capital - Emp.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCapital} = \\sum \\text{Empenhos em Investimentos, Inversões Financeiras e Amortização de Dívida}",
        "referencia_analise": {
            "interpretacao": "Total de recursos comprometidos com obras, aquisição de equipamentos e investimentos estruturantes.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica o dinamismo de investimentos do município para expansão e melhoria dos equipamentos públicos."
        }
    },
    "desp_capital_emp": {
        "cd_indicador": "desp_capital_emp",
        "nm_indicador": "Despesas de Capital - Emp.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCapital} = \\sum \\text{Empenhos em Investimentos, Inversões Financeiras e Amortização de Dívida}",
        "referencia_analise": {
            "interpretacao": "Total de recursos comprometidos com obras, aquisição de equipamentos e investimentos estruturantes.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica o dinamismo de investimentos do município para expansão e melhoria dos equipamentos públicos."
        }
    },
    "Transporte": {
        "cd_indicador": "desp_transporte",
        "nm_indicador": "Transporte",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespTransporte} = \\sum \\text{Empenhos liquidados na Função 26 - Transporte}",
        "referencia_analise": {
            "interpretacao": "Investimento e custeio na infraestrutura de vias públicas, mobilidade urbana e sistemas de transporte.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Orienta ações de pavimentação, manutenção malha viária, sinalização e subsídios ao transporte público."
        }
    },
    "desp_transporte": {
        "cd_indicador": "desp_transporte",
        "nm_indicador": "Transporte",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespTransporte} = \\sum \\text{Empenhos liquidados na Função 26 - Transporte}",
        "referencia_analise": {
            "interpretacao": "Investimento e custeio na infraestrutura de vias públicas, mobilidade urbana e sistemas de transporte.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Orienta ações de pavimentação, manutenção malha viária, sinalização e subsídios ao transporte público."
        }
    },
    "Urbanismo": {
        "cd_indicador": "desp_urbanismo",
        "nm_indicador": "Urbanismo",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespUrbanismo} = \\sum \\text{Empenhos liquidados na Função 15 - Urbanismo}",
        "referencia_analise": {
            "interpretacao": "Gastos destinados à infraestrutura urbana, iluminação pública, praças e limpeza/ordenação da cidade.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Dimensiona a capacidade municipal em manter espaços públicos adequados e investir na melhoria da qualidade de vida urbana."
        }
    },
    "desp_urbanismo": {
        "cd_indicador": "desp_urbanismo",
        "nm_indicador": "Urbanismo",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespUrbanismo} = \\sum \\text{Empenhos liquidados na Função 15 - Urbanismo}",
        "referencia_analise": {
            "interpretacao": "Gastos destinados à infraestrutura urbana, iluminação pública, praças e limpeza/ordenação da cidade.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Dimensiona a capacidade municipal em manter espaços públicos adequados e investir na melhoria da qualidade de vida urbana."
        }
    },
    "Habitação": {
        "cd_indicador": "desp_habitacao",
        "nm_indicador": "Habitação",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespHabitação} = \\sum \\text{Empenhos liquidados na Função 16 - Habitação}",
        "referencia_analise": {
            "interpretacao": "Despesas destinadas à promoção de habitação social, regularização fundiária e infraestrutura habitacional.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o investimento em moradia digna e redução do déficit habitacional no município."
        }
    },
    "desp_habitacao": {
        "cd_indicador": "desp_habitacao",
        "nm_indicador": "Habitação",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespHabitação} = \\sum \\text{Empenhos liquidados na Função 16 - Habitação}",
        "referencia_analise": {
            "interpretacao": "Despesas destinadas à promoção de habitação social, regularização fundiária e infraestrutura habitacional.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o investimento em moradia digna e redução do déficit habitacional no município."
        }
    },
    "Segurança Pública": {
        "cd_indicador": "desp_seguranca_publica",
        "nm_indicador": "Segurança Pública",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSegurança} = \\sum \\text{Empenhos liquidados na Função 06 - Segurança Pública}",
        "referencia_analise": {
            "interpretacao": "Recursos empenhados na guarda municipal, videomonitoramento, prevenção à violência e defesa civil.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Avalia o aporte financeiro municipal para auxílio na segurança e proteção comunitária."
        }
    },
    "desp_seguranca_publica": {
        "cd_indicador": "desp_seguranca_publica",
        "nm_indicador": "Segurança Pública",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSegurança} = \\sum \\text{Empenhos liquidados na Função 06 - Segurança Pública}",
        "referencia_analise": {
            "interpretacao": "Recursos empenhados na guarda municipal, videomonitoramento, prevenção à violência e defesa civil.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Avalia o aporte financeiro municipal para auxílio na segurança e proteção comunitária."
        }
    },
    "Ciência e Tecnologia": {
        "cd_indicador": "desp_ciencia_tecnologia",
        "nm_indicador": "Ciência e Tecnologia",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCiênciaTecnologia} = \\sum \\text{Empenhos liquidados na Função 19 - Ciência e Tecnologia}",
        "referencia_analise": {
            "interpretacao": "Investimentos em inovação tecnológica, inclusão digital, parques tecnológicos e pesquisa.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o incentivo municipal ao ecossistema de inovação e modernização tecnológica."
        }
    },
    "desp_ciencia_tecnologia": {
        "cd_indicador": "desp_ciencia_tecnologia",
        "nm_indicador": "Ciência e Tecnologia",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCiênciaTecnologia} = \\sum \\text{Empenhos liquidados na Função 19 - Ciência e Tecnologia}",
        "referencia_analise": {
            "interpretacao": "Investimentos em inovação tecnológica, inclusão digital, parques tecnológicos e pesquisa.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o incentivo municipal ao ecossistema de inovação e modernização tecnológica."
        }
    },
    "Despesas Correntes - Liq.": {
        "cd_indicador": "desp_correntes_liq",
        "nm_indicador": "Despesas Correntes - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCorrentes}_{Liq} = \\sum \\text{Despesas liquidadas de Pessoal, Encargos e Custeio Operacional}",
        "referencia_analise": {
            "interpretacao": "Total de gastos rotineiros com manutenção e funcionamento da máquina pública municipal.",
            "limiar_corte": "Compatível com a arrecadação.",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Reflete o custo fixo operacional para manutenção de serviços públicos contínuos."
        }
    },
    "desp_correntes_liq": {
        "cd_indicador": "desp_correntes_liq",
        "nm_indicador": "Despesas Correntes - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCorrentes}_{Liq} = \\sum \\text{Despesas liquidadas de Pessoal, Encargos e Custeio Operacional}",
        "referencia_analise": {
            "interpretacao": "Total de gastos rotineiros com manutenção e funcionamento da máquina pública municipal.",
            "limiar_corte": "Compatível com a arrecadação.",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Reflete o custo fixo operacional para manutenção de serviços públicos contínuos."
        }
    },
    "Despesas de Pessoal - Liq.": {
        "cd_indicador": "desp_pessoal_liq",
        "nm_indicador": "Despesas de Pessoal - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespPessoal}_{Liq} = \\sum \\text{Despesas liquidadas com Pessoal e Encargos Sociais}",
        "referencia_analise": {
            "interpretacao": "Total de recursos aplicados diretamente no pagamento de vencimentos, subsídios e encargos de servidores ativos, inativos e pensionistas.",
            "limiar_corte": "Dentro dos limites da LRF.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o peso da folha de pagamento sobre a capacidade de custeio e investimento da prefeitura."
        }
    },
    "desp_pessoal_liq": {
        "cd_indicador": "desp_pessoal_liq",
        "nm_indicador": "Despesas de Pessoal - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespPessoal}_{Liq} = \\sum \\text{Despesas liquidadas com Pessoal e Encargos Sociais}",
        "referencia_analise": {
            "interpretacao": "Total de recursos aplicados diretamente no pagamento de vencimentos, subsídios e encargos de servidores ativos, inativos e pensionistas.",
            "limiar_corte": "Dentro dos limites da LRF.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o peso da folha de pagamento sobre a capacidade de custeio e investimento da prefeitura."
        }
    },
    "Investimentos - Liq.": {
        "cd_indicador": "desp_investimentos_liq",
        "nm_indicador": "Investimentos - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Investimentos}_{Liq} = \\sum \\text{Despesas liquidadas com planejamento/execução de obras e instalações}",
        "referencia_analise": {
            "interpretacao": "Despesas efetivamente liquidadas direcionadas à ampliação do patrimônio público e benfeitorias físicas.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a capacidade efetiva do município de transformar orçamento em melhorias físicas duradouras."
        }
    },
    "desp_investimentos_liq": {
        "cd_indicador": "desp_investimentos_liq",
        "nm_indicador": "Investimentos - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Investimentos}_{Liq} = \\sum \\text{Despesas liquidadas com planejamento/execução de obras e instalações}",
        "referencia_analise": {
            "interpretacao": "Despesas efetivamente liquidadas direcionadas à ampliação do patrimônio público e benfeitorias físicas.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a capacidade efetiva do município de transformar orçamento em melhorias físicas duradouras."
        }
    },
    "Inversões - Liq.": {
        "cd_indicador": "desp_inversoes_liq",
        "nm_indicador": "Inversões - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Inversões}_{Liq} = \\sum \\text{Despesas liquidadas com aquisição de imóveis e bens de capital já em uso}",
        "referencia_analise": {
            "interpretacao": "Aplicações de capital destinadas à aquisição de imóveis ou bens em utilização e constituição/aumento de capital de empresas.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica a expansão patrimonial do município via aquisições estratégicas."
        }
    },
    "desp_inversoes_liq": {
        "cd_indicador": "desp_inversoes_liq",
        "nm_indicador": "Inversões - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Inversões}_{Liq} = \\sum \\text{Despesas liquidadas com aquisição de imóveis e bens de capital já em uso}",
        "referencia_analise": {
            "interpretacao": "Aplicações de capital destinadas à aquisição de imóveis ou bens em utilização e constituição/aumento de capital de empresas.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica a expansão patrimonial do município via aquisições estratégicas."
        }
    },
    "Amortização da Dívida - Liq.": {
        "cd_indicador": "desp_amortizacao_divida_liq",
        "nm_indicador": "Amortização da Dívida - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{AmortDívida}_{Liq} = \\sum \\text{Despesas liquidadas com amortização da dívida pública}",
        "referencia_analise": {
            "interpretacao": "Montante liquidado para pagamento do principal de dívidas fundadas ou contratuais.",
            "limiar_corte": "Capacidade de pagamento.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia o comprometimento de recursos para redução do passivo financeiro municipal."
        }
    },
    "desp_amortizacao_divida_liq": {
        "cd_indicador": "desp_amortizacao_divida_liq",
        "nm_indicador": "Amortização da Dívida - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{AmortDívida}_{Liq} = \\sum \\text{Despesas liquidadas com amortização da dívida pública}",
        "referencia_analise": {
            "interpretacao": "Montante liquidado para pagamento do principal de dívidas fundadas ou contratuais.",
            "limiar_corte": "Capacidade de pagamento.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia o comprometimento de recursos para redução do passivo financeiro municipal."
        }
    },
    "Juros e Encargos - Liq.": {
        "cd_indicador": "desp_juros_encargos_liq",
        "nm_indicador": "Juros e Encargos - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{JurosEncargos}_{Liq} = \\sum \\text{Despesas liquidadas com juros e encargos de operações de crédito}",
        "referencia_analise": {
            "interpretacao": "Custo financeiro associado ao serviço da dívida pública municipal.",
            "limiar_corte": "Sustentabilidade da dívida.",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Mede a parcela do orçamento drenada por custos de endividamento."
        }
    },
    "desp_juros_encargos_liq": {
        "cd_indicador": "desp_juros_encargos_liq",
        "nm_indicador": "Juros e Encargos - Liq.",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{JurosEncargos}_{Liq} = \\sum \\text{Despesas liquidadas com juros e encargos de operações de crédito}",
        "referencia_analise": {
            "interpretacao": "Custo financeiro associado ao serviço da dívida pública municipal.",
            "limiar_corte": "Sustentabilidade da dívida.",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Mede a parcela do orçamento drenada por custos de endividamento."
        }
    },
    "Receita Corrente Líquida": {
        "cd_indicador": "rec_corrente_liquida",
        "nm_indicador": "Receita Corrente Líquida",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RCL} = \\text{Receitas Correntes} - \\text{Deduções Constitucionais/Legais}",
        "referencia_analise": {
            "interpretacao": "Somatório das receitas tributárias, de contribuições, patrimoniais, industriais, agropecuárias, de serviços e transferências correntes, deduzidas as transferências legais.",
            "limiar_corte": "Capacidade arrecadatória.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Métrica central da LRF utilizada como base de cálculo para limites de pessoal, endividamento e garantias fiscais."
        }
    },
    "rec_corrente_liquida": {
        "cd_indicador": "rec_corrente_liquida",
        "nm_indicador": "Receita Corrente Líquida",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RCL} = \\text{Receitas Correntes} - \\text{Deduções Constitucionais/Legais}",
        "referencia_analise": {
            "interpretacao": "Somatório das receitas tributárias, de contribuições, patrimoniais, industriais, agropecuárias, de serviços e transferências correntes, deduzidas as transferências legais.",
            "limiar_corte": "Capacidade arrecadatória.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Métrica central da LRF utilizada como base de cálculo para limites de pessoal, endividamento e garantias fiscais."
        }
    },
    "Receitas Realizadas": {
        "cd_indicador": "rec_realizadas",
        "nm_indicador": "Receitas Realizadas",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecRealizadas} = \\sum \\text{Receitas efetivamente arrecadadas no exercício}",
        "referencia_analise": {
            "interpretacao": "Total geral de recursos que efetivamente deram entrada no cofre público municipal.",
            "limiar_corte": "Execução orçamentária.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia o cumprimento das metas da Lei Orçamentária Anual (LOA) e o grau de arrecadação do município."
        }
    },
    "rec_realizadas": {
        "cd_indicador": "rec_realizadas",
        "nm_indicador": "Receitas Realizadas",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecRealizadas} = \\sum \\text{Receitas efetivamente arrecadadas no exercício}",
        "referencia_analise": {
            "interpretacao": "Total geral de recursos que efetivamente deram entrada no cofre público municipal.",
            "limiar_corte": "Execução orçamentária.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia o cumprimento das metas da Lei Orçamentária Anual (LOA) e o grau de arrecadação do município."
        }
    },
    "Receitas de Capital": {
        "cd_indicador": "rec_capital",
        "nm_indicador": "Receitas de Capital",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecCapital} = \\sum (\\text{Operações de Crédito} + \\text{Alien. Bens} + \\text{Transf. Capital})",
        "referencia_analise": {
            "interpretacao": "Receitas oriundas de operações financeiras, alienação de patrimônio público ou transferências para investimentos.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Financia a execução de novos investimentos e obras públicas de longo prazo."
        }
    },
    "rec_capital": {
        "cd_indicador": "rec_capital",
        "nm_indicador": "Receitas de Capital",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecCapital} = \\sum (\\text{Operações de Crédito} + \\text{Alien. Bens} + \\text{Transf. Capital})",
        "referencia_analise": {
            "interpretacao": "Receitas oriundas de operações financeiras, alienação de patrimônio público ou transferências para investimentos.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Financia a execução de novos investimentos e obras públicas de longo prazo."
        }
    },
    "Receitas de Impostos": {
        "cd_indicador": "rec_impostos",
        "nm_indicador": "Receitas de Impostos",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecImpostos} = \\text{IPTU} + \\text{ISS} + \\text{ITBI} + \\text{IRRF}",
        "referencia_analise": {
            "interpretacao": "Volume arrecadado diretamente com tributos municipais próprios.",
            "limiar_corte": "Arrecadação própria.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o grau de autonomia financeira do município em relação a repasses de outras esferas federativas."
        }
    },
    "rec_impostos": {
        "cd_indicador": "rec_impostos",
        "nm_indicador": "Receitas de Impostos",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{RecImpostos} = \\text{IPTU} + \\text{ISS} + \\text{ITBI} + \\text{IRRF}",
        "referencia_analise": {
            "interpretacao": "Volume arrecadado diretamente com tributos municipais próprios.",
            "limiar_corte": "Arrecadação própria.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o grau de autonomia financeira do município em relação a repasses de outras esferas federativas."
        }
    },
    "Transf. União (Capital)": {
        "cd_indicador": "rec_transf_uniao_cap",
        "nm_indicador": "Transf. União (Capital)",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{TransfUnião}_{Cap} = \\sum \\text{Repasses federais vinculados a investimentos e capital}",
        "referencia_analise": {
            "interpretacao": "Montante de recursos repassados pelo Governo Federal destinados especificamente a investimentos estruturais.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia a capacidade de captação de convênios federais e emendas parlamentares de investimento."
        }
    },
    "rec_transf_uniao_cap": {
        "cd_indicador": "rec_transf_uniao_cap",
        "nm_indicador": "Transf. União (Capital)",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{TransfUnião}_{Cap} = \\sum \\text{Repasses federais vinculados a investimentos e capital}",
        "referencia_analise": {
            "interpretacao": "Montante de recursos repassados pelo Governo Federal destinados especificamente a investimentos estruturais.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia a capacidade de captação de convênios federais e emendas parlamentares de investimento."
        }
    },
    "Transf. União (Corrente)": {
        "cd_indicador": "rec_transf_uniao_corr",
        "nm_indicador": "Transf. União (Corrente)",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{TransfUnião}_{Corr} = \\sum \\text{Repasses federais para custeio (FPM, SUS, FNAS, etc.)}",
        "referencia_analise": {
            "interpretacao": "Transferências correntes oriundas da União para manutenção de serviços públicos operacionais.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a dependência do fundo de participação (FPM) e blocos de financiamento do SUS/FNAS para custeio de serviços."
        }
    },
    "rec_transf_uniao_corr": {
        "cd_indicador": "rec_transf_uniao_corr",
        "nm_indicador": "Transf. União (Corrente)",
        "subdimensao": "Receitas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{TransfUnião}_{Corr} = \\sum \\text{Repasses federais para custeio (FPM, SUS, FNAS, etc.)}",
        "referencia_analise": {
            "interpretacao": "Transferências correntes oriundas da União para manutenção de serviços públicos operacionais.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a dependência do fundo de participação (FPM) e blocos de financiamento do SUS/FNAS para custeio de serviços."
        }
    },
    "Vinculação - Educação": {
        "cd_indicador": "vinc_educacao",
        "nm_indicador": "Vinculação - Educação",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{VincEducação} = \\left( \\frac{\\text{Aplicação em MDE}}{\\text{Receita de Impostos e Transf.}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Percentual da receita tributária e de transferências aplicados na Manutenção e Desenvolvimento do Ensino (MDE).",
            "limiar_corte": ">= 25%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Monitora o cumprimento do mandamento constitucional de aplicação mínima de 25% na educação."
        }
    },
    "vinc_educacao": {
        "cd_indicador": "vinc_educacao",
        "nm_indicador": "Vinculação - Educação",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{VincEducação} = \\left( \\frac{\\text{Aplicação em MDE}}{\\text{Receita de Impostos e Transf.}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Percentual da receita tributária e de transferências aplicados na Manutenção e Desenvolvimento do Ensino (MDE).",
            "limiar_corte": ">= 25%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Monitora o cumprimento do mandamento constitucional de aplicação mínima de 25% na educação."
        }
    },
    "Vinculação - Saúde": {
        "cd_indicador": "vinc_saude",
        "nm_indicador": "Vinculação - Saúde",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{VincSaúde} = \\left( \\frac{\\text{Aplicação em Ações de Saúde}}{\\text{Receita de Impostos e Transf.}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Percentual arrecadado aplicado em Ações e Serviços Públicos de Saúde (ASPS).",
            "limiar_corte": ">= 15%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Garante o cumprimento do piso constitucional de 15% na saúde de acordo com a LC 141/2012."
        }
    },
    "vinc_saude": {
        "cd_indicador": "vinc_saude",
        "nm_indicador": "Vinculação - Saúde",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{VincSaúde} = \\left( \\frac{\\text{Aplicação em Ações de Saúde}}{\\text{Receita de Impostos e Transf.}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Percentual arrecadado aplicado em Ações e Serviços Públicos de Saúde (ASPS).",
            "limiar_corte": ">= 15%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Garante o cumprimento do piso constitucional de 15% na saúde de acordo com a LC 141/2012."
        }
    },
    "Resultado Fiscal": {
        "cd_indicador": "resultado_fiscal",
        "nm_indicador": "Resultado Fiscal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResFiscal} = \\text{Receitas Totais} - \\text{Despesas Totais}",
        "referencia_analise": {
            "interpretacao": "Avalia o desempenho financeiro global da gestão municipal entre receitas e despesas.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a suficiência financeira para manutenção do equilíbrio das contas públicas."
        }
    },
    "resultado_fiscal": {
        "cd_indicador": "resultado_fiscal",
        "nm_indicador": "Resultado Fiscal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResFiscal} = \\text{Receitas Totais} - \\text{Despesas Totais}",
        "referencia_analise": {
            "interpretacao": "Avalia o desempenho financeiro global da gestão municipal entre receitas e despesas.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Indica a suficiência financeira para manutenção do equilíbrio das contas públicas."
        }
    },
    "Resultado Orçamentário": {
        "cd_indicador": "resultado_orcamentario",
        "nm_indicador": "Resultado Orçamentário",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResOrçamentário} = \\text{Receitas Arrecadadas} - \\text{Despesas Empenhadas}",
        "referencia_analise": {
            "interpretacao": "Diferença entre o total de receitas arrecadadas e despesas executadas no período.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o superávit ou déficit orçamentário do município, refletindo o equilíbrio financeiro da gestão."
        }
    },
    "resultado_orcamentario": {
        "cd_indicador": "resultado_orcamentario",
        "nm_indicador": "Resultado Orçamentário",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResOrçamentário} = \\text{Receitas Arrecadadas} - \\text{Despesas Empenhadas}",
        "referencia_analise": {
            "interpretacao": "Diferença entre o total de receitas arrecadadas e despesas executadas no período.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o superávit ou déficit orçamentário do município, refletindo o equilíbrio financeiro da gestão."
        }
    },
    "Resultado Orçamentário Relativo": {
        "cd_indicador": "resultado_orcamentario_relativo",
        "nm_indicador": "Resultado Orçamentário Relativo",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{ResOrçRelativo} = \\left( \\frac{\\text{Receitas} - \\text{Despesas}}{\\text{Receita Corrente Líquida}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Proporção do superávit ou déficit orçamentário em relação à Receita Corrente Líquida.",
            "limiar_corte": ">= 0%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Permite comparar a saúde fiscal entre municípios de diferentes portes."
        }
    },
    "resultado_orcamentario_relativo": {
        "cd_indicador": "resultado_orcamentario_relativo",
        "nm_indicador": "Resultado Orçamentário Relativo",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{ResOrçRelativo} = \\left( \\frac{\\text{Receitas} - \\text{Despesas}}{\\text{Receita Corrente Líquida}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Proporção do superávit ou déficit orçamentário em relação à Receita Corrente Líquida.",
            "limiar_corte": ">= 0%",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Permite comparar a saúde fiscal entre municípios de diferentes portes."
        }
    },
    "Resultado Orçamentário per capita": {
        "cd_indicador": "resultado_orcamentario_per_capita",
        "nm_indicador": "Resultado Orçamentário per capita",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResOrçPerCapita} = \\frac{\\text{Resultado Orçamentário}}{\\text{População Total}}",
        "referencia_analise": {
            "interpretacao": "Saldo orçamentário médio gerado por habitante do município.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o impacto relativo do resultado orçamentário sobre a população residente."
        }
    },
    "resultado_orcamentario_per_capita": {
        "cd_indicador": "resultado_orcamentario_per_capita",
        "nm_indicador": "Resultado Orçamentário per capita",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResOrçPerCapita} = \\frac{\\text{Resultado Orçamentário}}{\\text{População Total}}",
        "referencia_analise": {
            "interpretacao": "Saldo orçamentário médio gerado por habitante do município.",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Mede o impacto relativo do resultado orçamentário sobre a população residente."
        }
    },
    "Resultado Primário": {
        "cd_indicador": "resultado_primario",
        "nm_indicador": "Resultado Primário",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResPrimário} = \\text{Receitas Primárias} - \\text{Despesas Primárias}",
        "referencia_analise": {
            "interpretacao": "Mede a capacidade do município de honrar suas despesas correntes e de capital sem considerar receitas e despesas financeiras (juros e amortizações).",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia a sustentabilidade das contas públicas e a capacidade de geração de caixa próprio."
        }
    },
    "resultado_primario": {
        "cd_indicador": "resultado_primario",
        "nm_indicador": "Resultado Primário",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResPrimário} = \\text{Receitas Primárias} - \\text{Despesas Primárias}",
        "referencia_analise": {
            "interpretacao": "Mede a capacidade do município de honrar suas despesas correntes e de capital sem considerar receitas e despesas financeiras (juros e amortizações).",
            "limiar_corte": ">= R$ 0,00",
            "direcao_desejavel": "Aumento desejável",
            "impacto_planejamento": "Avalia a sustentabilidade das contas públicas e a capacidade de geração de caixa próprio."
        }
    },
    "Resultado Nominal": {
        "cd_indicador": "resultado_nominal",
        "nm_indicador": "Resultado Nominal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResNominal} = \\Delta \\text{Dívida Consolidada Líquida}",
        "referencia_analise": {
            "interpretacao": "Mede a variação total do endividamento líquido do município ao longo do exercício fiscal, incluindo juros e correção monetária.",
            "limiar_corte": "<= R$ 0,00",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Indica o crescimento ou redução do estoque total da dívida líquida da prefeitura."
        }
    },
    "resultado_nominal": {
        "cd_indicador": "resultado_nominal",
        "nm_indicador": "Resultado Nominal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{ResNominal} = \\Delta \\text{Dívida Consolidada Líquida}",
        "referencia_analise": {
            "interpretacao": "Mede a variação total do endividamento líquido do município ao longo do exercício fiscal, incluindo juros e correção monetária.",
            "limiar_corte": "<= R$ 0,00",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Indica o crescimento ou redução do estoque total da dívida líquida da prefeitura."
        }
    },
    "DTP/RCL": {
        "cd_indicador": "dtp_rcl",
        "nm_indicador": "Pessoal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{DTP/RCL} = \\left( \\frac{\\text{Despesa Total com Pessoal}}{\\text{Receita Corrente Líquida}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Proporção do comprometimento da Receita Corrente Líquida com despesas de pessoal do Poder Executivo.",
            "limiar_corte": "< 54%",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Monitoramento dos limites legal (54%), prudencial (51,3%) e de alerta (48,6%) estabelecidos pela LRF para evitar vedações de contratação e reajuste."
        }
    },
    "dtp_rcl": {
        "cd_indicador": "dtp_rcl",
        "nm_indicador": "Pessoal",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Percentual",
        "formula_katex": "\\text{DTP/RCL} = \\left( \\frac{\\text{Despesa Total com Pessoal}}{\\text{Receita Corrente Líquida}} \\right) \\times 100",
        "referencia_analise": {
            "interpretacao": "Proporção do comprometimento da Receita Corrente Líquida com despesas de pessoal do Poder Executivo.",
            "limiar_corte": "< 54%",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Monitoramento dos limites legal (54%), prudencial (51,3%) e de alerta (48,6%) estabelecidos pela LRF para evitar vedações de contratação e reajuste."
        }
    },
    "Dívida Consolidada Líquida": {
        "cd_indicador": "divida_consolidada_liquida",
        "nm_indicador": "Dívida Consolidada Líquida",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DCL} = \\text{Dívida Consolidada Bruta} - \\text{Ativos Financeiros e Haveres}",
        "referencia_analise": {
            "interpretacao": "Montante apurado da dívida do município descontadas as disponibilidades de caixa e haveres financeiros.",
            "limiar_corte": "< 120% da RCL",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Determina a solvência de longo prazo do município e o cumprimento dos limites definidos pelo Senado Federal."
        }
    },
    "divida_consolidada_liquida": {
        "cd_indicador": "divida_consolidada_liquida",
        "nm_indicador": "Dívida Consolidada Líquida",
        "subdimensao": "Gestão e Equilíbrio Fiscal",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DCL} = \\text{Dívida Consolidada Bruta} - \\text{Ativos Financeiros e Haveres}",
        "referencia_analise": {
            "interpretacao": "Montante apurado da dívida do município descontadas as disponibilidades de caixa e haveres financeiros.",
            "limiar_corte": "< 120% da RCL",
            "direcao_desejavel": "Redução desejável",
            "impacto_planejamento": "Determina a solvência de longo prazo do município e o cumprimento dos limites definidos pelo Senado Federal."
        }
    },
    "Direitos da Cidadania": {
        "cd_indicador": "desp_direitos_cidadania",
        "nm_indicador": "Direitos da Cidadania",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCidadania} = \\sum \\text{Empenhos na Função 14 - Direitos da Cidadania}",
        "referencia_analise": {
            "interpretacao": "Gastos voltados à promoção da cidadania, direitos humanos e defesa de minorias e coletividades.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Informa sobre o compromisso com garantias de direitos fundamentais e proteção a grupos vulnerabilizados."
        }
    },
    "desp_direitos_cidadania": {
        "cd_indicador": "desp_direitos_cidadania",
        "nm_indicador": "Direitos da Cidadania",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespCidadania} = \\sum \\text{Empenhos na Função 14 - Direitos da Cidadania}",
        "referencia_analise": {
            "interpretacao": "Gastos voltados à promoção da cidadania, direitos humanos e defesa de minorias e coletividades.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Informa sobre o compromisso com garantias de direitos fundamentais e proteção a grupos vulnerabilizados."
        }
    },
    "Judiciária": {
        "cd_indicador": "desp_judiciaria",
        "nm_indicador": "Judiciária",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespJudiciária} = \\sum \\text{Empenhos na Função 02 - Judiciária}",
        "referencia_analise": {
            "interpretacao": "Despesas alocadas na prestação jurisdicional e funcionamento dos órgãos do Poder Judiciário.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Reflete a dotação e execução orçamentária do Judiciário estadual."
        }
    },
    "desp_judiciaria": {
        "cd_indicador": "desp_judiciaria",
        "nm_indicador": "Judiciária",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespJudiciária} = \\sum \\text{Empenhos na Função 02 - Judiciária}",
        "referencia_analise": {
            "interpretacao": "Despesas alocadas na prestação jurisdicional e funcionamento dos órgãos do Poder Judiciário.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Reflete a dotação e execução orçamentária do Judiciário estadual."
        }
    },
    "Legislativa": {
        "cd_indicador": "desp_legislativa",
        "nm_indicador": "Legislativa",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespLegislativa} = \\sum \\text{Empenhos na Função 01 - Legislativa}",
        "referencia_analise": {
            "interpretacao": "Volume de gastos destinados ao Poder Legislativo e Tribunais de Contas.",
            "limiar_corte": "Limites da LRF (Art. 29-A da CF/88).",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Dimensiona a estrutura do controle legislativo e fiscalizatório."
        }
    },
    "desp_legislativa": {
        "cd_indicador": "desp_legislativa",
        "nm_indicador": "Legislativa",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespLegislativa} = \\sum \\text{Empenhos na Função 01 - Legislativa}",
        "referencia_analise": {
            "interpretacao": "Volume de gastos destinados ao Poder Legislativo e Tribunais de Contas.",
            "limiar_corte": "Limites da LRF (Art. 29-A da CF/88).",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Dimensiona a estrutura do controle legislativo e fiscalizatório."
        }
    },
    "Saneamento": {
        "cd_indicador": "desp_saneamento",
        "nm_indicador": "Saneamento",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSaneamento} = \\sum \\text{Empenhos na Função 17 - Saneamento}",
        "referencia_analise": {
            "interpretacao": "Recursos executados em infraestrutura de esgotamento sanitário, água tratada e drenagem.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Impacto direto nas condições sanitárias e saúde pública da população."
        }
    },
    "desp_saneamento": {
        "cd_indicador": "desp_saneamento",
        "nm_indicador": "Saneamento",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespSaneamento} = \\sum \\text{Empenhos na Função 17 - Saneamento}",
        "referencia_analise": {
            "interpretacao": "Recursos executados em infraestrutura de esgotamento sanitário, água tratada e drenagem.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Impacto direto nas condições sanitárias e saúde pública da população."
        }
    },
    "Assistência Social": {
        "cd_indicador": "desp_assistencia_social",
        "nm_indicador": "Assistência Social",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAssistência} = \\sum \\text{Empenhos na Função 08 - Assistência Social}",
        "referencia_analise": {
            "interpretacao": "Investimentos em proteção social básica, acolhimento e programas de transferência de renda.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia a capacidade de amortecer crises socioeconômicas e apoiar populações vulneráveis."
        }
    },
    "desp_assistencia_social": {
        "cd_indicador": "desp_assistencia_social",
        "nm_indicador": "Assistência Social",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAssistência} = \\sum \\text{Empenhos na Função 08 - Assistência Social}",
        "referencia_analise": {
            "interpretacao": "Investimentos em proteção social básica, acolhimento e programas de transferência de renda.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mapeia a capacidade de amortecer crises socioeconômicas e apoiar populações vulneráveis."
        }
    },
    "Previdência Social": {
        "cd_indicador": "desp_previdencia_social",
        "nm_indicador": "Previdência Social",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespPrevidência} = \\sum \\text{Empenhos na Função 09 - Previdência Social}",
        "referencia_analise": {
            "interpretacao": "Gastos com aposentadorias, pensões e equilíbrio atuarial do regime próprio de previdência.",
            "limiar_corte": "Equilíbrio financeiro e atuarial.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Crucial para a sustentabilidade fiscal de longo prazo das contas do Estado."
        }
    },
    "desp_previdencia_social": {
        "cd_indicador": "desp_previdencia_social",
        "nm_indicador": "Previdência Social",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespPrevidência} = \\sum \\text{Empenhos na Função 09 - Previdência Social}",
        "referencia_analise": {
            "interpretacao": "Gastos com aposentadorias, pensões e equilíbrio atuarial do regime próprio de previdência.",
            "limiar_corte": "Equilíbrio financeiro e atuarial.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Crucial para a sustentabilidade fiscal de longo prazo das contas do Estado."
        }
    },
    "Trabalho": {
        "cd_indicador": "desp_trabalho",
        "nm_indicador": "Trabalho",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespTrabalho} = \\sum \\text{Empenhos na Função 11 - Trabalho}",
        "referencia_analise": {
            "interpretacao": "Recursos aplicados na qualificação laboral, fomento ao emprego e relações do trabalho.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Apoia políticas de empregabilidade e produtividade da mão de obra."
        }
    },
    "desp_trabalho": {
        "cd_indicador": "desp_trabalho",
        "nm_indicador": "Trabalho",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespTrabalho} = \\sum \\text{Empenhos na Função 11 - Trabalho}",
        "referencia_analise": {
            "interpretacao": "Recursos aplicados na qualificação laboral, fomento ao emprego e relações do trabalho.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Apoia políticas de empregabilidade e produtividade da mão de obra."
        }
    },
    "Gestão Ambiental": {
        "cd_indicador": "desp_gestao_ambiental",
        "nm_indicador": "Gestão Ambiental",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAmbiental} = \\sum \\text{Empenhos na Função 18 - Gestão Ambiental}",
        "referencia_analise": {
            "interpretacao": "Despesas voltadas à preservação ecológica, recursos hídricos e controle ambiental.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o empenho do ente federado na transição ecológica e proteção dos biomas."
        }
    },
    "desp_gestao_ambiental": {
        "cd_indicador": "desp_gestao_ambiental",
        "nm_indicador": "Gestão Ambiental",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAmbiental} = \\sum \\text{Empenhos na Função 18 - Gestão Ambiental}",
        "referencia_analise": {
            "interpretacao": "Despesas voltadas à preservação ecológica, recursos hídricos e controle ambiental.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Mede o empenho do ente federado na transição ecológica e proteção dos biomas."
        }
    },
    "Agricultura": {
        "cd_indicador": "desp_agricultura",
        "nm_indicador": "Agricultura",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAgricultura} = \\sum \\text{Empenhos na Função 20 - Agricultura}",
        "referencia_analise": {
            "interpretacao": "Gastos com extensão rural, fomento à agricultura familiar e infraestrutura produtiva.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Estimula o desenvolvimento agrário e a segurança alimentar."
        }
    },
    "desp_agricultura": {
        "cd_indicador": "desp_agricultura",
        "nm_indicador": "Agricultura",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAgricultura} = \\sum \\text{Empenhos na Função 20 - Agricultura}",
        "referencia_analise": {
            "interpretacao": "Gastos com extensão rural, fomento à agricultura familiar e infraestrutura produtiva.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Estimula o desenvolvimento agrário e a segurança alimentar."
        }
    },
    "Administração": {
        "cd_indicador": "desp_administracao",
        "nm_indicador": "Administração",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAdministração} = \\sum \\text{Empenhos na Função 04 - Administração}",
        "referencia_analise": {
            "interpretacao": "Custeio e manutenção da máquina pública, planejamento governamental e gestão fazendária.",
            "limiar_corte": "Eficiência administrativa.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Informa sobre o custo operacional da governança estadual."
        }
    },
    "desp_administracao": {
        "cd_indicador": "desp_administracao",
        "nm_indicador": "Administração",
        "subdimensao": "Despesas Públicas",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{DespAdministração} = \\sum \\text{Empenhos na Função 04 - Administração}",
        "referencia_analise": {
            "interpretacao": "Custeio e manutenção da máquina pública, planejamento governamental e gestão fazendária.",
            "limiar_corte": "Eficiência administrativa.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Informa sobre o custo operacional da governança estadual."
        }
    },
    "População Total": {
        "cd_indicador": "populacao_total",
        "nm_indicador": "População Total",
        "subdimensao": "Demografia",
        "natureza": "Habitantes (hab.)",
        "formula_katex": "\\text{População Total} = \\sum \\text{Habitantes Residentes}",
        "referencia_analise": {
            "interpretacao": "População total residente na Unidade da Federação segundo projeções e censos do IBGE.",
            "limiar_corte": "Monitoramento censitário.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Parâmetro fundamental para escala de serviços públicos, representação política e repartição tributária."
        }
    },
    "populacao_total": {
        "cd_indicador": "populacao_total",
        "nm_indicador": "População Total",
        "subdimensao": "Demografia",
        "natureza": "Habitantes (hab.)",
        "formula_katex": "\\text{População Total} = \\sum \\text{Habitantes Residentes}",
        "referencia_analise": {
            "interpretacao": "População total residente na Unidade da Federação segundo projeções e censos do IBGE.",
            "limiar_corte": "Monitoramento censitário.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Parâmetro fundamental para escala de serviços públicos, representação política e repartição tributária."
        }
    },
    "População em Idade Ativa (Média)": {
        "cd_indicador": "pia_media",
        "nm_indicador": "População em Idade Ativa (Média)",
        "subdimensao": "Demografia / Força de Trabalho",
        "natureza": "Pessoas (hab.)",
        "formula_katex": "\\text{PIA} = \\sum \\text{Pessoas com 14 anos ou mais de idade}",
        "referencia_analise": {
            "interpretacao": "Média anual da população de 14 anos ou mais de idade, em condições potenciais de integrar a força de trabalho (PNADC).",
            "limiar_corte": "Bônus demográfico.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica a base produtiva potencial do Estado para políticas ativas de qualificação e emprego."
        }
    },
    "pia_media": {
        "cd_indicador": "pia_media",
        "nm_indicador": "População em Idade Ativa (Média)",
        "subdimensao": "Demografia / Força de Trabalho",
        "natureza": "Pessoas (hab.)",
        "formula_katex": "\\text{PIA} = \\sum \\text{Pessoas com 14 anos ou mais de idade}",
        "referencia_analise": {
            "interpretacao": "Média anual da população de 14 anos ou mais de idade, em condições potenciais de integrar a força de trabalho (PNADC).",
            "limiar_corte": "Bônus demográfico.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Indica a base produtiva potencial do Estado para políticas ativas de qualificação e emprego."
        }
    },
    "Taxa de Desocupação Média (%)": {
        "cd_indicador": "taxa_desocupacao_media",
        "nm_indicador": "Taxa de Desocupação Média (%)",
        "subdimensao": "Mercado de Trabalho",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Taxa Desocupação} = \\frac{\\text{Pessoas Desocupadas}}{\\text{Força de Trabalho}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual da população na força de trabalho que se encontrava desocupada na média dos trimestres do ano (PNADC/IBGE).",
            "limiar_corte": "Redução contínua em direção ao pleno emprego.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Indicador chave do dinamismo econômico e vulnerabilidade social da população trabalhadora."
        }
    },
    "taxa_desocupacao_media": {
        "cd_indicador": "taxa_desocupacao_media",
        "nm_indicador": "Taxa de Desocupação Média (%)",
        "subdimensao": "Mercado de Trabalho",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Taxa Desocupação} = \\frac{\\text{Pessoas Desocupadas}}{\\text{Força de Trabalho}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual da população na força de trabalho que se encontrava desocupada na média dos trimestres do ano (PNADC/IBGE).",
            "limiar_corte": "Redução contínua em direção ao pleno emprego.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Indicador chave do dinamismo econômico e vulnerabilidade social da população trabalhadora."
        }
    },
    "População Ocupada (Média)": {
        "cd_indicador": "pop_ocupada_media",
        "nm_indicador": "População Ocupada (Média)",
        "subdimensao": "Mercado de Trabalho",
        "natureza": "Pessoas Ocupadas (Qtd)",
        "formula_katex": "\\text{Pop Ocupada} = \\sum \\text{Trabalhadores Formais e Informais Ocupados}",
        "referencia_analise": {
            "interpretacao": "Contingente médio de pessoas exercendo atividade remunerada no mercado de trabalho estadual.",
            "limiar_corte": "Expansão do emprego formal.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o nível de geração de postos de trabalho e circulação de massa salarial."
        }
    },
    "pop_ocupada_media": {
        "cd_indicador": "pop_ocupada_media",
        "nm_indicador": "População Ocupada (Média)",
        "subdimensao": "Mercado de Trabalho",
        "natureza": "Pessoas Ocupadas (Qtd)",
        "formula_katex": "\\text{Pop Ocupada} = \\sum \\text{Trabalhadores Formais e Informais Ocupados}",
        "referencia_analise": {
            "interpretacao": "Contingente médio de pessoas exercendo atividade remunerada no mercado de trabalho estadual.",
            "limiar_corte": "Expansão do emprego formal.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o nível de geração de postos de trabalho e circulação de massa salarial."
        }
    },
    "Trimestres Observados (PNADC)": {
        "cd_indicador": "trimestres_observados",
        "nm_indicador": "Trimestres Observados (PNADC)",
        "subdimensao": "Metodologia Amostral",
        "natureza": "Trimestres (Qtd)",
        "formula_katex": "\\text{Trimestres} = \\text{Contagem de rodadas trimestrais apuradas}",
        "referencia_analise": {
            "interpretacao": "Quantidade de trimestres da Pesquisa Nacional por Amostra de Domicílios Contínua consolidados no ano.",
            "limiar_corte": "4 trimestres para fechamento do ano civil.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Garante o rigor estatístico e a comparabilidade das métricas anuais de trabalho."
        }
    },
    "trimestres_observados": {
        "cd_indicador": "trimestres_observados",
        "nm_indicador": "Trimestres Observados (PNADC)",
        "subdimensao": "Metodologia Amostral",
        "natureza": "Trimestres (Qtd)",
        "formula_katex": "\\text{Trimestres} = \\text{Contagem de rodadas trimestrais apuradas}",
        "referencia_analise": {
            "interpretacao": "Quantidade de trimestres da Pesquisa Nacional por Amostra de Domicílios Contínua consolidados no ano.",
            "limiar_corte": "4 trimestres para fechamento do ano civil.",
            "direcao_desejavel": "Análise contextual",
            "impacto_planejamento": "Garante o rigor estatístico e a comparabilidade das métricas anuais de trabalho."
        }
    },
    "PIB Total": {
        "cd_indicador": "pib_total_reais",
        "nm_indicador": "PIB Total",
        "subdimensao": "Atividade Econômica",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{PIB} = \\sum \\text{VAB dos Setores} + \\text{Impostos Líquidos}",
        "referencia_analise": {
            "interpretacao": "Produto Interno Bruto a preços correntes consolidado pelas Contas Regionais / IBGE.",
            "limiar_corte": "Crescimento real positivo.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o porte global da economia estadual e a capacidade de geração de riqueza."
        }
    },
    "pib_total_reais": {
        "cd_indicador": "pib_total_reais",
        "nm_indicador": "PIB Total",
        "subdimensao": "Atividade Econômica",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{PIB} = \\sum \\text{VAB dos Setores} + \\text{Impostos Líquidos}",
        "referencia_analise": {
            "interpretacao": "Produto Interno Bruto a preços correntes consolidado pelas Contas Regionais / IBGE.",
            "limiar_corte": "Crescimento real positivo.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o porte global da economia estadual e a capacidade de geração de riqueza."
        }
    },
    "PIB per capita": {
        "cd_indicador": "pib_per_capita",
        "nm_indicador": "PIB per capita",
        "subdimensao": "Atividade Econômica",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{PIB per capita} = \\frac{\\text{PIB Total}}{\\text{População Residente}}",
        "referencia_analise": {
            "interpretacao": "Relação entre a produção total de riquezas e a população residente do Estado.",
            "limiar_corte": "Convergência em relação à média nacional.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia o padrão de produtividade e desenvolvimento econômico médio por habitante."
        }
    },
    "pib_per_capita": {
        "cd_indicador": "pib_per_capita",
        "nm_indicador": "PIB per capita",
        "subdimensao": "Atividade Econômica",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{PIB per capita} = \\frac{\\text{PIB Total}}{\\text{População Residente}}",
        "referencia_analise": {
            "interpretacao": "Relação entre a produção total de riquezas e a população residente do Estado.",
            "limiar_corte": "Convergência em relação à média nacional.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia o padrão de produtividade e desenvolvimento econômico médio por habitante."
        }
    },
    "PIB por População Ocupada (Produtividade)": {
        "cd_indicador": "pib_por_pop_ocupada",
        "nm_indicador": "PIB por População Ocupada (Produtividade)",
        "subdimensao": "Produtividade",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Produtividade} = \\frac{\\text{PIB Total}}{\\text{População Ocupada Média}}",
        "referencia_analise": {
            "interpretacao": "Valor adicionado médio gerado por cada trabalhador ocupado na economia estadual.",
            "limiar_corte": "Ganhos reais de eficiência do trabalho.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Reflete a densidade tecnológica, sofisticação produtiva e capital humano do Estado."
        }
    },
    "pib_por_pop_ocupada": {
        "cd_indicador": "pib_por_pop_ocupada",
        "nm_indicador": "PIB por População Ocupada (Produtividade)",
        "subdimensao": "Produtividade",
        "natureza": "Monetário (R$)",
        "formula_katex": "\\text{Produtividade} = \\frac{\\text{PIB Total}}{\\text{População Ocupada Média}}",
        "referencia_analise": {
            "interpretacao": "Valor adicionado médio gerado por cada trabalhador ocupado na economia estadual.",
            "limiar_corte": "Ganhos reais de eficiência do trabalho.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Reflete a densidade tecnológica, sofisticação produtiva e capital humano do Estado."
        }
    },
    "IDEB Anos Iniciais (5º) - Estadual": {
        "cd_indicador": "ideb_5ano_estadual",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais do ensino fundamental na rede estadual de ensino.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Qualidade do aprendizado e rendimento nos primeiros anos escolares."
        }
    },
    "ideb_5ano_estadual": {
        "cd_indicador": "ideb_5ano_estadual",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais do ensino fundamental na rede estadual de ensino.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Qualidade do aprendizado e rendimento nos primeiros anos escolares."
        }
    },
    "IDEB Anos Iniciais (5º) - Pública": {
        "cd_indicador": "ideb_5ano_publica",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Pública",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{pública} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais consolidando as redes estadual e municipais de ensino público.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Expressa a qualidade global do ensino fundamental público no Estado."
        }
    },
    "ideb_5ano_publica": {
        "cd_indicador": "ideb_5ano_publica",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Pública",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{pública} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais consolidando as redes estadual e municipais de ensino público.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Expressa a qualidade global do ensino fundamental público no Estado."
        }
    },
    "IDEB Anos Iniciais (5º) - Privada": {
        "cd_indicador": "ideb_5ano_privada",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais nas instituições privadas de ensino.",
            "limiar_corte": "Referência de excelência educacional.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Permite comparar o aprendizado entre a rede privada e as redes públicas."
        }
    },
    "ideb_5ano_privada": {
        "cd_indicador": "ideb_5ano_privada",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais nas instituições privadas de ensino.",
            "limiar_corte": "Referência de excelência educacional.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Permite comparar o aprendizado entre a rede privada e as redes públicas."
        }
    },
    "IDEB Anos Iniciais (5º) - Total": {
        "cd_indicador": "ideb_5ano_total",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais consolidado em todas as redes do Estado.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Visão agregada da educação básica no início do ensino fundamental."
        }
    },
    "ideb_5ano_total": {
        "cd_indicador": "ideb_5ano_total",
        "nm_indicador": "IDEB Anos Iniciais (5º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos iniciais consolidado em todas as redes do Estado.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Visão agregada da educação básica no início do ensino fundamental."
        }
    },
    "IDEB Anos Finais (9º) - Estadual": {
        "cd_indicador": "ideb_9ano_estadual",
        "nm_indicador": "IDEB Anos Finais (9º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do ensino fundamental na rede estadual.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Identifica o desempenho na etapa final do ensino fundamental estadual."
        }
    },
    "ideb_9ano_estadual": {
        "cd_indicador": "ideb_9ano_estadual",
        "nm_indicador": "IDEB Anos Finais (9º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do ensino fundamental na rede estadual.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Identifica o desempenho na etapa final do ensino fundamental estadual."
        }
    },
    "IDEB Anos Finais (9º) - Pública": {
        "cd_indicador": "ideb_9ano_publica",
        "nm_indicador": "IDEB Anos Finais (9º) - Pública",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{pública} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais consolidando as redes estadual e municipais de ensino.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia a preparação dos estudantes públicos antes do ingresso no ensino médio."
        }
    },
    "ideb_9ano_publica": {
        "cd_indicador": "ideb_9ano_publica",
        "nm_indicador": "IDEB Anos Finais (9º) - Pública",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{pública} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais consolidando as redes estadual e municipais de ensino.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia a preparação dos estudantes públicos antes do ingresso no ensino médio."
        }
    },
    "IDEB Anos Finais (9º) - Privada": {
        "cd_indicador": "ideb_9ano_privada",
        "nm_indicador": "IDEB Anos Finais (9º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do fundamental na rede particular.",
            "limiar_corte": "Padrão pedagógico do segmento privado.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Baliza comparativa de desempenho escolar na transição para o ensino médio."
        }
    },
    "ideb_9ano_privada": {
        "cd_indicador": "ideb_9ano_privada",
        "nm_indicador": "IDEB Anos Finais (9º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do fundamental na rede particular.",
            "limiar_corte": "Padrão pedagógico do segmento privado.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Baliza comparativa de desempenho escolar na transição para o ensino médio."
        }
    },
    "IDEB Anos Finais (9º) - Total": {
        "cd_indicador": "ideb_9ano_total",
        "nm_indicador": "IDEB Anos Finais (9º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do ensino fundamental consolidado em todas as redes.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Métrica geral da qualidade dos concluintes do ensino fundamental."
        }
    },
    "ideb_9ano_total": {
        "cd_indicador": "ideb_9ano_total",
        "nm_indicador": "IDEB Anos Finais (9º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB dos anos finais do ensino fundamental consolidado em todas as redes.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Métrica geral da qualidade dos concluintes do ensino fundamental."
        }
    },
    "IDEB Ensino Médio (3º) - Estadual": {
        "cd_indicador": "ideb_3ano_estadual",
        "nm_indicador": "IDEB Ensino Médio (3º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB da 3ª série do ensino médio na rede estadual (responsabilidade primária do Estado).",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Principal indicador de êxito da política pedagógica gerida diretamente pelo Governo do Estado."
        }
    },
    "ideb_3ano_estadual": {
        "cd_indicador": "ideb_3ano_estadual",
        "nm_indicador": "IDEB Ensino Médio (3º) - Estadual",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB da 3ª série do ensino médio na rede estadual (responsabilidade primária do Estado).",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Principal indicador de êxito da política pedagógica gerida diretamente pelo Governo do Estado."
        }
    },
    "IDEB Ensino Médio (3º) - Privada": {
        "cd_indicador": "ideb_3ano_privada",
        "nm_indicador": "IDEB Ensino Médio (3º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM, privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB do ensino médio na rede privada de ensino.",
            "limiar_corte": "Desempenho da rede particular.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Parâmetro de comparação para o rendimento e aprendizado no ensino médio."
        }
    },
    "ideb_3ano_privada": {
        "cd_indicador": "ideb_3ano_privada",
        "nm_indicador": "IDEB Ensino Médio (3º) - Privada",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM, privada} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB do ensino médio na rede privada de ensino.",
            "limiar_corte": "Desempenho da rede particular.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Parâmetro de comparação para o rendimento e aprendizado no ensino médio."
        }
    },
    "IDEB Ensino Médio (3º) - Total": {
        "cd_indicador": "ideb_3ano_total",
        "nm_indicador": "IDEB Ensino Médio (3º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM, total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB do ensino médio consolidando todas as redes do Estado.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o nível geral de conhecimento dos concluintes da educação básica."
        }
    },
    "ideb_3ano_total": {
        "cd_indicador": "ideb_3ano_total",
        "nm_indicador": "IDEB Ensino Médio (3º) - Total",
        "subdimensao": "Educação Básica",
        "natureza": "Índice (0 a 10)",
        "formula_katex": "\\text{IDEB}_{EM, total} = N \\times P",
        "referencia_analise": {
            "interpretacao": "IDEB do ensino médio consolidando todas as redes do Estado.",
            "limiar_corte": "Meta Inep/MEC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o nível geral de conhecimento dos concluintes da educação básica."
        }
    },
    "Taxa de Abandono - E. Médio (Estadual)": {
        "cd_indicador": "aba_em_estadual",
        "nm_indicador": "Taxa de Abandono - E. Médio (Estadual)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono} = \\frac{\\text{Evadidos}}{\\text{Matrícula Inicial}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de estudantes da rede estadual que abandonaram o ensino médio no ano letivo.",
            "limiar_corte": "Redução contínua em direção a zero.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Direciona ações de permanência escolar, ensino integral e assistência estudantil."
        }
    },
    "aba_em_estadual": {
        "cd_indicador": "aba_em_estadual",
        "nm_indicador": "Taxa de Abandono - E. Médio (Estadual)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono} = \\frac{\\text{Evadidos}}{\\text{Matrícula Inicial}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de estudantes da rede estadual que abandonaram o ensino médio no ano letivo.",
            "limiar_corte": "Redução contínua em direção a zero.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Direciona ações de permanência escolar, ensino integral e assistência estudantil."
        }
    },
    "Taxa de Abandono - E. Médio (Pública)": {
        "cd_indicador": "aba_em_publica",
        "nm_indicador": "Taxa de Abandono - E. Médio (Pública)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{pública} = \\frac{\\text{Evadidos Redes Públicas}}{\\text{Matrículas Públicas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de evasão no ensino médio das redes públicas (estadual e federal).",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Mede a perda de estudantes em todo o sistema público de ensino médio."
        }
    },
    "aba_em_publica": {
        "cd_indicador": "aba_em_publica",
        "nm_indicador": "Taxa de Abandono - E. Médio (Pública)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{pública} = \\frac{\\text{Evadidos Redes Públicas}}{\\text{Matrículas Públicas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de evasão no ensino médio das redes públicas (estadual e federal).",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Mede a perda de estudantes em todo o sistema público de ensino médio."
        }
    },
    "Taxa de Abandono - E. Médio (Privada)": {
        "cd_indicador": "aba_em_privada",
        "nm_indicador": "Taxa de Abandono - E. Médio (Privada)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{privada} = \\frac{\\text{Evadidos Privada}}{\\text{Matrículas Privada}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de abandono escolar no ensino médio das escolas particulares.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Referência comparativa sobre retenção discente."
        }
    },
    "aba_em_privada": {
        "cd_indicador": "aba_em_privada",
        "nm_indicador": "Taxa de Abandono - E. Médio (Privada)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{privada} = \\frac{\\text{Evadidos Privada}}{\\text{Matrículas Privada}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de abandono escolar no ensino médio das escolas particulares.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Referência comparativa sobre retenção discente."
        }
    },
    "Taxa de Abandono - E. Médio (Federal)": {
        "cd_indicador": "aba_em_federal",
        "nm_indicador": "Taxa de Abandono - E. Médio (Federal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{federal} = \\frac{\\text{Evadidos Federal}}{\\text{Matrículas Federal}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de evasão nos Institutos Federais e colégios de aplicação federais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Desempenho da rede técnica federal no Estado."
        }
    },
    "aba_em_federal": {
        "cd_indicador": "aba_em_federal",
        "nm_indicador": "Taxa de Abandono - E. Médio (Federal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{federal} = \\frac{\\text{Evadidos Federal}}{\\text{Matrículas Federal}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de evasão nos Institutos Federais e colégios de aplicação federais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Desempenho da rede técnica federal no Estado."
        }
    },
    "Taxa de Abandono - E. Médio (Municipal)": {
        "cd_indicador": "aba_em_municipal",
        "nm_indicador": "Taxa de Abandono - E. Médio (Municipal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{municipal} = \\frac{\\text{Evadidos Municipal}}{\\text{Matrículas Municipal}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de abandono em escolas municipais autorizadas a ofertar ensino médio.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Acompanhamento de turmas pontuais de ensino médio municipal."
        }
    },
    "aba_em_municipal": {
        "cd_indicador": "aba_em_municipal",
        "nm_indicador": "Taxa de Abandono - E. Médio (Municipal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{municipal} = \\frac{\\text{Evadidos Municipal}}{\\text{Matrículas Municipal}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa de abandono em escolas municipais autorizadas a ofertar ensino médio.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Acompanhamento de turmas pontuais de ensino médio municipal."
        }
    },
    "Taxa de Abandono - E. Médio (Total)": {
        "cd_indicador": "aba_em_total",
        "nm_indicador": "Taxa de Abandono - E. Médio (Total)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{total} = \\frac{\\text{Total Evadidos}}{\\text{Total Matrículas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa total de abandono escolar no ensino médio consolidando todas as redes.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Métrica agregada de preservação do vínculo escolar da juventude."
        }
    },
    "aba_em_total": {
        "cd_indicador": "aba_em_total",
        "nm_indicador": "Taxa de Abandono - E. Médio (Total)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{Abandono}_{total} = \\frac{\\text{Total Evadidos}}{\\text{Total Matrículas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Taxa total de abandono escolar no ensino médio consolidando todas as redes.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Métrica agregada de preservação do vínculo escolar da juventude."
        }
    },
    "Distorção Idade-Série - E. Médio (Estadual)": {
        "cd_indicador": "tdi_em_estadual",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Estadual)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI} = \\frac{\\text{Alunos com 2+ anos de atraso}}{\\text{Total de Alunos Matriculados}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de estudantes do ensino médio estadual com atraso escolar de 2 ou mais anos.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Orienta políticas de correção de fluxo, aceleração e combate à repetência."
        }
    },
    "tdi_em_estadual": {
        "cd_indicador": "tdi_em_estadual",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Estadual)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI} = \\frac{\\text{Alunos com 2+ anos de atraso}}{\\text{Total de Alunos Matriculados}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de estudantes do ensino médio estadual com atraso escolar de 2 ou mais anos.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Orienta políticas de correção de fluxo, aceleração e combate à repetência."
        }
    },
    "Distorção Idade-Série - E. Médio (Pública)": {
        "cd_indicador": "tdi_em_publica",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Pública)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{pública} = \\frac{\\text{Alunos com atraso nas redes públicas}}{\\text{Matrículas Públicas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de defasagem idade-série nas redes públicas de ensino médio.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Mede o acúmulo de reprovações e evasões pregressas no ensino público."
        }
    },
    "tdi_em_publica": {
        "cd_indicador": "tdi_em_publica",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Pública)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{pública} = \\frac{\\text{Alunos com atraso nas redes públicas}}{\\text{Matrículas Públicas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de defasagem idade-série nas redes públicas de ensino médio.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Mede o acúmulo de reprovações e evasões pregressas no ensino público."
        }
    },
    "Distorção Idade-Série - E. Médio (Privada)": {
        "cd_indicador": "tdi_em_privada",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Privada)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{privada} = \\frac{\\text{Alunos com atraso na rede privada}}{\\text{Matrículas Privadas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de atraso escolar no ensino médio das escolas privadas.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Parâmetro de fluxo escolar do setor privado."
        }
    },
    "tdi_em_privada": {
        "cd_indicador": "tdi_em_privada",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Privada)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{privada} = \\frac{\\text{Alunos com atraso na rede privada}}{\\text{Matrículas Privadas}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de atraso escolar no ensino médio das escolas privadas.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Parâmetro de fluxo escolar do setor privado."
        }
    },
    "Distorção Idade-Série - E. Médio (Federal)": {
        "cd_indicador": "tdi_em_federal",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Federal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{federal} = \\frac{\\text{Alunos com atraso na rede federal}}{\\text{Matrículas Federais}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Defasagem idade-série nas escolas técnicas e institutos federais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Monitoramento do fluxo na rede técnica federal."
        }
    },
    "tdi_em_federal": {
        "cd_indicador": "tdi_em_federal",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Federal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{federal} = \\frac{\\text{Alunos com atraso na rede federal}}{\\text{Matrículas Federais}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Defasagem idade-série nas escolas técnicas e institutos federais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Monitoramento do fluxo na rede técnica federal."
        }
    },
    "Distorção Idade-Série - E. Médio (Municipal)": {
        "cd_indicador": "tdi_em_municipal",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Municipal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{municipal} = \\frac{\\text{Alunos com atraso na rede municipal}}{\\text{Matrículas Municipais}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Defasagem idade-série em turmas de ensino médio municipais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Acompanhamento do rendimento em redes municipais."
        }
    },
    "tdi_em_municipal": {
        "cd_indicador": "tdi_em_municipal",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Municipal)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{municipal} = \\frac{\\text{Alunos com atraso na rede municipal}}{\\text{Matrículas Municipais}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Defasagem idade-série em turmas de ensino médio municipais.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Acompanhamento do rendimento em redes municipais."
        }
    },
    "Distorção Idade-Série - E. Médio (Total)": {
        "cd_indicador": "tdi_em_total",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Total)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{total} = \\frac{\\text{Total Alunos com atraso}}{\\text{Total Alunos Matriculados}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Distorção idade-série no ensino médio considerando todas as redes de ensino do Estado.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Panorama consolidado de retenção e fluxo escolar na juventude."
        }
    },
    "tdi_em_total": {
        "cd_indicador": "tdi_em_total",
        "nm_indicador": "Distorção Idade-Série - E. Médio (Total)",
        "subdimensao": "Fluxo Escolar",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TDI}_{total} = \\frac{\\text{Total Alunos com atraso}}{\\text{Total Alunos Matriculados}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Distorção idade-série no ensino médio considerando todas as redes de ensino do Estado.",
            "limiar_corte": "Redução contínua.",
            "direcao_desejavel": "Redução / Quanto menor, melhor",
            "impacto_planejamento": "Panorama consolidado de retenção e fluxo escolar na juventude."
        }
    },
    "Taxa Bruta de Creche (%)": {
        "cd_indicador": "tx_creche_pct",
        "nm_indicador": "Taxa Bruta de Creche (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaBrutaCreche} = \\frac{\\text{Matrículas em Creche}}{\\text{População de 0 a 3 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Razão entre o total de matrículas em creche e a população de 0 a 3 anos.",
            "limiar_corte": "Meta 1 do PNE (50%).",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o esforço de ampliação da cobertura na primeira infância."
        }
    },
    "tx_creche_pct": {
        "cd_indicador": "tx_creche_pct",
        "nm_indicador": "Taxa Bruta de Creche (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaBrutaCreche} = \\frac{\\text{Matrículas em Creche}}{\\text{População de 0 a 3 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Razão entre o total de matrículas em creche e a população de 0 a 3 anos.",
            "limiar_corte": "Meta 1 do PNE (50%).",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o esforço de ampliação da cobertura na primeira infância."
        }
    },
    "Taxa Líquida de Creche (%)": {
        "cd_indicador": "tx_liq_creche_pct",
        "nm_indicador": "Taxa Líquida de Creche (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaLíquidaCreche} = \\frac{\\text{Crianças de 0 a 3 anos em Creche}}{\\text{População de 0 a 3 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de crianças na faixa de 0 a 3 anos efetivamente matriculadas em creches.",
            "limiar_corte": "Atendimento na faixa etária correta.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Atendimento estrito da faixa etária correta na primeira infância."
        }
    },
    "tx_liq_creche_pct": {
        "cd_indicador": "tx_liq_creche_pct",
        "nm_indicador": "Taxa Líquida de Creche (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaLíquidaCreche} = \\frac{\\text{Crianças de 0 a 3 anos em Creche}}{\\text{População de 0 a 3 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de crianças na faixa de 0 a 3 anos efetivamente matriculadas em creches.",
            "limiar_corte": "Atendimento na faixa etária correta.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Atendimento estrito da faixa etária correta na primeira infância."
        }
    },
    "Matrículas em Creche (Abs.)": {
        "cd_indicador": "tx_creche_abs",
        "nm_indicador": "Matrículas em Creche (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Creche} = \\sum \\text{Matrículas apuradas no Censo Escolar}",
        "referencia_analise": {
            "interpretacao": "Número absoluto total de crianças atendidas em creches no Estado.",
            "limiar_corte": "Expansão contínua da rede física de vagas.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Dimensiona a infraestrutura existente e a demanda por novos centros infantis."
        }
    },
    "tx_creche_abs": {
        "cd_indicador": "tx_creche_abs",
        "nm_indicador": "Matrículas em Creche (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Creche} = \\sum \\text{Matrículas apuradas no Censo Escolar}",
        "referencia_analise": {
            "interpretacao": "Número absoluto total de crianças atendidas em creches no Estado.",
            "limiar_corte": "Expansão contínua da rede física de vagas.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Dimensiona a infraestrutura existente e a demanda por novos centros infantis."
        }
    },
    "Matrículas Líquidas em Creche (Abs.)": {
        "cd_indicador": "tx_liq_creche_abs",
        "nm_indicador": "Matrículas Líquidas em Creche (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Líquidas} = \\sum \\text{Matrículas de crianças de 0 a 3 anos}",
        "referencia_analise": {
            "interpretacao": "Contingente absoluto de crianças de 0 a 3 anos atendidas em creche.",
            "limiar_corte": "Adequação etária.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Foco na proteção social e desenvolvimento motor/cognitivo na idade certa."
        }
    },
    "tx_liq_creche_abs": {
        "cd_indicador": "tx_liq_creche_abs",
        "nm_indicador": "Matrículas Líquidas em Creche (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Líquidas} = \\sum \\text{Matrículas de crianças de 0 a 3 anos}",
        "referencia_analise": {
            "interpretacao": "Contingente absoluto de crianças de 0 a 3 anos atendidas em creche.",
            "limiar_corte": "Adequação etária.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Foco na proteção social e desenvolvimento motor/cognitivo na idade certa."
        }
    },
    "Taxa Bruta de Pré-escola (%)": {
        "cd_indicador": "tx_pre_escola_pct",
        "nm_indicador": "Taxa Bruta de Pré-escola (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaBrutaPréEscola} = \\frac{\\text{Matrículas em Pré-escola}}{\\text{População de 4 a 5 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Proporção entre total de matrículas na pré-escola e população de 4 e 5 anos.",
            "limiar_corte": "Universalização (100%) conforme PNE.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Etapa constitucionalmente obrigatória da educação infantil."
        }
    },
    "tx_pre_escola_pct": {
        "cd_indicador": "tx_pre_escola_pct",
        "nm_indicador": "Taxa Bruta de Pré-escola (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaBrutaPréEscola} = \\frac{\\text{Matrículas em Pré-escola}}{\\text{População de 4 a 5 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Proporção entre total de matrículas na pré-escola e população de 4 e 5 anos.",
            "limiar_corte": "Universalização (100%) conforme PNE.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Etapa constitucionalmente obrigatória da educação infantil."
        }
    },
    "Taxa Líquida de Pré-escola (%)": {
        "cd_indicador": "tx_liq_pre_escola_pct",
        "nm_indicador": "Taxa Líquida de Pré-escola (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaLíquidaPréEscola} = \\frac{\\text{Crianças de 4 a 5 anos em Pré-escola}}{\\text{População de 4 a 5 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de crianças de 4 e 5 anos matriculadas na etapa correta de pré-escola.",
            "limiar_corte": "100% de atendimento.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Garante o ingresso oportuno no ciclo obrigatório de ensino formal."
        }
    },
    "tx_liq_pre_escola_pct": {
        "cd_indicador": "tx_liq_pre_escola_pct",
        "nm_indicador": "Taxa Líquida de Pré-escola (%)",
        "subdimensao": "Educação Infantil",
        "natureza": "Percentual (%)",
        "formula_katex": "\\text{TaxaLíquidaPréEscola} = \\frac{\\text{Crianças de 4 a 5 anos em Pré-escola}}{\\text{População de 4 a 5 anos}} \\times 100\\%",
        "referencia_analise": {
            "interpretacao": "Percentual de crianças de 4 e 5 anos matriculadas na etapa correta de pré-escola.",
            "limiar_corte": "100% de atendimento.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Garante o ingresso oportuno no ciclo obrigatório de ensino formal."
        }
    },
    "Matrículas em Pré-escola (Abs.)": {
        "cd_indicador": "tx_pre_escola_abs",
        "nm_indicador": "Matrículas em Pré-escola (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Pré-escola} = \\sum \\text{Matrículas no Censo Escolar}",
        "referencia_analise": {
            "interpretacao": "Total de vagas preenchidas na pré-escola em todo o território estadual.",
            "limiar_corte": "Universalização das vagas.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia a oferta de vagas pré-escolares nos municípios do Estado."
        }
    },
    "tx_pre_escola_abs": {
        "cd_indicador": "tx_pre_escola_abs",
        "nm_indicador": "Matrículas em Pré-escola (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Pré-escola} = \\sum \\text{Matrículas no Censo Escolar}",
        "referencia_analise": {
            "interpretacao": "Total de vagas preenchidas na pré-escola em todo o território estadual.",
            "limiar_corte": "Universalização das vagas.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Avalia a oferta de vagas pré-escolares nos municípios do Estado."
        }
    },
    "Matrículas Líquidas em Pré-escola (Abs.)": {
        "cd_indicador": "tx_liq_pre_escola_abs",
        "nm_indicador": "Matrículas Líquidas em Pré-escola (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Líquidas} = \\sum \\text{Matrículas de crianças de 4 e 5 anos}",
        "referencia_analise": {
            "interpretacao": "Crianças de 4 e 5 anos matriculadas estritamente na pré-escola.",
            "limiar_corte": "Atendimento na idade adequada.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Consolidação das turmas de pré-escola pré-ensino fundamental."
        }
    },
    "tx_liq_pre_escola_abs": {
        "cd_indicador": "tx_liq_pre_escola_abs",
        "nm_indicador": "Matrículas Líquidas em Pré-escola (Abs.)",
        "subdimensao": "Educação Infantil",
        "natureza": "Matrículas (Qtd)",
        "formula_katex": "\\text{Matrículas Líquidas} = \\sum \\text{Matrículas de crianças de 4 e 5 anos}",
        "referencia_analise": {
            "interpretacao": "Crianças de 4 e 5 anos matriculadas estritamente na pré-escola.",
            "limiar_corte": "Atendimento na idade adequada.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Consolidação das turmas de pré-escola pré-ensino fundamental."
        }
    },
    "Área Total Protegida em UCs (ha)": {
        "cd_indicador": "area_uc_total",
        "nm_indicador": "Área Total Protegida em UCs (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{total} = \\sum \\text{Área (ha) de todas as Unidades de Conservação}",
        "referencia_analise": {
            "interpretacao": "Área geográfica sob proteção ambiental formal através de unidades de conservação.",
            "limiar_corte": "Metas globais de conservação de biodiversidade.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Preservação de recursos hídricos, proteção de biomas e mitigação climática."
        }
    },
    "area_uc_total": {
        "cd_indicador": "area_uc_total",
        "nm_indicador": "Área Total Protegida em UCs (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{total} = \\sum \\text{Área (ha) de todas as Unidades de Conservação}",
        "referencia_analise": {
            "interpretacao": "Área geográfica sob proteção ambiental formal através de unidades de conservação.",
            "limiar_corte": "Metas globais de conservação de biodiversidade.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Preservação de recursos hídricos, proteção de biomas e mitigação climática."
        }
    },
    "Área Protegida em UCs Estaduais (ha)": {
        "cd_indicador": "area_uc_est",
        "nm_indicador": "Área Protegida em UCs Estaduais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{estadual} = \\sum \\text{Área (ha) de UCs geridas pelo Estado}",
        "referencia_analise": {
            "interpretacao": "Extensão territorial protegida sob governança e fiscalização dos órgãos estaduais de meio ambiente.",
            "limiar_corte": "Expansão da cobertura protegida.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o esforço direto da gestão estadual na criação e manutenção de parques e reservas."
        }
    },
    "area_uc_est": {
        "cd_indicador": "area_uc_est",
        "nm_indicador": "Área Protegida em UCs Estaduais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{estadual} = \\sum \\text{Área (ha) de UCs geridas pelo Estado}",
        "referencia_analise": {
            "interpretacao": "Extensão territorial protegida sob governança e fiscalização dos órgãos estaduais de meio ambiente.",
            "limiar_corte": "Expansão da cobertura protegida.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mede o esforço direto da gestão estadual na criação e manutenção de parques e reservas."
        }
    },
    "Área Protegida em UCs Federais (ha)": {
        "cd_indicador": "area_uc_fed",
        "nm_indicador": "Área Protegida em UCs Federais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{federal} = \\sum \\text{Área (ha) de UCs federais no Estado}",
        "referencia_analise": {
            "interpretacao": "Área sob proteção em Unidades de Conservação geridas pelo Instituto Chico Mendes (ICMBio).",
            "limiar_corte": "Integração ao SNUC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mapeia os refúgios federais e reservas biológicas estabelecidas na UF."
        }
    },
    "area_uc_fed": {
        "cd_indicador": "area_uc_fed",
        "nm_indicador": "Área Protegida em UCs Federais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{federal} = \\sum \\text{Área (ha) de UCs federais no Estado}",
        "referencia_analise": {
            "interpretacao": "Área sob proteção em Unidades de Conservação geridas pelo Instituto Chico Mendes (ICMBio).",
            "limiar_corte": "Integração ao SNUC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Mapeia os refúgios federais e reservas biológicas estabelecidas na UF."
        }
    },
    "Área Protegida em UCs Municipais (ha)": {
        "cd_indicador": "area_uc_mun",
        "nm_indicador": "Área Protegida em UCs Municipais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{municipal} = \\sum \\text{Área (ha) de UCs geridas por municípios}",
        "referencia_analise": {
            "interpretacao": "Hectares protegidos sob legislação e fiscalização dos municípios da UF.",
            "limiar_corte": "Municipalização ambiental.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Fortalece o mosaico verde e áreas de proteção ambiental urbana."
        }
    },
    "area_uc_mun": {
        "cd_indicador": "area_uc_mun",
        "nm_indicador": "Área Protegida em UCs Municipais (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{ÁreaUC}_{municipal} = \\sum \\text{Área (ha) de UCs geridas por municípios}",
        "referencia_analise": {
            "interpretacao": "Hectares protegidos sob legislação e fiscalização dos municípios da UF.",
            "limiar_corte": "Municipalização ambiental.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Fortalece o mosaico verde e áreas de proteção ambiental urbana."
        }
    },
    "Área em Proteção Integral (ha)": {
        "cd_indicador": "area_uc_pi",
        "nm_indicador": "Área em Proteção Integral (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{Área}_{PI} = \\sum \\text{Área de Parques, Estações Ecológicas e Reservas Biológicas}",
        "referencia_analise": {
            "interpretacao": "Unidades de Conservação voltadas exclusivamente à preservação ecológica sem uso direto de recursos.",
            "limiar_corte": "Preservação estrita.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Garantia de santuários ecológicos intocados para preservação de fauna e flora."
        }
    },
    "area_uc_pi": {
        "cd_indicador": "area_uc_pi",
        "nm_indicador": "Área em Proteção Integral (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{Área}_{PI} = \\sum \\text{Área de Parques, Estações Ecológicas e Reservas Biológicas}",
        "referencia_analise": {
            "interpretacao": "Unidades de Conservação voltadas exclusivamente à preservação ecológica sem uso direto de recursos.",
            "limiar_corte": "Preservação estrita.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Garantia de santuários ecológicos intocados para preservação de fauna e flora."
        }
    },
    "Área em Uso Sustentável (ha)": {
        "cd_indicador": "area_uc_us",
        "nm_indicador": "Área em Uso Sustentável (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{Área}_{US} = \\sum \\text{Área de APAs, FLONAS e Reservas Extrativistas}",
        "referencia_analise": {
            "interpretacao": "Áreas protegidas que compatibilizam a conservação ambiental com atividades humanas e manejo sustentável.",
            "limiar_corte": "Manejo sustentável regulamentado.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Integra desenvolvimento econômico local sustentável com proteção ecológica."
        }
    },
    "area_uc_us": {
        "cd_indicador": "area_uc_us",
        "nm_indicador": "Área em Uso Sustentável (ha)",
        "subdimensao": "Meio Ambiente",
        "natureza": "Hectares (ha)",
        "formula_katex": "\\text{Área}_{US} = \\sum \\text{Área de APAs, FLONAS e Reservas Extrativistas}",
        "referencia_analise": {
            "interpretacao": "Áreas protegidas que compatibilizam a conservação ambiental com atividades humanas e manejo sustentável.",
            "limiar_corte": "Manejo sustentável regulamentado.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Integra desenvolvimento econômico local sustentável com proteção ecológica."
        }
    },
    "Total de Unidades de Conservação": {
        "cd_indicador": "qtd_uc_total",
        "nm_indicador": "Total de Unidades de Conservação",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC} = \\text{Contagem de todas as UCs formalmente instituídas}",
        "referencia_analise": {
            "interpretacao": "Número total de Unidades de Conservação formalmente estabelecidas no território estadual.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Densidade da malha de áreas protegidas no Estado."
        }
    },
    "qtd_uc_total": {
        "cd_indicador": "qtd_uc_total",
        "nm_indicador": "Total de Unidades de Conservação",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC} = \\text{Contagem de todas as UCs formalmente instituídas}",
        "referencia_analise": {
            "interpretacao": "Número total de Unidades de Conservação formalmente estabelecidas no território estadual.",
            "limiar_corte": "Monitoramento contínuo.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Densidade da malha de áreas protegidas no Estado."
        }
    },
    "Unidades de Conservação Estaduais": {
        "cd_indicador": "qtd_uc_est",
        "nm_indicador": "Unidades de Conservação Estaduais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{estadual} = \\text{Contagem de UCs do órgão ambiental estadual}",
        "referencia_analise": {
            "interpretacao": "Número de Unidades de Conservação de competência executiva do Estado.",
            "limiar_corte": "Fortalecimento do SNUC estadual.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Reflete o alcance da fiscalização e planos de manejo do governo estadual."
        }
    },
    "qtd_uc_est": {
        "cd_indicador": "qtd_uc_est",
        "nm_indicador": "Unidades de Conservação Estaduais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{estadual} = \\text{Contagem de UCs do órgão ambiental estadual}",
        "referencia_analise": {
            "interpretacao": "Número de Unidades de Conservação de competência executiva do Estado.",
            "limiar_corte": "Fortalecimento do SNUC estadual.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Reflete o alcance da fiscalização e planos de manejo do governo estadual."
        }
    },
    "Unidades de Conservação Federais": {
        "cd_indicador": "qtd_uc_fed",
        "nm_indicador": "Unidades de Conservação Federais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{federal} = \\text{Contagem de UCs federais no Estado}",
        "referencia_analise": {
            "interpretacao": "Número de unidades administradas pelo governo federal na UF.",
            "limiar_corte": "Articulação federativa SNUC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Cooperação entre esferas estadual e federal no manejo dos parques."
        }
    },
    "qtd_uc_fed": {
        "cd_indicador": "qtd_uc_fed",
        "nm_indicador": "Unidades de Conservação Federais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{federal} = \\text{Contagem de UCs federais no Estado}",
        "referencia_analise": {
            "interpretacao": "Número de unidades administradas pelo governo federal na UF.",
            "limiar_corte": "Articulação federativa SNUC.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Cooperação entre esferas estadual e federal no manejo dos parques."
        }
    },
    "Unidades de Conservação Municipais": {
        "cd_indicador": "qtd_uc_mun",
        "nm_indicador": "Unidades de Conservação Municipais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{municipal} = \\text{Contagem de UCs municipais no Estado}",
        "referencia_analise": {
            "interpretacao": "Número de unidades criadas e mantidas pelos municípios da UF.",
            "limiar_corte": "Engajamento local.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Capilaridade da rede de proteção nos municípios."
        }
    },
    "qtd_uc_mun": {
        "cd_indicador": "qtd_uc_mun",
        "nm_indicador": "Unidades de Conservação Municipais",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{municipal} = \\text{Contagem de UCs municipais no Estado}",
        "referencia_analise": {
            "interpretacao": "Número de unidades criadas e mantidas pelos municípios da UF.",
            "limiar_corte": "Engajamento local.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Capilaridade da rede de proteção nos municípios."
        }
    },
    "Unidades de Conservação em Proteção Integral": {
        "cd_indicador": "qtd_uc_pi",
        "nm_indicador": "Unidades de Conservação em Proteção Integral",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{PI} = \\text{Contagem de UCs de Proteção Integral}",
        "referencia_analise": {
            "interpretacao": "Quantidade de parques, refúgios da vida silvestre e reservas biológicas.",
            "limiar_corte": "Preservação de ecossistemas frágeis.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Equipamentos estaduais de pesquisa, ecoturismo e conservação."
        }
    },
    "qtd_uc_pi": {
        "cd_indicador": "qtd_uc_pi",
        "nm_indicador": "Unidades de Conservação em Proteção Integral",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{PI} = \\text{Contagem de UCs de Proteção Integral}",
        "referencia_analise": {
            "interpretacao": "Quantidade de parques, refúgios da vida silvestre e reservas biológicas.",
            "limiar_corte": "Preservação de ecossistemas frágeis.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Equipamentos estaduais de pesquisa, ecoturismo e conservação."
        }
    },
    "Unidades de Conservação em Uso Sustentável": {
        "cd_indicador": "qtd_uc_us",
        "nm_indicador": "Unidades de Conservação em Uso Sustentável",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{US} = \\text{Contagem de UCs de Uso Sustentável}",
        "referencia_analise": {
            "interpretacao": "Quantidade de Áreas de Proteção Ambiental (APAs) e reservas de uso sustentável.",
            "limiar_corte": "Zoneamento ecológico-econômico.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Harmonização de atividades produtivas com manutenção dos serviços ecossistêmicos."
        }
    },
    "qtd_uc_us": {
        "cd_indicador": "qtd_uc_us",
        "nm_indicador": "Unidades de Conservação em Uso Sustentável",
        "subdimensao": "Meio Ambiente",
        "natureza": "Unidades (Qtd)",
        "formula_katex": "\\text{QtdUC}_{US} = \\text{Contagem de UCs de Uso Sustentável}",
        "referencia_analise": {
            "interpretacao": "Quantidade de Áreas de Proteção Ambiental (APAs) e reservas de uso sustentável.",
            "limiar_corte": "Zoneamento ecológico-econômico.",
            "direcao_desejavel": "Aumento / Quanto maior, melhor",
            "impacto_planejamento": "Harmonização de atividades produtivas com manutenção dos serviços ecossistêmicos."
        }
    }
};

// Helper de Normalização de String para Busca de Metadados
function normKeyUFs(str) {
    return String(str || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca Metadados do Indicador (Dicionário Local UFs ou Metadados Globais da Ficha)
function buscarMetadadoUFs(siglaOrKey) {
    if (!siglaOrKey) return null;

    // 1. Busca exata no dicionário UFs
    if (dicionarioMetadadosUFs[siglaOrKey]) {
        return dicionarioMetadadosUFs[siglaOrKey];
    }

    // 2. Busca normalizada no dicionário UFs
    const sNorm = normKeyUFs(siglaOrKey);
    for (const k in dicionarioMetadadosUFs) {
        if (normKeyUFs(k) === sNorm) {
            return dicionarioMetadadosUFs[k];
        }
    }

    // 3. Busca no dicionário global de metadados da Ficha
    if (window.dadosMetadados && Array.isArray(window.dadosMetadados)) {
        const found = window.dadosMetadados.find(m => 
            normKeyUFs(m.cd_indicador) === sNorm || normKeyUFs(m.nm_indicador) === sNorm
        );
        if (found) return found;
    }

    return null;
}

// Abre o Modal de Metadados (reutiliza o modal unificado #modalMetadado)
window.abrirModalMetadadoUFs = function(siglaOrKey, tipoDado) {
    const meta = buscarMetadadoUFs(siglaOrKey);

    const titulo = meta?.nm_indicador || siglaOrKey;
    const badge = meta?.natureza || (tipoDado === 'fiscal' ? 'Contábil / Fiscal' : 'Socioambiental');
    const desc = meta?.referencia_analise?.interpretacao || 'Indicador estratégico de acompanhamento federativo e benchmarking das UFs.';
    const impacto = meta?.referencia_analise?.impacto_planejamento || 'Subsidia a análise comparativa de eficiência e alocação de recursos públicos entre os Estados.';
    const limiar = meta?.referencia_analise?.limiar_corte || '-';
    const direcao = meta?.referencia_analise?.direcao_desejavel || '-';

    $('#modalMetadadoTitle').text(titulo);
    $('#modalMetadadoBadge').text(badge);
    $('#modalMetadadoDesc').text(desc);
    $('#modalMetadadoImpacto').text(impacto);
    $('#modalMetadadoLimiar').text(limiar);
    $('#modalMetadadoDirecao').text(direcao);

    const formulaEl = document.getElementById('modalMetadadoFormula');
    if (formulaEl) {
        if (meta?.formula_katex && typeof katex !== 'undefined') {
            try {
                katex.render(meta.formula_katex, formulaEl, { displayMode: true, throwOnError: false });
            } catch (e) {
                formulaEl.innerText = meta.formula_katex;
            }
        } else {
            formulaEl.innerText = meta?.formula_katex || 'Fórmula sob apuração contábil / metodológica do órgão de origem.';
        }
    }

    const modalEl = document.getElementById('modalMetadado');
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
};

// Retorna o Badge de Polaridade / Sinalização no padrão de Municípios
function obterBadgePolaridadeUFs(siglaOrKey, tipoDado, config) {
    const meta = buscarMetadadoUFs(siglaOrKey);
    let dirRaw = meta?.referencia_analise?.direcao_desejavel || '';

    if (dirRaw) {
        const dir = normKeyUFs(dirRaw);
        if (dir.includes('acompanhamento') || dir.includes('vocacao') || dir.includes('estabilidade') || dir.includes('faixa') || dir.includes('manter') || dir.includes('informativo') || dir.includes('contextual') || dir.includes('neutro') || dir.includes('analise')) {
            return `<span class="badge-polaridade badge-polaridade-neutra" title="Indicador de perfil estrutural: ${dirRaw}">
                        <i class="fas fa-circle-info"></i> Contextual
                    </span>`;
        } else if (dir.includes('aumento') || dir.includes('maior') || dir.includes('crescimento')) {
            return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: Quanto maior, melhor">
                        <i class="fas fa-arrow-trend-up"></i> Maior melhor
                    </span>`;
        } else if (dir.includes('reducao') || dir.includes('menor') || dir.includes('queda')) {
            return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                        <i class="fas fa-arrow-trend-down"></i> Menor melhor
                    </span>`;
        }
    }

    // Fallback baseado na configuração do indicador
    if (config && config.isLowerBetter) {
        return `<span class="badge-polaridade badge-polaridade-baixa" title="Direção desejável: Quanto menor, melhor">
                    <i class="fas fa-arrow-trend-down"></i> Menor melhor
                </span>`;
    }

    const s = (siglaOrKey || '').toLowerCase();
    if (s.includes('ideb') || s.includes('creche') || s.includes('pre_escola') || s.includes('area_uc') || s.includes('qtd_uc') || s.includes('resultado') || s.includes('vinculação') || s.includes('pib') || s.includes('ocupada')) {
        return `<span class="badge-polaridade badge-polaridade-alta" title="Direção desejável: Quanto maior, melhor">
                    <i class="fas fa-arrow-trend-up"></i> Maior melhor
                </span>`;
    }

    return `<span class="badge-polaridade badge-polaridade-neutra" title="Indicador de perfil estrutural / contextual">
                <i class="fas fa-circle-info"></i> Contextual
            </span>`;
}

// Inicialização Lazy do Módulo
window.iniciarModuloUFs = async function() {
    if (window.moduloUFsIniciado) {
        if (typeof window.filtrarUFsLocal === 'function') window.filtrarUFsLocal();
        return;
    }

    try {
        console.log("⚡ [UFs] Inicializando Módulo de Benchmarking das UFs...");
        const basePath = window.basePath || '';

        // Carrega metadados globais se ainda não carregados
        if (!window.dadosMetadados || !Array.isArray(window.dadosMetadados) || window.dadosMetadados.length === 0) {
            try {
                const resMeta = await window.fetchSeguro(`${basePath}/api/ficha/metadados`);
                if (resMeta.ok) {
                    const jMeta = await resMeta.json();
                    window.dadosMetadados = jMeta.indicadores_dicionario || (Array.isArray(jMeta) ? jMeta : []);
                }
            } catch (e) {
                console.warn("[UFs] Falha ao carregar metadados da ficha:", e);
            }
        }

        // 1. Carrega dados fiscais
        let resFiscal = await window.fetchSeguro(`${basePath}/api/ufs/fiscal`);
        if (!resFiscal.ok) {
            resFiscal = await window.fetchSeguro(`${basePath}/data/base_painel.json`);
        }

        if (resFiscal.ok) {
            const jsonFiscal = await resFiscal.json();
            dadosMasterFiscalUFs = jsonFiscal.dados || jsonFiscal.data || [];
            if (jsonFiscal.ipca) fatoresIPCAUFs = jsonFiscal.ipca;
            if (jsonFiscal.filtros && jsonFiscal.filtros.periodos_por_ano) {
                dicionarioPeriodosUFs = jsonFiscal.filtros.periodos_por_ano;
            }
        }

        // 2. Carrega filtros e dados iniciais da UF default (PE)
        await carregarDadosUF('PE');

        // 3. Preenche dropdowns de controle
        preencherDropdownsUFs();

        window.moduloUFsIniciado = true;
        console.log("✅ [UFs] Módulo carregado com sucesso!");

    } catch (e) {
        console.error("Erro ao inicializar módulo UFs:", e);
    }
};

// Carrega os indicadores socioambientais de uma UF (via API Go com fallback)
async function carregarDadosUF(uf) {
    if (dadosSocioAmbientaisUFs[uf]) return;

    const basePath = window.basePath || '';
    try {
        const res = await window.fetchSeguro(`${basePath}/api/ufs/data?uf=${encodeURIComponent(uf)}`);
        if (res.ok) {
            const json = await res.json();
            dadosSocioAmbientaisUFs[uf] = json.indicadores || [];
            if (json.benchmarks_regiao && benchmarksRegiaoUFs.length === 0) {
                benchmarksRegiaoUFs = json.benchmarks_regiao;
            }
        }
    } catch (e) {
        console.warn(`[UFs] Aviso ao buscar dados socioambientais para ${uf}:`, e);
        dadosSocioAmbientaisUFs[uf] = [];
    }
}

// Preenche os selects da topbar
function preencherDropdownsUFs() {
    const listaUFs = [
        "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
        "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
        "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
    ];

    const $uf = $('#ufs_f_uf');
    $uf.empty();
    listaUFs.forEach(u => {
        $uf.append($('<option></option>').attr('value', u).text(u === 'PE' ? 'PE (Pernambuco)' : u));
    });
    $uf.val('PE');

    $uf.off('change').on('change', async function() {
        const selUf = $(this).val();
        await carregarDadosUF(selUf);
        window.filtrarUFsLocal();
    });

    window.filtrarUFsLocal();
}

// Alterna valores nominais vs corrigidos pelo IPCA
window.toggleIPCAUFs = function() {
    window.usarValoresReaisUFs = !window.usarValoresReaisUFs;
    const btn = document.getElementById('ufs_btn_ipca');
    const lbl = document.getElementById('ufs_btn_ipca_label');

    if (window.usarValoresReaisUFs) {
        if (btn) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
        }
        if (lbl) lbl.innerText = "Valores Reais (IPCA)";
    } else {
        if (btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        }
        if (lbl) lbl.innerText = "Valores Nominais";
    }

    window.filtrarUFsLocal();
};

// Aplica fator de correção de inflação IPCA
function aplicarIPCAUFs(valor, exercicio, isPct) {
    if (!window.usarValoresReaisUFs || isPct) return valor;
    const fator = fatoresIPCAUFs[String(exercicio)];
    if (fator && !isNaN(fator)) {
        return valor * Number(fator);
    }
    return valor;
}

// Filtra e renderiza os dados da UF selecionada
window.filtrarUFsLocal = function() {
    const uf = $('#ufs_f_uf').val() || 'PE';

    // Atualiza cabeçalho visual e bandeira
    const flagEl = document.getElementById('ufs_header_flag');
    if (flagEl) {
        flagEl.src = `images/bandeiras/${uf.toUpperCase()}.png`;
        flagEl.style.display = 'inline-block';
    }

    const titleEl = document.getElementById('ufs_header_titulo');
    if (titleEl) {
        let textoIPCA = window.usarValoresReaisUFs ? " (Valores Reais / IPCA)" : "";
        titleEl.innerText = `BENCHMARKING DAS UFs — ${uf}${textoIPCA}`;
    }

    const capaUfEl = document.getElementById('capa_nome_uf');
    if (capaUfEl) capaUfEl.innerText = uf;

    // Dados socioambientais da UF
    const baseSocio = dadosSocioAmbientaisUFs[uf] || [];

    // Renderiza os 5 Eixos Estratégicos
    // Renderiza o Resumo Executivo das UFs (5 Eixos Estratégicos)
    try {
        renderizarResumoExecutivoUFs(uf, baseSocio);
    } catch (eResumo) {
        console.error("[UFs] Erro nao fatal no resumo executivo:", eResumo);
    }

    renderizarEixoConhecimento(baseSocio, uf);
    renderizarEixoSeguranca(uf);
    renderizarEixoSaude(baseSocio, uf);
    renderizarEixoSustentabilidade(baseSocio, uf);
    renderizarEixoGestaoFiscal(uf);
};

// Formatação padrão de valores
function formatarValorUFs(v, config) {
    if (v === null || v === undefined || isNaN(v) || v === 0) return '-';
    if (config.isPct) return v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2}) + '%';
    if (config.isIndice) return v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
    if (config.isAbs) return Math.round(v).toLocaleString('pt-BR');
    if (config.isPerCapita) {
        if (v > 1e6) {
            return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' mi';
        }
        return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    if (v >= 1e9) {
        return 'R$ ' + (v / 1e9).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' bi';
    }
    if (v >= 1e6) {
        return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' mi';
    }
    return 'R$ ' + (v / 1e9).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' bi';
}

// Gerador de Cards de KPIs com Ranking, Sinalização, Modal de Metadados e Título em 2 Linhas
function gerarHTMLCardUFs(titulo, valAtual, valAnt, varPct, config, siglaOrKey, tipoDado, rank) {
    let strAtual = formatarValorUFs(valAtual, config);
    let strAnt = formatarValorUFs(valAnt, config);

    let isLowerBetter = config.isLowerBetter || false;
    let isPositivo = varPct >= 0;
    let corVar = isPositivo ? '#27AE60' : '#E74C3C';
    let iconeVar = isPositivo ? 'fa-arrow-up' : 'fa-arrow-down';

    if (isLowerBetter) {
        corVar = isPositivo ? '#E74C3C' : '#27AE60';
    }

    let strVar = (valAnt && valAnt !== 0) 
        ? `<i class="fas ${iconeVar} me-1"></i>${Math.abs(varPct).toLocaleString('pt-BR', {maximumFractionDigits: 1})}%` 
        : '-';

    let badgeRankHtml = (rank && rank > 0)
        ? `<span class="badge bg-slate-100 text-slate-700 border" style="font-size: 0.65rem; padding: 2px 6px; font-weight: 700; border-radius: 6px;"><i class="fas fa-trophy text-amber-500 me-0.5"></i> ${rank}º no Brasil</span>`
        : '';

    let badgePolaridadeHtml = obterBadgePolaridadeUFs(siglaOrKey, tipoDado, config);

    return `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-2" style="page-break-inside: avoid;">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 14px; background-color: #fafbfc; transition: transform 0.2s;">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
                
                <!-- Linha 1: Ícone, Valor Atual, Título (até 2 linhas) e Botões de Ação -->
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="d-flex gap-2 align-items-center" style="min-width: 0; flex: 1;">
                            <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" 
                                 style="width: 40px; height: 40px; background-color: ${config.color}18; color: ${config.color};">
                                <i class="${config.icon}" style="font-size: 1.05rem;"></i>
                            </div>
                            <div style="min-width: 0; flex: 1; padding-right: 4px;">
                                <div class="fw-bold text-dark text-truncate" style="font-size: 1.15rem; letter-spacing: -0.5px; line-height: 1.2;">${strAtual}</div>
                                <div class="text-muted fw-semibold" style="font-size: 0.74rem; line-height: 1.25; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; max-height: 2.5em; word-break: break-word;" title="${(titulo === 'DTP/RCL' || siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : titulo}">${(titulo === 'DTP/RCL' || siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : titulo}</div>
                            </div>
                        </div>
                        <div class="d-flex gap-1 align-items-center flex-shrink-0 d-print-none">
                            <button class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center" 
                                    onclick="window.abrirModalMetadadoUFs('${siglaOrKey}', '${tipoDado}')" 
                                    style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Metadados e Informações">
                                <i class="fas fa-info text-slate-500" style="font-size: 0.75rem;"></i>
                            </button>
                            <button class="btn btn-light bg-white border shadow-sm d-flex justify-content-center align-items-center" 
                                    onclick="window.abrirModalUFs('${siglaOrKey}', '${tipoDado}')" 
                                    style="width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;" title="Ver Série Histórica e Ranking">
                                <i class="fas fa-arrow-right" style="color: #1a3c6e; font-size: 0.75rem;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Badges de Ranking Nacional e Polaridade / Sinalização -->
                    <div class="d-flex flex-wrap align-items-center gap-1 mb-2 pt-1" style="min-height: 24px;">
                        ${badgeRankHtml}
                        ${badgePolaridadeHtml}
                    </div>
                </div>
                
                <hr class="my-2" style="opacity: 0.08; border-top: 1.5px solid #000;">
                
                <!-- Linha 2: Período Anterior e Variação -->
                <div class="row pt-1">
                    <div class="col-6 pe-1">
                        <span class="d-block text-muted text-truncate" style="font-size: 0.68rem; font-weight: 600;">Período Anterior</span>
                        <span class="fw-bold text-secondary text-truncate d-block" style="font-size: 0.82rem;">${strAnt}</span>
                    </div>
                    <div class="col-6 ps-1 text-end">
                        <span class="d-block text-muted text-truncate" style="font-size: 0.68rem; font-weight: 600;">Variação</span>
                        <span class="fw-bold text-truncate d-block" style="font-size: 0.82rem; color: ${corVar};">${strVar}</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
    `;
}

// Configurações Visuais dos Indicadores
function obterConfigUFs(nomeOuSigla) {
    const s = (nomeOuSigla || "").toLowerCase();

    // Mercado de Trabalho & Demografia
    if (s.includes('desocupação') || s.includes('taxa_desocupacao')) {
        return { color: "#C0392B", icon: "fas fa-user-slash", isPct: true, isLowerBetter: true };
    }
    if (s.includes('ocupada') && !s.includes('pib')) {
        return { color: "#27AE60", icon: "fas fa-user-tie", isAbs: true };
    }
    if (s.includes('população') || s.includes('populacao') || s.includes('pia_media')) {
        return { color: "#2980B9", icon: "fas fa-users", isAbs: true };
    }
    if (s.includes('trimestres')) {
        return { color: "#64748B", icon: "fas fa-calendar-check", isAbs: true };
    }

    // Economia & Produtividade
    if (s.includes('pib per capita') || s.includes('pib_per_capita')) {
        return { color: "#16A085", icon: "fas fa-wallet", isPerCapita: true };
    }
    if (s.includes('pib por população ocupada') || s.includes('pib_por_pop_ocupada') || s.includes('produtividade')) {
        return { color: "#0D9488", icon: "fas fa-briefcase", isPerCapita: true };
    }
    if (s.includes('pib total') || s.includes('pib_total')) {
        return { color: "#2563EB", icon: "fas fa-chart-line" };
    }

    // Educação
    if (s.includes('ideb')) return { color: "#2E86C1", icon: "fas fa-graduation-cap", isIndice: true };
    if (s.includes('abandono') || s.includes('aba_em')) return { color: "#C0392B", icon: "fas fa-user-xmark", isPct: true, isLowerBetter: true };
    if (s.includes('distorção') || s.includes('tdi_em')) return { color: "#D35400", icon: "fas fa-clock-rotate-left", isPct: true, isLowerBetter: true };
    if (s.includes('creche') || s.includes('pre_escola')) {
        let isPct = s.includes('pct') || s.includes('%') || (!s.includes('abs') && !s.includes('absoluto'));
        return { color: "#16A085", icon: "fas fa-children", isPct: isPct, isAbs: !isPct };
    }

    // Meio Ambiente
    if (s.includes('área protegida') || s.includes('area_uc')) return { color: "#27AE60", icon: "fas fa-tree", isAbs: true };
    if (s.includes('unidades de conservação') || s.includes('qtd_uc')) return { color: "#059669", icon: "fas fa-mountain-sun", isAbs: true };

    // Fiscais
    if (s.includes('dtp') || s.includes('pessoal')) return { color: "#F39C12", icon: "fas fa-balance-scale", isPct: true, isLowerBetter: true };
    if (s.includes('dívida')) return { color: "#C0392B", icon: "fas fa-file-invoice-dollar", isPct: true, isLowerBetter: true };
    if (s.includes('vinculação')) return { color: "#8E44AD", icon: "fas fa-certificate", isPct: true };
    if (s.includes('resultado fiscal') || s.includes('resultado orçamentário relativo')) return { color: "#3498DB", icon: "fas fa-chart-pie", isPct: true };
    if (s.includes('per capita')) return { color: "#20C997", icon: "fas fa-users", isPerCapita: true };
    if (s.includes('resultado')) return { color: "#27AE60", icon: "fas fa-coins" };
    if (s.includes('receita')) return { color: "#2980B9", icon: "fas fa-money-bill-wave" };
    if (s.includes('segurança')) return { color: "#D35400", icon: "fas fa-shield-alt" };
    if (s.includes('saúde')) return { color: "#8E44AD", icon: "fas fa-heartbeat" };
    if (s.includes('ciência')) return { color: "#9B59B6", icon: "fas fa-microchip" };
    if (s.includes('educação')) return { color: "#E67E22", icon: "fas fa-book-reader" };
    if (s.includes('ambiental')) return { color: "#059669", icon: "fas fa-leaf" };
    if (s.includes('transporte')) return { color: "#7F8C8D", icon: "fas fa-bus" };
    if (s.includes('urbanismo') || s.includes('habitação')) return { color: "#34495E", icon: "fas fa-city" };

    return { color: "#1a3c6e", icon: "fas fa-chart-column" };
}

// Extrai o valor mais recente, o anterior e o ranking de um indicador socioambiental
function extrairSocio(baseSocio, sigla) {
    const rows = baseSocio.filter(d => d.sigla_indicador === sigla && d.valor !== null && !isNaN(d.valor));
    if (rows.length === 0) return { valAtual: 0, valAnt: 0, varPct: 0, ano: '-', rank: 0 };

    rows.sort((a, b) => Number(b.ano) - Number(a.ano));
    const atual = rows[0];
    const anterior = rows[1];

    let valAtual = Number(atual.valor) || 0;
    let valAnt = anterior ? Number(anterior.valor) || 0 : 0;
    let varPct = valAnt !== 0 ? ((valAtual - valAnt) / Math.abs(valAnt)) * 100 : 0;

    return { 
        valAtual, 
        valAnt, 
        varPct, 
        ano: atual.ano, 
        nome: atual.nm_indicador || sigla,
        rank: atual.rank_br || 0
    };
}

// Extrai o valor mais recente, o anterior e o ranking nacional de um indicador fiscal
function extrairFiscal(uf, nomeInd) {
    const config = obterConfigUFs(nomeInd);
    const rows = dadosMasterFiscalUFs.filter(d => d.uf === uf && String(d.indicador).trim() === nomeInd && d.valor !== null && !isNaN(d.valor));
    if (rows.length === 0) return { valAtual: 0, valAnt: 0, varPct: 0, exercicio: '-', periodo: '-', rank: 0 };

    // Ordena do mais recente para o mais antigo: exercicio desc, periodo desc
    rows.sort((a, b) => {
        let diffAno = Number(b.exercicio) - Number(a.exercicio);
        if (diffAno !== 0) return diffAno;
        return Number(b.periodo) - Number(a.periodo);
    });

    const recAtual = rows[0];
    const anoAtual = Number(recAtual.exercicio);
    const periodoAtual = Number(recAtual.periodo);
    const periodicidadeAtual = recAtual.periodicidade;

    // Tentar encontrar mesmo período no ano anterior
    let recAnt = rows.find(d => Number(d.exercicio) === (anoAtual - 1) && Number(d.periodo) === periodoAtual);
    if (!recAnt && rows.length > 1) {
        recAnt = rows[1];
    }

    let valAtual = Number(recAtual.valor) || 0;
    let anoAnt = recAnt ? Number(recAnt.exercicio) : (anoAtual - 1);
    let valAnt = recAnt ? Number(recAnt.valor) || 0 : 0;

    valAtual = aplicarIPCAUFs(valAtual, anoAtual, config.isPct);
    valAnt = aplicarIPCAUFs(valAnt, anoAnt, config.isPct);

    let varPct = valAnt !== 0 ? ((valAtual - valAnt) / Math.abs(valAnt)) * 100 : 0;

    // Cálculo do ranking nacional da UF no período mais recente
    let rank = 0;
    const basePeriodoUFs = dadosMasterFiscalUFs.filter(d => 
        String(d.indicador).trim() === nomeInd &&
        Number(d.exercicio) === anoAtual &&
        Number(d.periodo) === periodoAtual &&
        d.periodicidade === periodicidadeAtual &&
        d.valor !== null && !isNaN(d.valor)
    );

    if (basePeriodoUFs.length > 0) {
        let isLowerBetter = config.isLowerBetter || false;
        const sortedUfs = [...basePeriodoUFs].sort((a, b) => {
            let va = Number(a.valor) || 0;
            let vb = Number(b.valor) || 0;
            return isLowerBetter ? (va - vb) : (vb - va);
        });
        const idx = sortedUfs.findIndex(d => d.uf === uf);
        if (idx !== -1) {
            rank = idx + 1;
        }
    }

    return { 
        valAtual, 
        valAnt, 
        varPct, 
        exercicio: anoAtual, 
        periodo: periodoAtual, 
        periodicidade: periodicidadeAtual,
        rank: rank 
    };
}

// =========================================================================
// RENDERIZAÇÃO DOS 5 EIXOS ESTRATÉGICOS
// =========================================================================

// Eixo 1: Conhecimento e Inovação (Educação, IDEB, Abandono, Distorção, Creches, C&T)
function renderizarEixoConhecimento(baseSocio, uf) {
    const elGrid = document.getElementById('grid_ufs_conhecimento');
    if (!elGrid) return;

    let html = '';

    // Indicadores Educacionais Completos
    const listaSocio = [
        // IDEB Anos Iniciais
        { sigla: "ideb_5ano_estadual", label: "IDEB Anos Iniciais (5º) - Estadual" },
        { sigla: "ideb_5ano_publica", label: "IDEB Anos Iniciais (5º) - Pública" },
        { sigla: "ideb_5ano_privada", label: "IDEB Anos Iniciais (5º) - Privada" },
        { sigla: "ideb_5ano_total", label: "IDEB Anos Iniciais (5º) - Total" },
        // IDEB Anos Finais
        { sigla: "ideb_9ano_estadual", label: "IDEB Anos Finais (9º) - Estadual" },
        { sigla: "ideb_9ano_publica", label: "IDEB Anos Finais (9º) - Pública" },
        { sigla: "ideb_9ano_privada", label: "IDEB Anos Finais (9º) - Privada" },
        { sigla: "ideb_9ano_total", label: "IDEB Anos Finais (9º) - Total" },
        // IDEB Ensino Médio
        { sigla: "ideb_3ano_estadual", label: "IDEB Ensino Médio (3º) - Estadual" },
        { sigla: "ideb_3ano_privada", label: "IDEB Ensino Médio (3º) - Privada" },
        { sigla: "ideb_3ano_total", label: "IDEB Ensino Médio (3º) - Total" },
        // Taxa de Abandono
        { sigla: "aba_em_estadual", label: "Taxa de Abandono - E. Médio (Estadual)" },
        { sigla: "aba_em_publica", label: "Taxa de Abandono - E. Médio (Pública)" },
        { sigla: "aba_em_privada", label: "Taxa de Abandono - E. Médio (Privada)" },
        { sigla: "aba_em_federal", label: "Taxa de Abandono - E. Médio (Federal)" },
        { sigla: "aba_em_municipal", label: "Taxa de Abandono - E. Médio (Municipal)" },
        { sigla: "aba_em_total", label: "Taxa de Abandono - E. Médio (Total)" },
        // Distorção Idade-Série
        { sigla: "tdi_em_estadual", label: "Distorção Idade-Série - E. Médio (Estadual)" },
        { sigla: "tdi_em_publica", label: "Distorção Idade-Série - E. Médio (Pública)" },
        { sigla: "tdi_em_privada", label: "Distorção Idade-Série - E. Médio (Privada)" },
        { sigla: "tdi_em_federal", label: "Distorção Idade-Série - E. Médio (Federal)" },
        { sigla: "tdi_em_municipal", label: "Distorção Idade-Série - E. Médio (Municipal)" },
        { sigla: "tdi_em_total", label: "Distorção Idade-Série - E. Médio (Total)" },
        // Creche e Pré-escola
        { sigla: "tx_creche_pct", label: "Taxa Bruta de Creche (%)" },
        { sigla: "tx_liq_creche_pct", label: "Taxa Líquida de Creche (%)" },
        { sigla: "tx_creche_abs", label: "Matrículas em Creche (Abs.)" },
        { sigla: "tx_liq_creche_abs", label: "Matrículas Líquidas em Creche (Abs.)" },
        { sigla: "tx_pre_escola_pct", label: "Taxa Bruta de Pré-escola (%)" },
        { sigla: "tx_liq_pre_escola_pct", label: "Taxa Líquida de Pré-escola (%)" },
        { sigla: "tx_pre_escola_abs", label: "Matrículas em Pré-escola (Abs.)" },
        { sigla: "tx_liq_pre_escola_abs", label: "Matrículas Líquidas em Pré-escola (Abs.)" }
    ];

    listaSocio.forEach(item => {
        const dados = extrairSocio(baseSocio, item.sigla);
        const config = obterConfigUFs(item.sigla);
        html += gerarHTMLCardUFs(item.label, dados.valAtual, dados.valAnt, dados.varPct, config, item.sigla, 'socio', dados.rank);
    });

    // Despesas de Educação e Ciência & Tecnologia
    const fiscEduc = extrairFiscal(uf, "Educação");
    html += gerarHTMLCardUFs("Despesa com Educação", fiscEduc.valAtual, fiscEduc.valAnt, fiscEduc.varPct, obterConfigUFs("Educação"), "Educação", "fiscal", fiscEduc.rank);

    const fiscCT = extrairFiscal(uf, "Ciência e Tecnologia");
    html += gerarHTMLCardUFs("Despesa com Ciência e Tecnologia", fiscCT.valAtual, fiscCT.valAnt, fiscCT.varPct, obterConfigUFs("Ciência e Tecnologia"), "Ciência e Tecnologia", "fiscal", fiscCT.rank);

    const vincEduc = extrairFiscal(uf, "Vinculação - Educação");
    html += gerarHTMLCardUFs("Vinculação Constitucional da Educação", vincEduc.valAtual, vincEduc.valAnt, vincEduc.varPct, obterConfigUFs("Vinculação - Educação"), "Vinculação - Educação", "fiscal", vincEduc.rank);

    elGrid.innerHTML = html;
}

// Eixo 2: Segurança e Cidadania (Segurança, Cidadania, Judiciária, Legislativa)
function renderizarEixoSeguranca(uf) {
    const elGrid = document.getElementById('grid_ufs_seguranca');
    if (!elGrid) return;

    let html = '';
    const inds = ["Segurança Pública", "Direitos da Cidadania", "Judiciária", "Legislativa"];

    inds.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        const cfg = obterConfigUFs(nomeInd);
        html += gerarHTMLCardUFs(`Despesa com ${nomeInd}`, d.valAtual, d.valAnt, d.varPct, cfg, nomeInd, 'fiscal', d.rank);
    });

    elGrid.innerHTML = html;
}

// Eixo 3: Saúde e Qualidade de Vida (Saúde, Saneamento, Habitação, Urbanismo, Assistência Social)
function renderizarEixoSaude(baseSocio, uf) {
    const elGrid = document.getElementById('grid_ufs_saude');
    if (!elGrid) return;

    let html = '';

    // Despesas de Saúde, Assistência e Bem-Estar Social
    const inds = [
        "Saúde", "Vinculação - Saúde", "Saneamento", 
        "Habitação", "Urbanismo", "Assistência Social", 
        "Previdência Social", "Trabalho"
    ];

    inds.forEach(nomeInd => {
        const d = extrairFiscal(uf, nomeInd);
        const cfg = obterConfigUFs(nomeInd);
        let label = nomeInd.startsWith("Vinculação") ? nomeInd : `Despesa com ${nomeInd}`;
        html += gerarHTMLCardUFs(label, d.valAtual, d.valAnt, d.varPct, cfg, nomeInd, 'fiscal', d.rank);
    });

    elGrid.innerHTML = html;
}

// Eixo 4: Desenvolvimento Sustentável (Economia, Mercado de Trabalho, Demografia, Meio Ambiente)
function renderizarEixoSustentabilidade(baseSocio, uf) {
    const elGrid = document.getElementById('grid_ufs_sustentabilidade');
    if (!elGrid) return;

    let html = '';

    // Indicadores Econômicos, Mercado de Trabalho e Demografia
    const listaEconomia = [
        { sigla: "pib_total_reais", label: "PIB Total" },
        { sigla: "pib_per_capita", label: "PIB per capita" },
        { sigla: "pib_por_pop_ocupada", label: "PIB por População Ocupada" },
        { sigla: "taxa_desocupacao_media", label: "Taxa de Desocupação Média (%)" },
        { sigla: "pop_ocupada_media", label: "População Ocupada (Média)" },
        { sigla: "populacao_total", label: "População Total (hab.)" },
        { sigla: "pia_media", label: "População em Idade Ativa (PIA)" }
    ];

    listaEconomia.forEach(item => {
        const dados = extrairSocio(baseSocio, item.sigla);
        const config = obterConfigUFs(item.sigla);
        html += gerarHTMLCardUFs(item.label, dados.valAtual, dados.valAnt, dados.varPct, config, item.sigla, 'socio', dados.rank);
    });

    // Unidades de Conservação e Áreas Protegidas
    const listaSocio = [
        { sigla: "area_uc_total", label: "Área Total Protegida em UCs (ha)" },
        { sigla: "area_uc_est", label: "Área Protegida em UCs Estaduais (ha)" },
        { sigla: "area_uc_fed", label: "Área Protegida em UCs Federais (ha)" },
        { sigla: "area_uc_mun", label: "Área Protegida em UCs Municipais (ha)" },
        { sigla: "area_uc_pi", label: "Área em Proteção Integral (ha)" },
        { sigla: "area_uc_us", label: "Área em Uso Sustentável (ha)" },
        { sigla: "qtd_uc_total", label: "Total de Unidades de Conservação" },
        { sigla: "qtd_uc_est", label: "Unidades de Conservação Estaduais" },
        { sigla: "qtd_uc_fed", label: "Unidades de Conservação Federais" },
        { sigla: "qtd_uc_mun", label: "Unidades de Conservação Municipais" },
        { sigla: "qtd_uc_pi", label: "Unidades de Conservação em Proteção Integral" },
        { sigla: "qtd_uc_us", label: "Unidades de Conservação em Uso Sustentável" }
    ];

    listaSocio.forEach(item => {
        const dados = extrairSocio(baseSocio, item.sigla);
        const config = obterConfigUFs(item.sigla);
        html += gerarHTMLCardUFs(item.label, dados.valAtual, dados.valAnt, dados.varPct, config, item.sigla, 'socio', dados.rank);
    });

    // Despesas de Meio Ambiente, Transporte e Agricultura
    const fiscAmb = extrairFiscal(uf, "Gestão Ambiental");
    html += gerarHTMLCardUFs("Despesa com Gestão Ambiental", fiscAmb.valAtual, fiscAmb.valAnt, fiscAmb.varPct, obterConfigUFs("Gestão Ambiental"), "Gestão Ambiental", "fiscal", fiscAmb.rank);

    const fiscTransp = extrairFiscal(uf, "Transporte");
    html += gerarHTMLCardUFs("Despesa com Transporte", fiscTransp.valAtual, fiscTransp.valAnt, fiscTransp.varPct, obterConfigUFs("Transporte"), "Transporte", "fiscal", fiscTransp.rank);

    const fiscAgri = extrairFiscal(uf, "Agricultura");
    html += gerarHTMLCardUFs("Despesa com Agricultura", fiscAgri.valAtual, fiscAgri.valAnt, fiscAgri.varPct, obterConfigUFs("Agricultura"), "Agricultura", "fiscal", fiscAgri.rank);

    elGrid.innerHTML = html;
}

// Eixo 5: Gestão, Transparência e Participação (Resultados Fiscais, Receitas e Despesas)
function renderizarEixoGestaoFiscal(uf) {
    const elResultados = document.getElementById('grid_ufs_fiscal_resultados');
    const elReceitas = document.getElementById('grid_ufs_fiscal_receitas');
    const elDespesas = document.getElementById('grid_ufs_fiscal_despesas');

    if (!elResultados || !elReceitas || !elDespesas) return;

    // Sub-bloco Resultados
    const indsResultados = [
        "DTP/RCL", "Dívida Consolidada Líquida", "Resultado Fiscal",
        "Resultado Primário", "Resultado Nominal", "Resultado Orçamentário",
        "Resultado Orçamentário per capita", "Resultado Orçamentário Relativo"
    ];
    let htmlRes = '';
    indsResultados.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlRes += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elResultados.innerHTML = htmlRes;

    // Sub-bloco Receitas
    const indsReceitas = [
        "Receita Corrente Líquida", "Receitas Realizadas", "Receitas de Impostos",
        "Receitas de Capital", "Transf. União (Corrente)", "Transf. União (Capital)"
    ];
    let htmlRec = '';
    indsReceitas.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlRec += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elReceitas.innerHTML = htmlRec;

    // Sub-bloco Despesas
    const indsDespesas = ["Administração", "Despesas de Capital - Emp."];
    let htmlDesp = '';
    indsDespesas.forEach(ind => {
        const d = extrairFiscal(uf, ind);
        htmlDesp += gerarHTMLCardUFs(ind, d.valAtual, d.valAnt, d.varPct, obterConfigUFs(ind), ind, 'fiscal', d.rank);
    });
    elDespesas.innerHTML = htmlDesp;
}

// =========================================================================
// MODAL DE SÉRIE HISTÓRICA E RANKING NACIONAL
// =========================================================================

window.abrirModalUFs = async function(siglaOrKey, tipoDado) {
    const uf = $('#ufs_f_uf').val() || 'PE';

    const modalTitle = document.getElementById('modal_ufs_kpi_titulo');
    const nomeExib = (siglaOrKey === 'DTP/RCL' || siglaOrKey === 'dtp_rcl') ? 'Pessoal' : siglaOrKey;
    if (modalTitle) {
        modalTitle.innerText = `${nomeExib} — Histórico e Comparativo Nacional (${uf})`;
    }

    const modalEl = document.getElementById('modal_ufs_kpi_serie');
    if (!modalEl) return;
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('shown.bs.modal', async function () {
        if (tipoDado === 'fiscal') {
            await renderizarModalFiscal(siglaOrKey, uf);
        } else {
            await renderizarModalSocio(siglaOrKey, uf);
        }
    }, { once: true });
};

// Renderização do Modal para Dados Fiscais
async function renderizarModalFiscal(indicador, uf) {
    const config = obterConfigUFs(indicador);
    const isPct = config.isPct;

    // Identifica o período e exercício mais recentes disponíveis para este indicador
    const rowsInd = dadosMasterFiscalUFs
        .filter(d => String(d.indicador).trim() === indicador && d.valor !== null && !isNaN(d.valor))
        .sort((a, b) => {
            let diffAno = Number(b.exercicio) - Number(a.exercicio);
            if (diffAno !== 0) return diffAno;
            return Number(b.periodo) - Number(a.periodo);
        });

    if (rowsInd.length === 0) return;

    const recMaisRecente = rowsInd[0];
    const anoAtual = Number(recMaisRecente.exercicio);
    const bim = Number(recMaisRecente.periodo);
    const periodicidade = recMaisRecente.periodicidade;

    // 1. Série Plurianual Completa da UF (mesmo período sazonal em todos os anos)
    const baseSerie = dadosMasterFiscalUFs
        .filter(d => d.uf === uf && String(d.indicador).trim() === indicador && d.periodicidade === periodicidade && Number(d.periodo) === bim)
        .sort((a, b) => parseInt(a.exercicio) - parseInt(b.exercicio));

    const anos = baseSerie.map(d => String(d.exercicio));
    const valores = baseSerie.map(d => {
        let v = Number(d.valor) || 0;
        v = aplicarIPCAUFs(v, d.exercicio, isPct);
        return (isPct || config.isPerCapita) ? v : v / 1e9;
    });

    renderGraficoLinhaModal(anos, valores, indicador, uf, config);

    // 2. Ranking Nacional das 27 UFs para o último exercício e período disponível
    const baseAnoUFs = dadosMasterFiscalUFs.filter(d => {
        if (String(d.indicador).trim() !== indicador) return false;
        if (parseInt(d.exercicio) !== anoAtual) return false;
        if (d.periodicidade !== periodicidade) return false;
        if (Number(d.periodo) !== bim) return false;
        return true;
    });

    const isLowerBetter = config.isLowerBetter || false;
    const rankingArr = baseAnoUFs.map(d => {
        let v = Number(d.valor) || 0;
        v = aplicarIPCAUFs(v, anoAtual, isPct);
        return {
            uf: d.uf,
            valor: (isPct || config.isPerCapita) ? v : v / 1e9
        };
    }).sort((a, b) => isLowerBetter ? (a.valor - b.valor) : (b.valor - a.valor));

    let descPeriodo = `${bim}º ${periodicidade === 'Quadrimestral' ? 'Quadrimestre' : 'Bimestre'} de ${anoAtual}`;
    renderGraficoBarrasRanking(rankingArr, uf, indicador, config, descPeriodo);
    renderStorytellingModal(indicador, uf, rankingArr, config, descPeriodo);
}

// Renderização do Modal para Dados Socioambientais
async function renderizarModalSocio(sigla, uf) {
    const config = obterConfigUFs(sigla);
    const basePath = window.basePath || '';

    // Busca ranking nacional na API Go (sem passar ano para vir o ano mais recente do indicador)
    try {
        const res = await window.fetchSeguro(`${basePath}/api/ufs/ranking?sigla_indicador=${encodeURIComponent(sigla)}`);
        let rankingData = [];
        let benchmarks = [];

        if (res.ok) {
            const json = await res.json();
            rankingData = json.ranking || [];
            benchmarks = json.benchmarks || [];
        }

        // Série histórica completa da UF
        const baseUF = dadosSocioAmbientaisUFs[uf] || [];
        const serieUF = baseUF
            .filter(d => d.sigla_indicador === sigla && d.valor !== null && !isNaN(d.valor))
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        const anos = serieUF.map(d => String(d.ano));
        const valores = serieUF.map(d => Number(d.valor));

        const nomeExibicao = (rankingData.length > 0 && rankingData[0].nm_indicador) 
            ? rankingData[0].nm_indicador 
            : (serieUF.length > 0 ? serieUF[0].nm_indicador : sigla);

        const anoRef = (rankingData.length > 0 && rankingData[0].ano) 
            ? rankingData[0].ano 
            : (serieUF.length > 0 ? serieUF[serieUF.length - 1].ano : '');

        renderGraficoLinhaModal(anos, valores, nomeExibicao, uf, config);

        // Ranking com UFs e benchmarks
        const isLowerBetter = config.isLowerBetter || false;
        const rankingArr = rankingData.map(r => ({
            uf: r.sg_uf,
            valor: Number(r.valor) || 0
        }));

        // Adiciona referências regionais (NE e BR) se disponíveis
        benchmarks.forEach(b => {
            rankingArr.push({
                uf: b.sg_regiao === 'NE' ? 'Nordeste (NE)' : 'Brasil (BR)',
                valor: Number(b.valor) || 0,
                isBenchmark: true
            });
        });

        rankingArr.sort((a, b) => isLowerBetter ? (a.valor - b.valor) : (b.valor - a.valor));
        renderGraficoBarrasRanking(rankingArr, uf, nomeExibicao, config, anoRef);
        renderStorytellingModal(nomeExibicao, uf, rankingArr, config, anoRef);

    } catch (e) {
        console.error("Erro ao renderizar modal socioambiental:", e);
    }
}

// Gráfico de Linha Plurianual (ECharts)
function renderGraficoLinhaModal(anos, valores, indicador, uf, config) {
    const dom = document.getElementById('modal_ufs_chart_serie');
    if (!dom) return;

    if (chartModalUFsSerie) chartModalUFsSerie.dispose();
    chartModalUFsSerie = echarts.init(dom);

    if (anos.length === 0) {
        chartModalUFsSerie.clear();
        return;
    }

    const suf = config.isPct ? '%' : (config.isIndice ? '' : (config.isAbs ? '' : ' R$ bi'));

    chartModalUFsSerie.setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const item = params[0];
                const v = Number(item.value).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
                return `<strong>${uf} (${item.name})</strong><br/>${indicador}: <strong>${v}${suf}</strong>`;
            }
        },
        grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
        xAxis: { type: 'category', data: anos, boundaryGap: false },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}' + suf } },
        series: [{
            name: indicador,
            type: 'line',
            data: valores,
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 3, color: config.color },
            itemStyle: { color: config.color },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: config.color + '66' },
                    { offset: 1, color: config.color + '05' }
                ])
            }
        }]
    });
}

// Gráfico de Barras Horizontais com Ranking Nacional
function renderGraficoBarrasRanking(rankingArr, ufAlvo, indicador, config, ano) {
    const dom = document.getElementById('modal_ufs_chart_ranking');
    if (!dom) return;

    if (chartModalUFsRanking) chartModalUFsRanking.dispose();
    chartModalUFsRanking = echarts.init(dom);

    if (!rankingArr || rankingArr.length === 0) {
        chartModalUFsRanking.clear();
        return;
    }

    // Inversão para que o 1º lugar do ranking fique no topo do eixo Y categórico
    const dadosReversos = [...rankingArr].reverse();
    const categorias = dadosReversos.map(d => d.uf);
    const valores = dadosReversos.map(d => {
        let isAlvo = d.uf === ufAlvo;
        let isBench = d.isBenchmark;
        let cor = isAlvo ? '#1a3c6e' : (isBench ? '#F39C12' : '#BDC3C7');
        return {
            value: d.valor,
            itemStyle: {
                color: cor,
                borderRadius: [0, 4, 4, 0]
            }
        };
    });

    const suf = config.isPct ? '%' : (config.isIndice ? '' : (config.isAbs ? '' : ' bi'));

    chartModalUFsRanking.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const item = params[0];
                const v = Number(item.value).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
                return `<strong>${item.name}</strong><br/>${indicador}: <strong>${v}${suf}</strong>`;
            }
        },
        grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
        xAxis: { type: 'value', axisLabel: { formatter: '{value}' + suf } },
        yAxis: { type: 'category', data: categorias, axisLabel: { fontSize: 11, fontWeight: 'bold' } },
        series: [{
            type: 'bar',
            data: valores,
            barMaxWidth: 16
        }]
    });
}

// Resumo / Storytelling no Modal
function renderStorytellingModal(indicador, uf, rankingArr, config, ano) {
    const box = document.getElementById('modal_ufs_kpi_storytelling');
    if (!box) return;

    const rankPos = rankingArr.findIndex(d => d.uf === uf) + 1;
    const totalUfs = rankingArr.filter(d => !d.isBenchmark).length;
    const itemUF = rankingArr.find(d => d.uf === uf);

    if (!itemUF) {
        box.innerHTML = `Dados comparativos consolidados para o indicador <strong>${indicador}</strong> em <strong>${ano}</strong>.`;
        return;
    }

    const valFmt = formatarValorUFs(itemUF.valor, config);
    let textoRank = rankPos > 0 ? `ocupando a <strong>${rankPos}ª posição</strong> entre as ${totalUfs} Unidades da Federação` : '';

    box.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fas fa-circle-info text-primary fs-5"></i>
            <div>
                O estado de <strong>${uf}</strong> registrou <strong>${valFmt}</strong> para o indicador <strong>${indicador}</strong> (${ano}), ${textoRank}.
                As barras em destaque representam o estado selecionado e os parâmetros de referência regional.
            </div>
        </div>
    `;
}

// Redimensionamento de Gráficos no ciclo de vida das abas
window.redimensionarGraficosUFs = function() {
    if (chartModalUFsSerie) chartModalUFsSerie.resize();
    if (chartModalUFsRanking) chartModalUFsRanking.resize();
};


/* ==========================================================================
   RESUMO EXECUTIVO DE BENCHMARKING DAS UFs (5 EIXOS ESTRATÉGICOS)
   ========================================================================== */
function renderizarResumoExecutivoUFs(uf, baseSocio) {
    try {
        const $container = $('#ufs_container_resumo_executivo');
        if (!$container.length) return;
        $container.empty();

        const mapaNomesUFs = {
            "AC": "Acre", "AL": "Alagoas", "AM": "Amazonas", "AP": "Amapá", "BA": "Bahia",
            "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo", "GO": "Goiás",
            "MA": "Maranhão", "MG": "Minas Gerais", "MS": "Mato Grosso do Sul", "MT": "Mato Grosso",
            "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco", "PI": "Piauí", "PR": "Paraná",
            "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RO": "Rondônia", "RR": "Roraima",
            "RS": "Rio Grande do Sul", "SC": "Santa Catarina", "SE": "Sergipe", "SP": "São Paulo", "TO": "Tocantins"
        };
        const nomeUF = mapaNomesUFs[String(uf || '').toUpperCase()] || uf || 'PE';

        const safeNum = (v, fallback = 0) => {
            if (v === null || v === undefined) return fallback;
            const n = parseFloat(String(v).replace(',', '.'));
            return isNaN(n) ? fallback : n;
        };

        const safeFmt = (v, dec = 1, suffix = '') => {
            const n = safeNum(v, null);
            return (n !== null && n > 0) ? (n.toFixed(dec) + suffix) : '-';
        };

        // Helper formatador de moeda compacta
        const formataMoedaCompacta = (v) => {
            const num = safeNum(v, 0);
            if (num === 0) return 'R$ 0';
            const abs = Math.abs(num);
            const sinal = num < 0 ? '-' : '';
            if (abs >= 1e9) return `${sinal}R$ ${(abs / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
            if (abs >= 1e6) return `${sinal}R$ ${(abs / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mi`;
            if (abs >= 1e3) return `${sinal}R$ ${(abs / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
            return `${sinal}R$ ${abs.toLocaleString('pt-BR')}`;
        };

        const socioArray = Array.isArray(baseSocio) ? baseSocio : [];

        // Eixo 1: Conhecimento e Inovação
        const ideb3Item = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_3ano_total') || {}) : {};
        const ideb3 = (ideb3Item.valAtual > 0) ? ideb3Item : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_3ano_estadual') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const ideb5Item = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_5ano_total') || {}) : {};
        const ideb5 = (ideb5Item.valAtual > 0) ? ideb5Item : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'ideb_5ano_publica') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const abaEMItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'aba_em_total') || {}) : {};
        const abaEM = (abaEMItem.valAtual > 0) ? abaEMItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'aba_em_estadual') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const tdiEMItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tdi_em_total') || {}) : {};
        const tdiEM = (tdiEMItem.valAtual > 0) ? tdiEMItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'tdi_em_estadual') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const despEdu = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Educação') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let textoEixo1 = `No desempenho educacional, registra nota no IDEB do Ensino Médio de <strong>${safeFmt(ideb3.valAtual, 1)}</strong> (${ideb3.rank > 0 ? ideb3.rank + 'º no Brasil' : 'referência estadual'}) e IDEB Anos Iniciais de <strong>${safeFmt(ideb5.valAtual, 1)}</strong> (${ideb5.rank > 0 ? ideb5.rank + 'º BR' : '-'}). A taxa de abandono escolar no Ensino Médio situa-se em <strong>${safeFmt(abaEM.valAtual, 1, '%')}</strong> e despesa orçamentária executada em Educação em <strong>${formataMoedaCompacta(despEdu.valAtual)}</strong> (${despEdu.rank > 0 ? despEdu.rank + 'º em alocação' : '-'}).`;

        // Eixo 2: Segurança e Cidadania
        const despSeg = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Segurança Pública') || { valAtual: 0, rank: 0, varPct: 0, exercicio: '-' }) : { valAtual: 0, rank: 0, varPct: 0, exercicio: '-' };
        const despCid = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Direitos da Cidadania') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let varSegFmt = '-';
        if (despSeg.varPct !== 0 && !isNaN(despSeg.varPct)) {
            varSegFmt = (despSeg.varPct > 0 ? '+' : '') + Number(despSeg.varPct).toFixed(1) + '%';
        }

        let textoEixo2 = `Na área de segurança pública e cidadania, a UF comprometeu <strong>${formataMoedaCompacta(despSeg.valAtual)}</strong> em despesas orçamentárias na função Segurança (${despSeg.rank > 0 ? despSeg.rank + 'º maior esforço orçamentário do país' : 'orçamento executado'}), além de <strong>${formataMoedaCompacta(despCid.valAtual)}</strong> em Direitos da Cidadania. Apresenta esforço orçamentário e priorização da ordem pública e garantia de direitos civis.`;

        // Eixo 3: Saúde e Qualidade de Vida
        const despSaude = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Saúde') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despHab = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Habitação') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despUrb = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Urbanismo') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        
        const aguaItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'pct_agua_rede') || {}) : {};
        const agua = (aguaItem.valAtual > 0) ? aguaItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'atendimento_agua') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        let textoEixo3 = `O setor de saúde pública e qualidade de vida conta com execução orçamentária de <strong>${formataMoedaCompacta(despSaude.valAtual)}</strong> (${despSaude.rank > 0 ? despSaude.rank + 'º no Brasil' : '-'}), com foco no custeio e investimentos da rede assistencial do SUS. Na infraestrutura de bem-estar urbano, foram alocados <strong>${formataMoedaCompacta(despUrb.valAtual)}</strong> em urbanismo e <strong>${formataMoedaCompacta(despHab.valAtual)}</strong> em habitação social, com atendimento de água tratada em <strong>${safeFmt(agua.valAtual, 1, '%')}</strong>.`;

        // Eixo 4: Desenvolvimento Sustentável
        const pibpcItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'pibpc') || {}) : {};
        const pibpc = (pibpcItem.valAtual > 0) ? pibpcItem : ((typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'PIB per Capita') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const desempItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'taxa_desocupacao_media') || {}) : {};
        const desemp = (desempItem.valAtual > 0) ? desempItem : ((typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'taxa_desocupacao') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const despAmb = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Gestão Ambiental') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const despAgro = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Agricultura') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };

        let textoEixo4 = `A dinâmica econômica e ambiental da UF apresenta PIB per capita de <strong>${pibpc.valAtual > 0 ? 'R$ ' + Number(pibpc.valAtual).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'}</strong> (${pibpc.rank > 0 ? pibpc.rank + 'º no ranking nacional' : '-'}), com taxa de desocupação do trabalho em <strong>${safeFmt(desemp.valAtual, 1, '%')}</strong> (${desemp.rank > 0 ? desemp.rank + 'º menor desemprego' : '-'}). Na sustentabilidade produtiva e ambiental, executou <strong>${formataMoedaCompacta(despAgro.valAtual)}</strong> na agricultura e <strong>${formataMoedaCompacta(despAmb.valAtual)}</strong> em gestão e proteção ambiental.`;

        // Eixo 5: Gestão, Transparência & Fiscal
        const rcl = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Receita Corrente Líquida') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        const dtp = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Despesa Total com Pessoal - DTP (% da RCL)') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 };
        
        const invLiq = (typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Investimentos - Liq.') || {}) : {};
        const invest = (invLiq.valAtual > 0) ? invLiq : ((typeof extrairFiscal === 'function') ? (extrairFiscal(uf, 'Despesas de Capital - Emp.') || { valAtual: 0, rank: 0 }) : { valAtual: 0, rank: 0 });

        const capagItem = (typeof extrairSocio === 'function') ? (extrairSocio(socioArray, 'capag') || {}) : {};
        let capagNota = capagItem.valAtual ? String(capagItem.valAtual).toUpperCase() : (uf === 'PE' ? 'B' : 'A');

        let textoEixo5 = `No pilar de gestão fiscal e responsabilidade governamental, a UF registra Receita Corrente Líquida (RCL) de <strong>${formataMoedaCompacta(rcl.valAtual)}</strong> e investimentos liquidados de <strong>${formataMoedaCompacta(invest.valAtual)}</strong> (${invest.rank > 0 ? invest.rank + 'º maior volume de investimentos do país' : '-'}). O comprometimento com despesa de pessoal situa-se em <strong>${safeFmt(dtp.valAtual, 1, '%')} da RCL</strong>, assegurando equilíbrio perante a LRF e classificação de solvência fiscal STN.`;

        const htmlResumo = `
            <div class="resumo-exec-banner mb-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-white text-orange-950 font-black px-3 py-1.5 rounded-pill uppercase tracking-wider text-xs shadow-xs">
                            <i class="fas fa-chart-column me-1 text-[#ff5a26]"></i> Síntese Estratégica de Benchmarking
                        </span>
                        <span class="text-orange-100 font-semibold text-xs">${nomeUF} (${uf}) &bull; Benchmarking Nacional (27 UFs)</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-graduation-cap me-1 text-amber-300"></i> IDEB Médio: ${safeFmt(ideb3.valAtual, 1)} (${ideb3.rank > 0 ? ideb3.rank + 'º BR' : '-'})
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-briefcase me-1 text-emerald-300"></i> Desocupação: ${safeFmt(desemp.valAtual, 1, '%')}
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-landmark me-1 text-cyan-300"></i> RCL: ${formataMoedaCompacta(rcl.valAtual)}
                        </span>
                        <span class="badge bg-black/25 text-white border border-white/20 rounded-pill px-3 py-1 text-xs">
                            <i class="fas fa-scale-balanced me-1 text-purple-300"></i> Pessoal: ${safeFmt(dtp.valAtual, 1, '%')}
                        </span>
                    </div>
                </div>
                <p class="text-sm text-white leading-relaxed mb-0 font-medium" style="text-align: justify;">
                    A Unidade Federativa <strong>${nomeUF} (${uf})</strong> posiciona-se no benchmarking nacional com IDEB do Ensino Médio de <strong>${safeFmt(ideb3.valAtual, 1)}</strong> (${ideb3.rank > 0 ? ideb3.rank + 'º no Brasil' : 'referência'}), taxa de desocupação de <strong>${safeFmt(desemp.valAtual, 1, '%')}</strong> e PIB per capita de <strong>${pibpc.valAtual > 0 ? 'R$ ' + Number(pibpc.valAtual).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'}</strong> (${pibpc.rank > 0 ? pibpc.rank + 'º BR' : '-'}). Na disciplina orçamentária, mobiliza uma Receita Corrente Líquida de <strong>${formataMoedaCompacta(rcl.valAtual)}</strong>, executando <strong>${formataMoedaCompacta(invest.valAtual)}</strong> em investimentos e mantendo a folha salarial em <strong>${safeFmt(dtp.valAtual, 1, '%')}</strong> da RCL.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <!-- EIXO 1: CONHECIMENTO E INOVAÇÃO -->
                <div class="resumo-dim-card" style="border-top: 4px solid #D97706;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-lightbulb text-amber-500 me-1.5"></i> Conhecimento</span>
                        <span class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-pill px-2">Eixo 1</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">IDEB Médio (3º):</span> <strong class="text-slate-800">${safeFmt(ideb3.valAtual, 1)} <span class="text-[10px] text-slate-400">(${ideb3.rank > 0 ? ideb3.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">IDEB Iniciais (5º):</span> <strong class="text-slate-800">${safeFmt(ideb5.valAtual, 1)} <span class="text-[10px] text-slate-400">(${ideb5.rank > 0 ? ideb5.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Abandono Escolar:</span> <strong class="text-slate-800">${safeFmt(abaEM.valAtual, 1, '%')}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Despesa Educação:</span> <strong class="text-slate-800">${formataMoedaCompacta(despEdu.valAtual)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo1}
                    </div>
                </div>

                <!-- EIXO 2: SEGURANÇA E CIDADANIA -->
                <div class="resumo-dim-card" style="border-top: 4px solid #DC2626;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-shield-halved text-rose-600 me-1.5"></i> Segurança</span>
                        <span class="badge bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-pill px-2">Eixo 2</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Segurança:</span> <strong class="text-slate-800">${formataMoedaCompacta(despSeg.valAtual)} <span class="text-[10px] text-slate-400">(${despSeg.rank > 0 ? despSeg.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Direitos Cidadania:</span> <strong class="text-slate-800">${formataMoedaCompacta(despCid.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Variação Anual:</span> <strong class="text-slate-800">${varSegFmt}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Exercício Base:</span> <strong class="text-slate-800">${despSeg.exercicio || '-'}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo2}
                    </div>
                </div>

                <!-- EIXO 3: SAÚDE E QUALIDADE DE VIDA -->
                <div class="resumo-dim-card" style="border-top: 4px solid #2563EB;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-heartbeat text-blue-600 me-1.5"></i> Saúde &amp; Vida</span>
                        <span class="badge bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-pill px-2">Eixo 3</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Despesa Saúde:</span> <strong class="text-slate-800">${formataMoedaCompacta(despSaude.valAtual)} <span class="text-[10px] text-slate-400">(${despSaude.rank > 0 ? despSaude.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Urbanismo:</span> <strong class="text-slate-800">${formataMoedaCompacta(despUrb.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Habitação:</span> <strong class="text-slate-800">${formataMoedaCompacta(despHab.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Água Tratada:</span> <strong class="text-slate-800">${safeFmt(agua.valAtual, 1, '%')}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo3}
                    </div>
                </div>

                <!-- EIXO 4: DESENVOLVIMENTO SUSTENTÁVEL -->
                <div class="resumo-dim-card" style="border-top: 4px solid #059669;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-tree text-emerald-600 me-1.5"></i> Sustentabilidade</span>
                        <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-pill px-2">Eixo 4</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">PIB per Capita:</span> <strong class="text-slate-800">${pibpc.valAtual > 0 ? 'R$ ' + Number(pibpc.valAtual).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'} <span class="text-[10px] text-slate-400">(${pibpc.rank > 0 ? pibpc.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desocupação:</span> <strong class="text-slate-800">${safeFmt(desemp.valAtual, 1, '%')} <span class="text-[10px] text-slate-400">(${desemp.rank > 0 ? desemp.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Agricultura:</span> <strong class="text-slate-800">${formataMoedaCompacta(despAgro.valAtual)}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Desp. Ambiental:</span> <strong class="text-slate-800">${formataMoedaCompacta(despAmb.valAtual)}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo4}
                    </div>
                </div>

                <!-- EIXO 5: GESTÃO FISCAL -->
                <div class="resumo-dim-card" style="border-top: 4px solid #7C3AED;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="font-black text-slate-800 text-xs uppercase tracking-wider"><i class="fas fa-scale-balanced text-purple-600 me-1.5"></i> Gestão Fiscal</span>
                        <span class="badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-pill px-2">Eixo 5</span>
                    </div>
                    <div class="space-y-1 mb-2.5">
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">RCL do Estado:</span> <strong class="text-slate-800">${formataMoedaCompacta(rcl.valAtual)} <span class="text-[10px] text-slate-400">(${rcl.rank > 0 ? rcl.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">DTP (% da RCL):</span> <strong class="text-slate-800">${safeFmt(dtp.valAtual, 1, '%')}</strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Investimentos:</span> <strong class="text-slate-800">${formataMoedaCompacta(invest.valAtual)} <span class="text-[10px] text-slate-400">(${invest.rank > 0 ? invest.rank + 'º BR' : '-'})</span></strong></div>
                        <div class="d-flex justify-content-between text-xs"><span class="text-slate-500">Solvência STN:</span> <strong class="badge bg-purple-100 text-purple-800 px-2 py-0.5 rounded-pill text-[11px]">CAPAG ${capagNota}</strong></div>
                    </div>
                    <div class="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-normal" style="text-align: justify;">
                        ${textoEixo5}
                    </div>
                </div>
            </div>
        `;

        $container.html(htmlResumo);
    } catch (eResumo) {
        console.error("[UFs] Erro ao renderizar resumo executivo UFs:", eResumo);
    }
}
