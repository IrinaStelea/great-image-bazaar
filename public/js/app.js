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
        submitForm() {
            //form validation client-side
            if (!this.title) {
                this.error = "Please include a title for your image";
                return;
            }

            if (this.title.length > 70) {
                this.error = "Image title must be max 70 characters long";
                return;
            }

            if (!this.username) {
                this.error = "Please include a username";
                return;
            }

            if (this.username.length > 35) {
                this.error = "Username must be max 35 characters long";
                return;
            }

            if (!this.file) {
                this.error = "Please add an image";
                return;
            }

            //file type validation
            let extension = this.file.name.substr(
                this.file.name.lastIndexOf(".")
            );

            if (extension == "") {
                this.error = "Please upload a valid image file";
                return;
            }

            if (
                extension.toLowerCase() != ".gif" &&
                extension.toLowerCase() != ".jpg" &&
                extension.toLowerCase() != ".jpeg" &&
                extension.toLowerCase() != ".png" &&
                extension != ""
            ) {
                this.error = "Please upload a valid image file";
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
            history.pushState(null, null, "/");
        },
        nextImage(value) {
            this.imageId = value;
        },
        prevImage(value) {
            this.imageId = value;
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
                        // console.log(
                        //     "response from delete image in app",
                        //     response
                        // );
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
        showModal() {
            //FIX THIS
            if (location.pathname.indexOf("/image/") === 0) {
                this.imageId = +location.pathname.split("/").pop();
                history.replaceState(null, null, `/${location.pathname}`);
            }
        },
        //FIX THIS FOR NEXT-PREV - handler for the click event on the modal - change the current url to correspond to the selected image
        updateLocation() {
            history.pushState(null, null, `/image/${this.imageId}`);
        },
    },

    mounted() {
        // console.log("Vue is ready to go!");

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

        //open/close modal based on user interaction with the browser's back/forward buttons
        addEventListener("popstate", (e) => {
            //update the imageId with the location.pathname
            this.imageId = +location.pathname.split("/").pop();
        });

        this.showModal();
    },
}).mount("main");
