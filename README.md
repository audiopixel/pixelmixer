AudioPixel 3.0
========

#### A Tool for Sound and Color ####

The aim of this project is to create an online adaptation of the AudioPixel 2.0 software.

The goal is for anyone to be able to view online projects using a simplified interface, while also having full rendering and editing capabilities to broadcast to lights and write and save new content.

Private repo for now, with the intention of going public at http://www.github.com/audiopixel




### Main Features ###
	
* 3D Editor
* GPU Accelerated Graphics Engine written in GLSL
* Upload any GLSL fragment shader
* Audio Input (or any data input)
* Rendering views: 3D Point Cloud, 3D Directional Lights, 2D Quad pixel shader
* Broadcast lighting hardware protocols such as UDP, OSC, and DMX
* Preview channels in previz while still communicating main mix to hardware
* Hundreds of scripts built in
* Write your own shaders with helper methods/values not normally in GLSL
* Simulate physical sensor inputs using mouse / keyboard
* Open Source

---

_*The below is preliminary and we are still seeking input_

### Differences between AP2 & AP3 ###

Design changes:

|                          AP2  |                                          AP3 |
|------------------------------ | -------------------------------------------- |
|UI View: edit all channels     | UI View: edit one channel at a time          |
|Individual pod position data   | Pod position groups                          |
|Hardware mapping separate app  | Unified App                                  |


New features to AP3:

* HTML5 Video input
* Multiple position/index maps for content 
* Clip/Shaders position and scale tools  
* Clip/Shaders input includes mouse / keyboard
* Sync from online content to offline Native App
* Text with all system fonts
* Save user profile(s) and share presets/shaders/clips
* Timeline Recorder

---

## Basic Roadmap ##

### Phase I ###

* Channels as Static UI
* GLSL Engine
* Editor & realtime previz as one
* Clip harness / load any GLSL Shader
* Broadcast UDP

### Phase II ###

* Channels as Dynamic UI
* Create and save multiple index/position maps
* Modulation inputs
* HTML5 Video input
* Broadcast OSC, DMX
* Receive MIDI controller and OSC API input
* Sync from online content to offline Native App
* Images / Animated Gifs / Text with all system fonts


### Phase III ###

* Write clips/shaders with inline text editor
* Save user profile(s) and share presets/shaders/clips
* Timeline Recorder
* Entire program logic driven by bar bones API

--

### How to Contribute ###

Jump right in. If you have access to this repo I would feel honored to have you as a contributor on this project.

The next few weeks are more core construction, but after that it's going to be quite easy to add in modules, managers, shaders, clips, presets, ...

For now feel free to push to master branch for all small changes.
Large changes are best as pull requests.
