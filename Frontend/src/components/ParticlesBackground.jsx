import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      className="fixed top-0 left-0 w-full h-full -z-10"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        particles: {
          number: {
            value: 60,
            density: { enable: true, area: 800 },
          },
          color: { value: "#00e0ff" },
          // color: { value: "#1D4ED8" },
          shape: { type: "circle" },
          opacity: { value: 0.4 },
          size: { value: 3, random: true },
          move: {
            enable: true,
            speed: 3, // 🚀 Increased speed
            direction: "none",
            outModes: { default: "bounce" },
          },
          links: {
            enable: true,
            distance: 150,
            color: "#00e0ff",
            // color: { value: "#1D4ED8" },
            opacity: 0.5,   // 💡 More visible
            width: 1.8,     // 💪 Thicker lines
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
