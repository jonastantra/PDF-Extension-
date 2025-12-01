import { MergeModule } from '../modules/merge.js';
import { ConvertModule } from '../modules/convert.js';
import { CreateModule } from '../modules/create.js';
import { SplitModule } from '../modules/split.js';
import { RotateModule } from '../modules/rotate.js';
import { WatermarkModule } from '../modules/watermark.js';
import { CompressModule } from '../modules/compress.js';
import { WebpageModule } from '../modules/webpage.js';
import { PdfToDocxModule } from '../modules/pdf-to-docx.js';
import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

// i18n helper function - acceso global al módulo de traducciones
const t = (key, substitutions = []) => {
    if (window.I18nModule && window.I18nModule.t) {
        return window.I18nModule.t(key, substitutions);
    }
    // Fallback: usar la API de Chrome directamente
    try {
        const msg = chrome.i18n.getMessage(key, substitutions);
        return msg || key;
    } catch (e) {
        return key;
    }
};

// State
let currentTab = 'convert'; // convert, edit, tools
let currentTool = null; // specific tool id (e.g., 'pdf-to-jpg')
let isProcessing = false;
let settingsOpen = false;

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const viewSections = document.querySelectorAll('.view-section');
const toolSections = document.querySelectorAll('.tool-section');
const toolCards = document.querySelectorAll('.tool-card');
const backBtns = document.querySelectorAll('.back-btn');

const actionBtn = document.getElementById('action-btn');
const statusMsg = document.getElementById('status-msg');
const progressBar = document.getElementById('global-progress-bar');
const progressContainer = document.getElementById('global-progress-container');

// Merge Specific Elements
const mergeDropZone = document.getElementById('merge-drop-zone');
const mergeFileInput = document.getElementById('merge-file-input');
const mergeFileList = document.getElementById('merge-file-list');

// Convert Specific Elements
const convertDropZone = document.getElementById('convert-drop-zone');
const convertFileInput = document.getElementById('convert-file-input');
const convertFileInfo = document.getElementById('convert-file-info');
const convertOptions = document.getElementById('convert-options');
const convertFormat = document.getElementById('convert-format');
const convertQuality = document.getElementById('convert-quality');

// Create Specific Elements
const createDropZone = document.getElementById('create-drop-zone');
const createFileInput = document.getElementById('create-file-input');
const createFileList = document.getElementById('create-file-list');
const createOptions = document.getElementById('create-options');
const createSize = document.getElementById('create-size');
const createOrientation = document.getElementById('create-orientation');
const createFit = document.getElementById('create-fit');

// Split Specific Elements
const splitDropZone = document.getElementById('split-drop-zone');
const splitFileInput = document.getElementById('split-file-input');

// Rotate Specific Elements
const rotateDropZone = document.getElementById('rotate-drop-zone');
const rotateFileInput = document.getElementById('rotate-file-input');
const rotateFileInfo = document.getElementById('rotate-file-info');
const rotateOptions = document.getElementById('rotate-options');

// Watermark Specific Elements
const watermarkDropZone = document.getElementById('watermark-drop-zone');
const watermarkFileInput = document.getElementById('watermark-file-input');
const watermarkFileInfo = document.getElementById('watermark-file-info');
const watermarkOptions = document.getElementById('watermark-options');

// Compress Specific Elements
const compressDropZone = document.getElementById('compress-drop-zone');
const compressFileInput = document.getElementById('compress-file-input');
const compressFileInfo = document.getElementById('compress-file-info');
const compressOptions = document.getElementById('compress-options');

// Webpage Specific Elements
const webpageInfo = document.getElementById('webpage-info');
const webpageOptions = document.getElementById('webpage-options');
const webpageActions = document.getElementById('webpage-actions');

// PDF to DOCX Specific Elements
const docxDropZone = document.getElementById('docx-drop-zone');
const docxFileInput = document.getElementById('docx-file-input');
const docxFileInfo = document.getElementById('docx-file-info');
const docxFeatures = document.getElementById('docx-features');

