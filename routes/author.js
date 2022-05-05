const express = require("express");

const router = express.Router();

// middlewares
const { requireSignin } = require("../middlewares");
// controller
const { makeAuthor, currentAuthor } = require("../controllers/author");

router.post("/make-author", requireSignin, makeAuthor);
router.get("/current-author", requireSignin, currentAuthor);

module.exports = router;
