const SportsTeamList = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Sports Management</h2>
            <div className="space-y-4">
                <section>
                    <h3 className="font-bold text-primary">Module Description</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        This module manages sports teams and athletic activities at SLIIT. Students can join teams and administrators manage schedules and details.
                    </p>
                </section>
                <section>
                    <h3 className="font-bold text-primary text-sm">CRUD Operations:</h3>
                    <ul className="text-xs text-text-secondary list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Create:</strong> Create sports teams or athletic activities</li>
                        <li><strong>Read:</strong> View available teams and activities</li>
                        <li><strong>Update:</strong> Update sports team or activity information</li>
                        <li><strong>Delete:</strong> Remove or deactivate organizations</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default SportsTeamList;