// Initialize
async function init() {
    // Initialize i18n first
    await initializeI18n();
    
    setupNavigation();
    setupToolCards();
    setupBackButtons();
    setupSettingsPanel();

    // Setup specific tools
    setupMergeTool();
    setupConvertTool();
    setupCreateTool();
    setupSplitTool();
    setupRotateTool();
    setupWatermarkTool();
    setupCompressTool();
    setupWebpageTool();
    setupDocxTool();

    setupActionBtn();
    Logger.info('Sidebar Initialized with All Tools and i18n');
}

// Initialize i18n module
async function initializeI18n() {
    try {
        if (window.I18nModule) {
            await window.I18nModule.init();
            
            // Create language selector in settings
            const container = document.getElementById('language-selector-container');
            if (container) {
                window.I18nModule.createLanguageSelector('language-selector-container');
            }
            
            // Listen for language changes
            window.addEventListener('languageChanged', (e) => {
                Logger.info(`Language changed to: ${e.detail.language}`);
                // Re-translate dynamic content if needed
                updateDynamicTranslations();
            });
            
            Logger.info('i18n initialized successfully');
        }
    } catch (e) {
        Logger.error('Error initializing i18n:', e);
    }
}

// Setup settings panel
function setupSettingsPanel() {
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', () => {
            openSettingsPanel();
        });
    }
    
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            closeSettingsPanel();
        });
    }
}

function openSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    settingsOpen = true;
    
    // Hide all views
    viewSections.forEach(s => s.classList.remove('active'));
    toolSections.forEach(s => s.classList.remove('active'));
    
    // Show settings
    settingsPanel.style.display = 'block';
    settingsPanel.classList.add('active');
    
    // Deselect nav tabs
    navTabs.forEach(t => t.classList.remove('active'));
}

function closeSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    settingsOpen = false;
    
    // Hide settings
    settingsPanel.style.display = 'none';
    settingsPanel.classList.remove('active');
    
    // Restore previous tab
    switchTab(currentTab);
}

// Update dynamic translations (for content generated by JS)
function updateDynamicTranslations() {
    // Update action button text based on current state
    updateActionBtnState();
    
    // Clear any status messages
    updateStatus('');
}

// Navigation Logic
function setupNavigation() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    currentTab = tabId;
    currentTool = null;

    navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));

    viewSections.forEach(s => s.classList.remove('active'));
    toolSections.forEach(s => s.classList.remove('active'));

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.add('active');

    // Reset action button when switching tabs
        updateActionBtnState();
}

function setupToolCards() {
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.dataset.tool;
            openTool(toolId);
        });
    });

    const toolListItems = document.querySelectorAll('.tool-list-item');
    toolListItems.forEach(item => {
        item.addEventListener('click', () => {
            const toolId = item.dataset.tool;
            openTool(toolId);
        });
    });

}

function openTool(toolId) {
    currentTool = toolId;

    viewSections.forEach(s => s.classList.remove('active'));

    let sectionId = '';

    if (toolId === 'pdf-to-docx') {
        sectionId = 'tool-pdf-to-docx';
    } else if (toolId.startsWith('pdf-to-')) {
        sectionId = 'tool-convert';
        configureConvertTool(toolId);
    } else if (toolId.endsWith('-to-pdf')) {
        sectionId = 'tool-create';
        configureCreateTool(toolId);
    } else if (toolId === 'split') {
        sectionId = 'tool-split';
    } else if (toolId === 'rotate') {
        sectionId = 'tool-rotate';
    } else if (toolId === 'watermark') {
        sectionId = 'tool-watermark';
    } else if (toolId === 'compress') {
        sectionId = 'tool-compress';
    } else if (toolId === 'webpage') {
        sectionId = 'tool-webpage';
        loadWebpageInfo();
    } else if (toolId === 'merge') {
        sectionId = 'tool-merge';
    } else {
        sectionId = `tool-${toolId}`;
    }

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    updateActionBtnState();
}

function setupBackButtons() {
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(currentTab);
        });
    });
}

// Configuration helpers for generic tools
function configureConvertTool(toolId) {
    const format = toolId.replace('pdf-to-', '');
    const title = document.getElementById('convert-tool-title');
    title.textContent = `PDF a ${format.toUpperCase()}`;

    const formatSelect = document.getElementById('convert-format');
    if (formatSelect) {
        const mimeMap = {
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp'
        };
        formatSelect.value = mimeMap[format] || 'image/jpeg';
    }
}

