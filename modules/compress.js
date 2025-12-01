import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const CompressModule = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
    originalSize: 0,
    options: {
        quality: 'medium', // 'low', 'medium', 'high'
        imageQuality: 0.7, // 0.1 to 1.0
        removeMetadata: true
    },

    qualitySettings: {
        low: { imageQuality: 0.4, scale: 0.5 },
        medium: { imageQuality: 0.7, scale: 0.75 },
        high: { imageQuality: 0.85, scale: 0.9 }
    },

    init: () => {
        Logger.info('Compress Module Initialized');
        CompressModule.file = null;
        CompressModule.pdfDoc = null;
        CompressModule.totalPages = 0;
        CompressModule.originalSize = 0;
    },

    setFile: async (file) => {
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }
        
        CompressModule.file = file;
        CompressModule.originalSize = file.size;
        
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        const { PDFDocument } = window.PDFLib;
        CompressModule.pdfDoc = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true
        });
        CompressModule.totalPages = CompressModule.pdfDoc.getPageCount();
        
        Logger.info(`PDF Loaded for Compress. Pages: ${CompressModule.totalPages}, Size: ${FileHandler.formatSize(file.size)}`);
        
        return {
            name: file.name,
            pages: CompressModule.totalPages,
            size: file.size,
            formattedSize: FileHandler.formatSize(file.size)
        };
    },

    process: async (progressCallback) => {
        if (!CompressModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        Logger.info('Starting Compress Process', CompressModule.options);
        
        progressCallback(10, 'Analizando PDF...');

        // Get quality settings
        const settings = CompressModule.qualitySettings[CompressModule.options.quality];
        
        // Process images in the PDF
        progressCallback(20, 'Procesando imágenes...');
        await CompressModule.compressImages(progressCallback, settings);

        // Remove metadata if option is enabled
        if (CompressModule.options.removeMetadata) {
            progressCallback(80, 'Limpiando metadatos...');
            CompressModule.pdfDoc.setTitle('');
            CompressModule.pdfDoc.setAuthor('');
            CompressModule.pdfDoc.setSubject('');
            CompressModule.pdfDoc.setKeywords([]);
            CompressModule.pdfDoc.setProducer('');
            CompressModule.pdfDoc.setCreator('');
        }

        progressCallback(90, 'Guardando PDF comprimido...');
        
        // Save with compression options
        const pdfBytes = await CompressModule.pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false
        });
        
        const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const savings = CompressModule.originalSize - compressedBlob.size;
        const percentage = ((savings / CompressModule.originalSize) * 100).toFixed(1);
        
        Logger.info(`Compression Complete. Original: ${FileHandler.formatSize(CompressModule.originalSize)}, Compressed: ${FileHandler.formatSize(compressedBlob.size)}, Saved: ${percentage}%`);
        
        progressCallback(100, `¡Comprimido! Ahorro: ${percentage}%`);
        
        return {
            blob: compressedBlob,
            originalSize: CompressModule.originalSize,
            compressedSize: compressedBlob.size,
            savings: savings,
            percentage: percentage
        };
    },

    compressImages: async (progressCallback, settings) => {
        // PDF-lib doesn't provide direct image manipulation,
        // but we can re-render pages at lower quality using canvas
        // For now, we rely on PDF-lib's built-in optimization
        
        // In a full implementation, you would:
        // 1. Extract all images from the PDF
        // 2. Compress them using canvas
        // 3. Replace them in the PDF
        
        // This is a simplified version that uses PDF-lib's save optimization
        Logger.info('Image compression (simplified mode)');
        
        // The actual compression happens in the save() method with useObjectStreams
        // For more advanced compression, you'd need to iterate through page resources
        
        return true;
    },

    getCompressionStats: () => {
        return {
            originalSize: CompressModule.originalSize,
            formattedOriginalSize: FileHandler.formatSize(CompressModule.originalSize)
        };
    },

    reset: () => {
        CompressModule.file = null;
        CompressModule.pdfDoc = null;
        CompressModule.totalPages = 0;
        CompressModule.originalSize = 0;
    }
};


