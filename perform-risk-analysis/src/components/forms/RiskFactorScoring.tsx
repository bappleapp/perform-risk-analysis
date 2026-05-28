// src/components/forms/RiskFactorScoring.tsx
import React, { useState } from 'react';
import { Grid, Typography, Paper, Box, Slider, Card, CardContent } from '@mui/material';
import { usePerformStore } from '../../stores/performStore';
import { BodyMap } from '../shared/BodyMap';
import { RiskProfileVisualization } from '../shared/RiskProfileVisualization';
import { RiskFactorScores } from '../../types/perform';

const riskFactors = [
  {
    id: 'exertion',
    label: 'Exertion',
    description: 'How much force is the person using?',
    marks: [
      { value: 1, label: 'No effort' },
      { value: 3, label: 'Moderate force\n& speed' },
      { value: 5, label: 'Maximum\nforce or speed' },
    ],
  },
  {
    id: 'awkwardPosture',
    label: 'Awkward Posture',
    description: 'How awkward is the person\'s posture?',
    marks: [
      { value: 1, label: 'All postures\nneutral' },
      { value: 3, label: 'Moderately\nuncomfortable' },
      { value: 5, label: 'Very\nuncomfortable' },
    ],
  },
  {
    id: 'vibration',
    label: 'Vibration',
    description: 'How much are the whole body or hand(s) being vibrated?',
    marks: [
      { value: 1, label: 'None' },
      { value: 3, label: 'Moderate' },
      { value: 5, label: 'Extreme' },
    ],
  },
  {
    id: 'duration',
    label: 'Duration',
    description: 'How long is the action performed for?',
    marks: [
      { value: 1, label: '<10 min' },
      { value: 2, label: '10-30 min' },
      { value: 3, label: '30 min-\n1 hr' },
      { value: 4, label: '1-2 hrs' },
      { value: 5, label: '>2 hrs' },
    ],
  },
  {
    id: 'repetition',
    label: 'Repetition',
    description: 'How often are similar actions done?',
    marks: [
      { value: 1, label: 'No\nrepetition' },
      { value: 3, label: 'Cycle time\n<30 s' },
      { value: 5, label: 'Cycle time\n<10 s' },
    ],
  },
];

export const RiskFactorScoring: React.FC = () => {
  const { currentScenario, setBodyPartScore, setCurrentScenario, updateCurrentScenario } = usePerformStore();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');

  const bodyPartScores = currentScenario.bodyPartScores || {};
  const selectedScores = selectedBodyPart ? bodyPartScores[selectedBodyPart] : {} as RiskFactorScores;
  const selectedBodyParts = Object.keys(bodyPartScores);

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
    if (!bodyPartScores[bodyPart]) {
      updateCurrentScenario({
        bodyPartScores: {
          ...bodyPartScores,
          [bodyPart]: { exertion: 1, awkwardPosture: 1, vibration: 1, duration: 1, repetition: 1 },
        },
      });
    }
  };

  const handleBodyPartDeselect = (bodyPart: string) => {
    const updatedScores = { ...currentScenario.bodyPartScores };
    delete updatedScores[bodyPart];
    
    setCurrentScenario({
      ...currentScenario,
      bodyPartScores: updatedScores,
    });

    if (selectedBodyPart === bodyPart) {
      setSelectedBodyPart('');
    }
  };

  const handleScoreChangeFromVisualization = (bodyPart: string, factor: keyof RiskFactorScores, newScore: number) => {
    setBodyPartScore(bodyPart, factor, newScore);
    
    // If this body part is currently selected, update the sliders
    if (selectedBodyPart === bodyPart) {
      setSelectedBodyPart(bodyPart); // This will refresh the sliders
    }
  };

  const handleScoreChange = (factor: keyof RiskFactorScores, value: number) => {
    if (selectedBodyPart) {
      setBodyPartScore(selectedBodyPart, factor, value);
    }
  };

  return (
    <div className="space-y-6">
      <Typography variant="h5" gutterBottom>
        Risk Factor Scoring
      </Typography>

      <Grid container spacing={4}>
        {/* Body Map */}
        <Grid item xs={12} md={5}>
          <BodyMap
            selectedBodyParts={selectedBodyParts}
            scoringBodyPart={selectedBodyPart}
            onBodyPartSelect={handleBodyPartSelect}
            onBodyPartDeselect={handleBodyPartDeselect}
          />
        </Grid>

        {/* Risk Factor Sliders */}
        <Grid item xs={12} md={7}>
          {!selectedBodyPart ? (
            <Paper className="p-6 text-center">
              <Typography variant="h6" color="textSecondary">
                Select a body part to begin scoring risk factors
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mt-2">
                Click on the body map to select affected body parts, then use the sliders to score each risk factor.
              </Typography>
            </Paper>
          ) : (
            <Paper className="p-6">
              <Typography variant="h6" gutterBottom className="capitalize">
                Scoring for: {selectedBodyPart.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Typography>
              
              <div className="space-y-6">
                {riskFactors.map((factor) => (
                  <Card key={factor.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom className="font-semibold">
                        {factor.label}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {factor.description}
                      </Typography>
                      
                      <Box className="mt-4" sx={{ width: '90%', mx: 'auto' }}>
                        <Slider
                          value={selectedScores[factor.id as keyof RiskFactorScores] || 1}
                          onChange={(_, value) => handleScoreChange(
                            factor.id as keyof RiskFactorScores,
                            value as number
                          )}
                          step={1}
                          marks={factor.marks}
                          min={1}
                          max={5}
                          valueLabelDisplay="auto"
                          sx={{
                            '& .MuiSlider-markLabel': {
                              whiteSpace: 'pre-line',
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              lineHeight: 1.2,
                              marginTop: '8px'
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Current Scores Summary */}
              {selectedBodyPart && (
                <Box className="mt-6 p-4 bg-gray-50 rounded">
                  <Typography variant="subtitle2" gutterBottom>
                    Current Scores for {selectedBodyPart}:
                  </Typography>
                  <Grid container spacing={1}>
                    {riskFactors.map((factor) => (
                      <Grid item xs={6} key={factor.id}>
                        <Typography variant="body2">
                          {factor.label}: {selectedScores[factor.id as keyof RiskFactorScores] || 1}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Risk Profile Visualization */}
      {selectedBodyParts.length > 0 && (
        <RiskProfileVisualization 
          scores={bodyPartScores}
          selectedBodyPart={selectedBodyPart}
          onScoreChange={handleScoreChangeFromVisualization}
        />
      )}
    </div>
  );
};