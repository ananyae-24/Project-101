const express = require("express");
const auth_controller=require("../controllers/auth-controller")
const problem_controler=require("../controllers/problems-controller")
const router = express.Router();
router.use(auth_controller.isProtected);
router.route("/").post(problem_controler.makeproblem).get(problem_controler.getallproblem)
router.route("/:id").patch(problem_controler.updateproblem)
router.route("/admin/:id").patch(auth_controller.restrictTo(["admin"]),problem_controler.problemresolved)
module.exports = router;