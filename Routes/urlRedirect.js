const express = require("express");
const User = require("../Models/urlSchema.js");

const router = express.Router();

router.route("/:code").get(async (req, res) => {
  let code = req.params.code;
  try {
    const url = await User.findOne({
      urlData: { $elemMatch: { urlCode: code } },
    });

    if (url) {
      let x = url.urlData;
      let index = x.findIndex((x) => x.urlCode === code);
      return res.redirect(url.urlData[index].longUrl);
    } else {
      return res.status(404).json("No URL Found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
