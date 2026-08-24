function launchBall() {
  if (gameState === "exitChoice") return;

  if (gameState === "lost") {
    returnToLobby(false);
    return;
  }

  if (ballStuck) {
    ballStuck = false;
    stuckTimer = 0;
    launchBallForwardFromTrolley();
    ball.launched = true;
    ball.pierceDamageRemaining = 0;
    gameState = "playing";
    messageEl.style.display = "none";
    return;
  }

  if (gameState !== "waiting" || ball.launched) return;

  launchBallForwardFromTrolley();
  ball.launched = true;
  ball.pierceDamageRemaining = 0;

  gameState = "playing";
  messageEl.style.display = "none";
}

window.addEventListener("keydown", event => {
  ensureBgMusic();
  keys[event.key.toLowerCase()] = true;

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    launchBall();
  }

  if (event.key.toLowerCase() === "g") {
    armGlue();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("pointerdown", event => {
  ensureBgMusic();
  if (gameState === "upgrade" || gameState === "shop" || gameState === "stats") return;

  if (gameState === "playing") {
    const rect = canvas.getBoundingClientRect();
    const worldX = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
    const worldY = ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT;
    const tappedEnemy = enemyAtWorldPoint(worldX, worldY);

    if (tappedEnemy && useRangerSkill(tappedEnemy)) {
      event.preventDefault();
      return;
    }
  }

  if (gameState === "exitChoice" || gameState === "roomClear") {
    pointerActive = true;
    setPointerPosition(event);
    return;
  }

  pointerActive = true;
  setPointerPosition(event);

  if (gameState === "lost") {
    returnToLobby(false);
    return;
  }

  if (!ball.launched || ballStuck) launchBall();
});

canvas.addEventListener("pointermove", event => {
  if (!pointerActive) return;
  setPointerPosition(event);
});

window.addEventListener("pointerup", () => {
  pointerActive = false;
});

function setPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  pointerX = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
  pointerY = ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT;
}

openProfilesButton.addEventListener("click", () => {
  runLobby.classList.add("hidden");
  renderProfiles();
  profilesOverlay.classList.remove("hidden");
});

closeProfilesButton.addEventListener("click", () => {
  profilesOverlay.classList.add("hidden");
  runLobby.classList.remove("hidden");
});

openOptionsButton.addEventListener("click", () => {
  runLobby.classList.add("hidden");
  applySoundSettings();
  optionsOverlay.classList.remove("hidden");
});

closeOptionsButton.addEventListener("click", () => {
  optionsOverlay.classList.add("hidden");

  if (optionsOpenedFromPause) {
    optionsOpenedFromPause = false;
    pauseOverlay.classList.remove("hidden");
  } else {
    runLobby.classList.remove("hidden");
  }
});

musicVolumeInput.addEventListener("input", () => {
  gameSettings.musicVolume = Number(musicVolumeInput.value);
  gameSettings.musicMuted = false;
  saveSettings();
  applySoundSettings();
  ensureBgMusic();
});

sfxVolumeInput.addEventListener("input", () => {
  gameSettings.sfxVolume = Number(sfxVolumeInput.value);
  gameSettings.sfxMuted = false;
  saveSettings();
  applySoundSettings();
});

muteMusicButton.addEventListener("click", () => {
  gameSettings.musicMuted = !gameSettings.musicMuted;
  saveSettings();
  applySoundSettings();
});

muteSfxButton.addEventListener("click", () => {
  gameSettings.sfxMuted = !gameSettings.sfxMuted;
  saveSettings();
  applySoundSettings();
});

function profileSummary(index) {
  const save = loadProfile(index);
  if (!save) return null;

  return {
    name: save.profileName || `Adventurer ${index}`,
    level: save.level || 1,
    xp: save.xp || 0,
    bestRoom: save.bestRoom || 0
  };
}

function renderProfiles() {
  profileCardsEl.innerHTML = "";

  for (let index = 1; index <= PROFILE_COUNT; index++) {
    const summary = profileSummary(index);
    const card = document.createElement("div");
    card.className =
      "profileCard" +
      (index === activeProfileIndex ? " active" : "") +
      (!summary ? " empty" : "");

    if (summary) {
      card.innerHTML = `
        <div class="profileCardHeader">
          <strong>${summary.name}</strong>
          <span>${index === activeProfileIndex ? "ACTIVE" : `SLOT ${index}`}</span>
        </div>
        <div class="profileMeta">
          Level ${summary.level} · ${summary.xp}/${xpNeededForLevel(summary.level)} XP · Best Room ${summary.bestRoom}
        </div>
        <div class="profileActions">
          <button data-profile-load="${index}">
            ${index === activeProfileIndex ? "SELECTED" : "SWITCH"}
          </button>
          <button class="danger" data-profile-reset="${index}">NEW GAME</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="profileCardHeader">
          <strong>Empty Slot ${index}</strong>
          <span>SLOT ${index}</span>
        </div>
        <div class="profileMeta">Start a completely fresh adventurer.</div>
        <div class="profileActions">
          <button data-profile-new="${index}">CREATE</button>
        </div>
      `;
    }

    profileCardsEl.appendChild(card);
  }

  profileCardsEl
    .querySelectorAll("[data-profile-load]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.profileLoad);
        switchProfile(index);
      });
    });

  profileCardsEl
    .querySelectorAll("[data-profile-new]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.profileNew);
        createProfile(index, false);
      });
    });

  profileCardsEl
    .querySelectorAll("[data-profile-reset]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.profileReset);
        createProfile(index, true);
      });
    });
}

