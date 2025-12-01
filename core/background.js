// Background service worker
// Handles the extension icon click to open the side panel

chrome.action.onClicked.addListener((tab) => {
    // Open the side panel in the current window
    chrome.sidePanel.open({ windowId: tab.windowId });
});

// Optional: Set panel behavior to open on specific sites if needed
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
// Note: openPanelOnActionClick is a newer API that simplifies this,
// but using the listener is more explicit and compatible.
