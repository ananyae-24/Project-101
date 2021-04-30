const express = require("express");
const faq_controller=require("../controllers/faq_controller")
const router = express.Router();
router.route('/').get(faq_controller.get).post(faq_controller.make);
router.route("/:id").patch(faq_controller.answer).delete(faq_controller.delete);
module.exports = router;