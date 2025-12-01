import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export const CreateModule = {
    files: [],
    options: {
        pageSize: 'a4', // a4, letter, auto
        orientation: 'p', // p (portrait), l (landscape)
        margin: 10, // mm
        fitToPage: true
    },

    init: () => {
        Logger.info('Create Module Initialized');
        CreateModule.files = [];
    },

    addFiles: (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        CreateModule.files = [...CreateModule.files, ...validFiles];
        return CreateModule.files;
    },

    removeFile: (index) => {
        CreateModule.files.splice(index, 1);
        return CreateModule.files;
    },

    moveFile: (fromIndex, toIndex) => {
        if (toIndex >= 0 && toIndex < CreateModule.files.length) {
            const file = CreateModule.files.splice(fromIndex, 1)[0];
            CreateModule.files.splice(toIndex, 0, file);
        }
        return CreateModule.files;
    },

    process: async (progressCallback) => {
        if (CreateModule.files.length === 0) {
            throw new Error('No hay imágenes seleccionadas.');
        }

        Logger.info('Starting Create PDF Process');
        const { jsPDF } = window.jspdf;

        // Initialize doc based on first image or defaults? 
        // Usually better to init per page or init default and add pages.
        // jsPDF default is A4 Portrait.
        const doc = new jsPDF({
            orientation: CreateModule.options.orientation,
            unit: 'mm',
            format: CreateModule.options.pageSize === 'auto' ? undefined : CreateModule.options.pageSize
        });

        // Remove default first page if we are going to add custom pages, 
        // but jsPDF starts with one page. We can edit it or delete it later.
        // Actually, we'll just use the first page for the first image.

        const totalFiles = CreateModule.files.length;

        for (let i = 0; i < totalFiles; i++) {
            const file = CreateModule.files[i];
            progressCallback((i / totalFiles) * 100, `Procesando imagen ${i + 1}/${totalFiles}...`);

            const imgData = await FileHandler.readFileAsDataURL(file);
            const imgProps = doc.getImageProperties(imgData);

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            let finalWidth = imgProps.width;
            let finalHeight = imgProps.height;

            // Convert pixels to mm (approx) if not fitting to page, but usually we want to fit or use native size
            // 1 px = 0.264583 mm
            const pxToMm = 0.264583;

            if (CreateModule.options.pageSize === 'auto') {
                // If auto, set page size to image size
                // We need to add a page with specific size, except for the first one if we want to resize it.
                // jsPDF is tricky with changing first page size dynamically after init.
                // Easier strategy: Init with A4, delete it, add new pages.
                if (i === 0) doc.deletePage(1);

                doc.addPage([imgProps.width * pxToMm, imgProps.height * pxToMm], imgProps.width > imgProps.height ? 'l' : 'p');
                doc.addImage(imgData, 'JPEG', 0, 0, imgProps.width * pxToMm, imgProps.height * pxToMm);
            } else {
                // Fit to page logic
                if (i > 0) doc.addPage();

                const margin = CreateModule.options.margin;
                const usableWidth = pageWidth - (margin * 2);
                const usableHeight = pageHeight - (margin * 2);

                if (CreateModule.options.fitToPage) {
                    const ratio = Math.min(usableWidth / imgProps.width * pxToMm, usableHeight / imgProps.height * pxToMm, 1); // Don't upscale if smaller? Maybe yes.
                    // Actually usually we want to fit into the box.

                    // Simple fit calculation
                    const imgRatio = imgProps.width / imgProps.height;
                    const pageRatio = usableWidth / usableHeight;

                    let w, h;
                    if (imgRatio > pageRatio) {
                        w = usableWidth;
                        h = usableWidth / imgRatio;
                    } else {
                        h = usableHeight;
                        w = usableHeight * imgRatio;
                    }

                    const x = (pageWidth - w) / 2;
                    const y = (pageHeight - h) / 2;

                    doc.addImage(imgData, 'JPEG', x, y, w, h);
                } else {
                    // Center without resizing (if possible) or just place at margin
                    doc.addImage(imgData, 'JPEG', margin, margin, imgProps.width * pxToMm, imgProps.height * pxToMm);
                }
            }
        }

        progressCallback(100, 'Finalizando PDF...');
        return doc.output('blob');
    }
};

// Add helper to FileHandler if missing
if (!FileHandler.readFileAsDataURL) {
    FileHandler.readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }
}
