import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { algorithmInfo } from './utils/algorithmInfo';
import { generateRandomArray, sleep } from './utils/helpers';
import { bubbleSort } from './algorithms/bubbleSort';
import { quickSort } from './algorithms/quickSort';
import { mergeSort } from './algorithms/mergeSort';
import { selectionSort } from './algorithms/selectionSort';
import { insertionSort } from './algorithms/insertionSort';

interface Stats {
  comparisons: number;
  swaps: number;
  timeElapsed: number;
}

interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

const algorithms = {
  bubble: bubbleSort,
  quick: quickSort,
  merge: mergeSort,
  selection: selectionSort,
  insertion: insertionSort,
};

function App() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<keyof typeof algorithms>('bubble');
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [stats, setStats] = useState<Stats>({ comparisons: 0, swaps: 0, timeElapsed: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const isRunningRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const initializeArray = useCallback(() => {
    const newArray = generateRandomArray(arraySize).map(value => ({
      value,
      state: 'default' as const,
    }));
    setArray(newArray);
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
  }, [arraySize]);

  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  const updateStats = useCallback((type: 'comparison' | 'swap') => {
    setStats(prev => ({
      ...prev,
      [type === 'comparison' ? 'comparisons' : 'swaps']: prev[type === 'comparison' ? 'comparisons' : 'swaps'] + 1,
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
        updateStats('comparison');
        await sleep(delay);
      },
      async () => {
        if (!isRunningRef.current) return;
        updateStats('swap');
        await sleep(delay);
      },
      () => isRunningRef.current
    );

    if (isRunningRef.current) {
      setArray(prev => prev.map(item => ({ ...item, state: 'sorted' })));
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
    const maxValue = Math.max(...array.map(item => item.value));
    return (value / maxValue) * 100;
  };

  const getBarColor = (state: ArrayElement['state']) => {
    switch (state) {
      case 'comparing': return 'bg-yellow-400';
      case 'swapping': return 'bg-red-400';
      case 'sorted': return 'bg-green-400';
      case 'pivot': return 'bg-purple-400';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
          <p className="text-gray-300 text-lg">
            Watch sorting algorithms come to life with beautiful visualizations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Algorithm Selection */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(algorithms).map((algo) => (
                <button
                  key={algo}
                  onClick={() => !isRunning && setCurrentAlgorithm(algo as keyof typeof algorithms)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentAlgorithm === algo
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {algo.charAt(0).toUpperCase() + algo.slice(1)} Sort
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={isRunning ? stopVisualization : visualizeAlgorithm}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } hover:scale-105 shadow-lg`}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? 'Stop' : 'Start'}
              </button>
              
              <button
                onClick={resetArray}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={20} />
                Reset
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Array Size: {arraySize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={arraySize}
                  onChange={(e) => handleArraySizeChange(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Speed: {speed}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div 
            className="flex items-end justify-center gap-1 h-96 overflow-hidden"
            style={{ minHeight: '400px' }}
          >
            {array.map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-200 ${getBarColor(item.state)} rounded-t-sm`}
                style={{
                  height: `${getBarHeight(item.value)}%`,
                  width: `${Math.max(800 / array.length - 1, 3)}px`,
                  minWidth: '2px',
                }}
                title={`Value: ${item.value}, State: ${item.state}`}
              />
            ))}
          </div>
        </div>

        {/* Stats and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistics */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.comparisons}</div>
                <div className="text-sm text-gray-400">Comparisons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.swaps}</div>
                <div className="text-sm text-gray-400">Swaps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{Math.round(stats.timeElapsed)}ms</div>
                <div className="text-sm text-gray-400">Time</div>
              </div>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Algorithm Info</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-300">Time Complexity:</span>
                <span className="ml-2 text-yellow-400">{algorithmInfo[currentAlgorithm].timeComplexity}</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Space Complexity:</span>
                <span className="ml-2 text-blue-400">{algorithmInfo[currentAlgorithm].spaceComplexity}</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Stable:</span>
                <span className={`ml-2 ${algorithmInfo[currentAlgorithm].stable ? 'text-green-400' : 'text-red-400'}`}>
                  {algorithmInfo[currentAlgorithm].stable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-300">Color Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-gray-300">Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-gray-300">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-gray-300">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span className="text-gray-300">Pivot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-gray-300">Sorted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;