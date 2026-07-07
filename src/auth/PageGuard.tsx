import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { buildFrontendPermissionMap, type FrontendPermissionKey } from './permissions'

type PageGuardMode = 'redirect' | 'hide'

export type PagePermissionRule = {
  permission: FrontendPermissionKey
  mode?: PageGuardMode
}

const defaultUnauthorizedPath = '/unauthorized'

export function PageGuard({
  children,
  rule,
  unauthorizedPath = defaultUnauthorizedPath,
}: {
  children: React.ReactNode
  rule: PagePermissionRule
  unauthorizedPath?: string
}) {
  const { user, businessConfig, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />

  // IMPORTANT: UI permission map is derived from frontend payload.
  // If subscriptionStatus/isActive are not available in user payload yet,
  // the guard remains role+businessType based.
  const permissionMap = buildFrontendPermissionMap({
    role: user.role,
    businessType: businessConfig.type,
    subscriptionStatus: (user as any).subscriptionStatus,
    isActive: (user as any).isActive,
  })

  const allowed = !!permissionMap[rule.permission]

  if (!allowed) {
    if (rule.mode === 'hide') {
      return null
    }
    return <Navigate to={unauthorizedPath} replace />
  }

  return <>{children}</>
}

