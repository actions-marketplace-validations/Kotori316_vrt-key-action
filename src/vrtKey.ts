import {
    debug,
} from "@actions/core";

type Success = {
    success: true;
    data: string;
};
type AccessError = {
    success: false;
    error: string;
};
type AccessResult = Success | AccessError;

export default {
    get,
    put,
};

async function get(
    endpoint: string,
    owner: string,
    repository: string,
    branch: string,
): Promise<AccessResult> {
    const url = `${endpoint}/${owner}/${repository}/${branch}`;
    debug(`Fetching ${url}`)
    const response = await fetch(
        url,
        {
            headers: {
                "User-Agent": `vrt-key-action/${owner}/${repository}/${branch}`,
            },
        },
    );
    if (!response.ok) {
        const result = await response.json();
        return {
            success: false,
            error:
                getErrorMessage(result) ??
                `${response.status} ${response.statusText}`,
        };
    }
    const data = await response.text();
    return {
        success: true,
        data,
    };
}

async function put(
    endpoint: string,
    owner: string,
    repository: string,
    branch: string,
    token: string,
    data: string,
): Promise<AccessResult> {
    const response = await fetch(
        `${endpoint}/${owner}/${repository}/${branch}`,
        {
            method: "PUT",
            headers: {
                "User-Agent": `vrt-key-action/${owner}/${repository}/${branch}`,
                authorization: `Bearer ${token}`,
            },
            body: data,
        },
    );
    const result = await response.json();
    if (!response.ok) {
        return {
            success: false,
            error:
                getErrorMessage(result) ??
                `${response.status} ${response.statusText}`,
        };
    }
    return {
        success: true,
        data,
    };
}

function getErrorMessage(result: unknown): string | undefined {
    if (!result) {
        return undefined;
    }
    if (typeof result !== "object") {
        return undefined;
    }
    if (!("error" in result)) {
        return undefined;
    }
    if (typeof result.error !== "string") {
        return undefined;
    }
    return result.error;
}
