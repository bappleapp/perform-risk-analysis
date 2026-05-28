import React, { useState } from 'react';
import { Typography, Grid, Paper, Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { usePerformStore } from '../../stores/performStore';
import { RiskProfileVisualization } from '../shared/RiskProfileVisualization';
import { BodyMap } from '../shared/BodyMap';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReactMarkdown from 'react-markdown';
import acknowledgementsContent from '../../../../docs/reference/acknowledgements.md?raw';

export const ResultsSummary: React.FC = () => {
  const { currentScenario, saveScenario, updateScenario } = usePerformStore();
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);

  const handleSaveAnalysis = () => {
    if (currentScenario.id) {
      setShowOverwriteDialog(true);
    } else {
      const name = prompt('Enter a name for this analysis:');
      if (name) saveScenario(name);
    }
  };

  const handleConfirmOverwrite = () => {
    updateScenario(currentScenario.id!);
    setShowOverwriteDialog(false);
  };

  const boldControlTerms = (text: string) => {
    const terms = ['Elimination', 'Substitution', 'Engineering control'];
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    return text.split(regex).map((part, i) =>
      terms.some(t => t.toLowerCase() === part.toLowerCase())
        ? <strong key={i}>{part}</strong>
        : part
    );
  };

  if (!currentScenario.taskDescription?.name) {
    return (
      <div className="text-center py-12">
        <Typography variant="h6" color="textSecondary">
          No analysis data available. Please complete the previous steps.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print-only title */}
      <div className="hidden print:block">
        <Typography variant="h5">
          PErForM Risk Analysis — {currentScenario.taskDescription?.name}
        </Typography>
      </div>

      {/* Screen-only header with buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', '@media print': { display: 'none' } }}>
        <Box />
        <Typography variant="h5" sx={{ textAlign: 'center' }}>
          Analysis Summary
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAnalysis}
          >
            Save Analysis
          </Button>
        </Box>
      </Box>

      {/* Basic Information */}
      <Paper className="p-6" sx={{ backgroundColor: '#f9fafb', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
        <Typography variant="h6" gutterBottom>
          Analysis Details
        </Typography>
        <div className="space-y-2 text-left">
          {[
            { label: 'Task Name', value: currentScenario.taskDescription.name },
            { label: 'Workplace', value: currentScenario.workplace },
            { label: 'Date', value: currentScenario.date || 'Not specified' },
            { label: 'Work Unit', value: currentScenario.workUnit || 'Not specified' },
            {
              label: 'Analysis performed by',
              value: (currentScenario.riskAssessors || []).map(a => a.name).filter(Boolean).join(', ') || 'Not specified',
            },
          ].map(({ label, value }) => (
            <Typography key={label} variant="body2">
              <strong>{label}:</strong> {value}
            </Typography>
          ))}
        </div>
      </Paper>

      {/* Risk Profile Visualization */}
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>
          Risk Profile
        </Typography>

        {Object.keys(currentScenario.bodyPartScores || {}).length === 0 ? (
          <Typography color="textSecondary" className="text-center py-4">
            No risk factors assessed yet.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" paragraph className="text-left">
              This visualization shows the risk profile for each affected body part.
              Each line represents a body part's exposure to different risk factors without combining scores.
            </Typography>

            {/* Body map + risk profile side by side at 20 / 80 */}
            <Box sx={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
              <Box sx={{ width: '20%', flexShrink: 0, marginTop: '70px' }}>
                <BodyMap
                  selectedBodyParts={Object.keys(currentScenario.bodyPartScores || {})}
                  readOnly
                />
              </Box>
              <Box sx={{ width: '80%', minWidth: 0 }}>
                <RiskProfileVisualization
                  scores={currentScenario.bodyPartScores || {}}
                  readOnly={true}
                />
              </Box>
            </Box>

          </>
        )}
      </Paper>

      {/* Analysis Summary — own card, starts new page in print */}
      {Object.keys(currentScenario.bodyPartScores || {}).length > 0 && (
        <Paper className="p-6" sx={{ backgroundColor: '#EBF5FB', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', '@media print': { breakBefore: 'page' } }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            Analysis Summary
          </Typography>
          <div className="space-y-3 text-left">
            {(() => {
              const bodyPartScores = currentScenario.bodyPartScores || {};
              const bodyPartsWithHighScores = Object.entries(bodyPartScores)
                .filter(([_, scores]) =>
                  Object.values(scores).some(score => score >= 4)
                )
                .map(([bodyPart]) => bodyPart);

              if (bodyPartsWithHighScores.length > 0) {
                return (
                  <Typography variant="body2">
                    <strong>High Risk Areas:</strong> {bodyPartsWithHighScores
                      .map(bp => bp.replace(/([A-Z])/g, ' $1').toLowerCase())
                      .join(', ')} show scores of 4 or 5, indicating significant risk exposure.
                  </Typography>
                );
              }
              return (
                <Typography variant="body2">
                  <strong>Overall Analysis:</strong> Risk exposure appears moderate to low across all assessed body parts.
                </Typography>
              );
            })()}

            {(() => {
              const bodyPartScores = currentScenario.bodyPartScores || {};
              const allScores = Object.values(bodyPartScores).flatMap(scores =>
                Object.entries(scores)
              );
              const factorScores: { [key: string]: number[] } = {};
              allScores.forEach(([factor, score]) => {
                if (!factorScores[factor]) factorScores[factor] = [];
                factorScores[factor].push(score);
              });
              const averageScores = Object.entries(factorScores).map(([factor, scores]) => ({
                factor,
                average: scores.reduce((a, b) => a + b, 0) / scores.length
              })).sort((a, b) => b.average - a.average);
              const prominentFactors = averageScores.filter(f => f.average >= 3).slice(0, 2);

              if (prominentFactors.length > 0) {
                return (
                  <Typography variant="body2">
                    <strong>Most Prominent Risk Factors:</strong> {
                      prominentFactors.map(f => {
                        const factorNames: { [key: string]: string } = {
                          exertion: 'Exertion',
                          awkwardPosture: 'Awkward Posture',
                          vibration: 'Vibration',
                          duration: 'Duration',
                          repetition: 'Repetition'
                        };
                        return `${factorNames[f.factor]} (average score: ${f.average.toFixed(1)})`;
                      }).join(', ')
                    }
                  </Typography>
                );
              }
              return null;
            })()}
          </div>
        </Paper>
      )}

      {/* Recommended Controls */}
      {(currentScenario.riskControls?.designControls || currentScenario.riskControls?.administrativeControls) && (
        <Paper className="p-6" sx={{ backgroundColor: '#E9F7EF', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
          <Typography variant="h6" gutterBottom>
            Recommended Controls
          </Typography>
          
          <div className="space-y-4">
            {currentScenario.riskControls?.designControls && (
              <div>
                <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 0.5 }}>
                  Design Controls
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap text-left">
                  {boldControlTerms(currentScenario.riskControls.designControls)}
                </Typography>
              </div>
            )}
            {currentScenario.riskControls?.administrativeControls && (
              <div>
                <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 0.5 }}>
                  Administrative Controls
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap text-left">
                  {boldControlTerms(currentScenario.riskControls.administrativeControls)}
                </Typography>
              </div>
            )}
          </div>
        </Paper>
      )}

      {/* Acknowledgements — print only */}
      <Paper className="p-6 hidden print:block">
        <ReactMarkdown
          components={{
            h2: ({ children }) => <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>{children}</Typography>,
            p:  ({ children }) => <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>{children}</Typography>,
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
          }}
        >
          {acknowledgementsContent}
        </ReactMarkdown>
      </Paper>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 print:hidden">
        <Button
          variant="outlined"
          onClick={() => {
            const { resetAnalysis } = usePerformStore.getState();
            resetAnalysis();
          }}
        >
          Start New Analysis
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAnalysis}
        >
          Save Analysis
        </Button>
      </div>

      {/* Overwrite confirmation dialog */}
      <Dialog open={showOverwriteDialog} onClose={() => setShowOverwriteDialog(false)}>
        <DialogTitle>Save Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to overwrite <strong>{currentScenario.name}</strong> with your current changes. This cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Are you sure you want to save?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOverwriteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmOverwrite} variant="contained" color="primary">
            Save & Overwrite
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};