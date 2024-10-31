interface IgnoreRule {
  regex: RegExp;
  isNegated: boolean;
}

export class GitIgnoreHandler {
  private rules: Map<string, IgnoreRule[]> = new Map();

  constructor() {
    // Add implicit .git rule
    this.rules.set("", [
      {
        regex: /^.*\.git(\/.*)?$/,
        isNegated: false,
      },
    ]);
  }

  async updateRulesForDirectory(
    dirHandle: FileSystemDirectoryHandle,
    path: string
  ) {
    try {
      const gitIgnoreHandle = await dirHandle.getFileHandle(".gitignore");
      const file = await gitIgnoreHandle.getFile();
      const content = await file.text();

      this.rules.set(path, this.parseIgnoreRules(content));
    } catch {
      // No .gitignore file in this directory - that's fine
    }
  }

  private parseIgnoreRules(content: string): IgnoreRule[] {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((pattern) => ({
        regex: this.patternToRegex(pattern),
        isNegated: pattern.startsWith("!"),
      }));
  }

  private patternToRegex(pattern: string): RegExp {
    let cleanPattern = pattern.startsWith("!") ? pattern.slice(1) : pattern;

    let regexPattern = cleanPattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\*/g, ".*")
      .replace(/\\\?/g, ".")
      .replace(/\//g, "\\/");

    if (!cleanPattern.startsWith("/")) {
      regexPattern = `.*${regexPattern}`;
    }

    if (cleanPattern.endsWith("/")) {
      regexPattern = `${regexPattern}.*`;
    }

    return new RegExp(`^${regexPattern}$`);
  }

  async shouldIgnorePath(path: string): Promise<boolean> {
    // Check rules from all parent directories
    const pathParts = path.split("/");
    let currentPath = "";

    for (let i = 0; i <= pathParts.length; i++) {
      const rules = this.rules.get(currentPath);
      if (rules) {
        for (const { regex, isNegated } of rules) {
          if (regex.test(path)) {
            return !isNegated;
          }
        }
      }
      currentPath =
        i < pathParts.length
          ? currentPath
            ? `${currentPath}/${pathParts[i]}`
            : pathParts[i]
          : currentPath;
    }

    return false;
  }
}
