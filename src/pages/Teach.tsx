import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Mic,
  ArrowRight,
  Play,
  Image,
  Volume2,
  Globe,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/ui';
import Breadcrumb from '../components/Breadcrumb';

interface ToolCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
  color: string;
  bgColor: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  to,
  icon,
  title,
  description,
  steps,
  color,
  bgColor
}) => (
  <Link to={to} className="group block h-full">
    <Card hover className="h-full flex flex-col">
      <Card.Body className="flex-1">
        <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-4`}>
          <div className={color}>{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">How it works:</p>
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xs font-bold ${color}`}>{index + 1}</span>
              </div>
              <p className="text-sm text-gray-500">{step}</p>
            </div>
          ))}
        </div>
      </Card.Body>
      <Card.Footer className="bg-gray-50">
        <span className="flex items-center gap-2 text-sm font-medium text-primary-600 group-hover:text-primary-700">
          Get started
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Card.Footer>
    </Card>
  </Link>
);

const Teach: React.FC = () => {
  return (
    <div className="space-y-8">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success-100 rounded-xl">
            <Play className="w-6 h-6 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Multimedia Learning</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Learn languages using real-world multimedia. Translate photos and audio instantly.
        </p>
      </div>

      {/* Feature Highlight */}
      <Card className="bg-gradient-to-r from-success-500 to-success-600 border-0 overflow-hidden">
        <Card.Body>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Learn from the Real World</h2>
              <p className="text-success-100">
                Use our multimedia tools to translate text from photos you take or audio you record.
                Perfect for learning on the go, traveling, or practicing with authentic content.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToolCard
          to="/teach/sub1"
          icon={<Camera className="w-7 h-7" />}
          title="Photo Translation"
          description="Point your camera at any text and get instant translations with vocabulary analysis."
          steps={[
            'Select your target language',
            'Take a photo of text you want to translate',
            'Get instant translation with verb & adjective analysis',
            'Save new words to your vocabulary lists'
          ]}
          color="text-success-600"
          bgColor="bg-success-100"
        />

        <ToolCard
          to="/teach/sub2"
          icon={<Mic className="w-7 h-7" />}
          title="Audio Translation"
          description="Record speech and get translations. Great for practicing pronunciation and understanding."
          steps={[
            'Start recording your voice',
            'Speak in English or your native language',
            'Get instant transcription and translation',
            'Review and practice the translated text'
          ]}
          color="text-warning-600"
          bgColor="bg-warning-100"
        />
      </div>

      {/* Use Cases */}
      <Card className="bg-gray-50 border-gray-200">
        <Card.Body>
          <h3 className="font-semibold text-gray-800 mb-4">Perfect For</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Image className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Menus & Signs</p>
                <p className="text-xs text-gray-500">While traveling</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-accent-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Books & Articles</p>
                <p className="text-xs text-gray-500">Foreign language reading</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-success-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Conversations</p>
                <p className="text-xs text-gray-500">Record and translate</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Globe className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Real-World Practice</p>
                <p className="text-xs text-gray-500">Authentic content</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-success-100 rounded-xl">
                <Camera className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Photo Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Ensure good lighting for clear text recognition</li>
                  <li>Hold camera steady and focus on the text</li>
                  <li>Capture only the text you want translated</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-warning-100 rounded-xl">
                <Mic className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Audio Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Speak clearly and at a normal pace</li>
                  <li>Minimize background noise</li>
                  <li>Pause between sentences for better accuracy</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Teach;
