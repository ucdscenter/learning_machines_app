var qry, size, selected_database;
async function renderDataBaseSelect(dbdata) {
  console.log(dbdata);
  console.log(special_access);
  access_obj = JSON.parse(special_access);
  console.log(access_obj);
  removelist = ['CCHMC', 'Med_Applications', 'Mayerson', 'Mayerson_qna'];
  access_obj.forEach(function (d) {
    removelist[d] = '';
  });

  removelist.forEach(function (d) {
    if (d.length > 0) {
      delete dbdata[d];
    }

  });


  let search_year_end = 'year';
  let search_year_start = 'year';

  var height = 40;

  var dbBtsDiv = d3.select("#select-db");
  var dbBtns = dbBtsDiv.selectAll("div")
    .data(Object.keys(dbdata))
    .enter()
    .append("div")
    .attr("class", "col-xl-4 col-lg-6 col-md-6 col-sm-12 p-3")
    .attr("id", function (d) {
      return d + "_btn";
    });

  var dbdivs = dbBtns.append("div")
    .attr("class", "btn btn-success db-button row")
    .style("background-color", function (d) {
      return dbdata[d].color;
    })
    .style("border-color", "white")
    .style("text-align", "left");


  //.style("width", "100%")

  dbBtns.on("click", function (d) {
    showContinue('search-text');
    renderSearchInput(d, dbdata, fromhistory);
  });

  let formatter = d3.format(".3s");

  let dbLabels = dbdivs.append("div")
    .attr("class", "db_label col-12");


  dbLabels
    .append("h6")
    .style("display", "inline-block")
    .text(function (d) {
      return dbdata[d].name;
    });

  dbLabels
    .append("p")
    .style("display", "inline-block")
    .text(function (d) {
      return ": " + formatter(databases[d].rt_params.count) + " docs";
    });

  let dbthings = dbdivs.append("div")
    .attr("class", "col-12");

  let dbsvgs = dbthings
    .append("svg")
    .attr("class", "db_svg")
    .attr("id", function (d) {
      return d + "_svg";
    })
    .style("height", height + 'px')
    .style("width", "100%");



  Object.keys(dbdata).forEach(function (n) {
    yearExt = d3.extent(Object.keys(databases[n]['year_count']), function (d) {
      return d;
    });
    countMax = d3.max(Object.keys(database_years[n]), function (d) {
      return database_years[n][d];
    });

    var gwidth = $('#' + n + "_svg").width();

    var padding = { left: 15, right: 10, top: 5, bottom: 8 };

    if (yearExt[0] != undefined) {
      var xScale = d3.scaleLinear()
        .domain(yearExt)
        .range([0 + padding.left, gwidth - padding.left - padding.right]);
      var yScale = d3.scaleLinear()
        .domain([0, countMax])
        .range([height - padding.top - padding.bottom, 0 + padding.bottom]);
      var line = d3.line().x(function (d) {
        return xScale(d);
      })
        .y(function (d) {
          return yScale(database_years[n][d]);
        });


      d3.select("#" + n + '_svg').append("path")
        .datum(Object.keys(database_years[n]))
        .attr("class", "line")
        .attr("d", line);

      d3.select('#' + n + "_svg").append("circle")
        .attr("cx", xScale(yearExt[0]))
        .attr("cy", function () {
          return yScale(database_years[n][Object.keys(database_years[n])[0]]);
        }
        )
        .attr("r", 2);

      d3.select('#' + n + "_svg").append("circle")
        .attr("cx", xScale(yearExt[1]))
        .attr("cy", function () {
          return yScale(database_years[n][Object.keys(database_years[n])[Object.keys(database_years[n]).length - 1]]);
        }
        )
        .attr("r", 2);
      var maxIndex = 0;
      d3.select('#' + n + "_svg").append("circle")
        .attr("cx", function () {

          for (var i = 0; i < Object.keys(database_years[n]).length; i++) {
            if (database_years[n][Object.keys(database_years[n])[i]] == countMax) {
              return xScale(Object.keys(database_years[n])[i]);
            }
          }
        })
        .attr("cy", function () {
          return yScale(countMax);
        }
        )
        .style("fill", "blue")
        .attr("r", 2);



      d3.select('#' + n + "_svg").append("text")
        .attr("x", xScale(yearExt[0]))
        .attr("y", function () {
          return yScale(database_years[n][Object.keys(database_years[n])[0]]);
        }
        )
        .attr("dy", "-1px")
        .attr("class", 'graphtext')
        .attr("text-anchor", "end")
        .text(yearExt[0]);

      d3.select('#' + n + "_svg").append("text")
        .attr("x", xScale(yearExt[1]))
        .attr("y", function () {
          return yScale(database_years[n][Object.keys(database_years[n])[Object.keys(database_years[n]).length - 1]]);
        }
        )
        .attr("dy", "-1px")
        .attr("class", 'graphtext')
        .attr("text-anchor", "start")
        .text(yearExt[1]);

      var maxIndex = 0;
      d3.select('#' + n + "_svg").append("text")
        .attr("x", function () {

          for (var i = 0; i < Object.keys(database_years[n]).length; i++) {
            if (database_years[n][Object.keys(database_years[n])[i]] == countMax) {
              return xScale(Object.keys(database_years[n])[i]);
            }
          }
        })
        .attr("dy", "-1px")
        .attr("class", 'graphtext')
        .attr("text-anchor", "start")
        .attr("y", function () {
          return yScale(countMax);
        }
        )
        .style("fill", "blue")
        .text(countMax);

    }
    else {
      d3.select("#" + n + "_svg").append("text").attr("x", 20).attr("y", height / 2).text("No Time Data");
    }

  });//dbkeys foreach

  if (fromhistory) {
    $('#' + loaded.database + '_btn').trigger("click");
  }
}//renderDatabaseSelect

