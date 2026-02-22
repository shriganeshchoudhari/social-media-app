package com.socialmedia.notification;

import com.socialmedia.user.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Domain events fired by business services (PostService, CommentService, FollowService).
 * The NotificationService listens to these asynchronously and persists Notification rows.
 */
public class NotificationEvent extends ApplicationEvent {

    @Getter private final User actor;
    @Getter private final User recipient;
    @Getter private final Notification.Type type;
    @Getter private final Long referenceId;   // postId, commentId, etc.
    @Getter private final String message;

    public NotificationEvent(Object source,
                              User actor,
                              User recipient,
                              Notification.Type type,
                              Long referenceId,
                              String message) {
        super(source);
        this.actor = actor;
        this.recipient = recipient;
        this.type = type;
        this.referenceId = referenceId;
        this.message = message;
    }
}
