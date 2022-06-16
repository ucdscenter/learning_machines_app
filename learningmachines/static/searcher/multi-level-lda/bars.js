'use strict'

async function wrapper(){
	var modelsData = await d3.json("/static/multi-level-lda/formatted_proj.json")

	var cMax = d3.max(modelsData, function(d){
		var max = 0
		d.clusters.forEach(function(t){
			if(t > max){
				max = t
			}
		})
		return max
	})

	var tMax = d3.max(modelsData, function(d){
		var max = 0
		d.topic_weights.forEach(function(t){
			if(t > max){
				max = t
			}
		})
		return max
	})
	function formatData(data){
		let graphObj = {};

		graphObj.nodes = []
		graphObj.edges = []

		let clusterNodes = {};
		let modelI = 0
		data.forEach(function(model){
			let topicI = 0
			model.clusters.forEach(function(c){
				let g = topNwords(data[modelI].top_words[topicI])
				let labelArr = []
				let docscount = [0,0]

				docscount[model.level] = model.docs[topicI].length
				g = g.split("\n")
				g.shift()
				if (clusterNodes[c] == undefined){
					g.forEach(function(w){
						labelArr.push([w, 1])
					})
					clusterNodes[c] = {
					"size" : 1,
					"indexes" : [[modelI, topicI]],
					"lwords" : labelArr,
					"docsCount" : docscount
					}
				}
				else{
					g.forEach(function(w){
						let exists = false;
						clusterNodes[c].lwords.forEach(function(l){
							if(l[0] == w){
								l[1]++
								exists = true
							}
						})
						if(exists == false){
							clusterNodes[c].lwords.push([w, 1])
						}
					})
					
					clusterNodes[c].size++;
					clusterNodes[c].indexes.push([modelI, topicI]);
					clusterNodes[c].docsCount[model.level] += docscount[model.level];
				}
				topicI++
			})
			modelI++
		})

		Object.keys(clusterNodes).forEach(function(key){
			
			clusterNodes[key].lwords.sort(function(a,b){
				return b[1] - a[1]
			})
			let labelstr = ""
			for(var i = 0; i < 5; i++){
				labelstr = labelstr + "\n" + clusterNodes[key].lwords[i][0]
			}
			
			graphObj.nodes.push({
				data : {
					id : key,
					size : clusterNodes[key].size,
					color : d3.interpolateRdYlGn(key/cMax),
					label : labelstr,
					type : "ellipse",
					subtopics : clusterNodes[key].indexes,
					docsCount : clusterNodes[key].docsCount,
					collapsed : true,
					fsize : 15
				}
			})
		})
		return graphObj
	};//formatData


	function topNwords(wordsstr, n=10){
		let words = wordsstr.split(" + ");
		let splitw = ""
		for(var i = 0; i < n; i++){
			splitw = splitw + "\n" + words[i].split("*")[1].slice(1,-1)
		}
		return splitw;
	}

	function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}

	let data = formatData(modelsData)
	console.log(data)
	d3.select("#g-canvas").attr("height", 0).attr("width", 0)
	console.log(modelsData)
	let margins = {top : 50, bottom : 50, left : 60, right : 10}
	let height = 200
	let width = window.innerWidth * .8
	let graphsvg = d3.select('#graph')
			.append("svg")
			.attr("id", "graphid")
			.attr('height', height + margins.top + margins.bottom)
			.attr('width',  width + margins.left + margins.right)

	let graphg = graphsvg.append("g").attr("transform", "translate(" + margins.top + "," + margins.left + ")")


	var x = d3.scaleBand()
		.domain(data.nodes.map(function(d){
			return d.data.label
		}))
		.range([0, width])
		.padding(.2)


	console.log(x.domain())

	var y = d3.scaleLinear()
				.domain([0, d3.max(data.nodes, function(d){
					return d.data.size
				})])
				.rangeRound([height, 0])


	

	graphg.append("g")
	.call(d3.axisLeft(y))
	.append("text")
	.attr("fill", "#000")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Num Topics");

	


	graphg.selectAll(".bar")
	.data(data.nodes)
	.enter().append("rect")
	.attr("class", "bar")
	.attr("x", function (d) {
		return x(d.data.label);
	})
	 .attr("width", x.bandwidth())
	.attr("y", function (d) {
		return y(d.data.size);
	})
	.attr("height", function (d) {
		return height - y(Number(d.data.size));
		//return 200
	})
	.style("fill", function(d){
		return d.data.color
	})
	.on("mouseover", function(d){
		d3.select(this).style("stroke", "red")
		console.log("hi")
	})
	.on("mouseout", function(d){

		d3.select(this).style("stroke", d.data.color)
	})
	.on("click", function(d){
		//console.log(d)
		renderTopicGraph(d)
	});
	let ba = graphg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
	ba.selectAll(".tick").select("text").attr("transform", "rotate(-90), translate(100,-10)")


