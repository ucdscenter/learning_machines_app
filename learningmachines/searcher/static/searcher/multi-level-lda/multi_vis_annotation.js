'use strict';
let annotate_mode = false;

$('#annotation-button').on("click", function (e) {
	console.log("clicked");
	if (annotate_mode == false) {
		showNoteOptions();
		showSavedNotes();
		$('#main-nav').css("background-color", 'grey');
	}
	annotate_mode = true;
});

$('#e-a-b').on("click", function (e) {
	annotate_mode = false;
	hideNoteOptions();
	removeAllNotes();
	$('#main-nav').css("background-color", 'white');
});

$('#s-a-b').on("click", function (e) {
	if (newPath) {
		saveNote();
		resetNotesMenu();
		alert('Note Saved!');
		annotate_mode = false;
		hideNoteOptions();
	} else {
		alert('Please create a note before saving!');
	}
});

$('#remove-annotation-button').on("click", function (e) {
	if (highlightedLabelNode) {
		networkGraph.remove(`[id = "${highlightedLabelNode}"]`);
		const path = bubblePathMap[highlightedLabelNode];
		if (path) {
			bubblePaths.removePath(path);
		}
	}
});

$('#note-label-input').on("change", function (e) {
	const labelNode = networkGraph.$(`#${currentLabelId}`);
	if (currentLabelId && labelNode && labelNode[0]) {
		labelNode.css({
			content: '' + e.target.value
		});
	}
});

$('#note-color-input').on("change", function (e) {
	const labelNode = networkGraph.$(`#${currentLabelId}`);
	if (currentLabelId && labelNode && labelNode[0] && newPath) {
		console.log(newPath.node.style);
		newPath.node.style.fill = e.target.value;
		labelNode.css({
			'fill': e.target.value,
			'text-background-color': e.target.value,
		});
	}
});


function resetNotesMenu() {
	newPath = undefined;
	currentLabelId = undefined;
	$('#note-label-input').val('');
	$('#note-color-input').val('#000000');
	newPathEdgeSet.clear();
	newPathNodeSet.clear();
}

function hideNoteOptions() {
	$('#e-a-b').addClass("hidden");
	$('#n-a-b').addClass("hidden");
	$('#l-a-b').addClass("hidden");
	$('#s-a-b').addClass("hidden");
	$('#c-a-b').addClass("hidden");
	$('#r-a-b').addClass("hidden");
}

function showNoteOptions() {
	$('#e-a-b').removeClass("hidden");
	$('#n-a-b').removeClass("hidden");
	$('#l-a-b').removeClass("hidden");
	$('#c-a-b').removeClass("hidden");
	$('#s-a-b').removeClass("hidden");
	$('#r-a-b').removeClass("hidden");
}

function saveNote() {
	const edges = [...newPathEdgeSet].map(edge => edge._private.data.id);
	const nodes = [...newPathNodeSet].map(edge => edge._private.data.id);
	const labelNode = networkGraph.$(`#${currentLabelId}`)[0];
	const labelPosition = labelNode._private.position;
	const labelColor = labelNode._private.style['text-background-color'].strValue;
	const labelText = labelNode._private.style.label.strValue;
	networkGraphNotes.notes.push({ edges, nodes, labelPosition, labelText, labelColor });
	console.log(networkGraphNotes);

}

function showSavedNotes() {
	networkGraphNotes.notes.forEach((note, index) => {
		const nodes = note.nodes.length ? networkGraph.nodes().filter(node => note.nodes.includes(node._private.data.id)) : null;
		const edges = note.edges.length ? networkGraph.nodes().filter(node => note.edges.includes(node._private.data.id)) : null;
		const labelId = `notelabel-${index}`;
		const path = bubblePaths.addPath(nodes, edges, null, {
			//drawPotentialArea: true,
			virtualEdges: true,
			style: { 'fill': note.labelColor }
		});
		bubblePathMap.set(labelId, path);
		// TODO: Extract to function and reuse
		const label = {
			group: 'nodes', data: {
				type: 'triangle',
				id: labelId,
				label: note.labelText,
				color: 'yellow',
				size: 30
			},
			position: note.labelPosition,
		};
		networkGraph.add(label);

		networkGraph.$(`#${labelId}`).style({
			'shape': 'Rectangle',
			'text-halign': 'center',
			'background-opacity': 0,
			'border-width': 0,
			'font-size': 30,
			'text-background-color': note.labelColor,
			'text-background-opacity': .5,
			'text-background-shape': "rectangle",
			'text-wrap': 'wrap',
		});
	});
	networkGraph.elements("node").style({
		"border-color": "black",
		"border-width": .5
	});
}

function removeAllNotes() {
	// remove saved notes
	bubblePathMap.forEach((path, labelId) => {
		bubblePaths.removePath(path);
		networkGraph.remove(`[id = "${labelId}"]`);
	});

	bubblePathMap.clear();

	// remove unsaved notes
	if (newPath) {
		bubblePaths.removePath(newPath);
	}
	if (currentLabelId) {
		networkGraph.remove(`[id = "${currentLabelId}"]`);
	}
	resetNotesMenu();
}
/*function createAnnotation(){
	.append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations)
}*/

//handleOnOff()