async function getArticles(qry, dbn, fromhistory, timeExt, size) {

  $('#search-qry').text((qry == '') ? "' '" : qry);
  $('#loading-img').removeClass("hidden");
  $('#time-graph').addClass("hidden");
  $('#min-count-graph').addClass("hidden");
  $('#explore-docs-btn-div').addClass("hidden");
  $('#explore-docs-time').addClass("hidden");

  let journal_select = $('#journal-options-select').val();

  let jurisdiction_select = $('#law-options-select').val();



  loaded.filter_pk = 1;
  getA(dbn, qry, timeExt, size);

  /*if (loaded.filter_pk == undefined){
     var postObj = {}
    $.post('/update_article_params/?filter_pk=', postObj, function(d){
      let response = JSON.parse(d);
      console.log(response.filter_pk)
      loaded.filter_pk = response.filter_pk
      getA(dbn, qry,  timeExt, size)
  })
  }
  else{
    getA(dbn, qry, timeExt, size)
  }*/
}

async function getA(dbn, qry, timeExt, size) {
  let journal_select = $('#journal-options-select').val();
  let jurisdiction_select = $('#law-options-select').val();
  let auth_search_qry = $('#search-author').val();
  let family_select = $('#family-options-select').val();

  let min_care_rating = $('#care_rating_low').val();
  let max_care_rating = -1;//$('#care_rating_high').val()


  search_year_start = $("#start-year").val();
  search_year_end = $("#end-year").val();

  var rgxp = new RegExp(/\d{2,}/, 'g');
  if (timeExt == undefined) {
    search_year_end = 'year';
    search_year_start = 'year';
  }
  else if (count(search_year_start, rgxp) == 0 || count(search_year_end, rgxp) == 0) {
    search_year_end = 'year';
    search_year_start = 'year';
  }
  else if (search_year_start == timeExt[0] && search_year_end == timeExt[1]) {
    search_year_end = 'year';
    search_year_start = 'year';
  }

  let qry_str = "/searcher/process_search?database=" + dbn + "&qry=" + qry + '&min_care_rating=' + min_care_rating + '&max_care_rating=' + max_care_rating + '&start=' + search_year_start + '&end=' + search_year_end + '&maximum_hits=' + size + '&journal=' + journal_select + '&auth_s=' + auth_search_qry + '&family=' + family_select + '&jurisdiction=' + jurisdiction_select + query_id_str + "&filter_pk=" + loaded.filter_pk;
  console.log(qry_str);
  let articles = await d3.json(qry_str);

  console.log(articles);

  $('#loading-img').addClass("hidden");
  $('#time-graph').removeClass("hidden");
  $('#min-count-graph').removeClass("hidden");
  $('#explore-docs-btn-div').removeClass("hidden");
  $('#explore-docs-time').removeClass("hidden");

  renderFilterDocs(articles, dbn, qry);
}

function renderSearchInput(d, dbdata) {
  console.log(d);
  $('#search-term').off('keyup');
  $('.doc-button').off("click");
  $('#archaeology-row-div select').val('all');
  $('#caselaw-row-div select').val('all');
  $('#db-search-label').text(dbdata[d].name);
  $('#search-term').focus(function (e) {
    $(this).css("border", "1px solid " + dbdata[d].color);
    $(this).css("box-shadow", "0 0 10px " + dbdata[d].color);
  });

  $('.doc-button').css("background-color", dbdata[d].color);
  if (d == 'Care_Reviews') {
    $('#carereview-row-div').removeClass("hidden");
    $('#archaeology-row-div').addClass("hidden");
    $('#caselaw-row-div').addClass("hidden");
    $('#family-row-div').addClass("hidden");
  }
  else if (d == "Archaeology") {
    $('#archaeology-row-div').removeClass("hidden");
    $('#caselaw-row-div').addClass("hidden");
    $('#coi-row-div').addClass("hidden");
    $('#family-row-div').addClass("hidden");
    $('#search-term-div').removeClass("hidden");
    $('#carereview-row-div').addClass("hidden");
  }
  else if (d == 'Pubmed_COI') {
    $('#coi-row-div').removeClass("hidden");
    $('#search-term-div').removeClass("hidden");
    $('#family-row-div').addClass("hidden");
    $('#coi-row-div').on("input", function (d) {
      $('#search-term-div').addClass("hidden");
      $('#search-term').val('');
    });
    $('#archaeology-row-div').addClass("hidden");
    $('#caselaw-row-div').addClass("hidden");
    $('#carereview-row-div').addClass("hidden");
  }
  //no more non federal jurisdiction
  /*else if (d == 'CaseLaw_v2'){
    $('#caselaw-row-div').removeClass("hidden")
    $('#archaeology-row-div').addClass("hidden")
  }*/
  else if (d == 'Med_Applications') {
    $('#coi-row-div').addClass("hidden");
    $('#caselaw-row-div').addClass("hidden");
    $('#archaeology-row-div').addClass("hidden");
    $('#search-term-div').removeClass("hidden");
    $('#family-row-div').removeClass("hidden");
    $('#carereview-row-div').addClass("hidden");
  }

  else {
    $('#coi-row-div').addClass("hidden");
    $('#caselaw-row-div').addClass("hidden");
    $('#archaeology-row-div').addClass("hidden");
    $('#family-row-div').addClass("hidden");
    $('#carereview-row-div').addClass("hidden");
    $('#search-term-div').removeClass("hidden");


  }


  $('.doc-button').click(function (e) {
    qry = $('#search-term').val();
    size = $(this).attr('id');
    size = size.split('-')[1];
    selected_database = d;
    showContinue('filter-docs');
    getArticles(qry, d, fromhistory, timeExt, size);
  });

  $('#search-term').on('keyup', function (e) {
    if (e.keyCode == 13) {
      $('#docs-5000').trigger("click");
    }
  });

  var timeExt = d3.extent(Object.keys(database_years[d]), function (d) {
    return parseInt(d);
  });

  if (timeExt[0] != undefined) {
    $('#slider-div').removeClass("hidden");
    $('#start-year').val(timeExt[0]);
    $('#end-year').val(timeExt[1]);
  }
  else {
    $('#start-year').val("year");
    $('#end-year').val("year");
    $('#slider-div').addClass("hidden");
  }

  if (fromhistory) {
    if (loaded.start != 'year') {
      $('#start-year').val(loaded.start);
      $('#end-year').val(loaded.end);
    }

    $('#archaeology-row-div select').val(loaded.journal);
    $('#caselaw-row-div select').val(loaded.jurisdiction);

    $('#search-term').val(loaded.qry);
    console.log(loaded.maximum_hits);
    console.log($('#docs-' + loaded.maximum_hits));

    setTimeout(function () { $('#docs-' + loaded.maximum_hits).trigger("click"); }, 1000);
  }

}

