'use-strict';

async function wrapper(){

    //DECLARE ~GLOBAL VARIABLES
    var data_path;
    var dataset;
    var data;

    var height, width, viz_width,
    aspect, fov, near,
    far, camera, color_array,
    scene, renderer, zoom,
    d3_transform, view, radius,
    radius,
    data_points, generated_points, pointsGeometry,
    colors, vertices, sizes,
    pointsMaterial, points, initial_scale, 
    initial_transform, raycaster, hoverContainer, searchContainer, choose_points, choose_generated_points;

     color_array = [
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#90fc03",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
            "#6a3d9a",
            "#ffff99",
            "#b15928",
            "#a6cee3",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#90fc03",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
        ]


    async function fetchData(url, selectedValue){
        const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedValue),
            }).then(res => res.json());
        
        return response;
    }

    const searchElement = document.getElementById('search-input')



    async function getDocs(qry_str){
        let search_rslts = await d3.json(qry_str)
        console.log(search_rslts)
        searchVis(search_rslts)
    }

    searchElement.addEventListener('keyup', function(){
        if (event.key === "Enter") {
            qry = searchElement.value;
            unSearchVis()
            if(qry.length == 0){
                return;
            }
            let fullq = qry
            let base_qry = dataset_path.split("_")[0] 
            if (base_qry.length == 0){
                fullq = qry
            }
            else{
                fullq = base_qry + " AND " + qry; 
            }
            let qry_str = "/searcher/process_search?database=" + dataset + "&qry=" + fullq
            console.log(qry_str)
            getDocs(qry_str)
            
        }
    })

    function unSearchVis(){
        scene.remove(s_points)
        pointsMaterial.opacity = .5;
        pointsMaterial.needsUpdate = true
        choose_points = points;
        choose_generated_points = generated_points;
        $("#restore-search-button").addClass("hidden")

        $('#s-doc-count').text(data.x.length + " documents")

    }

    $('#restore-search-button').on("click", unSearchVis);

    function searchVis(rslts){
        pointsMaterial.opacity = .01
        rslts_dict = {};
        rslts.results.forEach(function(d){
            rslts_dict[d.id] = 0;
        })
        let ret_arr = [];
        data.id.forEach(function(i){
            if(rslts_dict[i] == undefined){
                ret_arr.push(false)
            }
            else{
                ret_arr.push(true)
            }
        })
        // filtered_data = data.filter(function(d){
        //     if(rslts_dict[d.data_id] == undefined){
        //         return false
        //     }
        //     return true
        // })
        // createSearchPoints(filtered_data)
        createSearchPoints(ret_arr, data)

        pointsMaterial.needsUpdate = true
        choose_points = s_points;
        choose_generated_points = s_generated_points;
        console.log(s_generated_points)
        $("#restore-search-button").removeClass("hidden")
        $('#s-doc-count').text(rslts.results.length + " matching documents")

    }

    const getColorForPubmed = function(d){
        // console.log(typeof d["category_number"]);
            return color_array[Number(d["category_number"])+1];
        // Add topic number
                
        }

    const dropDownElement = document.getElementById('visContainer__dropDown');
    dropDownElement.addEventListener('change', function(){
        const selectedValue = dropDownElement.options[dropDownElement.selectedIndex].text;
        if (selectedValue != 'None'){
            d3.selectAll("canvas").remove()
            // fetch( `${window.location.pathname}`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(selectedValue),
            // }).then(res => {
            //     return res.json();
            // }).then(data => {
            //     console.log(data);
            //     const data = data;
            // })
            $('#visContainer__graph').addClass("hidden")
            $('#visContainer__loading').removeClass("hidden")
            fetchData(window.location.pathname, selectedValue).then((result) => {
                data = result.dataset;
                dataset_path = result.dataset_path;
                console.log(result)
                dataset = result.dataset_name;
                console.log(dataset)
                $('#s-doc-count').text(data.x.length + " documents")
                $('#visContainer__graph').removeClass("hidden")
                $('#visContainer__loading').addClass("hidden")

                renderClusterInfo()
                renderTimelines()
        // console.log(num_points)

         width = window.innerWidth
         height = window.innerHeight
         viz_width = window.innerWidth
         aspect = width / height
        
         fov = 45
         near = 0.1
         far = 70

        // Setup camera and scene
         camera = new THREE.PerspectiveCamera(
            fov, aspect, near, far
        )
        
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            viz_width = width;
            height = window.innerHeight;
        
            renderer.setSize(width, height);
            camera.aspect = width / height;
            // must be called after any change of parameters of camera
            camera.updateProjectionMatrix();
        })

        

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        document.getElementById('visContainer__graph').appendChild(renderer.domElement);
        // document.body.appendChild(renderer.domElement);
        // console.log(renderer);
                        
        zoom = d3.zoom()
            .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
            .on('zoom', () =>  {
         d3_transform = d3.event.transform;
            zoomHandler(d3_transform);
        });
        
        view = d3.select(renderer.domElement);
        function setUpZoom() {
        view.call(zoom);    
        initial_scale = getScaleFromZ(far);
        initial_transform = d3.zoomIdentity.translate(viz_width/2, height/2).scale(initial_scale);    
        zoom.transform(view, initial_transform);
        camera.position.set(0, 0, far);
        }
        setUpZoom();


        radius = 2000;
       
        scene = new THREE.Scene();

        scene.background = new THREE.Color(0xefefef);
        console.log(data)
        createPoints(data);
        animate();

        // Hover and tooltip interaction
        raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 1;

        hoverContainer = new THREE.Object3D()
        scene.add(hoverContainer);

        searchContainer = new THREE.Object3D()
        scene.add(searchContainer)


        view.on("mousemove", () => {
            let [mouseX, mouseY] = d3.mouse(view.node());
            let mouse_position = [mouseX, mouseY];
            // console.log(mouse_position);
            checkIntersects(mouse_position);
        });

        view.on("mouseleave", () => {
            removeHighlights()
        });

        view.on("click", () => {
            // console.log('Clicked!');
            let [mouseX, mouseY] = d3.mouse(view.node());
            let mouse_position = [mouseX, mouseY];
            checkClickPosition(mouse_position);
        });

            })
        };

    })//dropdown event listener


    // Initial tooltip state
    let tooltip_state = { display: "none" }

    let tooltip_template = document.createRange().createContextualFragment(`<div id="tooltip" style="display: none; position: absolute; pointer-events: none; font-size: 13px; width: 120px; text-align: center; line-height: 1; padding: 6px; background: white; font-family: sans-serif;">
    <div id="point_tip" style="padding: 4px; margin-bottom: 4px;"></div>
    <div id="group_tip" style="padding: 4px;"></div>
    </div>`);
    document.body.append(tooltip_template);

    let $tooltip = document.querySelector('#tooltip');
    let $point_tip = document.querySelector('#point_tip');
    let $group_tip = document.querySelector('#group_tip');

    var s_generated_points, s_pointsGeometry, s_colors,
        s_vertices, s_sizes, s_pointsGeometry,
         s_pointsMaterial, s_points;


    function createSearchPoints(f_map, data){
        console.log(f_map)
        console.log(data)
        let num_points = data.x.length;
        let s_data_points = [];
        for (let i = 0; i < data.x.length; i++) {
            if(f_map[i] == true){
                x_coor = data.x[i];
                y_coor = data.y[i];
                position = [x_coor, y_coor];
                // rating = data[i].rating;
                category_number = data.clusters[i];
                data_id = data.id[i];
                data_title = data.title[i];
                let point = {position, category_number, data_id, data_title};
                s_data_points.push(point);
            }
            
        }

        s_generated_points = s_data_points;

        s_pointsGeometry = new THREE.BufferGeometry();

        s_colors = new Float32Array(num_points * 3);
        s_vertices = new Float32Array(num_points * 3);
        s_sizes = new Float32Array(num_points);

        i = 0
        for (let datum of s_generated_points) {
        // Set vector coordinates from data
            s_vertices[i] = datum.position[0];
            s_vertices[i + 1] = datum.position[1];
            s_vertices[i + 2] = 0;
             //let vertex = new THREE.Vector3(datum.position[0], datum.position[1], 0);
             //pointsGeometry.vertices.push(vertex);
            let color = new THREE.Color(getColorForPubmed(datum));
            s_colors[i] = color.r;
            s_colors[i+1] = color.g;
            s_colors[i+2] = color.b;
            
            i += 3;
        }
        // console.log(vertices);

        s_pointsGeometry.setAttribute('position', new THREE.BufferAttribute(s_vertices, 3));
        s_pointsGeometry.setAttribute('color', new THREE.BufferAttribute(s_colors, 3));
        //pointsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        // console.log(pointsGeometry);
        // pointsGeometry.colors = colors;
        // console.log(pointsGeometry.colors);
        

        s_pointsMaterial = new THREE.PointsMaterial({
            size: 10,
            sizeAttenuation: false,
            // its like telling to read colors provided in geometry (true)
            vertexColors: THREE.VertexColors,
            map: circle_sprite,
            transparent: true,
            color: new THREE.Color( 0xffffff ),
            opacity: 1
        });
        
        // console.log(pointsMaterial);


        

        s_points = new THREE.Points(s_pointsGeometry, s_pointsMaterial);
        scene.add(s_points);
    }


    function createPoints(data){

        let num_points = data.x.length;
        let data_points = [];
        for (let i = 0; i < data.x.length; i++) {
            x_coor = data.x[i];
            y_coor = data.y[i];
            position = [x_coor, y_coor];
            // rating = data[i].rating;
            category_number = data.clusters[i];
            data_id = data.id[i];
            data_title = data.title[i];
            data_category = data.clusters[i];
            let point = {position, category_number, data_id, data_title, data_category};
            data_points.push(point);
        }

        generated_points = data_points;
        // console.log(generated_points);

        pointsGeometry = new THREE.BufferGeometry();

        colors = new Float32Array(num_points * 3);
        vertices = new Float32Array(num_points * 3);
        sizes = new Float32Array(num_points);
        // console.log(vertices);

        i = 0
        for (let datum of generated_points) {
        // Set vector coordinates from data
            vertices[i] = datum.position[0];
            vertices[i + 1] = datum.position[1];
            vertices[i + 2] = 0;
            // let vertex = new THREE.Vector3(datum.position[0], datum.position[1], 0);
            // pointsGeometry.vertices.push(vertex);
            let color = new THREE.Color(getColorForPubmed(datum));
            colors[i] = color.r;
            colors[i+1] = color.g;
            colors[i+2] = color.b;
            
            i += 3;
        }
        // console.log(vertices);

        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        // pointsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        // console.log(pointsGeometry);
        // pointsGeometry.colors = colors;
        // console.log(pointsGeometry.colors);
        

        pointsMaterial = new THREE.PointsMaterial({
            size: 10,
            sizeAttenuation: false,
            // its like telling to read colors provided in geometry (true)
            vertexColors: THREE.VertexColors,
            map: circle_sprite,
            transparent: true,
            color: new THREE.Color( 0xffffff ),
            opacity: .5
        });
        
        // console.log(pointsMaterial);


        

        points = new THREE.Points(pointsGeometry, pointsMaterial);
        choose_points = points
        choose_generated_points = generated_points
        scene.add(points);
    }//createPoints        

    function mouseToThree(mouseX, mouseY) {
        return new THREE.Vector3(
            mouseX / viz_width * 2 - 1,
            -(mouseY / height) * 2 + 1,
            1
        );
    }

    function sortIntersectsByDistanceToRay(intersects) {
        return _.sortBy(intersects, "distanceToRay");
    }

    function removeHighlights() {
        hoverContainer.remove(...hoverContainer.children);
    }


    function highlightPoint(datum) {
        removeHighlights();
    
        // let geometry = new THREE.Geometry();
        let geometry = new THREE.BufferGeometry();
        const vertex = new Float32Array(3);
        vertex[0] = datum.position[0];
        vertex[1] = datum.position[1];
        vertex[2] = 0;
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertex, 3 ) );
        // console.log(geometry);
        // geometry.vertices.push(
        //     new THREE.Vector3(
        //     datum.position[0],
        //     datum.position[1],
        //     0
        //     )
        // );
        // geometry.colors = [ new THREE.Color(color_array[datum.group]) ];
        // geometry.colors = [ new THREE.Color(getColor(datum.cluster_name)) ];
        let colors = new Float32Array(3);
        color = new THREE.Color(getColorForPubmed(datum));
        colors[0] = color.r;
        colors[1] = color.g;
        colors[2] = color.b;
        geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

        let material = new THREE.PointsMaterial({
            size: 26,
            sizeAttenuation: false,
            vertexColors: THREE.VertexColors,
            map: circle_sprite,
            transparent: true,
        });
        
        let point = new THREE.Points(geometry, material);
        hoverContainer.add(point);
    }

    function updateTooltip() {
        $tooltip.style.display = tooltip_state.display;
        $tooltip.style.left = tooltip_state.left + 'px';
        $tooltip.style.top = tooltip_state.top + 'px';
        $point_tip.innerText = tooltip_state.name;
        $point_tip.style.background = color_array[Number(tooltip_state.group)+1];
        $group_tip.innerText = `Group ${tooltip_state.group}`;
    }

    function showTooltip(mouse_position, datum) {
        let tooltip_width = 120;
        let x_offset = -tooltip_width/2;
        let y_offset = (mouse_position[1] > height/2) ? -150 : 150;
        tooltip_state.display = "block";
        tooltip_state.left = mouse_position[0] + x_offset;
        tooltip_state.top = mouse_position[1] + y_offset;
        tooltip_state.name = datum.data_title;
        tooltip_state.group = datum.category_number;
        updateTooltip();
    }

    function hideTooltip() {
        tooltip_state.display = "none";
        updateTooltip();
    }

    function checkIntersects(mouse_position) {
        // console.log("Intersects Yes!")
        let mouse_vector = mouseToThree(...mouse_position);
        raycaster.setFromCamera(mouse_vector, camera);
        let intersects = raycaster.intersectObject(choose_points);
        // console.log(intersects);
        if (intersects[0]) {
            let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
            let intersect = sorted_intersects[0];
            let index = intersect.index;
            let datum = choose_generated_points[index];
            highlightPoint(datum);
            
            // console.log("Hlc bjvsvjknskjvnjkslo work");
            showTooltip(mouse_position, datum);
        } else {
            removeHighlights();
            hideTooltip();
        }
    }

    function checkClickPosition(mouse_position) {
        // console.log("Intersects Yes!")
        let mouse_vector = mouseToThree(...mouse_position);
        raycaster.setFromCamera(mouse_vector, camera);
        let intersects = raycaster.intersectObject(choose_points);
        // console.log(intersects);
        if (intersects[0]) {
            let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
            let intersect = sorted_intersects[0];
            let index = intersect.index;
            let datum = choose_generated_points[index];
            // highlightPoint(datum);

            // showTooltip(mouse_position, datum);
            // console.log(datum.data_id);
            // console.log(window.location);
            
            fetch(window.location.pathname + "?id=" + datum['data_id'], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datum)
            }).then(res => {
                return res.json();
            }).then(data => {
                document.getElementById("visContainer__info__docTitle").textContent = "Title: " + data.doc_title;
                document.getElementById("visContainer__info__docAuthor").textContent = "Author: " + data.doc_author;
                document.getElementById("visContainer__info__docTopic").textContent = "Cluster: " + datum.data_category;
                d3.selectAll(".doc-line").remove()
                data.doc_text.split("\n").forEach(function(t){
                    d3.select('#visContainer__info__docText')
                        .append("p")
                        .classed("mb-0", true)
                        .classed("doc-line", true)
                        .style("font-size", '.8rem')
                        .text(t)

                })
            }).catch(error => {
                    console.error('Error:', error);
            });;

        } else {
            // removeHighlights();
            // hideTooltip();
        }
    }


 const getColor = function(d){
        if(d["rating"] === "1"){
            return color_array[0];
        }
        else if(d["rating"] === "2"){
            return color_array[1];
        }
        else if(d["rating"] === "3"){
            return color_array[2];
        }
        else if(d["rating"] === "4"){
            return color_array[3];
        }
        else if(d["rating"] === "5"){
            return color_array[4];
        }
        else{
            return color_array[5];
        }
    }


    // Three.js render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    

    function zoomHandler(d3_transform) {
    let scale = d3_transform.k;
    let x = -(d3_transform.x - viz_width/2) / scale;
    let y = (d3_transform.y - height/2) / scale;
    let z = getZFromScale(scale);
    camera.position.set(x, y, z);
    }

    function getScaleFromZ (camera_z_position) {
        let half_fov = fov/2;
        let half_fov_radians = toRadians(half_fov);
        let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
        let fov_height = half_fov_height * 2;
        let scale = height / fov_height; // Divide visualization height by height derived from field of view
        return scale;
    }

    function getZFromScale(scale) {
        let half_fov = fov/2;
        let half_fov_radians = toRadians(half_fov);
        let scale_height = height / scale;
        let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
        return camera_z_position;
    }

    function toRadians (angle) {
        return angle * (Math.PI / 180);
    }




    dropDownElement.value='bert'
    dropDownElement.dispatchEvent(new Event('change'));


    //Do cluster info table

   d3.select("#visContainer__clustershow").on("click", function(d){
    let show = d3.select(this).classed("clustershow")
    if (show == true){
        d3.select('#icon-hide').classed("hidden", !show);
        d3.select('#icon-show').classed("hidden", show);
        d3.select("#visContainer__clusterInfo").classed("hidden", !show)
    }
    else {
        d3.select('#icon-hide').classed("hidden", true);
        d3.select('#icon-show').classed("hidden", false);
        d3.select("#visContainer__clusterInfo").classed("hidden", true)
    }
    d3.select(this).classed("clustershow", !show)
   })

   //Do timeline info logic

   d3.select("#visContainer__timelineshow").on("click", function(d){
    let show = d3.select(this).classed("timelineshow")
    if (show == true){
        d3.select('#t-icon-hide').classed("hidden", !show);
        d3.select('#t-icon-show').classed("hidden", show);
        d3.select("#visContainer__timelineInfo").classed("hidden", !show)
    }
    else {
        d3.select('#t-icon-hide').classed("hidden", true);
        d3.select('#t-icon-show').classed("hidden", false);
        d3.select("#visContainer__timelineInfo").classed("hidden", true)
    }
    d3.select(this).classed("timelineshow", !show)
   })

   function renderTimelines(){
    console.log("rendering timeline")
    console.log(data)
    let square_size = {w:1200, h:350}
    const margin = {"top": 10, "bottom" : 25, "left" : 35, "right" : 15};
    var width = square_size.w - margin.left - margin.right,
        height = square_size.h - margin.top - margin.bottom;

    let cluster_line_data = {}

    let dateParse = d3.timeParse('%Y-%m-%d')
    let dateFormat = d3.timeFormat("%Y")
    let yearExt = [5000, -5000];
    let countExt = [0, -10000000];

    let cc = [... new Set(data.clusters)]
    //creating formatted dates

    cc.forEach(function(c){
        cluster_line_data[c] = {};
    })
    let ii = 0
    data.clusters.forEach(function(d){
        
        let d_obj = dateParse(data.dates[ii])
        if(d_obj != null){
            if(d_obj.getFullYear() < yearExt[0]){
                yearExt[0] = d_obj.getFullYear()
            }
            if(d_obj.getFullYear() > yearExt[1]){
                yearExt[1] = d_obj.getFullYear()
            }
            if(cluster_line_data[d].hasOwnProperty(d_obj.getFullYear())){
                cluster_line_data[d][d_obj.getFullYear()] += 1
            }
            else {
                cluster_line_data[d][d_obj.getFullYear()] = 1
            }
        }
        ii += 1;
        
    })

    Object.keys(cluster_line_data).forEach(function(c){
        Object.keys(cluster_line_data[c]).forEach(function(d){
            if(cluster_line_data[c][d] > countExt[1]){
                countExt[1] = cluster_line_data[c][d]
            }
        })
    })

    var y = d3.scaleLinear()
      .domain(countExt)
      .range([ height, 0 ]);

    var x = d3.scaleLinear().domain(yearExt).range([0, width])

     let svg = d3.select('#timeline-div')
        .append("svg")
        .attr("id", "timeline-svg")
        .attr("viewBox", "0 0 " + square_size.w + " " + square_size.h)
        .attr("preserveAspectRatio", "xMidYMid meet")

    let svg_g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg_g.append("g")
        .attr("class", "yaxis")
        .call(d3.axisLeft(y));

    svg_g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "xaxis")
      .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

    Object.keys(cluster_line_data).forEach(function(c_time){

        let line_color = color_array[parseInt(c_time) + 1];
        svg_g.append("path")
            .datum(Object.keys(cluster_line_data[c_time]))
            .attr("fill", "none")
            .attr("stroke", line_color)
            .attr("stroke-width", 2)
            .attr("d", d3.line()//.curve(d3.curveBundle.beta(1))
                .x(function(d){
                    return x(d)
                })
                .y(function(d){
                    return y(cluster_line_data[c_time][d])
                }))
    })

    
   }//renderTimelines

   function clusterColor(cc, op){
        let ccc = new THREE.Color(color_array[cc + 1]);
        return "rgba(" + (ccc.r * 255) + ',' + (ccc.g * 255) + ',' + (ccc.b * 255) + ","+ op +")";
    }

   function renderClusterInfo(){

    

    data['clusters_sizes'] = []

    let clusterSet = new Set(data['clusters']);

    clusterSet.forEach(function(c){
        data['clusters_sizes'].push(0)
        //
    })

    clusterSet.forEach(function(c){
        data['clusters_sizes'][c] = data['clusters'].filter(x => x === c).length 
        //
    })
    let c_idxs = []
    for(var i=0; i < data['clusters_sizes'].length; i++){
        c_idxs.push(i)
    }

    let c_table = d3.select("#dtbody")
    
    let rows = c_table.selectAll(".row")
                    .data(c_idxs)
                    .enter()
                    .append("tr")
                    .style("background-color", function(d){
                        return clusterColor(d,.5)
                    })
                    .on("mouseover", function(){
                        d3.select(this).style("background-color",function(d){
                            return clusterColor(d, 1)
                        })
                    })
                    .on("mouseout",function(){
                        d3.select(this).style("background-color",function(d){
                            return clusterColor(d, .5)
                        })
                    })

    let c_td = rows.selectAll("td").data(function(d, i){
        return [i, data['clusters_sizes'][i], data['cluster_labels_docs'][i], data['cluster_labels_tfidf'][i]]
    }).enter()
    .append("td")
     c_td.append("div")
        .style("max-height", '10vh')
        .style("overflow-y", "auto")
        .text(function(d){
         return d
        })
    console.log(data['clusters_sizes'].length)


    console.log(data['clusters_sizes'])
   }

   


}//wrapper

wrapper();