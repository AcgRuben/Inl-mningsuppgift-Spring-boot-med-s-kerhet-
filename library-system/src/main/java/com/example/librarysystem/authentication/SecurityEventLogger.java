package com.example.librarysystem.authentication;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class SecurityEventLogger {

    private final ObjectMapper mapper = new ObjectMapper();

    @EventListener
    public void handleLoginSuccess(AuthenticationSuccessEvent event) {
        try {
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("event", "LOGIN_SUCCESS");
            logEntry.put("username", event.getAuthentication().getName());

            System.out.println(mapper.writeValueAsString(logEntry));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @EventListener
    public void handleLoginFailure(AuthenticationFailureBadCredentialsEvent event) {
        try {
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("event", "LOGIN_FAILURE");
            logEntry.put("username", event.getAuthentication().getName());
            logEntry.put("reason", "Bad credentials");

            System.out.println(mapper.writeValueAsString(logEntry));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
