AudioPixel 3.0
========

#### A Tool for Sound and Color ####

The aim of this project is to create an online version of the AudioPixel 2 software.

The goal is for anyone to be able to load and view projects in the browser using a simplified interface, while also granting advanced users full editing capabilities,  the ability to write and save new visual content, and the functionality of broadcasting to lighting and other physical hardware.


This is a private repo for now, with the intention of going public during release at http://www.github.com/audiopixel


## Possible Uses Include ##

* Mixer for loading pixel shaders into 3D space
* Control light shows via laptop or mobile device
* Animate particles / sprites in any OpenGL or Three.js project
* Runs on dedicated server / gaming machine, triggered by MIDI or OSC API
* Lighting conceptualize / architectural tool
* Anyone with a browser can view saved projects 
* View large-scale and interactive light art - Bay Bridge, Jen Lewin's Pools as possible examples



## AudioPixel Workflow Philosophy ##

A platform that functions like Ableton Live audio channels containing GLSL shaders / Processing scripts / video clips, structured in Photoshop blending layers.
The AudioPixel platform was built by DJs & VJs, using the general mixing paradigm:
Play content in one channel, while previewing future content to be mixed in with an adjacent channel. 
A channel can contain its own effects, as well as the mixer having master post effect channel(s) that affect a whole project.



### Planned Features ###
    
* 3D Editor - Import, load, edit, and construct node arrangements
* GPU Accelerated graphics engine written in GLSL
* Upload any GLSL fragment shader
* Rendering views: 3D Point Cloud, 3D Directional Lights, 2D Quad Pixel Shaders
* Easy system for handling audio (or any data) input for content manipulation
* Broadcast lighting hardware protocols: UDP, OSC, and DMX
* Realtime Shader Editor
* Enhance your own shaders with helper methods/values not normally in GLSL
* HTML5 video input
* Preview channels in previz mode while still communicating main mix to hardware
* MIDI controller support and MIDI mapping
* Simulate physical sensor inputs using mouse / keyboard
* Multiple position / index maps that are used to generate content 
* Sync online content to offline native OS app
* Timeline recorder with playback
* Save user profile(s) and share projects / presets / shaders / clips
* Open Source


---

## Basic Roadmap ##

### Phase I ###

* GLSL Engine (*completed*)
* Editor & realtime previz as one (*completed, needs UI layer*)
* Clip harness / load any GLSL Shader (*completed*)
* UI with fixed channel set (dat.gui) (*completed*)
* GLSL fragment shader importer

### Phase II ###

* Audio and Modulation inputs
* Inline text editor for writing shaders / clips
* Dynamic UI for any amount of channels / clips (React components)
* Create and save multiple index / position maps
* Sync from online content to offline mode
* Video support (HTML5)
* Broadcast UDP via Chrome App

### Phase III ###

* Native OS App Layer (OpenGL with direct OS performance capabilites)
* Broadcast OSC, DMX
* Video support (direct file access)
* Receive MIDI events and OSC API input
* Save and share online projects / presets / shaders
* Sync online content to offline native OS app
* Timeline Recorder
* Entire program logic driven by bare bones OSC API

---



## AP3 Shader vs Vanilla GLSL Shader ##
The AudioPixel platform extends the standard GLSL fragment shader capabilities so that additional functionality can be achieved.

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

## How to Contribute ##

If you have access to this repo we would be honored to have you as a contributor.
Phase I is nearly completed, with the core engine now intact.

The codebase is tagged with "TODO" comments, if you see anything that interested you, or that should be done differently, go for it. 

Push to master branch for any small changes for now. Large changes or additions are most likely best as branches.
