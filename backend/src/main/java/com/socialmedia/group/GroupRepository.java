package com.socialmedia.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT g FROM Group g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Group> searchByName(@Param("q") String q);

    @Query("SELECT g FROM Group g JOIN GroupMember m ON m.group = g WHERE m.user.id = :userId ORDER BY m.joinedAt DESC")
    List<Group> findGroupsByMemberId(@Param("userId") Long userId);

    Page<Group> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
