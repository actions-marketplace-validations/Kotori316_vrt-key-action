import {
    debug,
    getIDToken,
    getInput,
    getState,
    info,
    setFailed,
} from "@actions/core";
import { context } from "@actions/github";
import vrtKey from "./vrtKey";

export async function run(): Promise<void> {
    const status = getState("successfully-get-key");
    debug(`State(successfully-get-key): ${status}`);
    if (status !== "true") {
        info("Nothing to put");
        return;
    }
    const endpoint = getInput("endpoint");
    const repo = context.repo;
    const branch = getState("branch");
    const token = await getIDToken();
    const key = context.sha;
    debug(
        `Saving key for ${repo.owner}/${repo.repo}#${branch} as ${key} to ${endpoint}`,
    );
    const response = await vrtKey.put(
        endpoint,
        repo.owner,
        repo.repo,
        branch,
        token,
        key,
    );
    debug(`Put key: ${response.success}`);
    if (!response.success) {
        setFailed(response.error);
        return;
    }
    info("Successfully put key");
}
