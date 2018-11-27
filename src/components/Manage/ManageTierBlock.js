import React from 'react'
import { CrowdsaleEndTime } from './../Common/CrowdsaleEndTime'
import { CrowdsaleRate } from './../Common/CrowdsaleRate'
import { CrowdsaleStartTime } from './../Common/CrowdsaleStartTime'
import { Supply } from './../Common/Supply'
import { TEXT_FIELDS } from '../../utils/constants'
import {
  composeValidators,
  isDateLaterThan,
  isDecimalPlacesNotGreaterThan,
  isLessOrEqualThan,
  isNonNegative
} from '../../utils/validations'
import { Field } from 'react-final-form'
import { InputField2 } from '../Common/InputField2'
import { ReadOnlyWhitelistAddresses } from './ReadOnlyWhitelistAddresses'
import { WhitelistInputBlock } from '../Common/WhitelistInputBlock'
import { inject, observer } from 'mobx-react'

const dateToTimestamp = date => new Date(date).getTime()

export const ManageTierBlock = inject('crowdsaleStore', 'tokenStore')(
  observer(({ fields, canEditTiers, crowdsaleStore, tokenStore, aboutTier, ...props }) => (
    <div className="mng-ManageTierBlock">
      {fields.map((name, index) => {
        const currentTier = fields.value[index]
        const { tier } = currentTier
        let {
          startTime: initialStartTime,
          endTime: initialEndTime,
          whitelistEnabled,
          updatable,
          supply
        } = fields.initial[index]

        // initialStartTime and initialEndTime already converted to local timezone
        const tierHasStarted = !isDateLaterThan()(dateToTimestamp(initialStartTime))(Date.now())
        const tierHasEnded = !isDateLaterThan()(dateToTimestamp(initialEndTime))(Date.now())
        const canEditDuration = canEditTiers && updatable && !tierHasEnded && !tierHasStarted
        const canEditWhiteList = canEditTiers && !tierHasEnded
        const isWhitelistEnabled = whitelistEnabled === 'yes'
        const canEditMinCap = !isWhitelistEnabled && canEditTiers && updatable && !tierHasEnded

        return (
          <div className="mng-ManageTierBlock_Content" key={index}>
            <h3 className="mng-ManageTierBlock_Title">Tier Name: {tier}</h3>
            <div className="mng-ManageTierBlock_ItemsContainer">
              <div className="mng-ManageTierBlock_Item">
                <CrowdsaleStartTime disabled={true} index={index} name={`${name}.startTime`} readOnly={true} />
              </div>
              <div className="mng-ManageTierBlock_Item">
                <CrowdsaleEndTime
                  name={`${name}.endTime`}
                  index={index}
                  disabled={!canEditDuration}
                  readOnly={!canEditDuration}
                />
              </div>
              <div className="mng-ManageTierBlock_Item">
                <CrowdsaleRate name={`${name}.rate`} disabled={true} readOnly={true} />
              </div>
              <div className="mng-ManageTierBlock_Item">
                <Supply name={`${name}.supply`} disabled={true} readOnly={true} />
              </div>
              <div className="mng-ManageTierBlock_Item">
                <Field
                  component={InputField2}
                  disabled={!canEditMinCap}
                  label={TEXT_FIELDS.MIN_CAP}
                  name={`${name}.minCap`}
                  readOnly={!canEditMinCap}
                  type="number"
                  validate={composeValidators(
                    isNonNegative(),
                    isDecimalPlacesNotGreaterThan()(tokenStore.decimals),
                    isLessOrEqualThan(`Should be less than or equal to ${supply}`)(supply)
                  )}
                />
              </div>
            </div>
            {/* TODO: title should be included in read only whitelist too */}
            {isWhitelistEnabled ? (
              canEditWhiteList ? (
                <WhitelistInputBlock key={index.toString()} num={index} decimals={tokenStore.decimals} />
              ) : (
                <ReadOnlyWhitelistAddresses tier={currentTier} />
              )
            ) : null}
          </div>
        )
      })}
    </div>
  ))
)
