import * as core from '@actions/core'

export const getDatabricksHost = (): string => {
  const hostFromInput = core.getInput('databricks-host')
  const hostFromEnv = process.env['DATABRICKS_HOST'] || ''

  if (!hostFromInput && !hostFromEnv) {
    throw new Error(
      'Either databricks-host action input or DATABRICKS_HOST env variable must be set.'
    )
  } else {
    // Host passed as an action input takes president.
    return hostFromInput ? hostFromInput : hostFromEnv
  }
}

export const getDatabricksToken = (): string => {
  const tokenFromInput = core.getInput('databricks-token')
  const tokenFromEnv = process.env['DATABRICKS_TOKEN'] || ''

  if (!tokenFromInput && !tokenFromEnv) {
    throw new Error(
      'Either databricks-token action input or DATABRICKS_TOKEN env variable must be set.'
    )
  } else {
    // Token passed as an action input takes president.
    return tokenFromInput ? tokenFromInput : tokenFromEnv
  }
}

export const getDbfsTempDir = (): string => {
  const res = core.getInput('dbfs-temp-dir')
  if (!res.startsWith('dbfs:/')) {
    throw new Error(
      `dbfs-temp-dir input must be a DBFS path starting with 'dbfs:/'. Got invalid path ${res}`
    )
  }
  return res
}

export const getLocalPathInput = (): string => {
  return core.getInput('local-path', {required: true})
}

export const runStepAndHandleFailure = async (
  runStep: () => Promise<void>
): Promise<void> => {
  try {
    await runStep()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
    throw error
  }
}
