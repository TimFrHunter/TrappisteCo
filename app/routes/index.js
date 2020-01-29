const express = require('express')
const router = express.Router()
const connexion = require('../modeles/connexion')
const url = require('url')

/* GET home page. */
router.get('/', (req, res, next) => {
    let token =  connexion.addTokenSession()
    req.session.tokenForm = token 
    let info = typeof req.query.info == 'undefined' ? null : req.query.info
    return res.render('index', {"tokenForm" : token, "info" : info })
})
.post('/connexion', async function (req, res) {
   
    let formData = req.body;
    let sess = req.session
    let type = await connexion.submitForm(formData, sess )
    if(type == 'responsable') return res.redirect('/responsable/stock')
    else if(type == 'vendeur') return res.redirect('/vendeur/caisse')
    else if (type == 'tokenFalse'){
        return res.redirect(url.format({
            pathname:"/",
            query: {
               "info":"token"
             }
          }));
    }
    else return res.redirect('/')  
})

module.exports = router;