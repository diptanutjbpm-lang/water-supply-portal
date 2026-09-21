/*
 * ==========================================================
 * TJB WATER SUPPLY PORTAL
 * API CLIENT
 * ==========================================================
 *
 * Browser direct Apps Script URL ko call nahi karega.
 *
 * Browser:
 *   /tjb-api
 *
 * Vite server:
 *   ↓
 *
 * Google Apps Script:
 *   https://script.google.com/macros/s/.../exec
 *
 * This avoids browser-side CORS problems during development.
 * ==========================================================
 */


const API_URL =
  import.meta.env.DEV
    ? '/tjb-api'
    : String(
        import.meta.env.VITE_API_URL || ''
      ).trim()


/**
 * Small delay helper used only
 * if demo mode is ever required.
 */
const sleep =
  (ms) =>
    new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    )


/**
 * ==========================================================
 * MAIN API REQUEST
 * ==========================================================
 */

export async function apiRequest(
  action,
  data = {}
) {

  try {

    // --------------------------------------------------------
    // VALIDATE ACTION
    // --------------------------------------------------------

    if (
      typeof action !== 'string' ||
      !action.trim()
    ) {

      console.error(
        'Invalid API action supplied:',
        action
      )

      throw new Error(
        'Invalid API action. apiRequest must be called as apiRequest("actionName", data).'
      )
    }


    const cleanAction =
      action.trim()

if (!API_URL) {
  throw new Error(
    'Production API URL is not configured.'
  )
}
    const response =
      await fetch(
        API_URL,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'text/plain;charset=utf-8'
          },

          body:
            JSON.stringify({
              action:
                cleanAction,

              ...data
            })
        }
      )


    if (!response.ok) {

      throw new Error(
        `API request failed (${response.status})`
      )
    }


    const responseText =
      await response.text()


    if (!responseText) {

      throw new Error(
        'Server returned an empty response.'
      )
    }


    let result


    try {

      result =
        JSON.parse(
          responseText
        )

    } catch {

      console.error(
        'Non-JSON backend response:',
        responseText
      )

      throw new Error(
        'Invalid response received from server.'
      )
    }


    return result


  } catch (error) {

    console.error(
      'TJB API ERROR:',
      error
    )

    throw error
  }
}


/**
 * We are now using the real backend.
 */
export const isDemoMode =
  false