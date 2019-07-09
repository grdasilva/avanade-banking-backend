const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const userModel = new mongoose.Schema({

    name: {
        required: true,
        type: String
    },
    cpf: {
        required: true,
        type: Number,
        unique: true
    },
    account: {
        type: String,
        default: String
    },
    balance: {
        type: Number,
        default: 0,
    },
    password: {
        required: true,
        type: String,
        select: false
    }
}, {
    timestamps: true
})

userModel.plugin(paginate);

mongoose.model('userModel', userModel);