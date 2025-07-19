// app.js - Backend's logic fully moved to frontend (static JavaScript only)

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    loadThesaurusFile();
    improveTouch();

    const searchBox = document.getElementById("searchBox");
    const suggestions = document.getElementById("suggestions");

    if (searchBox) {
        let selectedSuggestion = -1;
        
        searchBox.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            selectedSuggestion = -1;
            if (query.length < 2) {
                suggestions.innerHTML = "";
                return;
            }
            const data = suggest(query);
            suggestions.innerHTML = "";
            data.forEach((word, index) => {
                const li = document.createElement("li");
                li.textContent = word;
                li.setAttribute('data-index', index);
                li.addEventListener("click", () => {
                    searchBox.value = word;
                    suggestions.innerHTML = "";
                    performSearch(word);
                    searchBox.blur(); // Close mobile keyboard
                });
                suggestions.appendChild(li);
            });
        });

        searchBox.addEventListener("keydown", (e) => {
            const suggestionItems = suggestions.querySelectorAll('li');
            
            if (e.key === "Enter") {
                e.preventDefault();
                if (selectedSuggestion >= 0 && suggestionItems[selectedSuggestion]) {
                    searchBox.value = suggestionItems[selectedSuggestion].textContent;
                    performSearch(suggestionItems[selectedSuggestion].textContent);
                } else {
                    performSearch(searchBox.value.trim());
                }
                suggestions.innerHTML = "";
                searchBox.blur(); // Close mobile keyboard
                selectedSuggestion = -1;
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedSuggestion = Math.min(selectedSuggestion + 1, suggestionItems.length - 1);
                updateSuggestionSelection(suggestionItems);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedSuggestion = Math.max(selectedSuggestion - 1, -1);
                updateSuggestionSelection(suggestionItems);
            } else if (e.key === "Escape") {
                suggestions.innerHTML = "";
                selectedSuggestion = -1;
                searchBox.blur();
            }
        });

        // Handle focus events for mobile
        searchBox.addEventListener("focus", () => {
            // Scroll to top on mobile when search is focused
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 300);
            }
        });
        
        // Function to update suggestion selection
        function updateSuggestionSelection(items) {
            items.forEach((item, index) => {
                if (index === selectedSuggestion) {
                    item.style.backgroundColor = '#072e46';
                    item.style.color = 'white';
                } else {
                    item.style.backgroundColor = '';
                    item.style.color = '';
                }
            });
        }
    }
});

function toggleTheme() {
    const body = document.body;
    const emoji = document.getElementById('themeEmoji');
    const toggle = document.querySelector('.theme-toggle');
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
        emoji.textContent = '🌙';
        emoji.style.transform = 'translateX(30px)';
        toggle.style.backgroundColor = '#333';
    } else {
        emoji.textContent = '🌞';
        emoji.style.transform = 'translateX(0)';
        toggle.style.backgroundColor = '#ccc';
    }
}

function applyTheme() {
    const theme = localStorage.getItem('theme');
    const emoji = document.getElementById('themeEmoji');
    const toggle = document.querySelector('.theme-toggle');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (emoji && toggle) {
            emoji.textContent = '🌙';
            emoji.style.transform = 'translateX(30px)';
            toggle.style.backgroundColor = '#333';
        }
    } else {
        document.body.classList.remove('dark-theme');
        if (emoji && toggle) {
            emoji.textContent = '🌞';
            emoji.style.transform = 'translateX(0)';
            toggle.style.backgroundColor = '#ccc';
        }
    }
}

let wordClusters = [];
let wordToClusters = {};
let currentWord = '';
let clusters = [];
let currentPage = 1;
const clustersPerPage = 5;

async function loadThesaurusFile() {
    wordClusters = [];
    wordToClusters = {};
    
    // Ana thesaurus.txt dosyasını yükle
    await loadSingleThesaurusFile("thesaurus.txt");
    
    // Diğer thesaurus dosyalarını yüklemeye çalış (thesaurus1.txt, thesaurus2.txt, vb.)
    for (let i = 1; i <= 100; i++) {
        try {
            await loadSingleThesaurusFile(`thesaurus${i}.txt`);
        } catch (error) {
            // Dosya bulunamadığında sessizce devam et
            console.log(`thesaurus${i}.txt file not found, skipping...`);
        }
    }
    
    console.log(`Loaded ${wordClusters.length} word clusters from all thesaurus files.`);
}

async function loadSingleThesaurusFile(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            const tokens = clean.split("-");
            const words = tokens.slice(1).map(w => w.trim()).filter(Boolean);
            if (words.length === 0) continue;
            const cluster = { words: words };
            wordClusters.push(cluster);
            words.forEach(word => {
                const key = word.toLowerCase();
                if (!wordToClusters[key]) wordToClusters[key] = [];
                wordToClusters[key].push(cluster);
            });
        }
        console.log(`Successfully loaded ${filename}`);
    } catch (error) {
        console.log(`Failed to load ${filename}:`, error.message);
        throw error;
    }
}

