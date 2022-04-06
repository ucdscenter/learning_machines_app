'use strict';
let annotate_mode = false;

const annotation_api = {
	get: 'get_annotations',
	post: 'save_annotations',
	delete: 'delete_annotation',
};

$('#annotation-button').on("click", async function (e) {
	console.log("clicked");
	if (annotate_mode == false) {
		annotate_mode = true;
		showNoteOptions();
		getSavedNotes();
		$('#main-nav').css("background-color", 'grey');
	}
});

$('#e-a-b').on("click", function (e) {
	annotate_mode = false;
	hideNoteOptions();
	hideAllNotes();
	$('#main-nav').css("background-color", 'white');
});

$('#s-a-b').on("click", function (e) {
	if (newPath) {
		saveNote();
		resetNotesMenu();
	} else {
		alert('Please create a note before saving!');
	}
});

$('#d-a-b').on("click", function (e) {
	hideAllNotes();
	getSavedNotes()
});

$('#remove-annotation-button').on("click", async function (e) {
	// TODO: Validate if node is saved before triggering http request
	if (highlightedLabelNode) {
		networkGraph.remove(`[id = "${highlightedLabelNode}"]`);
		await $.ajax({
			type: 'DELETE',
			url: `${annotation_api.delete}?vis_request_id=${vis_request_id}&note_id=${highlightedLabelNode}`,
			//TODO: extract
			beforeSend: function (xhr, settings) {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
				}
			},
			success: () => {
				alert('deleted');
				const path = bubblePathMap.get(highlightedLabelNode);
				if (path) {
					bubblePaths.removePath(path);
				}
			},
			contentType: 'application/json'
		}).fail((error) => {
			alert('Error while deleting note')
			console.log('Error while deleting note', error);
		});

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
	highlightedLabelNode = undefined;
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
	$('#d-a-b').addClass("hidden");
}

function showNoteOptions() {
	$('#e-a-b').removeClass("hidden");
	$('#n-a-b').removeClass("hidden");
	$('#l-a-b').removeClass("hidden");
	$('#c-a-b').removeClass("hidden");
	$('#s-a-b').removeClass("hidden");
	$('#r-a-b').removeClass("hidden");
	$('#d-a-b').removeClass("hidden");
}

// TODO: extract to module
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function csrfSafeMethod(method) {
	return (/^(HEAD|OPTIONS|TRACE)$/.test(method));
}

async function saveNote() {
	const edges = [...newPathEdgeSet].map(edge => edge._private.data.id);
	const nodes = [...newPathNodeSet].map(edge => edge._private.data.id);
	const labelNode = networkGraph.$(`#${currentLabelId}`)[0];
	const labelPosition = labelNode._private.position;
	const labelColor = labelNode._private.style['text-background-color'].strValue;
	const labelText = labelNode._private.style.label.strValue;
	const labelId = labelNode._private.data.id;
	const note = { edges, nodes, labelId, labelPosition, labelText, labelColor, vis_request_id};
	const editedNote = networkGraphNotes.notes.find(note => note.labelId == currentLabelId);
	if(editedNote) {
		note['pk'] = editedNote.pk
	}
	var csrftoken = getCookie('csrftoken');
	setCsrfRequestHeader(csrftoken);
	// $.ajaxSetup({
	// 	beforeSend: function(xhr, settings) {
	// 		if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	// 			xhr.setRequestHeader("X-CSRFToken", csrftoken);
	// 		}
	// 	}
	// });
	await $.post(`${annotation_api.post}/`, note, () => {
		alert('Note Saved!');
	}).fail((error) => {
		alert('Error while saving note');
		console.log('Error while saving note', error);
	});
	networkGraphNotes.notes.push(note);
	console.log(networkGraphNotes);

}

function setCsrfRequestHeader(csrftoken) {
	$.ajaxSetup({
		beforeSend: function (xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});
}

function getSavedNotes() {
	$.get(`${annotation_api.get}?vis_request_id=${vis_request_id}`, (data) => {
		console.log('get notes', data);
		networkGraphNotes.notes = data.notes;
	}).done(() => {
		showSavedNotes();
		$('#main-nav').css("background-color", 'grey');
	}).fail((error) => {
		console.log(error);
	});
}

function showSavedNotes() {
	networkGraphNotes.notes.forEach((note, index) => {
		const nodes = note.nodes.length ? networkGraph.nodes().filter(node => note.nodes.includes(node._private.data.id)) : null;
		const edges = note.edges.length ? networkGraph.nodes().filter(node => note.edges.includes(node._private.data.id)) : null;
		const labelId = note.labelId;
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
			'text-halign': 'center',
			'background-opacity': 0,
			'border-width': 0,
			'font-size': 30,
			'text-background-color': note.labelColor,
			'text-background-opacity': .5,
			'text-background-shape': "rectangle",
			'text-wrap': 'wrap',
			"text-max-width": 80
		});
	});
	networkGraph.elements("node").style({
		"border-color": "black",
		"border-width": .5
	});
}

function hideAllNotes() {
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