const appPath= process.env.APP_PATH
const levelDB = require(appPath + '/utils/levelDB');

levelDB.userDB.put('responsable1', JSON.stringify({"pwd" : "pwd", "role" : "responsable"})); 
levelDB.userDB.put('vendeur1', JSON.stringify({"pwd" : "pwd", "role" : "vendeur"})); 