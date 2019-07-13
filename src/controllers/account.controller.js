const mongoose      = require('mongoose');
const accountModel  = mongoose.model('accountModel');
let apiAccount         = {};

apiAccount.listByCont = async (req, res) => {

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

apiAccount.account = async (req, res) => {

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
    
        const newAccount = await accountModel.create({ idUser });
        
        if(!newAccount) {
            console.log(error.message);
            return res.status(400).json({ fail: error.message });
        };

        if(!newAccount) {
            console.log('Não foi possível criar a conta');
            return res.status(400).json({ fail: 'Não foi possível criar a conta' });
        };

        newAccount.idUser += mongoose.Types.ObjectId(idUser);
        newAccount.save();

        console.log('Conta criada');
        console.log(newAccount);
        return res.status(200).json(newAccount);
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message })
    }
}

apiAccount.listAccount = async (req, res) => {
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

apiAccount.transfer = async (req, res) => {

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
        accountOrigin.extract.push({
            status: `Removido ${transfer}`,
            date: Date.now()
        });
        accountOrigin.save();
        
        accountDest.balance += transfer;
        accountDest.extract.push({
            status: `Adicionado ${transfer}`,
            date: Date.now()
        });
        accountDest.save();

        console.log('Transferencia realizada');
        return res.status(200).json({ success: 'Tranferência realizada' });
        
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ fail: error.message });
    };
    
};

apiAccount.deposit = async (req, res) => {

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

module.exports = apiAccount;