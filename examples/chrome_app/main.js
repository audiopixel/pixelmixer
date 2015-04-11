chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
  	id: "mainwin",
    innerBounds: {
      width: 680,
      height: 480
    }
  });
});
