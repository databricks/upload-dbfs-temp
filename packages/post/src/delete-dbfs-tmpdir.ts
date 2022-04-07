import {ApiClient} from '../../common/src/api-client'

export async function deleteDbfsTmpdir(
  databricksHost: string,
  databricksToken: string,
  dbfsTmpDir: string
): Promise<void> {
  const apiClient = new ApiClient(databricksHost, databricksToken)
  await apiClient.dbfsDeleteDirectory(dbfsTmpDir)
}
