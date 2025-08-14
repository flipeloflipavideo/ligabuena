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
import { Calendar, Clock, Trophy, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Match {
  id: string
  matchDate: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
  isCompleted: boolean
  result?: {
    homeScore: number
    awayScore: number
  }
}

interface League {
  id: string
  name: string
  sport: string
  category: string
  teams: { id: string; name: string }[]
  matches: Match[]
}

interface MatchSchedulerProps {
  league: League
  onUpdate: () => void
}

export default function MatchScheduler({ league, onUpdate }: MatchSchedulerProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateSchedule, setShowGenerateSchedule] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [generating, setGenerating] = useState(false)

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

  const handleGenerateSchedule = async () => {
    if (!startDate) {
      alert("Por favor selecciona una fecha de inicio")
      return
    }

    setGenerating(true)
    try {
      console.log('Generating schedule for league:', league.id, 'with start date:', startDate)
      console.log('League teams:', league.teams)
      
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId: league.id,
          startDate: startDate
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server response error:', errorData)
        throw new Error(errorData.error || `Failed to generate schedule: ${response.status}`)
      }

      const result = await response.json()
      console.log('Schedule generated successfully:', result)
      
      // Update matches with the generated matches
      setMatches(result.matches || [])
      setShowGenerateSchedule(false)
      setStartDate("")
      onUpdate()
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert(`Error al generar el calendario: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteAllMatches = async () => {
    try {
      console.log('Deleting all matches for league:', league.id)
      
      const response = await fetch(`/api/matches/league/${league.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server response error:', errorData)
        throw new Error(errorData.error || `Failed to delete matches: ${response.status}`)
      }

      const result = await response.json()
      console.log('Matches deleted successfully:', result)
      
      // Clear the matches from the local state
      setMatches([])
      onUpdate()
      
      alert(`Todos los partidos han sido eliminados: ${result.deletedCount} partidos borrados`)
    } catch (error) {
      console.error('Error deleting matches:', error)
      alert(`Error al eliminar los partidos: ${error.message}`)
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

  const getMatchStatus = (match: Match) => {
    if (match.isCompleted) {
      return { icon: CheckCircle, label: "Completado", variant: "default" as const }
    }
    const matchDate = new Date(match.matchDate)
    const now = new Date()
    if (matchDate < now) {
      return { icon: AlertCircle, label: "Pendiente", variant: "secondary" as const }
    }
    return { icon: Clock, label: "Programado", variant: "outline" as const }
  }

  return (
    <div className="space-y-6">
      {/* League Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendario de {league.name}
              </CardTitle>
              <CardDescription>
                {getSportLabel(league.sport)} - Categoría {getCategoryLabel(league.category)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showGenerateSchedule} onOpenChange={setShowGenerateSchedule}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generar Calendario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generar Calendario de Partidos</DialogTitle>
                    <DialogDescription>
                      El sistema generará automáticamente un calendario todos contra todos,
                      programando un partido cada viernes (excluyendo fechas no lectivas).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Fecha del Primer Partido</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Información:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Se generará un partido cada viernes</li>
                        <li>• Se excluirán automáticamente las fechas no lectivas</li>
                        <li>• Formato: todos contra todos</li>
                        <li>• Se necesitan al menos 4 equipos</li>
                      </ul>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowGenerateSchedule(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleGenerateSchedule} disabled={generating}>
                        {generating ? "Generando..." : "Generar Calendario"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {matches.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      Eliminar Todos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar Todos los Partidos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar todos los partidos del calendario? 
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllMatches}>
                        Eliminar Todos
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Equipos</div>
              <Badge variant="secondary">{league.teams.length}</Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Partidos</div>
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
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
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
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay partidos programados para esta liga</p>
              <Button onClick={() => setShowGenerateSchedule(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Generar Calendario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Partidos Programados</CardTitle>
            <CardDescription>
              Lista de todos los partidos de la temporada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-center">Resultado</TableHead>
                    <TableHead>Visitante</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    const status = getMatchStatus(match)
                    const StatusIcon = status.icon
                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {format(new Date(match.matchDate), "dd/MM/yyyy", { locale: es })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(match.matchDate), "EEEE", { locale: es })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{match.homeTeam.name}</TableCell>
                        <TableCell className="text-center">
                          {match.result ? (
                            <div className="text-lg font-bold">
                              {match.result.homeScore} - {match.result.awayScore}
                            </div>
                          ) : (
                            <div className="text-gray-400">vs</div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{match.awayTeam.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={status.variant} className="flex items-center gap-1 mx-auto">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}