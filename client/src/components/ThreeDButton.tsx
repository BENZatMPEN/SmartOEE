import { styled } from '@mui/material/styles';
import { CSSProperties } from 'react';

type ThreeDButtonStyleProps = {
  color: string;
  shadowColor: string;
};

const ThreeDButtonStyle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'shadowColor',
})<ThreeDButtonStyleProps>(({ theme, color, shadowColor }) => ({
  '& .pushable': {
    background: color,
    borderRadius: '12px',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    outlineOffset: '4px',
  },

  '& .front': {
    display: 'block',
    padding: '12px 42px',
    borderRadius: '12px',
    fontSize: '1.25rem',
    background: shadowColor,
    color: 'white',
    transform: 'translateY(-6px)',
  },

  '& .pushable:active .front': {
    transform: 'translateY(-2px)',
  },
}));

type ThreeDButtonProps = {
  color: string;
  shadowColor: string;
  label: string;
  onClick: VoidFunction;
  style?: CSSProperties;
};

export function ThreeDButton({ color, shadowColor, label, onClick }: ThreeDButtonProps) {
  return (
    <ThreeDButtonStyle color={color} shadowColor={shadowColor}>
      <button type="button" className="pushable" onClick={onClick} style={{ width: '100%' }}>
        <span className="front">{label}</span>
      </button>
    </ThreeDButtonStyle>
  );
}
