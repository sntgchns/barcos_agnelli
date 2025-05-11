import os
import pandas as pd

# Carpeta de entrada con archivos .xls
carpeta_entrada = "./in"  # Cambiá esta ruta

# Carpeta de salida para los .csv
carpeta_salida = "./out"   # Podés usar la misma si querés

# Crear carpeta de salida si no existe
os.makedirs(carpeta_salida, exist_ok=True)

# Procesar todos los archivos .xls
for archivo in os.listdir(carpeta_entrada):
    if archivo.endswith(".xls"):
        ruta_xls = os.path.join(carpeta_entrada, archivo)
        nombre_sin_ext = os.path.splitext(archivo)[0]
        ruta_csv = os.path.join(carpeta_salida, f"{nombre_sin_ext}.csv")

        try:
            df = pd.read_excel(ruta_xls)
            df.to_csv(ruta_csv, index=False)
            print(f"✅ Convertido: {archivo} → {nombre_sin_ext}.csv")
        except Exception as e:
            print(f"❌ Error con {archivo}: {e}")