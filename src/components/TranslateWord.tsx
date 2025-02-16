import React from 'react';

interface TranslateWordProps {
  word: string;
  language: string;
}

const TranslateWord: React.FC<TranslateWordProps> = ({ word, language }) => {
  return <div>Translation component</div>;
};

export default TranslateWord;
