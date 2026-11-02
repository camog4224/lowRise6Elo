/**
 * displays table of matches selected player has played in visual tab
 */
async function displayMatches() {
	let info = await getPlayer(gamesPerson.value);
	let oppInfo = {};
	for (let i = 0; i < info.gamesPlayed; i++) {
		if (oppInfo[info.opponents[i]] == null) {
			oppInfo[info.opponents[i]] = await getPlayer(info.opponents[i]);
		}
	}
	await makePastGameTable(info, oppInfo);
}

/**
 * clears the context of the canvas inputed
 * @param {Object} ct - canvas context to clear
 * @param {Object} canv - canvas to clear
 */
function clearGraph(ct, canv) {
	ct.clearRect(0, 0, canv.width, canv.height);
}

/**
 * formats elo ranked data into d3 data compatable date
 * @param {{
 * name: String, 
 * currentElo: number, 
 * elo: number[],
 * euid: String,
 * gamesPlayed: number, 
 * losses: number,
 * opponents: String[],
 * readableTime: String[],
 * time: number[],
 * victories: boolean[],
 * wins: number
 * }[]} data - information to format
 * @returns {{
 * elo: number,
 * readableTime: String,
 * index: number,
 * name: String
 * }[]}
 */
function alignInfo(data){
	let expandedData = {};
	for(let i = 0; i < data.length; i++){
		let player = data[i];
		let tempArr = [];
		for(let j = 0; j < player.time.length; j++){
			let d = new Date(player.time[j]);
			tempArr.push(
				{
					elo: player.elo[j],
					readableTime: d.toISOString().split('T')[0],
					index: i,
					name: player.name
				}
			);
		}
		expandedData[player.name] = tempArr;
	}
	return expandedData;
}

/**
 * plots player elo on line chart 
 */
async function plotPlayerPoints(){
	let curPlot = document.querySelector("#myplot");
	if(curPlot.lastElementChild){
		curPlot.removeChild(curPlot.lastElementChild)
	}
	let info = await eloRankedDocs();
	
	let alignedInfo = alignInfo(info);
	let chartB = await plotEloGraph(alignedInfo);
	curPlot.append(chartB);
}

/**
 * returns svg graph of elo player plot
 * @param {{
 * elo: number,
 * readableTime: String,
 * index: number,
 * name: String
 * }[]} data - player information to plot
 * @returns {SVGElement}
 */
async function plotEloGraph(data){
let width = 700;
let height = 500;
var svg = d3.create("svg")
	.attr("width", width)
	.attr("height", height);

/*
Brush & Zoom area chart block to work with mulit-line charts.
Combining d3-brush and d3-zoom to implement Focus + Context.

The focus chart is the main larger one where the zooming occurs.
The context chart is the smaller one below where the brush is used to specify a focused area.
*/

// sets margins for both charts
var focusChartMargin = { top: 20, right: 20, bottom: 170, left: 60 };
var contextChartMargin = { top: 360, right: 20, bottom: 90, left: 60 };

// width of both charts
var chartWidth = width - focusChartMargin.left - focusChartMargin.right;

// height of either chart
var focusChartHeight = height - focusChartMargin.top - focusChartMargin.bottom;
var contextChartHeight = height - contextChartMargin.top - contextChartMargin.bottom;

// bootstraps the d3 parent selection
svg
	.append("svg")
	.attr("width", chartWidth + focusChartMargin.left + focusChartMargin.right)
	.attr("height", focusChartHeight + focusChartMargin.top + focusChartMargin.bottom)
	.append("g")
	.attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")")
	.attr("overflow", "visible");

// function to parse date field
var parseTime = d3.utcParse("%Y-%m-%d");

// group all dates to get range for x axis later
var dates = [];
// group y axis values (value) of all lines to x axis (key)
var groupValuesByX = {};


for (let key of Object.keys(data)) {
	data[key].forEach(bucketRecord => {
	dates.push(parseTime(bucketRecord.readableTime));

	!(parseTime(bucketRecord.readableTime) in groupValuesByX) && (groupValuesByX[parseTime(bucketRecord.readableTime)] = {}); // if date as key does not exist then create
	groupValuesByX[parseTime(bucketRecord.readableTime)][key] = bucketRecord.elo;
	});
}

