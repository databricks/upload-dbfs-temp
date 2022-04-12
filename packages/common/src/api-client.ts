import {Buffer} from 'buffer'
import {DBFS_UPLOAD_MAX_BYTES_PER_BLOCK} from './constants'
import {httpRequest} from './request'
import * as fs from 'fs'

// Copying from https://github.com/databricks/databricks-cli/blob/1e39ccfdbab47ee2ca7f320b81146e2bcabb2f97/databricks_cli/sdk/api_client.py
export class ApiClient {
  host: string
  token: string
  actionVerson: string

  constructor(host: string, token: string) {
    this.host = host
    this.token = token
    this.actionVerson = require('../../../package.json').version
  }

  private async request(
    path: string,
    method: string,
    body: object
  ): Promise<object> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'User-Agent': `databricks-github-action-upload-dbfs-temp/${this.actionVerson}`,
      'Content-Type': 'application/json'
    }
    return httpRequest(this.host, path, method, headers, body)
  }

  private static base64Encode(content: string | Buffer): string {
    if (content instanceof Buffer) {
      return content.toString('base64')
    }
    return new Buffer(content).toString('base64')
  }

  private async dbfsCreateHandle(dbfsPath: string): Promise<number> {
    const {handle} = (await this.request('/api/2.0/dbfs/create', 'POST', {
      path: dbfsPath
    })) as {handle: number}
    return handle
  }

  private async dbfsCloseHandle(handle: number): Promise<void> {
    await this.request('/api/2.0/dbfs/close', 'POST', {
      handle
    })
  }

  private async dbfsAddFileBlocks(
    handle: number,
    localPath: string
  ): Promise<void> {
    const stream = fs.createReadStream(localPath, {
      // Do not set encoding in order to read local path in raw binary format.
      highWaterMark: DBFS_UPLOAD_MAX_BYTES_PER_BLOCK
    })
    return new Promise((resolve, reject) => {
      stream.on('data', async content => {
        const b64Content = ApiClient.base64Encode(content)
        try {
          await this.request('/api/2.0/dbfs/add-block', 'POST', {
            handle,
            data: b64Content
          })
        } catch (err) {
          reject(err)
        }
      })
      stream.on('error', err => {
        reject(err)
      })
      stream.on('close', () => {
        resolve()
      })
    })
  }

  async dbfsUpload(localPath: string, dbfsPath: string): Promise<void> {
    const handle = await this.dbfsCreateHandle(dbfsPath)
    try {
      await this.dbfsAddFileBlocks(handle, localPath)
    } finally {
      await this.dbfsCloseHandle(handle)
    }
  }

  async dbfsDeleteDirectory(dbfsPath: string): Promise<void> {
    await this.request('/api/2.0/dbfs/delete', 'POST', {
      path: dbfsPath,
      recursive: true
    })
  }
}
