const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // Hashage du mot de passe avant de l'enregistrer
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error })); // Erreur si l'utilisateur ne peut pas être enregistré
    })
    .catch((error) => res.status(500).json({ error })); // Erreur serveur lors du hashage
};

// Connexion d'un utilisateur
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // Recherche de l'utilisateur par email
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" }); // Si l'utilisateur n'existe pas
      }
      bcrypt
        .compare(req.body.password, user.password) // Comparaison du mot de passe avec le hash enregistré
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" }); // Mot de passe incorrect
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.SECRET_KEY,
              { expiresIn: "24h" } // Génération d'un token JWT valide 24h
            ),
          });
        })
        .catch((error) => res.status(500).json({ error })); // Erreur serveur lors de la comparaison
    })
    .catch((error) => res.status(500).json({ error })); // Erreur serveur lors de la recherche de l'utilisateur
};
