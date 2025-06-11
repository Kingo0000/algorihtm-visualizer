interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const bubbleSort = async (
  array: ArrayElement[],
  setArray: (arr: ArrayElement[]) => void,
  onCompare: () => Promise<void>,
  onSwap: () => Promise<void>,
  shouldContinue: () => boolean
): Promise<void> => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1 && shouldContinue(); i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1 && shouldContinue(); j++) {
      if (!shouldContinue()) return;

      // Highlight elements being compared
      arr[j].state = 'comparing';
      arr[j + 1].state = 'comparing';
      setArray([...arr]);
      await onCompare();

      if (arr[j].value > arr[j + 1].value) {
        // Highlight elements being swapped
        arr[j].state = 'swapping';
        arr[j + 1].state = 'swapping';
        setArray([...arr]);
        await onSwap();

        // Perform swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }

      // Reset states
      arr[j].state = 'default';
      arr[j + 1].state = 'default';
      setArray([...arr]);
    }

    // Mark the last element as sorted
    if (shouldContinue()) {
      arr[n - 1 - i].state = 'sorted';
      setArray([...arr]);
    }

    if (!swapped) break;
  }

  // Mark first element as sorted if algorithm completed
  if (shouldContinue() && arr.length > 0) {
    arr[0].state = 'sorted';
    setArray([...arr]);
  }
};