function renderFilterDocs(articles, dbn, qry) {
  var total_articles = articles.results.length;
  var docCount = dc.dataCount('.dc-doc-count');
  var timeChart = dc.barChart('#time-graph');
  var minSelect = dc.barChart('#min-count-graph');

  var dateFormat = d3.timeFormat("%Y-%m-%d");
  var dateFormatParser = d3.timeParse(dateFormat);
  var numberFormat = d3.format('.2f');

  var maxCount = 0;
  articles.results.forEach(function (d) {
    d.date = dateFormatParser(d.date);
    if (d.min_term_occurrence > maxCount) {
      maxCount = d.min_term_occurrence;
    }
  });

  var respd = crossfilter(articles.results);
  var all = respd.groupAll();

  var countDimension = respd.dimension(function (d) {
    return d.min_term_occurrence;
  });
  var monthDimension = respd.dimension(function (d) {
    return d3.timeYear(d.date);
  });

  function accumulate_group(source_group) {
    return {
      all: function () {
        var cumulate = 0;
        return source_group.all().reverse().map(function (d) {
          cumulate += d.value;
          return { key: d.key, value: cumulate };
        });
      }
    };
  }

  var accGroup = countDimension.group().reduceSum(function (d) {
    return 1;
  });
  //var the_acc_groups = accGroup.all()
  var monthlyMoveGroup = monthDimension.group().reduceSum(function (d) {
    return 1;
  });
  var chartwidth = $('#time-graph').width();
  timeChart
    .width(chartwidth - 50)
    .height(230)
    .margins({ top: 10, right: 50, bottom: 30, left: 50 })
    .dimension(monthDimension)
    .group(monthlyMoveGroup)
    .centerBar(true)
    .colors(DATABASES[dbn].nonbgcolor)
    .x(d3.scaleTime().domain(function () {
      var e = d3.extent(articles.results, function (d) {
        return d.date;
      });
      if (e[1] == undefined) {
        return e;
      }
      e[0] = new Date(e[0].getFullYear() - 1, 0, 1);
      e[1] = new Date(e[1].getFullYear() + 1, 0, 1);
      return e;
    }()))
    .xAxisLabel("Years")
    .yAxisLabel("Doc Count")
    .alwaysUseRounding(true)
    .xUnits(d3.timeYear)
    .elasticY(true)
    .round(d3.timeYear.round)
    .yAxis().ticks(3);


  timeChart.xAxis().tickFormat(d3.timeFormat('%Y'));

  minSelect
    .width(chartwidth - 50)
    .height(130)
    .margins({ top: 10, right: 50, bottom: 30, left: 50 })
    .dimension(countDimension)
    .group(accGroup)
    .centerBar(false)
    .colors(DATABASES[dbn].nonbgcolor)
    .x(d3.scaleLinear().domain([0, maxCount + 1]))
    .alwaysUseRounding(true)
    .xAxisLabel("Occurrence of search term(s)")
    .yAxisLabel("Doc Count")
    .elasticY(true)
    .round(function (d) {
      return Math.floor(d);
    })
    .yAxis().ticks(3);





  docCount.dimension(respd)
    .group(all)
    .html({
      some: function () {
        return '<strong id="final_count">%filter-count</strong> selected out of <strong>%total-count</strong> records' +
          ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>';
      }(),
      all: function () {
        return '<strong id="final_count">%total-count</strong> records selected. Please click and drag on the graph to apply filters.';
      }()
    })
    .on("renderlet", function (d) {
      if (d3.select('#explore-docs-div').classed("hidden") == false) {
        showContinue('filter-docs');
      }
      updateEstimatedTime(d.group().value(), dbn, 'explore');
    });
  dc.renderAll();

  $('.explore-docs-btn').off("click");
  $('.explore-docs-btn').click(function (e) {
    $('doc-table-wrapper').scrollTop(0);
    let selected_docs = minSelect.dimension().top(100);
    console.log(selected_docs);
    console.log(databases[dbn]["rt_params"].max);
    if (selected_docs.length > databases[dbn]['rt_params'].max) {
      alert("Warning!\nIf you continue with this number of documents we will cut the model to " + databases[dbn]['rt_params'].max + " documents at runtime to save our poor servers.\nPlease contact us at mccabeen@ucmail.uc.edu if you want to run extra large models");
    }
    showContinue('explore-docs');
    renderExploreDocs(selected_docs, dbn, qry, fromhistory, total_articles);
  });

  let table_last_refreshed_height = 0;
  let displayed_rows = 100;

  $('#doc-table-wrapper').on('scroll', (e) => {
    const almost_hitting_scroll_end = Math.abs(e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop) < Math.abs(0.3 * e.target.scrollHeight);
    if (almost_hitting_scroll_end && table_last_refreshed_height < e.target.scrollHeight && displayed_rows < total_articles) {
      table_last_refreshed_height = e.target.scrollHeight;
      displayed_rows = displayed_rows + 100 < total_articles ? displayed_rows + 100 : total_articles;
      const filteredData = minSelect.dimension().top(displayed_rows);
      renderTableBody(filteredData, dbn);
    }
  });

  if (fromhistory) {
    var ys;
    var ye;
    if (restoredFilters.ys != -1) {
      if (restoredFilters.ys != 'year') {
        ys = dateFormatParser(restoredFilters.ys + '-01-01');
        ye = dateFormatParser(restoredFilters.ye + '-01-01');
        datefilter = dc.filters.RangedFilter(ys, ye);
        timeChart.filter(datefilter);
      }
    }

    if (restoredFilters.min != -1) {
      minfilter = dc.filters.RangedFilter(restoredFilters.min, restoredFilters.max);
      minSelect.filter(minfilter);
    }



    dc.renderAll();
    $('.explore-docs-btn').trigger("click");

  }

}//renderFilterDocs


