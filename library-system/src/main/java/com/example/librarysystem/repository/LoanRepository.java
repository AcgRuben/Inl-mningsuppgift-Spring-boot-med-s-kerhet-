package com.example.librarysystem.repository;

import com.example.librarysystem.entity.Loan;
import com.example.librarysystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface LoanRepository extends JpaRepository <Loan, Long> {

    List<Loan> findByUser_UserId(Long userId);
    @Query(value = "SELECT * FROM loans WHERE book_id = :bookId AND returned_date IS NULL LIMIT 1", nativeQuery = true)
    Optional<Loan> findActiveLoanByBookIdNative(@Param("bookId") Long bookId);





}
