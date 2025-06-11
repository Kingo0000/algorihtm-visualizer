interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const quickSort = async (
  array: ArrayElement[],
  setArray: (arr: ArrayElement[]) => void,
  onCompare: () => Promise<void>,
  onSwap: () => Promise<void>,
  shouldContinue: () => boolean
): Promise<void> => {
  const arr = [...array];

  const partition = async (low: number, high: number): Promise<number> => {
    const pivot = arr[high];
    pivot.state = 'pivot';
    setArray([...arr]);

    let i = low - 1;

    for (let j = low; j < high && shouldContinue(); j++) {
      if (!shouldContinue()) return i + 1;

      arr[j].state = 'comparing';
      setArray([...arr]);
      await onCompare();

      if (arr[j].value < pivot.value) {
        i++;
        if (i !== j) {
          arr[i].state = 'swapping';
          arr[j].state = 'swapping';
          setArray([...arr]);
          await onSwap();

          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      if (arr[j].state !== 'pivot') {
        arr[j].state = 'default';
      }
      if (i >= 0 && arr[i].state !== 'pivot') {
        arr[i].state = 'default';
      }
      setArray([...arr]);
    }

    if (shouldContinue()) {
      arr[i + 1].state = 'swapping';
      arr[high].state = 'swapping';
      setArray([...arr]);
      await onSwap();

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      
      arr[i + 1].state = 'sorted';
      setArray([...arr]);
    }

    return i + 1;
  };

  const quickSortHelper = async (low: number, high: number): Promise<void> => {
    if (low < high && shouldContinue()) {
      const pi = await partition(low, high);

      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    } else if (low === high && shouldContinue()) {
      arr[low].state = 'sorted';
      setArray([...arr]);
    }
  };

  await quickSortHelper(0, arr.length - 1);
};