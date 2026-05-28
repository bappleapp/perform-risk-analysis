import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

interface BodyMapProps {
  selectedBodyParts: string[];
  scoringBodyPart?: string;
  onBodyPartSelect?: (bodyPart: string) => void;
  onBodyPartDeselect?: (bodyPart: string) => void;
  readOnly?: boolean;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedBodyParts,
  scoringBodyPart,
  onBodyPartSelect,
  onBodyPartDeselect,
  readOnly = false,
}) => {
  const [hoveredBodyPart, setHoveredBodyPart] = useState<string | null>(null);

  const bodyParts = [
    { id: 'neck', label: 'Neck', x: 50, y: 33 },
    { id: 'left-shoulder', label: 'Left-Shoulder', x: 35, y: 40 },
    { id: 'right-shoulder', label: 'Right-Shoulder', x: 65, y: 40 },
    { id: 'upperBack', label: 'Upper Back', x: 50, y: 45 },
    { id: 'lowerBack', label: 'Lower Back', x: 50, y: 70 },
    { id: 'left-elbow', label: 'Left-Elbow', x: 30, y: 60 },
    { id: 'right-elbow', label: 'Right-Elbow', x: 70, y: 60 },
    { id: 'left-wrist', label: 'Left-Wrist/Hand', x: 25, y: 85 },
    { id: 'right-wrist', label: 'Right-Wrist/Hand', x: 75, y: 85 },
    { id: 'left-hip', label: 'Left-Hip/Thigh', x: 45, y: 80 },
    { id: 'right-hip', label: 'Right-Hip/Thigh', x: 55, y: 80 },
    { id: 'left-knee', label: 'Left-Knee', x: 39, y: 105 },
    { id: 'right-knee', label: 'Right-Knee', x: 61, y: 105 },
    { id: 'left-ankle', label: 'Left-Ankle/Foot', x: 31, y: 135 },
    { id: 'right-ankle', label: 'Right-Ankle/Foot', x: 69, y: 135 },
  ];

  const isSelected = (bodyPart: string) => selectedBodyParts.includes(bodyPart);
  const isHovered = (bodyPart: string) => hoveredBodyPart === bodyPart;

  const handleBodyPartClick = (bodyPart: string) => {
    onBodyPartSelect?.(bodyPart);
  };

  const handleBodyPartDeselect = (bodyPart: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onBodyPartDeselect?.(bodyPart);
  };

  const getBodyPartColor = (bodyPart: string) => {
    if (bodyPart === scoringBodyPart) return '#F97316'; // Orange for actively scoring
    if (isSelected(bodyPart)) return '#D43A2F'; // Red for scored but not active
    if (isHovered(bodyPart)) return '#1E6CB3'; // Blue for hover
    return '#0B3D6B'; // Default blue
  };

  const getBodyPartSize = (bodyPart: string) => {
    if (isHovered(bodyPart)) return 5; // Larger when hovered
    return 4; // Default size
  };

  const getBodyPartStroke = (bodyPart: string) => {
    if (bodyPart === scoringBodyPart) return '#EA580C';
    if (isSelected(bodyPart)) return '#A52A2A';
    if (isHovered(bodyPart)) return '#0B3D6B';
    return '#082947';
  };

  return (
    <Paper className="p-6" sx={readOnly ? { padding: '4px', boxShadow: 'none', border: 'none' } : {}}>
      {!readOnly && (
        <Typography variant="h6" gutterBottom className="text-center">
          Select Affected Body Parts
        </Typography>
      )}
      
      <Box className="relative mx-auto" sx={{ maxWidth: readOnly ? '100%' : '16rem' }}>
        <svg viewBox="0 0 100 150" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Body outline */}
          <circle cx="50" cy="20" r="13" fill="#e0e0e0" />
          <path d="M50 28 L50 80" stroke="#e0e0e0" strokeWidth="10" />
          <path d="M35 40 L65 40" stroke="#e0e0e0" strokeWidth="10" />
          <path d="M35 40 L25 85" stroke="#e0e0e0" strokeWidth="10" strokeLinecap='round'/>
          <path d="M65 40 L75 85" stroke="#e0e0e0" strokeWidth="10" strokeLinecap='round'/>
          <path d="M45 80 L55 80" stroke="#e0e0e0" strokeWidth="10" />
          <path d="M45 80 L30 140" stroke="#e0e0e0" strokeWidth="10" strokeLinecap='round'/>
          <path d="M55 80 L70 140" stroke="#e0e0e0" strokeWidth="10" strokeLinecap='round'/>
          
          {/* Body part dots */}
          {bodyParts.map((part) => (
            <g
              key={part.id}
              onClick={readOnly ? undefined : () => handleBodyPartClick(part.id)}
              onMouseEnter={readOnly ? undefined : () => setHoveredBodyPart(part.id)}
              onMouseLeave={readOnly ? undefined : () => setHoveredBodyPart(null)}
              className={`transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                transform: isHovered(part.id) ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: `${part.x}% ${part.y}%`
              }}
            >
              <circle
                cx={part.x}
                cy={part.y}
                r={getBodyPartSize(part.id)}
                fill={getBodyPartColor(part.id)}
                stroke={getBodyPartStroke(part.id)}
                strokeWidth="1"
                className="transition-all duration-200"
              />
              <text
                x={part.x}
                y={part.y - 6}
                textAnchor="middle"
                fontSize="3"
                fill={getBodyPartColor(part.id)}
                className="font-bold transition-all duration-200"
                style={{
                  fontSize: isHovered(part.id) ? '3.5' : '3'
                }}
              >
                {part.label}
              </text>

              {/* Deselect button (only shows when selected and not readOnly) */}
              {isSelected(part.id) && !readOnly && (
                <g 
                  onClick={(e) => handleBodyPartDeselect(part.id, e)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={part.x + 6}
                    cy={part.y - 6}
                    r="2"
                    fill="#D43A2F"
                    stroke="#A52A2A"
                    strokeWidth="0.5"
                  />
                  <text
                    x={part.x + 6}
                    y={part.y - 5.5}
                    textAnchor="middle"
                    fontSize="2"
                    fill="white"
                    fontWeight="bold"
                  >
                    ×
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </Box>

      {!readOnly && (
        <>
          <Box className="mt-4">
            <Typography variant="body2" color="textSecondary" className="text-center">
              • Click a body part to add it and begin scoring
              <br />
              • Orange = currently scoring &nbsp;•&nbsp; Red = scored
              <br />
              • Use × to remove a body part
            </Typography>
          </Box>

          {selectedBodyParts.length > 0 && (
            <Box className="mt-4 p-3 bg-blue-50 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="body2" className="font-semibold">
                    Selected Body Parts:
                  </Typography>
                  <Typography variant="body2">
                    {selectedBodyParts.map(part =>
                      bodyParts.find(p => p.id === part)?.label
                    ).join(', ')}
                  </Typography>
                </div>
                <IconButton
                  size="small"
                  onClick={() => selectedBodyParts.forEach(part => onBodyPartDeselect?.(part))}
                  title="Clear all selections"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </div>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};