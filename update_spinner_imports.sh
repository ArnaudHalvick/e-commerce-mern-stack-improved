#!/bin/bash

# Find all JavaScript and JSX files in the frontend directory
find frontend/src -type f \( -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" | while read file; do
  # Skip the spinner files themselves
  if [[ $file == */components/ui/spinner/* ]]; then
    continue
  fi
  
  # Update imports from "../ui/Spinner" to "../ui/spinner"
  sed -i 's|import Spinner from "\.\./ui/Spinner"|import Spinner from "../ui/spinner"|g' "$file"
  sed -i 's|import Spinner from "\.\./\.\./components/ui/Spinner"|import Spinner from "../../components/ui/spinner"|g' "$file"
  sed -i 's|import Spinner from "\.\./\.\./\.\./components/ui/Spinner"|import Spinner from "../../../components/ui/spinner"|g' "$file"
  
  # Update imports from "../ui/SpinnerUtils" to "../ui/spinner"
  sed -i 's|import { InlineSpinner } from "\.\./ui/SpinnerUtils"|import { InlineSpinner } from "../ui/spinner"|g' "$file"
  sed -i 's|import { InlineSpinner } from "\.\./\.\./components/ui/SpinnerUtils"|import { InlineSpinner } from "../../components/ui/spinner"|g' "$file"
  sed -i 's|import { InlineSpinner } from "\.\./\.\./\.\./components/ui/SpinnerUtils"|import { InlineSpinner } from "../../../components/ui/spinner"|g' "$file"
  
  # Update import for multiple named imports from SpinnerUtils
  sed -i 's|import { \(.*\) } from "\.\./ui/SpinnerUtils"|import { \1 } from "../ui/spinner"|g' "$file"
  sed -i 's|import { \(.*\) } from "\.\./\.\./components/ui/SpinnerUtils"|import { \1 } from "../../components/ui/spinner"|g' "$file"
  sed -i 's|import { \(.*\) } from "\.\./\.\./\.\./components/ui/SpinnerUtils"|import { \1 } from "../../../components/ui/spinner"|g' "$file"
done

echo "Spinner imports updated successfully!" 