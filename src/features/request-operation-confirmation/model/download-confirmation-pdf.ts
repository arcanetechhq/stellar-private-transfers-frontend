const FILE_NAME = "operation-confirmation.pdf";

export function downloadConfirmationPdf(file: Blob): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
