import {
    debug,
    getInput,
    saveState,
    setFailed,
    setOutput,
} from "@actions/core";
import { context } from "@actions/github";
import vrtKey from "./vrtKey";

export async function run(): Promise<void> {
    const endpoint = getInput("endpoint");
    debug(`Detected endpoint: ${endpoint}`);
    if (!endpoint) {
        setFailed("Endpoint cannot be empty");
        return;
    }

    const repo = context.repo;
    debug(`Detected repo: ${repo.owner}/${repo.repo}`);

    const branch = getInput("branch") || getBranchFromContext();
    debug(`Detected branch: ${branch}`);
    if (!branch) {
        setFailed("Could not detect branch");
        return;
    }

    const key = await vrtKey.get(endpoint, repo.owner, repo.repo, branch);
    if (!key.success) {
        setFailed(key.error);
        saveState("successfully-get-key", "false");
        return;
    }
    saveState("successfully-get-key", "true");
    setOutput("key", key.data);
}

function getBranchFromContext(): string | undefined {
    if (context.eventName === "push") {
        return process.env.GITHUB_REF_NAME;
    }
    const prBase = context.payload.pull_request?.base.ref;
    if (prBase && typeof prBase === "string") {
        return prBase;
    }
    return context.ref.replace("refs/heads/", "");
}
