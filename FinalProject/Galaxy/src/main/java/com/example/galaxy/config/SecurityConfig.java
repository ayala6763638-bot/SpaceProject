package com.example.galaxy.config;

import com.example.galaxy.jwt.JwtFilter;
import com.example.galaxy.jwt.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final JwtFilter myJwtFilter;

    // הזרקת ה-Filter וה-Util דרך הקונסטרקטור
    public SecurityConfig(JwtUtil jwtUtil, JwtFilter myJwtFilter) {
        this.jwtUtil = jwtUtil;
        this.myJwtFilter = myJwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // ביטול CSRF חובה לעבודה עם JWT ובקשות POST
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // הגדרת ה-CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // עבודה ללא Session
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/login").permitAll() // דף התחברות פתוח לכולם

                        // התיקון הקריטי: מאפשר גישה לנתיבי הדיווח והחיזוי על בסיס התפקידים מהטוקן
                        .requestMatchers("/api/prediction/**").hasAnyRole("ADMIN", "ASTRONAUT")

                        // הגנה על שאר חלקי המערכת
                        .anyRequest().authenticated()
                )
                // הוספת הפילטר של ה-JWT לפני הפילטר הסטנדרטי של Spring
                .addFilterBefore(myJwtFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // Front-end של ויט/ריאקט
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails admin = User.builder()
                .username("Levi")
                .password(passwordEncoder.encode("password"))
                .roles("ADMIN")
                .build();

        UserDetails astronaut = User.builder()
                .username("AstronautUser")
                .password(passwordEncoder.encode("1234"))
                .roles("ASTRONAUT")
                .build();

        return new InMemoryUserDetailsManager(admin, astronaut);
    }
}