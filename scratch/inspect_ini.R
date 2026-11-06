library(arrow)
df <- read_parquet('data/parquet/df_iniciativas.parquet')
sub <- df[grepl("petrolina", df$municipio, ignore.case=TRUE), ]
cat("Linhas em Petrolina:", nrow(sub), "\n")
print(head(sub[, c("secretaria", "iniciativa_estrategica", "valor_total", "valor_pago")], 10))
