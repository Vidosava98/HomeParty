const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required: true
    },
    date:
    {
        type: Date,
        default: Date.now
    },
    idZahtevaneZurke:
    {
        type: String
    },
    slikaKorisnika:
    {
        type: String,
        required: true
    },
    routerData:{
        'Dogadjaj':{
            type: Boolean,
            default: false
        },
        'userReq':{
            tpye:String
        },
        'Odgovor':{
            type: Boolean,
            default: false
        },
        'Poziv':{
            type: Boolean,
            default: false
        }
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;