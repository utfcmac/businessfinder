# Git Hooks for BusinessFinder

This directory contains Git hooks that automatically enforce project conventions.

## Active Hooks

### `pre-commit`
Runs before every commit and checks:

1. **Unstaged files** - Warns if you have unstaged changes and offers to add them
2. **Untracked files** - Warns if you have untracked files and offers to add them

**What it does:**
- Prevents forgetting to stage files
- Interactive prompts for user decisions

### `commit-msg`
Runs when you create a commit message and validates:

1. **Conventional Commits format** - Ensures message follows `type(scope): subject`
2. **Valid types** - Only allows: feat, fix, docs, style, refactor, perf, test, chore

**Examples of valid messages:**
```bash
feat(api): add new scanning endpoint
fix(frontend): correct filter logic
docs(readme): update installation steps
chore(deps): bump express to v4.21.0
```

## Setup

Hooks are automatically installed when you run:
```bash
npm install
```

Or manually:
```bash
npm run setup:hooks
```

## Bypass Hooks (Not Recommended)

If you need to bypass hooks temporarily:
```bash
git commit --no-verify
```

⚠️ **Warning:** Only use this if you know what you're doing!

## How It Works

1. `npm install` runs the `postinstall` script
2. `postinstall` runs `setup:hooks`
3. `setup:hooks` configures git to use `.githooks` directory
4. Git now uses our custom hooks instead of `.git/hooks`

## Benefits

✅ **Never forget to stage files** - Hook prompts you
✅ **Enforce conventional commits** - Hook validates format
✅ **Consistent across team** - Everyone gets the same checks
✅ **Works for AI agents too** - Prevents AI mistakes

## Troubleshooting

### Hooks not running?

```bash
# Check current hooks path
git config core.hooksPath

# Should output: .githooks

# If not, run setup again
npm run setup:hooks
```

### Want to disable hooks?

```bash
# Remove hooks configuration
git config --unset core.hooksPath

# Restore (run setup again)
npm run setup:hooks
```

## For Contributors

If you're contributing to this project:
1. Hooks are automatically installed when you `npm install`
2. Follow the prompts when committing
3. If a hook blocks your commit, read the error message carefully
4. Fix the issue and try again
