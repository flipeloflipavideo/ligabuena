"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import TeamManager from "@/components/admin/TeamManager"
import MatchScheduler from "@/components/admin/MatchScheduler"
import MatchResultManager from "@/components/admin/MatchResultManager"
import NonSchoolDaysManager from "@/components/admin/NonSchoolDaysManager"
import MatchesManager from "@/components/admin/MatchesManager"
import { CalendarDays, Trophy, Users, Calendar as CalendarIcon, Settings, XCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthProvider } from "@/components/admin/auth-provider"

// Tipos para los datos
interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  leagues: League[]
}

interface League {
  id: string
  name: string
  sport: "FOOTBALL" | "BASKETBALL"
  category: "CATEGORY_1_2" | "CATEGORY_3_4" | "CATEGORY_5_6"
  teams: Team[]
  matches: Match[]
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  matchDate: string
  homeTeam: Team
  awayTeam: Team
  isCompleted: boolean
  result?: MatchResult
}

interface MatchResult {
  id: string
  homeScore: number
  awayScore: number
  goals: Goal[]
}

interface Goal {
  id: string
  player: Player
  minute?: number
}

interface NonSchoolDay {
  id: string
  date: string
  description: string
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [showCreateSeason, setShowCreateSeason] = useState(false)
  const [newSeason, setNewSeason] = useState({
    name: "",
    startDate: "",
    endDate: ""
  })

  useEffect(() => {
    loadSeasons()
  }, [])

