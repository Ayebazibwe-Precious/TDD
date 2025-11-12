function borrowBook(book_title, available_books) {
  if (available_books.includes(book_title)) {
    // Remove the book
    const index = available_books.indexOf(book_title);
    available_books.splice(index, 1);
    return `You have borrowed '${book_title}'.`;
  } else {
    return `Sorry, '${book_title}' is not available.`;
  }
}
module.exports = borrowBook;
