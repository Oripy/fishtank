# FishTank
This is a Simulation of a fish tank in javascript.
Demo: https://goo.gl/RnkydN

Each fish have a DNA that sets its parameters : Maximum/Minimum Speed, Distance of vision and Angle of vision.

Fish loose energy over time and so need to eat in order to survive. Fish grow a bit each time they eat some food. Food (yellow circles) is generated so that the total energy of the system remain constant. Food items gets harder to eat the more a fish grow so they are forced to eat other fish in order to survive (and keep food available for the small ones). Fish can eat each other when the mass difference is significant.

## Behaviour
Fish are only influenced by other fish in their line of sight.

Fish in general try to keep at a small distance from each other in order to avoid being clumped together.

Fish are friendly with other fish of similar size, they try to align their speed with them and regroup.

When seeing a food source (smaller fish or food item) the fish go straight to it.

Small fish flee when seeing fish that are big enough to eat them.

The bigger a fish is the less agile it is (it is harder for it to change speed and direction) but its maximum and minimum speed are increased. Bigger fish loose energy more quickly but have a bigger maximum energy storage.

## Evolution
When a fish eats enough food to be near max energy, there is a chance that he will reproduce. A new offspring is created with a mass of 1 and with a mutation of its DNA. The parent gives a bit of its energy to its offspring.

## Advanced information

Clicking on the page show different "debugging" information and graphs.

Line of sight of the fish can be seen in all debugging modes (1 to 3).

Fish are then colored by energy, blue is full energy and red is near death.

### First Graph (debugging mode 2)
- The first graph show the evolution of the number of fish over time, with the most recent in the far right of the screen.
- Yellow show natural deaths (when the energy of a fish goes down to 0).
- Red show fish killed (eaten) by other fish.

### Second Graph (debugging mode 3)
- This shows a distribution of the fish currently alive divided by mass.
