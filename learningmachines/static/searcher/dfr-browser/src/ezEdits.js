
//from https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
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



params = getJsonFromUrl(window.location)
/*if(params.model == undefined){
  $(document).attr('title', "dfrModel : AA")
$("#model-name").text("dfrModel : Lindsay")
$("#dfr-download-btn").attr("href", "download_dfr?model=")

$('#term').text("Lindsay")
$('#topics').text("Lindsay")
$('#tfidf').text("Lindsay")
$('#passes').text("Lindsay")


VIS.files.endpoint = "/static/multi-level-lda/multi_model_data/dfr_lindsay.json"
}
else{
*/
/*$(document).attr('title', "dfrModel : " + params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1))
$("#model-name").text("dfrModel : " + params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1))
$("#dfr-download-btn").attr("href", "download_dfr?model=" + params.model)

   console.log(params)
    function undefined_fixer(info){
    if (info == undefined){
      return ""
    }
    else{
      return info
    } }
    $('#corpus').text(undefined_fixer(params.corpus))
    $('#term').text(undefined_fixer(params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1)))
    $('#topics').text(undefined_fixer(params.num_topics))
    $('#stop_words').text(undefined_fixer(params.stop_words).replace("-", ","))
    $('#start').text(undefined_fixer(params.ys))
    $('#end').text(undefined_fixer(params.ye))
    $('#dn').text(undefined_fixer(params.dn))

*/

VIS.files.endpoint = "/load/None"
//}
$(document).ready(function(){
  let thing = window.location.hash.split("/")[1]
  console.log(thing)

  $('#nav_' + thing + ' .nav-link').addClass("nav-page-disp")

  $('.nav-item').click(function(d){
    $('.nav-page-disp').removeClass("nav-page-disp")
    console.log(d)
    $(d.target).addClass("nav-page-disp")
  })
  $("#new-main-container").css("min-height", window.innerHeight * .9)
})

