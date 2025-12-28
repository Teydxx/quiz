// games.js - Liste des jeux vidéos avec IDs YouTube de gameplay
// IDs fournis par l'utilisateur, testés et vérifiés

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
    }
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