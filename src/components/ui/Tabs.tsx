import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export interface TabProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> & {
  List: React.FC<TabListProps>;
  Tab: React.FC<TabProps>;
  Panel: React.FC<TabPanelProps>;
} = ({ children, defaultTab, onChange, className = '' }) => {
  const [activeTab, setActiveTabState] = useState(defaultTab || '');

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    onChange?.(id);
  };

  // If no default tab, use the first tab
  React.useEffect(() => {
    if (!defaultTab && !activeTab) {
      // Find the first Tab component and use its id
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === TabList) {
          React.Children.forEach(child.props.children, (tabChild) => {
            if (React.isValidElement(tabChild) && tabChild.props.id && !activeTab) {
              setActiveTabState(tabChild.props.id);
            }
          });
        }
      });
    }
  }, [children, defaultTab, activeTab]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

const variantStyles = {
  default: {
    list: 'border-b border-gray-200',
    tab: 'px-4 py-2 -mb-px border-b-2 border-transparent',
    active: 'border-primary-500 text-primary-600',
    inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
  },
  pills: {
    list: 'bg-gray-100 p-1 rounded-lg',
    tab: 'px-4 py-2 rounded-md',
    active: 'bg-white text-primary-600 shadow-sm',
    inactive: 'text-gray-500 hover:text-gray-700',
  },
  underline: {
    list: '',
    tab: 'px-4 py-2 border-b-2 border-transparent',
    active: 'border-primary-500 text-primary-600',
    inactive: 'text-gray-500 hover:text-gray-700',
  },
};

const TabList: React.FC<TabListProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex ${styles.list} ${className}`}
      role="tablist"
      aria-orientation="horizontal"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ variant: string }>, {
            variant,
          });
        }
        return child;
      })}
    </div>
  );
};

const Tab: React.FC<TabProps & { variant?: 'default' | 'pills' | 'underline' }> = ({
  id,
  children,
  disabled = false,
  icon,
  className = '',
  variant = 'default',
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;
  const styles = variantStyles[variant];

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={`
        flex items-center gap-2
        font-medium transition-all duration-200
        ${styles.tab}
        ${isActive ? styles.active : styles.inactive}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({ id, children, className = '' }) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
};

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
