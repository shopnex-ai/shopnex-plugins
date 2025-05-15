import type { OptionObject, Payload, User } from 'payload'

import { cookies as getCookies } from 'next/headers'

import { findTenantOptions } from '../../queries/findTenantOptions'
import { TenantSelectionProviderClient } from './index.client'

type Args = {
  children: React.ReactNode
  payload: Payload
  tenantsCollectionSlug: string
  useAsTitle: string
  user: User
}

export const TenantSelectionProvider = async ({
  children,
  payload,
  tenantsCollectionSlug,
  useAsTitle,
  user,
}: Args) => {
  console.log('🚀 [TenantSelectionProvider] invoked')
  console.log('→ user ID:', user?.id)

  let tenantOptions: (OptionObject & { slug: string })[] = []

  try {
    const { docs } = await findTenantOptions({
      limit: 0,
      payload,
      tenantsCollectionSlug,
      useAsTitle,
      user,
    })
    tenantOptions = docs.map((doc) => ({
      label: String(doc[useAsTitle]),
      slug: String(doc.handle),
      value: doc.id,
    }))
  } catch (err) {
    console.error('❌ Failed to fetch tenant options:', err)
  }

  const cookies = await getCookies()
  let tenantCookie = cookies.get('payload-tenant')?.value
  let initialValue: string | undefined = undefined

  console.log('→ cookie value:', tenantCookie)

  if (tenantCookie) {
    const matchingOption = tenantOptions.find((option) => String(option.value) === tenantCookie)
    if (matchingOption) {
      initialValue = matchingOption.value
      console.log('✅ Valid tenant cookie matched:', initialValue)
    } else {
      console.warn('⚠️ Invalid tenant cookie, no match found.')
    }
  }

  if (!initialValue) {
    tenantCookie = undefined
    initialValue = tenantOptions.length > 1 ? undefined : tenantOptions[0]?.value
    console.log('🛠️ Computed initialValue:', initialValue)
  }

  console.log('🧠 Passing props to client provider:', {
    initialValue,
    tenantCookie,
    tenantOptions,
  })

  return (
    <TenantSelectionProviderClient
      initialValue={initialValue}
      tenantCookie={tenantCookie}
      tenantOptions={tenantOptions}
    >
      {children}
    </TenantSelectionProviderClient>
  )
}
