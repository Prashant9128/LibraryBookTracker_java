package com.library;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class Library {
    private List<Book> books;

    public Library() {
        this.books = new ArrayList<>();
        // Add some sample data
        this.books.add(new Book("The Great Gatsby", "F. Scott Fitzgerald", "9780743273565"));
        this.books.add(new Book("To Kill a Mockingbird", "Harper Lee", "9780061120084"));
        this.books.add(new Book("1984", "George Orwell", "9780451524935"));
    }

    public void addBook(Book book) {
        books.add(book);
        System.out.println("Book added: " + book.getTitle());
    }

    public void removeBook(String isbn) {
        books.removeIf(book -> book.getIsbn().equals(isbn));
        System.out.println("Book removed with ISBN: " + isbn);
    }

    public void listBooks() {
        if (books.isEmpty()) {
            System.out.println("No books in the library.");
        } else {
            System.out.println("Listing all books:");
            for (Book book : books) {
                System.out.println(book);
            }
        }
    }

    public List<Book> getBooks() {
        return books;
    }
}
