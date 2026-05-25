import os
import glob
import json
import time
import subprocess
from playwright.sync_api import sync_playwright

def record():
    # Make sure folder structure exists
    os.makedirs("sandbox_demo_assets/raw_video_dir", exist_ok=True)
    
    # Clean previous raw assets
    for f in glob.glob("sandbox_demo_assets/raw_video_dir/*"):
        try:
            os.remove(f)
        except:
            pass
    if os.path.exists("sandbox_demo_assets/raw_screen.mp4"):
        try:
            os.remove("sandbox_demo_assets/raw_screen.mp4")
        except:
            pass

    # Load dynamic scene durations from audio pipeline
    durations_path = "sandbox_demo_assets/scene_durations.json"
    if not os.path.exists(durations_path):
        raise FileNotFoundError(f"Error: {durations_path} not found! Run generate_audio.py first.")
        
    with open(durations_path, "r") as f:
        durations = json.load(f)

    milestones = {}
    start_time = None

    def log_milestone(name):
        nonlocal start_time
        if start_time is None:
            start_time = time.time()
        elapsed = time.time() - start_time
        milestones[name] = elapsed
        print(f"[Milestone] {name} at {elapsed:.2f}s")

    print("[Phase 1] Starting clean Playwright browser recording...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir="sandbox_demo_assets/raw_video_dir",
            record_video_size={"width": 1280, "height": 720}
        )
        
        # 1. Pre-seed localStorage before navigating so the onboarding tour is bypassed
        context.add_init_script("window.localStorage.setItem('has_seen_tour_sandbox', 'true');")
        
        # Inject virtual cursor script on load
        cursor_script = """
        const initCursor = () => {
          if (document.getElementById('virtual-cursor')) return;
          const cursor = document.createElement('div');
          cursor.id = 'virtual-cursor';
          cursor.style.position = 'fixed';
          cursor.style.width = '18px';
          cursor.style.height = '18px';
          cursor.style.borderRadius = '50%';
          cursor.style.backgroundColor = 'rgba(59, 130, 246, 0.65)';
          cursor.style.border = '2px solid #ffffff';
          cursor.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.8)';
          cursor.style.pointerEvents = 'none';
          cursor.style.zIndex = '999999';
          cursor.style.transform = 'translate(-50%, -50%)';
          cursor.style.transition = 'background-color 0.15s, transform 0.15s';
          cursor.style.left = '-100px';
          cursor.style.top = '-100px';
          
          if (document.body) {
            document.body.appendChild(cursor);
          } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cursor));
          }

          document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
          });

          document.addEventListener('mousedown', (e) => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
            cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.85)';
            cursor.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.95)';
            
            const ripple = document.createElement('div');
            ripple.style.position = 'fixed';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            ripple.style.width = '18px';
            ripple.style.height = '18px';
            ripple.style.borderRadius = '50%';
            ripple.style.border = '2px solid rgba(239, 68, 68, 0.8)';
            ripple.style.transform = 'translate(-50%, -50%) scale(1)';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '999998';
            ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
            document.body.appendChild(ripple);
            
            setTimeout(() => {
              ripple.style.transform = 'translate(-50%, -50%) scale(2.8)';
              ripple.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
              ripple.remove();
            }, 500);
          });

          document.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.0)';
            cursor.style.backgroundColor = 'rgba(59, 130, 246, 0.65)';
            cursor.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.8)';
          });
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initCursor);
        } else {
          initCursor();
        }
        """
        context.add_init_script(cursor_script)
        
        page = context.new_page()
        
        # Mouse coordinate state trackers
        mouse_state = {"x": 100, "y": 100}
        
        def smooth_move_to(target_x, target_y, steps=30):
            start_x, start_y = mouse_state["x"], mouse_state["y"]
            for i in range(steps):
                t = (i + 1) / steps
                eased_t = t * t * (3 - 2 * t)
                curr_x = start_x + (target_x - start_x) * eased_t
                curr_y = start_y + (target_y - start_y) * eased_t
                page.mouse.move(curr_x, curr_y)
                page.wait_for_timeout(10)
            mouse_state["x"], mouse_state["y"] = target_x, target_y
            page.wait_for_timeout(100)

        def smooth_click(selector):
            el = page.locator(selector)
            try:
                el.scroll_into_view_if_needed(timeout=2000)
            except:
                pass
            page.wait_for_timeout(150)
            box = el.bounding_box()
            if box:
                target_x = box["x"] + box["width"] / 2
                target_y = box["y"] + box["height"] / 2
                smooth_move_to(target_x, target_y, steps=25)
                page.mouse.down()
                page.wait_for_timeout(80)
                page.mouse.up()
                page.wait_for_timeout(200)
            else:
                print(f"WARNING: Selector {selector} bounding box not found! Forcing direct click.")
                el.click(force=True)

        def smooth_scroll_to(target_y, steps=30):
            current_y = page.evaluate("window.pageYOffset")
            print(f"Scrolling smoothly from {current_y} to {target_y}")
            for i in range(steps):
                t = (i + 1) / steps
                eased_t = t * t * (3 - 2 * t)
                curr_y = current_y + (target_y - current_y) * eased_t
                page.evaluate(f"window.scrollTo(0, {curr_y})")
                page.wait_for_timeout(12)
            page.wait_for_timeout(300)

        def smooth_scroll_to_element(selector, offset=80):
            page.wait_for_selector(selector)
            target_y = page.evaluate(f"document.querySelector('{selector}').getBoundingClientRect().top + window.pageYOffset") - offset
            target_y = max(0, target_y)
            smooth_scroll_to(target_y)

        # Helper to align scene durations
        def wait_for_scene_duration(scene_name, elapsed_in_scene):
            target_duration = durations[scene_name]
            remaining = target_duration - elapsed_in_scene
            if remaining > 0:
                print(f"Scene '{scene_name}' target: {target_duration:.2f}s. Elapsed: {elapsed_in_scene:.2f}s. Waiting remaining {remaining:.2f}s...")
                page.wait_for_timeout(int(remaining * 1000))
            else:
                print(f"WARNING: Scene '{scene_name}' target: {target_duration:.2f}s. Elapsed: {elapsed_in_scene:.2f}s. Exceeded by {-remaining:.2f}s!")

        # Start timer now
        log_milestone("start")

        # ==========================================
        # SCENE 1: Introduction (Narrator credits)
        # ==========================================
        scene1_start = time.time()
        
        # Load Vercel app
        url = "https://clinical-middleware-dashboard.vercel.app/"
        print(f"Navigating to {url}")
        page.goto(url)
        page.wait_for_timeout(3500)
        log_milestone("navigated")
        
        # Idle hover details: glide cursor across Patient cards to look active
        for pat_id in ["pat_001", "pat_002", "pat_003", "pat_001"]:
            box = page.locator(f"#patient-btn-{pat_id}").bounding_box()
            if box:
                smooth_move_to(box["x"] + box["width"]/2, box["y"] + box["height"]/2, steps=15)
                page.wait_for_timeout(600)
                
        # Wait for the remaining time of Scene 1
        wait_for_scene_duration("scene1", time.time() - scene1_start)
        log_milestone("scene1_end")

        # ==========================================
        # SCENE 2: Select Patient 1 & Intake 1 Run
        # ==========================================
        scene2_start = time.time()
        
        print("Selecting Patient 1 card...")
        log_milestone("select_pat1_start")
        smooth_click("#patient-btn-pat_001")
        page.wait_for_timeout(1000)
        log_milestone("select_pat1_end")
        
        print("Triggering the AI Ingestion pipeline...")
        log_milestone("run_intake1_start")
        smooth_click("#run-intake-btn")
        
        # Let the logs stream. We wait for remaining scene time.
        wait_for_scene_duration("scene2", time.time() - scene2_start)
        log_milestone("run_intake1_end")
        log_milestone("scene2_end")

        # ==========================================
        # SCENE 3: Stepper Flowchart Audits
        # ==========================================
        scene3_start = time.time()
        
        print("Clicking Pipeline Engine in navbar...")
        log_milestone("click_pipeline1_start")
        smooth_click("button:has-text('Pipeline Engine')")
        page.wait_for_timeout(1500)
        log_milestone("click_pipeline1_end")
        
        print("Opening Code Map tab...")
        log_milestone("click_node2_start")
        smooth_click("#stepper-node-2")
        page.wait_for_timeout(3500)
        log_milestone("click_node2_end")
        
        print("Opening Payer Audit tab...")
        log_milestone("click_node3_start")
        smooth_click("#stepper-node-3")
        page.wait_for_timeout(3500)
        log_milestone("click_node3_end")
        
        # Hover around checklist to show details
        wait_for_scene_duration("scene3", time.time() - scene3_start)
        log_milestone("scene3_end")

        # ==========================================
        # SCENE 4: Patient 2 Selector & Scroll Down
        # ==========================================
        scene4_start = time.time()
        
        print("Scrolling back to top...")
        log_milestone("scroll_top_start")
        smooth_scroll_to(0, steps=30)
        page.wait_for_timeout(1000)
        log_milestone("scroll_top_end")
        
        print("Selecting Patient 2 card...")
        log_milestone("select_pat2_start")
        smooth_click("#patient-btn-pat_002")
        page.wait_for_timeout(1000)
        log_milestone("select_pat2_end")
        
        print("Scrolling to Pipeline Stepper and switching to EHR Ingest...")
        log_milestone("click_node0_start")
        smooth_scroll_to_element("#pipeline-engine", offset=80)
        smooth_click("#stepper-node-0")
        page.wait_for_timeout(1000)
        log_milestone("click_node0_end")
        
        wait_for_scene_duration("scene4", time.time() - scene4_start)
        log_milestone("scene4_end")

        # ==========================================
        # SCENE 5: Narrative Editing & Scroll Up
        # ==========================================
        scene5_start = time.time()
        
        print("Editing clinical note narrative...")
        log_milestone("edit_text_start")
        note_textarea = page.locator("textarea")
        box = note_textarea.bounding_box()
        if box:
            smooth_move_to(box["x"] + box["width"]/2, box["y"] + box["height"]/2, steps=15)
            page.mouse.click(box["x"] + box["width"]/2, box["y"] + box["height"]/2)
        else:
            note_textarea.click()
            
        page.wait_for_timeout(100)
        note_textarea.press("Control+A")
        page.wait_for_timeout(100)
        note_textarea.press("Delete")
        page.wait_for_timeout(100)
        
        new_note = (
            "Patient presents with acute chest pain, radiating to left arm. EKG shows ST-segment elevation in leads V1-V4. "
            "Suggest urgent cardiac catheterization. Payer guidelines require NPI check and pre-auth code verification."
        )
        note_textarea.type(new_note, delay=20)
        page.wait_for_timeout(1500)
        log_milestone("edit_text_end")
        
        print("Scrolling back to top to prepare for execution...")
        log_milestone("scroll_top2_start")
        smooth_scroll_to(0, steps=25)
        page.wait_for_timeout(1000)
        log_milestone("scroll_top2_end")
        
        wait_for_scene_duration("scene5", time.time() - scene5_start)
        log_milestone("scene5_end")

        # ==========================================
        # SCENE 6: Re-run Intake, View Audit & Footer
        # ==========================================
        scene6_start = time.time()
        
        print("Re-running AI Ingestion pipeline...")
        log_milestone("run_intake2_start")
        smooth_click("#run-intake-btn")
        # Ingestion 2 wait time is roughly 11.5s
        page.wait_for_timeout(11500)
        log_milestone("run_intake2_end")
        
        print("Clicking Pipeline Engine navbar button...")
        log_milestone("click_pipeline2_start")
        smooth_click("button:has-text('Pipeline Engine')")
        page.wait_for_timeout(1500)
        log_milestone("click_pipeline2_end")
        
        print("Opening Payer Audit tab...")
        log_milestone("click_node3_again_start")
        smooth_click("#stepper-node-3")
        page.wait_for_timeout(3500)
        log_milestone("click_node3_again_end")
        
        print("Scrolling down to footer credits...")
        log_milestone("scroll_footer_start")
        page_height = page.evaluate("document.body.scrollHeight")
        smooth_scroll_to(page_height, steps=30)
        page.wait_for_timeout(1000)
        log_milestone("scroll_footer_end")
        
        wait_for_scene_duration("scene6", time.time() - scene6_start)
        log_milestone("scene6_end")
        
        # End recording
        log_milestone("video_end")
        
        context.close()
        browser.close()
        
    # Write milestones JSON
    with open("sandbox_demo_assets/milestones.json", "w") as f:
        json.dump(milestones, f, indent=2)
    print("Milestones written to sandbox_demo_assets/milestones.json")
        
    # Convert recorded webm to mp4
    webm_files = glob.glob("sandbox_demo_assets/raw_video_dir/*.webm")
    if not webm_files:
        raise Exception("Error: Playwright screen recording file not found!")
    
    webm_path = webm_files[0]
    print(f"Converting raw webm {webm_path} to sandbox_demo_assets/raw_screen.mp4...")
    subprocess.run([
        "ffmpeg", "-y", "-i", webm_path, 
        "-c:v", "libx264", "-preset", "slow", "-crf", "18", 
        "-pix_fmt", "yuv420p", "sandbox_demo_assets/raw_screen.mp4"
    ], check=True)
    print("[Phase 1] Completed! Raw video saved as sandbox_demo_assets/raw_screen.mp4")

if __name__ == "__main__":
    record()
