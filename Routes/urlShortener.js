const express = require("express");
const validUrl = require("valid-url");
const shortid = require("shortid");
const User = require("../Models/urlSchema.js");

const router = express.Router();

const baseUrl = process.env.BASE_URL;

// Url Shortener
router.route("/shorten").post(async (request, response) => {
  const { longUrl, id } = request.body;

  if (!validUrl.isUri(baseUrl)) {
    return response.status(401).json("Invalid base URL");
  }

  const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    try {
      let url = await User.findOne({
        _id: id,
      });

      const shortUrl = baseUrl + "/" + urlCode;

      url.urlData.push({
        longUrl,
        shortUrl,
        urlCode,
        date: new Date(),
      });
      await url.save();
      response.status(200).send({ shortUrl });
    } catch (err) {
      console.log(err);
      response.status(500).json("Server Error");
    }
  } else {
    response.status(401).json("Invalid longUrl");
  }
});

module.exports = router;
