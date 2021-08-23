require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')

var ntl
test('setup', t => {
    require('../setup')(t.test, (netlify) => {
        ntl = netlify
        t.end()
    })
})

test('post tests', t => {
    var keys = ssc.createKeys()
    var userOneKeys = ssc.createKeys()
    var userTwoKeys = ssc.createKeys()
    var ks = { keys, userOneKeys, userTwoKeys }
    require('./foafs')(t.test, ks)
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})