function updateFilters() {
  var yearlabeltext = d3.select('#label_for_month_bar').text();
  var countlabeltext = d3.select('#label_for_count_bar').text();

  var yearArr = ['-1', '-1'];
  if (yearlabeltext.length > 0) {
    yearArr = prepareDates(yearlabeltext);
  }
  var countArr = ['-1', '-1'];
  if (countlabeltext.length > 0) {
    countArr = prepareCounts(countlabeltext);
  }
  return { "years": yearArr, "counts": countArr };
}

function prepareDates(labelstring) {
  var cut = labelstring.slice(1, labelstring.length - 1).split(' ');
  return [cut[0].split('/')[2], cut[2].split('/')[2]];
}
function prepareCounts(labelstring) {
  var cut = labelstring.slice(1, labelstring.length - 1).split(' ');
  return [cut[0].split('.')[0], cut[2].split('.')[0]];
}


function updateEstimatedTime(selected, dbn, pre) {

  let est_time = (databases[dbn]['rt_params'].a * selected) + databases[dbn]['rt_params'].b;
  let formatted_est_time = new Date(est_time * 1000).toISOString().substr(11, 8);

  $('.' + pre + '-estimated-time').text(formatted_est_time);
  if (pre == 'vis') {
    $('.filtered-count').text(selected);
  }

  if (est_time > 1200) {
    $('.' + pre + '-docs-btn').css("background-color", "red");
    $('.' + pre + '-estimated-time').css("color", "red");
    return "red";
  }
  else if (est_time > 600) {
    $('.' + pre + '-docs-btn').css("background-color", "orange");
    $('.' + pre + '-estimated-time').css("color", "orange");
    return "orange";
  }
  else if (est_time > 200) {
    $('.' + pre + '-docs-btn').css("background-color", "yellow");
    $('.' + pre + '-estimated-time').css("color", "#999900");
    return "#999900";
  }
  else {
    $('.' + pre + '-docs-btn').css("background-color", "green");
    $('.' + pre + '-estimated-time').css("color", "green");
    return "green";
  }

}


function renderTHead(articles_length, dbn) {
  d3.select('.tdoc-head').remove();
  d3.select('.tdoc-body').remove();
  var table = d3.select(".dc-doc-table");
  var thead = table.append("thead").attr("class", "tdoc-head");
  var tbody = table.append("tbody").attr("class", "tdoc-body");
  var columns = ['article_title', 'date', 'score', 'included'];
  thead.append("tr")
    .selectAll("th").data(columns)
    .enter()
    .append("th")
    .attr("class", "col tdoc-th")
    .text(function (column) {
      if (column == 'article_title') {
        return 'Article Title';
      }
      if (column == 'id') {
        return 'Id';
      }

      return column;
    })
    .style("width", function (column) {
      if (column == 'article_title') {
        return "50%";
      }
      /*if(column == 'included'){
        return "10%"
      }*/
      return "25%";
    })
    .attr("id", function (column) {
      if (column == 'included') {
        return 'select-all-docs';
      }
    })
    .style("cursor", function (column) {
      if (column == 'included') {
        return 'pointer';
      }
      return 'default';
    });



  excludedDocs = [];
  includedDocs = [];
  prevChecked = true;

  /*var checked_header = $(".tdoc-th")
  var shitty_column_index = 0
  checked_header.append(function(){
      if (shitty_column_index != 2){
          shitty_column_index++
        return "" 
      }
      return "<input type='checkbox'/ id='select-all-docs' checked>"
      
  })*/


  $('#select-all-docs').click(function () {
    if (prevChecked) {
      prevChecked = false;
    }
    else {
      prevChecked = true;
    }
    includedDocs = [];
    excludedDocs = [];



    if (prevChecked) {
      $('.tr-check').prop('checked', true);
      $('.filtered-count').css('color', updateEstimatedTime(articles_length, dbn, 'vis'));
    }
    else {
      $('.tr-check').prop('checked', false);
      $('.filtered-count').css('color', updateEstimatedTime(0, dbn, 'vis'));
    }

  });
}//renderTHead


