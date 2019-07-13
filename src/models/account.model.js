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
    extract : {
        type: Array,
        default: [],
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

    if(!this.idUser) {
        console.log('não tem idUSer');  
        return
    };

    if(this.account.length > 0) {
        console.log('já tenho conta cadastrada não devo adicionar outra');
        return;
    }

    console.log('Gerei o número da conta')
    const numberAccount = Math.floor(Math.random() * 100000) + '-' + Math.floor(Math.random() * 10)

    this.account = numberAccount;
    next();
});

mongoose.model('accountModel', accountModel);