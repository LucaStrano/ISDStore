package com.isdstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final Key key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.accessTtlSeconds}") long accessTtlSeconds,
            @Value("${app.jwt.refreshTtlSeconds}") long refreshTtlSeconds
    ) {
        this.key = initKey(secret);
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    private Key initKey(String secret) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ex) {
            // Not valid Base64; use raw bytes
            log.warn("JWT secret is not valid Base64; using raw string bytes.");
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                keyBytes = md.digest(keyBytes); // 32 bytes
                log.warn("JWT secret was too short; derived 256-bit key via SHA-256.");
            } catch (Exception e) {
                throw new IllegalStateException("Unable to initialize JWT key", e);
            }
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UUID userId, String role) {
        return generateToken(userId, role, accessTtlSeconds, Map.of("typ", "access"));
    }

    public String generateRefreshToken(UUID userId, String role) {
        return generateToken(userId, role, refreshTtlSeconds, Map.of("typ", "refresh"));
    }

    private String generateToken(UUID userId, String role, long ttlSeconds, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(ttlSeconds);
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userId.toString())
                .claim("role", role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
        log.info("Generated {} token for user {} expiring at {}", extraClaims.get("typ"), userId, exp);
        return token;
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public long getAccessTtlSeconds() {
        return accessTtlSeconds;
    }

    public long getRefreshTtlSeconds() {
        return refreshTtlSeconds;
    }
}
