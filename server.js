const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config({ path: '../isma.env' });
const {FieldValue, getFirestore} = require('firebase-admin/firestore')
const uuid = require('uuid')

const app = express();
const fs = require('fs');

const cors = require('cors');

//Botiga A6
const Sequelize = require("sequelize");
const {NOW} = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
  console.log('Conexió establerta');
}).catch((error) => {
  console.error("No s'ha pogut connectar", error);
});

const Product = sequelize.define("productes", {
  idproducte:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },nom: {
    type: Sequelize.STRING,
    allowNull: false
  },preu:{
    type: Sequelize.INTEGER,
    allowNull: false
  },img:{
    type: Sequelize.STRING,
    allowNull: false
  },tipus:{
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Compras = sequelize.define("compres",{
  idfactura:{
    type: Sequelize.STRING,
    primaryKey: true
  },usuari:{
    type: Sequelize.STRING,
    allowNull: true
  },idproducte:{
    type: Sequelize.INTEGER,
    primaryKey: true
  },oferta:{
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },quantitat:{
    type: Sequelize.INTEGER,
    allowNull: false
  },data:{
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  },cost : {
    type: Sequelize.DECIMAL(10,2),
    allowNull: false
  }
  ,moneda: {
    type: Sequelize.STRING,
    allowNull: false
  }
});


sequelize.sync().then(()=>{
  console.log('Base de dades sincroniotzada');
}).catch((error) => {
  console.error("No s'ha pogut sincronitzar", error);
});



app.use(cors());
app.use(express.json());


port = 3080;

app.listen(port, ()=>{
  console.log(`el port::${port} funciona`)
});

app.get('/productes', async (req, res) => {

  Product.findAll().then((data)=>{
    res.json(data)
  }).catch((error)=>{
    console.error("Han fallat els productes", error)
  })

});


app.post('/compres', async (req, res) => {
  const items = req.body.json;
  const idFactura = uuid.v4();
  items.forEach(function(item) {
    Compras.create({
      idfactura: idFactura,
      usuari: '',
      idproducte: item.idproducte,
      oferta: item.oferta,
      quantitat: item.quantity,
      cost: item.price,
      moneda: item.coin
    }).catch((err)=>{
      if (err){
        console.error('Ha hagut un error ', err)
      }
    })
  });

});


//Botiga A4


var admin = require("firebase-admin");
const {request} = require("express");
const Process = require("process");
var serviceAccount;
var fitxer;
var db;

fs.readFile('./ConnexioFirebase','utf-8',(error, contingut)=> {
  if (error){
    console.error(error);
    return;
  }else {
    fitxer = contingut;
    serviceAccount = require(fitxer);
    const {getFirestore} = require("firebase-admin/firestore");
    const {firestore} = require("firebase-admin");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = getFirestore();
    dbConnection().then((patata) => {
      console.log(patata);
    });
  }
});

async function dbConnection(){
  const conn = db.collection("book-net").doc("clients");
  const doc = await conn.get();
  if (!doc.exists){
    console.log("El document no existeix!")
  }else{
    app.get('/api/firebase',async (req, res) => {

      const conn = db.collection("book-net").doc("clients");
      const doc = await conn.get();

      const document = doc.data();
      res.json(document);
    })

  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Imatges/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/signup', async (req, res) =>{
  const userResponse = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false,
  });
  res.json(userResponse);
})

app.post('/datausers',(req, res) => {
  db.collection("book-net").doc("clients").set({
    clients: FieldValue.arrayUnion({
      Adreca: req.body.Adreca,
      Cognoms: req.body.Cognoms,
      Correu: req.body.Correu,
      Nom: req.body.Nom,
      Telefon: req.body.Telefon,
      Rol: req.body.Rol})
  },{merge:true})
})

app.post('/datausersdelete',(req, res) => {
  db.collection("book-net").doc("clients").update({
    clients: FieldValue.arrayRemove({
      Adreca: req.body.Adreca,
      Cognoms: req.body.Cognoms,
      Correu: req.body.Correu,
      Nom: req.body.Nom,
      Telefon: req.body.Telefon,
      Rol: req.body.Rol})
  })
})

