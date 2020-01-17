const levelDB = require(__dirname + '/../modeles/levelDB');

levelDB.userDB.put('responsable1', JSON.stringify({"pwd" : "pwd", "role" : "responsable"})); 
levelDB.userDB.put('vendeur1', JSON.stringify({"pwd" : "pwd", "role" : "vendeur"})); 