function configureCreateTool(toolId) {
    const format = toolId.replace('-to-pdf', '');
    const title = document.getElementById('create-tool-title');
    title.textContent = `${format.toUpperCase()} a PDF`;
}

// ==================== MERGE TOOL ====================
function setupMergeTool() {
    const mergeSelectBtn = document.getElementById('merge-select-btn');

    setupDropZone(mergeDropZone, mergeFileInput, handleMergeFiles);

    if (mergeSelectBtn) {
        mergeSelectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mergeFileInput.click();
        });
    }

    mergeFileInput.addEventListener('change', (e) => handleMergeFiles(e.target.files));
}

function handleMergeFiles(files) {
    MergeModule.addFiles(files);
    renderMergeFileList();
    updateActionBtnState();
}

function renderMergeFileList() {
    mergeFileList.innerHTML = '';
    MergeModule.files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="file-info">
                <span class="file-name" title="${file.name}">${file.name}</span>
                <span class="file-size">${FileHandler.formatSize(file.size)}</span>
            </div>
            <button class="remove-btn" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            MergeModule.removeFile(index);
            renderMergeFileList();
            updateActionBtnState();
        });

        mergeFileList.appendChild(item);
    });
}

// ==================== CONVERT TOOL ====================
function setupConvertTool() {
    setupDropZone(convertDropZone, convertFileInput, (files) => handleConvertFile(files[0]));

    convertFileInput.addEventListener('change', (e) => handleConvertFile(e.target.files[0]));

    convertFormat.addEventListener('change', (e) => ConvertModule.options.format = e.target.value);
    convertQuality.addEventListener('change', (e) => ConvertModule.options.scale = parseFloat(e.target.value));
}

async function handleConvertFile(file) {
    if (!file) return;
    try {
        const info = await ConvertModule.setFile(file);
        renderConvertFileInfo(info);
        updateActionBtnState();
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

function renderConvertFileInfo(info) {
    convertDropZone.style.display = 'none';
    convertFileInfo.style.display = 'flex';
    convertOptions.style.display = 'block';

    convertFileInfo.innerHTML = `
        <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        </div>
      <div class="file-info">
        <span class="file-name" title="${info.name}">${info.name}</span>
        <span class="file-size">${t('pages_count', [info.pages])}</span>
      </div>
        <button class="remove-btn" id="remove-convert-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.getElementById('remove-convert-file').addEventListener('click', () => {
        ConvertModule.file = null;
        ConvertModule.pdfDoc = null;
        resetConvertUI();
        updateActionBtnState();
    });
}

function resetConvertUI() {
    convertDropZone.style.display = 'block';
    convertFileInfo.style.display = 'none';
    convertOptions.style.display = 'none';
    convertFileInput.value = '';
}

// ==================== CREATE TOOL ====================
function setupCreateTool() {
    setupDropZone(createDropZone, createFileInput, handleCreateFiles);

    createFileInput.addEventListener('change', (e) => handleCreateFiles(e.target.files));

    createSize.addEventListener('change', (e) => CreateModule.options.pageSize = e.target.value);
    createOrientation.addEventListener('change', (e) => CreateModule.options.orientation = e.target.value);
    createFit.addEventListener('change', (e) => CreateModule.options.fitToPage = e.target.value === 'true');
}

function handleCreateFiles(files) {
    CreateModule.addFiles(files);
    renderCreateFileList();
    updateActionBtnState();
    if (CreateModule.files.length > 0) {
        createOptions.style.display = 'block';
    }
}

function renderCreateFileList() {
    createFileList.innerHTML = '';
    CreateModule.files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
      <div class="file-info">
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">${FileHandler.formatSize(file.size)}</span>
      </div>
            <button class="remove-btn" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
    `;

        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            CreateModule.removeFile(index);
            renderCreateFileList();
            updateActionBtnState();
            if (CreateModule.files.length === 0) {
                createOptions.style.display = 'none';
            }
        });

        createFileList.appendChild(item);
    });
}

