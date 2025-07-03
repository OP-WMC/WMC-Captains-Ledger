import { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from '../api/axios'; // Make sure this is configured like in login
import { useNavigate } from 'react-router-dom'; // Add this at the top if not already

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
      role: 'user' // Optional: send 'admin' if needed
    });

    alert('Registered successfully. Please log in.');
    navigate('/login');
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
    <div className="min-h-screen bg-avengers-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-avengers-blue/20 via-transparent to-avengers-red/20" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-avengers-blue to-avengers-light-blue rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Captain's Ledger
          </h1>
          <p className="text-avengers-silver">
            Avengers Command Center
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-card">
          <h2 className="text-2xl font-orbitron font-semibold text-white mb-6 text-center">
            Agent Registration
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Code Name
              </label>
              <input
                type="text"
                name="codename"
                value={formData.codename}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Your superhero code name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="agent@avengers.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-avengers-silver hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field w-full pr-12"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-avengers-silver hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="avengers-button w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join the Avengers</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-avengers-silver text-sm">
              Already an agent?{' '}
              <a href="/login" className="text-avengers-light-blue hover:text-avengers-blue font-medium">
                Login here
              </a>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-flex items-center space-x-2 text-avengers-silver hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register; 