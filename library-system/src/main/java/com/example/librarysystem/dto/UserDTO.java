package com.example.librarysystem.dto;

import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;

public class UserDTO {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime registrationDate;

    public UserDTO() {
    }

    public UserDTO(Long userId, LocalDateTime registrationDate, String email, String lastName, String firstName) {
        this.userId = userId;
        this.registrationDate = registrationDate;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }
}
