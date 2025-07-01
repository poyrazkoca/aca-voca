package com.acavoca.service;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.acavoca.model.WordCluster;

import jakarta.annotation.PostConstruct;

@Service
public class ThesaurusService {

    @Value("${acavoca.thesaurus.path}")
    private String thesaurusFilePath;

    private List<WordCluster> clusters = new ArrayList<>();
    private Map<String, List<WordCluster>> wordToClusters = new HashMap<>();

    @PostConstruct
    public void loadThesaurus() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(thesaurusFilePath), StandardCharsets.UTF_8))) {

            String line;
            int index = 0;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                String[] tokens = line.split("-");
                List<String> words = Arrays.asList(tokens).subList(1, tokens.length);
                WordCluster cluster = new WordCluster(words);
                clusters.add(cluster);

                for (String word : words) {
                    String key = word.trim().toLowerCase();
                    wordToClusters.computeIfAbsent(key, k -> new ArrayList<>()).add(cluster);
                }
                index++;
            }

            System.out.println("Thesaurus loaded: " + clusters.size() + " clusters");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Geliştirilmiş search metodu: tam eşleşme (çift tırnak) veya kapsayıcı eşleşme
    public List<WordCluster> search(String keyword) {
        if (keyword == null || keyword.isBlank()) return new ArrayList<>();

        keyword = keyword.trim();
        boolean exactMatch = keyword.startsWith("\"") && keyword.endsWith("\"");
        String cleanKeyword = keyword.replaceAll("^\"|\"$", "").toLowerCase();

        List<WordCluster> result = new ArrayList<>();
        for (WordCluster cluster : clusters) {
            for (String word : cluster.getWords()) {
                String w = word.toLowerCase().trim();
                if (exactMatch) {
                    if (w.equals(cleanKeyword)) {
                        result.add(cluster);
                        break;
                    }
                } else {
                    if (w.contains(cleanKeyword)) {
                        result.add(cluster);
                        break;
                    }
                }
            }
        }
        return result;
    }

    public Set<String> suggest(String prefix) {
        Set<String> results = new HashSet<>();
        for (String key : wordToClusters.keySet()) {
            if (key.startsWith(prefix.toLowerCase())) {
                results.add(key);
            }
        }
        return results;
    }

    // Admin panelden güncelleme sonrası belleği temizleyip tekrar yükler
    public void reload() {
        clusters.clear();
        wordToClusters.clear();
        loadThesaurus();
    }

}