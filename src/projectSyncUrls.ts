export const projectSyncUrls: Map<string, string | null> = new Map();

export function getProjectSyncUrl(currentUrl: string): string | null {
  return projectSyncUrls.get(currentUrl) || null;
}

export function setProjectSyncUrl(
  currentUrl: string,
  url: string | null
): void {
  projectSyncUrls.set(currentUrl, url);
}

