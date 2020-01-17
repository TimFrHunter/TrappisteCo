
var level = require('level');   
module.exports = {
    userDB : level(__dirname + "/../db/userDB"),
    correspondanceDB: level(__dirname + "/../db/correspondanceDB"),
    correspondanceTdrDB: level(__dirname + "/../db/correspondanceTdrDB")
}
