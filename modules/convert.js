import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const ConvertModule = {
    file: null,
    pdfDoc: null,
    options: {
        format: 'image/jpeg', // image/jpeg, image/png, etc.
        quality: 0.8,
        scale: 1.5, // Controls resolution (1.5 ~ 150DPI approx depending on base)
        pages: 'all' // 'all' or '1,3,5-7'
    },

    init: () => {
        Logger.info('Convert Module Initialized');
        ConvertModule.file = null;
        ConvertModule.pdfDoc = null;

        // Configure PDF.js worker
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
        }
    },

    setFile: async (file) => {
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }
        ConvertModule.file = file;
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        ConvertModule.pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        Logger.info(`PDF Loaded. Pages: ${ConvertModule.pdfDoc.numPages}`);
        return {
            name: file.name,
            pages: ConvertModule.pdfDoc.numPages
        };
    },

    process: async (progressCallback) => {
        if (!ConvertModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        const totalPages = ConvertModule.pdfDoc.numPages;
        const zip = new JSZip();
        const folder = zip.folder("images");
        const images = [];

        Logger.info('Starting Conversion Process', ConvertModule.options);

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            progressCallback((pageNum / totalPages) * 100, `Procesando página ${pageNum}/${totalPages}...`);

            const page = await ConvertModule.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: ConvertModule.options.scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, ConvertModule.options.format, ConvertModule.options.quality);
            });

            const ext = ConvertModule.options.format.split('/')[1] === 'jpeg' ? 'jpg' : ConvertModule.options.format.split('/')[1];
            const fileName = `page_${pageNum}.${ext}`;

            if (totalPages === 1) {
                // If single page, return the blob directly later (or handle differently)
                // But for consistency, we might just zip it or return single blob.
                // Let's store in array to decide later.
                images.push({ blob, fileName });
            } else {
                folder.file(fileName, blob);
            }
        }

        progressCallback(100, 'Generando archivo final...');

        if (images.length === 1) {
            return images[0].blob;
        } else {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            return zipBlob;
        }
    }
};
