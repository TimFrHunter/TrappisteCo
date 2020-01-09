const appPath= process.env.APP_PATH
var level = require('level');   
const path = require('path') 
var db = level(appPath + "/db/userDB");
module.exports = db;
