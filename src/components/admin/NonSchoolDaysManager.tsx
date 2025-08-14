"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Plus, Edit, Trash2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface NonSchoolDay {
  id: string
  date: string
  description: string
}

interface Season {
  id: string
  name: string
  nonSchoolDays: NonSchoolDay[]
}

interface NonSchoolDaysManagerProps {
  season: Season
  onUpdate: () => void
}

export default function NonSchoolDaysManager({ season, onUpdate }: NonSchoolDaysManagerProps) {
  const [nonSchoolDays, setNonSchoolDays] = useState<NonSchoolDay[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [editingDay, setEditingDay] = useState<NonSchoolDay | null>(null)
  const [editDate, setEditDate] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    loadNonSchoolDays()
  }, [season.id])

  const loadNonSchoolDays = async () => {
    setLoading(true)
    try {
      // Simular carga de fechas no lectivas
      await new Promise(resolve => setTimeout(resolve, 500))
      setNonSchoolDays(season.nonSchoolDays)
    } catch (error) {
      console.error('Error loading non-school days:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNonSchoolDay = async () => {
    if (!newDate || !newDescription.trim()) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      // En una implementación real, esto llamaría a una API
      const newNonSchoolDay: NonSchoolDay = {
        id: Date.now().toString(),
        date: newDate,
        description: newDescription.trim()
      }

      setNonSchoolDays([...nonSchoolDays, newNonSchoolDay])
      setNewDate("")
      setNewDescription("")
      setShowAddDialog(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding non-school day:', error)
      alert('Error al añadir fecha no lectiva')
    }
  }

  const handleEditNonSchoolDay = async () => {
    if (!editingDay || !editDate || !editDescription.trim()) return

    try {
      // En una implementación real, esto llamaría a una API
      const updatedNonSchoolDay: NonSchoolDay = {
        ...editingDay,
        date: editDate,
        description: editDescription.trim()
      }

      setNonSchoolDays(nonSchoolDays.map(day => 
        day.id === editingDay.id ? updatedNonSchoolDay : day
      ))
      setEditingDay(null)
      setEditDate("")
      setEditDescription("")
      onUpdate()
    } catch (error) {
      console.error('Error updating non-school day:', error)
      alert('Error al actualizar fecha no lectiva')
    }
  }

  const handleDeleteNonSchoolDay = async (dayId: string) => {
    try {
      // En una implementación real, esto llamaría a una API
      setNonSchoolDays(nonSchoolDays.filter(day => day.id !== dayId))
      onUpdate()
    } catch (error) {
      console.error('Error deleting non-school day:', error)
      alert('Error al eliminar fecha no lectiva')
    }
  }

  const addPresetDates = () => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    // Períodos vacacionales completos
    const vacationPeriods = [
      {
        startDate: `${currentYear}-12-20`,
        endDate: `${nextYear}-01-07`,
        description: "Vacaciones de Navidad"
      },
      {
        startDate: `${nextYear}-03-24`,
        endDate: `${nextYear}-03-31`,
        description: "Semana Santa"
      }
    ]

    const newDates: Array<{ date: string; description: string }> = []

    vacationPeriods.forEach(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      const current = new Date(start)

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0]
        
        // Excluir fines de semana (sábado y domingo) ya que ya se excluyen automáticamente
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No es domingo ni sábado
          newDates.push({
            date: dateString,
            description: period.description
          })
        }
        
        current.setDate(current.getDate() + 1)
      }
    })

    // Filtrar fechas que ya existen
    const uniqueDates = newDates.filter(preset => 
      !nonSchoolDays.some(existing => existing.date === preset.date)
    )

    if (uniqueDates.length === 0) {
      alert("Todas las fechas vacacionales ya existen")
      return
    }

    const addedDates = uniqueDates.map(preset => ({
      id: Date.now().toString() + Math.random(),
      ...preset
    }))

    setNonSchoolDays([...nonSchoolDays, ...addedDates])
    onUpdate()
    
    alert(`Se han añadido ${addedDates.length} fechas no lectivas para los períodos vacacionales`)
  }

  const isDateInPast = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getUpcomingNonSchoolDays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return nonSchoolDays
      .filter(day => new Date(day.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getPastNonSchoolDays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return nonSchoolDays
      .filter(day => new Date(day.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas No Lectivas
              </CardTitle>
              <CardDescription>
                Temporada {season.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addPresetDates}>
                Añadir Períodos Vacacionales
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Fecha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Períodos Vacacionales Completos</DialogTitle>
                    <DialogDescription>
                      Agrega automáticamente todas las fechas de los períodos vacacionales (Navidad, Semana Santa, etc.).
                      El sistema generará todos los días lectivos entre las fechas de inicio y fin de cada período.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newDate">Fecha</Label>
                      <Input
                        id="newDate"
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newDescription">Descripción</Label>
                      <Textarea
                        id="newDescription"
                        placeholder="Ej: Vacaciones de Navidad, Semana Santa, Consejo Técnico"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddNonSchoolDay}>
                        Añadir Fecha
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Total Fechas</div>
              <Badge variant="secondary">{nonSchoolDays.length}</Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Próximas</div>
              <Badge variant="default">
                {getUpcomingNonSchoolDays().length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Pasadas</div>
              <Badge variant="outline">
                {getPastNonSchoolDays().length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-School Days List */}
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
      ) : nonSchoolDays.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay fechas no lectivas registradas</p>
              <div className="space-y-2">
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Fecha
                </Button>
                <Button variant="outline" onClick={addPresetDates}>
                  Añadir Períodos Vacacionales
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Non-School Days */}
          {getUpcomingNonSchoolDays().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximas Fechas No Lectivas</CardTitle>
                <CardDescription>
                  Fechas que serán excluidas del calendario de partidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingNonSchoolDays().map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(day.date), "dd/MM/yyyy", { locale: es })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(day.date), "EEEE", { locale: es })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{day.description}</Badge>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingDay(day)
                                  setEditDate(day.date)
                                  setEditDescription(day.description)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Fecha No Lectiva</DialogTitle>
                                <DialogDescription>
                                  Modifica los detalles de la fecha no lectiva
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editDate">Fecha</Label>
                                  <Input
                                    id="editDate"
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editDescription">Descripción</Label>
                                  <Textarea
                                    id="editDescription"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditingDay(null)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleEditNonSchoolDay}>
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
                                <AlertDialogTitle>¿Eliminar Fecha No Lectiva?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres eliminar la fecha {day.date} - {day.description}?
                                  Esta acción podría afectar el calendario de partidos ya generado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteNonSchoolDay(day.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Non-School Days */}
          {getPastNonSchoolDays().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fechas No Lectivas Pasadas</CardTitle>
                <CardDescription>
                  Fechas que ya han sido excluidas del calendario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getPastNonSchoolDays().map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-600">
                            {format(new Date(day.date), "dd/MM/yyyy", { locale: es })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(day.date), "EEEE", { locale: es })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-gray-500">
                          {day.description}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}