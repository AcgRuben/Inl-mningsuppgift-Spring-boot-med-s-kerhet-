package com.example.librarysystem.service;

import com.example.librarysystem.entity.Author;
import com.example.librarysystem.entity.Book;
import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.entity.User;
import com.example.librarysystem.repository.AuthorRepository;
import com.example.librarysystem.repository.BookRepository;
import com.example.librarysystem.repository.LoanRepository;
import com.example.librarysystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class LoanServiceTest {

    @Autowired
    private LoanService loanService;
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthorRepository authorRepository;
    @Autowired
    private LoanRepository loanRepository;


    private User testUser;
    private Book unavailableBook;
    private Book availableBook;
    private Author testAuthor;


    @BeforeEach
    void setUp() {

        testAuthor = new Author();
        testAuthor.setFirstName("Test");
        testAuthor.setLastName("Author");
        testAuthor = authorRepository.save(testAuthor);


        testUser = new User();
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("testpassword123");
        testUser = userRepository.save(testUser);


        unavailableBook = new Book();
        unavailableBook.setTitle("Unavailable Book");
        unavailableBook.setPublicationYear(2023);
        unavailableBook.setTotalCopies(1);
        unavailableBook.setAvailableCopies(0);
        unavailableBook.setAuthor(testAuthor);
        unavailableBook = bookRepository.save(unavailableBook);


        availableBook = new Book();
        availableBook.setTitle("Available Book");
        availableBook.setPublicationYear(2023);
        availableBook.setTotalCopies(5);
        availableBook.setAvailableCopies(3);
        availableBook.setAuthor(testAuthor);
        availableBook = bookRepository.save(availableBook);
    }

    @Test
    void createLoanShouldThrowExceptionWhenNoAvailableCopies() {

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            loanService.createLoan(testUser.getId(), unavailableBook.getId());
        });


        assertTrue(exception.getMessage().contains("No available copies"));

    }

    @Test
    void createLoanShouldSetCorrectDueDate() {
        // ARRANGE
        LocalDateTime beforeLoanCreation = LocalDateTime.now();
        
        // ACT
        assertDoesNotThrow(() -> {
            loanService.createLoan(testUser.getId(), availableBook.getId());
        });
        
        LocalDateTime afterLoanCreation = LocalDateTime.now();
        
        // ASSERT
        List<Loan> userLoans = loanService.getLoansByUserId(testUser.getId());
        assertFalse(userLoans.isEmpty(), "User should have at least one loan after loan creation");
        
        Loan createdLoan = userLoans.get(0);
        

        LocalDateTime expectedDueDateMin = beforeLoanCreation.plusDays(14);
        LocalDateTime expectedDueDateMax = afterLoanCreation.plusDays(14);
        
        assertNotNull(createdLoan.getDueDate(), "DueDate should not be null");
        assertTrue(createdLoan.getDueDate().isAfter(expectedDueDateMin.minusSeconds(1)));
        assertTrue(createdLoan.getDueDate().isBefore(expectedDueDateMax.plusSeconds(1)));
        

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(
            createdLoan.getBorrowedDate().toLocalDate(), 
            createdLoan.getDueDate().toLocalDate()
        );
        assertEquals(14, daysBetween, "DueDate should be 14 days from BorrowedDate");
        

    }
}