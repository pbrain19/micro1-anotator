"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Papa from "papaparse";
import { CSVRow, ExpertOpinion, TaskWithDuplicates } from "../types";
import { identifyDuplicateTasks } from "./util";
import {
  saveDataToIndexedDB,
  loadDataFromIndexedDB,
  clearDataFromIndexedDB,
} from "../utils/storage";

interface TaskContextType {
  rawData: CSVRow[];
  expertOpinions: ExpertOpinion[];
  enhancedTasks: TaskWithDuplicates[];
  tasksMap: Map<string, { task: TaskWithDuplicates; index: number }>;
  loading: boolean;
  error: string | null;
  filesUploaded: boolean;
  tasksReady: boolean;
  handleFilesSelected: (taskFile: File, resultsFile: File) => Promise<void>;
  clearAllData: () => Promise<void>;
  getTaskById: (
    taskId: string
  ) => { task: TaskWithDuplicates; index: number } | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [rawData, setRawData] = useState<CSVRow[]>([]);
  const [expertOpinions, setExpertOpinions] = useState<ExpertOpinion[]>([]);
  const [enhancedTasks, setEnhancedTasks] = useState<TaskWithDuplicates[]>([]);
  const [tasksMap, setTasksMap] = useState<
    Map<string, { task: TaskWithDuplicates; index: number }>
  >(new Map());
  const [loading, setLoading] = useState(true); // Start as true since we need to check storage
  const [error, setError] = useState<string | null>(null);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [tasksReady, setTasksReady] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    console.log("Loading data from IndexedDB");
    loadFromStorage();
  }, []);

  // Save data to IndexedDB
  const saveToStorage = async (
    rawData: CSVRow[],
    expertOpinions: ExpertOpinion[]
  ) => {
    const success = await saveDataToIndexedDB(rawData, expertOpinions);
    if (!success) {
      console.error("Failed to save data to IndexedDB");
    }
  };

  // Load data from IndexedDB
  const loadFromStorage = async () => {
    try {
      setLoading(true);
      const data = await loadDataFromIndexedDB();
      if (data) {
        setRawData(data.rawData);
        setExpertOpinions(data.expertOpinions);
        setFilesUploaded(true);
        return true;
      }
    } catch (error) {
      console.error("Failed to load data from IndexedDB:", error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await clearDataFromIndexedDB();
      setRawData([]);
      setExpertOpinions([]);
      setEnhancedTasks([]);
      setTasksMap(new Map());
      setFilesUploaded(false);
      setTasksReady(false);
      setError(null);
    } catch (error) {
      console.error("Failed to clear data from IndexedDB:", error);
    }
  };

  const handleFilesSelected = async (taskFile: File, resultsFile: File) => {
    try {
      setLoading(true);
      setError(null);

      // Read task file
      const taskText = await taskFile.text();

      // Read results file
      const resultsText = await resultsFile.text();

      let parsedRawData: CSVRow[] = [];
      let parsedExpertOpinions: ExpertOpinion[] = [];

      // Parse task data
      Papa.parse<CSVRow>(taskText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
          }
          parsedRawData = results.data;
          setRawData(results.data);
        },
        error: (error: Error) => {
          throw new Error(`Task CSV parsing failed: ${error.message}`);
        },
      });

      // Parse expert opinions
      Papa.parse<Record<string, string>>(resultsText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("Results CSV parsing errors:", results.errors);
          }
          // Transform the data to match our interface
          const transformedData = results.data.map(
            (row: Record<string, string>) => ({
              task_id: row["task ID"] || "",
              programming_language: row["Programming Language"] || "",
              topic: row["topic"] || "",
              category: row["category"] || "",
              task_progress: row["Task Progress"] || "",
              assigned_preference_chooser:
                row["Assigned Preference Chooser"] || "",
              preference_choice: row["Preference Choice"] || "",
              preference_strength:
                row[
                  "Preference Strength (0-3 scale, 0 being nearly identical with low strength of preference and 3 being highly different and a very strong preference for your choice)"
                ] || "",
              preference_justification:
                row[
                  "3+ Sentence Preference Justification (3+ sentences covering the difference in relevance, accuracy, clarity, etc. )"
                ] || "",
              response_a_image:
                row[
                  "INSERT RESPONSE A SUPPORTING IMAGE HERE (if you have more than one image, create a google drive with them all and share the link, make sure to change the sharing permissions so all can view)"
                ] || "",
              response_b_image:
                row[
                  "INSERT RESPONSE B SUPPORTING IMAGE HERE  (if you have more than one image, create a google drive with them all and share the link, make sure to change the sharing permissions so all can view)"
                ] || "",
              assigned_reviewer: row["Assigned Reviewer"] || "",
              review: row["Review"] || "",
              justification_for_review:
                row[
                  "Justification for Review (Why do you agree or disagree with their preference choice in 1-3 sentences?)"
                ] || "",
            })
          );
          parsedExpertOpinions = transformedData;
          setExpertOpinions(transformedData);
        },
        error: (error: Error) => {
          throw new Error(`Results CSV parsing failed: ${error.message}`);
        },
      });

      // Save to IndexedDB after successful parsing
      saveToStorage(parsedRawData, parsedExpertOpinions);
      setFilesUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Process enhanced tasks when both datasets are loaded
  useEffect(() => {
    if (rawData.length > 0 && expertOpinions.length > 0) {
      const enhanced = identifyDuplicateTasks(rawData, expertOpinions);
      setEnhancedTasks(enhanced);

      // Create performance map for O(1) lookups
      const newTasksMap = new Map<
        string,
        { task: TaskWithDuplicates; index: number }
      >();
      enhanced.forEach((task, index) => {
        newTasksMap.set(task.task_id, { task, index });
      });
      setTasksMap(newTasksMap);

      setTasksReady(true);
    } else {
      setEnhancedTasks([]);
      setTasksMap(new Map());
      setTasksReady(false);
    }
  }, [rawData, expertOpinions]);

  // Helper function to get task by ID - O(1) lookup using Map
  const getTaskById = (taskId: string) => {
    return tasksMap.get(taskId) || null;
  };

  const value: TaskContextType = {
    rawData,
    expertOpinions,
    enhancedTasks,
    tasksMap,
    loading,
    error,
    filesUploaded,
    tasksReady,
    handleFilesSelected,
    clearAllData,
    getTaskById,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
