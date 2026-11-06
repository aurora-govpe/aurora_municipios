library(arrow)
df <- read_parquet('data/parquet/df_indicadores.parquet')
sub <- unique(df[, c("nm_indicador", "sigla_indicador", "grupo")])
print(sub[grepl("comercio|exterior|comex|tec|infocom", paste(sub$nm_indicador, sub$sigla_indicador, sub$grupo), ignore.case=TRUE), ])
