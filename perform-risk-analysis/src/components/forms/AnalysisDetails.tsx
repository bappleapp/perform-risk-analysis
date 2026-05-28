// src/components/forms/AnalysisDetails.tsx
import React from 'react';
import { TextField, Grid, Typography, Box, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePerformStore } from '../../stores/performStore';
import { RiskAssessor } from '../../types/perform';

export const AnalysisDetails: React.FC = () => {
  const { currentScenario, updateCurrentScenario } = usePerformStore();

  const handleTaskDescriptionChange = (field: string, value: string) => {
    updateCurrentScenario({
      taskDescription: {
        ...currentScenario.taskDescription,
        [field]: value,
      },
    });
  };

  const addRiskAssessor = () => {
    const currentAssessors = currentScenario.riskAssessors || [];
    updateCurrentScenario({
      riskAssessors: [...currentAssessors, { id: Math.random().toString(36).slice(2, 11), name: '', position: '' }],
    });
  };

  const updateRiskAssessor = (index: number, field: keyof RiskAssessor, value: string) => {
    const currentAssessors = currentScenario.riskAssessors || [];
    const updatedAssessors = currentAssessors.map((assessor, i) =>
      i === index ? { ...assessor, [field]: value } : assessor
    );
    updateCurrentScenario({ riskAssessors: updatedAssessors });
  };

  const removeRiskAssessor = (index: number) => {
    const currentAssessors = currentScenario.riskAssessors || [];
    const updatedAssessors = currentAssessors.filter((_, i) => i !== index);
    updateCurrentScenario({ riskAssessors: updatedAssessors });
  };

  return (
    <div className="space-y-6">
      <Typography variant="h5" gutterBottom>
        Analysis Details
      </Typography>

      <Grid container spacing={4}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={currentScenario.date || ''}
            onChange={(e) => updateCurrentScenario({ date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Workplace"
            value={currentScenario.workplace || ''}
            onChange={(e) => updateCurrentScenario({ workplace: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Work Unit/Team"
            value={currentScenario.workUnit || ''}
            onChange={(e) => updateCurrentScenario({ workUnit: e.target.value })}
          />
        </Grid>

        {/* Risk Assessors */}
        <Grid item xs={12} className="text-left">
          <Typography variant="h6" gutterBottom>
            Risk Assessors
          </Typography>
          {(currentScenario.riskAssessors || []).map((assessor, index) => (
            <Box key={assessor.id ?? index} className="flex items-center space-x-4 mb-3">
              <TextField
                label="Name"
                value={assessor.name}
                onChange={(e) => updateRiskAssessor(index, 'name', e.target.value)}
                className="flex-1"
              />
              <TextField
                label="Position"
                value={assessor.position}
                onChange={(e) => updateRiskAssessor(index, 'position', e.target.value)}
                className="flex-1"
              />
              <IconButton
                onClick={() => removeRiskAssessor(index)}
                color="error"
                disabled={(currentScenario.riskAssessors || []).length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addRiskAssessor}
            variant="outlined"
          >
            Add Risk Assessor
          </Button>
        </Grid>

        {/* Task Description */}
        <Grid item xs={12} className="text-left">
          <Typography variant="h6" gutterBottom>
            Task Description
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name of Task"
                value={currentScenario.taskDescription?.name || ''}
                onChange={(e) => handleTaskDescriptionChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Why was this task selected?"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.whySelected || ''}
                onChange={(e) => handleTaskDescriptionChange('whySelected', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location where task occurs"
                value={currentScenario.taskDescription?.location || ''}
                onChange={(e) => handleTaskDescriptionChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Who performs the task?"
                value={currentScenario.taskDescription?.performedBy || ''}
                onChange={(e) => handleTaskDescriptionChange('performedBy', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="General Description"
                multiline
                rows={3}
                value={currentScenario.taskDescription?.generalDescription || ''}
                onChange={(e) => handleTaskDescriptionChange('generalDescription', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postures"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.postures || ''}
                onChange={(e) => handleTaskDescriptionChange('postures', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Forceful/Muscular Exertions"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.forcefulExertions || ''}
                onChange={(e) => handleTaskDescriptionChange('forcefulExertions', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Repetition and Duration"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.repetitionDuration || ''}
                onChange={(e) => handleTaskDescriptionChange('repetitionDuration', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tools or Equipment Used"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.toolsEquipment || ''}
                onChange={(e) => handleTaskDescriptionChange('toolsEquipment', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work/Task Organisation and Environment"
                multiline
                rows={2}
                value={currentScenario.taskDescription?.workOrganization || ''}
                onChange={(e) => handleTaskDescriptionChange('workOrganization', e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
