import { useEffect, useState, type FormEvent } from 'react'
import { HeartPulse, Dumbbell, Moon, Droplets, Scale, Check } from 'lucide-react'
import { PageHeader, StateMessage, Card } from '../../components/ui'
import { supabase } from '../../lib/supabase'

type HealthLog = {
  id: string
  date: string
  weight: number | null
  sleep_hours: number | null
  water_ml: number | null
  workout: boolean
  notes: string
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Health() {
  const [logs, setLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const today = todayISO()
  const todayLog = logs.find((l) => l.date === today)

  const [weight, setWeight] = useState('')
  const [sleep, setSleep] = useState('')
  const [water, setWater] = useState('')
  const [workout, setWorkout] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('health_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    if (err) {
      setError(
        err.message.includes('schema cache')
          ? 'Tabela não encontrada. Rode o schema-modules.sql no Supabase.'
          : 'Não consegui carregar os dados.',
      )
    } else {
      setLogs((data ?? []) as HealthLog[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // Preenche o formulário com o registro de hoje quando ele chega do banco.
  useEffect(() => {
    if (!todayLog) return
    setWeight(todayLog.weight?.toString() ?? '')
    setSleep(todayLog.sleep_hours?.toString() ?? '')
    setWater(todayLog.water_ml?.toString() ?? '')
    setWorkout(todayLog.workout)
  }, [todayLog?.id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()

    // Um registro por dia — upsert evita duplicar quando ele salva de novo.
    await supabase.from('health_logs').upsert(
      {
        user_id: userData.user!.id,
        date: today,
        weight: weight ? Number(weight) : null,
        sleep_hours: sleep ? Number(sleep) : null,
        water_ml: water ? Number(water) : null,
        workout,
      },
      { onConflict: 'user_id,date' },
    )

    setSaving(false)
    await load()
  }

  const history = logs.filter((l) => l.date !== today)

  return (
    <div>
      <PageHeader title="Saúde" subtitle="Como você está hoje" />

      <StateMessage loading={loading} error={error} />

      {!error && (
        <>
          <Card className="p-5 mb-7">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                <Metric
                  icon={Scale}
                  label="Peso"
                  unit="kg"
                  value={weight}
                  onChange={setWeight}
                  step="0.1"
                />
                <Metric
                  icon={Moon}
                  label="Sono"
                  unit="h"
                  value={sleep}
                  onChange={setSleep}
                  step="0.5"
                />
                <Metric
                  icon={Droplets}
                  label="Água"
                  unit="ml"
                  value={water}
                  onChange={setWater}
                  step="100"
                />
              </div>

              <button
                type="button"
                onClick={() => setWorkout((v) => !v)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 mb-4 border transition-colors ${
                  workout
                    ? 'bg-success/15 border-success/40 text-success'
                    : 'bg-surface-2 border-border text-text-dim hover:text-text'
                }`}
              >
                {workout ? <Check size={16} strokeWidth={3} /> : <Dumbbell size={16} />}
                <span className="text-sm font-medium">
                  {workout ? 'Treinei hoje' : 'Marcar treino'}
                </span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-accent text-black font-semibold py-3
                           disabled:opacity-40 hover:bg-accent-light transition-all"
              >
                {saving ? 'Salvando...' : todayLog ? 'Atualizar hoje' : 'Salvar hoje'}
              </button>
            </form>
          </Card>

          {history.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-text-faint mb-3">Últimos dias</p>
              <div className="space-y-2">
                {history.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 bg-surface border border-border-soft rounded-xl px-4 py-3 text-sm"
                  >
                    <span className="text-text-dim w-16 shrink-0 text-xs">
                      {new Date(l.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <div className="flex gap-4 flex-wrap text-xs text-text-dim">
                      {l.weight != null && <span>{l.weight} kg</span>}
                      {l.sleep_hours != null && <span>{l.sleep_hours}h sono</span>}
                      {l.water_ml != null && <span>{l.water_ml} ml</span>}
                    </div>
                    {l.workout && (
                      <Dumbbell size={14} className="text-success ml-auto shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <p className="text-text-faint text-xs text-center">
              <HeartPulse size={14} className="inline mr-1" />
              Preencha acima para começar seu histórico.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  unit,
  value,
  onChange,
  step,
}: {
  icon: typeof Scale
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  step: string
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs text-text-dim mb-2">
        <Icon size={13} /> {label}
      </span>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-full rounded-xl bg-surface-2 border border-border pl-3 pr-9 py-2.5 text-sm
                     outline-none focus:border-accent transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-faint">
          {unit}
        </span>
      </div>
    </label>
  )
}
