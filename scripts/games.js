// games.js - Liste des jeux vidéo avec leurs OST YouTube

// OST iconiques de jeux vidéos
const GAMES = [
    // Classiques retro
    { name: "Super Mario Bros", videoId: "5s8YrH3Y8vM" },
    { name: "The Legend of Zelda", videoId: "U_SnVh-5RUA" },
    { name: "Sonic the Hedgehog", videoId: "6T7DqfvP1Eg" },
    { name: "Castlevania", videoId: "ESUTZ1ESP-o" },
    { name: "Street Fighter II", videoId: "7L-mrLQ2sWg" },
    { name: "Chrono Trigger", videoId: "im3T593uHuk" },
    { name: "Metal Gear Solid", videoId: "LbObf_a8TBk" },
    
    // RPG épiques
    { name: "The Elder Scrolls V: Skyrim", videoId: "PTFwQP86BRs" },
    { name: "Final Fantasy VII", videoId: "VVqe6Tt-bgM" },
    { name: "Persona 5", videoId: "YoQk-_eA5dM" },
    
    // FPS/action
    { name: "Halo", videoId: "Uw8EgTjYMgE" },
    { name: "Silent Hill 2", videoId: "pvJQe9pzDkQ" },
    
    // Indé modernes
    { name: "Undertale", videoId: "0FO1cTlT4Ok" },
    { name: "Minecraft", videoId: "s7tN4Yl13b8" },
    { name: "Celeste", videoId: "IOEAVVq8KEo" },
    
    // Ajouts bonus
    { name: "Kingdom Hearts", videoId: "t0kupq-UU2Q" },
    { name: "The Witcher 3: Wild Hunt", videoId: "UwPpV3AxJxU" },
    { name: "Dark Souls", videoId: "rGfqy9Xo9Pw" },
    { name: "Mass Effect", videoId: "OcL8G86stc8" },
    { name: "BioShock Infinite", videoId: "mhh71u0r6WY" }
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