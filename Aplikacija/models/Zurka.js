const mongoose = require('mongoose');

const KomentarSchema= new mongoose.Schema({
    name: 
    {
        type: String,
        required: true
    },
    comment: 
    {
        type: String,
        required: true
    }
})

const ZurkaSchema = new mongoose.Schema({
    organizator:
    {
        type: String,
        required: true
    },
    adresa:
    {
        type: String,
        required: true
    },
    vreme:
    {
        type: String,
        required: true
    },
    datum:
    {
        type: String,
        required: true
    },
    muzika:
    {
        type: String,
        required: true
    },
    brojljudi:
    {
        type: Number,
        required: true
    },
    slikaZurke:
    {
        type: String,
        required: true
    },
    komentari: [KomentarSchema],
    listaLjudi:[String]
});

const Zurka = mongoose.model('Zurka', ZurkaSchema);

module.exports = Zurka;