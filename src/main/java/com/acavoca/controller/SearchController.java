package com.acavoca.controller;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acavoca.model.WordCluster;
import com.acavoca.service.ThesaurusService;

@RestController
@RequestMapping("/api")
@CrossOrigin // frontend için CORS açar
public class SearchController {

    private final ThesaurusService thesaurusService;

    public SearchController(ThesaurusService thesaurusService) {
        this.thesaurusService = thesaurusService;
    }

    @GetMapping("/search")
    public List<WordCluster> search(@RequestParam String keyword) {
        return thesaurusService.search(keyword);
    }

    @GetMapping("/suggest")
    public Set<String> suggest(@RequestParam String prefix) {
        return thesaurusService.suggest(prefix);
    }
}
