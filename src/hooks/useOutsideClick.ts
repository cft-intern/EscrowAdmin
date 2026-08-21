import { useEffect, useRef, RefObject, useState, useCallback } from 'react';

/**
 * Custom hook that detects clicks outside of a specified element.
 * Useful for closing dropdowns, modals, or other overlay components.
 *
 * @param handler - Function to call when outside click is detected
 * @param active - Whether the hook should be active (default: true)
 * @returns Ref to attach to the element you want to detect outside clicks for
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  active: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, active]);

  return ref;
}

/**
 * Custom hook that detects clicks outside multiple elements.
 * Useful when you have multiple refs that should all trigger the same outside click behavior.
 *
 * @param handler - Function to call when outside click is detected
 * @param refs - Array of refs to check for outside clicks
 * @param active - Whether the hook should be active
 */
export function useOutsideClickMultiple(
  handler: (event: MouseEvent | TouchEvent) => void,
  refs: RefObject<HTMLElement>[],
  active: boolean = true
): void {
  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const clickedOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (clickedOutside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, refs, active]);
}

/**
 * Custom hook that provides a toggle function and outside click detection.
 * Perfect for dropdown menus and similar components.
 *
 * @param initialState - Initial open/closed state
 * @returns Object with isOpen state, toggle function, and ref
 */
export function useToggleWithOutsideClick<T extends HTMLElement = HTMLElement>(
  initialState: boolean = false
) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const ref = useOutsideClick<T>(close, isOpen);
  
  return {
    isOpen,
    toggle,
    close,
    open,
    ref,
  };
}