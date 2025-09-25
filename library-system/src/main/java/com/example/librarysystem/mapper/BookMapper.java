package com.example.librarysystem.mapper;


import com.example.librarysystem.dto.BookDTO;
import com.example.librarysystem.entity.Author;
import com.example.librarysystem.entity.Book;

public class BookMapper {

    public static BookDTO mapToDTO(Book book) {
        return new BookDTO(
                book.getId(),
                book.getTitle(),
                book.getPublicationYear(),
                book.getAvailableCopies(),
                book.getTotalCopies(),
                book.getAuthor().getFirstName() + " " + book.getAuthor().getLastName()
        );
    }

    public static Book mapToEntity(BookDTO dto, Author author) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setPublicationYear(dto.getPublicationYear());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAuthor(author);
        return book;
    }
}

