// components/Workshops/WorkshopCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const WorkshopCard = ({ workshop, user, onRegister, onCancel, onRefresh }) => {
  const [showMaterials, setShowMaterials] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getTypeColor = () => {
    switch(workshop.workshopType) {
      case 'upcoming':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-700';
      case 'ended':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = () => {
    switch(workshop.workshopType) {
      case 'upcoming':
        return '⏰';
      case 'ongoing':
        return '🔄';
      case 'ended':
        return '✅';
      default:
        return '📅';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLecturerOrBatchRep = () => {
    if (!user) return false;
    const isBatchRep = user.email && user.email.match(/^batchrep\d{4}@sliitplatform\.com$/);
    const isLecturer = user.email && user.email.match(/^ept\d{3}@sliitplatform\.com$/);
    return isBatchRep || isLecturer || user.role === 'admin';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      
      const uploadRes = await axios.post('/api/upload', formData, config);
      
      const title = prompt('Enter title for this material:', file.name);
      if (!title) {
        setUploading(false);
        return;
      }
      
      const description = prompt('Enter description (optional):', '');
      
      const materialData = {
        title,
        description,
        fileUrl: uploadRes.data.fileUrl,
        fileName: uploadRes.data.fileName,
        fileType: uploadRes.data.fileType,
        fileSize: uploadRes.data.fileSize
      };
      
      await axios.post(`/api/workshops/${workshop._id}/materials`, materialData, config);
      toast.success('Material uploaded successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to upload material');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-primary font-heading line-clamp-1">
            {workshop.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor()}`}>
            {getTypeIcon()} {workshop.workshopType.charAt(0).toUpperCase() + workshop.workshopType.slice(1)}
          </span>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
            {workshop.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {workshop.description}
        </p>

        {/* Workshop Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>📅</span>
            <span>{formatDate(workshop.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>⏱️</span>
            <span>{workshop.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>📍</span>
            <span className="truncate">{workshop.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>👥</span>
            <span>{workshop.registrationCount}/{workshop.capacity} registered</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>👤</span>
            <span>By: {workshop.createdBy?.name || 'Unknown'}</span>
          </div>
        </div>

        {/* Registration Status */}
        {workshop.workshopType !== 'ended' && (
          <div className="mb-4">
            {workshop.isRegistered ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <p className="text-green-700 text-sm font-semibold">✓ Registered</p>
                <button
                  onClick={() => onCancel(workshop._id)}
                  className="mt-1 text-red-600 text-xs hover:underline"
                >
                  Cancel Registration
                </button>
              </div>
            ) : workshop.isOnWaitlist ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                <p className="text-yellow-700 text-sm font-semibold">⏳ On Waitlist</p>
                <button
                  onClick={() => onCancel(workshop._id)}
                  className="mt-1 text-red-600 text-xs hover:underline"
                >
                  Remove from Waitlist
                </button>
              </div>
            ) : (
              <button
                onClick={() => onRegister(workshop._id)}
                disabled={workshop.workshopType === 'ended'}
                className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              >
                Register Now
              </button>
            )}
          </div>
        )}

        {/* Materials Section */}
        {(workshop.materials?.length > 0 || isLecturerOrBatchRep()) && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
            >
              {showMaterials ? '▼' : '▶'} Materials ({workshop.materials?.length || 0})
            </button>
            
            {showMaterials && (
              <div className="mt-2 space-y-2">
                {workshop.materials?.map((material, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-2">
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      📄 {material.title || material.fileName}
                    </a>
                    {material.description && (
                      <p className="text-xs text-text-secondary mt-1">{material.description}</p>
                    )}
                  </div>
                ))}
                
                {isLecturerOrBatchRep() && workshop.workshopType !== 'ended' && (
                  <div className="mt-2">
                    <input
                      type="file"
                      id={`file-upload-${workshop._id}`}
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    />
                    <button
                      onClick={() => document.getElementById(`file-upload-${workshop._id}`).click()}
                      disabled={uploading}
                      className="text-primary text-xs hover:underline flex items-center gap-1"
                    >
                      {uploading ? 'Uploading...' : '+ Add Material'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WorkshopCard;