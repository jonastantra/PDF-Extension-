import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const PdfToDocxModule = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
    options: {
        preserveLayout: true,
        includeImages: false // Future feature
    },

    init: () => {
        Logger.info('PDF to DOCX Module Initialized');
        PdfToDocxModule.file = null;
        PdfToDocxModule.pdfDoc = null;
        PdfToDocxModule.totalPages = 0;
    },

    setFile: async (file) => {
        Logger.info('PdfToDocxModule.setFile called with:', file?.name);
        
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }

        // Verify PDF.js is available
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library not loaded');
        }

        // Configure PDF.js worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
        Logger.info('PDF.js worker configured');

        PdfToDocxModule.file = file;
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        Logger.info('File read as ArrayBuffer, size:', arrayBuffer.byteLength);
        
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        PdfToDocxModule.pdfDoc = await loadingTask.promise;
        PdfToDocxModule.totalPages = PdfToDocxModule.pdfDoc.numPages;

        Logger.info(`PDF Loaded for DOCX conversion. Pages: ${PdfToDocxModule.totalPages}`);

        return {
            name: file.name,
            pages: PdfToDocxModule.totalPages
        };
    },

    extractTextFromPage: async (pageNum) => {
        const page = await PdfToDocxModule.pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Group text items by their vertical position to maintain layout
        const lines = [];
        let currentLine = [];
        let lastY = null;
        const lineThreshold = 5; // Pixels difference to consider same line

        textContent.items.forEach(item => {
            const y = item.transform[5];
            
            if (lastY !== null && Math.abs(y - lastY) > lineThreshold) {
                // New line
                if (currentLine.length > 0) {
                    // Sort by x position and join
                    currentLine.sort((a, b) => a.x - b.x);
                    lines.push(currentLine.map(i => i.text).join(' '));
                }
                currentLine = [];
            }
            
            currentLine.push({
                text: item.str,
                x: item.transform[4],
                y: y
            });
            lastY = y;
        });

        // Don't forget the last line
        if (currentLine.length > 0) {
            currentLine.sort((a, b) => a.x - b.x);
            lines.push(currentLine.map(i => i.text).join(' '));
        }

        // Reverse because PDF coordinates are bottom-up
        return lines.reverse();
    },

    process: async (progressCallback) => {
        if (!PdfToDocxModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        Logger.info('Starting PDF to DOCX conversion');

        try {
            progressCallback(5, 'Extrayendo texto del PDF...');

            // Extract text from all pages
            const allText = [];
            
            for (let i = 1; i <= PdfToDocxModule.totalPages; i++) {
                progressCallback(5 + (i / PdfToDocxModule.totalPages) * 50, `Procesando página ${i}/${PdfToDocxModule.totalPages}...`);
                
                const pageLines = await PdfToDocxModule.extractTextFromPage(i);
                allText.push({
                    pageNum: i,
                    lines: pageLines
                });
            }

            progressCallback(60, 'Generando documento Word...');

            // Create DOCX file
            const docxBlob = await PdfToDocxModule.createDocx(allText, progressCallback);

            progressCallback(100, '¡Conversión completada!');

            return docxBlob;

        } catch (error) {
            Logger.error('PDF to DOCX conversion failed', error);
            throw error;
        }
    },

    createDocx: async (pagesText, progressCallback) => {
        const zip = new JSZip();

        progressCallback(65, 'Creando estructura del documento...');

        // [Content_Types].xml
        zip.file('[Content_Types].xml', PdfToDocxModule.getContentTypes());

        // _rels/.rels
        zip.folder('_rels').file('.rels', PdfToDocxModule.getRels());

        // word/_rels/document.xml.rels
        zip.folder('word/_rels').file('document.xml.rels', PdfToDocxModule.getDocumentRels());

        // word/styles.xml
        zip.folder('word').file('styles.xml', PdfToDocxModule.getStyles());

        // word/settings.xml
        zip.file('word/settings.xml', PdfToDocxModule.getSettings());

        // word/fontTable.xml
        zip.file('word/fontTable.xml', PdfToDocxModule.getFontTable());

        progressCallback(75, 'Agregando contenido...');

        // word/document.xml - Main content
        zip.file('word/document.xml', PdfToDocxModule.getDocumentXml(pagesText));

        progressCallback(90, 'Finalizando archivo...');

        // Generate the DOCX file
        const blob = await zip.generateAsync({ 
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        return blob;
    },

    getContentTypes: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
    <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
</Types>`;
    },

    getRels: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    },

    getDocumentRels: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
</Relationships>`;
    },

    getStyles: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
                <w:sz w:val="22"/>
                <w:szCs w:val="22"/>
                <w:lang w:val="es-ES"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
    <w:style w:type="paragraph" w:styleId="Normal" w:default="1">
        <w:name w:val="Normal"/>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="Heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:spacing w:before="240" w:after="120"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="32"/>
            <w:szCs w:val="32"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="PageBreak">
        <w:name w:val="Page Break"/>
        <w:basedOn w:val="Normal"/>
    </w:style>
</w:styles>`;
    },

    getSettings: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:zoom w:percent="100"/>
    <w:defaultTabStop w:val="720"/>
    <w:characterSpacingControl w:val="doNotCompress"/>
    <w:compat>
        <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
    </w:compat>
</w:settings>`;
    },

    getFontTable: () => {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:font w:name="Calibri">
        <w:panose1 w:val="020F0502020204030204"/>
        <w:charset w:val="00"/>
        <w:family w:val="swiss"/>
        <w:pitch w:val="variable"/>
    </w:font>
    <w:font w:name="Times New Roman">
        <w:panose1 w:val="02020603050405020304"/>
        <w:charset w:val="00"/>
        <w:family w:val="roman"/>
        <w:pitch w:val="variable"/>
    </w:font>
    <w:font w:name="Arial">
        <w:panose1 w:val="020B0604020202020204"/>
        <w:charset w:val="00"/>
        <w:family w:val="swiss"/>
        <w:pitch w:val="variable"/>
    </w:font>
</w:fonts>`;
    },

    getDocumentXml: (pagesText) => {
        let paragraphs = '';

        pagesText.forEach((page, pageIndex) => {
            // Add page header
            if (pageIndex > 0) {
                // Page break before new page (except first)
                paragraphs += `
            <w:p>
                <w:r>
                    <w:br w:type="page"/>
                </w:r>
            </w:p>`;
            }

            // Add page number indicator
            paragraphs += `
            <w:p>
                <w:pPr>
                    <w:pStyle w:val="Heading1"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:color w:val="666666"/>
                        <w:sz w:val="20"/>
                    </w:rPr>
                    <w:t>— Página ${page.pageNum} —</w:t>
                </w:r>
            </w:p>`;

            // Add each line as a paragraph
            page.lines.forEach(line => {
                const escapedLine = PdfToDocxModule.escapeXml(line);
                if (escapedLine.trim()) {
                    paragraphs += `
            <w:p>
                <w:r>
                    <w:t xml:space="preserve">${escapedLine}</w:t>
                </w:r>
            </w:p>`;
                }
            });
        });

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>${paragraphs}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
        </w:sectPr>
    </w:body>
</w:document>`;
    },

    escapeXml: (text) => {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    reset: () => {
        PdfToDocxModule.file = null;
        PdfToDocxModule.pdfDoc = null;
        PdfToDocxModule.totalPages = 0;
    }
};


