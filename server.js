const express = require("express");
const path = require("path");

const app = express()

app.use(express.static(path.join(__dirname + "public")));

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Listening on port ${PORT}!`);
})