app.post('/contacte', (req, res)=>{
  let data = new Date();
  let dia = data.getDate();
  let mes = data.getMonth() + 1;
  let any = data.getFullYear();
  let hora = data.getHours();
  let minuts = data.getMinutes();
  let segons = data.getSeconds();
  let data_completa = `${dia}${mes}${any}${hora}${minuts}${segons}`;
  let fitxerContacte = fs.createWriteStream(`Contacte/${data_completa}_contacte.txt`);
  fitxerContacte.write(req.body.nom+"\n");
  fitxerContacte.write(req.body.correu+"\n");
  fitxerContacte.end(req.body.missatge);
})

app.get('/imatges/:nom',(req,res)=>{
  const nomImatge = req.params.nom;
  const rutaImatge = `../IMG/${nomImatge}`;

  fs.access(rutaImatge, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send(`No s'ha trobat la foto`)
      return;
    }
    const stream = fs.createReadStream(rutaImatge);
    stream.pipe(res);
  })
});


app.post('/log',(req,res)=>{
  let data = new Date();
  let dia = data.getDate();
  let mes = data.getMonth() + 1;
  let any = data.getFullYear();
  let hora = data.getHours();
  let minuts = data.getMinutes();
  let segons = data.getSeconds();
  let data_completa = `${dia}${mes}${any}${hora}${minuts}${segons}`;
  fs.writeFileSync(`log/${req.body.log}.log`, `${data_completa} ${req.body.text}\n`,{flag:'a+'});
})

// app.post('/api/login',async (req,res)=> {
//
//   const dades = req.body.json;
//
//   console.log(dades)
//     dades.forEach(function(dada) {
//       db.collection('iniciar-registre').doc('yWikbVf2wyCyqnyRkE8z').set(
//         {
//           clients: FieldValue.arrayUnion({
//             nom: dada.nom,
//             email: dada.correu,
//             password: dada.contrasenya
//           })
//         }, {merge: true}).then(r => {
//         console.log("dades inserides")
//       }).catch((err) => {
//         if (err) {
//           console.error(err)
//         }
//       })
//     })
// })
/*



baseDades();
async function baseDades() {


  app.get('/api/firebase', async (req, res) => {
    const conn = db.collection("iniciar-registrar").doc("8X8qyKzfzPYPdqlUA6Ut");
    const doc = await conn.get();
    const document = doc.data();

    res.json(document);
  })
}

app.post('/registrar', async (req, res) => {
  const respostaUser = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false,
  })
  res.json(respostaUser);
});

app.post('/datausers', async (req, res) => {
  db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').set(
    {
      client: FieldValue.arrayUnion({
        Nom: req.body.nom,
        email: req.body.correu,
        password: 'patata'
      })
    }, {merge: true}).then(r => {
      console.log("dades inserides");
    })
});


//Contacte log
app.post('/api/escriure', (req, res) => {
  const correu = req.body.email;
  const name = req.body.name;
  const missatge = req.body.missatge;
  const now = Date.now();
  const nomArxiu = correu + `${now}.txt`;
  console.log(nomArxiu);

  fs.appendFile("C:\\IdeaProjects\\botiga_js\\src\\Messages\\" + nomArxiu, ' ', (error) => {
    if (error) throw error;
    else console.log("Arxiu creat");
  })

  const writableStream = fs.createWriteStream("C:\\IdeaProjects\\botiga_js\\src\\Messages\\" + nomArxiu)
  console.log("Test");
  writableStream.write("Correu: " + toString() + correu + "\n");
  writableStream.write("Nom: " + toString() + name + "\n");
  writableStream.write("Missatge: " + toString() + missatge + "\n");

})



*/


/*
app.post('/api/formulario', (req, res) => {

  const datos = req.body;


  const nombreArchivo = `datos_${new Date().toISOString()}.txt`;


  fs.writeFile(nombreArchivo, JSON.stringify(datos), (error) => {
    if (error) {
      console.error(`Error al escribir en el archivo ${nombreArchivo}: ${error}`);
      res.status(500).send('Error interno del servidor');
    } else {
      console.log(`Los datos se han guardado en el archivo ${nombreArchivo}`);
      res.status(200).send('Los datos se han guardado correctamente');
    }
  });
});*/
