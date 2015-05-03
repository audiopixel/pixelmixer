
## Broadcast Tech ##

A broadcast tech is a easy way to send color values for each port using various protocols.

## Steps in implementing ##

1) Include the tech scripts:

```
<!-- Import a 'Broadcast Tech' to define how to use the RGB values -->
<script src="import/techs/testBroadcast.js"></script>
```

2) Make sure the 'broadcast' & 'readPixels' parameters are flagged true:
```
// Pass in true for 'broadcast' & 'readPixels' parameters when we call init().
PX.init(scene, renderer, { broadcast: true, readPixels: true });
```
3) For each port that we want to broadcast using the tech, we need to set the type and broadcast to true.
```
// Each port can define a different tech
// (DMX and UDP lights could use different ports for example).
PX.ports.getPort(1).type = "testBroadcast";
PX.ports.getPort(1).broadcast = true;
```