package com.acavoca.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acavoca.service.ThesaurusService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final ThesaurusService thesaurusService;

    @Value("${acavoca.thesaurus.path}")
    private String thesaurusFilePath;

    public AdminController(ThesaurusService thesaurusService) {
        this.thesaurusService = thesaurusService;
    }

    @GetMapping("/thesaurus")
    public String getThesaurusFile() throws IOException {
        return Files.readString(Paths.get(thesaurusFilePath), StandardCharsets.UTF_8);
    }

    @PutMapping("/thesaurus")
    public String updateThesaurusFile(@RequestBody String content) throws IOException {
        Files.writeString(Paths.get(thesaurusFilePath), content, StandardCharsets.UTF_8);
        thesaurusService.reload();
        return "OK";
    }
}