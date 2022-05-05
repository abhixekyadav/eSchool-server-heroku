const express = require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin } = require("../middlewares");
// controller
const {
  create,
  read,
  update,
  remove,
  categories,
} = require("../controllers/category");

router.post("/category", requireSignin, isAdmin, create);
router.get("/category", read);
router.put("/category/:slug", requireSignin, isAdmin, update);
router.delete("/category/:slug", requireSignin, isAdmin, remove);
router.get("/categories", categories);

module.exports = router;
