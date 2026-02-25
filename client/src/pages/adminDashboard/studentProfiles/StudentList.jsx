const StudentList = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Student Profiles & Knowledge Sharing</h2>
            <div className="space-y-4">
                <section>
                    <h3 className="font-bold text-primary">Module Description</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        This module manages student accounts and academic discussions. Students create profiles with academic interests, which personalize their Q&A feed.
                    </p>
                </section>
                <section>
                    <h3 className="font-bold text-primary text-sm">CRUD Operations:</h3>
                    <ul className="text-xs text-text-secondary list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Create:</strong> Student profile, post questions and answers</li>
                        <li><strong>Read:</strong> View profiles, questions, and expert responses</li>
                        <li><strong>Update:</strong> Edit profile information, questions, or answers</li>
                        <li><strong>Delete:</strong> Delete/deactivate profile or remove own posts</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default StudentList;
