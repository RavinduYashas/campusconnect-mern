// pages/Home.jsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const Home = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    // Slideshow images - removed buttons
    const slides = [
        {
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop",
            title: "Connect with Peers",
            description: "Join vibrant communities and make lifelong connections",
        },
        {
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop",
            title: "Collaborative Learning",
            description: "Study together, grow together with our study groups",
        },
        {
            image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=600&fit=crop",
            title: "Expert Workshops",
            description: "Learn from industry experts and enhance your skills",
        },
        {
            image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&h=600&fit=crop",
            title: "Knowledge Sharing",
            description: "Ask questions, share insights, and help others grow",
        }
    ];

    // Auto-slideshow
    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // Handle navigation
    const handleNavigation = (path) => {
        console.log('Navigating to:', path);
        navigate(path);
    };

    // Statistics with animation
    const stats = [
        { value: 5000, label: "Active Students", icon: "👨‍🎓", suffix: "+" },
        { value: 150, label: "Study Groups", icon: "📚", suffix: "+" },
        { value: 50, label: "Expert Lecturers", icon: "👨‍🏫", suffix: "+" },
        { value: 200, label: "Workshops", icon: "🎯", suffix: "+" }
    ];

    // Features with correct paths
    const features = [
        {
            title: "Study Groups",
            description: "Join or create study groups based on your faculty and academic year. Collaborate with peers and ace your exams together.",
            icon: "👥",
            color: "from-blue-500 to-cyan-500",
            link: "/groups"
        },
        {
            title: "Skill Exchange",
            description: "Share your expertise and learn new skills from fellow students. Trade skills and grow together.",
            icon: "💡",
            color: "from-purple-500 to-pink-500",
            link: "/skills"
        },
        {
            title: "Workshops",
            description: "Attend expert-led workshops, upload materials, and request sessions on topics you're passionate about.",
            icon: "🎓",
            color: "from-orange-500 to-red-500",
            link: "/workshops"
        },
        {
            title: "Q&A Forum",
            description: "Get answers to your academic questions from peers and experts. Share knowledge and help others.",
            icon: "💬",
            color: "from-green-500 to-teal-500",
            link: "/qa"
        },
        {
            title: "Clubs & Societies",
            description: "Join clubs based on your interests, participate in events, and build your network.",
            icon: "🎭",
            color: "from-yellow-500 to-orange-500",
            link: "/clubs"
        },
        {
            title: "Sports & Fitness",
            description: "Connect with sports enthusiasts, join teams, and stay active on campus.",
            icon: "⚽",
            color: "from-red-500 to-pink-500",
            link: "/sports"
        }
    ];

    // Testimonials
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Computer Science Student",
            image: "https://randomuser.me/api/portraits/women/1.jpg",
            text: "CampusConnect transformed my university experience! I found study groups that helped me ace my exams and made lifelong friends.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Engineering Student",
            image: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "The workshops are incredible! I've learned so much from industry experts. The platform is easy to use and very engaging.",
            rating: 5
        },
        {
            name: "Emily Rodriguez",
            role: "Business Student",
            image: "https://randomuser.me/api/portraits/women/3.jpg",
            text: "The skill exchange feature is brilliant. I taught graphic design and learned coding in return. Win-win!",
            rating: 5
        },
        {
            name: "David Kim",
            role: "Batch Representative",
            image: "https://randomuser.me/api/portraits/men/4.jpg",
            text: "As a batch rep, managing workshop requests has never been easier. The platform helps me connect with students effectively.",
            rating: 5
        }
    ];

    // Animated counter component
    const AnimatedCounter = ({ target, suffix = "" }) => {
        const [count, setCount] = useState(0);
        const counterRef = useRef(null);
        const [hasAnimated, setHasAnimated] = useState(false);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        let start = 0;
                        const duration = 2000;
                        const increment = target / (duration / 16);
                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= target) {
                                setCount(target);
                                clearInterval(timer);
                            } else {
                                setCount(Math.floor(start));
                            }
                        }, 16);
                    }
                },
                { threshold: 0.5 }
            );

            if (counterRef.current) {
                observer.observe(counterRef.current);
            }

            return () => observer.disconnect();
        }, [target, hasAnimated]);

        return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>;
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Slideshow Section - No buttons, only text */}
            <motion.div 
                style={{ opacity, scale }}
                className="relative h-[90vh] min-h-[600px] w-full overflow-hidden"
            >
                {slides.map((slide, index) => (
                    <motion.div
                        key={index}
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: currentSlide === index ? 1 : 0,
                            scale: currentSlide === index ? 1 : 1.1
                        }}
                        transition={{ duration: 0.8 }}
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
                        </div>
                        <div className="relative h-full flex items-center justify-center text-center px-4">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ 
                                    y: currentSlide === index ? 0 : 50,
                                    opacity: currentSlide === index ? 1 : 0
                                }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="max-w-4xl"
                            >
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
                                    {slide.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-200">
                                    {slide.description}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}

                {/* Slideshow Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setCurrentSlide(index);
                                setTimeout(() => setIsAutoPlaying(true), 10000);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                                currentSlide === index ? 'w-8 bg-accent' : 'bg-white/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Welcome Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-20 text-center"
            >
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-heading">
                        Welcome to <span className="text-accent">CampusConnect</span>
                    </h2>
                    <p className="text-xl text-text-secondary mb-8">
                        Your unified platform for student life. Connect, collaborate, and grow with peers and experts.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => handleNavigation('/register')}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => handleNavigation('/profiles')}
                            className="bg-white text-primary border-2 border-primary hover:bg-blue-50 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 cursor-pointer"
                        >
                            Explore
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Statistics Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white"
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                className="text-center"
                            >
                                <div className="text-5xl mb-3">{stat.icon}</div>
                                <div className="text-4xl md:text-5xl font-bold mb-2">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm opacity-90">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Everything You Need</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Discover all the features designed to enhance your university experience
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer"
                                onClick={() => handleNavigation(feature.link)}
                            >
                                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                                <div className="p-6">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold text-primary mb-2">{feature.title}</h3>
                                    <p className="text-text-secondary mb-4">{feature.description}</p>
                                    <span className="text-accent font-bold hover:text-accent-hover inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Learn more 
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What Students Say</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Join thousands of satisfied students who are already using CampusConnect
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/avatars/avatar1.png';
                                        }}
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-xs text-text-secondary">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-text-secondary text-sm italic">"{testimonial.text}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with Sign In and Sign Up buttons */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white"
            >
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join our community today and start your journey towards success
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => handleNavigation('/login')}
                            className="bg-transparent hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 border-2 border-white cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleNavigation('/register')}
                            className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </motion.section>

            
        </div>
    );
};

export default Home;