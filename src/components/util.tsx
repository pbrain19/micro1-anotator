import {
  CSVRow,
  ExpertOpinion,
  TaskWithDuplicates,
  DuplicateTask,
} from "../types";

export const promptTemplate = (tasker_opinion: string, context: string) => `
You are a seasoned technical reviewer. Your task is to evaluate an expert's response and state whether you agree with the provided preference opinion.

<goal>
Evaluate the expert's response based on its functionality, correctness, and technical accuracy. Then answer: "Do you agree with the following preference opinion: ${tasker_opinion}?"
Limit your answer to **exactly five sentences**, focusing on major strengths or flaws—do not nit-pick minor details. If there is a small wording improvement to the preference opinion itself, rewrite it succinctly.
</goal>

<context>
${context}
</context>

<additional_info>
- Concentrate on critical correctness issues or misleading information.
- If you need to verify any technology details, feel free to consult official documentation or reputable online sources.
- Prioritize clarity and concrete reasoning over stylistic comments.
</additional_info>


`;

// Function to identify duplicate tasks based on content similarity
export const identifyDuplicateTasks = (
  tasks: CSVRow[],
  expertOpinions: ExpertOpinion[]
): TaskWithDuplicates[] => {
  const taskMap = new Map<string, CSVRow>();
  const expertMap = new Map<string, ExpertOpinion>();

  // Create maps for quick lookup
  tasks.forEach((task) => taskMap.set(task.task_id, task));
  expertOpinions.forEach((opinion) => expertMap.set(opinion.task_id, opinion));

  // Create a normalized content key for each task
  const createContentKey = (task: CSVRow): string => {
    const normalizeText = (text: string) => {
      return text.toLowerCase().replace(/\s+/g, " ").trim();
    };

    // Combine all relevant fields for comparison, handling empty fields gracefully
    const prompt = normalizeText(task.prompt || "");
    const lastHuman = normalizeText(task.last_human_message || "");
    const responseA = normalizeText(task.response_A || "");
    const responseB = normalizeText(task.response_B || "");

    // Create meaningful content for comparison by combining all non-empty fields
    const contentParts = [];

    // Add prompt if it exists and is substantial
    if (prompt && prompt.length > 10) {
      contentParts.push(`prompt:${prompt}`);
    }

    // Add last human message if it exists and is substantial
    if (lastHuman && lastHuman.length > 10) {
      contentParts.push(`human:${lastHuman}`);
    }

    // Add responses if they exist and are substantial
    if (responseA && responseA.length > 10) {
      contentParts.push(`responseA:${responseA}`);
    }

    if (responseB && responseB.length > 10) {
      contentParts.push(`responseB:${responseB}`);
    }

    // If we don't have enough content for meaningful comparison, fall back to basic content
    if (contentParts.length === 0) {
      // Use any available content, even if short
      const availableContent = [prompt, lastHuman, responseA, responseB]
        .filter((text) => text && text.length > 0)
        .join("|");

      if (availableContent.length === 0) {
        return `unique_${task.task_id}`; // Truly empty record
      }

      return availableContent;
    }

    // Join all content parts for comparison
    return contentParts.join("|");
  };

  // Group tasks by content similarity
  const contentGroups = new Map<string, CSVRow[]>();
  const debugGroups = new Map<string, string[]>(); // For debugging

  tasks.forEach((task) => {
    const contentKey = createContentKey(task);

    if (!contentGroups.has(contentKey)) {
      contentGroups.set(contentKey, []);
      debugGroups.set(contentKey, []);
    }
    contentGroups.get(contentKey)!.push(task);
    debugGroups.get(contentKey)!.push(task.task_id);
  });

  // Log groups with duplicates for debugging
  debugGroups.forEach((taskIds, contentKey) => {
    if (taskIds.length > 1) {
      console.log(`Duplicate group found:`, {
        contentKey:
          contentKey.substring(0, 100) + (contentKey.length > 100 ? "..." : ""),
        taskIds,
        count: taskIds.length,
      });
    }
  });

  // Build the result with duplicates (keep ALL tasks in the list)
  const result: TaskWithDuplicates[] = [];

  tasks.forEach((task) => {
    const contentKey = createContentKey(task);
    const similarTasks = contentGroups.get(contentKey) || [];
    const duplicates: DuplicateTask[] = [];

    // Find duplicates (excluding the current task)
    similarTasks.forEach((similarTask) => {
      if (similarTask.task_id !== task.task_id) {
        const expertOpinion = expertMap.get(similarTask.task_id);
        if (expertOpinion) {
          duplicates.push({
            task_id: similarTask.task_id,
            expert_opinion: expertOpinion,
            original_task: similarTask,
          });
        }
      }
    });

    // Create the enhanced task (keep ALL tasks, including duplicates)
    const enhancedTask: TaskWithDuplicates = {
      ...task,
      expert_opinion: expertMap.get(task.task_id),
      duplicates,
    };

    result.push(enhancedTask);
  });

  return result;
};

