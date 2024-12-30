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

const botbuilder = {
  id: 'bot-builder-main-page',
  type: 'group',
  children: [
    {
      id: 'builder-widget',
      title: <FormattedMessage id="bot-wizard" />,
      type: 'item',
      url: '/bot/wizard',
      icon: icons.GoldOutlined,
      chip: {
        label: 'new',
        color: 'primary',
        size: 'small',
        variant: 'combined'
      }
    }
  ]
};

export default botbuilder;
