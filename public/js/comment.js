const commentcomponent = {
    data() {
        return {
            comments: [],
            username: "",
            comment: "",
            hasComments: false,
            error: "",
        };
    },
    props: ["commentId"],
    mounted() {
        console.log("props comment: ", this.commentId);
        fetch(`/comments/${this.commentId}`)
            .then((answer) => answer.json())
            .then((commentsArray) => {
                this.comments = commentsArray;
            });
        //TO FIX: is this variable necessary???
        if (this.comments) {
            this.hasComments = true;
        }
    },
    methods: {
        cleanDate(date) {
            return date.slice(0, 10).split("-").reverse().join("-");
        },
        submitComment() {
            //client-side comment validation
            if (!this.username || !this.comment) {
                this.error = "Please fill out all fields";
                return;
            }
            if (this.username.length > 35) {
                this.error =
                    "Please choose a username with up to 35 characters";
                return;
            }

            fetch("/comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: this.username,
                    comment: this.comment,
                    id: this.commentId,
                }),
            })
                .then((answer) => answer.json())
                .then((data) => {
                    //reset the comment form values:
                    this.username = "";
                    this.comment = "";
                    this.error = "";
                    // comment should be displayed in the comment list immediately
                    this.comments.unshift(data.newComment);
                });
        },
    },
    template: `
        <div class="comment">
        <span class="error" id="error-comment">{{ error }}</span>
        <h5> Add a comment </h5>
            <div class="comment-form">
                <div class="comment-fields">
                <input type="text" v-model.trim="username" name="username" id="username" placeholder=" " />
                <label for="username">Username*</label>
                </div>
                <div class="comment-fields">
                <input type="text" v-model.trim="comment" name="comment" id="comment" placeholder=" " />
                <label for="comment">Comment*</label>
                </div>
                <input type="submit" value="Submit comment" class="btn-submit" id="comment-submit" @click="submitComment" />
            </div>
            <h5 v-if="this.comments.length>0"> Recent comments: </h5>
            <div class="comments" v-for="comment in comments">
                <p>{{comment.comment}}</p>
                <p id="detail-component">Posted by {{comment. username}} on {{cleanDate(comment.created_at)}}</p>
            </div>
        </div>
    `,
};

export default commentcomponent;
