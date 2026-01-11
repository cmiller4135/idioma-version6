import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  howItWorksText: string;
  getStartedText: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  to,
  icon,
  title,
  description,
  steps,
  color,
  bgColor,
  howItWorksText,
  getStartedText
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
          <p className="text-sm font-medium text-gray-700">{howItWorksText}</p>
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
          {getStartedText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Card.Footer>
    </Card>
  </Link>
);

const Teach: React.FC = () => {
  const { t } = useTranslation('teach');

  return (
    <div className="space-y-8">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success-100 rounded-xl">
            <Play className="w-6 h-6 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('hub.title')}</h1>
        </div>
        <p className="text-gray-600 ml-14">
          {t('hub.subtitle')}
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
              <h2 className="text-xl font-bold text-white mb-2">{t('hub.learnFromWorld')}</h2>
              <p className="text-success-100">
                {t('hub.learnFromWorldDesc')}
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
          title={t('hub.photoTranslation.title')}
          description={t('hub.photoTranslation.description')}
          steps={[
            t('hub.photoTranslation.step1'),
            t('hub.photoTranslation.step2'),
            t('hub.photoTranslation.step3'),
            t('hub.photoTranslation.step4')
          ]}
          color="text-success-600"
          bgColor="bg-success-100"
          howItWorksText={t('hub.howItWorks')}
          getStartedText={t('hub.getStarted')}
        />

        <ToolCard
          to="/teach/sub2"
          icon={<Mic className="w-7 h-7" />}
          title={t('hub.audioTranslation.title')}
          description={t('hub.audioTranslation.description')}
          steps={[
            t('hub.audioTranslation.step1'),
            t('hub.audioTranslation.step2'),
            t('hub.audioTranslation.step3'),
            t('hub.audioTranslation.step4')
          ]}
          color="text-warning-600"
          bgColor="bg-warning-100"
          howItWorksText={t('hub.howItWorks')}
          getStartedText={t('hub.getStarted')}
        />
      </div>

      {/* Use Cases */}
      <Card className="bg-gray-50 border-gray-200">
        <Card.Body>
          <h3 className="font-semibold text-gray-800 mb-4">{t('hub.perfectFor')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Image className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.useCases.menus')}</p>
                <p className="text-xs text-gray-500">{t('hub.useCases.menusDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-accent-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.useCases.books')}</p>
                <p className="text-xs text-gray-500">{t('hub.useCases.booksDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-success-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.useCases.conversations')}</p>
                <p className="text-xs text-gray-500">{t('hub.useCases.conversationsDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Globe className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.useCases.realWorld')}</p>
                <p className="text-xs text-gray-500">{t('hub.useCases.realWorldDesc')}</p>
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
                <h4 className="font-semibold text-gray-800 mb-1">{t('hub.photoTips.title')}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>{t('hub.photoTips.tip1')}</li>
                  <li>{t('hub.photoTips.tip2')}</li>
                  <li>{t('hub.photoTips.tip3')}</li>
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
                <h4 className="font-semibold text-gray-800 mb-1">{t('hub.audioTips.title')}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>{t('hub.audioTips.tip1')}</li>
                  <li>{t('hub.audioTips.tip2')}</li>
                  <li>{t('hub.audioTips.tip3')}</li>
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
