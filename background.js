chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentTabUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }

      if (tabs.length > 0) {
        const currentTab = tabs[0];
        if (currentTab.url) {
          sendResponse({ url: currentTab.url });
        } else {
          sendResponse({ error: 'No URL found for the current tab' });
        }
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true;
  }
});
