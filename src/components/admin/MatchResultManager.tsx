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
import { Calendar, Trophy, Edit, CheckCircle, Clock, Plus, Minus } from "lucide-react"
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
}

interface League {
  id: string
  name: string
  sport: string
  category: string
  teams: { id: string; name: string; players: Player[] }[]
  matches: Match[]
}

interface MatchResultManagerProps {
  league: League
  onUpdate: () => void
}

export default function MatchResultManager({ league, onUpdate }: MatchResultManagerProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [goals, setGoals] = useState<{ playerId: string; minute: number }[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])

  useEffect(() => {
    loadMatches()
  }, [league.id])

  const loadMatches = async () => {
    setLoading(true)
    try {
      // Simular carga de partidos
      await new Promise(resolve => setTimeout(resolve, 500))
      setMatches(league.matches)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenResultDialog = (match: Match) => {
    setSelectedMatch(match)
    setHomeScore(match.result?.homeScore || 0)
    setAwayScore(match.result?.awayScore || 0)
    
    // Get all players from both teams
    const homePlayers = match.homeTeam.players.map(p => ({ ...p, team: match.homeTeam }))
    const awayPlayers = match.awayTeam.players.map(p => ({ ...p, team: match.awayTeam }))
    setAvailablePlayers([...homePlayers, ...awayPlayers])
    
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
      setMatches(matches.map(m => m.id === selectedMatch.id ? updatedMatch : m))
      setShowResultDialog(false)
      setSelectedMatch(null)
      onUpdate()
    } catch (error) {
      console.error('Error saving match result:', error)
      alert('Error al guardar el resultado')
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

  const getGoalLabel = () => {
    return league.sport === "FOOTBALL" ? "Gol" : "Canasta"
  }

  const getUpcomingMatches = () => {
    const now = new Date()
    return matches
      .filter(match => !match.isCompleted && new Date(match.matchDate) >= now)
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  }

  const getCompletedMatches = () => {
    return matches
      .filter(match => match.isCompleted)
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
  }

  return (
    <div className="space-y-6">
      {/* League Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Resultados de {league.name}
              </CardTitle>
              <CardDescription>
                {getSportLabel(league.sport)} - Categoría {getCategoryLabel(league.category)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Total Partidos</div>
              <Badge variant="secondary">{matches.length}</Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Completados</div>
              <Badge variant="default">
                {matches.filter(m => m.isCompleted).length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Pendientes</div>
              <Badge variant="outline">
                {matches.filter(m => !m.isCompleted).length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Equipos</div>
              <Badge variant="secondary">{league.teams.length}</Badge>
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
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay partidos programados para esta liga</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Próximos Partidos</TabsTrigger>
            <TabsTrigger value="completed">Partidos Completados</TabsTrigger>
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
                                {getGoalLabel()}es anotados:
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
                {format(new Date(selectedMatch.matchDate), "dd/MM/yyyy", { locale: es })}
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
                  <h3 className="text-lg font-semibold">{getGoalLabel()}es Anotados</h3>
                  <Button onClick={handleAddGoal} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir {getGoalLabel()}
                  </Button>
                </div>
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Select
                          value={goal.playerId}
                          onValueChange={(value) => handleGoalChange(index, 'playerId', value)}
                        >
                          <SelectTrigger>
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
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Minuto"
                          value={goal.minute || ""}
                          onChange={(e) => handleGoalChange(index, 'minute', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm text-gray-500">
                          {goal.playerId && availablePlayers.find(p => p.id === goal.playerId)?.team.name}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveGoal(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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