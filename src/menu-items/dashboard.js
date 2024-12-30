// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DashboardOutlined, GoldOutlined, HomeOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  GoldOutlined,
  HomeOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'collapse',
      icon: icons.DashboardOutlined,
      children: [
        {
          id: 'default',
          title: <FormattedMessage id="default" />,
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics',
          title: <FormattedMessage id="analytics" />,
          type: 'item',
          url: '/dashboard/analytics'
        }
      ]
    }
  ]
};

export default dashboard;
