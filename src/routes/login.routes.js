const loginController = require('../controllers/login.controller');

module.exports = app => {

    app
        .route('/sigin')
        .post(loginController.login)
};