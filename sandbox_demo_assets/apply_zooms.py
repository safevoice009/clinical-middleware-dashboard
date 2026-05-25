import os
import json
import cv2
import numpy as np

def process_video():
    input_path = "sandbox_demo_assets/raw_screen.mp4"
    output_path = "sandbox_demo_assets/zoomed_presentation.mp4"
    milestones_path = "sandbox_demo_assets/milestones.json"
    
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Error: {input_path} not found! Run record_sandbox.py first.")
    if not os.path.exists(milestones_path):
        raise FileNotFoundError(f"Error: {milestones_path} not found! Run record_sandbox.py first.")

    with open(milestones_path, "r") as f:
        ms = json.load(f)

    print("[Phase 2] Loading raw recording and setting up OpenCV VideoWriter...")
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Construct keyframe timelines dynamically based on the exact milestones
    keyframes_sec = [
        {"time": 0.0, "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["navigated"], "cx": 640, "cy": 360, "scale": 1.0},
        
        # Scene 1 hover action zooms (keep full screen)
        {"time": ms["scene1_end"] - 0.5, "cx": 640, "cy": 360, "scale": 1.0},
        
        # Zoom to Patient 1
        {"time": ms["select_pat1_start"], "cx": 320, "cy": 240, "scale": 1.3},
        {"time": ms["select_pat1_end"], "cx": 320, "cy": 240, "scale": 1.3},
        
        # Zoom to Run Intake button
        {"time": ms["run_intake1_start"], "cx": 860, "cy": 280, "scale": 1.35},
        {"time": ms["run_intake1_end"], "cx": 860, "cy": 280, "scale": 1.35},
        
        # Focus on Logs Drawer
        {"time": ms["run_intake1_end"] + 0.5, "cx": 640, "cy": 500, "scale": 1.25},
        {"time": ms["scene2_end"] - 0.5, "cx": 640, "cy": 500, "scale": 1.25},
        
        # Zoom out during scrolling / navbar click
        {"time": ms["click_pipeline1_start"], "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["click_pipeline1_end"], "cx": 640, "cy": 360, "scale": 1.0},
        
        # Click Code Map node (Step 3)
        {"time": ms["click_node2_start"], "cx": 550, "cy": 320, "scale": 1.32},
        {"time": ms["click_node2_end"], "cx": 550, "cy": 320, "scale": 1.32},
        
        # Click Payer Audit node (Step 4)
        {"time": ms["click_node3_start"], "cx": 780, "cy": 320, "scale": 1.32},
        {"time": ms["click_node3_end"], "cx": 780, "cy": 320, "scale": 1.32},
        
        # Scroll to top
        {"time": ms["scroll_top_start"], "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["scroll_top_end"], "cx": 640, "cy": 360, "scale": 1.0},
        
        # Select Patient 2
        {"time": ms["select_pat2_start"], "cx": 320, "cy": 240, "scale": 1.3},
        {"time": ms["select_pat2_end"], "cx": 320, "cy": 240, "scale": 1.3},
        
        # Click Step 1 node
        {"time": ms["click_node0_start"], "cx": 320, "cy": 240, "scale": 1.3},
        {"time": ms["click_node0_end"], "cx": 320, "cy": 240, "scale": 1.3},
        
        # Edit text area
        {"time": ms["edit_text_start"], "cx": 320, "cy": 480, "scale": 1.35},
        {"time": ms["edit_text_end"], "cx": 320, "cy": 480, "scale": 1.35},
        
        # Zoom out / Scroll back to top
        {"time": ms["scroll_top2_start"], "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["scroll_top2_end"], "cx": 640, "cy": 360, "scale": 1.0},
        
        # Run Intake 2
        {"time": ms["run_intake2_start"], "cx": 860, "cy": 280, "scale": 1.35},
        {"time": ms["run_intake2_end"], "cx": 860, "cy": 280, "scale": 1.35},
        
        # Focus on Logs Drawer 2
        {"time": ms["run_intake2_end"] + 0.5, "cx": 640, "cy": 500, "scale": 1.22},
        {"time": ms["click_pipeline2_start"] - 0.5, "cx": 640, "cy": 500, "scale": 1.22},
        
        # Click Pipeline Engine 2
        {"time": ms["click_pipeline2_start"], "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["click_pipeline2_end"], "cx": 640, "cy": 360, "scale": 1.0},
        
        # Open Payer Audit 2
        {"time": ms["click_node3_again_start"], "cx": 780, "cy": 320, "scale": 1.32},
        {"time": ms["click_node3_again_end"], "cx": 780, "cy": 320, "scale": 1.32},
        
        # Scroll to footer
        {"time": ms["scroll_footer_start"], "cx": 640, "cy": 360, "scale": 1.0},
        {"time": ms["scroll_footer_end"], "cx": 640, "cy": 480, "scale": 1.25},
        {"time": ms["video_end"] - 0.5, "cx": 640, "cy": 480, "scale": 1.25},
        {"time": ms["video_end"], "cx": 640, "cy": 360, "scale": 1.0}
    ]

    keyframes = []
    for kf in keyframes_sec:
        keyframes.append({
            "frame": int(kf["time"] * fps),
            "cx": kf["cx"],
            "cy": kf["cy"],
            "scale": kf["scale"]
        })
        
    keyframes.sort(key=lambda x: x["frame"])

    print("Processing video frames and interpolating scale/pan effects...")
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        cx, cy, scale = 640, 360, 1.0
        
        if frame_idx <= keyframes[0]["frame"]:
            cx = keyframes[0]["cx"]
            cy = keyframes[0]["cy"]
            scale = keyframes[0]["scale"]
        elif frame_idx >= keyframes[-1]["frame"]:
            cx = keyframes[-1]["cx"]
            cy = keyframes[-1]["cy"]
            scale = keyframes[-1]["scale"]
        else:
            for i in range(len(keyframes) - 1):
                k1 = keyframes[i]
                k2 = keyframes[i+1]
                if k1["frame"] <= frame_idx <= k2["frame"]:
                    denom = k2["frame"] - k1["frame"]
                    t = (frame_idx - k1["frame"]) / denom if denom > 0 else 0
                    cx = k1["cx"] + t * (k2["cx"] - k1["cx"])
                    cy = k1["cy"] + t * (k2["cy"] - k1["cy"])
                    scale = k1["scale"] + t * (k2["scale"] - k1["scale"])
                    break

        crop_w = int(width / scale)
        crop_h = int(height / scale)

        x1 = int(cx - crop_w / 2)
        y1 = int(cy - crop_h / 2)

        x1 = max(0, min(x1, width - crop_w))
        y1 = max(0, min(y1, height - crop_h))
        x2 = x1 + crop_w
        y2 = y1 + crop_h

        cropped = frame[y1:y2, x1:x2]
        resized = cv2.resize(cropped, (width, height), interpolation=cv2.INTER_LANCZOS4)
        out.write(resized)
        
        frame_idx += 1

    cap.release()
    out.release()
    print(f"[Phase 2] Completed! Saved output as sandbox_demo_assets/zoomed_presentation.mp4")

if __name__ == "__main__":
    process_video()
