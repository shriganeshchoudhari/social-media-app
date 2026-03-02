package com.socialmedia.notification;

import com.socialmedia.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    List<NotificationPreference> findByUser(User user);

    Optional<NotificationPreference> findByUserAndType(User user, Notification.Type type);

    /** Bulk-delete all preferences for a user (used when account is deleted). */
    @Modifying
    @Query("DELETE FROM NotificationPreference p WHERE p.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
