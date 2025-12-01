# 📄 Ultimate PDF: All-in-One Editor - v1.2.0 ✅ 100% Funcional

Una extensión de Chrome todo-en-uno para gestionar archivos PDF directamente desde el navegador. Interfaz moderna, rápida y completamente local (sin subir archivos a ningún servidor).

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Status](https://img.shields.io/badge/status-100%25%20funcional-brightgreen)
![Chrome](https://img.shields.io/badge/Chrome-Extension-orange)
![Languages](https://img.shields.io/badge/idiomas-14-purple)

## ✨ Características

### 📄 Tab CONVERTIR
- **PDF a JPG**: Convierte páginas PDF a imágenes JPG
- **PDF a PNG**: Convierte páginas PDF a imágenes PNG de alta calidad
- **PDF a Word**: Convierte PDF a documento DOCX editable
- **JPG a PDF**: Crea un PDF desde imágenes JPG
- **PNG a PDF**: Crea un PDF desde imágenes PNG
- **Página Web a PDF**: Captura cualquier página web como PDF
- Opciones de calidad y formato

### ✏️ Tab EDITAR
- **Unir PDFs**: Combina múltiples archivos PDF en uno solo
- **Dividir PDF**: Separa páginas por rangos, extrae específicas, divide cada N páginas
- **Rotar PDF**: Gira todas las páginas o páginas específicas (90°, 180°, 270°)
- **Marca de Agua**: Añade texto o imagen como marca de agua con opacidad configurable
- **Comprimir PDF**: Reduce el tamaño del archivo con diferentes niveles de compresión

### 🔧 Tab EXTRAS (Próximamente)
- 🔒 Proteger PDF con contraseña
- 🔓 Desbloquear PDF
- 📷 Extraer imágenes de PDF
- 📄 Organizar páginas
- ✍️ Firmar PDF

## 🌍 Idiomas Soportados (14)

Español, English, 中文, हिन्दी, العربية, Português, Русский, 日本語, Deutsch, Français, 한국어, Italiano, Türkçe, Nederlands

## 🛠️ Tecnologías Utilizadas

- **PDF-lib**: Manipulación de PDFs (unir, dividir, rotar, comprimir)
- **PDF.js**: Renderizado de PDFs para conversión a imágenes
- **jsPDF**: Creación de PDFs desde imágenes
- **JSZip**: Generación de archivos ZIP y DOCX

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
Ultimate PDF Extension/
├── _locales/            # Traducciones (14 idiomas)
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
│   ├── pdf-to-docx.js   # Conversión a Word
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
│   ├── i18n.js          # Sistema de internacionalización
│   └── logger.js        # Sistema de logging
└── manifest.json        # Configuración de la extensión
```

## 🔒 Privacidad

- **100% Local**: Todos los archivos se procesan en tu navegador
- **Sin servidores**: No se envían datos a ningún servidor externo
- **Seguro**: Tus documentos nunca salen de tu dispositivo
- **Sin registro**: No se requiere cuenta ni login

## 📋 Requisitos

- Google Chrome (versión 116 o superior)
- Manifest V3 compatible

## 🎨 Diseño

- Interfaz moderna con tema claro
- Fuente: Noto Sans (soporte multi-idioma)
- Colores de acento con gradientes
- Iconos SVG personalizados
- Animaciones suaves
- Soporte RTL para árabe

## 📝 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

**Versión 1.2.0** - Todas las funciones 100% operativas ✅

🌐 Soporta 14 idiomas | 📄 11 herramientas PDF | 🔒 100% privado