function renderTable(filteredData, dbn, qry) {
  includedDocs = [];
  excludedDocs = [];
  d3.selectAll(".tdoc-row").remove();

  renderTableBody(filteredData, dbn);

  var checked_columns = d3.selectAll(".td-included");
  checked_columns.append("input")
    .attr("type", "checkbox")
    .attr("class", "tr-check")
    .property("checked", prevChecked)
    .on("click", function (d, i) {

      var inthere = $(this).prop("checked");
      var document_id = filteredData[i].id;
      if (prevChecked) {
        if (!inthere) {
          excludedDocs.push(document_id);
          //$('#excluded_docs').val(excludedDocs.join("-"))
          $('.filtered-count').css('color', updateEstimatedTime(filteredData.length - excludedDocs.length, dbn, 'vis'));
        }
        else {
          excludedDocs = excludedDocs.filter(function (a) {
            if (a == document_id) {
              return false;
            }
            return true;
          });
          //$('#excluded_docs').val(excludedDocs.join("-"))
          $('.filtered-count').css('color', updateEstimatedTime(filteredData.length - excludedDocs.length, dbn, 'vis'));
        }

      }
      else {
        if (inthere) {
          includedDocs.push(document_id);
          $('.filtered-count').css('color', updateEstimatedTime(includedDocs.length, dbn, 'vis'));

        }
        else {
          includedDocs = includedDocs.filter(function (a) {
            if (a == document_id) {
              return false;
            }
            return true;
          });
          $('.filtered-count').css('color', updateEstimatedTime(includedDocs.length, dbn, 'vis'));
        }
      }
      console.log(includedDocs);
      console.log(excludedDocs);
    });

  $(".dc-doc-table>tbody>tr:first").trigger('click');
  $(".td-included").addClass('hidden');
  $("#select-all-docs").addClass('hidden');
}//renderTable
const count = (str, regexp) => {
  const re = regexp;
  return ((str || '').match(re) || []).length;
};
function renderTableBody(filteredData, dbn) {
  var columns = ['article_title', 'date', 'score', 'included '];
  var tbody = d3.select(".tdoc-body");

  var rows = tbody
    .selectAll("tr")
    .data(filteredData)
    .enter()
    .append("tr")
    .attr("class", "tdoc-row")
    .on("click", function (d) {
      if (d != 0) {
        d3.selectAll(".rowselected").classed("rowselected", false).style('background-color', "");
        d3.select(this).classed("rowselected", true).style("background-color", DATABASES[dbn].color);
        refreshArticle(d.id, 'Pubmed Article', dbn);
      }
    });

  rows.selectAll('td')
    .data(function (row) {
      return columns.map(function (column) {
        if (column == 'score') {
          return { column: column, value: row["min_term_occurrence"] };
        }
        else {
          return { column: column, value: row[column] };
        }

      });
    })
    .enter()
    .append('td')
    .text(function (d) {
      if (d.column == "id") {
        if (d.value.length > 10) {
          let mid = Math.ceil(d.value.length / 2);
          return d.value.slice(0, mid) + " " + d.value.slice(mid);
        }
        else {
          return d.value;
        }

      }
      if (d.column == "date") {
        return d3.timeYear(d.value).getFullYear();
      }
      return d.value;
    })
    .attr("class", function (d) {
      return "td-" + d.column;
    });
}

async function refreshArticle(article_id, article_type, dbn) {

  let article = await d3.json("/searcher/get_doc/?database=" + dbn + "&doc_id=" + article_id);
  console.log(article);
  $('#article-title').text(article.summary.article_title);
  $('#article-id').text(article.summary.id);
  $('#article-journal').text(article.summary.journal_title);
  $('#article-year').text(article.summary.year);
  $('#article-author').text(article.summary.author);

  let article_text = article.data;
  article_text = article_text.replace("<PubmedArticle>", "");
  article_text = article_text.replace("</PubmedArticle>", "");
  let article_paras = article_text.split('\n');
  for (var i = 0; i < article_paras.length; i++) {
    article_paras[i] = '<p class="article-p">' + article_paras[i] + '</p>';
  }

  let articletext = article_paras.join("");

  $('#article-panel').html("<result>" + articletext + "</result>");
  $('#search-article-text').val("");
  $('#article-search-count').text("");
  $('#article-search-box').css("opacity", "0").css("visibility", "hidden");




  function hiliter(word, element) {
    var rgxp = new RegExp(word, 'g');
    var crgxp = new RegExp(word.charAt(0).toUpperCase() + word.slice(1), 'g');
    var ccrgxp = new RegExp(word.toUpperCase(), 'g');
    var repl = '<span class="highlighted">' + word + '</span>';
    var crepl = '<span class="highlighted">' + word.charAt(0).toUpperCase() + word.slice(1) + '</span>';
    var ccrepl = '<span class="highlighted">' + word.toUpperCase() + '</span>';
    element.html(element.html().replace(rgxp, repl));
    element.html(element.html().replace(crgxp, crepl));
    element.html(element.html().replace(ccrgxp, ccrepl));
    var c1 = count(articletext, rgxp);
    var c2 = count(articletext, crgxp);
    var c3 = count(articletext, ccrgxp);
    var matchCount = c1 + c2 + c3;
    return matchCount;
  }
  $('#search-article-text').on("change", function (e) {
    $('#article-panel').html("<result>" + articletext + "</result>");
    $('#article-search-count').text("");
    $('#article-search-box').css("opacity", "0").css("visibility", "hidden");
    if ($(this).val().length != 0) {
      $('#article-search-count').text("Matches : " + hiliter($(this).val(), $('#article-panel')));
      $('#article-search-box').css("opacity", "1").css("visibility", "visible");
    }

  });
}//refreshArticle


