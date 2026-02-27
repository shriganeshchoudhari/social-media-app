package com.socialmedia.config;

import com.socialmedia.comment.Comment;
import com.socialmedia.comment.CommentRepository;
import com.socialmedia.follow.Follow;
import com.socialmedia.follow.FollowRepository;
import com.socialmedia.notification.Notification;
import com.socialmedia.notification.NotificationRepository;
import com.socialmedia.post.Post;
import com.socialmedia.post.PostLike;
import com.socialmedia.post.PostLikeRepository;
import com.socialmedia.post.PostRepository;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds demo data on application startup when the "dev" profile is active.
 *
 * Activate with:  --spring.profiles.active=postgres,dev
 *
 * The seeder is idempotent — it skips seeding if the "alice" user already exists.
 *
 * Demo credentials (all share the same password for convenience):
 *   alice / Password1!
 *   bob   / Password1!
 *   carol / Password1!
 *   dave  / Password1!
 *   eve   / Password1!
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository         userRepo;
    private final PostRepository         postRepo;
    private final CommentRepository      commentRepo;
    private final PostLikeRepository     likeRepo;
    private final FollowRepository       followRepo;
    private final NotificationRepository notifRepo;
    private final PasswordEncoder        passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepo.existsByUsername("alice")) {
            log.info("[DataSeeder] Seed data already present — skipping.");
            return;
        }

        log.info("[DataSeeder] Seeding demo data …");

        // ── 1. Users ─────────────────────────────────────────
        String hash = passwordEncoder.encode("Password1!");

        // Admin account (login with admin / Password1! to access /admin)
        save(User.builder()
                .username("admin").email("admin@demo.com").password(hash)
                .displayName("Admin").bio("Platform administrator")
                .role(User.Role.ADMIN)
                .build());

        User alice = save(User.builder()
                .username("alice").email("alice@demo.com").password(hash)
                .displayName("Alice Wonderland")
                .bio("Curiouser and curiouser 🐇")
                .build());

        User bob = save(User.builder()
                .username("bob").email("bob@demo.com").password(hash)
                .displayName("Bob Builder")
                .bio("Can we fix it? Yes we can! 🔨")
                .build());

        User carol = save(User.builder()
                .username("carol").email("carol@demo.com").password(hash)
                .displayName("Carol Danvers")
                .bio("Higher, further, faster ✨")
                .build());

        User dave = save(User.builder()
                .username("dave").email("dave@demo.com").password(hash)
                .displayName("Dave Grohl")
                .bio("Drummer turned frontman 🥁")
                .build());

        User eve = save(User.builder()
                .username("eve").email("eve@demo.com").password(hash)
                .displayName("Eve Online")
                .bio("Exploring the universe 🚀")
                .build());

        // ── 2. Follow graph ───────────────────────────────────
        // alice ↔ bob (mutual), carol → alice, carol → bob,
        // dave → alice, eve → bob, alice → carol
        follow(alice, bob);
        follow(bob, alice);
        follow(carol, alice);
        follow(carol, bob);
        follow(dave, alice);
        follow(eve, bob);
        follow(alice, carol);

        // Refresh counts after follows
        userRepo.saveAll(List.of(alice, bob, carol, dave, eve));

        // ── 3. Posts ─────────────────────────────────────────
        Post p1 = savePost(alice, "Hello ConnectHub! 👋 Excited to join this platform. #intro #hello", Post.Privacy.PUBLIC);
        Post p2 = savePost(alice, "Just finished reading 'Alice in Wonderland' again. Some things never get old 📚 #books #reading", Post.Privacy.PUBLIC);
        Post p3 = savePost(bob,   "Built my first standing desk today! Productivity through the roof 🔨 #diy #productivity", Post.Privacy.PUBLIC);
        Post p4 = savePost(bob,   "Coffee ☕ + code = perfect morning. What's your morning routine? #coding #coffee", Post.Privacy.PUBLIC);
        Post p5 = savePost(carol, "Just watched the most amazing meteor shower last night 🌠 #space #stargazing", Post.Privacy.PUBLIC);
        Post p6 = savePost(carol, "Training update: 10km run in 48 minutes! New personal best 🏃‍♀️ #fitness #running", Post.Privacy.FOLLOWERS_ONLY);
        Post p7 = savePost(dave,  "New drum cover dropping this weekend 🥁 Stay tuned! #music #drums", Post.Privacy.PUBLIC);
        Post p8 = savePost(eve,   "The universe is 13.8 billion years old and I still can't find my keys 😂 #space #relatable", Post.Privacy.PUBLIC);
        Post p9 = savePost(alice, "Pro tip: name your variables properly. Future you will thank you 💡 #coding #tips", Post.Privacy.PUBLIC);
        Post p10 = savePost(bob,  "Weekend project done! Built a bird feeder from scratch 🐦 #diy #nature", Post.Privacy.PUBLIC);

        // ── 4. Likes ─────────────────────────────────────────
        like(bob,   p1);  like(carol, p1);  like(dave, p1);   // alice's intro — 3 likes
        like(bob,   p2);  like(eve,   p2);                    // alice's books — 2 likes
        like(alice, p3);  like(carol, p3);  like(eve, p3);    // bob's desk — 3 likes
        like(alice, p4);  like(carol, p4);  like(dave, p4);   // bob's coffee — 3 likes
        like(alice, p5);  like(bob,   p5);  like(eve, p5);    // carol's stars — 3 likes
        like(alice, p7);  like(bob,   p7);                    // dave's drums — 2 likes
        like(alice, p8);  like(bob,   p8);  like(carol, p8);  // eve's joke — 3 likes
        like(bob,   p9);  like(carol, p9);  like(dave, p9);   // alice's tip — 3 likes
        like(alice, p10); like(carol, p10);                   // bob's bird feeder — 2 likes

        // ── 5. Comments ───────────────────────────────────────
        comment(bob,   p1, "Welcome to the platform, Alice! 🎉");
        comment(carol, p1, "So glad you're here! Love your vibe already ❤️");
        comment(alice, p3, "That looks amazing Bob! Can you share the plans?");
        comment(eve,   p3, "Goals! I need one of these for my home office.");
        comment(alice, p4, "Tea person here 🍵 but I get the sentiment!");
        comment(dave,  p5, "I missed it! Was cloudy here 😭");
        comment(alice, p7, "Can't wait! Your covers are always 🔥");
        comment(carol, p8, "This is too relatable 😂😂😂");
        comment(bob,   p9, "100% agree. Past me was terrible at naming things 😅");
        comment(alice, p10, "Aww! Send photos when the birds show up 🐦");

        // ── 6. Notifications (FOLLOW + LIKE samples) ─────────
        notif(alice, bob,   Notification.Type.FOLLOW, null,   "bob started following you");
        notif(alice, carol, Notification.Type.FOLLOW, null,   "carol started following you");
        notif(alice, dave,  Notification.Type.FOLLOW, null,   "dave started following you");
        notif(alice, bob,   Notification.Type.LIKE,   p1.getId(), "bob liked your post");
        notif(alice, carol, Notification.Type.LIKE,   p1.getId(), "carol liked your post");
        notif(alice, bob,   Notification.Type.COMMENT, p1.getId(), "bob commented on your post");
        notif(bob,   alice, Notification.Type.FOLLOW, null,   "alice started following you");
        notif(bob,   carol, Notification.Type.FOLLOW, null,   "carol started following you");
        notif(bob,   alice, Notification.Type.LIKE,   p3.getId(), "alice liked your post");
        notif(carol, alice, Notification.Type.FOLLOW, null,   "alice started following you");

        log.info("[DataSeeder] ✅ Seeded 5 users, 10 posts, {} likes, {} comments, {} notifications.",
                likeRepo.count(), commentRepo.count(), notifRepo.count());
    }

    // ── Helpers ───────────────────────────────────────────────

    private User save(User u) { return userRepo.save(u); }

    private Post savePost(User author, String content, Post.Privacy privacy) {
        Post p = postRepo.save(Post.builder()
                .author(author).content(content).privacy(privacy).build());
        author.setPostsCount(author.getPostsCount() + 1);
        return p;
    }

    private void like(User user, Post post) {
        if (likeRepo.existsByPostAndUser(post, user)) return;
        likeRepo.save(PostLike.builder().post(post).user(user).build());
        post.setLikesCount(post.getLikesCount() + 1);
        postRepo.save(post);
    }

    private void comment(User author, Post post, String text) {
        commentRepo.save(Comment.builder().author(author).post(post).content(text).build());
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepo.save(post);
    }

    private void follow(User follower, User following) {
        if (followRepo.existsByFollowerAndFollowing(follower, following)) return;
        followRepo.save(Follow.builder().follower(follower).following(following).build());
        follower.setFollowingCount(follower.getFollowingCount() + 1);
        following.setFollowersCount(following.getFollowersCount() + 1);
    }

    private void notif(User recipient, User actor, Notification.Type type, Long refId, String msg) {
        notifRepo.save(Notification.builder()
                .recipient(recipient).actor(actor)
                .type(type).referenceId(refId).message(msg)
                .build());
    }
}
