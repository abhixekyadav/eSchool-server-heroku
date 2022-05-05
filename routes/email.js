const express = require("express");
const router = express.Router();

// middlewares
const { requireSignin } = require("../middlewares");
// controller
const { supportEmail } = require("../controllers/email");

router.post("/contact-support", requireSignin, supportEmail);

module.exports = router;
