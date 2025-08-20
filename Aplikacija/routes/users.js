const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
var Zurka = require("../models/Zurka");
var zurkekojesesalju = [];
//Login page
router.get("/login", (req, res) => {
  res.render("login");
});

//Register page
router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/profilkorisnika", (req, res) => {
  res.render("profilkorisnika");
});

router.post("/profilkorisnika", (req, res) => {
  User.findOne({ name: req.body.organizator })
    .then((user) => {
      console.log(user);
      if (user == null) {
        res.redirect("/dashboard");
      } else {
        res.render("profilkorisnika", {
          user: user,
        });
      }
    })
    .catch((err) => console.log(err));
});
router.post("/filter", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.organizatorzurke", req.body.organizatorzurke);
  Zurka.find({ organizator: req.body.organizatorzurke }).then((zurka) => {
    console.log(zurka);
    res.render("pregledzurki", {
      zurka: zurka,
      name: req.user.name,
    });
  });
});
router.post("/filterpomuzici", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.muzika", req.body.muzika);
  Zurka.find({ muzika: req.body.muzika }).then((zurka) => {
    console.log(zurka);
    res.render("pregledzurki", {
      zurka: zurka,
      name: req.user.name,
    });
  });
});
router.post("/filterpoadresi", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.adresa", req.body.adresa);
  Zurka.find({ adresa: req.body.adresa }).then((zurka) => {
    console.log(zurka);
    res.render("pregledzurki", {
      zurka: zurka,
      name: req.user.name,
    });
  });
});
router.post("/filterpodatumu", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.datum", req.body.datum);
  Zurka.find({ datum: req.body.datum }).then((zurka) => {
    console.log(zurka);
    res.render("pregledzurki", {
      zurka: zurka,
      name: req.user.name,
    });
  });
});
router.post("/filterdatum", (req, res) => {
  console.log("req.body ", req.body);
  console.log("req.body.name Ime ulogovanog", req.body.name);
  Zurka.find().then((zurka) => {
    console.log(zurka);
    zurka.forEach(function (zurka) {
      var danasnjidatum = new Date();
      var mesec = danasnjidatum.getUTCMonth() + 1; //months from 1-12
      if (mesec < 10) {
        mesec = "0" + mesec;
      }
      var dan = danasnjidatum.getUTCDate();
      if (dan < 10) {
        dan = "0" + dan;
      }
      var godina = danasnjidatum.getUTCFullYear();
      danasnjidatum = godina + "-" + mesec + "-" + dan;

      console.log("dansnji datum " + danasnjidatum);
      console.log("datumOdrzavanja " + zurka.datum);

      if (danasnjidatum < zurka.datum) {
        zurkekojesesalju.push(zurka);
      }
    });
  });
  res.render("pregledzurki", {
    zurka: zurkekojesesalju,
    name: req.body.name,
  });
});

router.post("/filterkorisnika", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.ime_korisnika", req.body.ime_korisnika);
  User.find({ name: req.body.ime_korisnika }).then((users) => {
    console.log(users);
    res.render("korisnici", {
      users: users,
      name: req.user.name,
    });
  });
});

//Multer

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./slikeKorisnika/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:|\./g, "") + " - " + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

//Register

router.post("/register", upload.single("slikaKorisnika"), (req, res) => {
  const slikaKorisnika = req.file.path;
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !slikaKorisnika) {
    errors.push({ msg: "Popunite sve podatke." });
  }

  if (password !== password2) {
    errors.push({ msg: "Sifre se ne poklapaju" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Sifra mora biti duza od 6 karaktera" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      slikaKorisnika,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Vec postoji korisnik sa tim emailom." });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          slikaKorisnika,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          slikaKorisnika,
        });
        //pretvaranje sifre u bcrypt

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "Uspesno ste se registrovali.");
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Uspesno ste se odjavili.");
  res.redirect("/users/login");
});
router.post("/pozovi", (req, res, next) => {
  var id;
  console.log("Proso sam ovde");
  console.log(req.body);
  console.log("Provera selektovanog korisnika: " + req.body.id);
  console.log("Provera ulogovanog korisnika: " + req.body.korisnik);
  console.log("Provera selektovanog korisnika: " + req.body.name);
  if (req.body.name == req.body.korisnik) {
    req.flash("error_msg", "Ne mozete sami sebe pozvati na događaj");
    res.redirect("/dashboard");
    return;
  }
  User.findOne({ name: req.body.name }).then((user) => {
    id = user._id;
    User.findByIdAndUpdate(
      { _id: id },
      { routerData: { Poziv: true, userReq: req.body.korisnik } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log("---> Uspesno! <---");
          res.redirect("/dashboard");
        }
      }
    );
  });
});

