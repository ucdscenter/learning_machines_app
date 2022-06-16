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

  let lineGraphHeight = 100
	let screenHeight = window.innerHeight;
	let middleWidth = $('#svg-div').width();
  let padding = { top : 15, bottom : 15, left : 15, right : 15}
	let params = getJsonFromUrl(window.location.search)
  var x;
  var y;
  var line;
  var dateParse = d3.timeParse('%Y-%m-%d')
  var dateFormat = d3.timeFormat('%Y-%m-%d')
  var sorted
 
  doItAll()

  async function doItAll(data=false){
  if(data == false){
    data = await d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk);
  }
  console.log(data)
  let model_info = data.model_info;
  data = data.data

	$('#loading_show').addClass("hidden")
  $('#svg-div').removeClass("hidden")

  let metaData = d3.csvParseRows(data.metadata);
  console.log(metaData)
  let term = model_info.term
  term = term.slice(1)
  console.log(model_info)
    function undefined_fixer(info){
    if (info == undefined){
      return ""
    }
    else{
      return info
    } }
    $('#corpus').text(undefined_fixer(model_info.corpus))
    $('#term').text(undefined_fixer(model_info.term))
   // $('#topics').text(undefined_fixer(model_info.num_topics))
    $('#stop_words').text(undefined_fixer(model_info.stopwords).replace("-", ","))
    $('#start').text(undefined_fixer(model_info.ys))
    $('#end').text(undefined_fixer(model_info.ye))
    $('#dn').text(undefined_fixer(metaData.length))

  
  
  let xExt = d3.extent(Object.keys(data.dict_data), function(d){
    return data.dict_data[d].proj[0];
  })
  let yExt = d3.extent(Object.keys(data.dict_data), function(d){
    return data.dict_data[d].proj[1];
  })
	let xScale = d3.scaleLinear().domain(xExt).range([0 + padding.left, middleWidth - padding.right])

  let yScale = d3.scaleLinear().domain(yExt).range([0 + padding.top, middleWidth - padding.bottom])

  let cMax = d3.max(Object.keys(data.dict_data), function(d){
    return data.dict_data[d].cluster
  })

	let svg_div = d3.select("#svg-div")



	let svg = svg_div
				.append("svg")
				.attr("height", screenHeight - lineGraphHeight)
				.attr("width", middleWidth)
        .attr("id", "the_svg")
				.style("background-color", "white")

  let svg_g = svg.append("g")
  svg_g.append("rect")
          .attr("height", screenHeight + 500)
          .attr("width", middleWidth + 500)
          .style("fill", "white")
          .attr("x", -200)
          .attr("y", -200)
          .attr("id", "bgclickbox")

          .on("click", function(d){
            d3.select(".selected").classed("selected", false)
            d3.selectAll(".mouseover").classed("mouseover", false).classed("circleo", true)
            d3.selectAll(".notclusterclick").classed("circlec", true).classed("notclusterclick", false)
            d3.selectAll(".clusterclick").classed("circlec", true).classed("clusterclick", false)
            d3.selectAll('.groupg' + dblclickedGroup)
              .select("text")
              .classed("hidden", true)

             d3.select(".line").remove()
            d3.select(".line-in-g").append("path").data([sorted])
            .classed("line", true)
            .style("stroke", 'steelblue')
            .attr("d", line);

            d3.select('#wordsimstable-div').classed("hidden", true)
            d3.select('#clustertable-div').classed("hidden", false)
            d3.selectAll('.simsclick').classed("simsclick", false)
            d3.selectAll('.notsimsclick').classed("notsimsclick", false)
            d3.select('#wordg-' + clickedNode).select("circle").classed("mouseover", false).classed("circleo", true)
            d3.select('#wordg-' + clickedNode).select("text").classed("hidden", true)
            if(clickedNode){
              data.dict_data[clickedNode].sims.forEach(function(w){
              d3.select('#wordg-' + w[0]).select("circle").classed("mouseover", false).classed("circleo", true)
              d3.select('#wordg-' + w[0]).select("text").classed("hidden", true)
                clickedNode = null;
              })
            }
            dblclickedGroup = null
            clickedNode = null
            /*if(dblclickedGroup == null){
            if(clickedNode != null){
               
              }) 
            }
          }*/
          })

  let colorRange =  d3.interpolateViridis
  let circlegs = svg_g.selectAll(".circleg")
                    .data(Object.keys(data.dict_data))
                    .enter()
                    .append("g")
                    .attr("transform", function(d){
                      return  "translate("  + xScale(data.dict_data[d].proj[0]) + ", " + yScale(data.dict_data[d].proj[1]) + ")"
                    })
                    .attr("id", function(d){
                      return "wordg-" + d
                    })
                    .attr("class", function(d){
                      return "cirgleg default groupg" + data.dict_data[d].cluster;
                    })
                    
