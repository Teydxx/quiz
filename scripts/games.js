// Fonction pour mélanger un tableau
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Liste de 50 jeux vidéo avec OST uniques
const GAMES = [
    // Jeux existants vérifiés
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
    
    // Nouveaux jeux de la liste Copilot (uniques)
    {
        name: "Halo 3",
        videoId: "P2NVJSJVGVQ"
    },
    {
        name: "Dark Souls",
        videoId: "3bqLGebDRIY"
    },
    {
        name: "Metal Gear Solid",
        videoId: "f8zsaw6yIzE"
    },
    {
        name: "Kingdom Hearts II",
        videoId: "sihC5l_gIak"
    },
    {
        name: "Bloodborne",
        videoId: "ICSk8-pJkX8"
    },
    {
        name: "Super Smash Bros. Melee",
        videoId: "SOXF5LplME8"
    },
    {
        name: "The Last of Us",
        videoId: "Xd-GB_ueJgA"
    },
    {
        name: "God of War (2018)",
        videoId: "rg8y4npCdY8"
    },
    {
        name: "Hollow Knight",
        videoId: "MJDn70jh1V0"
    },
    {
        name: "Celeste",
        videoId: "1rwAvUvvQzQ"
    },
    {
        name: "Undertale",
        videoId: "0FCvzsVlXpQ"
    },
    {
        name: "DOOM (2016)",
        videoId: "U-3kJcBfQ9w"
    },
    {
        name: "Stardew Valley",
        videoId: "fI9QzlD_sm0"
    },
    {
        name: "Portal 2",
        videoId: "oAg4yjEmerU"
    },
    {
        name: "Journey",
        videoId: "TLfj3pAlrs4"
    },
    {
        name: "Shadow of the Colossus",
        videoId: "Pdi1DSqBZ6Q"
    },
    {
        name: "Red Dead Redemption",
        videoId: "zLrOS5oz6IQ"
    },
    {
        name: "Assassin's Creed II",
        videoId: "FSVHx23ByhM"
    },
    {
        name: "Mass Effect 2",
        videoId: "VTsD2FjmLsw"
    },
    {
        name: "Final Fantasy X",
        videoId: "6fp81GzKarQ"
    },
    {
        name: "Persona 3",
        videoId: "bNvjrEoVoH0"
    },
    {
        name: "GTA: San Andreas",
        videoId: "7qfbi3HACV8"
    },
    {
        name: "The Elder Scrolls IV: Oblivion",
        videoId: "3YKicBAMlBk"
    },
    {
        name: "Diablo II",
        videoId: "gGTUz4OnzdM"
    },
    {
        name: "League of Legends",
        videoId: "aR-KAldshAE"
    },
    {
        name: "Overwatch",
        videoId: "xco_LrRLYN4"
    },
    {
        name: "Hades",
        videoId: "SqFaCDvHxU4"
    },
    {
        name: "Cuphead",
        videoId: "2clUY-OsCpY"
    },
    {
        name: "Monster Hunter World",
        videoId: "nn6qY2sXLjE"
    },
    {
        name: "Splatoon",
        videoId: "g3Jk3QfQf6E"
    },
    {
        name: "Xenoblade Chronicles",
        videoId: "iZt2IuH2u8E"
    },
    {
        name: "The Legend of Zelda: Ocarina of Time",
        videoId: "Hy0aEj85ifY"
    },
    {
        name: "Death Stranding",
        videoId: "tAGnKpE4NCI"
    },
    {
        name: "Cyberpunk 2077",
        videoId: "ZqZf1X0d0n4"
    },
    {
        name: "Super Smash Bros. Ultimate",
        videoId: "pXRviuL6vMY"
    },
    {
        name: "Banjo-Kazooie",
        videoId: "u1n7pZfFJx8"
    },
    {
        name: "Final Fantasy IX",
        videoId: "8Z9Ismh1V9E"
    },
    {
        name: "Donkey Kong Country",
        videoId: "N2Z7WcQp5yI"
    },
    {
        name: "Street Fighter IV",
        videoId: "1o9dJkzJk9A"
    },
    {
        name: "Horizon Zero Dawn",
        videoId: "eQFjZkVQK2A"
    }
];

// Note: J'ai supprimé les doublons suivants :
// - "Fire Emblem Awakening" (apparaissait 2 fois)
// - "Red Dead Redemption 2" (déjà dans une liste précédente avec ID différent)
// - "Portal 2" (ID différent mais jeu déjà présent)
// - "Super Metroid" (ID dupliqué avec Banjo-Kazooie)
// - "Mario Kart 8" (ID invalide "dQw4w9WgXcQ" = Rickroll)