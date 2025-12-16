package com.library;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Allow frontend access if running separately, though here we serve static
public class LibraryController {

    private final Library library;

    public LibraryController(Library library) {
        this.library = library;
    }

    @GetMapping
    public List<Book> getBooks() {
        return library.getBooks();
    }

    @PostMapping
    public void addBook(@RequestBody Book book) {
        library.addBook(book);
    }

    @PutMapping("/{isbn}/status")
    public void toggleStatus(@PathVariable String isbn) {
        library.toggleStatus(isbn);
    }

    @DeleteMapping("/{isbn}")
    public void removeBook(@PathVariable String isbn) {
        library.removeBook(isbn);
    }
}