// ==================== SPLIT TOOL ====================
function setupSplitTool() {
    if (!splitDropZone || !splitFileInput) return;

    setupDropZone(splitDropZone, splitFileInput, (files) => handleSplitFile(files[0]));

    splitFileInput.addEventListener('change', (e) => handleSplitFile(e.target.files[0]));

    // Setup split mode tabs
    const modeTabs = document.querySelectorAll('#tool-split .mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            SplitModule.options.mode = tab.dataset.mode;
            updateSplitOptions();
        });
    });
}

async function handleSplitFile(file) {
    if (!file) return;
    try {
        const info = await SplitModule.setFile(file);
        showSplitFileInfo(info);
    updateActionBtnState();
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

function showSplitFileInfo(info) {
    splitDropZone.style.display = 'none';
    const workspace = document.getElementById('split-workspace');
    workspace.style.display = 'block';
    workspace.innerHTML = `
        <div class="file-item">
            <div class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
      <div class="file-info">
                <span class="file-name">${info.name}</span>
                <span class="file-size">${t('pages_count', [info.pages])}</span>
      </div>
        </div>
        <div class="options-panel" style="margin-top: 16px;">
            <div class="option-group" id="split-ranges-input">
                <label>${t('split_input_ranges')}</label>
                <input type="text" id="split-ranges" placeholder="1-3, 5, 7-10">
            </div>
            <div class="option-group" id="split-every-n-input" style="display: none;">
                <label>${t('split_input_every_n')}</label>
                <input type="number" id="split-every-n" value="2" min="1">
            </div>
        </div>
    `;

    // Add event listeners for inputs
    const rangesInput = document.getElementById('split-ranges');
    if (rangesInput) {
        rangesInput.addEventListener('input', (e) => {
            SplitModule.options.ranges = e.target.value;
        });
    }

    const everyNInput = document.getElementById('split-every-n');
    if (everyNInput) {
        everyNInput.addEventListener('input', (e) => {
            SplitModule.options.everyN = parseInt(e.target.value) || 2;
        });
    }

    updateSplitOptions();
}

function updateSplitOptions() {
    const rangesGroup = document.getElementById('split-ranges-input');
    const everyNGroup = document.getElementById('split-every-n-input');

    if (!rangesGroup || !everyNGroup) return;

    const mode = SplitModule.options.mode;

    rangesGroup.style.display = (mode === 'ranges' || mode === 'extract') ? 'block' : 'none';
    everyNGroup.style.display = mode === 'every-n' ? 'block' : 'none';
}

// ==================== ROTATE TOOL ====================
function setupRotateTool() {
    if (!rotateDropZone || !rotateFileInput) return;

    setupDropZone(rotateDropZone, rotateFileInput, (files) => handleRotateFile(files[0]));

    rotateFileInput.addEventListener('change', (e) => handleRotateFile(e.target.files[0]));

    // Setup options
    const angleSelect = document.getElementById('rotate-angle');
    const modeSelect = document.getElementById('rotate-mode');
    const pagesGroup = document.getElementById('rotate-pages-group');
    const pagesInput = document.getElementById('rotate-pages');

    if (angleSelect) {
        angleSelect.addEventListener('change', (e) => {
            RotateModule.options.angle = parseInt(e.target.value);
        });
    }

    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            RotateModule.options.mode = e.target.value;
            if (pagesGroup) {
                pagesGroup.style.display = e.target.value === 'selected' ? 'block' : 'none';
            }
        });
    }

    if (pagesInput) {
        pagesInput.addEventListener('input', (e) => {
            const pages = e.target.value.split(',')
                .map(s => s.trim())
                .filter(s => s)
                .map(s => {
                    if (s.includes('-')) {
                        const [start, end] = s.split('-').map(n => parseInt(n.trim()));
                        const result = [];
                        for (let i = start; i <= end; i++) result.push(i);
                        return result;
                    }
                    return parseInt(s);
                })
                .flat()
                .filter(n => !isNaN(n));
            RotateModule.options.selectedPages = pages;
        });
    }
}