function switchProfile(index) {
  const loaded = loadProfile(index);
  if (!loaded) return;

  activeProfileIndex = index;
  progression = loaded;

  localStorage.setItem(
    ACTIVE_PROFILE_KEY,
    String(activeProfileIndex)
  );

  applyPermanentStats();
  applyEquipment();
  updateStatsUI();
  updateLoadoutUI();
  updateLobbyUI();
  renderProfiles();

  profilesOverlay.classList.add("hidden");
  runLobby.classList.remove("hidden");
}

function createProfile(index, overwrite) {
  if (overwrite) {
    const ok = window.confirm(
      `Start a completely new game in Slot ${index}? This permanently erases that slot's progress.`
    );

    if (!ok) return;
  }

  const fresh = createFreshProgression(index);

  localStorage.setItem(
    profileKey(index),
    JSON.stringify(fresh)
  );

  activeProfileIndex = index;
  progression = fresh;

  localStorage.setItem(
    ACTIVE_PROFILE_KEY,
    String(activeProfileIndex)
  );

  applyPermanentStats();
  applyEquipment();
  updateStatsUI();
  updateLoadoutUI();
  updateLobbyUI();
  renderProfiles();

  profilesOverlay.classList.add("hidden");
  runLobby.classList.remove("hidden");
}

openLoadoutButton.addEventListener("click", () => {
  runLobby.classList.add("hidden");
  loadoutOverlay.classList.remove("hidden");
  activePrepareSlot = "ball";
  inspectedPrepareItem = progression.equipment.ball;
  updateLoadoutUI();
});

closeLoadoutButton.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();

  loadoutOverlay.classList.add("hidden");
  equipmentPicker.classList.add("hidden");

  runLobby.classList.remove("hidden");

  // Reset inspection state so Prepare always reopens cleanly.
  activePrepareSlot = "ball";
  inspectedPrepareItem =
    progression.equipment.ball;
});

document.querySelectorAll(".prepareSlot[data-slot]").forEach(button => {
  button.addEventListener("click", () => {
    activePrepareSlot = button.dataset.slot;
    updateLoadoutUI();
  });
});

openStatsButton.addEventListener("click", () => {
  runLobby.classList.add("hidden");
  statsOverlay.classList.remove("hidden");
  updateStatsUI();
});

closeStatsBtn.addEventListener("click", () => {
  statsOverlay.classList.add("hidden");
  runLobby.classList.remove("hidden");
  updateLobbyUI();
});

startRunButton.addEventListener("click", () => {
  runLobby.classList.add("hidden");
  lastRunSummaryEl.classList.add("hidden");
  resetRun();
  startRoom();
});

document.querySelectorAll("[data-stat]").forEach(button => {
  button.addEventListener("click", () => {
    const stat = button.dataset.stat;
    const dir = Number(button.dataset.dir);

    if (dir > 0) {
      if (progression.statPoints <= 0) return;
      progression.statPoints -= 1;
      progression.stats[stat] += 1;
    } else {
      if (progression.stats[stat] <= 0) return;
      progression.stats[stat] -= 1;
      progression.statPoints += 1;
    }

    saveProgression();
    applyPermanentStats();
    updateStatsUI();
    updateHUD();
  });
});

