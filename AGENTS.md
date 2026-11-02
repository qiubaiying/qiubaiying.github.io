# Git workflow

## Create branches from current master

Before creating any new Git branch:

1. Ensure the working tree is clean, or preserve existing work first.
2. Run `git fetch origin master`.
3. Check whether `origin/master` is ahead of local `master`.
4. If it is ahead, switch to `master` and run `git pull --ff-only origin master`.
5. Create the work branch only after local `master` is up to date. Use the `codex/` prefix unless the user gives another name.

Do not make work changes on `master`; make them on the new branch.
