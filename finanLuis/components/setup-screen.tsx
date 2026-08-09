"use client"

import { useState } from "react"
import { Coins, Plus, Trash2, Play, Shuffle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MIN_JUGADORES, MAX_JUGADORES, type NivelCampeon } from "@/lib/use-game"
import { cn } from "@/lib/utils"

export function SetupScreen({
  onIniciar,
}: {
  onIniciar: (nombres: string[], nivelCampeon: NivelCampeon, primerJugadorIndex: number, botFlags: boolean[]) => void
}) {
  const [nombres, setNombres] = useState<string[]>(["", ""])
  const [bots, setBots] = useState<boolean[]>([false, false])
  const [nivelCampeon, setNivelCampeon] = useState<NivelCampeon>("principiante")
  const [primerJugadorIndex, setPrimerJugadorIndex] = useState(0)

  const agregar = () => {
    if (nombres.length < MAX_JUGADORES) {
      setNombres((prev) => [...prev, ""])
      setBots((prev) => [...prev, false])
    }
  }

  const quitar = (i: number) => {
    if (nombres.length > MIN_JUGADORES) {
      setNombres((prev) => prev.filter((_, idx) => idx !== i))
      setBots((prev) => prev.filter((_, idx) => idx !== i))
      setPrimerJugadorIndex((prev) => (prev >= nombres.length - 1 ? 0 : prev))
    }
  }

  const cambiar = (i: number, val: string) => {
    setNombres((prev) => prev.map((n, idx) => (idx === i ? val : n)))
  }

  const toggleBot = (i: number) => {
    setBots((prev) => prev.map((b, idx) => (idx === i ? !b : b)))
  }

  const nombreODefault = (n: string, i: number) => n.trim() || `Jugador ${i + 1}`

  const sortearPrimerJugador = () => {
    setPrimerJugadorIndex(Math.floor(Math.random() * nombres.length))
  }

  const handleIniciar = () => {
    const indiceValido = Math.min(primerJugadorIndex, nombres.length - 1)
    onIniciar(
      nombres.map((n, i) => nombreODefault(n, i)),
      nivelCampeon,
      indiceValido,
      bots,
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center pb-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-3 shadow">
            <Coins className="size-7" aria-hidden />
          </div>
          <CardTitle className="text-2xl">FinLuis</CardTitle>
          <p className="text-sm text-muted-foreground">Estrategia financiera · 10 años</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Jugadores ({nombres.length})</p>
            {nombres.map((nombre, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <input
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  placeholder={`Jugador ${i + 1}`}
                  value={nombre}
                  maxLength={20}
                  onChange={(e) => cambiar(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleIniciar()}
                />
                <button
                  type="button"
                  onClick={() => toggleBot(i)}
                  title={bots[i] ? "Controlado por bot (decide al azar)" : "Controlado manualmente"}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    bots[i]
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Bot className="size-4" aria-hidden />
                </button>
                {nombres.length > MIN_JUGADORES && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => quitar(i)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Toca el ícono <Bot className="inline size-3 align-text-bottom" aria-hidden /> para que un jugador sea
              controlado por la app (decide al azar entre las opciones válidas). También puedes
              activarlo o desactivarlo durante la partida.
            </p>
          </div>

          {nombres.length < MAX_JUGADORES && (
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={agregar}>
              <Plus className="size-4" aria-hidden />
              Agregar jugador
            </Button>
          )}

          {/* Primer jugador: según la regla, empieza el de menor edad (o a quien el grupo elija) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">¿Quién empieza primero?</p>
              <button
                type="button"
                onClick={sortearPrimerJugador}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shuffle className="size-3" aria-hidden />
                Sortear
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Por regla, empieza el jugador de menor edad. Elígelo o sortéalo si prefieren.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nombres.map((nombre, i) => {
                const elegido = Math.min(primerJugadorIndex, nombres.length - 1) === i
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrimerJugadorIndex(i)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      elegido
                        ? "border-primary/60 bg-primary/10 text-primary font-medium"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {nombreODefault(nombre, i)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Nivel de campeón</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNivelCampeon("principiante")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  nivelCampeon === "principiante"
                    ? "border-primary/60 bg-primary/5 text-primary"
                    : "border-border/60 hover:bg-muted/50",
                )}
              >
                <span className="block font-semibold text-sm">Principiante</span>
                <span className="block text-muted-foreground break-words">
                  (Bienestar × 2) + Dinero + Ahorro
                </span>
              </button>
              <button
                type="button"
                onClick={() => setNivelCampeon("avanzado")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  nivelCampeon === "avanzado"
                    ? "border-primary/60 bg-primary/5 text-primary"
                    : "border-border/60 hover:bg-muted/50",
                )}
              >
                <span className="block font-semibold text-sm">Avanzado</span>
                <span className="block text-muted-foreground break-words">
                  + coste de productos y negocios ÷ 4
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-[11px] uppercase tracking-wide">Metas para ganar</p>
            <p>✦ Bienestar ≥ 300 &nbsp;✦ Ahorro ≥ $500</p>
            <p>✦ 0 pagarés &nbsp;✦ Al menos 1 inversión</p>
          </div>

          <Button className="w-full gap-2" disabled={nombres.length < MIN_JUGADORES} onClick={handleIniciar}>
            <Play className="size-4" aria-hidden />
            Comenzar partida
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
