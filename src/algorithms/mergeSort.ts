interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export const mergeSort = async (
  array: ArrayElement[],
  setArray: (arr: ArrayElement[]) => void,
  onCompare: () => Promise<void>,
  onSwap: () => Promise<void>,
  shouldContinue: () => boolean
): Promise<void> => {
  const arr = [...array];

  const merge = async (left: number, mid: number, right: number): Promise<void> => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length && shouldContinue()) {
      if (!shouldContinue()) return;

      // Highlight elements being compared
      if (k < arr.length) {
        arr[k].state = 'comparing';
        setArray([...arr]);
        await onCompare();
      }

      if (leftArr[i].value <= rightArr[j].value) {
        arr[k] = { ...leftArr[i], state: 'swapping' };
        i++;
      } else {
        arr[k] = { ...rightArr[j], state: 'swapping' };
        j++;
      }

      setArray([...arr]);
      await onSwap();

      arr[k].state = 'default';
      k++;
    }

    while (i < leftArr.length && shouldContinue()) {
      if (!shouldContinue()) return;
      arr[k] = { ...leftArr[i], state: 'swapping' };
      setArray([...arr]);
      await onSwap();
      arr[k].state = 'default';
      i++;
      k++;
    }

    while (j < rightArr.length && shouldContinue()) {
      if (!shouldContinue()) return;
      arr[k] = { ...rightArr[j], state: 'swapping' };
      setArray([...arr]);
      await onSwap();
      arr[k].state = 'default';
      j++;
      k++;
    }

    setArray([...arr]);
  };

  const mergeSortHelper = async (left: number, right: number): Promise<void> => {
    if (left < right && shouldContinue()) {
      const mid = Math.floor((left + right) / 2);

      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
    }
  };

  await mergeSortHelper(0, arr.length - 1);

  // Mark all elements as sorted
  if (shouldContinue()) {
    for (let i = 0; i < arr.length; i++) {
      arr[i].state = 'sorted';
    }
    setArray([...arr]);
  }
};