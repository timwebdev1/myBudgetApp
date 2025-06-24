package org.moneymatters.mm_backend.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.moneymatters.mm_backend.data.BudgetRepository;
import org.moneymatters.mm_backend.data.UserRepository;
import org.moneymatters.mm_backend.models.User;
import org.moneymatters.mm_backend.models.dto.LoginFormDto;
import org.moneymatters.mm_backend.models.dto.RegistrationFormDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "https://mybudgetapp-fe.netlify.app/"}, allowCredentials = "true")
public class AuthenticationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagController tagController;

    @Autowired
    private BudgetController budgetController;

    private static final String userSessionKey = "user";

//    Helper method to store user ID in session
    private static void setUserInSession(HttpSession session, User user) {
        session.setAttribute(userSessionKey, user.getUser_id());
    }

//    Helper method to retrieve user from session
    public User getUserFromSession(HttpSession session) {
        Integer user_id = (Integer) session.getAttribute(userSessionKey);
        if (user_id == null) {
            return null;
        }

        Optional<User> userOpt = userRepository.findById(user_id);
        return userOpt.orElse(null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException exception) {
        Map<String, Object> errorResponse = new HashMap<>();

        List<String> errors = exception.getBindingResult().getAllErrors().stream().map(ObjectError::getDefaultMessage).collect(Collectors.toList());

        errorResponse.put("error", "validation_error");
        errorResponse.put("message", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralExceptions(Exception exception) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "server_error");
        errorResponse.put("message", "An unexpected error occurred");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

//    Registration endpoints
    @GetMapping("/register")
    public ResponseEntity<Map<String, Object>> displayRegistrationForm(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration form loaded");
        response.put("isLoggedIn", session.getAttribute("user") != null);
        response.put("form", new RegistrationFormDto());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> processRegistrationForm(
            @RequestBody @Valid RegistrationFormDto registrationFormDto,
            HttpServletRequest request) {

        try {
                // Verify password match
                if (!registrationFormDto.getPassword().equals(registrationFormDto.getConfirmPassword())) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "password_mismatch");
                    errorResponse.put("message", "Passwords do not match");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }

                // Check if username already exists
                User existingUserUsername = userRepository.findByUsername(registrationFormDto.getUsername());
                if (existingUserUsername != null) {
                    Map<String , Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "username_exists");
                    errorResponse.put("message", "A user with that username already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
                }

                // Check if email already exists
                User existingUserEmail = userRepository.findByEmail(registrationFormDto.getEmail());
                if (existingUserEmail != null) {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "email_exists");
                    errorResponse.put("message", "A user with that email already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
                }

                // Create and save new user
                User newUser = new User(
                        registrationFormDto.getEmail(),
                        registrationFormDto.getUsername(),
                        registrationFormDto.getPassword()
                );

                userRepository.save(newUser);
                budgetController.createDefaultBudgets(newUser);
                tagController.createDefaultTags(newUser);
                setUserInSession(request.getSession(), newUser);

                //  Success response
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Registration successful");
                successResponse.put("userId", newUser.getUser_id());
                successResponse.put("username", newUser.getUsername());
                successResponse.put("email", newUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);



        } catch (DataIntegrityViolationException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "data_integrity_error");
            errorResponse.put("message", "Unable to create user due to data constraints");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "server_error");
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

//    Login endpoints
    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> displayLoginForm(HttpSession session){
        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login form loaded");
        response.put("isLoggedIn", session.getAttribute("user") != null);
        response.put("form", new LoginFormDto());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> processLoginForm(@RequestBody @Valid LoginFormDto loginFormDto, HttpServletRequest request) {

        try {
            User theUser = userRepository.findByEmail(loginFormDto.getEmail());

            // Send the User back to form is email does not exist OR if password hash doesn't match
            if (theUser == null || !theUser.isMatchingPassword(loginFormDto.getPassword())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "invalid_credentials");
                errorResponse.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            budgetController.createDefaultBudgets(theUser);
            tagController.createDefaultTags(theUser);
            setUserInSession(request.getSession(), theUser);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Login successful");
            successResponse.put("userId", theUser.getUser_id());
            successResponse.put("username", theUser.getUsername());
            successResponse.put("email", theUser.getEmail());

            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "server_error");
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Handler for logout
    @GetMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        request.getSession().invalidate();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Logged out successfully");

        return ResponseEntity.ok(response);
    }
    }


