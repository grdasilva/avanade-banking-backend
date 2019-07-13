const userController = require('../controllers/user.controller');

module.exports = app => {

    app
        .route('/v1/user')
        .get(userController.list)
        .post(userController.add)

    app
        .route('/v1/user/:id')
        .delete(userController.remove)

    app
        .route('/v1/user/sigin')
        .post(userController.login)

};