/**
 * @type {import('semantic-release').GlobalConfig}
 */

/**
 * OUTPUTS :
 * - The released version is written to a file named VERSION, for use in the Github Action workflow
 */

export default {
  branches: [
    // Production
    {
      name: '(release|release-*)',
      channel: 'release',
    },

    // Pre-release branches
    {
      name: '(alpha|alpha-*)',
      channel: 'alpha',
      prerelease: true,
    },

    // Developer branches all update the 'development' channel and prerelease
    {
      name: 'main',
      channel: 'dev',
      prerelease: 'dev',
    },
  ],
  ci: true,
  debug: true,
  dryRun: false,
  repositoryUrl: 'https://github.com/Rapido-TM/mcp-tools',

  // prettier-ignore
  verifyConditions: [
    "@semantic-release/npm",      // verify npm authentication
    "@semantic-release/github",
  ],

  // prettier-ignore
  plugins: [
    [
      "@semantic-release/commit-analyzer", {
        preset: "angular",
        releaseRules: [
          { breaking: true, release: "major" },
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "doc", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "refactor", scope: "core-*", release: "minor" },
          { type: "refactor", release: "patch" },

          { scope: "no-release", release: false },
        ],
      },
    ],

    "@semantic-release/release-notes-generator",

    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],

    // Publish to npm
    ["@semantic-release/npm", {
      npmPublish: true,
      tarballDir: "dist",
      pkgRoot: ".",
    }],

    // Commit these files to Git(hub) after they have been updated by semantic-release
    [
      "@semantic-release/git", {
        assets: ["package.json", "package-lock.json", "CHANGELOG.md", "ios/App/App.xcodeproj/project.pbxproj"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],

    // Add the CHANGELOG.md file as an attachment to the Github release
    ["@semantic-release/github", { assets: ["CHANGELOG.md"] }],

  ],
};
