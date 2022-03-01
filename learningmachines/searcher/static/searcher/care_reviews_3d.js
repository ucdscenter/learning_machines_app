'use-strict';

async function wrapper(){
    dataset_name = document.getElementById("data").textContent;
    console.log(dataset_name);
    if (dataset_name.length == 0){
        console.log("No dataset selected");
        return;
    }

    // console.log(data);
    d3.json(static_url + dataset_name + '.json').then(function(data){ 
        console.log(data);
        // console.log(window.location);
        let num_points = data.length;
        console.log(num_points)

        let width = window.innerWidth
        let height = window.innerHeight
        let viz_width = window.innerWidth
        let aspect = width / height

        let fov = 45
        let near = 0.1
        let far = 70

        // Setup camera and scene
        let camera = new THREE.PerspectiveCamera(
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

        let color_array = [
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c"
        ]

        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        document.getElementById('my_dataviz').appendChild(renderer.domElement);
        // document.body.appendChild(renderer.domElement);
        // console.log(renderer);
                        
        let zoom = d3.zoom()
            .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
            .on('zoom', () =>  {
        let d3_transform = d3.event.transform;
            zoomHandler(d3_transform);
        });
        
        view = d3.select(renderer.domElement);
        function setUpZoom() {
        view.call(zoom);    
        let initial_scale = getScaleFromZ(far);
        var initial_transform = d3.zoomIdentity.translate(viz_width/2, height/2).scale(initial_scale);    
        zoom.transform(view, initial_transform);
        camera.position.set(0, 0, far);
        }
        setUpZoom();

        circle_sprite= new THREE.TextureLoader().load(
        "/static/searcher/images/disc.png"
        )

        let radius = 2000;

        // Function to return the respective cluster color
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
                return color_array[0];
            }
        }
        
        let data_points = [];
        for (let i = 0; i < data.length; i++) {
            x_coor = data[i].x;
            y_coor = data[i].y;
            position = [x_coor, y_coor];
            rating = data[i].rating;
            data_id = data[i].data_id;
            let point = {position, rating, data_id};
            data_points.push(point);
        }

        let generated_points = data_points;
        // console.log(generated_points);

        let pointsGeometry = new THREE.BufferGeometry();

        let colors = new Float32Array(num_points * 3);
        let vertices = new Float32Array(num_points * 3);
        let sizes = new Float32Array(num_points);
        // console.log(vertices);

        i = 0
        for (let datum of generated_points) {
        // Set vector coordinates from data
            vertices[i] = datum.position[0];
            vertices[i + 1] = datum.position[1];
            vertices[i + 2] = 0;
            // let vertex = new THREE.Vector3(datum.position[0], datum.position[1], 0);
            // pointsGeometry.vertices.push(vertex);
            let color = new THREE.Color(getColor(datum));
            // console.log(color);
            // colors.push(color);
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
        

        let pointsMaterial = new THREE.PointsMaterial({
            size: 10,
            sizeAttenuation: false,
            // its like telling to read colors provided in geometry (true)
            vertexColors: THREE.VertexColors,
            map: circle_sprite,
            transparent: true,
            color: new THREE.Color( 0xffffff )
        });
        
        // console.log(pointsMaterial);
        

        let points = new THREE.Points(pointsGeometry, pointsMaterial);

        let scene = new THREE.Scene();
        scene.add(points);
        scene.background = new THREE.Color(0xefefef);

        // Three.js render loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    
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

        // Hover and tooltip interaction
        raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 1;

        hoverContainer = new THREE.Object3D()
        scene.add(hoverContainer);
        

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
            color = new THREE.Color(getColor(datum));
            colors[0] = color.r;
            colors[1] = color.g;
            colors[2] = color.b;
            geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

            let material = new THREE.PointsMaterial({
                size: 26,
                sizeAttenuation: false,
                vertexColors: THREE.VertexColors,
                map: circle_sprite,
                transparent: true
            });
            
            let point = new THREE.Points(geometry, material);
            hoverContainer.add(point);
        }

        function updateTooltip() {
            $tooltip.style.display = tooltip_state.display;
            $tooltip.style.left = tooltip_state.left + 'px';
            $tooltip.style.top = tooltip_state.top + 'px';
            $point_tip.innerText = tooltip_state.name;
            $point_tip.style.background = color_array[Number(tooltip_state.group)];
            $group_tip.innerText = `Group ${tooltip_state.group}`;
        }

        function showTooltip(mouse_position, datum) {
            let tooltip_width = 120;
            let x_offset = -tooltip_width/2;
            let y_offset = 530;
            tooltip_state.display = "block";
            tooltip_state.left = mouse_position[0] + x_offset;
            tooltip_state.top = mouse_position[1] + y_offset;
            tooltip_state.name = datum.data_id;
            tooltip_state.group = datum.rating;
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
            let intersects = raycaster.intersectObject(points);
            // console.log(intersects);
            if (intersects[0]) {
                let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
                let intersect = sorted_intersects[0];
                let index = intersect.index;
                let datum = generated_points[index];
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
            let intersects = raycaster.intersectObject(points);
            // console.log(intersects);
            if (intersects[0]) {
                let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
                let intersect = sorted_intersects[0];
                let index = intersect.index;
                let datum = generated_points[index];
                // highlightPoint(datum);

                // showTooltip(mouse_position, datum);
                console.log(datum.data_id);
            } else {
                // removeHighlights();
                // hideTooltip();
            }
        }

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
            console.log('Clicked!');
            let [mouseX, mouseY] = d3.mouse(view.node());
            let mouse_position = [mouseX, mouseY];
            checkClickPosition(mouse_position);
        });
    });


}

wrapper();