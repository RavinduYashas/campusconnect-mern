const StudyGroupList = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Study Groups & Workshop Management</h2>
            <div className="space-y-4">
                <section>
                    <h3 className="font-bold text-primary">Module Description</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        This module supports structured academic collaboration. Students can create study groups based on subjects and organize workshops with defined time slots.
                    </p>
                </section>
                <section>
                    <h3 className="font-bold text-primary text-sm">CRUD Operations:</h3>
                    <ul className="text-xs text-text-secondary list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Create:</strong> Create study groups or workshops with time slots</li>
                        <li><strong>Read:</strong> View available groups and workshops</li>
                        <li><strong>Update:</strong> Update group details, workshop schedules, or slot availability</li>
                        <li><strong>Delete:</strong> Delete groups, workshops, or cancel slots</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default StudyGroupList;
