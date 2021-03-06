//Shiboleth  21:31 21/12
var https = require('https');
var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');


var urlencodedParser = bodyParser.urlencoded({ extended: false });
const secret = 'cps3232';

//connect to database
mongoose.connect('mongodb://imgserver:1234@imgserver:27018/usrImagesDB');
console.log("Connected to usrImagesDB as user:imgserver on port 27018");


//define schema; ie the format the data in the database will take
var imgschema = new mongoose.Schema({
  username:String,
  imgIds:[String]
});
//define data model based on schema
//Create collection in db if doesn't exist
var users = mongoose.model('users',imgschema);
//modules.export = users;
////////////////////
const app = express();
app.use(urlencodedParser);
app.set('view engine','ejs');
// app.use('/auth',authRoutes);
//first parameter tells which url format directory is to be mounted for
//__dirname + ... is the name of the directory on the server.
//for all urls ending in

app.use('/gallery',express.static(__dirname+'/images'));
app.use('/',express.static(__dirname));

app.get('/',function(req,res){
    res.render('auth');
});

app.get('/logout',function(req,res){
  res.render('auth_exp');
});
// app.get('/home',function(req,res){
//   res.render('home');
// });

app.get('/gallery/:token',function(req,res){//token will be username encrypted with secret
  var decoded = jwt.decode(req.params.token,secret);
  	console.log(decoded);
	console.log(decoded.exp);
	console.log(Date.now());
  if(decoded.exp < Date.now()){
    console.log("Token Expired!");
    res.render('auth_exp');
}

  users.findOne({username:decoded.username},
    function(err,user){
      if(!user){
        console.log("user not found");
        res.end("user not found");

      }
      else{
        console.log(user);
        res.render('images',{username:user.username,imgIds:user.imgIds/*,rows:rows*/});
      }
    });
});

var credentials = {
  ca: fs.readFileSync('ca-chain.cert.pem'),
  key: fs.readFileSync('imagesite.key.pem'),
  cert: fs.readFileSync('imagesite.cert.pem'),
  passphrase: 'cthulhu'
};

https.createServer(credentials,app).listen(443);
