

A Visual Engine optimized for performance that runs and generates OpenGL pixel shaders that can be mapped to surfaces in 3D space.

Runs directly in the browser as a api service using WebGL and Three.js.
The generated shaders can then run and be cached in any Opengl environment (such as C++ / Java / Webgl).

The original goal in creating this API was to drive lighting and projection equipment. Because of this we made it possible to capture the color values of all 3D pixels easily at runtime. This technique lets us broadcast UDP & DMX values straight from the app, as well as offering other advantages as well as shown in the comparison table below.

The API can also be used just for web visualization projects, and is very easy to add to any existing Three.js application.


## Features ##

* Mix multiple pixel shaders together using various blend modes
* Map each shader to any number of areas using 3D transformations (can be used to pixel-map lights and projection surfaces)
* Import any number of coordinates to nodes in 3D space
* Capture color values for all 3D nodes at high framerate (can be used for broadcasting data to lighting equipment)
* Easily manipulate animations with incoming audio or data feeds
* Enhance your shaders with helper methods / values not normally in GLSL
* Multiple position / index maps can be used to generate content (spoof gl_FragCoords per shader)
* Import any GLSL fragment shader (coming soon)
* Preview channels in previz mode while still communicating main mix to hardware (coming soon)
* Rendering views: 3D point cloud, 3D directional lights (coming soon), 2D quad pixel shaders (coming soon)
* HTML5 video input (coming soon)


---

## Steps to using API ##

#### 1. Initialize API & Three.js ####


```
ap.init(scene, renderer);
ap.setSize(glWidth, glHeight);

scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer(); 

```

#### 2. Add Nodes ####

To import nodes there are several hardware methods included to draw simple grids of various sizes. It's also easy to import new node positions via JSON.

```
//Add a simple grid of Nodes 
var x = -470;		// Position coordinates for the entire grid
var y = 120;
var z = -0;
var width = 52;		// How many pixels for the entire grid
var height = 20;
var pitch = 33;		// How far each pixel is spaced

ap.hardware.addSimpleNodeGrid(x, y, z, width, height, pitch);
ap.updateNodePoints();

```

#### 3. Add Shaders ####

A Clip is simply a shader wrapped in a object with additional timing, scaling, and input controls. 
Wrapping a shader in a clip allows us to play it back at any size and at any animation speed.

A Pod is a unit to group and mix Clips to be blended and positioned as one. Pods can then be mixed into other Pods. Pods can also be represented many times over in many places. As example this could be used to take one shader and display it in two different places, perhaps with one instance mirrored or scaled. 

A Channel is a group of Pods that can be blended as one.

```
// Add a single clip using the "SolidColor" shader.
var clip1 = new ap.Clip({id: "SolidColor"});

// Create a single Pod to be placed in Channel 1. By default Pods are positioned to fit all Nodes.
var pods = [];
pods[0] = new ap.Pod({ clips: [clip1] });

// A Channel contains a stack of Pods that can be mixed as one.
var channel1 = new ap.Channel({ mix: 1.0, pods: pods });
ap.channels.setChannel(1, channel1);

```


#### 4. Change uniforms (Optional UI Layer) ####

You can easily alter Shaders while running, and assign params, mix and blend values to controllers. 
Here we are setting values on the Shader we just created in Channel 1, Pod 1, Clip 1.

```
// Set param 1 on the clip to .7
ap.set("p1", .7, 1, 1, 1); // Channel 1, Pod 1, Clip 1

// Set mix on the clip to be .9
ap.set("mix", .9, 1, 1, 1); // Channel 1, Pod 1, Clip 1

```




---


## API Shader vs Vanilla GLSL Shader ##
Extends the standard GLSL fragment shader capabilities so that additional functionality can be achieved.

| Feature | AP3 | GLSL |
|----------------- | -------------------- | --------------------- |
| GPU accelerated | x | x |
| X,Y coordinates | x | x |
| Attributes and uniforms | x | x |
| Z coordinate | x | |
| Index value | x | |
| Resized & blended in 3D space | x | |
| Multiple instances of shaders | x | |
| Multiple coordinates per pixel | x | |
| Last color value per pixel | x | |
| Last color values for all pixels | x | |
| Accompanying init & update methods | x | |
| Random values | x | |
| Hardware port / light unit info | x | |

---


## Terminology ##



**node**: A single light unit or RGB pixel. Usually represented as a particle on screen, but can be represented in many ways.

**port**: A group of Nodes. May also contain protocol and address data.

**channel**: Main source of color and values (like dmx) to be assigned to nodes. Channels hold pods, which may also hold clips.

**pod**: A group of clips that are to be positioned together, combined, and blended as one.

**position-unit**: Defined coordinates that a pod can choose to populate into. Pod's can render to any number of position units to allow advanced mapping.

**clip**: A clip is a shader harnessed in a playable form. Clips can play shaders back at different speeds and different positions.

**clipfx**: A type of clip that does not blend, instead it analyses incoming values and outputs a new one.

**postfx**: A type of channel that takes the entire main mix and routes it through a set of clipfxs.

**previz**: Render a to-be-displayed channel to preview on screen, while still outputting the main channel mix unaffected.

**shader**: A opengl glsl fragment shader that runs directly on the gpu.

---

## Possible Uses Include ##

* Mixer for displaying pixel shaders into 3D space
* Control light shows via laptop or mobile device
* Music and Data visualizers
* Animate particles / sprites in any OpenGL or Three.js project
* Runs on dedicated server / gaming machine, triggered by MIDI or OSC API
* Lighting conceptualize / architectural tool

