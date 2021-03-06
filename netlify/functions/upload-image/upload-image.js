let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    var { file, hash } = JSON.parse(ev.body)

    console.log('**hash**', hash)

    // should maybe take the hash of the file on the server,
    // that way we can trust that it's accurate

    cloudinary.uploader.upload(file, {
        public_id: '' + hash
    }, function (err, res) {
        if (err) {
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    cloudinary: res,
                    message: 'boooo cloudinary'
                })
            })
        }

        return cb(null, {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                message: 'ok woo'
            })
        })
    })

} 
