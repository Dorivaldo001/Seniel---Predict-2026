// js/ui.js
import { PredictEngine } from './engine.js';
import { FavoritesStorage } from './storage.js';

export const UIRenderer = {
    renderMatches(matchesList, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matchesList || matchesList.length === 0) {
            container.innerHTML = `<div class="loading-placeholder">Nenhum jogo ou prognóstico disponível para esta seleção.</div>`;
            return;
        }

        const favs = FavoritesStorage.getFavorites();
        container.innerHTML = ''; // Limpa os placeholders anteriores

        matchesList.forEach(match => {
            const analysis = PredictEngine.generatePrediction(match);
            const isFav = favs.includes(match.fixture.id.toString());

            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = `
                <div class="match-header">
                    <span>${match.league.name} (${match.league.country})</span>
                    <button class="fav-toggle-btn" data-id="${match.fixture.id}" style="background:none; border:none; color: ${isFav ? 'var(--accent-warning)' : 'var(--text-secondary)'}; cursor:pointer;">
                        ★
                    </button>
                </div>
                <div class="match-teams">
                    <div class="team">🏠 ${match.teams.home.name}</div>
                    <div class="team">🚀 ${match.teams.away.name}</div>
                </div>
                
                <!-- Barras Proporcionais de Probabilidade -->
                <div class="prediction-bars">
                    <div class="bar home" style="width: ${analysis.probabilities.home}%" title="Vitória Casa">${analysis.probabilities.home}%</div>
                    <div class="bar draw" style="width: ${analysis.probabilities.draw}%" title="Empate">${analysis.probabilities.draw}%</div>
                    <div class="bar away" style="width: ${analysis.probabilities.away}%" title="Vitória Visitante">${analysis.probabilities.away}%</div>
                </div>

                <div class="prediction-meta">
                    <div>Placar Provável: <strong>${analysis.probableScore}</strong></div>
                    <div>Ambas Marcam: <strong>${analysis.btts}</strong></div>
                </div>
                <div class="prediction-meta" style="border-top:none; padding-top:0; margin-top: 0.5rem;">
                    <div>Mais de 2.5 Golos: <strong>${analysis.over25}</strong></div>
                    <div>Confiança: <span class="confidence-badge ${analysis.confidence.toLowerCase()}">${analysis.confidence}</span></div>
                </div>
            `;
            container.appendChild(card);
        });
    }
};