'use-strict';

async function wrapper(){
    let num_points = 200
    console.log(num_points)

    let width = window.innerWidth
    let height = window.innerHeight
    let viz_width = window.innerWidth
    let aspect = width / height

    let fov = 40
    let near = 10
    let far = 7000

    // Setup camera and scene
    let camera = new THREE.PerspectiveCamera(
        fov, aspect, near, far
    )
}

wrapper()