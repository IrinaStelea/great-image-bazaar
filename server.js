const path = require("path");
const express = require("express");
const app = express();
const PORT = 8080;

const db = require("./db.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

//route for images
app.get("/images", (req, res) => {
    db.getImages()
        .then((result) => {
            res.json(result.rows);
            console.log("data is", result.rows);
        })
        .catch((err) => console.log("error in get images", err));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
