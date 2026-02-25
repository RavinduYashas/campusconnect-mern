const Footer = () => {
    return (
        <footer className="bg-primary-dark text-white py-8 mt-auto font-body">
            <div className="container mx-auto px-6 text-center">
                <p className="mb-4">&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
                <div className="flex justify-center space-x-6 text-sm text-gray-300">
                    <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-accent transition-colors">Contact Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
