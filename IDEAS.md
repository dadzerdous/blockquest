# Spike Trolley RPG — Ideas

## Core Vision

A fantasy roguelite RPG built around Arkanoid / Breakout-style combat.

- **Paddle / trolley = character platform**
- **Runner = the character the player directly controls**
- **Ball = weapon / projectile**
- **Bricks = enemies, armor, hazards, objects, and formations**
- **Dungeon structure = branching run with battles, elites, shops, events, rest rooms, treasure, and bosses**
- **Run upgrades = temporary build progression**
- **Overall XP / stats = permanent gradual progression**
- **Major victories = substantial permanent unlocks**
- **Pets = permanent companions with run-specific development**

The goal is for RPG upgrades to visibly and mechanically change how Arkanoid is played, not merely increase hidden percentages.

---

## Status Key

- **NEXT** — actively testing soon
- **LATER** — direction we like, but intentionally not building yet
- **MAYBE** — interesting idea that still needs to prove itself

---

## Current Prototype — v0.3

### Implemented

- Fixed **9:14 gameplay aspect ratio** on PC and mobile.
- Keyboard controls: A/D and arrow keys.
- Touch / pointer controls.
- Spike-rail trolley.
- Runner on top of trolley.
- Runner now moves independently across the trolley.
- Runner position pushes / accelerates the trolley.
- Trolley has momentum and drag.
- Ball speed reduced to make movement and positioning easier to read.
- Bricks have HP.
- Shooter enemy attacks downward.
- Player HP and ball-loss damage.
- Room clear.
- Choose one guaranteed upgrade after each room.
- Current upgrades:
  - Heavy Shot — ball damage +1.
  - Wider Trolley — trolley width +15%.
  - Faster Runner — increases movement capability.
- Upgrades last for the current run and reset on defeat.

### Current Test

**NEXT:** Determine whether controlling the runner, rather than directly controlling the trolley, feels better and gives the game a distinctive identity.

Questions:

1. Is the slower ball speed comfortable?
2. Does runner-controlled trolley movement feel responsive rather than frustrating?
3. Is trolley momentum fun?
4. Can the player intentionally position for the ball?
5. Does this control scheme still work well on mobile?
6. Do the three guaranteed upgrades feel noticeably different?

---

## Character / Trolley

### LATER

- Character stats could physically affect the controls:
  - Agility — runner movement speed.
  - Control — aiming / trajectory assistance.
  - Strength / Power — ball damage or return force.
  - Defense — resistance to enemy attacks.
  - Trolley Width — larger return surface.
  - Trolley Weight / Balance — changes acceleration and momentum.
- Different trolley / paddle archetypes.
- Tank build: wide, slower, defensive.
- Fast build: narrow, agile, precise.
- Magic build: elemental and status focused.
- Character attack animation when returning the ball.
- Visible equipment on the runner.

### MAYBE

- Runner must physically reach the ball's landing point for an ideal return.
- Center of trolley gives a normal return; striking near the runner gives a stronger or more controllable return.
- Runner can jump or perform special actions on the trolley.

---

## Ball / Weapon System

### LATER

Balls act as equippable weapons.

Possible weapon types:

- Physical / Iron Ball
- Fire Ball
- Frost Ball
- Lightning Ball
- Poison Ball
- Explosive Ball
- Heavy / Piercing Ball

Elemental weaknesses should be **advantages, not hard keys**. The player should still be able to defeat an enemy with a poor matchup.

Potential small weapon loadout allowing ball swapping during a run or battle.

---

## Trajectory / Control

### LATER — Important

Add the ability to preview where the ball is likely to travel.

Possible progression:

- Low Control — short dotted trajectory.
- Higher Control — longer prediction.
- Advanced Control — predicts first wall bounce.
- Powerful upgrade / skill — predicts multiple bounces.

This could make **Control** a meaningful RPG stat that changes what information the player receives instead of merely adding a numerical bonus.

Do not implement until the core runner/trolley controls feel good.

---

## Enemies / Bricks

### LATER

Not every brick needs complicated behavior.

Possible enemies:

- Goblin — basic enemy.
- Slime — splits.
- Skeleton — rebuilds / regenerates.
- Spider — creates web bricks.
- Mage — fires projectiles.
- Knight — armored.
- Bomber — explosive attacks.

Other brick types:

- Armor
- Walls
- Explosive barrels
- Treasure
- Hazards
- Healing objects

Enemy formations should feel like encounters rather than generic rows of bricks.

---

