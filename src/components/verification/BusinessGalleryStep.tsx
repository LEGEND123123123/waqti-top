import React, { useCallback } from 'react';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { BusinessGallery, PortfolioWork } from '../../types/verification';

interface BusinessGalleryStepProps {
  data: BusinessGallery;
  onChange: (data: BusinessGallery) => void;
  errors: Record<string, string>;
  onPrevWork: () => void;
  onNextWork: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

const BusinessGalleryStep: React.FC<BusinessGalleryStepProps> = ({
  data,
  onChange,
  errors,
  onPrevWork,
  onNextWork,
  canGoPrev,
  canGoNext
}) => {
  const currentWork = data.works[data.currentWork];
  const workNumber = data.currentWork + 1;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const newWorks = [...data.works];
      newWorks[data.currentWork] = {
        ...currentWork,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file)
      };
      onChange({ ...data, works: newWorks });
    }
  }, [data, currentWork, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  const updateCurrentWork = (updates: Partial<PortfolioWork>) => {
    const newWorks = [...data.works];
    newWorks[data.currentWork] = { ...currentWork, ...updates };
    onChange({ ...data, works: newWorks });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Add portfolio</h2>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-right mb-4">Add your portfolio</h3>
        <div className="text-right space-y-2 text-sm text-gray-700">
          <p>• Add your top 3 recent works that demonstrate your expertise in your field. The Waqti team will review the works before accepting your application.</p>
          <p>• Add work that you have done yourself and that is not copied or transferred.</p>
          <p>• Ensure that the work is distinctive and of high quality.</p>
          <p>• Write a clear title and an accurate description that explains the features of the business.</p>
          <p>• Do not send blank or duplicate work.</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onPrevWork}
            disabled={!canGoPrev}
            className={`p-2 rounded-lg ${canGoPrev ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">Work {workNumber} of 3</h3>
          <button
            type="button"
            onClick={onNextWork}
            disabled={!canGoNext}
            className={`p-2 rounded-lg ${canGoNext ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              <span className="text-red-500">*</span> Work title
            </label>
            <input
              type="text"
              value={currentWork.title}
              onChange={(e) => updateCurrentWork({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
              placeholder="Include a brief title that accurately describes the work"
            />
            {errors.workTitle && <p className="text-red-500 text-sm mt-1">{errors.workTitle}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              <span className="text-red-500">*</span> Thumbnail
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[#2E86AB] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {currentWork.thumbnailUrl ? (
                <div className="space-y-4">
                  <img
                    src={currentWork.thumbnailUrl}
                    alt="Work thumbnail"
                    className="max-h-32 mx-auto rounded"
                  />
                  <p className="text-sm text-gray-600">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto text-gray-400" size={48} />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Drag image here</p>
                    <p className="text-sm text-gray-500">Or click to select manually</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              Add an attractive image that expresses the work
            </p>
            {errors.workThumbnail && <p className="text-red-500 text-sm mt-1">{errors.workThumbnail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              <span className="text-red-500">*</span> Job description
            </label>
            <textarea
              value={currentWork.description}
              onChange={(e) => updateCurrentWork({ description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
              placeholder="Add a detailed description that explains the features of the job"
            />
            {errors.workDescription && <p className="text-red-500 text-sm mt-1">{errors.workDescription}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessGalleryStep;