import os
import subprocess
import json

def get_pr_diff_stats():
    # In GitHub Actions, we can use the environment variables
    # or just run git commands if the repo is checked out.
    try:
        # Get diff summary
        # git diff --stat origin/master
        result = subprocess.run(['git', 'diff', '--stat', 'origin/master'], capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        return str(e)

def analyze_changes():
    # Get the list of changed files and line counts
    # git diff --numstat origin/master
    result = subprocess.run(['git', 'diff', '--numstat', 'origin/master'], capture_output=True, text=True)
    lines = result.stdout.strip().split('\n')
    
    warnings = []
    total_deletions = 0
    
    critical_files = ['next.config.ts', 'package.json', 'vercel.json', 'tsconfig.json']
    
    for line in lines:
        if not line: continue
        parts = line.split('\t')
        if len(parts) < 3: continue
        
        added = int(parts[0]) if parts[0].isdigit() else 0
        deleted = int(parts[1]) if parts[1].isdigit() else 0
        filename = parts[2]
        
        total_deletions += deleted
        
        if deleted > 50:
            warnings.append(f"⚠️ **High Deletion**: `{filename}` has {deleted} lines deleted.")
            
        if filename in critical_files:
            warnings.append(f"🛡️ **Critical File Modified**: `{filename}` is a system configuration file.")
            
    if total_deletions > 200:
        warnings.append(f"🚨 **Drastic Changes**: Total deletions across all files is {total_deletions} lines.")
        
    return warnings

def main():
    warnings = analyze_changes()
    
    if warnings:
        comment = "### 🤖 EducAItors PR Review Bot\n\nI've detected some significant changes in this PR:\n\n"
        comment += "\n".join(warnings)
        comment += "\n\n**Professor @Sangeethramuk**, please review these changes carefully before merging."
        
        # Output the comment for the next step in GitHub Actions
        print(comment)
        
        # Create a file that the workflow can read
        with open('bot_comment.md', 'w') as f:
            f.write(comment)

if __name__ == "__main__":
    main()
