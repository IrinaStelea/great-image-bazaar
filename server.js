const path = require("path");
const express = require("express");
const app = express();
const s3 = require("./s3"); //s3 will be an object, but do not destructure it here
const { uploader } = require("./middleware");
const db = require("./db.js");
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.get("/images", (req, res) => {
    db.getImages()
        .then((result) => {
            res.json(result.rows);
            // console.log("data is", result.rows);
        })
        .catch((err) => console.log("error in get images", err));
});

//dynamic route for modal
app.get("/image/:id", (req, res) => {
    let id = req.params.id;
    db.getImagesById(id)
        .then((result) => {
            console.log("get images by Id w/ prev and next", result.rows);
            //send response back as json for the fetch
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getImagesById", err);
        });
});

app.get("/more/:id", (req, res) => {
    let lastId = req.params.id;
    // console.log("last id in get request", lastId);
    db.getMoreImages(lastId)
        .then((result) => {
            return res.json(result.rows);
            // console.log("next round of images is", result.rows);
        })
        .catch((err) => console.log("error in get next images", err));
});

app.get("/comments/:id", (req, res) => {
    let id = req.params.id;
    db.getCommentsById(id)
        .then((result) => {
            // console.log(result.rows);
            //send response back as json for the fetch
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getCommentsById", err);
        });
});

//post for uploading images
//Note the middleware sequence: calling the upload function after the multer uploader because we depend on that file
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    //get the full URL of the image (amazon url + filename)
    const filePath = path.join(
        "https://s3.amazonaws.com/ihamspiced",
        `${req.file.filename}`
    );
    // console.log("req.body", req.body);
    // console.log("req.file", req.file);

    db.insertImage(
        filePath,
        req.body.username,
        req.body.title,
        req.body.description
    )
        .then((results) => {
            console.log("inserting new image worked, info is", results.rows);
            // send response back to Vue once we know that the INSERT was successfull
            res.json({
                success: true,
                message: "File uploaded successfully",
                uploadedFile: results.rows[0],
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

//post for the comments
app.post("/comment", (req, res) => {
    console.log("req body is", req.body);
    db.insertComment(req.body.id, req.body.username, req.body.comment)
        .then((results) => {
            console.log("inserting new comment worked, info is", results.rows);
            // send inserted commented back to Vue
            res.json({
                newComment: results.rows[0],
            });
        })
        .catch((err) => console.log("error in inserting new comment", err));
});

//post for deleting images
// /delete-image/${this.imageId}
app.post("/delete-image/:id", (req, res) => {
    let id = req.params.id;
    db.deleteImage(id)
        .then((result) => {
            console.log("deleting image worked the resutls are", result);
            //send response back as json for the fetch
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

//put this at the end so it doesn't block other routes
app.get("*", (req, res) => {
    //render the index.html for all routes
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
