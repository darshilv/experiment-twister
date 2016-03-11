var storage = chrome.storage.local;
var participant = {};
var task_array = [];
var inputBx, selBx, taskBx, current_task = 0, sendObj;

// sending messages to the background script!
function sendMessage(obj_to_send, func_to_call){
  console.log("sending message", obj_to_send);
  chrome.runtime.sendMessage(obj_to_send, function(response) {
    if(response){
      console.log(response);
      func_to_call(response);
    }
  });  
}

// waiting for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
  inputBx = document.getElementById("myInput");
  selBx = document.getElementById("mySel");
  taskBx = document.getElementById("myTask");

  //initializers
  inputBx.value = "p1";
  selBx.value = "ex-order";
  participant.num = inputBx.value;
  participant.eNum = selBx.value;
  task_array = task_key[participant.num.toUpperCase()][participant.eNum];  
  taskBx.value = task_array[current_task];
  //update participant info
  document.getElementById("button").onclick = function() {
    // console.log("clicking button");
    current_task = 0;
    // need to send the HTML code from here to the content script
    participant.num = inputBx.value;
    participant.eNum = selBx.value;
    storage.set({"participant": participant});

    task_array = task_key[participant.num.toUpperCase()][participant.eNum];
    taskBx.value = task_array[current_task];
    console.log(task_array);
    sendObj = {    
      type: "load-task",
      task : task_array[current_task]
    };

    sendMessage(sendObj, function(response){
      // console.log(response);
      if(response.task == "loaded"){
        // set current task for the experiment
        taskBx.value = task_array[current_task];
      }

    });
  }

  document.getElementById("start").onclick = function(){
    current_task = task_array.indexOf(taskBx.value);
    
    sendObj = {
      type: "load-task",
      task : task_array[current_task]
    }

    sendMessage(sendObj, function(response){
      // console.log(response);
      if(response.task == "loaded"){
        // set current task for the experiment
        taskBx.value = task_array[current_task];
        chrome.tabs.getSelected(null, function(tab) {
        var code = 'window.location.href = "https://www.google.com";';
         chrome.tabs.executeScript(tab.id, {code: code});
        });
      }
    });

  }

  document.getElementById("progress").onclick = function(){
    if(current_task < 4){
      current_task++;  
    } else{
      current_task = 0;
    }
    
    sendObj = {
      type: "load-task",
      task : task_array[current_task]
    }

    // console.log(current_task, sendObj);

    sendMessage(sendObj, function(response){
      // console.log(response);
      if(response.task == "loaded"){
        // set current task for the experiment
        taskBx.value = task_array[current_task];
      }
    });

  }
});

