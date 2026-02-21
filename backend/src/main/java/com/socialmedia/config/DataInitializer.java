package com.socialmedia.config;

import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import com.socialmedia.repository.PostRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           PostRepository postRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {

            User user1 = new User();
            user1.setUsername("john_doe");
            user1.setEmail("john@example.com");
            user1.setPassword(passwordEncoder.encode("Password123!"));
            user1.setDisplayName("John Doe");
            user1.setBio("Software developer and tech enthusiast");
            user1.setIsActive(true);
            user1.setIsPrivate(false);
            user1.setIsVerified(false);

            User user2 = new User();
            user2.setUsername("jane_smith");
            user2.setEmail("jane@example.com");
            user2.setPassword(passwordEncoder.encode("Password123!"));
            user2.setDisplayName("Jane Smith");
            user2.setBio("Designer and content creator");
            user2.setIsActive(true);
            user2.setIsPrivate(false);
            user2.setIsVerified(true);

            userRepository.save(user1);
            userRepository.save(user2);

            Post post1 = new Post();
            post1.setUser(user1);
            post1.setContent("Hello everyone! Excited to join this platform! #introduction #newuser");
            post1.setPrivacyLevel("public");

            Post post2 = new Post();
            post2.setUser(user2);
            post2.setContent("Just finished a new design project! Check it out! #design #creative");
            post2.setPrivacyLevel("public");

            postRepository.save(post1);
            postRepository.save(post2);

            user1.setPostsCount(1);
            user2.setPostsCount(1);
            userRepository.save(user1);
            userRepository.save(user2);

            System.out.println("✓ Demo data initialized successfully!");
            System.out.println("  Login with: john@example.com / Password123!");
            System.out.println("  Login with: jane@example.com / Password123!");
        }
    }
}
