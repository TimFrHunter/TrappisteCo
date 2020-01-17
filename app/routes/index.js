const express = require('express');
const router = express.Router();
const connexion = require('../modeles/connexion')

/* GET home page. */
router.get('/', (req, res, next) => {
    let token =  connexion.addTokenSession()
    req.session.tokenForm = token 
    res.render('index', {"tokenForm" : token })
})
.post('/connexion', async function (req, res) {
    let formData = req.body;
    let sess = req.session
    let type = await connexion.submitForm(formData, sess )
    if(type == 'responsable') return res.redirect('/responsable/stock')
    else if(type == 'vendeur') return res.redirect('/vendeur/caisse')
    else return res.redirect('/')  
})

module.exports = router;