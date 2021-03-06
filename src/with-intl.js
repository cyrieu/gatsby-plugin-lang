import React from "react"
import { injectIntl } from "react-langapi"

export default Component => props => {
  console.warn("withIntl is deprecated. Please use injectIntl instead.")
  return React.createElement(injectIntl(Component), props)
}
