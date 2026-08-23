function checkVictory() {
  const mobsLeft =
    bricks.filter(brick => brick.alive && brick.isMob).length;

  if (mobsLeft === 0 && gameState === "playing") {
    addXP(roomNumber === 5 ? 75 : 20);

    if (roomNumber === 5) {
      progression.raiderUnlocked = true;
      saveProgression();
    }

    resetHitCombo();

    ball.launched = false;
    ballStuck = false;
    enemyProjectiles = [];
    fallingPickups = [];
    bossHudEl.classList.add("hidden");

    // Re-center the mounted hero/trolley before presenting the reward.
    player.x = WORLD_WIDTH / 2;
    player.velocityX = 0;
    ball.x = player.x;
    ball.y = player.y - 58;

    gameState = "upgrade";
    messageEl.style.display = "none";

    updateRuneText();
    rollRuneOffer(3);

    upgradeOverlay.classList.add("rewardRise");
    upgradeOverlay.classList.remove("hidden");

    setTimeout(() => {
      upgradeOverlay.classList.remove("rewardRise");
    }, 450);
  }
}

function updateLobbyUI() {
  activeProfileNameEl.textContent =
    progression.profileName || `Adventurer ${activeProfileIndex}`;
  lobbyLevelEl.textContent = progression.level;
  lobbyXpEl.textContent = `${progression.xp} / ${xpNeededForLevel(progression.level)}`;
  bestRoomEl.textContent = progression.bestRoom || 0;
}

function returnToLobby(victory = false) {
  progression.bestRoom = Math.max(progression.bestRoom || 0, roomNumber);
  saveProgression();
  updateStatsUI();
  updateLobbyUI();

  const xpNeed = xpNeededForLevel(progression.level);
  lobbyTitleEl.textContent = victory ? "Run Complete!" : "Run Ended";
  lobbySubtitleEl.textContent = victory
    ? "Your adventure continues."
    : "Spend your earned stat points, adjust your build, and try again.";

  lastRunSummaryEl.innerHTML =
    `Reached Room <strong>${roomNumber}</strong><br>` +
    `Level <strong>${progression.level}</strong> — ${progression.xp}/${xpNeed} XP`;

  lastRunSummaryEl.classList.remove("hidden");
  runLobby.classList.remove("hidden");

  gameState = "lobby";
  ball.launched = false;
  ballStuck = false;
  enemyProjectiles = [];
}

function createParticles(x, y, count, color = "#f7d98a") {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 360,
      vy: (Math.random() - 0.5) * 360,
      life: 0.4 + Math.random() * 0.4,
      size: 4 + Math.random() * 7,
      color,
      text: null
    });
  }
}

function createFloatingGold(x, y, amount) {
  createFloatingText(x, y, `+${amount} 💰`, "#f4d26f");
}

function createFloatingText(x, y, text, color) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: -70,
    life: 1.1,
    size: 22,
    color,
    text
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (!p.text) p.vy += 400 * dt;

    p.life -= dt;

    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateFrameHUD() {
  if (roomPlaqueEl) {
    roomPlaqueEl.textContent = roomNumber === 5
      ? "ROOM 5 — MINI-BOSS"
      : `ROOM ${roomNumber}`;
  }

  if (frameMoneyValueEl) {
    frameMoneyValueEl.textContent = gold;
  }

  if (frameRunesEl) {
    const entries = [
      ["💥", runes.power],
      ["⚡", runes.tempo],
      ["🐌", runes.drag],
      ["🏃", runes.agility],
      ["↔", runes.expansion],
      ["❤", runes.vitality],
      ["⌛", runes.cooldown],
      ["●", runes.ballSize],
      ["✦", runes.elemental]
    ].filter(([, value]) => value > 0);

    frameRunesEl.innerHTML = entries
      .map(([icon, value]) => `<div class="frameRune"><span>${icon}</span><strong>${value}</strong></div>`)
      .join("");
  }
}

function updateHUD() {
  heroShieldEl.textContent =
    (hasOvershield ? (shieldReady ? " 💙" : " ♡") : "") +
    (armorPoints > 0 ? ` 🛡️${armorPoints}` : "");
  livesHudEl.textContent = ` ⚪ ${ballsLeft}`;
  goldHudEl.textContent = `💰 ${gold}`;
  if (shopGoldEl) shopGoldEl.textContent = `${gold} 💰`;

  const mobsLeft = bricks.filter(brick => brick.alive && brick.isMob).length;

  updateGlueButton();
  updateComboHUD();
}

