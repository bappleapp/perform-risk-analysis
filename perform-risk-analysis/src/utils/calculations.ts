import { RiskFactorScores, BodyPartScores } from '../types/perform';

export const calculateTotalRiskScore = (scores: RiskFactorScores): number => {
  if (!scores) return 0;
  return Object.values(scores).reduce((total, score) => total + (score || 0), 0);
};

export const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 20) return { level: 'High Risk', color: '#dc2626' };
  if (score >= 15) return { level: 'Medium-High Risk', color: '#ea580c' };
  if (score >= 10) return { level: 'Medium Risk', color: '#d97706' };
  if (score >= 5) return { level: 'Low-Medium Risk', color: '#65a30d' };
  return { level: 'Low Risk', color: '#16a34a' };
};

export const generateRiskMatrix = (bodyPartScores: BodyPartScores) => {
  const matrix: { bodyPart: string; scores: RiskFactorScores; total: number }[] = [];
  
  Object.entries(bodyPartScores).forEach(([bodyPart, scores]) => {
    const total = calculateTotalRiskScore(scores);
    matrix.push({
      bodyPart,
      scores,
      total,
    });
  });

  return matrix.sort((a, b) => b.total - a.total);
};

export const getOverallRiskLevel = (bodyPartScores: BodyPartScores): string => {
  const matrix = generateRiskMatrix(bodyPartScores);
  if (matrix.length === 0) return 'Not Assessed';
  
  const highestRisk = matrix[0].total;
  
  if (highestRisk >= 20) return 'High';
  if (highestRisk >= 15) return 'Medium-High';
  if (highestRisk >= 10) return 'Medium';
  if (highestRisk >= 5) return 'Low-Medium';
  return 'Low';
};