document.querySelectorAll(".upgradeCard[data-rune]").forEach(button => {
  button.addEventListener("click", () => chooseRune(button.dataset.rune));
});

document.querySelectorAll(".shopCard").forEach(button => {
  button.addEventListener("click", () => buyShopItem(button.dataset.shop));
});

leaveShopBtn.addEventListener("click", leaveShop);
glueButton.addEventListener("click", armGlue);

function chooseRune(type) {
  if (gameState !== "upgrade") return;
  if (!(type in runes)) return;
  if (!currentRuneOffer.includes(type)) return;

  runes[type] += 1;

  applyRunModifiers();

  upgradeOverlay.classList.add("hidden");
  updateRuneText();
  updateHUD();

  gameState = "postRewardShake";
  postRewardShakeTimer = 0.72;
  pendingExitAfterReward = true;
}



function applyRunModifiers() {
  // Caps protect the physical game from runaway stacking.
  const damageMult = Math.min(2.5, 1 + runes.power * 0.10);

  const speedUp = runes.tempo * 0.08;
  const speedDown = runes.drag * 0.08;
  const ballSpeedMult = Math.max(0.55, Math.min(1.75, 1 + speedUp - speedDown));

  const trolleySpeedMult = Math.min(1.75, 1 + runes.agility * 0.10);
  const hpMult = Math.min(2.0, 1 + runes.vitality * 0.10);

  const cooldownReduction = Math.min(0.45, runes.cooldown * 0.08);
  const ballRadiusMult = Math.min(1.50, 1 + runes.ballSize * 0.08);

  ball.runDamageMultiplier = damageMult;
  ball.runSpeedMultiplier = ballSpeedMult;
  ball.radius = Math.round(ball.baseRadius * ballRadiusMult);

  player.runSpeedMultiplier = trolleySpeedMult;
  recalculatePaddleSize("run modifiers");

  const permanentMaxHp = 5 + progression.stats.vitality;
  const newMaxHp = Math.max(
    permanentMaxHp,
    Math.round(permanentMaxHp * hpMult)
  );

  const hpDelta = newMaxHp - player.maxHp;
  player.maxHp = newMaxHp;
  if (hpDelta > 0) player.hp += hpDelta;
  player.hp = Math.min(player.hp, player.maxHp);

  rangerSkill.effectiveCooldown =
    rangerSkill.cooldown * (1 - cooldownReduction);
}

function elementalStrengthMultiplier() {
  return Math.min(2.0, 1 + runes.elemental * 0.12);
}

function updateRuneText() {
  if (powerRuneLevelEl) {
    powerRuneLevelEl.textContent =
      `Ball damage: +${Math.min(150, runes.power * 10)}%`;
  }

  if (tempoRuneLevelEl) {
    tempoRuneLevelEl.textContent =
      `Ball speed: +${Math.min(75, runes.tempo * 8)}%`;
  }

  if (dragRuneLevelEl) {
    dragRuneLevelEl.textContent =
      `Ball speed: -${Math.min(45, runes.drag * 8)}%`;
  }

  if (agilityRuneLevelEl) {
    agilityRuneLevelEl.textContent =
      `Trolley speed: +${Math.min(75, runes.agility * 10)}%`;
  }

  if (expansionRuneLevelEl) {
    expansionRuneLevelEl.textContent =
      `Width: +${Math.min(60, runes.expansion * 10)}%`;
  }

  if (vitalityRuneLevelEl) {
    vitalityRuneLevelEl.textContent =
      `Max HP: +${Math.min(100, runes.vitality * 10)}%`;
  }

  if (cooldownRuneLevelEl) {
    cooldownRuneLevelEl.textContent =
      `Skill cooldown: -${Math.min(45, runes.cooldown * 8)}%`;
  }

  if (ballSizeRuneLevelEl) {
    ballSizeRuneLevelEl.textContent =
      `Ball size: +${Math.min(50, runes.ballSize * 8)}%`;
  }

  if (elementalRuneLevelEl) {
    elementalRuneLevelEl.textContent =
      `Element strength: +${Math.min(100, runes.elemental * 12)}%`;
  }

  const active = [];

  if (runes.power) active.push(`💥${runes.power}`);
  if (runes.tempo) active.push(`⚡${runes.tempo}`);
  if (runes.drag) active.push(`🐌${runes.drag}`);
  if (runes.agility) active.push(`🏃${runes.agility}`);
  if (runes.expansion) active.push(`↔️${runes.expansion}`);
  if (runes.vitality) active.push(`❤️${runes.vitality}`);
  if (runes.cooldown) active.push(`⌛${runes.cooldown}`);
  if (runes.ballSize) active.push(`⚪${runes.ballSize}`);
  if (runes.elemental) active.push(`✨${runes.elemental}`);

  runeHudTextEl.textContent =
    active.length ? active.join("  ") : "None";
}

