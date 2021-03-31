const express = require("express");
const auth_controller=require("../controllers/auth-controller")
const user_controler=require("../controllers/user-controller")
const router = express.Router();
router.route('/signup').get(auth_controller.signup);
router.route('/activate/:token&:email').get(auth_controller.activateaccount)
router.route('/activate_no/:token&:number').get(auth_controller.activateaccount_no)
router.route('/verifynumber').get(auth_controller.activatenumber);
router.route('/login').get(auth_controller.login);
router.route('/forgetpasswordotp').get(auth_controller.forgetpassword);
router.route('/forgetpassword').get(user_controler.changepassword);
module.exports = router;