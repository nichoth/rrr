var observ = require('observ')
var struct = require('observ-struct')

function State (keys, profile) {

    console.log('in state', profile)

    var state = struct({
        feed: observ(null),
        route: observ('/'),
        me: struct({
            source: observ(null),
            secrets: observ(keys)
        }),
        profile: struct({
            userName: observ((profile && profile.userName) || null)
        })
    })

    return state
}

module.exports = State