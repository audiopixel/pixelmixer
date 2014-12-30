AudioPixel 3.0
========

#### A Tool for Sound and Color ####

The aim of this project is to create an online adaptation of the AudioPixel 2.0 software.

The goal is for anyone to be able to view online projects using a simplified interface, while also having full rendering and editing capabilities to broadcast to lights and write and save new content.

Private repo for now, with the intention of going public at http://www.github.com/audiopixel

Basic todo list below (not set in stone)



### Main Features ###
	
	3D Editor
	GPU Accelerated Graphics Engine written in GLSL
	Audio Input (or any data input)
	Rendering views: 3D Point Cloud, 3D Directional Lights, 2D Quad pixel shader (capable of 1080p)
	Broadcast lighting hardware protocols such as UDP, OSC, and DMX
	Upload any GLSL fragment shader
	Write your own with helper methods/values not normally in GLSL
	Hundreds of scripts built in
	Simulate physical sensor inputs using mouse / keyboard
	Open Source


### Phase II ###



Rendering views:

1. 3D Point Cloud
2. 2D Quad pixel shader (capable of 1080p)
3. 3D Directional Lights in Textured Enviroment
4. Mixed elements

Configure LED color output (Full RGB by default)
	could specify output to be white LEDs only as an example


MIDI controller and OSC API input

Offline sync version
	Sync online content to Native App

Realtime previsualizer
	Preview channels/clips in previz
	While still communicating main mix to hardware

Modulation Inputs for all clip settings
	Easy way to chain together complex routing
	Centeralized control with Channel knobs

Images / Animated Gifs / Text with all system fonts
	using any dom element / Canvas2D as a texture


### Phase III ###


Multi-threaded operations (possibly using html5 workers)

Write your own shaders with text editors
Create user profile(s) and save/share presets/shaders/clips
Mapping selections for projections per channel

HTML5 Video input
	youtube

Timeline Recorder
	Entire program logic driven by bar bones API
