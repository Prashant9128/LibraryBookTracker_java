package com.library;

import java.util.Scanner;

public class LibraryBookTracker {
    public static void main(String[] args) {
        Library library = new Library();
        Scanner scanner = new Scanner(System.in);
        String command;

        System.out.println("Welcome to Library Book Tracker!");
        System.out.println("Commands: add, list, remove, exit");

        while (true) {
            System.out.print("> ");
            command = scanner.nextLine();

            if (command.equalsIgnoreCase("exit")) {
                break;
            } else if (command.equalsIgnoreCase("add")) {
                System.out.print("Enter title: ");
                String title = scanner.nextLine();
                System.out.print("Enter author: ");
                String author = scanner.nextLine();
                System.out.print("Enter ISBN: ");
                String isbn = scanner.nextLine();
                library.addBook(new Book(title, author, isbn));
            } else if (command.equalsIgnoreCase("list")) {
                library.listBooks();
            } else if (command.equalsIgnoreCase("remove")) {
                System.out.print("Enter ISBN to remove: ");
                String isbn = scanner.nextLine();
                library.removeBook(isbn);
            } else {
                System.out.println("Unknown command.");
            }
        }
        
        System.out.println("Goodbye!");
    }
}
