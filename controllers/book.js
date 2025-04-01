const { title } = require("process");
const Book = require("../models/Book");
const fs = require("fs");
const { json } = require("express");

// Création d'un livre
exports.createBook = (req, res, next) => {
  console.log("Requête reçue:", req.body);
  const bookObject = JSON.parse(req.body.book); // Convertir la chaîne JSON en objet JS

  delete bookObject._id; // Supprimer l'ID envoyé par le client (MongoDB le génèrera automatiquement)
  delete bookObject._userId; // Supprimer l'ID utilisateur pour éviter toute modification frauduleuse

  // Vérifier s'il y a une note initiale
  const initialRating = bookObject.rating
    ? [{ userId: req.auth.userId, grade: bookObject.rating }]
    : [];

  // Calculer la moyenne initiale
  const averageRating = initialRating.length > 0 ? initialRating[0].grade : 0;

  // Création d'une nouvelle instance de Book
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Associer le livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    rating: bookObject.rating || [],
    averageRating: bookObject.averageRating || 0,
    genre: bookObject.genre,
    author: bookObject.author,
    title: bookObject.title,
    year: bookObject.year,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  const bookId = req.params.id;
  const userId = req.auth.userId;
  const newRating = req.body.rating;

  // Vérifier que la note est valide
  if (newRating < 0 || newRating > 5) {
    return res.status(400).json({ message: "La note doit être entre 0 et 5." });
  }

  Book.findOne({ _id: bookId })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find((r) => r.userId === userId);
      if (existingRating) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre." });
      }

      book.ratings.push({ userId, grade: newRating }); // Ajouter la note

      // Recalculer la moyenne des notes
      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = total / book.ratings.length;

      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Supprimer l'ancienne image si une nouvelle est ajoutée
        if (req.file && book.imageUrl) {
          const oldFilename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${oldFilename}`, (err) => {
            if (err)
              console.error("Erreur lors de la suppression de l'image :", err);
          });
        }
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Supprimer l'image associée au livre avant suppression
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Récupérer tous les livres
exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Récupérer les 3 livres les mieux notés
exports.BestRatedBook = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trier par note moyenne décroissante
    .limit(3) // Limiter à 3 résultats
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
