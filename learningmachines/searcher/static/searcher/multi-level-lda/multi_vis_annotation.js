'use strict'

let annotate_mode = false;

$('#annotation-button').on("click", function(e){
	console.log("clicked")
	annotate_mode = true
	if(annotate_mode == true){
		$('#e-a-b').removeClass("hidden");
		$('#main-nav').css("background-color", 'grey')
	}
})

$('#e-a-b').on("click", function(e){
	annotate_mode = true
	$('#e-a-b').addClass("hidden");
	$('#main-nav').css("background-color", 'white')
})


/*function createAnnotation(){
	.append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations)
}*/

handleOnOff()