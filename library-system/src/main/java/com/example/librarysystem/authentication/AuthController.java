package com.example.librarysystem.authentication;

import com.example.librarysystem.entity.User;
import com.example.librarysystem.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {


        try {
            userService.register(user);
            return ResponseEntity.ok("User registered successfully!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin-page")
    public ResponseEntity<String> adminPage() {
        return ResponseEntity.ok("You are an admin!");
    }

    @GetMapping ("/user-page")
    public ResponseEntity<String> userPage() {
        return ResponseEntity.ok("You are a user!");
    }
}