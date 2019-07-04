var cheerio = require("cheerio");
var http = require("http");
var request = require("request");
var schedule = require("node-schedule");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser")

var config = require("./secret.config.json");

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var cors = require('cors')

const dbURI = "mongodb+srv://"+config.username+":"+config.password+"@"+config.cluster//"mongodb://localhost:27017";
//"mongodb://"+config.username+":"+config.password+config.url;
//console.log(dbURI);
const dbName = "parking-data";

const client = new MongoClient(dbURI, { useNewUrlParser: true });

var port = 3000;
var app = express().use(cors());

app.use('/visualization', express.static(__dirname+'/../visualization'))

app.listen(port, function(req, res){
    console.log("App opened on port:"+port);
});

// TODO: Make callback format consistent

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+ "/../visualization/index.html"));
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

app.get('/oneday/:year/:month/:date', function(req, res){
    findCountsByDate(parseInt(req.params.year), parseInt(req.params.month), parseInt(req.params.date), (data)=>{
        //console.log(req.params)
        res.send(data)
    })
})

client.connect(function(err){
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    db.createIndex({garage: 1, year: 1, date: 1, hour: 1, minute: 1});
        
    // findDocuments(db, function(docs){
    //     console.log("Found "+docs.length+" records");
    // });
 
});

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

const findCountsByDate = function(year, month, date, callback){
    const db = client.db(dbName);
    const collection = db.collection('garage-counts');
    collection.find({"date": date, "month": month, "year": year}).toArray((err, docs) =>{
        assert.equal(err, null);
        callback(docs)
    })
}