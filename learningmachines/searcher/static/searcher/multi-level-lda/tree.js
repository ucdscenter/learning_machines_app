'use strict'

function renderTree(treeD){

  console.log(treeD)
  
  let width = window.innerWidth * .8;
  width = 1200
  let otherwidth = 800
  console.log(centerWidth)
  let height = window.innerHeight * .85
 
  let margin = ({top: 10, right: 120, bottom: 10, left: 50})
  let dx = 10
let dy =  width/4


function separation(a, b) {
  return a.parent == b.parent ? 2 : 3;
}

  let tree = d3.tree().nodeSize([dx, dy])
  tree.separation(separation)
  let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)
  let root = d3.hierarchy(treeD);

  root.x0 = dy / 2;
  root.y0 = 100;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });


  let svg = d3.select("#tree-graph-div").append("svg")
      .attr("width", otherwidth)
      .attr("height", centerHeight)
      .attr("viewBox", [-margin.left, -margin.top, width, height])
      .style("font", "10px sans-serif")
      .attr("id", 'tree-svg')
      .style("user-select", "none");

  let gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

  let gNode = svg.append("g")
      .attr("cursor", "pointer");

  var docTExtent; 

 /* if (params.nodesize == 'docs'){
    docTExtent = d3.extent(formattedData.nodes, function(d){

    let score = 0
    d.data.topic.forEach(function(doc){
      score += doc[1]
    })
    return score
  })

*/
  let tScale = d3.scaleLinear().domain([0, topicMax]).range([0, 30])
  //let doctScale = d3.scaleLinear().domain(docTExtent).range([0, 30])



  function update(source) {
    let duration = d3.event && d3.event.altKey ? 2500 : 250;
    let nodes = root.descendants().reverse();
    let links = root.links();

    // Compute the new tree layout.
    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });
    let height = (right.x - left.x + margin.top + margin.bottom) * .75;
    let transition = svg.transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

    // Update the nodes…
    let node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .attr("class", function(d){

          if(d.data.topic == undefined){
            return "cluster" + d.data.cluster
          }
          else{
            return "m" + d.data.topic[0] + "-" + d.data.topic[1]
          }
          
        })
        .on("click", d => {
          d.children = d.children ? null : d._children;
          update(d)
          if (d.data.topic != undefined && d.children != null){
            hierarchyTopicSelect(d.data.topic)
          }
        })
        .on("mouseover", function(d){
          d3.select(this).append("svg:title").text(function(d) { return d.data.score; })
        });

    nodeEnter.append("circle")
        .attr("r", function(d){
          //return 2.5

          if( d.data.children.length == 0){
            return wScale(parseFloat(d.data.score)) * 2
          }
          if(d.depth == 2){
           return tScale(d.data.score)

          }

          let clusterScore = 0
          d.data.children.forEach(function(t){
            clusterScore += tScale(t.score)
          })
          return clusterScore / 2
        })
        .attr("fill",function(d){
          return d.data.color
        })
        .style("opacity", .6)
        
    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d._children ? -6 : 6)
        .attr("text-anchor", d => d._children ? "end" : "start")
        .style("font-size", 16)
        .text(d => d.data.name)
      .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

    // Transition nodes to their new position.
    let nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y },${d.x - (height/4)})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    let nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x - (height/4)})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    // Update the links…
    let link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    let linkEnter = link.enter().append("path")
        .attr("d", d => {
          let o = {x: source.x0 , y: source.y0 };
          return diagonal({source: o, target: o});
        })
        .attr("class", function(d){
          let sclust = d.source.data.cluster;
          let tclust = ""
          if (d.target != undefined){
             tclust = d.target.data.cluster;
          }
          
          return "cluster" + sclust + " cluster" + tclust
        })
        

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal)
        .attr("transform", `translate(0, ${-(height/4)})`);;

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
        .attr("d", d => {
          let o = {x: source.x, y: source.y };
          return diagonal({source: o, target: o});
        });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);
  root.descendants().forEach(function(n){
    n.children = n._children
    update(n)

  })

}




	