package com.ecobike.ecobike_backend;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AppUserRepository users;
    private final JwtService jwt;
    private final String frontendUrl;

    public OAuthSuccessHandler(AppUserRepository users,
                               JwtService jwt,
                               @Value("${app.frontend.url}") String frontendUrl) {
        this.users = users;
        this.jwt = jwt;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
        String email = oauth.getAttribute("email");
        String name = oauth.getAttribute("name");
        String googleId = oauth.getAttribute("sub");

        if (email == null) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/#error=google");
            return;
        }

        AppUser user = users.findByEmail(email).orElseGet(AppUser::new);
        if (user.getId() == null) {
            user.setEmail(email);
            user.setName(name != null ? name : email);
        }
        user.setGoogleId(googleId);
        users.save(user);

        String token = jwt.createToken(user);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/#token=" + token);
    }
}