var availableDates = Object.keys(groupValuesByX);

availableDates.sort(function(a, b) { return new Date(a) - new Date(b) }); // sort dates in increasing order
let secAvailableDates = availableDates.map((x) => (new Date(x)).getTime());
//get max Y axis value by searching for the highest conversion rate
var maxYAxisValue = -Infinity;
for (let key of Object.keys(data)) {
	let maxYAxisValuePerBucket = Math.ceil(d3.max(data[key], d => d["elo"]));
	maxYAxisValue = Math.max(maxYAxisValuePerBucket, maxYAxisValue);
}

// set the height of both y axis
var yFocus = d3.scaleLinear().range([focusChartHeight, 0]);
var yContext = d3.scaleLinear().range([contextChartHeight, 0]);

// set the width of both x axis
var xFocus = d3.scaleTime().range([0, chartWidth]);
var xContext = d3.scaleTime().range([0, chartWidth]);

// create both x axis to be rendered
var xAxisFocus = d3
	.axisBottom(xFocus)
	.ticks(10)
	.tickFormat(d3.timeFormat("%b %e %Y"));
var xAxisContext = d3
	.axisBottom(xContext)
	.ticks(10)
	.tickFormat(d3.timeFormat("%b %e %Y"));

// create the one y axis to be rendered
var yAxisFocus = d3.axisLeft(yFocus).tickFormat(d => d);

// build brush
var brush = d3
	.brushX()
	.extent([
	[0, -10],
	[chartWidth, contextChartHeight]
	])
	.on("brush end", brushed);

// build zoom for the focus chart
// as specified in "filter" - zooming in/out can be done by pinching on the trackpad while mouse is over focus chart
// zooming in can also be done by double clicking while mouse is over focus chart
var zoom = d3
	.zoom()
	.scaleExtent([1, Infinity])
	.translateExtent([
	[0, 0],
	[chartWidth, focusChartHeight]
	])
	.extent([
	[0, 0],
	[chartWidth, focusChartHeight]
	])
	.on("zoom", zoomed)
	.filter(() => d3.event.ctrlKey || d3.event.type === "dblclick" || d3.event.type === "mousedown");

// create a line for focus chart
var lineFocus = d3
	.line()
	.x(d => xFocus(parseTime(d.readableTime)))
	.y(d => yFocus(d.elo));

// create line for context chart
var lineContext = d3
	.line()
	.x(d => xContext(parseTime(d.readableTime)))
	.y(d => yContext(d.elo));

// es lint disabled here so react won't warn about not using variable "clip"
/* eslint-disable */

// clip is created so when the focus chart is zoomed in the data lines don't extend past the borders
var clip = svg
	.append("defs")
	.append("svg:clipPath")
	.attr("id", "clip")
	.append("svg:rect")
	.attr("width", chartWidth)
	.attr("height", focusChartHeight)
	.attr("x", 0)
	.attr("y", 0);

// append the clip
var focusChartLines = svg
	.append("g")
	.attr("class", "focus")
	.attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")")
	.attr("clip-path", "url(#clip)");

/* eslint-enable */

// create focus chart
var focus = svg
	.append("g")
	.attr("class", "focus")
	.attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")");

// create context chart
var context = svg
	.append("g")
	.attr("class", "context")
	.attr("transform", "translate(" + contextChartMargin.left + "," + (contextChartMargin.top + 50) + ")");

// add data info to axis
xFocus.domain(d3.extent(dates));
yFocus.domain([800, maxYAxisValue]);
xContext.domain(xFocus.domain());
yContext.domain(yFocus.domain());

// add axis to focus chart
focus
	.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0," + focusChartHeight + ")")
	.call(xAxisFocus);
focus
	.append("g")
	.attr("class", "y-axis")
	.call(yAxisFocus);

// get list of bucket names
var bucketNames = [];
for (let key of Object.keys(data)) {
	bucketNames.push(key);
}

// match colors to bucket name
var colors = d3
	.scaleOrdinal()
	.domain(bucketNames)
	.range(["#3498db", "#3cab4b", "#e74c3c", "#73169e", "#2ecc71"]);

