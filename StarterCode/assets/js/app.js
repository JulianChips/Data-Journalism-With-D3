// @TODO: YOUR CODE HERE!
// Setting up the svg area
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Creating the svg wrapper and group and shifting it by the appropriate margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an svg group
const chartGroup = svg.append("g")
	.attr("transform",`translate(${margin.left},${margin.top})`);

// Chosen Axis variable. Default set to 
let chosenXAxis = "poverty";
let chosenYAxis = "obesity";

// function to update xScale on click
function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}
// function to update yScale on click
function yScale(data, chosenYAxis){
	// create scales
	const yLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[chosenYAxis])*0.9, d3.max(data, d => d[chosenYAxis])*1.1])
		.range([height,0]);

	return yLinearScale;
}

// function to update xAxis on click
function renderXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function to update yAxis on click
function renderYAxes(newYScale, yAxis){
	const leftAxis = d3.axisLeft(newYScale);

	yAxis.transition()
		.duration(1000)
		.call(leftAxis);

	return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, abbrGroup, newXScale, newYScale, chosenXaxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy",d => newYScale(d[chosenYAxis]));
    abbrGroup.transition()
        .duration(1000)
        .attr("x",d => newXScale(d[chosenXAxis])-7)
        .attr("y",d => newYScale(d[chosenYAxis])+5)

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let labelX  = "";
    let labelY = "";

    switch(chosenXAxis){
    	case "poverty":
    		labelX = "Poverty %:";
    		break;
    	case "age":
    		labelX = "Age:";
    		break;
    	case "income":
    		labelX = "Income:";
    		break;
    	default:
    		labelX = "Error";
    }

    switch(chosenYAxis){
    	case "obesity":
    		labelY = "Obese %:";
    		break;
    	case "smokes":
    		labelY = "Smokes %:";
    		break;
    	case "healthcare":
    		labelY = "Healthcare %:";
    		break;
    	default:
    		labelY = "Error";
    }
    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const data = await d3.csv("assets/data/data.csv");

    // parse data
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(data, chosenXAxis);
    let yLinearScale = yScale(data, chosenYAxis);

    // // Create y scale function
    // const yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.num_hits)])
    //     .range([height, 0]);

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("fill", "#c8ead3")
        .attr("opacity", ".75");

    // add abbreviations to the circles
    let textGroup = chartGroup.selectAll(".textGroup")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis])-7)
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        .attr("fill", "#7ea172")
        .attr("font-size","11px")
        .html(d => d["abbr"]);

    // Create group for  3 x- axis labels
    const xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    const ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    const incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    // create group for 3 y- axis labels
    const yLabelsGroup = chartGroup.append("g")
    	.attr("transform", "rotate(-90)")
    // append y axis
    const obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("value","obesity")
        .classed("active", true)
        .text("Obese (%)");
    const healthcareLabel = yLabelsGroup.append("text")
    	.attr("y", 0 - margin.left + 40)
    	.attr("x", 0 - (height/2))
    	.attr("value","healthcare")
    	.classed("inactive",true)
    	.text("Lacking Healthcare (%)");
    const smokesLabel = yLabelsGroup.append("text")
    	.attr("y", 0 - margin.left + 60)
    	.attr("x", 0 - (height/2))
    	.attr("value","smokes")
    	.classed("inactive",true)
    	.text("Smokes (%)")

// .attr("dy", "1em")
    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                	.classed("active",false)
                	.classed("inactive",true);
            }
            else if (chosenXAxis === "age") {
            	povertyLabel
            		.classed("active",false)
            		.classed("inactive",true);
            	ageLabel
            		.classed("active",true)
            		.classed("inactive",false);
            	incomeLabel
            		.classed("active",false)
            		.classed("inactive",true);
            }
            else {
                povertyLabel
            		.classed("active",false)
            		.classed("inactive",true);
            	ageLabel
            		.classed("active",false)
            		.classed("inactive",true);
            	incomeLabel
            		.classed("active",true)
            		.classed("inactive",false);
            }
        }
    });

    yLabelsGroup.selectAll("text")
    	.on("click",function(){
    		const value = d3.select(this).attr("value");
    		if (value !== chosenYAxis){
    			// replace chosen y axis
    			chosenYAxis = value;
    			// update y scale
    			yLinearScale = yScale(data, chosenYAxis);
    			// update y axis with new transition
    			yAxis = renderYAxes(yLinearScale, yAxis);
    			// update circles with new y values
    			circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
    			// update Tool Tips
    			circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
    			// changes classes to change bold text
	            if (chosenYAxis === "obesity") {
	                obesityLabel
	                    .classed("active", true)
	                    .classed("inactive", false);
	                healthcareLabel
	                    .classed("active", false)
	                    .classed("inactive", true);
	                smokesLabel
	                	.classed("active",false)
	                	.classed("inactive",true);
	            }
	            else if (chosenYAxis === "healthcare") {
	            	obesityLabel
	            		.classed("active",false)
	            		.classed("inactive",true);
	            	healthcareLabel
	            		.classed("active",true)
	            		.classed("inactive",false);
	            	smokesLabel
	            		.classed("active",false)
	            		.classed("inactive",true);
	            }
	            else {
	                obesityLabel
	            		.classed("active",false)
	            		.classed("inactive",true);
	            	healthcareLabel
	            		.classed("active",false)
	            		.classed("inactive",true);
	            	smokesLabel
	            		.classed("active",true)
	            		.classed("inactive",false);
	            }
    		}
    	});
})()
