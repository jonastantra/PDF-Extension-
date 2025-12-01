# PDF Tools All-in-One - Documentación para Chrome Web Store

## 📋 Información General de la Extensión

| Campo | Valor |
|-------|-------|
| **Nombre** | PDF Tools All-in-One / Herramientas PDF Todo-en-Uno |
| **Versión** | 1.1.0 |
| **Manifest Version** | 3 |
| **Categoría sugerida** | Productividad / Herramientas de oficina |
| **Idioma principal** | Español (es) |
| **Idiomas soportados** | 14 idiomas (EN, ES, ZH_CN, HI, AR, PT_BR, RU, JA, DE, FR, KO, IT, TR, NL) |

---

## 🛠️ Funcionalidades Completas

### PESTAÑA: CONVERTIR

#### 1. PDF a JPG
- **Descripción**: Convierte cada página de un PDF en imágenes JPG independientes.
- **Formatos de entrada**: PDF
- **Formatos de salida**: JPG/JPEG
- **Opciones**:
  - Calidad: Alta (150 DPI), Muy Alta (300 DPI), Media (Web)
  - Formato: JPG, PNG, WebP
- **Proceso**: 100% local, sin subir archivos a servidores externos.

#### 2. PDF a PNG
- **Descripción**: Convierte cada página de un PDF en imágenes PNG con soporte de transparencia.
- **Formatos de entrada**: PDF
- **Formatos de salida**: PNG
- **Opciones**: Mismas que PDF a JPG
- **Proceso**: 100% local.

#### 3. PDF a Word (DOCX)
- **Descripción**: Extrae el texto de un PDF y lo convierte en un documento Word editable (.docx).
- **Formatos de entrada**: PDF
- **Formatos de salida**: DOCX
- **Características**:
  - Extrae todo el texto del PDF
  - Mantiene la estructura por páginas
  - Archivo DOCX editable en Microsoft Word, Google Docs, LibreOffice
  - Conversión 100% local y privada
- **Proceso**: 100% local, sin enviar datos a servidores.

#### 4. JPG a PDF
- **Descripción**: Convierte una o múltiples imágenes JPG en un documento PDF.
- **Formatos de entrada**: JPG, JPEG
- **Formatos de salida**: PDF
- **Opciones**:
  - Tamaño de página: A4, Carta, Ajustar a imagen
  - Orientación: Vertical, Horizontal
  - Ajuste: Ajustar a página o tamaño original
- **Proceso**: 100% local.

#### 5. PNG a PDF
- **Descripción**: Convierte una o múltiples imágenes PNG en un documento PDF.
- **Formatos de entrada**: PNG
- **Formatos de salida**: PDF
- **Opciones**: Mismas que JPG a PDF
- **Proceso**: 100% local.

#### 6. Página Web a PDF
- **Descripción**: Captura la página web actual del navegador y la convierte a PDF.
- **Características**:
  - Preserva estilos y formatos de la página
  - Modo de captura: Área visible o página completa (scroll)
  - Tamaño de página: A4, Carta, Legal
  - Orientación: Vertical u Horizontal
  - Opción de incluir márgenes
  - Usa el diálogo de impresión nativo de Chrome para máxima fidelidad
