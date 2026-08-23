
const assetLoadState = {
  total: 0,
  loaded: 0,
  failed: [],
  ready: false
};

function getAssetLoadStatusEl() {
  return document.getElementById("assetLoadStatus");
}

function getStartButtons() {
  return [
    document.getElementById("startButton"),
    document.getElementById("startGame"),
    document.getElementById("startRun")
  ].filter(Boolean);
}

function setStartEnabled(enabled) {
  getStartButtons().forEach(button => {
    button.disabled = !enabled;
    button.setAttribute(
      "aria-disabled",
      enabled ? "false" : "true"
    );
  });
}

function updateAssetLoadStatus() {
  const el = getAssetLoadStatusEl();
  if (!el) return;

  if (assetLoadState.ready) {
    if (assetLoadState.failed.length) {
      el.textContent =
        `Loaded with ${assetLoadState.failed.length} missing asset(s)`;
      el.classList.add("assetLoadWarning");
    } else {
      el.textContent = "Ready";
      el.classList.remove("assetLoadWarning");
    }
    return;
  }

  el.textContent =
    `Loading ${assetLoadState.loaded} / ${assetLoadState.total}`;
}

function preloadImage(src) {
  return new Promise(resolve => {
    const image = new Image();

    image.onload = () => resolve({
      ok: true,
      src
    });

    image.onerror = () => resolve({
      ok: false,
      src
    });

    image.src = src;
  });
}

function preloadAudio(src) {
  return new Promise(resolve => {
    const audio = new Audio();

    const finish = ok => {
      audio.removeEventListener(
        "canplaythrough",
        onReady
      );
      audio.removeEventListener(
        "error",
        onError
      );

      resolve({
        ok,
        src
      });
    };

    const onReady = () => finish(true);
    const onError = () => finish(false);

    audio.preload = "auto";
    audio.addEventListener(
      "canplaythrough",
      onReady,
      { once: true }
    );
    audio.addEventListener(
      "error",
      onError,
      { once: true }
    );

    audio.src = src;
    audio.load();

    // Don't hang forever on browsers that refuse to fully buffer audio.
    setTimeout(
      () => finish(true),
      3500
    );
  });
}

function preloadAsset(src) {
  const lower =
    src.toLowerCase();

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg")
  ) {
    return preloadImage(src);
  }

  if (
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".m4a")
  ) {
    return preloadAudio(src);
  }

  // Files such as JSON/text don't need image/audio decoding.
  return Promise.resolve({
    ok: true,
    src
  });
}

async function preloadGameAssets() {
  const manifest =
    Array.isArray(window.GAME_ASSET_MANIFEST)
      ? window.GAME_ASSET_MANIFEST
      : [];

  assetLoadState.total =
    manifest.length;

  assetLoadState.loaded = 0;
  assetLoadState.failed = [];
  assetLoadState.ready = false;

  setStartEnabled(false);
  updateAssetLoadStatus();

  for (const src of manifest) {
    const result =
      await preloadAsset(src);

    assetLoadState.loaded += 1;

    if (!result.ok) {
      assetLoadState.failed.push(
        result.src
      );

      console.warn(
        "[ASSET PRELOAD FAILED]",
        result.src
      );
    }

    updateAssetLoadStatus();
  }

  assetLoadState.ready = true;

  updateAssetLoadStatus();
  setStartEnabled(true);

  console.log(
    `[ASSET PRELOAD] ${assetLoadState.loaded}/${assetLoadState.total} complete`,
    assetLoadState.failed.length
      ? { failed: assetLoadState.failed }
      : "all assets ready"
  );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    preloadGameAssets();
  },
  { once: true }
);


const canvas = document.getElementById("gameCanvas");
const pauseButton=document.getElementById("pauseButton");
const pauseOverlay=document.getElementById("pauseOverlay");
const resumeButton=document.getElementById("resumeButton");
const roomPlaqueEl=document.getElementById("roomPlaque");
const frameMoneyValueEl=document.getElementById("frameMoneyValue");
const frameRunesEl=document.getElementById("frameRunes");
const pauseOptionsButton=document.getElementById("pauseOptionsButton");
const endRunButton=document.getElementById("endRunButton");
const ctx = canvas.getContext("2d");

