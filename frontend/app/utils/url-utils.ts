export function validateYouTubeUrl(url: string): boolean {
  
  if (!validateUrl(url)) {
    return false;
  }

  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return regex.test(url);
}

export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url.trim());
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

