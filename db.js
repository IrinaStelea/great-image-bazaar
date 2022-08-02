const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "imageboard";
const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

//get images query
module.exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY created_at DESC LIMIT 6`);
    // .then(function (result) {
    //     console.log(result.rows);
    // })
    // .catch(function (err) {
    //     console.log(err);
    // });
};

//getImagesById updated to include prev and next id
module.exports.getImagesById = (id) => {
    // return db.query(`SELECT * FROM images WHERE id = '${id}'`);
    return db.query(
        `SELECT *, (SELECT id FROM images where id>${id} ORDER BY id LIMIT 1) AS "nextId", (SELECT id FROM images where id<${id} ORDER BY id DESC LIMIT 1) as "lastId" FROM images WHERE id = '${id}'`
    );
};

module.exports.getMoreImages = (lastImageId) => {
    return db.query(
        `SELECT url, title, id, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images WHERE id < $1 ORDER BY id DESC LIMIT 3`,
        [lastImageId]
    );
};

module.exports.insertImage = (url, username, title, description) => {
    return db.query(
        //add info returning all info
        `INSERT INTO images(url, username, title, description)
            VALUES ($1, $2, $3, $4) RETURNING *`,
        [url, username, title, description]
    );
};

module.exports.deleteImage = (id) => {
    return db.query(`DELETE FROM images WHERE id='${id}'`);
};

module.exports.insertComment = (id, username, comment) => {
    return db.query(
        `INSERT INTO comments(image_id, username, comment)
            VALUES ($1, $2, $3) RETURNING *`,
        [id, username, comment]
    );
};

module.exports.getCommentsById = (id) => {
    return db.query(
        `SELECT * FROM comments WHERE image_id=$1 ORDER BY created_at DESC`,
        [id]
    );
};
