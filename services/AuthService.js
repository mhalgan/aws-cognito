global.fetch = require("node-fetch");
global.navigator = () => null;

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const request = require("request");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");

const poolData = {
  UserPoolId: "us-east-1_2z56dBsZt",
  ClientId: "5j7snlk13h40hrl6qft8bqclhg"
};

const pool_region = "us-east-1";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.Register = function(body, callback) {
  let name = body.name;
  let email = body.email;
  let password = body.password;
  let scope = "admin";

  let attributeList = [];
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "name",
      Value: name
    })
  );
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email",
      Value: email
    })
  );
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "custom:scope",
      Value: scope
    })
  );

  userPool.signUp(name, password, attributeList, null, function(err, result) {
    if (err) {
      callback(err);
    }

    let cognitoUser = result.user;
    callback(null, cognitoUser);
  });
};

exports.Login = function(body, callback) {
  let userName = body.name;
  let password = body.password;

  let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: userName,
    Password: password
  });

  let userData = {
    Username: userName,
    Pool: userPool
  };

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      let accessToken = result.getAccessToken().getJwtToken();
      callback(null, accessToken);
    },
    onFailure: function(err) {
      callback(err);
    }
  });
};

exports.Validate = function(token, callback) {
  request(
    {
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
    },
    function(err, response, body) {
      if (!err && response.statusCode === 200) {
        let pems = {};
        let keys = body["keys"];

        for (let i = 0; i < keys.length; i++) {
          let key_id = keys[i].kid;
          let modulus = keys[i].n;
          let exponent = keys[i].e;
          let key_type = keys[i].kty;
          let jwk = { kty: key_type, n: modulus, e: exponent };
          let pem = jwkToPem(jwk);
          pems[key_id] = pem;
        }

        let decodedJwt = jwt.decode(token, { complete: true });
        if (!decodedJwt) {
          console.log("Not a valid JWT token");
          callback(new Error("Not a valid JWT Token"));
        }
        let kid = decodedJwt.header.kid;
        let pem = pems[kid];

        if (!pem) {
          console.log("Invalid token");
          callback(new Error("Invalid token"));
        }

        jwt.verify(token, pem, function(err, payload) {
          if (err) {
            console.log("Invalid token");
            callback(new Error("Invalid token"));
          } else {
            console.log("Valid token");
            callback(null, "Valid token");
          }
        });
      } else {
        console.log("Error! Unable to download JWKs");
        callback(err);
      }
    }
  );
};
