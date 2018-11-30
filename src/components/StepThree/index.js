import React, { Component } from 'react'
import arrayMutators from 'final-form-arrays'
import logdown from 'logdown'
import setFieldTouched from 'final-form-set-field-touched'
import { Form } from 'react-final-form'
import { CHAINS, NAVIGATION_STEPS } from '../../utils/constants'
import { SectionInfo } from '../Common/SectionInfo'
import { StepNavigation } from '../Common/StepNavigation'
import { checkWeb3, getNetWorkNameById, getNetworkVersion } from '../../utils/blockchainHelpers'
import { getStep3Component, tierDurationUpdater } from './utils'
import { inject, observer } from 'mobx-react'
import { noGasPriceAvailable, warningOnMainnetAlert } from '../../utils/alerts'
import { navigateTo, goBack, goBackMustBeEnabled } from '../../utils/utils'

const logger = logdown('TW:StepThree')
const { CROWDSALE_SETUP } = NAVIGATION_STEPS

@inject(
  'contractStore',
  'web3Store',
  'tierStore',
  'generalStore',
  'gasPriceStore',
  'reservedTokenStore',
  'deploymentStore',
  'tokenStore',
  'crowdsaleStore'
)
@observer
export class StepThree extends Component {
  state = {
    reload: false,
    initialTiers: [],
    burnExcess: 'no',
    gasTypeSelected: {},
    backButtonTriggered: false, //Testing purposes
    nextButtonTriggered: false, //Testing purposes
    goBackEnabledTriggered: false //Testing purposes
  }

  componentDidMount() {
    const { web3Store, gasPriceStore } = this.props

    checkWeb3(web3Store.web3)

    logger.log('Component did mount')
    window.addEventListener('beforeunload', this.onUnload)

    const { initialTiers, burnExcess, gasTypeSelected } = this.load()

    this.setState({
      initialTiers: initialTiers,
      burnExcess: burnExcess,
      gasTypeSelected: gasTypeSelected
    })

    window.scrollTo(0, 0)

    gasPriceStore.updateValues().catch(() => noGasPriceAvailable())
  }

  load() {
    const { tierStore, generalStore, web3Store, crowdsaleStore, gasPriceStore } = this.props

    if (tierStore.tiers.length === 0) {
      logger.log('Web3store', web3Store)
      tierStore.addCrowdsale(web3Store.curAddress)
    } else {
      this.setState({
        firstLoad: false
      })
    }

    let initialTiers

    if (crowdsaleStore.isDutchAuction) {
      initialTiers = [JSON.parse(JSON.stringify(tierStore.tiers))[0]]
    } else {
      initialTiers = JSON.parse(JSON.stringify(tierStore.tiers))
    }

    if (!generalStore.gasTypeSelected) {
      generalStore.setGasTypeSelected(gasPriceStore.gasPricesInGwei[0])
    }

    return {
      initialTiers: initialTiers,
      burnExcess: generalStore.burnExcess,
      gasTypeSelected: generalStore.gasTypeSelected
    }
  }

  onUnload = e => {
    logger.log('On unload')
    e.returnValue = 'Are you sure you want to leave?'
  }

  componentWillUnmount() {
    logger.log('Component unmount')
    window.removeEventListener('beforeunload', this.onUnload)
  }

  goNextStep = () => {
    try {
      this.setState({
        nextButtonTriggered: true
      })
      navigateTo({
        history: this.props.history,
        location: 'stepFour',
        fromLocation: 'stepThree'
      })
    } catch (err) {
      logger.log('Error to navigate', err)
    }
  }

  goBack = () => {
    try {
      this.setState({
        backButtonTriggered: true
      })
      goBack({
        history: this.props.history,
        location: '/stepTwo'
      })
    } catch (err) {
      logger.log('Error to navigate', err)
    }
  }

  goBackEnabled = () => {
    let goBackEnabled = false
    try {
      this.setState({
        goBackEnabledTriggered: true
      })
      goBackEnabled = goBackMustBeEnabled({ history: this.props.history })
      logger.log(`Go back is enabled ${goBackEnabled}`)
    } catch (err) {
      logger.log(`There is an error trying to set enable/disable on back button`)
    }
    return goBackEnabled
  }

  handleOnSubmit = () => {
    const { tierStore, reservedTokenStore, deploymentStore, crowdsaleStore } = this.props
    const tiersCount = tierStore.tiers.length
    const reservedCount = reservedTokenStore.tokens.length
    const hasWhitelist = tierStore.tiers.some(tier => {
      return tier.whitelistEnabled === 'yes'
    })
    const hasMinCap = tierStore.tiers.some(tier => {
      return +tier.minCap !== 0
    })

    deploymentStore.initialize(!!reservedCount, hasWhitelist, crowdsaleStore.isDutchAuction, tierStore.tiers, hasMinCap)

    getNetworkVersion()
      .then(networkID => {
        if (getNetWorkNameById(networkID) === CHAINS.MAINNET) {
          const { generalStore } = this.props
          const priceSelected = generalStore.gasPrice
          let whitelistCount = 0

          if (hasWhitelist) {
            whitelistCount = tierStore.tiers.reduce((total, tier) => {
              if (tier.whitelist) {
                if (tier.whitelist.length) {
                  total++
                }
              }
              return total
            }, 0)
          }

          return warningOnMainnetAlert(tiersCount, priceSelected, reservedCount, whitelistCount, this.goNextStep)
        }

        this.goNextStep()
      })
      .catch(error => {
        logger.error(error)
      })
  }

  calculator = tierDurationUpdater(this.props.tierStore.tiers)

  render() {
    const { tierStore, tokenStore, gasPriceStore, generalStore, web3Store, crowdsaleStore } = this.props
    const stepThreeComponent = getStep3Component(crowdsaleStore.strategy)
    const stores = { tierStore, tokenStore, crowdsaleStore, generalStore, gasPriceStore }

    return (
      <div>
        <section className="lo-MenuBarAndContent" ref="three">
          <StepNavigation activeStepTitle={CROWDSALE_SETUP} />
          {/* Do not render the form until tiers are set up */}
          {this.state.initialTiers.length !== 0 ? (
            <div className="st-StepContent">
              <SectionInfo
                description="The most important and exciting part of the crowdsale process.<br />Here you can define parameters of
              your crowdsale campaign."
                stepNumber="3"
                title="Crowdsale Setup"
              />
              <Form
                component={stepThreeComponent}
                decorators={[this.calculator]}
                initialValues={{
                  burnExcess: this.state.burnExcess,
                  gasPrice: this.state.gasTypeSelected,
                  tiers: this.state.initialTiers,
                  walletAddress: web3Store.curAddress,
                  whitelistEnabled: 'no'
                }}
                mutators={{ ...arrayMutators, setFieldTouched }}
                onSubmit={this.handleOnSubmit}
                firstLoad={this.state.firstLoad}
                {...stores}
                goBack={this.goBack}
                goBackEnabled={this.goBackEnabled}
              />
            </div>
          ) : null}
        </section>
      </div>
    )
  }
}
