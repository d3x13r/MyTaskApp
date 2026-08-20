import React, { createContext, useContext, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  repeat?: string;
  completedToday?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (updatedTask: Task) => void;
  toggleTaskToday: (id: string) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Утринна йога',
    category: 'Здраве',
    startDate: getTodayString(),
    endDate: getTodayString(),
    repeat: 'day',
    completedToday: false,
  },
  {
    id: '2',
    title: 'Седмичен преглед на задачи',
    category: 'Работа',
    startDate: getTodayString(),
    endDate: getTodayString(),
    repeat: 'week',
    completedToday: true,
  },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      completedToday: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const toggleTaskToday = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completedToday: !t.completedToday } : t))
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, toggleTaskToday }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};