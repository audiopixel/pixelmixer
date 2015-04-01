

PixelMixer by AudioPixel is a visual engine optimized for performance that can generate, blend, and map OpenGL pixel shaders in 3D space.

Runs in the browser using HTML5 WebGL and [Three.js](http://threejs.org), and is easy to add to any web application.
The generated shaders can also be used in any OpenGL ES 2.0 environment (C / Java / IPhone / Android).

The original goal in creating PixelMixer was to drive lighting and video projection equipment. It is capable of capturing all color / data values of 3D pixels at fast framerates, which can be used for communication to physical lighting equipment using protocols such as Video, DMX, UDP, & Rest. 

---

Online demo: [audiopixel.com/webdemo](http://audiopixel.com/webdemo)

Online shader editor: [audiopixel.com/shader-editor](http://audiopixel.com/shader-editor/)

Load in additional WebGL shaders, such as ones found at [glslsandbox](http://glslsandbox.com/) and [shadertoy](https://www.shadertoy.com).

---

[Features](https://github.com/hepp/audiopixel3#features) | 
[Possible uses](https://github.com/hepp/audiopixel3#possible-uses) | 
[Steps to using API](https://github.com/hepp/audiopixel3#steps-to-using-api) |
[vs Vanilla GLSL Shader](https://github.com/hepp/audiopixel3#vs-vanilla-glsl-shader)

[Terminology](https://github.com/hepp/audiopixel3#terminology) |
[Roadmap](https://github.com/hepp/audiopixel3#roadmap) |
[Participate](https://github.com/hepp/audiopixel3#participate) |
[About AudioPixel](https://github.com/hepp/audiopixel3#---)

---

## Features ##

* Animate pixel shaders seamlessly across textures and point cloud particles 
* Mix multiple pixel shaders together using various blend modes
* Map shaders to any number of areas using 3D transformations
* Import OpenGL ES 2.0 fragment shaders
* Enhance your shaders with helper methods / values not normally in GLSL
* Easily manipulate animations with incoming audio or data feeds
* Multiple position / index maps can be used to generate mapped content
* Capture color values for all 3D nodes at high framerates
* Define networking data per port, broadcast UDP and more
* Preview channels in previz mode while still communicating main mix to hardware (WIP)
* HTML5 video input (WIP)

---

## Possible uses ##

* Mixer for displaying pixel shaders in 3D space
* VJ / control light shows 
* Audio and data visualizations
* Interactive art and light installations
* Animate particles / sprites / textures in any WebGL or Three.js project
* Lighting conceptualize / architectural tool
* Generate shaders that can be used in separate OpenGL applications
* Run high performance with dedicated server, triggered by mobile MIDI / OSC API

---

## Steps to using API ##

[View this in a simple example](https://github.com/hepp/audiopixel3/blob/master/examples/basic_example.html)

[View all examples](https://github.com/hepp/audiopixel3/blob/master/examples/)

[How to run things locally](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally)


#### 1. Setup Pixelmixer.js and Three.js ####

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

Import nodes with several auto generating methods included to draw simple grids at various sizes.
It's also easy to import new node positions via JSON.

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

Easily alter shaders while running, and assign params, mix and blend values to controllers. 
Here we are setting values on the shader we just created.

```
// Set param 1 on the clip to .7
PX.set("p1", .7, 1, 1, 1); // Addressing Data: Channel 1, Pod 1, Clip 1

// Set mix on the clip to be .9
PX.set("mix", .9, 1, 1, 1); // Addressing Data: Channel 1, Pod 1, Clip 1

```

Each instance of a loaded shader has independent uniforms setup for easy control. Global values are also provided to all shaders that are ready to be populated with audio or any sort of data feed you provide. Easily enhance any loaded shaders to respond to the incoming values, and/or setup UI layers to control and change them directly. 


---

## vs Vanilla GLSL Shader ##
Shaders loaded into the API extend GLSL to achieve additional functionality:

| Feature | API | GLSL |
|----------------- | -------------------- | --------------------- |
| GPU accelerated | x | x |
| GPU optimized Math methods | x | x |
| X,Y coordinates | x | x |
| Attributes and uniforms | x | x |
| Z coordinate | x | |
| Index value | x | |
| Multiple coordinates per pixel | x | |
| Last color value per pixel | x | |
| Last color values for all pixels | x | |
| Color blending algorithms | x | |
| Random values | x | |
| Accompanying init & update methods | x | |
| Hardware port / light unit info | x | |

---

## Terminology ##

A Clip is simply a Shader with additional timing, scaling, and input controls. 
Loading a Shader into a Clip allows us to play it back several times, at multiple sizes and animation speeds.

A Pod is a way to group and mix Clips to be blended and positioned as one. Pods can then be blended into other Pods. Pods can also be represented many times over in many places. A simple example would be to take one Pod and display it in two different places, perhaps with the second instance mirrored or scaled. 

Once a Shader has been loaded into a Clip, it can be positioned in multiple places with a Pod, and then mixed into the main mix with a Channel.




**Node**: A single light unit or RGB pixel. Usually represented as a particle on screen, but can be represented in many ways.

**Port**: A group of Nodes. May also contain protocol and address data.

**Shader**: A opengl glsl fragment shader that runs directly on the gpu.

**Clip**: A clip is a shader harnessed in a playable form. Clips can play shaders back at different speeds and different positions.

**Clipfx**: A type of clip that does not blend, instead it analyses incoming values and outputs a new one.

**Pod**: A group of clips that are to be positioned together, combined, and blended as one.

**Position-unit**: Defined coordinates that a pod can choose to populate into. Pod's can render to any number of position units to allow advanced mapping.

**Channel**: Main source of color and values (like dmx) to be assigned to nodes. Channels hold pods, which may also hold clips.

**Postfx**: A type of channel that takes the entire main mix and routes it through a set of clipfxs.

**Previz**: Render a to-be-displayed channel to preview on screen, while still outputting the main channel mix unaffected.


---

## Roadmap ##

List of features currently in the works / we could use help with:

* Shader editor - error messaging and graceful failure refreshing.
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

We encourage you to experiment with these techniques, fork the code, or just try the examples out. We welcome new contributors wishing to help us tackle new development.

In using this API if you have any problems, suggestions, or ideas on how to improve it, please contact us. There will be a forum soon, but for now we are fielding feedback directly via email. 

We are also seeking beta testers, especially if you have lighting fixtures or other hardware to play with.

[Contact](http://audiopixel.com/contact)

---

## --- ##

![AudioPixel Logo](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-web-grid.png)


AudioPixel develops custom lighting technology and sound-reactive visual programming.

For 5+ years we have crafted original lighting projects, helped other artists build large-scale art installations, developed original software currently in use at nightclubs, and designed lighting systems for dozens of multi-day festivals. Somehow we have also managed to light up Burning Man with custom lit artcars and soundcamps each and every year since 2008. Currently we are on the third revision of our in-house lighting software.

In our quest for optimizing AudioPixel's live programming techniques, PixelMixer was born.

The aim was a platform we could use as the base for any installation or any stage design we could dream up.

Now here it is and is able to run on mobile devices, in embedded systems, and as part of native os applications.

We are now releasing it to the world in the hopes that it might benefit interactive light for all.

Open Source [MIT License](https://github.com/hepp/audiopixel3/blob/master/LICENSE).


![AudioPixel Lighting](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-lighting.jpg)
