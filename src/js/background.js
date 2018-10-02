chrome.runtime.onInstalled.addListener(function() {
	chrome.browserAction.setBadgeText({text: "OFF"});
});

chrome.runtime.setUninstallURL('http://patelworld.in/');

