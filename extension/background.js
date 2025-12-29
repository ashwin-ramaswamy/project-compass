// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Project Compass extension installed');
});
