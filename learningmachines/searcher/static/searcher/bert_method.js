'use-strict'

async function wrapper(){

    let data = await d3.json(static_url + 'sample_json_of_points.json')
    console.log(data)
}

wrapper()  

// d3.json("file.json").then(function(data){ console.log(data)})

