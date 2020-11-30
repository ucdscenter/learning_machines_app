

 var cancelled = false

 if (window.performance) {
  console.info("window.performance works fine on this browser");
}
  if (performance.navigation.type == 1) {
    cancelled = true
  } else {
    console.info( "This page is not reloaded");
  }


 function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    return (/^(HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


var prepend_str = "http://"
if(redirect_url.startsWith('http')){
  prepend_str = ""
}



  jQuery(document).ready(function() {

    var rnlpFinished = false
   // pole state of the current task

    var runCorpusCreate = function(){
      if (cancelled == false){
      $.ajax({
      url: prepend_str + start_corpus_url,
      type: "GET",
      error: function (request, status, error) {
          console.log(request.responseText)
          console.log(error)
          console.log(status)
      }
    }).done(function(task){
      console.log(task)
      PollState(task.task_id)
    })
    }
    else{
      jQuery('#skpn_status').html("TASK ENDED, PLEASE TRY AGAIN FROM SEARCH PAGE");
    }
  }//runModel

   /*let formatnum = d3.format(",.1%")  */
   var PollState = function(task_id) {
    jQuery.ajax({
     url: prepend_str + skpn_url +  '/poll_corpus_create',
     type: "POST",
     data: "task_id=" + task_id
    }).done(function(task){
     console.log(task);
     if(task.rslt){
     if (task.rslt.progress) {
      var process_percent = task.rslt.progress
      jQuery('#rnlp_bar').css({'width': process_percent + '%'});
      jQuery('#rnlp_bar').html(process_percent + "%")
      jQuery('#rnlp_status').html(task.state);
     } 
    }
     else {
      console.log(task.state)
      if (task.state == "ERROR, TASK ENDED"){
        cancelled = true
      }
      jQuery('#rnlp_status').html(task.state);
     };
     
     // create the infinite loop of Ajax calls to check the state
     // of the current task
     if(task.state == 'SUCCESS'){
      rnlpFinished = true
      jQuery('#rnlp_bar').css({'width': 100 + '%'});
      jQuery('#rnlp_bar').html(100 + '%')
      runModel()
      //window.location.replace('{{ redirect_url }}')
     }
     else{
     if(cancelled == false){
         setTimeout(function(){
            
            PollState(task_id)
          }, 3000);
      }

     }
    }).error(function(error){

      jQuery('#rnlp_status').html("ERROR, TASK ENDED PLEASE RETRY");
    });
   }

   runCorpusCreate()
   //PollState(task_id, model_name);


   var cancelTask = function(){
    cancelled=true
    if (rnlpFinished){
      $.ajax({
      url: prepend_str + skpn_url +"/end_task",
      type: "POST",
      data: {"task_id" : modelTaskId,
            "multi_level" : multiLevel }
    }).done(function(task){
       jQuery('#skpn_status').html(task);
     
    })

    }
    else{
    $.ajax({
      url: "/end_task",
      type: "POST",
      data: "task_id=" + task_id
    }).done(function(task){
       jQuery('#rnlp_status').html(task);
     
    })
  }
   }

   $('#cancel_task').click(cancelTask)

   var modelTaskId;
   var multiLevel = false
   var runModel = function(){
      if (cancelled == false){
      $.ajax({
      url: prepend_str + run_model_url,
      type: "GET",
      error: function (request, status, error) {
          console.log(request.responseText)
          console.log(error)
          console.log(status)
      }
    }).done(function(task){
      if(task == '"File Exists"'){
         window.location.replace(prepend_str + redirect_url.replace(/amp;/g, ""))
      }
      else{
      console.log("starting model")
      console.log(task)
      modelTaskId = task.id;
      if(task.multilevel){
        multiLevel=true
      }
      PollSKPNState(task.id)
    }
    })
    }
    else{
      jQuery('#skpn_status').html("TASK ENDED, PLEASE TRY AGAIN FROM SEARCH PAGE");
    }
  }//runModel



  var PollSKPNState = function(task_id) {
    jQuery.ajax({
     url: prepend_str + skpn_url + "/poll_state",
     type: "POST",
     data: {"task_id" : task_id,
            "multi_level" : multiLevel }
    }).done(function(task){
     if (task.rslt) {
      console.log(task)
      if (task.rslt.progress){
      var process_percent = task.rslt.progress
      jQuery('#skpn_bar').css({'width': process_percent + '%'});
      jQuery('#skpn_bar').html(process_percent + '%')
      jQuery('#skpn_status').html(task.state);
      }
     } 
     else {
      console.log(task.state)
      
      if (task.state == "ERROR, TASK ENDED"){
        jQuery('#skpn_status').html("ERROR, TASK ENDED");
        cancelled = true
      }
      jQuery('#skpn_status').html(task.state);
     };
     if(task.state == 'SUCCESS'){
      setTaskComplete(vis_pk)
     }
     else{
      if(cancelled == false){
         setTimeout(function(){
        
            PollSKPNState(task_id)
          }, 3000);
       }
    
     }
    }).error(function(error){
      jQuery('#skpn_status').html("TASK ENDED, PLEASE RETRY");
    });
   }//pollskpnstate



   var setTaskComplete = function(vis_pk){
    jQuery.ajax({
     url: "/vis_is_complete",
     type: "POST",
     data: {"vis_pk" : vis_pk}
    }).done(function(task){
      jQuery('#skpn_bar').css({'width': 100 + '%'});
      jQuery('#skpn_bar').html(100 + '%')
      window.location.replace(prepend_str + redirect_url.replace(/amp;/g, ""))
    })
   }

   window.onbeforeunload = cancelTask
  });//onwindowload