async function handleRotateFile(file) {
    if (!file) return;
    try {
        const info = await RotateModule.setFile(file);
        renderRotateFileInfo(info);
        updateActionBtnState();
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

function renderRotateFileInfo(info) {
    rotateDropZone.style.display = 'none';
    rotateFileInfo.style.display = 'flex';
    rotateOptions.style.display = 'block';

    rotateFileInfo.innerHTML = `
        <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        </div>
        <div class="file-info">
            <span class="file-name">${info.name}</span>
            <span class="file-size">${t('pages_count', [info.pages])}</span>
        </div>
        <button class="remove-btn" id="remove-rotate-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.getElementById('remove-rotate-file').addEventListener('click', () => {
        RotateModule.reset();
        resetRotateUI();
            updateActionBtnState();
        });
}

function resetRotateUI() {
    rotateDropZone.style.display = 'block';
    rotateFileInfo.style.display = 'none';
    rotateOptions.style.display = 'none';
    rotateFileInput.value = '';
}

// ==================== WATERMARK TOOL ====================
function setupWatermarkTool() {
    if (!watermarkDropZone || !watermarkFileInput) return;

    setupDropZone(watermarkDropZone, watermarkFileInput, (files) => handleWatermarkFile(files[0]));

    watermarkFileInput.addEventListener('change', (e) => handleWatermarkFile(e.target.files[0]));

    // Setup options
    const typeSelect = document.getElementById('watermark-type');
    const textOptions = document.getElementById('watermark-text-options');
    const imageOptions = document.getElementById('watermark-image-options');
    const textInput = document.getElementById('watermark-text');
    const fontSizeSelect = document.getElementById('watermark-fontsize');
    const opacitySelect = document.getElementById('watermark-opacity');
    const positionSelect = document.getElementById('watermark-position');
    const imageInput = document.getElementById('watermark-image-input');

    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            WatermarkModule.options.type = e.target.value;
            if (textOptions) textOptions.style.display = e.target.value === 'text' ? 'block' : 'none';
            if (imageOptions) imageOptions.style.display = e.target.value === 'image' ? 'block' : 'none';
        });
    }

    if (textInput) {
        textInput.addEventListener('input', (e) => {
            WatermarkModule.options.text = e.target.value;
        });
    }

    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            WatermarkModule.options.fontSize = parseInt(e.target.value);
        });
    }

    if (opacitySelect) {
        opacitySelect.addEventListener('change', (e) => {
            WatermarkModule.options.opacity = parseFloat(e.target.value);
        });
    }

    if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
            WatermarkModule.options.position = e.target.value;
            WatermarkModule.options.rotation = e.target.value === 'center' ? -45 : 0;
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                await WatermarkModule.setImageFile(e.target.files[0]);
            }
        });
    }
}

async function handleWatermarkFile(file) {
    if (!file) return;
    try {
        const info = await WatermarkModule.setFile(file);
        renderWatermarkFileInfo(info);
        updateActionBtnState();
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

function renderWatermarkFileInfo(info) {
    watermarkDropZone.style.display = 'none';
    watermarkFileInfo.style.display = 'flex';
    watermarkOptions.style.display = 'block';

    watermarkFileInfo.innerHTML = `
        <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        </div>
        <div class="file-info">
            <span class="file-name">${info.name}</span>
            <span class="file-size">${t('pages_count', [info.pages])}</span>
        </div>
        <button class="remove-btn" id="remove-watermark-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.getElementById('remove-watermark-file').addEventListener('click', () => {
        WatermarkModule.reset();
        resetWatermarkUI();
        updateActionBtnState();
    });
}

function resetWatermarkUI() {
    watermarkDropZone.style.display = 'block';
    watermarkFileInfo.style.display = 'none';
    watermarkOptions.style.display = 'none';
    watermarkFileInput.value = '';
}

// ==================== COMPRESS TOOL ====================
function setupCompressTool() {
    if (!compressDropZone || !compressFileInput) return;

    setupDropZone(compressDropZone, compressFileInput, (files) => handleCompressFile(files[0]));

    compressFileInput.addEventListener('change', (e) => handleCompressFile(e.target.files[0]));

    // Setup options
    const qualitySelect = document.getElementById('compress-quality');
    const removeMetadataCheckbox = document.getElementById('compress-remove-metadata');

    if (qualitySelect) {
        qualitySelect.addEventListener('change', (e) => {
            CompressModule.options.quality = e.target.value;
        });
    }

    if (removeMetadataCheckbox) {
        removeMetadataCheckbox.addEventListener('change', (e) => {
            CompressModule.options.removeMetadata = e.target.checked;
        });
    }
}

