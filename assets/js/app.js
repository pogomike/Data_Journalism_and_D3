d3.select(window).on("resize", handleResize);

// When the browser loads, call loadchart()
loadChart();

function handleResize() {
  var svgArea = d3.select("svg");

  // If there is already an svg container on the page, remove it and reload the chart
  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  };
};

function loadChart() {
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data/data.csv", function (err, Data) {
  if (err) throw err;

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  Data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcareLow = +data.healthcareLow;
  });

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(Data, d => d.poverty))
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(Data, d => d.healthcareLow)])
    .range([height, 0]);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Append Axes to the chart
  // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // Step 5: Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("circle")
  .data(Data)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d.poverty))
  .attr("cy", d => yLinearScale(d.healthcareLow))
  .attr("r", "18")
  .attr("fill", "Purple")
  .attr("opacity", ".5")

  //Create state labels
  labelGroup = chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .selectAll("tspan")
        .data(Data)
        .enter()
        .append("tspan")
        .attr("x", function(data) {
          return xLinearScale(data.poverty - 0);
        })
        .attr("y", function(data) {
          return yLinearScale(data.healthcareLow - 0.2);
        })
        .text(function(data) {
          return data.stateCode
        });
  

    // Step 6: Initialize tool tip
    // ==============================
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>Poverty: ${d.poverty}<br>Low Health Care: ${d.healthcareLow}`);
    });

  // Step 7: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 8: Create event listeners to display and hide the tooltip
  // ==============================
  circlesGroup.on("click", function (data) {
      toolTip.show(data);
    })
  
  labelGroup.on("click", function(data){
      toolTip.show(data);
  })

    //onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Low Health Care(%)");

  chartGroup.append("text")
    .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
    .attr("class", "axisText")
    .text("Poverty(%)");
});

};