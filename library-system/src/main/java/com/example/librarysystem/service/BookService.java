package com.example.librarysystem.service;

import com.example.librarysystem.dto.BookDTO;
import com.example.librarysystem.entity.Book;
import com.example.librarysystem.mapper.BookMapper;
import com.example.librarysystem.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

   public Page<BookDTO> getAllBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(BookMapper::mapToDTO);
   }

    public void deleteById(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new NoSuchElementException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);

    }

    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Book not found with id: " + id));

        return BookMapper.mapToDTO(book);
    }

    public List<BookDTO> searchBooksByTitle(String title) {

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        
        List<Book> books = bookRepository.findByTitleContainingIgnoreCase(title);

        return books.stream()
                .map(BookMapper::mapToDTO)
                .toList();
    }

    public List<BookDTO> searchBooksByAuthor(String author) {
        if (author == null || author.trim().isEmpty()) {
            throw new IllegalArgumentException("Author name cannot be null or empty");
        }

        if (author.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Author name cannot contain numbers");
        }


        List<Book> booksByFirstName = bookRepository.findByAuthor_FirstNameContainingIgnoreCase(author);
        List<Book> booksByLastName = bookRepository.findByAuthor_LastNameContainingIgnoreCase(author);

        List<BookDTO> result = Stream.concat(booksByFirstName.stream(), booksByLastName.stream())
                .distinct()
                .map(BookMapper::mapToDTO)
                .collect(Collectors.toList());


        return result;
    }

    public Book saveBook(Book book) {
        if (book.getId() != null) { 
            throw new IllegalArgumentException("Book ID cannot be set when saving a book");
        }

        if (bookRepository.existsByTitleAndAuthor(book.getTitle(), book.getAuthor())) {
            throw new IllegalArgumentException("Book with same title and author already exists");
        }

        return bookRepository.save(book);
    }


}