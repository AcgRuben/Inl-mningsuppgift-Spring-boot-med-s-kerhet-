package com.example.librarysystem.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "authors")
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "author_id")
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "birth_year")
    private int birthYear;

    @Column(name = "nationality")
    private String nationality;
     @JsonIgnore
    @OneToMany(mappedBy = "author")
    private List<Book> books;


    public Author() {
    }

    public String getFirstName() { return firstName;}
    public void setFirstName(String name)  {this.firstName = name; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLastName() {return lastName;}
    public void setLastName(String lastName) {this.lastName = lastName;}

    public int getBirthYear() {return birthYear;}
    public void setBirthYear(int birthYear) {this.birthYear = birthYear;}

    public String getNationality() {return nationality;}
    public void setNationality(String nationality) {this.nationality = nationality;}

    public List<Book> getBooks() {
        return books;
    }

    public void setBooks(List<Book> books) {
        this.books = books;
    }



}
