import * as Vue from "./vue.js";
import modalcomponent from "./modal.js";

Vue.createApp({
    data() {
        return {
            images: [],
            message: "",
            title: "",
            username: "",
            description: "",
            file: null,
            imageId: 0,
            lastImageId: null,
            lowestImageId: null,
            timer: null,
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

            // TO DO: validate & sanitise form info

            if (!this.file) {
                alert("You must add a file!");
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

                    // change the value of message
                    this.message = serverData.message;

                    // if there is an image, add it to the list in data!
                    if (serverData.uploadedFile) {
                        this.images.unshift(serverData.uploadedFile);
                    }
                });
        },
        closeModalInApp() {
            console.log("close fn in the parent is running!");
            this.imageId = 0;
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
            });
        setInterval(() => {
            if (
                document.documentElement.scrollTop + window.innerHeight >
                document.documentElement.offsetHeight - 50
            ) {
                // console.log(
                //     "the user scrolled, last image id is",
                //     this.lastImageId
                // );
                console.log("call the get next images function");
                this.getNextImages();
            }
        }, 250);
    },
}).mount("main"); //what's inside mount needs to refer to the selector
