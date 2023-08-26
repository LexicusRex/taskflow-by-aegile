# Git Conventions

## Branch Naming Convention:

1. Start the branch name with a category: feature, bugfix, hotfix, or test.
2. After the category, include a "/" followed by the reference of the issue or ticket you are working on. If there's no reference, use "no-ref."
3. After the reference, include another "/" followed by a short description of the branch's purpose in kebab case.

Examplar Branch Names:
feature/HELI-42/backend/create-new-button-component
bugfix/HELI-342/frontend/button-overlap-form-on-mobile
hotfix/no-ref/global/registration-form-not-working
test/no-ref/frontend/refactor-components-with-atomic-design

## Commit Naming Convention:

1. Start the commit message with a category of change: feat, fix, refactor, or chore.
2. After the category, use a colon to announce the commit description.
3. The commit description should consist of short statements describing the changes, with each statement starting with an imperative verb conjugation and separated by ";".

Examplar Commit Messages:
feat: add new button component; add new button components to templates
fix: add the stop directive to button component to prevent propagation
refactor: rewrite button component in TypeScript
chore: write button documentation
These conventions aim to provide a simplified and consistent way to name branches and commits in Git.
