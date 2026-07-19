// js/app.js
import { FootballAPI } from './api.js'; //  CORRETO
import { PredictEngine } from './engine.js';
import { FavoritesStorage } from './storage.js';

let allMatches = []; 

document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initNavigation();
    initThemeToggle();
    initCreatorModal(); // <-- NOVO: Inicializa o controle do modal
    loadAppData();
});

function initSplashScreen() {
    const progressBar = document.getElementById('progress-bar-fill');
    const splashScreen = document.getElementById('splash-screen');

    // 1. Inicia o enchimento da barra imediatamente
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 50);
    }

    // 2. Força o desaparecimento após 5 segundos, sem depender de outras funções
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('splash-hidden');
            console.log("Splash Screen removida com sucesso.");
        } else {
            console.error("Erro: Elemento #splash-screen não foi encontrado no HTML.");
        }
    }, 5100); 
}

function initNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            item.classList.add('active');
            const targetTab = item.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'tab-favorites') renderFavoritesPage();
        });
    });
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const metaThemeColor = document.getElementById('meta-theme-color');

    themeBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#f8fafc');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
        }
    });
}

// CARGA E CRUZAMENTO DE DADOS REAIS
async function loadAppData() {
    const container = document.getElementById('matches-container');
    const today = new Date().toISOString().split('T')[0]; 
    
    try {
        const fixtureResponse = await FootballAPI.getMatches(today);
        const rawList = fixtureResponse.response || [];
        
        // AJUSTE CRUCIAL: Corta a lista para fixar em exatamente no máximo 15 jogos por dia
        const limitedList = rawList.slice(0, 15);
        allMatches = [];

        container.innerHTML = `<div class="loading-placeholder">A processar dados estatísticos reais de 15 jogos...</div>`;

        // Para cada um dos 15 jogos, puxa a análise estatística real
        for (const match of limitedList) {
            try {
                const predData = await FootballAPI.getPredictionForMatch(match.fixture.id);
                const realAnalysis = PredictEngine.processRealPrediction(predData);
                
                // Acopla a análise real direto no objeto do jogo
                match.senielAnalysis = realAnalysis;
                allMatches.push(match);
            } catch (e) {
                console.error("Erro ao puxar predição do jogo ID: " + match.fixture.id);
            }
        }
        
        // Renderiza as informações na tela usando a nossa função de UI atualizada
        renderMatchesUI(allMatches, 'matches-container');
        initFavoriteButtons();

    } catch (error) {
        container.innerHTML = `<div class="loading-placeholder">Erro ao conectar com o servidor de dados reais.</div>`;
    }
}

function renderMatchesUI(matchesList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (matchesList.length === 0) {
        container.innerHTML = `<div class="loading-placeholder">Nenhum prognóstico disponível.</div>`;
        return;
    }

    const favs = FavoritesStorage.getFavorites();
    container.innerHTML = '';

    matchesList.forEach(match => {
        const analysis = match.senielAnalysis;
        const isFav = favs.includes(match.fixture.id.toString());

        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-header">
                <span>${match.league.name} (${match.league.country})</span>
                <button class="fav-toggle-btn" data-id="${match.fixture.id}" style="background:none; border:none; color: ${isFav ? 'var(--accent-warning)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1.1rem;">
                    ★
                </button>
            </div>
            <div class="match-teams">
                <div class="team">🏠 ${match.teams.home.name}</div>
                <div class="team">🚀 ${match.teams.away.name}</div>
            </div>
            
            <div class="prediction-bars">
                <div class="bar home" style="width: ${analysis.probabilities.home}%">${analysis.probabilities.home}%</div>
                <div class="bar draw" style="width: ${analysis.probabilities.draw}%">${analysis.probabilities.draw}%</div>
                <div class="bar away" style="width: ${analysis.probabilities.away}%">${analysis.probabilities.away}%</div>
            </div>

            <div class="prediction-meta">
                <div style="max-width: 60%;">Recomendação: <strong style="color:var(--accent-primary);">${analysis.probableScore}</strong></div>
                <div>Ambas Marcam: <strong>${analysis.btts}</strong></div>
            </div>
            <div class="prediction-meta" style="border-top:none; padding-top:0; margin-top: 0.5rem;">
                <div>+2.5 Golos: <strong>${analysis.over25}</strong></div>
                <div>Confiança: <span class="confidence-badge ${analysis.confidence.toLowerCase()}">${analysis.confidence}</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function initFavoriteButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('fav-toggle-btn')) {
            const matchId = e.target.getAttribute('data-id');
            FavoritesStorage.toggle(matchId);
            const favs = FavoritesStorage.getFavorites();
            e.target.style.color = favs.includes(matchId) ? 'var(--accent-warning)' : 'var(--text-secondary)';
        }
    });
}

function renderFavoritesPage() {
    const favs = FavoritesStorage.getFavorites();
    const favoriteMatches = allMatches.filter(match => favs.includes(match.fixture.id.toString()));
    renderMatchesUI(favoriteMatches, 'favorites-container');
}










// NOVO: Gerenciador do Modal do Criador
function initCreatorModal() {
    const openBtn = document.getElementById('about-creator-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('creator-modal');

    if (!openBtn || !closeBtn || !modal) return;

    // Abre o modal ao clicar no botão de informações
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    // Fecha ao clicar no 'X'
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Fecha se o utilizador clicar em qualquer parte escura fora do card
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}