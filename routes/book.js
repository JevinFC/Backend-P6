const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const { upload, processImage } = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", upload, processImage, bookCtrl.getAllBook);
router.post("/", auth, upload, processImage, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.get("/bestrating", bookCtrl.BestRatedBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, upload, processImage, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
