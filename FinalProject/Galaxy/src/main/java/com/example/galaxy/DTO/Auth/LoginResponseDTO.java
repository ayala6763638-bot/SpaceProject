package com.example.galaxy.DTO.Auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String role;
    private Long id; // <--- זה השדה החסר!

    // הגטרים ייוצרו אוטומטית על ידי @Data, אבל אם את כותבת ידנית:
    public String getToken() { return token; }
    public String getRole() { return role; }
    public Long getId() { return id; } // <--- להוסיף גטר
}