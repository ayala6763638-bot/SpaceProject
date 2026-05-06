package com.example.galaxy.config;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.jwt.JwtFilter;
import com.example.galaxy.jwt.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;



    @Configuration
    @EnableWebSecurity
    public class SecurityConfig {

        private final JwtUtil jwtUtil;

        public SecurityConfig(JwtUtil jwtUtil) {
            this.jwtUtil = jwtUtil;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            // צור מופע מקומי של הפילטר (לא @Bean!)
            JwtFilter myJwtFilter = new JwtFilter(jwtUtil);

            http
                    .csrf(AbstractHttpConfigurer::disable)
                   // החזרנו את ה-CORS לפעולה - זה קריטי!
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .formLogin(AbstractHttpConfigurer::disable)
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/auth/**", "/h2-console/**").permitAll()

                            // קודם כל חוקי המחיקה הספציפיים למנהלים בלבד
                            .requestMatchers(HttpMethod.DELETE, "/admin/**").hasRole("ADMIN")

                            // חוקים למנהלים בלבד
                            .requestMatchers("/admin/**").hasRole("ADMIN")

                            // חוקים משותפים
                            .requestMatchers("/api/prediction/**").hasAnyRole("ADMIN", "ASTRONAUT")
                            .requestMatchers("/missions/**").hasAnyRole("ADMIN", "ASTRONAUT")
                            .requestMatchers("/planets/**").hasAnyRole("ADMIN", "ASTRONAUT")
                            .requestMatchers("/astronauts/**").hasAnyRole("ADMIN", "ASTRONAUT")

                            .anyRequest().authenticated()
                    )
                    // הוספה ישירה של המופע
                    .addFilterBefore(myJwtFilter, UsernamePasswordAuthenticationFilter.class)
                    .headers(headers -> headers.frameOptions(frame -> frame.disable()));

            return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOrigins(List.of("http://localhost:5173"));
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(List.of("*"));
            configuration.setExposedHeaders(List.of("Authorization"));
            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
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

            UserDetails user = User.builder()
                    .username("AstronautUser")
                    .password(passwordEncoder.encode("1234"))
                    .roles("ASTRONAUT") 
                    .build();

            return new InMemoryUserDetailsManager(admin, user);
        }
        @Bean
        public RestTemplate restTemplate() {
            return new RestTemplate();
        }
    }

