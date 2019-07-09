const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
// const bcryptjs = require('bcryptjs');
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

// userModel.pre('save', async function(next) {
    
//     if(!this.password) return;

//     const hash = await bcryptjs.hash(this.password, 10);

//     this.password = hash;
//     next();
// });

mongoose.model('userModel', userModel);