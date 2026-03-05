package com.socialmedia.group.dto;

import com.socialmedia.group.Group;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateGroupRequest {

    @NotBlank(message = "Group name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String name;

    @Size(max = 500, message = "Description must be ≤ 500 characters")
    private String description;

    @Size(max = 1000, message = "Rules must be ≤ 1000 characters")
    private String rules;

    private Group.Privacy privacy = Group.Privacy.PUBLIC;
}
