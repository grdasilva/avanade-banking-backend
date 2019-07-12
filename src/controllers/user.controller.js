const mongoose      = require('mongoose');
const userModel     = mongoose.model('userModel');
const accountModel  = mongoose.model('accountModel');
const validateCpf   = require('validar-cpf');
const bcryptjs      = require('bcryptjs');
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

apiUser.listByCont = async (req, res) => {

    console.log('Busncando por conta');
    
    try {
        const { account } = req.params;

        await accountModel.findOne({ account },  (error, account) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            console.log('############# User encontrado ###############');
            console.log(account);
            console.log('#############################################');

            return res.status(200).json(account);
        }).populate({ path: 'accountModel', select: ['agency', 'account', 'balance']})
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    }
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

apiUser.account = async (req, res) => {

    console.log('cadastro de conta');
    
    try {
        const { idUser } = req.body;
    
        if(!idUser) {
            console.log('idUser não foi informado');
            return res.status(400).json({ fail: 'idUser não foi informado' });
        }

        const accountWithUser = await accountModel.find({ idUser }, (error, account) => {
            
            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            };

            return account
        });

        
        if(accountWithUser.length > 0) {
             
            console.log('usuário já possui uma conta vinculada');
            return res.status(400).json({ fail: 'Usuário já possui uma conta cadastrada' })
        };
    
        await accountModel.create({ idUser }, (error, newAccount) => {
            
            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            };
    
            if(!newAccount) {
                console.log('Não foi possível criar a conta');
                return res.status(400).json({ fail: 'Não foi possível criar a conta' });
            };
    
            console.log('antes');
            console.log(newAccount.account);
            
            newAccount.idUser += idUser;
            // newAccount.account = numberAccount;
            newAccount.save();

            console.log('depois');
            console.log(newAccount.account);
    
            console.log('Conta criada');
            console.log(newAccount);
            return res.status(200).json(newAccount);
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message })
    }
}

apiUser.listAccount = async (req, res) => {
    console.log('listando as contas');
    
    try {
        const { page = 1 } = req.query;
        const accounts = await accountModel.paginate(
            {},
            { 
                sort: { createdAt: -1 },
                populate: {
                    path: 'idUser',
                    select: ['name', 'cpf'],
                },
                page, limit: 10
            },
            
        )

        if(!accounts) {
            console.log('contas não encontradas');
            return res.status(400).json({ fail: 'Contas não encontradas' });
        };

        console.log('############# Users listadas ###############');
        return res.status(200).json(accounts);
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };
}

apiUser.transfer = async (req, res) => {

    console.log('Transferência');

    try {
        const { yourAccount, sendAccount, transfer } = req.body;

        let accountOrigin = await accountModel.findOne({account: yourAccount}, (error, account) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            if(!account) {
                console.log('############# Sua conta não foi encontrada ###############');
                return res.status(400).json({ fail: 'Sua conta não foi encontrada' });
            };

            return account;
        });

        let accountDest = await accountModel.findOne({account: sendAccount}, (error, account) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            if(!account) {
                console.log('############# Conta destinatária não foi encontrada ###############');
                return res.status(400).json({ fail: 'Conta destinatária não foi encontrada' });
            };

            return account;
        });

        if(!accountOrigin || !accountDest) return

        if((accountOrigin.balance - transfer) < 0) {
            
            console.log('Saldo insuficiente');
            return res.status(400).json({ fail: 'Saldo insuficiente' });
        };

        accountOrigin.balance -= transfer;
        accountOrigin.save();
        
        accountDest.balance += transfer;
        accountDest.save();

        console.log('Transferencia realizada');
        return res.status(200).json({ success: 'Tranferência realizada' });
        
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };
    
};

apiUser.deposit = async (req, res) => {

    console.log('deposito');
    
    try {
        const { account, value } = req.body;

        if(!account) {
            console.log('############# Conta destinatária não foi informada ###############');
            return res.status(200).json({ fail: 'Conta destinatária não foi informada' });
        };

        if(!value) {
            console.log('############# Valor do deposíto não foi informado ###############');
            return res.status(200).json({ fail: 'Valor do deposíto não foi informado' });
        };

        await accountModel.findOneAndUpdate({ account }, value, (error, accountUser) => {

            if(error) {
                console.log(error.message);
                return res.status(400).json({ fail: error.message });
            }

            if(!accountUser) {
                console.log('############# Conta destinatária não foi encontrada ###############');
                return res.status(200).json({ fail: 'Conta destinatária não foi encontrada' });
            };

            accountUser.balance += value;
            accountUser.save();

            console.log('############# Deposíto realizado com sucesso ###############');
            return res.status(200).json({ success: 'Deposíto realizado com sucesso' })
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    }
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

module.exports = apiUser;