import React from 'react'
import '../../assets/stylesheets/application.css';
import { checkWeb3 } from '../../utils/blockchainHelpers';
import { Link } from 'react-router-dom';
import { defaultState } from '../../utils/constants';
import { setFlatFileContentToState } from '../../utils/utils';
import { getOldState } from '../../utils/utils';
import { StepNavigation } from '../Common/StepNavigation';
import { NAVIGATION_STEPS, CONTRACT_TYPES } from '../../utils/constants';
import { inject, observer } from 'mobx-react';
const { CROWDSALE_CONTRACT } = NAVIGATION_STEPS;

@inject('contractStore') @observer
export class stepOne extends React.Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0);
    let oldState = getOldState(props, defaultState)
    this.state = Object.assign({}, oldState)
  }

  getStandardCrowdsaleAssets() {
    this.getCrowdsaleAsset("CrowdsaleStandard", "crowdsale")
    this.getCrowdsaleAsset("CrowdsaleStandardToken", "token")
  }

  getWhiteListWithCapCrowdsaleAssets() {
    this.getCrowdsaleAsset("SafeMathLibExt", "safeMathLib")
    this.getCrowdsaleAsset("CrowdsaleWhiteListWithCap", "crowdsale")
    this.getCrowdsaleAsset("CrowdsaleWhiteListWithCapToken", "token")
    this.getCrowdsaleAsset("CrowdsaleWhiteListWithCapPricingStrategy", "pricingStrategy")
    this.getCrowdsaleAsset("CrowdsaleWhiteListWithCapPricingStrategy", "pricingStrategy")
    //this.getCrowdsaleAsset("TokenTransferProxy", "tokenTransferProxy")
    //this.getCrowdsaleAsset("MultiSig", "multisig")
    this.getCrowdsaleAsset("FinalizeAgent", "finalizeAgent")
    this.getCrowdsaleAsset("NullFinalizeAgent", "nullFinalizeAgent")  
  }

  getCrowdsaleAsset(contractName, stateProp) {
    console.log(contractName, stateProp);
    let src, bin, abi;
    let assetsCount = 3;
    let assetsIterator = 0;

    setFlatFileContentToState("./contracts/" + contractName + "_flat.sol", (_content) => {
      src = _content;
      assetsIterator++;

      if (assetsIterator === assetsCount) {
        this.addContractsToState(src, bin, abi, stateProp);
      }
    });
    setFlatFileContentToState("./contracts/" + contractName + "_flat.bin", (_bin) => {
      bin = _bin;
      assetsIterator++;

      if (assetsIterator === assetsCount) {
        this.addContractsToState(src, bin, abi, stateProp);
      }
    });
    setFlatFileContentToState("./contracts/" + contractName + "_flat.abi", (_abi) => {
      abi = _abi;
      assetsIterator++;

      if (assetsIterator === assetsCount) {
        this.addContractsToState(src, bin, abi, stateProp);
      }
    });
  }

  addContractsToState(src, bin, abi, contract) {
    this.props.contractStore.setContract(contract, {
      src,
      bin,
      abi: JSON.parse(abi),
      addr: (contract==="crowdsale" || contract==="pricingStrategy" || contract==="finalizeAgent")?[]:"",
      abiConstructor: (contract==="crowdsale" || contract==="pricingStrategy" || contract==="finalizeAgent")?[]:""
    });
  }

  contractTypeSelected(e) {
    this.props.contractStore.setContractType(e.currentTarget.id);
    console.log(e.currentTarget.id);
    switch (e.currentTarget.id) {
      case CONTRACT_TYPES.standard: 
        this.getStandardCrowdsaleAssets();
        break;
      case CONTRACT_TYPES.whitelistwithcap: 
        this.getWhiteListWithCapCrowdsaleAssets();
         break;
      default:
        break;
    }
  }

  componentDidMount() {
    checkWeb3(this.state.web3);

    switch (this.props.contractStore.contractType) {
      case CONTRACT_TYPES.standard:
        this.getStandardCrowdsaleAssets();
        break;
      case CONTRACT_TYPES.whitelistwithcap: 
        this.getWhiteListWithCapCrowdsaleAssets();
        break;
      default:
        break;
    }
  }

  render() {
    return (
    	 <section className="steps steps_crowdsale-contract">
       <StepNavigation activeStep={CROWDSALE_CONTRACT}/>
        <div className="steps-content container">
          <div className="about-step">
            <div className="step-icons step-icons_crowdsale-contract"></div>
            <p className="title">Crowdsale Contract</p>
            <p className="description">
              Select a strategy for your crowdsale contract. 
            </p>
          </div>
          <div className="radios">
            {/*<label className="radio">
              <input 
                type="radio" 
                checked={this.state.contractType === this.state.contractTypes.standard}            
                name="contract-type"
                id={this.state.contractTypes.standard}
                onChange={(e) => this.contractTypeSelected(e)}
              />
              <span className="title">Standard</span>
              <span className="description">
                Basic crowdsale strategy with one tier. Good for educational use. 
              </span>
            </label>*/}
            <label className="radio">
              <input 
                type="radio" 
                checked={this.props.contractStore.contractType === CONTRACT_TYPES.whitelistwithcap}    
                name="contract-type"
                id={CONTRACT_TYPES.whitelistwithcap}
                onChange={(e) => this.contractTypeSelected(e)}
              />
              <span className="title">Whitelist with Cap</span>
              <span className="description">
                Modern crowdsale strategy with multiple tiers, whitelists, and limits. Recommended for every crowdsale. 
              </span>
            </label>
          </div>
        </div>
        <div className="button-container">
          <Link to='/2'>
            <a className="button button_fill">Continue</a>
          </Link>
        </div>
      </section>
    )
  }
}
