export interface Milestone {
  title: string;
  description: string;
}

export interface MilestoneList {
  milestones: Milestone[];
}

export interface Mission {
  title: string;
  duration: number;
  recurrence: number;
}

export interface MissionList {
  missions: Mission[];
}

export interface DateTime {
  dateTime: string;
  timeZone: string;
}

export interface Schedule {
  summary: string;
  start: DateTime;
  end: DateTime;
  recurrence: string;
}

export interface ScheduleList {
  events: Schedule[];
}

export interface TaskState {
  goal: string;
  status: string;
  milestones: MilestoneList | null;
  missions: MissionList | null;
  schedules: ScheduleList | null;
}

export interface StepStatus {
  goal: boolean;
  status: boolean;
  milestones: boolean;
  missions: boolean;
  schedules: boolean;
}
