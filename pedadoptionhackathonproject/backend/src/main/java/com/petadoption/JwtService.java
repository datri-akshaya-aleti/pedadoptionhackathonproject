package com.petadoption;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret:PawshomeSecretKeyForJwtAuthenticationTokens2026!}")
    private String jwtSecret;

    private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000L; // 24 hours

    public String generateToken(User user) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
        return JWT.create()
                .withSubject(user.getEmail())
                .withClaim("userId", user.getId())
                .withClaim("name", user.getName())
                .withClaim("role", user.getRole())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .sign(algorithm);
    }

    public Map<String, Object> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
            DecodedJWT jwt = JWT.require(algorithm).build().verify(token);

            Map<String, Object> claims = new HashMap<>();
            claims.put("email", jwt.getSubject());
            claims.put("userId", jwt.getClaim("userId").asLong());
            claims.put("name", jwt.getClaim("name").asString());
            claims.put("role", jwt.getClaim("role").asString());
            claims.put("valid", true);
            return claims;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("error", e.getMessage());
            return error;
        }
    }
}
