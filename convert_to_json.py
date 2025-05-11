import pandas as pd
import json
import os
import unicodedata
import re

def convertir_valor(val):
    if pd.isna(val):
        return ""
    if isinstance(val, pd.Timestamp):
        return val.strftime("%d-%m-%Y")
    return str(val).strip()

def normalizar_columna(nombre):
    # Elimina tildes, pasa a minúsculas, reemplaza espacios por guion bajo, limpia dobles guiones bajos
    nombre = str(nombre).strip().replace('\n', ' ').replace('"', '')
    nombre = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode("utf-8")
    nombre = nombre.lower().replace(" ", "_")
    nombre = re.sub(r"__+", "_", nombre)  # Reemplaza múltiples "_" por uno solo
    nombre = re.sub(r"[^a-z0-9_]", "", nombre)  # Elimina caracteres no deseados
    return nombre

carpeta = "./in"
todos_los_registros = []

for archivo in sorted(os.listdir(carpeta)):
    if archivo.endswith(".xls") or archivo.endswith(".xlsx"):
        ruta = os.path.join(carpeta, archivo)
        try:
            df = pd.read_excel(ruta)
            df.columns = [normalizar_columna(col) for col in df.columns]
            df = df.dropna(how="all")
            
            for col in df.columns:
                df[col] = df[col].apply(convertir_valor)
            
            año = int(archivo[:4])
            df["anio"] = año
            registros = df.to_dict(orient="records")
            todos_los_registros.extend(registros)
            print(f"✅ Procesado: {archivo}")
        except Exception as e:
            print(f"❌ Error en {archivo}: {e}")

with open("land.json", "w", encoding="utf-8") as f:
    json.dump(todos_los_registros, f, ensure_ascii=False, indent=2)