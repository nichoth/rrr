// require('dotenv').config()
var Client = require('../../src/client')
var client = Client()
var createHash = require('create-hash')
var ssc = require('@nichoth/ssc')

var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

var hash = createHash('sha256')
hash.update(file)
var fileHash = hash.digest('base64')

// var tempKeys = ssc.createKeys()
var tempKeysTwo = ssc.createKeys()
var tempKeysThree = ssc.createKeys()
var tempKeysFour = ssc.createKeys()

// mine, tempTwo, tempThree


// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

var URL = 'http://localhost:8888'

Cypress.Commands.add('createId', () => {
        cy.visit(URL + '/whoami/create')

        // click the 'create id' button
        cy.get('.id-source.create-id button[type=submit]')
            .click()
})

Cypress.Commands.add('followFoafs', (myKeys) => {

    console.log('envvvvvvvvv', Cypress.env('TEST_PW'))

    return client.followMe(myKeys, Cypress.env('TEST_PW'))
        .then(() => client.followMe(tempKeysTwo, Cypress.env('TEST_PW')))
        .then(() => client.followMe(tempKeysThree, Cypress.env('TEST_PW')))
        .then(() => client.followMe(tempKeysFour, Cypress.env('TEST_PW')))
        .then(() => {

            // must create a profile for each user before following them
            return Promise.all([
                client.setProfile(myKeys, null, { name: 'a' }),
                client.setProfile(tempKeysTwo, null, { name: 'b' }),
                client.setProfile(tempKeysThree, null, { name: 'c' }),
                client.setProfile(tempKeysFour, null, { name: 'd' })
            ])
                .then(() => {
                    // now make user1 follow user2 follow user3
                    return client.follow(myKeys, tempKeysTwo)
                        .then(() => {
                            return client.follow(tempKeysTwo, tempKeysThree)
                                .then(() => {
                                    console.log('everyone is followed')
                                })
                        })
                })

        })

})

Cypress.Commands.add('followFoafoaf', () => {
    return client.follow(tempKeysThree, tempKeysFour)
        .then(() => {
            console.log('foafoaf is followed')
        })
})

Cypress.Commands.add('foafoafPost', () => {
    var msg = ssc.createMsg(tempKeysFour, null, {
        type: 'test',
        text: 'foafoaf test',
        mentions: [fileHash]
    })

    return client.post(tempKeysFour, msg, file)
        .then(res => {
            console.log('foafoaf is posted', res)
            return res
        })
})

Cypress.Commands.add('serverFollow', (keys) => {
    console.log('envvvvvvvvv', Cypress.env('TEST_PW'))
    return client.followMe(keys, Cypress.env('TEST_PW'))
})

Cypress.Commands.add('foafPost', () => {
    var msg = ssc.createMsg(tempKeysThree, null, {
        type: 'test',
        text: 'foaf test',
        mentions: [fileHash]
    })
    // console.log('start posting', msg)

    // post: function post (keys, msg, file) {
    return client.post(tempKeysThree, msg, file)
        .then(res => {
            // console.log('done posting', res)
            return res
        })
})
