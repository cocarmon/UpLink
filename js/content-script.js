"use strict";

// This function checks if the selected text is editable

function isEditable() {
  const el = document.activeElement;
  if (el.hasAttribute("contenteditable")) {
    return el.getAttribute("contenteditable");
  }
}

// Grabs selected text
function injectedFunction() {
  if (isEditable() && window.getSelection) {
    const text = window.getSelection().toString();
    return text;
  }
}
// Listens for a double click on injectable text
// After the double click listens for a message saying that the popup has been opened
window.addEventListener("dblclick", function (e) {
  console.log(e.target);
  let count = 0;
  let injectedText = injectedFunction();
  if (injectedText) {
    console.log("Inside dblclick" + injectedText);
    chrome.runtime.onMessage.addListener(function (request) {
      let lastError = chrome.runtime.lastError;
      if (lastError) {
        console.log(lastError.message);
        // 'Could not establish connection. Receiving end does not exist.'
        return;
      }
      // Keeps it from running more than once
      if (count === 0) {
        let selectedUrl = request.process;
        count++;
        e.target.innerHTML = e.target.innerHTML.replace(
          injectedText,
          `<a href='${selectedUrl}'>${injectedText}</a>`
        );
        // Clears the value
        injectedText = "";
      }
    });
  }
});
