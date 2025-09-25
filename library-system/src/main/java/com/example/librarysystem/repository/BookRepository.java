
package com.example.librarysystem.repository;

import com.example.librarysystem.entity.Author;
import com.example.librarysystem.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    @Override
    List<Book> findAll();
    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByAuthor_FirstNameContainingIgnoreCase(String firstName);
    List<Book> findByAuthor_LastNameContainingIgnoreCase(String lastName);
    boolean existsByTitleAndAuthor(String title, Author author);





}