package com.socialmedia.group;

import com.socialmedia.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    /** My pending invitations (type=INVITE, status=PENDING). */
    List<GroupInvitation> findByInviteeAndTypeAndStatus(
            User invitee,
            GroupInvitation.InvitationType type,
            GroupInvitation.InvitationStatus status);

    /** Pending join requests for a group (type=JOIN_REQUEST, status=PENDING). */
    List<GroupInvitation> findByGroupAndTypeAndStatus(
            Group group,
            GroupInvitation.InvitationType type,
            GroupInvitation.InvitationStatus status);

    /** Existence check — prevent duplicate pending invite or request. */
    Optional<GroupInvitation> findByGroupAndInviteeAndTypeAndStatus(
            Group group,
            User invitee,
            GroupInvitation.InvitationType type,
            GroupInvitation.InvitationStatus status);

    void deleteByGroup(Group group);
}
