const mongoose      = require('mongoose');
const userModel    = mongoose.model('userModel');
const jwt           = require('jsonwebtoken');
const authSecret    = require('../config/auth.secret.json');
const bcryptjs      = require('bcryptjs');
let apiLogin    = {};

apiLogin.login = async (req, res) => {

    try {
        const { login, password } = req.body;
        const user = await userModel.findOne({ login }).select('+password');

        if(!login) {
            console.log('login não informado');
            res.status(400).json({ fail: 'login não informado' });
            return;
        };

        if(!user) {
            console.log('############### login inválido ###############');
            res.status(400).json({fail: 'login inválido'});
            return;
        };

        if(!password) {
            console.log('password invalído');
            res.status(400).json({ fail: 'password invalído' });
            return;
        };

        if(!await bcryptjs.compare(password, user.password)) {
            
            console.log('password incorreto');
            res.status(400).json({ fail: 'password incorreto' });
            return;
        };

        if(user) {

            user.password = undefined;
    
            const token = jwt.sign(
                {
                    id: user._id,
                    login: user.login,
                    email: user.email
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