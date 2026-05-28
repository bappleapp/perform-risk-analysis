export interface RiskAssessor {
  id?: string;
  name: string;
  position: string;
}

export interface TaskDescription {
  name: string;
  whySelected: string;
  location: string;
  performedBy: string;
  generalDescription: string;
  postures: string;
  forcefulExertions: string;
  repetitionDuration: string;
  toolsEquipment: string;
  workOrganization: string;
}

export interface RiskFactorScores {
  exertion: number;
  awkwardPosture: number;
  vibration: number;
  duration: number;
  repetition: number;
}

export interface BodyPartScores {
  [bodyPart: string]: RiskFactorScores;
}

export interface RiskControls {
  designControls: string;
  administrativeControls: string;
  comments: string;
}

export interface PerformanceScenario {
  id: string;
  name: string;
  date: string;
  workplace: string;
  workUnit: string;
  riskAssessors: RiskAssessor[];
  taskDescription: TaskDescription;
  bodyPartScores: BodyPartScores;
  riskControls: RiskControls;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalculatorState {
  scenarios: PerformanceScenario[];
  currentScenario: Partial<PerformanceScenario>;
  currentStep: number;
  isDirty: boolean;
}