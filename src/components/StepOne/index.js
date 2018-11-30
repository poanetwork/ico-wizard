import React, { Component } from 'react'
import logdown from 'logdown'
import { ButtonContinue } from '../Common/ButtonContinue'
import { NAVIGATION_STEPS, CROWDSALE_STRATEGIES, DOWNLOAD_STATUS } from '../../utils/constants'
import { SectionInfo } from '../Common/SectionInfo'
import { StepNavigation } from '../Common/StepNavigation'
import { StrategyItem } from './StrategyItem'
import { checkWeb3ForErrors } from '../../utils/blockchainHelpers'
import { clearStorage, navigateTo } from '../../utils/utils'
import { inject, observer } from 'mobx-react'
import { reloadStorage } from '../Home/utils'
import { strategies } from '../../utils/strategies'

const logger = logdown('TW:StepOne')
const { CROWDSALE_STRATEGY } = NAVIGATION_STEPS
const { MINTED_CAPPED_CROWDSALE } = CROWDSALE_STRATEGIES

@inject(
  'web3Store',
  'generalStore',
  'contractStore',
  'crowdsaleStore',
  'gasPriceStore',
  'deploymentStore',
  'reservedTokenStore',
  'stepTwoValidationStore',
  'tierStore',
  'tokenStore'
)
@observer
export class StepOne extends Component {
  state = {
    strategy: MINTED_CAPPED_CROWDSALE
  }

  constructor(props) {
    super(props)

    if (localStorage.reload) {
      // We made a reload, to verify metamask inject web3 when is enabled
      delete localStorage.reload
      localStorage.clearStorage = true
      this.block = false
      window.location.reload()
    } else {
      this.block = true
    }
  }

  async componentDidMount() {
    if (this.block) {
      logger.log('Component did mount')
      window.addEventListener('beforeunload', this.onUnload)

      // Capture back button to clear fromLocation
      window.addEventListener(
        'popstate',
        event => {
          if (event.state) {
            this.props.history.replace({
              state: {
                fromLocation: null
              }
            })
          }
        },
        false
      )

      try {
        await checkWeb3ForErrors(result => {
          navigateTo({
            history: this.props.history,
            location: 'home'
          })
        })

        const { strategy } = await this.load()
        this.setState({ strategy: strategy })
      } catch (e) {
        logger.log('An error has occurred', e.message)
      }
    }
  }

  async load() {
    const { crowdsaleStore } = this.props
    if (localStorage.clearStorage) {
      delete localStorage.clearStorage

      clearStorage(this.props)
      await reloadStorage(this.props)
    }

    // Set default strategy value
    const strategy = crowdsaleStore && crowdsaleStore.strategy ? crowdsaleStore.strategy : MINTED_CAPPED_CROWDSALE

    logger.log('CrowdsaleStore strategy', strategy)
    crowdsaleStore.setProperty('strategy', strategy)

    return {
      strategy: strategy
    }
  }

  goNextStep = () => {
    navigateTo({
      history: this.props.history,
      location: 'stepTwo',
      fromLocation: 'stepOne'
    })
  }

  handleChange = e => {
    const { crowdsaleStore } = this.props
    const strategy = e.currentTarget.value

    crowdsaleStore.setProperty('strategy', strategy)
    this.setState({
      strategy: crowdsaleStore.strategy
    })
    logger.log('CrowdsaleStore strategy selected:', strategy)
  }

  onUnload = e => {
    logger.log('On unload')
    e.returnValue = 'Are you sure you want to leave?'
  }

  componentWillUnmount() {
    logger.log('Component unmount')
    window.removeEventListener('beforeunload', this.onUnload)
  }

  render() {
    // Not render until reload
    if (!this.block) {
      return false
    } else {
      const { contractStore } = this.props
      const status =
        (contractStore && contractStore.downloadStatus === DOWNLOAD_STATUS.SUCCESS) || localStorage.length > 0

      return (
        <div>
          <section className="lo-MenuBarAndContent">
            <StepNavigation activeStepTitle={CROWDSALE_STRATEGY} />
            <div className="st-StepContent">
              <SectionInfo
                description="Select a strategy for your crowdsale contract."
                stepNumber="1"
                title={CROWDSALE_STRATEGY}
              />
              <div className="sw-RadioItems">
                {strategies.map((strategy, i) => {
                  return (
                    <StrategyItem
                      handleChange={this.handleChange}
                      key={i}
                      stragegyDisplayDescription={strategy.description}
                      strategy={this.state.strategy}
                      strategyDisplayTitle={strategy.display}
                      strategyType={strategy.type}
                    />
                  )
                })}
              </div>
              <div className="st-StepContent_Buttons">
                <ButtonContinue disabled={!status} onClick={() => this.goNextStep()} />
              </div>
            </div>
          </section>
        </div>
      )
    }
  }
}
