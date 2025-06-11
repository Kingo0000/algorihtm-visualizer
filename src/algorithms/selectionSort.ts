interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const selectionSort = async (
  array: ArrayElement[],
  setArray: (arr: ArrayElement[]) => void,
  onCompare: () => Promise<void>,
  onSwap: () => Promise<void>,
  shouldContinue: () => boolean
): Promise<void> => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1 && shouldContinue(); i++) {
    let minIdx = i;
    arr[minIdx].state = 'pivot';

    for (let j = i + 1; j < n && shouldContinue(); j++) {
      if (!shouldContinue()) return;

      arr[j].state = 'comparing';
      setArray([...arr]);
      await onCompare();

      if (arr[j].value < arr[minIdx].value) {
        if (arr[minIdx].state === 'pivot') {
          arr[minIdx].state = 'default';
        }
        minIdx = j;
        arr[minIdx].state = 'pivot';
      } else {
        arr[j].state = 'default';
      }
      
      setArray([...arr]);
    }

    if (minIdx !== i && shouldContinue()) {
      arr[i].state = 'swapping';
      arr[minIdx].state = 'swapping';
      setArray([...arr]);
      await onSwap();

      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    if (shouldContinue()) {
      arr[i].state = 'sorted';
      setArray([...arr]);
    }
  }

  // Mark the last element as sorted
  if (shouldContinue() && n > 0) {
    arr[n - 1].state = 'sorted';
    setArray([...arr]);
  }
};