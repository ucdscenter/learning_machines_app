async function thewrapper(){


  if(params.q_pk == undefined){
    console.log("Model Undefined")
     function undefined_fixer(info){
    if (info == undefined){
      return ""
    }
    else{
      return info
    } }

    let addit_str = "&model=" + params.model
    d3.json("/searcher/load_formatted?method=" + params.method + "&q_pk=" + params.q_pk + addit_str, function(error, the_data){
      $('#corpus').text(undefined_fixer(params.corpus))
    $('#term').text(undefined_fixer(params.model.split("#")[0].match(/\[(.*?)\]/g,'')[0].slice(1, -1)))
    $('#topics').text(undefined_fixer(params.num_topics))
    $('#stop_words').text(undefined_fixer(params.stop_words).replace("-", ","))
    $('#start').text(undefined_fixer(params.ys))
    $('#end').text(undefined_fixer(params.ye))
    $('#dn').text(undefined_fixer(params.dn))
    dfb().load(the_data.data, false, "thing");
    })
    
  }
  else{
    console.log(params.q_pk)
    console.log(params.method)


    
    d3.json("/searcher/load_formatted?method="  + params.method +"&q_pk=" + params.q_pk, function(error, data){
   
            console.log(data)
          let dfr_data = data.data
          console.log(dfr_data)
          let info = data.model_info
          console.log(info)
          $('#corpus').text(info.corpus)
          $("#term").text(info.term)
          $('#dn').text(info.docs)
          $('#topics').text(info.topics)
          $('#stop_words').text(info.stopwords)
          $('#start').text(info.ys)
          $("#end").text(info.ye)
          dfb().load(dfr_data, false, "thing");
        })

     
  
}
};//wrapper

thewrapper()