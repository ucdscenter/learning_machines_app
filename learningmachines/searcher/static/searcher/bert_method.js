'use-strict'

async function wrapper(){
    // let data = await d3.json("https://github.com/ucdscenter/learning_machines_app/blob/bert_method/learningmachines/searcher/static/searcher/bert_method_data/extra_json_points.json")
    var jsonData = JSON.parse(document.querySelector(".jsonData").getAttribute("data-json"));
    var data = jsonData.map((item) => item.x)
    console.log(data);
}

wrapper()  

// d3.json("file.json").then(function(data){ console.log(data)})