router.post("/update", (req, res, next) => {
  var id;
  console.log("Provera korisnika: " + req.body.organizator);
  console.log("Id zurke kojoj je zahtev poslat: " + req.body.idzurke);
  if (req.body.name == req.body.organizator) {
    req.flash("error_msg", "Ne mozete reagovati na svoj dogadjaj");
    res.redirect("/dashboard");
    return;
  }
  User.findOne({ name: req.body.organizator }).then((user) => {
    id = user._id;
    User.findByIdAndUpdate(
      { _id: id },
      {
        routerData: { Dogadjaj: true, userReq: req.body.name },
        idZahtevaneZurke: req.body.idzurke,
      },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log("---> Uspesno! <---");
          res.redirect("/dashboard");
        }
      }
    );
  });
});

router.post("/changepassword", (req, res, next) => {
  const { passwordchange, passwordchange2, passwordchange3 } = req.body;
  console.log(passwordchange, passwordchange2, passwordchange3);
  var id;
  let errors = [];
  console.log(req.body.name);
  User.findOne({ name: req.body.name }).then((user) => {
    bcrypt.compare(passwordchange, user.password, (err, isMatch) => {
      if (err) {
        req.flash("error_msg", "Doslo je do greske prilikom promene lozinke.");
        res.redirect("/profile");
        return;
      }
      if (isMatch) {
        if (passwordchange2 !== passwordchange3) {
          req.flash("error_msg", "Unete sifre se ne poklapaju.");
          res.redirect("/profile");
          return;
        }
        if (passwordchange2.length < 6) {
          req.flash("error_msg", "Nova sifra mora biti duza od 6 karaktera.");
          res.redirect("/profile");
          return;
        }
        id = user._id;
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(passwordchange2, salt, (err, hash) =>
            User.findByIdAndUpdate({ _id: id }, { password: hash }, function (
              err,
              result
            ) {
              if (err) {
                req.flash(
                  "error_msg",
                  "Doslo je do greske prilikom menjanja lozinke."
                );
                return;
              } else {
                req.flash("success_msg", "Uspesno ste promenili lozinku.");
                res.redirect("/profile");
                return;
              }
            })
          )
        );
      } else {
        console.log("Niste uneli tacno trenutnu sifru.");
        req.flash("error_msg", "Niste uneli tacno trenutnu sifru.");
        res.redirect("/profile");
        return;
      }
    });
  });
});

router.post("/changeusername", (req, res, next) => {
  const { namechange } = req.body;
  console.log(namechange);
  var id;
  let errors = [];
  User.findOne({ name: namechange }).then((user) => {
    console.log(user);
    if (!user) {
      User.findOne({ name: req.body.name }).then((user) => {
        id = user._id;
        User.findByIdAndUpdate({ _id: id }, { name: namechange }, function (
          err,
          result
        ) {
          if (err) {
            console.log("Greska");
            res.redirect("/profile");
            return;
          } else {
            console.log("Uspesno");
            res.redirect("/profile");
            return;
          }
        });
      });
    } else {
      res.redirect("/profile");
      return;
    }
  });
});

router.post("/delete", (req, res) => {
  console.log(req.body);
  User.findByIdAndDelete({ _id: req.body.id }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.redirect(req.get("referer"));
    }
  });
});

router.post("/updateReverse", (req, res, next) => {
  var id;
  console.log("Update reverse");
  console.log("req.body", req.body);
  console.log("ime onoga ko je poslao zahtev " + req.user.routerData.userReq);
  console.log("Id zurke kojoj je zahtev poslat " + req.user.idZahtevaneZurke);
  console.log("User", req.user);
  User.findOne({ name: req.user.routerData.userReq }).then((user) => {
    User.findByIdAndUpdate(
      { _id: user._id },
      { routerData: { Odgovor: true } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          Zurka.findById({ _id: req.user.idZahtevaneZurke }).then((zurka) => {
            id = zurka._id;
            console.log(zurka);
            var novibroj = zurka.brojljudi - 1;
            Zurka.findByIdAndUpdate(
              { _id: id },
              {
                brojljudi: novibroj,
                $push: { listaLjudi: req.user.routerData.userReq },
              },
              function (err, result) {
                if (err) {
                  res.send(err);
                } else {
                  console.log("UPDATE JE ODGOVOR");
                }
              }
            );
          });
        }
      }
    );
  });

  User.findOne({ name: req.body.name }).then((user) => {
    id = user._id;
    User.findByIdAndUpdate(
      { _id: id },
      { routerData: { Dogadjaj: false } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  });
});

router.post("/updateOdgovor", (req, res, next) => {
  var id;
  User.findOne({ name: req.body.name }).then((user) => {
    id = user._id;
    User.findByIdAndUpdate(
      { _id: id },
      { routerData: { Odgovor: false } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  });
});

module.exports = router;
