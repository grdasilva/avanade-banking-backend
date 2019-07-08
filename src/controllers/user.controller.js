const mongoose      = require('mongoose');
const userModel     = mongoose.model('userModel');
const jwt           = require('jsonwebtoken');
const authSecret    = require('../config/auth.secret.json');
const bcrypt        = require('bcryptjs');
const validateCpf   = require('validar-cpf');
let apiUser        = {};

apiUser.list = async (req, res) => {

    try {
        const { page = 1 } = req.query;
        const users = await userModel.paginate(
            {},
            {
                sort: { createdAt: -1 },
                page, limit: 10
            }
        );

      if(users) {
        console.log('############# Users listadas ###############');
        res.status(200).json(users);
      };
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };  
};

apiUser.listByCont = async (req, res) => {

    try {
        const { conta } = req.params;

        await userModel.findOne({ conta }, (error, user) => {

            if(error) {
                console.log(error.message);
                res.status(400).json({ fail: error.message });
                return;
            }

            console.log('############# User encontrado ###############');
            console.log(user);
            console.log('#############################################');

            res.status(200).json(user);
        })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    }
};

apiUser.add = async (req, res) => {

    console.log(req.body);
    
    try {
        
        const { name, cpf, password  } = req.body;
        let passwordString = null;

        await userModel.create({ name, cpf, password }, (error, user) => {
    
            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            };
        
            if(!validateCpf(cpf.toString())) {
                console.log('cpf inválido');
                return res.status(400).json({ fail: 'cpf inválido' })
            };
    
            passwordString = password.toString().length;
            if(passwordString < 6) {
                console.log(passwordString);
                console.log('A senha precisar conter 6 caracteres númericos');
                return res.status(400).json({ fail: 'A senha precisar conter 6 caracteres númericos' });
            };
    
            if(passwordString > 6) {
                console.log(passwordString);  
                console.log('A senha não pode conter mais que 6 caracteres númericos');
                return res.status(400).json({ fail: 'A senha não pode conter mais que 6 caracteres númericos' });
            };
        
            // user.password = undefined;
            console.log('############# User criado ###############');
            console.log(user);
            console.log('#########################################');
    
            res.status(200).json(user)
            console.log('ok');
        })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    }
    
};

apiUser.transfer = async (req, res) => {

    console.log('Transferência');
    console.log(req.body);

    try {
        const { yourAccount, sendAccount, transfer } = req.body;

        let accountOrigin = await userModel.findOne({conta: yourAccount}, (error, user) => {

            if(error) {
                console.log(error.message);
                res.status(400).json({ fail: error.message });
                return;
            }

            if(!user) {
                console.log('############# Sua conta não foi encontrada ###############');
                return res.status(200).json({ fail: 'Sua conta não foi encontrada' });
            };

            return user;
        });

        let accountDest = await userModel.findOne({conta: sendAccount}, (error, user) => {

            if(error) {
                console.log(error.message);
                res.status(400).json({ fail: error.message });
                return;
            }

            if(!user) {
                console.log('############# Donta destinatária não foi encontrada ###############');
                return res.status(200).json({ fail: 'Donta destinatária não foi encontrada' });
            };

            return user;
        });

        if(!accountOrigin && !accountDest) {
            
            console.log('Não pode ser realizada a Transferencia');
            return res.status(200).json({ fail: 'Não pode ser realizada a Transferencia' });
        };

        if((accountOrigin.saldo - transfer) < 0) {
            
            console.log('Saldo insuficiente');
            return res.status(400).json({ fail: 'Saldo insuficiente' });
        };

        accountOrigin.saldo -= transfer;
        accountOrigin.save();
        
        accountDest.saldo += transfer;
        accountDest.save();

        console.log('Transferencia realizada');
        res.status(200).json({ success: 'Tranferência realizada' });
        
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };
    
};

apiUser.update = async (req, res) => {

    try {
      const { id }   = req.params;
      const { login, email } = req.body;

      await userModel.findOneAndUpdate({ _id: id }, req.body, (error, admin) => {

        if(error) {
            console.log(error.message);
            res.status(400).json({ fail: error.message });
            return;
        };

        if(login || email) {

            admin.set(req.body);
            admin.save();
    
            console.log('############# User alterado ###############');
            console.log(admin);
            console.log('############################################');
    
            req.io.emit('admin-update', admin);
            res.status(200).json(admin);
            return;
        }

        console.log('############# User com campo inválido ###############');
        res.status(400).json({ fail: 'O campo informado está inválido' });

      })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };
};

apiUser.changePassword = async (req, res, next) => {

    const token = req.headers['x-access-token'];
    const { id } = req.params;
    let { password, newPassword, confirmNewPassword } = req.body;
    
    console.log('############# Endereço necessita de autenticação ###############');
 
    if(!token) {
        
        console.log('############# Token não informado ###############');
        res.status(400).json({ fail: 'Token não informado' });
        return;
    };

    const decoded = jwt.verify(token, authSecret.secret, (error, decoded) => {

        if(error) {

            console.log('Token inválido');
            console.log(error.message);
            res.status(400).json({ fail: 'Token inválido' });
            return;
        };

        if(id != decoded.id) {
            console.log('############# Acesso não permitido ###############');    
            res.status(400).json({ fail: 'Acesso não permitido' });
            return;
        };

        return decoded;
    });

    if(!decoded) return;

    if(!password) {
        console.log('############# password não informado ###############');    
        res.status(400).json({ fail: 'password não informado' });
        return;
    };

    if(!newPassword) {
        console.log('############# newPassword não informado ###############');    
        res.status(400).json({ fail: 'newPassword não informado' });
        return;
    };

    if(!confirmNewPassword) {
        console.log('############# confirmNewPassword não informado ###############');    
        res.status(400).json({ fail: 'confirmNewPassword não informado' });
        return;
    };

    try {  
        const admin = await userModel.findOne({ _id: id }, (error) => {

            if(error) {
                console.log(error.message);
                res.status(400).json({ fail: error.message });
                return;
            };

        }).select(['login', 'password']);

        if(!await bcrypt.compare(password, admin.password)) {
            console.log('############# password informado não é válido ###############');        
            res.status(400).json({ fail: 'password informado não é válido' });
            return;
        };

        if(password == newPassword) {

            console.log('############# não pode usar a mesmo password ###############');
            res.status(400).json({ fail: 'não pode usar o mesmo password' });
            return;
        };

        if(newPassword != confirmNewPassword) {
            console.log('############# o newPassword não está igual ao confirmNewPassword  ###############');  
            res.status(400).json({ fail: 'o newPassword não está igual ao confirmNewPassword ' });
            return;
        };

        admin.password = newPassword;
        admin.save();

        console.log('############# password alterado ###############');
        res.status(200).json({ success: 'password alterado' });
    } catch (error) {

        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };

    next();
};

apiUser.remove = async (req, res) => {

    try {
      const { id } = req.params;

      await userModel.findOneAndRemove({ _id: id }, (error, user) => {

        if(error) {
            console.log(error.message);
            res.status(400).json({ fail: error.message });
            return;    
        };

        console.log('############# User removido ###############');
        console.log(user);
        console.log('############################################');

        res.status(200).json({ success: 'Usuário removido' });
      })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };
};

module.exports = apiUser;