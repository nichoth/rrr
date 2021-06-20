require('dotenv').config()
var getRelevantPosts = require('@nichoth/ssc-fauna/relevant-posts').get
var xtend = require('xtend')

let cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod !== 'GET') {
        return cb(null, {
            statusCode: 400,
            body: JSON.stringify({
                ok: false,
                message: 'should be a get request'
            })
        })
    }

    // http method is get
    var userId = ev.queryStringParameters.userId

    console.log('user id', userId)

    getRelevantPosts(userId)
        .then(res => {
            // console.log('**got relevant posts****', res)

            cb(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ok: true,
                    // here we need to map them so they have a URL for the
                    // image
                    msg: res.map(msg => {
                        return xtend(msg, {
                            mentionUrls: msg.value.content.mentions ?
                                msg.value.content.mentions.map(m => {
                                    // slugify the hash twice
                                    // don't know why we need to do it twice
                                    var slugifiedHash = encodeURIComponent('' + m)
                                    var slugslug = encodeURIComponent(
                                        slugifiedHash)
                                    return cloudinary.url(slugslug)      
                                }) :
                                []
                        })
                    })
                })
            })
        })
        .catch(err => {
            return cb(null, {
                statusCode: 500,
                body: JSON.stringify({
                    ok: false,
                    message: err.toString()
                })
            })
        })
}