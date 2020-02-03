
const express = require('express');
const router = express.Router();
const contract = require('../modeles/contract')
const levelDB = require('../modeles/levelDB')

const lister = require('../modeles/lister')
const update = require('../modeles/update')
const autre = require('../modeles/autre')


const channelMagasinChimay = 'channel-magasin-chimay'
const ccMagasinFournisseur = 'chaincode-trappiste-fournisseur'
const connectionProfile = __dirname + '/../connection-fournisseur-chimay.json'
const walletPath = __dirname + '/../wallet'


router.get("/produits", async(req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "fournisseur") 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasinChimay, ccMagasinFournisseur) 
    let produits = await lister.listerProduit(contrat, "Produit01", "Produit~")
    await contrat.gateway.disconnect();
    return res.render('fournisseur/produits', {'produits' : produits, "role" : role})
});

module.exports = router