import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Languages,
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { Card } from '../components/ui';
import Breadcrumb from '../components/Breadcrumb';

interface ToolCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  startLearningText: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  to,
  icon,
  title,
  description,
  features,
  color,
  bgColor,
  startLearningText
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
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
              {feature}
            </li>
          ))}
        </ul>
      </Card.Body>
      <Card.Footer className="bg-gray-50">
        <span className="flex items-center gap-2 text-sm font-medium text-primary-600 group-hover:text-primary-700">
          {startLearningText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Card.Footer>
    </Card>
  </Link>
);

const Tools: React.FC = () => {
  const { t } = useTranslation('tools');

  return (
    <div className="space-y-8">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-xl">
            <GraduationCap className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('hub.title')}</h1>
        </div>
        <p className="text-gray-600 ml-14">
          {t('hub.subtitle')}
        </p>
      </div>

      {/* Featured Tool */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 border-0">
        <Card.Body>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-accent-500 text-primary-900 text-xs font-semibold rounded-full">
                  {t('hub.mostPopular')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{t('hub.myVocabulary')}</h2>
              <p className="text-primary-100">
                {t('hub.myVocabularyDesc')}
              </p>
            </div>
            <Link
              to="/tools/sub2"
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {t('hub.open')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          to="/tools/sub1"
          icon={<Languages className="w-7 h-7" />}
          title={t('hub.verbConjugator.title')}
          description={t('hub.verbConjugator.description')}
          features={[
            t('hub.verbConjugator.feature1'),
            t('hub.verbConjugator.feature2'),
            t('hub.verbConjugator.feature3'),
            t('hub.verbConjugator.feature4')
          ]}
          color="text-primary-600"
          bgColor="bg-primary-100"
          startLearningText={t('hub.startLearning')}
        />

        <ToolCard
          to="/tools/sub3"
          icon={<BookOpen className="w-7 h-7" />}
          title={t('hub.topicVocabulary.title')}
          description={t('hub.topicVocabulary.description')}
          features={[
            t('hub.topicVocabulary.feature1'),
            t('hub.topicVocabulary.feature2'),
            t('hub.topicVocabulary.feature3'),
            t('hub.topicVocabulary.feature4')
          ]}
          color="text-accent-600"
          bgColor="bg-accent-100"
          startLearningText={t('hub.startLearning')}
        />

        <ToolCard
          to="/saas2"
          icon={<Sparkles className="w-7 h-7" />}
          title={t('hub.aiLanguageStudy.title')}
          description={t('hub.aiLanguageStudy.description')}
          features={[
            t('hub.aiLanguageStudy.feature1'),
            t('hub.aiLanguageStudy.feature2'),
            t('hub.aiLanguageStudy.feature3'),
            t('hub.aiLanguageStudy.feature4')
          ]}
          color="text-warning-600"
          bgColor="bg-warning-100"
          startLearningText={t('hub.startLearning')}
        />
      </div>

      {/* Tips */}
      <Card className="bg-gray-50 border-gray-200">
        <Card.Body>
          <h3 className="font-semibold text-gray-800 mb-3">{t('hub.tips.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.tips.tip1Title')}</p>
                <p className="text-sm text-gray-500">{t('hub.tips.tip1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.tips.tip2Title')}</p>
                <p className="text-sm text-gray-500">{t('hub.tips.tip2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('hub.tips.tip3Title')}</p>
                <p className="text-sm text-gray-500">{t('hub.tips.tip3Desc')}</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Tools;
