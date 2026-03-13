const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists! Please login." });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login." });
});

// Task 10: Get all books - using Promise callback
public_users.get('/', function (req, res) {
  new Promise((resolve) => {
    resolve(books);
  })
    .then((allBooks) => {
      return res.status(200).send(JSON.stringify(allBooks, null, 4));
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
});

// Task 11: Get book details based on ISBN - using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/');
    const book = response.data[isbn];
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Task 12: Get book details based on author - using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;
    const booksByAuthor = Object.values(allBooks).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );
    if (booksByAuthor.length > 0) {
      return res.status(200).json({ books: booksByAuthor });
    }
    return res.status(404).json({ message: "No books found for this author" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Task 13: Get all books based on title - using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;
    const booksByTitle = Object.values(allBooks).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (booksByTitle.length > 0) {
      return res.status(200).json({ books: booksByTitle });
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
