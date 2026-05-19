// Background Service Worker for PROMPT&PLAY AUTO GEN V.5.0.1

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Set side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PROMPT&PLAY Ai installed successfully!');
  } else if (details.reason === 'update') {
    console.log('PROMPT&PLAY Ai updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true;
  }
});

// Listen for downloads and rename files to PROMPT_PLAY_YYYYMMDD_HHMMSS.ext
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  // Check if it's a video or image file
  const url = downloadItem.url || '';
  const filename = downloadItem.filename || url.split('/').pop() || '';
  const isVideoOrImage = /\.(mp4|webm|mov|avi|mkv|jpg|jpeg|png|gif|webp)$/i.test(filename);
  
  if (isVideoOrImage) {
    // Generate new filename: PROMPT_PLAY_YYYYMMDD_HHMMSS.ext
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Get file extension from original filename or URL
    let extension = 'mp4';
    const extMatch = filename.match(/\.([^.]+)$/i) || url.match(/\.([^.]+)(?:\?|$)/i);
    if (extMatch) {
      extension = extMatch[1].toLowerCase();
    }
    
    // Create new filename
    const newFilename = `PROMPT_PLAY_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
    
    // Get the directory from original filename (if it has a path)
    let newPath = newFilename;
    if (filename.includes('/')) {
      const directory = filename.substring(0, filename.lastIndexOf('/') + 1);
      newPath = directory + newFilename;
    }
    
    // Suggest the new filename
    suggest({ filename: newPath });
 } else {
    // สำหรับไฟล์ประเภทอื่น ให้ใช้ชื่อไฟล์เดิมของมัน (ป้องกัน Error ค่าว่าง)
    let safeFilename = downloadItem.filename;
    
    // กันเหนียว: ถ้าเว็บไม่ได้ตั้งชื่อไฟล์มาให้ ให้สุ่มชื่อป้องกันระบบพัง
    if (!safeFilename || safeFilename.trim() === "") {
        safeFilename = "downloaded_file_" + Date.now();
    }
    
    suggest({ filename: safeFilename });
  }
});
