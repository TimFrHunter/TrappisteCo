const express = require('express')
const app = express()
const path = require('path');
const session = require('express-session')
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const vendeurRouter = require('./routes/vendeur');
const responsableRouter = require('./routes/responsable');
const fournisseurRouter = require('./routes/fournisseur');




app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs')
app.use(session({secret: '44665400603354170431313', saveUninitialized: true, resave: true}))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))


app.listen(3000, function () {
  console.log('run: http://localhost:3000')
})

app.use('/', indexRouter)
app.use('/vendeur', vendeurRouter)
app.use('/responsable', responsableRouter)
app.use('/fournisseur', fournisseurRouter)






