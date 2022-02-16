'use-strict'

async function wrapper(){

    let data = await d3.json(static_url + 'extra_json_points.json')
    console.log(data.x)

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3.select('#my_dataviz')
        .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append('g')
            .attr("transform", "translate(" + margin.left +"," + margin.top + ")");
}

wrapper()  

// d3.json("file.json").then(function(data){ console.log(data)})

