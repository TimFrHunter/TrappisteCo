const appPath= process.env.APP_PATH
var level = require('level');   
module.exports = {
    userDB : level(appPath + "/db/userDB"),
    correspondanceDB: level(appPath + "/db/correspondanceDB")
}
