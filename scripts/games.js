// Fonction pour mélanger un tableau (version améliorée)
function shuffleArray(array) {
    const shuffled = [...array];
    
    // Mélange Fisher-Yates amélioré
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Utiliser crypto.getRandomValues pour un vrai aléatoire
        const cryptoArray = new Uint32Array(1);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(cryptoArray);
            const j = cryptoArray[0] % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        } else {
            // Fallback pour les vieux navigateurs
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    }
    
    return shuffled;
}

// Ajouter plus de jeux pour plus de variété (exemple)
const GAMES = [
    {
        name: "The Legend of Zelda: Breath of the Wild",
        videoId: "FYTFtTEulRI"
    },
    {
        name: "Super Mario Odyssey",
        videoId: "-rfoYSmx0rk"
    },
    {
        name: "Final Fantasy VII",
        videoId: "7HV3oyxr0Eg"
    },
    {
        name: "Halo: Combat Evolved",
        videoId: "p4mRgxIYtE0"
    },
    {
        name: "The Elder Scrolls V: Skyrim",
        videoId: "pPWVfCtnGyg"
    },
    {
        name: "NieR: Automata",
        videoId: "LC5HsZt4oNc"
    },
    {
        name: "The Witcher 3: Wild Hunt",
        videoId: "TJuPBBw-l-M"
    },
    {
        name: "Persona 5",
        videoId: "CGwH6rZk7VM"
    },
    {
        name: "Mass Effect",
        videoId: "hV1pPgpcAVw"
    },
    {
        name: "Chrono Trigger",
        videoId: "PCAjoJHEGTE"
    },
    // Ajoutez plus de jeux ici...
    {
        name: "Red Dead Redemption 2",
        videoId: "eaW0tYpxyp0"
    },
    {
        name: "God of War (2018)",
        videoId: "K0u_kAWLJOA"
    },
    {
        name: "Portal 2",
        videoId: "TluRVBhmf8w"
    }
];