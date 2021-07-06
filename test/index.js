require('isomorphic-fetch')
var test = require('tape')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash
var Client = require('../src/client')

    // var { getFollowing, follow, setNameAvatar, testPost,
    //     getRelevantPosts, getPostsWithFoafs } = Client()

var { follow, getPostsWithFoafs } = Client()

var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')

var ntl
var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()
var _msg

test('setup', function (t) {
    ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

    ntl.stdout.on('data', function (d) {
        if (d.toString().includes('Server now ready')) {
            t.end()
        }
    })

    ntl.stdout.pipe(process.stdout)
    ntl.stderr.pipe(process.stderr)

    ntl.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
    })

    ntl.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
    })
})

// * create and sign msg client side
test('publish one message', function (t) {
    var hash = createHash('sha256')
    hash.update(base64Caracal)
    var _hash = hash.digest('base64')
    // console.log('******hash', hash, _hash)

    var content = {
        type: 'test',
        text: 'waaaa',
        mentions: [_hash]
    }

    _msg = ssc.createMsg(keys, null, content)

    // console.log('***the first msg***', _msg)

    // {
    //     previous: null,
    //     sequence: 1,
    //     author: '@x+KEmL4JmIKzK0eqR8vXLPUKSa87udWm+Enw2bsEiuU=.ed25519',
    //     timestamp: NaN,
    //     hash: 'sha256',
    //     content: { type: 'test', text: 'waaaa' },
    // eslint-disable-next-line
    //     signature: 'RQXRrMUMqRlANeSBrfZ1AVerC9xGJxEGscx1MZrJUqAVylwVfi5i5r1msyZzqi7FuDf7DYr3OOHrTIO2P6ufDQ==.sig.ed25519'
    //   }

    var reqBody = {
        keys: { public: keys.public },
        msg: _msg,
        file: base64Caracal
    }

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'POST',
        body:    JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json())
        .then(function (res) {
            var { msg } = res
            t.pass('got a response', res)
            t.ok(msg.mentionUrls, 'should have the image urls')
            t.equal(msg.value.signature, _msg.signature,
                'should send back the right signature')
            t.end()
        })
        .catch(err => {
            console.log('errrrr', err)
            t.error(err)
        })
})


test('publish a second message', function (t) {
    var ___hash = createHash('sha256')
    ___hash.update(base64Caracal)
    var _hash = ___hash.digest('base64')

    var req2 = {
        keys: { public: keys.public },
        // in here we pass in the previous msg we created
        // createMsg(keys, prevMsg, content)
        msg: ssc.createMsg(keys, _msg, {
            type: 'test2',
            text: 'ok',
            mentions: [_hash]
        }),
        file: base64Caracal
    }

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'post',
        body:    JSON.stringify(req2),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            t.pass('got a response')
            t.equal(res.msg.data.value.signature, req2.msg.signature,
                'should send back right signature')
            t.end()
        })
        .catch(err => {
            console.log('errrrrr', err)
            t.error(err)
            t.end()
        })
})

test('follow a user', function (t) {
    follow(keys, userOneKeys)
        .then(res => {
            t.equal(res.value.content.type, 'follow',
                'should post a follow message')
            t.equal(res.value.content.contact, userOneKeys.id,
                'should follow the right user ID')
            t.end()
        })
        .catch(err => {
            console.log('oh no', err)
            t.error(err)
            t.end()
        })
})

test('foaf follow', function (t) {
    follow(userOneKeys, userTwoKeys)
        .then(res => {
            t.equal(res.value.content.type, 'follow',
                'userOne should follow userTwo')
            t.end()
        })
})

test('get foaf messages', t => {
    // need to do a post by userTwo

    getPostsWithFoafs(keys.id)
        .then(res => {
            console.log('**got foaf posts**', res)
            t.end()
        })
})

test('get relevant posts', function (t) {
    console.log('todo')
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})

