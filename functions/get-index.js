'use strict';

const co = require('co');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Mustache = require('mustache');
const http = require('superagent-promise')(require('superagent'), Promise);
const URL = require('url');
const aws4 = require('../libs/aws4');

const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

const restaurantsApiRoot = process.env.restaurants_api;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var html;

function* loadHTML() {
  if (!html) {
    html = yield fs.readFileAsync('static/index.html', 'utf-8')
  }
  return html;
}

function* getRestaurants() {
  let url = URL.parse(restaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };

  // @info: required for vs debug
  // if (!process.env.AWS_ACCESS_KEY_ID) {
  //   let cred = (yield awscred.loadAsync()).credentials;
  //   process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
  //   process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
  //   // @info: available only when temp credentials
  //   if (cred.sessionToken) {
  //     process.env.AWS_SESSION_TOKEN = cred.sessionToken;
  //   }
  // }
  // @info: no more required due our ouw `aws4` implementation



  aws4.sign(opts);

  let httpReq = http
    .get(restaurantsApiRoot)
    .set('Host', opts.headers['Host'])
    .set('X-Amz-Date', opts.headers['X-Amz-Date'])
    .set('Authorization', opts.headers['Authorization'])


    const token = opts.headers['X-Amz-Security-Token'];
    if (token) {
      httpReq.set('X-Amz-Security-Token', token)
    }

  return (yield httpReq).body;
}

module.exports.handler = co.wrap( function*(event, contenxt, callback) {
  yield aws4.init();

  let template = yield loadHTML();
  let restaurants = yield getRestaurants();
  let dayOfWeek = days[new Date().getDay()];
  let view = {
    dayOfWeek, restaurants, awsRegion, cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`
  };

  let html = Mustache.render(template, view);
  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    }
  };
  callback(null, response);
});

