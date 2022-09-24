// Used to set or push the storage of chrome to an array

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'UpLink',
    title: 'Copy to UpLink',
    contexts: ['link'],
  });
});

// Gets storage and in it's callback it sets it
// This keeps the storage up to date with main.js
// Fire everytime the context menu is clicked
chrome.contextMenus.onClicked.addListener(function (OnClickData) {
  storageSet(OnClickData.linkUrl);
});

chrome.commands.onCommand.addListener(function (command) {
  console.log(`Command "${command}" called`);
  if (command) {
    // Grabs current url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let url = tabs[0].url;
      storageSet(url);
    });
  }
});

const storageSet = function (newUrl) {
  chrome.storage.sync.get(['key'], function (result) {
    const previousLinks = result.key ?? [];
    if (newUrl) {
      previousLinks.push(newUrl);
      chrome.storage.sync.set({ key: previousLinks }, () => {
        if (chrome.runtime.lastError) console.log('Error setting');
      });
    }
  });
};
