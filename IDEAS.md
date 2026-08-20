# Spike Trolley RPG — Ideas

## Build

Current prototype: **v0.13**

## Current Direction

**v0.4 returns to classic direct trolley control.**

The independent runner-control experiment from v0.3 is not discarded. It is parked as a possible future **character/class, trolley type, or alternate control mode**. We are not tuning it now because the core Arkanoid RPG loop is the priority.

## Status Key

- **NEXT** — actively testing/building.
- **LATER** — direction we like, intentionally parked.
- **MAYBE** — interesting but unproven.

## Core Vision

Fantasy Arkanoid / Breakout combat with roguelite dungeon structure and RPG progression.

- Trolley/paddle = character platform.
- Ball = weapon.
- Bricks/formations = enemies, defenses, hazards, and objects.
- Room clear = guaranteed actionable upgrade choice.
- Branching dungeon structure later.
- Permanent XP/stat progression later.
- Major dungeon victories unlock substantial permanent content.
- Pets are a planned major system.

## NEXT

- Keep classic direct trolley movement.
- Keep fixed 9:14 gameplay geometry on PC and mobile.
- Make sure the entire game fits on phones in portrait and landscape.
- Continue testing room → upgrade → next room.
- Prefer guaranteed/actionable upgrades over chance-based upgrades.
- Improve combat feel before expanding meta systems.

## Current Run Upgrades

- Heavy Shot — ball damage +1.
- Wider Trolley — trolley width +15%.
- Faster Runner / Trolley — movement speed +15%.

## LATER — Alternate Runner-Control Class / Mode

v0.3 tested controlling the person on top of the trolley. His position accelerated the trolley and created momentum.

Potential future use:

- A special character/class.
- A unique trolley type.
- An alternate advanced control mode.
- Stats such as Agility, Balance, and Trolley Weight could modify it.

Do not tune this yet.

## LATER — Trajectory Prediction

Control-related progression could show where the ball is likely to travel.

Possible levels:

- Short dotted trajectory.
- Longer trajectory.
- Predict first wall bounce.
- Predict multiple bounces.

This makes Control a meaningful gameplay stat instead of only a numerical bonus.

## LATER — Balls / Weapons

- Physical / Iron Ball
- Fire Ball
- Frost Ball
- Lightning Ball
- Poison Ball
- Explosive Ball
- Heavy / Piercing Ball

Elemental matchups should provide advantages, not hard locks.

## LATER — Enemies

- Goblin — basic.
- Slime — splits.
- Skeleton — rebuilds.
- Spider — creates webs.
- Mage — fires projectiles.
- Knight — armor.
- Bomber — explosions.

## LATER — Status Interactions

- Burn
- Freeze
- Shock
- Poison
- Explosive
- Fracture / armor break

Example: Freeze → Heavy Ball → SHATTER → neighboring damage.

## LATER — Dungeon

Potential nodes:

- Battle
- Elite
- Shop
- Event
- Treasure
- Rest
- Forge
- Pet event
- Boss

Loop:

Hub → Dungeon → Branching Rooms → Boss → Permanent Reward → Hub

## LATER — Bosses

Bosses can be giant creatures built from destructible pieces.

- Break armor.
- Destroy limbs to disable attacks.
- Expose weak points.
- Phase changes.
- Destroy core to win.

## LATER — Pets

Permanent companions with possible run-specific development.

- Bat — catches loot.
- Turtle — blocks projectiles.
- Emberling — attacks.
- Sprite — assists ball control.
- Wisp — helps recover dangerous balls.

## LATER — Permanent Progression

Playing should provide progress without requiring grinding.

Three layers:

1. XP — small gradual permanent progression.
2. Discoveries — balls, relics, pets, classes, events, NPCs.
3. Victories/challenges — major permanent unlocks.

Failure can still provide some progress. Winning provides the substantial rewards.

## LATER — Replayability

Replay completed dungeons for:

- Alternate paths.
- Events.
- Secrets.
- Boss variants.
- Builds.
- Pet development.
- Higher difficulty.
- Completion tracking.

## LATER — Hub

Functional hub that visually grows with progress.

- Dungeon selection.
- Character/trolley selection.
- Starting ball.
- Pet selection.
- Permanent progression.
- Rescued NPCs.
- Visible trophies/unlocks.


## Equipment Architecture — Direction

Equipment is distinct from run upgrades and shop consumables.

### Character Equipment Slots

- **Boots / Feet** — primarily movement speed, acceleration, braking, agility.
- **Hat / Helmet** — primarily defense and hazard resistance.
- **Chest** — primarily max HP / survivability.
- **Ring** — special effects, elemental synergies, utility.
- **Amulet** — special effects, status interactions, control.
- **Ball** — weapon: damage, element, piercing, explosive behavior, etc.
- **Trolley** — paddle/platform: width, handling, bounce properties, defense.
- **Pet** — companion support.

