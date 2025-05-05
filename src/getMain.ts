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

    const repo = context.repo;
    debug(`Detected repo: ${repo.owner}/${repo.repo}`);

    const branch =
        getInput("branch") ||
        (context.payload.pull_request?.head.ref ?? context.payload.ref_name);
    debug(`Detected branch: ${branch}`);

    const key = await vrtKey.get(endpoint, repo.owner, repo.repo, branch);
    if (!key.success) {
        setFailed(key.error);
        saveState("successfully-get-key", "false");
        return;
    }
    saveState("successfully-get-key", "true");
    setOutput("key", key.data);
}
