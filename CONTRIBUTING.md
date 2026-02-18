# Contributing to Alumni Management System

First off, thank you for considering contributing to the **Alumni Management System**! We welcome contributions from the community—whether it's fixing bugs, improving documentation, or proposing new features. Every contribution helps make this project better for everyone.

Please take a moment to review this document to understand our contribution process.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Reporting Issues](#reporting-issues)

---

## <a id="getting-started"></a>Getting Started

### 1. Fork the Repository

Navigate to the [Alumni Management System repository](https://github.com/omkarhole/Alumni-Management-System) and click the **"Fork"** button in the top-right corner to create a copy of the repository in your own GitHub account.

### 2. Clone Your Fork

Clone the forked repository to your local machine:

```bash
git clone https://github.com/your-username/Alumni-Management-System.git
cd Alumni-Management-System
```

### 3. Create a Branch

Always create a new branch for your work. Use a descriptive naming convention so we know what you're working on:

```bash
# For adding a new feature
git checkout -b feature/your-feature-name

# For fixing a bug
git checkout -b fix/your-bug-fix-name
```

---

## <a id="development-workflow"></a>Development Workflow

### 1. Make Your Changes

As you develop, please keep the following in mind:

- **Write clean code:** Keep your code organized, readable, and well-documented.
- **Follow existing styles:** Ensure your additions blend naturally with the current codebase.
- **Comment responsibly:** Add comments explaining _why_ something is done, especially for complex logic.
- **Update Documentation:** If your changes affect how the project runs or is used, update the `README.md` accordingly.

### 2. Test Your Changes

Before committing, ensure that your changes do not break existing functionality and adhere to our formatting rules:

```bash
# Navigate to the backend and run tests (if available)
cd backend
npm test

# Navigate to the frontend and run linting
cd frontend
npm run lint
```

### 3. Commit Your Changes

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. This helps us generate clean release notes.

```bash
git add .

# Example for a new feature
git commit -m "feat: add new feature description"

# Example for a bug fix
git commit -m "fix: resolve bug description"
```

### 4. Push and Create a Pull Request

Push your branch to your forked repository:

```bash
git push origin feature/your-feature-name
```

Once pushed, go to the original [Alumni Management System repository](https://github.com/omkarhole/Alumni-Management-System) and open a **Pull Request (PR)**.

- Describe your changes in detail in the PR body.
- Link any related issues (e.g., "Closes #12").
- Wait for a maintainer to review your code. We may request a few changes before merging!

---

## <a id="code-style-guidelines"></a>Code Style Guidelines

To keep the codebase consistent, please adhere to the following standards:

- **JavaScript/React:** Follow the project's existing ESLint configuration. Ensure there are no linting errors before pushing.
- **Naming Conventions:** \* Use `camelCase` for variables and function names.
  - Use `PascalCase` for React components and class names.
- **Comments:** Add JSDoc comments for complex or reusable functions to explain parameters and return values.
- **Commit Prefixes:** Use standardized prefixes for your commits:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation updates
  - `style:` Formatting, missing semi-colons, etc. (no code changes)
  - `refactor:` Refactoring production code
  - `test:` Adding missing tests or correcting existing tests
  - `chore:` Updating build tasks, package manager configs, etc.

---

## <a id="reporting-issues"></a>Reporting Issues

If you find a bug or have a suggestion for a new feature, we'd love to hear about it!

Before creating a new issue, please **check if the issue already exists**. If not, open a new issue and include the following details to help us understand and resolve it faster:

1. **Clear Title and Description:** Briefly explain what the issue is.
2. **Steps to Reproduce (for bugs):** Provide a numbered list of steps we can follow to see the bug ourselves.
3. **Expected vs. Actual Behavior:** What did you expect to happen, and what actually happened?
4. **Screenshots:** Include screenshots or screen recordings if applicable.
5. **Environment Details:** Provide relevant context, such as your Operating System, Node.js version, browser, etc.
