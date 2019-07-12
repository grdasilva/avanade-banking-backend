const userController = require('../controllers/user.controller');

module.exports = app => {

    app
        .route('/v1/account/deposit')
        .put(userController.requiredToken, userController.deposit)

    app
        .route('/v1/account')
        .post(userController.account)

    app
        .route('/v1/accounts')
        .get(userController.listAccount)

    app
        .route('/v1/account/:account')
        .get(userController.requiredToken, userController.listByCont)

    app
        .route('/v1/transfer')
        .put(userController.requiredToken, userController.transfer)

    app
        .route('/v1/user/:id')
        .delete(userController.remove)

    app
        .route('/v1/sigin')
        .post(userController.login)
};