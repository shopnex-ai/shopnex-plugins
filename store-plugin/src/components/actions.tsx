import type { ServerComponentProps } from 'payload'

import { Button, ChevronIcon, DocumentControls, Hamburger, Popup, PopupList } from '@payloadcms/ui'
import React from 'react'

const limits = [1, 2, 3, 4, 5]
const limitToUse = 3

const close = () => {
  console.log('Popup closed')
}

const handleChange = (limitNumber: number) => {
  console.log(`Limit changed to ${limitNumber}`)
}

export const Actions = (props: ServerComponentProps) => {
  return (
    <Button
      buttonStyle="secondary"
      id="change-password"
      size="medium"
    >
      Change Password
    </Button>
  )
}

export default Actions
