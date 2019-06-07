var cheerio = require("cheerio");
var http = require("http");
var request = require("request");
var schedule = require("node-schedule");
var express = require("express");

var config = require("./secret.config.json");

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var cors = require('cors')

const dbURI = "mongodb+srv://"+config.username+":"+config.password+"@"+config.cluster//"mongodb://localhost:27017";
//"mongodb://"+config.username+":"+config.password+config.url;
console.log(dbURI);
const dbName = "parking-data";

const client = new MongoClient(dbURI, { useNewUrlParser: true });

var port = 3000;
var app = express().use(cors());

app.listen(port, function(req, res){
    console.log("App opened on port:"+port);
});

app.get('/', function(req, res){
    res.send("Hello World");
});

app.get('/counts/:garage', function(req, res){
    findCountsByGarage(req.params.garage, function(counts){
        res.send(counts);
    });
});

app.get('/all', function(req, res){
    const db = client.db(dbName);
    findDocuments(db, function(data){
        res.send(data);
    });
})

client.connect(function(err){
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    db.createIndex({garage: 1, year: 1, date: 1, hour: 1, minute: 1});

    for(var i = 0; i < 60; i+=5){
        schedule.scheduleJob(i+' * * * *', function(){
            getGarageData(db);
        }); 
        console.log("scheduled to collect on minute "+i+" of each hour");
    }
        

    //insertDocuments(db, function(){});
    findDocuments(db, function(docs){
        console.log("Found "+docs.length+" records");
    });
 
});

app.get('/killdb', function(req, res){
    client.close();
});

const insertDocument = function(db, data){
    const collection = db.collection('garage-counts');
    collection.insertOne(
        data
    , function(err, result){
        assert.equal(err, null);
        //console.log("Inserted data into the collection");
        //callback(result);
    });
}

const findDocuments = function(db, callback){
    const collection = db.collection('garage-counts');
    collection.find({}).toArray(function(err, docs){
        assert.equal(err, null);
        //console.log("Found "+docs.length+" records");
        callback(docs);
    });
}

const findCountsByGarage = function(garage, callback){
    const db = client.db(dbName);
    const collection = db.collection('garage-counts');
    collection.find({"garage": garage}).toArray(function(err, docs){
        assert.equal(err, null);
        callback(docs);
    });
}

function getGarageData(db){
    var connectionString = "http://secure.parking.ucf.edu/GarageCount/iframe.aspx/";

    request(connectionString, function(error, response, body){
        try{
            $ = cheerio.load(body);
            var garageData = [];

            var months = [
                "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
            ];
            var weekdays = [
                "sunday","monday","tuesday","wednesday","thursday","friday","saturday"
            ];

            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();
            var dateNum = date.getDate();
            var dayOfWeek = date.getDay();
            var hour = date.getHours();
            var minute = date.getMinutes(); 

            var entryProto = {
                "garage": "x",
                "count": "x",
                "year": year,
                "month": month,
                "date": dateNum,
                "dayofweek": weekdays[dayOfWeek],
                "hour": hour,
                "minute": minute
            }
            // TODO: Try with .each() to reduce size

            garageData[0] = { "garage":"a", "count": $("#gvCounts_tccell0_2").find("strong").html() };
            garageData[1] = { "garage":"b", "count": $("#gvCounts_tccell1_2").find("strong").html() };
            garageData[2] = { "garage":"c", "count": $("#gvCounts_tccell2_2").find("strong").html() };
            garageData[3] = { "garage":"d", "count": $("#gvCounts_tccell3_2").find("strong").html() };
            garageData[4] = { "garage":"h", "count": $("#gvCounts_tccell4_2").find("strong").html() };
            garageData[5] = { "garage":"i", "count": $("#gvCounts_tccell5_2").find("strong").html() };
            garageData[6] = { "garage":"libra", "count": $("#gvCounts_tccell6_2").find("strong").html() };

            var entries = [];

            for(var index in garageData){
                var entry = entryProto;
                
                entry.count = parseInt(garageData[index].count);
                entry.garage = garageData[index].garage;
                entry._id = month + date + hour + minute + entry.garage;
                //console.log(entry);//Replace with database entry
                //insertDocuments(db, function(){}, entry);
                //entries[index] = entry; 
                insertDocument(db, entry);
            };
            
            console.log("Data recorded for "+year+" "+months[month]+" "+dateNum+" "+hour+":"+minute);

            //console.log(garageData);
            //console.log(entryProto);
        } catch(e){
            console.log(e);
        } 
        
        
    })
}