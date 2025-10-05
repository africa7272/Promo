#!/usr/bin/env bash
# Script to count tags across all markdown posts and output JSON

TAG_FILE="tags.json"

# Declare associative array for counts
declare -A counts

# Iterate over all markdown files in content/posts
for f in content/posts/*.md; do
  # Find the first line starting with tags:
  tags_line=$(grep -m1 '^tags:' "$f")
  if [[ -n $tags_line ]]; then
    # Extract the content inside brackets
    tags=$(echo "$tags_line" | sed -n 's/^tags: \[\(.*\)\]/\1/p')
    # Remove quotes and spaces
    tags=$(echo "$tags" | tr -d ' "')
    # Split by comma and count each tag
    for tag in $(echo "$tags" | tr ',' '\n'); do
      tag=$(echo "$tag" | xargs)  # trim whitespace
      ((counts["$tag"]++))
    done
  fi
done

# Output counts as JSON
printf '{\n' > "$TAG_FILE"
first=1
for tag in "${!counts[@]}"; do
  if [ $first -eq 0 ]; then echo ","; fi
  printf '  \"%s\": %d' "$tag" "${counts[$tag]}"
  first=0
done
printf '\n}\n' >> "$TAG_FILE"

echo "Tag counts written to $TAG_FILE"