const heroShieldEl = document.getElementById("heroShield");
const goldHudEl = document.getElementById("goldHud");
const levelHudEl = document.getElementById("levelHud");
const statsOverlay = document.getElementById("statsOverlay");
const runLobby = document.getElementById("runLobby");
const startRunButton = document.getElementById("startRunButton");
const openStatsButton = document.getElementById("openStatsButton");
const lobbyLevelEl = document.getElementById("lobbyLevel");
const lobbyXpEl = document.getElementById("lobbyXp");
const bestRoomEl = document.getElementById("bestRoom");
const lastRunSummaryEl = document.getElementById("lastRunSummary");
const lobbyTitleEl = document.getElementById("lobbyTitle");
const lobbySubtitleEl = document.getElementById("lobbySubtitle");
const activeProfileNameEl = document.getElementById("activeProfileName");
const openProfilesButton = document.getElementById("openProfilesButton");
const profilesOverlay = document.getElementById("profilesOverlay");
const profileCardsEl = document.getElementById("profileCards");
const closeProfilesButton = document.getElementById("closeProfiles");
const openOptionsButton = document.getElementById("openOptionsButton");
const optionsOverlay = document.getElementById("optionsOverlay");
const closeOptionsButton = document.getElementById("closeOptions");
const musicVolumeInput = document.getElementById("musicVolume");
const sfxVolumeInput = document.getElementById("sfxVolume");
const musicVolumeText = document.getElementById("musicVolumeText");
const sfxVolumeText = document.getElementById("sfxVolumeText");
const muteMusicButton = document.getElementById("muteMusicButton");
const muteSfxButton = document.getElementById("muteSfxButton");
const openLoadoutButton = document.getElementById("openLoadoutButton");
const loadoutOverlay = document.getElementById("loadoutOverlay");
const closeLoadoutButton = document.getElementById("closeLoadout");
const equipmentPicker = document.getElementById("equipmentPicker");
const glovesNameEl = document.getElementById("glovesName");
const glovesEffectEl = document.getElementById("glovesEffect");
const ballNameEl = document.getElementById("ballName");
const ballEffectEl = document.getElementById("ballEffect");
const shopGoldEl = document.getElementById("shopGold");
const livesHudEl = document.getElementById("livesHud");
const ballShopStatusEl = document.getElementById("ballShopStatus");
const pathHintEl = document.getElementById("pathHint");
const comboHudEl = document.getElementById("comboHud");
const comboCountEl = document.getElementById("comboCount");
const comboXpEl = document.getElementById("comboXp");
const roomClearBannerEl = document.getElementById("roomClearBanner");
const bossHudEl = document.getElementById("bossHud");
const bossBarFillEl = document.getElementById("bossBarFill");
const bossPhaseEl = document.getElementById("bossPhase");
const closeStatsBtn = document.getElementById("closeStats");
const levelTextEl = document.getElementById("levelText");
const xpFillEl = document.getElementById("xpFill");
const xpTextEl = document.getElementById("xpText");
const availablePointsEl = document.getElementById("availablePoints");
const roomTitleEl = document.getElementById("roomTitle");
const messageEl = document.getElementById("message");

const upgradeOverlay = document.getElementById("upgradeOverlay");
const shopOverlay = document.getElementById("shopOverlay");
const runeHudTextEl = document.getElementById("runeHudText");
const powerRuneLevelEl = document.getElementById("powerRuneLevel");
const tempoRuneLevelEl = document.getElementById("tempoRuneLevel");
const dragRuneLevelEl = document.getElementById("dragRuneLevel");
const agilityRuneLevelEl = document.getElementById("agilityRuneLevel");
const expansionRuneLevelEl = document.getElementById("expansionRuneLevel");
const vitalityRuneLevelEl = document.getElementById("vitalityRuneLevel");
const cooldownRuneLevelEl = document.getElementById("cooldownRuneLevel");
const ballSizeRuneLevelEl = document.getElementById("ballSizeRuneLevel");
const elementalRuneLevelEl = document.getElementById("elementalRuneLevel");