// Function to calculate batch completion statistics
export const calculateBatchStats = (
  enhancedTasks: TaskWithDuplicates[],
  tasksMap: Map<string, { task: TaskWithDuplicates; index: number }>
) => {
  const blacklist = new Set<string>(); // Hold task IDs in batches we no longer care about
  let totalBatches = 0;
  let completedBatches = 0;

  // Helper function to check if task is completed and reviewed
  const isTaskCompleted = (task: TaskWithDuplicates): boolean => {
    const expertOpinion = task.expert_opinion;
    if (!expertOpinion) {
      console.warn("No expert opinion found for task", task.task_id);
      return false;
    }

    // Check if task_progress indicates completion
    const taskProgress = expertOpinion.task_progress
      ? expertOpinion.task_progress.toLowerCase().trim()
      : "";

    const isComplete = ["completed", "revised"].includes(taskProgress);

    // Check if there's a meaningful review (not empty string)
    const hasReview = expertOpinion.review.toLowerCase().includes("agree");

    return isComplete && hasReview;
  };

  // Iterate through each task to evaluate batches
  enhancedTasks.forEach((task) => {
    // Skip if this task is already in our blacklist
    if (blacklist.has(task.task_id)) {
      return;
    }

    // This represents a new batch
    totalBatches++;

    // Collect all task IDs in this batch (main task + duplicates)
    const batchTaskIds = [task.task_id];
    task.duplicates.forEach((duplicate) => {
      batchTaskIds.push(duplicate.task_id);
    });

    // Check if any task in this batch is completed
    let batchCompleted = false;

    for (const taskId of batchTaskIds) {
      const taskData = tasksMap.get(taskId);
      if (taskData && isTaskCompleted(taskData.task)) {
        batchCompleted = true;
        break; // One completed task means the whole batch is considered complete
      }
    }

    if (batchCompleted) {
      completedBatches++;
    }

    // Add all task IDs in this batch to blacklist so we don't process them again
    batchTaskIds.forEach((taskId) => blacklist.add(taskId));
  });

  const completionPercentage =
    totalBatches > 0
      ? ((completedBatches / totalBatches) * 100).toFixed(1)
      : "0";

  return {
    totalBatches,
    completedBatches,
    completionPercentage,
    processedTaskIds: blacklist.size, // For debugging - should equal total tasks
  };
};

// Helper function to create content key for batch grouping (shared logic)
export const createContentKey = (task: TaskWithDuplicates): string => {
  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  };

  const contentParts = [];
  const prompt = normalizeText(task.prompt || "");
  const lastHuman = normalizeText(task.last_human_message || "");
  const responseA = normalizeText(task.response_A || "");
  const responseB = normalizeText(task.response_B || "");

  if (prompt && prompt.length > 10) {
    contentParts.push(`prompt:${prompt}`);
  }
  if (lastHuman && lastHuman.length > 10) {
    contentParts.push(`human:${lastHuman}`);
  }
  if (responseA && responseA.length > 10) {
    contentParts.push(`responseA:${responseA}`);
  }
  if (responseB && responseB.length > 10) {
    contentParts.push(`responseB:${responseB}`);
  }

  if (contentParts.length === 0) {
    const availableContent = [prompt, lastHuman, responseA, responseB]
      .filter((text) => text && text.length > 0)
      .join("|");

    if (availableContent.length === 0) {
      return `unique_${task.task_id}`;
    }

    return availableContent;
  }

  return contentParts.join("|");
};

