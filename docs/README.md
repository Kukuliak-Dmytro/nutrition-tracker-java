# Backend Architecture: Nutrition Tracker (Spring Boot)

The Java backend has been structured using a standard, idiomatic **Spring Boot Layered Architecture**, which ensures a clear separation of concerns, maintainability, and scalability.

Below is an overview of how the backend is organized and the responsibilities of each layer.

---

## 1. High-Level Architecture Overview

The backend is built with **Spring Boot 3** and **Java 21**, functioning as a REST API. The general flow of a request through the system looks like this:

`Client Request ➡️ Controller ➡️ Service ➡️ Repository ➡️ Database`

## 2. Directory & Layer Breakdown

All code resides under `src/main/java/com/nutritiontracker/`.

### 🌐 Controllers (`/controller`)
**Responsibility:** Handle HTTP requests and responses.
- **What they do:** Define API endpoints (e.g., `@GetMapping("/api/recipes")`), parse incoming JSON bodies into Request DTOs, trigger Jakarta Validation (`@Valid`), pass data to the Services, and return Response DTOs.
- **Example:** `RecipeController.java`, `IngredientController.java`.

### ⚙️ Services (`/service`)
**Responsibility:** Core business logic and transaction management.
- **What they do:** This is the "brain" of the application. Services process data, perform calculations, and orchestrate calls to the database. They are annotated with `@Transactional` to ensure data integrity during database operations.
- **Notable Services:**
  - `NutritionCalculationService`: Uses `BigDecimal` to accurately calculate macros for recipes based on ingredient quantities.
  - `CookingStreakService`: Calculates user cooking streaks using the modern `java.time` API.
  - `RecipeAiService`: Uses Spring’s `RestClient` to communicate with the Google Gemini API for recipe generation.

### 💾 Repositories (`/repository`)
**Responsibility:** Database access and abstraction.
- **What they do:** Interfaces extending Spring Data's `JpaRepository`. They handle all database operations natively.
- **Features:** 
  - They use **JPQL** (Java Persistence Query Language) for custom aggregations (e.g., getting the most cooked recipe).
  - They implement `JpaSpecificationExecutor` to allow dynamic, programmatic SQL queries for complex filtering (like searching by min/max calories, name, and ingredients simultaneously).

### 📦 Entities (`/entity`)
**Responsibility:** Object-Relational Mapping (ORM).
- **What they do:** Java classes annotated with `@Entity` that map directly to your PostgreSQL tables.
- **Relationships:** They define how tables relate to one another using annotations like `@OneToMany` and `@ManyToOne` (e.g., a `Recipe` has many `RecipeIngredient`s).

### 🔄 DTOs and Mappers (`/dto`, `/mapper`)
**Responsibility:** Decoupling the database schema from the API contract.
- **DTOs (Data Transfer Objects):** We use **Java Records** (immutable classes) to define exactly what JSON comes in (`request` DTOs) and exactly what JSON goes out (`response` DTOs). This means your database models (`Entities`) are never accidentally leaked to the frontend.
- **Mappers:** Static utility methods that cleanly copy data from an `Entity` to a `DTO` and vice versa.

---

## 3. Infrastructure & Cross-Cutting Concerns

### 🗄️ Database Migrations (Flyway)
Instead of Prisma managing the database, we use **Flyway**.
- SQL scripts are stored in `src/main/resources/db/migration` (e.g., `V1__create_schema.sql`).
- When Spring Boot starts, Flyway automatically checks the database state and runs any pending SQL scripts. This ensures the schema is always perfectly version-controlled.

### 🌱 Data Seeding (`/config/DataSeederConfig.java`)
On startup, if the database is empty, the `DataSeederConfig` reads `ingredients.json` and `recipes.json` from `src/main/resources/data/` using Jackson (a JSON parser) and injects the initial data into the tables.

### 🛡️ Exception Handling (`/exception/GlobalExceptionHandler.java`)
We have a centralized error handler utilizing `@RestControllerAdvice`.
- If a record is not found, or validation fails, this class catches the exception and returns a standardized JSON error response (e.g., `{ "error": "...", "details": [...] }`) that perfectly matches what the Next.js frontend expects.

### ♻️ Resilience
We use Spring `@Retryable` on critical database reads/writes. If a temporary database lock or transaction anomaly occurs, the backend will automatically back off and retry the operation, mimicking the custom retry logic you originally had in TypeScript.
