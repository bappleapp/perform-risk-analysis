import React from 'react';
import { TextField, Typography, Grid, Paper, Box } from '@mui/material';
import { usePerformStore } from '../../stores/performStore';

export const RiskControls: React.FC = () => {
  const { currentScenario, updateCurrentScenario } = usePerformStore();

  const handleRiskControlsChange = (field: string, value: string) => {
    updateCurrentScenario({
      riskControls: {
        ...currentScenario.riskControls,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Typography variant="h5" gutterBottom>
        Risk Controls
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper className="p-6">
            <Typography variant="h6" gutterBottom color="primary">
              Design Control Options
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Eliminate, substitute, or engineer solutions to control risks at the source.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Examples:&#10;• Use mechanical lifting aids&#10;• Adjust workbench heights&#10;• Provide anti-vibration tools&#10;• Automate repetitive tasks"
              value={currentScenario.riskControls?.designControls || ''}
              onChange={(e) => handleRiskControlsChange('designControls', e.target.value)}
              variant="outlined"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-6">
            <Typography variant="h6" gutterBottom color="primary">
              Administrative Control Options
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Implement policies, procedures, and training to reduce exposure to risks.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Examples:&#10;• Job rotation schedules&#10;• Regular rest breaks&#10;• Training programs&#10;• Maintenance procedures"
              value={currentScenario.riskControls?.administrativeControls || ''}
              onChange={(e) => handleRiskControlsChange('administrativeControls', e.target.value)}
              variant="outlined"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-6">
            <Typography variant="h6" gutterBottom color="primary">
              Additional Comments
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Any additional notes, implementation timelines, or follow-up actions..."
              value={currentScenario.riskControls?.comments || ''}
              onChange={(e) => handleRiskControlsChange('comments', e.target.value)}
              variant="outlined"
            />
          </Paper>
        </Grid>

        {/* Guidance Section */}
        <Grid item xs={12}>
          <Paper className="p-6 bg-blue-50 border border-blue-200">
            <Typography variant="h6" gutterBottom color="primary">
              💡 Control Hierarchy Guidance
            </Typography>
            <Box className="space-y-2 text-sm">
              <Typography variant="body2">
                <strong>Design Controls (Most Effective):</strong> Eliminate hazards through design changes
              </Typography>
              <Typography variant="body2">
                <strong>Administrative Controls (Less Effective):</strong> Change work practices and procedures
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Remember: Design controls are always preferred over administrative controls.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};