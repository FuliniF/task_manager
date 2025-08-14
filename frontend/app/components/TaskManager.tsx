'use client';

import { useState } from 'react';
import { TaskState, StepStatus, MilestoneList, MissionList, ScheduleList } from '../types';

export default function TaskManager() {
  const [taskState, setTaskState] = useState<TaskState>({
    goal: '',
    status: '',
    milestones: null,
    missions: null,
    schedules: null,
  });

  const [stepStatus, setStepStatus] = useState<StepStatus>({
    goal: false,
    status: false,
    milestones: false,
    missions: false,
    schedules: false,
  });

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [goalInput, setGoalInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const handleGenerateGoal = async () => {
    if (!goalInput.trim()) {
      setError('Please enter a goal');
      return;
    }

    setLoading('goal');
    setError(null);

    try {
      const response = await fetch('/api/chat/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: goalInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate goal');
      }

      const data = await response.json();
      setTaskState(prev => ({ ...prev, goal: data.goal }));
      setStepStatus(prev => ({ ...prev, goal: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateStatus = async () => {
    if (!statusInput.trim()) {
      setError('Please describe your current status');
      return;
    }

    setLoading('status');
    setError(null);

    try {
      const response = await fetch('/api/chat/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: taskState.goal,
          previous_status: 'None',
          user_description: statusInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate status');
      }

      const data = await response.json();
      setTaskState(prev => ({ ...prev, status: data.status }));
      setStepStatus(prev => ({ ...prev, status: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateMilestones = async () => {
    setLoading('milestones');
    setError(null);

    try {
      const response = await fetch('/api/chat/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: taskState.goal,
          status: taskState.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate milestones');
      }

      const data: MilestoneList = await response.json();
      setTaskState(prev => ({ ...prev, milestones: data }));
      setStepStatus(prev => ({ ...prev, milestones: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateMissions = async () => {
    setLoading('missions');
    setError(null);

    try {
      const response = await fetch('/api/chat/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: taskState.goal,
          status: taskState.status,
          milestones: taskState.milestones,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate missions');
      }

      const data: MissionList = await response.json();
      setTaskState(prev => ({ ...prev, missions: data }));
      setStepStatus(prev => ({ ...prev, missions: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateSchedules = async () => {
    setLoading('schedules');
    setError(null);

    try {
      const response = await fetch('/api/chat/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missions: taskState.missions?.missions,
          today: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedules');
      }

      const data: ScheduleList = await response.json();
      setTaskState(prev => ({ ...prev, schedules: data }));
      setStepStatus(prev => ({ ...prev, schedules: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const resetFlow = () => {
    setTaskState({
      goal: '',
      status: '',
      milestones: null,
      missions: null,
      schedules: null,
    });
    setStepStatus({
      goal: false,
      status: false,
      milestones: false,
      missions: false,
      schedules: false,
    });
    setGoalInput('');
    setStatusInput('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">Goal Achievement Assistant</h1>
        <p className="text-gray-600">Let's break down your goal into actionable steps and schedules</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
          )}

          {/* Chat Room Style */}
          <div className="flex flex-col gap-4 bg-gray-100 rounded-lg p-6 shadow-inner min-h-[500px]">
        {/* Step 1: Goal Input */}
        <div className="flex flex-col items-end">
          {!stepStatus.goal ? (
            <div className="flex flex-col items-end w-full">
              <div className="bg-white rounded-lg p-4 shadow mb-2 max-w-lg w-full self-end">
            <textarea
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Describe your goal in detail..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
            <button
              onClick={handleGenerateGoal}
              disabled={loading === 'goal' || !goalInput.trim()}
              className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed float-right"
            >
              {loading === 'goal' ? 'Processing...' : 'Send'}
            </button>
              </div>
              <span className="text-xs text-gray-500 mr-2">You</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-end w-full">
            <div className="bg-white rounded-lg p-4 shadow max-w-lg w-full self-end">
              <p className="text-gray-800">{goalInput}</p>
            </div>
            <span className="text-xs text-gray-500 mr-2">You</span>
              </div>
              <div className="flex flex-col items-start w-full">
            <div className="bg-indigo-50 rounded-lg p-4 shadow max-w-lg w-full self-start mt-2">
              <span className="font-semibold text-indigo-700">Assistant:</span>
              <p className="text-gray-800 mt-1">{taskState.goal}</p>
            </div>
              </div>
            </>
          )}
        </div>

        {/* Step 2: Status Input */}
        {stepStatus.goal && (
          <div className="flex flex-col items-end">
            {!stepStatus.status ? (
              <div className="flex flex-col items-end w-full">
            <div className="bg-white rounded-lg p-4 shadow mb-2 max-w-lg w-full self-end">
              <textarea
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                placeholder="Describe your current situation and progress toward this goal..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
              <button
                onClick={handleGenerateStatus}
                disabled={loading === 'status' || !statusInput.trim()}
                className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed float-right"
              >
                {loading === 'status' ? 'Processing...' : 'Send'}
              </button>
            </div>
            <span className="text-xs text-gray-500 mr-2">You</span>
              </div>
            ) : (
              <>
            <div className="flex flex-col items-end w-full">
              <div className="bg-white rounded-lg p-4 shadow max-w-lg w-full self-end">
                <p className="text-gray-800">{statusInput}</p>
              </div>
              <span className="text-xs text-gray-500 mr-2">You</span>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="bg-indigo-50 rounded-lg p-4 shadow max-w-lg w-full self-start mt-2">
                <span className="font-semibold text-indigo-700">Assistant:</span>
                <p className="text-gray-800 mt-1">{taskState.status}</p>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Milestones */}
        {stepStatus.status && (
          <div className="flex flex-col items-start w-full">
            {!stepStatus.milestones ? (
              <div className="flex flex-col items-start w-full">
            <button
              onClick={handleGenerateMilestones}
              disabled={loading === 'milestones'}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading === 'milestones' ? 'Generating...' : 'Generate Milestones'}
            </button>
            <span className="text-xs text-gray-500 ml-2 mt-1">You</span>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-lg p-4 shadow max-w-lg w-full self-start mt-2">
            <span className="font-semibold text-indigo-700">Assistant:</span>
            <div className="space-y-2 mt-1">
              {taskState.milestones?.milestones.map((milestone, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              ))}
            </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Missions */}
        {stepStatus.milestones && (
          <div className="flex flex-col items-start w-full">
            {!stepStatus.missions ? (
              <div className="flex flex-col items-start w-full">
            <button
              onClick={handleGenerateMissions}
              disabled={loading === 'missions'}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading === 'missions' ? 'Generating...' : 'Generate Missions'}
            </button>
            <span className="text-xs text-gray-500 ml-2 mt-1">You</span>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-lg p-4 shadow max-w-lg w-full self-start mt-2">
            <span className="font-semibold text-indigo-700">Assistant:</span>
            <div className="space-y-2 mt-1">
              {taskState.missions?.missions.map((mission, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{mission.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                <span>Duration: {mission.duration} minutes</span>
                <span>Recurrence: {mission.recurrence} times</span>
                  </div>
                </div>
              ))}
            </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Schedules */}
        {stepStatus.missions && (
          <div className="flex flex-col items-start w-full">
            {!stepStatus.schedules ? (
              <div className="flex flex-col items-start w-full">
            <button
              onClick={handleGenerateSchedules}
              disabled={loading === 'schedules'}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading === 'schedules' ? 'Generating...' : 'Generate Schedule'}
            </button>
            <span className="text-xs text-gray-500 ml-2 mt-1">You</span>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-lg p-4 shadow max-w-lg w-full self-start mt-2">
            <span className="font-semibold text-indigo-700">Assistant:</span>
            <div className="space-y-2 mt-1">
              {taskState.schedules?.events.map((event, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{event.summary}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Start:</span> {new Date(event.start.dateTime).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">End:</span> {new Date(event.end.dateTime).toLocaleString()}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Recurrence:</span> {event.recurrence}
                </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
            )}
          </div>
        )}
          </div>
      {(stepStatus.goal || stepStatus.status || stepStatus.milestones || stepStatus.missions || stepStatus.schedules) && (
        <div className="text-center">
          <button
            onClick={resetFlow}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
