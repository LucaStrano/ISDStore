package com.isdstore.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Reference Monitor style filter: validate JWT & attach security context.
 * Simplified stub – does not actually parse JWT yet.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final TokenService tokenService;

    public JwtAuthFilter(JwtService jwtService, TokenService tokenService) {
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                Claims claims = jwtService.parseToken(token);
                String typ = claims.get("typ", String.class);
                if (!"access".equals(typ)) {
                    log.warn("Rejected non-access token presented in Authorization header");
                } else {
                    UUID userId = UUID.fromString(claims.getSubject());
                    String role = claims.get("role", String.class);
                    if (tokenService.isTokenValid("access", userId, token)) {
                        java.util.List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.info("Authenticated request for user {} with role {}", userId, role);
                    }
                }
            } catch (Exception e) {
                log.warn("JWT validation failed: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
