// scripts/LobbyManager.js
class LobbyManager {
    constructor() {
        this.sessionManager = new SessionManager();
        this.currentSession = null;
        
        // Éléments DOM
        this.elements = {
            totalGamesCount: document.getElementById('totalGamesCount'),
            gamesPreview: document.getElementById('gamesPreview'),
            sessionCodeDisplay: document.getElementById('sessionCodeDisplay'),
            sessionCode: document.getElementById('sessionCode'),
            sessionInfo: document.getElementById('sessionInfo'),
            sessionDetails: document.getElementById('sessionDetails'),
            historyList: document.getElementById('historyList'),
            
            // Inputs
            playerName: document.getElementById('playerName'),
            questionCount: document.getElementById('questionCount'),
            phase1Time: document.getElementById('phase1Time'),
            phase2Time: document.getElementById('phase2Time'),
            joinPlayerName: document.getElementById('joinPlayerName'),
            sessionCodeInput: document.getElementById('sessionCodeInput'),
            
            // Boutons
            createBtn: document.getElementById('createBtn'),
            joinBtn: document.getElementById('joinBtn'),
            copyCodeBtn: document.getElementById('copyCodeBtn'),
            pasteBtn: document.getElementById('pasteBtn'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            statsBtn: document.getElementById('statsBtn')
        };
        
        this.init();
    }
    
    init() {
        console.log('🎮 LobbyManager initialisé');
        
        // Afficher le nombre total de jeux
        this.elements.totalGamesCount.textContent = GAMES.length;
        
        // Mettre à jour les valeurs des sliders
        this.updateSliderValues();
        
        // Prévisualiser des jeux aléatoires
        this.updateGamesPreview();
        
        // Charger l'historique
        this.loadHistory();
        
        // Vérifier si on vient d'une redirection avec un code
        this.checkUrlForCode();
        
        // Événements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Sliders
        this.elements.questionCount.addEventListener('input', () => {
            this.updateSliderValues();
            this.updateGamesPreview();
        });
        this.elements.phase1Time.addEventListener('input', () => this.updateSliderValues());
        this.elements.phase2Time.addEventListener('input', () => this.updateSliderValues());
        
        // Code de session
        this.elements.sessionCodeInput.addEventListener('input', () => this.checkSessionCode());
        
        // Boutons
        this.elements.createBtn.addEventListener('click', () => this.createSession());
        this.elements.joinBtn.addEventListener('click', () => this.joinSession());
        this.elements.copyCodeBtn.addEventListener('click', () => this.copySessionCode());
        this.elements.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.statsBtn.addEventListener('click', () => this.showStats());
    }
    
    updateSliderValues() {
        document.getElementById('questionCountValue').textContent = 
            this.elements.questionCount.value;
        
        document.getElementById('phase1TimeValue').textContent = 
            this.elements.phase1Time.value + 's';
        
        document.getElementById('phase2TimeValue').textContent = 
            this.elements.phase2Time.value + 's';
    }
    
    updateGamesPreview() {
        const count = parseInt(this.elements.questionCount.value);
        const shuffled = [...GAMES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, 5));
        
        this.elements.gamesPreview.innerHTML = selected.map(game => 
            `<span class="game-tag">${game.name}</span>`
        ).join('');
        
        if (selected.length < count) {
            this.elements.gamesPreview.innerHTML += 
                `<span class="game-tag">+${count - selected.length} autres</span>`;
        }
    }
    
    createSession() {
        const playerName = this.elements.playerName.value.trim() || 'Joueur';
        const questionCount = parseInt(this.elements.questionCount.value);
        const phase1Time = parseInt(this.elements.phase1Time.value);
        const phase2Time = parseInt(this.elements.phase2Time.value);
        
        const session = this.sessionManager.createSession({
            playerName,
            totalQuestions: questionCount,
            phase1Time,
            phase2Time
        });
        
        // Afficher le code
        this.elements.sessionCode.textContent = session.id;
        this.elements.sessionCodeDisplay.style.display = 'block';
        
        // Rediriger après 3 secondes (ou immédiatement si clic)
        setTimeout(() => {
            window.location.href = `quiz.html?session=${session.id}&player=${encodeURIComponent(playerName)}`;
        }, 3000);
        
        // Message de confirmation
        alert(`🎮 Session créée !\n\nCode: ${session.id}\n\nRedirection dans 3 secondes...\n(Cliquez sur "OK" pour y aller maintenant)`);
    }
    
