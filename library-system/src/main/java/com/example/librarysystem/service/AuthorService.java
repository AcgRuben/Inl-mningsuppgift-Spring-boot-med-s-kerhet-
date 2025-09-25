package com.example.librarysystem.service;

import com.example.librarysystem.entity.Author;
import com.example.librarysystem.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public List<Author> searchAuthorByLastName(String lastName) {

        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name cannot be null or empty");
        }
        

        return authorRepository.findAuthorByLastNameContainingIgnoreCase(lastName);
    }

    public Author saveAuthor(Author author){
        if (author.getId() != null) {
            throw new IllegalArgumentException("Author ID cannot be set when saving an author");
        }
        return authorRepository.save(author);

    }
}