
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
const connectionProfile = __dirname + '/../connection-magasin.json'
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
        levelDB.correspondanceDB.put(elements[3], elements[0]); 
    await contrat.gateway.disconnect();    
    return res.sendStatus(200)
})
.post('/delete', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" ) 
        return res.redirect('/')
    let datas = req.body
    let key = datas.key
    let codebarre = datas.codebarre
    //let type = datas.type
    //global[type](key)
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin, ccMagasin) 
    
    await levelDB.correspondanceDB.del(codebarre)
    await autre.deleteByKey(contrat, key)
    await contrat.gateway.disconnect();
    return res.sendStatus(200)
});
/*****************************************************************************************
******************************************************************************************
***************************  Partie  Fournisseur  ****************************************
******************************************************************************************
*****************************************************************************************/
router.get("/commande", async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable" && role != "responsableFournisseur") 
        return res.redirect('/')
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasinChimay, ccMagasinFournisseur) 
    let produits = await lister.listerProduit(contrat, "Produit01", "Produit~")
    await contrat.gateway.disconnect();
    return res.render('fournisseur/produit', {'produits' : produits, "role" : role})
})
.post("/commande/valider", async(req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "responsable") 
        return res.redirect('/')
    let datas = req.body
    let contrat = await contract.init(walletPath, role, connectionProfile, channelMagasin,ccMagasin) 
    for(let key in datas){
        //console.log("boucle inside")
        if(datas[key].length){
            let index = await levelDB.correspondanceDB.get(key).catch((e) => console.log("Leve une erreur car le code barre n'existe pas encore, du coup il va etre créé dans le else qui suit"))
            if(index){
                let indexEnd = parseInt(index.replace("Biere",'') ,10) +1
                console.log(index, "Biere"+indexEnd)
                let biere = await lister.listerBiere(contrat, index, "Biere"+indexEnd )
                biere = biere[0].Record
                let stock =  parseInt(biere.stock) + parseInt(datas[key])
                //console.log(biere.id, biere.nom, parseInt(biere.stock + datas[key]).toString(), biere.codebarre.toString(),biere.consigne.toString(), biere.prix.toString())
                await update.updateBiere(contrat, biere.id, biere.nom, stock.toString(), biere.codebarre.toString(), biere.consigne.toString(), biere.prix.toString())
            }else{
                let bieresStock = await lister.listerBiere(contrat, "Biere","Biere~")
                index = "Biere"+bieresStock.length
                await levelDB.correspondanceDB.put(key, index)
                //Biere1 Chimay Rouge 200121212 123456787 0.19 2.2
                await update.updateBiere(contrat, index, '0', datas[key].toString(), key.toString(), '0', '0').catch((e) => {
                    console.log("update error:",e)
                })
            }
        }
    }
   // console.log("fermée")
    await contrat.gateway.disconnect();
    return res.send({'status' : true})

})
.post("/fournisseur/proposer-offre", async(req, res) => {

});

module.exports = router