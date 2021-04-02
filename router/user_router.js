const express = require("express");
const auth_controller=require("../controllers/auth-controller")
const user_controler=require("../controllers/user-controller")
const router = express.Router();
router.route('/signup').post(auth_controller.signup);
router.route('/activate/:token&:email').patch(auth_controller.activateaccount)
router.route('/activate_no/:token&:number').patch(auth_controller.activateaccount_no)
router.route('/verifynumber').post(auth_controller.activatenumber);
router.route('/login').get(auth_controller.login);
router.route('/forgetpasswordotp').get(auth_controller.forgetpassword);
router.route('/forgetpassword').patch(user_controler.changepassword);
///////////////////////////
router.route("/details/:id").get(user_controler.getUser).patch(user_controler.updateuser);
router.route("/").get(user_controler.AllUser);
module.exports = router;