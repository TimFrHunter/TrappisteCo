const express = require('express')
const app = express()
const Contract = require(__dirname +'/modeles/contract')
const connexion = require(__dirname +'/modeles/connexion')
const session = require('express-session')
const bodyParser = require('body-parser');
const levelDB = require(__dirname + '/modeles/levelDB');

const viewsPath = __dirname + '/views/pages/'
const walletPath = __dirname + '/wallet';
const user = 'responsable1'
const ccpPath = __dirname + '/connection-orga1.json'
const channelName = 'channel-magasin'
const chaincodeName = 'chainecode-trappiste'

app.set('view engine', 'ejs')
app.use(session({secret: '44665400603354170431313', saveUninitialized: true, resave: true}))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))


app.listen(3000, function () {
  console.log('run: http://localhost:3000')
})

app.get(['/index', '/'], function (req, res) {
  let token =  connexion.addTokenSession()
  req.session.tokenForm = token 
  res.render(viewsPath + 'index', {"tokenForm" : token })
})
.get('/caisse', function (req, res) {
  role = req.session.role == undefined ? '' : req.session.role 
  if(role != "vendeur" ) return res.redirect('/')
  res.render(viewsPath + 'caisse', {"role" : role})
})
.get('/consigne', async function (req, res) {
  role = req.session.role == undefined ? '' : req.session.role 
  if(role != "responsable" ) 
    return res.redirect('/')
  let consignes = await listerConsigne("Consigne","Consigne~")
  res.render(viewsPath + 'consigne', {'consignes' : consignes, "role" : role})
})
.get('/reduction', async function (req, res) {
  role = req.session.role == undefined ? '' : req.session.role 
  if(role != "responsable" ) 
    return res.redirect('/')
  let reductions = await listerTicketReduction("TicketReduction","TicketReduction~")
  res.render(viewsPath + 'reduction', {'reductions' : reductions, "role" : role})
})
.get('/stock', async function (req, res) {
  role = req.session.role == undefined ? '' : req.session.role 
  if(role != "responsable" ) 
    return res.redirect('/')
  let bieresStock = await listerBieres("Biere","Biere~")
  res.render(viewsPath + 'stock', {'bieresStock' : bieresStock, "role" : role})
})
.get('/vente', async function (req, res) {
  role = req.session.role == undefined ? '' : req.session.role 
  if(role != "responsable" ) 
    return res.redirect('/')
  let ventes = await listerVente("Vente","Vente~")
  res.render(viewsPath + 'vente', {'ventes' : ventes, "role" : role})
})
.post('/connexion', async function (req, res) {
  let formData = req.body;
  let sess = req.session
  let type = await connexion.submitForm(formData, sess )
  if(type == 'responsable'){
    return res.redirect('/stock')
  }else if(type == 'vendeur'){
    return res.redirect('/caisse')
  }else{
    return res.redirect('/')  
  }
})
.post('/add', (req, res) => {
  let datas = req.body
  let type = datas.type
  let elements = datas.elements
  global[type](...elements)
  if(type == "incrementerStock")
    levelDB.correspondanceDB.put(elements[3], elements[0]); //comportement a changer dans le futur
  return res.sendStatus(200)
})
.post('/delete', (req, res) => {
  let datas = req.body
  let key = datas.key
  let type = datas.type
  global[type](key)
  return res.sendStatus(200)
})
.post('/getProductInfo', async (req, res) => {
  let datas = req.body
  let idBiere = await levelDB.correspondanceDB.get(datas.barcode)
  let idBiereEnd = parseInt(idBiere.replace("Biere",''),10) +1
  let bieresStock = await listerBieres(idBiere, "Biere" + idBiereEnd)
  return res.send({'bieresStock' : bieresStock})
})
.post('/reductionInfos', async (req, res) => {
  let datas = req.body
  let idTdr = await levelDB.correspondanceTdrDB.get(datas.barcode)
  let idTdrEnd = parseInt(idTdr.replace("TicketReduction",''),10) +1
  let tdr = await listerTicketReduction(idTdr,"TicketReduction" + idTdrEnd)
  let reducPrix = tdr[0].Record.isenabled == true ? tdr[0].Record.reductionprix : 0
  
  return res.send({'prixReduc' :reducPrix })
})
.post('/validation', async (req, res) => {
  let els = req.body
  let vente =''
  let prixTotal = 0
  let i = 0
  let reducBarCode
  for(let el of els.commande) {
    //console.log(el)
    let idBiere = el[0]
    let quantite = el[1]
    reducBarCode = el[2] // can be empty 
    prixTotal = el[3]
    await decrementerStock(idBiere,quantite)
    if(i!=0)
      vente += ', '
    vente += ('\"'+el[0]+'\" : '+el[1]+'').toString()
    i++
  }
  vente = "{" + vente + "}"
  //exemple : await incrementerVente("Vente0" , " ", "1651351654565" ,"{\"Biere1\" : 6, \"Biere144\" : 12}" ,"11.95")
  let ventes = await listerVente("Vente","Vente~")
  venteId = ventes.length
  let timestamp = (new Date().getTime() / 1000).toFixed(0)
 // console.log(timestamp)
  prixTotal = prixTotal.replace("€","")
  //console.log(prixTotal)
  await incrementerVente("Vente"+venteId , "NaN", timestamp.toString() ,vente.toString(), prixTotal.toString())
  if(reducBarCode.length){
    let idTdr = await levelDB.correspondanceTdrDB.get(reducBarCode)
    let idTdrEnd = parseInt(idTdr.replace("TicketReduction",''),10) +1
    let tdr = await listerTicketReduction(idTdr,"TicketReduction" + idTdrEnd)
    tdr = tdr[0].Record
    //incrementerTicketDeReduction("TicketReduction0","0.75","164655435534","true"))
    await incrementerTicketDeReduction(tdr.id,tdr.reductionprix.toString(), tdr.codebarre.toString(), "false")
  }

  return res.sendStatus(200)
})
.post('/validationConsigne', async (req, res) => {
  let els = req.body
  let prix = 0
  for(let el of els.commande) {
    let idBiere = el[0]
    let quantite = el[1]
    prix += parseFloat(el[2])
    let cons = await listerConsigne("Consigne0", "Consigne~")//a modifier faire une fct plus efficace
    let lastConsId = cons.length
    await incrementerConsigne("Consigne"+lastConsId,idBiere, quantite)
  }
  //exemple : incrementerTicketDeReduction("TicketReduction0","0.75","164655435534","true"))
  let tdr = await listerConsigne("TicketReduction0", "TicketReduction~")//a modifier faire une fct plus efficace
  let barcode = tdr.length.toString()
  barcode = barcode.padStart(12, '1')

  await incrementerTicketDeReduction("TicketReduction"+tdr.length, prix.toString(), barcode.toString(), "true")
  levelDB.correspondanceTdrDB.put(barcode.toString(), "TicketReduction"+tdr.length); //comportement a changer dans le futur
  
  return res.sendStatus(200)
})
.get("/test", async (req, res) => {
  return res.send([ress, ress.length])
})


