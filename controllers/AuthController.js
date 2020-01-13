const authService = require("../services/AuthService");

exports.register = function(req, res) {
  let register = authService.Register(req.body, function(err, result) {
    if (err) {
      res.send(err);
    }

    res.send(result);
  });
};
