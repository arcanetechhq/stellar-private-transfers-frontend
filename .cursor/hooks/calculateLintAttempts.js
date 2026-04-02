import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";

const LINT_ATTEMPT_FILE_PATH = ".cursor/hooks/lintAttempts";
const MAX_ATTEMPTS = 3;

function findWorkspaceRoot(file_path, workspace_roots) {
  for (const root of workspace_roots) {
    if (file_path.startsWith(root)) {
      return root;
    }
  }
}

function main() {
  const hookArguments = JSON.parse(fs.readFileSync("/dev/stdin"), "utf8");
  const {
    tool_input: { file_path },
    workspace_roots,
  } = hookArguments;

  const workspaceRoot = findWorkspaceRoot(file_path, workspace_roots);
  const attemptsDirectory = path.normalize(
    path.join(workspaceRoot, LINT_ATTEMPT_FILE_PATH),
  );
  if (!fs.existsSync(attemptsDirectory)) {
    fs.mkdirSync(attemptsDirectory, { recursive: true });
  }

  const inner = `unset npm_config_prefix; export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && cd ${JSON.stringify(workspaceRoot)} && nvm use --silent && npx eslint ${JSON.stringify(file_path)}`;
  exec(`bash -lc ${JSON.stringify(inner)}`, (error) => {
    const filePath =
      file_path.slice(workspaceRoot.length + 1).replaceAll("/", "_") + ".txt";
    const attemptsFilePath = path.normalize(
      path.join(attemptsDirectory, filePath),
    );
    let attemtsCount = fs.existsSync(attemptsFilePath)
      ? JSON.parse(fs.readFileSync(attemptsFilePath, "utf8")).attempts
      : 0;
    if (error) {
      attemtsCount = attemtsCount + 1;
      const attemtsFileContent = JSON.stringify(
        {
          attempts: attemtsCount,
          file_path: file_path,
        },
        undefined,
        2,
      );
      fs.writeFileSync(attemptsFilePath, attemtsFileContent);
    } else {
      try {
        fs.rmSync(attemptsFilePath);
      } catch {}
    }
  });
}

main();
