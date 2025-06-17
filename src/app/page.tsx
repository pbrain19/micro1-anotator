"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { CSVRow } from "../types";
import { TaskList } from "../components/TaskList";
import { TaskDetails } from "../components/TaskDetails";

export default function Home() {
  const [data, setData] = useState<CSVRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch("/sample-data.csv");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const parsedData = results.data
              .map((row: unknown) => {
                const typedRow = row as Record<string, string>;
                return {
                  task_id: typedRow["task_id"] || "",
                  prompt: typedRow["prompt"] || "",
                  last_human_message: typedRow["last_human_message"] || "",
                  response_A: typedRow["response_A"] || "",
                  response_B: typedRow["response_B"] || "",
                  preference:
                    typedRow[
                      "Which do you prefer (Response A or Response B)"
                    ] || "",
                  reasoning:
                    typedRow["Why do you prefer the one that you do?"] || "",
                  strength:
                    typedRow[
                      "On a scale from 0-3 (inclusive) how strongly do you prefer the response that you chose?"
                    ] || "",
                };
              })
              .filter((row) => row.task_id); // Filter out empty rows

            setData(parsedData);
            setLoading(false);
          },
          error: (error: Error) => {
            setError(error.message);
            setLoading(false);
          },
        });
      } catch {
        setError("Failed to load CSV file");
        setLoading(false);
      }
    };

    loadCSV();
  }, []);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading CSV data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Micro Analysis Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* List View */}
          <div className="lg:col-span-1">
            <TaskList
              data={data}
              selectedIndex={selectedIndex}
              onSelectTask={setSelectedIndex}
            />
          </div>

          {/* Detail View */}
          <div className="lg:col-span-3">
            {selectedIndex !== null ? (
              <TaskDetails
                data={data[selectedIndex]}
                index={selectedIndex}
                collapsedSections={collapsedSections}
                onToggleSection={toggleSection}
              />
            ) : (
              <div className="rounded-lg shadow-md p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Select a task to view details
                </h2>
                <p>
                  Click on any task from the list to see the full conversation
                  and responses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