circlegs.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", function(d){
              return 3
              //return data.dict_data[d].count
            })
            .style("fill", function(d){
              return colorRange(data.dict_data[d].cluster/cMax)
            })
            .style("stroke-width", 1.5)
            .attr("class", "circleo circlec")
circlegs.append("text")
        .text(function(d){
          return d
        })
        .style("stroke","white")
        .style("stroke-width", .5)
        .style("font-size", 15)
        .style("cursor", "default")
        .classed("hidden", true)

let clickedNode = null
let dblclickedGroup = null

let clickCount = 0
circlegs.on("click", function(d){
  clickCount++;
  let that = this

  if(dblclickedGroup == null){
    
    if (clickedNode == d){
      d3.selectAll(".default").classed("notsimsclick", false)
      d3.select(that).classed("simsclick", false).classed("circleo", true)
      d3.select(that).select("text").classed("hidden", true)

      data.dict_data[d].sims.forEach(function(w){
      d3.select('#wordg-' + w[0]).classed("simsclick", false).classed("circleo", true)
      d3.select('#wordg-' + w[0]).select("text").classed("hidden", true)
      })
      clickedNode = null
    }
    else {
      d3.selectAll(".default").classed("notsimsclick", true)
      if(clickedNode != null){
        d3.select('#wordg-' + clickedNode).classed("simsclick", false).classed("circleo", true)
        d3.select('#wordg-' + clickedNode).select("text").classed("hidden", true)

        data.dict_data[clickedNode].sims.forEach(function(w){
        d3.select('#wordg-' + w[0]).classed("simsclick", false).classed("circleo", true)
        d3.select('#wordg-' + w[0]).select("text").classed("hidden", true)
      })
      }

      d3.select(that).classed("simsclick", true).classed("circleo", false).classed("notsimsclick", false)
      d3.select(that).select("text").classed("hidden", false)
      d3.select(that).moveToFront()
      data.dict_data[d].sims.forEach(function(w){
        d3.select('#wordg-' + w[0]).classed("simsclick", true).classed("circleo", false).classed("notsimsclick", false)
        d3.select('#wordg-' + w[0]).select("text").classed("hidden", false)
      })
      clickedNode = d
      renderWordSimsTable(data.dict_data[d].sims, d)
      
    }
    clickCount = 0
  }

  
})

circlegs.on("mouseover", function(d){
  if (clickedNode == null && dblclickedGroup == null){
    d3.select(this).select("circle").classed("mouseover", true).classed("circleo", false)
    d3.select(this).select("text").classed("hidden", false).style("font-size", 25 / k)
    d3.select(this).moveToFront()
    //renderWordSimsTable(data.dict_data[d].sims, d)
    renderDocsTable(d)
  }
  else {
    if (clickedNode != null){
      d3.select(".row_" + d).classed("selected", true)
    }
    if (d3.select(this).classed('simsclick') || d3.select(this).classed("groupg" + dblclickedGroup)){
      renderDocsTable(d)
    }
    d3.select(this).select("text").style("font-size", 25 / k)
    d3.select(this).moveToFront()
  }
})
circlegs.on("mouseout", function(d){
  if (clickedNode == null && dblclickedGroup == null){
    d3.select(this).select("circle").classed("mouseover", false).classed("circleo", true)
    d3.select(this).select("text").classed("hidden", true).style("font-size", 15 / k)
  }
  else {
    if (clickedNode != null){
      d3.select(".row_" + d).classed("selected", false)
    }

    d3.select(this).select("text").style("font-size", 15 / k)
    d3.select(this).moveToFront()
  }
})


