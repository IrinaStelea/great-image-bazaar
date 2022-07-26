import * as Vue from "./vue.js";

//make sure the element in mount corresponds to the HTML element where I want to add the content
Vue.createApp({
    data() {
        return {
            images: [],
        };
    },
    //run this when the Vue lifecycle MOUNTED event happens
    mounted() {
        console.log("Vue is ready to go!");
        fetch("/images")
            .then((answer) => answer.json())
            .then((imagesArray) => {
                console.log("get images results", imagesArray);
                // Vue understands 'this.images' above refers to the DATA's property named 'cities'.
                this.images = imagesArray;
            });
    },
}).mount("main"); //what's inside mount needs to specify exactly where the content will be injected (refer directly to html tags and use # for ids)
