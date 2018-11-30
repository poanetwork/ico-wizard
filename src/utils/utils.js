import { TOAST } from './constants'
import queryString from 'query-string'
import { BigNumber } from 'bignumber.js'
import logdown from 'logdown'
import Web3 from 'web3'
import moment from 'moment'
import { fetchFile } from './fetchFile'
import { isObservableArray } from 'mobx'

const logger = logdown('TW:utils:utils')

export const getQueryVariable = variable => {
  return queryString.parse(window.location.search)[variable]
}

export const isExecIDValid = execID => /^0x[a-f0-9]{64}$/i.test(execID)

export const isAddressValid = address => Web3.utils.isAddress(address)

export const getExecIDFromQuery = () => {
  const execID = getQueryVariableExecId()
  logger.log('getExecID:', execID)
  return isExecIDValid(execID) ? execID : null
}

export const getAddrFromQuery = () => {
  const addr = getQueryVariableAddr()
  logger.log('getAddr:', addr)
  return isAddressValid(addr) ? addr : null
}

export const getQueryVariableAddr = () => {
  return getQueryVariable('addr')
}

export const getQueryVariableExecId = () => {
  return getQueryVariable('exec-id')
}

export const isNetworkIDValid = networkID => /^[0-9]+$/.test(networkID)

export const getNetworkID = () => {
  const networkID = getQueryVariable('networkID')
  return isNetworkIDValid(networkID) ? networkID : null
}

export const setFlatFileContentToState = async file => {
  return await fetchFile(file)
}

export const dateToTimestamp = date => new Date(date).getTime()

export const validateTier = tier => typeof tier === 'string' && tier.length > 0 && tier.length < 30

export const validateSupply = supply => isNaN(Number(supply)) === false && Number(supply) > 0

export const validateTime = time => dateToTimestamp(time) > Date.now()

export const validateLaterTime = (laterTime, previousTime) => dateToTimestamp(laterTime) > dateToTimestamp(previousTime)

export const validateLaterOrEqualTime = (laterTime, previousTime) =>
  dateToTimestamp(laterTime) >= dateToTimestamp(previousTime)

export const toFixed = x => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1], 10)
    if (e) {
      x *= Math.pow(10, e - 1)
      x = '0.' + new Array(e).join('0') + x.toString().substring(2)
    }
  } else {
    let e = parseInt(x.toString().split('+')[1], 10)
    if (e > 20) {
      e -= 20
      x /= Math.pow(10, e)
      x += new Array(e + 1).join('0')
    }
  }
  return x
}

export const toast = {
  msg: {},
  showToaster: function({ type = TOAST.TYPE.INFO, message = '', options = {} }) {
    if (!message) {
      return
    }

    if (typeof this.msg[type] === 'function') {
      this.msg[type](message, options)
    } else {
      return
    }
  }
}

export const gweiToWei = x => parseInt(x * 1000000000, 10)

export const weiToGwei = x => x / 1000000000

export const countDecimalPlaces = num => {
  /*
    (?:
      \.
      (\d+)  First captured group: decimals after the point but before the e
    )?
    (?:
      [eE]
      ([+-]?\d+)  Second captured group: exponent used to adjust the count
    )?
    $
  */
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)

  if (!match[0] && !match[1] && !match[2]) return 0

  const digitsAfterDecimal = match[1] ? match[1].length : 0
  const adjust = match[2] ? +match[2] : 0

  return Math.max(0, digitsAfterDecimal - adjust)
}

export const acceptPositiveIntegerOnly = value => {
  if (typeof value === 'number') value = String(value)
  if (typeof value !== 'string') return ''

  return String(value).match(/^(\d*)/)[1]
}

export const removeTrailingNUL = ascii => ascii.replace(/\x00+$/, '')

export const truncateStringInTheMiddle = (str, strLength = 50, strPositionStart = 24, strPositionEnd = 25) => {
  if (typeof str === 'string' && str.length > strLength) {
    return `${str.substr(0, strPositionStart)}...${str.substr(str.length - strPositionEnd, str.length)}`
  }
  return str
}

/**
 * Converts the value passed to a BigNumber instance
 * @param {*} value - A number representation
 * @param {boolean} [force=true] - If set to false will return 'undefined' when value is not a number or a string
 * representation of a number.
 * @returns {BigNumber|undefined}
 */
export const toBigNumber = (value, force = true) => {
  BigNumber.set({ DECIMAL_PLACES: 18 })

  if (isNaN(value) || value === '' || value === null) {
    if (force) {
      return new BigNumber(0)
    } else {
      return undefined
    }
  } else {
    return new BigNumber(value)
  }
}

