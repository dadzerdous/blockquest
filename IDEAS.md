# Spike Trolley RPG — Ideas

## Build

Current prototype: **v0.5**

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
