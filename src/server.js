const express = require('express');
const app = express();

const cors=require('cors');
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

  console.log(req.query);

  // const res ={};

  db.collection('iniciar-registrar').doc('8X8qyKzfzPYPdqlUA6Ut').set(req.query).then(r => {
    console.log("dades inserides");
  })
});


