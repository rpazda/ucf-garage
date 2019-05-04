$(document).ready(function(){
    renderVisualization(11, 11, null, "i")
})

var jsonFileName = "allnovdec.json"

var svg = d3.select("svg"); //TODO: add margins n' such

svg.attr("width", $("#visualization").width());

//Assign visual attributes of visualization to fit within divs correctly
var margin = {top: 20, right: 20, bottom: 40, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleTime()/*.domain([0,24])*/
var y = d3.scaleLinear()

var xAxis = d3.axisBottom(x).ticks(24);
var yAxis = d3.axisRight(y).ticks(20);

var dataset = [];

function renderVisualization(selectedMonth, selectedDate, dayOfWeek, garage){
    d3.json(jsonFileName, function(error,data){
        if(error) throw error;
        var dataIndex = 0;
        $.each(data, function(index, element){
            dataset[index] = element;
            dataset[index].time = Date.parse(element.date+" "+"Nov"+" "+element.year+" "+element.hour+" "+element.minute+" 00 EDT");
            //'01 Jan 1970 00:00:00 GMT'
        })
        console.log(data)
        var garageData = data.filter(function(d){
            return d.garage == garage && d.date == selectedDate && d.month == selectedMonth
        })
        console.log(garageData)
        newPath(garageData, garage)

    })
}

var valueLine = d3.line()
    .x(function(d){ return x(d.time)})
    .y(function(d){ return y(d.count)})

function newPath(data, id){
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("d", valueLine)
}