listerBieres = async (startRange, endRange) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) 
  let res = await contract.evaluateTransaction("listerBieres", startRange, endRange);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : JSON.parse(Buffer.from(res));  
}

listerVente = async (startRange, endRange) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) 
  let res = await contract.evaluateTransaction("listerVente", startRange, endRange);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : JSON.parse(Buffer.from(res));  
}

listerConsigne = async (startRange, endRange) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.evaluateTransaction("listerConsigne", startRange, endRange);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : JSON.parse(Buffer.from(res)); 
}

listerTicketReduction = async (startRange, endRange) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.evaluateTransaction("listerTicketReduction", startRange, endRange);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : JSON.parse(Buffer.from(res)); 
}

incrementerStock = async (biereId, name, stock, codeBarre, consigne, prix) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("incrementerStock", biereId, name, stock, codeBarre, consigne, prix);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();    
}

deleteByKey = async (key) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.submitTransaction("delete",key);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : Buffer.from(res).toString();    
}

decrementerStock = async (biereId, decrementNumber) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.submitTransaction("decrementerStock", biereId, decrementNumber);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : Buffer.from(res).toString(); 
}

incrementerVente = async (venteId, reductionId, dateTimestamp, biereVendu, prixTotal) => {
  console.log(biereVendu)
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.submitTransaction("incrementerVente", venteId, reductionId, dateTimestamp, biereVendu, prixTotal);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : Buffer.from(res).toString();  
}

incrementerConsigne = async (consigneId, biereId, count) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.submitTransaction("incrementerConsigne", consigneId, biereId, count);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : Buffer.from(res).toString(); 
}

incrementerTicketDeReduction = async (ticketReducId, prixReduc, codeBarre, isEnabled) => {
  contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
  let res = await contract.submitTransaction("incrementerTicketDeReduction", ticketReducId, prixReduc, codeBarre, isEnabled);
  await contract.gateway.disconnect();
  return res.length == 0 ? true : Buffer.from(res).toString(); 
}