// pages/Workshops.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Workshops = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold text-primary mb-4">Workshops</h1>
                <p className="text-text-secondary text-lg mb-8">
                    Enhance your skills with our expert-led workshops
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">💻</div>
                        <h3 className="text-xl font-bold text-primary mb-2">Web Development Workshop</h3>
                        <p className="text-text-secondary mb-4">
                            Learn modern web development with React, Node.js, and MongoDB.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: March 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-xl font-bold text-primary mb-2">AI & Machine Learning</h3>
                        <p className="text-text-secondary mb-4">
                            Introduction to artificial intelligence and machine learning concepts.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: April 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-xl font-bold text-primary mb-2">Mobile App Development</h3>
                        <p className="text-text-secondary mb-4">
                            Build cross-platform mobile apps with React Native.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: May 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">☁️</div>
                        <h3 className="text-xl font-bold text-primary mb-2">Cloud Computing</h3>
                        <p className="text-text-secondary mb-4">
                            AWS, Azure, and cloud deployment strategies.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: June 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold text-primary mb-2">Cybersecurity Basics</h3>
                        <p className="text-text-secondary mb-4">
                            Learn essential security practices and ethical hacking.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: July 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-bold text-primary mb-2">Data Science Workshop</h3>
                        <p className="text-text-secondary mb-4">
                            Data analysis, visualization, and machine learning with Python.
                        </p>
                        <p className="text-sm text-accent mb-4">Coming Soon: August 2025</p>
                        <button className="text-accent font-bold hover:text-accent-hover transition-colors">
                            Register Interest →
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Workshops;