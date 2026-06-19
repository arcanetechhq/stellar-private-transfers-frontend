import fs from "node:fs";
import path from "node:path";

const forbidenFilePaths = JSON.parse(
  fs.readFileSync(".cursor/hooks/writeSecuredFiles.json", "utf8"),
);

function checkForbidenFileEdits(filePath) {
  for (const { pathGlob: forbidenFilePath, reason } of forbidenFilePaths) {
    if (path.matchesGlob(filePath, forbidenFilePath)) {
      return {
        permission: "deny",
        agent_message: reason,
      };
    }
  }

  return {
    permission: "allow",
  };
}

function removeRootPrefix(filePath, workspaceRoots) {
  for (const root of workspaceRoots) {
    if (filePath.startsWith(root)) {
      return filePath.slice(root.length + 1);
    }
  }
  return filePath;
}

function main() {
  const arguments_ = JSON.parse(fs.readFileSync("/dev/stdin"), "utf8");
  const {
    tool_input: { file_path },
    workspace_roots,
  } = arguments_;
  const filePath = removeRootPrefix(file_path, workspace_roots);
  const result = checkForbidenFileEdits(filePath);
  console.log(JSON.stringify(result, null, 2));
}

main();
