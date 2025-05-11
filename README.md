# Buscador de Migrantes

Este proyecto es una aplicación web desarrollada con Flask que permite buscar y visualizar información sobre migrantes que han partido de diferentes puertos. La aplicación presenta los datos de manera amigable y accesible.

## Estructura del Proyecto

El proyecto tiene la siguiente estructura de archivos:

```
buscador-migrantes
├── app.py                # Punto de entrada de la aplicación Flask
├── static
│   ├── css
│   │   └── style.css     # Estilos CSS para la aplicación
│   └── js
│       └── script.js     # Código JavaScript para interacciones
├── templates
│   ├── index.html        # Plantilla para mostrar información de migrantes
│   └── layout.html       # Plantilla base para la estructura de páginas
├── requirements.txt      # Dependencias necesarias para el proyecto
└── README.md             # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd buscador-migrantes
   ```

2. Crea un entorno virtual (opcional pero recomendado):
   ```
   python -m venv venv
   source venv/bin/activate  # En Linux/Mac
   venv\Scripts\activate     # En Windows
   ```

3. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

## Ejecución

Para ejecutar la aplicación, utiliza el siguiente comando:

```
python app.py
```

La aplicación estará disponible en `http://127.0.0.1:5000/`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.