'use strict'



function renderNetwork(formattedData){
	console.log(formattedData)
	var label_show_cutoff = 0
	var label_font_size = 8
	var label_show_cutoff = 2
	var label_font_size = 8
	var showlabels = params.nodelabels;

	if(showlabels != undefined){
		if(showlabels == 'yes'){
			label_font_size = 8
		}
		else {
			label_font_size = 0
		}
	}
	else if(formattedData.nodes.length > label_show_cutoff){
		label_font_size = 0
	}
	let kl_max = d3.max(formattedData.edges, function(d){
		return d.data.weight;
	})


		topicDocExtent = d3.extent(formattedData.nodes, function(d){

		let score = 0
		d.data.topic.forEach(function(doc){
			score += doc[1]
		})
		return score
	})

	let topicDocScale = d3.scaleLinear().domain(topicDocExtent).range([3, 30])
	formattedData.nodes.forEach(function(d){
		d.data.label = "cluster " + d.data.cluster + "\n" + d.data.label
		let score = 0
		d.data.topic.forEach(function(doc){
			score += doc[1]
		})
		d.data.size = topicDocScale(score)
		d.data.type = 'ellipse'
	})

	


	let multiplier = 100
	let KL_LIMIT = 1
	if (kl_max > 1){
		KL_LIMIT = kl_max;
		multiplier = 1
		d3.select("#slider")
		.append("input")
		.attr("type", "range")
		.attr("min", "0")
		.attr("max", KL_LIMIT)
		.attr("value", KL_LIMIT )
		.attr("class", "slider mt-2")
		.attr("id", "kl_range")
		.style("display", "inline")
		.style("width", "100%")


	}
	else{
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

	}
	

	var slide = document.getElementById("kl_range");
	var output = document.getElementById("kl_label");
	output.innerHTML = slider.value / multiplier; // Display the default slider value

	let preLim = KL_LIMIT
	output.innerHTML = KL_LIMIT
	slide.onchange = function() {

	  output.innerHTML = this.value / multiplier;
	  KL_LIMIT = this.value / multiplier;
	  if (KL_LIMIT > preLim){
	  	console.log("ADDING")
	  	removeLinks()
	  }
	  if (KL_LIMIT < preLim){
	  	console.log("REMOVING")
	  	
	  	addLinks()
	  }
	  preLim = KL_LIMIT
	};

	function addLinks(){
		let count_added = 0
		formattedData.edges.forEach(function(d){
			if(d.data.weight > KL_LIMIT){
				count_added++;
				//console.log(networkGraph.getElementById(d.data.id).length)
				//if (networkGraph.getElementById(d.data.id).length == 0){
				networkGraph.add({ group : 'edges', data : d.data})
				//}
			}
		
		})
		console.log("added")
		console.log(count_added)	
	}
	function removeLinks(){
		networkGraph.elements('edge[weight < ' + KL_LIMIT + ']').remove()
	}






	 networkGraph = cytoscape({
  		container: document.getElementById('network-graph'),
  		elements: formattedData,
		  layout: {
		  	name : 'preset'
		  },
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
        'width': '2 * data(weight)',
        'line-color': '#ccc',
        'opacity' : '1'
       
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


	 networkGraph.on("boxselect", "node", function(evt){
	 	let j = networkGraph.elements(evt.target)
	 	j.style("font-size", label_font_size)
	 	/*j.style("text-background-shape", 'rectangle')
	 	j.style("text-background-padding", 0)*/
	 	j.style("z-index", 1)
	 	//if (j.style("border-color") == 'blue'){
		 	j.style("border-color", "red")
		 	j.style("border-width", 5)
	 	//}
	 })



	 networkGraph.on("tap", "node", function(evt){
	 	let j = networkGraph.elements("node[cluster = " + evt.target._private.data.cluster + "]")
	 	/*networkGraph.animate({
				  fit: {
				    eles: j,
				    padding: 40
				  }
				}, {
				  duration: 500
				});*/
	 	let splitT = evt.target._private.data.id.split(":")
	 	let topicIndexes = [splitT[0].substr(1), splitT[1]]
	 	hierarchyTopicSelect(topicIndexes)
	 	//topicSelect(evt.target._private.data)
	 })
	addLinks()
	removeLinks()
	networkGraph.fit()
	networkGraph.resize()
}//renderNetwork





