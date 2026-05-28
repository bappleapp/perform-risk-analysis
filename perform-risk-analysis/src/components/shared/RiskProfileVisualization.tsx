import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, IconButton } from '@mui/material';
import { RiskFactorScores } from '../../types/perform';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface RiskProfileVisualizationProps {
  scores: { [bodyPart: string]: RiskFactorScores };
  selectedBodyPart?: string;
  onScoreChange?: (bodyPart: string, factor: keyof RiskFactorScores, newScore: number) => void;
  readOnly?: boolean;
}

export const RiskProfileVisualization: React.FC<RiskProfileVisualizationProps> = ({
  scores,
  selectedBodyPart,
  onScoreChange,
  readOnly = false
}) => {
  const [editingMode, setEditingMode] = useState(false);
  const [selectedLegendItem, setSelectedLegendItem] = useState<string | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<{ bodyPart: string; factor: string } | null>(null);
  const [tempScores, setTempScores] = useState<{ [bodyPart: string]: RiskFactorScores }>({...scores});

  useEffect(() => {
    if (editingMode) {
      setTempScores({ ...scores });
    }
  }, [editingMode]); // intentional: snapshot current scores only when entering edit mode

  const riskFactors = [
    {
      id: 'exertion',
      label: 'Exertion',
      descriptions: ['No effort', '', 'Moderate force\n& speed', '', 'Maximum\nforce or speed'],
      colors: ['#f3f3f3', '#eeeeee', '#e9e9e9', '#e4e4e4', '#dfdfdf']
    },
    {
      id: 'awkwardPosture',
      label: 'Awkward Posture',
      descriptions: ['All postures\nneutral', '', 'Moderately\nuncomfortable', '', 'Very\nuncomfortable'],
      colors: ['#ffffe6', '#ffffcd', '#ffffb4', '#ffff97', '#ffff80']
    },
    {
      id: 'vibration',
      label: 'Vibration',
      descriptions: ['None', '', 'Moderate', '', 'Extreme'],
      colors: ['#e9fce9', '#defade', '#d3f8d3', '#c8f7c8', '#bcf5bc']
    },
    {
      id: 'duration',
      label: 'Duration',
      descriptions: ['< 10 min', '10-30 min', '30 min-\n1 Hr', '1-2 Hr', '>2 Hr'],
      colors: ['#deeff5', '#d6ecf3', '#cee8f0', '#c6e4ee', '#bde0eb']
    },
    {
      id: 'repetition',
      label: 'Repetition',
      descriptions: ['No\nrepetition', '', 'cycle time\n< 30s', '', 'cycle time\n< 10s'],
      colors: ['#ecdff7', '#dfcaf2', '#d9bfef', '#d2b4ec', '#cca9e9']
    }
  ];

  const bodyPartColors = ['#D43A2F', '#0B3D6B', '#65a30d', '#ea580c', '#d97706', '#16a34a'];
  
  // Calculate dimensions
  const segmentWidth = 160;
  const segmentHeight = 100;
  const swimlaneMargin = 20;
  const totalWidth = segmentWidth * 5 + swimlaneMargin * 2;
  const totalHeight = (segmentHeight + swimlaneMargin) * riskFactors.length + swimlaneMargin;

  const handleLegendClick = (bodyPart: string) => {
    if (editingMode && !readOnly) {
      setSelectedLegendItem(selectedLegendItem === bodyPart ? null : bodyPart);
    }
  };

  const handlePointMouseDown = (e: React.MouseEvent, bodyPart: string, factor: string) => {
    if (editingMode && !readOnly && selectedLegendItem === bodyPart) {
      e.preventDefault();
      setDraggingPoint({ bodyPart, factor });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingPoint || !editingMode || readOnly) return;

    const svg = e.currentTarget as SVGSVGElement;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    // Calculate which segment the mouse is over
    const segmentIndex = Math.floor((svgPoint.x - swimlaneMargin) / segmentWidth);
    const newScore = Math.min(Math.max(segmentIndex + 1, 1), 5); // Clamp between 1-5

    // Update temporary scores
    setTempScores(prev => ({
      ...prev,
      [draggingPoint.bodyPart]: {
        ...prev[draggingPoint.bodyPart],
        [draggingPoint.factor]: newScore
      }
    }));
  };

  const handleMouseUp = () => {
    if (draggingPoint && !readOnly) {
      // Apply the change to the actual scores
      const newScore = tempScores[draggingPoint.bodyPart][draggingPoint.factor as keyof RiskFactorScores];
      if (onScoreChange) {
        onScoreChange(draggingPoint.bodyPart, draggingPoint.factor as keyof RiskFactorScores, newScore);
      }
      setDraggingPoint(null);
    }
  };

  const handleSaveEdits = () => {
    setEditingMode(false);
    setSelectedLegendItem(null);
    setDraggingPoint(null);
  };

  const handleCancelEdits = () => {
    setEditingMode(false);
    setSelectedLegendItem(null);
    setDraggingPoint(null);
    setTempScores({...scores}); // Reset to original scores
  };

  const isPointSelected = (bodyPart: string, factor: string) => {
    return editingMode && !readOnly && selectedLegendItem === bodyPart;
  };

  const getPointRadius = (bodyPart: string, factor: string) => {
    if (draggingPoint?.bodyPart === bodyPart && draggingPoint?.factor === factor) {
      return 12; // Larger when dragging
    }
    if (isPointSelected(bodyPart, factor)) {
      return 10; // Larger when selected
    }
    return 8; // Default size
  };

  const getPointStrokeWidth = (bodyPart: string, factor: string) => {
    if (draggingPoint?.bodyPart === bodyPart && draggingPoint?.factor === factor) {
      return 3;
    }
    if (isPointSelected(bodyPart, factor)) {
      return 2;
    }
    return 2;
  };

  const currentScores = editingMode && !readOnly ? tempScores : scores;

  if (Object.keys(scores).length === 0) {
    return (
      <Paper className="p-6 text-center">
        <Typography variant="body1" color="textSecondary">
          Select body parts and score risk factors to visualize the risk profile.
        </Typography>
      </Paper>
    );
  }

  // For each factor, map score value → ordered list of body parts sharing that score.
  // Used to stagger overlapping nodes and labels.
  const collisionMap: { [factorId: string]: { [score: number]: string[] } } = {};
  riskFactors.forEach(factor => {
    collisionMap[factor.id] = {};
    Object.entries(currentScores).forEach(([bodyPart, bodyScores]) => {
      const score = bodyScores[factor.id as keyof RiskFactorScores] || 1;
      if (!collisionMap[factor.id][score]) collisionMap[factor.id][score] = [];
      collisionMap[factor.id][score].push(bodyPart);
    });
  });

  return (
    <Paper className="p-6" sx={readOnly ? { boxShadow: 'none', border: 'none' } : {}}>
      {!readOnly && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', mb: 4 }}>
          <Box />
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Risk Profile Visualization
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!editingMode ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditingMode(true)}
                size="small"
              >
                Edit Scores
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEdits}
                  size="small"
                  color="primary"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdits}
                  size="small"
                  color="secondary"
                >
                  Cancel
                </Button>
              </div>
            )}
          </Box>
        </Box>
      )}

      {editingMode && !readOnly && (
        <Box className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <Typography variant="body2" className="font-semibold text-yellow-800">
            ✏️ Edit Mode Active
          </Typography>
          <Typography variant="body2" className="text-yellow-700 mt-1">
            {selectedLegendItem 
              ? `Click and drag points for "${selectedLegendItem.replace(/([A-Z])/g, ' $1').toLowerCase()}" to adjust scores`
              : "Click on a body part in the legend to select it, then drag its points left or right"}
          </Typography>
        </Box>
      )}

      {!readOnly && (
        <Typography variant="body2" color="textSecondary" paragraph>
          This diagram shows the risk profile for each body part without combining scores. 
          Each line represents a body part's exposure to different risk factors.
        </Typography>
      )}

      <Box className="border rounded bg-white p-4">
        <svg
          width="100%"
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Create swimlanes */}
          {riskFactors.map((factor, factorIndex) => (
            <g key={factor.id}>
              {/* Segments for this risk factor */}
              {[0, 1, 2, 3, 4].map((segmentIndex) => (
                <rect
                  key={segmentIndex}
                  x={swimlaneMargin + segmentWidth * segmentIndex}
                  y={swimlaneMargin + (segmentHeight + swimlaneMargin) * factorIndex}
                  width={segmentWidth}
                  height={segmentHeight}
                  fill={factor.colors[segmentIndex]}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              ))}

              {/* Risk factor label */}
              <text
                x={swimlaneMargin + 10}
                y={swimlaneMargin + (segmentHeight + swimlaneMargin) * factorIndex + 20}
                fontSize="12"
                fontWeight="bold"
                fill="#0B3D6B"
              >
                {factor.label}
              </text>

              {/* Score numbers (1-5) */}
              {[0, 1, 2, 3, 4].map((segmentIndex) => (
                <text
                  key={segmentIndex}
                  x={swimlaneMargin + segmentWidth * segmentIndex + 10}
                  y={swimlaneMargin + (segmentHeight + swimlaneMargin) * factorIndex + 40}
                  fontSize="10"
                  fill="#666"
                >
                  {segmentIndex + 1}
                </text>
              ))}

              {/* Descriptions */}
              {factor.descriptions.map((desc, segmentIndex) => (
                desc && (
                  <text
                    key={segmentIndex}
                    x={swimlaneMargin + segmentWidth * segmentIndex + segmentWidth / 2}
                    y={swimlaneMargin + (segmentHeight + swimlaneMargin) * factorIndex + segmentHeight - 20}
                    fontSize="9"
                    fill="#333"
                    textAnchor="middle"
                    style={{ whiteSpace: 'pre' }}
                  >
                    {desc}
                  </text>
                )
              ))}
            </g>
          ))}

          {/* Plot scores for each body part */}
          {Object.entries(currentScores).map(([bodyPart, bodyScores], bodyIndex) => {
            const color = bodyPartColors[bodyIndex % bodyPartColors.length];
            const isSelected = selectedLegendItem === bodyPart;

            // Build points. When multiple body parts share a score in a swimlane, distribute
            // their nodes horizontally (5px apart) centred on the segment midpoint.
            const points = riskFactors.map((factor, factorIndex) => {
              const score = bodyScores[factor.id as keyof RiskFactorScores] || 1;
              const baseX = swimlaneMargin + segmentWidth * (score - 1) + segmentWidth / 2;
              const baseY = swimlaneMargin + (segmentHeight + swimlaneMargin) * factorIndex + segmentHeight / 2;
              const collisionGroup = collisionMap[factor.id][score] ?? [];
              const collisionIndex = collisionGroup.indexOf(bodyPart);
              const n = collisionGroup.length;
              return {
                baseX,
                baseY,
                cx: baseX + (collisionIndex - (n - 1) / 2) * 10,
                cy: baseY,
                factor: factor.id,
                collisionIndex,
              };
            });

            return (
              <g key={bodyPart}>
                {/* Connect points with line using collision-offset positions */}
                {points.length > 1 && (
                  <polyline
                    points={points.map(p => `${p.cx},${p.cy}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeOpacity={isSelected ? 1 : 0.7}
                  />
                )}

                {/* Draw circles at each point */}
                {points.map((point, pointIndex) => (
                  <g key={pointIndex}>
                    <circle
                      cx={point.cx}
                      cy={point.cy}
                      r={getPointRadius(bodyPart, point.factor)}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={getPointStrokeWidth(bodyPart, point.factor)}
                      onMouseDown={(e) => handlePointMouseDown(e, bodyPart, point.factor)}
                      style={{ cursor: editingMode && !readOnly && selectedLegendItem === bodyPart ? "grab" : "default" }}
                      className="transition-all duration-150"
                    />

                    {/* Show score value when editing */}
                    {editingMode && !readOnly && selectedLegendItem === bodyPart && (
                      <text
                        x={point.cx}
                        y={point.cy - 15}
                        fontSize="10"
                        fontWeight="bold"
                        fill={color}
                        textAnchor="middle"
                      >
                        {bodyScores[point.factor as keyof RiskFactorScores] || 1}
                      </text>
                    )}

                    {/* Body part label on first factor (Exertion).
                        Each collision rank steps 13px up and 5px right to avoid overwriting. */}
                    {pointIndex === 0 && (
                      <text
                        x={point.baseX - 40 + point.collisionIndex * 5}
                        y={point.baseY - 15 - point.collisionIndex * 13}
                        fontSize="10"
                        fontWeight="bold"
                        fill={color}
                      >
                        {bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Interactive Legend */}
      <Box className="mt-4 p-3 bg-gray-50 rounded">
        <Typography variant="subtitle2" gutterBottom>
          {editingMode && !readOnly ? 'Select Body Part to Edit:' : 'Legend'}
        </Typography>
        <Box className="flex flex-wrap gap-3 justify-center">
          {Object.keys(currentScores).map((bodyPart, index) => {
            const color = bodyPartColors[index % bodyPartColors.length];
            const isSelected = selectedLegendItem === bodyPart;
            
            return (
              <Box 
                key={bodyPart}
                className={`flex items-center px-3 py-2 rounded cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-offset-1' : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: isSelected ? `${color}20` : 'transparent',
                  borderColor: isSelected ? color : 'transparent',
                  borderWidth: isSelected ? '1px' : '0'
                }}
                onClick={() => handleLegendClick(bodyPart)}
              >
                <svg
                  width="14" height="14"
                  style={{ marginRight: '6px', flexShrink: 0, transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <circle cx="7" cy="7" r="7" fill={color} />
                </svg>
                <Typography 
                  variant="body2"
                  className={isSelected ? 'font-bold' : ''}
                  style={{ color: isSelected ? color : 'inherit' }}
                >
                  {bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Typography>
                
                {/* Edit indicator */}
                {editingMode && !readOnly && isSelected && (
                  <EditIcon className="ml-2" style={{ fontSize: 14, color }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {!readOnly && (
        <Box className="mt-4 p-3 bg-blue-50 rounded">
          <Typography variant="body2">
            <strong>Interactive Features:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Click "Edit Scores" to enable interactive mode</li>
              <li>Select a body part from the legend to edit its scores</li>
              <li>Click and drag points left or right to adjust scores</li>
              <li>Scores update in real-time on the sliders above</li>
              <li>Save or cancel your changes when finished</li>
            </ul>
          </Typography>
        </Box>
      )}
    </Paper>
  );
};