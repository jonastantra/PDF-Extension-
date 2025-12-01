import { Logger } from '../utils/logger.js';

export const WebpageModule = {
    options: {
        format: 'a4', // a4, letter, legal
        orientation: 'portrait', // portrait, landscape
        layout: 'paged', // paged (with page breaks), single (one long page)
        scale: 1.0,
        margins: true,
        background: true
    },

    pageInfo: null,

    init: () => {
        Logger.info('Webpage Module Initialized');
        WebpageModule.pageInfo = null;
    },

    // Get current tab information
    getCurrentTab: async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No se pudo obtener la pestaña activa.');
            }

            // Check if it's a restricted page
            if (tab.url.startsWith('chrome://') || 
                tab.url.startsWith('chrome-extension://') ||
                tab.url.startsWith('about:') ||
                tab.url.startsWith('edge://') ||
                tab.url.startsWith('brave://') ||
                tab.url.startsWith('vivaldi://')) {
                
                const error = new Error('RESTRICTED_PAGE');
                error.isRestricted = true;
                error.pageType = 'sistema';
                throw error;
            }

            // Check for new tab page
            if (tab.url === 'chrome://newtab/' || tab.url === '' || !tab.url) {
                const error = new Error('RESTRICTED_PAGE');
                error.isRestricted = true;
                error.pageType = 'nueva pestaña';
                throw error;
            }

            WebpageModule.pageInfo = {
                id: tab.id,
                url: tab.url,
                title: tab.title || 'Página Web'
            };

            Logger.info('Tab info obtained', WebpageModule.pageInfo);
            return WebpageModule.pageInfo;
        } catch (error) {
            if (!error.isRestricted) {
                Logger.error('Error getting tab info', error);
            }
            throw error;
        }
    },

    // Capture visible area as image
    captureVisibleTab: async () => {
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
                format: 'png',
                quality: 100
            });
            return dataUrl;
        } catch (error) {
            Logger.error('Error capturing tab', error);
            throw new Error('No se pudo capturar la página. Asegúrate de que la página esté cargada completamente.');
        }
    },

    // Process webpage to PDF
    process: async (progressCallback) => {
        if (!WebpageModule.pageInfo) {
            throw new Error('No hay información de la página.');
        }

        try {
            Logger.info('Starting Webpage to PDF Process', WebpageModule.options);

            progressCallback(10, 'Capturando página...');

            // Capture the visible tab
            const screenshot = await WebpageModule.captureVisibleTab();

            progressCallback(40, 'Generando PDF...');

            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            
            // Page dimensions based on format
            const formats = {
                'a4': [210, 297],
                'letter': [216, 279],
                'legal': [216, 356]
            };

            const [pageWidth, pageHeight] = formats[WebpageModule.options.format] || formats.a4;
            const orientation = WebpageModule.options.orientation === 'landscape' ? 'l' : 'p';

            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: WebpageModule.options.format
            });

            // Get actual page dimensions
            const pdfWidth = orientation === 'l' ? pageHeight : pageWidth;
            const pdfHeight = orientation === 'l' ? pageWidth : pageHeight;

            progressCallback(60, 'Añadiendo imagen al PDF...');

            // Load image to get dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = screenshot;
            });

            const imgWidth = img.width;
            const imgHeight = img.height;

            // Calculate scaling to fit the page
            const margin = WebpageModule.options.margins ? 10 : 0;
            const availableWidth = pdfWidth - (margin * 2);
            const availableHeight = pdfHeight - (margin * 2);

            let finalWidth, finalHeight, x, y;

            if (WebpageModule.options.layout === 'single') {
                // Single page: scale width to fit, height auto
                finalWidth = availableWidth;
                finalHeight = (imgHeight / imgWidth) * finalWidth;

                // If the content is taller than the page, we need multiple pages
                if (finalHeight > availableHeight) {
                    const numPages = Math.ceil(finalHeight / availableHeight);
                    const scaledImgHeight = availableHeight;
                    const scaledImgWidth = (imgWidth / imgHeight) * scaledImgHeight * numPages;

                    // For single page mode, just fit it
                    finalWidth = availableWidth;
                    finalHeight = (imgHeight / imgWidth) * finalWidth;
                }

                x = margin;
                y = margin;

                doc.addImage(screenshot, 'PNG', x, y, finalWidth, finalHeight);
            } else {
                // Paged mode: split into multiple pages if needed
                finalWidth = availableWidth;
                finalHeight = (imgHeight / imgWidth) * finalWidth;

                if (finalHeight <= availableHeight) {
                    // Fits on one page
                    x = margin;
                    y = margin;
                    doc.addImage(screenshot, 'PNG', x, y, finalWidth, finalHeight);
                } else {
                    // Need to split across pages
                    const pageContentHeight = availableHeight;
                    const sourcePageHeight = (pageContentHeight / finalHeight) * imgHeight;
                    const numPages = Math.ceil(imgHeight / sourcePageHeight);

                    for (let i = 0; i < numPages; i++) {
                        if (i > 0) doc.addPage();

                        progressCallback(60 + (i / numPages) * 30, `Procesando página ${i + 1}/${numPages}...`);

                        // Calculate the portion of the image for this page
                        const sourceY = i * sourcePageHeight;
                        const sourceH = Math.min(sourcePageHeight, imgHeight - sourceY);
                        const destH = (sourceH / imgHeight) * finalHeight;

                        // Create a canvas to crop the image
                        const canvas = document.createElement('canvas');
                        canvas.width = imgWidth;
                        canvas.height = sourceH;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, sourceY, imgWidth, sourceH, 0, 0, imgWidth, sourceH);

                        const croppedDataUrl = canvas.toDataURL('image/png');
                        doc.addImage(croppedDataUrl, 'PNG', margin, margin, finalWidth, destH);
                    }
                }
            }

            progressCallback(95, 'Finalizando PDF...');

            // Generate filename from page title
            const safeTitle = WebpageModule.pageInfo.title
                .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
                .trim()
                .substring(0, 50) || 'webpage';

            const blob = doc.output('blob');
            
            progressCallback(100, '¡PDF creado!');

            return {
                blob: blob,
                filename: `${safeTitle}_${Date.now()}.pdf`
            };

        } catch (error) {
            Logger.error('Webpage to PDF failed', error);
            throw error;
        }
    },

    // Alternative method: Use Chrome's print dialog
    printPage: async () => {
        if (!WebpageModule.pageInfo) {
            throw new Error('No hay información de la página.');
        }

        try {
            // Inject a script that triggers the print dialog
            await chrome.scripting.executeScript({
                target: { tabId: WebpageModule.pageInfo.id },
                func: () => {
                    window.print();
                }
            });

            return true;
        } catch (error) {
            Logger.error('Print failed', error);
            throw new Error('No se pudo abrir el diálogo de impresión.');
        }
    },

    // Capture full page (scrolling capture)
    captureFullPage: async (progressCallback) => {
        if (!WebpageModule.pageInfo) {
            throw new Error('No hay información de la página.');
        }

        try {
            progressCallback(10, 'Preparando captura completa...');

            // Get page dimensions by injecting script
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: WebpageModule.pageInfo.id },
                func: () => {
                    return {
                        scrollHeight: document.documentElement.scrollHeight,
                        scrollWidth: document.documentElement.scrollWidth,
                        viewportHeight: window.innerHeight,
                        viewportWidth: window.innerWidth,
                        currentScroll: window.scrollY
                    };
                }
            });

            const pageData = result.result;
            const { scrollHeight, viewportHeight, currentScroll } = pageData;
            const numCaptures = Math.ceil(scrollHeight / viewportHeight);
            const captures = [];

            progressCallback(20, `Capturando ${numCaptures} secciones...`);

            // Scroll and capture each section
            for (let i = 0; i < numCaptures; i++) {
                const scrollTo = i * viewportHeight;

                // Scroll to position
                await chrome.scripting.executeScript({
                    target: { tabId: WebpageModule.pageInfo.id },
                    func: (y) => window.scrollTo(0, y),
                    args: [scrollTo]
                });

                // Wait for scroll and rendering
                await new Promise(resolve => setTimeout(resolve, 300));

                // Capture
                const screenshot = await WebpageModule.captureVisibleTab();
                captures.push({
                    dataUrl: screenshot,
                    y: scrollTo
                });

                progressCallback(20 + (i / numCaptures) * 50, `Capturado ${i + 1}/${numCaptures}`);
            }

            // Restore original scroll position
            await chrome.scripting.executeScript({
                target: { tabId: WebpageModule.pageInfo.id },
                func: (y) => window.scrollTo(0, y),
                args: [currentScroll]
            });

            progressCallback(75, 'Generando PDF...');

            // Create PDF from captures
            const { jsPDF } = window.jspdf;
            const orientation = WebpageModule.options.orientation === 'landscape' ? 'l' : 'p';
            
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: WebpageModule.options.format
            });

            const formats = {
                'a4': [210, 297],
                'letter': [216, 279],
                'legal': [216, 356]
            };
            const [pageWidth, pageHeight] = formats[WebpageModule.options.format] || formats.a4;
            const pdfWidth = orientation === 'l' ? pageHeight : pageWidth;
            const pdfHeight = orientation === 'l' ? pageWidth : pageHeight;
            const margin = WebpageModule.options.margins ? 10 : 0;

            for (let i = 0; i < captures.length; i++) {
                if (i > 0) doc.addPage();
                
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = captures[i].dataUrl;
                });

                const imgRatio = img.width / img.height;
                const availableWidth = pdfWidth - (margin * 2);
                const availableHeight = pdfHeight - (margin * 2);

                let finalWidth = availableWidth;
                let finalHeight = finalWidth / imgRatio;

                if (finalHeight > availableHeight) {
                    finalHeight = availableHeight;
                    finalWidth = finalHeight * imgRatio;
                }

                const x = margin + (availableWidth - finalWidth) / 2;
                const y = margin;

                doc.addImage(captures[i].dataUrl, 'PNG', x, y, finalWidth, finalHeight);
                
                progressCallback(75 + (i / captures.length) * 20, `Añadiendo página ${i + 1}...`);
            }

            progressCallback(98, 'Finalizando...');

            const safeTitle = WebpageModule.pageInfo.title
                .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
                .trim()
                .substring(0, 50) || 'webpage';

            const blob = doc.output('blob');
            
            progressCallback(100, '¡PDF creado!');

            return {
                blob: blob,
                filename: `${safeTitle}_${Date.now()}.pdf`
            };

        } catch (error) {
            Logger.error('Full page capture failed', error);
            throw error;
        }
    },

    reset: () => {
        WebpageModule.pageInfo = null;
    }
};