const shieldOwnedEl = document.getElementById("shieldOwned");
const glueCountEl = document.getElementById("glueCount");
const healStatusEl = document.getElementById("healStatus");
const leaveShopBtn = document.getElementById("leaveShop");
const glueButton = document.getElementById("glueButton");
const glueButtonCount = document.getElementById("glueButtonCount");

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 1400;


const bgImage = new Image();
bgImage.src = "assets/bg1.png";

const trolleyImage = new Image();
trolleyImage.src = "assets/trolley1.png";

const trolleyBodyImage = new Image();
trolleyBodyImage.src = "assets/trolley_body.png";

const heroImage = new Image();
heroImage.src = "assets/hero1.png";

const gobImage = new Image();
gobImage.src = "assets/gob1.png";
const raiderImage = new Image();
raiderImage.src = "assets/mob-skel-arch.png";

const doorImage = new Image();
doorImage.src = "assets/door.png";



const splashImage = new Image();
splashImage.src = "assets/bg-ball.png";

const brick1Image = new Image();
brick1Image.src = "assets/brick1.png";

const brick2Image = new Image();
brick2Image.src = "assets/brick2.png";
const SETTINGS_KEY = "spikeTrolleySettings";

let gameSettings = safeParseJSON(localStorage.getItem(SETTINGS_KEY)) || {
  musicVolume: 34,
  sfxVolume: 70,
  musicMuted: false,
  sfxMuted: false
};

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings));
}

function applySoundSettings() {
  bgMusic.volume = gameSettings.musicMuted
    ? 0
    : gameSettings.musicVolume / 100;

  hitSound.volume = gameSettings.sfxMuted
    ? 0
    : gameSettings.sfxVolume / 100;

  musicVolumeInput.value = gameSettings.musicVolume;
  sfxVolumeInput.value = gameSettings.sfxVolume;
  musicVolumeText.textContent = `${gameSettings.musicVolume}%`;
  sfxVolumeText.textContent = `${gameSettings.sfxVolume}%`;

  muteMusicButton.textContent = gameSettings.musicMuted
    ? "UNMUTE MUSIC"
    : "MUTE MUSIC";

  muteSfxButton.textContent = gameSettings.sfxMuted
    ? "UNMUTE SFX"
    : "MUTE SFX";
}

const bgMusic = new Audio("assets/bgmusic-bq.mp3");
bgMusic.loop = true;

let bgMusicStarted = false;

function ensureBgMusic() {
  if (bgMusicStarted) return;
  bgMusicStarted = true;
  bgMusic.play().catch(() => { bgMusicStarted = false; });
}

const hitSound = new Audio("assets/click.wav");
hitSound.preload = "auto";

function playHitSound() {
  try {
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
  } catch (_) {}
}


let gameState = "waiting";
let pausedFromState = null;
let optionsOpenedFromPause = false;
let lastTime = 0;
let keys = {};
let pointerActive = false;
let pointerX = WORLD_WIDTH / 2;
let pointerY = WORLD_HEIGHT / 2;
let roomNumber = 1;

let pendingRoomType = "battle";
let currentRoomType = "battle";

let postRewardShakeTimer = 0;
let pendingExitAfterReward = false;

const exitChoice = {
  active: false,
  heroX: WORLD_WIDTH / 2,
  heroY: 1110,
  speed: 390,
  minX: 70,
  maxX: WORLD_WIDTH - 70,
  minY: 760,
  maxY: 1135,
  facing: 1,
  hopTimer: 0,
  chosen: null,
  leftType: "battle",
  rightType: "treasure"
};

