# 🚀 Guía de Publicación - Ultimate PDF: All-in-One Editor

## ✅ Checklist de Pre-Publicación

- [x] Manifest V3 compatible
- [x] Iconos en todos los tamaños (16, 48, 128)
- [x] Política de privacidad lista (PRIVACY_POLICY.html)
- [x] 14 idiomas soportados
- [x] Todas las funciones probadas
- [x] Sin errores en consola
- [ ] Screenshots (debes crearlos)
- [ ] Imágenes promocionales (opcionales)
- [ ] Cuenta de desarrollador Chrome ($5 USD)

---

## 📝 TEXTOS PARA COPIAR/PEGAR EN CHROME WEB STORE

### Nombre de la Extensión
```
Ultimate PDF: All-in-One Editor
```

### Descripción Corta (máx 132 caracteres)
```
Convert, merge, split & edit PDFs 100% locally. Your files never leave your device. Free, private & secure.
```

### Descripción Corta en Español
```
Convierte, une, divide y edita PDFs 100% local. Tus archivos nunca salen de tu dispositivo. Gratis y privado.
```

### Descripción Detallada (para Chrome Web Store)

```
🔧 ULTIMATE PDF: ALL-IN-ONE EDITOR

The complete PDF toolkit that respects your privacy. All operations happen 100% LOCALLY on your device - your files NEVER leave your computer.

✨ FEATURES

📄 CONVERT
• PDF to JPG/PNG - Convert pages to high-quality images
• PDF to Word - Extract text to editable DOCX documents
• Images to PDF - Create PDFs from JPG, PNG and more
• Webpage to PDF - Save any website as PDF

✏️ EDIT
• Merge PDFs - Combine multiple PDFs into one
• Split PDF - Separate pages or extract sections
• Rotate PDF - Turn pages any direction
• Watermark - Add text or image watermarks
• Compress PDF - Reduce file size

🔒 PRIVACY GUARANTEED
• 100% LOCAL processing - Nothing uploaded to servers
• No registration required - Use immediately
• No tracking - We don't collect any data
• Open source libraries - Transparent code

🌍 AVAILABLE IN 14 LANGUAGES
English, Español, 中文, हिन्दी, العربية, Português, Русский, 日本語, Deutsch, Français, 한국어, Italiano, Türkçe, Nederlands

💡 HOW TO USE
1. Click the extension icon
2. Select the tool you need
3. Drag & drop your files
4. Configure options
5. Download your processed file

⚡ FAST & EFFICIENT
• Modern side panel interface
• Drag and drop support
• Instant processing
• No file limits

🛡️ SECURITY
• Manifest V3 - Chrome's most secure extension format
• Strict Content Security Policy
• No remote code execution

Perfect for students, professionals, and anyone who works with PDFs!

Download Ultimate PDF: All-in-One Editor and take control of your documents with total privacy.

---
Privacy: Your files never leave your device.
```

---

## 🔐 JUSTIFICACIÓN DE PERMISOS

### Para el formulario de Chrome Web Store:

#### sidePanel
```
This permission is required to display the extension's user interface in Chrome's side panel, providing a convenient and non-intrusive way for users to access PDF tools while browsing.
```

#### storage
```
This permission is used to save user preferences locally, such as the selected interface language and tool settings (quality, format options). No data is ever transmitted to external servers.
```

#### activeTab
```
This permission is required for the "Webpage to PDF" feature, which captures the content of the currently active tab to convert it to a PDF document. It is only used when the user explicitly initiates this action.
```

#### tabs
```
This permission is used to retrieve the title and URL of the current webpage when using the "Webpage to PDF" feature. This information is used only to name the resulting PDF file and is never stored or transmitted.
```

#### scripting
```
This permission is required to execute the webpage capture script for the "Webpage to PDF" feature. It allows the extension to capture the visual content of the page for PDF conversion.
```

#### host_permissions (<all_urls>)
```
This broad host permission is required for the "Webpage to PDF" feature to function on any website the user visits. The extension ONLY accesses page content when the user explicitly requests to convert a webpage to PDF. No browsing data is collected, stored, or transmitted. All processing occurs locally on the user's device.
```

---

## 📊 CATEGORÍA Y CONFIGURACIÓN

### Categoría Principal
```
Productivity
```

### Categorías Adicionales Sugeridas
```
- Office Applications
- Utilities
```

### Idioma Principal
```
English (or Spanish, depending on your target)
```

### Regiones
```
All regions (recomendado para máximo alcance)
```

### Visibilidad
```
Public (visible en Chrome Web Store)
```

### Precio
```
Free
```

---

## 🖼️ SCREENSHOTS REQUERIDOS

Debes crear screenshots de 1280x800 px o 640x400 px:

### Screenshot 1: Vista Principal
- Muestra la pestaña CONVERT con todas las herramientas visibles
- Título sugerido: "All PDF tools in one place"

