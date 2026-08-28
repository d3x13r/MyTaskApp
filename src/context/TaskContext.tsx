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
  deleteAllUserData: () => Promise<void>;
  getTasksForDate: (dateString: string) => Task[];
  getOverdueTasks: () => { task: Task; date: string }[];
  isTaskCompletedOnDate: (taskId: string, dateString: string) => boolean;
  toggleTaskCompletion: (taskId: string, dateString: string) => Promise<void>;
}

const DEFAULT_CATEGORIES = ['Работа', 'Лични', 'Здраве', 'Обучение'];

// ---- Помощни функции за работа с дати във формат 'YYYY-MM-DD' ----
// Ползваме UTC навсякъде, за да избегнем разминавания заради часова зона.

const parseYMD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
};

const toUTCDate = (s: string) => {
  const { y, m, d } = parseYMD(s);
  return new Date(Date.UTC(y, m - 1, d));
};

const toDateString = (date: Date) => date.toISOString().split('T')[0];

const getTodayString = () => toDateString(new Date());

const addDaysStr = (dateString: string, n: number): string => {
  const d = toUTCDate(dateString);
  d.setUTCDate(d.getUTCDate() + n);
  return toDateString(d);
};

const daysBetween = (fromStr: string, toStr: string): number => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toUTCDate(toStr).getTime() - toUTCDate(fromStr).getTime()) / MS_PER_DAY);
};

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const lastDayOfMonth = (year: number, monthIndex0: number) =>
  new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();

// Дали месечно повтаряща се задача пада точно на dateString.
// При месеци с по-малко дни (напр. начална дата 31-во число) се "прилепва"
// към последния ден на по-късия месец (напр. 28/29 февруари).
const isMonthlyAnniversary = (startDate: string, dateString: string): boolean => {
  const s = parseYMD(startDate);
  const d = parseYMD(dateString);
  const monthDiff = (d.y - s.y) * 12 + (d.m - s.m);
  if (monthDiff < 0) return false;

  const targetMonthIndex0 = (s.m - 1) + monthDiff;
  const targetYear = s.y + Math.floor(targetMonthIndex0 / 12);
  const targetMonth0 = ((targetMonthIndex0 % 12) + 12) % 12;
  const expectedDay = Math.min(s.d, lastDayOfMonth(targetYear, targetMonth0));

  return d.y === targetYear && (d.m - 1) === targetMonth0 && d.d === expectedDay;
};

// Дали годишно повтаряща се задача пада точно на dateString (с прилепване на 29 февруари).
const isYearlyAnniversary = (startDate: string, dateString: string): boolean => {
  const s = parseYMD(startDate);
  const d = parseYMD(dateString);
  if (d.y < s.y) return false;

  let expectedDay = s.d;
  if (s.m === 2 && s.d === 29 && !isLeapYear(d.y)) {
    expectedDay = 28;
  }
  return d.m === s.m && d.d === expectedDay;
};

// Единен източник на истина за това дали дадена задача важи за дадена дата.
// Поддържа: none, day, week, month, year, custom_N (на всеки N дни).
const occursOnDate = (task: Task, dateString: string): boolean => {
  if (dateString < task.startDate) return false;
  if (task.endDate && dateString > task.endDate) return false;

  const repeat = task.repeat || 'none';

  if (repeat === 'none') {
    return dateString === task.startDate;
  }
  if (repeat === 'day') {
    return true;
  }
  if (repeat === 'week') {
    return daysBetween(task.startDate, dateString) % 7 === 0;
  }
  if (repeat === 'month') {
    return isMonthlyAnniversary(task.startDate, dateString);
  }
  if (repeat === 'year') {
    return isYearlyAnniversary(task.startDate, dateString);
  }
  if (typeof repeat === 'string' && repeat.startsWith('custom_')) {
    const n = parseInt(repeat.split('_')[1], 10);
    if (!n || n < 1) return dateString === task.startDate;
    return daysBetween(task.startDate, dateString) % n === 0;
  }

  return dateString === task.startDate;
};

// Колко дни назад от днес да "поглеждаме" за пропуснати задачи,
// за да не се трупа безкраен списък при стари ежедневни задачи.
const OVERDUE_LOOKBACK_DAYS = 60;

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
      setHiddenDefaultCategories([]);
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

    // Изтритите дефолтни категории (Работа, Лични и т.н.) също трябва да се пазят
    // трайно, иначе при следващо отваряне на приложението пак ще изникнат.
    const hiddenRef = collection(db, 'users', user.uid, 'hiddenDefaultCategories');
    const unsubHidden = onSnapshot(hiddenRef, (snapshot) => {
      const loaded = snapshot.docs.map(doc => doc.data().name as string);
      setHiddenDefaultCategories(loaded);
    });

    return () => {
      unsubTasks();
      unsubCategories();
      unsubHidden();
    };
  }, [user]);

  const visibleDefault = DEFAULT_CATEGORIES.filter(c => !hiddenDefaultCategories.includes(c));
  const categories = Array.from(new Set([...visibleDefault, ...customCategories]));

  const getTasksForDate = (dateString: string): Task[] => {
    // Ако е подаден празен стринг, връща абсолютно всички задачи (за списъка в TasksScreen)
    if (!dateString) return tasks;

    return tasks.filter((task) => occursOnDate(task, dateString));
  };

  // Връща всички пропуснати (неотметнати) появявания на задачи от миналото,
  // ограничено до последните OVERDUE_LOOKBACK_DAYS дни, за да не расте безкрайно.
  // Всяко пропуснато появяване е отделен запис { task, date }, тъй като една и съща
  // повтаряща се задача може да е пропусната на няколко различни дни.
  const getOverdueTasks = (): { task: Task; date: string }[] => {
    const todayStr = getTodayString();
    const lookbackStart = addDaysStr(todayStr, -OVERDUE_LOOKBACK_DAYS);
    const results: { task: Task; date: string }[] = [];

    tasks.forEach((task) => {
      const rangeStart = task.startDate > lookbackStart ? task.startDate : lookbackStart;
      let cursor = rangeStart;
      // Обхождаме всеки ден от rangeStart до вчера (изключваме днес — тя не е "просрочена")
      while (cursor < todayStr) {
        if (occursOnDate(task, cursor) && !(task.completedDates || []).includes(cursor)) {
          results.push({ task, date: cursor });
        }
        cursor = addDaysStr(cursor, 1);
      }
    });

    // Най-скорошните пропуснати дни най-отгоре
    results.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return results;
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
      if (!hiddenDefaultCategories.includes(categoryName)) {
        await addDoc(collection(db, 'users', user.uid, 'hiddenDefaultCategories'), { name: categoryName });
      }
    }

    const categoriesRef = collection(db, 'users', user.uid, 'categories');
    const q = query(categoriesRef, where('name', '==', categoryName));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', document.id));
    });
  };

  // Трайно изтрива ВСИЧКИ данни на потребителя от Firestore (задачи, категории,
  // скрити дефолтни категории) — използва се при изтриване на профила.
  // Firestore не поддържа изтриване на цяла подколекция наведнъж, затова
  // обхождаме всеки документ поотделно.
  const deleteAllUserData = async () => {
    if (!user) return;
    const subcollections = ['tasks', 'categories', 'hiddenDefaultCategories'];

    for (const colName of subcollections) {
      const colRef = collection(db, 'users', user.uid, colName);
      const snapshot = await getDocs(colRef);
      await Promise.all(
        snapshot.docs.map((document) => deleteDoc(doc(db, 'users', user.uid, colName, document.id)))
      );
    }
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
        deleteAllUserData,
        getTasksForDate,
        getOverdueTasks,
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