## Status Effects

### LATER

- Burn
- Freeze
- Shock
- Poison
- Explosive
- Fracture / armor break

Status interactions are more interesting than simple bonuses.

Example:

**Freeze enemy → Heavy Ball hit → SHATTER → nearby enemies take damage.**

---

## Run Upgrades

### Current Philosophy

Prefer **actionable / guaranteed upgrades** over percentage proc chances during early development.

Good:

- Ball damage +1.
- Trolley width +15%.
- Runner speed +15%.
- Ball pierces one target.
- Fire spreads to adjacent enemy.
- Ball becomes heavier.
- Add another controllable ball.

Avoid for now:

- 5% chance to multiball.
- 3% chance to crit.
- Random tiny proc bonuses.

Chance-based mechanics can be reconsidered later if the core build system needs them.

---

## Dungeon Structure

### LATER

Slay-the-Spire-inspired branching structure without copying its card combat.

Possible nodes:

- Battle
- Elite
- Shop
- Event
- Treasure
- Rest
- Forge
- Pet event
- Boss

Basic loop:

**Hub → choose dungeon → branching rooms → upgrades / loot → boss → permanent reward → hub**

---

## Bosses

### LATER — Major Feature

Normal rooms contain multiple enemies / bricks.

Boss rooms transform the board into a giant breakable creature.

Potential boss structure:

- Multiple destructible body parts.
- Armor.
- Weak points.
- Attacks tied to body parts.
- Destroying a body part disables an attack.
- Phase changes.
- Exposed core / heart.

Example: giant skeleton whose arms throw bones. Destroy an arm and that attack disappears. Break the rib cage to expose the core.

---

## Pets

### LATER — Major Feature

Pets are permanent companions unlocked through progression.

Possible pets:

- Bat — catches nearby loot.
- Turtle — blocks enemy projectiles.
- Emberling — fires small fire attacks.
- Sprite — assists ball control.
- Wisp — helps recover dangerous balls.

Pets may start at level 1 each run and gain temporary run upgrades.

Long-term pet milestones / evolutions could be permanent.

Example:

**Bat → Vampire Bat OR Treasure Bat**

---

## Loot

### LATER

Loot should physically fall into the playfield when possible.

Potential drops:

- Gold
- Gems
- Healing
- XP
- Items

The player catches drops with the trolley, while pets can modify collection behavior.

---

## Permanent Progression

### LATER

Playing should always provide some progress without making grinding mandatory.

Overall XP / Adventurer Level can provide small permanent improvements.

Possible permanent stats:

- Power
- Defense
- Agility
- Control
- Fortune

Permanent progression should stay restrained enough that player skill and run builds remain important.

### Progression Layers

1. **XP** — gradual permanent progression for playing.
2. **Discoveries** — horizontal unlocks such as balls, relics, pets, classes, events, NPCs.
3. **Victories / challenges** — major permanent rewards.

Failure can still award XP and discoveries.

Victory should award substantially more meaningful progress.

---

## Dungeon Replayability

### LATER

Reasons to replay a completed dungeon:

- Branching paths.
- Unseen rooms.
- Alternate events.
- Secrets.
- Alternate bosses.
- Different builds.
- Pet development.
- Higher difficulty / challenge levels.
- Completion tracking.

Example:

- Rooms Found: 12/16
- Events: 5/8
- Bosses: 1/2
- Pets: 1/2
- Secrets: 2/5
- Relics: 11/18
- Discovery: 68%

---

## Hub

### LATER

Keep the hub functional rather than building a separate walking game too early.

Potential functions:

- Choose dungeon.
- Choose trolley / class.
- Choose starting ball.
- Choose pet.
- Spend permanent progression.
- View discoveries.
- Interact with rescued NPCs.

The hub should visually grow with progression.

Examples:

- Rescue blacksmith → forge appears.
- Rescue merchant → shop appears.
- Unlock pets → pets inhabit the hub.
- Beat dungeon → trophy / visual change appears.

---

## Parking Lot

### MAYBE

- Multiple controllable balls rather than random multiball.
- Character weapons visually striking the ball.
- Ball swapping mid-combat.
- Trolley armor / cosmetic parts.
- Environmental dungeon hazards.
- Secret bricks / hidden rooms.
- Challenge runs.
- Ascension-style difficulty.
- Alternate trolley rails.
- Trolley damage that visibly changes the vehicle.
- Character customization.
- Pet cosmetics.
- Story beats between dungeons.
- Overworld map.
