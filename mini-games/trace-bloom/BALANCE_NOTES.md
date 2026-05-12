# Balance Notes

This version is a stricter fairness patch.

## Main fix

All enemies now target **only the player**.

No enemy type is allowed to select cyan leak nodes/objectives as a movement target.  
In `trace-bloom.js`, `updateEnemies()` directly uses the player as the target.

## What changed

- Red circle/noise enemies target only the player.
- Hunters target only the player.
- Cutters target only the player.
- Objective/node targeting was removed from enemy AI.
- Enemy speed was reduced globally.
- Enemy steering responsiveness was reduced.
- Extra spawning starts later and ramps more slowly.
- Node stabilization is much faster.
- Node progress decays much more slowly.
- Stabilization radius is larger and easier to read.
- Bloom field knockback is stronger.
- Bloom field can clear enemies that chase the player into the node area.

## Intended loop

Move near a cyan node, hold **Space** or **Left Mouse**, keep moving inside the faint outer ring, and let the node bloom quickly.

Enemies should pressure your movement, but they should no longer camp the objective.
