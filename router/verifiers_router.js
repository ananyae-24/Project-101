const express = require("express");
const verifier_controller=require("../controllers/verifiers-controller");
const router = express.Router();
router.route('/').get(verifier_controller.getAll).post(verifier_controller.makeverifier);
router.route("/:token&:number").get(verifier_controller.activateaccount_no);
module.exports = router;