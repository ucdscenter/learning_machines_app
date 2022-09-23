'use strict';
let annotate_mode = false;

const annotation_api = {
	get: 'get_annotations',
	post: 'save_annotations',
	delete: 'delete_annotation',
};

const image_export_options = {
	bg: "#ffffff",
	full: false,
	quality: 1
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
	emptyNotesDropdown();
	$('#main-nav').css("background-color", 'white');
});

$('#s-a-b').on("click", function (e) {
	const labelTextInput = $('#note-label-input').val();
	if (newPath || (labelTextInput && labelTextInput != '')) {
		saveNote();
		resetNotesMenu();
	} else if ($('#notes-list').val() != 'Notes') {
		const note = networkGraphNotes.notes.find(note => note.labelId == highlightedLabelNode);
		const nodes = networkGraph.nodes().filter(node => note.nodes.includes(node._private.data.id));
		const edges = networkGraph.edges().filter(node => note.edges.includes(node._private.data.id));
		edges.forEach(edge => newPathEdgeSet.add(edge));
		nodes.forEach(node => newPathNodeSet.add(node));
		newPath = bubblePathMap.get(highlightedLabelNode);
		saveNote();
		resetNotesMenu();
	} else {
		$('#note-error-body').text('Please create a note before saving!');
		$('#note-error').toast('show');
	}
});

$('#d-a-b').on("click", function (e) {
	hideAllNotes();
	emptyNotesDropdown();
	getSavedNotes();
});

$('#edit-notes-modal').draggable();

$('#n-a-b').on("click", (e) => {
	const labelId = `notelabel-${networkGraphNotes.notes.length}-${new Date().getTime()}`;
	const selectedNote = $('#notes-list').val();
	const labelInputText = $('#note-label-input').val();
	let labelText = 'New Note.';;
	if (selectedNote == 'Notes') {
		if (labelInputText && labelInputText != '') {
			labelText = labelInputText;
		}
	} else {
		resetNotesMenu();
	}
	const labelColor = $('#note-color-input').val();
	const labelPosition = { 'x': 0, 'y': 0 };
	createLabel(labelId, labelText, labelColor, labelPosition);
	const note = {
		'nodes': [],
		'edges': [],
		'labelPosition': labelPosition,
		'labelText': labelText,
		'labelColor': labelColor,
		'labelId': labelId,
		'draft': true
	};
	networkGraph.$(`#${labelId}`).style('color', 'yellow');
	currentLabelId = labelId;
	highlightedLabelNode = labelId;
	note.canEdit = true;
	networkGraphNotes.notes.push(note);
});

$('#r-a-b').on("click", async function (e) {
	// TODO: Validate if node is saved before triggering http request
	if (highlightedLabelNode) {
		const noteSaved = networkGraphNotes.notes.some(note => note.labelId == highlightedLabelNode);
		if (noteSaved) {
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
					$('#note-success-body').text('Note deleted successfully!');
					$('#note-success').toast('show');
					// alert('Note deleted!');
					networkGraph.remove(`[id = "${highlightedLabelNode}"]`);
					removeAnnotation();
				},
				contentType: 'application/json'
			}).fail((error) => {
				$('#note-error-body').text('Error while deleting note!');
				$('#note-error').toast('show');
				console.log('Error while deleting note', error);
			});
		} else {
			removeAnnotation();
			networkGraphNotes.notes = networkGraphNotes.notes.filter(note => note.labelId != highlightedLabelNode);
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
	let path = undefined;
	if (!newPath && currentLabelId) {
		path = bubblePathMap.get(currentLabelId);
	} else {
		path = newPath;
	}
	if (currentLabelId && labelNode && labelNode[0] && path) {
		path.node.style.fill = e.target.value;
		labelNode.css({
			'fill': e.target.value,
			'text-background-color': e.target.value,
		});
	}
});

$('#ex-a-b').on('click', function (e) {
	html2canvas(document.querySelector("#network-graph")).then(exportCanvas => {
		const exportPlaceholder = document.getElementById('export-placeholder');
		exportPlaceholder.download = 'Network_'+ query_pk;
		exportPlaceholder.href = exportCanvas.toDataURL();
		exportPlaceholder.click();
	});
});

