const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var db;
module.exports = {
    connect: function (callback) {
                MongoClient.connect('mongodb://localhost:27017/grupo2', function (err, database) {
                        console.log('Connected the database Grupo2');
                        db = database.db('grupo2');
                        callback(err);
                })},

    getDB: function(){
        return db;
    }

}