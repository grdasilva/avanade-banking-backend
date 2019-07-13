const mongoose      = require('mongoose');
const userModel     = mongoose.model('userModel');
const validateCpf   = require('validar-cpf');
const bcryptjs      = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const authSecret    = require('../config/auth.secret.json');
let apiUser         = {};

apiUser.list = async (req, res) => {

    console.log('Listando todos');
    
    try {
        const { page = 1 } = req.query;
        const users = await userModel.paginate(
            {},
            { 
                sort: { createdAt: -1 },
                populate: {
                    path: 'accountModel',
                    select: ['agency', 'account', 'balance'],
                },
                page, limit: 10
            },
            
        )

      if(users) {
        console.log('############# Users listadas ###############');
        return res.status(200).json(users);
      };
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };  
};

apiUser.add = async (req, res) => {

    console.log('Cadastro');
    
    try {
        const { name, cpf, password  } = req.body;
        const cpfString = cpf.toString();

        if(!validateCpf(cpfString)) {
            console.log('cpf inválido');
            return res.status(400).json({ fail: 'cpf inválido' })
        };

        if(password.length < 6) {
            console.log(password);
            console.log('A senha precisar conter 6 caracteres númericos');
            return res.status(400).json({ fail: 'A senha precisar conter 6 caracteres númericos' });
        };
    
        if(password.length > 6) {
            console.log(password);  
            console.log('A senha não pode conter mais que 6 caracteres númericos');
            return res.status(400).json({ fail: 'A senha não pode conter mais que 6 caracteres númericos' });
        };
        
        await userModel.create({ name, cpf, password }, (error, user) => {
    
            if(error) {
                console.log(error.message);
                
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            };

            if(!user) {
                console.log('Ocorreu algum erro durante a criado do usuário');
                return res.status(400).json({ fail: 'Ocorreu algum erro durante a criado do usuário' })
            };

            user.password = undefined;
            console.log('############# Usuário criado ###############');
            console.log(user);
            console.log('#########################################');
            return res.status(200).json(user);
        });

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };
};

apiUser.remove = async (req, res) => {

    console.log('Removendo');
    
    try {
      const { id } = req.params;

      await userModel.findOneAndRemove({ _id: id }, (error, user) => {

        if(error) {
            console.log(error.message);
            return res.status(400).json({ fail: error.message });
        };

        console.log('############# Usuário removido ###############');
        return res.status(200).json({ success: 'Usuário removido' });
      })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };
};

apiUser.login = async (req, res) => {

    console.log('login');
    
    try {
        const { cpf, password } = req.body;
        
        if(!cpf) {
            console.log('cpf não informado');
            res.status(400).json({ fail: 'cpf não informado' });
            return;
        };

        if(!password) {
            console.log('password não informado');
            res.status(400).json({ fail: 'password não informado' });
            return;
        };

        const user = await userModel.findOne({ cpf }).select('+password');

        if(!user) {
            console.log('############### cpf inválido ###############');
            res.status(400).json({fail: 'cpf inválido'});
            return;
        };

        if(!await bcryptjs.compare(password, user.password)) {
            
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

apiUser.requiredToken = async (req, res, next) => {

    console.log('############# Endereço necessita de autenticação ###############');
    const token = req.headers['x-access-token'];

    if(!token) {
        console.log('############# Token não informado ###############');
        return res.status(400).json({ fail: 'Token não informado' });
    };

    jwt.verify(token, authSecret.secret, (error, decoded) => {

        if(error) {

            console.log(error.message);
            console.log('Token inválido');
            return res.status(400).json({ fail: 'Token inválido' });
        };

        console.log('############# Acesso autorizado ###############');
        req.user = decoded.id;
        next();
    });
};

module.exports = apiUser;