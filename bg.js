(chrome => {
  chrome.runtime.onMessage.addListener(async m => {
    let tab = m[0];
    let rate = m[1];
    let tabId = tab.id;
    let target = { tabId };
    (await chrome.debugger.getTargets()).find(v => v.tabId == tabId).attached
      ? rate != "1"
        ? chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", { rate: +rate })
        : chrome.debugger.detach(target)
      : rate != "1" && (
        // tab.url[0] == "c" && await chrome.tabs.update(tabId, { url: "about:blank" }),
        // chrome.webNavigation.onBeforeNavigate.addListener(e => {
         //  e.tabId
        //}),
        chrome.debugger.attach(target, "1.3"),
        chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", { rate: +rate })
      );
    }
  );
})(chrome);