$('#c-m-b').on('click', function (e) {
	$('#edit-notes-modal').hide();
	$('#s-n-a-b').removeClass('hidden');
});

$('#s-n-a-b').on('click', function (e) {
	$('#edit-notes-modal').show();
	$('#s-n-a-b').addClass('hidden');
});

function emptyNotesDropdown() {
	const notesDropdown = $('#notes-list');
	notesDropdown.empty();
	const notesList = notesDropdown[0].options;
	notesList.add(new Option('Notes', 'Notes'));
	notesDropdown.val('Notes');
}

function removeAnnotation() {
	const path = bubblePathMap.get(highlightedLabelNode);
	if (path) {
		bubblePaths.removePath(path);
	}
	const notesList = document.getElementById('notes-list');
	notesList.remove(notesList.selectedIndex);
	$('#notes-list').val('Notes');
	resetNotesMenu();
}

function resetNotesMenu() {
	newPath = undefined;
	currentLabelId = undefined;
	highlightedLabelNode = undefined;
	$('#note-label-input').val('');
	setRandomNoteColor();
	newPathEdgeSet.clear();
	newPathNodeSet.clear();
}

function hideNoteOptions() {
	$('#e-a-b').addClass("hidden");
	$('#l-a-b').addClass("hidden");
	$('#c-a-b').addClass("hidden");
	$('#ex-a-b').addClass("hidden");
	$('#edit-notes-modal').hide();
}

function showNoteOptions() {
	$('#e-a-b').removeClass("hidden");
	$('#l-a-b').removeClass("hidden");
	$('#ex-a-b').removeClass("hidden");
	$('#edit-notes-modal').show();
	setRandomNoteColor();
}

// TODO: extract 
function setRandomNoteColor() {
	const colorIndex = Math.floor(Math.random() * 12);
	$('#note-color-input').val(defaultColors[colorIndex]);
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
	const note = { edges, nodes, labelId, labelPosition, labelText, labelColor, vis_request_id };
	const editedNote = networkGraphNotes.notes.find(note => note.labelId == currentLabelId);
	if (editedNote) {
		note['pk'] = editedNote.pk;
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
		note.canEdit = true;
		note.pk = vis_request_id;
		networkGraphNotes.notes.push(note);
		const notesList = document.getElementById('notes-list').options;
		if (!editedNote || (editedNote && editedNote.draft == true)) {
			const option = new Option(note.labelText, note.labelId);
			notesList.add(option);
		}
		labelNode.style('color', 'black');
		$('#note-success-body').text('Note saved successfully!');
		$('#note-success').toast('show');
	}).fail((error) => {
		$('#note-error-body').text('Error while saving note!');
		$('#note-error').toast('show');
		console.log('Error while saving note', error);
	});
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
	const notesList = document.getElementById('notes-list').options;
	networkGraphNotes.notes.forEach((note) => {
		if (note.canEdit) {
			notesList.add(new Option(note.labelText, note.labelId));
		}
		const nodes = note.nodes.length ? networkGraph.nodes().filter(node => note.nodes.includes(node._private.data.id)) : null;
		const edges = note.edges.length ? networkGraph.nodes().filter(node => note.edges.includes(node._private.data.id)) : null;
		const labelId = note.labelId;
		if (nodes || edges) {
			const path = bubblePaths.addPath(nodes, edges, null, {
				//drawPotentialArea: true,
				virtualEdges: true,
				style: { 'fill': note.labelColor, 'opacity': 0.6 }
			});
			bubblePathMap.set(labelId, path);
		}
		// TODO: Extract to function and reuse
		createLabel(labelId, note.labelText, note.labelColor, note.labelPosition);
	});
	networkGraph.elements("node").style({
		"border-color": "black",
		"border-width": .5
	});
}

function createLabel(labelId, labelText, labelColor, labelPosition) {
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
		"text-max-width": 80,
		"text-valign": "center",
		"events": "yes",
		"text-events": "yes",
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