/*circlegs.on("dblclick", function(d){

  d3.select("#bgclickbox").dispatch("dblclick")
  let c = data.dict_data[d].cluster;
  dblclickedGroup = c
  d3.selectAll(".notclusterclick").classed("circlec", true).classed("notclusterclick", false)
  d3.selectAll(".clusterclick").classed("circlec", true).classed("clusterclick", false)
  d3.selectAll(".circlec").classed("notclusterclick", true).classed("circlec", false)
  d3.selectAll(".groupg" + c)
    .select("circle")
    .classed("clusterclick", true)
    .classed("notclusterclick", false)
  d3.selectAll('.groupg' + c)
      .select("text")
      .classed("hidden", false)
  clickCount = 0
  d3.select("#crow-" + c).classed("selected", true)
})*/

var zoom = d3.zoom()
    .scaleExtent([.1, 40])
    .translateExtent([[-100, -100], [middleWidth + 90, middleWidth + 100]])
    .on("zoom", zoomed);

svg.call(zoom).on("dblclick.zoom", null);
let old = 1
let k = 1
function zoomed() {
  k = d3.event.transform.k
  svg_g.attr("transform", d3.event.transform);
  if(d3.event.transform.k != old){
     //gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  circlegs.selectAll("circle").attr("r", function(d){
    return 3 /  d3.event.transform.k
  })
  circlegs.selectAll("circle").style("stroke-width", function(d){

      return 1.5 /  d3.event.transform.k

  })
  circlegs.selectAll("text").style("font-size", function(d){
    return 15/d3.event.transform.k;
  })
  circlegs.selectAll("text").style("stroke-width", function(d){
    return .5/d3.event.transform.k;
  })
  old = d3.event.transform.k
  }
 

}

function resetted() {
  svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
}
render_search();


function render_search(){

$( "#words" ).autocomplete({
        delay: 100,
        minLength: 1,
        appendTo: '#searchdd',
        source: Object.keys(data.dict_data),
        response: function(event, ui){
            },
        select: function(event, ui){
          console.log(event)
              $('#bgclickbox').dblclick()
              console.log(ui.item.value)
              console.log($('#wordg-' + ui.item.value))
              d3.select('#wordg-' + ui.item.value).dispatch("click")
        },
        close: function(event, ui){     
        }
        });

}//render_search


function renderClusterTable(d_data){
  let keys = Object.keys(d_data)

  let clustersData = []

  keys.forEach(function(d){
    let inThere = false
    clustersData.forEach(function(c){
      if (c.cluster == d_data[d].cluster){
        c.size += 1;
        for(var i=0; i < c.top_words.length; i++){

          if (c.top_words[i][1] < d_data[d].count){
            c.top_words.splice(i, 0, [d, d_data[d].count])
            i = c.top_words.length
          }
        }
        if(c.top_words.length < 5){
          c.top_words.push([d, d_data[d].count])
        }
        c.top_words = c.top_words.slice(0, 5)
        inThere = true
      }

    })
    if (!inThere){
      clustersData.push({
        cluster : d_data[d].cluster,
        size : 1,
        top_words : [[d, d_data[d].count]]
      })
    }
  })


 let ctable =  d3.select("#clustertable").select("tbody")
 let cdiv = d3.select("#clustertable-div").style("height", screenHeight).style("overflow", "auto")

  let crows = ctable.selectAll("tr")
                .data(clustersData)
                .enter()
                .append("tr")
                .style("cursor", "pointer")
                .style("background-color", function(d){
    let rgbObj = hexToRgb(colorRange(d.cluster/cMax));
    return "rgb(" + rgbObj.r  + "," + rgbObj.g + "," + rgbObj.b + ", .5)";
  }).on("click", function(d){
  d3.select('#bgclickbox').dispatch('click')
  dblclickedGroup = d.cluster
  d3.selectAll(".notclusterclick").classed("circlec", true).classed("notclusterclick", false)
  d3.selectAll(".clusterclick").classed("circlec", true).classed("clusterclick", false)
  d3.selectAll(".circlec").classed("notclusterclick", true).classed("circlec", false)
  d3.selectAll(".groupg" + d.cluster)
    .select("circle")
    .classed("clusterclick", true)
    .classed("notclusterclick", false)
  d3.selectAll('.groupg' + d.cluster)
      .select("text")
      .classed("hidden", false)
  clickCount = 0
  d3.select("#crow-" + d.cluster).classed("selected", true)
  d3.select(this).classed("selected", true)
}).attr("id", function(d){
  return "crow-" + d.cluster
})

let ctd = crows.selectAll("td").data(function(d,i){
  return [d.cluster, d.size, d.top_words]
}).enter().append("td").text(function(d,i){
  if (i == 2){
    let x = ""
    d.forEach(function(w){
      x = x + " " + w[0] + "-" + w[1] + ","

    })
    return x
  }
  return d
})


crows.sort(function(a,b){
      return b.size - a.size
    })
return clustersData
}//renderClusterTable

