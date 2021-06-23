var ssc = require('@nichoth/ssc')
var createHash = require('create-hash')

console.log('aaaa')

module.exports = function Client () {
    var userKeys = ssc.createKeys()


    var client = {
        getRelevantPosts: function (userId) {
            var qs = new URLSearchParams({
                userId: userId
            }).toString()

            fetch('/.netlify/functions/get-relevant-posts' + '?' + qs)
                .then(res => {
                    return res.json()
                })
        },

        follow: function (myKeys) {
            var followMsg = ssc.createMsg(myKeys, null, {
                type: 'follow',
                contact: useeKeyswo.id,
                author: myKeys.id
            })


            fetch('/.netlify/functions/following', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    author: myKeys.id,
                    keys: { public: myKeys.public },
                    msg: followMsg
                }) 
            })
                .then(res => {
                    if (!res.ok) return res.text()
                    return res.json()
                })
                .catch(err => {
                    console.log('oh noooooooooo', err)
                })
        },

        getFollowing: function (author) {
            // this should return a map of followed IDs => profile data

            // we request the list of who you're following,
            // then you need to get the latest feeds for each person you're following
            var qs = new URLSearchParams({
                author
                // author: state().me.secrets.id
            }).toString();

            return fetch('/.netlify/functions/following' + '?' + qs)
                .then(res => res.json())
        },

        setNameAvatar: function (name) {
            var nameMsg = ssc.createMsg(userKeys, null, {
                type: 'about',
                about: userKeys.id,
                name: name || 'fooo'
            })

            // set name
            return fetch('/.netlify/functions/abouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keys: { public: userKeys.public },
                    msg: nameMsg
                }) 
            })
                .then(res => {
                    console.log('**set name res**', res)
                    return setAvatar()
                })

            // fetch('setAvatar')
            function setAvatar () {
                return fetch('/.netlify/functions/avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        keys: { public: userKeys.public },
                        // base64 smiling cube
                        file: 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7',
                        // msg: avatarMsg
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.text()
                                .then(t => {
                                    console.log('text', t)
                                    return t
                                })
                        }

                        res.json().then(json => {
                            console.log('**avatar res**', json)
                            return json
                        })
                    })
                    .catch(err => {
                        console.log('errr avatar', err)
                    })
            }

        },

        testPost: function testPost () {
            // a smiling face
            var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

            // var _hash = sha256.sync(file)
            var hash = createHash('sha256')
            hash.update(file)
            var _hash = hash.digest('base64')

            // post a 'post' from userTwo
            var postMsg = ssc.createMsg(userKeys, null, {
                type: 'post',
                text: 'the post text content',
                mentions: [_hash]
            })

            return fetch('/.netlify/functions/post-one-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msg: postMsg,
                    keys: userKeys,
                    file: file
                }) 
            })
                .then(res => res.json())
                .then(json => {
                    console.log('***post response json***', json)
                    return json
                })
                .catch(err => {
                    console.log('aaaaarrgggg', err)
                })
        }
    }

    return client
}