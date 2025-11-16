const borrowBook = require("./borrow-book");
test("borrows a book that is available", () => {
  const available_books = ["Roadmap", "2015", "The spirit level"];
  const message = borrowBook("2015", available_books);

  expect(message).toBe("You have borrowed '2015'.");
  expect(available_books).toEqual(["Roadmap", "The spirit level"]);
});

test("tries to borrow a book that is not available", () => {
  const available_books = ["Roadmap", "The spirit level"];
  const message = borrowBook("Get It Done", available_books);

  expect(message).toBe("Sorry, 'Get It Done' is not available.");
  expect(available_books).toEqual(["Roadmap", "The spirit level"]);
});

test("borrowing from an empty list", () => {
  const available_books = [];
  const message = borrowBook("2015", available_books);

  expect(message).toBe("Sorry, '2015' is not available.");
  expect(available_books).toEqual([]);
});

test("Check that the book name is always a string ", () => {
  const available_books = ["Roadmap", "The spirit level"];
  const bookName = 10
  const message = borrowBook(bookName, available_books);

  expect(message).toBe("Book name should always be a string");
});

test("Check that the available book is always an array ", () => {
  const available_books = "Roadmap";
  const bookName = "2015";
  const message = borrowBook(bookName, available_books);

  expect(message).toBe(
    "Available books should always be an array"
  );
});
