// js/engine.js

export const PredictEngine = {
    processRealPrediction(apiPredictionData) {
        // Se a API não retornar dados para aquele jogo específico, ativa um fallback seguro
        if (!apiPredictionData || !apiPredictionData.response || apiPredictionData.response.length === 0) {
            return this.getFallbackData();
        }

        const data = apiPredictionData.response[0];
        const preds = data.predictions;

        // 1. Percentagens reais de vitória da API (Ex: "50%", "25%", "25%")
        const homeProb = parseInt(preds.percent.home) || 34;
        const drawProb = parseInt(preds.percent.draw) || 33;
        const awayProb = parseInt(preds.percent.away) || 33;

        // 2. Mercado de Golos e Placar mais provável fornecido pelos analistas da API
        const btts = preds.btts ? "Sim" : "Não";
        const over25 = preds.goals.home > 1.5 || preds.goals.away > 1.5 ? "Sim" : "Não";
        
        // A API fornece conselhos textuais diretos (Ex: "Win or Draw", "Under 3.5")
        const advice = preds.advice || "Sem recomendação";

        // 3. Grau de Confiança baseado na inteligência de dados da própria API
        let confidence = "MÉDIO";
        if (preds.winner.comment && preds.winner.comment.includes("strongly")) {
            confidence = "ALTO";
        }

        return {
            probabilities: { home: homeProb, draw: drawProb, away: awayProb },
            probableScore: advice, // Substitui o placar exato pelo conselho tático real da API
            over25,
            btts,
            confidence
        };
    },

    getFallbackData() {
        return {
            probabilities: { home: 34, draw: 33, away: 33 },
            probableScore: "Análise Indisponível",
            over25: "N/D",
            btts: "N/D",
            confidence: "BAIXO"
        };
    }
};