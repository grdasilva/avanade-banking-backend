const userController = require('../controllers/user.controller');
const loginController = require('../controllers/login.controller');

module.exports = app => {

    app
        .route('/user')
        .get(userController.list)
        .post(userController.add)

    app
        .route('/user/:conta')
        .get(userController.listByCont)

    app
        .route('/user/transfer')
        .put(userController.transfer)

    app
        .route('/user/:id')
        .delete(userController.remove)
};