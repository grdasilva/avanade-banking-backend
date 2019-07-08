const mongoose      = require('mongoose');
const userModel     = mongoose.model('userModel');
const jwt           = require('jsonwebtoken');
const authSecret    = require('../config/auth.secret.json');
const bcrypt        = require('bcryptjs');
// const validateCpf   = require('validar-cpf');
let apiUser        = {};

function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000") return false;
     
  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
   
  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}

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
        
            if(!TestaCPF(cpf.toString())) {
                console.log('cpf inválido');
                return res.status(400).json({ fail: 'cpf inválido' })
            };
    
            if(password) {

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

        let accountOrigin = await userModel.findOne({account: yourAccount}, (error, user) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            if(!user) {
                console.log('############# Sua conta não foi encontrada ###############');
                return res.status(200).json({ fail: 'Sua conta não foi encontrada' });
            };

            return user;
        });

        let accountDest = await userModel.findOne({account: sendAccount}, (error, user) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            if(!user) {
                console.log('############# Conta destinatária não foi encontrada ###############');
                return res.status(200).json({ fail: 'Conta destinatária não foi encontrada' });
            };

            return user;
        });

        if(!accountOrigin || !accountDest) {
            
            console.log('Não pode ser realizada a Transferencia');
            return res.status(200).json({ fail: 'Não pode ser realizada a Transferencia' });
        };

        if((accountOrigin.balance - transfer) < 0) {
            
            console.log('Saldo insuficiente');
            return res.status(400).json({ fail: 'Saldo insuficiente' });
        };

        accountOrigin.balance -= transfer;
        accountOrigin.save();
        
        accountDest.balance += transfer;
        accountDest.save();

        console.log('Transferencia realizada');
        res.status(200).json({ success: 'Tranferência realizada' });
        
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ fail: error.message });
    };
    
};

apiUser.deposit = async (req, res) => {

    console.log('deposito');
    
    try {
        const { account, value } = req.body;

        await userModel.findOneAndUpdate({ account }, value, (error, user) => {

            if(error) {
                console.log(error.message);
                res.status(400).json({ fail: error.message });
                return;
            }

            if(!user) {
                console.log('############# Conta destinatária não foi encontrada ###############');
                return res.status(200).json({ fail: 'Conta destinatária não foi encontrada' });
            };

            if(!value) {
                console.log('############# Valor do deposíto não foi informado ###############');
                return res.status(200).json({ fail: 'Valor do deposíto não foi informado' });
            };

            user.balance += value;
            user.save();

            console.log('############# Deposíto realizado com sucesso ###############');
            return res.status(200).json({ success: 'Deposíto realizado com sucesso' })
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    }
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