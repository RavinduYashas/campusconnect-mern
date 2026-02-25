import React from "react";

const AvatarSelector = ({ selectedAvatar, setSelectedAvatar }) => {
    const avatars = [
        "src/assets/images/Avatars/avatar1.png",
        "src/assets/images/Avatars/avatar2.png",
        "src/assets/images/Avatars/avatar3.png",
        "src/assets/images/Avatars/avatar4.png",
        "src/assets/images/Avatars/avatar5.png",
        "src/assets/images/Avatars/avatar6.png",
        "src/assets/images/Avatars/avatar7.png",
        "src/assets/images/Avatars/avatar8.png",
        "src/assets/images/Avatars/avatar9.png",
        "src/assets/images/Avatars/avatar10.png",
        "src/assets/images/Avatars/avatar11.png",
        "src/assets/images/Avatars/avatar12.png",
        "src/assets/images/Avatars/avatar13.png",
        "src/assets/images/Avatars/avatar14.png",
        "src/assets/images/Avatars/avatar15.png",
        "src/assets/images/Avatars/avatar16.png",
        "src/assets/images/Avatars/avatar17.png",
        "src/assets/images/Avatars/avatar18.png",
        "src/assets/images/Avatars/avatar19.png",
        "src/assets/images/Avatars/avatar20.png",
        "src/assets/images/Avatars/avatar21.png",
        "src/assets/images/Avatars/avatar22.png",
        "src/assets/images/Avatars/avatar23.png",
        "src/assets/images/Avatars/avatar24.png",
        "src/assets/images/Avatars/avatar25.png",
        "src/assets/images/Avatars/avatar26.png",
        "src/assets/images/Avatars/avatar27.png",
        "src/assets/images/Avatars/avatar28.png",
        "src/assets/images/Avatars/avatar29.png",
        "src/assets/images/Avatars/avatar30.png",

    ];

    return (
        <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-4 text-center">
                Select Your Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 px-2">
                {avatars.map((img, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedAvatar(img)}
                        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-110 ${selectedAvatar === img
                            ? "ring-4 ring-primary ring-offset-2 scale-110"
                            : "opacity-60 hover:opacity-100"
                            } rounded-full overflow-hidden w-16 h-16 mx-auto`}
                    >
                        <img
                            src={img}
                            alt={`Avatar ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {selectedAvatar === img && (
                            <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvatarSelector;