function renderExploreDocs(articles, dbn, qry, fromhistory, total_docs) {
  console.log(dbn);
  renderTHead(articles.length, dbn, fromhistory);
  renderTable(articles, dbn, qry, fromhistory);
  $('.article-div').css("background-color", DATABASES[dbn].color);
  $('.filtered-count').text(total_docs);
  $('.total-filtered-count').text(total_docs);


  $('.filtered-count').css('color', updateEstimatedTime(total_docs, dbn, 'vis'));
  $('#choose-vis-btn').on("click", function (d) {
    showContinue('select-vis');
    renderVisSelect(dbn, qry, fromhistory);
  });

  if (dbn == 'JSTOR') {
    $('#download-table-btn').removeClass('hidden');

    var downloadcsvformat = [];
    $('#download-table-btn').click(function () {

      var docrows = d3.selectAll(".tdoc-row");
      docrows.each(function (d) {

        if (d3.select(this).select(".td-included").select("input").property("checked")) {
          downloadcsvformat.push(d);
        }
      });
      let csvstring = "";
      /*Object.keys(downloadcsvformat[0]).forEach(function(d){
        csvstring = csvstring + d + ", "
      })
      csvstring = csvstring + "\n"*/
      var regex = / , /g;

      downloadcsvformat.forEach(function (d) {
        Object.keys(downloadcsvformat[0]).forEach(function (k) {
          if (k == 'authors') {
            csvstring = csvstring + d[k].replace(regex, '-') + ", ";
          }
          else {
            csvstring = csvstring + d[k] + ", ";
          }
        });
        csvstring = csvstring + "\r\n";
      });
      console.log(csvstring);
      //console.log(docrows)
    });
  }
  if (fromhistory) {

    console.log(restoredFilters.listtype);

    var restoredDocsList = restoredFilters.docs.split('-');
    restoredDocsList.shift();
    if (restoredFilters.listtype == 'select') {
      $('#select-all-docs').trigger("click");
      d3.selectAll(".tdoc-row").attr("nothing", function (d, i) {
        for (var i = 0; i < restoredDocsList.length; i++) {
          if (restoredDocsList[i] == d.id) {
            d3.select(this).select(".tr-check").property("checked", true);
            d3.select(this).select(".tr-check").dispatch("click");

            i = restoredDocsList.length;
          }
        }


      });

    }
    else {
      d3.selectAll(".tdoc-row").attr("nothing", function (d, i) {
        for (var i = 0; i < restoredDocsList.length; i++) {
          if (restoredDocsList[i] == d.id) {
            d3.select(this).select(".tr-check").property("checked", false);
            d3.select(this).select(".tr-check").dispatch("click");

            i = restoredDocsList.length;
          }
        }


      });
    }
    $('#choose-vis-btn').trigger("click");
  }

}

function renderVisSelect(dbn, qry) {
  $('.fig.db-button').css('background-color', DATABASES[dbn].color);
  $('.fig.db-button').css('border-color', 'white');

  $('.fig').on("click", function (d) {
    showContinue('vis-params');
    renderVisParams(dbn, qry, $(this).attr("id"));
  });

  fromhistory = false;

}

const MAX_TOPICS = 50;
const MIN_TOPICS = 1;

