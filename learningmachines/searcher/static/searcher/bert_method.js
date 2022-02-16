'use-strict'

async function wrapper(){

    // let data = await d3.json(static_url + 'extra_json_points.json')
    // console.log(data)

    d3.json(static_url + 'extra_json_points_2.json').then(function(data){ 
        console.log(data) 

        // Colors to differentiate riders with and without doping allegations
        var colors = ["#440154ff", "#21908dff", "#fde725ff", "#808080FF", "#FDE725FF"]

        // The attributes of the riders corresponding to the above colors
        var legendKeys = ["AMBULATORY ANESTHESIA", "ANESTHETIC ACTION AND BIOCHEMISTRY", "CHRONIC AND CANCER PAIN", "CLINICAL CIRCULATION", "CLINICAL NEUROSCIENCES"]

        // Create an invisible div for the tooltip
        const tooltip = d3.select("body")
                        .append("div")
                        .attr("id", "tooltip")
                        .style("visibility", "hidden")

        // 2. Append svg-object for the bar chart to a div in your webpage
    // (here we use a div with id=container)
    var width = 700;
    var height = 500;
    var margin = {left: 90, top: 80, bottom: 50, right: 20};
    var axisOffset = 10   // How for the axes are moved away from each other

    const svg = d3.select("#my_dataviz")
                  .append("svg")
                  .attr("id", "svg")
                  .attr("width", width)
                  .attr("height", height)

    // 3. Define scales to translate domains of the data to the range of the svg
    var xMin = d3.min(data, (d) => d["x"]);
    var xMax = d3.max(data, (d) => d["x"]);
    console.log(xMin);

    var parseTime = d3.timeParse("%M:%S");
    var yMin = d3.min(data, (d) => parseTime(d["Time"]));
    var yMax = d3.max(data, (d) => parseTime(d["Time"]));

    var xScale = d3.scaleLinear()
                   .domain([xMin, xMax])
                   .range([margin.left + axisOffset, width- margin.right])

    var yScale = d3.scaleTime()
                   .domain([yMax, yMin])
                   .range([height- margin.bottom - axisOffset, margin.top])

    // 4. Draw and transform/translate horizontal and vertical axes
    var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"))
    var yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.timeFormat("%M:%S"))

    svg.append("g")
       .attr("transform", "translate(0, "+ (height - margin.bottom) + ")")
       .attr("id", "x-axis")
       .call(xAxis)

    svg.append("g")
       .attr("transform", "translate("+ (margin.left)+", 0)")
       .attr("id", "y-axis")
       .call(yAxis)

    // 5. Draw individual scatter points and define mouse events for the tooltip
    svg.selectAll("scatterPoints")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", (d) => xScale(d["Year"]))
       .attr("cy", (d) => yScale(parseTime(d["Time"])))
       .attr("r", 5)
       .attr("fill", (d) => (d["Doping"] == "") ? colors[0] : colors[1])
       .attr("class", "dot")
       .attr("data-xvalue", (d) => d["Year"])
       .attr("data-yvalue", (d) => parseTime(d["Time"]))
       .on("mouseover", function(d){
           info = d["originalTarget"]["__data__"]
           tooltip.style("visibility", "visible")
                  .style("left", event.pageX+10+"px")
                  .style("top", event.pageY-80+"px")
                  .attr("data-year", info["Year"])
                  .html(info["Name"]+" ("+info["Year"]+") <br> Time: "+info["Time"]+"<br><br>"+info["Doping"])
       })
       .on("mousemove", function(){
           tooltip.style("left", event.pageX+10+"px")
       })
       .on("mouseout", function(){
           tooltip.style("visibility", "hidden")
       })

     // 6. Finalize chart by adding title, axes labels and legend
     svg.append("text")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom / 5)
        .attr("class", "label")
        .text("Year");

     svg.append("text")
         .attr("y", margin.left/4)
         .attr("x", -height/2)
         .attr("transform", "rotate(-90)")
         .attr("class", "label")
         .text("Time to finish");

     svg.append("text")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", margin.top / 2.6)
        .attr("id", "title")
        .text("Doping in professional bike racing");

     svg.append("text")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", margin.top / 1.4)
        .text("35 fastest times to finish Alpe d'Huez")
        .style("font-size", "16px")
        .style("text-anchor", "middle")

     svg.selectAll("legendSymbols")
        .data(legendKeys)
        .enter()
        .append("circle")
        .attr("cx", width - margin.right - 200)
        .attr("cy", (d, i) => 150 + i * 25)
        .attr("r", 5)
        .attr("fill", (d, i) => colors[i])

     svg.selectAll("legendTexts")
        .data(legendKeys)
        .enter()
        .append("text")
        .text((d) => d)
        .attr("x", width - margin.right - 200 + 15)
        .attr("y", (d, i) => 150 + i * 25 + 5)
        .attr("class", "textbox")

     const legend = svg.append("rect")
                       .attr("x", width - margin.right - 200 - 15)
                       .attr("y", 150-5-10)
                       .attr("rx", 5)
                       .attr("ry", 5)
                       .attr("width", 195)
                       .attr("height", 55)
                       .attr("id", "legend")
    
    })

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

