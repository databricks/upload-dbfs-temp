import * as path from 'path'
import {randomUUID} from 'crypto'
import {ApiClient} from '../../common/src/api-client'

const getDbfsUploadDirectory = (dbfsTmpDir: string): string => {
  const baseDir = dbfsTmpDir.endsWith('/') ? dbfsTmpDir : `${dbfsTmpDir}/`
  return `${baseDir}${randomUUID()}`
}

export async function uploadDbfsTempfile(
  databricksHost: string,
  databricksToken: string,
  localPath: string,
  dbfsTmpDir: string
): Promise<{dbfsUploadDirectory: string; dbfsUploadPath: string}> {
  if (!dbfsTmpDir.startsWith('dbfs:/')) {
    throw new Error(
      `Got invalid dbfs-temp-dir input "${dbfsTmpDir}". dbfs-temp-dir input must start with "dbfs:/"`
    )
  }
  const dbfsUploadDirectory = getDbfsUploadDirectory(dbfsTmpDir)
  const dbfsPath = `${dbfsUploadDirectory}/${path.basename(localPath)}`
  const apiClient = new ApiClient(databricksHost, databricksToken)
  await apiClient.dbfsUpload(localPath, dbfsPath)
  return {dbfsUploadDirectory, dbfsUploadPath: dbfsPath}
}
