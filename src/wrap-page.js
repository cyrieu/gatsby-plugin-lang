import React from "react"
import browserLang from "browser-lang"
import { withPrefix } from "gatsby"
import { IntlContextProvider } from "./intl-context"
import { LangProvider } from "react-langapi"

const preferDefault = m => (m && m.default) || m

// const getLocaleData = locale => {
//   try {
//     const localeData = require(`react-intl/locale-data/${locale}`)

//     return localeData
//   } catch (e) {
//     return false
//   }
// }

// const addLocaleDataForGatsby = language => {
//   const locale = language.split("-")[0]
//   const localeData = getLocaleData(locale)

//   if (!localeData) {
//     throw new Error(`Cannot find react-intl/locale-data/${language}`)
//   }

//   addLocaleData(...localeData)
// }

const withIntlProvider = intl => children => {
  // addLocaleDataForGatsby(intl.language)

  const { client } = intl
  client.setForceLanguage(intl.language)
  return (
    <LangProvider client={client} currentLanguage={intl.language}>
      <IntlContextProvider value={intl}>{children}</IntlContextProvider>
    </LangProvider>
  )
}

export default ({ element, props }) => {
  if (!props) {
    return
  }

  const { pageContext, location } = props
  const { intl } = pageContext
  const { language, languages, redirect, routed, allSitePage, messages } = intl

  // Create langapi-client
  const client = require("langapi-client")(
    "sk_prod_test", // TODO pass it in as part of config
    messages
  )

  if (typeof window !== "undefined") {
    window.___gatsbyIntl = intl
  }
  /* eslint-disable no-undef */
  const isRedirect = redirect && !routed

  if (isRedirect) {
    const { pathname, search } = location

    // Skip build, Browsers only
    if (typeof window !== "undefined") {
      let detected =
        window.localStorage.getItem("gatsby-intl-language") ||
        browserLang({
          languages,
          fallback: language,
        })

      if (!languages.includes(detected)) {
        detected = language
      }

      const queryParams = search || ""
      const newUrl = withPrefix(`/${detected}${pathname}${queryParams}`)
      window.localStorage.setItem("gatsby-intl-language", detected)

      if (allSitePage.includes(newUrl)) {
        window.location.replace(newUrl)
      } else {
        // TODO: better 404 handler instead of redirect
        window.location.replace(withPrefix(`/${detected}/404`))
      }
    }
  }
  const renderElement = isRedirect
    ? GATSBY_INTL_REDIRECT_COMPONENT_PATH &&
      React.createElement(
        preferDefault(require(GATSBY_INTL_REDIRECT_COMPONENT_PATH))
      )
    : element
  return withIntlProvider({ ...intl, client })(renderElement)
}
