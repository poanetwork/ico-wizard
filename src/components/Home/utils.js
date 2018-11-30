import { DOWNLOAD_STATUS } from '../../utils/constants'
import { getNetworkVersion } from '../../utils/blockchainHelpers'
import { getCrowdsaleAssets } from '../../stores/utils'
import logdown from 'logdown'

const logger = logdown('TW:home:utils')

export const reloadStorage = async props => {
  let { generalStore, contractStore } = props

  try {
    if (!contractStore || !generalStore) {
      throw new Error('There is no stores to set')
    }
    contractStore.setProperty('downloadStatus', DOWNLOAD_STATUS.PENDING)

    // General store, check network
    let networkID = await getNetworkVersion()
    generalStore.setProperty('networkID', networkID)

    // Contract store, get contract and abi
    await getCrowdsaleAssets(networkID)
    contractStore.setProperty('downloadStatus', DOWNLOAD_STATUS.SUCCESS)
    return true
  } catch (e) {
    logger.error('Error downloading contracts', e)
    if (contractStore) {
      contractStore.setProperty('downloadStatus', DOWNLOAD_STATUS.FAILURE)
    }
    throw e
  }
}