function suggest(prefix) {
    const results = [];
    prefix = prefix.toLowerCase();
    for (const word in wordToClusters) {
        if (word.startsWith(prefix)) results.push(word);
    }
    return results;
}

function performSearch(word) {
    currentWord = word.trim();
    if (!currentWord) return;
    const exactMatch = currentWord.startsWith('\"') && currentWord.endsWith('\"');
    const query = currentWord.replace(/^\"|\"$/g, '').toLowerCase();
    clusters = [];
    for (const cluster of wordClusters) {
        for (const w of cluster.words) {
            const lw = w.toLowerCase();
            if ((exactMatch && lw === query) || (!exactMatch && lw.includes(query))) {
                clusters.push(cluster);
                break;
            }
        }
    }
    const results = document.getElementById("results");
    const usBtn = document.getElementById("usPronounce");
    results.innerHTML = `<h2>Results for "<em>${word}</em>":</h2>`;
    if (!clusters || clusters.length === 0) {
        results.innerHTML += "<p>No matches found.</p>";
        if (usBtn) usBtn.style.display = "none";
        document.getElementById('audioBtns').style.display = 'none';
        return;
    }
    if (usBtn) usBtn.style.display = "inline-block";
    document.getElementById('audioBtns').style.display = 'inline-flex';
    renderResults(1);
}

function highlightMatch(word, query) {
    if (!query) return word;
    if (word.toLowerCase() === query.toLowerCase()) {
        return `<span class="highlight">${word}</span>`;
    }
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return word.replace(regex, `<span class="highlight">$1</span>`);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderResults(page = 1) {
    currentPage = page;
    const start = (page - 1) * clustersPerPage;
    const end = start + clustersPerPage;
    const pageClusters = clusters.slice(start, end);
    const results = document.getElementById("results");
    results.innerHTML = `<h2>Results for "<em>${currentWord}</em>":</h2>`;
    pageClusters.forEach(c => {
        const div = document.createElement("div");
        div.className = "cluster";
        div.innerHTML = c.words.map(w => {
            const safeWord = w.trim();
            return `<span class="result-word" onclick="onWordClick('${safeWord}')">${highlightMatch(safeWord, currentWord)}</span>`;
        }).join(" – ");
        results.appendChild(div);
    });
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(clusters.length / clustersPerPage);
    const pageContainer = document.getElementById('pagination');
    let html = '';
    const windowSize = 10;
    const windowStart = Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
    let windowEnd = windowStart + windowSize - 1;
    if (windowEnd > totalPages) windowEnd = totalPages;
    if (windowStart > 1) {
        html += `<button onclick="renderResults(${windowStart - 1})">...</button>`;
    }
    for (let i = windowStart; i <= windowEnd; i++) {
        html += `<button class="pagination-btn${i === currentPage ? ' active' : ''}" onclick="renderResults(${i})">${i}</button>`;
    }
    if (windowEnd < totalPages) {
        html += `<button onclick="renderResults(${windowEnd + 1})">...</button>`;
    }
    pageContainer.innerHTML = html;
}

function onWordClick(word) {
    const searchBox = document.getElementById("searchBox");
    searchBox.value = word;
    performSearch(word);
}

function speakWordUS() {
    const word = currentWord.trim().replaceAll('\"', '');
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

function improveTouch() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Improve button touch response
    const buttons = document.querySelectorAll('button, .theme-toggle');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            this.style.opacity = '0.7';
        }, { passive: true });
        
        button.addEventListener('touchend', function(e) {
            this.style.opacity = '1';
        }, { passive: true });
        
        button.addEventListener('touchcancel', function(e) {
            this.style.opacity = '1';
        }, { passive: true });
    });

    // Improve suggestions touch response
    const suggestions = document.getElementById('suggestions');
    if (suggestions) {
        suggestions.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'LI') {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.transform = 'scale(0.98)';
            }
        }, { passive: true });
        
        suggestions.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'LI') {
                setTimeout(() => {
                    e.target.style.backgroundColor = '';
                    e.target.style.transform = 'scale(1)';
                }, 150);
            }
        }, { passive: true });
        
        suggestions.addEventListener('touchcancel', function(e) {
            if (e.target.tagName === 'LI') {
                e.target.style.backgroundColor = '';
                e.target.style.transform = 'scale(1)';
            }
        }, { passive: true });
    }

    // Improve result words touch response
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('result-word')) {
            e.target.style.opacity = '0.7';
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (e.target.classList.contains('result-word')) {
            e.target.style.opacity = '1';
        }
    }, { passive: true });

    // Prevent iOS bounce effect
    document.body.addEventListener('touchmove', function(e) {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        // Force resize after orientation change
        setTimeout(() => {
            window.scrollTo(0, 1);
            window.scrollTo(0, 0);
        }, 100);
    });
}
