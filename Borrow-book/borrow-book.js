function borrowBook(book_title, available_books) {
  if (available_books.includes(book_title)) {
    // Remove the book
    const index = available_books.indexOf(book_title);
    available_books.splice(index, 1);

    const message = `You have borrowed '${book_title}'.`;
    const remaining = `Available books: [${available_books.join(", ")}]`;
    console.log(`${message} ${remaining}`);

    return message;
  } else {
    const message = `Sorry, '${book_title}' is not available.`;
    console.log(`${message} Available books: [${available_books.join(", ")}]`);

    return message;
  }
}

module.exports = borrowBook;
