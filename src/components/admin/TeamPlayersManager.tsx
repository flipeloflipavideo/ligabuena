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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Users } from "lucide-react"

interface Player {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface TeamPlayersManagerProps {
  team: Team
  onUpdate: () => void
}

export default function TeamPlayersManager({ team, onUpdate }: TeamPlayersManagerProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editPlayerName, setEditPlayerName] = useState("")

  useEffect(() => {
    loadPlayers()
  }, [team.id])

  const loadPlayers = async () => {
    setLoading(true)
    try {
      // Simular carga de jugadores
      await new Promise(resolve => setTimeout(resolve, 500))
      setPlayers(team.players)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlayerName.trim(),
          teamId: team.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add player')
      }

      const newPlayer = await response.json()
      setPlayers([...players, newPlayer])
      setNewPlayerName("")
      setShowAddPlayer(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding player:', error)
      alert('Error al añadir jugador')
    }
  }

  const handleEditPlayer = async () => {
    if (!editingPlayer || !editPlayerName.trim()) return

    try {
      const response = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editPlayerName.trim(),
          teamId: team.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update player')
      }

      const updatedPlayer = await response.json()
      setPlayers(players.map(p => p.id === editingPlayer.id ? updatedPlayer : p))
      setEditingPlayer(null)
      setEditPlayerName("")
      onUpdate()
    } catch (error) {
      console.error('Error updating player:', error)
      alert('Error al actualizar jugador')
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete player')
      }

      setPlayers(players.filter(p => p.id !== playerId))
      onUpdate()
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error al eliminar jugador')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Jugadores de {team.name}
            </CardTitle>
            <CardDescription>
              Gestiona los jugadores del equipo
            </CardDescription>
          </div>
          <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Jugador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Jugador</DialogTitle>
                <DialogDescription>
                  Ingresa el nombre del nuevo jugador para el equipo {team.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playerName">Nombre del Jugador</Label>
                  <Input
                    id="playerName"
                    placeholder="Ej: Carlos Martínez"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddPlayer(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPlayer}>
                    Añadir Jugador
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay jugadores registrados en este equipo
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPlayer(player)
                              setEditPlayerName(player.name)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Jugador</DialogTitle>
                            <DialogDescription>
                              Modifica el nombre del jugador
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="editPlayerName">Nombre del Jugador</Label>
                              <Input
                                id="editPlayerName"
                                value={editPlayerName}
                                onChange={(e) => setEditPlayerName(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingPlayer(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleEditPlayer}>
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
                            <AlertDialogTitle>¿Eliminar Jugador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar a {player.name} del equipo {team.name}? 
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlayer(player.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          Total de jugadores: <Badge variant="secondary">{players.length}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}