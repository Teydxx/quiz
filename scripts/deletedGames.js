// deleted-videos-manager.js - Utilise tes fichiers existants
let allVideos = [];
let currentFilter = 'all';

// Charger toutes les vidéos (utilise TES fonctions existantes)
function loadAllVideos() {
    console.log('📥 Chargement des vidéos...');
    
    // Utilise FailedVideosStorage.getAllVideos() qui fusionne auto + manuel
    if (window.FailedVideosStorage && FailedVideosStorage.getAllVideos) {
        allVideos = FailedVideosStorage.getAllVideos();
    } else {
        // Fallback si le nouveau code n'est pas chargé
        const deleted = DeletedGamesStorage.get().map(v => ({...v, type: 'manual'}));
        const failed = JSON.parse(localStorage.getItem('failedVideos') || '[]').map(v => ({...v, type: 'auto'}));
        allVideos = [...deleted, ...failed];
    }
    
    // Éliminer les doublons
    const seen = new Set();
    allVideos = allVideos.filter(video => {
        const key = `${video.name}-${video.videoId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    
    updateStats();
    displayVideos(allVideos);
}

function updateStats() {
    const total = allVideos.length;
    const auto = allVideos.filter(v => v.type === 'auto').length;
    const manual = allVideos.filter(v => v.type === 'manual').length;
    
    if (document.getElementById('total-count')) {
        document.getElementById('total-count').textContent = total;
    }
    if (document.getElementById('auto-count')) {
        document.getElementById('auto-count').textContent = auto;
    }
    if (document.getElementById('manual-count')) {
        document.getElementById('manual-count').textContent = manual;
    }
}

function filterVideos(filter) {
    currentFilter = filter;
    
    // Mettre à jour les tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtered = filter === 'all' ? allVideos : 
                    filter === 'auto' ? allVideos.filter(v => v.type === 'auto') :
                    allVideos.filter(v => v.type === 'manual');
    
    displayVideos(filtered);
}

function displayVideos(videos) {
    const container = document.getElementById('games-container');
    if (!container) return;
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>Aucune vidéo ${currentFilter === 'auto' ? 'détectée automatiquement' : 
                                  currentFilter === 'manual' ? 'supprimée manuellement' : 
                                  'dans la liste'} 🎉</h3>
                <a href="index.html" style="margin-top: 20px; text-decoration: none;">
                    <button class="btn-primary">
                        <i class="fas fa-arrow-left"></i> Retour au quiz
                    </button>
                </a>
            </div>
        `;
        return;
    }
    
    let html = `<div class="games-grid">`;
    
    videos.forEach(video => {
        const isAuto = video.type === 'auto';
        html += `
            <div class="game-card ${isAuto ? 'failed-auto' : 'manual'}">
                <div class="card-header">
                    <div class="game-name">${escapeHtml(video.name)}</div>
                    <div class="card-badge ${isAuto ? 'badge-auto' : 'badge-manual'}">
                        ${isAuto ? 'AUTO' : 'MANUEL'}
                    </div>
                </div>
                
                <div class="game-info">
                    <div class="info-row">
                        <i class="far fa-calendar"></i>
                        <span>${video.date || 'Date inconnue'}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-info-circle"></i>
                        <span>${video.reason || 'Non spécifié'}</span>
                    </div>
                </div>
                
                <div class="video-id-container">
                    <div class="video-id-label">ID YouTube :</div>
                    <div class="video-id-value">
                        <span>${video.videoId}</span>
                        <button onclick="copyToClipboard('${video.videoId}')" class="copy-btn">
                            <i class="far fa-copy"></i> Copier
                        </button>
                    </div>
                </div>
                
                <div class="youtube-test">
                    <a href="https://www.youtube.com/watch?v=${video.videoId}" 
                       target="_blank" class="test-link">
                       <i class="fab fa-youtube"></i> Tester sur YouTube
                    </a>
                    <iframe src="https://www.youtube.com/embed/${video.videoId}"
                            frameborder="0" allowfullscreen></iframe>
                </div>
                
                <div class="actions">
                    <button class="action-btn btn-correct" 
                            onclick="reintegrateGame('${escapeString(video.name)}', '${video.videoId}')">
                        <i class="fas fa-undo"></i> Corriger
                    </button>
                    <button class="action-btn btn-delete" 
                            onclick="permanentlyDelete('${escapeString(video.name)}', '${video.videoId}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// Les autres fonctions restent les mêmes que précédemment
function escapeString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function reintegrateGame(gameName, videoId) {
    const newId = prompt(`Corriger "${gameName}" :\n\nNouvel ID YouTube ?`, '');
    if (!newId) return;
    
    // Utilise ta logique existante de games.js
    if (window.reintegrateGame) {
        window.reintegrateGame(gameName, videoId, newId);
    } else {
        // Fallback
        const corrected = JSON.parse(localStorage.getItem('correctedGames') || '[]');
        corrected.push({
            name: gameName,
            videoId: newId.trim(),
            originalId: videoId,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('correctedGames', JSON.stringify(corrected));
        
        // Retirer des listes
        removeFromAllLists(gameName, videoId);
        alert(`✅ "${gameName}" corrigé !`);
    }
    
    loadAllVideos();
}

function permanentlyDelete(gameName, videoId) {
    if (!confirm(`Supprimer définitivement "${gameName}" ?`)) return;
    
    // Utilise ta logique existante
    if (window.permanentlyDelete) {
        window.permanentlyDelete(gameName);
    } else {
        removeFromAllLists(gameName, videoId);
        
        // Ajouter aux supprimés définitifs si la fonction existe
        if (window.addToPermanentlyDeleted) {
            window.addToPermanentlyDeleted({name: gameName, videoId: videoId});
        }
    }
    
    alert(`🗑️ "${gameName}" supprimé.`);
    loadAllVideos();
}

function removeFromAllLists(gameName, videoId) {
    // Utilise tes fonctions existantes
    if (DeletedGamesStorage && DeletedGamesStorage.remove) {
        // Supprimer de deletedGames
        const deleted = DeletedGamesStorage.get();
        const updatedDeleted = deleted.filter(g => !(g.name === gameName && g.videoId === videoId));
        localStorage.setItem('deletedGames', JSON.stringify(updatedDeleted));
    }
    
    // Supprimer de failedVideos
    if (FailedVideosStorage && FailedVideosStorage.remove) {
        FailedVideosStorage.remove(gameName, videoId);
    }
    
    // Supprimer du localStorage direct
    const failed = JSON.parse(localStorage.getItem('failedVideos') || '[]');
    const updatedFailed = failed.filter(g => !(g.name === gameName && g.videoId === videoId));
    localStorage.setItem('failedVideos', JSON.stringify(updatedFailed));
}

function clearAllVideos() {
    if (!confirm('Vider toutes les listes ?')) return;
    
    // Utilise tes clear existants
    if (DeletedGamesStorage && DeletedGamesStorage.clear) {
        DeletedGamesStorage.clear();
    }
    if (FailedVideosStorage && FailedVideosStorage.clear) {
        FailedVideosStorage.clear();
    }
    
    localStorage.removeItem('deletedGames');
    localStorage.removeItem('failedVideos');
    
    alert('✅ Listes vidées.');
    loadAllVideos();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Notification simple
        const msg = document.createElement('div');
        msg.textContent = '✅ ID copié';
        msg.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2ed573;color:white;padding:10px;border-radius:5px;z-index:9999;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    });
}

// Init
document.addEventListener('DOMContentLoaded', loadAllVideos);