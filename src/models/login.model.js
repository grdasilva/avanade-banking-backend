// const mongoose = require('mongoose');
// const bcryptjs = require('bcryptjs');
// const paginate = require('mongoose-paginate');
// const loginModel    = new mongoose.Schema({

//     cpf: {
//         required: true,
//         type: Number
//     },
//     password: {
//         required: true,
//         type: Number
//     }
// },
// {
//     timestamps: true
// });

// // user.plugin(paginate);

// // user.pre('save', async function(next) {
    
// //     const hash = await bcryptjs.hash(this.password, 10);

// //     this.password = hash;
// //     next();
// // });

// mongoose.model('loginModel', loginModel);