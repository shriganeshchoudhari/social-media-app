package com.socialmedia.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.QueryHint;
import org.hibernate.jpa.HibernateHints;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @QueryHints(@QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"))
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "OR LOWER(u.displayName) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<User> search(@Param("q") String q, Pageable pageable);

    long countByRole(User.Role role);
}
