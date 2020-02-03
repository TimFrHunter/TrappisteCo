const levelDB = require(__dirname + '/../modeles/levelDB');

levelDB.userDB.put('responsable', JSON.stringify({"pwd" : "pwd", "role" : "responsable"})); 
levelDB.userDB.put('vendeur', JSON.stringify({"pwd" : "pwd", "role" : "vendeur"})); 
levelDB.userDB.put('fournisseur', JSON.stringify({"pwd" : "pwd", "role" : "fournisseur"})); 