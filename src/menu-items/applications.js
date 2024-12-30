// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@ant-design/icons';

// icons
const icons = { BuildOutlined, CalendarOutlined, CustomerServiceOutlined, MessageOutlined, ShoppingCartOutlined, UserOutlined };

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: <FormattedMessage id="applications" />,
  type: 'group',
  children: [
    {
      id: 'chat-widget',
      title: <FormattedMessage id="chat-widget" />,
      type: 'item',
      url: '/apps/chat-widget',
      icon: icons.MessageOutlined,
      breadcrumbs: false
    },
    {
      id: 'chat',
      title: <FormattedMessage id="chat" />,
      type: 'item',
      url: '/apps/chat',
      icon: icons.MessageOutlined,
      breadcrumbs: false
    },
    {
      id: 'calendar',
      title: <FormattedMessage id="calendar" />,
      type: 'item',
      url: '/apps/calendar',
      icon: icons.CalendarOutlined
    },
    {
      id: 'kanban',
      title: <FormattedMessage id="kanban" />,
      type: 'item',
      icon: BuildOutlined,
      url: '/apps/kanban/board'
    },
    {
      id: 'customer',
      title: <FormattedMessage id="customer" />,
      type: 'collapse',
      icon: icons.CustomerServiceOutlined,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="list" />,
          type: 'item',
          url: '/apps/customer/list'
        }
      ]
    },
    {
      id: 'profile',
      title: <FormattedMessage id="profile" />,
      type: 'collapse',
      icon: icons.UserOutlined,
      children: [
        {
          id: 'user-profile',
          title: <FormattedMessage id="user-profile" />,
          type: 'item',
          url: '/apps/profiles/user/personal'
        },
        {
          id: 'account-profile',
          title: <FormattedMessage id="account-profile" />,
          type: 'item',
          url: '/apps/profiles/account/basic'
        },
        {
          id: 'user-list',
          title: <FormattedMessage id="user-list" />,
          type: 'item',
          url: '/apps/profiles/user-list'
        },
        {
          id: 'user-card',
          title: <FormattedMessage id="user-card" />,
          type: 'item',
          url: '/apps/profiles/user-card'
        }
      ]
    }
  ]
};

export default applications;
