const path = require("path");
const express = require("express");
const app = express();
const s3 = require("./s3"); //s3 will be an object, but do not destructure it here
const { uploader } = require("./middleware");
const db = require("./db.js");
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/images", (req, res) => {
    db.getImages()
        .then((result) => {
            res.json(result.rows);
            console.log("data is", result.rows);
        })
        .catch((err) => console.log("error in get images", err));
});

app.get("*", (req, res) => {
    //we user render when we
    res.sendFile(path.join(__dirname, "index.html"));
});

//calling the upload function after the multer uploader because we depend on that file
app.post("/upload", uploader.single("photo"), s3.upload, (req, res) => {
    //get the full URL of the image (amazon url + filename)
    const filePath = path.join(
        "https://s3.amazonaws.com/ihamspiced",
        `${req.file.filename}`
    );

    console.log("req.file", req.file);
    let username = "username-test";
    let title = "title-test";
    let description = "description-test";

    db.insertImage(filePath, username, title, description)
        .then((results) => {
            console.log("inserting new image worked, info is", results.rows);

            // send response back to Vue once we know that the INSERT was successfull
            res.json({
                success: true,
                message: "File uploaded successfully",
                file: results.rows[0], //TO CHECK
            });

            //after the response above is sent, we are back in app.js (Vue) -> the .then() part of the fetch request will run
        })
        .catch((err) => {
            console.log("error in adding new image", err);
            res.json({
                success: false,
                message: "File upload failed",
            });
        });

    // req.file ? res.json({ success: true }) : res.json({ success: false });
});

app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
