import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    codename: '',
    power: '',
    abilities: [],
    weapons: [],
    pastAchievements: '',
    profilePhoto: '',
    pastSuccessRate: '',
    missionStyle: 'Tech',
    availability: 'Always Available',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);
  // const [initialLoading, setInitialLoading] = useState(true);

  
    useEffect(() => {
      const canvas = document.getElementById('particles');
      if (!canvas) return; // avoid error if null
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      const particles = [];
  
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() *7 + 1;
          this.speedY = Math.random() * 5 + 0.5;
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

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        codename: user.codename || '',
        power: user.power || '',
        abilities: user.abilities || [],
        abilitiesRaw: (user.abilities || []).join(', '),
        weapons: user.weapons || [],
        weaponsRaw: (user.weapons || []).join(', '),
        pastAchievements: user.pastAchievements || '',
        profilePhoto: user.profilePhoto || '',
        pastSuccessRate: user.pastSuccessRate || '',
        missionStyle: user.missionStyle || 'Tech',
        availability: user.availability || 'Always Available',
      });
      setPhotoPreview(user.profilePhoto || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

   const handleArrayChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name + 'Raw']: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profilePhoto: reader.result }));
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setMessage('');

  try {
    // Convert weaponsRaw → weapons array
    const processedWeapons = form.weaponsRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

         const processedAbilities = form.abilitiesRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    // Build final payload excluding weaponsRaw
    const finalFormData = {
      ...form,
      weapons: processedWeapons,
      abilities: processedAbilities,
    };
    delete finalFormData.weaponsRaw;
    delete finalFormData.abilitiesRaw;

    const res = await fetch('http://localhost:5000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(finalFormData),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage(data.error || 'Failed to update profile.');
    }
  } catch (err) {
    setMessage('Error updating profile.');
  } finally {
    setSaving(false);
  }
};


  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  );
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 w-full max-w-full overflow-visible ">
       <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>
      <div className="w-full max-w-md sm:max-w-3xl bg-white/80  rounded-2xl shadow-2xl p-4 sm:p-12 glass-card">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-blue-700 dark:text-white  drop-shadow-lg">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-7 mt-2">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-blue-300 dark:border-gray-300 shadow-lg bg-white dark:bg-[#0f172a] mx-auto" />
            ) : (
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-blue-200 dark:bg-[#0f172a] flex items-center justify-center border-4 border-blue-300 dark:border-gray-200 text-lg sm:text-2xl font-bold text-blue-500 dark:text-white shadow-lg mx-auto">No Photo</div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 sm:mt-3 text-xs mx-auto" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Codename</label>
              <input type="text" name="codename" value={form.codename} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
<div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Power</label>
              <input type="text" name="power" value={form.power} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base" />
            </div>
            <div className="flex-1">
  <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">
    Abilities (comma separated)
  </label>
  <input
    type="text"
    name="abilities"
    value={form.abilitiesRaw}
    onChange={(e) => handleArrayChange('abilities', e.target.value)}
    className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base"
  />
</div>
</div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
  <div className="flex-1">
    <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">
      Weapons (comma separated)
    </label>
    <input
      type="text"
      name="weapons"
      value={form.weaponsRaw}
      onChange={(e) => handleArrayChange('weapons', e.target.value)}
      className="w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base"
    />
  </div>


            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Past Achievements</label>
              <textarea name="pastAchievements" value={form.pastAchievements} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Past Success Rate (%)</label>
              <input type="number" name="pastSuccessRate" min="0" max="100" value={form.pastSuccessRate} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base" placeholder="e.g. 85" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Mission Style</label>
              <div className="block sm:hidden w-full max-w-[180px]">
                <button
                  type="button"
                  onClick={() => setMobileDropdownOpen('missionStyle')}
                  className="p-2 rounded-lg bg-white dark:bg-blue-700/30 dark:text-black text-blue-700 font-semibold border border-blue-200 dark:border-cyan-400 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
                >
                  {form.missionStyle}
                  <span className="ml-2">▼</span>
                </button>
                {mobileDropdownOpen === 'missionStyle' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                      <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Select Mission Style</h3>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {['Tech', 'Stealth', 'Bruteforce'].map(option => (
                          <li key={option}>
                            <button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${form.missionStyle === option ? 'font-bold' : ''}`} onClick={() => { setForm(f => ({ ...f, missionStyle: option })); setMobileDropdownOpen(null); }}>{option}</button>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs" onClick={() => setMobileDropdownOpen(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <select name="missionStyle" value={form.missionStyle} onChange={handleChange} className="hidden sm:block input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base">
                <option value="Tech">Tech</option>
                <option value="Stealth">Stealth</option>
                <option value="Bruteforce">Bruteforce</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-white mb-1 text-xs sm:text-base">Availability</label>
              <div className="block sm:hidden w-full max-w-[180px]">
                <button
                  type="button"
                  onClick={() => setMobileDropdownOpen('availability')}
                  className="p-2 rounded-lg bg-white dark:bg-blue-700/30 dark:text-black text-blue-700 font-semibold border border-blue-200 dark:border-cyan-400 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
                >
                  {form.availability}
                  <span className="ml-2">▼</span>
                </button>
                {mobileDropdownOpen === 'availability' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                      <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Select Availability</h3>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {['Always Available', 'Fixed time', 'Daily', 'Weekly'].map(option => (
                          <li key={option}>
                            <button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${form.availability === option ? 'font-bold' : ''}`} onClick={() => { setForm(f => ({ ...f, availability: option })); setMobileDropdownOpen(null); }}>{option}</button>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs" onClick={() => setMobileDropdownOpen(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <select name="availability" value={form.availability} onChange={handleChange} className="hidden sm:block input input-bordered w-full bg-blue-50 dark:bg-white border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-black text-xs sm:text-base">
                <option value="Always Available">Always Available</option>
                <option value="Fixed time">Fixed time</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full btn btn-primary bg-blue-600 dark:bg-white text-white dark:text-blue-600 font-bold py-2 sm:py-3 rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-700 dark:hover:text-white transition text-xs sm:text-base" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          {message && <div className="mt-2 text-center text-green-600 dark:text-green-400 text-xs sm:text-base">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Profile; 
