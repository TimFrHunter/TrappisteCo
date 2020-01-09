const appPath= process.env.APP_PATH
const levelDB = require(appPath + '/utils/levelDB');

levelDB.put('responsable1', JSON.stringify({"pwd" : "pwd", "role" : "responsable"})); 
levelDB.put('vendeur1', JSON.stringify({"pwd" : "pwd", "role" : "vendeur"})); 