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

$('.mouseover').off()
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


  function createRow(doc_info){

  }

  async function doItAll(data=false){
     if(data == false){
      data = await d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk);
      }
      // console.log(data)
      let width = window.innerWidth
      let height = window.innerHeight

      let doc_width = width * 1

      let row_height = 10
      let row_padding = 10
      let max_words = 0
     data.data.forEach(function(d){
        let total_length = 0;
        d.scores.forEach(function(s){
          total_length += s[0]
        })

        d.total_length = total_length
        if (total_length >= max_words){
          max_words = total_length
        }

      })
      console.log(data)
      let xScale = d3.scaleLinear().domain([0, max_words]).range([0, doc_width])

      console.log(xScale(675))
      let colorScale = d3.interpolateRdBu

      d3.select("#content").style("height", height - height * .1)

      d3.select('#corpus').text(data.model_info.corpus)
      d3.select('#dn').text(data.model_info.docs)
      d3.select('#term').text(data.model_info.term)
      d3.select('#stop_words').text(data.model_info.stopwords)
      d3.select('#start').text(data.model_info.ye)
      d3.select('#end').text(data.model_info.ys)


      let svg = d3.select("#content")//.append("svg").attr("id", "the_svg").attr("height", data.data.length * (row_height + row_padding))
      let the_rows = svg.selectAll(".row")
                        .data(data.data)
                        .enter()
                        .append("div")
                        .attr("class", "row doc_row")

                        //.attr("transform", function(d, i){
                         // return "translate(" + 15 + "," + (i * (row_height  + row_padding)) + ")"
                        //})

      the_rows.append("div").attr("class", "col-lg-6 ml-2").append("p").style("font-size", "10px").text(function(d){
        return d.document[2]
      })

      let mouseover = d3.select(".mouseover")

      let the_divs = the_rows.append("div").attr("class", "col-lg-10 ml-2")
      let  the_svgs = the_divs.append("svg").attr("height", row_height + row_padding).attr("width", doc_width).attr("class", "doc_svg")
      the_svgs.selectAll("rect").data(function(doc){
        let prev_x = 0
        let s_i = 0
        let sentences = doc.document[5].split(". ")
        let thing = doc.scores.map(function(d_score){
          d_score.push(prev_x)
          d_score.push(sentences[s_i])
          prev_x = prev_x + xScale(d_score[0]);
          s_i += 1
          return d_score
        })
        return thing
      })
      .enter().append("rect").attr("class", "sent_rect").attr("x", function(d, i){
        return d[2]
      })
      .attr("width", function(d){
        return xScale(d[0])
      })
      .attr("height", function(d){
        return row_height
      })
      .attr("fill", function(d){
        return colorScale(d[1])
      })
      .on("mouseover", function(d, i){
       // $('.mouseover').removeClass('hidden')
            let data = { left: d3.event.pageX, top: d3.event.pageY}
            //$('.mouseover').offset(data)
            //$('.mouseover p').text(d[3])
            mouseover.select("p").text(d[3])
            mouseover.transition()    
                .duration(200)    
                .style("opacity", .8);    
            mouseover
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
      })
      .on("mouseout", function(d){
          mouseover.transition()    
                .duration(500)    
                .style("opacity", 0); 
          //$('.mouseover').addClass('hidden')
      })
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