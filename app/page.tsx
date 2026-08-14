"use client"

import { Coins, CalendarClock, RotateCcw } from "lucide-react"
import { useGame, TOTAL_ANIOS } from "@/lib/use-game"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatDashboard } from "@/components/stat-dashboard"
import { ZonePanel } from "@/components/zone-panel"
import { Market } from "@/components/market"
import { Portfolio } from "@/components/portfolio"
import { ActivityLog } from "@/components/activity-log"
import { EventModal } from "@/components/event-modal"
import { EndGameModal } from "@/components/end-game-modal"
import { RulesDialog } from "@/components/rules-dialog"
import { SetupScreen } from "@/components/setup-screen"

export default function Page() {
  const {
    estado,
    acciones,
    listo,
    jugadorActivo,
    costeInversionConMod,
    costeCompraConMod,
  } = useGame()

  // Pantalla de configuración inicial
  if (!listo || estado.fase === "config") {
    return (
      <SetupScreen
        onIniciar={(nombres, nivelCampeon, primerJugadorIndex, botFlags) => {
          acciones.iniciar(nombres, nivelCampeon, primerJugadorIndex, botFlags)
        }}
      />
    )
  }

  const progreso = (estado.anio / TOTAL_ANIOS) * 100
  // Mercado visible como vista previa en Zona 1 (para decidir dónde posicionarse, siempre
  // visible sin importar de quién sea el turno de colocarse) y habilitado para comprar en
  // Zonas 6 y 7 (ahí se oculta si el turno activo es de un bot, que resuelve solo).
  const mostrarMercado =
    jugadorActivo !== null &&
    (estado.zonaActual === 1 || ((estado.zonaActual === 6 || estado.zonaActual === 7) && !jugadorActivo.esBot))

  return (
    <div className="min-h-dvh pb-4">
      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Coins className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-none truncate">FinLuis</h1>
                <p className="text-[11px] text-muted-foreground">
                  Estrategia financiera · 10 años
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RulesDialog />
              <Button
                variant="ghost"
                size="sm"
                onClick={acciones.reiniciar}
                className="gap-1.5"
              >
                <RotateCcw className="size-4" aria-hidden />
                <span className="hidden sm:inline">Reiniciar</span>
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
              <CalendarClock className="size-4 text-primary" aria-hidden />
              Año {estado.anio}{" "}
              <span className="text-muted-foreground font-normal">de {TOTAL_ANIOS}</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>
        </div>
      </header>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Columna izquierda: stats de todos los jugadores (con crédito/ahorro integrado) + log */}
          <div className="space-y-4 lg:col-span-2">
            <StatDashboard
              estado={estado}
              jugadorActivoId={jugadorActivo?.id}
              onCredito={acciones.credito}
              onRetirar={acciones.retirar}
              onToggleBot={acciones.toggleBot}
            />
            <ActivityLog registro={estado.registro} />
          </div>

          {/* Columna derecha: panel de zona + mercado + portafolio */}
          <div className="space-y-4 lg:col-span-3">
            <ZonePanel
              estado={estado}
              jugadorActivo={jugadorActivo}
              acciones={{
                colocar: acciones.colocar,
                depositar: acciones.depositar,
                comprarSeguro: acciones.comprarSeguro,
                siguienteJugador: acciones.siguienteJugador,
                avanzarZona: acciones.avanzarZona,
                jugarTurnoBot: acciones.jugarTurnoBot,
              }}
            />

            {mostrarMercado && jugadorActivo && (
              <Market
                estado={estado}
                jugadorActivo={jugadorActivo}
                costeInversion={costeInversionConMod}
                costeCompra={costeCompraConMod}
                onComprarInversion={acciones.comprarInversion}
                onComprarCompra={acciones.comprarCompra}
              />
            )}

            {jugadorActivo && <Portfolio jugador={jugadorActivo} />}
          </div>
        </div>
      </main>

      {/* ── Modales ─────────────────────────────────────────────────────── */}
      <EventModal
        imprevisto={estado.imprevistoActual}
        jugadores={estado.jugadores}
        primerJugadorId={estado.jugadores[estado.primerJugador]?.id ?? null}
        onResolver={acciones.resolverImprevisto}
      />
      <EndGameModal
        resultados={estado.resultados}
        nivelCampeon={estado.nivelCampeon}
        onReiniciar={acciones.reiniciar}
      />
    </div>
  )
}
