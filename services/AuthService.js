global.fetch = require("node-fetch");
global.navigator = () => null;

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
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
