'use-strict'

async function wrapper(){

    // let data = await d3.json(static_url + 'extra_json_points.json')
    // console.log(data)

    d3.json(static_url + 'extra_json_points.json').then(function(data){ console.log(data) })

    // var margin = {top: 10, right: 30, bottom: 30, left: 60},
    // width = 460 - margin.left - margin.right,
    // height = 400 - margin.top - margin.bottom;

    // var svg = d3.select('#my_dataviz')
    //     .append('svg')
    //         .attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    //     .append('g')
    //         .attr("transform", "translate(" + margin.left +"," + margin.top + ")");

    // // Add X axis
    // var x = d3.scaleLinear()
    //     .domain([-50, 50])
    //     .range([ 0, width ]);
    
    // svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));

    // // Add Y axis
    // var y = d3.scaleLinear()
    //     .domain([-50, 50])
    //     .range([ height, 0]);
    
    // svg.append("g")
    //     .call(d3.axisLeft(y));

    // // Color scale: give me a specie name, I return a color
    // var color = d3.scaleOrdinal()
    //     .domain(["AMBULATORY ANESTHESIA", "ANESTHETIC ACTION AND BIOCHEMISTRY", "CHRONIC AND CANCER PAIN", "CLINICAL CIRCULATION", "CLINICAL NEUROSCIENCES"])
    //     // .domain(["setosa", "versicolor", "virginica" ])
    //     // .range([ "#440154ff", "#21908dff", "#fde725ff"])
    //     .range([ "#440154ff", "#21908dff", "#fde725ff", "#808080FF", "#FDE725FF"])


    // // Highlight the specie that is hovered
    // var highlight = function(d){

    //     // selected_specie = d.Species
    //     selected_specie = d["cluster_name"]

    //     d3.selectAll(".dot")
    //         .transition()
    //         .duration(200)
    //         .style("fill", "lightgrey")
    //         .attr("r", 3)

    //     d3.selectAll("." + selected_specie)
    //         .transition()
    //         .duration(200)
    //         .style("fill", color(selected_specie))
    //         .attr("r", 7)
    // }

    // // Highlight the specie that is hovered
    // var doNotHighlight = function(){
    //     d3.selectAll(".dot")
    //         .transition()
    //         .duration(200)
    //         .style("fill", "lightgrey")
    //         .attr("r", 5 )
    // }

    // // Add dots
    // svg.append('g')
    //     .selectAll("dot")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     // .attr("class", function (d) { return "dot " + d.Species } )
    //     .attr("class", function (d) { return "dot " + d["cluster_name"] } )
    //     // .attr("cx", function (d) { return x(d.Sepal_Length); } )
    //     .attr("cx", function (d) { return x(d["x"]); } )
    //     // .attr("cy", function (d) { return y(d.Petal_Length); } )
    //     .attr("cy", function (d) { return y(d["y"]); } )
    //     .attr("r", 5)
    //     // .style("fill", function (d) { return color(d.Species) } )
    //     .style("fill", function (d) { return color(d.cluster_name) } )
    //     .on("mouseover", highlight)
    //     .on("mouseleave", doNotHighlight )

}

wrapper()  

// d3.json("file.json").then(function(data){ console.log(data)})

