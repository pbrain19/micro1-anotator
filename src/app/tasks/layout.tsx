import { TaskProvider } from "@/components/TaskContext";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TaskProvider>{children}</TaskProvider>;
}
