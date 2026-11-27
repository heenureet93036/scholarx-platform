package com.scholarx.scholar.service;

import com.scholarx.scholar.model.Scholar;
import com.scholarx.scholar.repository.ScholarRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScholarService {

    private final ScholarRepository scholarRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public Scholar register(Scholar scholar) {
        return scholarRepository.save(scholar);
    }

    public Scholar uploadResume(String scholarId, MultipartFile file) throws IOException {
        Scholar scholar = scholarRepository.findById(scholarId)
                .orElseThrow(() -> new RuntimeException("Scholar not found: " + scholarId));

        String text = extractText(file);
        scholar.setResumeText(text);
        scholar.setResumeFileName(file.getOriginalFilename());
        scholarRepository.save(scholar);

        kafkaTemplate.send("resume.uploaded", Map.of(
                "scholarId", scholarId,
                "resumeText", text,
                "targetRole", scholar.getTargetRole() != null ? scholar.getTargetRole() : ""
        ));

        return scholar;
    }

    public Scholar setTargetRole(String scholarId, String targetRole) {
        Scholar scholar = scholarRepository.findById(scholarId)
                .orElseThrow(() -> new RuntimeException("Scholar not found: " + scholarId));
        scholar.setTargetRole(targetRole);
        return scholarRepository.save(scholar);
    }

    public Scholar findById(String scholarId) {
        return scholarRepository.findById(scholarId)
                .orElseThrow(() -> new RuntimeException("Scholar not found: " + scholarId));
    }

    private String extractText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(doc);
        }
    }
}
