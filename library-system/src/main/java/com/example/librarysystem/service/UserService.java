package com.example.librarysystem.service;

import com.example.librarysystem.dto.UserDTO;
import com.example.librarysystem.entity.User;
import com.example.librarysystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

    }

    public UserDTO findByEmailSafe(String email) {
        Optional<User> userOpt = userRepository.findByEmailSafe(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new UserDTO(user.getId(), user.getRegistrationDate(), user.getEmail(), user.getLastName(), user.getFirstName());
        } else {
            throw new NoSuchElementException("User not found with email: " + email);
        }
    }


    public UserDTO findByEmail(String email) {
       User user = userRepository.findByEmail(email);
       if (user == null) {
          throw new NoSuchElementException("User not found with email: " + email);
       }

        return new UserDTO(
                user.getId(),
                user.getRegistrationDate(),
                user.getEmail(),
                user.getLastName(),
                user.getFirstName()
        );

    }

    public User save(User user) {
        if (user.getId() != null) {
            throw new IllegalArgumentException("User ID cannot be set when saving a user");
        }
        return userRepository.save(user);
    }



    public void register(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Lösenordspolicy
        if (!isValidPassword(user.getPassword())) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters and contain both letters and numbers"
            );
        }

        // Kryptera lösenord
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        } else {
            user.setRole(user.getRole().replace("ROLE_", ""));
        }

        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            user.setFirstName(user.getEmail());
        }

        user.setEnabled(true);
        userRepository.save(user);
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        return hasLetter && hasDigit;
    }
}





