package com.example.librarysystem.repository;

import com.example.librarysystem.dto.UserDTO;
import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailSafe(@Param("email")String email);


    Optional<User> findByFirstName(String username);

    boolean existsByFirstName(String username);
    boolean existsByEmail(String email);

    String email(String email);
}
