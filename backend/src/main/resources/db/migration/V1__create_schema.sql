-- V1: Create initial schema matching existing Prisma models

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

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);

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

CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite);

CREATE TABLE recipe_ingredients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_grams  DECIMAL(8,2) NOT NULL,
    UNIQUE(recipe_id, ingredient_id)
);

CREATE INDEX idx_ri_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_ri_recipe ON recipe_ingredients(recipe_id);

CREATE TABLE cooking_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    cooked_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ch_cooked_at ON cooking_history(cooked_at);
CREATE INDEX idx_ch_recipe_cooked ON cooking_history(recipe_id, cooked_at);
CREATE INDEX idx_ch_recipe ON cooking_history(recipe_id);
