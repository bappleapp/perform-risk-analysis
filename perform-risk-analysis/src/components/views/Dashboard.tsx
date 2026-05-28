import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, Chip, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import SafetyCheckIcon from '@mui/icons-material/VerifiedUser';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePerformStore } from '../../stores/performStore';

export const Dashboard: React.FC = () => {
  const { scenarios, deleteScenario } = usePerformStore();

  const ITEMS_PER_PAGE = 20;
  const [page, setPage] = useState(1);
  const allScenarios = [...scenarios].reverse();
  const totalPages = Math.ceil(allScenarios.length / ITEMS_PER_PAGE);
  const pagedScenarios = allScenarios.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardContent className="text-center py-12">
          <AssessmentIcon className="text-6xl text-primary mb-4" />
            <Typography variant="h4" gutterBottom>
              PErForM Risk Analysis Tool
            </Typography>
          <Box className="flex justify-center p-5">
            <Typography variant="body1" color="textSecondary" className="mb-6 max-w-2xl mx-auto"> 
              Participative Ergonomics for Manual Tasks - A comprehensive tool for analysing and managing risks associated with hazardous manual tasks in the workplace.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            component={Link}
            to="/analysis"
            onClick={() => {
              const { resetAnalysis } = usePerformStore.getState();
              resetAnalysis();
            }}
          >
            Start New Analysis
          </Button>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent className="text-center">
              <HistoryIcon className="text-4xl text-primary mb-2" />
              <Typography variant="h3" className="font-bold">
                {scenarios.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Analyses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent className="text-center">
              <SafetyCheckIcon className="text-4xl text-green-600 mb-2" />
              <Typography variant="h3" className="font-bold text-green-600">
                {scenarios.filter(s => Object.keys(s.bodyPartScores || {}).length > 0).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed Analyses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent className="text-center">
              <AssessmentIcon className="text-4xl text-orange-600 mb-2" />
              <Typography variant="h3" className="font-bold text-orange-600">
                {scenarios.filter(s => {
                const rc = s.riskControls;
                return rc && (rc.designControls || rc.administrativeControls || rc.comments);
              }).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                With Control Measures
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Analyses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom className="flex items-center">
                <HistoryIcon className="mr-2" />
                Recent Analyses
              </Typography>

              {allScenarios.length === 0 ? (
                <Typography color="textSecondary" className="text-center py-8">
                  No analyses yet. Start your first risk analysis to see it here.
                </Typography>
              ) : (
                <>
                  <div className="space-y-2">
                    {pagedScenarios.map((scenario) => (
                      <Card key={scenario.id} variant="outlined">
                        <CardContent className="flex justify-between items-center py-3">
                          <Box>
                            <Typography variant="h6">{scenario.name}</Typography>
                            <Box className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Typography variant="body2" color="textSecondary">
                                {scenario.workplace} • {new Date(scenario.date).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={`${Object.keys(scenario.bodyPartScores || {}).length} body parts assessed`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <Box className="flex gap-2 ml-4 shrink-0">
                            <Button
                              variant="outlined"
                              component={Link}
                              to={`/analysis/${scenario.id}`}
                            >
                              View/Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => {
                                if (window.confirm(`Delete "${scenario.name}"? This cannot be undone.`)) {
                                  deleteScenario(scenario.id);
                                  if (pagedScenarios.length === 1 && page > 1) setPage(page - 1);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Box className="flex justify-center mt-4">
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        size="small"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};