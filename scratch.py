with open('src/pages/LandingPage.jsx', 'r') as f:
    lines = f.readlines()

features_start = -1
preview_start = -1
preview_end = -1

for i, line in enumerate(lines):
    if '<section className="landing-features">' in line:
        features_start = i
    if '<section className="landing-data-preview">' in line:
        preview_start = i
    if '<footer className="landing-footer">' in line:
        preview_end = i - 1

if features_start != -1 and preview_start != -1 and preview_end != -1:
    preview_block = lines[preview_start:preview_end+1]
    # Remove preview block from original position
    del lines[preview_start:preview_end+1]
    
    # Insert preview block right before features
    for line in reversed(preview_block):
        lines.insert(features_start, line)
        
    with open('src/pages/LandingPage.jsx', 'w') as f:
        f.writelines(lines)
    print("Moved successfully")
else:
    print(f"Could not find indices: {features_start}, {preview_start}, {preview_end}")
