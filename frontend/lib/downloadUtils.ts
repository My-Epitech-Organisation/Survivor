import { getAPIUrl } from './config';

/**
 * Utility function to download files with proper authentication
 */
export const downloadFile = async (fileId: number, fileName: string): Promise<void> => {
  try {
    const token = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      throw new Error("No auth token found");
    }

    const apiUrl = getAPIUrl();
    const downloadUrl = `${apiUrl}/drive/files/${fileId}/download/`;

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);

    // Fallback: open in new tab
    const apiUrl = getAPIUrl();
    const fallbackUrl = `${apiUrl}/drive/files/${fileId}/download/`;
    window.open(fallbackUrl, "_blank");
  }
};

/**
 * Get authentication token from cookies
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("authToken=")
  );

  return tokenCookie ? tokenCookie.split("=")[1].trim() : null;
};
