package com.isdstore.auth;

import com.isdstore.auth.dto.AuthRequest;
import com.isdstore.auth.dto.AuthResponse;
import com.isdstore.common.entity.Role;
import com.isdstore.common.entity.User;
import com.isdstore.common.repo.RoleRepository;
import com.isdstore.common.repo.UserRepository;
import com.isdstore.security.JwtService;
import com.isdstore.security.TokenService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          TokenService tokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest req) {
        String email = req.getEmail().toLowerCase(Locale.ROOT).trim();
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            log.warn("Registration attempt with existing email {}", email);
            return ResponseEntity.badRequest().body("Email already in use");
        }
        Role userRole = roleRepository.findByName("user").orElseThrow(() -> new IllegalStateException("Missing role 'user'"));
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(userRole);
        userRepository.save(user);
        log.info("Registered new user {} with role {}", user.getId(), userRole.getName());
        return ResponseEntity.ok().body("registered");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        String email = req.getEmail().toLowerCase(Locale.ROOT).trim();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("Login failed for non-existent email {}", email);
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed for user {}: invalid password", user.getId());
            return ResponseEntity.status(401).build();
        }
        String role = user.getRole().getName();
    String access = jwtService.generateAccessToken(user.getId(), role);
    String refresh = jwtService.generateRefreshToken(user.getId(), role);
    // store in redis allowlist
    tokenService.storeToken("access", user.getId(), access, jwtService.getAccessTtlSeconds());
    tokenService.storeToken("refresh", user.getId(), refresh, jwtService.getRefreshTtlSeconds());
        log.info("User {} logged in", user.getId());
        return ResponseEntity.ok(new AuthResponse(access, refresh));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody(required = false) String refreshToken) {
        // TODO implement refresh JWT token
        return ResponseEntity.ok(new AuthResponse("new-access-token-stub", "refresh-token-stub"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // TODO invalidate refresh token (delete from REDIS)
        return ResponseEntity.ok().body("logged out (stub)");
    }
}