let runes = {
  power: 0,       // +10% ball damage each
  tempo: 0,       // +8% ball speed each
  drag: 0,        // -8% ball speed each
  agility: 0,     // +10% trolley speed each
  expansion: 0,   // +10% trolley width each
  vitality: 0,    // +10% max HP each
  cooldown: 0,    // -8% class-skill cooldown each
  ballSize: 0,    // +8% ball radius each
  elemental: 0    // +12% elemental effect strength each
};

const runeCatalog = ["power","tempo","drag","agility","expansion","vitality","cooldown","ballSize","elemental"];
let currentRuneOffer = [];
function rollRuneOffer(count = 3) {
  const pool = [...runeCatalog];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  currentRuneOffer = pool.slice(0, Math.min(count, pool.length));
  document.querySelectorAll("[data-rune]").forEach(button => {
    button.classList.toggle("hidden", !currentRuneOffer.includes(button.dataset.rune));
  });
}


let gold = 0;

const PROFILE_COUNT = 3;
const ACTIVE_PROFILE_KEY = "spikeTrolleyActiveProfile";
const LEGACY_SAVE_KEY = "spikeTrolleyProgression";

function createFreshProgression(profileIndex = 1) {
  return {
    profileName: `Adventurer ${profileIndex}`,
    xp: 0,
    level: 1,
    statPoints: 0,
    bestRoom: 0,
    stats: {
      vitality: 0,
      defense: 0,
      agility: 0,
      power: 0,
      control: 0,
      fortune: 0
    },
    equipment: {
      gloves: "adventurer",
      ball: "iron",
      unlocked: {
        gloves: ["adventurer", "heavy", "quick"],
        ball: ["iron", "piercing", "cinder"]
      }
    }
  };
}

function safeParseJSON(raw, fallback = null) {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Ignoring invalid saved JSON:", error);
    return fallback;
  }
}

function profileKey(index) {
  return `spikeTrolleyProfile${index}`;
}

function migrateLegacySave() {
  const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
  const slot1 = localStorage.getItem(profileKey(1));

  if (legacyRaw && !slot1) {
    const migrated = safeParseJSON(legacyRaw);

    if (!migrated) return;

    migrated.profileName =
      migrated.profileName || "Adventurer 1";

    localStorage.setItem(
      profileKey(1),
      JSON.stringify(migrated)
    );
  }
}

function loadProfile(index) {
  const raw =
    localStorage.getItem(profileKey(index));

  const loaded =
    safeParseJSON(raw);

  if (!loaded) return null;

  normalizeProgression(loaded, index);

  return loaded;
}

function normalizeProgression(save, index) {
  if (!save.profileName) save.profileName = `Adventurer ${index}`;
  if (typeof save.xp !== "number") save.xp = 0;
  if (typeof save.level !== "number") save.level = 1;
  if (typeof save.statPoints !== "number") save.statPoints = 0;
  if (typeof save.bestRoom !== "number") save.bestRoom = 0;

  if (!save.stats) save.stats = {};
  for (const stat of ["vitality","defense","agility","power","control","fortune"]) {
    if (typeof save.stats[stat] !== "number") save.stats[stat] = 0;
  }

  if (!save.equipment) {
    save.equipment = createFreshProgression(index).equipment;
  }

  if (!save.equipment.unlocked) {
    save.equipment.unlocked = createFreshProgression(index).equipment.unlocked;
  }
}

migrateLegacySave();

let activeProfileIndex =
  Number(localStorage.getItem(ACTIVE_PROFILE_KEY) || 1);

if (activeProfileIndex < 1 || activeProfileIndex > PROFILE_COUNT) {
  activeProfileIndex = 1;
}

let progression = loadProfile(activeProfileIndex);

if (!progression) {
  progression = createFreshProgression(activeProfileIndex);
  localStorage.setItem(
    profileKey(activeProfileIndex),
    JSON.stringify(progression)
  );
}




