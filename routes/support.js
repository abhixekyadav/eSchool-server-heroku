const express = require("express");

const router = express.Router();

// middlewares
const { requireSignin } = require("../middlewares");
// controller
const { issues, markResolved, removeIssue } = require("../controllers/support");

router.get("/user/issues", requireSignin, issues);
router.put("/user/issue/mark-resolved", requireSignin, markResolved);
router.delete("/user/issue/delete/:issueId", requireSignin, removeIssue);

module.exports = router;
