import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, Stepper, Step, StepLabel, StepButton, Button, Box } from '@mui/material';
import { usePerformStore } from '../../stores/performStore';
import { AnalysisDetails } from '../forms/AnalysisDetails';
import { RiskFactorScoring } from '../forms/RiskFactorScoring';
import { RiskControls } from '../forms/RiskControls';
import { ResultsSummary } from '../forms/ResultsSummary';

const steps = [
  'Analysis Details',
  'Risk Factor Scoring',
  'Risk Controls',
  'Results Summary'
];

export const AnalysisWizard: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const { currentStep, setCurrentStep, loadScenario, currentScenario, scenarios } = usePerformStore();

  // Reset to step 0 when navigating to /analysis (new analysis)
  useEffect(() => {
    if (location.pathname === '/analysis' && !id) {
      usePerformStore.getState().resetAnalysis();
    }
  }, [location.pathname, id]);

  useEffect(() => {
    if (id) {
      const scenario = scenarios.find(s => s.id === id);
      if (scenario) {
        loadScenario(id);
      }
    }
  }, [id, loadScenario, scenarios]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <AnalysisDetails />;
      case 1:
        return <RiskFactorScoring />;
      case 2:
        return <RiskControls />;
      case 3:
        return <ResultsSummary />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Card sx={{ '@media print': { boxShadow: 'none', border: 'none', borderRadius: 0 } }}>
        <CardContent className="p-8" sx={{ '@media print': { padding: 0 } }}>
          {/* Progress Stepper */}
          <div className="print:hidden">
            <Stepper activeStep={currentStep} className="mb-8">
              {steps.map((label, index) => (
                <Step key={label}>
                  {currentStep === steps.length - 1 && index !== steps.length - 1 ? (
                    <StepButton onClick={() => setCurrentStep(index)}>
                      {label}
                    </StepButton>
                  ) : (
                    <StepLabel>{label}</StepLabel>
                  )}
                </Step>
              ))}
            </Stepper>
          </div>

          {/* Step Content */}
          <div className="min-h-96">
            {renderStepContent(currentStep)}
          </div>

          {/* Navigation Buttons */}
          <Box className="flex justify-between mt-8 pt-6 border-t print:hidden">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outlined"
            >
              Back
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => window.print()}
              >
                Print Report
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!currentScenario.taskDescription?.name || !currentScenario.workplace)) ||
                  (currentStep === 1 && Object.keys(currentScenario.bodyPartScores || {}).length === 0)
                }
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};