function renderVisParams(dbn, qry, method, fromhistory) {

  $('#submit-wrapper-button').off("click");
  $('#method-name').text(method);
  $('#num_topics').change(function (e) {
    if ($('#num_topics').val() > MAX_TOPICS) {
      $('#num_topics').val(MAX_TOPICS);
    }
    if ($('#num_topics').val() < MIN_TOPICS) {
      $('#num_topics').val(MIN_TOPICS);
    }
  });

  $('#num_clusters').change(function (e) {
    if ($('#num_clusters').val() > MAX_TOPICS) {
      $('#num_clusters').val(MAX_TOPICS);
    }
    if ($('#num_clusters').val() < MIN_TOPICS) {
      $('#num_clusters').val(MIN_TOPICS);
    }
  });

  console.log(method);
  $('#form-div').css("background-color", DATABASES[dbn].color);
  if (method == "DFR browser") {
    $('#mlmom-options').addClass("hidden");
    $(".not-w2v").removeClass("hidden");
    $(".lda-options").removeClass("hidden");
    $(".vector-options").addClass("hidden");
    $("#word2vec-doc2vec-chooser").addClass("hidden");
  }
  if (method == "pyLDAvis") {
    $('#mlmom-options').addClass("hidden");
    $(".not-w2v").removeClass("hidden");
    $(".lda-options").removeClass("hidden");
    $(".vector-options").addClass("hidden");
    $("#word2vec-doc2vec-chooser").addClass("hidden");
  }
  if (method == "multilevel_lda") {
    $(".lda-options").removeClass("hidden");
    $(".not-w2v").removeClass("hidden");
    $('#mlmom-options').removeClass("hidden");
    $(".vector-options").addClass("hidden");
    $("#word2vec-doc2vec-chooser").addClass("hidden");
  }
  if (method == "word2vec" || method == 'doc2vec') {
    $('#mlmom-options').addClass("hidden");
    $('#params-label').text("Word2Vec/Doc2Vec Parameters");
    $(".not-w2v").addClass("hidden");
    $(".vector-options").removeClass("hidden");
    $(".lda-options").removeClass("hidden");
    $("#word2vec-doc2vec-chooser").removeClass("hidden");
    /*$('#method-radio').on("click", function(d){
      let vec_method = $('#method-radio>.active').attr("id")
      method = vec_method.split("-")[0]
      console.log(method)
      $('#method-name').text(method)
      $('#static-method').val(method)
    })*/
    $("#doc2vec-radio").on("click", function (d) {
      method = "doc2vec";
      $('#method-name').text(method);
      $('#static-method').val(method);
    });
    $("#word2vec-radio").on("click", function (d) {
      method = "word2vec";
      $('#method-name').text(method);
      $('#static-method').val(method);
    });


  }
  if (method == 'sentiment') {
    $('#sentiment-options').removeClass("hidden");
  }
  $('#static-method').val(method);


  /*
  let qry_str = "/searcher/process_search?database=" + dbn + "&qry=" + qry + '&start=' + search_year_start + '&end=' + search_year_end + '&maximum_hits=' + size + '&journal=' + journal_select + '&auth_s=' + auth_search_qry +'&family=' + family_select +'&jurisdiction=' + jurisdiction_select + query_id_str + "&filter_pk=" + loaded.filter_pk
  */


  $('#submit-wrapper-button').click(function (e) {
    var filters = updateFilters();

    var postObj = {
      start: search_year_start,//$( "#start-year" ).val(),
      end: search_year_end,//$( "#end-year" ).val(),
      f_start: filters.years[0],
      f_end: filters.years[1],
      qry: qry,
      ngrams: $('#ngrams-check').prop("checked"),
      tfidf: $('#tfidf-check').prop("checked"),
      maximum_hits: size,
      method: method,
      stop_words: $('#stop-word').val(),
      replacement: $('#word-replacement').val(),
      phrases: $('#phrases').val(),
      level_select: $('#level-select').val(),
      num_topics: $('#num_topics').val(),
      num_clusters: $('#num_clusters').val(),
      passes: 20,
      database: selected_database,
      journal: $('#journal-options-select').val(),
      jurisdiction_select: $('#law-options-select').val(),
      min_care_rating: $('#care_rating_low').val(),
      // max_care_rating: $('#care_rating_high').val(),
      auth_s: $('#search-author').val(),
      family_select: $('#family-options-select').val(),
      included: includedDocs,
      excluded: excludedDocs,
      min_occurrence: filters.counts[0],
      max_occurrence: filters.counts[1],
      doc_count: d3.select('#final_count').text(),
      sentiment_select: $("#sentiment-select").val()
    };
    console.log(postObj);
    $.post('/searcher/start_model_run/', postObj, function (d) {
      let response = JSON.parse(d);
      console.log(response);
      $('#pk_text').val(response.filter_pk);
      $('#run-model').submit();
    });
  });
};

function showContinue(prefix) {
  let sections = ['database-select', 'search-text', 'filter-docs', 'explore-docs', 'select-vis', 'vis-params'];
  let remove_index = false;
  for (var i = 0; i < sections.length; i++) {
    if (sections[i] == prefix) {
      remove_index = true;
    }
    if (remove_index) {

      $('#' + sections[i] + '-div').addClass("hidden");
      $('#' + sections[i] + '-nav').addClass("disabled");
      $('#' + sections[i] + '-nav').removeClass("side-nav-active");
    }
  }
  $('#' + prefix + '-div').removeClass("hidden");
  $('#' + prefix + '-nav').removeClass("disabled");
  $('#' + prefix + '-nav').addClass("side-nav-active");
  $('#' + prefix + '-nav').trigger('click');

}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// TODO: Extract to module
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// TODO: Extract to module
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let includedDocs = [];
let excludedDocs = [];
let prevChecked = false;



function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
  return (/^(HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    }
  }
});