async function handleCompressFile(file) {
    if (!file) return;
    try {
        const info = await CompressModule.setFile(file);
        renderCompressFileInfo(info);
    updateActionBtnState();
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

function renderCompressFileInfo(info) {
    compressDropZone.style.display = 'none';
    compressFileInfo.style.display = 'flex';
    compressOptions.style.display = 'block';

    compressFileInfo.innerHTML = `
        <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        </div>
      <div class="file-info">
            <span class="file-name">${info.name}</span>
            <span class="file-size">${t('pages_count', [info.pages])} • ${info.formattedSize || ''}</span>
      </div>
        <button class="remove-btn" id="remove-compress-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    // Show original size
    const statsDiv = document.getElementById('compress-stats');
    const originalSizeEl = document.getElementById('compress-original-size');
    if (statsDiv && originalSizeEl) {
        statsDiv.style.display = 'block';
        originalSizeEl.textContent = info.formattedSize;
    }

    document.getElementById('remove-compress-file').addEventListener('click', () => {
        CompressModule.reset();
        resetCompressUI();
            updateActionBtnState();
        });
}

function resetCompressUI() {
    compressDropZone.style.display = 'block';
    compressFileInfo.style.display = 'none';
    compressOptions.style.display = 'none';
    compressFileInput.value = '';
    const statsDiv = document.getElementById('compress-stats');
    if (statsDiv) statsDiv.style.display = 'none';
}

// ==================== PDF TO DOCX TOOL ====================
function setupDocxTool() {
    if (!docxDropZone || !docxFileInput) return;

    setupDropZone(docxDropZone, docxFileInput, (files) => handleDocxFile(files[0]));

    docxFileInput.addEventListener('change', (e) => handleDocxFile(e.target.files[0]));
}

async function handleDocxFile(file) {
    if (!file) return;
    
    Logger.info('Loading PDF for DOCX conversion:', file.name);
    
    try {
        // Verify pdfjsLib is available
        if (!window.pdfjsLib) {
            throw new Error('PDF.js no está disponible. Recarga la extensión.');
        }
        
        const info = await PdfToDocxModule.setFile(file);
        Logger.info('PDF loaded successfully:', info);
        renderDocxFileInfo(info);
        updateActionBtnState();
    } catch (error) {
        Logger.error('Error loading PDF for DOCX:', error);
        showStatus(error.message || 'Error al cargar el PDF', 'error');
    }
}

function renderDocxFileInfo(info) {
    docxDropZone.style.display = 'none';
    docxFileInfo.style.display = 'flex';
    if (docxFeatures) docxFeatures.style.display = 'block';

    docxFileInfo.innerHTML = `
        <div class="file-icon" style="background: #eff6ff;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        </div>
        <div class="file-info">
            <span class="file-name">${info.name}</span>
            <span class="file-size">${t('pages_count', [info.pages])}</span>
        </div>
        <button class="remove-btn" id="remove-docx-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.getElementById('remove-docx-file').addEventListener('click', () => {
        PdfToDocxModule.reset();
        resetDocxUI();
        updateActionBtnState();
    });
}

function resetDocxUI() {
    docxDropZone.style.display = 'block';
    docxFileInfo.style.display = 'none';
    if (docxFeatures) docxFeatures.style.display = 'none';
    docxFileInput.value = '';
}

// ==================== WEBPAGE TOOL ====================
function setupWebpageTool() {
    // Setup options
    const formatSelect = document.getElementById('webpage-format');
    const orientationSelect = document.getElementById('webpage-orientation');
    const captureModeSelect = document.getElementById('webpage-capture-mode');
    const marginsCheckbox = document.getElementById('webpage-margins');
    const printBtn = document.getElementById('webpage-print-btn');

    if (formatSelect) {
        formatSelect.addEventListener('change', (e) => {
            WebpageModule.options.format = e.target.value;
        });
    }

    if (orientationSelect) {
        orientationSelect.addEventListener('change', (e) => {
            WebpageModule.options.orientation = e.target.value;
        });
    }

    if (captureModeSelect) {
        captureModeSelect.addEventListener('change', (e) => {
            WebpageModule.options.captureMode = e.target.value;
        });
    }

    if (marginsCheckbox) {
        marginsCheckbox.addEventListener('change', (e) => {
            WebpageModule.options.margins = e.target.checked;
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', async () => {
            try {
                await WebpageModule.printPage();
                showStatus('Diálogo de impresión abierto', 'success');
            } catch (error) {
                showStatus(error.message, 'error');
            }
        });
    }
}

