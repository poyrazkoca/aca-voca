package com.acavoca.model;

import java.util.List;

public class WordCluster {
    private List<String> words;

    public WordCluster(List<String> words) {
        this.words = words;
    }

    public List<String> getWords() {
        return words;
    }
}
