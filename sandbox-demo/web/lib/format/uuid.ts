export function isValidWorkflowId(workflowId: string): boolean {
  // UUID v4 without hyphens should be exactly 32 hexadecimal characters long
  const regex = /^[0-9a-f]{32}$/i;
  return regex.test(workflowId);
}
