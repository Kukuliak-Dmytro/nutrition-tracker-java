package com.nutritiontracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutritiontracker.dto.request.GenerateRecipeRequest;
import com.nutritiontracker.dto.response.GenerateRecipeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeAiService {

    private static final Logger log = LoggerFactory.getLogger(RecipeAiService.class);
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public RecipeAiService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }

    public GenerateRecipeResponse generateRecipe(GenerateRecipeRequest request) {
        if (!hasApiKey()) {
            throw new IllegalStateException("Missing Gemini API key");
        }

        String ingredientsText = request.ingredients().stream()
            .map(ing -> ing.name() + " - " + ing.quantityGrams() + "g")
            .collect(Collectors.joining(", "));

        String prompt = """
            You are a professional chef assistant.
            You are given a list of ingredients and their quantity that is used for this recipe.
            You need to generate description and instructions for this recipe with following rules:
            - Description should be a brief description of the recipe with max of 1 sentence.
            - Instructions should be a step-by-step guide for cooking the recipe.
            - Return instructions as a JSON array of strings (each string is one step, no numbering).
            
            The numbers of steps are gonna be set already, you don't need to add them.
            Here is the information about the recipe:
            - Name of the recipe: %s
            - Servings %d
            - Ingredients with their quantity in grams: %s
            
            Generate the description and instructions for the recipe in the following JSON format:
            {
                "description": "...",
                "instructions": ["Step ...", "Step ...", "Step ..."]
            }
            Return only the JSON object, no other text or comments.
            """.formatted(request.name(), request.servings(), ingredientsText);

        try {
            // Build Gemini API request
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

            // Parse Gemini response
            JsonNode root = objectMapper.readTree(response);
            String text = root.at("/candidates/0/content/parts/0/text").asText().trim();

            // Extract JSON from response
            JsonNode parsed = objectMapper.readTree(text);
            String description = parsed.get("description").asText();

            // Handle instructions: may be array or string
            String instructions;
            JsonNode instructionsNode = parsed.get("instructions");
            if (instructionsNode.isArray()) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < instructionsNode.size(); i++) {
                    if (i > 0) sb.append("\n");
                    sb.append(instructionsNode.get(i).asText());
                }
                instructions = sb.toString();
            } else {
                instructions = instructionsNode.asText();
            }

            return new GenerateRecipeResponse(description, instructions);

        } catch (Exception e) {
            log.error("Failed to generate recipe: ", e);
            throw new RuntimeException("Failed to generate recipe. Please try again.", e);
        }
    }
}
