#!/usr/bin/env bash
# Creates Iris and Mosaic on your GitHub Projects tab and links the repos.
# Requires: gh auth refresh -h github.com -s read:project,project

set -euo pipefail

OWNER="jahidbappi"

echo "Checking GitHub CLI project scopes..."
if ! gh auth status 2>&1 | grep -q "read:project\|project"; then
  echo ""
  echo "Missing project scopes. Run this first and approve in the browser:"
  echo "  gh auth refresh -h github.com -s read:project,project"
  echo ""
  exit 1
fi

create_and_link() {
  local title="$1"
  local repo="$2"

  echo ""
  echo "=== Setting up project: $title ==="

  # Reuse existing project if title matches
  existing=$(gh project list --owner "$OWNER" --format json 2>/dev/null | \
    python3 -c "import json,sys; data=json.load(sys.stdin); print(next((str(p['number']) for p in data.get('projects',[]) if p.get('title')==sys.argv[1]), ''), end='')" "$title" 2>/dev/null || true)

  if [[ -n "$existing" ]]; then
    echo "Project '$title' already exists (#$existing)"
    project_number="$existing"
  else
    echo "Creating project '$title'..."
    project_number=$(gh project create --owner "$OWNER" --title "$title" --format json | \
      python3 -c "import json,sys; print(json.load(sys.stdin)['number'])")
    echo "Created project #$project_number"
  fi

  echo "Linking repo $OWNER/$repo..."
  gh project link "$project_number" --owner "$OWNER" --repo "$OWNER/$repo" 2>/dev/null || \
    echo "Repo may already be linked."

  url=$(gh project view "$project_number" --owner "$OWNER" --format json | \
    python3 -c "import json,sys; print(json.load(sys.stdin).get('url',''))")
  echo "Project URL: $url"
}

create_and_link "Iris" "iris"
create_and_link "Mosaic" "mosaic-rag"

echo ""
echo "Done! View your projects:"
echo "  https://github.com/$OWNER?tab=projects"
gh project list --owner "$OWNER"
