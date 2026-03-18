const express = require("express");

const {
	registerUser,
	loginUser,
	getAdvisorUsers,
	createAdvisorByAdmin,
} = require("../controllers/authController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/advisors", getAdvisorUsers);
router.post("/admin/create-advisor", protect, requireRole("admin"), createAdvisorByAdmin);

module.exports = router;
