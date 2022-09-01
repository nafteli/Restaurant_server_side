import express from "express"
import cors from "cors"
//import routes from '../routes/account.js';
import router from '../routes/Routessql.js'
// sudo /opt/lampp/lampp start


// create our express app
// middleware
const app = express()
app.use(cors())
app.use(express.json())

// route
app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Origin", true);
  
    // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', '*');
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  
    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
  
    // Pass to next layer of middleware
    next();
  });
app.use('/api/',cors(), router)



const port = process.env.PORT || 4000;
//start server
app.listen(port, ()=>{
    console.log(`listening at port:${port}`)
    console.log("sudo /opt/lampp/lampp start")
}) 