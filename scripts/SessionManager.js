// scripts/SessionManager.js
class SessionManager {
    constructor() {
        this.currentSession = null;
        this.sessions = this.loadSessions();
        console.log(`🎮 SessionManager initialisé (${this.sessions.length} sessions)`);
    }
    
    // Charger les sessions depuis localStorage
    loadSessions() {
        try {
            const stored = localStorage.getItem('quizSessions');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erreur chargement sessions:', error);
            return [];
        }
    }
    
    // Sauvegarder les sessions
    saveSessions() {
        try {
            localStorage.setItem('quizSessions', JSON.stringify(this.sessions));
        } catch (error) {
            console.error('Erreur sauvegarde sessions:', error);
        }
    }
    
    // Créer une nouvelle session
    createSession(settings = {}) {
        const sessionId = this.generateSessionId();
        
        // Sélectionner les jeux
        const selectedGames = this.selectRandomGames(settings.totalQuestions || 10);
        
        // Créer la session
        const session = {
            id: sessionId,
            createdAt: new Date().toISOString(),
            settings: {
                totalQuestions: settings.totalQuestions || 10,
                phase1Time: settings.phase1Time || CONFIG.PHASE1_TIME,
                phase2Time: settings.phase2Time || CONFIG.PHASE2_TIME
            },
            games: selectedGames,
            players: [{
                id: 'host_' + Date.now(),
                name: settings.playerName || 'Host',
                isHost: true,
                joinedAt: new Date().toISOString()
            }],
            status: 'waiting',
            results: null,
            metadata: {
                version: '1.0',
                gamesCount: GAMES.length
            }
        };
        
        // Ajouter et sauvegarder
        this.sessions.push(session);
        this.saveSessions();
        
        console.log(`🎮 Session créée: ${sessionId} (${selectedGames.length} jeux)`);
        return session;
    }
    
    // Sélectionner aléatoirement N jeux uniques
    selectRandomGames(count) {
        // Éviter de sélectionner le même jeu (même nom) plusieurs fois
        const uniqueGames = [];
        const selectedNames = new Set();
        
        // Mélanger les jeux
        const shuffled = shuffleArray([...GAMES]);
        
        for (const game of shuffled) {
            if (uniqueGames.length >= count) break;
            
            // Vérifier si on a déjà un jeu avec ce nom
            const normalizedName = game.name.toLowerCase().trim();
            if (!selectedNames.has(normalizedName)) {
                selectedNames.add(normalizedName);
                uniqueGames.push({
                    name: game.name,
                    videoId: game.videoId,
                    selectedAt: new Date().toISOString()
                });
            }
        }
        
        // Si on n'a pas assez de jeux uniques, compléter avec des doublons
        if (uniqueGames.length < count) {
            const additional = shuffled
                .filter(game => !selectedNames.has(game.name.toLowerCase().trim()))
                .slice(0, count - uniqueGames.length);
            
            additional.forEach(game => {
                uniqueGames.push({
                    name: game.name,
                    videoId: game.videoId,
                    selectedAt: new Date().toISOString()
                });
            });
        }
        
        return uniqueGames;
    }
    
    // Générer un ID de session (6 caractères alphanumériques)
    generateSessionId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }
    
    // Rejoindre une session existante
    joinSession(sessionId, playerName) {
        const session = this.getSession(sessionId);
        
        if (!session) {
            console.log(`❌ Session ${sessionId} non trouvée`);
            return null;
        }
        
        if (session.status !== 'waiting') {
            console.log(`❌ Session ${sessionId} n'est pas en attente`);
            return null;
        }
        
        // Vérifier si le joueur existe déjà
        const existingPlayer = session.players.find(p => 
            p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (!existingPlayer) {
            // Ajouter le joueur
            session.players.push({
                id: 'player_' + Date.now(),
                name: playerName,
                isHost: false,
                joinedAt: new Date().toISOString()
            });
            
            this.saveSessions();
            console.log(`👤 ${playerName} a rejoint ${sessionId}`);
        }
        
        return session;
    }
    
    // Obtenir une session par ID
    getSession(sessionId) {
        return this.sessions.find(s => s.id === sessionId);
    }
    
    // Démarrer une session (changer le statut)
    startSession(sessionId) {
        const session = this.getSession(sessionId);
        if (session && session.status === 'waiting') {
            session.status = 'playing';
            session.startedAt = new Date().toISOString();
            this.saveSessions();
            console.log(`🚀 Session ${sessionId} démarrée`);
            return true;
        }
        return false;
    }
    
    // Terminer une session avec résultats
    completeSession(sessionId, results) {
        const session = this.getSession(sessionId);
        if (session) {
            session.status = 'completed';
            session.completedAt = new Date().toISOString();
            session.results = {
                total: results.total || session.settings.totalQuestions,
                correct: results.correct || 0,
                percentage: results.percentage || 0,
                details: results.details || []
            };
            this.saveSessions();
            console.log(`🏁 Session ${sessionId} terminée: ${results.correct}/${results.total}`);
            return true;
        }
        return false;
    }
    
    // Obtenir les sessions récentes
    getRecentSessions(limit = 10) {
        return [...this.sessions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    // Nettoyer les anciennes sessions
    cleanupOldSessions(daysOld = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        
        const initialCount = this.sessions.length;
        this.sessions = this.sessions.filter(session => 
            new Date(session.createdAt) > cutoff
        );
        
        const removed = initialCount - this.sessions.length;
        if (removed > 0) {
            this.saveSessions();
            console.log(`🧹 ${removed} anciennes sessions nettoyées`);
        }
        
        return removed;
    }
    
    // Supprimer toutes les sessions
    clearAllSessions() {
        this.sessions = [];
        this.saveSessions();
        console.log('🧹 Toutes les sessions effacées');
    }
    
    // Statistiques
    getStats() {
        const completed = this.sessions.filter(s => s.status === 'completed');
        const totalQuestions = completed.reduce((sum, s) => sum + s.settings.totalQuestions, 0);
        const totalCorrect = completed.reduce((sum, s) => sum + (s.results?.correct || 0), 0);
        
        return {
            totalSessions: this.sessions.length,
            completedSessions: completed.length,
            totalQuestions,
            totalCorrect,
            averageScore: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            uniquePlayers: this.getUniquePlayersCount()
        };
    }
    
    // Compter les joueurs uniques
    getUniquePlayersCount() {
        const playerNames = new Set();
        this.sessions.forEach(session => {
            session.players.forEach(player => {
                playerNames.add(player.name.toLowerCase());
            });
        });
        return playerNames.size;
    }
    
    // Exporter une session pour le quiz
    exportSession(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) return null;
        
        return {
            id: session.id,
            games: session.games,
            settings: session.settings,
            players: session.players
        };
    }
}

// Exposer globalement
window.SessionManager = SessionManager;