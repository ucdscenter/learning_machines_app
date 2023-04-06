'use strict'



function renderNetwork(formattedData){
	console.log("HI")
	console.log(formattedData.nodes.length)
	console.log(params.nodelabels)
	var label_show_cutoff = 2
	var label_font_size = 8
	var showlabels = params.nodelabels;

	if(showlabels != undefined){
		console.log("showlabels")
		if(showlabels == 'yes'){
			label_font_size = 8
		}
		else {
			label_font_size = 0
		}
	}
	else if(formattedData.nodes.length > label_show_cutoff){
		console.log("here")
		label_font_size = 0
	}
	let KL_LIMIT = .8
	 d3.select("#slider")
		.append("input")
		.attr("type", "range")
		.attr("min", "0")
		.attr("max", "100")
		.attr("value", KL_LIMIT * 100)
		.attr("class", "slider mt-2")
		.attr("id", "kl_range")
		.style("display", "inline")
		.style("width", "100%")

	var slide = document.getElementById("kl_range");
	var output = document.getElementById("kl_label");
	output.innerHTML = slider.value / 100; // Display the default slider value

	let preLim = KL_LIMIT
	output.innerHTML = KL_LIMIT
	slide.oninput = function() {
	  output.innerHTML = this.value / 100;
	  KL_LIMIT = this.value / 100;
	  if (KL_LIMIT > preLim){
	  	addLinks()
	  }
	  if (KL_LIMIT < preLim){
	  	removeLinks()
	  }
	  preLim = KL_LIMIT
	};

	function addLinks(){
		formattedData.edges.forEach(function(d){
			if(d.data.weight < preLim){
				networkGraph.add({ group : 'edges', data : d.data})
			}

		})

	
	}
	function removeLinks(){
		networkGraph.elements('edge[weight > ' + KL_LIMIT + ']').remove()
	}




	//console.log(KL_LIMIT)
	/*
	formattedData.edges = formattedData.edges.filter(function(d){
			if (d.data.weight < KL_LIMIT){
				return true
			}
			return false
		})*/
	
	console.log(formattedData.edges)
	 networkGraph = cytoscape({
  		container: document.getElementById('network-graph'),
  		elements: formattedData,
		  layout: {
		  	name : 'preset'
		  },
		 /* layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },*/
	    style: [
	    {
	      selector: 'node',
	      style: {
	      	'shape': 'data(type)',
	        'label': 'data(label)',
	        'background-color' : 'data(color)',
	        'border-color' : 'black',
	        'border-width' : .5,
	        'background-opacity' : .9,
	        'width' : 'data(size)',
	        'height' : 'data(size)',
	        'font-size' : label_font_size,
	        'text-background-color' : "white",
	        'text-background-opacity' : .7,
	        'text-background-shape' : "rectangle",
	        'text-background-opacity' :  1,
	        'text-wrap' : 'wrap',
	     	 }
	 	 },
	 	 {
      selector: 'edge',
      style: {
        'width': '1 * data(weight)',
        'line-color': '#ccc',
       
      }
    }

	  ]

		});

	 //networkGraph.autolock(true)


	 networkGraph.on("mouseover", "node", function(evt){
	 	let j = networkGraph.elements(evt.target)
	 	j.style("font-size", 8)
	 	/*j.style("text-background-shape", 'roundrectangle')
	 	j.style("text-background-padding", 3)*/
	 	j.style("z-index", 1000000)
	 	if (j.style("border-color") == 'black'){
	 		j.style("border-color", "blue")
	 		j.style("border-width", 2)
	 	}
	 	
	 })

	 networkGraph.on("mouseout", "node", function(evt){
	 	let j = networkGraph.elements(evt.target)
	 	j.style("font-size", label_font_size)
	 	/*j.style("text-background-shape", 'rectangle')
	 	j.style("text-background-padding", 0)*/
	 	j.style("z-index", 1)
	 	if (j.style("border-color") == 'blue'){
		 	j.style("border-color", "black")
		 	j.style("border-width", .5)
	 	}
	 })



	 networkGraph.on("tap", "node", function(evt){
	 	let j = networkGraph.elements("node[cluster = " + evt.target._private.data.cluster + "]")
	 	networkGraph.animate({
				  fit: {
				    eles: j,
				    padding: 40
				  }
				}, {
				  duration: 500
				});
	 	let splitT = evt.target._private.data.id.split(":")
	 	let topicIndexes = [splitT[0].substr(1), splitT[1]]
	 	hierarchyTopicSelect(topicIndexes)
	 	//topicSelect(evt.target._private.data)
	 })

	removeLinks()
	networkGraph.fit()
	networkGraph.resize()
}//renderNetwork





