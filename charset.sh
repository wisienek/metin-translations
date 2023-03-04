#!/bin/bash

# Set the desired target charset format
target_charset="iso-8859-1"

# Get the directory path from user input
echo "Enter the directory path containing the text files to be converted:"
read directory

# Check if the directory exists
if [ ! -d "$directory" ]; then
  echo "Error: directory does not exist."
  exit 1
fi

# Find all text files in the directory
files=$(find "$directory" -type f -name "*.txt")

# Loop through each file and convert its charset
for file in $files; do
    # Get the file name without the path and extension
    file_name="${file%.*}"
    # Add the "encoded" suffix to the file name
    new_file_name="$file_name"_encoded.txt
    # Convert the charset and save the result to the new file name
    echo "Converting $file"
    iconv -c -f UTF-8 -t "$target_charset"//TRANSLIT "$file" > "$new_file_name"
    echo "Finished $file !"
done

echo "Charset conversion complete!"
