const express = require("express"),
    { cache } = require("../middleware/cache"),
    router = express.Router();

router.get("/about", cache(14), function (req, res) {
    res.render("index/about", { locals });
});

router.get("/help", cache(14), function (req, res) {
    res.render("index/help", { locals });
});

router.get("/legal", cache(14), function (req, res) {
    res.render("index/legal", { locals });
});

router.get("/privacy", cache(14), function (req, res) {
    res.render("index/privacy", { locals });
});

router.post("/changelang", cache(14), function (req, res) {
    res.cookie("lang", req.body.lang);
    res.redirect("back");
});

module.exports = router;