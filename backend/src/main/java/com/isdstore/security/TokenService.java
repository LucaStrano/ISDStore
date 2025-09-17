package com.isdstore.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class TokenService {
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    private final StringRedisTemplate redis;

    public TokenService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    private String key(String typ, UUID userId, String token) {
        return String.format("auth:%s:%s:%s", typ, userId, token);
    }

    public void storeToken(String typ, UUID userId, String token, long ttlSeconds) {
        String key = key(typ, userId, token);
        redis.opsForValue().set(key, "1", Duration.ofSeconds(ttlSeconds));
        log.info("Stored {} token in Redis for user {} with TTL {}s", typ, userId, ttlSeconds);
    }

    public boolean isTokenValid(String typ, UUID userId, String token) {
        String key = key(typ, userId, token);
        boolean exists = Boolean.TRUE.equals(redis.hasKey(key));
        if (!exists) {
            log.warn("{} token not found/expired in Redis for user {}", typ, userId);
        }
        return exists;
    }

    public void invalidateToken(String typ, UUID userId, String token) {
        String key = key(typ, userId, token);
        redis.delete(key);
        log.info("Invalidated {} token for user {}", typ, userId);
    }
}
