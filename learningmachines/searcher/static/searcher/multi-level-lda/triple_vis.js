'use strict'


String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
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

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

 function topNwords(wordsstr, n=5){
    let words = wordsstr.split('" + ');
    let splitw = ""
    for(var i = 0; i < n; i++){
      splitw = splitw + "\n" + words[i].split("*")[1].slice(1)
    }
    return splitw;
  }

function formatData(data, topicSim){

	var cMax = d3.max(data, function(d){
		var max = 0
		d.clusters.forEach(function(t){if(t > max){max = t}})
		return max
	})
	var xMin = d3.min(data, function(d){
		let min = 100000
		d.locations.forEach(function(t){if(t[0] < min){min = t[0]}})
		return min
	})
	var xMax = d3.max(data, function(d){
		let max = -100000
		d.locations.forEach(function(t){if(t[0] > max){max = t[0]}})
		return max
	})
	var yMin = d3.min(data, function(d){
		let min = 100000
		d.locations.forEach(function(t){if(t[1] < min){min = t[1]}})
		return min
	})
	var yMax = d3.max(data, function(d){
		let max = -100000
		d.locations.forEach(function(t){if(t[1] > max){max = t[1]}})
		return max
	})
	var tMax = d3.max(data, function(d){
		let max = -100000
		d.topic_weights.forEach(function(w){
			if(w > max){
				max = w;
			}
		})
		return max
	})
	topicMax = tMax
	function getshape(d){if(d == 0){return "ellipse"}if(d == 1){return "rectangle"}if(d == 2){return "triangle"}
	}

	let xRange = [xMin, xMax]
	let yRange = [yMin, yMax]

	let xScale = d3.scalePow().domain(xRange).range([-500, 500])
	let yScale = d3.scalePow().domain(yRange).range([-500, 500])

	let graphObj = {};

	graphObj.nodes = []
	graphObj.clusters = []
	graphObj.edges = topicSim.links.map(function(d){
		return {data:{ id: d.id, source: d.source, target: d.target, weight: d.weight }}
	})

	for(var i = 0; i < data.length; i++){
		for(var j = 0; j < data[i].clusters.length; j++){
			let s = 30 * (data[i].topic_weights[j]/tMax)
			if(s < 3){
				s = 3
			};
			let nodeId = "m" + i + ":" + j

			var colorNum

			colorNum = data[i].clusters[j]/cMax

			graphObj.nodes.push({
				data : {
					id : nodeId,
					class : "topic " + "cluster" + data[i].clusters[j],
					cluster : data[i].clusters[j],
					color : d3.interpolateViridis(colorNum),
					size : s,
					label : topNwords(data[i].top_words[j]),
					type : getshape(data[i].level),
					topic : data[i].docs[j]
				},
				position : {
					x : xScale(data[i].locations[j][0]),
					y : yScale(data[i].locations[j][1])
				}
			})
			
		}
	}

		let clusterNodes = {};
		let modelI = 0
		data.forEach(function(model){
			let topicI = 0


			model.clusters.forEach(function(c){
				let g = topNwords(data[modelI].top_words[topicI])
				let labelArr = []
				let docscount = [0,0]

				docscount[model.level] = model.docs[topicI].length
				g = g.split("\n")
				g.shift()
				if (clusterNodes[c] == undefined){
					g.forEach(function(w){
						labelArr.push([w, 1])
					})
					clusterNodes[c] = {
					"size" : 1,
					"indexes" : [[modelI, topicI]],
					"lwords" : labelArr,
					"docsCount" : docscount
					}
				}
				else{
					g.forEach(function(w){
						let exists = false;
						clusterNodes[c].lwords.forEach(function(l){
							if(l[0] == w){
								l[1]++
								exists = true
							}
						})
						if(exists == false){
							clusterNodes[c].lwords.push([w, 1])
						}
					})
					
					clusterNodes[c].size++;
					clusterNodes[c].indexes.push([modelI, topicI]);
					clusterNodes[c].docsCount[model.level] += docscount[model.level];
				}
				topicI++
			})
			modelI++
		})

		Object.keys(clusterNodes).forEach(function(key){
			
			clusterNodes[key].lwords.sort(function(a,b){
				return b[1] - a[1]
			})
			let labelstr = ""
			for(var i = 0; i < 5; i++){
				labelstr = labelstr + "\n" + clusterNodes[key].lwords[i][0]
			}
			
			graphObj.clusters.push({
				data : {
					id : key,
					size : clusterNodes[key].size,
					color : d3.interpolateViridis(key/cMax),
					label : labelstr,
					subtopics : clusterNodes[key].indexes,
					docsCount : clusterNodes[key].docsCount,
					collapsed : true,
				}
			})
		})
		return graphObj
}



