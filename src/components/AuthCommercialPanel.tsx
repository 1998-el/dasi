import { Link } from 'react-router-dom'
import { ChefHat, ShoppingBag, Pill, TrendingUp, Users, ShieldCheck } from 'lucide-react'

export function AuthCommercialPanel({ backLink }: { backLink?: { to: string; label: string } }) {
  return (
    <div
      className="hidden lg:flex lg:w-7/12 flex-col justify-between p-10 xl:p-12 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(560px 420px at 85% -8%, rgba(62,114,238,0.55), transparent 60%), radial-gradient(500px 500px at -10% 105%, rgba(29,79,214,0.55), transparent 60%), linear-gradient(160deg, #0B1642 0%, #123896 62%, #1D4FD6 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          maskImage: 'linear-gradient(to bottom, black, transparent 75%)',
        }}
      />
      <div
        className="absolute rounded-full bg-white"
        style={{ width: 280, height: 280, top: -80, right: -90, filter: 'blur(2px)', opacity: 0.14 }}
      />
      <div
        className="absolute rounded-full bg-white"
        style={{ width: 180, height: 180, bottom: 60, left: -70, filter: 'blur(2px)', opacity: 0.1 }}
      />
      {/* <div className="relative z-10 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-[9px] flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg,#FF8A3D,#3E72EE)' }}
        >
          M
        </div>
        <div>
          <div className="text-white text-sm font-bold leading-tight">MAATICS</div>
          <div className="text-[10px] font-medium tracking-[0.14em] uppercase" style={{ color: '#BFD0FF' }}>
            Food · POS &amp; gestion
          </div>
        </div>
      </div> */}

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="max-w-md mt-2">
       

          <h1 className="text-white text-3xl xl:text-[34px] font-bold leading-[1.18] tracking-tight mb-3">
            Le tableau de bord de<br />
            votre commerce,{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#FFC98A,#FF8A3D)' }}>
              en direct
            </span>
            .
          </h1>

          <p className="text-sm leading-relaxed mb-6" style={{ color: '#C9D5F5' }}>
            Restaurants, boutiques et pharmacies pilotent leurs ventes, leur stock et leurs équipes depuis une seule plateforme, pensée pour le terrain.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <div
              className="flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-xs font-medium"
              style={{ color: '#EAF0FF', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)' }}
            >
              <ChefHat className="h-4 w-4" style={{ color: '#8FE0BF' }} />
              Restaurant
            </div>
            <div
              className="flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-xs font-medium"
              style={{ color: '#EAF0FF', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)' }}
            >
              <ShoppingBag className="h-4 w-4" style={{ color: '#8FE0BF' }} />
              Commerce de détail
            </div>
            <div
              className="flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-xs font-medium"
              style={{ color: '#EAF0FF', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)' }}
            >
              <Pill className="h-4 w-4" style={{ color: '#8FE0BF' }} />
              Pharmacie
            </div>
          </div>
        </div>

        <div className="relative mt-10 min-h-[360px]">
          <div className="absolute left-0 right-0 top-0 h-[106px] rounded-[5px] bg-white p-4 shadow-[0_20px_45px_rgba(6,14,45,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#CBDBFF' }}>
                  Bonjour, Marc
                </div>
                <div className="text-sm font-bold mt-0.5" style={{ color: '#0B1642' }}>
                  Mama Africa · Service du soir
                </div>
                <div className="text-xl font-bold mt-4" style={{ color: '#0B1642' }}>
                  37 650 <span className="text-xs font-medium ml-1" style={{ color: '#CBDBFF' }}>FCFA aujourd'hui</span>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.16)' }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                En cours
              </div>
            </div>
          </div>

          <div className="absolute top-[150px] w-[172px] h-[108px] bg-white rounded-[5px] p-3.5 shadow-[0_20px_45px_rgba(6,14,45,0.35)]">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B95AC' }}>
                Chiffre d'affaires
              </div>
              <div className="h-6 w-6 rounded-[7px] flex items-center justify-center" style={{ background: '#EAF3DE' }}>
                <TrendingUp className="h-3.5 w-3.5" style={{ color: '#3B6D11' }} />
              </div>
            </div>
            <div className="text-xl font-bold mt-2" style={{ color: '#0B1642' }}>
              37 650
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 text-[10.5px]" style={{ color: '#9AA3B8', borderTop: '0.5px solid #EEF0F6' }}>
              <span>du jour</span>
              <span>FCFA</span>
            </div>
          </div>

          <div className="absolute left-[190px] top-[186px] w-[172px] h-[108px] bg-white rounded-[5px] p-3.5 shadow-[0_20px_45px_rgba(6,14,45,0.35)]">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B95AC' }}>
                Couverts servis
              </div>
              <div className="h-6 w-6 rounded-[7px] flex items-center justify-center" style={{ background: '#FBEAF0' }}>
                <Users className="h-3.5 w-3.5" style={{ color: '#993556' }} />
              </div>
            </div>
            <div className="text-xl font-bold mt-2" style={{ color: '#0B1642' }}>
              9
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 text-[10.5px]" style={{ color: '#9AA3B8', borderTop: '0.5px solid #EEF0F6' }}>
              <span>commandes</span>
              <span>Total</span>
            </div>
          </div>

          <div className="absolute top-[310px] right-0 rounded-[5px] bg-white p-3.5 shadow-[0_20px_45px_rgba(6,14,45,0.35)]">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-[8px] flex items-center justify-center" style={{ background: '#E6F1FB' }}>
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#185FA5' }} />
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#8B95AC' }}>
                  Stock bas
                </div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: '#0B1642' }}>
                  0 article à réapprovisionner
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 flex items-center gap-8 pt-0 mt-auto"
        style={{ borderTop: '0.5px solid rgba(255,255,255,0.16)' }}
      >
        <div>
          <div className="text-xl font-bold text-white">3</div>
          <div className="text-[11px] mt-0.5" style={{ color: '#B7C4EA' }}>
            secteurs couverts
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">24/7</div>
          <div className="text-[11px] mt-0.5" style={{ color: '#B7C4EA' }}>
            suivi en temps réel
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">XAF</div>
          <div className="text-[11px] mt-0.5" style={{ color: '#B7C4EA' }}>
            mobile money inclus
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="text-[11px]" style={{ color: '#B7C4EA' }}>
          © {new Date().getFullYear()} Maatics Food. Tous droits réservés.
        </div>
        {backLink && (
          <Link
            to={backLink.to}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-orange-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {backLink.label}
          </Link>
        )}
      </div>
    </div>
  )
}
