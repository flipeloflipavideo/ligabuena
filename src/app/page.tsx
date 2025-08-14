"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"

// Tipos para los datos
interface TeamStanding {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface TopScorer {
  id: string
  name: string
  team: string
  goals: number
}

interface LeagueData {
  category: string
  standings: TeamStanding[]
  topScorers: TopScorer[]
}

interface SportData {
  football: LeagueData[]
  basketball: LeagueData[]
}

export default function Home() {
  const [selectedSport, setSelectedSport] = useState<"football" | "basketball">("football")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SportData | null>(null)

  useEffect(() => {
    // Cargar datos desde la API
    const fetchData = async () => {
      setLoading(true)
      
      try {
        const response = await fetch('/api/standings?sport=football')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const footballData = await response.json()
        
        const basketballResponse = await fetch('/api/standings?sport=basketball')
        if (!basketballResponse.ok) {
          throw new Error('Failed to fetch basketball data')
        }
        const basketballData = await basketballResponse.json()
        
        setData({
          football: footballData,
          basketball: basketballData
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        // Usar datos de ejemplo como fallback
        const mockData: SportData = {
          football: [
            {
              category: "Categoría 1-2",
              standings: [
                { id: "1", name: "Tigres", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Águilas", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Leones", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Panteras", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            },
            {
              category: "Categoría 3-4",
              standings: [
                { id: "1", name: "Halcones", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Cóndores", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Águilas", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Leones", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            },
            {
              category: "Categoría 5-6",
              standings: [
                { id: "1", name: "Dragones", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Fénix", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Titán", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Centella", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            }
          ],
          basketball: [
            {
              category: "Categoría 1-2",
              standings: [
                { id: "1", name: "Gigantes", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Titanes", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Colosos", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Montañas", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            },
            {
              category: "Categoría 3-4",
              standings: [
                { id: "1", name: "Relámpagos", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Tormentas", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Huracanes", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Ciclones", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            },
            {
              category: "Categoría 5-6",
              standings: [
                { id: "1", name: "Cometas", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "2", name: "Meteoros", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "3", name: "Asteroides", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                { id: "4", name: "Satélites", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
              ],
              topScorers: []
            }
          ]
        }
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const getSportLabel = (sport: "football" | "basketball") => {
    return sport === "football" ? "Fútbol" : "Baloncesto"
  }

  const getGoalLabel = (sport: "football" | "basketball") => {
    return sport === "football" ? "Goles" : "Canastas"
  }

  const renderStandingsTable = (standings: TeamStanding[], sport: "football" | "basketball") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead className="text-center">PJ</TableHead>
          <TableHead className="text-center">PG</TableHead>
          <TableHead className="text-center">PE</TableHead>
          <TableHead className="text-center">PP</TableHead>
          <TableHead className="text-center">GF</TableHead>
          <TableHead className="text-center">GC</TableHead>
          <TableHead className="text-center">Pts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((team, index) => (
          <TableRow key={`${team.id}-${index}`}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell className="text-center">{team.played}</TableCell>
            <TableCell className="text-center">{team.won}</TableCell>
            <TableCell className="text-center">{team.drawn}</TableCell>
            <TableCell className="text-center">{team.lost}</TableCell>
            <TableCell className="text-center">{team.goalsFor}</TableCell>
            <TableCell className="text-center">{team.goalsAgainst}</TableCell>
            <TableCell className="text-center font-bold">{team.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderTopScorersTable = (topScorers: TopScorer[], sport: "football" | "basketball") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead className="text-center">{getGoalLabel(sport)}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topScorers.map((scorer, index) => (
          <TableRow key={`${scorer.id}-${index}`}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{scorer.name}</TableCell>
            <TableCell>{scorer.team}</TableCell>
            <TableCell className="text-center font-bold">{scorer.goals}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Liga Deportiva Escolar
            </h1>
            <p className="text-lg text-gray-700 font-medium">
              Clasificaciones y estadísticas de fútbol y baloncesto
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/login'}
              className="flex items-center gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Administración
            </Button>
          </div>
        </div>

        {/* Sport Selection */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-gray-800">Selecciona un Deporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-6">
              <Button
                variant={selectedSport === "football" ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedSport("football")}
                className={`w-40 h-14 text-lg font-bold transition-all duration-300 ${
                  selectedSport === "football" 
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform scale-105" 
                    : "border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                }`}
              >
                ⚽ Fútbol
              </Button>
              <Button
                variant={selectedSport === "basketball" ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedSport("basketball")}
                className={`w-40 h-14 text-lg font-bold transition-all duration-300 ${
                  selectedSport === "basketball" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform scale-105" 
                    : "border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
                }`}
              >
                🏀 Baloncesto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="flex gap-2">
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-12" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="flex gap-2">
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Display */}
        {!loading && data && (
          <div className="space-y-8">
            {data[selectedSport].map((league, index) => (
              <div key={index} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {league.category}
                  </h2>
                  <Badge variant="secondary" className="text-lg px-6 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 font-semibold">
                    {getSportLabel(selectedSport)}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Standings Table */}
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-blue-100">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        🏆 Tabla de Clasificación
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        Posiciones de los equipos en {getSportLabel(selectedSport)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        {renderStandingsTable(league.standings, selectedSport)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Scorers Table */}
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b border-purple-100">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        ⭐ Tabla de Goleadores
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Máximos anotadores en {getSportLabel(selectedSport)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        {renderTopScorersTable(league.topScorers, selectedSport)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}