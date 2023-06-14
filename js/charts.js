var binNo = 0;
var binsG;
var arcGenerator;

var calculateBinsFromAlphabets = function(nBin) {
  var bins = [];
  var alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  binNo = Math.ceil(26 / nBin);
  var sIndex = 0;
  for (let i = 0; i < binNo; i++) {
    var eIndex = sIndex + nBin;
    var binst = alphabets.slice(sIndex, eIndex).join('-');
    bins.push(binst);
    sIndex = eIndex;
  }
  return bins;
};

var onlyLetters = function(text) {
  var notLetter = /[^a-z]/g;
  return text.toLowerCase().replace(notLetter, "");
};

var formatBin = function(bin) {
  var temp = bin.split("-");
  return temp[0] + " - " + temp[temp.length - 1];
};

function countAlphabets(input, bins) {
  var text = onlyLetters(input);
  var count = {};

  for (var i = 0; i < text.length; i++) {
    var letter = text[i];
    if (count.hasOwnProperty(letter.toUpperCase())) {
      count[letter.toUpperCase()] += 1;
    } else {
      count[letter.toUpperCase()] = 1;
    }
  }

  var frequencies = [];

  for (var i = 0; i < bins.length; i++) {
    var tbin = bins[i].split("-");
    var frequency = 0;

    for (var k = 0; k < tbin.length; k++) {
      var bin = tbin[k];

      if (count.hasOwnProperty(bin)) {
        frequency += count[bin];
      }
    }

    frequencies.push({ key: formatBin(bins[i]), value: frequency });
  }

  return frequencies;
}

var updateCharts = function() {
  var inpStr = String(document.getElementById("inpStr").value);
  var inpBinNo = parseInt(document.getElementById("inpBinNo").value);
  binsG = calculateBinsFromAlphabets(inpBinNo);
  var count = countAlphabets(inpStr, binsG);

  if (count.length < 1) {
    return;
  }

  drawBarChart(count);
  drawPieChart(count);
};
var colorScale = d3.scaleOrdinal(d3.schemeTableau10);

//BarChart
var drawBarChart = function(count) {
  var svg = d3.select("#barchartSVG");
  var countMin = 0;
  var countMax = d3.max(count, function(d) { return d.value; });

  var margin = {
    top: 50,
    right: 50,
    bottom: 90,
    left: 10
  };

  var bounds = svg.node().getBoundingClientRect();
  var plotWidth = bounds.width - margin.right - margin.left;
  var plotHeight = bounds.height - margin.top - margin.bottom;

  svg.selectAll("*").remove();

  var plot = svg.append("g")
    .attr("transform", translate(margin.left, margin.top));

  var letterScale = d3.scaleBand()
    .domain(count.map(function(d) { return d.key; }))
    .range([0, plotWidth])
    .padding(0.1);

  var countScale = d3.scaleLinear()
    .domain([countMin, countMax])
    .range([plotHeight, 0])
    .nice();

    var bars = plot.selectAll(".bar")
    .data(count, function(d) { return d.key; });
  
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return letterScale(d.key); })
    .attr("width", letterScale.bandwidth())
    .attr("y", plotHeight)
    .attr("height", 0)
    .attr("fill", function(d) { return colorScale(d.key); })
    .on("click", handleMouseClickBar)
    .on("mouseover", handleMouseOverBar)
    .on("mouseout", handleMouseOutBar)
    .transition()
    .duration(500)
    .attr("y", function(d) { return countScale(d.value); })
    .attr("height", function(d) { return plotHeight - countScale(d.value); });
    
  
  bars.transition()
    .attr("x", function(d) { return letterScale(d.key); })
    .attr("width", letterScale.bandwidth())
    .attr("y", function(d) { return countScale(d.value); })
    .attr("height", function(d) { return plotHeight - countScale(d.value); })
    .attr("fill", function(d) { return colorScale(d.key); });

    bars.exit()
    .transition()
    .duration(500)
    .attr("y", plotHeight)
    .attr("height", 0)
    .remove();
  
  function handleMouseClickBar(event, d) {
    d3.select(this);
  
    // plot.append("text")
    //   .attr("class", "frequency-label")
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "18px")
    //   .attr("fill", "#FFFFFF")
    //   .text(d.value);
    // console.log(d.value);
  
    // Highlight the corresponding arc in the pie chart
    var arc = d3.select("#pieChartSVG").selectAll(".arc")
      .filter(function(arcData) {
        return formatBin(arcData.data.key) === formatBin(d.key);
      });
  
    arc.style("fill", "#606C5D")
      .style("opacity", 1);
    
    // Remove the effects after a short delay
    setTimeout(function() {
      arc.style("fill", function(arcData) {
        return colorScale(arcData.data.key);
      });
    }, 1000);
  }
  
  function handleMouseOverBar(event, d) {
    var frequency = d.value;
  
    d3.select(this)
      .transition()
      .duration(200)
      .attr("y", function() {
        return countScale(d.value) - 10;
      })
      .attr("height", function() {
        return plotHeight - countScale(d.value) + 10;
      });
  
    plot
      .append("text")
      .attr("class", "frequency-label")
      .attr("text-anchor", "middle")
      .attr("x", function() {
        return letterScale(d.key) + letterScale.bandwidth() / 2;
      })
      .attr("y", function() {
        return countScale(d.value) + 20;
      })
      .text(frequency);
  
    // Highlight the corresponding arc in the pie chart
    var arc = d3.select("#pieChartSVG").selectAll(".arc")
      .filter(function(arcData) {
        return formatBin(arcData.data.key) === formatBin(d.key);
      });
  
    arc.style("opacity", 0.5);
  
    // Remove the effects after a short delay
    setTimeout(function() {
      arc.style("opacity", 1);
    }, 1000);
  }
  
  function handleMouseOutBar(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("y", function() {
        return countScale(d.value);
      })
      .attr("height", function() {
        return plotHeight - countScale(d.value);
      });
  
    plot.select(".frequency-label").remove();
  
    // Restore opacity of all arcs in the pie chart
    d3.select("#pieChartSVG").selectAll(".arc")
      .style("opacity", 1);
  }
  
  
  

  var xAxis = d3.axisBottom(letterScale);
  var yAxis = d3.axisRight(countScale);

  if (plot.select("g#x-axis").size() < 1) {
    plot.append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0, " + plotHeight + ")")
      .call(xAxis);

    plot.append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(" + plotWidth + ", 0)")
      .call(yAxis);
  } else {
    plot.select("g#x-axis").call(xAxis);
    plot.select("g#y-axis").call(yAxis);
  }

  svg.select("#legend").remove();

  var legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", translate(margin.left, bounds.height - margin.bottom + 50));

  var formattedbinsG = binsG.map(formatBin);
  
  var legendItems = legend.selectAll("g")
    .data(formattedbinsG)
    .enter()
    .append("g")
    .attr("transform", function(d, i) { return translate(i * 80, 0); });

  legendItems.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function(d) { return colorScale(d); });

  legendItems.append("text")
    .attr("x", 15)
    .attr("y", 9)
    .text(function(d) { return d; });
};

