const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "imageboard";
const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

//get images query
module.exports.getImages = () => {
    return db.query(`SELECT * FROM images`);
    // .then(function (result) {
    //     console.log(result.rows);
    // })
    // .catch(function (err) {
    //     console.log(err);
    // });
};
