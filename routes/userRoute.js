const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/create-user", userController.createUser);
router.post("/user-login", userController.userLogin);
router.post("/user-logout", authenticate, userController.logoutUser);
router.get("/get-single-user/:id", userController.getUserById);
module.exports = router;
