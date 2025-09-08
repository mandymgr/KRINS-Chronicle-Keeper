# Spring Boot Patterns

## Overview
Enterprise patterns for Spring Boot applications, focusing on clean architecture, testability, and performance.

## Pattern: Service Layer with Transaction Management

```java
@Service
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository, 
                      NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findById(Long userId) {
        return userRepository.findById(userId)
                .map(this::convertToDto);
    }

    public UserDto createUser(CreateUserRequest request) {
        validateRequest(request);
        
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .createdAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);
        
        // This will be part of the same transaction
        notificationService.sendWelcomeEmail(savedUser.getEmail());
        
        log.info("Created user with ID: {}", savedUser.getId());
        return convertToDto(savedUser);
    }

    @Transactional(rollbackFor = Exception.class)
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setName(request.getName());
        user.setUpdatedAt(Instant.now());

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void validateRequest(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }
    }
}
```

## Pattern: REST Controller with Validation

```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable @Min(1) Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserDto createdUser = userService.createUser(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdUser.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable @Min(1) Long id) {
        userService.deleteUser(id);
    }
}
```

## Pattern: Custom Exception Handler

```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("User Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        log.warn("User not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage()));

        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .fieldErrors(errors)
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .path(request.getRequestURI())
                .build();

        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

## Pattern: Configuration Properties

```java
@ConfigurationProperties(prefix = "app")
@Data
@Validated
public class ApplicationProperties {

    @NotNull
    @Valid
    private Database database = new Database();

    @NotNull 
    @Valid
    private Security security = new Security();

    @NotNull
    @Valid
    private Cache cache = new Cache();

    @Data
    public static class Database {
        @Min(1)
        @Max(100)
        private int maxPoolSize = 10;

        @Min(1000)
        private int connectionTimeout = 5000;

        @NotBlank
        private String migrationLocation = "classpath:db/migration";
    }

    @Data
    public static class Security {
        @NotBlank
        private String jwtSecret;

        @Min(300) // 5 minutes minimum
        private long jwtExpirationSeconds = 3600;

        @Size(min = 8)
        private String adminPassword;
    }

    @Data
    public static class Cache {
        @Min(1)
        private int maxSize = 1000;

        @Min(60) // 1 minute minimum
        private long ttlSeconds = 3600;

        private boolean enabled = true;
    }
}
```

## Pattern: Custom Repository with Specifications

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.lastLoginAt < :threshold")
    List<User> findInactiveUsersBefore(@Param("threshold") Instant threshold);
}

// Specifications for complex queries
public class UserSpecifications {

    public static Specification<User> hasEmail(String email) {
        return (root, query, criteriaBuilder) -> 
                criteriaBuilder.equal(root.get("email"), email);
    }

    public static Specification<User> createdAfter(Instant timestamp) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThan(root.get("createdAt"), timestamp);
    }

    public static Specification<User> hasRole(String roleName) {
        return (root, query, criteriaBuilder) -> {
            Join<User, Role> roleJoin = root.join("roles");
            return criteriaBuilder.equal(roleJoin.get("name"), roleName);
        };
    }

    public static Specification<User> isActive() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("active"));
    }
}
```

## Anti-Patterns

### ❌ Avoid: Service layer without transactions
```java
// Bad - no transaction management
@Service
public class BadUserService {
    public void createUserWithProfile(CreateUserRequest request) {
        User user = userRepository.save(new User(request));
        profileRepository.save(new Profile(user)); // Separate transaction!
    }
}

// Good - proper transaction boundaries
@Service
@Transactional
public class GoodUserService {
    public void createUserWithProfile(CreateUserRequest request) {
        User user = userRepository.save(new User(request));
        profileRepository.save(new Profile(user)); // Same transaction
    }
}
```

### ❌ Avoid: Exposing entities directly
```java
// Bad - exposing JPA entities
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElse(null);
}

// Good - using DTOs
@GetMapping("/users/{id}")
public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
    return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

## Best Practices

1. **Use DTOs** for API boundaries
2. **Implement proper exception handling** with @ControllerAdvice
3. **Apply transaction boundaries** at service layer
4. **Validate input data** with Bean Validation
5. **Use configuration properties** instead of hardcoded values
6. **Implement proper logging** with structured messages
7. **Write integration tests** with @SpringBootTest

## Testing Patterns

```java
@SpringBootTest
@Transactional
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldCreateUserSuccessfully() {
        CreateUserRequest request = new CreateUserRequest("test@example.com", "Test User");
        
        UserDto result = userService.createUser(request);
        
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getName()).isEqualTo("Test User");
    }
}
```

## Related ADRs
- ADR-005: Spring Boot Architecture Standards
- ADR-012: API Design Guidelines

## Last Updated
2025-09-07