let DATABASES =
{
  'Hathi_Climate' : {
    'options': [],
    'name': "Hathi Climate"
  },
  'Hathi_Rand' : {
    'options': [],
    'name': "Hathi Random"
  },

  'Poetry_Foundation' : {
    'options': [],
    'name': "Poetry Foundation"
  },
  'News_Articles': {
    'options': [],
    'name': "News Articles"
  },
  'SEC_Texts': {
    'options': [],
    'name': 'Form 8K Sample'
  },
  'China_news': {
    'options': [],
    'name': 'News Transcripts - China'
  },
  'caselaw_env': {
    'options': [],
    'name': 'CaseLaw Environment'
  },
  'Care_Reviews': {
    'options': [],
    'name': 'ER, Urgent Care Reviews'
  },
  'Covid': {
    'options': [],
    'name': 'COVID-19 Articles'
  },
  'Pubmed': {
    'options': [],
    'name': 'Pubmed Abstract'
  },
  'PMC': {
    'options': [],
    'name': 'Pubmed Central'
  },
  'JSTOR': {
    'options': [],
    'name': 'Jstor Life Science'
  },
  'CaseLaw_v2': {
    'options': [{ "type": "select", "choices": { "name": "Jurisdiction", "selects": ["all", "federal", "other"] } }],
    'name': 'CaseLaw'
  },
  'Archaeology': {
    'options': [{ "type": "select", "choices": { "name": "Journal", "selects": ["all", "Latin American Antiquity", "Ancient Mesoamerica"] } }],
    'name': 'Archaeology'
  },
  'Latin': {
    'options': [],
    'name': 'Iowa Latin Canon'
  },
  'Ehealth': {
    'options': [],
    'name': 'Ehealth Alzheimer'
  },
  'TCP': {
    'options': [],
    'name': 'Text Creation'
  },
  'ACJ': {
    'options': [],
    'name': 'AC Justice '
  },
  'AA': {
    'options': [],
    'name': 'Anesthesiology'
  },
  'CCHMC': {
    'options': [],
    'name': 'CCHMC Notes'
  },
  'TED': {
    'options': [],
    'name': 'Ted Talks'
  },
  'Pulmonary': {
    'options': [],
    'name': 'Pulmonary'
  },
  'Ehealth_Threads': {
    'options': [],
    'name': 'Ehealth Threads'
  },
  'Cannabis_News': {
    'options': [],
    'name': 'Cannabis News'
  },
  'NPO_taxforms': {
    'options': [],
    'name': 'NPO Descriptions'
  },
  'OHNPO_taxforms': {
    'options': [],
    'name': 'OH NPO Descriptions'
  },
  'Pubmed_COI': {
    'options': [],
    'name': 'Pubmed COI'
  },
  'Reddit': {
    'options': [],
    'name': 'Reddit'
  },
  'SAA_Abstracts': {
    'options': [],
    'name': 'SAA Abstracts'
  },
  'Med_Applications': {
    'options': [],
    'name': 'Med Applications'
  },
  'Mayerson': {
    'options': [],
    'name': 'Mayerson'
  },
  'Mayerson_qna': {
    'options': [],
    'name': 'Mayerson QNA'
  },
  'early_modern': {
    'options': [],
    'name': 'Early Modern JSTOR'
  },
  'NYNPO_taxforms': {
    'options': [],
    'name': 'NY NPO Descriptions'
  }
};
let dbi = 0;
Object.keys(DATABASES).forEach(function (db) {
  let color = d3.color(d3.select("#other-color").style("color")).hex();
  let third_color = d3.color(d3.select("#third-color").style("color"));
  let rgbObj = hexToRgb(color);
  /*let rgbObj = hexToRgb(d3.interpolateViridis(dbi/ Object.keys(DATABASES).length))
  DATABASES[db].color = "rgb(" + rgbObj.r  + "," + rgbObj.g + "," + rgbObj.b + ", .5)"
  DATABASES[db].nonbgcolor = d3.interpolateViridis(dbi/ Object.keys(DATABASES).length)*/
  DATABASES[db].color = "rgb(" + rgbObj.r + "," + rgbObj.g + "," + rgbObj.b + ", .5)";
  DATABASES[db].nonbgcolor = third_color;
  dbi++;
});



function getJsonFromUrl(hashBased) {
  var query;
  if (hashBased) {
    var pos = location.href.indexOf("?");
    if (pos == -1) return [];
    query = location.href.substr(pos + 1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function (part) {
    if (!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq > -1 ? part.substr(0, eq) : part;
    var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
    var from = key.indexOf("[");
    if (from == -1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]", from);
      var index = decodeURIComponent(key.substring(from + 1, to));
      key = decodeURIComponent(key.substring(0, from));
      if (!result[key]) result[key] = [];
      if (!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}



let query_id_str = "";
let restoredFilters = { "ys": -1, "ye": -1, "min": -1, "max": -1 };
let loaded = getJsonFromUrl(window.location.search);
let fromhistory = false;
async function wrapper() {

  d3.select("#navbarDropdown").on("click", function (e) {
    d3.select("#account_dropdown").classed("show", !d3.select("#account_dropdown").classed("show"));
  });
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
  $("#base-row").removeClass("justify-content-center").removeClass("align-items-center");
  console.log(window.location.search);
  if (loaded.qry != undefined) {
    restoredFilters = await d3.json("/get_stored_filter/?filter_id=" + loaded.filter_pk);
    console.log(restoredFilters);


    console.log(loaded.database);
    query_id_str = '&query_id=' + loaded.query_id;
    fromhistory = true;
    renderDataBaseSelect(DATABASES, fromhistory = true);

  }
  else {
    renderDataBaseSelect(DATABASES);
  }



  d3.selectAll(".section").style("height", function (d) {
    return "400px";
  });

  //$('.content').scrollspy({ target: '#side-nav', offset: 0})

  $("#side-nav a").on('click', function (event) {

    // Make sure this.hasefore overriding default behavior
    if (this.hash !== "") {

      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;


      $('.content, html').animate({
        scrollTop: $(hash).offset().top
      }, 800, function () {

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });

    } // End if

  });
}

wrapper();
