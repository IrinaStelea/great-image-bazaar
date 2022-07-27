import * as Vue from "./vue.js";

Vue.createApp({
    data() {
        return {
            images: [],
            message: "",
            title: "",
            username: "",
            description: "",
        };
    },
    methods: {
        cleanDate(date) {
            return date.slice(0, 10).split("-").reverse().join("-");
        },
        //using Vueto get notified when the user tries to submit an empty form as well as to require validation
        onFormSubmit(e) {
            console.log("form trying to submit!");
            // validation!
            // console.log("file", this.file);
            // const form = e.currentTarget;
            // const fileInput = form.querySelector("input[type=file]");
            // console.log(fileInput.files);

            let file = e.target.files;
            console.log("file", file);

            // if (HTMLInputElement.files.length < 1) {
            //     alert("You must add a file!");
            //     return;
            // }

            // really submit the form!
            const formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("file", file);

            console.log("form data: 	", formData);
            fetch("/upload", {
                method: "post",
                body: formData,
            })
                .then((result) => result.json())
                .then((serverData) => {
                    console.log("server data", serverData); //this is the res.json we define in the post /upload route

                    // update the view!
                    // change the value of message
                    this.message = serverData.message;
                    // if there is an image, add it to the list in data!
                    if (serverData.file) {
                        this.images.unshift(serverData.file);
                    }
                });
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
            });
    },
}).mount("main"); //what's inside mount needs to refer to the selector