// go through data and create/append lines to both charts
for (let key of Object.keys(data)) {
	let bucket = data[key];
	focusChartLines
	.append("path")
	.datum(bucket)
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", d => colors(key))
	.attr("stroke-width", 1.5)
	.attr("d", lineFocus);
	context
	.append("path")
	.datum(bucket)
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", d => colors(key))
	.attr("stroke-width", 1.5)
	.attr("d", lineContext);
}

// add x axis to context chart (y axis is not needed)
context
	.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0," + contextChartHeight + ")")
	.call(xAxisContext);

// add bush to context chart
var contextBrush = context
	.append("g")
	.attr("class", "brush")
	.call(brush);

// style brush resize handle
var brushHandlePath = d => {
	var e = +(d.type === "e"),
	x = e ? 1 : -1,
	y = contextChartHeight + 10;
	return (
	"M" +
	0.5 * x +
	"," +
	y +
	"A6,6 0 0 " +
	e +
	" " +
	6.5 * x +
	"," +
	(y + 6) +
	"V" +
	(2 * y - 6) +
	"A6,6 0 0 " +
	e +
	" " +
	0.5 * x +
	"," +
	2 * y +
	"Z" +
	"M" +
	2.5 * x +
	"," +
	(y + 8) +
	"V" +
	(2 * y - 8) +
	"M" +
	4.5 * x +
	"," +
	(y + 8) +
	"V" +
	(2 * y - 8)
	);
};

var brushHandle = contextBrush
	.selectAll(".handle--custom")
	.data([{ type: "w" }, { type: "e" }])
	.enter()
	.append("path")
	.attr("class", "handle--custom")
	.attr("stroke", "#000")
	.attr("cursor", "ew-resize")
	.attr("d", brushHandlePath);

// overlay the zoom area rectangle on top of the focus chart
var rectOverlay = svg
	.append("rect")
	.attr("cursor", "move")
	.attr("fill", "none")
	.attr("pointer-events", "all")
	.attr("class", "zoom")
	.attr("width", chartWidth)
	.attr("height", focusChartHeight)
	.attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")")
	.call(zoom)
	.on("mousemove", focusMouseMove)
	.on("mouseover", focusMouseOver)
	.on("mouseout", focusMouseOut);

var mouseLine = focus
	.append("path") // create vertical line to follow mouse
	.attr("class", "mouse-line")
	.attr("stroke", "#303030")
	.attr("stroke-width", 2)
	.attr("opacity", "0");

var tooltip = focus
	.append("g")
	.attr("class", "tooltip-wrapper")
	.attr("display", "none");

var tooltipBackground = tooltip.append("rect").attr("fill", "#e8e8e8");

var tooltipText = tooltip.append("text");

contextBrush.call(brush.move, [0, chartWidth / 2]);

// focus chart x label
focus
	.append("text")
	.attr("transform", "translate(" + chartWidth / 2 + " ," + (focusChartHeight + focusChartMargin.top + 25) + ")")
	.style("text-anchor", "middle")
	.style("font-size", "18px")
	.text("Time (UTC)");

// focus chart y label
focus
	.append("text")
	.attr("text-anchor", "middle")
	.attr("transform", "translate(" + (-focusChartMargin.left + 20) + "," + focusChartHeight / 2 + ")rotate(-90)")
	.style("font-size", "18px")
	.text("Elo");

function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
	mouseLine.attr("opacity", "0");
	var s = d3.event.selection || xContext.range();
	xFocus.domain(s.map(xContext.invert, xContext));
	focusChartLines.selectAll(".line").attr("d", lineFocus);
	focus.select(".x-axis").call(xAxisFocus);
	svg.select(".zoom").call(zoom.transform, d3.zoomIdentity.scale(chartWidth / (s[1] - s[0])).translate(-s[0], 0));
	brushHandle
	.attr("display", null)
	.attr("transform", (d, i) => "translate(" + [s[i], -contextChartHeight - 20] + ")");
}

