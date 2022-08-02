import commentcomponent from "./comment.js";

const modalcomponent = {
    data() {
        return {
            modalImage: {},
            //no need to add the id prop here for use in the comment component
        };
    },
    components: {
        "comment-component": commentcomponent,
    },
    emits: ["close-modal", "delete-image"], //without this I'd get an error about extraneous event listeners in the modal once the overlay is added
    props: ["id"], //props array allows to get access to the info being passed down by the parent
    mounted() {
        console.log("our first component mounted");
        console.log("props: ", this.id);
        //fetch request for additional info on the clicked image, w/dynamics route
        fetch(`/image/${this.id}`)
            .then((result) => result.json())
            .then((imgInfo) => {
                console.log("imgInfo ", imgInfo[0]);
                //pass the info to the data object in the modal
                this.modalImage = imgInfo[0];
                //clean the date
                this.modalImage.created_at = imgInfo[0].created_at
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("-");
            });
    },

    methods: {
        cleanDate(date) {
            console.log("date", date);
            return date.slice(0, 10).split("-").reverse().join("-");
        },

        closeModalInComponent: function () {
            // console.log("closeModal fn in component is running");
            console.log("about to emit an event from the component!");
            // here we need to tell the parent to do something for us please!!!!
            this.$emit("close-modal");
        },
        deleteImageInComponent: function () {
            console.log("emitting delete event from the component!");
            this.$emit("delete-image");
        },
    },
    template: `
        <div class="modal">
        <div class="modal-content">
        <h4 id="close-modal" @click="closeModalInComponent"> X </h4>
        <div class="modal-image-container">
        <h4 id="prev"> &lt; </h4>
        <img id="modal-image" v-bind:src="modalImage.url" v-bind:alt="modalImage.title"/>
        <h4 id="next"> > </h4>
        <p class="img-description">{{modalImage.title}}</p>
         </div>
            <p class="modal-description">{{modalImage.description}}</p>
            <p id="detail-component">Uploaded by {{modalImage.username}} on {{modalImage.created_at}} </p>
            <input type="submit" value="Delete image" class="btn-submit" id="delete-image" @click="deleteImageInComponent" />
            <comment-component :commentId="id"></comment-component>
            </div>
            </div>
            <div class="overlay"></div>
        
    `,
};

export default modalcomponent;
