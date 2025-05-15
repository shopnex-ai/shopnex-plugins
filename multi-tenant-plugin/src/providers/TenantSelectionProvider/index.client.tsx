'use client'

import type { OptionObject } from 'payload'

import { useAuth } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { createContext } from 'react'

type ContextType = {
  /**
   * Array of options to select from
   */
  options: OptionObject[]
  /**
   * The currently selected tenant ID
   */
  selectedTenantID: number | string | undefined

  selectedTenantSlug: string | undefined
  /**
   * Prevents a refresh when the tenant is changed
   *
   * If not switching tenants while viewing a "global", set to true
   */
  setPreventRefreshOnChange: React.Dispatch<React.SetStateAction<boolean>>
  /**
   * Sets the selected tenant ID
   *
   * @param args.id - The ID of the tenant to select
   * @param args.refresh - Whether to refresh the page after changing the tenant
   */
  setTenant: (args: { id: number | string | undefined; refresh?: boolean }) => void
}

const Context = createContext<ContextType>({
  options: [],
  selectedTenantID: undefined,
  selectedTenantSlug: undefined,
  setPreventRefreshOnChange: () => null,
  setTenant: () => null,
})

export const TenantSelectionProviderClient = ({
  children,
  initialValue,
  tenantCookie,
  tenantOptions,
}: {
  children: React.ReactNode
  initialValue?: number | string
  tenantCookie?: string
  tenantOptions: (OptionObject & { slug: string })[]
}) => {
  const [selectedTenantID, setSelectedTenantID] = React.useState<number | string | undefined>(
    initialValue,
  )
  const [preventRefreshOnChange, setPreventRefreshOnChange] = React.useState(false)
  const { user } = useAuth()
  const userID = user?.id
  const stableTenantOptions = React.useMemo(() => tenantOptions, [])
  const selectedTenantLabel = React.useMemo(
    () => stableTenantOptions.find((option) => option.value == selectedTenantID)?.label,
    [selectedTenantID, stableTenantOptions],
  )

  const selectedTenantSlug = React.useMemo(
    () => stableTenantOptions.find((option) => option.value == selectedTenantID)?.slug,
    [selectedTenantID, stableTenantOptions],
  )

  const router = useRouter()

  const setCookie = React.useCallback((value?: string) => {
    const expires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
    document.cookie = 'payload-tenant=' + (value || '') + expires + '; path=/'
  }, [])

  const deleteCookie = React.useCallback(() => {
    document.cookie = 'payload-tenant=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }, [])

  const setTenant = React.useCallback<ContextType['setTenant']>(
    ({ id, refresh }) => {
      if (id === selectedTenantID) return // Early return if same ID

      // Check if the new ID exists in options before setting
      if (id && !tenantOptions.find((opt) => opt.value === id)) {
        console.log('Attempted to set invalid tenant ID')
        return
      }

      if (id === undefined) {
        if (tenantOptions.length > 1) {
          setSelectedTenantID(undefined)
          deleteCookie()
        } else {
          setSelectedTenantID(tenantOptions[0]?.value)
          setCookie(String(tenantOptions[0]?.value))
        }
      } else {
        setSelectedTenantID(id)
        setCookie(String(id))
      }

      // Maybe add a slight delay before refresh
      if (!preventRefreshOnChange && refresh) {
        setTimeout(() => router.refresh(), 100)
      }
    },
    [deleteCookie, preventRefreshOnChange, router, setCookie, tenantOptions, selectedTenantID],
  )

  React.useEffect(() => {
    console.log('[useEffect: selectedTenantID/tenantOptions] fired')
    console.log('→ selectedTenantID:', selectedTenantID)
    console.log('→ tenantOptions:', stableTenantOptions)

    const tenantExists = stableTenantOptions.find((option) => option.value == selectedTenantID)

    if (selectedTenantID && !tenantExists) {
      console.log('⚠️ Tenant not found in options. Resetting tenant.')
      if (stableTenantOptions?.[0]?.value) {
        console.log('→ Setting to first tenant:', stableTenantOptions[0].value)
        setTenant({ id: stableTenantOptions[0].value, refresh: false })
      } else {
        console.log('→ No tenant available, clearing selection')
        setTenant({ id: undefined, refresh: false })
      }
    }
  }, [selectedTenantID, stableTenantOptions])

  React.useEffect(() => {
    console.log('[useEffect: userID/tenantCookie/initialValue] fired')
    console.log('→ userID:', userID, 'tenantCookie:', tenantCookie, 'initialValue:', initialValue)

    if (userID && !tenantCookie) {
      console.log('✅ Setting cookie for initialValue:', initialValue)
      setSelectedTenantID(initialValue)
      if (initialValue) {
        setCookie(String(initialValue))
      } else {
        deleteCookie()
      }
    }
  }, [userID, tenantCookie, initialValue, setCookie, deleteCookie, router])

  const prevUserIDRef = React.useRef<string | number | undefined>(undefined)

  React.useEffect(() => {
    console.log('[useEffect: userID change + cookie check] fired')
    console.log('→ userID:', userID, 'prevUserID:', prevUserIDRef.current)
    console.log('→ tenantCookie:', tenantCookie)

    if (!userID && tenantCookie) {
      console.log('⚠️ Logged out user with tenantCookie → clearing')
      deleteCookie()
      setSelectedTenantID(undefined)
    } else if (userID && prevUserIDRef.current !== userID) {
      console.log('🔄 User ID changed → refreshing')
      router.refresh()
    }

    prevUserIDRef.current = userID
  }, [userID, tenantCookie, deleteCookie, router])

  return (
    <span
      data-selected-tenant-id={selectedTenantID}
      data-selected-tenant-title={selectedTenantLabel}
    >
      <Context.Provider
        value={{
          options: tenantOptions,
          selectedTenantID,
          selectedTenantSlug,
          setPreventRefreshOnChange,
          setTenant,
        }}
      >
        {children}
      </Context.Provider>
    </span>
  )
}

export const useTenantSelection = () => React.use(Context)