    checkSessionCode() {
        const code = this.elements.sessionCodeInput.value.trim().toUpperCase();
        
        if (code.length >= 4) {
            const session = this.sessionManager.getSession(code);
            
            if (session) {
                this.elements.sessionDetails.innerHTML = `
                    <div><strong>Créateur:</strong> ${session.players[0].name}</div>
                    <div><strong>Questions:</strong> ${session.settings.totalQuestions}</div>
                    <div><strong>Temps écoute:</strong> ${session.settings.phase1Time}s</div>
                    <div><strong>Joueurs:</strong> ${session.players.length}</div>
                    <div><strong>Statut:</strong> <span style="color: ${session.status === 'waiting' ? '#2ed573' : '#ff4757'}">
                        ${session.status === 'waiting' ? 'En attente' : 'En cours'}
                    </span></div>
                `;
                this.elements.sessionInfo.style.display = 'block';
            } else {
                this.elements.sessionInfo.style.display = 'none';
            }
        } else {
            this.elements.sessionInfo.style.display = 'none';
        }
    }
    
    joinSession() {
        const playerName = this.elements.joinPlayerName.value.trim() || 'Invité';
        const code = this.elements.sessionCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            alert('Veuillez entrer un code de session');
            this.elements.sessionCodeInput.focus();
            return;
        }
        
        const session = this.sessionManager.joinSession(code, playerName);
        
        if (session) {
            if (session.status === 'waiting') {
                window.location.href = `quiz.html?session=${code}&player=${encodeURIComponent(playerName)}`;
            } else {
                alert('Cette session est déjà en cours ou terminée.');
            }
        } else {
            alert('Session non trouvée. Vérifiez le code.');
        }
    }
    
    copySessionCode() {
        const code = this.elements.sessionCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            alert('Code copié dans le presse-papier !');
        });
    }
    
    pasteFromClipboard() {
        navigator.clipboard.readText().then(text => {
            this.elements.sessionCodeInput.value = text.trim().toUpperCase();
            this.elements.sessionCodeInput.dispatchEvent(new Event('input'));
        }).catch(err => {
            console.log('Erreur de lecture presse-papier:', err);
        });
    }
    
    loadHistory() {
        const sessions = this.sessionManager.getRecentSessions(10);
        
        if (sessions.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>Aucune partie</h3>
                    <p>Créez votre première session !</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        sessions.forEach(session => {
            const date = new Date(session.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const score = session.results ? 
                `${session.results.correct}/${session.results.total}` : 
                'Non terminé';
            
            const statusClass = session.status === 'completed' ? 'completed' : '';
            
            html += `
                <div class="history-item ${statusClass}" onclick="lobbyManager.viewSession('${session.id}')">
                    <div class="history-date">${date}</div>
                    <div><strong>${session.id}</strong> - ${session.settings.totalQuestions} questions</div>
                    <div class="history-score">Score: ${score}</div>
                </div>
            `;
        });
        
        this.elements.historyList.innerHTML = html;
    }
    
    viewSession(sessionId) {
        const session = this.sessionManager.getSession(sessionId);
        
        if (session) {
            let details = `Session: ${session.id}\n`;
            details += `Date: ${new Date(session.createdAt).toLocaleString()}\n`;
            details += `Questions: ${session.settings.totalQuestions}\n`;
            details += `Joueurs: ${session.players.map(p => p.name).join(', ')}\n`;
            
            if (session.results) {
                details += `\nRÉSULTATS:\n`;
                details += `Score: ${session.results.correct}/${session.results.total}\n`;
                details += `Pourcentage: ${Math.round((session.results.correct/session.results.total)*100)}%\n`;
            } else {
                details += `\nStatut: ${session.status === 'waiting' ? 'En attente' : 'En cours'}`;
            }
            
            alert(details);
        }
    }
    
    clearHistory() {
        if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
            this.sessionManager.clearAllSessions();
            this.loadHistory();
            alert('Historique effacé !');
        }
    }
    
    checkUrlForCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.elements.sessionCodeInput.value = code.toUpperCase();
            this.checkSessionCode();
        }
    }
    
    showStats() {
        const stats = this.sessionManager.getStats();
        
        if (stats.completedSessions === 0) {
            alert('Aucune statistique disponible.\nTerminez d\'abord quelques parties !');
            return;
        }
        
        let statsText = `📊 STATISTIQUES\n\n`;
        statsText += `Parties jouées: ${stats.completedSessions}\n`;
        statsText += `Questions totales: ${stats.totalQuestions}\n`;
        statsText += `Réponses correctes: ${stats.totalCorrect}\n`;
        statsText += `Score moyen: ${Math.round(stats.averageScore)}%\n`;
        statsText += `Joueurs uniques: ${stats.uniquePlayers}\n\n`;
        
        // Meilleur score
        const completed = this.sessionManager.sessions.filter(s => s.status === 'completed');
        if (completed.length > 0) {
            const bestSession = completed.sort((a, b) => 
                (b.results?.correct || 0) - (a.results?.correct || 0)
            )[0];
            
            if (bestSession) {
                statsText += `🏆 MEILLEUR SCORE\n`;
                statsText += `${bestSession.results.correct}/${bestSession.settings.totalQuestions}\n`;
                statsText += `${new Date(bestSession.createdAt).toLocaleDateString()}`;
            }
        }
        
        alert(statsText);
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.lobbyManager = new LobbyManager();
});