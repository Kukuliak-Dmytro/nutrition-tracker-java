# Додаток А. Фрагменти програмного коду

*Для включення в пояснювальну записку курсової роботи. Розмістити після розділу «Список використаних джерел».*

---

## А.1. Контролер історії приготувань (CookingHistoryController)

*Файл: `backend/src/main/java/com/nutritiontracker/controller/CookingHistoryController.java`*

```java
@RestController
@RequestMapping("/api/cooking-history")
public class CookingHistoryController {

    private final CookingHistoryService cookingHistoryService;
    private final CookingStatsService cookingStatsService;
    private final NutritionSummaryService nutritionSummaryService;

    @GetMapping
    public ResponseEntity<PaginatedCookingHistoryResponse> getCookingHistory(
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {
        CookingHistoryQueryParams params = new CookingHistoryQueryParams(
            cursor, limit, search, startDate, endDate, sortBy, sortOrder
        );
        return ResponseEntity.ok(cookingHistoryService.getCookingHistory(params));
    }

    @PostMapping
    public ResponseEntity<CookingHistoryResponse> createCookingHistory(
            @Valid @RequestBody CreateCookingHistoryRequest request) {
        return ResponseEntity.ok(cookingHistoryService.createCookingHistory(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<CookingStatsResponse> getStats() {
        return ResponseEntity.ok(cookingStatsService.getStats());
    }

    @GetMapping("/nutrition")
    public ResponseEntity<NutritionSummaryResponse> getWeeklyNutrition() {
        return ResponseEntity.ok(nutritionSummaryService.getWeeklyNutrition());
    }
}
```

---

## А.2. Сервіс генерації рецептів за допомогою ШІ (RecipeAiService)

*Файл: `backend/src/main/java/com/nutritiontracker/service/RecipeAiService.java` (фрагмент)*

```java
public GenerateRecipeResponse generateRecipe(GenerateRecipeRequest request) {
    String ingredientsText = request.ingredients().stream()
        .map(ing -> ing.name() + " - " + ing.quantityGrams() + "g")
        .collect(Collectors.joining(", "));

    String prompt = """
        You are a professional chef assistant.
        ...
        - Name of the recipe: %s
        - Servings %d
        - Ingredients with their quantity in grams: %s
        ...
        Return only the JSON object with "description" and "instructions" (array of steps).
        """.formatted(request.name(), request.servings(), ingredientsText);

    Map<String, Object> requestBody = Map.of(
        "contents", List.of(
            Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
        ),
        "generationConfig", Map.of("responseMimeType", "application/json")
    );

    String response = restClient.post()
        .uri(GEMINI_URL + "?key=" + apiKey)
        .contentType(MediaType.APPLICATION_JSON)
        .body(requestBody)
        .retrieve()
        .body(String.class);

    JsonNode root = objectMapper.readTree(response);
    String text = root.at("/candidates/0/content/parts/0/text").asText().trim();
    JsonNode parsed = objectMapper.readTree(text);
    String description = parsed.get("description").asText();
    // ... обробка instructions (масив або рядок) ...
    return new GenerateRecipeResponse(description, instructions);
}
```

---

## А.3. Схема бази даних (фрагмент міграції Flyway)

*Файл: `backend/src/main/resources/db/migration/V1__create_schema.sql` (скорочено)*

```sql
CREATE TABLE ingredients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    calories    DECIMAL(8,2) NOT NULL,
    protein     DECIMAL(8,2) NOT NULL,
    carbs       DECIMAL(8,2) NOT NULL,
    fat         DECIMAL(8,2) NOT NULL,
    category    VARCHAR(255),
    is_custom   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recipes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    instructions  TEXT,
    servings      INT NOT NULL DEFAULT 1,
    cooking_time  VARCHAR(255),
    rating        SMALLINT,
    is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_grams  DECIMAL(8,2) NOT NULL,
    UNIQUE(recipe_id, ingredient_id)
);

CREATE TABLE cooking_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    cooked_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

*У пояснювальній записці можна включити ці фрагменти безпосередньо в розділ «Додатки» або посилатися на цей файл.*
