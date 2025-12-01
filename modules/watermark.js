import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const WatermarkModule = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
    options: {
        type: 'text', // 'text' or 'image'
        text: 'CONFIDENCIAL',
        fontSize: 48,
        color: { r: 0.5, g: 0.5, b: 0.5 }, // Gray
        opacity: 0.3,
        rotation: -45, // Diagonal
        position: 'center', // 'center', 'top', 'bottom'
        imageFile: null,
        imageScale: 0.3
    },

    init: () => {
        Logger.info('Watermark Module Initialized');
        WatermarkModule.file = null;
        WatermarkModule.pdfDoc = null;
        WatermarkModule.totalPages = 0;
    },

    setFile: async (file) => {
        if (!FileHandler.isPDF(file)) {
            throw new Error('El archivo no es un PDF válido.');
        }
        
        WatermarkModule.file = file;
        const arrayBuffer = await FileHandler.readFileAsArrayBuffer(file);
        const { PDFDocument } = window.PDFLib;
        WatermarkModule.pdfDoc = await PDFDocument.load(arrayBuffer);
        WatermarkModule.totalPages = WatermarkModule.pdfDoc.getPageCount();
        
        Logger.info(`PDF Loaded for Watermark. Pages: ${WatermarkModule.totalPages}`);
        
        return {
            name: file.name,
            pages: WatermarkModule.totalPages
        };
    },

    process: async (progressCallback) => {
        if (!WatermarkModule.pdfDoc) {
            throw new Error('No hay PDF cargado.');
        }

        const { rgb, degrees, StandardFonts } = window.PDFLib;
        const pages = WatermarkModule.pdfDoc.getPages();
        const totalPages = pages.length;
        
        Logger.info('Starting Watermark Process', WatermarkModule.options);

        // Embed font for text watermark
        const font = await WatermarkModule.pdfDoc.embedFont(StandardFonts.Helvetica);

        progressCallback(10, 'Aplicando marca de agua...');

        for (let i = 0; i < totalPages; i++) {
            progressCallback((i / totalPages) * 80 + 10, `Procesando página ${i + 1}...`);
            
            const page = pages[i];
            const { width, height } = page.getSize();

            if (WatermarkModule.options.type === 'text') {
                await WatermarkModule.addTextWatermark(page, font, width, height);
            } else if (WatermarkModule.options.type === 'image' && WatermarkModule.options.imageFile) {
                await WatermarkModule.addImageWatermark(page, width, height);
            }
        }
        
        progressCallback(95, 'Guardando PDF...');
        const pdfBytes = await WatermarkModule.pdfDoc.save();
        
        progressCallback(100, '¡Marca de agua aplicada!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    addTextWatermark: async (page, font, pageWidth, pageHeight) => {
        const { rgb, degrees } = window.PDFLib;
        const text = WatermarkModule.options.text;
        const fontSize = WatermarkModule.options.fontSize;
        const color = WatermarkModule.options.color;
        const opacity = WatermarkModule.options.opacity;
        const rotation = WatermarkModule.options.rotation;

        // Calculate text dimensions
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        // Calculate center position
        let x, y;
        
        switch (WatermarkModule.options.position) {
            case 'top':
                x = (pageWidth - textWidth) / 2;
                y = pageHeight - 100;
                break;
            case 'bottom':
                x = (pageWidth - textWidth) / 2;
                y = 50;
                break;
            case 'center':
            default:
                x = pageWidth / 2;
                y = pageHeight / 2;
                break;
        }

        page.drawText(text, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(color.r, color.g, color.b),
            opacity: opacity,
            rotate: degrees(rotation),
        });
    },

    addImageWatermark: async (page, pageWidth, pageHeight) => {
        const imageFile = WatermarkModule.options.imageFile;
        if (!imageFile) return;

        const imageBytes = await FileHandler.readFileAsArrayBuffer(imageFile);
        let image;

        // Detect image type and embed
        if (imageFile.type === 'image/png') {
            image = await WatermarkModule.pdfDoc.embedPng(imageBytes);
        } else {
            image = await WatermarkModule.pdfDoc.embedJpg(imageBytes);
        }

        const scale = WatermarkModule.options.imageScale;
        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;

        // Center the image
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        page.drawImage(image, {
            x: x,
            y: y,
            width: imgWidth,
            height: imgHeight,
            opacity: WatermarkModule.options.opacity
        });
    },

    setImageFile: async (file) => {
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo no es una imagen válida.');
        }
        WatermarkModule.options.imageFile = file;
        WatermarkModule.options.type = 'image';
        return file.name;
    },

    reset: () => {
        WatermarkModule.file = null;
        WatermarkModule.pdfDoc = null;
        WatermarkModule.totalPages = 0;
        WatermarkModule.options.text = 'CONFIDENCIAL';
        WatermarkModule.options.imageFile = null;
        WatermarkModule.options.type = 'text';
    }
};


