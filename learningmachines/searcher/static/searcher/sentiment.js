'use strict'


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

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

async function wrapper(){
  $(function () {
      $('[data-toggle="popover"]').popover()
  })
  let screenHeight = window.innerHeight;

  let lineGraphHeight = 100
  let middleWidth = $('#svg-div').width();
  let padding = { top : 15, bottom : 15, left : 15, right : 15}
  let params = getJsonFromUrl(window.location.search)


  var x;
  var dateParse = d3.timeParse('%Y-%m-%d')
  var dateFormat = d3.timeFormat('%Y-%m-%d')


  doItAll()

  async function doItAll(data=false){
     if(data == false){
      data = await d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk);
      }
      console.log(data)

      d3.select("#content").append("p").text(data.data)

  }

  $( window ).resize(function() {
  /*middleWidth = $('#svg-div').width();
  screenHeight = window.innerHeight;
  d3.select("#the_svg").attr("height", screenHeight - lineGraphHeight).attr("width", middleWidth)
  d3.select('#bgclickbox').attr("height", screenHeight + 500).attr("width", middleWidth + 500)
  d3.select("#clustertable-div").style("height", screenHeight)
  d3.select("#docdiv").style("height", screenHeight / 2)
  d3.select("#wordsimstable-div").style("height", screenHeight)
  */
  })
  $(window).resize()


}

wrapper()