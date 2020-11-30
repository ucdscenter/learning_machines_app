
function wrapper(){
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

	function add_to_table(table_to_add, model_list_obj, add_info){
		var table_class;
		var columns = ['query', 'database', 'time', 'topics', 'vis_type',  'status', 'links', 'action'];
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
							})

		columns.forEach(function(c){
			if(c == 'links'){
				if (add_info =='saved_div'){
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center").append("a").attr("class", "btn btn-secondary").attr("href", "")
							.text(function(d){
								return "Open Model"
					})
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center").append("a").attr("class", "btn btn-warning")//.attr("href", "")
							.text(function(d){
								return "Delete Model"
					}).on("click", postDeleteQuery)
				}
				if(add_info == 'recent_div'){
					table_rows.append("div")
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2").attr("align", "center").append("a")
							.attr("class", function(d){
								if (d.status == "Cancelled"){
									return "btn btn-danger"
								}
								return "btn btn-secondary"
								
							})
							.text(function(d){
								if(d.status == "Cancelled"){
									return "Cancelled"
								}
								return "Save Model"
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
							.attr("class", "col-sm-4 col-md-3 col-lg-2 col-query mb-2")
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
								return d[c]
							})
				}
			}
			else {
				table_rows.append("div").attr("class", "col-sm-4 col-md-3 col-lg-1 col-query").append("h6").attr("class", "mt-3").text(function(d){
					//console.log(d[c])
					return  d[c]
				})
			}
	})

		
		
		return;
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
		let postObj = { "q_pk" : d.q_pk, "task_id" : d.task_id}
		  $.get('/searcher/delete_query/', postObj , function(d){
            let response = d;
            console.log(response)
            location.reload()
        })
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

	add_to_table(running_div, RUNNING_MODELS, 'running_div');
	add_to_table(saved_div, SAVED_MODELS, 'saved_div');
	add_to_table(recent_div, RECENT_MODELS, 'recent_div');
}

wrapper()