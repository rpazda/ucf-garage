$(document).ready(function(){
    $('select').material_select();
    $('select').on('contentChanged', function() {
        $(this).material_select();
    });
    $('#selected-garage').on('change', function(){
        renderVisualization("","","",$('#selected-garage').val().toLowerCase())
    });
});

var dataset = [];

var jsonFileName = "allnovdec.json";

var garageColors = {
    a: "pink",
    b: "gold",
    c: "cyan",
    d: "red",
    h: "orange",
    i: "indigo",
    libra: "green"
}

var weekdayColors = {
    sunday: "yellow",
    monday: "orange",
    tuesday: "red",
    wednesday: "green",
    thursday: "blue",
    friday: "purple",
    saturday: "pink",
};

var monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
]; 

var width = 0;
var height = 0;

var svg = d3.select("svg"); //TODO: add margins n' such

svg.attr("width", $("#visualization").width());

//Assign visual attributes of visualization to fit within divs correctly
var margin = {top: 20, right: 20, bottom: 40, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleLinear().domain([0,24]).range([0,svg.attr("width")]);
var y = d3.scaleLinear().domain([0,2000]).range([0,400]);

var xAxis = d3.axisBottom(x).ticks(24);
var yAxis = d3.axisRight(y).ticks(20);

for(i = 10; i < 30; i++){
    renderVisualization(11,i,null,"h");
}
//renderVisualization(11,11);
getAvailableMonths();
displayLegend();

function renderVisualization(selectedMonth, selectedDate, dayOfWeek, garage){
    d3.json(jsonFileName, function(error, data){
        if(error) throw error;
        $.each(data, function(index, element){
            dataset[index] = data[index];
        })
        //x.domain = ([0.000000,24.000000]);
        //x.range = [0, svg.attr("width")];
    
        var element;

        var monthDropdown = d3.select("selected-month").append("option");

        var availableMonths = d3.map(data, function(d){
            return d.month
        }).keys()
        var months = monthDropdown.selectAll("option")
            .data(
                d3.map(data, function(d){
                    return d.month
                }).keys()
            )
            .enter()
            .append("option")
            //.append("button")
                // .click(function(d){
                //     console.log("clicked "+d)
                // })
                .html(function(d){
                    return d
                });
        $("#selected-month").trigger("contentChanged")
        var area = svg.selectAll("circle")
            .data(data  
                .sort(function(a, b){
                    return d3.ascending(a.hour+a.minute, b.hour+b.minute);
                }))
            .enter()
            //.filter(function(d){return d.month == selectedMonth})
            //.filter(function(d){return d.date == selectedDate})
            //.filter(function(d){return d.garage == garage});
        ;
        console.log(selectedMonth);
        displayCurrentDay(monthNames[selectedMonth-1], selectedDate, "Sunday" );
    
        area.append("circle")
            .attr("cx", (function(d){
                element = d.toString();
                //console.log(d.hour+(d.minute/60));
                return ((d.hour+(d.minute/60))*(svg.attr("width")/24))//x(d.hour+(d.minute/60)))
            }))
            .attr("cy", (function(d){
                return 400 - (d.count/5)
            }))
            .attr("r", 1.25)
            .attr("fill", (function(d){
                switch(d.garage){
                    case "a":
                        return "pink"
                    case "b":
                        return "gold"
                    case "c":
                        return "cyan"
                    case "d":
                        return "red"
                    case "h": 
                        return "orange"
                    case "i":
                        return "indigo"
                    case "libra":
                        return "green"
                    default:
                        return "black"
                }
            }))
            .html(function(d){
                var time = formatTime(d.hour, d.minute, true);
                return "<title>"+time+" - "+d.count+" available</title>"
            })
        ;
    
        //Add X Axis
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0,"+(height-10)+")")
            .call(xAxis)
            //.call(yAxis);
        
        
    });
}

var dataConverter = function(d){
    return{
        _id: d.id,
        garage: d.garage,
        count: d.count,
        year: d.year,
        month: d.month,
        date: d.date,
        dayofweek: d.dayofweek,
        hour: d.hour,
        minute: d.minute
    }
}

function displayLegend(){
    addLegendColor("A", garageColors.a);
    addLegendColor("B", garageColors.b);
    addLegendColor("C", garageColors.c);
    addLegendColor("D", garageColors.d);
    addLegendColor("H", garageColors.h);
    addLegendColor("I", garageColors.i);
    addLegendColor("Libra", garageColors.libra);
}

function addLegendColor(garage, color){
    $("#color-legend").append(
        $("<li>", {}).html(
            " - Garage "+ garage
        ).prepend(
            $("<span>", {style:"color:"+color, html:"██"})
        )
    );
}

function displayCurrentDay(month, date, dayofweek){
    $("#current-day").html(
        dayofweek+" "+month+" "+date
    );
}

function getAvailableMonths(){
    var monthDropdown = d3.select("selected-month").append("option");

    var months = monthDropdown.selectAll("option")
        .data(
            d3.map(dataset, function(d){
                return d.month
            }).keys()
        );
    months.enter()
        .append("option")
        //.append("button")
            // .click(function(d){
            //     console.log("clicked "+d)
            // })
            .html(function(d){
                console.log(d)
                return d
            })
}

function formatTime(hour, minute, AMPM){
    var hourF, minuteF;
    var AMPMF = "";
    minuteF = minute < 9 ? "0"+minute : minute;
    if(AMPM){
        switch(hour%12){
            case 0:
                hourF = 12
                break;
            case 1:
                hourF = 12;
                break;
            default: 
                hourF = hour % 12;
                break;
        }
        AMPMF = (hour > 11) ? " PM" : " AM";
    }
    return hourF+":"+minuteF+AMPMF;
}