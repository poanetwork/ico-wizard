import React from 'react'
import Adapter from 'enzyme-adapter-react-15'
import { configure, mount, shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router'
import { StepOne } from '../../../src/components/StepOne/index'
import {
  web3Store,
  generalStore,
  contractStore,
  crowdsaleStore,
  gasPriceStore,
  deploymentStore,
  reservedTokenStore,
  stepTwoValidationStore,
  tierStore,
  tokenStore
} from '../../../src/stores'
import { CROWDSALE_STRATEGIES } from '../../../src/utils/constants'
import GasPriceInput from '../../../src/components/StepThree/GasPriceInput'

configure({ adapter: new Adapter() })

describe('StepOne', () => {
  const history = { push: jest.fn() }
  const stores = {
    web3Store,
    generalStore,
    contractStore,
    crowdsaleStore,
    gasPriceStore,
    deploymentStore,
    reservedTokenStore,
    stepTwoValidationStore,
    tierStore,
    tokenStore
  }
  const { MINTED_CAPPED_CROWDSALE, DUTCH_AUCTION } = CROWDSALE_STRATEGIES

  it(`should render StepOne screen`, () => {
    // Given
    const component = renderer.create(
      <MemoryRouter initialEntries={['/']}>
        <StepOne {...stores} />
      </MemoryRouter>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })

  it(`should navigate to StepTwo`, () => {
    // Given
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <StepOne {...stores} history={history} />
      </MemoryRouter>
    )
    const stepOneComponent = wrapper.find('StepOne')
    const navigateToHandler = jest.spyOn(stepOneComponent.instance(), 'goNextStep')
    wrapper.update()

    // When
    stepOneComponent.find('.sw-ButtonContinue').simulate('click')

    // Then
    expect(navigateToHandler).toHaveBeenCalledTimes(1)
    expect(navigateToHandler).toHaveBeenCalledWith()
  })

  it(`should switch to DutchAuction Strategy`, () => {
    // Given
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <StepOne {...stores} history={history} />
      </MemoryRouter>
    )
    const stepOneComponent = wrapper.find('StepOne')

    // When
    stepOneComponent
      .find('input[name="contract-type"]')
      .at(1)
      .simulate('change', { target: { value: DUTCH_AUCTION } })

    // Then
    expect(stepOneComponent.instance().state.strategy).toBe(DUTCH_AUCTION)
  })

  it(`should switch to MintedCapped Strategy`, () => {
    // Given
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <StepOne {...stores} history={history} />
      </MemoryRouter>
    )
    const stepOneComponent = wrapper.find('StepOne')

    // When
    const contractTypeInputs = stepOneComponent.find('input[name="contract-type"]')
    contractTypeInputs.at(1).simulate('change', { target: { value: DUTCH_AUCTION } })
    contractTypeInputs.at(0).simulate('change', { target: { value: MINTED_CAPPED_CROWDSALE } })

    // Then
    expect(stepOneComponent.instance().state.strategy).toBe(MINTED_CAPPED_CROWDSALE)
  })

  it(`should render StepOne screen and test load method`, async () => {
    // Given
    const wrapper = shallow(<StepOne {...stores} />)
    // When
    const result = await wrapper
      .dive()
      .instance()
      .load()
    // Then
    expect(result).toEqual({ strategy: 'white-list-with-cap' })
  })

  it(`should render StepOne screen and test load method with clearStorage`, async () => {
    // Given
    global.localStorage.clearStorage = true
    const wrapper = shallow(<StepOne {...stores} />)
    // When
    const result = await wrapper
      .dive()
      .instance()
      .load()
    // Then
    setTimeout(() => {
      expect(result).toEqual({ strategy: 'white-list-with-cap' })
    }, 2000)
  })

  it(`should render StepOne screen and test reload`, async () => {
    // Given
    global.localStorage.reload = true
    global.location = jest.fn()
    global.location.assign = jest.fn()
    const wrapper = mount(<StepOne {...stores} />)

    // When
    setTimeout(() => {
      // Then
      expect(global.localStorage.reload).toBe(undefined)
      expect(global.localStorage.clearStorage).toBeTruthy()
    }, 2000)
  })

  it(`should render StepOne screen and test beforeUnloadSpy`, async () => {
    const wrapper = mount(<StepOne {...stores} />)
    window.location.reload()
    setTimeout(() => {
      expect(global.localStorage.reload).toBe(undefined)
    }, 2000)
  })
})
