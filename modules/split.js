import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const SplitModule = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
    options: {
        mode: 'ranges', // 'ranges', 'extract', 'every-n', 'single'
        ranges: '', // e.g., "1-3, 5, 7-10"
        extractPages: [], // [1, 3, 5]
        everyN: 2, // Split every N pages
    },

    init: () => {
        Logger.info('Split Module Initialized');
        SplitModule.file = null;
        SplitModule.pdfDoc = null;
        SplitModule.totalPages = 0;
    },

    setFile: async (file) => {
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }
        
        SplitModule.file = file;
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        const { PDFDocument } = window.PDFLib;
        SplitModule.pdfDoc = await PDFDocument.load(arrayBuffer);
        SplitModule.totalPages = SplitModule.pdfDoc.getPageCount();
        
        Logger.info(`PDF Loaded for Split. Pages: ${SplitModule.totalPages}`);
        
        return {
            name: file.name,
            pages: SplitModule.totalPages
        };
    },

    parseRanges: (rangeStr, maxPage) => {
        const pages = new Set();
        const parts = rangeStr.split(',').map(s => s.trim()).filter(s => s);
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
                        pages.add(i - 1); // Convert to 0-based index
                    }
                }
            } else {
                const num = parseInt(part);
                if (!isNaN(num) && num >= 1 && num <= maxPage) {
                    pages.add(num - 1); // Convert to 0-based index
                }
            }
        }
        
        return Array.from(pages).sort((a, b) => a - b);
    },

    process: async (progressCallback) => {
        if (!SplitModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        const { PDFDocument } = window.PDFLib;
        const mode = SplitModule.options.mode;
        const totalPages = SplitModule.totalPages;
        
        Logger.info('Starting Split Process', { mode, totalPages });

        let result;

        switch (mode) {
            case 'single':
                // Extract each page as a separate PDF
                result = await SplitModule.splitToSinglePages(progressCallback);
                break;
                
            case 'ranges':
                // Extract specific ranges
                result = await SplitModule.extractRanges(progressCallback);
                break;
                
            case 'extract':
                // Extract specific pages
                result = await SplitModule.extractPages(progressCallback);
                break;
                
            case 'every-n':
                // Split every N pages
                result = await SplitModule.splitEveryN(progressCallback);
                break;
                
            default:
                throw new Error('Modo de división no válido.');
        }

        return result;
    },

    splitToSinglePages: async (progressCallback) => {
        const { PDFDocument } = window.PDFLib;
        const zip = new JSZip();
        const folder = zip.folder("pages");
        
        for (let i = 0; i < SplitModule.totalPages; i++) {
            progressCallback((i / SplitModule.totalPages) * 100, `Extrayendo página ${i + 1}...`);
            
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(SplitModule.pdfDoc, [i]);
            newPdf.addPage(page);
            
            const pdfBytes = await newPdf.save();
            folder.file(`page_${i + 1}.pdf`, pdfBytes);
        }
        
        progressCallback(100, 'Generando archivo ZIP...');
        return await zip.generateAsync({ type: "blob" });
    },

    extractRanges: async (progressCallback) => {
        const { PDFDocument } = window.PDFLib;
        const pageIndices = SplitModule.parseRanges(SplitModule.options.ranges, SplitModule.totalPages);
        
        if (pageIndices.length === 0) {
            throw new Error('No se especificaron páginas válidas.');
        }
        
        progressCallback(20, 'Extrayendo páginas...');
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(SplitModule.pdfDoc, pageIndices);
        
        for (let i = 0; i < pages.length; i++) {
            progressCallback(20 + (i / pages.length) * 70, `Añadiendo página ${i + 1}...`);
            newPdf.addPage(pages[i]);
        }
        
        progressCallback(100, 'Finalizando PDF...');
        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    extractPages: async (progressCallback) => {
        const { PDFDocument } = window.PDFLib;
        const pageIndices = SplitModule.options.extractPages
            .map(p => p - 1)
            .filter(p => p >= 0 && p < SplitModule.totalPages);
        
        if (pageIndices.length === 0) {
            throw new Error('No se especificaron páginas válidas.');
        }
        
        progressCallback(20, 'Extrayendo páginas seleccionadas...');
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(SplitModule.pdfDoc, pageIndices);
        
        for (let i = 0; i < pages.length; i++) {
            progressCallback(20 + (i / pages.length) * 70, `Añadiendo página ${i + 1}...`);
            newPdf.addPage(pages[i]);
        }
        
        progressCallback(100, 'Finalizando PDF...');
        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    splitEveryN: async (progressCallback) => {
        const { PDFDocument } = window.PDFLib;
        const n = SplitModule.options.everyN;
        const zip = new JSZip();
        const folder = zip.folder("parts");
        
        const numParts = Math.ceil(SplitModule.totalPages / n);
        
        for (let part = 0; part < numParts; part++) {
            const startPage = part * n;
            const endPage = Math.min(startPage + n, SplitModule.totalPages);
            
            progressCallback((part / numParts) * 100, `Creando parte ${part + 1}...`);
            
            const newPdf = await PDFDocument.create();
            const pageIndices = [];
            for (let i = startPage; i < endPage; i++) {
                pageIndices.push(i);
            }
            
            const pages = await newPdf.copyPages(SplitModule.pdfDoc, pageIndices);
            pages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            folder.file(`part_${part + 1}.pdf`, pdfBytes);
        }
        
        progressCallback(100, 'Generando archivo ZIP...');
        return await zip.generateAsync({ type: "blob" });
    },

    reset: () => {
        SplitModule.file = null;
        SplitModule.pdfDoc = null;
        SplitModule.totalPages = 0;
        SplitModule.options.ranges = '';
        SplitModule.options.extractPages = [];
    }
};

