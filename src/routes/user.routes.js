const userController = require('../controllers/user.controller');
const loginController = require('../controllers/login.controller');

module.exports = app => {

    app
        .route('/user')
        .get(userController.list)
        .put(loginController.requiredToken, userController.deposit)
        .post(userController.add)

    app
        .route('/account')
        .post(userController.account)

    app
        .route('/accounts')
        .get(userController.listAccount)

    app
        .route('/user/:account')
        .get(loginController.requiredToken, userController.listByCont)

    app
        .route('/user/transfer')
        .put(loginController.requiredToken, userController.transfer)

    app
        .route('/user/:id')
        .delete(userController.remove)
};