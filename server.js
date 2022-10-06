const express = require("express");
const app = express();
const path = require("path");
const s3 = require("./s3");
const { uploader } = require("./middleware");
const db = require("./db.js");
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

//get images on app mount
app.get("/images", (req, res) => {
    db.getImages()
        .then((result) => {
            res.json(result.rows);
        })
        .catch((err) => console.log("error in get images", err));
});

//get dynamic route for image in each modal
app.get("/image/:id", (req, res) => {
    db.getImageInfo(req.params.id)
        .then((result) => {
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getImagesById", err);
        });
});

//get more images on scroll down event
app.get("/more-images/:id", (req, res) => {
    let lastId = req.params.id;
    db.getMoreImages(lastId)
        .then((result) => {
            return res.json(result.rows);
        })
        .catch((err) => console.log("error in get next images", err));
});

//get comments dynamic route
app.get("/comments/:id", (req, res) => {
    db.getCommentsById(req.params.id)
        .then((result) => {
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getCommentsById", err);
        });
});

//post route for image upload w/ middleware for multer & S3
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const fullImageUrl = path.join(
        "https://s3.amazonaws.com/ihamspiced",
        `${req.file.filename}`
    );
    db.insertImage(
        fullImageUrl,
        req.body.username,
        req.body.title,
        req.body.description
    )
        .then((results) => {
            res.json({
                success: true,
                message: "File uploaded successfully",
                uploadedFile: results.rows[0],
            });
        })
        .catch((err) => {
            console.log("error in adding new image", err);
            res.json({
                success: false,
                message: "File upload failed",
            });
        });
});

//post route for image comments
app.post("/comment", (req, res) => {
    db.insertComment(req.body.id, req.body.username, req.body.comment)
        .then((results) => {
            res.json({
                newComment: results.rows[0],
            });
        })
        .catch((err) => console.log("error in inserting new comment", err));
});

//dynamic post route for deleting images
app.post("/delete-image/:id", (req, res) => {
    db.deleteImage(req.params.id)
        .then((result) => {
            res.json({
                message: "Deleting the image was successful",
                success: true,
            });
        })
        .catch((err) => {
            console.log("error in deleting image", err);
            res.json({
                success: false,
            });
        });
});

//catch all route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
