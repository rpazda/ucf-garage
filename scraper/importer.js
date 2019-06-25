const fs = require('fs');
const assert = require("assert");

const config = require("./secret.config.json");

const MongoClient = require("mongodb").MongoClient;

const dbName = "parking-data";
const dbURI = "mongodb+srv://"+config.username+":"+config.password+"@"+config.cluster;
const client = new MongoClient(dbURI, { useNewUrlParser: true });


client.connect((err) =>{
    assert.equal(null, err);
    console.log("Successfully connected to database...");

    const db = client.db(dbName);

    fs.readFile('exported.json', (err, data) =>{
        if (err) throw err;
        let imported = JSON.parse(data);
        const collection = db.collection("garage-counts");
        // TODO: Break into chunks to reduce risk of losing progress with network problems
        collection.insertMany(
            imported, 
            {
                ordered: false
            },
            function(err, result){
                if(err){
                    console.log("Error in writing to database...");
                    console.log(err);
                } else{
                    console.log("Write to database succeeded...");
                    console.log(result);
                }
            })
        return 0;
    })
})

const insertDocument = function(db, data){
    const collection = db.collection("garage-counts")
    collection.insertOne(
        data,//JSON.parse(data),
        function(err, result){
            if(err){
                console.log(err);
                //assert(err, null)
            }
        })
}