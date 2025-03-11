oninput = e => {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, tabs => {
    let tab = tabs[0];
    let rate = +e.target.value;
    chrome.runtime.sendMessage(rate > 1 && (
      tab.url[0] == "c" && chrome.tabs.update({ url: "about:blank" }),
      [rate, tab.id]
    ));
  });
}
chrome.tabs.query({ active: !0, currentWindow: !0 }, () =>
  chrome.action.getBadgeText({}, result =>
    document.body.firstChild.value = result.slice(1) || "1"
  )
);