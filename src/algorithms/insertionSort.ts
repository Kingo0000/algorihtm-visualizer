interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const insertionSort = async (
  array: ArrayElement[],
  setArray: (arr: ArrayElement[]) => void,
  onCompare: () => Promise<void>,
  onSwap: () => Promise<void>,
  shouldContinue: () => boolean
): Promise<void> => {
  const arr = [...array];
  const n = arr.length;

  // Mark first element as sorted
  if (n > 0) {
    arr[0].state = 'sorted';
    setArray([...arr]);
  }

  for (let i = 1; i < n && shouldContinue(); i++) {
    const key = arr[i];
    key.state = 'pivot';
    setArray([...arr]);

    let j = i - 1;

    while (j >= 0 && shouldContinue()) {
      if (!shouldContinue()) return;

      arr[j].state = 'comparing';
      setArray([...arr]);
      await onCompare();

      if (arr[j].value > key.value) {
        arr[j + 1] = { ...arr[j], state: 'swapping' };
        setArray([...arr]);
        await onSwap();

        arr[j + 1].state = 'default';
        j--;
      } else {
        arr[j].state = 'sorted';
        break;
      }

      setArray([...arr]);
    }

    if (shouldContinue()) {
      arr[j + 1] = { ...key, state: 'sorted' };
      
      // Mark all elements from 0 to i as sorted
      for (let k = 0; k <= i; k++) {
        if (arr[k].state !== 'sorted') {
          arr[k].state = 'sorted';
        }
      }
      
      setArray([...arr]);
    }
  }
};