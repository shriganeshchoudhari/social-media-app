package com.socialmedia.config;

import com.socialmedia.entity.User;
import com.socialmedia.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Initializing demo users...");

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
            user2.setBio("Designer and creator");
            user2.setIsActive(true);
            user2.setIsPrivate(false);
            user2.setIsVerified(false);

            userRepository.saveAll(java.util.List.of(user1, user2));
            log.info("Demo users created successfully: john@example.com, jane@example.com");
        }
    }
}