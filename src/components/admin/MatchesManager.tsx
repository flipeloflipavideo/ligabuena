"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Edit, CheckCircle, Clock, Plus, Minus, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Player {
  id: string
  name: string
  team: { id: string; name: string }
}

interface Goal {
  id: string
  player: Player
  minute?: number
}

interface MatchResult {
  id: string
  homeScore: number
  awayScore: number
  goals: Goal[]
}

interface Match {
  id: string
  matchDate: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
  isCompleted: boolean
  result?: MatchResult
  league: {
    id: string
    name: string
    sport: string
    category: string
  }
}

interface League {
  id: string
  name: string
  sport: string
  category: string
  teams: { id: string; name: string; players: Player[] }[]
  matches: Match[]
}

interface MatchesManagerProps {
  seasonsLeagues: League[]
  onUpdate: () => void
}

export default function MatchesManager({ seasonsLeagues, onUpdate }: MatchesManagerProps) {
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [goals, setGoals] = useState<{ playerId: string; minute: number }[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  
  // Filter states
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    loadMatches()
  }, [seasonsLeagues])

  useEffect(() => {
    filterMatches()
  }, [allMatches, selectedSport, selectedCategory, searchTerm])

  const loadMatches = async () => {
    setLoading(true)
    try {
      // Combine all matches from all leagues
      const matches = seasonsLeagues.flatMap(league => 
        league.matches.map(match => ({
          ...match,
          league: {
            id: league.id,
            name: league.name,
            sport: league.sport,
            category: league.category
          }
        }))
      )
      setAllMatches(matches)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMatches = () => {
    let filtered = allMatches

    // Filter by sport
    if (selectedSport !== "all") {
      filtered = filtered.filter(match => match.league.sport === selectedSport)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(match => match.league.category === selectedCategory)
    }

    // Filter by search term (team names)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(match => 
        match.homeTeam.name.toLowerCase().includes(term) ||
        match.awayTeam.name.toLowerCase().includes(term)
      )
    }

    setFilteredMatches(filtered)
  }

  const handleOpenResultDialog = (match: Match) => {
    setSelectedMatch(match)
    setHomeScore(match.result?.homeScore || 0)
    setAwayScore(match.result?.awayScore || 0)
    
    // Find the league to get player data
    const league = seasonsLeagues.find(l => l.id === match.league.id)
    if (league) {
      // Get all players from both teams
      const homeTeam = league.teams.find(t => t.id === match.homeTeam.id)
      const awayTeam = league.teams.find(t => t.id === match.awayTeam.id)
      
      const homePlayers = homeTeam?.players.map(p => ({ ...p, team: match.homeTeam })) || []
      const awayPlayers = awayTeam?.players.map(p => ({ ...p, team: match.awayTeam })) || []
      setAvailablePlayers([...homePlayers, ...awayPlayers])
    }
    
    // Load existing goals
    if (match.result) {
      setGoals(match.result.goals.map(g => ({ 
        playerId: g.player.id, 
        minute: g.minute || 0 
      })))
    } else {
      setGoals([])
    }
    
    setShowResultDialog(true)
  }

  const handleAddGoal = () => {
    setGoals([...goals, { playerId: "", minute: 0 }])
  }

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
  }

  const handleGoalChange = (index: number, field: 'playerId' | 'minute', value: string) => {
    const newGoals = [...goals]
    if (field === 'minute') {
      newGoals[index][field] = parseInt(value) || 0
    } else {
      newGoals[index][field] = value
    }
    setGoals(newGoals)
  }

  const handleSaveResult = async () => {
    if (!selectedMatch) return

    try {
      const response = await fetch(`/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeScore,
          awayScore,
          goals: goals.filter(g => g.playerId) // Only include goals with players
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save match result')
      }

      const updatedMatch = await response.json()
      
      // Update the match in all matches
      setAllMatches(allMatches.map(m => m.id === selectedMatch.id ? updatedMatch : m))
      
      setShowResultDialog(false)
      setSelectedMatch(null)
      onUpdate()
    } catch (error) {
      console.error('Error saving match result:', error)
      alert('Error al guardar el resultado')
    }
  }

  const clearFilters = () => {
    setSelectedSport("all")
    setSelectedCategory("all")
    setSearchTerm("")
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

  const getGoalLabel = (sport: string) => {
    return sport === "FOOTBALL" ? "Gol" : "Canasta"
  }

  const getUpcomingMatches = () => {
    const now = new Date()
    return filteredMatches
      .filter(match => !match.isCompleted && new Date(match.matchDate) >= now)
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  }

  const getCompletedMatches = () => {
    return filteredMatches
      .filter(match => match.isCompleted)
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
  }

  const getAllSports = () => {
    const sports = [...new Set(seasonsLeagues.map(league => league.sport))]
    return sports
  }

  const getAllCategories = () => {
    const categories = [...new Set(seasonsLeagues.map(league => league.category))]
    return categories
  }

  const hasActiveFilters = selectedSport !== "all" || selectedCategory !== "all" || searchTerm !== ""

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Partidos
              </CardTitle>
              <CardDescription>
                Filtra partidos por deporte, categoría o equipo
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="sportFilter">Deporte</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los deportes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deportes</SelectItem>
                  {getAllSports().map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {getSportLabel(sport)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="categoryFilter">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {getAllCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="searchTeams">Buscar Equipos</Label>
              <Input
                id="searchTeams"
                placeholder="Buscar por nombre de equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSport !== "all" && (
                <Badge variant="secondary">
                  Deporte: {getSportLabel(selectedSport)}
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  Categoría: {getCategoryLabel(selectedCategory)}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary">
                  Búsqueda: {searchTerm}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Partidos</CardTitle>
          <CardDescription>
            Estadísticas de los partidos filtrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Total Partidos</div>
              <Badge variant="secondary">{filteredMatches.length}</Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Completados</div>
              <Badge variant="default">
                {filteredMatches.filter(m => m.isCompleted).length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Pendientes</div>
              <Badge variant="outline">
                {filteredMatches.filter(m => !m.isCompleted).length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Ligas</div>
              <Badge variant="secondary">
                {[...new Set(filteredMatches.map(m => m.league.name))].length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Tabs */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                {hasActiveFilters ? "No hay partidos que coincidan con los filtros" : "No hay partidos programados"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Próximos Partidos ({getUpcomingMatches().length})</TabsTrigger>
            <TabsTrigger value="completed">Partidos Completados ({getCompletedMatches().length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Partidos</CardTitle>
                <CardDescription>
                  Partidos pendientes de jugar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingMatches().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay partidos próximos programados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getUpcomingMatches().map((match) => (
                      <Card key={match.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-semibold">{match.homeTeam.name}</div>
                                <div className="text-sm text-gray-600">Local</div>
                              </div>
                              <div className="text-2xl font-bold">vs</div>
                              <div>
                                <div className="font-semibold">{match.awayTeam.name}</div>
                                <div className="text-sm text-gray-600">Visitante</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(match.matchDate), "dd/MM/yyyy", { locale: es })}
                                </div>
                                <div className="text-gray-500">
                                  {format(new Date(match.matchDate), "EEEE", { locale: es })}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">
                                  {match.league.name}
                                </div>
                              </div>
                              <Button onClick={() => handleOpenResultDialog(match)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Registrar Resultado
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Partidos Completados</CardTitle>
                <CardDescription>
                  Partidos con resultados registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getCompletedMatches().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay partidos completados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCompletedMatches().map((match) => (
                      <Card key={match.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-semibold">{match.homeTeam.name}</div>
                                <div className="text-sm text-gray-600">Local</div>
                              </div>
                              <div className="text-2xl font-bold">
                                {match.result?.homeScore} - {match.result?.awayScore}
                              </div>
                              <div>
                                <div className="font-semibold">{match.awayTeam.name}</div>
                                <div className="text-sm text-gray-600">Visitante</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(match.matchDate), "dd/MM/yyyy", { locale: es })}
                                </div>
                                <div className="text-gray-500">
                                  {format(new Date(match.matchDate), "EEEE", { locale: es })}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">
                                  {match.league.name}
                                </div>
                              </div>
                              <Badge variant="default" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completado
                              </Badge>
                              <Button variant="outline" onClick={() => handleOpenResultDialog(match)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Resultado
                              </Button>
                            </div>
                          </div>
                          {match.result && match.result.goals.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="text-sm font-medium mb-2">
                                {getGoalLabel(match.league.sport)}es anotados:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {match.result.goals.map((goal, index) => (
                                  <Badge key={index} variant="secondary">
                                    {goal.player.name} {goal.minute && `(${goal.minute}')`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Result Dialog */}
      {selectedMatch && (
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Resultado</DialogTitle>
              <DialogDescription>
                {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                <br />
                {format(new Date(selectedMatch.matchDate), "dd/MM/yyyy", { locale: es })} - {selectedMatch.league.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Score Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore">{selectedMatch.homeTeam.name}</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="awayScore">{selectedMatch.awayTeam.name}</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Goals Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>{getGoalLabel(selectedMatch.league.sport)}es</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddGoal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar {getGoalLabel(selectedMatch.league.sport)}
                  </Button>
                </div>
                
                {goals.length > 0 && (
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={goal.playerId}
                          onValueChange={(value) => handleGoalChange(index, 'playerId', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlayers.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name} ({player.team.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          placeholder="Minuto"
                          min="0"
                          max="120"
                          value={goal.minute}
                          onChange={(e) => handleGoalChange(index, 'minute', e.target.value)}
                          className="w-20"
                        />
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveGoal(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveResult}>
                  Guardar Resultado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}