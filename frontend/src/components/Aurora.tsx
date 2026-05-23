export function Aurora({ embers = 50 }: { embers?: number }) {
  const colors = ["#ffffff", "#c4b5fd", "#f9a8d4", "#67e8f9"];
  return (
    <>
      <div className="aurora" />
      <div className="embers">
        {Array.from({ length: embers }).map((_, i) => {
          const left = Math.random() * 100;
          const dur = 10 + Math.random() * 16;
          const delay = -Math.random() * dur;
          const size = 2 + Math.random() * 4;
          const color = colors[i % colors.length];
          return (
            <span
              key={i}
              className="ember"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                boxShadow: `0 0 ${size * 2}px ${color}`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
