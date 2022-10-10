import commentcomponent from "./comment.js";

const modalcomponent = {
    data() {
        return {
            modalImage: {},
            next: null,
            prev: null,
        };
    },
    components: {
        "comment-component": commentcomponent,
    },
    emits: ["close-modal", "delete-image", "next", "prev"],
    props: ["id"],
    // mounted() {
    //     fetch(`/get-image/${this.id}`)
    //         .then((result) => result.json())
    //         .then((imgInfo) => {
    //             //check if there is an image
    //             if (imgInfo.length) {
    //                 //pass the info to the data object in the modal
    //                 this.modalImage = imgInfo[0];
    //                 this.next = imgInfo[0].lastId;
    //                 this.prev = imgInfo[0].nextId;
    //                 //update the URL to match the selected image
    //                 history.pushState(null, null, `/image/${imgInfo[0].id}`);
    //                 //clean the date
    //                 this.modalImage.created_at = imgInfo[0].created_at
    //                     .slice(0, 10)
    //                     .split("-")
    //                     .reverse()
    //                     .join("-");
    //             } else {
    //                 this.$emit("close-modal");
    //                 history.replaceState(null, null, "/");
    //             }
    //         });
    // },
    watch: {
        id: {
            immediate: true,
            handler(newValue, oldValue) {
                // console.log("watch change of next value", oldValue, newValue);
                fetch(`/get-image/${newValue}`)
                    .then((result) => result.json())
                    .then((imgInfo) => {
                        //check if there is an image
                        if (imgInfo.length) {
                            //pass the info to the data object in the modal
                            this.modalImage = imgInfo[0];
                            this.next = imgInfo[0].lastId;
                            this.prev = imgInfo[0].nextId;
                            // //update the URL to match the selected image
                            // history.pushState(
                            //     null,
                            //     null,
                            //     `/image/${imgInfo[0].id}`
                            // );
                            console.log("inside fetch in modal");
                            //clean the date
                            this.modalImage.created_at = imgInfo[0].created_at
                                .slice(0, 10)
                                .split("-")
                                .reverse()
                                .join("-");
                            //if the fetch does not return an image, close the modal and redirect to /
                        } else {
                            this.$emit("close-modal");
                            history.replaceState(null, null, "/");
                        }
                    });
            },
        },
    },
    methods: {
        closeModalInComponent: function () {
            // here we need to tell the parent to do something for us
            this.$emit("close-modal");
        },
        deleteImageInComponent: function () {
            this.$emit("delete-image");
        },
        nextImage() {
            this.$emit("next", this.next);
        },
        prevImage() {
            this.$emit("prev", this.prev);
        },
    },
    template: `
        <div class="modal">
            <div class="modal-content">
                <h4 id="close-modal" @click="closeModalInComponent"> X </h4>
                    <div class="modal-image-container">
                    <h4 id="prev" v-if="prev" @click="prevImage"> &lt; </h4>
                    <img id="modal-image" v-bind:src="modalImage.url" v-bind:alt="modalImage.title"/>
                    <h4 id="next" v-if="next" @click="nextImage"> &gt; </h4>
                    <p class="img-description">{{modalImage.title}}</p>
            </div>
            <p class="modal-description">{{modalImage.description}}</p>
            <p id="detail-component">Uploaded by {{modalImage.username}} on {{modalImage.created_at}} </p>
            <input type="submit" value="Delete image" class="btn-submit" id="delete-image" @click="deleteImageInComponent" />
            <comment-component :commentId="id" :key="id"></comment-component>
            </div>
        </div>
        <div class="overlay"></div>
    `,
    //note the use of "key" in the comment component so that it reacts to changes in id in the parent (Vue will know to separate one comment component from the other)
};

export default modalcomponent;