/**
 * Sleep function like C
 * @param ms
 * @returns {Promise}
 */
export const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const clearStorage = props => {
  // Generate of stores to clear
  const toArray = ({
    generalStore,
    contractStore,
    crowdsaleStore,
    gasPriceStore,
    deploymentStore,
    reservedTokenStore,
    stepTwoValidationStore,
    tierStore,
    tokenStore
  }) => {
    return [
      generalStore,
      contractStore,
      crowdsaleStore,
      gasPriceStore,
      deploymentStore,
      reservedTokenStore,
      stepTwoValidationStore,
      tierStore,
      tokenStore
    ]
  }

  const storesToClear = toArray(props)
  for (let storeToClear of storesToClear) {
    if (storeToClear && typeof storeToClear.reset === 'function') {
      logger.log('Store to be cleared:', storeToClear.constructor.name)
      storeToClear.reset()
    }
  }
}

export const navigateTo = data => {
  const { history, location, params = '', fromLocation } = data
  const path = convertLocationToPath(location)

  if (path === null) {
    throw new Error(`invalid location specified: ${location}`)
  }

  if (!history || !(typeof history === 'object')) {
    throw new Error(`invalid history object: ${history}`)
  }

  history.push({
    pathname: `${path}${params}`,
    state: {
      fromLocation: fromLocation
    }
  })

  return true
}

export const convertLocationToPath = location => {
  return (
    {
      home: '/',
      stepOne: '1',
      stepTwo: '2',
      stepThree: '3',
      stepFour: '4',
      manage: 'manage',
      crowdsales: 'crowdsales',
      contribute: 'contribute'
    }[location] || null
  )
}

export const goBack = data => {
  const { history } = data

  if (!history || !(typeof history === 'object')) {
    throw new Error(`invalid history object: ${history}`)
  }

  if (typeof history.goBack === undefined) {
    throw new Error(`invalid goBack function`)
  }

  history.goBack()

  return true
}

export const goBackMustBeEnabled = data => {
  const { history } = data

  if (!history || !(typeof history === 'object')) {
    throw new Error(`invalid history object: ${history}`)
  }
  const length = history.length || 0
  return length > 1
}

export const convertDateToLocalTimezoneInUnix = dateToConvert => {
  const dateConvertUnix = moment(dateToConvert)
    .local()
    .unix()
  return dateConvertUnix * 1000
}

export const convertDateToUTCTimezoneToDisplay = dateToConvert => {
  return moment(dateToConvert)
    .utc()
    .format('YYYY-MM-DD HH:mm (z ZZ)')
}

export const getContractBySourceType = (sourceType, isMintedCappedCrowdsale, { DutchProxy, MintedCappedProxy }) => {
  const parseContent = content => (isObservableArray(content) ? JSON.stringify(content.slice()) : content)
  return isMintedCappedCrowdsale ? parseContent(MintedCappedProxy[sourceType]) : parseContent(DutchProxy[sourceType])
}

export const getSourceTypeTitle = sourceType => {
  const sourceTypeName = {
    abi: 'ABI',
    bin: 'Creation Code',
    src: 'Source Code'
  }

  return `Crowdsale Proxy Contract ${sourceTypeName[sourceType]}`
}

export const updateProxyContractInfo = ({ contractAddress }, { web3Store, contractStore, crowdsaleStore }, params) => {
  const { web3 } = web3Store
  const encoded = web3.eth.abi.encodeParameters(['address', 'bytes32', 'address', 'bytes32'], params)

  contractStore.setContractProperty(crowdsaleStore.proxyName, 'addr', contractAddress.toLowerCase())
  contractStore.setContractProperty(crowdsaleStore.proxyName, 'abiEncoded', encoded.slice(2))
}

export const downloadFile = (data, filename, mimetype) => {
  if (!data) {
    return
  }

  const blob = data.constructor !== Blob ? new Blob([data], { type: mimetype || 'application/octet-stream' }) : data

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename)
    return
  }

  const lnk = document.createElement('a')
  const url = window.URL
  let objectURL

  if (mimetype) {
    lnk.type = mimetype
  }

  lnk.download = filename || 'untitled'
  lnk.href = objectURL = url.createObjectURL(blob)
  lnk.dispatchEvent(new MouseEvent('click'))
  setTimeout(url.revokeObjectURL.bind(url, objectURL))
}

export const uniqueElementsBy = (arr, fn) =>
  arr.reduce((acc, v) => {
    if (!acc.some(x => fn(v, x))) acc.push(v)
    return acc
  }, [])

export const pad = (num, size) => {
  let s = num + ''
  while (s.length < size) s = '0' + s
  return s
}
