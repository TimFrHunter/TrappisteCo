process.env.APP_PATH=process.env.PWD
const appPath= process.env.APP_PATH
const express = require('express')
const app = express()
const Contract = require(appPath +'/utils/hp/contract')
const connexion = require(appPath +'/utils/connexion')
const session = require('express-session')
const bodyParser = require('body-parser');
const levelDB = require(appPath + '/utils/levelDB');

const viewsPath = appPath + '/views/pages/'
const walletPath = appPath + '/wallet';
const user = 'responsable1'
const ccpPath = appPath + '/utils/hp/connection-orga1.json'
const channelName = 'channel-one'
const chaincodeName = 'chainecode-trappiste'

app.set('view engine', 'ejs')
app.use(session({secret: '44665400603354170431313', saveUninitialized: true, resave: true}))
app.use(express.static(appPath + '/public'))
app.use( bodyParser.urlencoded({ extended: true }))


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
 // if(role != "vendeur" ) return res.redirect('/')
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
.post('/validation', async (req, res) => {
  let els = req.body
  console.log(els)
  for(let el of els.commande) {
    let idBiere = el[0]
    let quantite = el[1]
    decrementerStock(idBiere,quantite)
  }
  return res.sendStatus(200)
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