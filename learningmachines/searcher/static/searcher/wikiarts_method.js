
async function wrapper(){
	console.log("Hi there")
	console.log(wiki_path)

	let wiki_data = await d3.csv(wiki_path);

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

    let tooltip_state = { display: "none" }
//<img src="https://wikiart-project.s3.us-east-2.amazonaws.com/images/184896.jpg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEN7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGE0wy4hlTNeuTVyuikOEpjZyAa%2FhscboiMjD5WZRhzsAiAsVi4BLGHMY247drxi4r%2FlAaRoZedGtTB99mWZ2JkGUiqIAwj3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAQaDDA0OTg3OTE0OTM5MiIM1x944aEkDNMgWwxGKtwCc8B4U3I%2BB2iD%2F7TMPNrkJxkt%2BQd4PBc9GRdGQOBLQ%2BqUPETxw4tZg3opa3gMPWjzuKaAQ5ex9DsiFS4Dza%2FoszeNHZlCPOL1pvQfp7gW%2F1iA7n8rChuemGSQAs60f6ya%2FP6Kh5SPDRQHkJH5BQRxTXX%2BYnompCz2pJJJwc45H5YTRhRSjpo6lTN32SwtVbHSW1gzmLNivXvkPSV2uC31jrKwK%2BtXhICQzOo1oN4B4nWnIROfQfHlPY%2B5%2FL0YW%2Bji57Z%2FJ2qZ%2B4snOQmi9pmzUgchtVh8t9w6%2B%2B1GnjDYIsOGLlV63ulo2TPkMmDHsM1FFIBcuP5DNkS%2BYvxQPgXWTU%2FIFLTeR9XAMfwMDROCe67ohCyL1woYbUStoI2lbrpLmnn7jfIFJUXb3DZCaeZyn2pfAUgY2KAiOHntoqlxx6gaIVSBUanMR4Py9hXplqZ1lL9EB75zcUowUPorMMDHuZwGOrQCbOUlhQimbzAiUFAxDDzI6vQJ6qTSNBgAD%2BTxZ8KlFxDmKO1tXUALLfRXw5XtpTGdmge%2Fi34SI7XGwWOkqxJ0zNAMtJ7aQI8xlVaQn1ZMYvBAC4nVB9XfGtupU9k2fMWpPKCOHW6bOulNO1961zu2QQEysRM7nUT9tV2%2BwdVq4gOeJJI6WfeqIzaUue%2F9MLRhcmN4EVF9tA4r8K4P79%2Bw908syZB3z8QbK9vgGDHATxG1RGn7%2F6BtXcqmQysD9%2FD50R%2F2adWl2YmIazM3zrXfHc8OOYBTW7z%2B%2FCjNCzNSxKNGWt5GoVAotHZoECWZ04CmTUqtAhIBWFAUtGrxBl5FHP5QatySKGidBqudXTkPKmN4I51pxCWfn%2BMliRWZ77Ndgs9%2FL%2F6dGRALEIeYAUtQAcD5NMc%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20221205T214427Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=ASIAQXHIHNNIE43RE3CN%2F20221205%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=a4c4c9e2a25c6e7dddfd684c86cef0a619031a174ea344fc7c25680f9bfcf138" style="width: 100%"></img

    let tooltip_template = document.createRange().createContextualFragment(`<div id="tooltip" style="display: none; position: absolute; pointer-events: none; font-size: 13px; width: 120px; text-align: center; line-height: 1; padding: 6px; background: white; font-family: sans-serif;">
    <div id="point_tip" style="padding: 4px; margin-bottom: 4px;"></div>
    <img id="tooltip-image" style="width: 100%;"></img>
    <div id="group_tip" style="padding: 4px;"></div>
    </div>`);
    document.body.append(tooltip_template);

    let $tooltip = document.querySelector('#tooltip');
    let $point_tip = document.querySelector('#point_tip');
    let $group_tip = document.querySelector('#group_tip');
    let $image_tip = document.querySelector("#tooltip-image");


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

     console.log(color_array.length)

     var genres = {'portrait' : 0, 'landscape' : 1, 'genre painting' : 2, 'abstract' : 3,
       'religious painting' : 4, 'cityscape' : 5, 'figurative' : 6, 'sketch and study' : 7,
       'illustration' : 8, 'still life' : 9};

     var styles  = {'Realism' : 0, 'Romanticism' : 1, 'Impressionism': 2, 'Expressionism' : 3, 'Baroque' : 4,
       'Post-Impressionism' : 5, 'Art Nouveau (Modern)' : 6, 'Surrealism': 7,
       'Neoclassicism' : 8, 'Symbolism' : 9}
     var chosen = styles
     var chosen_name = 'style'

     function setup(){

     	console.log(wiki_data)
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

        
        console.log(color_array)

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
        createPoints(wiki_data);
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

         $('#visContainer__graph').removeClass("hidden")
                $('#visContainer__loading').addClass("hidden")

            
     }//setup()

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }


    function createPoints(data){

        let num_points = data.length;
        let data_points = [];
        data.forEach(function(d){
        	d.x = +d.x;
        	d.y = +d.y;
        	position = [d.x, d.y];
        	category_number = chosen[d[chosen_name]];
        	if(category_number == undefined){
        		category_number = -1
        	}
        	data_id = d.contentId;
        	data_title = d.title;
        	data_category = d[chosen_name];
            artist_name = d.artistName;
        	let point = {position, category_number, data_id, data_title, data_category, artist_name};
        	data_points.push(point);
        	})
        // for (let i = 0; i < data.x.length; i++) {
        // 	data.x = +data.x;
        // 	data.y = +data.y
        //     x_coor = data.x[i];
        //     y_coor = data.y[i];
        //     position = [x_coor, y_coor];
        //     // rating = data[i].rating;
        //     category_number = data.clusters[i];
        //     data_id = data.id[i];
        //     data_title = data.title[i];
        //     data_category = data.clusters[i];
        //     let point = {position, category_number, data_id, data_title, data_category};
        //     data_points.push(point);
        // }

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
        $group_tip.innerText = `${chosen_name} ${tooltip_state.chosen}`;
         fetch("/searcher/s3_image/" + "?id=" + tooltip_state.image_id, {
                method: 'GET',
                headers: { 'Content-Type': 'image/jpeg' }
            }).then(res => {
                return res.json();
            }).then(data => {
            	$image_tip.src = data.url
            }).catch(error => {
                    console.error('Error:', error);
            })

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
        tooltip_state.chosen = datum.data_category;
        tooltip_state.image_id = datum.data_id;
        updateTooltip();
    }

    function hideTooltip() {
        tooltip_state.display = "none";
        updateTooltip();
    }

    var unmouse = true;
    var selcircle = undefined

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

        	if(unmouse == true || selcircle != index) {
	            selcircle = index
	            highlightPoint(datum);
            	showTooltip(mouse_position, datum);
            	selcircle = index
            	//unmouse = false;
                
        	}

            unmouse = false;
        } else {
        	if(unmouse == false) {
                removeHighlights();
                hideTooltip();
                int_list = undefined;
        	}
            unmouse = true
            selcircle = -1
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


            fetch("/searcher/s3_image/" + "?id=" + datum['data_id'] + "&fetch_similarity=True", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(res => {
                return res.json();
            }).then(data => {
                console.log(data)
                console.log(datum)
                document.getElementById("visContainer__info__docTitle").textContent = "Title: " + datum.data_title;
                document.getElementById("visContainer__info__docAuthor").textContent = "Artist: " + datum.artist_name;
                document.getElementById("visContainer__info__docTopic").textContent = "Group: " + datum.data_category;
                document.getElementById("selectedImage").src = data.url

                let sim_ims = d3.select("#similar_images")
                sim_ims.selectAll(".sim_im").remove()
                sim_ims.selectAll(".img")
                    .data(data.sim_urls)
                    .enter()
                    .append("img")
                    .attr("class", "sim_im")
                    .attr("src", function(d){
                        return d
                    })
                    .style("width", "25%")

                
            
            }).catch(error => {
                    console.error('Error:', error);
            })
            
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

    const getColorForPubmed = function(d){
        // console.log(typeof d["category_number"]);
        if (d['category_number'] == -1){
        	return "#d3d3d3"
        }
            return color_array[Number(d["category_number"])+1];
        }
        // Add topic number
                
        
    
     setup()
}

wrapper()