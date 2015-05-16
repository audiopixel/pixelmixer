
PixelMixer is a visual engine that generates, blends, and maps pixel shaders into 3D space.

Capture color values at fast framerates for communication to physical lighting equipment using protocols such as UDP, REST, DMX, & Video. Tools are included that optimize color and animations for display on LED and lighting fixtures. New communication protocols can be defined as '[broadcast techs](https://github.com/audiopixel/pixelmixer/tree/master/examples/import/techs)'. 

Runs using HTML5 (WebGL) and [Three.js](http://threejs.org). It is [easy](https://github.com/audiopixel/pixelmixer#steps-to-using-api) to add to any web application.
The generated shaders can also be used in any OpenGL ES 2.0 environment (C / Java / IPhone / Android).

---

Online demo: [audiopixel.com/webdemo](http://audiopixel.com/webdemo) | *[source](https://github.com/audiopixel/pixelmixer/blob/master/examples/webdemo.html)*

Online shader editor: [audiopixel.com/shader-editor](http://audiopixel.com/shader-editor/) | *[source](https://github.com/audiopixel/pixelmixer-sandbox)*

Mapping demo: [audiopixel.com/webdemo/basic-mapping.html](http://audiopixel.com/webdemo/basic-mapping.html) | *[source](https://github.com/audiopixel/pixelmixer/blob/master/examples/basic_mapping_example.html)*

Load in additional shaders, such as ones found at [glslsandbox](http://glslsandbox.com/) and [shadertoy](https://www.shadertoy.com).

[![VimeoLink](https://github.com/audiopixel/pixelmixer/blob/master/docs/images/pixelmixer-vimeo.png)](https://vimeo.com/125231156)

---

[Features](https://github.com/audiopixel/pixelmixer#features) | 
[Possible uses](https://github.com/audiopixel/pixelmixer#possible-uses) | 
[Steps to using API](https://github.com/audiopixel/pixelmixer#steps-to-using-api)

[Terminology](https://github.com/audiopixel/pixelmixer#terminology) |
[Roadmap](https://github.com/audiopixel/pixelmixer#roadmap) |
[About AudioPixel](https://github.com/audiopixel/pixelmixer#about-ap)

---

## Features ##

* Animate shaders seamlessly across textures and point cloud particles 
* Mix multiple shaders together using various blend modes
* Map shaders to any number of areas using 3D transformations
* Capture color / data values at high framerates
* Import OpenGL ES 2.0 pixel shaders
* Easily manipulate animations with incoming audio or data feeds
* Multiple position / index maps can be used to generate mapped content
* Define networking data per port, broadcast using various protocols
* A simple plug-in system to define new network broadcast or color capturing protocols
* Preview channels in previz mode while still communicating main mix to hardware (WIP)
* HTML5 video input (WIP)

---

## Possible uses ##

* Mixer for mapping pixel shaders into 3D space
* Control LED and lighting equipment directly
* Animate particles / sprites / textures in WebGL and Three.js projects
* Generate shaders to be used in separate OpenGL applications
* Tool for interactive art, stage, architectural, conceptual

---

## Steps to using API ##

[View this in a simple example](https://github.com/audiopixel/pixelmixer/blob/master/examples/basic_example.html)

[View all examples](https://github.com/audiopixel/pixelmixer/blob/master/examples/)

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

#### 5. Capture colors (Optional) ####
RGB values are available every frame using PX.pixels(). You can also define specific protocols to be broadcasted per port. Write new protocols as [reusable techs](https://github.com/audiopixel/pixelmixer/tree/master/examples/import/techs), or load in existing ones. Below are the steps to implement the '[testBroadcast](https://github.com/audiopixel/pixelmixer/blob/master/examples/import/techs/testBroadcast.js)' tech. See this in a [example](https://github.com/audiopixel/pixelmixer/blob/master/examples/readpixels.html).

```
<!-- Import a 'Broadcast Tech' to define how to use the RGB values -->
<script src="import/techs/testBroadcast.js"></script>

// Pass in true for 'broadcast' & 'readPixels' parameters when we call init().
PX.init(scene, renderer, { broadcast: true, readPixels: true });

// Each port can define a different tech
// (DMX and UDP lights could use different ports for example).
PX.ports.getPort(1).type = "testBroadcast";
PX.ports.getPort(1).broadcast = true;
```

---

## Terminology ##

A Clip is simply a wrapper for a Shader that provides additional timing, scaling, and input controls. Clips allow us to play back a Shader multiple times over as any number of separate instances, each with independent animation speeds and input parameters.

A Pod is a way to group and mix any number of Clips to be blended and positioned as one. Pods can then be blended into other Pods. Pods can also be represented many times over in many places at different sizes and positions. 

A Channel is a collection of Pods that are all mixed as one. 

There can be any number of Channels, each with any number of Pods, each containing any number of Clips, each of which may load from any number of Shaders.



**Node**: A single hardware unit or RGB pixel. Usually represented as a particle on screen, but can be represented in many ways.

**Port**: A group of Nodes. May also contain protocol and address data.

**Shader**: A OpenGL ES 2.0 fragment (pixel) shader that runs directly on the GPU.

**Clip**: A Clip is a Shader harnessed in a playable form. Clips can play Shaders back at different speeds and different positions.

**ClipFX**: A type of Clip that does not blend, instead it analyses incoming values and outputs a new one.

**Pod**: A group of Clip(s) that are to be positioned together and blended as one.

**Position-unit**: Defined position coordinates that a Pod can reference. Pod's can render to any number of position units to allow advanced mapping.

**Channel**: A Channel is a collection of Pods that are all mixed as one.

**ChannelPostFX**: A type of Channel that takes the entire main mix and routes it through a set of ClipFXs.

**Previz**: Render a to-be-displayed Channel to preview on screen, while still sending the main Channel mix unaffected.


---

## Roadmap ##

List of features currently in the works / we welcome help with:

* Shader editor improvements.
* Previz improvements.
* Full Mesh texture rendering. (in addition to PointClouds)
* Sprites render masked architectural layer. (Nodes emulate lit up surfaces)
* HTML5 video support.
* Dependency on three.js optional.
* Helper methods to facilitate pre-caching of shaders.
* Optimized runtime player using pre-generated shaders.
* Node Editor UI toolset to create and edit nodes in 3D.

---

## About Us ##

![AudioPixel Logo](https://github.com/audiopixel/pixelmixer/blob/master/docs/images/audiopixel-web-grid.png)


AudioPixel develops custom lighting technology and sound-reactive visual programming.

For 5+ years we've crafted original lighting projects, helped artists build large-scale art installations, toured with musicians, developed custom software currently in use at nightclubs, and designed lighting for dozens of multi-day festivals. We also enjoy Burning Man, where we've lit up artcars and sound camps each and every year since 2008. Currently we are working on the third revision of our in-house lighting software.

In our quest for optimizing AudioPixel's live programming techniques, PixelMixer was born.
Now we are releasing it to the world in the hopes that it might benefit interactive light for all.

Open Source MIT License

[Contact](http://audiopixel.com/contact)

[http://audiopixel.com](http://audiopixel.com)

![AudioPixel Lighting](https://github.com/audiopixel/pixelmixer/blob/master/docs/images/audiopixel-lighting.jpg)
