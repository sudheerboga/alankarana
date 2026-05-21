import { useEffect, useState } from 'react';

const MAROON = '#8B1A3A';
const GOLD   = '#B8924E';
const BG     = '#FAFAF7';
const FONT   = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const SplashScreen = ({ done = false }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes alk-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes alk-pulse  { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes alk-orb1   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,-18px)} }
        @keyframes alk-orb2   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,14px)} }
        @keyframes alk-fade   { to{opacity:0;pointer-events:none} }
        @keyframes alk-spin   { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0,
        background: BG,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflow: 'hidden',
        animation: done ? 'alk-fade 0.38s ease forwards' : 'none',
      }}>

        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '9%', left: '7%',
          width: 280, height: 280, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(139,26,58,0.11) 0%, transparent 70%)`,
          animation: 'alk-orb1 9s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '11%', right: '5%',
          width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(184,146,78,0.09) 0%, transparent 70%)`,
          animation: 'alk-orb2 11s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Decorative rings */}
        <div style={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          border: `1px solid rgba(139,26,58,0.09)`,
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.9s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          border: `1px solid rgba(184,146,78,0.06)`,
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1.1s 0.25s',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          opacity: 1,
          transform: phase >= 0 ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          marginBottom: 28, position: 'relative', zIndex: 2,
          animation: phase >= 1 ? 'alk-float 4s ease-in-out infinite' : 'none',
        }}>
          {/* Glow halo */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(139,26,58,0.16) 0%, transparent 70%)`,
            filter: 'blur(12px)', zIndex: -1,
          }} />
          {/* Icon box */}
          <div style={{
            width: 100, height: 100, borderRadius: 26, overflow: 'hidden',
            background: '#FFFFFF',
            border: `1.5px solid rgba(139,26,58,0.14)`,
            boxShadow: '0 20px 56px rgba(139,26,58,0.16), 0 4px 12px rgba(139,26,58,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src="/favicon/apple-touch-icon.png"
              alt="Alankarana"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span style="font-family:${FONT};font-size:42px;font-weight:800;color:${MAROON}">A</span>`;
              }}
            />
          </div>
        </div>

        {/* App name */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.1s',
          textAlign: 'center', marginBottom: 10, position: 'relative', zIndex: 2,
        }}>
          <span style={{
            fontFamily: FONT,
            fontSize: 30, fontWeight: 800,
            letterSpacing: '-0.03em',
            background: `linear-gradient(125deg, ${MAROON} 0%, ${GOLD} 55%, ${MAROON} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Alankarana
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s 0.15s',
          textAlign: 'center', marginBottom: 64,
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 11,
            color: `rgba(139,26,58,0.55)`,
            letterSpacing: '0.22em',
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            Collections
          </div>
          <div style={{
            width: 38, height: 1,
            background: `linear-gradient(90deg, ${MAROON}, ${GOLD})`,
            margin: '10px auto 0', borderRadius: 1, opacity: 0.45,
          }} />
        </div>

        {/* Loading dots */}
        <div style={{
          position: 'absolute', bottom: 52,
          display: 'flex', gap: 8,
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 0.4s 0.3s',
          zIndex: 2,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === 1 ? GOLD : MAROON,
              animation: `alk-pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SplashScreen;
