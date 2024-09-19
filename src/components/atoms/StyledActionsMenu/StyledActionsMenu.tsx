import React, { FC, ReactNode } from 'react';
import {
  Icon,
  Menu,
  MenuItem,
  MenuProps,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';

import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';

interface ActionMenuProps {
  label: ReactNode;
  icon?: ReactNode;
  path?: string;
  handleClick?: (event?: unknown) => void;
  hidden?: boolean;
  menuSx?: SxProps;
  disabled?: boolean;
  loading?: boolean;
  isSelected?: boolean;
}

export interface StyledActionsMenuProps extends MenuProps {
  menus?: ActionMenuProps[];
  paperSx?: SxProps;
}

export const StyledActionsMenu: FC<StyledActionsMenuProps> = ({
  menus,
  sx,
  paperSx,
  ...rest
}) => {
  return (
    <Menu
      slotProps={{
        paper: {
          sx: {
            minWidth: 160,
            ...paperSx,
          },
        },
      }}
      sx={{
        '& .MuiMenu-list': {
          p: 0,
        },
        ...sx,
      }}
      {...rest}
    >
      {menus?.map((item, index) => (
        <MenuItem
          key={index}
          onClick={item?.handleClick}
          sx={{ p: '14px 12px' }}
        >
          <Stack alignItems={'center'} direction={'row'} gap={1.25}>
            <Icon
              component={VerticalSplitIcon}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant={'body2'}>Edit columns</Typography>
          </Stack>
        </MenuItem>
      ))}
    </Menu>
  );
};
