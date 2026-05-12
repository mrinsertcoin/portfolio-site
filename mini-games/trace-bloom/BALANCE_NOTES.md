# Balance Notes

This version fixes the main design problem from the earlier build.

## What was wrong

Enemies could target and camp the same cyan nodes the player had to stabilize.  
That made the objective feel unfair because the player had to stand still while enemies occupied the node.

## What changed

- Enemies now pressure the player instead of targeting leak nodes.
- Stabilization works in a larger radius around each cyan node.
- You can move around inside the bloom radius instead of standing perfectly still.
- Active tracing near a node creates a bloom field.
- The bloom field pushes nearby enemies away.
- Enemies that stay too close to an active bloom field can be destroyed.
- Wave 1 starts with only 1 slow enemy.
- Extra enemy spawning is disabled for waves 1 and 2.
- Enemy speed and damage were reduced.
- Node stabilization is faster.

## Core mechanic

Hold **Space** or **Left Mouse** while near a cyan node.  
Move around inside the faint outer ring until the progress ring fills.  
The bloom field gives you temporary space control while you stabilize the node.
