const express = require("express");
const sos_controller=require("../controllers/sos_controller")
const router = express.Router();
router.route('/').get(sos_controller.getSOS).post(sos_controller.SOSmake);
router.route("/:id").delete(sos_controller.delete);
module.exports = router;