package com.socialmedia.websocket;

import com.socialmedia.auth.JwtService;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over SockJS WebSocket configuration.
 *
 * Connection URL:  ws://localhost:9090/ws  (SockJS fallback also works)
 *
 * Client destinations  →  /app/**   (handled by @MessageMapping methods)
 * Broker destinations  →  /topic/** (broadcast) and /user/queue/** (user-specific)
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService     jwtService;
    private final UserRepository userRepository;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // tighten in production
                .withSockJS();                   // SockJS fallback for older browsers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Destinations prefixed with /app are routed to @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
        // /topic → fan-out broadcast; /user/queue → per-user delivery
        config.enableSimpleBroker("/topic", "/queue");
        // Spring will prepend /user to make e.g. /user/queue/notifications
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Intercept the CONNECT frame and authenticate via the JWT passed in
     * the Authorization header (or query param for SockJS).
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String username = jwtService.extractUsername(token);
                            User user = userRepository.findByUsername(username)
                                    .orElseThrow();
                            if (jwtService.isTokenValid(token, user)) {
                                UsernamePasswordAuthenticationToken auth =
                                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                                accessor.setUser(auth);
                                log.debug("WebSocket CONNECT authenticated: user={}", username);
                            }
                        } catch (Exception e) {
                            log.warn("WebSocket CONNECT auth failed: {}", e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
