'use-strict'

async function wrapper(){

    // let data = await d3.json(static_url + 'extra_json_points.json')
    // console.log(data)

    d3.json(static_url + 'extra_json_points_2.json').then(function(data){ 
        // console.log(data) 

        // Colors to differentiate riders with and without doping allegations
        var colors = ["#440154ff", "#21908dff", "#fde725ff", "#808080FF", "#FDE725FF"]

        // The attributes of the riders corresponding to the above colors
        var legendKeys = ["AMBULATORY ANESTHESIA", "ANESTHETIC ACTION AND BIOCHEMISTRY", "CHRONIC AND CANCER PAIN", "CLINICAL CIRCULATION", "CLINICAL NEUROSCIENCES"]

        // Add a tooltip div. Here I define the general feature of the tooltip: 
        // stuff that do not depend on the data point.
        // Its opacity is set to 0: we don't see it by default.
        var tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

        // 2. Append svg-object for the bar chart to a div in your webpage
        // (here we use a div with id=container)
        var width = 1200;
        var height = 1200;
        var margin = {left: 90, top: 80, bottom: 50, right: 140};
        var axisOffset = 10   // How for the axes are moved away from each other

        const svg = d3.select("#my_dataviz")
                    .append("svg")
                    .attr("id", "svg")
                    .attr("width", width)
                    .attr("height", height)

        // 3. Define scales to translate domains of the data to the range of the svg
        var xMin = d3.min(data, (d) => d["x"]);
        var xMax = d3.max(data, (d) => d["x"]);

        // var parseTime = d3.timeParse("%M:%S");
        var yMin = d3.min(data, (d) => d["y"]);
        var yMax = d3.max(data, (d) => d["y"]);

        var xScale = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([margin.left + axisOffset, width- margin.right])

        var yScale = d3.scaleTime()
                    .domain([yMax, yMin])
                    .range([height- margin.bottom - axisOffset, margin.top])

        // 4. Draw and transform/translate horizontal and vertical axes
        var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"))
        var yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format("d"))

        svg.append("g")
        .attr("transform", "translate(0, "+ (height - margin.bottom) + ")")
        .attr("id", "x-axis")
        .call(xAxis)

        svg.append("g")
        .attr("transform", "translate("+ (margin.left)+", 0)")
        .attr("id", "y-axis")
        .call(yAxis)
        
        // Function to return the respective cluster color
        const getColor = function(d){
            if(d["cluster_name"] === "AMBULATORY ANESTHESIA"){
                return colors[0];
            }
            else if(d["cluster_name"] === "ANESTHETIC ACTION AND BIOCHEMISTRY"){
                return colors[1];
            }
            else if(d["cluster_name"] === "CHRONIC AND CANCER PAIN"){
                return colors[2];
            }
            else if(d["cluster_name"] === "CLINICAL CIRCULATION"){
                return colors[3];
            }
            else if(d["cluster_name"] === "CLINICAL NEUROSCIENCES"){
                return colors[4];
            }
            else{
                return colors[0];
            }
        }

        // 5. Draw individual scatter points and define mouse events for the tooltip
        svg.selectAll("scatterPoints")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d["x"]))
        .attr("cy", (d) => yScale(d["y"]))
        .attr("r", 5)
        .attr("fill", (d) => (getColor(d)))
            .attr("class", "dot")
        .attr("data-xvalue", (d) => d["x"])
        .attr("data-yvalue", (d) => d["y"])
        .on("mouseover", function(d){
            //    info = d["originalTarget"]["__data__"]
            tooltip.style("opacity", 1)
                    .style("left", (d3.mouse(this)[0]+90)+"px")
                    .style("top", (d3.mouse(this)[1])+"px")
                    .html(`<p>${d["cluster_name"]}</p>`)
                    //   .attr("data-year", info["Year"])
                    //   .html(info["Name"]+" ("+info["Year"]+") <br> Time: "+info["Time"]+"<br><br>"+info["Doping"])
        })
        .on("mousemove", function(){
            tooltip.style("left", (d3.mouse(this)[0]+90)+"px")
        })
        .on("mouseout", function(){
            tooltip.style("opacity", 0)
        })

        // 6. Finalize chart by adding title, axes labels and legend
        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom / 5)
            .attr("class", "label")
            .text("x");

        svg.append("text")
            .attr("y", margin.left/4)
            .attr("x", -height/2)
            .attr("transform", "rotate(-90)")
            .attr("class", "label")
            .text("y");

        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", margin.top / 2.6)
            .attr("id", "title")
            .text("Bert Embeddings");

        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", margin.top / 1.4)
            .text("For Abstract Text")
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
                        .attr("x", width - margin.right - 220)
                        .attr("y", 150-5-10)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("width", 350)
                        .attr("height", 140)
                        .attr("id", "legend").style("opacity", 0.2)
    
    })
}

wrapper() 

