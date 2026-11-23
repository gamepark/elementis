import { RuleId } from '@gamepark/elementis/rules/RuleId'
import { ComponentType } from 'react'
import { ApplyPowerHeader } from './ApplyPowerHeader'
import { FlipCardHeader } from './FlipCardHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.FlipCard]: FlipCardHeader,
  [RuleId.ApplyPower]: ApplyPowerHeader
}
