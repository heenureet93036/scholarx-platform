package com.scholarx.aireview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scholarx.aireview.model.ExtractedSkill;
import com.scholarx.aireview.repository.ExtractedSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiReviewService {

    private final ExtractedSkillRepository skillRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${hyperspace.base-url:#{null}}")
    private String hyperspaceBaseUrl;

    @Value("${hyperspace.api-key:#{null}}")
    private String hyperspaceApiKey;

    @Value("${hyperspace.model:claude-sonnet-4-6}")
    private String hyperspaceModel;

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    public void processResume(String scholarId, String resumeText, String targetRole) {
        log.info("Processing resume for scholar: {}", scholarId);

        String prompt = buildPrompt(resumeText);
        String jsonResponse = callAi(prompt);
        List<ExtractedSkill> skills = parseSkills(scholarId, jsonResponse);

        skillRepository.saveAll(skills);
        log.info("Saved {} skills for scholar: {}", skills.size(), scholarId);

        List<String> skillNames = skills.stream()
                .map(ExtractedSkill::getSkillName)
                .collect(Collectors.toList());

        kafkaTemplate.send("skills.extracted", Map.of(
                "scholarId", scholarId,
                "targetRole", targetRole,
                "skills", skillNames,
                "skillCount", skills.size()
        ));
    }

    private String callAi(String prompt) {
        if (hyperspaceBaseUrl != null && !hyperspaceBaseUrl.isBlank()
                && hyperspaceApiKey != null && !hyperspaceApiKey.isBlank()) {
            try {
                String result = callHyperspace(prompt);
                log.info("HyperspaceAI call succeeded");
                return result;
            } catch (Exception e) {
                log.warn("HyperspaceAI call failed ({}), falling back to Ollama", e.getMessage());
            }
        }
        return callOllama(prompt);
    }

    private String callHyperspace(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hyperspaceApiKey);

        Map<String, Object> body = Map.of(
                "model", hyperspaceModel,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 1024
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        Map<?, ?> response = restTemplate.postForObject(
                hyperspaceBaseUrl + "/chat/completions", entity, Map.class);

        if (response == null) return "[]";

        JsonNode root = objectMapper.valueToTree(response);
        return root.path("choices").path(0).path("message").path("content").asText("[]");
    }

    private String callOllama(String prompt) {
        try {
            Map<String, Object> request = Map.of(
                    "model", ollamaModel,
                    "prompt", prompt,
                    "stream", false
            );
            Map<?, ?> response = restTemplate.postForObject(
                    ollamaBaseUrl + "/api/generate", request, Map.class);
            return response != null ? (String) response.get("response") : "[]";
        } catch (Exception e) {
            log.error("Ollama call failed: {}", e.getMessage());
            return "[]";
        }
    }

    private String buildPrompt(String resumeText) {
        return """
                You are a skill extraction engine. Extract all technical skills from this resume.
                Return ONLY a JSON array. No explanation, no markdown, no code fences.
                Each object must have: skillName (string), source (one of: rotation, academic-project, hackathon, bootcamp, certification, open-source), level (beginner/intermediate/expert).
                Example: [{"skillName":"Java","source":"rotation","level":"intermediate"}]
                Resume:
                """ + resumeText;
    }

    private List<ExtractedSkill> parseSkills(String scholarId, String jsonResponse) {
        List<ExtractedSkill> skills = new ArrayList<>();
        try {
            String cleaned = jsonResponse.trim();
            int start = cleaned.indexOf('[');
            int end = cleaned.lastIndexOf(']');
            if (start == -1 || end == -1) return skills;

            JsonNode array = objectMapper.readTree(cleaned.substring(start, end + 1));
            for (JsonNode node : array) {
                String skillName = node.path("skillName").asText().trim();
                if (skillName.isEmpty()) continue;
                ExtractedSkill skill = new ExtractedSkill();
                skill.setScholarId(scholarId);
                skill.setSkillName(skillName);
                skill.setSource(node.path("source").asText("rotation"));
                skill.setLevel(node.path("level").asText("intermediate"));
                skill.setExtractedAt(LocalDateTime.now());
                skills.add(skill);
            }
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
        }
        return skills;
    }
}
