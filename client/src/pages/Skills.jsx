import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'offer', 'request'

    // Get current user id from local storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUserId = userInfo ? userInfo._id : null;

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/peer-skills');
            setSkills(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch skills');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                await axios.delete(`http://localhost:5000/api/peer-skills/${id}`, config);
                setSkills(skills.filter((skill) => skill._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete listing');
            }
        }
    };

    const filteredSkills = skills.filter(skill => {
        if (filter === 'all') return true;
        return skill.type === filter;
    });

    if (loading) return <div className="p-8 text-center">Loading skills...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Peer Skill Exchange</h1>
                {userInfo && (
                    <Link
                        to="/skills/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Create Listing
                    </Link>
                )}
            </div>

            <div className="mb-6 flex space-x-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('offer')}
                    className={`px-4 py-2 rounded ${filter === 'offer' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                    Offers to Teach
                </button>
                <button
                    onClick={() => setFilter('request')}
                    className={`px-4 py-2 rounded ${filter === 'request' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                    Requests to Learn
                </button>
            </div>

            {filteredSkills.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No skill listings found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map((skill) => (
                        <div key={skill._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${skill.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {skill.type === 'offer' ? 'Teaching Offer' : 'Learning Request'}
                                    </span>
                                    <span className="text-sm text-gray-500">{new Date(skill.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{skill.title}</h2>
                                <p className="text-sm text-blue-600 font-medium mb-4">{skill.category}</p>
                                <p className="text-gray-600 mb-4 line-clamp-3">{skill.description}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                                        {skill.createdBy?.profilePicture ? (
                                            <img src={`http://localhost:5000${skill.createdBy.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            skill.createdBy?.firstName?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {skill.createdBy?.firstName} {skill.createdBy?.lastName}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                                <Link to={`/skills/${skill._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                    View Details
                                </Link>

                                {currentUserId === skill.createdBy?._id && (
                                    <div className="flex space-x-3">
                                        <Link to={`/skills/edit/${skill._id}`} className="text-gray-500 hover:text-blue-600">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(skill._id)} className="text-gray-500 hover:text-red-600">
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Skills;