- **Limitaciones**: No funciona en páginas protegidas del sistema (chrome://, about:, extensiones)
- **Proceso**: 100% local.

---

### PESTAÑA: EDITAR

#### 7. Unir PDFs (Merge)
- **Descripción**: Combina múltiples archivos PDF en un solo documento.
- **Formatos de entrada**: PDF (múltiples archivos)
- **Formatos de salida**: PDF único
- **Características**:
  - Arrastra y suelta archivos
  - Reordena archivos antes de unir
  - Sin límite de archivos
- **Proceso**: 100% local.

#### 8. Dividir PDF (Split)
- **Descripción**: Separa un PDF en múltiples archivos o extrae páginas específicas.
- **Formatos de entrada**: PDF
- **Formatos de salida**: PDF (uno o múltiples)
- **Modos de división**:
  - **Rangos**: Divide por rangos de páginas específicos (ej: 1-3, 5-7)
  - **Extraer**: Extrae páginas individuales seleccionadas
  - **Cada N**: Divide cada N páginas (ej: cada 5 páginas)
  - **1 x Página**: Crea un PDF por cada página
- **Proceso**: 100% local.

#### 9. Rotar PDF
- **Descripción**: Rota las páginas de un PDF.
- **Formatos de entrada**: PDF
- **Formatos de salida**: PDF
- **Opciones**:
  - Ángulo: 90° (derecha), 180°, 270° (izquierda)
  - Aplicar a: Todas las páginas o páginas específicas
- **Proceso**: 100% local.

#### 10. Marca de Agua (Watermark)
- **Descripción**: Añade una marca de agua de texto o imagen a un PDF.
- **Formatos de entrada**: PDF
- **Formatos de salida**: PDF con marca de agua
- **Opciones**:
  - Tipo: Texto o Imagen
  - Texto personalizable (ej: "CONFIDENCIAL", "BORRADOR")
  - Tamaño de fuente: Pequeño (24px), Mediano (48px), Grande (72px)
  - Opacidad: 10%, 20%, 30%, 50%
  - Posición: Centro (diagonal), Arriba, Abajo
- **Proceso**: 100% local.

#### 11. Comprimir PDF
- **Descripción**: Reduce el tamaño de archivo de un PDF.
- **Formatos de entrada**: PDF
- **Formatos de salida**: PDF comprimido
- **Opciones**:
  - Nivel de compresión: Baja (mejor calidad), Media (recomendado), Alta (menor tamaño)
  - Eliminar metadatos: Sí/No
- **Resultado**: Muestra el porcentaje de ahorro
- **Proceso**: 100% local.

---

### PESTAÑA: EXTRAS (Próximamente)

Funciones en desarrollo:
- 🔒 Proteger PDF con contraseña
- 🔓 Desbloquear PDF
- 📷 Extraer imágenes de PDF
- 📄 Organizar páginas
- ✍️ Firmar PDF

---

## 🔐 Permisos Requeridos y Justificación

| Permiso | Justificación |
|---------|---------------|
| `sidePanel` | Permite mostrar la interfaz de la extensión en el panel lateral de Chrome para acceso rápido y no intrusivo. |
| `storage` | Guarda las preferencias del usuario (idioma seleccionado, configuraciones) localmente en el navegador. |
| `scripting` | Necesario para capturar el contenido de páginas web para la función "Página Web a PDF". |
| `activeTab` | Accede a la pestaña activa actual para obtener información de la página web que el usuario desea convertir. |
| `tabs` | Permite obtener la URL y título de la pestaña actual para la función de captura de páginas web. |

### Host Permissions
| Permiso | Justificación |
|---------|---------------|
| `<all_urls>` | Necesario para que la función "Página Web a PDF" pueda capturar cualquier página web que el usuario visite. **La extensión NUNCA envía datos a servidores externos.** |

---

## 🔒 Política de Privacidad

### Resumen Ejecutivo
**PDF Tools All-in-One NO recopila, almacena, ni transmite ningún dato personal del usuario ni el contenido de sus archivos.**

### Declaración Completa de Privacidad

#### 1. Recopilación de Datos
- **NO recopilamos datos personales**: Ninguna información de identificación personal.
- **NO recopilamos contenido de archivos**: Los PDFs, imágenes y documentos procesados permanecen 100% en el dispositivo del usuario.
- **NO recopilamos datos de navegación**: No rastreamos las páginas web visitadas.
- **NO usamos cookies de terceros**: No hay seguimiento ni analytics externos.

#### 2. Procesamiento de Datos
- **Todo el procesamiento es LOCAL**: Todas las operaciones de PDF (convertir, unir, dividir, comprimir, etc.) se realizan completamente dentro del navegador del usuario.
- **Sin servidores externos**: Los archivos NUNCA se suben a ningún servidor. Todo el procesamiento ocurre en el dispositivo del usuario.
- **Sin conexión a Internet requerida**: Una vez instalada, la extensión funciona sin necesidad de conexión a Internet (excepto para captura de páginas web que requieren cargar la página).

#### 3. Almacenamiento Local
La extensión únicamente almacena:
- **Preferencias de idioma**: El idioma seleccionado por el usuario (guardado localmente via `chrome.storage.local`).
- **Configuraciones de herramientas**: Opciones como calidad de imagen preferida (guardado localmente).

Estos datos:
- Se almacenan SOLO en el dispositivo del usuario
- NO se sincronizan con ningún servidor
- Pueden ser eliminados borrando los datos de la extensión

#### 4. Transferencia de Datos
- **NO transferimos datos**: Ningún dato sale del navegador del usuario.
- **NO compartimos datos**: No hay terceros involucrados.
- **NO vendemos datos**: No hay modelo de negocio basado en datos.

#### 5. Bibliotecas de Terceros (incluidas localmente)
La extensión incluye las siguientes bibliotecas de código abierto que se ejecutan LOCALMENTE:
- **PDF-lib**: Manipulación de PDFs
- **PDF.js (Mozilla)**: Renderizado de PDFs
- **jsPDF**: Creación de PDFs
- **JSZip**: Manejo de archivos comprimidos

Todas estas bibliotecas:
- Se incluyen localmente en la extensión
- NO realizan conexiones externas
- Son de código abierto y auditables

#### 6. Seguridad
- **Content Security Policy**: Implementamos políticas de seguridad estrictas.
- **Sin ejecución de código remoto**: Todo el código se ejecuta localmente.
- **Manifest V3**: Usamos la versión más segura del manifiesto de Chrome.

#### 7. Derechos del Usuario
- **Control total**: El usuario tiene control completo sobre sus archivos en todo momento.
- **Sin registro**: No se requiere crear cuenta ni registrarse.
- **Desinstalación limpia**: Al desinstalar, todos los datos locales se eliminan automáticamente.

#### 8. Cambios en la Política
Cualquier cambio en esta política se reflejará en una actualización de la extensión.

#### 9. Contacto
Para preguntas sobre privacidad: [Tu email de contacto]

---

## 📝 Descripción para Chrome Web Store

### Descripción Corta (132 caracteres máx.)
```
Convierte, une, divide y edita PDFs 100% localmente. Sin subir archivos. Privacidad total. Soporta 14 idiomas.
```

### Descripción Larga

```
🔧 HERRAMIENTAS PDF TODO-EN-UNO - Tu suite completa de PDF, 100% privada

¿Necesitas trabajar con PDFs sin preocuparte por tu privacidad? PDF Tools All-in-One es la solución perfecta. Todas las operaciones se realizan LOCALMENTE en tu navegador. Tus archivos NUNCA salen de tu computadora.

✨ CARACTERÍSTICAS PRINCIPALES

📄 CONVERTIR
• PDF a JPG/PNG - Convierte páginas a imágenes de alta calidad
• PDF a Word - Extrae texto a documentos DOCX editables  
• Imágenes a PDF - Crea PDFs desde JPG, PNG y más
• Página Web a PDF - Guarda cualquier sitio web como PDF

✏️ EDITAR
• Unir PDFs - Combina múltiples PDFs en uno
• Dividir PDF - Separa páginas o extrae secciones
• Rotar PDF - Gira páginas en cualquier dirección
• Marca de Agua - Añade texto o imágenes como marca
• Comprimir PDF - Reduce el tamaño del archivo

🔒 PRIVACIDAD GARANTIZADA
• 100% procesamiento LOCAL - Nada se sube a servidores
• Sin registro requerido - Usa la extensión inmediatamente
• Sin rastreo - No recopilamos ningún dato
• Código transparente - Bibliotecas de código abierto

🌍 DISPONIBLE EN 14 IDIOMAS
Español, English, 中文, हिन्दी, العربية, Português, Русский, 日本語, Deutsch, Français, 한국어, Italiano, Türkçe, Nederlands

💡 FÁCIL DE USAR
1. Haz clic en el icono de la extensión
2. Selecciona la herramienta que necesitas
3. Arrastra tus archivos o selecciónalos
4. ¡Listo! Descarga tu archivo procesado

⚡ RÁPIDO Y EFICIENTE
• Interfaz moderna en panel lateral
• Arrastra y suelta archivos
• Procesamiento instantáneo
• Sin límites de archivos

📱 CASOS DE USO
• Estudiantes: Convierte apuntes y material de estudio
• Profesionales: Gestiona documentos de trabajo
• Creativos: Convierte diseños e imágenes
• Cualquiera: Organiza y optimiza tus PDFs

🛡️ SEGURIDAD
• Manifest V3 - La versión más segura de Chrome Extensions
• Política de seguridad de contenido estricta
• Sin ejecución de código remoto

Descarga PDF Tools All-in-One y toma el control de tus documentos PDF con total privacidad.

---
Privacidad: Tus archivos nunca salen de tu dispositivo.
Soporte: [Tu email]
```

---

## 🖼️ Assets Requeridos para Chrome Web Store

### Iconos (ya incluidos)
- ✅ 16x16 px - `assets/icon16.png`
- ✅ 48x48 px - `assets/icon48.png`
- ✅ 128x128 px - `assets/icon128.png`

### Screenshots Recomendados (1280x800 o 640x400)
Crear capturas de:
1. Vista principal - Pestaña CONVERTIR con las herramientas
2. PDF a Word en acción - Mostrando conversión
3. Pestaña EDITAR - Lista de herramientas de edición
4. Unir PDFs - Múltiples archivos siendo combinados
5. Página Web a PDF - Capturando una página

### Imagen Promocional
- Pequeña: 440x280 px
- Grande: 920x680 px (marquee)
- Tile pequeño: 440x280 px

---

## 📊 Categorías Sugeridas para Chrome Web Store

**Categoría Principal**: Productividad

**Categorías Secundarias**:
- Herramientas de oficina
- Utilidades

---

## 🔗 Enlaces Requeridos

| Campo | Valor |
|-------|-------|
| **Sitio web del desarrollador** | [Tu sitio web] |
| **Política de privacidad URL** | [URL de tu política de privacidad] |
| **Soporte/Ayuda URL** | [URL de soporte o email] |

---

## ✅ Checklist para Publicación

- [ ] Iconos en todos los tamaños (16, 48, 128)
- [ ] Mínimo 1 screenshot (máximo 5)
- [ ] Descripción corta (máx 132 caracteres)
- [ ] Descripción larga detallada
- [ ] Categoría seleccionada
- [ ] URL de política de privacidad pública
- [ ] Email de contacto de desarrollador
- [ ] Justificación de permisos lista
- [ ] Probado en múltiples idiomas
- [ ] Sin errores de consola
- [ ] Manifest V3 compliance ✅

---

## 📞 Información de Contacto del Desarrollador

| Campo | Valor |
|-------|-------|
| **Nombre** | [Tu nombre o empresa] |
| **Email** | [Tu email] |
| **Sitio web** | [Tu URL] |

---

*Documento generado para asistir en la publicación de la extensión PDF Tools All-in-One en Chrome Web Store.*

