const mongoose      = require('mongoose');
const userModel    = mongoose.model('userModel');
const jwt           = require('jsonwebtoken');
const authSecret    = require('../config/auth.secret.json');
const bcryptjs      = require('bcryptjs');
let apiLogin    = {};

apiLogin.login = async (req, res) => {

    try {
        const { cpf, password } = req.body;
        const user = await userModel.findOne({ cpf }).select('+password');

        if(!cpf) {
            console.log('cpf não informado');
            res.status(400).json({ fail: 'cpf não informado' });
            return;
        };

        if(!user) {
            console.log('############### cpf inválido ###############');
            res.status(400).json({fail: 'cpf inválido'});
            return;
        };

        if(!password) {
            console.log('password não informado');
            res.status(400).json({ fail: 'password não informado' });
            return;
        };
        console.log(user);
        

        // if(!await bcryptjs.compare(password, user.password)) {
        if(password !== user.password) {

            console.log('password incorreto');
            return res.status(400).json({ fail: 'password incorreto' });
        };

        if(user) {

            user.password = undefined;
    
            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name
                },
                authSecret.secret,
                {
                    expiresIn: 86400
                }
            );
            
            res.set('x-access-token', token);
            res.status(200).json({ user, token });
    
            console.log('############# Logado ###############');
            console.log(user);
            console.log('####################################');
        };

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message })
    };
};

apiLogin.requiredToken = async (req, res, next) => {

    console.log('############# Endereço necessita de autenticação ###############');
    const token = req.headers['x-access-token'];

    if(!token) {
        console.log('############# Token não informado ###############');
        res.status(400).json({ fail: 'Token não informado' });
        return;
    };

    jwt.verify(token, authSecret.secret, (error, decoded) => {

        if(error) {
            console.log(error.message);
            console.log('Token inválido');
            
            res.status(400).json({ fail: 'Token inválido' });
            return;
        };

        console.log('############# Acesso autorizado ###############');
        req.user = decoded.id;
        next();
    });
};


module.exports = apiLogin;