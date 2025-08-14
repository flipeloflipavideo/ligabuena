'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, LogOut } from 'lucide-react'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    const authStatus = localStorage.getItem('adminAuthenticated')
    const authTime = localStorage.getItem('adminAuthTime')
    
    // Check if authenticated and session is not too old (24 hours)
    if (authStatus === 'true' && authTime) {
      const authTimestamp = parseInt(authTime)
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (now - authTimestamp < twentyFourHours) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }
    }
    
    // Not authenticated or session expired
    setIsAuthenticated(false)
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminAuthTime')
    setIsAuthenticated(false)
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Verificando autenticación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-100">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Acceso Restringido
            </CardTitle>
            <CardDescription>
              Necesitas iniciar sesión para acceder al panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Por favor, inicia sesión con tus credenciales de administrador.
              </p>
              <Button
                onClick={() => router.push('/admin/login')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
              >
                Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header with Logout */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Sesión Administrativa</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      {children}
    </div>
  )
}