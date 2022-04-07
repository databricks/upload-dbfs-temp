import * as utils from '../packages/common/src/utils'
import {getSetFailedMock} from './test-utils'

jest.mock('@actions/core', () => {
  return {
    ...jest.requireActual('@actions/core'),
    setFailed: jest.fn()
  }
})

describe(`input utils`, () => {
  describe(`getDatabricksHost`, () => {
    afterEach(() => {
      delete process.env['INPUT_DATABRICKS-HOST']
      delete process.env['DATABRICKS_HOST']
    })

    test('retrieves host from action input', async () => {
      const dummyHost = 'fakecompanynonexistent.cloud.databricks.com'
      process.env['INPUT_DATABRICKS-HOST'] = dummyHost
      expect(utils.getDatabricksHost()).toEqual(dummyHost)
    })

    test('retrieves host from env if input not set', async () => {
      const dummyHost = 'fakecompanynonexistent.cloud.databricks.com'
      process.env['DATABRICKS_HOST'] = dummyHost
      expect(utils.getDatabricksHost()).toEqual(dummyHost)
    })

    test('throws if neither input nor env variables are set', async () => {
      try {
        utils.getDatabricksHost()
      } catch (err) {
        expect(err).toEqual(
          new Error(
            'Either databricks-host action input or DATABRICKS_HOST env variable must be set.'
          )
        )
      }
    })
  })

  describe(`getDatabricksToken`, () => {
    afterEach(() => {
      delete process.env['INPUT_DATABRICKS-TOKEN']
      delete process.env['DATABRICKS_TOKEN']
    })

    test('retrieves token from action input', async () => {
      const dummyToken = '1234'
      process.env['INPUT_DATABRICKS-TOKEN'] = dummyToken
      expect(utils.getDatabricksToken()).toEqual(dummyToken)
    })

    test('retrieves token from env if input not set', async () => {
      const dummyToken = '1234'
      process.env['DATABRICKS_TOKEN'] = dummyToken
      expect(utils.getDatabricksToken()).toEqual(dummyToken)
    })

    test('throws if neither input nor env variables are set', async () => {
      try {
        utils.getDatabricksToken()
      } catch (err) {
        expect(err).toEqual(
          new Error(
            'Either databricks-token action input or DATABRICKS_TOKEN env variable must be set.'
          )
        )
      }
    })
  })
})

describe('utils unit tests', () => {
  test('runStepAndHandleFailure marks Action as failed if provided step fails', async () => {
    const mockStepToRun = async () => {
      throw new Error('step failed')
    }
    await expect(async () => {
      await utils.runStepAndHandleFailure(mockStepToRun)
    }).rejects.toThrow(new Error('step failed'))
    expect(getSetFailedMock()).toBeCalledWith('step failed')
  })
})
