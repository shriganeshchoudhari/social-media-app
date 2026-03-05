package com.socialmedia.group.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class InviteUsersRequest {

    @NotEmpty(message = "At least one username is required")
    @Size(max = 50, message = "Cannot invite more than 50 users at once")
    private List<String> usernames;
}
