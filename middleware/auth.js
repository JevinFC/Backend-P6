const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Récupération du token d'authentification dans les headers de la requête
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // Vérification et décodage du token avec la clé secrète
    const userId = decodedToken.userId;
    req.auth = { userId };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
