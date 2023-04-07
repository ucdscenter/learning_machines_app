'use strict';

// Current state variables for network graph. 
// TODO: Can refactor to use getters and setters instead of global variables so that it wont interfere with annotations in other visualizations.

var bubblePaths;
var newPath;
var newPathId;
var currentLabelId;
var newPathNodeSet = new Set();
var newPathEdgeSet = new Set();
var bubblePathMap = new Map();
var highlightedLabelNode;
var vis_request_id;
var networkGraphNotes = {
	"notes": [],
	"activeTopic": ""
};
var query_pk;
var defaultColors = d3.schemePaired;
function renderNetwork(formattedData, meta) {
	var label_show_cutoff = 0;
	var label_font_size = 8;
	var label_show_cutoff = 2;
	var label_font_size = 8;
	vis_request_id = meta.vis_request_id;
	query_pk = meta.q_pk;
	// var edges;
	// var nodes;
	var showlabels = params.nodelabels;

	if (showlabels != undefined) {
		if (showlabels == 'yes') {
			label_font_size = 8;
		}
		else {
			label_font_size = 0;
		}
	}
	else if (formattedData.nodes.length > label_show_cutoff) {
		label_font_size = 0;
	}
	let kl_max = d3.max(formattedData.edges, function (d) {
		return d.data.weight;
	});


	topicDocExtent = d3.extent(formattedData.nodes, function (d) {

		let score = 0;
		d.data.topic.forEach(function (doc) {
			score += doc[1];
		});
		return score;
	});

	let topicDocScale = d3.scaleLinear().domain(topicDocExtent).range([3, 30]);
	formattedData.nodes.forEach(function (d) {
		d.data.label = "cluster " + d.data.cluster + "\n" + d.data.label;
		let score = 0;
		d.data.topic.forEach(function (doc) {
			score += doc[1];
		});
		d.data.size = topicDocScale(score);
		d.data.type = 'ellipse';
	});


	let multiplier = 100;
	let KL_LIMIT = 1;
	if (kl_max > 1) {
		KL_LIMIT = kl_max;
		multiplier = 1;
		d3.select("#slider")
			.append("input")
			.attr("type", "range")
			.attr("min", "0")
			.attr("max", KL_LIMIT)
			.attr("value", KL_LIMIT)
			.attr("class", "slider mt-2")
			.attr("id", "kl_range")
			.style("display", "inline")
			.style("width", "100%");


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
			.style("width", "100%");

	}


	var slide = document.getElementById("kl_range");
	var output = document.getElementById("kl_label");
	output.innerHTML = slider.value / multiplier; // Display the default slider value

	let preLim = KL_LIMIT;
	output.innerHTML = KL_LIMIT;
	slide.onchange = function () {
		output.innerHTML = this.value / multiplier;
		KL_LIMIT = this.value / multiplier;
		if (KL_LIMIT > preLim) {
			removeLinks();
		}
		if (KL_LIMIT < preLim) {
			addLinks();
		}
		preLim = KL_LIMIT;
	};

	function addLinks() {
		networkGraph.elements('edge[weight > ' + KL_LIMIT + ']').style('display', 'element');
	}

	function removeLinks() {
		networkGraph.elements('edge[weight < ' + KL_LIMIT + ']').style('display', 'none');
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

		// edges = null//networkGraph.edges().slice(0, 15);
		// nodes = networkGraph.nodes('[cluster = 1]')//.slice(0, )
		// console.log(edges)
		// console.log(nodes)
	});

	networkGraph.on("mouseover", "node", function (evt) {
		let j = networkGraph.elements(evt.target);
		const nodeId = evt.target._private.data.id;
		if (!nodeId.includes('notelabel')) {
			j.style("font-size", 20);
			//j.style("text-background-shape", 'roundrectangle')
			//j.style("text-background-padding", 3)
			j.style("z-index", 1000000);
			if (j.style("border-color") == 'black') {
				j.style("border-color", "blue");
				j.style("border-width", 2);
			}
		}
	});

	networkGraph.on("mouseout", "node", function (evt) {
		let j = networkGraph.elements(evt.target);
		const nodeId = evt.target._private.data.id;
		if (!nodeId.includes('notelabel')) {
			j.style("font-size", label_font_size);
			//j.style("text-background-shape", 'rectangle')
			//j.style("text-background-padding", 0)
			j.style("z-index", 1);
			if (j.style("border-color") == 'blue') {
				j.style("border-color", "black");
				j.style("border-width", .5);
			}
		}
	});

	networkGraph.on("boxselect", "node", function (evt) {
		let j = networkGraph.elements(evt.target);
		j.style("font-size", label_font_size);
		/*j.style("text-background-shape", 'rectangle')
		j.style("text-background-padding", 0)*/
		//j.style("z-index", 1)
		//if (j.style("border-color") == 'blue'){
		//j.style("border-color", "red")
		//j.style("border-width", 5)
		//}
	});

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
		const note = networkGraphNotes.notes.find(note => note.labelId == highlightedLabelNode);

		if (nodeId.includes('notelabel')) {
			if (!networkGraphNotes.notes.find(note => note.labelId == nodeId).canEdit) {
				$('#note-error-body').text('You do not have permission to edit this note!');
				$('#note-error').toast('show');
				return;
			}
			if (isGraphDirty(nodeId) && !isCurrentNote(nodeId)) {
				$('#note-error-body').text('Please save or discard your current note before creating/editing another one!');
				$('#note-error').toast('show');
				$('#notes-list').val(highlightedLabelNode);

			} else {
				if (highlightedLabelNode == nodeId) {
					// unselectNote()
					// Empty sets 
					if ((note && note.draft == true) || !note) {
						$('#note-error-body').text('Discard or save changes before deselecting the note!');
						$('#note-error').toast('show');
						return;
					}
					newPathEdgeSet.clear();
					newPathEdgeSet.clear();
					newPath = undefined;
					currentLabelId = undefined;
					currentLabelId = undefined;
					highlightedLabelNode = undefined;
					$('#note-label-input').val('');
					$('#notes-list').val('Notes');
					const colorIndex = Math.floor(Math.random() * 12);
					$('#note-color-input').val(defaultColors[colorIndex]);
					networkGraph.$(`#${nodeId}`).style('color', 'black');
				} else {
					highlightedLabelNode = nodeId;
					currentLabelId = nodeId;
					networkGraph.$(`#${nodeId}`).style('color', 'yellow');
					$('#note-label-input').val(node._private.style.label.strValue);
					$('#note-color-input').val(rgbToHex(...node._private.style['text-background-color'].value));
					$('#notes-list').val(nodeId);
					// editNote(noteId);
				}
			}

			return;
		}

		if (highlightedLabelNode) {
			const nodes = networkGraph.nodes().filter(node => note.nodes.includes(node._private.data.id));
			const edges = networkGraph.edges().filter(node => note.edges.includes(node._private.data.id));
			edges.forEach(edge => newPathEdgeSet.add(edge));
			nodes.forEach(node => newPathNodeSet.add(node));
			newPath = bubblePathMap.get(highlightedLabelNode);
		}

		// let j = networkGraph.elements("node[cluster = " + node._private.data.cluster + "]")
		let splitT = nodeId.split(":");
		let topicIndexes = [splitT[0].substr(1), splitT[1]];

		if (annotate_mode) {
			newPathNodeSet.has(node) ? newPathNodeSet.delete(node) : newPathNodeSet.add(node);
			newPath = buildBubblePath(newPathNodeSet, newPathEdgeSet, newPath, highlightedLabelNode != undefined);
			hierarchyTopicSelect(topicIndexes, false);
		}
		else {
			hierarchyTopicSelect(topicIndexes);
		}
		//topicSelect(evt.target._private.data)
	});
	addLinks();
	removeLinks();
	//networkGraph.fit()
	networkGraph.resize();

	$('#notes-list').change(e => {
		const nodeId = e.target.value;
		networkGraph.$(`#${nodeId}`).emit('tap');
		// const note = networkGraphNotes.notes.find(note => note.labelId == nodeId);
		// highlightedLabelNode = nodeId;
		// currentLabelId = nodeId;
		// networkGraph.$(`#${nodeId}`).style('color', 'yellow');
		// $('#note-label-input').val(node._private.style.label.strValue);
		// $('#note-color-input').val(rgbToHex(...node._private.style['text-background-color'].value));
	});

	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	function isGraphDirty(nodeId) {
		return newPath || (currentLabelId && currentLabelId != nodeId) || newPathEdgeSet.size || newPathNodeSet.size;
	}

	function isCurrentNote(noteId) {
		return currentLabelId == noteId;
	}

	function buildBubblePath(newPathNodeSet, newPathEdgeSet, oldPath, isEdit = false) {
		const labelColor = $('#note-color-input').val();
		const inputLabel = $('#note-label-input').val();
		const labelText = !inputLabel || inputLabel == '' ? 'New Note' : inputLabel;

		const existingPaths = bubblePaths.getPaths();

		//TODO: Use UUID to avoid collisions;
		let labelId;
		let oldLabelPosition = undefined;
		if (currentLabelId) {
			labelId = currentLabelId;
			oldLabelPosition = networkGraph.$(`#${labelId}`)[0]._private.position;
			networkGraph.remove(`[id = "${labelId}"]`);
		} else {
			labelId = `notelabel-${networkGraphNotes.notes.length}-${new Date().getTime()}`;
		}
		currentLabelId = labelId;
		if (existingPaths.some(path => path == oldPath)) {
			bubblePaths.removePath(oldPath);
		}
		let path = undefined;
		if (newPathNodeSet.size || newPathEdgeSet.size) {
			path = bubblePaths.addPath(networkGraph.nodes().filter(n => newPathNodeSet.has(n)), networkGraph.edges().filter(n => newPathEdgeSet.has(n)), null, {
				//drawPotentialArea: true,
				virtualEdges: true,
				style: createBStyle(labelColor)
			});
			const labelPosition = oldLabelPosition ? oldLabelPosition : getInitialLabelPosition(path);
			const label = {
				group: 'nodes', data: {
					type: 'triangle',
					id: labelId,
					label: labelText,
					size: 30
				},
				position: labelPosition,
			};
			networkGraph.add(label);
			bubblePathMap.set(labelId, path);
			networkGraph.$(`#${labelId}`).style({
				'text-halign': 'center',
				'border-opacity': 0,
				'background-opacity': 0,
				'border-width': 0,
				'font-size': 20,
				'background-color': labelColor,
				'text-background-color': labelColor,
				'text-background-opacity': .5,
				'text-background-shape': "rectangle",
				'text-wrap': 'wrap',
				'text-max-width': 80,
				'events': 'yes',
				'text-events': 'yes'
			});
			if (isEdit) {
				networkGraph.$(`#${labelId}`).style('color', 'yellow');
			}
		}
		return path;
	}

	function createBStyle(the_color) {
		return {
			'fill': the_color,
			'opacity': 0.6
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



