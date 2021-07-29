const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

const url = process.env.MONGO_URL;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected"));

app.use(express.json());
app.use(cookieParser());
// app.use(csurf({ cookie: true }));
app.use(cors({ origin: true, credentials: true }));

app.use("/api/url", require("./Routes/urlShortener.js"));
app.use("/api/url", require("./Routes/signup-signin.js"));
app.use("/", require("./Routes/urlRedirect.js"));

app.get("/", (request, response) => {
  response.send("WELCOME To Url Parser");
});

app.listen(PORT, () => console.log("Server STarted!!!"));