// Helper function to check if task is ready for review (completed but no agreement)
export const isTaskReadyForReview = (task: TaskWithDuplicates): boolean => {
  const expertOpinion = task.expert_opinion;
  if (!expertOpinion) return false;

  const taskProgress = expertOpinion.task_progress
    ? expertOpinion.task_progress.toLowerCase().trim()
    : "";

  const isComplete = ["completed", "revised"].includes(taskProgress);
  const hasReview = expertOpinion.review.toLowerCase().includes("agree");

  // Ready for review if completed but no agreement
  return isComplete && !hasReview;
};

// Helper function to check if task is fully completed (completed with agreement)
export const isTaskFullyCompleted = (task: TaskWithDuplicates): boolean => {
  const expertOpinion = task.expert_opinion;
  if (!expertOpinion) return false;

  const taskProgress = expertOpinion.task_progress
    ? expertOpinion.task_progress.toLowerCase().trim()
    : "";

  const isComplete = ["completed", "revised"].includes(taskProgress);
  const hasReview = expertOpinion.review.toLowerCase().includes("agree");

  // Fully completed if both completed and has agreement
  return isComplete && hasReview;
};

// Function to filter batches ready for review (has ready tasks, no completed tasks)
export const getBatchesReadyForReview = (
  enhancedTasks: TaskWithDuplicates[],
  tasksMap: Map<string, { task: TaskWithDuplicates; index: number }>
): Set<string> => {
  const batchGroups = new Map<string, TaskWithDuplicates[]>();
  const readyTaskIds = new Set<string>();

  // Group tasks by content key to identify batches
  enhancedTasks.forEach((task) => {
    const contentKey = createContentKey(task);
    if (!batchGroups.has(contentKey)) {
      batchGroups.set(contentKey, []);
    }
    batchGroups.get(contentKey)!.push(task);
  });

  batchGroups.forEach((batchTasks) => {
    // Check if ANY task in this batch is fully completed (has agreement)
    const batchHasCompleted = batchTasks.some((task) => {
      const taskData = tasksMap.get(task.task_id);
      return taskData && isTaskFullyCompleted(taskData.task);
    });

    // Check if ANY task in this batch is ready for review
    const batchHasReadyForReview = batchTasks.some((task) => {
      const taskData = tasksMap.get(task.task_id);
      return taskData && isTaskReadyForReview(taskData.task);
    });

    // Only include batch if it has tasks ready for review AND no fully completed tasks
    if (batchHasReadyForReview && !batchHasCompleted) {
      batchTasks.forEach((task) => {
        readyTaskIds.add(task.task_id);
      });
    }
  });

  return readyTaskIds;
};

// Function to filter batches that are not fully completed (at least one task without agreement)
export const getIncompleteBatches = (
  enhancedTasks: TaskWithDuplicates[],
  tasksMap: Map<string, { task: TaskWithDuplicates; index: number }>
): Set<string> => {
  const batchGroups = new Map<string, TaskWithDuplicates[]>();
  const incompleteTaskIds = new Set<string>();

  // Group tasks by content key to identify batches
  enhancedTasks.forEach((task) => {
    const contentKey = createContentKey(task);
    if (!batchGroups.has(contentKey)) {
      batchGroups.set(contentKey, []);
    }
    batchGroups.get(contentKey)!.push(task);
  });

  batchGroups.forEach((batchTasks) => {
    // Check if ALL tasks in this batch are fully completed
    const allTasksCompleted = batchTasks.every((task) => {
      const taskData = tasksMap.get(task.task_id);
      return taskData && isTaskFullyCompleted(taskData.task);
    });

    // If not all tasks are completed, include this batch
    if (!allTasksCompleted) {
      batchTasks.forEach((task) => {
        incompleteTaskIds.add(task.task_id);
      });
    }
  });

  return incompleteTaskIds;
};
