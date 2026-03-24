import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const CreateSkill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        type: 'offer',
        category: '',
        description: ''
    });
    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchSkillData();
        }
    }, [id]);

    const fetchSkillData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/peer-skills/${id}`);
            const { title, type, category, description } = res.data;
            setFormData({ title, type, category, description });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load skill details.');
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/peer-skills/${id}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/peer-skills', formData, config);
            }
            navigate('/skills');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save skill. Please ensure you are logged in.');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-text-secondary italic">Loading listing details...</div>;

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-primary mb-6 text-center">
                    {isEditMode ? 'Edit Your Skill Listing' : 'Post a New Skill'}
                </h1>

                {error && <div className="bg-error-light/10 text-error p-4 rounded-xl mb-6 text-sm">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">Skill Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="e.g. React.js Mentoring, Graphic Design Help"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Listing Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={onChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-main"
                            >
                                <option value="offer">I am offering</option>
                                <option value="request">I am requesting</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={onChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="e.g. Programming, Arts"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            rows="5"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Describe what you can teach or what you need help with..."
                            required
                        ></textarea>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/skills')}
                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-text-secondary hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Saving...' : (isEditMode ? 'Update Skill' : 'Post Skill')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSkill;