Prefer deliberately designed equipment identities over endless +1/+2/+3 copies.

Examples:

- Goblin Runners — fast movement.
- Lead Boots — slower but stronger braking/control.
- Winged Boots — faster direction changes.
- Guard Helmet — defense.
- Leather Armor — max HP.
- Ember Ring — improves fire interactions.
- Lodestone Amulet — improves Ball Glue.

### Discovery / Collection Philosophy

- Equipment can be found during runs.
- First discovery permanently adds the item to the player's collection.
- Previously discovered duplicate equipment can convert to gold.
- Before future runs, the player can choose starting equipment from the permanent collection.
- Starting loadout should be limited so run discovery remains meaningful.
- Avoid randomized Diablo-style stat rolls for now.

## Board Philosophy

**Everything on the board can have properties, but not everything on the board is an objective.**

- Mobs must be defeated to clear combat rooms.
- Environmental bricks can remain when the room ends.
- Bricks may still have HP, armor, elements, resistances, statuses, and interactions.
- Optional brick destruction can expose treasure, secrets, healing, or tactical paths.
- Future ice walls can be weak to fire.
- Future fire/explosive interactions can damage neighboring bricks and mobs.

## Shop Philosophy

Shop purchases are distinct from earned run upgrades and equipment.

Current first shop concepts:

- **Overshield** — blocks one damage each room and visually shatters.
- **Ball Glue** — activate a charge; the next paddle catch sticks the ball for up to a few seconds.
- Healing.

Later shops may sell equipment, enchants, utility, or other tactical resources.


## v0.6 Art Integration

Added approved first-pass game art:

- `assets/bg1.png` — Goblin Outpost dungeon background.
- `assets/trolley1.png` — adventurer + trolley sprite.

The art is now drawn by the game code while gameplay collision remains separate.

### Progression Note

Overall XP / permanent growth is still planned, especially so failed runs do not feel completely wasted, but **no XP system is implemented in v0.6**. We are deliberately waiting until the immediate combat/run structure is a little clearer.


## v0.7 Progression Foundation

Implemented:

- `assets/gob1.png` as the first reusable mob block.
- Goblin variants can initially be created with hue changes.
- Mobs award **XP, not gold**.
- Room clears award bonus XP.
- XP and Adventurer Level persist through failed runs and browser refreshes.
- Each level grants one freely reallocatable permanent stat point.
- Current prototype stats:
  - Vitality — max HP.
  - Defense — milestone defensive ward.
  - Agility — trolley speed.
  - Power — milestone ball damage.
  - Control — trolley width for now; trajectory functionality remains planned.
  - Fortune — increases treasure gold.
- Visible yellow treasure blocks contain gold.
- Treasure blocks are optional; killing all mobs still clears the room.

### Gold Philosophy

Normal mobs should **not** be a predictable fixed gold faucet. Gold should primarily come from optional treasure, rooms, events, shops, challenges, and other run decisions so the run economy can vary.

### Hidden Treasure

Some future ordinary-looking blocks can conceal permanent equipment discoveries.

A dungeon/world may contain a limited hand-placed hidden equipment treasure, potentially one major secret per world.

Late-game equipment such as a special ring may reveal or highlight hidden treasure blocks.

### Boss "Killed By" Rewards

Every boss should have special rewards tied to **how the boss was defeated**, not only whether it was defeated.

Examples can include:
- Killed by Fire.
- Killed by Ice/Shatter.
- Killed with an extremely small trolley.
- Killed without taking damage.
- Killed with a particular equipment setup.
- Killed by a pet or environmental interaction.

These rewards can feed quests/challenges, equipment discoveries, cosmetics, runes, pets, or other unlocks.

### Quests / Challenges

Plan for a broad challenge system that rewards unusual ways of playing rather than only repetitive kill counts.

Examples:
- Clear a room with a tiny trolley.
- Beat a stage fully equipped.
- Destroy all environmental blocks before the final mob.
- Beat a boss without taking damage.
- Complete elemental or equipment-specific challenges.

### Runes

Planned as temporary run-build pieces, potentially chosen between rooms and socketed into equipment.

Runes are **not permanent equipment**.

They may become the primary source of elemental effects:

- Ember Rune — Fire.
- Frost Rune — Ice.
- Impact Rune — damage.
- Expansion Rune — trolley width.
- Ward Rune — defense.

Equipment can determine socket capacity and interact with particular rune types.

