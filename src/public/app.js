document.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    const searchBox = document.getElementById("searchBox");
    const suggestions = document.getElementById("suggestions");
    const results = document.getElementById("results");

    if (searchBox) {
        searchBox.addEventListener("input", async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                suggestions.innerHTML = "";
                return;
            }

            const res = await fetch(`http://localhost:8080/api/suggest?prefix=${encodeURIComponent(query)}`);
            const data = await res.json();

            suggestions.innerHTML = "";
            data.forEach(word => {
                const li = document.createElement("li");
                li.textContent = word;
                li.addEventListener("click", () => {
                    searchBox.value = word;
                    suggestions.innerHTML = "";
                    performSearch(word);
                });
                suggestions.appendChild(li);
            });
        });

        searchBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                performSearch(searchBox.value.trim());
                suggestions.innerHTML = "";
            }
        });
    }
});

//koyu ve açık tema
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
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        const emoji = document.getElementById('themeEmoji');
        const toggle = document.querySelector('.theme-toggle');
        if (emoji && toggle) {
            emoji.textContent = '🌙';
            emoji.style.transform = 'translateX(30px)';
            toggle.style.backgroundColor = '#333';
        }
    } else {
        document.body.classList.remove('dark-theme');
        const emoji = document.getElementById('themeEmoji');
        const toggle = document.querySelector('.theme-toggle');
        if (emoji && toggle) {
            emoji.textContent = '🌞';
            emoji.style.transform = 'translateX(0)';
            toggle.style.backgroundColor = '#ccc';
        }
    }
}
// Sayfa yüklendiğinde temayı uygula
document.addEventListener('DOMContentLoaded', applyTheme);

let currentWord = '';
let clusters = []; // arama sonucu kümeler
let currentPage = 1;
const clustersPerPage = 5; // Only 5 clusters per page as requested

async function performSearch(word) {
    currentWord = word;
    const res = await fetch(`http://localhost:8080/api/search?keyword=${encodeURIComponent(word)}`);
    clusters = await res.json();

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
    renderResults(1); // Show first page
}

//aranan kelimeleri öne çıkar
function highlightMatch(word, query) {
    if (!query) return word;
    // If the whole word matches the query: highlight all
    if (word.toLowerCase() === query.toLowerCase()) {
        return `<span class="highlight">${word}</span>`;
    }
    // Otherwise, highlight all substring matches (case-insensitive)
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return word.replace(regex, `<span class="highlight">$1</span>`);
}

function escapeRegExp(string) {
    // Escapes special regex characters in user input
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//kelime sonuçları
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

    const windowSize = 10; // Show 10 page buttons per window
    const windowStart = Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
    let windowEnd = windowStart + windowSize - 1;
    if (windowEnd > totalPages) windowEnd = totalPages;

    // Previous window ...
    if (windowStart > 1) {
        html += `<button onclick="renderResults(${windowStart - 1})">...</button>`;
    }

    // Page numbers
    for (let i = windowStart; i <= windowEnd; i++) {
        html += `<button class="pagination-btn${i === currentPage ? ' active' : ''}" onclick="renderResults(${i})">${i}</button>`;
    }

    // Next window ...
    if (windowEnd < totalPages) {
        html += `<button onclick="renderResults(${windowEnd + 1})">...</button>`;
    }

    pageContainer.innerHTML = html;
}

//kelime araması
function onWordClick(word) {
    const searchBox = document.getElementById("searchBox");
    searchBox.value = word;
    performSearch(word);
}

//telaffuz seslendirmesi
function speakWordUS() {
    const searchBox = document.getElementById("searchBox");
    const word = searchBox.value.trim().replaceAll('"', '');
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

//hamburger menu
document.getElementById('hamburgerMenu').onclick = function() {
    document.getElementById('dropdownMenu').classList.toggle('show');
};
window.onclick = function(e) {
    if (!e.target.matches('#hamburgerMenu')) {
        document.getElementById('dropdownMenu').classList.remove('show');
    }
};