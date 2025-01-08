oninput = async e => chrome.runtime.sendMessage([
  (await chrome.tabs.query({ active: !0, currentWindow: !0 }))[0],
  e.target.value
]);
chrome.tabs.query({ active: !0, currentWindow: !0 }).then(async tab =>
  document.body.firstChild.value = (await chrome.action.getBadgeText({ tabId: tab[0].id })).slice(1) || "1"
);