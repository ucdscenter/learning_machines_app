'use strict'

	function handleClusterDocsTable(clusterData){

		if (clusterData.collapsed == undefined){

			formatDocsForTable([clusterData.topic], clusterData.color)
		}
		else{
			let docsInfo = []
			clusterData.subtopics.forEach(function(i){
				docsInfo.push(modelsData[i[0]].docs[i[1]])	
			})
			formatDocsForTable(docsInfo, clusterData.color)
		}
	}

	function formatDocsForTable(docsIndexes, tcolor){
		console.log(docsIndexes)
		let tableData = {}
		if (docsIndexes.length > 1 && docsIndexes[0][0][0][1] > -1){
			docsIndexes.forEach(function(topic){
				topic.forEach(function(doc){
				if(tableData[metaData[doc[0][0]][8] + "-" + doc[0][1]] == undefined){
					tableData[metaData[doc[0][0]][8] + "-" + doc[0][1]] = [metaData[doc[0][0]], doc[1], doc[0][1]]
				}
				else{
					tableData[metaData[doc[0][0]][8] + "-" + doc[0][1]][1] += doc[1]
				}
				

			})
		});
		}
		else{
			docsIndexes.forEach(function(topic){
				topic.forEach(function(doc){
					if(tableData[metaData[doc[0][0]][8]] == undefined){
						tableData[metaData[doc[0][0]][8]] = [metaData[doc[0][0]], doc[1], doc[0][1]]
					}
					else{
						tableData[metaData[doc[0][0]][8]][1] += doc[1]
					}
					

				})
			});
		}
		renderDocsTable(Object.values(tableData), tcolor)
	}

	function renderDocsTable(tableData, tcolor){
		d3.selectAll("#dtbody").remove()
	  	d3.select(".docstable").style("border-left", "6px solid rgba(" + hexToRgb(tcolor).r + "," + hexToRgb(tcolor).g +"," + hexToRgb(tcolor).b + ",0.6)")
		d3.select("#dtitle").on("click", function(d){
		  console.log("sort by title?")
		})
		d3.select("#dscore").on("click", function(d){
		  console.log("sort by score")
		})
		let table = d3.select("#dtable")
		let tb  = table.append("tbody").attr("id", "dtbody")
	  
		let dtr = tb.selectAll("tr").data(tableData)
		  .enter()
		  .append("tr")
		  .attr("class", "table_txt")
		  .on("click", function(d){
			console.log(d);
			renderDocumentView(d[0][8],d[2]);
			table.selectAll("tr").style("background-color", undefined); // remove border from all tr elements
			d3.select(this)
        		.style("background-color", "rgba(" + hexToRgb(tcolor).r + "," + hexToRgb(tcolor).g +"," + hexToRgb(tcolor).b + ",0.6)"); // add blue border to the selected tr element // add blue border to the selected tr element
		  	});


		dtr.attr("data-toggle", "modal")
			.attr("data-target", "#docModal")
	  
		dtr.append("td")
		  .html(function(d) {
			return d[0][1] + "<br/>" ;
		  });
	  
		dtr.sort(function(a,b){
		  return b[1] - a[1]
		})
	  };
	  
	
	function renderClustersTable(graphData){
		let ctable = d3.select("#clusters-table").append("table")
			.attr('id', 'ctable')
			.attr("class", "table  clustertable")

		let header = ctable.append("thead").append("tr")

		header.append("th").attr("scope", "col").text("").on("click", function(d){
			ctr.sort(function(a,b){
				return a.data.id - b.data.id;
			})
		})
		header.append("th").attr("scope", "col").text("")
		header.append("th").attr("scope", "col").text( "Docs").on("click", function(d){
			ctr.sort(function(a,b){
				return (b.data.docsCount[0] + b.data.docsCount[1]) - (a.data.docsCount[0] + a.data.docsCount[1])
			})
		})
		header.append("th").attr("scope", "col").attr("id", "topics_th").text("Topics").on("click", function(d){
			ctr.sort(function(a,b){
				return b.data.subtopics.length - a.data.subtopics.length;
			})
		})
		header.append("th").attr("scope", "col").text("terms")

		let ctbody = ctable.append("tbody")
		let ctr = ctbody.selectAll("tr")
			.data(graphData.clusters)
			.enter()
			.append("tr")
			.attr("class", function(d){
				return "table_txt cluster" + d.data.id;
			})
			.attr("id", function(d){
				return "table_row_cluster_" + d.data.id;
			})
			.on("click", function(d){
				deselectAll();
				clusterSelect(d.data);
				d3.selectAll("tr").style("background-color", undefined); // remove border from all tr elements
				d3.select(this)
        		.style("background-color", function(d){
				return "rgba(" + hexToRgb(d.data.color).r + "," + hexToRgb(d.data.color).g +"," + hexToRgb(d.data.color).b + ",0.6)";
				})
			});
	
		ctr.append("td")
			.attr("class", "cindex")
			.text(function(d){
				return d.data.id;
			});
	
		ctr.append("td")
			.attr("class", "indicator")
			.append("div")
			.attr("class", "colorbar")
			.style("background-color", function(d){
				return "rgba(" + hexToRgb(d.data.color).r + "," + hexToRgb(d.data.color).g +"," + hexToRgb(d.data.color).b + ",0.6)";;
			});
	
		ctr.append("td")
			.text(function(d){
				return d.data.docsCount[0] + d.data.docsCount[1];
			});
	
		ctr.append("td")
			.text(function(d){
				return d.data.subtopics.length;
			});
	
		ctr.append("td")
			.text(function(d){
				return d.data.label;
			});

		var ctd = ctr.selectAll("td").data(function(d, i){
			return [d.data.id, d.data.docsCount[1], d.data.subtopics.length, d.data.label]
		})
		.enter()
		.append("td").text(function(d){
			return(d)
		})

		d3.select("#topics_th").dispatch("click")
	}
	

	async function renderDocumentView(doc_id, para_index){
		let MIN_PARAGRAPH_LETTER_COUNT = 10
		console.log(doc_id)
		console.log(para_index)
		var corp = params.corpus;
		if (params.corpus == undefined){
			corp = 'AA'
		}
		if (params.corpus == 'HathiTrust'){
			corp = 'hathitrust_novels'
		}
		let page_str = ""
		var doc_response = await d3.json("/searcher/get_doc?database=" + corp + "&doc_id=" + doc_id );
		console.log(doc_response)

		if(para_index != undefined && para_index != -1){
			if (params.corpus == 'hathitrust_novels' || params.corpus == 'HathiTrust'){
				page_str = "pg. " + para_index;
				let novel_d = JSON.parse(doc_response.data)

				let rsp_d = novel_d[para_index];
				console.log(rsp_d)
				d3.select('#doc_contents').text(JSON.stringify(rsp_d))
			}
			else{
				let text = doc_response.data.split("\n")[para_index]
				//d3.select('#doc_contents').text(text)
			}
			
		}
		else{
			d3.select('#doc_contents').text(doc_response.data.replace("<PubmedArticle>", "").replace("</PubmedArticle>", ""))
		}

		d3.select('#doc_title').text(doc_response.summary.article_title + " " + page_str)
	
	}


	function getJsonFromUrl(hashBased) {
	  var query;
	  if(hashBased) {
	    var pos = location.href.indexOf("?");
	    if(pos==-1) return [];
	    query = location.href.substr(pos+1);
	  } else {
	    query = location.search.substr(1);
	  }
	  var result = {};
	  query.split("&").forEach(function(part) {
	    if(!part) return;
	    part = part.split("+").join(" "); // replace every + with space, regexp-free version
	    var eq = part.indexOf("=");
	    var key = eq>-1 ? part.substr(0,eq) : part;
	    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
	    var from = key.indexOf("[");
	    if(from==-1) result[decodeURIComponent(key)] = val;
	    else {
	      var to = key.indexOf("]",from);
	      var index = decodeURIComponent(key.substring(from+1,to));
	      key = decodeURIComponent(key.substring(0,from));
	      if(!result[key]) result[key] = [];
	      if(!index) result[key].push(val);
	      else result[key][index] = val;
	    }
	  });
	  return result;
}
