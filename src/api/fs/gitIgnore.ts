type AsyncFileReader = (path: string) => Promise<string | undefined>;

interface IgnoreRule {
  regex: RegExp;
  isNegated: boolean;
}

export async function filterIgnoredPaths(
  entries: Array<[string, FileSystemHandle]>,
  readFile: AsyncFileReader
): Promise<[string, FileSystemHandle][]> {
  // Convert gitignore pattern to regex
  const patternToRegex = (pattern: string): RegExp => {
    let regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\\\*/g, ".*") // * matches any string
      .replace(/\\\?/g, ".") // ? matches single char
      .replace(/\//g, "\\/"); // Handle path separators

    // If pattern doesn't start with /, it can match in any subdirectory
    if (!pattern.startsWith("/")) {
      regexPattern = `.*${regexPattern}`;
    }

    // If pattern ends with /, it matches directories
    if (pattern.endsWith("/")) {
      regexPattern = `${regexPattern}.*`;
    }

    return new RegExp(`^${regexPattern}$`);
  };

  // Get ignore rules from .gitignore-like files
  const getIgnoreRules = (content: string): IgnoreRule[] => {
    // Add implicit .git directory rule
    const implicitRules = [
      {
        regex: /^.*\.git(\/.*)?$/,
        isNegated: false,
      },
    ];

    // Parse and compile rules from content
    const parsedRules = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((pattern) => {
        const isNegated = pattern.startsWith("!");
        const cleanPattern = isNegated ? pattern.slice(1) : pattern;
        return {
          regex: patternToRegex(cleanPattern),
          isNegated,
        };
      });

    return [...implicitRules, ...parsedRules];
  };

  // Check if path matches any ignore pattern
  const isPathIgnored = (path: string, rules: IgnoreRule[]): boolean => {
    let ignored = false;
    for (const { regex, isNegated } of rules) {
      if (regex.test(path)) {
        ignored = !isNegated;
      }
    }
    return ignored;
  };

  try {
    // Read and parse ignore patterns from .gitignore
    const ignoreContent = await readFile(".gitignore");
    const ignoreRules = ignoreContent
      ? getIgnoreRules(ignoreContent)
      : // If no .gitignore, still use implicit rules
        [{ regex: /^.*\.git(\/.*)?$/, isNegated: false }];

    // Convert async iterator to array and filter
    const entriesArray: [string, FileSystemHandle][] = [];
    for await (const entry of entries) {
      entriesArray.push(entry);
    }

    return entriesArray.filter(([name]) => !isPathIgnored(name, ignoreRules));
  } catch (error) {
    // If .gitignore can't be read, still filter .git directory
    const entriesArray: [string, FileSystemHandle][] = [];
    for await (const entry of entries) {
      entriesArray.push(entry);
    }
    return entriesArray.filter(([name]) => !/^.*\.git(\/.*)?$/.test(name));
  }
}
