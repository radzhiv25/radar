export type GuideKey =
  | 'welcome'
  | 'choose_taste'
  | 'empty_catalog'
  | 'empty_feed'
  | 'empty_saves'
  | 'empty_map'
  | 'no_search_results'
  | 'connection_issue'
  | 'setup_connection'
  | 'restaurant_unavailable';

export type GuideAction = {
  label: string;
  href?: string;
};

export type GuideContent = {
  key: GuideKey;
  title: string;
  message: string;
  steps?: string[];
  primary?: GuideAction;
  secondary?: GuideAction;
};
