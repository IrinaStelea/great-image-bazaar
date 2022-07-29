const commentcomponent = {
    data() {
        return {
            comments: [],
            username: "",
            comment: "",
        };
    },
    props: ["commentId"],
    mounted() {
        console.log("comment component mounted");
        console.log("props comment: ", this.commentId);
        fetch(`/comments/${this.commentId}`)
            .then((answer) => answer.json())
            .then((commentsArray) => {
                console.log("get comments results", commentsArray);
                // Vue understands 'this.images' above refers to the DATA's property named 'images'.
                this.comments = commentsArray;
            });
    },

    methods: {
        cleanDate(date) {
            return date.slice(0, 10).split("-").reverse().join("-");
        },
        onCommentSubmit() {
            // TO DO: validate & sanitise comment data
            fetch("/comment", {
                method: "post",
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
                    console.log("comments", data.newComment);

                    //reset the comment form values:
                    this.username = "";
                    this.comment = "";

                    // comment should be displayed in the comment list immediately
                    this.comments.unshift(data.newComment);
                });
        },
    },
    template: `
        <div class="comment">
        <h4> Add a comment </h4>
        
        <div class="comment-form">
         <div class="comment-fields">
            <input type="text" v-model.trim="username" name="username" id="username" placeholder="Your username" />
            <input type="textarea" v-model.trim="comment" name="comment" id="comment" placeholder="Your comment" />
            </div>
            <input type="submit" value="Submit comment" class="comment-submit" @click="onCommentSubmit" /></div>
            <h4> Recent comments: </h4>
            <div class="comments" v-for="comment in comments">
            
                <p>{{comment.comment}}</p>
                <p id="detail-component">Posted by {{comment. username}} on {{cleanDate(comment.created_at)}}</p>
                </div>
        </div>
    `,
};

export default commentcomponent;
