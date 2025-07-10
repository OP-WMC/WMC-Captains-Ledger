import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.y += this.speedY;
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(0, 224, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', formData);
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden text-[#00e0ff] font-serif">
      <canvas id="particles" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>

      <div className="fixed bottom-5 left-5 w-12 opacity-10 z-10 animate-spin-slow">
        <Shield className="w-full h-full" />
      </div>

      <div className="relative z-20 flex justify-center items-center h-full">
        <div className="w-[90%] max-w-md bg-black/80 backdrop-blur-lg border-2 border-cyan-400 p-6 rounded-xl shadow-lg animate-glow-border">
          <h2 className="text-2xl md:text-3xl text-center mb-6 font-normal">Avenger's Authentication</h2>

          {error && (
            <div className="mb-4 text-sm p-3 bg-red-500/20 border border-red-400 text-red-300 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                name="email"
                placeholder="tonystark@outlook.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 pr-10 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 text-black font-bold py-2 rounded-md hover:bg-cyan-300 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access Command Center'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-cyan-300">
            New Avenger?{' '}
            <a href="/register" className="hover:underline text-cyan-200">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
