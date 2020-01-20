
const express = require('express');
const router = express.Router();
const contract = require('../modeles/contract')
const levelDB = require('../modeles/levelDB')




const lister = require('../modeles/lister')
const incrementer = require('../modeles/incrementer')
const autre = require('../modeles/autre')



router.get('/consigne', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    let consignes = await lister.listerConsigne(contrat, "Consigne","Consigne~")
    await contrat.gateway.disconnect();
    res.render('consigne', {'consignes' : consignes, "role" : role})
})
.get('/reduction', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    let reductions = await lister.listerTicketReduction(contrat, "TicketReduction","TicketReduction~")
    await contrat.gateway.disconnect();
    res.render('reduction', {'reductions' : reductions, "role" : role})
})
.get('/stock', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    let bieresStock = await lister.listerBieres(contrat, "Biere","Biere~")
    await contrat.gateway.disconnect();
    res.render('stock', {'bieresStock' : bieresStock, "role" : role})
})
.get('/vente', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    let ventes = await lister.listerVente(contrat, "Vente","Vente~")
    await contrat.gateway.disconnect();
    res.render('vente', {'ventes' : ventes, "role" : role})
})
.post('/add', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let datas = req.body
    let type = datas.type
    let elements = datas.elements
    //global[type](...elements)
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    await incrementer.incrementerStock(contrat, ...elements)
    if(type == "incrementerStock") 
        levelDB.correspondanceDB.put(elements[3], elements[0]); //comportement a changer dans le futur
    await contrat.gateway.disconnect();    
    return res.sendStatus(200)
})
.post('/delete', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let datas = req.body
    let key = datas.key
    //let type = datas.type
    //global[type](key)
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    await autre.deleteByKey(contrat, key)
    await contrat.gateway.disconnect();
    return res.sendStatus(200)
})

module.exports = router