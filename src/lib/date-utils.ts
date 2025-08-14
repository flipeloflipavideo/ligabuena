// Días festivos fijos en México
const MEXICAN_HOLIDAYS = [
  { month: 1, day: 1, name: "Año Nuevo" }, // 1 de enero
  { month: 2, day: 5, name: "Día de la Constitución" }, // 5 de febrero
  { month: 3, day: 21, name: "Natalicio de Benito Juárez" }, // 21 de marzo
  { month: 5, day: 1, name: "Día del Trabajo" }, // 1 de mayo
  { month: 9, day: 16, name: "Día de la Independencia" }, // 16 de septiembre
  { month: 11, day: 20, name: "Día de la Revolución" }, // 20 de noviembre
  { month: 12, day: 25, name: "Navidad" }, // 25 de diciembre
]

// Días festivos variables (calculados)
const getVariableHolidays = (year: number) => {
  const easter = getEasterDate(year)[0]
  return [
    // Jueves Santo (3 días antes de Pascua)
    {
      month: easter.month,
      day: easter.day - 3,
      name: "Jueves Santo"
    },
    // Viernes Santo (2 días antes de Pascua)
    {
      month: easter.month,
      day: easter.day - 2,
      name: "Viernes Santo"
    }
  ]
}

// Cálculo de Pascua (algoritmo de Gauss)
function getEasterDate(year: number): Array<{month: number, day: number}> {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  
  return [{ month, day }]
}

export interface Holiday {
  month: number
  day: number
  name: string
}

export function isMexicanHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  
  // Verificar días festivos fijos
  const isFixedHoliday = MEXICAN_HOLIDAYS.some(holiday => 
    holiday.month === month && holiday.day === day
  )
  
  if (isFixedHoliday) return true
  
  // Verificar días festivos variables
  const variableHolidays = getVariableHolidays(year)
  const isVariableHoliday = variableHolidays.some(holiday => 
    holiday && holiday.month === month && holiday.day === day
  )
  
  return isVariableHoliday
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Domingo o Sábado
}

export function isNonSchoolDay(
  date: Date, 
  nonSchoolDays: Array<{ date: Date }>,
  considerHolidays: boolean = true,
  considerWeekends: boolean = true
): boolean {
  // Verificar si es día no lectivo personalizado
  const isCustomNonSchool = nonSchoolDays.some(nonSchoolDay => {
    const nonSchoolDate = new Date(nonSchoolDay.date)
    return nonSchoolDate.toDateString() === date.toDateString()
  })
  
  if (isCustomNonSchool) return true
  
  // Verificar si es día festivo (opcional)
  if (considerHolidays && isMexicanHoliday(date)) return true
  
  // Verificar si es fin de semana (opcional)
  if (considerWeekends && isWeekend(date)) return true
  
  return false
}

export function getAvailableDates(
  startDate: Date,
  endDate: Date,
  nonSchoolDays: Array<{ date: Date }>,
  preferredDays: number[] = [5], // Solo Viernes
  maxMatchesPerDay: number = 2
): Array<{ date: Date, availableSlots: number }> {
  const availableDates: Array<{ date: Date, availableSlots: number }> = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    if (!isNonSchoolDay(currentDate, nonSchoolDays)) {
      const dayOfWeek = currentDate.getDay()
      if (preferredDays.includes(dayOfWeek)) {
        availableDates.push({
          date: new Date(currentDate),
          availableSlots: maxMatchesPerDay
        })
      }
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return availableDates
}

export function formatMexicanDate(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}