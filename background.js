// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.tabs.executeScript(null, {
  file : "content.js",
  runAt : "document_start"
});

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     console.log(request);
//     if (request.tyle == "participant-entered"){
//       sendResponse("got participant number : " + request.pNum);
//     }
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });
