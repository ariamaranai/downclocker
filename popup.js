
(async chrome => {
  chrome.action.setBadgeTextColor({ color: "#fff" });
  let tab = (await chrome.tabs.query({ active: !0, currentWindow: !0 }))[0];
  let input = document.body.lastChild;
  oninput = e => chrome.action.setBadgeText({ tabId: tab.id, text: "x" + e.target.value });
  input.onblur = () => chrome.runtime.sendMessage([tab, input.value]);
})(chrome);