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

        //using Vue to get notified when the user tries to submit without a file as well as to require validation
        getFile(e) {
            this.file = e.target.files[0];
            console.log("this file", this.file);
            // console.log("type of myfile", typeof myFile);
        },
        onFormSubmit() {
            console.log("form trying to submit!");

            if (!this.title) {
                this.error = "Please add a title for your image";
                return;
            }

            if (this.title.length > 70) {
                this.error = "Please choose a title with up to 70 characters";
                return;
            }

            if (!this.username) {
                this.error = "Please add your username";
                return;
            }

            if (this.username.length > 35) {
                this.error =
                    "Please choose a username with up to 35 characters";
                return;
            }

            if (!this.file) {
                this.error = "Please add an image";
                return;
            }

            //check the file extension
            let extension = this.file.name.substr(
                this.file.name.lastIndexOf(".")
            );

            if (extension == "") {
                this.error = "Please upload a valid image file";
                return;
            }

            console.log("file extension", extension);
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

            // submit the form
            const formData = new FormData();
            formData.append("file", this.file);
            // // console.log("form data: 	", formData);
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);

            // for (var [key, value] of formData.entries()) {
            //     console.log("key, value", key, value);
            // }

            fetch("/upload", {
                method: "post",
                body: formData,
            })
                .then((result) => result.json())
                .then((serverData) => {
                    console.log("server data", serverData); //this is the res.json we define in the post /upload route

                    //reset the form values:
                    this.title = "";
                    this.description = "";
                    this.username = "";
                    this.file = null;
                    this.error = "";
                    //reset the file input value shown on screen (note that it needs a ref in the html as well in order to work)
                    this.$refs.inputfile.value = null;

                    // change the value of message
                    this.message = serverData.message;

                    //clear the message after 2 seconds
                    setTimeout(() => {
                        this.message = "";
                    }, 2000);

                    // if there is an image, add it to the list in data!
                    if (serverData.uploadedFile) {
                        this.images.unshift(serverData.uploadedFile);
                    }
                });
        },
        closeModalInApp() {
            console.log("close fn in the parent is running!");
            this.imageId = 0;
            history.pushState(null, null, "/");
        },
        nextImage(value) {
            console.log("value passed in emitter is", value);
            this.imageId = value;
        },
        prevImage(value) {
            console.log("value passed in emitter is", value);
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
                        console.log(
                            "response from delete image in app",
                            response
                        );
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

                            //clear the message after 2 seconds
                            setTimeout(() => {
                                this.message = "";
                            }, 2000);
                        } else {
                            alert("Unable to delete image, please try again");
                            console.log("Deleting the image was unsuccessful");
                        }
                    });
            } else {
                return;
            }
        },
        getNextImages() {
            this.lastImageId = Math.min(...this.images.map((item) => item.id));
            if (this.lowestImageId !== this.lastImageId) {
                // console.log("inside the fetch request");
                fetch(`/more/${this.lastImageId}`)
                    .then((result) => result.json())
                    .then((nextImages) => {
                        // console.log("next images", nextImages);
                        //add next round of images to the array
                        for (let image of nextImages) {
                            this.images.push(image);
                        }
                        //update lowestImageId and
                        this.lowestImageId = nextImages[0].lowestId;
                        this.lastImageId = Math.min(
                            ...this.images.map((item) => item.id)
                        );
                    });
            }
        },
        showModal() {
            if (location.pathname.indexOf("/image/") === 0) {
                console.log("inside if from location pathname");
                console.log("location pathname", location.pathname);
                this.imageId = +location.pathname.split("/").pop();
                console.log(
                    "this image id after location pathname",
                    this.imageId
                );
                history.replaceState(null, null, `/${location.pathname}`);
            }
        },
        //handler for the click event on the modal - change the current url to correspond to the selected image
        updateLocation() {
            history.pushState(null, null, `/image/${this.imageId}`);
        },
    },

    //run this when the Vue lifecycle MOUNTED event happens
    mounted() {
        console.log("Vue is ready to go!");

        fetch("/images")
            .then((answer) => answer.json())
            .then((imagesArray) => {
                console.log("get images results", imagesArray);
                // Vue understands 'this.images' above refers to the DATA's property named 'images'.
                this.images = imagesArray;
                this.lastImageId = Math.min(
                    ...this.images.map((item) => item.id)
                );
            })
            .then(() =>
                setInterval(() => {
                    if (
                        document.documentElement.scrollTop +
                            window.innerHeight >
                        document.documentElement.offsetHeight - 50
                    ) {
                        // console.log(
                        //     "the user scrolled, last image id is",
                        //     this.lastImageId
                        // );
                        console.log("call the get next images function");
                        this.getNextImages();
                    }
                }, 250)
            );

        //open/close modal based on user interaction with the browser's back/forward buttons
        addEventListener("popstate", (e) => {
            console.log(location.pathname, e.state);
            //update the imageId with the location.pathname
            this.imageId = +location.pathname.split("/").pop();
        });
        this.showModal();
    },
}).mount("main"); //what's inside mount needs to refer to the selector
