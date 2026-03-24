import { useEffect, useState, useRef } from 'react';
import { InputManager } from '../game/core/InputManager';

export const useGameInput = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabPressed, setIsTabPressed] = useState(false);
  const inputRef = useRef<InputManager>(new InputManager());

  useEffect(() => {
    const input = inputRef.current;
    input.init();

    let lastUnlockTime = 0;

    const handleLockChange = () => {
      const locked = document.pointerLockElement !== null;
      setIsLocked(locked);
      if (!locked) {
        lastUnlockTime = Date.now();
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If we are not locked, pressing ESC could close the menu.
        // We check lastUnlockTime to avoid double-toggling when the browser unlocks the pointer.
        if (document.pointerLockElement === null && Date.now() - lastUnlockTime > 100) {
          setIsMenuOpen(prev => !prev);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsTabPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsTabPressed(false);
      }
    };

    const handleBlur = () => {
      setIsTabPressed(false);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      input.cleanup();
      document.removeEventListener('pointerlockchange', handleLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.exitPointerLock();
    }
  }, [isMenuOpen]);

  const requestPointerLock = async () => {
    try {
      await document.body.requestPointerLock();
    } catch (e) {
      console.warn('Pointer lock failed:', e);
    }
  };

  return {
    isLocked,
    setIsLocked,
    isMenuOpen,
    setIsMenuOpen,
    isTabPressed,
    input: inputRef.current,
    requestPointerLock
  };
};
