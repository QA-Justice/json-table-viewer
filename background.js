// JSON Table Viewer Background Script
// Refactored for better maintainability and readability

/**
 * Background service worker for JSON Table Viewer Chrome Extension
 */
class JSONTableViewerBackground {
  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    // Handle extension icon clicks
    chrome.action.onClicked.addListener(this.handleIconClick.bind(this));
    
    // Handle extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstallation.bind(this));
  }

  /**
   * Handle extension icon click
   * @param {chrome.tabs.Tab} tab - The active tab
   */
  async handleIconClick(tab) {
    try {
      await this.openSidePanel(tab);
      await this.configureSidePanel(tab);
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }

  /**
   * Handle extension installation
   */
  async handleInstallation() {
    try {
      await this.setupSidePanelBehavior();
    } catch (error) {
      console.error('Failed to setup side panel behavior:', error);
    }
  }

  /**
   * Open the side panel
   * @param {chrome.tabs.Tab} tab - The active tab
   */
  async openSidePanel(tab) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }

  /**
   * Configure side panel options
   * @param {chrome.tabs.Tab} tab - The active tab
   */
  async configureSidePanel(tab) {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'index-improved.html',
      enabled: true
    });
  }

  /**
   * Setup side panel behavior for all tabs
   */
  async setupSidePanelBehavior() {
    await chrome.sidePanel.setPanelBehavior({ 
      openPanelOnActionClick: true 
    });
  }
}

// Initialize the background service worker
new JSONTableViewerBackground(); 