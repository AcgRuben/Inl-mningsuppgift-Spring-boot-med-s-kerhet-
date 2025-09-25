package com.example.librarysystem.controller;

import com.example.librarysystem.dto.BookDTO;
import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public ResponseEntity<List<Loan>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    //Native sql
    @GetMapping("/active/{bookId}")
    public ResponseEntity<?> getActiveLoan(@PathVariable long bookId) {
        Optional<Loan> loanOpt = loanService.getActiveLoanForBook(bookId);

        return loanOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }



    @GetMapping("/{loanId}")
    public ResponseEntity<Loan> getLoanById(@PathVariable long loanId) {
        Loan loan = loanService.getLoanById(loanId);
        return ResponseEntity.ok(loan);

    }

    // Skapa nytt lån
    @PostMapping
    public ResponseEntity<String> createLoan(@RequestParam long userId, @RequestParam long bookId) {
        loanService.createLoan(userId, bookId);
        return ResponseEntity.ok("The book has been loaned to you. Enjoy it!");
    }


    @PutMapping("/{loanId}/return")
    public ResponseEntity<String> returnLoan(@PathVariable long loanId) {
        loanService.returnLoan(loanId);
        return ResponseEntity.ok("The book has been returned. Thank you for returning it!");
    }



    @PutMapping("/{loanId}/extend")
    public ResponseEntity<String> extendLoan(@PathVariable long loanId) {
        loanService.extendLoan(loanId);
        return ResponseEntity.ok("The book loan has been extended. Thank you for extending it!");
    }

}
