import React, { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (taskFile: File, resultsFile: File) => void;
}

interface FileState {
  file: File | null;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [taskFile, setTaskFile] = useState<FileState>({
    file: null,
    error: null,
  });
  const [resultsFile, setResultsFile] = useState<FileState>({
    file: null,
    error: null,
  });
  const [dragOver, setDragOver] = useState<"task" | "results" | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return "Please select a CSV file";
    }
    if (file.size > 100 * 1024 * 1024) {
      // 10MB limit
      return "File size must be less than 100MB";
    }
    return null;
  };

  const handleFileSelect = (file: File, type: "task" | "results") => {
    const error = validateFile(file);
    if (type === "task") {
      setTaskFile({ file: error ? null : file, error });
    } else {
      setResultsFile({ file: error ? null : file, error });
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent, type: "task" | "results") => {
      e.preventDefault();
      setDragOver(type);
    },
    []
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "task" | "results") => {
      e.preventDefault();
      setDragOver(null);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0], type);
      }
    },
    []
  );

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "task" | "results"
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const removeFile = (type: "task" | "results") => {
    if (type === "task") {
      setTaskFile({ file: null, error: null });
    } else {
      setResultsFile({ file: null, error: null });
    }
  };

  const canProceed =
    taskFile.file && resultsFile.file && !taskFile.error && !resultsFile.error;

  const handleProceed = () => {
    if (canProceed) {
      onFilesSelected(taskFile.file!, resultsFile.file!);
    }
  };

  const FileDropZone: React.FC<{
    title: string;
    description: string;
    type: "task" | "results";
    fileState: FileState;
  }> = ({ title, description, type, fileState }) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          dragOver === type
            ? "border-blue-400 bg-blue-50"
            : fileState.file
            ? "border-green-400 bg-green-50"
            : fileState.error
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }`}
        onDragOver={(e) => handleDragOver(e, type)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, type)}
      >
        {fileState.file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {fileState.file.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(fileState.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            <button
              onClick={() => removeFile(type)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                fileState.error ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              {fileState.error ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <Upload className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-sm text-gray-500">or</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileInputChange(e, type)}
                  className="hidden"
                />
              </label>
            </div>
            {fileState.error && (
              <p className="mt-3 text-sm text-red-600">{fileState.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Upload Your CSV Files
          </h1>
          <p className="text-gray-600">
            Please upload both CSV files to begin your analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <FileDropZone
            title="Task List File"
            description="Upload the CSV file containing your task data"
            type="task"
            fileState={taskFile}
          />

          <FileDropZone
            title="Results File"
            description="Upload the CSV file containing expert evaluations"
            type="results"
            fileState={resultsFile}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canProceed
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {canProceed ? "Analyze Files" : "Please select both files"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">File Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Both files must be in CSV format</li>
            <li>• Maximum file size: 10MB per file</li>
            <li>• Task list should contain task data with headers</li>
            <li>• Results file should contain expert evaluation data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
