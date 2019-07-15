const mongoose           = require('mongoose');
const userModel          = mongoose.model('userModel');
// const accountModel       = mongoose.model('accountModel');
const validateCpf        = require('validar-cpf');
const bcryptjs           = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const authSecret         = require('../config/auth.secret.json');
const ValidationContract = require('../helpers/fluent-validator');
let apiUser              = {};

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
    let contract = new ValidationContract();
    console.log('Cadastro');
    
    try {
        const { name, cpf, password  } = req.body;
        const cpfString = cpf.toString();

        if(!validateCpf(cpfString)) {
            console.log('cpf inválido');
            return res.status(400).json({ fail: 'cpf inválido' })
        };

        contract.hasMinLen(password , 6 , 'A senha deve conter pelo menos 6 caracteres');
        contract.hasMaxLen(password , 6 , 'A senha deve conter no maximo 6 caracteres');
        
          // Se os dados forem válidos
        if (!contract.isValid()) {
            res.status(400).send(contract.errors()).end();
            return;
        }
        
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
            // logModel.operation.push({
            //     Operação: `Criação de usuário`,
            //     date: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} as ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}s`
            // });
            return res.status(201).json(user);
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
    
    let contract = new ValidationContract();
    console.log('login');
    
    try {
        const { cpf, password } = req.body;
        
        contract.isRequired(cpf, 'O CPF é obrigatório');
        contract.isRequired(password, 'O CPF é obrigatório');

        // Se os dados forem válidos
        if (!contract.isValid()) {
            res.status(400).send(contract.errors()).end();
            return;
        }

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
        return res.status(401).json({ fail: 'Acesso não autorizado, token requirido' });
    };

    jwt.verify(token, authSecret.secret, (error, decoded) => {

        if(error) {

            console.log(error.message);
            console.log('Token inválido');
            return res.status(401).json({ fail: 'Acesso não autorizado, token inválido' });
        };

        console.log('############# Acesso autorizado ###############');
        req.user = decoded.id;
        next();
    });
};


module.exports = apiUser;