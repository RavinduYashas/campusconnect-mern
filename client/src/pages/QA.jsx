// import { useState } from 'react';
// import { motion } from 'framer-motion';

// const QA = () => {
//     const [questions, setQuestions] = useState([
//         {
//             id: 1,
//             question: "How do I join a study group for Advanced Algorithms?",
//             author: "John Doe",
//             date: "2 hours ago",
//             answers: 3,
//             tags: ["Algorithms", "Study Group"],
//             expertAnswer: true
//         },
//         {
//             id: 2,
//             question: "What are the requirements for the Skill Exchange program?",
//             author: "Jane Smith",
//             date: "5 hours ago",
//             answers: 1,
//             tags: ["Skill Exchange", "Requirements"],
//             expertAnswer: false
//         }
//     ]);

//     return (
//         <div className="min-h-screen bg-gray-50 py-12">
//             <div className="container mx-auto px-6 max-w-5xl">
//                 {/* Header Section */}
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//                     <div>
//                         <h1 className="text-4xl font-bold text-text-main font-heading mb-2">Knowledge Sharing</h1>
//                         <p className="text-text-secondary">Get answers from peers and verified experts in the community.</p>
//                     </div>
//                     <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95">
//                         Ask a Question
//                     </button>
//                 </div>

//                 {/* Search & Filter */}
//                 <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
//                     <div className="flex-grow relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
//                         <input
//                             type="text"
//                             placeholder="Search questions, topics, or keywords..."
//                             className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
//                         />
//                     </div>
//                     <div className="flex gap-2">
//                         <select className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20">
//                             <option>All Topics</option>
//                             <option>Academic</option>
//                             <option>Skill Exchange</option>
//                             <option>Campus Life</option>
//                         </select>
//                         <select className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20">
//                             <option>Newest</option>
//                             <option>Most Answered</option>
//                             <option>Expert Verified</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Questions List */}
//                 <div className="space-y-4">
//                     {questions.map((q) => (
//                         <motion.div
//                             key={q.id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
//                         >
//                             <div className="flex justify-between items-start mb-4">
//                                 <div className="flex gap-2">
//                                     {q.tags.map(tag => (
//                                         <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary px-3 py-1 rounded-full">
//                                             {tag}
//                                         </span>
//                                     ))}
//                                     {q.expertAnswer && (
//                                         <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
//                                             <span>✓</span> Expert Answered
//                                         </span>
//                                     )}
//                                 </div>
//                                 <span className="text-xs text-text-muted">{q.date}</span>
//                             </div>

//                             <h2 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors mb-4">
//                                 {q.question}
//                             </h2>

//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-8 h-8 rounded-full bg-gray-200" />
//                                     <span className="text-sm font-semibold text-text-secondary">{q.author}</span>
//                                 </div>
//                                 <div className="flex items-center gap-4 text-text-muted">
//                                     <div className="flex items-center gap-1">
//                                         <span className="text-lg">💬</span>
//                                         <span className="text-sm font-bold">{q.answers} Answers</span>
//                                     </div>
//                                     <div className="flex items-center gap-1 text-primary">
//                                         <span className="text-sm font-bold">View Discussion →</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>

//                 {/* Load More */}
//                 <div className="mt-12 text-center">
//                     <button className="text-primary font-bold hover:underline">
//                         Load more questions...
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QA;
const QA = () => {
    return (
        <div>
            <h1>Q&A</h1>
            <p>Explore Q&A</p>
        </div>
    );
};

export default QA;