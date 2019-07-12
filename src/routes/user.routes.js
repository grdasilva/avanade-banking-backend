const userController = require('../controllers/user.controller');
// const userController = require('../controllers/_login.controller');

module.exports = app => {

    app
        .route('/v1/user')
        .get(userController.list)
        .put(userController.requiredToken, userController.deposit)
        .post(userController.add)

    app
        .route('/v1/account')
        .post(userController.account)

    app
        .route('/v1/accounts')
        .get(userController.listAccount)

    app
        .route('/v1/user/:account')
        .get(userController.requiredToken, userController.listByCont)

    app
        .route('/v1/user/transfer')
        .put(userController.requiredToken, userController.transfer)

    app
        .route('/v1/user/:id')
        .delete(userController.remove)

    app
        .route('/v1/sigin')
        .post(userController.login)
};