import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from '../api/axios';

const Login = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Save token and user to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // ✅ Navigate to dashboard without full page reload
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
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
  {/* Replacing Shield logo with an image */}
  <img
    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB386jr-Vc8_1tTYkdtJx0ydP6zbDnj5FA4lq-08bp5ilD7DfBcDhd5CwLgeeIXP_nX3u3Bzz-raB5Ls8aHj1RWnrO9la4xqQfQjAlZzc40zkP4quMnIEWuIc-mSLYES7v6Jown1NjJmkg4yE_DPZUQKuS0UMABwYIiuVwgJU3IEUQKMj9nDr3qADaa70IDTJvl_fVwUg5N0wjfgb7uc7iUy_Ek9NrUB9ZNF35sFIS-OcfsdbZWWm8kCUF67Czr2FWdPzcBgzEfOuz1"
    alt="Avengers Logo"
    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
  />
  <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
    Captain's Ledger
  </h1>
  <p className="text-avengers-silver">
    Avengers Command Center
  </p>
</div>

        {/* Login Form */}
        <div className="glass-card">
          <h2 className="text-2xl font-orbitron font-semibold text-white mb-6 text-center">
            Avenger's Authentication
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="avengers@gmail.com"
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

            <button
              type="submit"
              disabled={loading}
              className="avengers-button w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Command Center</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-avengers-silver text-sm">
              New avenger?{' '}
              <a href="/register" className="text-avengers-light-blue hover:text-avengers-blue font-medium">
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 glass-card">
          <h3 className="text-lg font-orbitron font-semibold text-white mb-3">
            Demo Credentials
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-avengers-silver">Admin:</span>
              <span className="text-white">captain@avengers.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-avengers-silver">Agent:</span>
              <span className="text-white">bucky@avengers.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-avengers-silver">Password:</span>
              <span className="text-white">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 