function zoomed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
	mouseLine.attr("opacity", "0");
	var t = d3.event.transform;
	xFocus.domain(t.rescaleX(xContext).domain());
	focusChartLines.selectAll(".line").attr("d", lineFocus);
	focus.select(".x-axis").call(xAxisFocus);
	var brushSelection = xFocus.range().map(t.invertX, t);
	context.select(".brush").call(brush.move, brushSelection);
	brushHandle
	.attr("display", null)
	.attr("transform", (d, i) => "translate(" + [brushSelection[i], -contextChartHeight - 20] + ")");
}

function focusMouseMove() {
	tooltip.attr("display", null);
	var mouse = d3.mouse(this);
	var dateOnMouse = xFocus.invert(mouse[0]);
	var nearestDateIndex = d3.bisect(secAvailableDates, (new Date(dateOnMouse)).getTime());
	nearestDateIndex = Math.min(Math.max(nearestDateIndex, 0), availableDates.length-1);
	// get the dates on either of the mouse cord
	var d0 = new Date(availableDates[Math.max(nearestDateIndex - 1, 0)]);
	var d1 = new Date(availableDates[nearestDateIndex]);
	var closestDate;

	if (d0 < xFocus.domain()[0]) {
	closestDate = d1;
	} else if (d1 > xFocus.domain()[1]) {
	closestDate = d0;
	} else {
	// decide which date is closest to the mouse
	closestDate = dateOnMouse - d0 > d1 - dateOnMouse ? d1 : d0;
	}

	var nearestDateYValues = groupValuesByX[closestDate];
	var nearestDateXCord = xFocus(new Date(closestDate));

	mouseLine.attr("d", `M ${nearestDateXCord} 0 V ${focusChartHeight}`).attr("opacity", "1");

	tooltipText.selectAll(".tooltip-text-line").remove();
	focus.selectAll(".tooltip-line-circles").remove();
	var formatTime = d3.timeFormat("%e %b %Y");
	tooltipText
	.append("tspan")
	.attr("class", "tooltip-text-line")
	.attr("x", "5")
	.attr("y", "5")
	.attr("dy", "13px")
	.attr("font-weight", "bold")
	.text(`${formatTime(closestDate)}`);

	for (let key of Object.keys(nearestDateYValues)) {
	focus
		.append("circle")
		.attr("class", "tooltip-line-circles")
		.attr("r", 5)
		.attr("fill", colors(key))
		.attr("cx", nearestDateXCord)
		.attr("cy", yFocus(nearestDateYValues[key]));

	tooltipText
		.append("tspan")
		.attr("class", "tooltip-text-line")
		.attr("x", "5")
		.attr("dy", `14px`)
		.attr("fill", colors(key))
		.text(`${key}: ${nearestDateYValues[key].toFixed(2)}`);
	}

	var tooltipWidth = tooltipText.node().getBBox().width;
	var tooltipHeight = tooltipText.node().getBBox().height;
	var rectOverlayWidth = rectOverlay.node().getBBox().width;
	tooltipBackground.attr("width", tooltipWidth + 10).attr("height", tooltipHeight + 10);
	if (nearestDateXCord + tooltipWidth >= rectOverlayWidth) {
	tooltip.attr("transform", "translate(" + (nearestDateXCord - tooltipWidth - 20) + "," + mouse[1] + ")");
	} else {
	tooltip.attr("transform", "translate(" + (nearestDateXCord + 10) + "," + mouse[1] + ")");
	}
}

function focusMouseOver() {
	mouseLine.attr("opacity", "1");
	tooltip.attr("display", null);
}

function focusMouseOut() {
	mouseLine.attr("opacity", "0");
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
}

return svg.node()
}
  

async function showVisuals(){
	plotPlayerPoints();
}

function convStringMonthToNumber(s){
	switch(s){
		case "Jan":
			return "01";
		case "Feb":
			return "02";
		case "Mar":
			return "03";
		case "Apr":
			return "04";
		case "May":
			return "05";
		case "Jun":
			return "06";
		case "Jul":
			return "07";
		case "Aug":
			return "08";
		case "Sep":
			return "09";
		case "Oct":
			return "10";
		case "Nov":
			return "11";
		case "Dec":
			return "12";
	}
}
