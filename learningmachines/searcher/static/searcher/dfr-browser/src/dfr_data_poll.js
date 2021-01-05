async function thewrapper(){


  if(params.q_pk == undefined){
    console.log("Model Undefined")
    dfb().load(-1, true, "");
  }
  else{
    console.log(params.q_pk)
    console.log(params.method)


    
    d3.json("/searcher/load_formatted?method="  + params.method +"&q_pk=" + params.q_pk, function(error, data){
   
            console.log(data)
          let dfr_data = data.data/*{
            "info" : JSON.parse(data.data.info),
            "tw" : JSON.parse(data.data.tw),
            "dt" : JSON.parse(data.data.tw),
            "meta" : data.data.meta,
          }*/
          console.log(dfr_data)
          let info = data.model_info
          dfb().load(dfr_data, false, "thing");
        })

     
  
}
};//wrapper

thewrapper()