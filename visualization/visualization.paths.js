$(document).ready(function(){

    var date = new Date()
    var month = date.getMonth();
    var day = date.getDate();
    if(day > 1) day -= 3
    var year = date.getFullYear();

    updateDate(11, 11, 2019) // Date with data for viz development
    //updateDate(month, day, year);
    // TODO: Change when actually have current data 
})

function setDateFromPage(){
    var month = $("#month-input").val()
    var day = $("#day-input").val()
    var year = $("#year-input").val()
    
    console.log(month+" "+day+" "+year)
    updateDate(month, day, year)
}

function updateDate(month, day, year){
    $.ajax({
        //url: "http://"+window.location.hostname+":3000/oneday/"+year+"/"+month+"/"+day,
        url: "http://localhost:3000/oneday/"+year+"/"+month+"/"+day,
        success: function(data){
            svg.html("")
            console.log(data)
            //data = JSON.parse(data)
            console.log("Loading data for "+month+"/"+day+"/"+year)
            constructDayLine(month, day, null, "a", data)
            constructDayLine(month, day, null, "b", data)
            constructDayLine(month, day, null, "c", data)
            constructDayLine(month, day, null, "d", data)
            constructDayLine(month, day, null, "i", data)
            constructDayLine(month, day, null, "libra", data)

            var garageData = data.filter(function(d){
                return d.date == day && d.month == month && d.year == year && d.count != null
            })

            x.domain(
                [
                    new Date(d3.min(garageData, function(d){return parseFloat(d.time)})),
                    new Date(d3.max(garageData, function(d){return parseFloat(d.time)})),
                ]
            ).range([0,width])

            generateGridlines()

            var xAxis = d3.axisBottom(x).ticks(24);
            //var yAxis = d3.axisRight(y).ticks(20);
            svg.append(xAxis)
            //svg.append(yAxis)

            console.log("http://localhost:3000/oneday/"+year+"/"+month+"/"+day)
        },
        fail: function(e){
            console.log(e)
        },
        error: function(e){
            console.log(e)
            console.log("http://localhost:3000/oneday/"+year+"/"+month+"/"+day)
        },
        dataType: "json"
      });
    $('.dropdown-toggle').dropdown()

    $('#current-day').html('Data from '+month+'-'+day+'-'+year+'.'+'<p>Data from yesterday unless it is the first day of the month</p><p>The logic for handling the first day is not trivial so this is good enough for now.</p>')
}

var garageColors = {
    a: "pink",
    b: "gold",
    c: "cyan",
    d: "red",
    h: "orange",
    i: "indigo",
    libra: "green"
}

//var jsonFileName = "../data/allnovdec.json"

var svg = d3.select("svg"); //TODO: add margins n' such

svg.attr("width", $("#visualization").width());

//Assign visual attributes of visualization to fit within divs correctly
var margin = {top: 20, right: 20, bottom: 40, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

const MAX_COUNT = 2400; // Assign max count for consistent scaling

var x = d3.scaleTime();/*.domain([0,24])*/
var y = d3.scaleLinear().domain([0,MAX_COUNT]).range([0,height])

var dataset = [];

function constructDayLine(selectedMonth, selectedDate, dayOfWeek, garage, data){
    $.each(data, function(index, element){
        dataset[index] = element;
        dataset[index].timeBase = element.date+" "+"Nov"+" "+element.year+" "+element.hour+" "+element.minute+":00 EDT"
        dataset[index].time = Date.parse(element.date+" "+"Nov"+" "+element.year+" "+element.hour+":"+element.minute+":00 EDT");
        //'01 Jan 1970 00:00:00 GMT'
    })
    var garageData = data.filter(function(d){
        return d.garage == garage && d.date == selectedDate && d.month == selectedMonth && d.count != null
    })
    //console.log(garageData)
    newPath(garageData, garage)  
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
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", "1px")
        .attr("d", valueLine)
}

