import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate?: string;
  repeat?: 'none' | 'day' | 'week' | 'month' | 'year' | string;
  completedDates?: string[];
}

interface TaskContextType {
  tasks: Task[];
  categories: string[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;
  getTasksForDate: (dateString: string) => Task[];
  isTaskCompletedOnDate: (taskId: string, dateString: string) => boolean;
  toggleTaskCompletion: (taskId: string, dateString: string) => Promise<void>;
}

const DEFAULT_CATEGORIES = ['Работа', 'Лични', 'Здраве', 'Обучение'];

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenDefaultCategories, setHiddenDefaultCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setCustomCategories([]);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(loadedTasks);
    });

    const categoriesRef = collection(db, 'users', user.uid, 'categories');
    const unsubCategories = onSnapshot(categoriesRef, (snapshot) => {
      const loaded = snapshot.docs.map(doc => doc.data().name as string);
      setCustomCategories(loaded);
    });

    return () => {
      unsubTasks();
      unsubCategories();
    };
  }, [user]);

  const visibleDefault = DEFAULT_CATEGORIES.filter(c => !hiddenDefaultCategories.includes(c));
  const categories = Array.from(new Set([...visibleDefault, ...customCategories]));

  const getTasksForDate = (dateString: string): Task[] => {
    // Ако е подаден празен стринг, връща абсолютно всички задачи (за списъка в TasksScreen)
    if (!dateString) return tasks;

    return tasks.filter((task) => {
      // Пряко съвпадение по начална дата
      if (task.startDate === dateString) return true;

      // Ако има край и избраната дата е извън интервала
      if (task.endDate && (dateString < task.startDate || dateString > task.endDate)) {
        return false;
      }

      // Поддръжка за ежедневно повторение
      if (task.repeat === 'day' && dateString >= task.startDate) {
        return true;
      }

      return false;
    });
  };

  const isTaskCompletedOnDate = (taskId: string, dateString: string): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.completedDates?.includes(dateString) || false;
  };

  const toggleTaskCompletion = async (taskId: string, dateString: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentCompleted = task.completedDates || [];
    const isCompleted = currentCompleted.includes(dateString);

    const updatedDates = isCompleted
      ? currentCompleted.filter((d) => d !== dateString)
      : [...currentCompleted, dateString];

    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskRef, { completedDates: updatedDates });
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      ...task,
      completedDates: [],
    });
  };

  const updateTask = async (task: Task) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
    const { id, ...data } = task;
    await updateDoc(taskRef, data);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskRef);
  };

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!user || !trimmed) return;
    if (categories.includes(trimmed)) return;

    await addDoc(collection(db, 'users', user.uid, 'categories'), { name: trimmed });
  };

  const deleteCategory = async (categoryName: string) => {
    if (!user) return;

    if (DEFAULT_CATEGORIES.includes(categoryName)) {
      setHiddenDefaultCategories(prev => [...prev, categoryName]);
    }

    const categoriesRef = collection(db, 'users', user.uid, 'categories');
    const q = query(categoriesRef, where('name', '==', categoryName));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', document.id));
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        addTask,
        updateTask,
        deleteTask,
        addCategory,
        deleteCategory,
        getTasksForDate,
        isTaskCompletedOnDate,
        toggleTaskCompletion,
      }}
    >
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