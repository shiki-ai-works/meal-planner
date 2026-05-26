export const USER_DATA_DELETE_CONFIRMATION = '削除'
export const USER_DATA_DELETE_CONFIRMATION_HEADER =
  'x-meal-planner-delete-confirmation'
export const USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE = 'delete-confirmed'
export const USER_DATA_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
}

export function hasUserDataDeleteConfirmation(headers: Headers) {
  return (
    headers.get(USER_DATA_DELETE_CONFIRMATION_HEADER)?.trim() ===
    USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE
  )
}
