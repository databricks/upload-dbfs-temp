import * as core from '@actions/core'
import {DBFS_TMP_DIR_STATE_KEY} from '../../common/src/constants'
import * as util from '../../common/src/utils'
import {deleteDbfsTmpdir} from './delete-dbfs-tmpdir'

async function runPostHelper(): Promise<void> {
  const databricksHost: string = util.getDatabricksHost()
  const databricksToken: string = util.getDatabricksToken()
  const dbfsTmpdir: string = core.getState(DBFS_TMP_DIR_STATE_KEY)
  await deleteDbfsTmpdir(databricksHost, databricksToken, dbfsTmpdir)
}

export async function runPost(): Promise<void> {
  await util.runStepAndHandleFailure(runPostHelper)
}
