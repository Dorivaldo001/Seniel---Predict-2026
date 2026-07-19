// js/api.js
import { CacheStorage } from './storage.js';

const API_CONFIG = {
    BASE_URL: 'https://v3.football.api-sports.io',
    KEY: 'f0f0421543a0bfd9201f711ecf0508cd', 
    CACHE_TTL: 1440 // Cache de 24 horas (dados de palpites do dia não mudam toda hora)
};

export const FootballAPI = {
    async fetchFromAPI(endpoint) {
        const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
        const cachedData = CacheStorage.get(endpoint);
        
        if (cachedData) return cachedData;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': API_CONFIG.KEY
                }
            });

            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            
            const data = await response.json();
            CacheStorage.set(endpoint, data, API_CONFIG.CACHE_TTL);
            return data;
        } catch (error) {
            console.error(`Erro ao buscar dados de [${endpoint}]:`, error);
            throw error;
        }
    },

    // 1. Puxa os jogos do dia normalmente
    async getMatches(dateString) {
        return this.fetchFromAPI(`fixtures?date=${dateString}`);
    },

    // 2. NOVA: Puxa o prognóstico real e completo gerado pela estatística da API
    async getPredictionForMatch(fixtureId) {
        return this.fetchFromAPI(`predictions?fixture=${fixtureId}`);
    }
};