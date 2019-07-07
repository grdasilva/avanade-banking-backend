const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const paginate = require('mongoose-paginate');
const user    = new mongoose.Schema({

    cpf: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String,
        select: false
    }
},
{
    timestamps: true
});

user.plugin(paginate);

user.pre('save', async function(next) {
    
    const hash = await bcryptjs.hash(this.password, 10);

    this.password = hash;
    next();
});

mongoose.model('user', user);