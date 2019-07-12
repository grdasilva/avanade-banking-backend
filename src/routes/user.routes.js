const userController = require('../controllers/user.controller');
// const userController = require('../controllers/_login.controller');

module.exports = app => {

    app
        .route('/v1/user')
        .get(userController.list)
        .post(userController.add)

    app
        .route('/v1/user/:id')
        .delete(userController.remove)

    app
        .route('/v1/sigin')
        .post(userController.login)
};