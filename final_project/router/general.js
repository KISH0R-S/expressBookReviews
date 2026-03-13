const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists! Please login." });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login." });
});

// Get the book list available in the shop — using async/await with Promise
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await new Promise((resolve) => resolve(books));
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get book details based on ISBN — using async/await with Promise
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await new Promise((resolve, reject) => {
      const found = books[isbn];
      if (found) resolve(found);
      else reject(new Error("Book not found"));
    });
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get book details based on author — using async/await with Promise
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const matchingBooks = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(
        (b) => b.author.toLowerCase() === author.toLowerCase()
      );
      if (result.length > 0) resolve(result);
      else reject(new Error("No books found for this author"));
    });
    return res.status(200).json({ books: matchingBooks });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get all books based on title — using async/await with Promise
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const matchingBooks = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(
        (b) => b.title.toLowerCase() === title.toLowerCase()
      );
      if (result.length > 0) resolve(result);
      else reject(new Error("No books found with this title"));
    });
    return res.status(200).json({ books: matchingBooks });
  } catch (err) {
    return res.status(404).json({ message: err.message });
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
