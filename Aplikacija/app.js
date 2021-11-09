const express = require("express");
const expresLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const Zurka = require("./models/Zurka");
const User = require("./models/User");

const app = express();
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/slikeKorisnika", express.static("slikeKorisnika"));
require("./config/passport")(passport);

// Mongo
const db = require("./config/keys").MongoURI;

// Connect
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Povezan na MongoDB..."))
  .catch((err) => console.log(err));


  
//EJS
app.use(expresLayouts);
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/zurke", require("./routes/zurke"));

//RUTE
app.get("/pregledzurki", function (req, res) {
  Zurka.find().then((zurka) => {
    res.render("pregledzurki", {
      zurka: zurka,
      name: req.user.name,
    });
  });
});
app.get("/_form_changepassword", function (req, res) {
  res.render("_form_changepassword", {
    name: req.user.name,
  });
});
app.get("/_form_changeusername", function (req, res) {
  res.render("_form_changeusername", {
    name: req.user.name,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log("Povezan na port 3000..."));
