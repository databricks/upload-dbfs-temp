import {
  DATABRICKS_HOST,
  TOKEN,
  getRequestMock,
  mockApiRequest,
  setupExpectedApiCalls,
  getSetOutputMock,
  getGetStateMock
} from './test-utils'
import {deleteDbfsTmpdir} from '../packages/post/src/delete-dbfs-tmpdir'
import {runMain} from '../packages/main/src/run-main'
import {
  DATABRICKS_DBFS_DESTINATION_PATH_OUTPUT_KEY,
  DBFS_TMP_DIR_STATE_KEY
} from '../packages/common/src/constants'
import {runPost} from '../packages/post/src/run-post'

// Needs to be at top level of module so that the module-mocking is hoisted
// See https://jestjs.io/docs/manual-mocks#using-with-es-module-imports for details
jest.mock('../packages/common/src/request')

jest.mock('@actions/core', () => {
  return {
    ...jest.requireActual('@actions/core'),
    getState: jest.fn()
  }
})

describe('post-step unit tests', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockUuid = 'MOCK_UUID_FOR_TESTS'
  test.each([
    {
      dbfsTempDir: `dbfs:/databricks-github-actions/${mockUuid}`
    },
    {
      dbfsTempDir: `dbfs:/databricks-github-actions/${mockUuid}/`
    }
  ])(
    'delete-dbfs-tmpdir: successful deletion of temporary DBFS directory',
    async ({dbfsTempDir}) => {
      setupExpectedApiCalls([
        mockApiRequest(
          '/api/2.0/dbfs/delete',
          'POST',
          {path: dbfsTempDir, recursive: true},
          200,
          {}
        )
      ])
      await deleteDbfsTmpdir(DATABRICKS_HOST, TOKEN, dbfsTempDir)
      const apiMock = getRequestMock()
      expect(apiMock).toBeCalledTimes(1)
    }
  )

  test('deleteDbfsTmpdir: handles API failures', async () => {
    const tmpNotebookDirectory = `dbfs:/databricks-github-actions/${mockUuid}`
    setupExpectedApiCalls([
      mockApiRequest(
        '/api/2.0/dbfs/delete',
        'POST',
        {path: `dbfs:/databricks-github-actions/${mockUuid}`, recursive: true},
        400,
        {}
      )
    ])
    await expect(async () => {
      await deleteDbfsTmpdir(DATABRICKS_HOST, TOKEN, tmpNotebookDirectory)
    }).rejects.toThrow(
      new Error('Request failed with error code 400. Response body: {}')
    )
    const apiMock = getRequestMock()
    expect(apiMock).toBeCalledTimes(1)
  })
})

describe('upload-dbfs-tempfile integration tests', () => {
  const dbfsTempDir = 'dbfs:/databricks-github-actions/'
  const filePath = '__tests__/resources/scala-jar.jar'
  const expectedAddBlocks = ['cHJpbnRsbigiSGVsbG8gd29ybGQiKQo=']
  const expectedDbfsUploadDir = `dbfs:/databricks-github-actions/mockUuid`
  const expectedDbfsUploadPath = `${expectedDbfsUploadDir}scala-jar.jar`
  const handle = 123

  afterEach(() => {
    delete process.env['INPUT_DBFS-TEMP-DIR']
    delete process.env['INPUT_LOCAL-PATH']
    delete process.env['INPUT_DATABRICKS-HOST']
    delete process.env['INPUT_DATABRICKS-TOKEN']
    jest.resetAllMocks()
  })

  test('upload-dbfs-tempfile post step deletes temporary directory from state', async () => {
    getGetStateMock().mockImplementation((key: string) => {
      if (key === DBFS_TMP_DIR_STATE_KEY) {
        return expectedDbfsUploadDir
      }
      throw new Error(
        `Fetched unexpected DBFS state directory key ${key} in tests. Expected ${DBFS_TMP_DIR_STATE_KEY}`
      )
    })
    process.env['INPUT_DBFS-TEMP-DIR'] = dbfsTempDir
    process.env['INPUT_LOCAL-PATH'] = filePath
    process.env['INPUT_DATABRICKS-HOST'] = DATABRICKS_HOST
    process.env['INPUT_DATABRICKS-TOKEN'] = TOKEN
    setupExpectedApiCalls([
      mockApiRequest(
        '/api/2.0/dbfs/delete',
        'POST',
        {path: expectedDbfsUploadDir, recursive: true},
        200,
        {}
      )
    ])
    await runPost()
    const apiMock = getRequestMock()
    expect(apiMock).toBeCalledTimes(1)
    expect(getGetStateMock()).toBeCalledWith(DBFS_TMP_DIR_STATE_KEY)
  })
})
