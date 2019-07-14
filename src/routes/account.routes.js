const userController = require('../controllers/user.controller');
const accountController = require('../controllers/account.controller')

module.exports = app => {

    
    app
        .route('/v1/account/:idUser')
        .post(accountController.add)
    
    app
        .route('/v1/accounts')
        .get(accountController.listAccount)

    app
        .route('/v1/account/:account')
        .get(userController.requiredToken, accountController.listByCont)
    
    app
        .route('/v1/account/deposit/:account')
        .put(userController.requiredToken, accountController.deposit)

    app
        .route('/v1/account/transfer/:yourAccount/:sendAccount')
        .put(userController.requiredToken, accountController.transfer)
};