var tkey = {
  "N" : "none",
  "HE" : "Based on your previous searches",
  "S" : "Based on your friends interests",
  "TS" : "Based on current time of the day",
  "L" : "Based on your current location"
}

var skey = ["San Francisco", "Sausalito", "Miami", "Orange County", "Tahoe", "Italian", "Chinese", "Indian", "Thai", "Mediterranean"];

var task = {};
var myElement, tempHtml, rhsblock, current_task, myExp, taskData, search_input_box,exp_btn;
var title_template, e_item_template, l_item_template, experiment_btn_template;
var storage = chrome.storage.local;
var participant = {};

var task_array = [], current_task_num = 0;  

function sub_main(){
  console.log("here is my content script init");
  getTemplate("title_template");
  getTemplate("exploratory_item_template");
  getTemplate("lobster_item_template");
  getTemplate("experiment_helper");
  // search_input_box.addEventListener("change", find_search_keyword());
  // console.log(exploratory_list, lobster_list);
}

function load1(){
  storage.get("participant", function(result){
    console.log(result);
    // task_array = task_key[result.participant.num.toUpperCase()][result.participant.eNum];
    task_array = task_key[result.participant.num.toUpperCase()]['ex-order'];
    storage.set({"task_array" : task_array});
    console.log(task_array);
    startTask();
    
  });
}

function load2(){
  storage.get("participant", function(result){
    console.log(result);
    // task_array = task_key[result.participant.num.toUpperCase()][result.participant.eNum];
    task_array = task_key[result.participant.num.toUpperCase()]['lt-order'];
    storage.set({"task_array" : task_array});
    console.log(task_array);
    startTask();
  });
}

function startTask(){
  current_task_num = 0;
  storage.set({"current_task_num" : current_task_num});
  loadTask();
}

function nextTask(){
  // based on participant number and current task idetify the next task
  storage.get("current_task_num", function(result){
    current_task_num = result.current_task_num;
    if(current_task_num < 4){
      current_task_num++;  
    } else{
      current_task_num = -1;
    }
    storage.set({"current_task_num" : current_task_num});
    loadTask();  
  });
}

function loadTask(){
  storage.get(["task_array"], function(result){
    task_array = result.task_array;
    if(tkey[task_array[current_task_num]]){
      current_task = tkey[task_array[current_task_num]];  
    } else{
      current_task = "not able to load task";
    }
    console.log(current_task);
    storage.set({"task_title": current_task});
  });
  
}

function getTemplate(templateName){
  var req = new XMLHttpRequest();
  req.open("GET", chrome.extension.getURL('Templates/'+ templateName +'.html'), true);
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
        console.log('Fetching the template...');
        switch(templateName){
          case "title_template":
            title_template = req.responseText;
            // console.log(title_template);
          break;
          case "exploratory_item_template":
            e_item_template = req.responseText;
            // console.log(e_item_template);
          break;
          case "lobster_item_template":
            l_item_template = req.responseText;
            // console.log(l_item_template);
          break;
          case "experiment_helper":
            experiment_btn_template = req.responseText;
            exp_btn = document.createElement("div");
            exp_btn.innerHTML = whisker_renderer_d(experiment_btn_template,{});
            document.body.appendChild(exp_btn);
            document.getElementById("experiment_helper").addEventListener("click", nextTask);
            document.getElementById("ex-1").addEventListener("click", load1);
            document.getElementById("ex-2").addEventListener("click", load2);
          break;
        }
         
        // document.getElementById("rhs").appendChild(container_elem);
        // $('body').prepend(tb);
    }
  };
  req.send(null);

}

function whisker_renderer_d(templateText, dataObj){
  return whiskers.render(templateText, dataObj);
}

function find_search_keyword(){
  for (var i = skey.length - 1; i >= 0; i--) {
    myExp = new RegExp(skey[i],'gi');
    if(search_input_box.value.search(myExp) != -1){
      // we found a matching search experiment load result set
      if(exploratory_list[skey[i].toLowerCase()]){
        taskData = exploratory_list[skey[i].toLowerCase()];
        // console.log(taskData);
      } else{
        taskData = lobster_list[skey[i].toLowerCase()];
      }
      // console.log(skey[i], taskData);
    }
  }
}

sub_main();


tempHtml = document.createElement("div");
storage.get("task_title", function(result){
  tempHtml.innerHTML = whisker_renderer_d(title_template, {"title" : result.task_title});
});

document.addEventListener("DOMSubtreeModified", function(e){
  // assigning listeners to the search box
  // look for a matching term to load matching results for the task
  search_input_box = document.getElementById("lst-ib");

  // console.log(e.srcElement);
  if(e.srcElement.id == "appbar")
  {
    find_search_keyword();
    myElement = e.srcElement;
    myElement.style.display = "none";
    // console.log("Found new app node");
    setTimeout(function(){
      rhsblock = document.getElementById("rhs");
      storage.get("task_title", function(result){
        // console.log(result.task_title);
        if(result.task_title === 'none'){
          //do nothing
          tempHtml.innerHTML = "<div style='margin: 10px;'></div>";
        } else{
          tempHtml.innerHTML = whisker_renderer_d(title_template, {"title" : result.task_title});
        }
        if(taskData && result.task_title !== 'none'){
          tempHtml.innerHTML += whisker_renderer_d(e_item_template, {items : taskData});
          // console.log(whisker_renderer_d(e_item_template, {items : taskData}));  
        }
      });
      rhsblock.insertBefore(tempHtml, rhsblock.childNodes[0]);
      console.log("inside timeout");
    },100);
  }
  //mutation event props to consider
  // target (elem)
  // path (array)


});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log();
    switch(request.type){
      case "load-task": 
        if(tkey[request.task]){
          current_task = tkey[request.task];  
        } else{
          current_task = "not able to load task";
        }
        storage.set({"task_title": current_task});
        sendResponse({task: "loaded"});
        break;
      default : 
        sendResponse({default : "means nothing"});
    } 
  } 
);

