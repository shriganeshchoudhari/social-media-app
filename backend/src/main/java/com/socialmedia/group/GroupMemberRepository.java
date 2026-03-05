package com.socialmedia.group;

import com.socialmedia.user.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Optional<GroupMember> findByGroupAndUser(Group group, User user);

    boolean existsByGroupAndUser(Group group, User user);

    long countByGroup(Group group);

    long countByGroupAndRole(Group group, GroupMember.GroupRole role);

    List<GroupMember> findByGroup(Group group);

    List<GroupMember> findAllByGroupAndRole(Group group, GroupMember.GroupRole role);

    /** Used for auto-promote: find oldest non-admin member to promote when last admin leaves. */
    Optional<GroupMember> findFirstByGroupAndRoleNotOrderByJoinedAtAsc(Group group, GroupMember.GroupRole role);

    void deleteByGroup(Group group);
}
