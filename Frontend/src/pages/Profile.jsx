import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        codename: user.codename || '',
        power: user.power || '',
        abilities: user.abilities || [],
        weapons: user.weapons || [],
        pastAchievements: user.pastAchievements || '',
        profilePhoto: user.profilePhoto || '',
      });
      setPhotoPreview(user.profilePhoto || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value.split(',').map((v) => v.trim()).filter(Boolean) }));
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
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
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

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-blue-900 dark:via-blue-950 dark:to-black p-6">
      <div className="w-full max-w-3xl glass-card bg-white/80 dark:bg-blue-950/80 rounded-2xl shadow-2xl p-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-cyan-300 drop-shadow-lg">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-7 mt-2">
          <div className="flex flex-col items-center mb-6">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 dark:border-cyan-400 shadow-lg bg-white dark:bg-blue-900 mx-auto" />
            ) : (
              <div className="w-36 h-36 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center border-4 border-blue-300 dark:border-cyan-400 text-2xl font-bold text-blue-500 dark:text-cyan-300 shadow-lg mx-auto">No Photo</div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-3 text-xs mx-auto" />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Codename</label>
              <input type="text" name="codename" value={form.codename} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Power</label>
              <input type="text" name="power" value={form.power} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Abilities (comma separated)</label>
              <input type="text" name="abilities" value={form.abilities.join(', ')} onChange={e => handleArrayChange('abilities', e.target.value)} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Weapons (comma separated)</label>
              <input type="text" name="weapons" value={form.weapons.join(', ')} onChange={e => handleArrayChange('weapons', e.target.value)} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-blue-700 dark:text-cyan-300 mb-1">Past Achievements</label>
              <textarea name="pastAchievements" value={form.pastAchievements} onChange={handleChange} className="input input-bordered w-full bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-cyan-400 text-blue-700 dark:text-cyan-200" />
            </div>
          </div>
          <button type="submit" className="w-full btn btn-primary bg-blue-600 dark:bg-cyan-400 text-white dark:text-blue-900 font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-cyan-300 transition" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          {message && <div className="mt-2 text-center text-green-600 dark:text-green-400">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Profile; 