let armorPoints = 0;
const equipmentCatalog = {
  gloves:{
    adventurer:{name:"Adventurer Gloves",effect:"Balanced ball handling."},
    heavy:{name:"Heavy Gloves",effect:"Ball -15% speed, +25% damage."},
    quick:{name:"Quick Gloves",effect:"Ball +15% speed, -10% damage."}
  },
  ball:{
    iron:{name:"Iron Ball",effect:"Standard rebound."},
    piercing:{name:"Piercing Ball",effect:"Excess damage carries through destroyed blocks."},
    cinder:{name:"Cinder Ball",effect:"Adds Fire to Ball hits: splash damage and bonus vs Ice."}
  }
};
let patchBoughtThisVisit = false;

let stateBeforeStats = "waiting";

function xpNeededForLevel(level) {
  return 100 + (level - 1) * 50;
}

function saveProgression() {
  localStorage.setItem(
    profileKey(activeProfileIndex),
    JSON.stringify(progression)
  );
}

function addXP(amount) {
  progression.xp += amount;

  while (progression.xp >= xpNeededForLevel(progression.level)) {
    progression.xp -= xpNeededForLevel(progression.level);
    progression.level += 1;
    progression.statPoints += 1;
  }

  saveProgression();
  applyPermanentStats();
  updateStatsUI();
}

function applyPermanentStats() {
  const s = progression.stats;

  // Every point matters immediately.
  player.maxHp = 5 + s.vitality;

  // Defense is literal armor HP refreshed at the start of every room.
  armorPoints = s.defense;

  // +3% movement per point.
  player.speed = player.baseSpeed * (1 + s.agility * 0.03);

  // +10% ball damage per point.
  ball.baseDamageMultiplier = 1 + s.power * 0.10;

  // Paddle dimensions are recalculated in one authoritative function.
  recalculatePaddleSize("permanent stats");

  // Fortune remains a direct +5% treasure reward per point.
  if (player.hp > player.maxHp) player.hp = player.maxHp;
}

function updateStatsUI() {
  levelHudEl.textContent = `⭐ Lv ${progression.level}`;
  levelTextEl.textContent = `Level ${progression.level}`;

  const need = xpNeededForLevel(progression.level);
  xpTextEl.textContent = `${progression.xp} / ${need} XP`;
  xpFillEl.style.width = `${Math.min(100, progression.xp / need * 100)}%`;
  availablePointsEl.textContent = `Available Points: ${progression.statPoints}`;

  for (const stat of Object.keys(progression.stats)) {
    const id = "stat" + stat.charAt(0).toUpperCase() + stat.slice(1);
    const el = document.getElementById(id);
    if (el) el.textContent = progression.stats[stat];
  }
}
let hasOvershield = false;
let shieldReady = false;
let shieldShatterTimer = 0;
let glueCharges = 0;
let glueArmed = false;
let ballStuck = false;
let stuckTimer = 0;

const player = {
  x: WORLD_WIDTH / 2,
  y: 1240,
  baseWidth: 220,
  width: 220,
  baseHeight: 44,
  height: 44,
  baseSpeed: 620,
  speed: 620,
  runSpeedMultiplier: 1,
  velocityX: 0,
  hp: 5,
  maxHp: 5,
  invincibleTimer: 0,
  facing: 1,
  runTimer: 0,
  slowTimer: 0,
  slowMultiplier: 1,
  slowStacks: 0,
  stunTimer: 0
};

const ball = {
  x: player.x,
  y: player.y - 60,
  baseRadius: 16,
  radius: 16,
  speed: 620,
  vx: 0,
  vy: 0,
  launched: false,
  damage: 1,
  baseDamageMultiplier: 1,
  equipmentSpeedMultiplier: 1,
  equipmentDamageMultiplier: 1,
  runDamageMultiplier: 1,
  runSpeedMultiplier: 1,
  pierceDamageRemaining: 0
};

let bricks = [];
let enemyProjectiles = [];
let playerProjectiles = [];
let fallingPickups = [];

const roomPills = {
  wide: false,
  wideMultiplier: 1
};

