"use client"

import { Wallet, PiggyBank, FileWarning, HeartPulse, TrendingUp, ShoppingBag, ShieldCheck, Bot } from "lucide-react"
import type { EstadoJuego, Jugador } from "@/lib/use-game"
import { NOMBRE_ZONA, MAX_PAGARES } from "@/lib/use-game"
import { dinero, numero } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BOTON_CREDITO, BOTON_AHORRO } from "@/components/zone-panel"

interface StatDashboardProps {
  estado: EstadoJuego
  jugadorActivoId?: number
  onCredito: (jugadorId: number) => void
  onRetirar: (jugadorId: number, monto: number) => void
  onToggleBot: (jugadorId: number) => void
}

function PlayerCard({
  jugador,
  activo,
  mostrarAcciones,
  onCredito,
  onRetirar,
  onToggleBot,
}: {
  jugador: Jugador
  activo: boolean
  mostrarAcciones: boolean
  onCredito: (jugadorId: number) => void
  onRetirar: (jugadorId: number, monto: number) => void
  onToggleBot: (jugadorId: number) => void
}) {
  const zonaLabel =
    jugador.zona === null
      ? null
      : jugador.zona === "credito"
      ? "Créditos"
      : NOMBRE_ZONA[jugador.zona as number]

  const enCredito = jugador.zona === "credito"
  const barato = enCredito && !jugador.creditoBaratoUsado
  const pagaresQueDaria = barato ? 5 : 6
  const creditoDisponible = jugador.pagares + pagaresQueDaria <= MAX_PAGARES

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        activo ? "border-primary/60 bg-primary/5" : "border-border/60 bg-background",
        jugador.esBot && "border-dashed",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            activo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {jugador.id + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-none truncate">{jugador.nombre}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Hogar #{jugador.hogar.numero}
            {zonaLabel ? ` · ${zonaLabel}` : ""}
            {jugador.sobreEndeudado ? " · ⚠ Sobre-endeudado" : ""}
          </p>
        </div>
        {activo && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
            Turno
          </span>
        )}
        <button
          type="button"
          onClick={() => onToggleBot(jugador.id)}
          title={jugador.esBot ? "Bot activado (toca para volver a control manual)" : "Activar control por bot"}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
            jugador.esBot
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-muted/50",
          )}
        >
          <Bot className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <Stat
          icono={Wallet}
          valor={dinero(jugador.efectivo)}
          label="Dinero"
          color="text-cash"
        />
        <Stat
          icono={HeartPulse}
          valor={numero(jugador.bienestar)}
          label="Bienestar"
          color="text-wellbeing-foreground"
        />
        <Stat
          icono={PiggyBank}
          valor={dinero(jugador.ahorro)}
          label="Ahorro"
          color="text-savings"
        />
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-1">
        <Counter icono={TrendingUp} valor={jugador.inversiones.length} label="Inv." />
        <Counter icono={ShoppingBag} valor={jugador.compras.length} label="Comp." />
        <Counter icono={FileWarning} valor={jugador.pagares} label="Pag." warn={jugador.pagares > 0} />
        <Counter icono={ShieldCheck} valor={jugador.seguros} label="Seg." />
      </div>

      {/* Crédito y ahorro: disponibles en cualquier momento (zonas 1 a 10).
          Para jugadores-bot no se muestran: el bot solo actúa en sus zonas de turno, y
          el sistema automático de Zona 8 le pide crédito si le hace falta. */}
      {mostrarAcciones && !jugador.esBot && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            className={cn("h-6 flex-1 min-w-fit gap-1 px-2 text-[10px]", BOTON_CREDITO)}
            disabled={!creditoDisponible}
            onClick={() => onCredito(jugador.id)}
            title={creditoDisponible ? undefined : `Superaría el máximo de ${MAX_PAGARES} pagarés`}
          >
            Crédito +${600}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn("h-6 flex-1 min-w-fit px-2 text-[10px]", BOTON_AHORRO)}
            disabled={jugador.ahorro < 100}
            onClick={() => onRetirar(jugador.id, 100)}
          >
            Retirar $100
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn("h-6 flex-1 min-w-fit px-2 text-[10px]", BOTON_AHORRO)}
            disabled={jugador.ahorro < 500}
            onClick={() => onRetirar(jugador.id, 500)}
          >
            Retirar $500
          </Button>
        </div>
      )}
    </div>
  )
}

function Stat({
  icono: Icono,
  valor,
  label,
  color,
}: {
  icono: React.ElementType
  valor: string
  label: string
  color: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5 text-center">
      <p className={cn("text-sm font-bold tabular-nums leading-none", color)}>{valor}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function Counter({
  icono: Icono,
  valor,
  label,
  warn = false,
}: {
  icono: React.ElementType
  valor: number
  label: string
  warn?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icono
        className={cn("size-3.5", warn && valor > 0 ? "text-debt" : "text-muted-foreground")}
        aria-hidden
      />
      <span className={cn("text-xs font-semibold tabular-nums", warn && valor > 0 ? "text-debt" : "")}>
        {valor}
      </span>
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}

export function StatDashboard({ estado, jugadorActivoId, onCredito, onRetirar, onToggleBot }: StatDashboardProps) {
  const mostrarAcciones = estado.fase === "juego" && estado.zonaActual >= 1 && estado.zonaActual <= 10
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-0.5">Jugadores</p>
      {estado.jugadores.map((jugador) => (
        <PlayerCard
          key={jugador.id}
          jugador={jugador}
          activo={jugador.id === jugadorActivoId}
          mostrarAcciones={mostrarAcciones}
          onCredito={onCredito}
          onRetirar={onRetirar}
          onToggleBot={onToggleBot}
        />
      ))}
    </div>
  )
}
