const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); //On utilise le plugin uniqueValidator pour s'assurer que l'email est unique dans la base de données.

module.exports = mongoose.model("User", userSchema);
