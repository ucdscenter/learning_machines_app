'use strict'

let annotate_mode = false;

$('#annotation-button').on("click", function (e) {
	console.log("clicked")
	annotate_mode = true
	if (annotate_mode == true) {
		showAnnotationOptions();
		$('#main-nav').css("background-color", 'grey')
	}
})

$('#e-a-b').on("click", function (e) {
	annotate_mode = false
	hideAnnotationOptions();
	$('#main-nav').css("background-color", 'white')
})

$('#s-a-b').on("click", function (e) {
	if (newPath) {
		networkGraphNotes.push(newPath);
		newPath = undefined;
		currentLabelId = undefined;
		$('#note-label-input').val('');
		$('#note-color-input').val('#000000');
		newPathEdgeSet.clear();
		newPathNodeSet.clear();
		alert('Note Saved!');
		annotate_mode = false;
		hideAnnotationOptions();
	} else {
		alert('Please create a note before saving!');
	}
})

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
		console.log(newPath.node.style)
		newPath.node.style.fill = e.target.value
		labelNode.css({
			'fill': e.target.value,
			'text-background-color': e.target.value,
		});
	}
})

function hideAnnotationOptions() {
	$('#e-a-b').addClass("hidden");
	$('#n-a-b').addClass("hidden");
	$('#l-a-b').addClass("hidden");
	$('#s-a-b').addClass("hidden");
	$('#c-a-b').addClass("hidden");
}

function showAnnotationOptions() {
	$('#e-a-b').removeClass("hidden");
	$('#n-a-b').removeClass("hidden");
	$('#l-a-b').removeClass("hidden");
	$('#c-a-b').removeClass("hidden");
	$('#s-a-b').removeClass("hidden");
}


/*function createAnnotation(){
	.append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations)
}*/

//handleOnOff()