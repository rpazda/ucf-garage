$(document).ready(function(){

    var date = new Date()
    var month = date.getMonth();
    var day = date.getDate();
    var year = date.getFullYear();

    $.ajax({
        url: "http://localhost:3000/oneday/"+year+"/"+month+"/"+day,
        success: function(data){
            console.log(data)
            //data = JSON.parse(data)
            console.log(year)
            console.log(month)
            console.log(day)
            renderVisualization(month, day, null, "a", data)
            renderVisualization(month, day, null, "b", data)
            renderVisualization(month, day, null, "c", data)
            renderVisualization(month, day, null, "d", data)
            renderVisualization(month, day, null, "i", data)
            renderVisualization(month, day, null, "libra", data)
        },
        fail: function(e){
            console.log(e)
        },
        error: function(e){
            console.log(e)
        },
        dataType: "json"
      });
    generateGridlines()
    $('.dropdown-toggle').dropdown()
})

var garageColors = {
    a: "pink",
    b: "gold",
    c: "cyan",
    d: "red",
    h: "orange",
    i: "indigo",
    libra: "green"
}

var jsonFileName = "../data/allnovdec.json"

var svg = d3.select("svg"); //TODO: add margins n' such

svg.attr("width", $("#visualization").width());

//Assign visual attributes of visualization to fit within divs correctly
var margin = {top: 20, right: 20, bottom: 40, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

const MAX_COUNT = 2400;

var x = d3.scaleTime();/*.domain([0,24])*/
var y = d3.scaleLinear().domain([0,MAX_COUNT]).range([0,height])

var xAxis = d3.axisBottom(x).ticks(24);
var yAxis = d3.axisRight(y).ticks(20);

var dataset = [];

function renderVisualization(selectedMonth, selectedDate, dayOfWeek, garage, data){
    //d3.json(jsonData, function(error,data){
        //console.log(data)
        //if(error) throw error;
        var dataIndex = 0;
        $.each(data, function(index, element){
            dataset[index] = element;
            dataset[index].timeBase = element.date+" "+"Nov"+" "+element.year+" "+element.hour+" "+element.minute+":00 EDT"
            dataset[index].time = Date.parse(element.date+" "+"Nov"+" "+element.year+" "+element.hour+":"+element.minute+":00 EDT");
            //'01 Jan 1970 00:00:00 GMT'
        })
        //console.log(data)
        var garageData = data.filter(function(d){
            return d.garage == garage && d.date == selectedDate && d.month == selectedMonth && d.count != null
        })
        console.log(garageData)
        //console.log(garageData)
        x.domain(
            [
                new Date(d3.min(garageData, function(d){return parseFloat(d.time)})),
                new Date(d3.max(garageData, function(d){return parseFloat(d.time)})),
            ]
        ).range([0,width])
        newPath(garageData, garage)

    //})
}
function generateGridlines(){
    for(i = 0; i < y.domain()[1]; i+= 100){
        var point1 = {
            time: x.domain()[0],
            count: i
        } 
        var point2 = {
            time: x.domain()[1],
            count: i
        }
        newGridLine([point1, point2])
    }
}

var valueLine = d3.line()
    .x(function(d){ return x(d.time)})
    .y(function(d){ return y(MAX_COUNT - d.count)})

function newPath(data, garage){
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", garageColors[garage])
        .attr("stroke-width", "2px")
        .attr("d", valueLine)
}

function newGridLine(data){
    //console.log(data)
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", "1px")
        .attr("d", valueLine)
}