function openShop() {
  gameState = "shop";
  patchBoughtThisVisit = false;
  document.querySelectorAll('[data-shop="heal"],[data-shop="patch"]').forEach(b=>{b.disabled=false;b.style.opacity="1";});
  messageEl.style.display = "none";
  shopOverlay.classList.remove("hidden");
  updateShopUI();
}

function leaveShop() {
  if (gameState !== "shop") return;

  shopOverlay.classList.add("hidden");
  roomNumber += 1;
  currentRoomType = pendingRoomType;
  startRoom();
}

function buyShopItem(type) {
  if (gameState !== "shop") return;

  if (type === "overshield") {
    if (hasOvershield || gold < 12) return;
    gold -= 12;
    hasOvershield = true;
    shieldReady = true;
  }

  if (type === "glue") {
    if (gold < 8) return;
    gold -= 8;
    glueCharges += 1;
  }

  if (type === "heal") {
    if (patchBoughtThisVisit || gold < 6 || player.hp >= player.maxHp) return;
    gold -= 6;
    player.hp = Math.min(player.maxHp, player.hp + 2);
    patchBoughtThisVisit = true;
  }

  if (type === "ball") {
    if (gold < 10 || ballsLeft >= maxBalls) return;
    gold -= 10;
    ballsLeft += 1;
  }

  updateHUD();
  updateShopUI();
}

function updateShopUI() {
  shieldOwnedEl.textContent = hasOvershield ? "OWNED — recharges each room" : "Not owned";
  glueCountEl.textContent = `Charges: ${glueCharges}`;
  healStatusEl.textContent = patchBoughtThisVisit
    ? `PURCHASED THIS VISIT — HP: ${player.hp} / ${player.maxHp}`
    : `HP: ${player.hp} / ${player.maxHp}`;
  if (ballShopStatusEl) ballShopStatusEl.textContent = `Balls: ${ballsLeft} / ${maxBalls}`;

  const shieldBtn = document.querySelector('[data-shop="overshield"]');
  const glueBtn = document.querySelector('[data-shop="glue"]');
  const healBtn = document.querySelector('[data-shop="heal"]');
  const ballBtn = document.querySelector('[data-shop="ball"]');

  if (shieldBtn) shieldBtn.disabled = hasOvershield || gold < 12;
  if (glueBtn) glueBtn.disabled = gold < 8;
  if (healBtn) healBtn.disabled = patchBoughtThisVisit || gold < 6 || player.hp >= player.maxHp;
  if (ballBtn) ballBtn.disabled = gold < 10 || ballsLeft >= maxBalls;

  updateFrameHUD();
  updateGlueButton();
}

function armGlue() {
  if (gameState !== "playing" || glueCharges <= 0 || glueArmed || ballStuck) return;

  glueCharges -= 1;
  glueArmed = true;
  updateGlueButton();
  updateShopUI();
}

function updateGlueButton() {
  glueButtonCount.textContent = glueCharges;
  glueButton.classList.toggle("armed", glueArmed);
  glueButton.classList.toggle("hidden", glueCharges <= 0 && !glueArmed);
  glueButton.disabled = gameState !== "playing" || glueCharges <= 0 || glueArmed;
}

function updateRoomClear(dt) {
  if (gameState !== "roomClear") return;

  roomClearTimer -= dt;
  if (roomClearTimer > 0) return;

  roomClearBannerEl.classList.add("hidden");

  if (roomClearRewardPending) {
    roomClearRewardPending = false;
    gameState = "upgrade";
    updateRuneText();
    upgradeOverlay.classList.remove("hidden");
  }
}

function updatePostRewardShake(dt) {
  if (gameState !== "postRewardShake") return;

  postRewardShakeTimer -= dt;

  if (postRewardShakeTimer <= 0) {
    pendingExitAfterReward = false;
    const currentNode = routeSectionOne.nodes[routeGraphState.currentNodeId];
    if (currentNode && (currentNode.exits || []).length === 0) {
      returnToLobby(true);
    } else {
      beginExitChoice();
    }
  }
}
