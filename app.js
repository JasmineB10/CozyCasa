if(process.env.NODE_ENV != "production"){
     require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
//const mongourl = 'mongodb://127.0.0.1:27017/wanderDb';
const dbUrl = process.env.ATLASDB_URL;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const CustomError = require("./utils/CustomError.js");
const  listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");


app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));



 async function main() {
 await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("connected to DB successfully");
})
.catch((err) => {
    console.log(err);
})


//root path
// app.get("/", (req,res) => {
//     res.send("this is root");
// })

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
     secret:process.env.SECRET
    },
    touchAfter: 24*3600
 });

 store.on("error", ()=> {
    console.log("error in mongo session store: ",error);
 })
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    expires: Date.now()+ 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//user related info ko  session ke andar sore karna so that he doesn't need to signup and login again -> serializing
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=> {
    next(new CustomError(404,"Page not found!"));
})
app.use((err,req,res,next) => {
    let {statusCode,message} = err;
    //res.status(statusCode=500).send(message);
    res.status(statusCode=500).render("error.ejs",{message});
})

app.listen(8080, () => {
    console.log("app is listening to port 8080");
})


