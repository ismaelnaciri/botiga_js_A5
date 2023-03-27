const express = require('express');
const app = express();
const {FieldValue} = require('firebase-admin/firestore')
const cors=require('cors');
const fs = require("fs");
app.use(cors())
app.use(express.json());
port = 3080;

app.listen(port, ()=>{
  console.log(`el port::${port} funciona`)
});


app.get('/api/login',(req,res)=> {

  var serviceAccount = require("./botiga-61177-firebase-adminsdk-a1p5h-9b6614abd8.json");
  var admin = require("firebase-admin");
  const {getFirestore} = require("firebase-admin/firestore");
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = getFirestore(app);
  // db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').get().then(al2 =>{
  //   console.log(al2);
  //   res.json(al2);
  // });



  // const res ={};

  db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').set(
    {client:FieldValue.arrayUnion({
        nom:'',
        email:'aaaaaaa',
        password:'Tu rima 33'
      })},{merge:true}).then(r => {
    console.log("dades inserides");
  })
});

app.get('/imatges/:nom',(req,res)=>{
  const nomImatge = req.params.nom;
  const rutaImatge = `../IMG/${nomImatge}`;
  const stream = fs.createReadStream(rutaImatge);
  stream.pipe(res);
})




