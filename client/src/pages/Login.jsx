import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/users/login', formData);
            console.log('Login Success', res.data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            if (res.data.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/profiles');
            }
        } catch (err) {
            console.error(err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
                <h1 className="text-3xl font-bold text-primary mb-6 text-center font-heading">Welcome Back</h1>
                {error && <div className="bg-red-50 text-error p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-bg-main border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="student@sliit.lk"
                        />
                    </div>
                    <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-bg-main border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-text-secondary text-sm">
                    Don't have an account? <Link to="/register" className="text-accent font-bold hover:underline">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
