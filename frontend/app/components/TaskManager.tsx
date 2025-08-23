'use client';

import { useState, useEffect } from 'react';
import { TaskState, StepStatus, MilestoneList, MissionList, ScheduleList } from '../types';

export default function TaskManager() {
  useEffect(() => {
    // cookie debug
    const testCookieInTaskManager = async () => {
      try {
        const response = await fetch('/api/test-cookie', {
          credentials: 'include'
        });
        const result = await response.json();
        console.log('TaskManager cookie test:', result);
      } catch (error) {
        console.error('TaskManager cookie test failed:', error);
      }
    };
    
    testCookieInTaskManager();
  }, []);

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
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

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
    setSaveSuccess(false);
  };

  const saveData = async () => {
    if (!taskState.goal || !taskState.status || !taskState.milestones || !taskState.missions || !taskState.schedules) {
      setError('Please complete all steps before saving');
      return;
    }

    setLoading('saving');
    setError(null);

    try {
      const response = await fetch('/api/chat/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          goal: taskState.goal,
          status: taskState.status,
          milestones: taskState.milestones,
          missions: taskState.missions,
          schedules: taskState.schedules,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      else{
        console.log('saved data: ', {
          goal: taskState.goal,
          status: taskState.status,
          milestones: taskState.milestones,
          missions: taskState.missions,
          schedules: taskState.schedules,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#F8FAF9] min-h-screen font-serif">
      {/* Chat Section */}
      <div className="col-span-2 flex flex-col bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-emerald-800 text-white px-6 py-4 text-lg font-semibold">
          Goal Achievement Assistant
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F9FAF9]">

          {/* Chat bubbles */}
          {/* Step 0: Initial Prompt to User */}
          <div className="flex flex-col items-start">
            <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
              <span className="font-semibold text-emerald-900">Assistant:</span>
              <p className="mt-1">Hi there! Describe your new goal to me🚀</p>
            </div>
          </div>
          {/* Step 1: Goal */}
          <div className="flex flex-col gap-3">
            {!stepStatus.goal ? (
              <div className="flex flex-col items-end">
                <div className="bg-white rounded-xl shadow p-4 max-w-lg w-full border border-gray-200">
                  <textarea
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Describe your goal..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-gray-800"
                    rows={3}
                  />
                  <button
                    onClick={handleGenerateGoal}
                    disabled={loading === 'goal' || !goalInput.trim()}
                    className="mt-3 bg-emerald-700 text-white px-5 py-2 rounded-md hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed float-right"
                  >
                    {loading === 'goal' ? 'Processing...' : 'Send'}
                  </button>
                </div>
                <span className="text-xs text-gray-500 mt-1">You</span>
              </div>
            ) : (
              <>
                {/* User bubble */}
                <div className="flex flex-col items-end">
                  <div className="bg-white rounded-xl shadow p-4 max-w-lg text-gray-900">
                    {goalInput}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">You</span>
                </div>
                {/* Assistant bubble */}
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <p className="mt-1">
                      Got it! {taskState.goal}<br />
                      What have you done so far?
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Step 2: Status */}
          {stepStatus.goal && (
            <div className="flex flex-col gap-3">
              {!stepStatus.status ? (
                <div className="flex flex-col items-end">
                  <div className="bg-white rounded-xl shadow p-4 max-w-lg w-full border border-gray-200">
                    <textarea
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      placeholder="Describe your current situation..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-gray-800"
                      rows={3}
                    />
                    <button
                      onClick={handleGenerateStatus}
                      disabled={loading === 'status' || !statusInput.trim()}
                      className="mt-3 bg-emerald-700 text-white px-5 py-2 rounded-md hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed float-right"
                    >
                      {loading === 'status' ? 'Processing...' : 'Send'}
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">You</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-end">
                    <div className="bg-white rounded-xl shadow p-4 max-w-lg text-gray-900">
                      {statusInput}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">You</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                      <span className="font-semibold text-emerald-900">Assistant:</span>
                      <p className="mt-1">{taskState.status}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Milestones */}
          {stepStatus.status && (
            <div className="flex flex-col gap-3">
              {!stepStatus.milestones ? (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <p className="mt-1">Now, let me create some milestones for you...</p>
                    <button
                      onClick={handleGenerateMilestones}
                      disabled={loading === 'milestones'}
                      className="mt-3 bg-emerald-700 text-white px-6 py-2 rounded-md hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading === 'milestones' ? 'Generating...' : 'Generate Milestones'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <div className="space-y-2 mt-2">
                      {taskState.milestones?.milestones.map((milestone, index) => (
                        <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                          <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
                          <p className="text-gray-600 text-sm">{milestone.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Missions */}
          {stepStatus.milestones && (
            <div className="flex flex-col gap-3">
              {!stepStatus.missions ? (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <p className="mt-1">Great! Now let me break these down into actionable missions...</p>
                    <button
                      onClick={handleGenerateMissions}
                      disabled={loading === 'missions'}
                      className="mt-3 bg-emerald-700 text-white px-6 py-2 rounded-md hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading === 'missions' ? 'Generating...' : 'Generate Missions'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <div className="space-y-2 mt-2">
                      {taskState.missions?.missions.map((mission, index) => (
                        <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                          <h3 className="font-semibold text-gray-800">{mission.title}</h3>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Duration: {mission.duration} mins</span>
                            <span>Recurrence: {mission.recurrence} times</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Schedules */}
          {stepStatus.missions && (
            <div className="flex flex-col gap-3">
              {!stepStatus.schedules ? (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <p className="mt-1">Perfect! Now let me create a schedule for you...</p>
                    <button
                      onClick={handleGenerateSchedules}
                      disabled={loading === 'schedules'}
                      className="mt-3 bg-emerald-700 text-white px-6 py-2 rounded-md hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading === 'schedules' ? 'Generating...' : 'Generate Schedule'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="bg-emerald-100 rounded-xl shadow p-4 max-w-lg text-gray-900">
                    <span className="font-semibold text-emerald-900">Assistant:</span>
                    <div className="space-y-2 mt-2">
                      {taskState.schedules?.events.map((event, index) => (
                        <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                          <h3 className="font-semibold text-gray-800">{event.summary}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-1">
                            <div>
                              <span className="font-medium">Start:</span>{' '}
                              {new Date(event.start.dateTime).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">End:</span>{' '}
                              {new Date(event.end.dateTime).toLocaleString()}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Recurrence:</span> {event.recurrence}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md">
            Data saved successfully!
          </div>
        )}

        <div className="p-4 border-t bg-gray-50 flex justify-center gap-3">
        {/* Save buttons */}
          {stepStatus.schedules && (
            <>
              <button
                onClick={saveData}
                disabled={loading === 'saving'}
                className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading === 'saving' ? 'Saving...' : 'Save Progress'}
              </button>
            </>
          )}
          {(stepStatus.goal || stepStatus.status || stepStatus.milestones || stepStatus.missions || stepStatus.schedules) && (
            <button
              onClick={resetFlow}
              className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">Summary</h2>
        <div className="space-y-4 text-sm text-gray-800">
          {taskState.goal && (
            <div>
              <h3 className="font-medium text-gray-900">Goal</h3>
              <p>{taskState.goal}</p>
            </div>
          )}
          {taskState.status && (
            <div>
              <h3 className="font-medium text-gray-900">Status</h3>
              <p>{taskState.status}</p>
            </div>
          )}
          {taskState.milestones && (
            <div>
              <h3 className="font-medium text-gray-900">Milestones</h3>
              <ul className="list-disc ml-5">
                {taskState.milestones.milestones.map((m, i) => (
                  <li key={i}>{m.title}</li>
                ))}
              </ul>
            </div>
          )}
          {taskState.missions && (
            <div>
              <h3 className="font-medium text-gray-900">Missions</h3>
              <ul className="list-disc ml-5">
                {taskState.missions.missions.map((m, i) => (
                  <li key={i}>{m.title}</li>
                ))}
              </ul>
            </div>
          )}
          {taskState.schedules && (
            <div>
              <h3 className="font-medium text-gray-900">Schedules</h3>
              <ul className="list-disc ml-5">
                {taskState.schedules.events.map((e, i) => (
                  <li key={i}>{e.summary}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}