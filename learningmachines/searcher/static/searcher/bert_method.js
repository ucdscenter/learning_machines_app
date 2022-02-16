'use-strict'

async function wrapper(){
    let data = await d3.json("/Users/happyhome/Documents/learning_machines_app/learningmachines/searcher/tempmodeldata/extra_json_points")

    console.log(data)
}

// d3.json("file.json").then(function(data){ console.log(data)})

wrapper()