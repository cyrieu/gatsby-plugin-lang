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

  const { client, translationsPath } = intl
  client.setForceLanguage(intl.language)
  return (
    <LangProvider
      client={client}
      currentLanguage={intl.language}
      path={translationsPath}
    >
      <IntlContextProvider value={intl}>{children}</IntlContextProvider>
    </LangProvider>
  )
}

export default ({ element, props }, pluginOptions) => {
  if (!props) {
    return
  }

  const { pageContext, location } = props
  const { intl } = pageContext
  const {
    language,
    languages,
    redirect,
    routed,
    allSitePage,
    messages,
    defaultLanguage,
  } = intl

  // Create langapi-client for SSR
  const client = require("langapi-client")(
    "sk_prod_test", // TODO pass it in as part of config when we start using the API_KEY
    messages
  )

  if (typeof window !== "undefined") {
    window.___gatsbyIntl = intl
  }

  let detected = browserLang({
    languages,
    fallback: language,
  })

  const isDefaultLanguage = detected === defaultLanguage

  /* eslint-disable no-undef */
  const isRedirect = redirect && !routed && !isDefaultLanguage

  if (isRedirect) {
    const { pathname, search } = location

    // Skip build, Browsers only
    if (typeof window !== "undefined") {
      let detected = browserLang({
        languages,
        fallback: language,
      })

      if (!languages.includes(detected)) {
        detected = language
      }

      const queryParams = search || ""
      const newUrl = withPrefix(`/${detected}${pathname}${queryParams}`)

      if (allSitePage.includes(newUrl)) {
        window.location.replace(newUrl)
      } else {
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
