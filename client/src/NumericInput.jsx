import React from 'react'
import { Input } from './Input'
// import './Input.css'

/**
 * An numeric input component where the user can enter a number.
 * @param {Object} props 
 */
export function NumericInput(props) {

  let regex
  if (props.positive) {
    if (props.integer) {
      regex = /^[0-9]+$/
    } else {
      regex = /^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
    }
  } else {
    if (props.integer) {
      regex = /^[+-]?[0-9]+$/
    } else {
      regex = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
    }
  }

  function parse(str) {
    if (regex.test(str)) {
      let value = parseFloat(str)
      if (props.positive && !(value > 0)) throw new Error()
      if (props.nonNegative && !(value >= 0)) throw new Error()
      return parseFloat(str)
    } else {
      throw new Error()
    }
  }

  return (
    <Input
      value={props.value}
      title={props.title}
      label={props.label}
      parse={parse}
      className={props.className}
      disabled={props.disabled}
      onChange={props.onChange}
      onReset={props.onReset}
      size={props.size}
      errorClassName='input-error'
      error={props.error}
    />
  )

}