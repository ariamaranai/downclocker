{
  let dbgTabId = 0;
  let badgeText = "";
  let tabActivatedHandler = activeInfo => chrome.action.setBadgeText({
    text: activeInfo.tabId == dbgTabId ? badgeText : ""
  });
  chrome.debugger.onDetach.addListener(() => (
    chrome.tabs.onActivated.removeListener(tabActivatedHandler),
    chrome.action.setBadgeText({ text: "" }),
    dbgTabId = 0
  ));
  chrome.runtime.onMessage.addListener(m => {
    if (m) {
      let rate = m[0];
      let tabId = m[1];
      let target = { tabId };
      tabId == dbgTabId
        ? (
          chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", { rate }),
          chrome.action.setBadgeText({ text: badgeText = "x" + rate })
        )
        : (
          chrome.debugger.attach(target, "1.3"),
          chrome.debugger.sendCommand(target, "Target.setAutoAttach", {
            autoAttach: !0,
            waitForDebuggerOnStart: !1
          }),
          chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", { rate }),
          chrome.action.setBadgeText({ text: badgeText = "x" + rate }),
          dbgTabId = tabId,
          chrome.tabs.onActivated.addListener(tabActivatedHandler)
        )
    } else
      chrome.debugger.onDetach.dispatch()
  });
}
chrome.action.setBadgeTextColor({ color: "#fff" });