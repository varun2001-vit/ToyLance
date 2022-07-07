//jshint esversion:6
const express= require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const session = require('express-session');
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');
const encrypt = require('mongoose-encryption');
const ejs = require('ejs');
//packages--end
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//session
app.use(session({
    secret: 'StrangerThingshappeneveryday',
    resave: false,
    saveUninitialized: true,
  }))
app.use(passport.initialize());
app.use(passport.session());
//connect to server
mongoose.connect('mongodb://localhost:27017/ToysDB');
//schemas
const UserSchema=mongoose.Schema({
    email:String,
    password:String
}) 
const ToySchema=mongoose.Schema({
    name:String,
    Description:String
})
//encryption

UserSchema.plugin(passportLocalMongoose);//hashing salting
//creating models
const User=mongoose.model('User',UserSchema);
const Toy=mongoose.model('Toy',ToySchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
})


app.get("/home",function(req,res){
    if(req.isAuthenticated())
    {
        res.render("home");
    }else
    {
        res.redirect("/login");
    }
});

//database operations route
app.get("/insert",function(req,res){
    res.render("insert");
})
app.get("/update",function(req,res){
    res.render("update");
});
app.get("/delete",function(req,res){
    res.render("delete");
});
app.get("/search",function(req,res){
    res.render("search");
});
app.get("/menu",function(req,res){
    res.render("menu");
});

//database post routes
app.post("/insert",function(req,res){
    const toyname=req.body.ToyName;
    const toydescription=req.body.Description;
    const toy_insert=new Toy({
        name: toyname,
        Description:toydescription
    });
    toy_insert.save(function(err)
    {
        if(err)
        {
            console.log(err);
            res.render("failure");
        }
        else
        {
            res.render("success");
            console.log("Successfully inserted");
        } 
    }
    
    );
    
})
app.post("/delete", function(req, res) {
    const toyname=req.body.ToyName;
    Toy.deleteOne({name: toyname}, function(err)
    {
        if(err)
        {
            console.log(err);
            res.render("failure");
        }
        else
        {
            res.render("success");
            console.log("Successfully deleted");
        }
    });
})
app.post("/update", function(req, res){
    const toyname=req.body.ToyName;
    const toynewdescription=req.body.Description;
    Toy.updateOne({name: toyname},{Description: toynewdescription},function(err, result)
    {
        if(err)
        {
            console.log(err);
            res.render("failure");
        }
        else
        {
            res.render("success");
            console.log("updated");
        }
    })

})
app.post("/search",function(req,res){
    const toynamesearched=req.body.ToyName;
    Toy.findOne({name:toynamesearched}, function(err,result){
        if(err)
        {
            console.log(err);
            res.render("failure");
        }
        else
        { 
            res.render("success");

            console.log(result);
        }
    })
})
//register
app.post("/register",function(req,res){
    const user = req.body.username;
    const password = req.body.password;
    User.register({username: user},password,function(err,user){
        if(err){
            console.log("Error: " + err);
            res.redirect("/register");
        }
        else {
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/menu");
                });
        }
    });
    
})
app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

//login
app.post("/login",function(req,res){
    const id = req.body.username;
    const password = req.body.password;
    const newloginuser=new User({
        username:id,
        password:password
    });
    req.login(newloginuser, function(err){
        if(err){
            console.log(err);
        }
        else {
               passport.authenticate("local")(req,res, function(){
                res.redirect("/menu");
               });

            }
    });

   
});
  
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
