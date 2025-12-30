// ===== SYSTÈME DE CORRECTION DES VIDÉOS =====

// Charger les jeux corrigés depuis localStorage
function loadCorrectedGames() {
    const correctedGames = JSON.parse(localStorage.getItem('correctedGames') || '[]');
    
    console.log(`🔄 Chargement de ${correctedGames.length} vidéo(s) corrigée(s)`);
    
    correctedGames.forEach(correctedGame => {
        // Chercher si le jeu existe déjà dans GAMES
        const existingIndex = GAMES.findIndex(g => g.name === correctedGame.name);
        
        if (existingIndex !== -1) {
            // Mettre à jour l'ID
            GAMES[existingIndex].videoId = correctedGame.videoId;
            console.log(`🔄 "${correctedGame.name}" mis à jour avec ID: ${correctedGame.videoId}`);
        } else {
            // Ajouter comme nouveau jeu
            GAMES.push({
                name: correctedGame.name,
                videoId: correctedGame.videoId
            });
            console.log(`➕ "${correctedGame.name}" ajouté avec ID: ${correctedGame.videoId}`);
        }
    });
}

// Charger les jeux définitivement supprimés
function loadPermanentlyDeletedGames() {
    const permanentlyDeleted = JSON.parse(localStorage.getItem('permanentlyDeleted') || '[]');
    
    permanentlyDeleted.forEach(deletedGame => {
        // Retirer de GAMES si présent
        const index = GAMES.findIndex(g => g.name === deletedGame.name);
        if (index !== -1) {
            GAMES.splice(index, 1);
            console.log(`🗑️ "${deletedGame.name}" retiré définitivement`);
        }
    });
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadCorrectedGames();
    loadPermanentlyDeletedGames();
});

// ===== FONCTIONS DE GESTION =====

