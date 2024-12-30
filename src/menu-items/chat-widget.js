// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { MessageOutlined } from '@ant-design/icons';

// icons
const icons = {
  MessageOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const chatWidget = {
  id: 'chat-widget-main-page',
  type: 'group',
  children: [
    {
      id: 'chat-widget',
      title: <FormattedMessage id="chat-widget" />,
      type: 'item',
      url: '/apps/chat-widget',
      icon: icons.MessageOutlined,
    }
  ]
};

export default chatWidget;
