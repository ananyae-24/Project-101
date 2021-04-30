const express = require("express");
const covid_controller=require("../controllers/covid-controller")
const router = express.Router();
router.route('/').get(covid_controller.getnotification).post(covid_controller.uploadmultipleimages,covid_controller.reqbodyupadate,covid_controller.makenotification);
router.route("/:token&:number").get(covid_controller.activateaccount_no);
router.route('/:id').delete(covid_controller.deletenotification).put(covid_controller.activatenotification);
router.route("/nootp").post(covid_controller.uploadmultipleimages,covid_controller.reqbodyupadate,covid_controller.makenotificationwithoutotp)
module.exports = router;