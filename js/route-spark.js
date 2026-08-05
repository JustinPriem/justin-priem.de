function elevationSpark(elevationM) {
  // Kleine, generierte Zick-Zack-Linie als Platzhalter für ein Höhenprofil
  const pts = [];
  const steps = 8;
  let y = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    y = 24 - Math.sin(i * 1.3 + elevationM) * 10 - (i / steps) * 6;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}
