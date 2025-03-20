import React from 'react'

import { CJDropshippingIcon } from './cj-dropshipping'
import { StripeIcon } from './stripe'

const icons = {
  cj: CJDropshippingIcon,
  stripe: StripeIcon,
}

type IconName = keyof typeof icons

export const Icon = ({ name, size = 40 }: { name: IconName; size?: number }) => {
  const IconComponent = icons[name]
  if (!IconComponent) {
    return null
  }

  return <IconComponent size={40} />
}
