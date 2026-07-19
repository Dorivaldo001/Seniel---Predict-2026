// js/storage.js

export const CacheStorage = {
    get(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const isExpired = new Date().getTime() > data.expiry;
        
        if (isExpired) {
            localStorage.removeItem(key);
            return null;
        }
        return data.value;
    },
    
    set(key, value, ttlInMinutes = 60) {
        const expiry = new Date().getTime() + (ttlInMinutes * 60 * 1000);
        localStorage.setItem(key, JSON.stringify({ value, expiry }));
    }
};

export const FavoritesStorage = {
    getFavorites() {
        return JSON.parse(localStorage.getItem('seniel_favs')) || [];
    },

    toggle(matchId) {
        let favs = this.getFavorites();
        if (favs.includes(matchId)) {
            favs = favs.filter(id => id !== matchId);
        } else {
            favs.push(matchId);
        }
        localStorage.setItem('seniel_favs', JSON.stringify(favs));
        return favs;
    }
};