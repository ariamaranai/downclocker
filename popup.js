oninput = async e => chrome.runtime.sendMessage([
  (await chrome.tabs.query({ active: !0, currentWindow: !0 }))[0],
  e.target.value
]);
chrome.tabs.query({ active: !0, currentWindow: !0 }, async () =>
  document.body.firstChild.value = (await chrome.action.getBadgeText({})).slice(1) || "1"
);