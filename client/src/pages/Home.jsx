import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="text-center">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="py-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl mb-12"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 font-heading">
                    Welcome to <span className="text-accent">CampusConnect</span>
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 font-body">
                    Your unified platform for student life. Connect, collaborate, and grow with peers and experts.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/register" className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Get Started
                    </Link>
                    <Link to="/profiles" className="bg-white text-primary border-2 border-primary hover:bg-blue-50 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1">
                        Explore
                    </Link>
                </div>
            </motion.section>

            <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                    { title: "Knowledge Sharing", desc: "Ask questions and get answers from experts.", icon: "📚", link: "/profiles" },
                    { title: "Skill Exchange", desc: "Trade skills with peers and grow together.", icon: "💡", link: "/skills" },
                    { title: "Community Events", desc: "Join clubs, sports, and study groups.", icon: "🤝", link: "/groups" }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                    >
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-2xl font-bold text-primary mb-2 font-heading">{feature.title}</h3>
                        <p className="text-text-secondary mb-4">{feature.desc}</p>
                        <Link to={feature.link} className="text-accent font-bold hover:text-accent-hover flex items-center">
                            Learn more &rarr;
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