async function loadWebpageInfo() {
    if (!webpageInfo) return;

    // Show loading state
    webpageInfo.innerHTML = `
        <div class="webpage-loading">
            <div class="spinner"></div>
            <p>Obteniendo información de la página...</p>
        </div>
    `;
    
    if (webpageOptions) webpageOptions.style.display = 'none';
    if (webpageActions) webpageActions.style.display = 'none';

    try {
        const info = await WebpageModule.getCurrentTab();
        
        // Show page info
        webpageInfo.innerHTML = `
            <div class="webpage-ready">
                <div class="webpage-ready-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </div>
                <h3>${escapeHtml(info.title)}</h3>
                <span class="webpage-url">${escapeHtml(info.url)}</span>
                <span class="webpage-ready-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ${t('webpage_ready')}
                </span>
            </div>
        `;
        
        if (webpageOptions) webpageOptions.style.display = 'block';
        if (webpageActions) webpageActions.style.display = 'flex';
        updateActionBtnState();

    } catch (error) {
        // Check if it's a restricted page
        if (error.isRestricted) {
            webpageInfo.innerHTML = `
                <div class="webpage-restricted">
                    <div class="webpage-restricted-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h3>${t('webpage_protected')}</h3>
                    <p>${t('webpage_protected_description')}</p>
                    <span class="webpage-restricted-hint">${t('webpage_protected_hint')}</span>
                </div>
            `;
        } else {
            webpageInfo.innerHTML = `
                <div class="webpage-error">
                    <div class="webpage-error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <h3>${t('webpage_cannot_capture')}</h3>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;
        }
        updateActionBtnState();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== SHARED UTILITIES ====================
function setupDropZone(dropZone, fileInput, handler) {
    if (!dropZone || !fileInput) return;

    const selectBtn = dropZone.querySelector('.select-files-btn');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handler(e.dataTransfer.files);
    });

    if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    dropZone.addEventListener('click', (e) => {
        if (!e.target.classList.contains('select-files-btn')) {
            fileInput.click();
        }
    });
}

function updateActionBtnState() {
    if (currentTool === 'merge') {
        actionBtn.disabled = MergeModule.files.length < 2;
        actionBtn.textContent = t('button_merge_pdfs');
    } else if (currentTool === 'pdf-to-docx') {
        // IMPORTANT: Check pdf-to-docx BEFORE generic pdf-to-* pattern
        actionBtn.disabled = !PdfToDocxModule.pdfDoc;
        actionBtn.textContent = t('button_convert_to_word');
    } else if (currentTool && currentTool.startsWith('pdf-to-')) {
        actionBtn.disabled = !ConvertModule.file;
        actionBtn.textContent = t('button_convert');
    } else if (currentTool && currentTool.endsWith('-to-pdf')) {
        actionBtn.disabled = CreateModule.files.length === 0;
        actionBtn.textContent = t('button_create_pdf');
    } else if (currentTool === 'split') {
        actionBtn.disabled = !SplitModule.pdfDoc;
        actionBtn.textContent = t('button_split_pdf');
    } else if (currentTool === 'rotate') {
        actionBtn.disabled = !RotateModule.pdfDoc;
        actionBtn.textContent = t('button_rotate_pdf');
    } else if (currentTool === 'watermark') {
        actionBtn.disabled = !WatermarkModule.pdfDoc;
        actionBtn.textContent = t('button_apply_watermark');
    } else if (currentTool === 'compress') {
        actionBtn.disabled = !CompressModule.pdfDoc;
        actionBtn.textContent = t('button_compress_pdf');
    } else if (currentTool === 'webpage') {
        actionBtn.disabled = !WebpageModule.pageInfo;
        actionBtn.textContent = t('button_convert_to_pdf');
    } else {
        actionBtn.disabled = true;
        actionBtn.textContent = t('button_process');
    }
}

// ==================== ACTION BUTTON ====================
function setupActionBtn() {
    actionBtn.addEventListener('click', async () => {
        if (isProcessing) return;

        if (currentTool === 'merge') {
            await runMerge();
        } else if (currentTool === 'pdf-to-docx') {
            // IMPORTANT: Check pdf-to-docx BEFORE generic pdf-to-* pattern
            await runDocx();
        } else if (currentTool && currentTool.startsWith('pdf-to-')) {
            await runConvert();
        } else if (currentTool && currentTool.endsWith('-to-pdf')) {
            await runCreate();
        } else if (currentTool === 'split') {
            await runSplit();
        } else if (currentTool === 'rotate') {
            await runRotate();
        } else if (currentTool === 'watermark') {
            await runWatermark();
        } else if (currentTool === 'compress') {
            await runCompress();
        } else if (currentTool === 'webpage') {
            await runWebpage();
        }
    });
}

async function runMerge() {
    startProcessing();
    try {
        const blob = await MergeModule.process(updateProgress);
        downloadFile(blob, `merged_${Date.now()}.pdf`);
        showStatus(t('success_merged'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runConvert() {
    startProcessing();
    try {
        const blob = await ConvertModule.process(updateProgress);
        const ext = ConvertModule.options.format === 'image/jpeg' ? 'jpg' : 'png';
        const isZip = blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed';
        const filename = isZip ? `converted_${Date.now()}.zip` : `page_1_${Date.now()}.${ext}`;

        downloadFile(blob, filename);
        showStatus(t('success_converted'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runCreate() {
    startProcessing();
    try {
        const blob = await CreateModule.process(updateProgress);
        downloadFile(blob, `created_${Date.now()}.pdf`);
        showStatus(t('success_created'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runSplit() {
    startProcessing();
    try {
        const blob = await SplitModule.process(updateProgress);
        const isZip = blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed';
        const filename = isZip ? `split_${Date.now()}.zip` : `split_${Date.now()}.pdf`;
        downloadFile(blob, filename);
        showStatus(t('success_split'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runRotate() {
    startProcessing();
    try {
        const blob = await RotateModule.process(updateProgress);
        downloadFile(blob, `rotated_${Date.now()}.pdf`);
        showStatus(t('success_rotated'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runWatermark() {
    startProcessing();
    try {
        const blob = await WatermarkModule.process(updateProgress);
        downloadFile(blob, `watermarked_${Date.now()}.pdf`);
        showStatus(t('success_watermark'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runCompress() {
    startProcessing();
    try {
        const result = await CompressModule.process(updateProgress);
        downloadFile(result.blob, `compressed_${Date.now()}.pdf`);
        showStatus(t('success_compressed', [result.percentage]), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runWebpage() {
    startProcessing();
    try {
        const captureMode = document.getElementById('webpage-capture-mode')?.value || 'visible';
        let result;

        if (captureMode === 'full') {
            result = await WebpageModule.captureFullPage(updateProgress);
        } else {
            result = await WebpageModule.process(updateProgress);
        }

        downloadFile(result.blob, result.filename);
        showStatus(t('success_webpage'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

async function runDocx() {
    startProcessing();
    try {
        const blob = await PdfToDocxModule.process(updateProgress);
        const originalName = PdfToDocxModule.file?.name || 'document';
        const baseName = originalName.replace(/\.pdf$/i, '');
        downloadFile(blob, `${baseName}.docx`);
        showStatus(t('success_docx'), 'success');
    } catch (error) {
        showStatus(t('error_generic', [error.message]), 'error');
    } finally {
        stopProcessing();
    }
}

// ==================== UI HELPERS ====================
function startProcessing() {
    isProcessing = true;
    actionBtn.disabled = true;
    actionBtn.textContent = t('status_processing');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    statusMsg.textContent = '';
}

function stopProcessing() {
    isProcessing = false;
    updateActionBtnState();

    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
    }, 2000);
}

function updateProgress(percent, msg) {
    progressBar.style.width = `${percent}%`;
    if (msg) showStatus(msg);
}

function showStatus(msg, type = 'normal') {
    statusMsg.textContent = msg;
    statusMsg.className = 'status-msg ' + (type === 'success' ? 'status-success' : type === 'error' ? 'status-error' : '');
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Start
init();
