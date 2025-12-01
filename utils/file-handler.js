import { Logger } from './logger.js';

export const FileHandler = {
    /**
     * Reads a file as ArrayBuffer
     * @param {File} file 
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Reads a file as Data URL
     * @param {File} file 
     * @returns {Promise<string>}
     */
    readFileAsDataURL: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Validates if file is a PDF
     * @param {File} file 
     * @returns {boolean}
     */
    isPDF: (file) => {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    },

    /**
     * Formats bytes to human readable string
     * @param {number} bytes 
     * @returns {string}
     */
    formatSize: (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
