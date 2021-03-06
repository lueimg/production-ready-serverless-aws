'use strict';

const co = require('co');
const Promise = require('bluebird');
const aws4 = require('../../libs/aws4');

let initialized = false;

let init = co.wrap(function* () {
    if (initialized) {
        return;
    }

    process.env.restaurants_api = 'https://1lonxdayp9.execute-api.us-east-1.amazonaws.com/dev/restaurants';
    process.env.restaurants_table = 'restaurants';
    process.env.AWS_REGION = 'us-east-1';
    process.env.cognito_client_id = 'test_client_id';
    process.env.cognito_user_pool_id=  'us-east-1_d4q7yZEzT';
    process.env.cognito_server_client_id='6p1jdjj8nvo1r1jntv6dr35fkg';

    yield aws4.init();
    // let cred = (yield awscred.loadAsync()).credentials;
    // process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
    // process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;

    // // @info: available only when temp credentials
    // if (cred.sessionToken) {
    //     process.env.AWS_SESSION_TOKEN = cred.sessionToken;
    // }

    initialized = true;
});

module.exports.init = init;