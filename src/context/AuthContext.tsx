import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import { type User, type UserRole } from '../types/restaurant' // À renommer en general.ts plus tard
import { type BusinessType, type BusinessConfig, BUSINESS_CONFIGS } from './business'
import { authService } from '../pages/auth.service'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  token: string | null
  tenantId: string | null
  tenantName: string | null
  businessConfig: BusinessConfig
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isLoading: boolean
  refreshTenantId: () => Promise<boolean>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [businessType, setBusinessType] = useState<BusinessType>('RESTAURANT') // Default
  const [isLoading, setIsLoading] = useState(true)


  /**
   * Rafraîchit le tenantId depuis le profil utilisateur
   */
  const refreshTenantId = useCallback(async (): Promise<boolean> => {
    try {
      // Vérifier si on a un token
      const currentToken = localStorage.getItem('accessToken')
      if (!currentToken) {
        console.warn('Pas de token disponible pour rafraîchir tenantId')
        return false
      }

      const profile = await authService.getProfile()
      if (profile) {
        const newTenantId = profile?.branchId || 
                           profile?.establishmentId || 
                           profile?.tenant?.id ||
                           profile?.tenantId
        const newTenantName = profile?.tenant?.name || profile?.establishment?.name
        const type = profile?.tenant?.businessType || profile?.businessType || 'RESTAURANT'
        
        if (newTenantId) {
          // Mettre à jour dans authService et localStorage
          authService.setTenantId(newTenantId)
          setTenantId(newTenantId)
          setBusinessType(type)
          
          // Mise à jour fonctionnelle pour stabiliser le callback
          setUser(prevUser => {
            if (!prevUser) return null
            // Éviter une mise à jour d'état si le tenantId est déjà le bon
            if (prevUser.tenantId === newTenantId) return prevUser
            
            const updatedUser: User = {
              ...prevUser,
              tenantId: newTenantId,
            }
            localStorage.setItem('auth_user', JSON.stringify(updatedUser))
            return updatedUser
          })

          if (newTenantName) {
            setTenantName(newTenantName)
            localStorage.setItem('tenant_name', newTenantName)
          }
          
          console.log('✅ TenantId rafraîchi avec succès:', newTenantId)
          return true
        }
      }
      
      console.warn('⚠️ Aucun tenantId trouvé dans le profil')
      return false
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du tenantId:', error)
      return false
    }
  }, []) // Dépendances vides = référence stable à vie

  /**
   * Décode et retourne le contenu du JWT
   */
  const decodeToken = useCallback((t: string | null) => {
    if (!t || !t.includes('.')) return null
    try {
      const base64Url = t.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );

      const payload = JSON.parse(jsonPayload)
      console.log('🔓 [AuthContext] JWT Payload décodé:', payload)
      return payload
    } catch (e) {
      console.warn('⚠️ [AuthContext] Impossible de décoder le JWT')
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('auth_user')
      const storedTenantId = localStorage.getItem('tenantId')
      const storedTenantName = localStorage.getItem('tenant_name')

      if (!storedToken || !storedUser) {
        setIsLoading(false)
        return
      }

      if (storedToken && storedUser) {
        try {
          // Vérifier que le token est toujours valide
          const profile = await authService.getProfile()
          const payload = decodeToken(storedToken)
          if (payload?.businessType) {
            setBusinessType(payload.businessType)
          }
          
          setToken(storedToken)
          
          // Parser et nettoyer l'utilisateur
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser.role) {
            parsedUser.role = parsedUser.role.toLowerCase()
          }
          
          // Récupérer le tenantId (priorité: storedTenantId > profile > user)
          let tenantIdValue = (storedTenantId === 'null' || storedTenantId === 'undefined') 
            ? null 
            : storedTenantId
          
          if (!tenantIdValue) {
            tenantIdValue = payload?.tenantId
          }

          if (!tenantIdValue && profile) {
            // Fallback sur le profil si le JWT n'a pas l'info
            if (!payload?.businessType) {
              setBusinessType(profile.tenant?.businessType || profile.businessType || 'RESTAURANT')
            }
            tenantIdValue = profile.tenantId || 
                           profile.branchId || 
                           profile.establishmentId ||
                           parsedUser.tenantId
            if (tenantIdValue) {
              localStorage.setItem('tenantId', tenantIdValue)
              if (authService.setTenantId) {
                authService.setTenantId(tenantIdValue)
              }
            }
          }
          
          // Mettre à jour le user avec le tenantId
          if (tenantIdValue && !parsedUser.tenantId) {
            parsedUser.tenantId = tenantIdValue
            localStorage.setItem('auth_user', JSON.stringify(parsedUser))
          }
          
          setUser(parsedUser)
          setTenantId(tenantIdValue || null)
          setTenantName(storedTenantName || profile?.tenant?.name || null)
          
          console.log('✅ Auth initialisée:', { 
            user: parsedUser.email, 
            tenantId: tenantIdValue,
            hasToken: !!storedToken 
          })
          
        } catch (error) {
          console.error('❌ Erreur lors de l\'initialisation de l\'auth:', error)
          // Nettoyer les données invalides
          localStorage.removeItem('accessToken')
          localStorage.removeItem('auth_user')
          localStorage.removeItem('tenantId')
          authService.logout?.()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])
  
  /**
   * Vérification périodique que le tenantId est toujours présent
   */
  useEffect(() => {
    if (user && !tenantId && !isLoading) {
      console.warn('⚠️ Utilisateur connecté mais pas de tenantId - tentative de récupération')
      refreshTenantId()
    }
  }, [user, tenantId, isLoading, refreshTenantId])

  /**
   * Connexion
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      console.warn('Email ou mot de passe manquant')
      return false
    }

    try {
      const result = await authService.login({ email, password })
      
      // Vérifier que le login a réussi
      if (!result || !result.accessToken) {
        throw new Error('Login failed: no token received')
      }
      
      // Sauvegarder le token
      setToken(result.accessToken)
      const payload = decodeToken(result.accessToken)
      
      if (payload?.businessType) {
        setBusinessType(payload.businessType)
      }
      
      // Récupérer le tenantId (priorité: authService > JWT > localStorage)
      let tenantIdValue = authService.getCurrentTenantId?.() || payload?.tenantId || localStorage.getItem('tenantId')
      
      // Si toujours pas de tenantId, essayer depuis l'utilisateur
      if (!tenantIdValue && result.user) {
        tenantIdValue = result.user.tenantId || 
                       result.user.branchId || 
                       result.user.establishmentId ||
                       result.user.tenant?.id
      }

      const tenantNameValue = result.user.tenant?.name || 
                             result.user.establishment?.name || 
                             (result as any).tenantName ||
                             localStorage.getItem('tenant_name')
      
      // Sauvegarder le tenantId
      if (tenantIdValue) {
        if (authService.setTenantId) {
          authService.setTenantId(tenantIdValue)
        } else {
          localStorage.setItem('tenantId', tenantIdValue)
        }
        setTenantId(tenantIdValue)
      } else {
        console.warn('⚠️ Aucun tenantId trouvé dans la réponse login')
        // Tenter de récupérer depuis le profil
        await refreshTenantId()
        tenantIdValue = authService.getCurrentTenantId?.() || localStorage.getItem('tenantId')
        if (tenantIdValue) setTenantId(tenantIdValue)
      }

      // Sauvegarder le tenantName
      if (tenantNameValue) {
        setTenantName(tenantNameValue)
        localStorage.setItem('tenant_name', tenantNameValue)
      }

      // Mapper l'utilisateur vers le type frontend
      const mappedUser: User = {
        id: result.user.id,
        name: result.user.firstName,
        email: result.user.email,
        role: (result.user.role?.toLowerCase() as UserRole) || 'staff',
        onboardingStatus: result.user.onboardingStatus,
        tenantId: tenantIdValue || result.user.tenantId,
        avatar: result.user.avatar,
      }

      setUser(mappedUser)
      localStorage.setItem('auth_user', JSON.stringify(mappedUser))
      
      console.log('✅ Login réussi:', { 
        email: mappedUser.email, 
        role: mappedUser.role,
        tenantId: tenantIdValue,
        userId: mappedUser.id 
      })
      
      return true
      
    } catch (error: any) {
      console.error('❌ Erreur lors du login:', error)
      return false
    }
  }, [refreshTenantId])

  /**
   * Déconnexion
   */
  const logout = useCallback(() => {
    // Nettoyer authService
    if (authService.logout) {
      authService.logout()
    } else {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('tenantId')
    }
    
    // Nettoyer le state
    setUser(null)
    setToken(null)
    setTenantId(null)
    setTenantName(null)
    
    // Nettoyer localStorage
    localStorage.removeItem('auth_user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tenantId')
    localStorage.removeItem('tenant_name')
    
    console.log('👋 Utilisateur déconnecté')
  }, [])

  /**
   * Vérifie si l'utilisateur a un ou plusieurs rôles
   */
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    const userRole = user.role.toLowerCase()
    return roleArray.some(role => role.toLowerCase() === userRole)
  }, [user])

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  const isAuthenticated = useCallback((): boolean => {
    return !!user && !!token && !!tenantId
  }, [user, token, tenantId])

  const businessConfig = BUSINESS_CONFIGS[businessType];

  // Injection dynamique du thème dans le DOM
  useEffect(() => {
    const root = document.documentElement;
    const colorMap: Record<string, string> = {
      'RESTAURANT': '#ea580c', // orange-600
      'RETAIL': '#2563eb',     // blue-600
      'PHARMACY': '#059669',   // emerald-600
    };
    root.style.setProperty('--primary-business', colorMap[businessType]);
  }, [businessType]);

  const value: AuthContextType = {
    user,
    token,
    tenantId,
    tenantName,
    businessConfig,
    login,
    logout,
    hasRole,
    isLoading,
    refreshTenantId,
    isAuthenticated: isAuthenticated(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook pour protéger les routes qui nécessitent une authentification
 */
export function useRequireAuth(redirectTo: string = '/login'): AuthContextType {
  const auth = useAuth()
  const navigate = useNavigate() // Assurez-vous d'avoir react-router-dom installé

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate(redirectTo)
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate, redirectTo])

  return auth
}

/**
 * Hook pour protéger les routes selon les rôles
 */
export function useRequireRole(
  roles: UserRole | UserRole[],
  redirectTo: string = '/unauthorized'
): AuthContextType {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        navigate('/login')
      } else if (!auth.hasRole(roles)) {
        navigate(redirectTo)
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.hasRole, roles, navigate, redirectTo])

  return auth
}
