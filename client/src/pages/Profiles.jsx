import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AvatarSelector from '../components/AvatarSelector';

const Profiles = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [avatar, setAvatar] = useState(user?.avatar || '/avatars/avatar1.png');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Profile form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        year: user?.academicInfo?.year || '',
        semester: user?.academicInfo?.semester || '',
        company: user?.professionalInfo?.company || '',
        jobTitle: user?.professionalInfo?.jobTitle || '',
        experienceYears: user?.professionalInfo?.experienceYears || '',
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setUpdating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/users/profile', {
                ...formData,
                avatar
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage and state
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            setMessage('Profile updated successfully!');
            setIsEditMode(false);

            // Auto hide message
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (!user) return <div className="text-center mt-10">Please login to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
                {/* Header/Cover */}
                <div className={`h-32 relative transition-all duration-500 ${user.role === 'admin'
                    ? 'bg-gradient-to-r from-slate-950 via-primary-dark to-slate-950 px-8 flex items-center'
                    : 'bg-gradient-to-r from-primary to-accent'
                    }`}>
                    {user.role === 'admin' && (
                        <div className="hidden sm:block">
                            <h2 className="text-white/20 text-5xl font-black tracking-tighter uppercase italic">Administrator</h2>
                        </div>
                    )}
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="absolute bottom-4 right-8 z-20 px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl hover:bg-white/30 transition-all shadow-lg"
                    >
                        {isEditMode ? "Cancel" : "Edit Profile"}
                    </button>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -top-12 flex flex-col items-center sm:items-start sm:flex-row gap-6">
                        <div className="relative group">
                            <img
                                src={user.role === 'admin' ? '/src/assets/images/avatars/admin.png' : (isEditMode ? avatar : user.avatar)}
                                alt="profile"
                                className={`w-32 h-32 rounded-3xl border-4 shadow-xl object-cover bg-white ${user.role === 'admin' ? 'border-accent' : 'border-white'
                                    }`}
                            />
                            {isEditMode && (
                                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-white text-xs font-bold">Select Avatar</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-14 sm:mt-12 text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-bold text-text-main font-heading">{user.name}</h1>
                            <p className="text-text-secondary font-medium">{user.email}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                                <span className={`px-4 py-1 text-xs font-black rounded-full uppercase tracking-widest shadow-sm ${user.role === 'admin' ? 'bg-accent text-primary' : 'bg-blue-50 text-primary'
                                    }`}>
                                    {user.role}
                                </span>
                                {user.role !== 'admin' && user.field && (
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                        Field: {user.field}
                                    </span>
                                )}
                                {user.role !== 'admin' && user.registerNumber && (
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                        ID: {user.registerNumber}
                                    </span>
                                )}
                                {user.role === 'admin' && (
                                    <span className="px-3 py-1 bg-slate-900 text-accent text-[10px] font-black rounded-full uppercase tracking-widest border border-accent/20">
                                        System Authority
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-2xl text-center font-bold text-sm ${message.includes('success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-error border border-red-100'}`}>
                                {message}
                            </div>
                        )}

                        {isEditMode ? (
                            <form onSubmit={onUpdateProfile} className="space-y-8">
                                {user.role !== 'admin' ? (
                                    <div>
                                        <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                                            Customize Your Identity
                                        </h2>
                                        <AvatarSelector selectedAvatar={avatar} setSelectedAvatar={setAvatar} />
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                            <span className="text-accent text-xl">🛡️</span> Security Protocols
                                        </h2>
                                        <p className="text-sm text-text-secondary mt-2">
                                            Avatar and System ID are locked for Administrative accounts. Profile name and bio can still be customized.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-text-main">General Info</h3>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-text-main">
                                            {user.role === 'admin' ? 'Administrative Access' :
                                                user.role === 'student' ? 'Academic Details' : 'Professional Details'}
                                        </h3>
                                        {user.role === 'admin' ? (
                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                <ul className="text-xs space-y-2 text-text-secondary font-bold uppercase tracking-wide">
                                                    <li className="flex items-center gap-2 text-primary">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> User Management: ENABLED
                                                    </li>
                                                    <li className="flex items-center gap-2 text-primary">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Content Moderation: ENABLED
                                                    </li>
                                                    <li className="flex items-center gap-2 text-primary">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> System Logs: READ-ONLY
                                                    </li>
                                                </ul>
                                            </div>
                                        ) : user.role === 'student' ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Year</label>
                                                    <select
                                                        name="year"
                                                        value={formData.year}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    >
                                                        <option value="">Select Year</option>
                                                        <option value="1">1st Year</option>
                                                        <option value="2">2nd Year</option>
                                                        <option value="3">3rd Year</option>
                                                        <option value="4">4th Year</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Semester</label>
                                                    <select
                                                        name="semester"
                                                        value={formData.semester}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    >
                                                        <option value="">Select Semester</option>
                                                        <option value="1">Semester 1</option>
                                                        <option value="2">Semester 2</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Company</label>
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder="Where do you work?"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Job Title</label>
                                                    <input
                                                        type="text"
                                                        name="jobTitle"
                                                        value={formData.jobTitle}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder="What's your role?"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Experience (Years)</label>
                                                    <input
                                                        type="number"
                                                        name="experienceYears"
                                                        value={formData.experienceYears}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder="How many years?"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center justify-end pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditMode(false)}
                                        className="px-8 py-3 rounded-xl font-bold text-text-secondary border-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="px-10 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                                    >
                                        {updating ? "Saving Changes..." : "Update Profile"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">About Me</h3>
                                            <p className="text-text-main leading-relaxed">
                                                {user.bio || "No bio added yet. Tell people about yourself!"}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                                                {user.role === 'admin' ? 'System Permissions' :
                                                    user.role === 'student' ? 'Academic Progress' : 'Professional Background'}
                                            </h3>
                                            <div className="space-y-4">
                                                {user.role === 'admin' ? (
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                                                            <span className="text-xs font-bold text-text-secondary">Security Clearance</span>
                                                            <span className="text-[10px] font-black bg-slate-900 text-accent px-2 py-0.5 rounded uppercase">Level 10</span>
                                                        </div>
                                                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                                                            <span className="text-xs font-bold text-text-secondary">API Status</span>
                                                            <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase">Encrypted</span>
                                                        </div>
                                                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                                                            <span className="text-xs font-bold text-text-secondary">Access Token</span>
                                                            <span className="text-[10px] font-bold text-text-muted">•••• •••• ••••</span>
                                                        </div>
                                                    </div>
                                                ) : user.role === 'student' ? (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-secondary font-medium">Year</span>
                                                            <span className="text-text-main font-bold">{user.academicInfo?.year || '-'}. Year</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-secondary font-medium">Semester</span>
                                                            <span className="text-text-main font-bold">Semester {user.academicInfo?.semester || '-'}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-secondary font-medium">Company</span>
                                                            <span className="text-text-main font-bold">{user.professionalInfo?.company || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-secondary font-medium">Job Title</span>
                                                            <span className="text-text-main font-bold">{user.professionalInfo?.jobTitle || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-secondary font-medium">Experience</span>
                                                            <span className="text-text-main font-bold">{user.professionalInfo?.experienceYears || '0'} Years</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
                                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                                                {user.role === 'admin' ? 'System Overview' : 'Platform Stats'}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                                    <div className="text-xl font-bold text-text-main">
                                                        {user.role === 'admin' ? 'ALL' : '0'}
                                                    </div>
                                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-tighter">
                                                        {user.role === 'admin' ? 'Access' : 'Posts'}
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                                    <div className="text-xl font-bold text-text-main uppercase">
                                                        {user.role === 'admin' ? 'Live' : '0'}
                                                    </div>
                                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-tighter">
                                                        {user.role === 'admin' ? 'Service' : 'Contribs'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center sm:justify-start">
                                            <button
                                                onClick={handleLogout}
                                                className="px-5 py-2 rounded-lg font-bold text-error border border-error hover:bg-error hover:text-white transition-all transform hover:shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profiles;
