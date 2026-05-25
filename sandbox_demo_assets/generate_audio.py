import os
import json
import asyncio
import subprocess
import soundfile as sf
import numpy as np
import edge_tts

# Narration script segmented by scenes
SCENES = {
    "scene1": (
        "As a clinical systems architect, I built this autonomous middleware playground to solve a critical healthcare bottleneck: "
        "bridging the gap between advanced medical AI agents and legacy billing operations. This project was developed as an AI-assisted "
        "product to showcase how we can enforce safety rules on clinical reasoning models."
    ),
    "scene2": (
        "Let's see it in action. First, we select Patient One, Dr. Baddam. When we trigger the pipeline, the AI middleware executes live. "
        "It performs clinical NLP parsing, extracts diagnostic data, maps symptoms to standardized ICD-10 and CPT codes, and runs insurance "
        "policy audits in the background."
    ),
    "scene3": (
        "Clicking the Pipeline Engine navbar collapses the console and scrolls down to our visual flowchart stepper. Here, we click through "
        "the Code Map and Payer Audit nodes to inspect confidence dials, hover over procedural codes for billing summaries, and audit the "
        "compiled insurance claim JSON."
    ),
    "scene4": (
        "To demonstrate the system's flexibility, we scroll back to the top and select our second patient, Drusilla. We then scroll down to "
        "the Pipeline Stepper, switch back to the EHR Ingestion step, and prepare to edit the clinical narrative note."
    ),
    "scene5": (
        "We edit the patient's record in real-time, entering a complex cardiac narrative that requires specific provider credentials and "
        "pre-authorization. Once edited, we scroll back to the top and re-run the intake pipeline."
    ),
    "scene6": (
        "As the pipeline completes, we scroll down to verify our updated claims underwriting checklist. The system successfully validated "
        "our new clinical rules. This project is built using Next.js, Tailwind, and Supabase, referencing open-source frameworks like "
        "AgentClinic, MedAgentBench, and EHRAgent. Thanks for watching!"
    )
}

def trim_silence(input_wav, output_wav, threshold=0.015):
    data, samplerate = sf.read(input_wav)
    print(f"Loaded {input_wav} for trimming: shape={data.shape}, samplerate={samplerate}")
    if len(data.shape) > 1:
        mono_data = np.mean(data, axis=1)
    else:
        mono_data = data
    abs_data = np.abs(mono_data)
    above_threshold = np.where(abs_data > threshold)[0]
    if len(above_threshold) == 0:
        sf.write(output_wav, data, samplerate)
        return
    start_idx = max(0, above_threshold[0] - int(0.12 * samplerate))
    end_idx = min(len(data), above_threshold[-1] + int(0.15 * samplerate))
    trimmed_data = data[start_idx:end_idx]
    sf.write(output_wav, trimmed_data, samplerate)
    print(f"Saved trimmed name to {output_wav} ({len(trimmed_data)/samplerate:.2f}s)")

def generate_ambient_bg(output_path, duration_seconds, sample_rate=48000):
    print(f"Synthesizing soothing ambient synth pad background music ({duration_seconds:.2f}s)...")
    t = np.linspace(0, duration_seconds, int(sample_rate * duration_seconds), endpoint=False)
    audio = np.zeros_like(t)
    
    chord_duration = 10.0
    num_chords = int(np.ceil(duration_seconds / chord_duration))
    
    # Warm chord progression
    chords = [
        [87.3, 174.6, 261.6, 329.6, 392.0], # Fmaj9
        [65.4, 130.8, 196.0, 329.6, 493.9], # Cmaj9
        [73.4, 146.8, 220.0, 329.6, 440.0], # G6/9
        [55.0, 110.0, 164.8, 261.6, 329.6]  # Am9
    ]
    
    for i in range(num_chords):
        start_time = i * chord_duration
        end_time = min(duration_seconds, (i + 1) * chord_duration)
        if start_time >= duration_seconds:
            break
        chord_freqs = chords[i % len(chords)]
        chord_samples = int((end_time - start_time) * sample_rate)
        t_chord = np.linspace(0, end_time - start_time, chord_samples, endpoint=False)
        chord_audio = np.zeros(chord_samples)
        for freq in chord_freqs:
            phase = np.random.rand() * 2 * np.pi
            wave = np.sin(2 * np.pi * freq * t_chord + phase)
            wave += 0.08 * np.sin(4 * np.pi * freq * t_chord + phase) # Warmth harmonic
            chord_audio += wave
        chord_audio /= len(chord_freqs)
        
        # Smooth envelope crossfades
        envelope = np.ones(chord_samples)
        fade_len = int(3.0 * sample_rate)
        if fade_len > chord_samples // 2:
            fade_len = chord_samples // 2
        envelope[:fade_len] = np.linspace(0, 1, fade_len)
        envelope[-fade_len:] = np.linspace(1, 0, fade_len)
        chord_audio *= envelope
        
        start_idx = int(start_time * sample_rate)
        audio[start_idx:start_idx + chord_samples] += chord_audio
        
    # Analog low-pass filter simulation (running average)
    window_size = 45
    filtered_audio = np.convolve(audio, np.ones(window_size)/window_size, mode='same')
    
    # Soft vinyl/tape hiss
    noise = np.random.normal(0, 0.002, len(t))
    filtered_audio += noise
    
    # Normalize peak volume to -4dB (soft background level)
    max_val = np.max(np.abs(filtered_audio))
    if max_val > 0:
        filtered_audio = filtered_audio * (0.6 / max_val)
        
    sf.write(output_path, filtered_audio, sample_rate)

