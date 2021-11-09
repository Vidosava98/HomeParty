const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
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

const Zurka = require("../models/Zurka");

router.post("/organizujzurku", upload.single("slikaZurke"), (req, res) => {
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
  console.log("datumOdrzavanja " + req.body.datum);

  if (danasnjidatum < req.body.datum) {
    const zurka = new Zurka({
      organizator: req.body.organizator,
      adresa: req.body.adresa,
      vreme: req.body.vreme,
      datum: req.body.datum,
      muzika: req.body.muzika,
      brojljudi: req.body.brojljudi,
      slikaZurke: req.file.path,
    });
    if (zurka.brojljudi <= 0) {
      req.flash("error_msg", "Ne mozete kreirati zurku bez ljudi.");
      res.redirect("/dashboard");
      return;
    }
    zurka
      .save()
      .then((zurka) => {
        res.redirect("/dashboard");
      })
      .catch((err) => console.log(err));
  } else {
    req.flash(
      "error_msg",
      "Ne možete kreirati žurku sa tim datumom, izaberite neki od predstojećih datuma."
    );
    res.redirect("/dashboard");
  }
});

router.post("/delete", (req, res) => {
  Zurka.findByIdAndDelete({ _id: req.body.id }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      console.log("Uspeo.");
      //res.redirect(req.get("referer"));
      return;
    }
  });
});

router.get("/svezurke", (req, res) => {
  Zurka.find()
    .then((zurke) => res.json(zurke))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.post("/zurka", (req, res) => {
  console.log("Ime ulogovanog korisnika", req.body.name);
  Zurka.findById({ _id: req.body._id })
    .then((zurka) => {
      console.log(zurka);
      if (zurka == null) {
        res.redirect("/dashboard");
      } else {
        res.render("zurka", {
          zurka: zurka,
          name: req.body.name,
        });
      }
    })
    .catch((err) => console.log(err));
});
router.post("/komentarisi", (req, res) => {
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
  console.log("datumOdrzavanja " + req.body.datum);

  //Provera da li je prisustvovao zurci

  let prisustvovao = false;
  Zurka.findById({_id: req.body._id})
  .then((zurka)=>{
    zurka.listaLjudi.forEach(posetilac => {
      if(posetilac === req.body.name){
      prisustvovao= true;
      console.log(posetilac + prisustvovao);
      }
      if (danasnjidatum > req.body.datum && prisustvovao=== true) {
        const komentar = { name: req.body.name, comment: req.body.comment };
        Zurka.findByIdAndUpdate(
          { _id: req.body._id },
          { $push: { komentari: komentar } }
        )
          .then((zurka) => {
            if (zurka) {
              res.render("zurka", {
                zurka: zurka,
                name: req.body.name,
              });
            } else {
              res.redirect("/dashboard");
            }
          })
    
          .catch((err) => console.log(err));
      } else {
        return;
      }
    });
  }).catch((err)=>console.log(err));
  
  
});
module.exports = router;
