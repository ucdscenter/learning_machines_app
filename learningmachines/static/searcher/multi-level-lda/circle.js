'user strict'


function renderCircle(circleD){



var t = d3.transition()
    .duration(50)
    .ease(d3.easeLinear);

	var diameter = 720,
    radius = diameter / 2 ,
    innerRadius = radius - 120;

    var cluster = d3.cluster()
    .size([360, innerRadius])
    .separation(function(a,b){
    	return a.parent == b.parent ? 2 : 3;
    })


    var line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(function(d) { 
      return d.y; 
    })
    .angle(function(d) { 
      return d.x / 180 * Math.PI; 
    });

    var svg = d3.select("#circle-graph-div").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  	.append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")").attr("cursor", "pointer");

    var zoom = d3.zoom()
    .scaleExtent([.1, 40])
    //.translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);
   
	var container = svg.append("g").call(zoom);;
    var link = container.append("g").selectAll(".link"),
    	node = container.append("g").selectAll(".node");


  	var root = packageHierarchy(circleD)
      .sum(function(d) { return d.score; });

     cluster(root);



     link = link
    .data(packageImports(root.leaves()))
    .enter().append("path")
      .each(function(d) {
       d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", function(d){
             return "d" + d.source.data.key + " d" + d.target.data.key + " cluster" + d.source.data.cluster + " cluster" + d.target.data.cluster + " link"
      })
      .attr("d", line);

  node = node
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 0) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .attr("class", function(d){
        return "node d" + d.data.key  + " cluster" + d.data.cluster
     })
    .on("mouseover", function(d){
      	$("#word_label").text(d.data.key + ":" + d3.format('.3f')(d.data.score))
        d3.selectAll('.d' + d.data.key).style("stroke", "#0000FF")

      })
    .on("mouseout", function(d){
        d3.selectAll('.d' + d.data.key).style("stroke", "")
      })
    .on("click", function(d){
      d3.select("#table_row_cluster_" + d.data.cluster).dispatch("click")
    })


   node.append("circle")
   		.attr("r", function(d){
   			
   			return cwScale(parseFloat(d.data.score))
   		})
   		.style("fill", function(d){
   			return d.data.color
   		})
   		.style("opacity", .6)

   node.append("text")
   .attr("dy", "0.31em")
   .attr('x', function(d) { return d.x < 180 ? 6 : -6; })
   .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
   .text(function(d){
   	return d.data.key
   })



// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return d3.hierarchy(map[""]);
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.data.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.data.imports) d.data.imports.forEach(function(i) {
      imports.push(map[d.data.name].path(map[i]));
    });
  });
  return imports;
}




function zoomed() {
  container.attr("transform", d3.event.transform);
}

zoom.scaleBy(container, 1.26)

zoom.translateBy(container, radius/6, radius/6)
}


