
import React from 'react';
import { PromptInput } from './components/PromptInput';
import { ImageGrid } from './components/ImageGrid';
import { Controls } from './components/Controls';

function App() {
  return (
    <div className="bg-[#FFF0E0] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 md:gap-12">
        <PromptInput />
        <ImageGrid />
        <Controls />
      </main>
    </div>
  );
}

export default App;
