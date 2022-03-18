'use strict'

// Current state variables for network graph. 
// TODO: Can refactor to use getters and setters instead of global variables so that it wont interfere with annotations in other visualizations.

var bubblePaths;
var newPath;
var newPathId;
var currentLabelId;
var newPathNodeSet = new Set();
var newPathEdgeSet = new Set();
// TODO: Get from DB
var networkGraphNotes = [];

function renderNetwork(formattedData) {
	console.log(formattedData)
	var label_show_cutoff = 0
	var label_font_size = 8
	var label_show_cutoff = 2
	var label_font_size = 8
	// var edges;
	// var nodes;
	var showlabels = params.nodelabels;

	if (showlabels != undefined) {
		if (showlabels == 'yes') {
			label_font_size = 8
		}
		else {
			label_font_size = 0
		}
	}
	else if (formattedData.nodes.length > label_show_cutoff) {
		label_font_size = 0
	}
	let kl_max = d3.max(formattedData.edges, function (d) {
		return d.data.weight;
	})


	topicDocExtent = d3.extent(formattedData.nodes, function (d) {

		let score = 0
		d.data.topic.forEach(function (doc) {
			score += doc[1]
		})
		return score
	})

	let topicDocScale = d3.scaleLinear().domain(topicDocExtent).range([3, 30])
	formattedData.nodes.forEach(function (d) {
		d.data.label = "cluster " + d.data.cluster + "\n" + d.data.label
		let score = 0
		d.data.topic.forEach(function (doc) {
			score += doc[1]
		})
		d.data.size = topicDocScale(score)
		d.data.type = 'ellipse'
	})


	let multiplier = 100
	let KL_LIMIT = 1
	if (kl_max > 1) {
		KL_LIMIT = kl_max;
		multiplier = 1
		d3.select("#slider")
			.append("input")
			.attr("type", "range")
			.attr("min", "0")
			.attr("max", KL_LIMIT)
			.attr("value", KL_LIMIT)
			.attr("class", "slider mt-2")
			.attr("id", "kl_range")
			.style("display", "inline")
			.style("width", "100%")


	}
	else {
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
	slide.onchange = function () {

		output.innerHTML = this.value / multiplier;
		KL_LIMIT = this.value / multiplier;
		if (KL_LIMIT > preLim) {
			console.log("ADDING")
			removeLinks()
		}
		if (KL_LIMIT < preLim) {
			console.log("REMOVING")

			addLinks()
		}
		preLim = KL_LIMIT
	};

	function addLinks() {
		let count_added = 0
		formattedData.edges.forEach(function (d) {
			if (d.data.weight > KL_LIMIT) {
				count_added++;
				//console.log(networkGraph.getElementById(d.data.id).length)
				//if (networkGraph.getElementById(d.data.id).length == 0){
				networkGraph.add({ group: 'edges', data: d.data })
				//}
			}

		})
		console.log("added")
		console.log(count_added)
	}

	function removeLinks() {
		networkGraph.elements('edge[weight < ' + KL_LIMIT + ']').remove()
	}

	networkGraph = cytoscape({
		container: document.getElementById('network-graph'),
		elements: formattedData,
		layout: {
			name: 'preset'
		},
		style: [
			{
				selector: 'node',
				style: {
					'shape': 'data(type)',
					'label': 'data(label)',
					'background-color': 'data(color)',
					'border-color': 'black',
					'border-width': .5,
					'background-opacity': .9,
					'width': 'data(size)',
					'height': 'data(size)',
					'font-size': label_font_size,
					'text-background-color': "white",
					'text-background-opacity': .7,
					'text-background-shape': "rectangle",
					'text-background-opacity': 1,
					'text-wrap': 'wrap',

				}
			},
			{
				selector: 'edge',
				style: {
					'width': '2 * data(weight)',
					'line-color': '#ccc',
					'opacity': '1'

				}
			}

		]

	});

	//networkGraph.autolock(true)



	networkGraph.ready(() => {
		bubblePaths = networkGraph.bubbleSets();
		networkGraphNotes.forEach((note) => {
			bubblePaths.addPath(note);
		})
		// edges = null//networkGraph.edges().slice(0, 15);
		// nodes = networkGraph.nodes('[cluster = 1]')//.slice(0, )
		// console.log(edges)
		// console.log(nodes)
	});

	/*networkGraph.on("mouseover", "node", function(evt){
		 let j = networkGraph.elements(evt.target)
		 j.style("font-size", 40)
		 //j.style("text-background-shape", 'roundrectangle')
		 //j.style("text-background-padding", 3)
		 j.style("z-index", 1000000)
		 if (j.style("border-color") == 'black'){
			   j.style("border-color", "blue")
			   j.style("border-width", 2)
		 }
	})

	networkGraph.on("mouseout", "node", function(evt){
		 let j = networkGraph.elements(evt.target)
		 j.style("font-size", label_font_size)
		 //j.style("text-background-shape", 'rectangle')
		 //j.style("text-background-padding", 0)
		 j.style("z-index", 1)
		 if (j.style("border-color") == 'blue'){
			 j.style("border-color", "black")
			 j.style("border-width", .5)
		 }
	})
*/

	networkGraph.on("boxselect", "node", function (evt) {
		let j = networkGraph.elements(evt.target)
		j.style("font-size", label_font_size)
		/*j.style("text-background-shape", 'rectangle')
		j.style("text-background-padding", 0)*/
		//j.style("z-index", 1)
		//if (j.style("border-color") == 'blue'){
		//j.style("border-color", "red")
		//j.style("border-width", 5)
		//}
	})


	networkGraph.on("tap", "edge", function (evt) {
		// TODO: Revisit - Possible bug in bb plugin: When the bb contains a path with few nodes in it and we try to add a edge without adding the nodes corresponding
		// to that edge to the path first, it doesn't add the edge to the path. Once a corresponding node is added, it adds the edge too, if it was selected before.
		if (annotate_mode) {
			const edge = evt.target;
			newPathEdgeSet.has(edge) ? newPathEdgeSet.delete(edge) : newPathEdgeSet.add(edge);
			 newPath = buildBubblePath(newPathNodeSet, newPathEdgeSet, newPath);
		}
	});

	networkGraph.on("tap", "node", function (evt) {
		const node = evt.target;
		const nodeId = node._private.data.id;

		if (nodeId.includes('textlabel')) {
			return;
		}

		// let j = networkGraph.elements("node[cluster = " + node._private.data.cluster + "]")
		let splitT = nodeId.split(":")
		let topicIndexes = [splitT[0].substr(1), splitT[1]]

		if (annotate_mode) {
			newPathNodeSet.has(node) ? newPathNodeSet.delete(node) : newPathNodeSet.add(node);
			newPath = buildBubblePath(newPathNodeSet, newPathEdgeSet, newPath);
			hierarchyTopicSelect(topicIndexes, false)
		}
		else {
			hierarchyTopicSelect(topicIndexes)
		}
		//topicSelect(evt.target._private.data)
	})
	addLinks()
	removeLinks()
	//networkGraph.fit()
	networkGraph.resize()

	function buildBubblePath(newPathNodeSet, newPathEdgeSet, oldPath) {
		// const inputColor = ;
		const labelColor = $('#note-color-input').val() //inputColor// ? `rgba(${inputColor, 0.5})` : `rgba(0,200,200)`;
		const inputLabel = $('#note-label-input').val()
		const labelText = !inputLabel || inputLabel == '' ? 'This is a default annotation label.' : inputLabel;

		const existingPaths = bubblePaths.getPaths();
		const labelId = `notelabel-${networkGraphNotes.length}`;
		currentLabelId = labelId;
		let oldLabelPosition = undefined;
		if (existingPaths.some(path => path == oldPath)) {
			bubblePaths.removePath(oldPath);
			oldLabelPosition = networkGraph.$(`#${labelId}`)[0]._private.position;
			networkGraph.remove(`[id = "${labelId}"]`);
		}
		let path = undefined;
		if (newPathNodeSet.size || newPathEdgeSet.size) {
				path = bubblePaths.addPath(networkGraph.nodes().filter(n => newPathNodeSet.has(n)), networkGraph.edges().filter(n => newPathEdgeSet.has(n)), null, {
				//drawPotentialArea: true,
				virtualEdges: true,
				style: createBStyle(labelColor)
			})
			const labelPosition = oldLabelPosition ? oldLabelPosition : getInitialLabelPosition(path);
			const label = {
				group: 'nodes', data: {
					type: 'triangle',
					id: labelId,
					label: labelText,
					color: 'yellow',
					size: 30
				},
				position: labelPosition,
			};
			networkGraph.add(label);

			networkGraph.$(`#${labelId}`).style({
				'shape': 'Rectangle',
				'text-halign': 'center',
				'background-opacity': 0,
				'border-width': 0,
				'font-size': 30,
				'text-background-color': labelColor,
				'text-background-opacity': .5,
				'text-background-shape': "rectangle",
				'text-wrap': 'wrap',
			})
		} 
		return path;
	}

	function createBStyle(the_color) {
		return {
			'fill': the_color
		};
	}

	function getInitialLabelPosition(newPath) {
		const randomOffset = Math.floor(Math.random() * 20);
		let x, y;
		if (newPath.nodes.length) {
			x = newPath.nodes[0]._private.position['x'] - randomOffset;
			y = newPath.nodes[0]._private.position['y'] - randomOffset;
		} else {
			const bounds = newPath.edges[0]._private.overlayBounds;
			x = (bounds['x1'] + bounds['x2']) / 2 - randomOffset;
			y = (bounds['y1'] + bounds['y2']) / 2 - randomOffset;
		}
		return { x, y };
	}
}///renderNetwork



