const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");
router.get("/", verify, async (req, res) => {
  res.json({ posts: { title: "My first post", desc: "random post assigned" } });
  const myUser = await User.findById({ _id: req.user._id });
  console.log(myUser.name);
});

module.exports = router;
