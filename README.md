<div align="center">

# SOMNIUM

### SLEEP SOUNDSCAPE ARCHITECTURE

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![WebAudio](https://img.shields.io/badge/Web_Audio_API-333333?style=for-the-badge&logo=w3c&logoColor=white)

<br />

<a href="https://dovvnloading.github.io/Somnium-Sleep-App/"><strong>ENTER THE SOUNDSCAPE &raquo;</strong></a>

</div>

---

## VISUAL SHOWCASE

<div align="center">
  <img src="https://github.com/user-attachments/assets/7bd0956c-439e-4561-803c-da69d6f33331" alt="Somnium Visualizer Detail" width="100%" />
    <br /><br />
  <img src="https://github.com/user-attachments/assets/6ad8deda-370b-4ad7-8afe-f73f4bb0f1ff" alt="Somnium Dashboard Interface" width="100%" />
</div>

---

## SYSTEM OVERVIEW

Somnium is a high-fidelity ambient noise generator designed for deep sleep induction, focus enhancement, and anxiety reduction. Unlike traditional loop-based players, Somnium utilizes the Web Audio API to generate procedural audio in real-time. This ensures that the soundscapes never repeat, preventing the brain from recognizing patterns that can disrupt the drift into sleep.

The interface is constructed using a "Glassmorphism" design language, optimized for OLED displays and night-time usage. It features a fully responsive React architecture, managing complex audio graphs including oscillators, biquad filters, convolver nodes, and dynamic compression.

## CORE ARCHITECTURE

### The Audio Engine
The heart of Somnium is a custom TypeScript Audio Engine that manages the life-cycle of complex audio nodes. It features:
*   **Procedural Synthesis**: White, Pink, and Brown noise are generated mathematically, not streamed from MP3s.
*   **Generative Soundscapes**: The "Pro" and "Quintessence" series use algorithms to spawn musical events based on prime-number clocks and harmonic probability rules.
*   **Safety Limiting**: A built-in soft-clipper and compressor chain prevents sudden volume spikes, protecting the user's hearing during sleep.
*   **Binaural Integration**: Several presets utilize stereo frequency offsetting to create Theta and Delta brainwave entrainment.

### The Visualizer
A high-performance Canvas 2D implementation that visualizes the audio spectrum in real-time. It uses Fast Fourier Transform (FFT) data to drive a circular, multi-band oscilloscope, providing a hypnotic visual anchor for breathing exercises.

### Constellation Mode
A gamified sleep puzzle mode designed to tire the eyes and cognitive faculties. Users must restore a color gradient grid, requiring focus that naturally leads to eye fatigue and sleepiness.

---

## PRESET CATEGORIES

| Series | Description | Audio Technique |
| :--- | :--- | :--- |
| **Quintessence** | The flagship collection for immediate effect. | Binaural beats, Psycho-acoustics |
| **Somnium Pro** | High-fidelity textures for audiophiles. | Physical Modeling, Granular Synthesis |
| **Cosmos** | Space-themed ambient drones. | Sub-bass Oscillators, Long Reverbs |
| **Nature** | Procedural environmental simulation. | Filtered Noise, Random Event Triggers |
| **Wellness** | Somatic and anxiety relief tools. | 174Hz Anchoring, Poly-rhythms |

---

## PROPRIETARY NOTICE & LICENSE

**STRICTLY PROHIBITED: REPRODUCTION, CLONING, OR COMMERCIAL USE.**

This project is proprietary intellectual property. It is published here strictly for educational observation and free personal use via the hosted link.

*   **You MAY**: View the source code to learn about React, TypeScript, and the Web Audio API. Use the application for your own sleep and relaxation.
*   **You MAY NOT**: Clone this repository to create a competing product. Duplicate the code for commercial gain. Remove credit or claim this work as your own.

This software is not open-source in the traditional sense; it is "source-available" for educational transparency only. Unauthorized copying of this file, via any medium, is strictly prohibited.

**© 2025 Matthew Robert Wesney. All Rights Reserved.**
