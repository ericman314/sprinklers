import React, { useEffect } from 'react'


/**
 * An Input component where the user can enter a string or other value. When the input is blurred, the value will be parsed using a provided parse function, then the props.onChange handler will be called with the parsed and original values (unless the parsing failed). When the input is focused, the original value entered by the user will be displayed.
 * @param {Object} props 
 */
export function Input(props) {

  const [value, setValue] = React.useState(props.value)
  const [originalValue, setOriginalValue] = React.useState(props.value)
  const [error, setError] = React.useState(false)

  // Set default parse function if none is given
  const parse = props.parse ?? ((x) => x)

  /**
   * When the user enters text into the input field, set the displayed value and original value.
   * @param {Event} evt 
   */
  function handleValueChange(evt) {
    setValue(evt.target.value)
    setOriginalValue(evt.target.value)
  }

  /**
   * On focus, the original value entered by the user will be displayed
   * @param {*} evt 
   */
  function handleFocus(evt) {
    setValue(originalValue)
    setError(false)
  }

  /**
   * When blurred, the value entered by the user will displayed and props.onChange will be called with the parsed value.
   * @param {Event} evt 
   */
  function handleBlur(evt) {
    let parsed = null
    try {
      parsed = parse(value)
      setValue(parsed)
      props.onChange(evt, parsed, value)
    } catch (ex) {
      if (value) {
        setError(true)
      }
    }
  }

  function handleKeyPress(evt) {
    setError(false)
    if (evt.key === 'Enter') {
      handleBlur(evt)
    }
  }

  /**
   * Update value if props.value changes--but only if the parsed values are different
   */
  useEffect(() => {
    let parsed1, parsed2
    try {
      parsed1 = parse(props.value)
      parsed2 = parse(value)
      if (parsed1 !== parsed2) throw new Error()
    } catch (ex) {
      // Parsing failed or the parsed values differ
      setError(false)
      setValue(props.value)
      setOriginalValue(props.value)
    }
  }, [props.value])




  return (
    <input
      type='text'
      title={props.title}
      size={props.size}
      value={value}
      placeholder={props.placeholder}
      disabled={props.disabled}
      className={`${props.className}${error ? ' ' + props.errorClassName : ''}`}
      onChange={handleValueChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyPress={handleKeyPress}
      data-lpignore="true"
    />
  )

}