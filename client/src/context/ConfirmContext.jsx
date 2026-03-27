import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ConfirmContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.askConfirm;
};

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const resolver = useRef();

    const askConfirm = useCallback((message, options = {}) => {
        setConfig({
            message,
            title: options.title || 'Are you sure?',
            confirmText: options.confirmText || 'Yes, Confirm',
            cancelText: options.cancelText || 'Cancel',
            type: options.type || 'danger' // danger, warning, info
        });

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        resolver.current(true);
        setConfig(null);
    };

    const handleCancel = () => {
        resolver.current(false);
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={{ askConfirm }}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancel}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">
                                    {config.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {config.message}
                                </p>
                            </div>
                            <div className="flex bg-gray-50 p-4 gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {config.cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-transform active:scale-95 ${
                                        config.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-primary hover:bg-primary-dark shadow-primary/20'
                                    }`}
                                >
                                    {config.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};
