import os
import shutil
import subprocess
import sys

def main():
    # Force stdout and stderr to use UTF-8 encoding to prevent Windows CP1252 console crashes
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding='utf-8')

    print("=====================================================================")
    print("🏥  CLINICAL MIDDLEWARE SYSTEM - PREMIUM DEMO COMPILER")
    print("=====================================================================")
    
    # Ensure working directory is project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.abspath(os.path.join(script_dir, ".."))
    os.chdir(project_dir)
    print(f"Working Directory: {os.getcwd()}")

    # 1. Generate Audio Splicing (edge-tts + name.m4a + background music)
    print("\n[Step 1/4] Synthesizing narration and splicing name recording (generating scene durations)...")
    subprocess.run([sys.executable, "sandbox_demo_assets/generate_audio.py"], check=True)

    # 2. Capture Walkthrough (Playwright)
    print("\n[Step 2/4] Running clean Playwright recorder (synchronized with scene durations)...")
    subprocess.run([sys.executable, "sandbox_demo_assets/record_sandbox.py"], check=True)

    # 3. Process Video Zooms (OpenCV)
    print("\n[Step 3/4] Running OpenCV frame crop and smooth pan/zoom processor...")
    subprocess.run([sys.executable, "sandbox_demo_assets/apply_zooms.py"], check=True)

    # 4. Merge Audio and Video (FFmpeg)
    print("\n[Step 4/4] Stitching video and voiceover using FFmpeg...")
    
    zoomed_video = "sandbox_demo_assets/zoomed_presentation.mp4"
    voiceover_audio = "sandbox_demo_assets/voiceover.mp3"
    final_output = "linkedin_product_demo_2.mp4"
    final_backup = "final_linkedin_product_demo.mp4"
    
    if not os.path.exists(zoomed_video) or not os.path.exists(voiceover_audio):
        print(f"Error: Missing compiled intermediate files in sandbox_demo_assets!")
        sys.exit(1)

    # Remove previous outputs if they exist
    for out_file in [final_output, final_backup]:
        if os.path.exists(out_file):
            try:
                os.remove(out_file)
            except Exception as e:
                print(f"Warning: Could not remove old {out_file}: {e}")

    # Combine video and audio (transcoding to H.264 and stereo AAC for max compatibility)
    cmd = [
        "ffmpeg", "-y",
        "-i", zoomed_video,
        "-i", voiceover_audio,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "slow",      # Slow preset for higher visual quality and details preservation
        "-crf", "17",           # 17 is visually lossless and ultra-high quality
        "-c:a", "aac",
        "-ac", "2",             # Dual-channel stereo layout
        "-b:a", "192k",
        "-shortest",
        final_output
    ]
    
    print(f"Running FFmpeg: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    
    # Create backup copy
    try:
        shutil.copy(final_output, final_backup)
        print(f"Backup copy created at {final_backup}")
    except Exception as e:
        print(f"Warning: Could not copy backup: {e}")
    
    if os.path.exists(final_output):
        print("\n=====================================================================")
        print("🎉 SUCCESS! Your premium LinkedIn Product Demo is complete!")
        print(f"   Video Location: {os.path.abspath(final_output)}")
        print(f"   Backup Location: {os.path.abspath(final_backup)}")
        print("=====================================================================")
        
        # Clean up temporary processing files to keep the directory clean
        print("\nCleaning up temporary working files...")
        temp_files = [
            "sandbox_demo_assets/raw_screen.mp4",
            "sandbox_demo_assets/zoomed_presentation.mp4",
            "sandbox_demo_assets/name.wav",
            "sandbox_demo_assets/name_trimmed.wav",
            "sandbox_demo_assets/silence.wav",
            "sandbox_demo_assets/tts_raw.mp3",
            "sandbox_demo_assets/voiceover.mp3",
            "sandbox_demo_assets/milestones.json"
        ]
        for tf in temp_files:
            if os.path.exists(tf):
                try:
                    os.remove(tf)
                except Exception as e:
                    print(f"  Could not delete {tf}: {e}")
                    
        # Clean raw video directory
        raw_dir = "sandbox_demo_assets/raw_video_dir"
        if os.path.exists(raw_dir):
            try:
                shutil.rmtree(raw_dir)
            except Exception as e:
                print(f"  Could not delete {raw_dir}: {e}")
                
        print("Cleanup complete!")
    else:
        print("\n❌ Error: Failed to compile final_linkedin_product_demo.mp4")
        sys.exit(1)

if __name__ == "__main__":
    main()
