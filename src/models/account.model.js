const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const accountModel = new mongoose.Schema({

    agency: {
        type: String,
        default: '022'
    },
    account: {
        type: String,
        default: ''
    },
    balance: {
        type: Number,
        default: 0,
    },
    idUser: {
        required: true,
        type: mongoose.Schema.Types.ObjectId, ref: 'userModel'
    }
}, {
    timestamps: true
})

accountModel.plugin(paginate);

accountModel.pre('save', async function(next) {

    if(!this.idUser) return;

    console.log('Usei o pre save conta')

    const numberAccount = Math.floor(Math.random() * 100000) + '-' + Math.floor(Math.random() * 10)

    this.account = numberAccount;
    next();
});

mongoose.model('accountModel', accountModel);