This may replace the need for a traditional permanent skill tree. Do not implement a skill tree until the other systems prove one is needed.


## v0.8 Flow / Stat Revision

- Permanent stats are now managed **between runs**, not during an active run.
- Added an actual run lobby/splash screen.
- XP remains permanent and continues to provide a path forward for struggling players.
- Every stat point now gives an immediate benefit; removed 3-point milestone gating.

Current direct effects:

- Vitality: +1 max HP per point.
- Defense: +1 armor HP refreshed each room per point.
- Agility: +3% trolley speed per point.
- Power: +10% ball damage per point.
- Control: +3% trolley width per point for now.
- Fortune: +5% gold from treasure per point.

Stats remain freely reallocatable between runs.

## Brick Damage Art

- `assets/brick1.png` — full/healthy environmental brick.
- `assets/brick2.png` — damaged environmental brick.
- Brick art switches to `brick2.png` at half HP.

Future elements can reuse this state-driven art approach for ice, fire, armor, cracked walls, etc.

## Presentation

- Improved code-drawn trolley rail into an actual track with sleepers, metal rails, and bolts.
- Enemy shooter projectile is now a visible fiery bolt with trail instead of a simple circle.
- Between-run splash/lobby is now the natural home for future loadout, equipment, pet, dungeon choice, quests, and stat allocation.


## v0.9 — First Rune / Element Prototype

Run upgrades are now presented as temporary **Runes**:

- Ember Rune — gives the ball Fire.
- Impact Rune — +1 ball damage.
- Expansion Rune — +15% trolley width.
- Haste Rune — +15% trolley speed.
- Ward Rune — +1 armor refreshed each room.

Added the first elemental environment test:

- Ice bricks have 4 HP.
- Fire deals double damage to Ice.
- Hitting Ice with Fire creates an explosion that damages nearby bricks and mobs.
- Additional Ember Runes increase the explosion.

This is intentionally a prototype of runes before the equipment/socket system exists.

### Rune Direction — Hades-like Equipment Context

Long-term, a rune's effect can depend on **which equipment slot receives it** rather than every rune having only one universal effect.

Example Fire possibilities:

- Fire + Ball → fire damage / ignition / explosions.
- Fire + Boots → speed, flame trail, or movement effect.
- Fire + Helmet → offensive effect such as fiery/laser eyes.
- Fire + Chest → retaliation or burning defense.
- Fire + Ring/Amulet → elemental synergy/modifier.

Do not lock these exact effects yet. The important design direction is:

**Rune + Equipment Slot = specialized effect.**

The current v0.9 rune choices are a temporary bridge until equipment exists.


## v0.10 — Equipment Foundation

- Added a between-run Loadout screen.
- Gloves: Adventurer, Heavy (slower/+damage), Quick (faster/-damage).
- Balls: Iron, Piercing, Cinder.
- Piercing begins testing damage carry-through instead of immediate rebound when excess damage remains.
- Cinder makes Fire splash adjacent targets on every hit.
- Removed Ice bricks. Ice Goblins are now the first elemental enemy and are weak to Fire.
- Treasure blocks now reuse normal brick art with a yellow/gold hue.
- Shop now displays current gold.
- Patch Up is intended to be limited to one purchase per shop visit.
- Next major system: physical room exits/path decisions controlled by the adventurer.


## v0.10.1 — HP / Balls + Ice Attack + Hit Sound

- `assets/click.wav` is now referenced for ball impacts with the trolley and bricks/mobs.
- HP and ball lives are separate systems.
- Runs begin with 3 balls.
- Missing the ball removes one ball, not HP.
- The run ends if HP reaches 0 OR the player loses the final ball.
- Enemy damaging attacks continue to target HP.
- Ice Goblins now fire a distinct ice projectile.
- Ice projectile does no HP damage; it slows trolley movement by 30% for 3 seconds.
- Added visible slow feedback.
- Shop can restore one lost ball for 10 gold.
- Patch Up is limited to one purchase per shop visit.
- Fixed Cinder Ball Fire Splash so Fire splashes on every hit while Cinder is equipped.


## v0.11 — Split Hero/Trolley + Physical Path Choice

Implemented:

- `assets/hero1.png` and `assets/trolley_body.png` are now rendered independently.
- During combat the hero is drawn standing on the trolley.
- Clearing the final mob no longer jumps straight to the rune screen.
- The ball disappears, combat stops, and the hero hops off the trolley.
- Player controls the hero left/right using the same keyboard/touch input.
- Two physical doors appear:
  - Battle — standard next room.
  - Treasure — next room contains additional treasure blocks.
- Walking through a door selects the route.
- Rune choice appears after the physical route choice.
- The selected room type is then entered.

