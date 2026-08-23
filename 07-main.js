function canPauseGame(){return ["playing","waiting","exitChoice","postRewardShake"].includes(gameState);}
function pauseGame(){if(!canPauseGame())return;pausedFromState=gameState;gameState="paused";pauseOverlay.classList.remove("hidden");}
function resumeGame(){if(gameState!=="paused")return;gameState=pausedFromState||"waiting";pausedFromState=null;pauseOverlay.classList.add("hidden");}
function togglePause(){gameState==="paused"?resumeGame():pauseGame();}
if (pauseButton) pauseButton.addEventListener("click", togglePause);
if (resumeButton) resumeButton.addEventListener("click", resumeGame);
if (pauseOptionsButton) {
  pauseOptionsButton.addEventListener("click", () => {
    optionsOpenedFromPause = true;
    pauseOverlay.classList.add("hidden");
    applySoundSettings();
    optionsOverlay.classList.remove("hidden");
  });
}
if (endRunButton) {
  endRunButton.addEventListener("click", () => {
    pauseOverlay.classList.add("hidden");
    pausedFromState = null;
    resetRun();
    gameState = "lobby";
    runLobby.classList.remove("hidden");
  });
}

window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k==="p"||k==="escape"){e.preventDefault();togglePause();}});
function gameLoop(timestamp) {if (gameState === "paused") {
    // Do not redraw or update while paused.
    // The last rendered canvas frame remains visible under the pause overlay.
    requestAnimationFrame(gameLoop);
    return;
  }

  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  updatePlayer(dt);
  updateRoomClear(dt);
  updatePostRewardShake(dt);
  updateExitChoice(dt);

  if (gameState === "playing") {
    updateRangerSkill(dt);
    updatePlayerProjectiles(dt);
    updateFallingPickups(dt);
    updateBall(dt);
    updateBossMovement(dt);
    updateEnemyAttacks(dt);
    updateProjectiles(dt);
  }

  updateParticles(dt);
  updateSplashEffects(dt);

  drawBackground();
  drawBricks(dt);
  drawSplashEffects();
  drawFallingPickups();
  drawPlayerProjectiles();
  drawProjectiles();
  drawRail();
  drawPlayer();
  drawHunterDodgeReady();
  drawHunterArrow();
  drawExitChoice();

  if (gameState !== "exitChoice" && gameState !== "roomClear") {
    drawBall();
  }
  drawParticles();

  requestAnimationFrame(gameLoop);
}

applySoundSettings();
updateStatsUI();
updateLoadoutUI();
updateRuneText();
resetRun();
gameState = "lobby";
runLobby.classList.remove("hidden");
updateLobbyUI();
requestAnimationFrame(gameLoop);;














