const SkillList = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Peer Skill Exchange & Student Community Events</h2>
            <div className="space-y-4">
                <section>
                    <h3 className="font-bold text-primary">Module Description</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        This module combines peer skill development and student-organized events. Students can offer or request skills and student communities can manage academic or social events.
                    </p>
                </section>
                <section>
                    <h3 className="font-bold text-primary text-sm">CRUD Operations:</h3>
                    <ul className="text-xs text-text-secondary list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Create:</strong> Create skill listings or community events</li>
                        <li><strong>Read:</strong> View skill offers/requests and upcoming events</li>
                        <li><strong>Update:</strong> Update skill details or event information</li>
                        <li><strong>Delete:</strong> Remove skill listing or cancel event</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default SkillList;