function renderTopicGraph(clusterData){

	let clusterTopics = []
	clusterData.data.subtopics.forEach(function(t){
		let label = topNwords(modelsData[t[0]].top_words[t[1]], 5)
		let size = modelsData[t[0]].topic_weights[t[1]]


		clusterTopics.push({
			topicd : modelsData[t[0]].top_words[t[1]],
			label : label,
			size : size
		})
	})

	console.log(clusterTopics)

	var clusterX = d3.scaleBand()
		.domain(clusterTopics.map(function(d){
		return d.label
		}))
		.range([0, width])
		.padding(.2)

	var clusterY = d3.scaleLinear()
			.domain([0, d3.max(clusterTopics, function(d){
				return d.size
			})])
			.rangeRound([height, 0])



	d3.select("#topic-graph").remove()
	let tsvg = d3.select("#topic-div")
				.append("svg")
				.attr("id", "topic-graph")
				.attr("height", height + margins.top + margins.bottom)
				.attr("width", width + margins.left + margins.right)
	let topicg = tsvg.append('g').attr("transform", "translate(" + margins.top + "," + margins.left + ")")

	

	

	topicg.append("g")
	.call(d3.axisLeft(clusterY))
	.append("text")
	.attr("fill", "#000")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Num Tokens");


	

	topicg.selectAll(".bar")
	.data(clusterTopics.sort(function(a,b){
		return b.size - a.size
	}))
	.enter().append("rect")
	.attr("class", "bar")
	.attr("x", function (d) {
		return clusterX(d.label);
	})
	 .attr("width", clusterX.bandwidth())
	.attr("y", function (d) {
		return clusterY(d.size);
	})
	.attr("height", function (d) {
		return height - clusterY(Number(d.size));
		//return 200
	})
	.style("fill", function(d){
		return clusterData.data.color
	})
	.on("click", function(d){
		return renderWordGraph(d, clusterData.data.color)
	})

	let ba = topicg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(clusterX))

	ba.selectAll(".tick").select("text").attr("transform", "rotate(-90), translate(100,-10)").attr("class", function(d){
		 //d3.select(this).parentElement.appendChild(this);
		 return "";
	})
}

function renderWordGraph(topicD, color){
	console.log("clicked")
	let tdata = topicD.topicd.split('+').slice(0, 10).map(function(d){
		return {
			score : Number(d.split('*')[0]),
			word : d.split('*')[1]
		}
	})
	console.log(tdata)
	d3.select('#word-graph').remove()

	let wx = d3.scaleBand()
				.domain(tdata.map(function(d){
					return d.word
				}))
				.range([0, width])
				.padding(.2)
	let wy = d3.scaleLinear()
				.domain([0, d3.max(tdata, function(d){
					return d.score
				})])
				.rangeRound([height, 0])

	let wsvg = d3.select('#word-div')
					.append("svg")
					.attr("id", "word-graph")
					.attr('width', width + margins.left + margins.right)
					.attr('height', height + margins.top + margins.bottom)
	let wg = wsvg.append("g")
				.attr("transform", "translate(" + margins.top + "," + margins.left + ")")

	wg.append("g").attr("transform", "translate(0, " + height + ")").call(d3.axisBottom(wx))
	wg.append("g")
	.call(d3.axisLeft(wy))
	.append("text")
	.attr("fill", "#000")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Word Prob");


	wg.selectAll(".bar")
		.data(tdata)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function (d) {
			return wx(d.word);
		})
	 .attr("width", wx.bandwidth())
	.attr("y", function (d) {
		return wy(d.score);
	})
	.attr("height", function (d) {
		return height - wy(d.score);
		//return 200
	})
	.style("fill", function(d){
		return color
	})
}





}

wrapper()