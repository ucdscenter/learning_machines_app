
function LDAvis_load_lib(url, callback){
  var s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.onreadystatechange = s.onload = callback;
  s.onerror = function(){console.warn("failed to load library " + url);};
  document.getElementsByTagName("head")[0].appendChild(s);
}


function getJsonFromUrl(hashBased) {
  var query;
  if(hashBased) {
    var pos = location.href.indexOf("?");
    if(pos==-1) return [];
    query = location.href.substr(pos+1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]",from);
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}
let params = getJsonFromUrl(window.location)
console.log(window.location.search)
/*
$(document).attr('title', "pyldaModel : " + params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1))
    console.log(params)
    function undefined_fixer(info){
    if (info == undefined){
      return ""
    }
    else{
      return info
    } 
  };
    $('#corpus').text(undefined_fixer(params.corpus))
    $('#term').text(undefined_fixer(params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1)))
    $('#topics').text(undefined_fixer(params.num_topics))
    $('#stop_words').text(undefined_fixer(params.stop_words).replace("-", ","))
    $('#start').text(undefined_fixer(params.ys))
    $('#end').text(undefined_fixer(params.ye))
    $('#dn').text(undefined_fixer(params.dn))

*/

function doItAll(){

  function undefined_fixer(thing){
    return thing
  }

  d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk, function(error, data){
    console.log(data)
    var model_info = data.model_info

     $('#corpus').text(undefined_fixer(model_info.corpus))
    $('#term').text(undefined_fixer(model_info.term))
    $('#topics').text(undefined_fixer(model_info.topics))
    $('#stop_words').text(undefined_fixer(model_info.stopwords).replace("-", ","))
    $('#start').text(undefined_fixer(model_info.ys))
    $('#end').text(undefined_fixer(model_info.ye))
    $('#dn').text(undefined_fixer(model_info.docs))
    ldavis_el_data = JSON.parse(data.data)
    console.log(ldavis_el_data)
    $('#loading_show').addClass("hidden")
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ldavis_el_data));

    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download",  "pylda_" + params.q_pk + ".json");


    if(typeof(LDAvis) !== "undefined"){
       // already loaded: just create the visualization
       !function(LDAvis){
           new LDAvis("#" + "ldavis_el", ldavis_el_data);
       }(LDAvis);
    }else if(typeof define === "function" && define.amd){
       // require.js is available: use it to load d3/LDAvis
       require.config({paths: {d3: "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min"}});
       require(["d3"], function(d3){
          window.d3 = d3;
          LDAvis_load_lib("/static/pylda_static/pylda.js", function(){
            new LDAvis("#" + "ldavis_el", ldavis_el_data);
          });
        });
    }else{

        // require.js not available: dynamically load d3 & LDAvis
        LDAvis_load_lib("https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js", function(){
             LDAvis_load_lib("/static/searcher/pyldavis.js", function(){
                     new LDAvis("#" + "ldavis_el", ldavis_el_data);
                })
             });
    }
  })//d3.json
}//doItAll




//var getstr = "/load/create_formatted/?model=" +  params.model + "&method=" + params.method;

doItAll()
/*
d3.json(getstr, function(error, pylda_id){
      if(error) return console.warn(error);
      console.log(pylda_id)
      doItAll()
      if (pylda_id == "File Exists"){
        console.log("IM RIGHT HERE")
        doItAll()
      }

      else{
        //console.log(mlmom_id.task_id)
        //let mlmom_status = await d3.json("/load/poll_task?task_id=" + mlmom_id.task_id)
        //console.log(pylda_status)
       // pollTask(pylda_id.task_id)
      } 
     
})
*/

   


function pollTask(id){

  d3.json("/load/poll_task?task_id=" + id, function(error, mlmom_status){
    if (error) return console.warn(error);

    if (mlmom_status.state == "SUCCESS"){
      doItAll();
    //return mlmom_status.rslt
  }
  else {
    setTimeout(function(){
      pollTask(id)
    }, 1000)
    }
  })
};


