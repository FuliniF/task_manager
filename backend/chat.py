from datetime import datetime

import prompts
from client import LLM
from pydantic import BaseModel

ChatClient = LLM("gpt-4.1-nano")

# procedure:
# 1. get_goal: get the goal from the user
# 2. get_status: get the status of the goal from the user and task completeness
# 3. multichat_task_generation: generate tasks based on the goal and status


class Milestone(BaseModel):
    title: str
    description: str


class MilestoneList(BaseModel):
    milestones: list[Milestone]


class DateTime(BaseModel):
    dateTime: str
    timeZone: str


class Mission(BaseModel):
    title: str
    duration: int
    repeat: int


class MissionList(BaseModel):
    missions: list[Mission]


class Event(BaseModel):
    summary: str
    start: DateTime
    end: DateTime


class EventList(BaseModel):
    events: list[Event]


def gen_goal(goal):
    message = [{"role": "user", "content": prompts.gen_goal_prompt.format(goal=goal)}]
    response = ChatClient.chat(message)
    return response


def gen_status(goal, previous_status="None", user_description="None"):
    message = [
        {
            "role": "user",
            "content": prompts.gen_status_prompt.format(
                goal=goal,
                previous_status=previous_status,
                user_description=user_description,
            ),
        }
    ]
    response = ChatClient.chat(message)
    return response


def gen_milestones(goal, status):
    message = [
        {
            "role": "user",
            "content": prompts.gen_milestone_prompt.format(goal=goal, status=status),
        }
    ]
    response = ChatClient.chat(message, text_format=MilestoneList)
    return response


def gen_missions(goal, status, milestones):
    message = [
        {
            "role": "user",
            "content": prompts.gen_mission_prompt.format(
                goal=goal, status=status, milestones=milestones
            ),
        }
    ]
    response = ChatClient.chat(message, text_format=MissionList)
    return response


def gen_schedules(missions, today):
    message = [
        {
            "role": "user",
            "content": prompts.gen_schedule_prompt.format(
                missions=missions, today=today
            ),
        }
    ]
    response = ChatClient.chat(message, text_format=EventList)
    return response


def first_time_user_flow():
    today = datetime.now().strftime("%Y-%m-%d")
    i_goal = input("Please describe your goal: ")
    goal = gen_goal(i_goal)
    print(f"Your goal: {goal}")

    i_user_status = input("Please describe your current status regarding the goal: ")
    status = gen_status(goal, previous_status="None", user_description=i_user_status)
    print(f"Current status of your goal: {status}")

    print("Generating milestones...\n----------------------------------------")
    milestones = gen_milestones(goal, status)

    print("Generated milestones:")
    for milestone in milestones.milestones:
        print(f"Title: {milestone.title}, Description: {milestone.description}")

    print("Generating missions...\n----------------------------------------")
    mission = gen_missions(goal, status, milestones)
    print("Generated missions:")
    for m in mission.missions:
        print(f"Title: {m.title}, Duration: {m.duration}, Repeat: {m.repeat}")

    return {"goal": goal, "status": status, "milestones": milestones}


if __name__ == "__main__":
    first_time_user_flow()
