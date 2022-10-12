import * as Vue from "./vue.js";
import modalcomponent from "./modal.js";

Vue.createApp({
    data() {
        return {
            images: [],
            message: "",
            error: "",
            title: "",
            username: "",
            description: "",
            file: null,
            imageId: 0,
            lastImageId: null,
            lowestImageId: null,
            timer: null,
            hoverTarget: null,
            nextId: null,
            newImagesNotification: false,
            newImages: [],
        };
    },
    components: {
        "modal-component": modalcomponent,
    },
    methods: {
        cleanDate(date) {
            return date.slice(0, 10).split("-").reverse().join("-");
        },
        handleFileChange(e) {
            this.file = e.target.files[0];
        },
        validateForm() {
            this.error = "";

            //form validation client-side
            let mandatoryFields = ["title", "username", "file"];
            for (let field of mandatoryFields) {
                if (!this[field]) {
                    this.error += `Please include a ${field} \n`;
                }
            }

            if (this.title && this.title.length > 70) {
                this.error += "Image title must be max 70 characters long \n";
            }

            if (this.username && this.username.length > 35) {
                this.error += "Username must be max 35 characters long \n";
            }

            if (this.file) {
                //file type validation
                let extension = this.file.name.substr(
                    this.file.name.lastIndexOf(".")
                );

                if (extension == "") {
                    this.error += "Please upload a valid image file \n";
                }

                if (
                    extension.toLowerCase() != ".gif" &&
                    extension.toLowerCase() != ".jpg" &&
                    extension.toLowerCase() != ".jpeg" &&
                    extension.toLowerCase() != ".png" &&
                    extension != ""
                ) {
                    this.error += "Please upload a valid image file \n";
                }

                //file size validation
                if (this.file.size > 2097152) {
                    this.error += "Image must be max 2 MB \n";
                }
            }
        },
        submitForm() {
            this.validateForm();
            if (this.error) {
                return;
            }
            // collect form info into FormData - title, description & username are collected via v-model
            const formData = new FormData();
            formData.append("file", this.file);
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);

            fetch("/upload", {
                method: "post",
                body: formData,
            })
                .then((result) => result.json())
                .then((serverData) => {
                    //reset the form values
                    this.title = "";
                    this.description = "";
                    this.username = "";
                    this.file = null;
                    this.error = "";

                    //reset the file input value shown on screen
                    this.$refs.inputfile.value = null;

                    this.message = serverData.message;
                    setTimeout(() => {
                        this.message = "";
                    }, 2000);

                    if (serverData.uploadedFile) {
                        this.images.unshift(serverData.uploadedFile);
                    }
                });
        },
        closeModalInApp() {
            this.imageId = 0;
            //update the URL so that it doesn't contain the image ID anymore
            history.pushState(null, null, "/");
        },
        nextImage(value) {
            this.imageId = value;
            //update the URL to match the ID of the selected image
            history.pushState(null, null, `/image/${value}`);
        },
        prevImage(value) {
            this.imageId = value;
            //update the URL to match the ID of the selected image
            history.pushState(null, null, `/image/${value}`);
        },
        deleteImage() {
            if (confirm("Are you sure you want to delete the image?") == true) {
                fetch(`/delete-image/${this.imageId}`, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: this.imageId,
                    }),
                })
                    .then((result) => result.json())
                    .then((response) => {
                        if (response.success == true) {
                            //reset lowestid to prevent requests to nextimage
                            if (this.lowestImageId == this.imageId) {
                                this.lowestImageId =
                                    this.images[this.images.length - 2].id;
                            }
                            this.images = this.images.filter(
                                (e) => e.id !== this.imageId
                            );
                            //reset lastImageId
                            this.lastImageId = Math.min(
                                ...this.images.map((item) => item.id)
                            );
                            //reset imageId
                            this.imageId = 0;
                            //update the URL
                            history.pushState(null, null, "/");

                            this.message = response.message;
                            setTimeout(() => {
                                this.message = "";
                            }, 2000);
                        } else {
                            //delete was unsuccessful
                            alert("Unable to delete image, please try again");
                        }
                    });
            } else {
                return;
            }
        },
        getNextImages() {
            this.lastImageId = Math.min(...this.images.map((item) => item.id));
            if (this.lowestImageId !== this.lastImageId) {
                fetch(`/more-images/${this.lastImageId}`)
                    .then((result) => result.json())
                    .then((nextImages) => {
                        //add next round of images to the array
                        for (let image of nextImages) {
                            this.images.push(image);
                        }
                        //update lowestImageId and lastImageId
                        this.lowestImageId = nextImages[0].lowestId;
                        this.lastImageId = Math.min(
                            ...this.images.map((item) => item.id)
                        );
                    });
            }
        },
        //handler for the click event on the modal - change the current URL to contain the ID of the selected image
        updateLocation(id) {
            this.imageId = id;
            history.pushState(null, null, `/image/${id}`);
        },
        //click handler on new image notification - adds the new images to the gallery
        refreshImages() {
            for (let newImage of this.newImages) {
                this.images.unshift(newImage);
            }
            this.newImagesNotification = false;
        },
    },

    mounted() {
        // console.log("Vue is ready to go");
        //check if the URL contains an image id and if yes, show that image
        if (location.pathname.indexOf("/image/") == 0) {
            let urlImageId = +location.pathname.split("/").pop();
            if (!isNaN(urlImageId)) {
                this.imageId = urlImageId;
            }
        }
        fetch("/images")
            .then((answer) => answer.json())
            .then((imagesArray) => {
                this.images = imagesArray;
                this.lastImageId = Math.min(
                    ...this.images.map((item) => item.id)
                );
            })
            .then(() =>
                //load more images on scroll
                setInterval(() => {
                    if (
                        document.documentElement.scrollTop +
                            window.innerHeight >
                        document.documentElement.offsetHeight - 50
                    ) {
                        this.getNextImages();
                    }
                }, 250)
            );

        //check for newly added images
        setInterval(() => {
            // dynamic fetch based on the id of the newest image
            fetch(`/new-images/${this.images[0].id}`)
                .then((answer) => answer.json())
                .then((newImagesArray) => {
                    if (newImagesArray.length) {
                        this.newImagesNotification = true;
                        this.newImages = newImagesArray;
                    }
                });
        }, 5000);

        //listen to browser history changes - open/close modal based on user interaction with the browser's back/forward buttons
        window.addEventListener("popstate", () => {
            //note: OK to use "this" as long as defined as an arrow function; as a normal function, "this" would refer to the window
            this.imageId = +location.pathname.split("/").pop();
        });
    },
}).mount("main");
