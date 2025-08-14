"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Users, Trophy } from "lucide-react"
import TeamPlayersManager from "./TeamPlayersManager"

interface Team {
  id: string
  name: string
  players: any[]
}

interface League {
  id: string
  name: string
  sport: string
  category: string
  teams: Team[]
}

interface TeamManagerProps {
  league: League
  onUpdate: () => void
}

export default function TeamManager({ league, onUpdate }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editTeamName, setEditTeamName] = useState("")
  const [managingTeam, setManagingTeam] = useState<Team | null>(null)

  useEffect(() => {
    loadTeams()
  }, [league.id])

  const loadTeams = async () => {
    setLoading(true)
    try {
      // Simular carga de equipos
      await new Promise(resolve => setTimeout(resolve, 500))
      setTeams(league.teams)
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeamName.trim(),
          leagueId: league.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add team')
      }

      const newTeam = await response.json()
      setTeams([...teams, newTeam])
      setNewTeamName("")
      setShowAddTeam(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding team:', error)
      alert('Error al añadir equipo')
    }
  }

  const handleEditTeam = async () => {
    if (!editingTeam || !editTeamName.trim()) return

    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editTeamName.trim()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      const updatedTeam = await response.json()
      setTeams(teams.map(t => t.id === editingTeam.id ? updatedTeam : t))
      setEditingTeam(null)
      setEditTeamName("")
      onUpdate()
    } catch (error) {
      console.error('Error updating team:', error)
      alert('Error al actualizar equipo')
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      setTeams(teams.filter(t => t.id !== teamId))
      onUpdate()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Error al eliminar equipo')
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
    <div className="space-y-6">
      {/* League Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {league.name}
              </CardTitle>
              <CardDescription>
                {getSportLabel(league.sport)} - Categoría {getCategoryLabel(league.category)}
              </CardDescription>
            </div>
            <Dialog open={showAddTeam} onOpenChange={setShowAddTeam}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Equipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Equipo</DialogTitle>
                  <DialogDescription>
                    Ingresa el nombre del nuevo equipo para la liga {league.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Nombre del Equipo</Label>
                    <Input
                      id="teamName"
                      placeholder="Ej: Tigres"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddTeam(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddTeam}>
                      Añadir Equipo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Total de equipos: <Badge variant="secondary">{teams.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay equipos registrados en esta liga</p>
              <Button onClick={() => setShowAddTeam(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Primer Equipo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTeam(team)
                            setEditTeamName(team.name)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Equipo</DialogTitle>
                          <DialogDescription>
                            Modifica el nombre del equipo
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="editTeamName">Nombre del Equipo</Label>
                            <Input
                              id="editTeamName"
                              value={editTeamName}
                              onChange={(e) => setEditTeamName(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingTeam(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleEditTeam}>
                              Guardar Cambios
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar Equipo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar al equipo {team.name}? 
                            Esta acción no se puede deshacer y eliminará también a todos sus jugadores.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>
                  Jugadores: {team.players.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setManagingTeam(team)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Jugadores
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team Players Manager Dialog */}
      {managingTeam && (
        <Dialog open={!!managingTeam} onOpenChange={() => setManagingTeam(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestión de Jugadores</DialogTitle>
              <DialogDescription>
                Administra los jugadores del equipo {managingTeam.name}
              </DialogDescription>
            </DialogHeader>
            <TeamPlayersManager 
              team={managingTeam} 
              onUpdate={() => {
                onUpdate()
                loadTeams()
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}