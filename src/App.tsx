"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { algorithmInfo } from "./utils/algorithmInfo";
import { generateRandomArray, sleep } from "./utils/helpers";
import { bubbleSort } from "./algorithms/bubbleSort";
import { quickSort } from "./algorithms/quickSort";
import { mergeSort } from "./algorithms/mergeSort";
import { selectionSort } from "./algorithms/selectionSort";
import { insertionSort } from "./algorithms/insertionSort";

interface Stats {
  comparisons: number;
  swaps: number;
  timeElapsed: number;
}

interface ArrayElement {
  value: number;
  state: "default" | "comparing" | "swapping" | "sorted" | "pivot";
}

const algorithms = {
  bubble: bubbleSort,
  quick: quickSort,
  merge: mergeSort,
  selection: selectionSort,
  insertion: insertionSort,
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] =
    useState<keyof typeof algorithms>("bubble");
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [stats, setStats] = useState<Stats>({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const isRunningRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const initializeArray = useCallback(() => {
    const newArray = generateRandomArray(arraySize).map((value) => ({
      value,
      state: "default" as const,
    }));
    setArray(newArray);
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
  }, [arraySize]);

  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  const updateStats = useCallback((type: "comparison" | "swap") => {
    setStats((prev) => ({
      ...prev,
      [type === "comparison" ? "comparisons" : "swaps"]:
        prev[type === "comparison" ? "comparisons" : "swaps"] + 1,
      timeElapsed: Date.now() - startTimeRef.current,
    }));
  }, []);

  const visualizeAlgorithm = async () => {
    if (isRunningRef.current) return;

    setIsRunning(true);
    isRunningRef.current = true;
    startTimeRef.current = Date.now();
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });

    const algorithmFunction = algorithms[currentAlgorithm];
    const delay = 101 - speed;

    await algorithmFunction(
      array,
      setArray,
      async () => {
        if (!isRunningRef.current) return;
        updateStats("comparison");
        await sleep(delay);
      },
      async () => {
        if (!isRunningRef.current) return;
        updateStats("swap");
        await sleep(delay);
      },
      () => isRunningRef.current
    );

    if (isRunningRef.current) {
      setArray((prev) => prev.map((item) => ({ ...item, state: "sorted" })));
    }

    setIsRunning(false);
    isRunningRef.current = false;
  };

  const stopVisualization = () => {
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const resetArray = () => {
    stopVisualization();
    initializeArray();
  };

  const handleArraySizeChange = (newSize: number) => {
    if (!isRunning) {
      setArraySize(newSize);
    }
  };

  const getBarHeight = (value: number) => {
    const maxValue = Math.max(...array.map((item) => item.value));
    return (value / maxValue) * 100;
  };

  const getBarColor = (state: ArrayElement["state"]) => {
    switch (state) {
      case "comparing":
        return "bg-yellow-400 dark:bg-yellow-500";
      case "swapping":
        return "bg-red-400 dark:bg-red-500";
      case "sorted":
        return "bg-green-400 dark:bg-green-500";
      case "pivot":
        return "bg-purple-400 dark:bg-purple-500";
      default:
        return "bg-blue-400 dark:bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
              Algorithm Visualizer
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base lg:text-lg max-w-2xl mx-auto">
            Watch sorting algorithms come to life with beautiful visualizations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Algorithm Selection */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {Object.keys(algorithms).map((algo) => (
                <button
                  key={algo}
                  onClick={() =>
                    !isRunning &&
                    setCurrentAlgorithm(algo as keyof typeof algorithms)
                  }
                  disabled={isRunning}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                    currentAlgorithm === algo
                      ? "bg-blue-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } ${
                    isRunning
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                >
                  {algo.charAt(0).toUpperCase() + algo.slice(1)}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3 justify-center lg:justify-end">
              <button
                onClick={isRunning ? stopVisualization : visualizeAlgorithm}
                className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                } hover:scale-105 shadow-lg`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                <span className="hidden sm:inline">
                  {isRunning ? "Stop" : "Start"}
                </span>
              </button>

              <button
                onClick={resetArray}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Array Size:{" "}
                  <span className="text-blue-500 dark:text-blue-400 font-bold">
                    {arraySize}
                  </span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={arraySize}
                  onChange={(e) =>
                    handleArraySizeChange(Number.parseInt(e.target.value))
                  }
                  disabled={isRunning}
                  className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Speed:{" "}
                  <span className="text-purple-500 dark:text-purple-400 font-bold">
                    {speed}%
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-end justify-center gap-px h-64 md:h-80 lg:h-96 overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
            {array.map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-200 ${getBarColor(
                  item.state
                )} rounded-t-sm shadow-sm`}
                style={{
                  height: `${getBarHeight(item.value)}%`,
                  width: `${Math.max(
                    Math.min((window.innerWidth - 100) / array.length - 1, 20),
                    2
                  )}px`,
                  minWidth: "1px",
                }}
                title={`Value: ${item.value}, State: ${item.state}`}
              />
            ))}
          </div>
        </div>

        {/* Stats and Info */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg lg:text-xl font-bold mb-4 text-blue-500 dark:text-blue-400 flex items-center gap-2">
              📊 Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                  {stats.comparisons}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Comparisons
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-red-500 dark:text-red-400">
                  {stats.swaps}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Swaps
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-green-500 dark:text-green-400">
                  {Math.round(stats.timeElapsed)}ms
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Time
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg lg:text-xl font-bold mb-4 text-purple-500 dark:text-purple-400 flex items-center gap-2">
              ⚡ Algorithm Info
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Time Complexity:
                </span>
                <span className="text-yellow-500 dark:text-yellow-400 font-mono font-bold">
                  {algorithmInfo[currentAlgorithm].timeComplexity}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Space Complexity:
                </span>
                <span className="text-blue-500 dark:text-blue-400 font-mono font-bold">
                  {algorithmInfo[currentAlgorithm].spaceComplexity}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Stable:
                </span>
                <span
                  className={`font-bold ${
                    algorithmInfo[currentAlgorithm].stable
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {algorithmInfo[currentAlgorithm].stable ? "✓ Yes" : "✗ No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg lg:text-xl font-bold mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            🎨 Color Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded shadow-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Default
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 rounded shadow-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Comparing
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-4 h-4 bg-red-400 dark:bg-red-500 rounded shadow-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Swapping
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-4 h-4 bg-purple-400 dark:bg-purple-500 rounded shadow-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Pivot
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-4 h-4 bg-green-400 dark:bg-green-500 rounded shadow-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Sorted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