let cdata = renderClusterTable(data.dict_data)
renderTimeLine(cdata);

function renderDocsTable(word){
  let rowTracker = 0
  d3.selectAll("#word-label").text(word)
  let wordData = []
  var wordDocsfiltered = {}
  let wordDateMax = 1
  d3.select("#docstable")
    .select("tbody")
    .selectAll("tr").remove()

  d3.select("#docstable-div").style("height", screenHeight / 2).style("overflow", "auto")
  data.word_top_docs[word].forEach(function(d){
    wordData.push(metaData[d])
      if (wordDocsfiltered[metaData[d][6]] != undefined){
          wordDocsfiltered[metaData[d][6]].count += 1
          if(wordDateMax < wordDocsfiltered[metaData[d][6]].count){
            wordDateMax = wordDocsfiltered[metaData[d][6]].count
          }
      }
      else{
          wordDocsfiltered[metaData[d][6]] = {
            'count' : 1,
            'time' : dateParse(metaData[d][6])
          }
      }
  })

  wordDocsfiltered = Object.values(wordDocsfiltered).filter(function(d){
        if (d.time == undefined){
          return false
        }
        return true
  })
  let color = 'steelblue'//colorRange(lineData[0].cluster/cMax)
  wordDocsfiltered = wordDocsfiltered.sort(function(a,b){
    return a.time.getTime() - b.time.getTime()
  })

  d3.select(".line").remove()
  d3.select(".line-in-g").append("path").data([wordDocsfiltered])
    .classed("line", true)
    //.classed("line" + lineData[0].cluster, true)
    .style("stroke", color)
    .attr("d", line);
  
  
  let dtbody = d3.select("#docstable")
                  .select("tbody")
  let dtrows = dtbody.selectAll("tr").data(wordData).enter().append("tr")
    .on("click", function(d){
      d3.selectAll('.docselected').classed('docselected', false)
      d3.select(this).classed("docselected", true)
      renderDoc(d[1], d[8]);
    })
    .classed("docsrow", true)

  let dtd = dtrows.selectAll("td").data(function(d,i){
    return [d[1], d[3], d[6]]
  }).enter()
  .append("td").text(function(d){
    return d;
  })

  $(d3.selectAll('.docsrow').nodes()[rowTracker]).trigger("click")
  

}


async function renderDoc(title, doc_id){
    d3.select("#docdiv").style("height", screenHeight / 2).style("overflow", "auto")
    var doc_response = await d3.json("/searcher/get_doc?database=" + model_info.corpus + "&doc_id=" + doc_id );
    d3.select('#doc-contents').text(doc_response.data.replace("<PubmedArticle>", "").replace('</PubmedArticle>',''))
    d3.select('#doc-title').text(doc_response.summary.article_title)
  
}

