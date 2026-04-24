import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code) return null;

    return (
        <div className="relative group my-4 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center px-4 py-2 bg-[#1a1a1a] border-b border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {language || 'plaintext'}
                </span>
                <button
                    onClick={handleCopy}
                    className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700"
                >
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>
            <div className="max-h-[400px] overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                    language={language?.toLowerCase() || 'javascript'}
                    style={atomDark}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        backgroundColor: '#0d0d0d',
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
