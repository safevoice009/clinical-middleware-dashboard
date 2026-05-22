import os
import shutil

src_dir = "clinical-dashboard"
dest_dir = "."

if os.path.exists(src_dir):
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(dest_dir, item)
        if os.path.isdir(s):
            # If the destination directory already exists, merge them or remove and copy
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.move(s, d)
        else:
            shutil.move(s, d)
    
    # Remove the source directory
    shutil.rmtree(src_dir)
    print("Scaffolding files moved successfully.")
else:
    print("clinical-dashboard directory not found.")