async def main():
    print("[Phase 3] Starting advanced audio production pipeline...")
    
    # 1. Convert and trim name recording
    print("Preparing your name introduction audio...")
    subprocess.run([
        "ffmpeg", "-y", "-i", "sandbox_demo_assets/name.m4a", "sandbox_demo_assets/name.wav"
    ], check=True)
    trim_silence("sandbox_demo_assets/name.wav", "sandbox_demo_assets/name_trimmed.wav")
    
    # Convert name_trimmed.wav to a standard mono 48kHz WAV
    subprocess.run([
        "ffmpeg", "-y", "-i", "sandbox_demo_assets/name_trimmed.wav",
        "-ar", "48000", "-ac", "1", "sandbox_demo_assets/scene1_intro_part.wav"
    ], check=True)
    
    # 2. Generate TTS clips for each scene
    voice = "en-US-AndrewNeural"
    scene_durations = {}
    
    # 0.5s Silence clip
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.5", "sandbox_demo_assets/silence.wav"
    ], check=True)
    
    for scene_id, text in SCENES.items():
        print(f"Generating voice clip for {scene_id}...")
        raw_mp3 = f"sandbox_demo_assets/{scene_id}_raw.mp3"
        raw_wav = f"sandbox_demo_assets/{scene_id}_raw.wav"
        
        communicate = edge_tts.Communicate(text, voice, rate="+1%")
        await communicate.save(raw_mp3)
        
        # Decode to 48kHz mono WAV for dynamic timing calculations
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_mp3,
            "-ar", "48000", "-ac", "1", raw_wav
        ], check=True)
        
        # Compile each scene
        scene_wav = f"sandbox_demo_assets/{scene_id}.wav"
        if scene_id == "scene1":
            # scene1 audio = name_trimmed.wav + 0.5s silence + scene1_raw.wav
            subprocess.run([
                "ffmpeg", "-y",
                "-i", "sandbox_demo_assets/scene1_intro_part.wav",
                "-i", "sandbox_demo_assets/silence.wav",
                "-i", "sandbox_demo_assets/scene1_raw.wav",
                "-filter_complex", "[0:a][1:a][2:a]concat=n=3:v=0:a=1[a]",
                "-map", "[a]",
                scene_wav
            ], check=True)
        else:
            # Just rename/copy to sceneX.wav
            shutil_copy = True
            import shutil
            shutil.copyfile(raw_wav, scene_wav)
            
        # Get duration of this scene
        f_info = sf.info(scene_wav)
        scene_durations[scene_id] = f_info.duration
        print(f"Scene {scene_id} duration: {f_info.duration:.2f}s")
        
    # Write scene durations to JSON
    with open("sandbox_demo_assets/scene_durations.json", "w") as f:
        json.dump(scene_durations, f, indent=2)
    print("Scene durations written to sandbox_demo_assets/scene_durations.json")
    
    # 3. Concatenate all scene WAVs into a single master voiceover file
    print("Concatenating all scenes to voiceover_clean.wav...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", "sandbox_demo_assets/scene1.wav",
        "-i", "sandbox_demo_assets/scene2.wav",
        "-i", "sandbox_demo_assets/scene3.wav",
        "-i", "sandbox_demo_assets/scene4.wav",
        "-i", "sandbox_demo_assets/scene5.wav",
        "-i", "sandbox_demo_assets/scene6.wav",
        "-filter_complex", "[0:a][1:a][2:a][3:a][4:a][5:a]concat=n=6:v=0:a=1[a]",
        "-map", "[a]",
        "sandbox_demo_assets/voiceover_clean.wav"
    ], check=True)
    
    total_duration = sf.info("sandbox_demo_assets/voiceover_clean.wav").duration
    print(f"Total voiceover duration: {total_duration:.2f}s")
    
    # 4. Generate ambient background music of the exact same length
    bg_music_wav = "sandbox_demo_assets/bg_music.wav"
    generate_ambient_bg(bg_music_wav, total_duration)
    
    # 5. Mix voiceover (100% volume) and background music (10% volume)
    print("Mixing voiceover with soothing background music...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", "sandbox_demo_assets/voiceover_clean.wav",
        "-i", bg_music_wav,
        "-filter_complex", "[0:a]volume=1.0[a0]; [1:a]volume=0.08[a1]; [a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]",
        "-map", "[a]",
        "-c:a", "libmp3lame", "-q:a", "2",
        "sandbox_demo_assets/voiceover.mp3"
    ], check=True)
    
    print("[Phase 3] Audio pipeline completed successfully! Voiceover mixed as sandbox_demo_assets/voiceover.mp3")

if __name__ == "__main__":
    asyncio.run(main())