function recalculatePaddleSize(reason = "unknown") {
  const controlMultiplier =
    1 + progression.stats.control * 0.03;

  const runeWidthMultiplier =
    Math.min(
      1.60,
      1 + runes.expansion * 0.10
    );

  const roomWidthMultiplier =
    roomPills.wide
      ? (roomPills.wideMultiplier || 1)
      : 1;

  const nextWidth =
    Math.min(
      player.baseWidth * 1.60,
      player.baseWidth *
        controlMultiplier *
        runeWidthMultiplier *
        roomWidthMultiplier
    );

  const changed =
    Math.abs(player.width - nextWidth) > 0.01 ||
    player.height !== player.baseHeight;

  player.width = nextWidth;

  // Height is never modified by Wide, runes, XP, equipment stat refresh,
  // pickups, or room transitions.
  player.height = player.baseHeight;

  if (changed) {
    console.log(
      `[PADDLE SIZE] ${reason}`,
      {
        width: Math.round(player.width * 10) / 10,
        height: player.height,
        controlMultiplier:
          Math.round(controlMultiplier * 1000) / 1000,
        runeWidthMultiplier:
          Math.round(runeWidthMultiplier * 1000) / 1000,
        roomWidthMultiplier:
          Math.round(roomWidthMultiplier * 1000) / 1000,
        wideActive: roomPills.wide
      }
    );
  }
}


const rangerSkill = {
  cooldown: 5.0,
  timer: 0,
  damage: 1,
  speed: 720
};
const hunterDodge = { cooldown: 30, timer: 0 };

let particles = [];
const splashEffects = [];
let attackTimer = 0;
let pendingShot = null;
let roomClearTimer = 0;
let roomClearRewardPending = false;
let ballsLeft = 3;
const maxBalls = 3;

let hitCombo = 0;
let comboXpEarned = 0;

function resetHitCombo() {
  hitCombo = 0;
  comboXpEarned = 0;
  updateComboHUD();
}

function registerComboHit() {
  hitCombo += 1;

  // Small permanent-XP reward for keeping the ball alive and chaining hits.
  // The reward grows gently at 5/10/20-hit thresholds.
  let xp = 1;
  if (hitCombo >= 20) xp = 4;
  else if (hitCombo >= 10) xp = 3;
  else if (hitCombo >= 5) xp = 2;

  comboXpEarned += xp;
  addXP(xp);
  updateComboHUD();

  if (hitCombo === 5 || hitCombo === 10 || hitCombo === 20) {
    createFloatingText(
      ball.x,
      ball.y - 28,
      `COMBO x${hitCombo}! +${xp} XP`,
      "#ffe171"
    );
  }
}

function updateComboHUD() {
  if (!comboHudEl) return;

  if (hitCombo <= 0 || gameState !== "playing") {
    comboHudEl.classList.add("hidden");
    return;
  }

  comboHudEl.classList.remove("hidden");
  comboCountEl.textContent = `x${hitCombo}`;
  comboXpEl.textContent = `+${comboXpEarned} XP`;
}

const roomLayouts = [
  // Room 1 — 2 Grey Grunts + 1 Fire Grunt
  [
    "BBBBB",
    "BMBFB",
    "BBMBB",
    "BBBBB"
  ],

  // Room 2 — 2 Ice Grunts + 2 Green Grunts
  [
    "BBIBB",
    "BGBGB",
    "BBIBB",
    "BBBBB"
  ],

  // Room 3 — 2 Grey + 2 Ice + 1 Dark-Red Fire
  [
    "BIMIB",
    "BBDBB",
    "BIMIB",
    "BBBBB"
  ],

  // Room 4 — Grey Grunt endurance room
  [
    "BMBMB",
    "BBMBB",
    "BMBMB",
    "BBBBB"
  ],

  // Room 5 — Armored Raider mini-boss arena (5x8)
  [
    "BBBBBBBB",
    "BMB..MBB",
    "B...R..B",
    "BBM..MBB",
    "BBBBBBBB"
  ]
];

