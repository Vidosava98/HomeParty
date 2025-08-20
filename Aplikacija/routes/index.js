const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/User");
const Zurka = require("../models/Zurka");
router.get("/", (req, res) => {
  res.render("welcome");
});

router.get("/pregledzurki", ensureAuthenticated,  (req, res) => {
   Zurka.find().then((zurka) => {
     res.render("pregledzurki", {
       zurka: zurka,
       name: req.user.name,
     });
   });
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    name: req.user.name,
    Dogadjaj: req.user.routerData.Dogadjaj,
    userReq: req.user.routerData.userReq,
    Odgovor: req.user.routerData.Odgovor,
    Poziv: req.user.routerData.Poziv,
  });
});

router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", {
    name: req.user.name,
    email: req.user.email,
    date: req.user.date,
    slikaKorisnika: req.user.slikaKorisnika
  });
});

router.get("/organizujzurku", ensureAuthenticated, (req, res) => {
  res.render("organizujzurku", {
    name: req.user.name,
  });
});

router.get("/korisnici", ensureAuthenticated, (req, res) => {
  User.find({ name: { $ne: "admin" } }).then((users) => {
    res.render("korisnici", {
      users: users,
      name: req.user.name,
    });
  });
});

module.exports = router;
