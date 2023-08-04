chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  fetch(`http://localhost:5000?q=${encodeURI(request.query)}`)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then(sendResponse)
    .catch((err) => {
      throw new Error(`query:${request.query}; ${err.message}`);
    });
  return true;
});
