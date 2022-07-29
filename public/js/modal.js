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
        cleanDateModal(date) {
            console.log("date", date);
            return date.slice(0, 10).split("-").reverse().join("-");
        },

        closeModalInComponent: function () {
            // console.log("closeModal fn in component is running");
            console.log("about to emit an event from the component!");
            // here we need to tell the parent to do something for us please!!!!
            this.$emit("close-modal");
        },
    },
    template: `
        <div class="modal">
        <h3 id="close-modal" @click="closeModalInComponent"> X </h3>
        <img id="modal-image" v-bind:src="modalImage.url" v-bind:alt="modalImage.title"/>
        <p class="modal-title">{{modalImage.title}}</p>
            <p class="modal-description">{{modalImage.description}}</p>
            <p id="detail-component">Uploaded by {{modalImage.username}} on {{modalImage.created_at}} </p>
            <comment-component :commentId="id"></comment-component>
        </div>
    `,
};

export default modalcomponent;
