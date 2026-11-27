package com.scholarx.scholar.controller;

import com.scholarx.scholar.model.Scholar;
import com.scholarx.scholar.service.ScholarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/scholars")
@RequiredArgsConstructor
public class ScholarController {

    private final ScholarService scholarService;

    @PostMapping
    public ResponseEntity<Scholar> register(@RequestBody Scholar scholar) {
        return ResponseEntity.ok(scholarService.register(scholar));
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<Scholar> uploadResume(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(scholarService.uploadResume(id, file));
    }

    @PostMapping("/{id}/target-role")
    public ResponseEntity<Scholar> setTargetRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(scholarService.setTargetRole(id, body.get("targetRole")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scholar> getScholar(@PathVariable String id) {
        return ResponseEntity.ok(scholarService.findById(id));
    }
}
