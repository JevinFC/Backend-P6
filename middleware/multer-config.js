const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const storage = multer.memoryStorage(); // Stockage en mémoire temporaire

const upload = multer({ storage }).single("image");

const processImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // Si aucun fichier n'est envoyé, passer à la suite
  }

  const fileName = `book_${Date.now()}.jpg`; // Nouveau nom du fichier
  const filePath = path.join("images", fileName);

  try {
    // Traitement de l'image avec Sharp
    await sharp(req.file.buffer)
      .resize({ width: 200, height: 260, fit: "cover" }) // Redimensionner à 200px de large et 260px de haut
      .jpeg({ quality: 80 }) // Convertir en JPEG avec 80% de qualité
      .toFile(filePath);

    req.file.filename = fileName; // On met à jour le nom du fichier dans la requête
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erreur lors du traitement de l'image" });
  }
};

module.exports = { upload, processImage };
