
const menu = document.getElementById("menu");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let running = false;

const keys = {};

const player = {
    x: 180,
    y: 350,
    hp: 100,
    energy: 100,
    color: "#334f9b",
    speed: 5,
    jump: 0,
    attack: 0
};

const enemy = {
    x: 750,
    y: 350,
    hp: 100,
    color: "#a52c48",
    speed: 2
};

function startGame() {
    menu.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    player.x = 180;
    player.hp = 100;
    player.energy = 100;

    enemy.x = 750;
    enemy.hp = 100;

    running = true;
    requestAnimationFrame(loop);
}

document.getElementById("playButton")
    .addEventListener("click", startGame);

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

function drawFighter(f, name) {
    // Corpo
    ctx.fillStyle = f.color;
    ctx.fillRect(f.x - 18, f.y - 65, 36, 65);

    // Cabeça
    ctx.fillStyle = "#e2ad8b";
    ctx.fillRect(f.x - 15, f.y - 90, 30, 28);

    // Cabelo
    ctx.fillStyle = name === "player" ? "#29232d" : "#151018";
    ctx.fillRect(f.x - 17, f.y - 95, 34, 12);

    // Olhos
    ctx.fillStyle = "#111";
    ctx.fillRect(f.x - 8, f.y - 79, 4, 3);
    ctx.fillRect(f.x + 5, f.y - 79, 4, 3);

    // Pernas
    ctx.fillStyle = "#111827";
    ctx.fillRect(f.x - 15, f.y - 10, 12, 10);
    ctx.fillRect(f.x + 3, f.y - 10, 12, 10);
}

function update() {
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    player.x = Math.max(30, Math.min(930, player.x));

    if (keys["j"] && player.attack <= 0) {
        player.attack = 15;

        if (Math.abs(player.x - enemy.x) < 75) {
            enemy.hp = Math.max(0, enemy.hp - 7);
        }
    }

    if (keys["k"] && player.attack <= 0) {
        player.attack = 20;

        if (Math.abs(player.x - enemy.x) < 95) {
            enemy.hp = Math.max(0, enemy.hp - 12);
        }
    }

    if (keys["l"] && player.attack <= 0 && player.energy >= 25) {
        player.attack = 30;
        player.energy -= 25;

        if (Math.abs(player.x - enemy.x) < 300) {
            enemy.hp = Math.max(0, enemy.hp - 22);
        }
    }

    player.attack = Math.max(0, player.attack - 1);

    if (player.energy < 100) {
        player.energy += 0.05;
    }

    if (enemy.hp > 0) {
        const distance = player.x - enemy.x;

        if (Math.abs(distance) > 65) {
            enemy.x += Math.sign(distance) * enemy.speed;
        } else {
            player.hp = Math.max(0, player.hp - 0.04);
        }
    }

    enemy.x = Math.max(30, Math.min(930, enemy.x));

    document.getElementById("playerHealth").style.width =
        player.hp + "%";

    document.getElementById("enemyHealth").style.width =
        enemy.hp + "%";

    document.getElementById("playerEnergy").style.width =
        player.energy + "%";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cenário
    const gradient = ctx.createLinearGradient(0, 0, 0, 540);
    gradient.addColorStop(0, "#17162d");
    gradient.addColorStop(1, "#343047");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 540);

    // Prédios
    ctx.fillStyle = "#111323";

    for (let i = 0; i < 10; i++) {
        ctx.fillRect(i * 110, 180 + (i % 3) * 35, 75, 250);
    }

    // Chão
    ctx.fillStyle = "#51445c";
    ctx.fillRect(0, 440, 960, 100);

    drawFighter(player, "player");
    drawFighter(enemy, "enemy");

    // Ataque
    if (player.attack > 0) {
        ctx.fillStyle = "#b56cff";
        ctx.beginPath();
        ctx.arc(player.x + 35, player.y - 55, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    if (enemy.hp <= 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("VITÓRIA!", 480, 230);
    }

    if (player.hp <= 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DERROTA!", 480, 230);
    }
}

function loop() {
    if (!running) return;

    update();
    draw();

    if (player.hp > 0 && enemy.hp > 0) {
        requestAnimationFrame(loop);
    } else {
        running = false;
    }
}