### Screenshot 2: PDF to Word
- Muestra un PDF cargado y listo para convertir
- Título sugerido: "Convert PDF to editable Word documents"

### Screenshot 3: Edit Tools
- Muestra la pestaña EDIT con las herramientas de edición
- Título sugerido: "Merge, split, rotate and more"

### Screenshot 4: Compress PDF
- Muestra la herramienta de compresión con ahorro de tamaño
- Título sugerido: "Reduce PDF file size easily"

### Screenshot 5: Privacy Message
- Muestra un mensaje destacando la privacidad
- Título sugerido: "100% local - Your files never leave your device"

---

## 🎨 IMÁGENES PROMOCIONALES (OPCIONALES)

### Small Promo Tile (440x280 px)
- Logo de Ultimate PDF
- Texto: "All-in-One PDF Editor"
- Fondo con gradiente moderno

### Large Promo Tile (920x680 px)
- Similar al pequeño pero más detallado
- Puede incluir iconos de las herramientas

### Marquee (1400x560 px)
- Banner promocional grande
- Mostrar las principales características

---

## 📋 PROCESO DE PUBLICACIÓN PASO A PASO

### 1. Crear cuenta de desarrollador
1. Ve a https://chrome.google.com/webstore/devconsole
2. Paga la tarifa única de $5 USD
3. Completa la verificación de identidad

### 2. Preparar el archivo ZIP
1. Selecciona TODOS los archivos de la extensión (NO la carpeta)
2. Crea un archivo ZIP que incluya:
   - manifest.json (en la raíz del ZIP)
   - Todas las carpetas: assets, core, libs, modules, ui, utils, _locales
3. NO incluir: README.md, CHROME_STORE_INFO.md, PRIVACY_POLICY.html, .git

### 3. Subir la extensión
1. En el Developer Dashboard, clic en "Add new item"
2. Sube el archivo ZIP
3. Espera a que se procese

### 4. Completar información de la tienda
1. **Descripción**: Copia los textos de arriba
2. **Categoría**: Productivity
3. **Idioma**: English (o Spanish)
4. **Screenshots**: Sube las capturas de pantalla
5. **Iconos**: Ya están en el ZIP

### 5. Configurar privacidad
1. **Single purpose description**: 
   ```
   This extension provides a complete suite of PDF tools (convert, merge, split, rotate, compress, watermark) that process files 100% locally on the user's device.
   ```
2. **Privacy policy URL**: URL donde subas PRIVACY_POLICY.html
3. **Permissions justifications**: Copia las justificaciones de arriba

### 6. Enviar para revisión
1. Revisa toda la información
2. Clic en "Submit for review"
3. Espera 1-3 días hábiles para la revisión

---

## ⚠️ NOTAS IMPORTANTES

### Sobre host_permissions
Chrome es estricto con `<all_urls>`. En la justificación, enfatiza que:
- Solo se usa para "Webpage to PDF"
- El usuario debe iniciar la acción explícitamente
- No se recopila ningún dato de navegación
- Todo el procesamiento es local

### Sobre la revisión
- La primera revisión puede tardar más (hasta 1 semana)
- Si rechazan, leerás los motivos específicos
- Puedes apelar o corregir y volver a enviar

### Actualizaciones futuras
- Cada actualización pasa por revisión
- Las actualizaciones menores suelen aprobarse en 24-48 horas
- Mantén siempre la versión actualizada en manifest.json

---

## 📁 ESTRUCTURA DEL ZIP PARA SUBIR

```
ultimate-pdf-extension.zip
├── manifest.json
├── _locales/
│   ├── en/
│   │   └── messages.json
│   ├── es/
│   │   └── messages.json
│   └── ... (otros 12 idiomas)
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── core/
│   └── background.js
├── libs/
│   ├── jspdf.umd.min.js
│   ├── jszip.min.js
│   ├── pdf-lib.min.js
│   ├── pdf.min.js
│   └── pdf.worker.min.js
├── modules/
│   ├── compress.js
│   ├── convert.js
│   ├── create.js
│   ├── merge.js
│   ├── pdf-to-docx.js
│   ├── rotate.js
│   ├── split.js
│   ├── watermark.js
│   └── webpage.js
├── ui/
│   ├── sidebar.css
│   ├── sidebar.html
│   └── sidebar.js
└── utils/
    ├── file-handler.js
    ├── i18n.js
    └── logger.js
```

---

## ✅ ÚLTIMA VERIFICACIÓN

Antes de subir, verifica:

1. [ ] ¿La extensión funciona correctamente?
2. [ ] ¿Todos los iconos se ven bien?
3. [ ] ¿El manifest.json tiene la versión correcta (1.2.0)?
4. [ ] ¿Tienes screenshots listos?
5. [ ] ¿Tienes la política de privacidad en una URL pública?
6. [ ] ¿Tienes $5 USD para la cuenta de desarrollador?

---

¡Buena suerte con la publicación! 🚀

