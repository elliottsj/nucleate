import React from 'react'
import Link from 'react-router'

export default function redirect (destPath) {
  function RedirectPage () {
    return (
      <span>
        <Link to={destPath}>Moved to {destPath}</Link>
      </span>
    )
  }

  RedirectPage.displayName = `RedirectPage('${destPath}')`
  RedirectPage.redirectPath = destPath
  return RedirectPage
}
