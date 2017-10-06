import { observable, action } from 'mobx';

class StepThreeValidationStore {

  @observable name;
	@observable walletAddress;
	@observable rate;
	@observable supply;
	@observable startTime;
	@observable endTime;
	@observable updatable;

	constructor() {
		this.name = 'EMPTY'
		this.walletAddress = 'EMPTY'
		this.rate = 'EMPTY'
		this.supply = 'EMPTY'
		this.startTime = 'VALIDATED'
		this.endTime = 'VALIDATED'
		this.updatable = "VALIDATED"
	}

	@action property = (property, value) => {
		this[property] = value
	}

}

const stepThreeValidationStore = new StepThreeValidationStore();

export default stepThreeValidationStore;
export { StepThreeValidationStore };
