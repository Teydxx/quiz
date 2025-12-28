// games.js - Liste des jeux vidéo avec leurs IDs YouTube

// Configuration des jeux
const GAMES = [
    { name: "The Last of Us Part II", videoId: "lDC4X8Dgxr4" },
    { name: "God of War (2018)", videoId: "K0u_kAWLJOA" },
    { name: "Red Dead Redemption 2", videoId: "eaW0tYpxyp0" },
    { name: "The Witcher 3: Wild Hunt", videoId: "c0i88t0Kacs" },
    { name: "Super Mario Odyssey", videoId: "5kcdRBHM7kM" },
    { name: "Minecraft", videoId: "MmB9b5njVbA" },
    { name: "Cyberpunk 2077", videoId: "8X2kIfS6fb8" },
    { name: "Elden Ring", videoId: "AKXiKBnzpBQ" },
    { name: "Grand Theft Auto V", videoId: "QkkoHAzjnUs" },
    { name: "Hollow Knight", videoId: "UAO2urG23S4" },
    { name: "Portal 2", videoId: "TluRVBhmf8w" },
    { name: "The Legend of Zelda: Breath of the Wild", videoId: "zw47_q9wbBE" },
    { name: "Dark Souls III", videoId: "c7wC8l6s8Uc" },
    { name: "Overwatch 2", videoId: "GKXS_YA9s7E" },
    { name: "Fortnite", videoId: "6I_r7qJzXjA" }
];

// Fonction pour mélanger un tableau
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}