// Ajouter aux supprimés définitivement
function addToPermanentlyDeleted(game) {
    const permanentlyDeleted = JSON.parse(localStorage.getItem('permanentlyDeleted') || '[]');
    
    // Vérifier si déjà dans la liste
    const exists = permanentlyDeleted.some(g => g.name === game.name);
    if (!exists) {
        permanentlyDeleted.push({
            name: game.name,
            videoId: game.videoId,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('permanentlyDeleted', JSON.stringify(permanentlyDeleted));
        console.log(`🗑️ "${game.name}" ajouté aux supprimés définitifs`);
    }
}

// ===== FONCTIONS POUR LA PAGE DELETED-VIDEOS.HTML =====
// (Ces fonctions sont utilisées par la page deleted-videos.html)

// Réintégrer un jeu (appelé depuis deleted-videos.html)
window.reintegrateGame = function(gameName, currentVideoId) {
    // Cette fonction est définie dans deleted-videos.html
    console.log(`Tentative de réintégration: ${gameName}`);
};

// Supprimer définitivement (appelé depuis deleted-videos.html)  
window.permanentlyDelete = function(gameName) {
    // Cette fonction est définie dans deleted-videos.html
    console.log(`Tentative de suppression définitive: ${gameName}`);
};

// ===== FONCTION ORIGINALE DE MÉLANGE =====
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===== LISTE DES JEUX (LA SUITE DU FICHIER RESTE IDENTIQUE) =====
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
    },
    {
        name: "Legend of Kyrandia",
        videoId: "ymTioBu2_Hk"
    },
    {
        name: "Elder scrolls V: Skyrim",
        videoId: "UsnRQJxanVM"
    },
    {
        name: "Rayman 2",
        videoId: "tTu9DmjRNlc"
    },
    {
        name: "Shovel Knight",
        videoId: "wqAYMZSOQao"
    },
    {
        name: "The Last Ninja",
        videoId: "hiLvoMpLQFA"
    },
    {
        name: "Streets of Rage 2",
        videoId: "X56G72teZhk"
    },
    {
        name: "The Secret of Monkey Island",
        videoId: "JeBJIl_naY8"
    },
    {
        name: "Kirby's Adventure",
        videoId: "iKyuKamPsEE"
    },
    {
        name: "Ori & the Blind Forest",
        videoId: "E8sjk57G-s8"
    },
    {
        name: "Super Mario Bros",
        videoId: "L4PxvY2gjP0"
    },
        {
        name: "Fez",
        videoId: "76GnOwHorn0"
    },
    {
        name: "Final Fantasy X",
        videoId: "6fp81GzKarQ"
    },
    {
        name: "Legend of Zelda: Link's Awakening",
        videoId: "1dDucoisuDE"
    },
    {
        name: "Clair Obscur: Expedition 33",
        videoId: "iqizXvvWnmM"
    },
    {
        name: "Beyond Good & Evil",
        videoId: "14H2d13ycYg"
    },
    {
        name: "Silent Hill 2",
        videoId: "6LB7LZZGpkw"
    },
    {
        name: "Rayman Origins",
        videoId: "KIGY62fZgN8"
    },
    {
        name: "Donkey Kong Country",
        videoId: "gkCcvoJ09gU"
    },
    {
        name: "Super Mario World",
        videoId: "QtZEMltv2zY"
    },
    {
        name: "Scott Pilgrim VS the world",
        videoId: "Jz41ys4_z_c"
    },
    {
        name: "Castlevania",
        videoId: "btgi3TPL3AE"
    },
    {
        name: "Trine 2",
        videoId: "uXKPEeJbJSs"
    },
    {
        name: "Legend of Zelda: Link to the past",
        videoId: "bK-ttWxl4CI"
    },
    {
        name: "Final Fantasy VIII",
        videoId: "sv2EIdmwggI"
    },
    {
        name: "Bravely Default",
        videoId: "NgpWhd80ldQ"
    },
    {
        name: "Wild Arms",
        videoId: "gRV_A5ZDXyo"
    },
    {
        name: "The Last of us",
        videoId: "cwDkutphzmU"
    },
    {
        name: "Super Smash Bros Melee",
        videoId: "31zTIWd7boY"
    },
    {
        name: "Donkey Kong Country 2",
        videoId: "mdPlcKg-qFs"
    },
    {
        name: "Dune",
        videoId: "dRJIO6a5lDQ"
    },
        {
        name: "Castlevania III",
        videoId: "ptgaCJSF7j8"
    },
    {
        name: "F-Zero GX",
        videoId: "6la7tTLrlkQ"
    },
    {
        name: "Ico",
        videoId: "XWVij6r4QBw"
    },
    {
        name: "Diablo",
        videoId: "Q2evIg-aYw8"
    },
    {
        name: "Secret of Mana",
        videoId: "tO82WNqJF7Q"
    },
    {
        name: "Red Dead Redemption",
        videoId: "0cXsoRRYf5A"
    },
    {
        name: "Rayman Legends",
        videoId: "delftvs5Gdo"
    },
    {
        name: "Starfox",
        videoId: "oBD3FO6ozXc"
    },
    {
        name: "Shatter",
        videoId: "ldBKPWjD1os"
    },
    {
        name: "Shadow of the Beast",
        videoId: "XlP_FBa9naM"
    },
        {
        name: "Megaman III",
        videoId: "U2kTeh7FNl0"
    },
    {
        name: "Yoshi's island",
        videoId: "FkMz1VhPOF0"
    },
    {
        name: "Shenmue",
        videoId: "Lw6w0iF94ew"
    },
    {
        name: "Thunderforce IV",
        videoId: "rYPcte3BlPw"
    },
    {
        name: "Sonic the Hedgehog",
        videoId: "G-i8HYi1QH0"
    },
    {
        name: "New Super Mario Bros",
        videoId: "6rvMRbcqTfk"
    },
    {
        name: "Tetris",
        videoId: "S098e4mSLDY"
    },
    {
        name: "Super Mario Kart",
        videoId: "edxsLbWPytQ"
    },
    {
        name: "Final Fantasy IX",
        videoId: "aZMLpUTram0"
    },
    {
        name: "Journey",
        videoId: "rkRAAiJnXCE"
    },
        {
        name: "Legend of Zelda: Links Awakening",
        videoId: "Nz91gGUbCog"
    },
    {
        name: "Chrono Trigger",
        videoId: "eDZ2W0GpP_E"
    },
    {
        name: "International Karate",
        videoId: "dvmSpZWW45k"
    },
    {
        name: "Silent Hill",
        videoId: "EYs0kLMuXDE"
    },
    {
        name: "Final Fantasy VI",
        videoId: "OU1W7b4B2tY"
    },
    {
        name: "Street Fighter 2",
        videoId: "e9fhrU7YYcQ"
    },
    {
        name: "Double Dragon Neon",
        videoId: "oQa9S8t42lE"
    },
    {
        name: "Uncharted",
        videoId: "kgcq_ZtqbO0"
    },
    {
        name: "Jets 'n' Guns",
        videoId: "AzghtkL11rY"
    },
    {
        name: "Rayman",
        videoId: "nVlYqIpUKno"
    },
        {
        name: "Ducktales",
        videoId: "G_80PQ543rM"
    },
    {
        name: "Ecco the dolphin",
        videoId: "tCiLK-9pgJs"
    },
    {
        name: "Outrun",
        videoId: "ZdSDIw8uTxo"
    },
    {
        name: "Super Mario Land",
        videoId: "hfDjwG_-ThA"
    },
    {
        name: "Final Fantasy VII",
        videoId: "fbOqcR-BORo"
    },
    {
        name: "Turrican II",
        videoId: "xdtCSybIErE"
    },
    {
        name: "Aqua Kitty DX",
        videoId: "sBInz7xUxPQ"
    },
    {
        name: "Legend of Zelda: Ocarina of Time",
        videoId: "agR5aaQL2PY"
    },
    {
        name: "Shantae: Pirate's curse",
        videoId: "wB6oy6sH4lg"
    },
    {
        name: "DNA Warrior",
        videoId: "m_J-qIX7PTE"
    },
        {
        name: "Bioshock",
        videoId: "jCfwJ6C1eN8"
    },
    {
        name: "Minecraft",
        videoId: "atgjKEgSqSU"
    },
    {
        name: "Super Mario RPG",
        videoId: "lbRJ733xiF4"
    },
    {
        name: "Silent Hill 4: The Room",
        videoId: "4rAC6-UhJzw"
    },
    {
        name: "Jazz Jack Rabbit",
        videoId: "TPM5I2u8ZWQ"
    },
    {
        name: "Super Mario Galaxy",
        videoId: "aKTkDsRMw7Y"
    },
    {
        name: "Arkanoid",
        videoId: "z8kyhQC5XL8"
    },
    {
        name: "Ridge Racer 4",
        videoId: "vVIj0nIM7fk"
    },
    {
        name: "Angry Birds",
        videoId: "clnb7jiIvQM"
    },
        {
        name: "Led Storm",
        videoId: "9b9XjxK2RJc"
    },
    {
        name: "Squids",
        videoId: "Fq9Lgn2lpjE"
    },
    {
        name: "Skies of Arcadia",
        videoId: "fDcjC0g3rSw"
    },
    {
        name: "Day of the Tentacle",
        videoId: "4vJioAZ1oIY"
    },
    {
        name: "Need For Speed: Underground",
        videoId: "DKoY1fw7yCo"
    },
    {
        name: "Final Fantasy XII",
        videoId: "YvW9KQ5vu8Y"
    },
    {
        name: "Warhawk",
        videoId: "I874sVIXx74"
    },
    {
        name: "One Must Fall 2097",
        videoId: "i0FNUDLdT4A"
    },
    {
        name: "Sonic the Hedgehog 3 & Knuckles",
        videoId: "mukkXiZTlc4"
    },
    {
        name: "Lotus Turbo Chalenge 2",
        videoId: "LQSsq7HCNHw"
    },
        {
        name: "Chrono Cross",
        videoId: "J46RY4PU8a8"
    },
    {
        name: "Bomberman",
        videoId: "clUy8G9HuZk"
    },
    {
        name: "Super Mario Bros. 3",
        videoId: "5wApmRF5gyM"
    },
    {
        name: "Genso Suikoden IV",
        videoId: "Zr7Fp8exy3Y"
    },
    {
        name: "To the moon",
        videoId: "zqSzB_xBmtM"
    },
    {
        name: "Panzer Dragoon",
        videoId: "k4oTU0srt2I"
    },
    {
        name: "Speedball 2",
        videoId: "sxomGCQRgFc"
    },
    {
        name: "Child of Light",
        videoId: "J34P7M0O5WE"
    },
    {
        name: "F-Zero",
        videoId: "REdRAlPysSU"
    },
    {
        name: "Portal",
        videoId: "Y6ljFaKRTrI"
    } ,   {
        name: "Fury of the Furries",
        videoId: "eLADL2UwRKk"
    },
    {
        name: "Super Stardust HD",
        videoId: "nZ4hUtBD3hc"
    },
    {
        name: "The Great Giana Sisters",
        videoId: "MlSMoNI03r4"
    },
    {
        name: "Project X",
        videoId: "Dmk59bpyarQ"
    },
    {
        name: "Full Throttle",
        videoId: "doP8gF2rais"
    }

];