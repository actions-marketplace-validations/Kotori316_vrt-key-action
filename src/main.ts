import core from '@actions/core'

export async function main(): Promise<void> {
    const endpoint = core.getInput("endpoint")
    console.log(endpoint)
}
