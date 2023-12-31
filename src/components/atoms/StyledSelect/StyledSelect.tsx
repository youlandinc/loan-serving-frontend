import { FC } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
} from '@mui/material';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { TOption } from '@/types';

interface StyledSelectProps {
  label: string;
  labelId: string;
  id: string;
  value: string | undefined | number;
  onChange: SelectInputProps['onChange'];
  options: TOption[];
  sx?: SxProps;
  required?: boolean;
}

export const StyledSelect: FC<StyledSelectProps> = ({
  label,
  labelId,
  id,
  value,
  onChange,
  options,
  sx,
  required = false,
}) => {
  return (
    <FormControl
      required={required}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          padding: 0,
          border: 'none',
          '& .MuiInputLabel-outlined': {
            transform: 'translate(14px, 18px) scale(1)',
          },
          '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
          '& .MuiOutlinedInput-input': {
            padding: '16.5px 32px 16.5px 14px',
          },
          '& fieldset': {
            border: '1px solid',
            borderColor: 'border.normal',
            borderRadius: 3,
          },
          '&.Mui-focused fieldset': {
            border: '1px solid',
            borderColor: 'border.focus',
          },
          '&:hover fieldset': {
            border: '1px solid',
            borderColor: 'text.primary',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'text.secondary',
          '&.Mui-focused': {
            color: 'text.secondary',
          },
        },
        ...sx,
      }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        id={id}
        label={label}
        labelId={labelId}
        MenuProps={{
          disableScrollLock: true,
          MenuListProps: {
            sx: {
              m: 0,
              p: 0,
            },
          },
        }}
        onChange={onChange}
        value={value}
      >
        {options.map((item) => (
          <MenuItem key={item.label} sx={{ p: 1.5 }} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
