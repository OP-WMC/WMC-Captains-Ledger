import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    codename: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        codename: formData.codename,
        role: 'user',
      });

      // ✅ Store email locally for OTP page
  localStorage.setItem("pendingEmail", formData.email);
  
      // 🔁 Redirect to OTP page after successful registration
  navigate("/verify-otp", { state: { email: formData.email } });
      // alert('Registered successfully. Please log in.');
      // navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden text-[#00e0ff] font-serif overflow-x-hidden">
      <canvas id="particles" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>

      {/* Spinning Shield Icon */}
      <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 w-8 sm:w-12 opacity-10 z-10 animate-spin-slow">
        <Shield className="w-full h-full" />
      </div>

      {/* Registration Card */}
      <div className="relative z-20 flex justify-center items-center h-full px-2 sm:px-0">
        <div className="w-full max-w-xs sm:max-w-md bg-black/80 backdrop-blur-lg border-2 border-cyan-400 p-4 sm:p-6 rounded-xl shadow-lg animate-glow-border">
          <h2 className="text-xl sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6 font-normal">Join the Initiative 🛡️</h2>

          {error && (
            <div className="mb-2 sm:mb-4 text-xs sm:text-sm p-2 sm:p-3 bg-red-500/20 border border-red-400 text-red-300 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Robert Downey Jr."
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-base"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm">Code Name</label>
              <input
                type="text"
                name="codename"
                placeholder="Tony Stark"
                value={formData.codename}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-base"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm">Email</label>
              <input
                type="email"
                name="email"
                placeholder="tonystark@outlook.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-base"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 pr-8 sm:pr-10 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 pr-8 sm:pr-10 bg-black border border-cyan-400/50 text-cyan-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-300"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 text-black font-bold py-2 rounded-md hover:bg-cyan-300 transition duration-300 disabled:opacity-50 text-xs sm:text-base"
            >
              {loading ? 'Joining...' : 'Assemble Now'}
            </button>
          </form>

          <div className="mt-2 sm:mt-4 text-center text-xs sm:text-sm text-cyan-300">
            Already an Agent?{' '}
            <a href="/login" className="hover:underline text-cyan-200">Login here</a>
          </div>

          {/* <div className="mt-4 text-center">
            <a href="/login" className="inline-flex items-center text-cyan-400 hover:text-cyan-200 transition">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </a>
          </div> */}
          
        </div>
      </div>
    </div>
  );
};

export default Register;