function renderWordSimsTable(word_sims, word){
  d3.select("#wordsimstable").select('tbody').selectAll("tr").remove()
  d3.select("#clustertable-div").classed("hidden", true)
  d3.selectAll(".selected-word").text("Selected word: " + word )
   
  let cdiv = d3.select("#wordsimstable-div").style("height", screenHeight).style("overflow", "auto")
  d3.select("#wordsimstable-div").classed("hidden", false)

  let numFormat = d3.format('.5f')

  let wtbody = d3.select("#wordsimstable").select("tbody")

  let wtrows = wtbody.selectAll("tr").data(word_sims)
                  .enter().append("tr")
                  .style("cursor", "pointer")
                  .on("click", function(d){
                      d3.select("#wordg-" + d[0]).dispatch("click")
                  })
                  .on("mouseover", function(d){
                    d3.select('#wordg-' + d[0]).dispatch("mouseover")
                  })
                  .on("mouseout", function(d){
                    d3.select('#wordg-' + d[0]).dispatch("mouseout")
                  }).attr("class", function(d){
                    return 'row_' + d[0]
                  })

  let wtcells = wtrows.selectAll("td").data(function(d, i){
    return d;
  }).enter().append("td").text(function(d){
    if (typeof(d) == 'string'){
      return d
    }
    return numFormat(d);
  })
  renderDocsTable(word)

}//renderWordSimsTable


function renderTimeLine(clusterD){

  let padding = {top : 10, bottom : 10, right : 10, left : 40}
  let lineGraph = d3.select("#svg-div")
                    .append("svg")
                    .attr("id", "line-svg")
                    .attr("height", lineGraphHeight)
                    .attr("width", middleWidth)
                    .style("background-color", "white")

  let clusterDateMax = 1
  let docTimeCountD = {}
  var timeExt = d3.extent(metaData, function(d){
    if (docTimeCountD[d[6]] != undefined){

          docTimeCountD[d[6]].count += 1

          if(clusterDateMax < docTimeCountD[d[6]].count){
            clusterDateMax = docTimeCountD[d[6]].count
          }
      }
      else{
          docTimeCountD[d[6]] = {
            //'cluster' : cluster.cluster,
            'count' : 1,
            'time' : dateParse(d[6])
          }
      }
    return dateParse(d[6])
  })


  x = d3.scaleTime().range([0, middleWidth - (padding.left + padding.right)]).domain(timeExt)
  console.log(lineGraphHeight - (padding.top + padding.bottom))
  y = d3.scaleLinear()
    .range([padding.bottom, lineGraphHeight - (padding.top + padding.bottom)])
    .domain([clusterDateMax, 0])

  lineGraph.append("g")
      .attr("transform", "translate(" + padding.left + "," + (lineGraphHeight  - (padding.top + padding.bottom)) + ")")
      .attr("class", 'time-x-axis')
      .call(d3.axisBottom(x));

  lineGraph.append("g")
      .attr("transform", "translate(" + padding.left + "," + 0 + ")")
      .attr("class", 'time-y-axis')
      .call(d3.axisLeft(y).ticks(4));

  line = d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.count); })
      .curve(d3.curveMonotoneX);

  let lineg = lineGraph.append("g")
        .attr('transform', 'translate(' + padding.left + ',' + 0 + ')')
        .attr("class", "line-in-g")

  let filtered = Object.values(docTimeCountD).filter(function(d){
        if (d.time == undefined){
          return false
        }
        return true
  })
  let color = 'steelblue'//colorRange(lineData[0].cluster/cMax)
  sorted = filtered.sort(function(a,b){
    return a.time.getTime() - b.time.getTime()
  })
  lineg.append("path").data([sorted])
    .classed("line", true)
    //.classed("line" + lineData[0].cluster, true)
    .style("stroke", color)
    .attr("d", line);

  lineg.append("circle")
      .attr("id", 'doc_circle')
      .classed("hidden", true)
      .attr("cx", 10)
      .attr("cy", y(1))
      .attr("r", 3)
      .style("stroke", 'red')
      .style("stroke-width", .5)
      .style("fill", "black")

}//renderTimeLine


$( window ).resize(function() {
  middleWidth = $('#svg-div').width();
  screenHeight = window.innerHeight;
  d3.select("#the_svg")
    .attr("height", screenHeight - lineGraphHeight)
    .attr("width", middleWidth)

  d3.select('#bgclickbox').attr("height", screenHeight + 500).attr("width", middleWidth + 500)
  d3.select("#clustertable-div").style("height", screenHeight)
  d3.select("#docdiv").style("height", screenHeight / 2)
  d3.select("#wordsimstable-div").style("height", screenHeight)

  })
  $(window).resize()
}//doItAll

}//wrapper

wrapper()