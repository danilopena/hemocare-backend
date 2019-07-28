const jwt = require("jsonwebtoken");
const User = require("../model/User");
const auth = async (req, res, next) => {
  try {
    const token = req
      .header("Authorization")
      .replace("Bearer", "")
      .trim();

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });
    req.user = user;
    req.token = token;

    res.status(200).send({ user });
    next();
  } catch (error) {
    res.status(401).send({ msg: "Proceda com a autenticação corretamente. " });
  }
};
module.exports = auth;
