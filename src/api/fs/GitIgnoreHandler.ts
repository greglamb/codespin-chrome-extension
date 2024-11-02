interface IgnoreRule {
  regex: RegExp;
  isNegated: boolean;
  source: string;
  pattern: string;
}

export class GitIgnoreHandler {
  private readonly rules: Map<string, Array<IgnoreRule>>;
  private readonly parent: GitIgnoreHandler | null;

  constructor(parent: GitIgnoreHandler | null = null) {
    this.parent = parent;
    this.rules = new Map<string, IgnoreRule[]>();

    // Only add root rules if this is the root handler
    if (!parent) {
      this.rules.set("", [
        {
          regex: /^.*\.git(\/.*)?$/,
          isNegated: false,
          source: "",
          pattern: ".git",
        },
      ]);
    }
  }

  async createChildHandler(
    dirHandle: FileSystemDirectoryHandle,
    path: string
  ): Promise<GitIgnoreHandler> {
    try {
      const gitIgnoreHandle = await dirHandle.getFileHandle(".gitignore");
      const file = await gitIgnoreHandle.getFile();
      const content = await file.text();

      const newRules = this.parseIgnoreRules(content, path);
      if (newRules.length === 0) {
        return this; // Reuse current handler if no new rules
      }

      const childHandler = new GitIgnoreHandler(this);
      childHandler.rules.set(path, newRules);
      return childHandler;
    } catch {
      // No .gitignore file in this directory
      return this;
    }
  }

  private parseIgnoreRules(content: string, source: string): IgnoreRule[] {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((pattern) => ({
        regex: this.patternToRegex(pattern, source),
        isNegated: pattern.startsWith("!"),
        source,
        pattern: pattern,
      }));
  }

  private patternToRegex(pattern: string, source: string): RegExp {
    let cleanPattern = pattern.startsWith("!") ? pattern.slice(1) : pattern;

    // Remove leading slash if present
    if (cleanPattern.startsWith("/")) {
      cleanPattern = cleanPattern.slice(1);
    }

    let regexPattern = cleanPattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special regex characters
      .replace(/\\\*/g, "[^/]*") // * matches anything except /
      .replace(/\\\?/g, "[^/]") // ? matches any single character except /
      .replace(/\/{2,}/g, "/"); // Replace multiple slashes with single slash

    // Handle directory patterns (ending with /)
    const isDirectoryPattern = cleanPattern.endsWith("/");
    if (isDirectoryPattern) {
      // Remove the trailing slash for processing
      regexPattern = regexPattern.slice(0, -1);
    }

    // For patterns without slashes (like "*.log"):
    // - In root .gitignore, it should match anywhere
    // - In nested .gitignore, it should only match in that directory and below
    if (!cleanPattern.includes("/")) {
      if (source === "") {
        regexPattern = `(.*\\/)?${regexPattern}`;
      } else {
        regexPattern = `${source}(\\/.*)?\\/${regexPattern}`;
      }
    } else {
      // If pattern has slashes and we're in a nested .gitignore,
      // anchor it to the source directory
      if (source) {
        regexPattern = `${source}\\/${regexPattern}`;
      }
    }

    // If it's a directory pattern (ends with /), match both:
    // 1. The directory itself (no trailing slash)
    // 2. The directory and all its contents (with trailing slash and optional content)
    if (isDirectoryPattern) {
      regexPattern = `${regexPattern}(\\/.*)?`;
    }

    return new RegExp(`^${regexPattern}$`);
  }

  async shouldIgnorePath(path: string): Promise<boolean> {
    // Collect all rules starting from this handler up through parents
    const allRules: Array<[string, IgnoreRule[]]> = [];
    let current: GitIgnoreHandler | null = this;

    while (current) {
      current.rules.forEach((rules, source) => {
        allRules.push([source, [...rules]]);
      });
      current = current.parent;
    }

    // Sort rules by specificity (deeper paths first)
    allRules.sort((a, b) => {
      const depthA = (a[0].match(/\//g) || []).length;
      const depthB = (b[0].match(/\//g) || []).length;
      return depthB - depthA;
    });

    // Check rules in order of specificity
    let ignored: boolean | null = null;

    for (const [_, rules] of allRules) {
      for (const rule of rules) {
        if (rule.regex.test(path)) {
          if (rule.isNegated) {
            ignored = false;
          } else if (ignored === null) {
            ignored = true;
          }
        }
      }
    }

    return ignored ?? false;
  }
}
