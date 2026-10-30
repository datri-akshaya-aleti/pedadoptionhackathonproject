package com.petadoption;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Map;

/**
 * JWT enforcement for the REST API.
 *
 * PUBLIC (no token needed):
 *   - /api/auth/**                 (login, register, verify)
 *   - GET  /api/pets, /api/pets/{id}  (browse pets)
 *   - /api/donations/**            (guest donations + Razorpay verification)
 *   - POST /api/reports            (anyone can report an abandoned / injured pet)
 *
 * ADMIN ONLY (token with role SHELTER_ADMIN):
 *   - PUT /api/applications/{id}/status
 *   - GET /api/users
 *   - GET /api/reports, PUT /api/reports/{id}/status
 *
 * Everything else under /api needs a valid "Authorization: Bearer <jwt>" header.
 */
@Configuration
public class JwtAuthConfig implements WebMvcConfigurer {

    private final JwtService jwtService;

    public JwtAuthConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new JwtInterceptor(jwtService)).addPathPatterns("/api/**");
    }

    static class JwtInterceptor implements HandlerInterceptor {
        private final JwtService jwtService;

        JwtInterceptor(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
            String method = req.getMethod();
            String path = req.getRequestURI();

            if ("OPTIONS".equalsIgnoreCase(method)) return true; // CORS preflight

            boolean isGet = "GET".equalsIgnoreCase(method);
            boolean isPost = "POST".equalsIgnoreCase(method);

            if (path.startsWith("/api/auth/")) return true;
            if (path.startsWith("/api/donations")) return true;
            if (isGet && (path.equals("/api/pets") || path.matches("/api/pets/\\d+"))) return true;
            if (isPost && path.equals("/api/reports")) return true;

            String header = req.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                return deny(res, 401, "Authentication required. Please sign in.");
            }
            Map<String, Object> claims = jwtService.validateToken(header.substring(7));
            if (!Boolean.TRUE.equals(claims.get("valid"))) {
                return deny(res, 401, "Session expired or invalid token. Please sign in again.");
            }

            boolean adminOnly =
                    (path.matches("/api/applications/\\d+/status") && "PUT".equalsIgnoreCase(method))
                            || path.equals("/api/users")
                            || path.equals("/api/reports")
                            || path.matches("/api/reports/\\d+/status");
            if (adminOnly && !"SHELTER_ADMIN".equals(claims.get("role"))) {
                return deny(res, 403, "Only shelter admins can perform this action.");
            }

            req.setAttribute("jwtClaims", claims);
            return true;
        }

        private boolean deny(HttpServletResponse res, int status, String message) throws Exception {
            res.setStatus(status);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"" + message + "\"}");
            return false;
        }
    }
}