### Equipment Ideas — Parked

- Helmets can grant a **percentage chance to block incoming damage**.
- Some future weapons can use **ammo + cooldown** rather than behaving like the always-active ball.
- These should be class/weapon/equipment identity systems, not added to v0.11 yet.

### Class / Weapon Direction

Classes may ultimately be defined partly by their weapon system:

- Some use the traditional returning ball.
- Some weapons may have ammo.
- Some may recharge on cooldown.
- Some may create secondary attacks alongside the ball.

Keep this open until physical dungeon navigation and equipment feel solid.


## v0.11.1 — Hit Combo XP + Mounted Art Polish

- Consecutive target hits now build a hit combo.
- Combo counts brick, treasure, and mob damage.
- Combo resets when:
  - Ball returns to the trolley.
  - Ball is lost.
  - Room ends.
- Combo hits award small permanent XP:
  - x1–4: +1 XP/hit
  - x5–9: +2 XP/hit
  - x10–19: +3 XP/hit
  - x20+: +4 XP/hit
- Mob kills and room-clear XP remain separate.
- Mounted hero was lowered so he stands on the trolley instead of floating.
- Hero + trolley now mirror together based on the trolley's movement direction.


## v0.12 — Room Clear Flow + Shooter Telegraphs

Flow is now:

**Kill last mob → ROOM CLEARED → Rune reward → physical door decision → next room**

Combat additions:

- Ranged enemies visibly flash before firing.
- Basic shooters have a longer warning.
- Dark-red shooters are an upgraded ranged grunt:
  - More HP.
  - Shorter warning.
  - Fire a three-way projectile spread.
- Ice Goblins retain their slowing projectile.
- Enemy projectiles now support horizontal velocity for spread attacks.

### Enemy Taxonomy Direction

Color is an **element/variant layer across enemy families**, not a Raider-only naming scheme.

Enemy families can include:
- Grunt
- Raider
- Mystic
- Barbarian
- future families

Then colors/elements can modify any family:
- Red / Fire
- Blue / Ice
- Green / Poison
- Purple / future element/status
- neutral/armored variants

Example:
- Fire Grunt
- Ice Grunt
- Fire Raider
- Ice Raider
- Poison Mystic
- Fire Barbarian

### Mini-boss Plan

Do NOT introduce ordinary moving Raiders yet.

First moving enemy:
**Armored Raider mini-boss**

The boss introduces movement through spaces opened by destroyed bricks.
Defeating it unlocks normal Raider-family enemies in later encounters.
Those Raiders can then receive the same elemental/color variants as other enemy families.


## v0.13 — First Authored Section + Armored Raider

### Battles 1–4
Each uses a deliberately authored 4x5 formation (~20 board positions) instead of recycling the same layout.

- Battle 1: 2 Grey Grunts + 1 Fire Grunt.
- Battle 2: 2 Ice Grunts + 2 Green Grunts.
- Battle 3: 2 Ice + 2 Grey + 1 Dark-Red Fire Grunt.
- Battle 4: Grey-grunt endurance room.

Basic blocks continue filling the board around the enemies.

### Battle 5 — Armored Raider Mini-Boss
- Unique 5x8 boss arena.
- Middle row forms an open horizontal Raider lane.
- Raider begins centered.
- Other grunts remain in the arena.
- Raider patrols horizontally.
- Raider has an armor layer that absorbs damage before HP.
- Breaking armor enrages the Raider and increases movement speed.
- Clearing Battle 5 permanently records the Raider archetype as unlocked.
- Later rooms will add normal Raider enemies to encounter mixes.

### Survival Rule
- Enemy damage reduces HP.
- Reaching 0 HP costs one Ball/Life.
- HP then refills and the player continues the same run.
- Missing the ball also costs one Ball/Life.
- The run ends only when the final Ball/Life is lost.

### Audio
- `assets/bgmusic-bq.mp3` is dungeon background music.
- Loops during play.
- Starts after first user interaction for browser/mobile compatibility.

### Reward Flow
No separate ROOM CLEARED splash.
The rune/reward screen itself communicates **ROOM CLEARED**.

### Future Class / Weapon Concepts
- Mystic: gravity/magnet weapon. Finger/touch creates gravitational pull on ball trajectory; trolley may also generate an aura. Overlapping finger + trolley gravity amplifies the effect.
- Ranger: bow/target-lock direct attack; likely cooldown and/or limited ammo.
- Paladin: hold-to-block regenerative shield with its own shield HP.
- Class defines active weapon/ability.
- Equipment modifies the class/build rather than replacing class identity.
- Some weapons can use cooldowns, ammo-per-run, or both.
