import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import MuiAvatar from '@mui/material/Avatar';

// project import
import getColors from 'utils/getColors';

// ==============================|| AVATAR - COLOR STYLE ||============================== //

function getColorStyle({ theme, color, type,border }) {
  const colors = getColors(theme, color);
  const { lighter, light, main, contrastText } = colors;

  switch (type) {
    case 'filled':
      return {
        color: contrastText,
        backgroundColor: main
      };
    case 'outlined':
      return {
        color: main,
        border: '1px solid',
        borderColor: main,
        backgroundColor: 'transparent'
      };
    case 'combined':
      return {
        color: main,
        border: '1px solid',
        borderColor: light,
        backgroundColor: lighter
      };
    default:
      return {
        color: main,
        border : border ? border : "none",
        backgroundColor: "transparent"
      };
  }
}

// ==============================|| AVATAR - SIZE STYLE ||============================== //

function getSizeStyle(size) {
  switch (size) {
    case 'badge':
      return {
        border: '2px solid',
        fontSize: '0.675rem',
        width: 20,
        height: 20
      };
    case 'xs':
      return {
        fontSize: '0.75rem',
        width: 24,
        height: 24
      };
    case 'sm':
      return {
        fontSize: '0.875rem',
        width: 32,
        height: 32
      };
    case 'lg':
      return {
        fontSize: '1.2rem',
        width: 52,
        height: 52
      };
    case 'xl':
      return {
        fontSize: '1.5rem',
        width: 64,
        height: 64
      };
    case 'md':
    default:
      return {
        fontSize: '1rem',
        width: 40,
        height: 40
      };
  }
}

// ==============================|| STYLED - AVATAR ||============================== //

const AvatarStyle = styled(MuiAvatar, { shouldForwardProp: (prop) => prop !== 'color' && prop !== 'type' && prop !== 'size' })(
  ({ theme, variant, color, type, size,border }) => ({
    ...getSizeStyle(size),
    ...getColorStyle({ variant, theme, color, type,border }),
    ...(size === 'badge' && {
      borderColor: theme.palette.background.default
    })
  })
);

// ==============================|| EXTENDED - AVATAR ||============================== //

export default function Avatar({ variant = 'circular', children, color = 'primary', type, size = 'md',border,user, ...others }) {
  const theme = useTheme();
  let nameInitials = '';
  if(user?.name) {
    const nameArr = user?.name?.split(' ');
    if (nameArr?.length >= 1) {
      nameInitials += nameArr?.[0]?.charAt(0);
    }
    if (nameArr?.length >= 2) {
      nameInitials += nameArr?.[nameArr?.length - 1]?.charAt(0);
    }
  }
  return (
    <AvatarStyle variant={variant} border={border} theme={theme} color={color} type={type} size={size} {...others}>
      {user?.showInitials === "true" ? nameInitials?.toUpperCase() : children}
    </AvatarStyle>
  );
}

Avatar.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
  variant: PropTypes.string
};