function formatTreeData(data, mdata){
	let graphObj = {children : [], name : "model"};
	data.clusters.forEach(function(c){

			graphObj.children.push({
				name : c.data.label,
				children : [],
				cluster : c.data.id,
				color : c.data.color,
				score : c.data.size
			})
			c.data.subtopics.forEach(function(topc){
				graphObj.children[graphObj.children.length - 1].children.push(
				{
					topic : topc,
					cluster : c.data.id,
					color : c.data.color,
					name : topNwords(mdata[topc[0]].top_words[topc[1]], 5),
					children : mdata[topc[0]].top_words[topc[1]].split('" + ').slice(0, 10).map(function(d){
						return { 
							name : d, 
							topic : topc,
							cluster : c.data.id,
							color : c.data.color,
							children : []}
					}),
					score : mdata[topc[0]].topic_weights[topc[1]]
				})
			})
		})
	return graphObj
}

function formatCircleData(data){

	let thingData = []

	let clusterDicts = []

	let allwscores = []

	let wscorecutoff = 0
	data.children.forEach(function(firstchild){
		firstchild.children.forEach(function(secondchild){
			secondchild.children.forEach(function(lastchild){
				let wscore = parseFloat(lastchild.name.split('*')[0].trim())
				allwscores.push(wscore)
			})
		})
	})

	allwscores = allwscores.sort(function(a,b ) { return b-a})

	if(allwscores.length > 250){
		wscorecutoff = allwscores[250]
		for(var j = 250; j > 0; j--){
			if(allwscores[j] != wscorecutoff){
				wscorecutoff = allwscores[j]
				j = 0;
			}
		}
		//wscorecutoff = allwscores[249]
	}
	data.children.forEach(function(firstchild){
		let clusterChildren = {}
		firstchild.children.forEach(function(secondchild){
			
			secondchild.children.forEach(function(lastchild){
				let wscore = parseFloat(lastchild.name.split('*')[0].trim())
				if(wscore > wordMax){
					wordMax = wscore
				}
				//console.log(lastchild.name)

      			let wname = lastchild.name.split('*')[1].replace(/"/g, '').replace(/\s/g, "")
      			if(clusterChildren[wname] == undefined){
      				clusterChildren[wname] = {
      					"score" : wscore,
      					"imports" : [], 
      					"cluster" : lastchild.cluster,
      					"color" : lastchild.color,
      					"topic" : [lastchild.topic], 
      					"name" : data.name + "." + firstchild.name + "." + wname,
      					"shortname" : wname}
      			}
      			else{
      				clusterChildren[wname].score += wscore
      				clusterChildren[wname].topic.push(lastchild.topic)
      			}
			})
			
		})
		clusterDicts.push(clusterChildren)
		Object.keys(clusterChildren).forEach(function(k){
			if(clusterChildren[k].score > cwordMax){
				cwordMax = clusterChildren[k].score;
			}
			if(clusterChildren[k].score > wscorecutoff){
				thingData.push(clusterChildren[k])
			}
			
			
		})
	})

	thingData.forEach(function(w){
		clusterDicts.forEach(function(cl){
			if(cl[w.shortname] != undefined){
				if(cl[w.shortname].score > wscorecutoff){
					w.imports.push(cl[w.shortname].name)
				}
				
			}
		})
	})
	return thingData
/*
function findAndAddLinks(treeName, labelName){
  data.children.forEach(function(firstchild){
    firstchild.children.forEach(function(secondchild){
    	let w = 0
      secondchild.children.forEach(function(lastchild){
      	if (w < labelCount){
      		if(lastchild.name == labelName){
          lastchild.imports.push(treeName)
        }
        w++
      	}

      })
    })
  })
}

data.children.forEach(function(firstchild){
  firstchild.children.forEach(function(secondchild){

    secondchild.children.forEach(function(lastchild){
    	if (parseFloat(lastchild.name.split('*')[0].trim()) > wordMax){
    		wordMax = parseFloat(lastchild.name.split('*')[0].trim())
    	}

    		 lastchild.score = lastchild.name.split('*')[0]
      lastchild.name = lastchild.name.split('*')[1].replace(/"/g, '').replace(/\s/g, "")
      lastchild.imports = []


     
        })
  })
})

data.children.forEach(function(firstchild){
  firstchild.children.forEach(function(secondchild){
  	let w = 0
    secondchild.children.forEach(function(lastchild){
    	if(w < labelCount){
    		 let fulltree = data.name + "." + firstchild.name + "." + secondchild.name + '.' + lastchild.name;
        	let name = lastchild.name
        	findAndAddLinks(fulltree, name)
        	w++
    	};
       
        })
  })
})



let thingData = []

data.children.forEach(function(firstchild){
  firstchild.children.forEach(function(secondchild){
  	let w = 0
    secondchild.children.forEach(function(lastchild){
    	if(w < labelCount){
    		  thingData.push({ name : "model." + firstchild.name + "." + secondchild.name + "." + lastchild.name,
                       imports : lastchild.imports,
                       color : lastchild.color,
                   		score : lastchild.score,
                   		cluster : lastchild.cluster,
                   		topic : lastchild.topic})
    		w++;
    	}
    
        })
  })
})
	return thingData*/
}


function clusterSelect(clusterData){
	console.log(clusterData)
	handleClusterDocsTable(clusterData)


	d3.selectAll(".cluster" + clusterData.id).classed("cselected", true)

	let j = networkGraph.elements("node[cluster = " + clusterData.id + "]")
	j.style({
		"border-color" : "#ffa500",
		"border-width" : 3
	})
 	networkGraph.animate({
			fit: {
			    eles: j,
			    padding: 40
			  }
			}, {
			  duration: 500
			});

}
var prev;
function hierarchyTopicSelect(topic){
	deselectAll();
	if(prev != undefined){
		prev.style('border-color', prev._private.data.color)
	}

	let j = networkGraph.getElementById("m" + topic[0] + ":" + topic[1]);
	j.style('border-color', 'red')
	prev = j
	d3.selectAll(".m" + topic[0] + "-" + topic[1]).classed("selected", true)
	topicSelect(j._private.data)

}

function deselectAll(){
	d3.selectAll(".cselected").classed("cselected", false)
	d3.selectAll(".selected").classed("selected", false)
	networkGraph.elements("node").style({
		"border-color" : "black",
		"border-width" : .5
	})
}


function topicSelect(topicData){
	handleClusterDocsTable(topicData)
	let jj = networkGraph.elements("node[cluster = " + topicData.cluster + "]")
	//todo : add network refitting on first click
 	networkGraph.animate({
			fit: {
			    eles: jj,
			    padding: 40
			  }
			}, {
			  duration: 500
			});

}
/*UNIVERSAL DATA*/
var labelCount = 5;
let once = true
var modelsData;
var metaData;
var topicSimdata;
var params
var networkGraph
var treeData;
var circleData;
var topicMax;
var topicDocExtent;
var wordMax = 0; 
var cwordMax = 0
var wScale
var cwScale; 

var centerWidth = window.innerWidth * .5
var centerHeight = window.innerHeight * .85
var clusterHeight = window.innerHeight * .85

function decideLabelCount(topicCount){
	console.log(topicCount)
	if(topicCount < 11){
		return 5
	}
	if(topicCount < 16){
		return 4
	}
	if(topicCount < 21){
		return 3
	}
	if(topicCount < 26){
		return 2
	}
	return 1
}




async function wrapper(){
	$(function () {
  		$('[data-toggle="popover"]').popover()
	})
	var h = window.innerHeight
	params  = getJsonFromUrl(window.location.search);


	console.log(params)
	function undefined_fixer(info){
		if (info == undefined){
			return ""
		}
		else{
			return info
		}
	}
	/*$('#corpus').text(undefined_fixer(params.corpus))
	$('#term').text(undefined_fixer(params.model.split("#")))//[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1)))
	$('#topics').text(undefined_fixer(params.num_topics))
	$('#stop_words').text(undefined_fixer(params.stop_words).replace("-", ","))
	$('#start').text(undefined_fixer(params.ys))
	$('#end').text(undefined_fixer(params.ye))
	$('#dn').text(undefined_fixer(params.dn))*/

	doItAll()

	
	
	async function doItAll(mlmom_data=false){
	let the_data = null
	let addit_str = "&model=" + params.model //+ "&method=" + params.method
	if(mlmom_data == false){
		if(mlmom_data == false){
  			the_data = await d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk + addit_str);
  		}
	}
	mlmom_data = the_data.data
	let model_info = the_data.model_info
	if (params.q_pk != undefined){
		params.corpus = model_info.corpus
		$('#corpus').text(undefined_fixer(model_info.corpus))
	    $('#term').text(undefined_fixer(model_info.term))
	    $('#topics').text(undefined_fixer(model_info.topics))
	    $('#stop_words').text(undefined_fixer(model_info.stopwords).replace("-", ","))
	    $('#start').text(undefined_fixer(model_info.ys))
	    $('#end').text(undefined_fixer(model_info.ye))
	    $('#dn').text(undefined_fixer(model_info.docs))
	}
	else{
		$('#corpus').text(undefined_fixer(params.corpus))
		$('#term').text(undefined_fixer(params.model.split("#")))//[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1)))
		$('#topics').text(undefined_fixer(params.num_topics))
		$('#stop_words').text(undefined_fixer(params.stop_words).replace("-", ","))
		$('#start').text(undefined_fixer(params.ys))
		$('#end').text(undefined_fixer(params.ye))
		$('#dn').text(undefined_fixer(params.dn))
	}
	console.log(mlmom_data)

	mlmom_data.formatted_proj.forEach(function(m){
		m.top_words.forEach(function(t){
			//c;onsole.log(t)
		})
	})

	modelsData = mlmom_data.formatted_proj;
	metaData = d3.csvParseRows(mlmom_data.metadata);
	topicSimdata = mlmom_data.formatted;

	$('#loading_show').addClass("hidden")
	$('#loading_hide').removeClass("hidden")
	console.log(metaData)
	var metadata_i = 0 
	metaData.forEach(function(r){
		if(r.length > 9){
			var i = 0;
			var auth_loc = 0;
			r.forEach(function(c){
				if(c[0] == '['){
					auth_loc = i;
				}
				i++;
			})
			var title_ = r.slice(1, auth_loc)
			var fulltitle = title_.join('')
			var fulltitle = fulltitle.replaceAll('"', "")
			console.log(fulltitle)
			metaData[metadata_i] = ["", fulltitle].concat(r.slice(auth_loc))
			console.log(metaData[metadata_i])
		}
		metadata_i++;
	})

	/*modelsData = await d3.json("/static/multi-level-lda/multi_model_data/"+ params.model + "/formatted_proj.json")
	metaData = await d3.text("/static/multi-level-lda/multi_model_data/" + params.model + "/meta.csv")
	metaData = d3.csvParseRows(metaData);
	topicSimdata = await d3.json("/static/multi-level-lda/multi_model_data/" + params.model + "/formatted.json")*/

	labelCount = decideLabelCount(modelsData[0].clusters.length)
	//labelCount = 10
	d3.select("#model-name").text(params.model)
	let formattedD = formatData(modelsData, topicSimdata);
	treeData = formatTreeData(formattedD, modelsData)
	treeData.children.sort(function(a,b){
		return b.score - a.score;
	})
	circleData = formatCircleData(treeData)
	console.log(circleData)
	wScale = d3.scaleLinear().domain([0, wordMax]).range([0, 8])
	cwScale = d3.scaleLinear().domain([0, cwordMax]).range([1, 15])


	$('#tree-btn').on("change", function(evt){
		$('#tree-graph-div').removeClass("hidden")
		$('#circle-graph-div').addClass("hidden")
		$('#network-graph-div').addClass("hidden")
	})
	$('#circle-btn').on("change", function(evt){
		$('#circle-graph-div').removeClass("hidden")
		$('#tree-graph-div').addClass("hidden")
		$('#network-graph-div').addClass("hidden")
	})
	
	$('#network-btn').on("change", function(evt){
		$('#network-graph-div').removeClass("hidden")
		$('#circle-graph-div').addClass("hidden")
		$('#tree-graph-div').addClass("hidden")
		
			networkGraph.resize()
			networkGraph.fit()
			once = false
			
	})

	d3.select("#network-graph").style("width", function(d){
		return centerWidth
	}).style("height", function(d){
		return centerHeight
	})
	console.log(formattedD)
	renderClustersTable(formattedD);
	await renderTree(treeData);
	await renderCircle(circleData);
	await renderNetwork(formattedD);


	$( window ).resize(function() {
  		centerWidth = window.innerWidth * .5
		centerHeight = window.innerHeight * .88
		clusterHeight = (window.innerHeight * .88) + 54
		networkGraph.resize()
		$('#topics-table').height(centerHeight / 2.1);
		$('#article').height(centerHeight / 1.85)
		d3.selectAll('.fixedheight').style("height", centerHeight)
		d3.selectAll('.fixedheight-cluster').style("height", clusterHeight)

	})
	$(window).resize()
}//doItAll

}//wrapper

wrapper()