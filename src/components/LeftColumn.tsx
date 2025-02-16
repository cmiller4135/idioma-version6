import React from 'react';
import { Lightbulb } from 'lucide-react';
import PixabayImage from './PixabayImage';

const LeftColumn = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <PixabayImage description="fairy tale like image of a winding road" />
      <h2 className="text-xl font-bold mb-4 text-[#264653]">Language Learning Journey</h2>
      
      <blockquote className="border-l-4 border-[#E63946] pl-4 mb-6 italic">
        "Language is the road map of a culture. It tells you where its people come from and where they are going."
        <footer className="text-sm mt-2">- Rita Mae Brown</footer>
      </blockquote>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Cool Tools You'll Love:</h3>
        <ul className="space-y-3">
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-[#E9C46A] mr-2" />
            AI-Powered Image/Photo Translation
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-[#E9C46A] mr-2" />
            Learn a Language with topics you love
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-[#E9C46A] mr-2" />
            Fun conjugation learning tools
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-[#E9C46A] mr-2" />
            Improve your vocabulary with AI
          </li>
        </ul>
      </div>

      <p className="text-sm">
        Start your language learning adventure today with our comprehensive suite of tools designed to make learning engaging and effective.
      </p>
    </div>
  );
};

export default LeftColumn;