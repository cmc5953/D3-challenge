var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 40,
    bottom: 90,
    right: 40,
    left: 100
};

// define chart dimensions = SVG area - margins
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an SVG wrapper and shift margins
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append SVG
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Init parameters
var selected_X = "poverty";
var selected_Y = "healthcare";

// updating x axis scale upon selection
function xScale(Dataset, selected_X) {
    // scale axis
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(Dataset, d => d[selected_X]) * .9, d3.max(Dataset, d => d[selected_X]) * 1.10
        ])
        .range([0, width]);

    return xLinearScale;

}

// updating y axis scale upon selection
function yScale(Dataset, selected_Y) {
    // scale axis
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(Dataset, d => d[selected_Y]) * .9, d3.max(Dataset, d => d[selected_Y]) * 1.10
        ])
        .range([height, 0]);

    return yLinearScale;
}

// updating x axis upon selection
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// updating y axis upon selection
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// update circles upon axis selection
function renderCircles(circlesGroup, newXScale, newYScale, selected_X, selected_Y) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[selected_X]))
        .attr("cy", d => newYScale(d[selected_Y]));

    return circlesGroup;
}

// update text within circle upon axis selection
function renderText(circleTextGroup, newXScale, newYScale, selected_X, selected_Y) {
    circleTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[selected_X]))
        .attr("y", d => newYScale(d[selected_Y]));
    
    return circleTextGroup;
}

// update tooltip text upon axis selection
function updateToolTip(selected_X, selected_Y, circlesGroup) {

    // Conditional for X Axis.
    if (selected_X === "poverty") {
        var xlabel = "Poverty: ";
    }
    else if (selected_X === "income") {
        var xlabel = "Median Income: "
    }
    else {
        var xlabel = "Age: "
    }

    // Conditional for Y Axis.
    if (selected_Y === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    }
    else if (selected_Y === "smokes") {
        var ylabel = "Smokers: "
    }
    else {
        var ylabel = "Obesity: "
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) {
        return (` ${d.state} <br>
                  ${ylabel} ${d[selected_Y]} <br> 
                  ${xlabel} ${d[selected_X]}`);   
        });
    
    circlesGroup.call(toolTip)
        .on("mouseover", d => toolTip.show(d, this))
        .on("mouseout", d => toolTip.hide(d));

    ;

    return circlesGroup;
}

// import data
d3.csv("assets/data/data.csv").then(function(Dataset) {
    // append all data as integers and display in console
    Dataset.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        console.log(data);
    });

    // create x scale function
    var xLinearScale = xScale(Dataset, selected_X);
    var yLinearScale = yScale(Dataset, selected_Y);

    // create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // create circles
    var circlesGroup = chartGroup.selectAll("circle.circles")
        .data(Dataset)
        .enter()
        .append("circle")
        .classed("circles", true)
        .attr("cx", d => xLinearScale(d[selected_X]))
        .attr("cy", d => yLinearScale(d[selected_Y]))
        .attr("r", "15")
        .attr("fill", "red")
        .attr("opacity", ".5");

    // add text to circles
    var circleTextGroup = chartGroup.selectAll("text.circletext")
        .data(Dataset)
        .enter()
        .append("text")
        .classed("circletext", true)
        .text(d => (d.abbr))
        .attr("x", d => xLinearScale(d[selected_X]))
        .attr("y", d => yLinearScale(d[selected_Y]))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .style('fill', 'black');

    var circlesGroup = updateToolTip(selected_X, selected_Y, circlesGroup);

    // three X axis group
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("Poverty %");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    // three Y axis group
    var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.25)
        .attr("y", 0 - (height - 60))
        .attr("value", "healthcare") 
        .classed("active", true)
        .text("Healthcare %");

    var smokeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.25)
        .attr("y", 0 - (height - 40))
        .attr("value", "smokes") 
        .classed("inactive", true)
        .text("Smoker %");

    var obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.25)
        .attr("y", 0 - (height - 20))
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obesity %");

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");

            if (true) {
                if (value === "poverty" || value === "age" || value === "income") {

                    // replaces selected x axis with selection
                    selected_X = value;

                    // update x scale for new data
                    xLinearScale = xScale(Dataset, selected_X);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // changes classes to x selection
                    if (selected_X === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);

                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (selected_X === "age"){
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);

                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true)

                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                
                } else {

                    selected_Y = value;

                    // update y scale for new data
                    yLinearScale = yScale(Dataset, selected_Y);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // changes classes to y axis selection
                    if (selected_Y === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);

                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (selected_Y === "smokes"){
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        smokeLabel
                            .classed("active", true)
                            .classed("inactive", false);

                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                
                }

                // update circles with new x/y values.
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, selected_X, selected_Y);

                // update tool tips with new selection
                circlesGroup = updateToolTip(selected_X, selected_Y, circlesGroup);

                // update circles text with new selection
                circleTextGroup = renderText(circleTextGroup, xLinearScale, yLinearScale, selected_X, selected_Y);

            }
        });
});