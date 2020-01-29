
const express = require('express');
const router = express.Router();
const contract = require('../modeles/contract')
const levelDB = require('../modeles/levelDB')

const lister = require('../modeles/lister')
const update = require('../modeles/update')
const autre = require('../modeles/autre')

const channelMagasin = 'channel-magasin'
const ccMagasin = 'chaincode-trappiste'
const channelMagasinChimay = 'channel-magasin-chimay'
const ccMagasinFournisseur = 'chaincode-trappiste-fournisseur'
const connectionProfile = __dirname + '/../connection-orga1.json'
const walletPath = __dirname + '/../wallet'


router.get('/consigne', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin, ccMagasin) 
    let consignes = await lister.listerConsigne(contrat, "Consigne","Consigne~")
    await contrat.gateway.disconnect();
    res.render('consigne', {'consignes' : consignes, "role" : role})
})
.get('/reduction', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin,ccMagasin) 
    let reductions = await lister.listerTicketReduction(contrat, "TicketReduction","TicketReduction~")
    await contrat.gateway.disconnect();
    res.render('reduction', {'reductions' : reductions, "role" : role})
})
.get('/stock', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin,ccMagasin) 
    let bieresStock = await lister.listerBiere(contrat, "Biere","Biere~")
    await contrat.gateway.disconnect();
    res.render('stock', {'bieresStock' : bieresStock, "role" : role})
})
.get('/vente', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin,ccMagasin) 
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
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin,ccMagasin) 
    await update.updateBiere(contrat, ...elements)
    if(type == "updateBiere") 
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
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin, ccMagasin) 
    await autre.deleteByKey(contrat, key)
    await contrat.gateway.disconnect();
    return res.sendStatus(200)
});
/*****************************************************************************************
******************************************************************************************
***************************  Partie  Fournisseur  ****************************************
******************************************************************************************
*****************************************************************************************/
router.get("/fournisseur/list", async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" && role != "responsableFournisseur") 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasinChimay, ccMagasinFournisseur) 
    let produits = await lister.listerProduit(contrat, "Produit01", "Produit~")
    await contrat.gateway.disconnect();
    return res.render('fournisseur/produit', {'produits' : produits, "role" : role})
})
.post("/fournisseur/commander", async(req, res) => {

})
.post("/fournisseur/proposer-offre", async(req, res) => {

});

module.exports = router