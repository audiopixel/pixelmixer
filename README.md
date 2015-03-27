

PixelMixer by AudioPixel is a visual engine optimized for performance that is able to generate, blend, and map OpenGL pixel shaders in 3D space.

Runs in the browser using WebGL and Three.js, and is easy to add to any web application.
The generated shaders can also be run in any OpenGL ES 2.0 environment (C / Java / IPhone / Android).

The original goal in creating PixelMixer was to drive lighting and video projection equipment. It is capable of capturing all color / data values of 3D pixels at fast framerates, which can be used for communication to physical lighting equipment using protocols such as Video, UDP, & DMX. 

There are other advantages as well when compared to standard OpenGL pixel shaders, as shown in the comparison table below.

---

Live demo: [audiopixel.com/webdemo](http://audiopixel.com/webdemo)

Shader editor: [github/examples/shader_edit.html](https://github.com/hepp/audiopixel3/blob/master/examples/shader_edit.html)

Load in additional WebGL shaders, such any of the ones found at [glslsandbox](http://glslsandbox.com/) or [shadertoy](https://www.shadertoy.com).

---

[Features](https://github.com/hepp/audiopixel3#features) |
[Steps to using API](https://github.com/hepp/audiopixel3#steps-to-using-api) |
[Possible uses](https://github.com/hepp/audiopixel3#possible-uses) | 

[vs Vanilla GLSL Shader](https://github.com/hepp/audiopixel3#vs-vanilla-glsl-shader) |
[Terminology](https://github.com/hepp/audiopixel3#terminology) |
[About us](https://github.com/hepp/audiopixel3#about-us)

---



## Features ##

* Animate pixel shaders seamlessly across textures and point cloud particles 
* Mix multiple pixel shaders together using various blend modes
* Map shaders to any number of areas using 3D transformations
* Blend multiple shaders into combined shaders
* Capture color values for all 3D nodes at high framerates
* Easily manipulate animations with incoming audio or data feeds
* Import any GLSL fragment shader
* Multiple position / index maps can be used to generate content (spoof gl_FragCoords per shader)
* Enhance your shaders with helper methods / values not normally in GLSL
* Preview channels in previz mode while still communicating main mix to hardware (coming soon)
* HTML5 video input (coming soon)


---

## Steps to using API ##

[View this in a simple example](https://github.com/hepp/audiopixel3/blob/master/examples/basic_example.html)



#### 1. Include Libraries pixelmixer.js and three.js ####

```
<script src="pixelmixer.min.js"></script>
<script src="three.min.js"></script>

scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer(); 

PMX.init(scene, renderer);
PMX.setSize(glWidth, glHeight);

```
#### 2. Add Nodes ####

Import nodes with several auto generating methods included to draw simple grids at various sizes.
It's also easy to import new node positions via JSON.

```
// Add a simple grid of Nodes 
PMX.hardware.addSimpleNodeGrid(x, y, z, width, height, pitch);
PMX.updateNodePoints();

```
#### 3. Add Shaders ####

```
<!-- Include source -->
<script src="import/shaders/SolidColor.js"></script>

// Add the Shader to Channel 1 (default fit to all nodes)
PMX.simpleSetup({channel: 1, ids: ["SolidColor"]});

```
#### 4. Change values at runtime (Optional UI Layers) ####

Easily alter shaders while running, and assign params, mix and blend values to controllers. 
Here we are setting values on the shader we just created.

```
// Set param 1 on the clip to .7
PMX.set("p1", .7, 1, 1, 1); // Addressing Data: Channel 1, Pod 1, Clip 1

// Set mix on the clip to be .9
PMX.set("mix", .9, 1, 1, 1); // Addressing Data: Channel 1, Pod 1, Clip 1

```

Each instance of a loaded shader has independent uniforms setup for easy control. Global values are also provided to all shaders that are ready to be populated with audio or any sort of data feed you provide. Easily enhance any loaded shaders to respond to the incoming values, and/or setup UI layers to control and change them directly. 

---

## Possible uses ##

* Mixer for displaying pixel shaders in 3D space
* VJ / Control light shows 
* Interactive art and light installations
* Audio and data visualizations
* Animate particles / sprites / textures in any WebGL or Three.js project
* Lighting conceptualize / architectural tool
* Generate shaders that can be used in separate OpenGL applications
* Run high performance with dedicated server, triggered by mobile MIDI / OSC API



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

A Pod is a way to group and mix Clips to be blended and positioned as one. Pods can then be blended into other Pods. Pods can also be represented many times over in many places. An example of this could be to take one Clip/Shader and display it in two different places, perhaps with the second instance mirrored or scaled. 

Once a Shader has been loaded into a Clip, it can be positioned in multiple places with a Pod, and then mixed into the main mix inside a Channel.




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

## About us ##

![AudioPixel Logo](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-web-grid.png)


AudioPixel develops custom lighting technology and sound-reactive visual programming.

We are on our 3rd revision of our in-house lighting software.

In our quest of optimizing lighting technology PixelMixer was born.

We are releasing it to the world in the hopes that it can improve sound and interactive light art for all.


![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel-cubes1.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/AudioPixel-Tipper-SF_01.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/AudioPixel-SonicBloom_05.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/blank_prod_santa_cruz_01_585.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/audiopixel_festival_lights-585x390.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/EmrgNSee-VibeSquad-AudioPixel.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/AudioPixel_Nexus_BurningMan_2012_17.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/Emrg-N-See-2010.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/lorn-decibel-audiopixel.jpg)
![AudioPixel Show](https://github.com/hepp/audiopixel3/blob/master/docs/raindanceSnapshot1.png)
