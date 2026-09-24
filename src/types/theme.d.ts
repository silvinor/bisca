declare global {
  interface Window {
    gameEngine: import('../core/main-loop').MainGameEngine;
    isDarkMode: boolean;
    isDebug: boolean;
    isReducedMotion: boolean;
  }
}

export {};
