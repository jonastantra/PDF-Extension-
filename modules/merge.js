import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const MergeModule = {
    files: [],

    init: () => {
        Logger.info('Merge Module Initialized');
        MergeModule.files = [];
    },

    addFiles: (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => FileHandler.isPDF(f));
        MergeModule.files = [...MergeModule.files, ...validFiles];
        Logger.info(`Added ${validFiles.length} files. Total: ${MergeModule.files.length}`);
        return MergeModule.files;
    },

    removeFile: (index) => {
        MergeModule.files.splice(index, 1);
        return MergeModule.files;
    },

    process: async (progressCallback) => {
        if (MergeModule.files.length < 2) {
            throw new Error('Se necesitan al menos 2 archivos PDF para unir.');
        }

        try {
            Logger.info('Starting Merge Process');
            const { PDFDocument } = window.PDFLib;
            const mergedPdf = await PDFDocument.create();

            const totalFiles = MergeModule.files.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = MergeModule.files[i];
                progressCallback((i / totalFiles) * 100, `Procesando ${file.name}...`);

                const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            progressCallback(100, 'Finalizando PDF...');
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            Logger.info('Merge Complete');
            return blob;

        } catch (error) {
            Logger.error('Merge Failed', error);
            throw error;
        }
    }
};
