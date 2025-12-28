# 🎮 Quiz Jeux Vidéos - Écoute et Devine

Un quiz musical pour gamers où il faut reconnaître un jeu vidéo à partir d'un extrait de gameplay.

## 🎯 Concept

Le principe est simple mais addictif :
1. **Écoute** - 15 secondes de gameplay audio seulement
2. **Regarde** - 5 secondes de vidéo (l'image apparaît progressivement)
3. **Devine** - Choisis parmi 4 propositions
4. **Découvre** - La réponse est révélée

## 🚀 Fonctionnalités

- **10 questions aléatoires** parmi une bibliothèque de jeux
- **Extraire audio/vidéo YouTube** automatiquement
- **Interface moderne et responsive** avec fond dégradé
- **Système de phases** visuel avec timer
- **Pas de scores** - juste le plaisir de deviner
- **Design épuré** sans distractions

## 📁 Structure du Projet

quiz-jeux-videos/
├── index.html # Point d'entrée principal
├── README.md # Documentation
├── styles/
│ ├── main.css # Styles de base et utilitaires
│ ├── home.css # Écran d'accueil
│ └── quiz.css # Écran du quiz
└── scripts/
├── config.js # Configuration (timers, constantes)
├── games.js # Liste des jeux et fonctions utilitaires
├── YouTubePlayer.js # Gestion de l'API YouTube
├── PhaseManager.js # Gestion des phases (audio/vidéo/réponse)
├── QuestionManager.js # Gestion des questions et réponses
├── GameManager.js # Orchestrateur principal
└── main.js # Point d'entrée JavaScript
text


## 🛠️ Installation

1. **Cloner ou télécharger** le projet
2. **Ouvrir** `index.html` dans un navigateur moderne
3. **Autoriser l'audio** au premier clic (requis par les navigateurs)

**Aucune installation de dépendances nécessaire !** Tout fonctionne avec des CDN.

## 🎮 Comment Jouer

1. **Clique sur "COMMENCER LE QUIZ"**
2. **Phase 1 - Écoute (15s)** : Seul l'audio joue, essaye de deviner
3. **Phase 2 - Visionnage (5s)** : La vidéo apparaît progressivement
4. **Phase 3 - Réponse (5s)** : 
   - Soit tu as déjà répondu (bonne ou mauvaise)
   - Soit la réponse est révélée automatiquement
5. **Clique sur "QUESTION SUIVANTE"** pour continuer
6. **Après 10 questions**, le quiz se termine

## 🔧 Configuration

Modifie `scripts/config.js` pour ajuster :

```javascript
const CONFIG = {
    PHASE1_TIME: 15,    // Durée de la phase audio
    PHASE2_TIME: 5,     // Durée de la phase vidéo
    PHASE3_TIME: 5,     // Durée de la phase réponse
    TOTAL_QUESTIONS: 10, // Nombre total de questions
    MIN_START_TIME: 30, // Délai min pour démarrer la vidéo YouTube
    MAX_START_TIME: 180 // Délai max pour démarrer la vidéo YouTube
};

🎯 Ajouter des Jeux

Ajoute des jeux dans scripts/games.js :
javascript

const GAMES = [
    { name: "Nom du Jeu", videoId: "ID_YouTube" },
    // Exemple : { name: "God of War", videoId: "K0u_kAWLJOA" }
    // ... ajoute autant de jeux que tu veux
];

Pour trouver l'ID YouTube :

    Va sur la vidéo YouTube

    L'ID est dans l'URL : youtube.com/watch?v=**K0u_kAWLJOA**

    Choisis des vidéos de gameplay sans commentaires pour plus de défi !

🎨 Personnalisation
Couleurs

Modifie les dégradés dans styles/main.css :
css

background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);

Design Responsive

    Desktop : Grille de 2×2 pour les réponses

    Mobile : Grille de 1×4 pour les réponses

    Tous les écrans : Vidéo en 16:9 responsive

🔄 Architecture Technique
Modules JavaScript

    GameManager : Orchestrateur principal

    YouTubePlayer : Abstraction de l'API YouTube

    PhaseManager : Gestion des timers et transitions

    QuestionManager : Logique des questions/réponses

Flux de Données
text

main.js → GameManager → (Initialisation)
GameManager → YouTubePlayer (vidéo)
GameManager → PhaseManager (timers)
GameManager → QuestionManager (Q/R)
Utilisateur → QuestionManager → PhaseManager → GameManager

🌐 Compatibilité

    ✅ Chrome 60+

    ✅ Firefox 55+

    ✅ Safari 11+

    ✅ Edge 79+

    ✅ Mobile Chrome/Safari

Requiert une connexion Internet pour l'API YouTube.
🐛 Dépannage
Problème : L'audio ne joue pas

Solution : Clique n'importe où sur la page pour débloquer l'audio (politique des navigateurs)
Problème : Vidéo YouTube ne charge pas

Solution :

    Vérifie la connexion Internet

    Vérifie que l'ID YouTube est correct dans games.js

    Actualise la page

Problème : Timer décalé

Solution : L'API YouTube peut avoir un délai de chargement, c'est normal
📱 Responsive Design

    > 768px : Layout desktop complet

    < 768px : Layout mobile optimisé

    Taille flexible : S'adapte à toutes les résolutions

🔮 Évolutions Possibles

Idées pour améliorer le projet :
Faciles à implémenter :

    Catégories (RPG, FPS, Indie...)

    Niveaux de difficulté

    Mode sans fin (questions illimitées)

    Partage de score (si ajouté plus tard)

Plus avancées :

    Mode multijoueur en temps réel

    Création de playlists personnalisées

    Statistiques de réussite par jeu

    Application mobile (PWA)

📄 Licence

Projet libre pour usage personnel et éducatif.

Les vidéos YouTube appartiennent à leurs ayants droit respectifs.
🙏 Remerciements

    API YouTube IFrame pour l'intégration vidéo

    Font Awesome pour les icônes

    Google Fonts pour la typographie

👨‍💻 Auteur

Teydo et DeepSeek
Développé avec passion pour les gamers.