let cloudinary = require("cloudinary").v2;
// var createHash = require('crypto').createHash

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function upload (file, _hash) {
    return new Promise(function (resolve, reject) {
        cloudinary.uploader.upload(file, {
            public_id: _hash,
            overwrite: true
        }, function (err, res) {
            if (err) {
                return reject(err)
            }

            resolve(res)
        })
    })
}

module.exports = upload