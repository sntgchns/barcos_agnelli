from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import os

app = Flask(__name__)

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['agnelli']
collection = db['migrantes']

KEY_MAPPINGS = {
    "nombre_del_barco": ["nombre_del_barco", "buque", "nombre_barco"],
    "puerto_de_salida": ["puerto_de_salida", "puerto_salida"],
    "leer_y_escribir": ["leer_y_escribir", "educacion"],
    # "nombre": ["nombre", "nome"],
    # "apellido": ["apellido", "cognome"],
}

CAMPOS_A_MOSTRAR_EN_FRONTEND = {
    "nombre": ["nombre", "Nombre"],
    "apellido": ["apellido", "Apellido"],
    "edad": ["edad", "Edad"],
    "sexo": ["sexo", "Sexo"],
    "estado_civil": ["estado_civil", "Estado Civil", "estado civil"],
    "profesion": ["profesion", "Profesion", "Profesión"],
    "religion": ["religion", "Religion", "Religión"],
    "puerto_de_salida": ["puerto_de_salida", "puerto_salida", "Puerto de Salida"],
    "nombre_del_barco": ["nombre_del_barco", "buque", "nombre_barco", "Nombre del Barco"],
    "fecha_de_arribo": ["fecha_de_arribo", "fecha arribo", "Fecha de Arribo"],
    "leer_y_escribir": ["leer_y_escribir", "educacion", "Educacion", "Leer y Escribir"],
    "clase": ["clase", "Clase"],
    "anio": ["anio", "Año"]
}

@app.route('/')
def index():
    return render_template('index.html', migrantes=[])

@app.route('/search')
def search_migrantes():
    filter_keys = request.args.getlist('filter_key')
    filter_terms = request.args.getlist('filter_term')

    if not filter_keys or not filter_terms or len(filter_keys) != len(filter_terms):
        return jsonify([])

    mongo_query_parts = []
    for i in range(len(filter_keys)):
        frontend_key = filter_keys[i]
        term = filter_terms[i].strip()
        if frontend_key and term:
            db_keys_to_search = KEY_MAPPINGS.get(frontend_key, [frontend_key])

            if len(db_keys_to_search) > 1:
                or_conditions = []
                for db_key in db_keys_to_search:
                    or_conditions.append({db_key: {'$regex': term, '$options': 'i'}})
                mongo_query_parts.append({'$or': or_conditions})
            else:
                mongo_query_parts.append({db_keys_to_search[0]: {'$regex': term, '$options': 'i'}})

    if not mongo_query_parts:
        return jsonify([])

    query = {'$and': mongo_query_parts} if len(mongo_query_parts) > 1 else mongo_query_parts[0]

    try:
        resultados_cursor = collection.find(query, {'_id': 0})

        resultados_para_frontend = []
        for doc_db in list(resultados_cursor):
            doc_frontend = {}
            for frontend_key, possible_db_keys in CAMPOS_A_MOSTRAR_EN_FRONTEND.items():
                found_value = None
                for db_key in possible_db_keys:
                    if db_key in doc_db and doc_db[db_key] is not None:
                        found_value = doc_db[db_key]
                        break

                if found_value is not None:
                    if frontend_key == "edad":
                        try:
                            doc_frontend[frontend_key] = str(int(float(str(found_value))))
                        except ValueError:
                            doc_frontend[frontend_key] = str(found_value) 
                    else:
                        doc_frontend[frontend_key] = str(found_value)
                else:
                    doc_frontend[frontend_key] = ""
            resultados_para_frontend.append(doc_frontend)

    except Exception as e:
        print(f"Error al buscar o transformar datos en MongoDB: {e}")
        return jsonify({"error": f"Error al conectar, consultar o transformar datos: {str(e)}"}), 500

    return jsonify(resultados_para_frontend)

if __name__ == '__main__':
    flask_port = int(os.environ.get('FLASK_PORT', 5001))
    flask_debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=flask_debug, port=flask_port, host='0.0.0.0')