// pie chart
var drawPieChart = function(count) {
  var svg = d3.select("#pieChartSVG");
  var countSum = d3.sum(count, function(d) { return d.value; });

  var margin = {
    top: 5,
    right: 300,
    bottom: 100,
    left: 10
  };

  var bounds = svg.node().getBoundingClientRect();
  var plotWidth = bounds.width - margin.right - margin.left;
  var plotHeight = bounds.height - margin.top - margin.bottom;

  svg.selectAll("*").remove();

  var plot = svg.append("g")
    .attr("transform", translate(bounds.width / 2, bounds.height / 2));

  arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(plotWidth, plotHeight) / 2);

  var pieGenerator = d3.pie()
    .value(function(d) { return d.value; });

  var arcs = plot.selectAll(".arc")
    .data(pieGenerator(count));

  arcs.enter()
    .append("path")
    .attr("class", "arc")
    .attr("fill", function(d) { return colorScale(d.data.key); })
    .attr("d", arcGenerator)
    .on("click", handleMouseClick)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  function handleMouseClick(event, d){
    d3.select(this);

    // Highlight the corresponding bar in the bar chart
    var bar = d3.select("#barchartSVG").selectAll(".bar")
      .filter(function(barData) {
        return formatBin(barData.key) === formatBin(d.data.key);
      });
      
    bar.style("fill", "#606C5D")
        .style("opacity", 1);

    // Remove the effects after a short delay
    setTimeout(function() {
      // plot.select(".percentage-label").remove();
      bar.style("fill", function(d){return colorScale(d.key);});
    }, 1000);
  }

  function handleMouseOver(event, d) {
    var percentage = Math.round((d.data.value / countSum) * 100) + "%";
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(plotWidth, plotHeight) / 2 + 10)
      );
    plot.append("text")
    .attr("class", "percentage-label")
    .attr("text-anchor", "middle")
    .text(percentage)
  
    // Highlight the corresponding bar in the bar chart
    var bar = d3.select("#barchartSVG").selectAll(".bar")
      .filter(function(barData) {
        return formatBin(barData.key) === formatBin(d.data.key);
      });
  
    bar.style("opacity", 0.5);

  }
  
  function handleMouseOut(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", arcGenerator);
  
    // Restore opacity of all bars in the bar chart
    d3.select("#barchartSVG").selectAll(".bar")
      .style("opacity", 1);
    plot.select(".percentage-label").remove();
  }
  

  // Legend
  var legend = plot.append("g")
    .attr("transform", translate(plotWidth / 2 + 30, -plotHeight / 2));

  var legendItems = legend.selectAll("g")
    .data(count)
    .enter()
    .append("g")
    .attr("transform", function(d, i) { return translate(0, i * 20); });

  legendItems.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function(d) { return colorScale(d.key); });

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 9)
    .text(function(d) { return formatBin(d.key); });
};


function translate(x, y) {
  return "translate(" + x + "," + y + ")";
}


