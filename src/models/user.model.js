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
    conta: {
        type: String,
        default: Math.floor(Math.random() * 100000) + '-' + Math.floor(Math.random() * 10),
        select: true
    },
    saldo: {
        type: Number,
        default: 0,
    },
    password: {
        required: true,
        type: Number,
        select: false
    }
})

userModel.plugin(paginate);

// userModel.pre('save', async function(next) {
    
//     const hash = await bcryptjs.hash(this.password, 10);

//     this.password = hash;
//     next();
// });

mongoose.model('userModel', userModel);