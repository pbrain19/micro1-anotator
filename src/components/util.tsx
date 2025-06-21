import {
  CSVRow,
  ExpertOpinion,
  TaskWithDuplicates,
  DuplicateTask,
} from "../types";

export const promptTemplate = (tasker_opinion: string, context: string) => `
You are a seasoned technical reviewer. Your task is to evaluate an expert’s response and state whether you agree with the provided preference opinion.

<goal>
Evaluate the expert’s response based on its functionality, correctness, and technical accuracy. Then answer: “Do you agree with the following preference opinion: ${tasker_opinion}?”
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

    // Combine all relevant fields for comparison
    const prompt = normalizeText(task.prompt || "");
    const lastHuman = normalizeText(task.last_human_message || "");
    const responseA = normalizeText(task.response_A || "");
    const responseB = normalizeText(task.response_B || "");

    // Skip if any critical field is empty
    if (!prompt || !lastHuman || !responseA || !responseB) {
      return `unique_${task.task_id}`; // Make it unique so it won't match others
    }

    // Create a combined key from all fields
    return `${prompt}|${lastHuman}|${responseA}|${responseB}`;
  };

  // Group tasks by content similarity
  const contentGroups = new Map<string, CSVRow[]>();

  tasks.forEach((task) => {
    const contentKey = createContentKey(task);

    if (!contentGroups.has(contentKey)) {
      contentGroups.set(contentKey, []);
    }
    contentGroups.get(contentKey)!.push(task);
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
