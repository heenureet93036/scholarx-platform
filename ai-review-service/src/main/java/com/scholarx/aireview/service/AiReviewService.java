package com.scholarx.aireview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scholarx.aireview.model.ExtractedSkill;
import com.scholarx.aireview.repository.ExtractedSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiReviewService {

    private final ExtractedSkillRepository skillRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    public void processResume(String scholarId, String resumeText, String targetRole) {
        log.info("Processing resume for scholar: {}", scholarId);

        String prompt = buildPrompt(resumeText);
        String jsonResponse = callOllama(prompt);
        List<ExtractedSkill> skills = parseSkills(scholarId, jsonResponse);

        skillRepository.saveAll(skills);
        log.info("Saved {} skills for scholar: {}", skills.size(), scholarId);

        kafkaTemplate.send("skills.extracted", Map.of(
                "scholarId", scholarId,
                "targetRole", targetRole,
                "skillCount", skills.size()
        ));
    }

    private String buildPrompt(String resumeText) {
        return """
                You are a skill extraction engine. Extract all skills from this resume.
                Return ONLY a JSON array with objects having fields: skillName, source, level (beginner/intermediate/expert).
                Sources can be: rotation, academic-project, hackathon, bootcamp, certification, open-source.
                Resume:
                """ + resumeText;
    }

    private String callOllama(String prompt) {
        try {
            Map<String, Object> request = Map.of(
                    "model", ollamaModel,
                    "prompt", prompt,
                    "stream", false
            );
            Map response = restTemplate.postForObject(
                    ollamaBaseUrl + "/api/generate", request, Map.class);
            return response != null ? (String) response.get("response") : "[]";
        } catch (Exception e) {
            log.error("Ollama call failed: {}", e.getMessage());
            return "[]";
        }
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
                ExtractedSkill skill = new ExtractedSkill();
                skill.setScholarId(scholarId);
                skill.setSkillName(node.path("skillName").asText());
                skill.setSource(node.path("source").asText());
                skill.setLevel(node.path("level").asText());
                skill.setExtractedAt(LocalDateTime.now());
                skills.add(skill);
            }
        } catch (Exception e) {
            log.error("Failed to parse Ollama response: {}", e.getMessage());
        }
        return skills;
    }
}
