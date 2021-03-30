const express = require("express");
const auth_controller=require("../controllers/auth-controller")
const router = express.Router();
router.route('/signup').get(auth_controller.signup);
router.route('/activate/:token&:email').get(auth_controller.activateaccount)
router.route('/activate_no/:token&:number').get(auth_controller.activateaccount_no)
router.route('/verifynumber').get(auth_controller.activatenumber);
module.exports = router;