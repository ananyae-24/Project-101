const express = require("express");
const covid_controller=require("../controllers/covid-controller")
const router = express.Router();
router.route('/').get(covid_controller.getnotification).post(covid_controller.uploadmultipleimages,covid_controller.reqbodyupadate,covid_controller.makenotification);
router.route("/:token&:number").get(covid_controller.activateaccount_no);
module.exports = router;