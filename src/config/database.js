const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://atlas:atlas@cluster0-bdoft.mongodb.net/test?retryWrites=true&w=majority', { 

    useNewUrlParser: true,
    useCreateIndex :  true,
});

// mongoose.connect('mongodb://localhost/reais-jobs', { 
//     useNewUrlParser: true,
//     useCreateIndex :  true,
// });

mongoose.connection.on('connected', function(){

    console.log('conectado ao Mongo');
});

mongoose.connection.on('error', function(erro) {

    console.log('Erro na conecção ' + erro);
});

mongoose.connection.on('disconnected', function(){

    console.log('Desconectado do Mongo');
});

process.on('SIGINT', function () {
    
    mongoose.connection.close(function () {
    
        console.log('Conexão finalizada pelo terminado da aplicação');
        process.exit(0);
    });
});