  const loadSeasons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seasons')
      if (!response.ok) {
        throw new Error('Failed to fetch seasons')
      }
      const seasonsData = await response.json()
      setSeasons(seasonsData)
      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0])
      }
    } catch (error) {
      console.error('Error fetching seasons:', error)
      // Usar datos de ejemplo como fallback
      const mockSeasons: Season[] = [
        {
          id: "1",
          name: "2024-2025",
          startDate: "2024-08-19",
          endDate: "2025-06-30",
          isActive: true,
          leagues: [
            {
              id: "1",
              name: "Fútbol 1-2",
              sport: "FOOTBALL",
              category: "CATEGORY_1_2",
              teams: [
                { id: "1", name: "Tigres", players: [] },
                { id: "2", name: "Águilas", players: [] },
                { id: "3", name: "Leones", players: [] },
                { id: "4", name: "Panteras", players: [] }
              ],
              matches: []
            },
            {
              id: "2",
              name: "Fútbol 3-4",
              sport: "FOOTBALL",
              category: "CATEGORY_3_4",
              teams: [
                { id: "5", name: "Halcones", players: [] },
                { id: "6", name: "Cóndores", players: [] },
                { id: "7", name: "Águilas", players: [] },
                { id: "8", name: "Leones", players: [] }
              ],
              matches: []
            },
            {
              id: "3",
              name: "Fútbol 5-6",
              sport: "FOOTBALL",
              category: "CATEGORY_5_6",
              teams: [
                { id: "9", name: "Dragones", players: [] },
                { id: "10", name: "Fénix", players: [] },
                { id: "11", name: "Titán", players: [] },
                { id: "12", name: "Centella", players: [] }
              ],
              matches: []
            },
            {
              id: "4",
              name: "Baloncesto 1-2",
              sport: "BASKETBALL",
              category: "CATEGORY_1_2",
              teams: [
                { id: "13", name: "Gigantes", players: [] },
                { id: "14", name: "Titanes", players: [] },
                { id: "15", name: "Colosos", players: [] },
                { id: "16", name: "Montañas", players: [] }
              ],
              matches: []
            },
            {
              id: "5",
              name: "Baloncesto 3-4",
              sport: "BASKETBALL",
              category: "CATEGORY_3_4",
              teams: [
                { id: "17", name: "Relámpagos", players: [] },
                { id: "18", name: "Tormentas", players: [] },
                { id: "19", name: "Huracanes", players: [] },
                { id: "20", name: "Ciclones", players: [] }
              ],
              matches: []
            },
            {
              id: "6",
              name: "Baloncesto 5-6",
              sport: "BASKETBALL",
              category: "CATEGORY_5_6",
              teams: [
                { id: "21", name: "Cometas", players: [] },
                { id: "22", name: "Meteoros", players: [] },
                { id: "23", name: "Asteroides", players: [] },
                { id: "24", name: "Satélites", players: [] }
              ],
              matches: []
            }
          ]
        }
      ]
      setSeasons(mockSeasons)
      setSelectedSeason(mockSeasons[0])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSeason = async () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSeason),
      })

      if (!response.ok) {
        throw new Error('Failed to create season')
      }

      const createdSeason = await response.json()
      setSeasons([...seasons, createdSeason])
      setSelectedSeason(createdSeason)
      setShowCreateSeason(false)
      setNewSeason({ name: "", startDate: "", endDate: "" })
    } catch (error) {
      console.error('Error creating season:', error)
      alert('Error al crear la temporada')
    }
  }

  const handleToggleSeasonActive = async (season: Season) => {
    try {
      console.log('Toggling season active status:', { id: season.id, currentStatus: season.isActive, newStatus: !season.isActive })
      
      const response = await fetch(`/api/seasons/${season.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !season.isActive
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server response:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to update season')
      }

      const updatedSeason = await response.json()
      console.log('Season updated successfully:', updatedSeason)
      
      // Update the seasons list
      setSeasons(seasons.map(s => 
        s.id === season.id ? updatedSeason : 
        { ...s, isActive: updatedSeason.isActive ? false : s.isActive }
      ))
      
      // Update selected season if it's the one being updated
      if (selectedSeason?.id === season.id) {
        setSelectedSeason(updatedSeason)
      }
    } catch (error) {
      console.error('Error updating season:', error)
      alert(`Error al actualizar la temporada: ${error.message}`)
    }
  }

  const handleDeleteSeason = async (seasonId: string) => {
    try {
      console.log('Deleting season:', seasonId)
      
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server response:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to delete season')
      }

      const result = await response.json()
      console.log('Season deleted successfully:', result)
      
      // Remove the season from the list
      const remainingSeasons = seasons.filter(s => s.id !== seasonId)
      setSeasons(remainingSeasons)
      
      // Clear selected season if it was the one deleted
      if (selectedSeason?.id === seasonId) {
        setSelectedSeason(remainingSeasons.length > 0 ? remainingSeasons[0] : null)
      }
      
      alert(`Temporada eliminada exitosamente: ${result.deletedSeason.name}`)
    } catch (error) {
      console.error('Error deleting season:', error)
      alert(`Error al eliminar la temporada: ${error.message}`)
    }
  }

  const getSportLabel = (sport: string) => {
    return sport === "FOOTBALL" ? "Fútbol" : "Baloncesto"
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "CATEGORY_1_2": return "1-2"
      case "CATEGORY_3_4": return "3-4"
      case "CATEGORY_5_6": return "5-6"
      default: return category
    }
  }

  return (
    <AuthProvider>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-700 font-medium">
              Gestiona las ligas deportivas escolares
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Volver al Inicio
            </Button>
          </div>
        </div>

        {/* Season Selection */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-blue-800 font-bold">Temporadas</CardTitle>
                <CardDescription className="text-blue-600">Selecciona una temporada para administrar</CardDescription>
              </div>
              <Dialog open={showCreateSeason} onOpenChange={setShowCreateSeason}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md">
                    Nueva Temporada
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Temporada</DialogTitle>
                    <DialogDescription>
                      Crea una nueva temporada escolar. El sistema generará automáticamente las 6 ligas base.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="seasonName">Nombre de la Temporada</Label>
                      <Input
                        id="seasonName"
                        placeholder="Ej: 2024-2025"
                        value={newSeason.name}
                        onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Fecha de Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newSeason.startDate}
                        onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newSeason.endDate}
                        onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateSeason(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateSeason} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold">
                        Crear Temporada
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-4">
                <Select
                  value={selectedSeason?.id || ""}
                  onValueChange={(value) => {
                    const season = seasons.find(s => s.id === value)
                    setSelectedSeason(season || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una temporada" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.name} {season.isActive && "(Activa)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Season Actions */}
                {selectedSeason && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSeasonActive(selectedSeason)}
                      className={`font-semibold ${
                        selectedSeason.isActive 
                          ? "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600" 
                          : "border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600"
                      }`}
                    >
                      {selectedSeason.isActive ? "Desactivar" : "Activar"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md">
                          Eliminar Temporada
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la temporada "{selectedSeason.name}" y todos sus datos asociados:
                            <ul className="list-disc list-inside mt-2">
                              <li>Todas las ligas de esta temporada</li>
                              <li>Todos los equipos y jugadores</li>
                              <li>Todos los partidos y resultados</li>
                              <li>Todas las fechas no lectivas</li>
                            </ul>
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSeason(selectedSeason.id)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Season Management */}
        {selectedSeason && (
          <Tabs defaultValue="leagues" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-2 border-blue-100 p-1 rounded-lg shadow-md">
              <TabsTrigger value="leagues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">
                Ligas
              </TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold">
                Equipos
              </TabsTrigger>
              <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-semibold">
                Partidos
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
                Calendario
              </TabsTrigger>
              <TabsTrigger value="non-school" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold">
                Fechas No Lectivas
              </TabsTrigger>
            </TabsList>

            {/* Ligas Tab */}
            <TabsContent value="leagues">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-blue-100">
                  <CardTitle className="text-blue-800 font-bold">Ligas de la Temporada</CardTitle>
                  <CardDescription className="text-blue-600">
                    Las 6 ligas base se crean automáticamente al iniciar una nueva temporada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedSeason.leagues.map((league) => (
                      <Card key={league.id} className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-lg">{league.name}</CardTitle>
                          <CardDescription>
                            {getSportLabel(league.sport)} - Categoría {getCategoryLabel(league.category)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Equipos:</span>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">{league.teams.length}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Partidos:</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">{league.matches.length}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Equipos Tab */}
            <TabsContent value="teams">
              <div className="space-y-6">
                {selectedSeason.leagues.map((league) => (
                  <TeamManager 
                    key={league.id} 
                    league={league} 
                    onUpdate={loadSeasons} 
                  />
                ))}
              </div>
            </TabsContent>

            {/* Partidos Tab */}
            <TabsContent value="matches">
              <MatchesManager 
                seasonsLeagues={selectedSeason.leagues} 
                onUpdate={loadSeasons} 
              />
            </TabsContent>

            {/* Calendario Tab */}
            <TabsContent value="calendar">
              <div className="space-y-6">
                {selectedSeason.leagues.map((league) => (
                  <MatchScheduler 
                    key={league.id} 
                    league={league} 
                    onUpdate={loadSeasons} 
                  />
                ))}
              </div>
            </TabsContent>

            {/* Fechas No Lectivas Tab */}
            <TabsContent value="non-school">
              <NonSchoolDaysManager 
                season={selectedSeason} 
                onUpdate={loadSeasons} 
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
      </div>
    </AuthProvider>
  )
}