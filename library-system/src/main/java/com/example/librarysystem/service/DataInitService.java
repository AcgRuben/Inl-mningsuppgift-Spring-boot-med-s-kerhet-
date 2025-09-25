package com.example.librarysystem.service;

import com.example.librarysystem.entity.User;
import com.example.librarysystem.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DataInitService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.findByEmail("user@test.com") == null) {
            User user   = new User();
            user.setEmail("user@test.com");
            user.setFirstName("User");
            user.setLastName("Usersson");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole("USER");
            userRepository.save(user);
        }


        if (userRepository.findByEmail("admin@test.com") == null) {
            User user   = new User();
            user.setEmail("admin@test.com");
            user.setFirstName("Admin");
            user.setLastName("Adminsson");
            user.setPassword(passwordEncoder.encode("admin123"));
            user.setRole("ADMIN");
            userRepository.save(user);
        }
    }
}
