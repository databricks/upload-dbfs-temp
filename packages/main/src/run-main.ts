import * as core from '@actions/core'
import {uploadDbfsTempfile} from './upload-dbfs-tempfile'
import {
  DATABRICKS_DBFS_DESTINATION_PATH_OUTPUT_KEY,
  DBFS_TMP_DIR_STATE_KEY
} from '../../common/src/constants'
import * as util from '../../common/src/utils'

async function runMainHelper(): Promise<void> {
  const databricksHost: string = util.getDatabricksHost()
  const databricksToken: string = util.getDatabricksToken()
  const localPath: string = util.getLocalPathInput()
  const dbfsTmpDir: string = util.getDbfsTempDir()
  const {dbfsUploadDirectory, dbfsUploadPath} = await uploadDbfsTempfile(
    databricksHost,
    databricksToken,
    localPath,
    dbfsTmpDir
  )
  core.saveState(DBFS_TMP_DIR_STATE_KEY, dbfsUploadDirectory)
  core.setOutput(DATABRICKS_DBFS_DESTINATION_PATH_OUTPUT_KEY, dbfsUploadPath)
}

export async function runMain(): Promise<void> {
  await util.runStepAndHandleFailure(runMainHelper)
}
