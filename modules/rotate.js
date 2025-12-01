import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const RotateModule = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
    options: {
        mode: 'all', // 'all' or 'selected'
        angle: 90, // 90, 180, 270 (clockwise)
        selectedPages: [] // [1, 3, 5] for selected mode
    },

    init: () => {
        Logger.info('Rotate Module Initialized');
        RotateModule.file = null;
        RotateModule.pdfDoc = null;
        RotateModule.totalPages = 0;
    },

    setFile: async (file) => {
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }
        
        RotateModule.file = file;
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        const { PDFDocument } = window.PDFLib;
        RotateModule.pdfDoc = await PDFDocument.load(arrayBuffer);
        RotateModule.totalPages = RotateModule.pdfDoc.getPageCount();
        
        Logger.info(`PDF Loaded for Rotate. Pages: ${RotateModule.totalPages}`);
        
        return {
            name: file.name,
            pages: RotateModule.totalPages
        };
    },

    process: async (progressCallback) => {
        if (!RotateModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        const { PDFDocument, degrees } = window.PDFLib;
        const pages = RotateModule.pdfDoc.getPages();
        const totalPages = pages.length;
        
        Logger.info('Starting Rotate Process', RotateModule.options);

        progressCallback(10, 'Rotando páginas...');

        for (let i = 0; i < totalPages; i++) {
            const shouldRotate = RotateModule.options.mode === 'all' || 
                RotateModule.options.selectedPages.includes(i + 1);
            
            if (shouldRotate) {
                progressCallback((i / totalPages) * 80 + 10, `Rotando página ${i + 1}...`);
                
                const page = pages[i];
                const currentRotation = page.getRotation().angle;
                const newRotation = (currentRotation + RotateModule.options.angle) % 360;
                page.setRotation(degrees(newRotation));
            }
        }
        
        progressCallback(95, 'Guardando PDF...');
        const pdfBytes = await RotateModule.pdfDoc.save();
        
        progressCallback(100, '¡Rotación completada!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    reset: () => {
        RotateModule.file = null;
        RotateModule.pdfDoc = null;
        RotateModule.totalPages = 0;
        RotateModule.options.selectedPages = [];
    }
};

