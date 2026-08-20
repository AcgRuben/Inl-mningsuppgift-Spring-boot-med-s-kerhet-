package com.example.librarysystem.service;

import com.example.librarysystem.entity.Book;
import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.entity.User;
import com.example.librarysystem.repository.BookRepository;
import com.example.librarysystem.repository.LoanRepository;
import com.example.librarysystem.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;


    public LoanService(LoanRepository loanRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public List<Loan> getLoansByUserId(long userId){
        if (userId <= 0){
            throw new IllegalArgumentException("User ID must be greater than 0. Given: " + userId);
        }
        return loanRepository.findByUser_UserId(userId);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(long loanId) {
        return loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("No loan exists with ID; " + loanId));
}

    @Transactional
    public void createLoan(Long userId, Long bookId) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("No books exists with ID; " + bookId));


        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies for book; " + book.getTitle());
        }


        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("No user exists with ID; " + userId));


        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setBorrowedDate(LocalDateTime.now());
        loan.setDueDate(LocalDateTime.now().plusDays(14));
        loan.setReturnedDate(null);



        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        loanRepository.save(loan);


    }

@Transactional
    public void returnLoan(long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Failed to find the loan with ID: " + loanId + ""));

        if (loan.getReturnedDate() != null) {
            throw new RuntimeException("Book has already been returned");
        }

        loan.setReturnedDate(LocalDateTime.now());

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);

        bookRepository.save(book);
        loanRepository.save(loan);



    }

    @Transactional
    public void extendLoan(long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Failed to find the loan with ID: " + loanId + ""));
        if (loan.getReturnedDate() != null) {
            throw new RuntimeException("Book has already been returned");
        }

       LocalDateTime newDueDate = loan.getDueDate().plusDays(7);
        loan.setDueDate(newDueDate);

        loanRepository.save(loan);
        System.out.println(loan.getLoanId() + " Loan has been extended to " + newDueDate);



    }

   public Optional<Loan> getActiveLoanForBook(Long bookId) {
        return loanRepository.findActiveLoanByBookIdNative(bookId);
    }

}