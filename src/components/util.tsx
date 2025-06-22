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
