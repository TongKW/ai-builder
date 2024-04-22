export function getFileExtension(file: File): string {
  // Get the name of the file
  const fileName = file.name;

  // Find the last dot in the filename
  const lastDotIndex = fileName.lastIndexOf(".");

  // Extract the extension using the last dot. If there is no dot, return an empty string.
  if (lastDotIndex === -1) return ""; // No extension found
  return fileName.substring(lastDotIndex + 1).toLowerCase(); // Convert to lower case for consistency
}
