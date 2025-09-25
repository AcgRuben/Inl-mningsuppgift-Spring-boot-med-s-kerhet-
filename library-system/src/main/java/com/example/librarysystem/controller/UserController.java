package com.example.librarysystem.controller;

import com.example.librarysystem.dto.UserDTO;
import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.entity.User;
import com.example.librarysystem.service.LoanService;
import com.example.librarysystem.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/users")
public class UserController {
    private UserService userService;
    private LoanService loanService;




    public UserController(UserService userService, LoanService loanService) {
        this.userService = userService;
        this.loanService = loanService;
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String email) {
        UserDTO user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}/loans")
    public ResponseEntity<List<Loan>> getUserLoans(@PathVariable long userId){
        List<Loan> loans = loanService.getLoansByUserId(userId);
        return ResponseEntity.ok(loans);
    }


    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.save(user));
    }

@GetMapping("/safe/{email}")
public ResponseEntity<UserDTO> getUserSafe(@PathVariable String email) {
    try {
        UserDTO user = userService.findByEmailSafe(email);
        return ResponseEntity.ok(user);
    } catch (NoSuchElementException e) {
        return ResponseEntity.notFound().build();
    }
}
}