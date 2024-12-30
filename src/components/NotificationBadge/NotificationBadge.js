import { Badge, Typography } from '@mui/material';

const NotificationBadge = ({count}) => {
  return (
    <Badge badgeContent={count} color={'error'} />
  )
}

export default NotificationBadge
