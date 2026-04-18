import os
import subprocess
import json

def analyze_changes():
    # Get the list of changed files and line counts
    # git diff --numstat origin/master
    try:
        result = subprocess.run(['git', 'diff', '--numstat', 'origin/master'], capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
    except Exception as e:
        return [f"❌ Error running git diff: {str(e)}"]
    
    warnings = []
    total_deletions = 0
    modified_areas = set()
    
    # Define area mapping
    area_map = {
        'src/app/dashboard/pre-evaluation': 'Pre-Evaluation',
        'src/app/dashboard/evaluation': 'Evaluation',
        'src/app/dashboard/grading': 'Grading',
        # Add more as they are created
    }
    
    critical_files = ['next.config.ts', 'package.json', 'vercel.json', 'tsconfig.json']
    
    for line in lines:
        if not line: continue
        parts = line.split('\t')
        if len(parts) < 3: continue
        
        added = int(parts[0]) if parts[0].isdigit() else 0
        deleted = int(parts[1]) if parts[1].isdigit() else 0
        filename = parts[2]
        
        total_deletions += deleted
        
        # Check for area crossing
        for path, area_name in area_map.items():
            if filename.startswith(path):
                modified_areas.add(area_name)
                break
        
        # Flag deletions in any file
        if deleted > 20: # Lowered threshold as requested for "multiple things"
            warnings.append(f"⚠️ **Deletions Detected**: `{filename}` has {deleted} lines removed.")
            
        if filename in critical_files:
            warnings.append(f"🛡️ **System File Modified**: `{filename}` is a critical configuration file.")
            
    # Cross-area warning
    if len(modified_areas) > 1:
        areas_str = ", ".join(sorted(list(modified_areas)))
        warnings.append(f"🔄 **Cross-Team Impact**: This PR modifies multiple areas: **{areas_str}**. Please ensure you have coordinated with the respective teams.")
        
    if total_deletions > 100:
        warnings.append(f"🚨 **Large Scale Deletions**: Total deletions across the project is {total_deletions} lines.")
        
    return warnings

def main():
    warnings = analyze_changes()
    
    if warnings:
        comment = "### 🤖 EducAItors PR Review Bot\n\nI've analyzed the changes and found some potential risks:\n\n"
        comment += "\n".join(warnings)
        comment += "\n\n**Professor @Sangeethramuk**, these changes involve deletions or impact multiple team areas. Please review carefully."
        
        print(comment)
        with open('bot_comment.md', 'w') as f:
            f.write(comment)

if __name__ == "__main__":
    main()
