export const algorithmInfo = {
  bubble: {
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  quick: {
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    stable: false,
    description: 'Quick Sort picks a pivot element and partitions the array around the pivot, then recursively sorts the sub-arrays.'
  },
  merge: {
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    stable: true,
    description: 'Merge Sort divides the array into halves, sorts them separately, and then merges the sorted halves.'
  },
  selection: {
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Selection Sort finds the minimum element and places it at the beginning, then repeats for the remaining elements.'
  },
  insertion: {
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Insertion Sort builds the sorted array one element at a time by inserting each element into its correct position.'
  }
};