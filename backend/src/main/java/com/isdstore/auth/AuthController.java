package com.isdstore.auth;

import com.isdstore.auth.dto.AuthRequest;
import com.isdstore.auth.dto.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        // TODO implement user creation, hash password, persist user with role USER
        return ResponseEntity.ok().body("registered (stub)");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        // TODO validate credentials, issue access and refresh JWT tokens
        return ResponseEntity.ok(new AuthResponse("access-token-stub", "refresh-token-stub"));
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
