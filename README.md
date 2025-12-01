# 📄 PDF Tools Extension - v1.0.0 ✅ 100% Funcional

Una extensión de Chrome todo-en-uno para gestionar archivos PDF directamente desde el navegador. Interfaz moderna, rápida y completamente local (sin subir archivos a ningún servidor).

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-100%25%20funcional-brightgreen)
![Chrome](https://img.shields.io/badge/Chrome-Extension-orange)

## ✨ Características

### 📚 Tab UNIR
- **Unir PDFs**: Combina múltiples archivos PDF en uno solo
- Drag & drop o selección de archivos
- Vista previa de archivos agregados
- Reordenamiento de archivos

### 🖼️ Tab IMG
- **PDF a JPG**: Convierte páginas PDF a imágenes JPG
- **PDF a PNG**: Convierte páginas PDF a imágenes PNG de alta calidad
- **JPG a PDF**: Crea un PDF desde imágenes JPG
- **PNG a PDF**: Crea un PDF desde imágenes PNG
- Opciones de calidad y formato

### 📝 Tab PDF
- **Dividir PDF**: Separa páginas por rangos, extrae específicas, divide cada N páginas
- **Rotar PDF**: Gira todas las páginas o páginas específicas (90°, 180°, 270°)
- **Marca de Agua**: Añade texto o imagen como marca de agua con opacidad configurable
- **Comprimir PDF**: Reduce el tamaño del archivo con diferentes niveles de compresión

### 🌐 Tab WEB
- **Página Web a PDF**: Captura la página web actual y la convierte a PDF
- Captura del área visible o página completa (scroll)
- Configuración de tamaño, orientación y márgenes
- Alternativa: usar diálogo de impresión de Chrome

## 🛠️ Tecnologías Utilizadas

- **PDF-lib**: Manipulación de PDFs (unir, dividir, rotar, comprimir)
- **PDF.js**: Renderizado de PDFs para conversión a imágenes
- **jsPDF**: Creación de PDFs desde imágenes
- **JSZip**: Generación de archivos ZIP para múltiples archivos

## 📦 Instalación

1. Clona o descarga este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta del proyecto

## 🚀 Uso

1. Haz clic en el icono de la extensión en la barra de herramientas
2. Se abrirá el panel lateral con todas las herramientas
3. Selecciona la pestaña de la función que necesitas
4. Arrastra archivos o haz clic para seleccionar
5. Configura las opciones según tus necesidades
6. Haz clic en el botón de acción para procesar

## 📁 Estructura del Proyecto

```
PDF EXTENSION/
├── assets/              # Iconos de la extensión
├── core/
│   └── background.js    # Service worker
├── libs/                # Librerías externas
│   ├── jspdf.umd.min.js
│   ├── jszip.min.js
│   ├── pdf-lib.min.js
│   ├── pdf.min.js
│   └── pdf.worker.min.js
├── modules/             # Módulos de funcionalidad
│   ├── compress.js      # Compresión de PDFs
│   ├── convert.js       # Conversión PDF a imagen
│   ├── create.js        # Creación de PDF desde imágenes
│   ├── merge.js         # Unión de PDFs
│   ├── rotate.js        # Rotación de PDFs
│   ├── split.js         # División de PDFs
│   ├── watermark.js     # Marca de agua
│   └── webpage.js       # Captura de página web
├── ui/
│   ├── sidebar.css      # Estilos de la interfaz
│   ├── sidebar.html     # Estructura HTML
│   └── sidebar.js       # Lógica de la UI
├── utils/
│   ├── file-handler.js  # Utilidades de archivos
│   └── logger.js        # Sistema de logging
└── manifest.json        # Configuración de la extensión
```

## 🔒 Privacidad

- **100% Local**: Todos los archivos se procesan en tu navegador
- **Sin servidores**: No se envían datos a ningún servidor externo
- **Seguro**: Tus documentos nunca salen de tu dispositivo

## 📋 Requisitos

- Google Chrome (versión 116 o superior)
- Manifest V3 compatible

## 🎨 Diseño

- Interfaz moderna con tema claro
- Fuente: Plus Jakarta Sans
- Colores de acento con gradientes
- Iconos SVG personalizados
- Animaciones suaves

## 📝 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

**Versión 1.0.0** - Todas las funciones 100% operativas ✅


