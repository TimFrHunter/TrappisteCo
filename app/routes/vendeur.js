const express = require('express');
const router = express.Router();
const contract = require('../modeles/contract')
const levelDB = require('../modeles/levelDB')


const lister = require('../modeles/lister')
const incrementer = require('../modeles/incrementer')
const autre = require('../modeles/autre')




router.get('/caisse', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "vendeur" ) 
        return res.redirect('/')
    res.render('caisse', {"role" : role})
}).get('/caisse-consigne', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "vendeur" ) 
        return res.redirect('/')
    res.render('caisseConsigne', {"role" : role})
})
.post('/getProductInfo', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role == "vendeur" ) {
        try{
            let datas = req.body
            let idBiere = await levelDB.correspondanceDB.get(datas.barcode)
            let idBiereEnd = parseInt(idBiere.replace("Biere",''),10) +1
            let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
            let bieresStock = await lister.listerBieres(contrat, idBiere, "Biere" + idBiereEnd)
            await contrat.gateway.disconnect();
            return res.send({ 'barcodeExist' : true, 'bieresStock' : bieresStock})
        } catch (e){
            return res.send({ 'barcodeExist' : false, 'bieresStock' : {} })
        }
    }else
        return res.send({ 'barcodeExist' : false, 'bieresStock' : {} })
    
})
.post('/reductionInfos', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role == "vendeur" ) {
        try {
            let datas = req.body
            let idTdr = await levelDB.correspondanceTdrDB.get(datas.barcode)
            let idTdrEnd = parseInt(idTdr.replace("TicketReduction",''),10) +1
            let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
            let tdr = await lister.listerTicketReduction(contrat, idTdr,"TicketReduction" + idTdrEnd)
            let reducPrix = tdr[0].Record.isenabled == true ? tdr[0].Record.reductionprix : 0
            await contrat.gateway.disconnect();
            if(reducPrix == 0){
                return res.send({ 'reducExist' : false, 'prixReduc' : reducPrix })
            }
            return res.send({ 'reducExist' : true, 'prixReduc' : reducPrix })
        } catch (error) {
            return res.send({ 'reducExist' : false, 'prixReduc' : {} })
        }
       
    }
    return res.send({ 'reducExist' : false, 'prixReduc' : {} })
})
.post('/validation', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "vendeur" ) 
        return res.redirect('/')

    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    
    let els = req.body
    let vente =''
    let prixTotal = 0
    let i = 0
    let reducBarCode
    for(let el of els.commande) {
        let idBiere = el[0]
        let quantite = el[1]
        reducBarCode = el[2] // can be empty 
        prixTotal = el[3]
        
        await autre.decrementerStock(contrat, idBiere,quantite)
        if(i!=0)
            vente += ', '
        vente += ('\"'+el[0]+'\" : '+el[1]+'').toString()
        i++
    }
    vente = "{" + vente + "}"
    
    let ventes = await lister.listerVente(contrat, "Vente","Vente~")
    venteId = ventes.length
    let timestamp = (new Date().getTime() / 1000).toFixed(0)
    prixTotal = prixTotal.replace("€","")
    
    await incrementer.incrementerVente(contrat, "Vente"+venteId , "NaN", timestamp.toString() ,vente.toString(), prixTotal.toString())

    if(reducBarCode.length){//desactive ticket reduct
        let idTdr = await levelDB.correspondanceTdrDB.get(reducBarCode)
        let idTdrEnd = parseInt(idTdr.replace("TicketReduction",''),10) +1
        let tdr = await lister.listerTicketReduction(contrat, idTdr,"TicketReduction" + idTdrEnd)
        tdr = tdr[0].Record
        await incrementer.incrementerTicketDeReduction(contrat, tdr.id, tdr.reductionprix.toString(), tdr.codebarre.toString(), "false")
    }
    await contrat.gateway.disconnect();
    
    return res.sendStatus(200)
})
.post('/validationConsigne', async (req, res) => {
    role = req.session.role == undefined ? '' : req.session.role 
    if(role != "vendeur" ) 
        return res.redirect('/')
    let contrat = await contract.init(__dirname + '/../wallet', role, __dirname + '/../connection-orga1.json', 'channel-magasin','chainecode-trappiste') 
    let els = req.body
    let prix = 0
    for(let el of els.commande) {
        let idBiere = el[0]
        let quantite = el[1]
        prix += parseFloat(el[2])
        let cons = await lister.listerConsigne(contrat, "Consigne0", "Consigne~")//a modifier faire une fct plus efficace
        let lastConsId = cons.length
        await incrementer.incrementerConsigne(contrat, "Consigne"+lastConsId,idBiere, quantite)
    }
    let tdr = await lister.listerConsigne(contrat, "TicketReduction0", "TicketReduction~")//a modifier faire une fct plus efficace
    let barcode = tdr.length.toString()
    barcode = barcode.padStart(12, '1')
    await incrementer.incrementerTicketDeReduction(contrat, "TicketReduction"+tdr.length, prix.toString(), barcode.toString(), "true")
    await contrat.gateway.disconnect();
    
    levelDB.correspondanceTdrDB.put(barcode.toString(), "TicketReduction"+tdr.length); //comportement a changer dans le futur
    return res.sendStatus(200)
})

module.exports = router;