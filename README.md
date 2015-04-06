http://audiopixel.com/webdemo/basic-mapping.html

PixelMixer by AudioPixel is a visual engine optimized for performance that can generate, blend, and map OpenGL pixel shaders in 3D space.

Runs in the browser using HTML5 (WebGL) and [Three.js](http://threejs.org). It is simple to add to any web application.
The generated shaders can also be used in any OpenGL ES 2.0 environment (C / Java / IPhone / Android).

The original goal in creating PixelMixer was to drive lighting and video projection equipment. It is capable of capturing color / data values of all 3D nodes at fast framerates, which can be used for communication to physical lighting equipment using protocols such as UDP, REST, DMX, & Video. 

---

Online demo: [audiopixel.com/webdemo](http://audiopixel.com/webdemo).

Online shader editor: [audiopixel.com/shader-editor](http://audiopixel.com/shader-editor/). *([source](https://github.com/audiopixel/pixelmixer-sandbox))*

Mapping demo: [audiopixel.com/webdemo/basic-mapping.html](http://audiopixel.com/webdemo/basic-mapping.html).

Load in additional shaders, such as ones found at [glslsandbox](http://glslsandbox.com/) and [shadertoy](https://www.shadertoy.com).

---

[Features](https://github.com/hepp/audiopixel3#features) | 
[Possible uses](https://github.com/hepp/audiopixel3#possible-uses) | 
[Steps to using API](https://github.com/hepp/audiopixel3#steps-to-using-api) |
[vs Vanilla GLSL Shader](https://github.com/hepp/audiopixel3#vs-vanilla-glsl-shader)

[Terminology](https://github.com/hepp/audiopixel3#terminology) |
[Roadmap](https://github.com/hepp/audiopixel3#roadmap) |
[Participate](https://github.com/hepp/audiopixel3#participate) |
[About AudioPixel](https://github.com/hepp/audiopixel3#about-ap)

---

## Features ##

* Animate pixel shaders seamlessly across textures and point cloud particles 
* Mix multiple pixel shaders together using various blend modes
* Map shaders to any number of areas using 3D transformations
* Import OpenGL ES 2.0 fragment shaders
* Easily manipulate animations with incoming audio or data feeds
* Multiple position / index maps can be used to generate mapped content
* Capture color values for all 3D nodes at high framerates
* Define networking data per port, broadcast using various protocols
* Easily create new broadcast protocols for any networked hardware
* Preview channels in previz mode while still communicating main mix to hardware (WIP)
* HTML5 video input (WIP)

---

## Possible uses ##

* Mixer for displaying pixel shaders in 3D space
* VJ / Lighting for stage and architectural 
* Engine for interactive art installations
* Tool for audio and data visualizations
* Animate particles / sprites / textures in any WebGL or Three.js project
* Generate shaders to be used in separate OpenGL applications

---

## Steps to using API ##

[View this in a simple example](https://github.com/hepp/audiopixel3/blob/master/examples/basic_example.html)

[View all examples](https://github.com/hepp/audiopixel3/blob/master/examples/)

[How to run things locally](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally)


#### 1. Setup PixelMixer.js and Three.js ####

```
<!-- Include scripts -->
<script src="pixelmixer.min.js"></script>
<script src="three.min.js"></script>

// Setup Three.js
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer(); 

// Setup PixelMixer.js
PX.init(scene, renderer);
PX.setSize(glWidth, glHeight);

```
#### 2. Add Nodes ####

Import nodes using several auto-generating methods to draw simple grids at various sizes.
It's also easy to import new node positions via JSON, Three.js mesh, or binary .obj files.

```
// Add a simple grid of Nodes 
PX.hardware.addSimpleNodeGrid(x, y, z, width, height, pitch);
PX.updateNodePoints();

```
#### 3. Add Shaders ####

```
<!-- Include source -->
<script src="import/shaders/SolidColor.js"></script>

// Add the Shader to Channel 1 (default fit to all nodes)
PX.simpleSetup({channel: 1, ids: ["SolidColor"]});

```
#### 4. Change values at runtime (Optional UI Layers) ####

Easily alter shaders at runtime. Change parameters, opacity values, blends, and other properties, from UI layers or anything signal driven like midi controllers. 

Set values on the shader we just loaded into Channel 1, Pod 1, Clip 1.

```
// Set mix to be .9
PX.set("mix", .9, 1, 1, 1); 

// Set parameter 1 to .7
PX.set("p1", .7, 1, 1, 1); 

```

Each instance of a loaded shader (Clip) has independent uniforms setup for easy control. Global values are also provided to all shaders that are ready to be populated with audio or any sort of data feed. It's also quite easy to enhance existing shaders to respond to any incoming parameters. 


---

## vs Vanilla GLSL Shader ##
Shaders loaded into PixelMixer extend the OpenGL language to achieve additional functionality:

| Feature | API | GLSL |
|----------------- | -------------------- | --------------------- |
| GPU accelerated | x | x |
| GPU optimized Math methods | x | x |
| X,Y coordinates | x | x |
| Attributes and uniforms | x | x |
| Z coordinate | x | |
| Index value | x | |
| Last color value per pixel | x | |
| Last color values for all pixels | x | |
| Color blending algorithms | x | |
| Random values | x | |
| Accompanying init & update methods | x | |
| Hardware port / light unit info | x | |

---

## Terminology ##

A Clip is simply a wrapper for a Shader that provides additional timing, scaling, and input controls. Clips allow us to play back a Shader multiple times over as any number of separate instances, each with independent animation speeds and input parameters.

A Pod is a way to group and mix any number of Clips to be blended and positioned as one. Pods can then be blended into other Pods. Pods can also be represented many times over in many places at different sizes and positions. 

A Channel is a collection of Pods that are all mixed as one. 

There can be any number of Channels, each with any number of Pods, each containing any number of Clips, each of which may load from any number of Shaders.



**Node**: A single hardware unit or RGB pixel. Usually represented as a particle on screen, but can be represented in many ways.

**Port**: A group of Nodes. May also contain protocol and address data.

**Shader**: A OpenGL Shader that runs directly on the graphics card.

**Clip**: A Clip is a Shader harnessed in a playable form. Clips can play Shaders back at different speeds and different positions.

**ClipFX**: A type of Clip that does not blend, instead it analyses incoming values and outputs a new one.

**Pod**: A group of Clip(s) that are to be positioned together and blended as one.

**Position-unit**: Defined position coordinates that a Pod can reference. Pod's can render to any number of position units to allow advanced mapping.

**Channel**: A Channel is a collection of Pods that are all mixed as one.

**ChannelPostFX**: A type of Channel that takes the entire main mix and routes it through a set of ClipFXs.

**Previz**: Render a to-be-displayed Channel to preview on screen, while still outputting the main Channel mix unaffected.


---

## Roadmap ##

List of features currently in the works / we welcome help with:

* Shader editor error messaging and graceful failure refreshing.
* Previz improvements.
* Full Mesh texture rendering. (in addition to PointClouds)
* Sprites render masked architectural layer. (Nodes emulate lit up surfaces)
* HTML5 video support.
* Use without needing three.js.
* Helper methods to facilitate pre-caching of shaders.
* Optimized runtime player using pre-generated shaders.
* Node Editor UI toolset to create and edit nodes in 3D.

---

## Participate ##

We encourage you to experiment with these techniques, fork the code, or just try the examples out. We also welcome new contributors wishing to help us tackle development.

In using PixelMixer if you have any problems, suggestions, or ideas on how to improve it, please contact us. There will be a forum soon, but for now we are fielding feedback directly via email. 

We are also seeking beta testers, especially if you have lighting fixtures or other hardware to play with.

[Contact](http://audiopixel.com/contact)

---

## About AP ##

![AudioPixel Logo](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-web-grid.png)


AudioPixel develops custom lighting technology and sound-reactive visual programming.

For 5+ years we've crafted original lighting projects, helped artists build large-scale art installations, toured with musicians, developed custom software currently in use at nightclubs, and designed lighting for dozens of multi-day festivals. We also enjoy Burning Man, where we've lit up artcars and sound camps each and every year since 2008. Currently we are working on the third revision of our in-house lighting software.

In our quest for optimizing AudioPixel's live programming techniques, PixelMixer was born.

The original aim was to build a lightweight platform that could power any interactive art light installation we would dream up. Now we are releasing it to the world in the hopes that it might benefit interactive light for all.

Open Source [MIT License](https://github.com/hepp/audiopixel3/blob/master/LICENSE).

[http://audiopixel.com](http://audiopixel.com)

![AudioPixel Lighting](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-lighting.jpg)
