
function wrapper(){
	console.log(DEV)
	console.log(RUNNING_MODELS)
	console.log(SAVED_MODELS)
	console.log(RECENT_MODELS)

	let running_div = d3.select('#running_div')
	let saved_div = d3.select('#saved_div')
	let recent_div = d3.select('#recent_div')

	let labels = {
		"query" : "Query: " ,
		"database" : "Text db: ",
		"time" : "Created At: ",
		"topics" : "Topics: ",
		"status" : "Status: ",
		"vis_type" : "Vis Type: ",
		"links" : "",
		"action" : "",
	}
	let steps_format = d3.format(".2p")
	let time_p = d3.timeParse("%m/%d/%y %M:%S %p")

	let steps = {
		"Scheduled" : 0/6,
		"Fetching Documents" : 1/6,
		"Learning Ngrams" : 2/6,
		"Creating Dictionary" : 3/6,
		"Running Model" : 4/6,
		"Formatting Data" : 5/6,
		"Uploading Data" : 6/6,
		"Finished" : ""
	}
	function add_to_table(table_to_add, model_list_obj, add_info){
		model_list_obj = model_list_obj.sort(function(a,b){ 
			console.log(time_p(a.time))
			return time_p(b.time) - time_p(a.time)
		})
		console.log(model_list_obj)
		if(model_list_obj.length > 0){
			table_to_add.select(".table-holder").remove()
		}
		var columns = ['query', 'database', 'time', 'time range','topics', 'vis_type',  'status', 'links', 'action'];
		if(add_info == 'running_div'){
			table_class = 'running'
			//columns = ['query', 'database', 'time', 'topics', 'status', 'vis_type', 'links', 'action']
		}
		if(add_info == 'saved_div'){
			table_class = 'saved'
			//columns = ['query', 'database', 'time', 'topics', 'status', 'vis_type', 'links', 'action']
		}
		if(add_info == 'recent_div'){
			table_class = 'recent'
			//columns = ['query', 'database', 'time', 'topics', 'status', 'vis_type', 'links', 'action']
		}
		let table_rows = table_to_add.selectAll('div')
							.data(model_list_obj)
							.enter()
							.append("div")
							.attr("class", " row model_item mb-2 mr-2 ml-2 pr-2 pl-2")
							.attr("id", function(d){
								console.log(d)
								return d.task_id
							}).attr("title", function(d){
								return JSON.stringify(d);
							})

		columns.forEach(function(c){
			if(c == 'links'){
				if (add_info =='saved_div'){
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-1 col-query mb-2").attr("align", "center").append("a").attr("class", "btn btn-success").attr("href", function(d){
								return "/searcher/vis/?method=" + d.vis_type + "&q_pk=" + d.q_pk })
							.text(function(d){
								return "Open"
					})
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center").append("a").attr("class", "btn btn-warning")//.attr("href", "")
							.text(function(d){
								return "Delete Model"
					}).on("click", postDeleteQuery)
				}
				if(add_info == 'recent_div'){
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-1 col-query mb-2").attr("align", "center").append("a")
							.attr("class", function(d){
								if (d.status == "Cancelled"){
									return "btn btn-danger"
								}
								return "btn btn-info"
								
							})
							.text(function(d){
								if(d.status == "Cancelled"){
									return "Cancelled"
								}
								return "Save"
							}).on("click", postSaveQuery)
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center").append("a").attr("class", "btn btn-warning")
							.text(function(d){
								return "Delete Model"
					}).on("click", postDeleteQuery)
				}
			}
			else if(c == 'action'){
				if(add_info == 'running_div'){
				let table_col_form = table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-1 col-query mb-2")
							.attr("align", "center")

				table_col_form.append("button")
					.attr("class", "btn btn-warning")
					.text(function(d){
						return "Cancel"
					})
					.on("click", postCancelTask)
					
				}
			}
			else if(c == 'status'){
				//if status_color()
				if(add_info == 'running_div'){
				table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center")
							.append("button")
							.attr("class", function(d){
								if (d[c] == "Finished"){
									return "btn btn-success"
								}
								else {
									return "btn btn-secondary"
								}
							})
							.text(function(d){
								console.log(d[c])
								return d[c] + " " + steps_format(steps[d[c]])
							})
				}
			}
			else {
				var col_width = "col-lg-1"
				if(c == 'vis_type' || c == 'time' || c == 'time range'){
					col_width = "col-lg-2"
				}
				table_rows.append("div").attr("class", "col-sm-4 col-md-3 "+ col_width +" col-query").append("h6").attr("class", "mt-3").text(function(d){
					
					return  d[c].replace("_", " ")
				})
			}
	})

		
		
		return;
	}

	function formatURL(d){

	}
	function postSaveQuery(d){
		if(d.status == "Cancelled"){
			return
		}
		let postObj = { "q_pk" : d.q_pk, "task_id" : d.task_id}
		  $.get('/searcher/save_query/', postObj , function(d){
            let response = d;
            location.reload()
        })
	}

	function postDeleteQuery(d){
		var r = true
		if (DEV == false){
			 r = confirm("Are you sure you want to delete the model?")
		}
		if (r){
			let postObj = { "q_pk" : d.q_pk, "task_id" : d.task_id}
			  $.get('/searcher/delete_query/', postObj , function(d){
	            let response = d;
	            console.log(response)
	            location.reload()
	        })
		}
	}
	function postCancelTask(d){
		let postObj = { "q_pk" : d.q_pk, "task_id" : d.task_id}
		  $.get('/searcher/cancel_task/', postObj , function(d){
            let response = d;
            console.log(response)
            location.reload()
        })
	}
	function getTaskStatus(d){
		let postObj = { "q_pk" : d.q_pk, "task_id" : d.task_id}
		  $.get('/searcher/poll_task/', postObj , function(d){
            let response = d;
            console.log(response)
        })
	}
	/*function pollRunningTasks(){
		let running_pks = []
		RUNNING_MODELS.forEach(function(d){
			running_pks.append(d.q_pk)
		})

	}*/
	if(RUNNING_MODELS.length > 0){
		window.setTimeout(function () {
  			window.location.reload();
		}, 30000);
	}

	add_to_table(running_div, RUNNING_MODELS, 'running_div');
	add_to_table(saved_div, SAVED_MODELS, 'saved_div');
	add_to_table(recent_div, RECENT_MODELS, 'recent_div');
}

wrapper()